import { describe, expect, it } from "vitest";
import {
  buildPath,
  copyNode,
  createFile,
  createFolder,
  deleteNode,
  getChildren,
  getNodeById,
  moveNode,
  renameNode,
  undoPt1,
} from "./pt1";
import type { Pt1Node, Pt1State } from "../types";

// createFolder/createFile verwachten een uuid-vormig nodeId.
const nid = (value: string) => value as never;

const lastLog = (state: Pt1State) => state.actionLogs[state.actionLogs.length - 1];

const baseNodes = (): Pt1Node[] => [
  { id: "root", name: "Documenten", type: "folder", parentId: null },
  { id: "f1", name: "School", type: "folder", parentId: "root" },
  { id: "f2", name: "Privé", type: "folder", parentId: "root" },
  { id: "d1", name: "verslag.docx", type: "file", parentId: "f1" },
  { id: "d2", name: "foto.bmp", type: "file", parentId: "f2" },
];

const baseState = (): Pt1State => ({
  nodes: baseNodes(),
  actionLogs: [],
  undoStack: [],
  completed: false,
  score: 0,
  taskResults: [],
});

describe("buildPath", () => {
  it("builds nested paths from root", () => {
    const nodes = baseNodes();
    expect(buildPath(nodes, "d1")).toBe("Documenten/School/verslag.docx");
    expect(buildPath(nodes, "root")).toBe("Documenten");
  });

  it("returns empty string for unknown or missing id", () => {
    expect(buildPath(baseNodes(), "nope")).toBe("");
    expect(buildPath(baseNodes(), null)).toBe("");
  });
});

describe("createFolder / createFile", () => {
  it("creates a folder and logs the action", () => {
    const next = createFolder(baseState(), "root", "Nieuw", nid("n1"));
    expect(getNodeById(next.nodes, "n1")?.parentId).toBe("root");
    expect(lastLog(next).actionType).toBe("create-folder");
    expect(next.undoStack).toHaveLength(1);
  });

  it("makes duplicate names unique (case-insensitive)", () => {
    let state = createFolder(baseState(), "root", "school", nid("n1"));
    expect(getNodeById(state.nodes, "n1")?.name).toBe("school (2)");
    state = createFile(state, "f1", "VERSLAG.docx", nid("n2"));
    expect(getNodeById(state.nodes, "n2")?.name).toBe("VERSLAG (2).docx");
  });

  it("ignores empty names", () => {
    const state = baseState();
    expect(createFolder(state, "root", "   ")).toBe(state);
    expect(createFile(state, "root", "")).toBe(state);
  });
});

describe("renameNode", () => {
  it("renames and logs old and new name", () => {
    const next = renameNode(baseState(), "d1", "eindverslag.docx");
    expect(getNodeById(next.nodes, "d1")?.name).toBe("eindverslag.docx");
    const log = lastLog(next);
    expect(log.actionType).toBe("rename");
    expect(log.oldName).toBe("verslag.docx");
    expect(log.newName).toBe("eindverslag.docx");
  });

  it("does not rename the root and ignores empty names", () => {
    const state = baseState();
    expect(renameNode(state, "root", "Anders")).toBe(state);
    expect(renameNode(state, "d1", "  ")).toBe(state);
  });

  it("resolves sibling name conflicts with a suffix", () => {
    const withFile = createFile(baseState(), "f1", "plan.docx", nid("p1"));
    const next = renameNode(withFile, "d1", "plan.docx");
    expect(getNodeById(next.nodes, "d1")?.name).toBe("plan (2).docx");
  });
});

describe("moveNode", () => {
  it("moves a file to another folder", () => {
    const next = moveNode(baseState(), "d1", "f2");
    expect(getNodeById(next.nodes, "d1")?.parentId).toBe("f2");
    expect(lastLog(next).actionType).toBe("move");
  });

  it("refuses to move a folder into its own descendant", () => {
    const state = baseState();
    const withSub = createFolder(state, "f1", "Sub", nid("sub1"));
    expect(moveNode(withSub, "f1", "sub1")).toBe(withSub);
  });

  it("refuses move to a file or to its current parent", () => {
    const state = baseState();
    expect(moveNode(state, "d1", "d2")).toBe(state);
    expect(moveNode(state, "d1", "f1")).toBe(state);
  });

  it("cancel on conflict keeps both files and logs move-cancelled", () => {
    const withConflict = createFile(baseState(), "f2", "verslag.docx", nid("c1"));
    const next = moveNode(withConflict, "d1", "f2", "cancel");
    expect(getNodeById(next.nodes, "d1")?.parentId).toBe("f1");
    expect(lastLog(next).actionType).toBe("move-cancelled");
  });

  it("overwrite on conflict removes the existing target", () => {
    const withConflict = createFile(baseState(), "f2", "verslag.docx", nid("c1"));
    const next = moveNode(withConflict, "d1", "f2", "overwrite");
    expect(getNodeById(next.nodes, "c1")).toBeUndefined();
    expect(getNodeById(next.nodes, "d1")?.parentId).toBe("f2");
  });

  it("rename on conflict keeps both with a unique name", () => {
    const withConflict = createFile(baseState(), "f2", "verslag.docx", nid("c1"));
    const next = moveNode(withConflict, "d1", "f2", "rename");
    expect(getNodeById(next.nodes, "c1")).toBeDefined();
    expect(getNodeById(next.nodes, "d1")?.name).toBe("verslag (2).docx");
  });
});

describe("copyNode", () => {
  it("copies a folder including its children", () => {
    const next = copyNode(baseState(), "f1", "f2");
    const copied = getChildren(next.nodes, "f2").find((n) => n.name === "School");
    expect(copied).toBeDefined();
    expect(getChildren(next.nodes, copied!.id).map((n) => n.name)).toEqual([
      "verslag.docx",
    ]);
    // origineel blijft staan
    expect(getNodeById(next.nodes, "d1")?.parentId).toBe("f1");
  });

  it("refuses copy to a non-folder target", () => {
    const state = baseState();
    expect(copyNode(state, "d1", "d2")).toBe(state);
  });
});

describe("deleteNode", () => {
  it("deletes a folder with all descendants", () => {
    const next = deleteNode(baseState(), "f1");
    expect(getNodeById(next.nodes, "f1")).toBeUndefined();
    expect(getNodeById(next.nodes, "d1")).toBeUndefined();
    expect(lastLog(next).actionType).toBe("delete");
  });

  it("refuses to delete the root", () => {
    const state = baseState();
    expect(deleteNode(state, "root")).toBe(state);
  });
});

describe("undoPt1", () => {
  it("restores the previous tree and logs the undo", () => {
    const afterDelete = deleteNode(baseState(), "f1");
    const undone = undoPt1(afterDelete);
    expect(getNodeById(undone.nodes, "d1")).toBeDefined();
    expect(undone.undoStack).toHaveLength(0);
    expect(lastLog(undone).actionType).toBe("undo");
  });

  it("is a no-op without history", () => {
    const state = baseState();
    expect(undoPt1(state)).toBe(state);
  });
});
