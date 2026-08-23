import type { CSSProperties, DragEvent } from "react";
import type { ProgrammingBlockDefinition, Pt7ProgramBlock } from "../../types";

const blockLabel = (block: Pt7ProgramBlock) => {
  if (block.opcode === "turn") return "draai";
  if (block.opcode === "repeat") return "herhaal";
  return block.label;
};

export const TeddyBlockEditor = ({
  palette,
  program,
  selectedId,
  activeBlockId,
  completedBlockIds,
  disabled,
  directionOrder,
  repeatOrder,
  onSelect,
  onAdd,
  onMove,
  onIndent,
  onRemove,
  onParameter,
  onDropAt,
  onMoveTo,
  onUndo,
  onClear,
  canUndo,
}: {
  palette: ProgrammingBlockDefinition[];
  program: Pt7ProgramBlock[];
  selectedId: string | null;
  activeBlockId: string | null;
  completedBlockIds: string[];
  disabled: boolean;
  directionOrder: Array<"left" | "right">;
  repeatOrder: number[];
  onSelect: (id: string) => void;
  onAdd: (definition: ProgrammingBlockDefinition) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onIndent: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onParameter: (id: string, parameters: Pt7ProgramBlock["parameters"]) => void;
  onDropAt: (definitionId: string, index: number) => void;
  onMoveTo: (blockId: string, index: number) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}) => {
  const groups = palette.reduce<Array<{ category: string; color: string; blocks: ProgrammingBlockDefinition[] }>>((result, definition) => {
    const existing = result.find((group) => group.category === definition.category);
    if (existing) existing.blocks.push(definition);
    else result.push({ category: definition.category, color: definition.color, blocks: [definition] });
    return result;
  }, []);

  const dropDefinition = (event: DragEvent, index: number) => {
    event.preventDefault();
    const blockId = event.dataTransfer.getData("text/pt7-instance");
    if (blockId) {
      onMoveTo(blockId, index);
      return;
    }
    const definitionId = event.dataTransfer.getData("text/pt7-definition");
    if (definitionId) onDropAt(definitionId, index);
  };

  return (
    <>
      <aside className="teddy-palette" aria-label="Blokkenbak">
        <div className="teddy-panel-title"><span>Blokken</span><small>Tik of sleep</small></div>
        {groups.map((group) => (
          <section key={group.category} className="teddy-palette-group">
            <h3><i style={{ background: group.color }} />{group.category === "acties" ? "Acties" : "Besturing"}</h3>
            {group.blocks.map((definition) => (
              <button
                key={definition.id}
                type="button"
                className={`teddy-palette-block ${definition.isContainer ? "is-container" : ""}`}
                style={{ "--block-color": definition.color } as CSSProperties}
                onClick={() => onAdd(definition)}
                disabled={disabled}
                draggable={!disabled}
                onDragStart={(event) => event.dataTransfer.setData("text/pt7-definition", definition.id ?? "")}
              >
                {definition.opcode === "turn" ? <>draai <b>links/rechts</b></> : definition.opcode === "repeat" ? <>herhaal <b>…</b> keer</> : definition.label}
              </button>
            ))}
          </section>
        ))}
      </aside>

      <section className="teddy-program" aria-label="Programma-editor">
        <div className="teddy-program-toolbar">
          <div><strong>Programma</strong><small>{program.length} {program.length === 1 ? "blok" : "blokken"}</small></div>
          <div>
            <button type="button" onClick={onUndo} disabled={disabled || !canUndo}>Ongedaan</button>
            <button type="button" onClick={onClear} disabled={disabled || program.length <= 1}>Wis programma</button>
          </div>
        </div>
        <div className="teddy-program-scroll">
          {program.map((block, index) => {
            const selected = selectedId === block.id;
            const active = activeBlockId === block.id;
            const complete = completedBlockIds.includes(block.id);
            return (
              <div key={block.id}>
                <div
                  className="teddy-drop-slot"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => dropDefinition(event, index)}
                />
                <div
                  className={`teddy-program-row ${selected ? "is-selected" : ""} ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
                  style={{ "--indent": block.indent } as CSSProperties}
                  onClick={() => !disabled && onSelect(block.id)}
                  draggable={!disabled && index > 0}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/pt7-instance", block.id);
                  }}
                >
                  <span className="teddy-line-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="teddy-run-dot">{active ? "▶" : complete ? "✓" : ""}</span>
                  <div className={`teddy-code-block opcode-${block.opcode} ${block.isContainer ? "is-container" : ""}`} style={{ "--block-color": block.color } as CSSProperties}>
                    <span>{blockLabel(block)}</span>
                    {block.opcode === "turn" ? (
                      <select
                        aria-label="Draairichting"
                        value={block.parameters.direction ?? "right"}
                        disabled={disabled}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => onParameter(block.id, { ...block.parameters, direction: event.target.value as "left" | "right" })}
                      >
                        {directionOrder.map((direction) => <option key={direction} value={direction}>{direction === "right" ? "rechts" : "links"}</option>)}
                      </select>
                    ) : null}
                    {block.opcode === "repeat" ? (
                      <><select
                        aria-label="Aantal herhalingen"
                        value={block.parameters.count ?? 3}
                        disabled={disabled}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => onParameter(block.id, { ...block.parameters, count: Number(event.target.value) })}
                      >
                        {repeatOrder.map((count) => <option key={count} value={count}>{count}</option>)}
                      </select><span>keer</span></>
                    ) : null}
                    {block.isContainer ? <span className="container-mouth" aria-hidden="true" /> : null}
                  </div>
                  {index > 0 ? (
                    <div className="teddy-row-tools" aria-label={`Bewerk ${blockLabel(block)}`}>
                      <button type="button" onClick={(event) => { event.stopPropagation(); onMove(block.id, -1); }} disabled={disabled || index <= 1} aria-label="Omhoog">↑</button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); onMove(block.id, 1); }} disabled={disabled || index === program.length - 1} aria-label="Omlaag">↓</button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); onIndent(block.id, -1); }} disabled={disabled || block.indent === 0} aria-label="Naar buiten">←</button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); onIndent(block.id, 1); }} disabled={disabled} aria-label="Naar binnen">→</button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); onRemove(block.id); }} disabled={disabled} aria-label="Verwijder">×</button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div className="teddy-drop-slot is-last" onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropDefinition(event, program.length)} />
        </div>
        <p className="teddy-editor-help">Selecteer een blok. Gebruik ↑ ↓ om te verplaatsen en ← → om blokken te nesten.</p>
      </section>
    </>
  );
};
