import type {
  EventLog,
  InstrumentId,
  Pt1Node,
  Pt1State,
} from "../types";

const cloneNodes = (nodes: Pt1Node[]) => nodes.map((node) => ({ ...node }));

export const getNodeById = (nodes: Pt1Node[], nodeId: string) =>
  nodes.find((node) => node.id === nodeId);

export const getChildren = (nodes: Pt1Node[], parentId: string | null) =>
  nodes.filter((node) => node.parentId === parentId);

export const buildPath = (nodes: Pt1Node[], nodeId?: string | null): string => {
  if (!nodeId) {
    return "";
  }
  const node = getNodeById(nodes, nodeId);
  if (!node) {
    return "";
  }
  if (!node.parentId) {
    return node.name;
  }
  return `${buildPath(nodes, node.parentId)}/${node.name}`;
};

const ensureUniqueName = (
  nodes: Pt1Node[],
  parentId: string,
  requestedName: string,
): string => {
  const lowerNames = getChildren(nodes, parentId).map((node) => node.name.toLowerCase());
  if (!lowerNames.includes(requestedName.toLowerCase())) {
    return requestedName;
  }

  const extensionIndex = requestedName.lastIndexOf(".");
  const stem =
    extensionIndex === -1 ? requestedName : requestedName.slice(0, extensionIndex);
  const extension = extensionIndex === -1 ? "" : requestedName.slice(extensionIndex);

  let suffix = 2;
  let candidate = `${stem} (${suffix})${extension}`;
  while (lowerNames.includes(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `${stem} (${suffix})${extension}`;
  }
  return candidate;
};

const isDescendant = (nodes: Pt1Node[], sourceNodeId: string, candidateParentId: string) => {
  let currentId: string | null = candidateParentId;
  while (currentId) {
    if (currentId === sourceNodeId) {
      return true;
    }
    currentId = getNodeById(nodes, currentId)?.parentId ?? null;
  }
  return false;
};

const pushUndo = (state: Pt1State): Pt1State => ({
  ...state,
  undoStack: [...state.undoStack, cloneNodes(state.nodes)],
});

export const undoPt1 = (state: Pt1State): Pt1State => {
  const previous = state.undoStack[state.undoStack.length - 1];
  if (!previous) {
    return state;
  }
  return {
    ...state,
    nodes: cloneNodes(previous),
    undoStack: state.undoStack.slice(0, -1),
    actionLogs: [
      ...state.actionLogs,
      {
        actionType: "undo",
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

export const createFolder = (
  state: Pt1State,
  parentId: string,
  folderName: string,
): Pt1State => {
  const trimmedName = folderName.trim();
  if (!trimmedName) {
    return state;
  }

  const next = pushUndo(state);
  const finalName = ensureUniqueName(next.nodes, parentId, trimmedName);
  return {
    ...next,
    nodes: [
      ...next.nodes,
      {
        id: crypto.randomUUID(),
        name: finalName,
        type: "folder",
        parentId,
      },
    ],
    actionLogs: [
      ...next.actionLogs,
      {
        actionType: "create-folder",
        targetPath: `${buildPath(next.nodes, parentId)}/${finalName}`,
        newName: finalName,
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

export const renameNode = (
  state: Pt1State,
  nodeId: string,
  newName: string,
): Pt1State => {
  const node = getNodeById(state.nodes, nodeId);
  const trimmedName = newName.trim();
  if (!node || !trimmedName) {
    return state;
  }

  const parentId = node.parentId;
  if (!parentId) {
    return state;
  }

  const next = pushUndo(state);
  const siblings = getChildren(next.nodes, parentId).filter((candidate) => candidate.id !== nodeId);
  const lowerNames = siblings.map((candidate) => candidate.name.toLowerCase());
  const finalName = lowerNames.includes(trimmedName.toLowerCase())
    ? ensureUniqueName(next.nodes.filter((candidate) => candidate.id !== nodeId), parentId, trimmedName)
    : trimmedName;

  return {
    ...next,
    nodes: next.nodes.map((candidate) =>
      candidate.id === nodeId ? { ...candidate, name: finalName } : candidate,
    ),
    actionLogs: [
      ...next.actionLogs,
      {
        actionType: "rename",
        sourcePath: buildPath(state.nodes, nodeId),
        targetPath: `${buildPath(state.nodes, parentId)}/${finalName}`,
        oldName: node.name,
        newName: finalName,
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

export const moveNode = (
  state: Pt1State,
  nodeId: string,
  targetParentId: string,
  conflictChoice: "overwrite" | "rename" | "cancel" = "cancel",
): Pt1State => {
  const node = getNodeById(state.nodes, nodeId);
  const targetParent = getNodeById(state.nodes, targetParentId);
  if (!node || !targetParent || targetParent.type !== "folder") {
    return state;
  }
  if (node.id === targetParentId || isDescendant(state.nodes, node.id, targetParentId)) {
    return state;
  }
  if (node.parentId === targetParentId) {
    return state;
  }

  const existing = getChildren(state.nodes, targetParentId).find(
    (candidate) => candidate.name === node.name && candidate.id !== node.id,
  );

  if (existing && conflictChoice === "cancel") {
    return {
      ...state,
      actionLogs: [
        ...state.actionLogs,
        {
          actionType: "move-cancelled",
          sourcePath: buildPath(state.nodes, nodeId),
          targetPath: buildPath(state.nodes, targetParentId),
          extra: "Naamconflict geannuleerd",
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  const next = pushUndo(state);
  let nextNodes = cloneNodes(next.nodes);
  const movingNode = getNodeById(nextNodes, nodeId);
  if (!movingNode) {
    return state;
  }

  if (existing && conflictChoice === "overwrite") {
    const idsToRemove = new Set<string>();
    const collectDescendants = (currentId: string) => {
      idsToRemove.add(currentId);
      getChildren(nextNodes, currentId).forEach((child) => collectDescendants(child.id));
    };
    collectDescendants(existing.id);
    nextNodes = nextNodes.filter((candidate) => !idsToRemove.has(candidate.id));
  }

  if (existing && conflictChoice === "rename") {
    movingNode.name = ensureUniqueName(
      nextNodes.filter((candidate) => candidate.id !== nodeId),
      targetParentId,
      movingNode.name,
    );
  }

  movingNode.parentId = targetParentId;

  return {
    ...next,
    nodes: nextNodes,
    actionLogs: [
      ...next.actionLogs,
      {
        actionType: existing ? "move-with-conflict" : "move",
        sourcePath: buildPath(state.nodes, nodeId),
        targetPath: `${buildPath(nextNodes, targetParentId)}/${movingNode.name}`,
        extra: existing ? conflictChoice : undefined,
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

const duplicateTree = (
  nodes: Pt1Node[],
  nodeId: string,
  targetParentId: string,
): Pt1Node[] => {
  const sourceNode = getNodeById(nodes, nodeId);
  if (!sourceNode) {
    return nodes;
  }

  const createdNodes: Pt1Node[] = [];
  const walk = (currentId: string, parentId: string) => {
    const current = getNodeById(nodes, currentId);
    if (!current) {
      return;
    }

    const cloneId = crypto.randomUUID();
    createdNodes.push({
      ...current,
      id: cloneId,
      parentId,
      name:
        current.id === nodeId
          ? ensureUniqueName([...nodes, ...createdNodes], targetParentId, current.name)
          : current.name,
    });

    if (current.type === "folder") {
      const newestId = createdNodes[createdNodes.length - 1]?.id ?? cloneId;
      getChildren(nodes, current.id).forEach((child) => walk(child.id, newestId));
    }
  };

  walk(nodeId, targetParentId);
  return [...cloneNodes(nodes), ...createdNodes];
};

export const copyNode = (
  state: Pt1State,
  nodeId: string,
  targetParentId: string,
): Pt1State => {
  const targetParent = getNodeById(state.nodes, targetParentId);
  if (!targetParent || targetParent.type !== "folder") {
    return state;
  }

  const next = pushUndo(state);
  return {
    ...next,
    nodes: duplicateTree(next.nodes, nodeId, targetParentId),
    actionLogs: [
      ...next.actionLogs,
      {
        actionType: "copy",
        sourcePath: buildPath(next.nodes, nodeId),
        targetPath: buildPath(next.nodes, targetParentId),
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

export const deleteNode = (state: Pt1State, nodeId: string): Pt1State => {
  const node = getNodeById(state.nodes, nodeId);
  if (!node || !node.parentId) {
    return state;
  }

  const next = pushUndo(state);
  const idsToRemove = new Set<string>();
  const collectDescendants = (currentId: string) => {
    idsToRemove.add(currentId);
    getChildren(next.nodes, currentId).forEach((child) => collectDescendants(child.id));
  };
  collectDescendants(nodeId);

  return {
    ...next,
    nodes: next.nodes.filter((candidate) => !idsToRemove.has(candidate.id)),
    actionLogs: [
      ...next.actionLogs,
      {
        actionType: "delete",
        sourcePath: buildPath(state.nodes, nodeId),
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

export const createPt1EventLogs = (
  sessionId: string,
  instrumentId: InstrumentId,
  blockId: string,
  state: Pt1State,
): EventLog[] =>
  state.actionLogs.map((log) => ({
    sessionId,
    versionId: instrumentId,
    sectionId: blockId,
    itemId: blockId,
    timestamp: log.timestamp,
    actionType: log.actionType,
    sourcePath: log.sourcePath,
    targetPath: log.targetPath,
    oldName: log.oldName,
    newName: log.newName,
    extra: log.extra,
  }));
