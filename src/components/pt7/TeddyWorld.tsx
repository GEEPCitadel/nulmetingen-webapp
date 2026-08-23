import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, WheelEvent } from "react";
import type { Pt7Position, Pt7WorldConfig } from "../../types";
import type { Pt7TraceStep, Pt7WorldState } from "../../lib/pt7";

type Camera = { yaw: number; pitch: number; zoom: number };

const DEFAULT_CAMERA: Camera = { yaw: 45, pitch: 38, zoom: 1 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const TeddyFigure = ({ facingLeft }: { facingLeft: boolean }) => {
  return (
    <g className={`teddy-figure ${facingLeft ? "faces-left" : "faces-right"}`}>
      <ellipse cx="0" cy="2" rx="18" ry="12" fill="#bd743b" />
      <circle cx="14" cy="-5" r="11" fill="#cf884b" />
      <path d="M9-13Q5-24 15-17M19-13Q25-23 25-10" fill="#7a4526" stroke="#7a4526" strokeWidth="5" strokeLinecap="round" />
      <circle cx="18" cy="-7" r="2" fill="#1f2024" />
      <circle cx="25" cy="-2" r="3" fill="#1f2024" />
      <path d="M-13 8v10M-2 10v10M9 8v10" stroke="#6d3d24" strokeWidth="5" strokeLinecap="round" />
      <path d="M-17-2q-11-8-11 2" fill="none" stroke="#8a4d2a" strokeWidth="5" strokeLinecap="round" />
      <path d="M7 0q5 4 11 0" fill="none" stroke="#28a39a" strokeWidth="4" />
    </g>
  );
};

const CatFigure = ({ moving }: { moving: boolean }) => (
  <g className={`teddy-cat ${moving ? "is-moving" : ""}`}>
    <path d="M-13-7l4-13 8 9M13-7l-4-13-8 9" fill="#ef9f42" stroke="#854b28" strokeWidth="2" />
    <ellipse cx="0" cy="3" rx="15" ry="17" fill="#f4ad50" />
    <circle cx="-5" cy="-2" r="2" fill="#202229" /><circle cx="5" cy="-2" r="2" fill="#202229" />
    <path d="M0 2l-2 3h4zM-2 6q-5 5-9 0M2 6q5 5 9 0" fill="none" stroke="#5e3726" strokeWidth="1.5" />
    <path d="M13 8q18-4 10-18" fill="none" stroke="#c67831" strokeWidth="5" strokeLinecap="round" />
  </g>
);

export const TeddyWorld = ({
  world,
  state,
  trace,
  activeTraceIndex,
}: {
  world: Pt7WorldConfig;
  state: Pt7WorldState;
  trace: Pt7TraceStep[];
  activeTraceIndex: number;
}) => {
  const [camera, setCamera] = useState(DEFAULT_CAMERA);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDistance = useRef<number | null>(null);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const scene = useMemo(() => {
    const yaw = camera.yaw * Math.PI / 180;
    const pitchScale = Math.sin(camera.pitch * Math.PI / 180);
    const tile = 68 * camera.zoom;
    const centerX = (world.width - 1) / 2;
    const centerY = (world.height - 1) / 2;
    const project = (point: Pt7Position, z = 0) => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      const rotatedX = dx * Math.cos(yaw) - dy * Math.sin(yaw);
      const rotatedY = dx * Math.sin(yaw) + dy * Math.cos(yaw);
      return {
        x: 410 + rotatedX * tile,
        y: 215 + rotatedY * tile * pitchScale - z * camera.zoom,
        depth: rotatedY,
      };
    };
    return { project };
  }, [camera, world.height, world.width]);

  const visibleTrace = trace.slice(0, Math.max(0, activeTraceIndex + 1));
  const travelled = [
    { x: world.teddyStart.x, y: world.teddyStart.y },
    ...visibleTrace.flatMap((step) => {
      if ((step.action === "walk" || step.action === "jump") &&
        (step.before.teddy.x !== step.after.teddy.x || step.before.teddy.y !== step.after.teddy.y)) {
        return [{ x: step.after.teddy.x, y: step.after.teddy.y }];
      }
      return [];
    }),
  ];
  const trailPoints = travelled.map((point) => {
    const projected = scene.project(point, 5);
    return `${projected.x},${projected.y}`;
  }).join(" ");

  const tiles = Array.from({ length: world.width * world.height }, (_, index) => ({
    x: index % world.width,
    y: Math.floor(index / world.width),
  }));
  const sortedEntities = [
    ...world.obstacles.map((position, index) => ({ kind: "obstacle" as const, id: `obstacle-${index}`, ...position })),
    ...state.cats.filter((cat) => cat.active).map((cat) => ({ ...cat, kind: "cat" as const })),
    { kind: "bone" as const, id: "bone", ...world.bone },
    { kind: "teddy" as const, id: "teddy", ...state.teddy },
  ].sort((a, b) => scene.project(a).depth - scene.project(b).depth);

  const rotateCamera = (amount: number) => setCamera((current) => ({ ...current, yaw: (current.yaw + amount + 360) % 360 }));
  const zoomCamera = (amount: number) => setCamera((current) => ({ ...current, zoom: clamp(current.zoom + amount, 0.72, 1.35) }));
  const resetCamera = () => setCamera(DEFAULT_CAMERA);

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const allPointers = [...pointers.current.values()];
    if (allPointers.length === 1) {
      setCamera((current) => ({
        ...current,
        yaw: (current.yaw + (event.clientX - previous.x) * 0.45 + 360) % 360,
        pitch: clamp(current.pitch - (event.clientY - previous.y) * 0.16, 28, 56),
      }));
      return;
    }
    if (allPointers.length === 2) {
      const distance = Math.hypot(allPointers[0].x - allPointers[1].x, allPointers[0].y - allPointers[1].y);
      if (lastPinchDistance.current !== null) zoomCamera((distance - lastPinchDistance.current) / 240);
      lastPinchDistance.current = distance;
    }
  };
  const endPointer = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) lastPinchDistance.current = null;
  };
  const onWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    zoomCamera(event.deltaY < 0 ? 0.07 : -0.07);
  };
  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === "ArrowLeft") rotateCamera(-15);
    else if (event.key === "ArrowRight") rotateCamera(15);
    else if (event.key === "+" || event.key === "=") zoomCamera(0.08);
    else if (event.key === "-") zoomCamera(-0.08);
    else if (event.key === "Home") resetCamera();
    else return;
    event.preventDefault();
  };

  const activeStep = activeTraceIndex >= 0 ? trace[activeTraceIndex] : undefined;

  return (
    <div className="teddy-world-wrap">
      <div className="teddy-camera-hint">Sleep of veeg om rond te kijken</div>
      <svg
        className="teddy-world"
        viewBox="0 0 820 430"
        role="img"
        aria-label="Draaibaar hondenpark met Teddy, katten, een boomstam en een bot"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
      >
        <defs>
          <linearGradient id="teddy-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c8f0ff" /><stop offset="1" stopColor="#f8fcf2" /></linearGradient>
          <filter id="teddy-shadow"><feDropShadow dx="0" dy="7" stdDeviation="5" floodOpacity=".2" /></filter>
          <marker id="teddy-heading-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0l10 5-10 5z" fill="#087f78" /></marker>
        </defs>
        <rect width="820" height="430" rx="22" fill="url(#teddy-sky)" />
        <circle cx="690" cy="55" r="32" fill="#ffd66b" opacity=".85" />
        {tiles.map((tile) => {
          const corners = [
            scene.project({ x: tile.x - 0.48, y: tile.y - 0.48 }),
            scene.project({ x: tile.x + 0.48, y: tile.y - 0.48 }),
            scene.project({ x: tile.x + 0.48, y: tile.y + 0.48 }),
            scene.project({ x: tile.x - 0.48, y: tile.y + 0.48 }),
          ];
          return <polygon key={`${tile.x}-${tile.y}`} points={corners.map((point) => `${point.x},${point.y}`).join(" ")} fill={(tile.x + tile.y) % 2 ? "#8fce74" : "#9cda80"} stroke="#73b761" strokeWidth="1" />;
        })}

        {world.targetPath.map((position, index) => {
          const point = scene.project(position, 3);
          return (
            <g key={`paw-${index}`} transform={`translate(${point.x} ${point.y}) rotate(${camera.yaw - 45})`} opacity=".42">
              <ellipse cx="-5" cy="1" rx="4" ry="6" fill="#fff" /><ellipse cx="5" cy="1" rx="4" ry="6" fill="#fff" />
              <circle cx="-7" cy="-7" r="2.5" fill="#fff" /><circle cx="0" cy="-10" r="2.5" fill="#fff" /><circle cx="7" cy="-7" r="2.5" fill="#fff" />
            </g>
          );
        })}

        {world.cats.flatMap((cat) => cat.patrol && cat.patrol.length > 1 ? cat.patrol.map((position, index) => {
          const next = cat.patrol?.[(index + 1) % cat.patrol.length];
          if (!next) return null;
          const from = scene.project(position, 2);
          const to = scene.project(next, 2);
          return <g key={`${cat.id}-patrol-${index}`} className="cat-patrol"><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><circle cx={to.x} cy={to.y} r="3" /></g>;
        }) : [])}

        {trailPoints ? <polyline className="teddy-actual-trail" points={trailPoints} /> : null}

        {(() => {
          const from = scene.project(state.teddy, 4);
          const delta = ({
            north: { x: 0, y: -1 },
            east: { x: 1, y: 0 },
            south: { x: 0, y: 1 },
            west: { x: -1, y: 0 },
          } as const)[state.teddy.heading];
          const ahead = scene.project({ x: state.teddy.x + delta.x, y: state.teddy.y + delta.y }, 4);
          const length = Math.hypot(ahead.x - from.x, ahead.y - from.y) || 1;
          const endX = from.x + (ahead.x - from.x) * 25 / length;
          const endY = from.y + (ahead.y - from.y) * 25 / length;
          return <line className="teddy-heading-indicator" x1={from.x} y1={from.y} x2={endX} y2={endY} markerEnd="url(#teddy-heading-arrow)" />;
        })()}

        {sortedEntities.map((entity) => {
          const point = scene.project(entity, entity.kind === "teddy" || entity.kind === "cat" ? 18 : 8);
          if (entity.kind === "obstacle") {
            return <g key={entity.id} transform={`translate(${point.x} ${point.y})`} filter="url(#teddy-shadow)"><rect x="-28" y="-10" width="56" height="20" rx="9" fill="#8e542f" /><circle cx="-26" cy="0" r="10" fill="#d59a5b" /><path d="M-8-10v20M8-10v20" stroke="#6f3f27" strokeWidth="3" /></g>;
          }
          if (entity.kind === "bone") {
            return !state.boneTaken ? <g key={entity.id} transform={`translate(${point.x} ${point.y}) rotate(-18)`} filter="url(#teddy-shadow)"><path d="M-22-7a8 8 0 1 0 0 14h44a8 8 0 1 0 0-14z" fill="#fff4d4" stroke="#d4b982" strokeWidth="2" /></g> : null;
          }
          if (entity.kind === "cat") {
            return <g key={entity.id} transform={`translate(${point.x} ${point.y - 9})`} filter="url(#teddy-shadow)"><CatFigure moving={Boolean(entity.patrol?.length)} /><text y="31" textAnchor="middle" className="teddy-entity-label">{entity.name}</text></g>;
          }
          const delta = ({
            north: { x: 0, y: -1 },
            east: { x: 1, y: 0 },
            south: { x: 0, y: 1 },
            west: { x: -1, y: 0 },
          } as const)[state.teddy.heading];
          const ahead = scene.project({ x: state.teddy.x + delta.x, y: state.teddy.y + delta.y });
          return <g key={entity.id} transform={`translate(${point.x} ${point.y - 9})`} filter="url(#teddy-shadow)"><TeddyFigure facingLeft={ahead.x < point.x} /><text y="35" textAnchor="middle" className="teddy-entity-label teddy-name">Teddy</text></g>;
        })}

        {activeStep?.action === "bark" ? <g className="bark-bubble" transform={`translate(${scene.project(state.teddy, 50).x} ${scene.project(state.teddy, 50).y})`}><path d="M0 0l12-17 7 13 17-4-7 17 13 10-18 5 1 18-16-9-12 14-4-18-18 1 11-15-12-13z" fill="#fff" stroke="#202229" strokeWidth="2" /><text x="6" y="17">WAF!</text></g> : null}
        {activeStep?.action === "error" ? <g transform={`translate(${scene.project(state.teddy, 55).x} ${scene.project(state.teddy, 55).y})`}><circle r="19" fill="#e51c73" /><text y="7" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="900">!</text></g> : null}
      </svg>

      <div className="teddy-compass" aria-label={`Camera ${Math.round(camera.yaw)} graden gedraaid`}><span style={{ transform: `rotate(${-camera.yaw}deg)` }}>N</span></div>
      <div className="teddy-camera-controls" aria-label="Camerabediening">
        <button type="button" onClick={() => rotateCamera(-20)} aria-label="Camera naar links draaien">↶</button>
        <button type="button" onClick={() => rotateCamera(20)} aria-label="Camera naar rechts draaien">↷</button>
        <button type="button" onClick={() => zoomCamera(0.08)} aria-label="Inzoomen">+</button>
        <button type="button" onClick={() => zoomCamera(-0.08)} aria-label="Uitzoomen">−</button>
        <button type="button" className="camera-reset" onClick={resetCamera}>Herstel beeld</button>
      </div>
    </div>
  );
};
