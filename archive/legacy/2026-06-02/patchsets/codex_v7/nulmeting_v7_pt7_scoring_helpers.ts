/**
 * NULMETING DG — v7 PT7 SCORING-HELPERS
 * ======================================
 * Scoringscriteria voor de vier v7 PT7-Blokprogrammeren items, gebaseerd op
 * combinatie van AST-walk (structuur) + eindstate (gedrag).
 *
 * INSTRUCTIE VOOR CODEX:
 *   - Drop-in vervanging van de `criteriaByItem`-map in
 *     `nulmeting_v6_scoring_helpers.ts` (sectie 4). De helpers `findBlock`,
 *     `blockMatches`, `eventIndex` worden geherexporteerd hieronder voor
 *     self-containment; gebruik bij voorkeur de bestaande implementaties uit
 *     de v6-module en deduplicateer.
 *   - `BizzyState` moet ten opzichte van v6 zijn uitgebreid:
 *       • `lastThought: string | null`
 *       • `events` ondersteunt `denk`, `herhaal_start`, `herhaal_end` types
 *       • `startHeading` en `heading` in graden (modulo 360)
 *   - Schrijf unit tests per item volgens de testmatrix in
 *     `CODEX_INSTRUCTIONS_PT7_v7.md` §6.
 */

import type { BlockNode, PT7Item } from "./nulmeting_v7_pt7_items";

// =============================================================================
// RUNTIME STATE
// =============================================================================

export type BizzyState = {
  /** Start- en eindcoördinaten op het werkvlak (in meters). */
  startX: number;
  startY: number;
  x: number;
  y: number;
  /** Oriëntatie in graden, 0° = naar rechts, draaiend met de wijzers van de klok. */
  startHeading: number;
  heading: number;
  /** Laatste tekst die Bizzy heeft uitgesproken (zeg-blok). */
  lastSpoken: string | null;
  /** Laatste tekst die Bizzy heeft gedacht (denk-blok) — apart van lastSpoken. */
  lastThought: string | null;
  /** Chronologische event-log voor positionele en volgorde-checks. */
  events: Array<{
    type:
      | "zeg"
      | "denk"
      | "verplaats"
      | "draai"
      | "wacht"
      | "herhaal_start"
      | "herhaal_end"
      | "verander_animatie"
      | "scene_restart";
    value?: string | number;
    tick: number;
  }>;
};

export type ScoreBreakdown = {
  criterion: string;
  points: number;
  max: number;
};

// =============================================================================
// AST + STATE HELPERS
// =============================================================================

export function findBlock(
  root: BlockNode | undefined,
  predicate: (n: BlockNode) => boolean,
): BlockNode | null {
  if (!root) return null;
  if (predicate(root)) return root;
  for (const c of root.children ?? []) {
    const hit = findBlock(c, predicate);
    if (hit) return hit;
  }
  return null;
}

export function findAllBlocks(
  root: BlockNode | undefined,
  predicate: (n: BlockNode) => boolean,
): BlockNode[] {
  const result: BlockNode[] = [];
  if (!root) return result;
  function walk(n: BlockNode) {
    if (predicate(n)) result.push(n);
    n.children?.forEach(walk);
  }
  walk(root);
  return result;
}

export function blockMatches(node: BlockNode, expected: Partial<BlockNode>): boolean {
  if (expected.type && node.type !== expected.type) return false;
  if (expected.params) {
    for (const [k, v] of Object.entries(expected.params)) {
      if ((node.params as Record<string, unknown>)?.[k] !== v) return false;
    }
  }
  return true;
}

export function eventIndex(
  state: BizzyState,
  predicate: (e: BizzyState["events"][number]) => boolean,
): number {
  return state.events.findIndex(predicate);
}

/** Laatste index in event-stream van een herhaal_end-event (-1 als niet aanwezig). */
function lastHerhaalEndIndex(state: BizzyState): number {
  let idx = -1;
  for (let i = 0; i < state.events.length; i++) {
    if (state.events[i].type === "herhaal_end") idx = i;
  }
  return idx;
}

/** Checkt of geen van de verboden blok-patronen aanwezig is in het programma. */
function hasNoneOf(
  program: BlockNode,
  forbidden: Array<Partial<BlockNode>>,
): boolean {
  return forbidden.every(
    (f) => findBlock(program, (n) => blockMatches(n, f)) === null,
  );
}

/** Modulo 360 (positief), tolerantie 1°. */
function headingEquivalent(a: number, b: number): boolean {
  const diff = (((a - b) % 360) + 360) % 360;
  return diff < 1 || diff > 359;
}

/** Eindpositie ligt binnen 0.1m van startpositie. */
function isAtStartPosition(s: BizzyState): boolean {
  return Math.abs(s.x - s.startX) < 0.1 && Math.abs(s.y - s.startY) < 0.1;
}

/** Eindoriëntatie ligt op startoriëntatie (mod 360). */
function isAtStartHeading(s: BizzyState): boolean {
  return headingEquivalent(s.heading, s.startHeading);
}

// =============================================================================
// CRITERIA TYPE
// =============================================================================

type Criterion = {
  description: string;
  check: (program: BlockNode, state: BizzyState) => boolean;
  points: number;
};

// =============================================================================
// CRITERIA PER ITEM
// =============================================================================

const criteriaByItem: Record<string, Criterion[]> = {
  // ---------- LJ1V ---------------------------------------------------------
  "pt7-lj1v-v7": [
    {
      description: "Bizzy zegt 'Hoi!' (zeg-blok, niet denk)",
      check: (p) =>
        findBlock(p, (n) =>
          blockMatches(n, { type: "zeg", params: { tekst: "Hoi!" } }),
        ) !== null,
      points: 1,
    },
    {
      description: "verplaats 1m vooruit gebruikt",
      check: (p) =>
        findBlock(p, (n) =>
          blockMatches(n, {
            type: "verplaats",
            params: { afstand: 1, richting: "vooruit" },
          }),
        ) !== null,
      points: 1,
    },
    {
      description: "draai 180° gebruikt",
      check: (p) =>
        findBlock(p, (n) => blockMatches(n, { type: "draai", params: { hoek: 180 } })) !==
        null,
      points: 1,
    },
    {
      description:
        "Eindgedrag klopt: 1m bewogen, 180° gedraaid, begroeting vóór beweging en afsluiting ná beweging; geen kritieke afleider",
      check: (p, s) => {
        const movedOk =
          Math.abs(
            s.x - s.startX - Math.cos((s.startHeading * Math.PI) / 180) * 1,
          ) < 0.1 &&
          Math.abs(
            s.y - s.startY - Math.sin((s.startHeading * Math.PI) / 180) * 1,
          ) < 0.1;
        const turnedOk = headingEquivalent(s.heading, s.startHeading + 180);
        // Volgorde via event-stream — accepteer zeg ÓF denk voor "Hoi!" en "Klaar!"
        // (zeg/denk-discriminatie is al gevangen in criterium 1; geen dubbele straf).
        const hoiIdx = eventIndex(
          s,
          (e) => (e.type === "zeg" || e.type === "denk") && e.value === "Hoi!",
        );
        const verpIdx = eventIndex(s, (e) => e.type === "verplaats");
        const draaiIdx = eventIndex(s, (e) => e.type === "draai");
        const klaarIdx = eventIndex(
          s,
          (e) => (e.type === "zeg" || e.type === "denk") && e.value === "Klaar!",
        );
        const orderOk =
          hoiIdx !== -1 &&
          verpIdx !== -1 &&
          draaiIdx !== -1 &&
          klaarIdx !== -1 &&
          hoiIdx < verpIdx &&
          verpIdx < draaiIdx &&
          draaiIdx < klaarIdx;
        const noCritical = hasNoneOf(p, [
          { type: "wanneer_klik_bizzy" },
          { type: "verplaats", params: { richting: "achteruit" } },
          { type: "als" },
          { type: "herstart_scene" },
        ]);
        return movedOk && turnedOk && orderOk && noCritical;
      },
      points: 1,
    },
  ],

  // ---------- LJ1H ---------------------------------------------------------
  "pt7-lj1h-v7": [
    {
      description: "Bizzy zegt 'Klaar voor de start!'",
      check: (p) =>
        findBlock(p, (n) =>
          blockMatches(n, { type: "zeg", params: { tekst: "Klaar voor de start!" } }),
        ) !== null,
      points: 1,
    },
    {
      description: "herhaal met aantal=3 aanwezig (niet 1, niet 10)",
      check: (p) =>
        findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 3 } })) !==
        null,
      points: 1,
    },
    {
      description:
        "verplaats 1m vooruit is genest binnen een herhaal-blok (nesting-concept, los van het herhaal-aantal — anti-bypass tegen 3 losse verplaats-blokken)",
      check: (p) => {
        const herhalen = findAllBlocks(p, (n) => n.type === "herhaal");
        return herhalen.some((h) =>
          h.children?.some((c) =>
            blockMatches(c, {
              type: "verplaats",
              params: { afstand: 1, richting: "vooruit" },
            }),
          ),
        );
      },
      points: 1,
    },
    {
      description:
        "Eindgedrag klopt (3m bewogen, 180° gedraaid); geen kritieke afleider",
      check: (p, s) => {
        const movedOk =
          Math.abs(
            s.x - s.startX - Math.cos((s.startHeading * Math.PI) / 180) * 3,
          ) < 0.1 &&
          Math.abs(
            s.y - s.startY - Math.sin((s.startHeading * Math.PI) / 180) * 3,
          ) < 0.1;
        const turnedOk = headingEquivalent(s.heading, s.startHeading + 180);
        const noCritical = hasNoneOf(p, [
          { type: "verplaats", params: { afstand: 3 } },
          { type: "herhaal", params: { aantal: 10 } },
          { type: "herhaal", params: { aantal: 1 } },
          { type: "verplaats", params: { richting: "achteruit" } },
          { type: "als" },
          { type: "herstart_scene" },
        ]);
        return movedOk && turnedOk && noCritical;
      },
      points: 1,
    },
  ],

  // ---------- LJ3V ---------------------------------------------------------
  "pt7-lj3v-v7": [
    {
      description: "herhaal met aantal=4 aanwezig",
      check: (p) =>
        findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 4 } })) !==
        null,
      points: 1,
    },
    {
      description:
        "Binnen de herhaal-4: precies twee blokken in volgorde [verplaats 1m vooruit, draai 90°]",
      check: (p) => {
        const herhaal = findBlock(p, (n) =>
          blockMatches(n, { type: "herhaal", params: { aantal: 4 } }),
        );
        if (!herhaal?.children || herhaal.children.length !== 2) return false;
        const [c1, c2] = herhaal.children;
        return (
          blockMatches(c1, {
            type: "verplaats",
            params: { afstand: 1, richting: "vooruit" },
          }) &&
          blockMatches(c2, { type: "draai", params: { hoek: 90 } })
        );
      },
      points: 1,
    },
    {
      description:
        "Eindpositie = startpositie (vierkant gesloten) EN eindoriëntatie = startoriëntatie (mod 360)",
      check: (_p, s) => isAtStartPosition(s) && isAtStartHeading(s),
      points: 1,
    },
    {
      description:
        "Bizzy zegt 'Start!' vóór alle bewegingsacties EN denkt 'Klaar!' ná alle bewegingsacties; geen kritieke afleider",
      check: (p, s) => {
        const zegStartIdx = eventIndex(
          s,
          (e) => e.type === "zeg" && e.value === "Start!",
        );
        const denkKlaarIdx = eventIndex(
          s,
          (e) => e.type === "denk" && e.value === "Klaar!",
        );
        // Eerste en laatste "actie" — werkt zowel met herhaal als met losse blokken
        const firstActionIdx = (() => {
          for (let i = 0; i < s.events.length; i++) {
            const t = s.events[i].type;
            if (t === "verplaats" || t === "draai" || t === "herhaal_start") return i;
          }
          return -1;
        })();
        const lastActionIdx = (() => {
          for (let i = s.events.length - 1; i >= 0; i--) {
            const t = s.events[i].type;
            if (t === "verplaats" || t === "draai" || t === "herhaal_end") return i;
          }
          return -1;
        })();

        const positionOk =
          zegStartIdx !== -1 &&
          denkKlaarIdx !== -1 &&
          firstActionIdx !== -1 &&
          lastActionIdx !== -1 &&
          zegStartIdx < firstActionIdx &&
          denkKlaarIdx > lastActionIdx;

        const noCritical = hasNoneOf(p, [
          { type: "draai", params: { hoek: 180 } },
          { type: "verplaats", params: { richting: "achteruit" } },
          { type: "als" },
          { type: "herstart_scene" },
          // Zeg/denk-verwisseling: gebruik geen zeg "Klaar!" of denk "Start!"
          { type: "zeg", params: { tekst: "Klaar!" } },
          { type: "denk", params: { tekst: "Start!" } },
        ]);

        return positionOk && noCritical;
      },
      points: 1,
    },
  ],

  // ---------- LJ3H ---------------------------------------------------------
  "pt7-lj3h-v7": [
    {
      description: "herhaal met aantal=3 aanwezig",
      check: (p) =>
        findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 3 } })) !==
        null,
      points: 1,
    },
    {
      description:
        "Binnen de herhaal-3: precies vier blokken in volgorde [verp 2m vooruit, draai 180°, verp 2m vooruit, draai 180°]",
      check: (p) => {
        const herhaal = findBlock(p, (n) =>
          blockMatches(n, { type: "herhaal", params: { aantal: 3 } }),
        );
        if (!herhaal?.children || herhaal.children.length !== 4) return false;
        const [c1, c2, c3, c4] = herhaal.children;
        return (
          blockMatches(c1, {
            type: "verplaats",
            params: { afstand: 2, richting: "vooruit" },
          }) &&
          blockMatches(c2, { type: "draai", params: { hoek: 180 } }) &&
          blockMatches(c3, {
            type: "verplaats",
            params: { afstand: 2, richting: "vooruit" },
          }) &&
          blockMatches(c4, { type: "draai", params: { hoek: 180 } })
        );
      },
      points: 1,
    },
    {
      description:
        "Eindpositie = startpositie EN eindoriëntatie = startoriëntatie EN ten minste één herhaal-blok gebruikt waarna 'Bravo!' wordt gezegd",
      check: (_p, s) => {
        const positionOk = isAtStartPosition(s) && isAtStartHeading(s);
        const lastHerhaalEnd = lastHerhaalEndIndex(s);
        const zegBravoIdx = eventIndex(
          s,
          (e) => e.type === "zeg" && e.value === "Bravo!",
        );
        const bravoAfterHerhaal =
          lastHerhaalEnd !== -1 && zegBravoIdx !== -1 && zegBravoIdx > lastHerhaalEnd;
        return positionOk && bravoAfterHerhaal;
      },
      points: 1,
    },
    {
      description:
        "Parameter-precisie: geen verplaats 1m, geen verplaats 2m achteruit, geen draai 90°, geen herhaal 6 keer, geen als, geen herstart",
      check: (p) =>
        hasNoneOf(p, [
          { type: "verplaats", params: { afstand: 1 } },
          { type: "verplaats", params: { richting: "achteruit" } },
          { type: "draai", params: { hoek: 90 } },
          { type: "herhaal", params: { aantal: 6 } },
          { type: "als" },
          { type: "herstart_scene" },
          // Denk "Bravo!" NIET in deze lijst opgenomen: zeg/denk-verwisseling wordt
          // al éénmaal bestraft via criterium 3 (zegBravoIdx === -1 → C3 = 0).
          // Geen dubbele straf voor één fout.
        ]),
      points: 1,
    },
  ],
};

// =============================================================================
// PUBLIC SCORING-FUNCTIE
// =============================================================================

export function scorePT7Item(
  item: PT7Item,
  program: BlockNode,
  state: BizzyState,
): ScoreBreakdown[] {
  const criteria = criteriaByItem[item.criteriaSpec];
  if (!criteria) {
    throw new Error(`Geen criteria gedefinieerd voor criteriaSpec=${item.criteriaSpec}`);
  }
  return criteria.map((c) => ({
    criterion: c.description,
    points: c.check(program, state) ? c.points : 0,
    max: c.points,
  }));
}

/** Totaalscore (som van alle behaalde punten). */
export function totalScore(breakdown: ScoreBreakdown[]): number {
  return breakdown.reduce((sum, b) => sum + b.points, 0);
}

// =============================================================================
// EXPORT VOOR TESTING
// =============================================================================

export const __testing__ = {
  criteriaByItem,
  headingEquivalent,
  isAtStartPosition,
  isAtStartHeading,
  hasNoneOf,
  lastHerhaalEndIndex,
};
