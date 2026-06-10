import { ConflictChoice, ExplorerClipboard, ExplorerNewItemType, ExplorerSortKey, QuestionHeader, explorerNewItems } from "../app/shared";
import { FileIcon, FolderIcon } from "./Mockups";
import { TaskNavFooter } from "../components/TaskNavFooter";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  assessmentMap,
  defaultCodeMappings,
  themes,
} from "../data/assessments";
import {
  calculateResult,
  completeSession,
  createSession,
  getAssessment,
  getItemByStep,
  getPresentedInteractionOrder,
  getPresentedOrder,
  getSectionById,
  getStepDescriptors,
  submitItemAnswer,
} from "../lib/assessment";
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
} from "../lib/pt1";
import {
  readActiveSession,
  saveActiveSession,
} from "../lib/storage";
import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentSession,
  AssessmentVersion,
  EventLog,
  GoalScore,
  IncomingMailStimulus,
  InteractionGroup,
  Option,
  Pt1Node,
  Pt1State,
  ProgrammingBlockDefinition,
  SelectedAnswer,
  SessionMetadata,
  StepDescriptor,
  ThemeDefinition,
  WhutsuppChoice,
  WhutsuppMessage,
  WhutsuppPathEntry,
} from "../types";


export const FileTaskWorkspace = ({
  item,
  questionNumber,
  state,
  onChange,
  onFinish,
  onSkip,
  onExit,
}: {
  item: AssessmentItem;
  questionNumber: number;
  state: Pt1State;
  onChange: (nextState: Pt1State) => void;
  onFinish: () => void;
  onSkip: () => void;
  onExit: () => void;
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextFolderId, setContextFolderId] = useState<string>(
    item.fileTask?.simulation.rootId ?? "",
  );
  const [pendingConflict, setPendingConflict] = useState<{
    nodeId: string;
    targetParentId: string;
  } | null>(null);
  const [clipboard, setClipboard] = useState<ExplorerClipboard>(null);
  const [lastNodeClick, setLastNodeClick] = useState<{
    nodeId: string;
    timestamp: number;
  } | null>(null);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [sortKey, setSortKey] = useState<ExplorerSortKey>("name");
  const [sharedNodeId, setSharedNodeId] = useState<string | null>(null);
  const [checkedNodeIds, setCheckedNodeIds] = useState<string[]>([]);

  if (!item.fileTask || !state) {
    return null;
  }

  const selectedNode = selectedNodeId ? getNodeById(state.nodes, selectedNodeId) : null;
  const activeFolderId = contextFolderId;
  const clipboardNode = clipboard ? getNodeById(state.nodes, clipboard.nodeId) : null;
  const getFolderId = (name: string) =>
    state.nodes.find((node) => node.name === name && node.type === "folder")?.id ??
    activeFolderId;
  const getFolder = (name: string) =>
    state.nodes.find((node) => node.name === name && node.type === "folder") ?? null;

  const handleDrop = (nodeId: string, targetFolderId: string) => {
    const dragged = getNodeById(state.nodes, nodeId);
    if (!dragged) {
      return;
    }

    const hasConflict = getChildren(state.nodes, targetFolderId).some(
      (child) => child.name === dragged.name && child.id !== dragged.id,
    );

    if (hasConflict) {
      setPendingConflict({ nodeId, targetParentId: targetFolderId });
      return;
    }

    onChange(moveNode(state, nodeId, targetFolderId));
  };

  const resolveConflict = (choice: ConflictChoice) => {
    if (!pendingConflict) {
      return;
    }

    onChange(
      moveNode(
        state,
        pendingConflict.nodeId,
        pendingConflict.targetParentId,
        choice,
      ),
    );
    setPendingConflict(null);
  };

  const pasteClipboard = () => {
    if (!clipboard || !clipboardNode) {
      return;
    }

    if (clipboard.mode === "cut") {
      handleDrop(clipboard.nodeId, activeFolderId);
      setClipboard(null);
      return;
    }

    onChange(copyNode(state, clipboard.nodeId, activeFolderId));
  };

  const shareSelectedNode = () => {
    if (!selectedNodeId || !selectedNode) {
      return;
    }
    setSharedNodeId(selectedNodeId);
    onChange({
      ...state,
      actionLogs: [
        ...state.actionLogs,
        {
          actionType: "share",
          sourcePath: buildPath(state.nodes, selectedNodeId),
          timestamp: new Date().toISOString(),
        },
      ],
    });
  };

  const renameSelectedNode = () => {
    if (!selectedNodeId || !selectedNode) {
      return;
    }
    if (!selectedNode.parentId) {
      return;
    }
    setRenamingNodeId(selectedNodeId);
    setRenameDraft(selectedNode.name);
  };

  const commitInlineRename = () => {
    if (!renamingNodeId) {
      return;
    }

    const currentNode = getNodeById(state.nodes, renamingNodeId);
    const nextName = renameDraft.trim();
    setRenamingNodeId(null);
    if (!currentNode || !currentNode.parentId || !nextName || nextName === currentNode.name) {
      return;
    }
    onChange(renameNode(state, renamingNodeId, nextName));
  };

  const cancelInlineRename = () => {
    setRenamingNodeId(null);
    setRenameDraft("");
  };

  const handleNodeClick = (node: Pt1Node, clickCount: number) => {
    const now = Date.now();
    const isSecondSingleClick =
      selectedNodeId === node.id &&
      node.parentId !== null &&
      clickCount === 1 &&
      lastNodeClick?.nodeId === node.id &&
      now - lastNodeClick.timestamp > 450 &&
      now - lastNodeClick.timestamp < 3000;

    setSelectedNodeId(node.id);
    setLastNodeClick({ nodeId: node.id, timestamp: now });

    if (isSecondSingleClick) {
      setRenamingNodeId(node.id);
      setRenameDraft(node.name);
    }
  };

  const createNewItem = (itemType: ExplorerNewItemType) => {
    const definition = explorerNewItems.find((candidate) => candidate.type === itemType);
    if (!definition) {
      return;
    }

    const nodeId = crypto.randomUUID();
    const nextState =
      definition.nodeKind === "folder"
        ? createFolder(state, activeFolderId, definition.defaultName, nodeId)
        : createFile(state, activeFolderId, definition.defaultName, nodeId);
    onChange(nextState);
    setSelectedNodeId(nodeId);
    setRenamingNodeId(nodeId);
    setRenameDraft(definition.defaultName);
    setIsNewMenuOpen(false);
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId || !selectedNode?.parentId) {
      return;
    }
    onChange(deleteNode(state, selectedNodeId));
    setSelectedNodeId(null);
    setCheckedNodeIds((current) => current.filter((nodeId) => nodeId !== selectedNodeId));
  };

  const getExplorerType = (node: Pt1Node) => {
    if (node.type === "folder") {
      return "Bestandsmap";
    }

    const extension = node.name.split(".").pop()?.toLowerCase();
    if (extension === "pptx") {
      return "Microsoft PowerPoint-presentatie";
    }
    if (extension === "docx") {
      return "Microsoft Word-document";
    }
    if (extension === "pdf") {
      return "PDF-bestand";
    }
    if (extension === "jpg" || extension === "png") {
      return "Afbeelding";
    }
    if (extension === "txt") {
      return "Tekstdocument";
    }
    return "Bestand";
  };

  const getExplorerModifiedTime = (node: Pt1Node) => {
    const dateSeeds = [
      { day: 4, hour: 8, minute: 17 },
      { day: 7, hour: 13, minute: 42 },
      { day: 11, hour: 10, minute: 6 },
      { day: 15, hour: 16, minute: 28 },
      { day: 19, hour: 9, minute: 53 },
      { day: 22, hour: 14, minute: 11 },
      { day: 26, hour: 9, minute: 0 },
      { day: 29, hour: 15, minute: 37 },
    ];
    const seed = [...node.name].reduce((total, char) => total + char.charCodeAt(0), node.type === "folder" ? 37 : 0);
    const picked = dateSeeds[seed % dateSeeds.length];
    return new Date(2026, 4, picked.day, picked.hour, picked.minute).getTime();
  };

  const getExplorerDate = (node: Pt1Node) => {
    const date = new Date(getExplorerModifiedTime(node));
    return `${date.getDate()}-5-2026 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const getExplorerSize = (node: Pt1Node) => {
    if (node.type === "folder") {
      return "";
    }
    const extension = node.name.split(".").pop()?.toLowerCase();
    if (extension === "pptx") return "1.842 kB";
    if (extension === "docx") return "1.365 kB";
    if (extension === "pdf") return "884 kB";
    if (extension === "jpg" || extension === "png") return "642 kB";
    if (extension === "csv") return "24 kB";
    return "18 kB";
  };

  const activeItems = [...getChildren(state.nodes, activeFolderId)].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "folder" ? -1 : 1;
    }
    if (sortKey === "type") {
      return getExplorerType(left).localeCompare(getExplorerType(right), "nl") || left.name.localeCompare(right.name, "nl");
    }
    if (sortKey === "size") {
      return getExplorerSize(left).localeCompare(getExplorerSize(right), "nl") || left.name.localeCompare(right.name, "nl");
    }
    if (sortKey === "modified") {
      return getExplorerModifiedTime(right) - getExplorerModifiedTime(left) || left.name.localeCompare(right.name, "nl");
    }
    return left.name.localeCompare(right.name, "nl");
  });
  const visibleCheckedNodeIds = activeItems
    .map((node) => node.id)
    .filter((nodeId) => checkedNodeIds.includes(nodeId));
  const allVisibleChecked = activeItems.length > 0 && visibleCheckedNodeIds.length === activeItems.length;
  const someVisibleChecked = visibleCheckedNodeIds.length > 0 && !allVisibleChecked;
  const toggleNodeChecked = (node: Pt1Node, checked: boolean) => {
    setCheckedNodeIds((current) =>
      checked ? Array.from(new Set([...current, node.id])) : current.filter((nodeId) => nodeId !== node.id),
    );
    setSelectedNodeId(checked ? node.id : selectedNodeId === node.id ? null : selectedNodeId);
  };
  const toggleAllVisible = (checked: boolean) => {
    const visibleIds = activeItems.map((node) => node.id);
    setCheckedNodeIds((current) =>
      checked
        ? Array.from(new Set([...current, ...visibleIds]))
        : current.filter((nodeId) => !visibleIds.includes(nodeId)),
    );
    setSelectedNodeId(checked ? visibleIds[0] ?? null : null);
  };

  const rootId = item.fileTask.simulation.rootId;
  const rootFolders = state.nodes.filter(
    (node) => node.parentId === rootId && node.type === "folder",
  );
  const quickAccessNames = ["Bureaublad", "Downloads", "Documenten", "Afbeeldingen", "OneDrive"];
  const meetingFolders = rootFolders.filter(
    (node) => !quickAccessNames.includes(node.name),
  );
  const goToFolder = (folderId: string) => {
    setContextFolderId(folderId);
    setSelectedNodeId(null);
  };
  const currentPathLabel = (() => {
    const path = buildPath(state.nodes, activeFolderId);
    const parts = path.split("/").filter(Boolean);
    return parts.length === 0 ? "Thuis" : parts.join(" > ");
  })();
  const fileInstructionSteps = item.instruction
    .split(/\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/Taak afronden/g, "Volgende"));
  const introInstructionSteps = fileInstructionSteps.slice(0, 2);
  const numberedInstructionSteps = fileInstructionSteps.slice(2);

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
      >
        <div className="file-instruction-list">
          {introInstructionSteps.map((step) => (
            <p className="file-instruction-intro" key={step}>{step}</p>
          ))}
          {numberedInstructionSteps.length > 0 ? (
            <ol>
              {numberedInstructionSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : null}
        </div>
      </QuestionHeader>

      <div className="file-explorer">
        <div className="explorer-commandbar" aria-label="Verkenner acties">
          <button className="explorer-command icon-only-command" type="button" title="Ongedaan maken" aria-label="Ongedaan maken" disabled={state.undoStack.length === 0} onClick={() => onChange(undoPt1(state))}>
            <span className="command-icon command-icon-undo" aria-hidden="true" />
            <span className="command-label">Ongedaan maken</span>
          </button>
          <div className="explorer-new-menu">
            <button
              type="button"
              className="explorer-command explorer-command-new"
              aria-expanded={isNewMenuOpen}
              onClick={() => setIsNewMenuOpen((current) => !current)}
            >
              <span className="command-icon command-icon-new" aria-hidden="true" />
              <span>Nieuw</span>
              <span className="command-chevron" aria-hidden="true" />
            </button>
            {isNewMenuOpen ? (
              <div className="explorer-new-dropdown">
                {explorerNewItems.map((definition) => (
                  <button
                    key={definition.type}
                    type="button"
                    onClick={() => createNewItem(definition.type)}
                  >
                    <span className={`new-item-icon ${definition.iconClass}`} aria-hidden="true" />
                    <span>{definition.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button className="explorer-command icon-only-command" type="button" title="Knippen" aria-label="Knippen" disabled={!selectedNode} onClick={() => selectedNodeId && setClipboard({ mode: "cut", nodeId: selectedNodeId })}>
            <span className="command-icon command-icon-cut" aria-hidden="true" />
            <span className="command-label">Knippen</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Kopieren" aria-label="Kopieren" disabled={!selectedNode} onClick={() => selectedNodeId && setClipboard({ mode: "copy", nodeId: selectedNodeId })}>
            <span className="command-icon command-icon-copy" aria-hidden="true" />
            <span className="command-label">Kopieren</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Plakken" aria-label="Plakken" disabled={!clipboardNode} onClick={pasteClipboard}>
            <span className="command-icon command-icon-paste" aria-hidden="true" />
            <span className="command-label">Plakken</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Naam wijzigen" aria-label="Naam wijzigen" disabled={!selectedNode} onClick={renameSelectedNode}>
            <span className="command-icon command-icon-rename" aria-hidden="true" />
            <span className="command-label">Naam wijzigen</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Delen" aria-label="Delen" disabled={!selectedNode} onClick={shareSelectedNode}>
            <span className="command-icon command-icon-share" aria-hidden="true" />
            <span className="command-label">Delen</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Verwijderen" aria-label="Verwijderen" disabled={!selectedNode} onClick={deleteSelectedNode}>
            <span className="command-icon command-icon-delete" aria-hidden="true" />
            <span className="command-label">Verwijderen</span>
          </button>
          <button
            className="explorer-command icon-only-command"
            type="button"
            title="Sorteren"
            aria-label="Sorteren"
            onClick={() => setSortKey((current) => current === "name" ? "modified" : current === "modified" ? "type" : current === "type" ? "size" : "name")}
          >
            <span className="command-icon command-icon-sort" aria-hidden="true" />
            <span className="command-label">Sorteren</span>
            <span className="command-chevron" aria-hidden="true" />
          </button>
        </div>
        <div className="file-explorer-toolbar">
          <div className="file-breadcrumb">{currentPathLabel}</div>
          <div className="file-toolbar-actions">
            <button
              type="button"
              className="file-toolbar-btn"
              onClick={() => createNewItem("folder")}
            >
              <span className="ico" aria-hidden="true">+</span>
              <span>Nieuwe map</span>
            </button>
            <button
              type="button"
              className="file-toolbar-btn"
              onClick={() => onChange(undoPt1(state))}
              disabled={state.undoStack.length === 0}
            >
              <span className="ico" aria-hidden="true">↻</span>
              <span>Ongedaan</span>
            </button>
          </div>
        </div>

        <div className="file-explorer-body">
          <aside className="file-sidebar" aria-label="Mappenlijst">
            <div className="file-sidebar-group">
              <button
                type="button"
                className={`file-sidebar-item ${activeFolderId === rootId ? "active" : ""}`}
                onClick={() => goToFolder(rootId)}
              >
                <span className="ico ico-home" aria-hidden="true" />
                <span className="lbl">Thuis</span>
              </button>
              <button
                type="button"
                className={`file-sidebar-item ${activeFolderId === getFolderId("Bureaublad") ? "active" : ""}`}
                onClick={() => goToFolder(getFolderId("Bureaublad"))}
              >
                <span className="ico ico-desktop" aria-hidden="true" />
                <span className="lbl">Bureaublad</span>
              </button>
              {getFolder("Downloads") ? (
                <button
                  type="button"
                  className={`file-sidebar-item ${activeFolderId === getFolderId("Downloads") ? "active" : ""}`}
                  onClick={() => goToFolder(getFolderId("Downloads"))}
                >
                  <span className="ico ico-downloads" aria-hidden="true" />
                  <span className="lbl">Downloads</span>
                </button>
              ) : null}
              {getFolder("Documenten") ? (
                <button
                  type="button"
                  className={`file-sidebar-item ${activeFolderId === getFolderId("Documenten") ? "active" : ""}`}
                  onClick={() => goToFolder(getFolderId("Documenten"))}
                >
                  <span className="ico ico-documents" aria-hidden="true" />
                  <span className="lbl">Documenten</span>
                </button>
              ) : null}
              {getFolder("Afbeeldingen") ? (
                <button
                  type="button"
                  className={`file-sidebar-item ${activeFolderId === getFolderId("Afbeeldingen") ? "active" : ""}`}
                  onClick={() => goToFolder(getFolderId("Afbeeldingen"))}
                >
                  <span className="ico ico-pictures" aria-hidden="true" />
                  <span className="lbl">Afbeeldingen</span>
                </button>
              ) : null}
            </div>

            {getFolder("OneDrive") ? (
              <div className="file-sidebar-group">
                <button
                  type="button"
                  className={`file-sidebar-item ${activeFolderId === getFolderId("OneDrive") ? "active" : ""}`}
                  onClick={() => goToFolder(getFolderId("OneDrive"))}
                >
                  <span className="ico ico-onedrive" aria-hidden="true" />
                  <span className="lbl">OneDrive - voCampus</span>
                </button>
              </div>
            ) : null}

            {meetingFolders.length > 0 ? (
              <div className="file-sidebar-group">
                <div className="file-sidebar-label">Deze meting</div>
                {meetingFolders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    className={`file-sidebar-item ${activeFolderId === folder.id ? "active" : ""}`}
                    onClick={() => goToFolder(folder.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const draggedId = event.dataTransfer.getData("text/plain");
                      handleDrop(draggedId, folder.id);
                    }}
                  >
                    <span className="ico ico-folder" aria-hidden="true" />
                    <span className="lbl">{folder.name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </aside>

          <div className="file-main">
              <div className="explorer-address">
                <span>{currentPathLabel}</span>
                <span>Sorteren: {sortKey === "name" ? "Naam" : sortKey === "modified" ? "Gewijzigd op" : sortKey === "type" ? "Type" : "Grootte"}</span>
              </div>
              <div
                className={`file-grid ${activeItems.length === 0 ? "is-empty" : ""}`}
                role="list"
                aria-label="Gesimuleerde Windows Verkenner"
              >
                <div className="file-list-header">
                  <span className="file-name-header">
                    <input
                      className="file-select-checkbox header-checkbox"
                      type="checkbox"
                      checked={allVisibleChecked}
                      aria-label="Alle zichtbare mappen en bestanden selecteren"
                      aria-checked={someVisibleChecked ? "mixed" : allVisibleChecked}
                      onChange={(event) => toggleAllVisible(event.currentTarget.checked)}
                    />
                    <span>Naam</span>
                  </span>
                  <span>Gewijzigd op</span>
                  <span>Type</span>
                  <span>Grootte</span>
                </div>
                {activeItems.length === 0 ? (
                  <div className="file-grid-empty">
                    Deze map is leeg — sleep er bestanden in.
                  </div>
                ) : (
                  activeItems.map((node) => {
                    const isFolder = node.type === "folder";
                    const ext = isFolder
                      ? ""
                      : (node.name.split(".").pop() ?? "FILE").toUpperCase();
                    const isDropTarget = isFolder && contextFolderId === node.id;
                    const isChecked = checkedNodeIds.includes(node.id);
                    return (
                      <div
                        key={node.id}
                        role="listitem"
                        tabIndex={0}
                        aria-selected={selectedNodeId === node.id}
                        className={`file-tile ${selectedNodeId === node.id || isChecked ? "selected" : ""} ${
                          isDropTarget ? "drop-target" : ""
                        }`}
                        title={`${node.name} — ${getExplorerType(node)}`}
                        onClick={(event) => handleNodeClick(node, event.detail)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleNodeClick(node, 1);
                          }
                        }}
                        onDoubleClick={() => {
                          if (isFolder) {
                            setContextFolderId(node.id);
                            setSelectedNodeId(null);
                          }
                        }}
                        draggable={node.parentId !== null}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", node.id);
                        }}
                        onDragOver={(event) => {
                          if (isFolder) {
                            event.preventDefault();
                          }
                        }}
                        onDrop={(event) => {
                          if (!isFolder) {
                            return;
                          }
                          event.preventDefault();
                          const draggedId = event.dataTransfer.getData("text/plain");
                          handleDrop(draggedId, node.id);
                        }}
                      >
                        <div className="icon">
                          {isFolder ? <FolderIcon /> : <FileIcon ext={ext.slice(0, 4)} />}
                        </div>
                        {renamingNodeId === node.id ? (
                          <div className="file-name-cell">
                            <span className="file-checkbox-slot" aria-hidden="true" />
                            <input
                              className="file-rename-input"
                              value={renameDraft}
                              autoFocus
                              onFocus={(event) => event.currentTarget.select()}
                              onClick={(event) => event.stopPropagation()}
                              onDoubleClick={(event) => event.stopPropagation()}
                              onChange={(event) => setRenameDraft(event.target.value)}
                              onBlur={commitInlineRename}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  commitInlineRename();
                                }
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelInlineRename();
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="file-name-cell">
                            <input
                              className="file-select-checkbox row-checkbox"
                              type="checkbox"
                              checked={isChecked}
                              aria-label={`${node.name} selecteren`}
                              onClick={(event) => event.stopPropagation()}
                              onDoubleClick={(event) => event.stopPropagation()}
                              onChange={(event) => toggleNodeChecked(node, event.currentTarget.checked)}
                            />
                            <div className="label">{node.name}</div>
                          </div>
                        )}
                        <span className="file-modified">{getExplorerDate(node)}</span>
                        <span className="file-type">{getExplorerType(node)}</span>
                        <span className="file-size">{getExplorerSize(node)}</span>
                      </div>
                    );
                  })
                )}
              </div>
              {clipboard && clipboardNode ? (
                <div className="explorer-hint">
                  {`${clipboard.mode === "cut" ? "Geknipt" : "Gekopieerd"}: ${clipboardNode.name}. Kies een map en klik op Plakken.`}
                </div>
              ) : null}
              {sharedNodeId && getNodeById(state.nodes, sharedNodeId) ? (
                <div className="explorer-hint">
                  Delen voorbereid voor {getNodeById(state.nodes, sharedNodeId)?.name}.
                </div>
              ) : null}
          </div>
        </div>
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={onFinish}
        onSkip={onSkip}
        onExit={onExit}
      />

      {pendingConflict ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Naamconflict</h3>
            <p>In deze map bestaat al een bestand of map met dezelfde naam.</p>
            <div className="option-grid compact-grid">
              <button
                className="option-card compact"
                type="button"
                onClick={() => resolveConflict("overwrite")}
              >
                Overschrijven
              </button>
              <button
                className="option-card compact"
                type="button"
                onClick={() => resolveConflict("rename")}
              >
                Hernoemen en toevoegen
              </button>
              <button
                className="option-card compact"
                type="button"
                onClick={() => resolveConflict("cancel")}
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export const FileTree = ({
  nodes,
  parentId,
  selectedNodeId,
  contextFolderId,
  onSelectNode,
  onContextFolder,
  onDropNode,
}: {
  nodes: Pt1Node[];
  parentId: string;
  selectedNodeId: string | null;
  contextFolderId: string;
  onSelectNode: (nodeId: string) => void;
  onContextFolder: (nodeId: string) => void;
  onDropNode: (nodeId: string, targetFolderId: string) => void;
}) => {
  const items = getChildren(nodes, parentId);

  return (
    <ul className="tree-list">
      {items.map((node) => (
        <li key={node.id}>
          <button
            className={`tree-node ${selectedNodeId === node.id ? "selected" : ""} ${
              contextFolderId === node.id ? "active-target" : ""
            }`}
            type="button"
            onClick={() => {
              onSelectNode(node.id);
              if (node.type === "folder") {
                onContextFolder(node.id);
              }
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              onSelectNode(node.id);
              onContextFolder(node.type === "folder" ? node.id : node.parentId ?? parentId);
            }}
            draggable={node.parentId !== null}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", node.id);
            }}
            onDragOver={(event) => {
              if (node.type === "folder") {
                event.preventDefault();
              }
            }}
            onDrop={(event) => {
              if (node.type !== "folder") {
                return;
              }
              event.preventDefault();
              const draggedId = event.dataTransfer.getData("text/plain");
              onDropNode(draggedId, node.id);
            }}
          >
            <span className="tree-icon">{node.type === "folder" ? "[map]" : "[bestand]"}</span>
            <span>{node.name}</span>
          </button>
          {node.type === "folder" ? (
            <FileTree
              nodes={nodes}
              parentId={node.id}
              selectedNodeId={selectedNodeId}
              contextFolderId={contextFolderId}
              onSelectNode={onSelectNode}
              onContextFolder={onContextFolder}
              onDropNode={onDropNode}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
};

