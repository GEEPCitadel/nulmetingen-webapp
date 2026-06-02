/**
 * NULMETING DG — v6 SCORING-HELPERS
 * ==================================
 * Werkende TypeScript-templates voor de vier nieuwe/uitgebreide scoring-routes:
 *
 *   1. scoreMailItem              — Outlook-mail-simulatie met dropdown-velden
 *   2. scoreExcelItem             — incl. numerieke H2-uitkomst voor formulevraag
 *   3. scoreSourceEvaluationItem  — dropdown- en multi-checkbox-vragen
 *   4. scorePT7Item               — AST-walk over blokprogramma + eindstate
 *
 * INSTRUCTIE VOOR CODEX:
 *   - Map de input-types (MailItem, ExcelItem, SourceEvalItem, PT7Item) naar de
 *     werkelijke item-types in `src/data/assessments.ts`.
 *   - Map de runtime-responses (MailResponse, ExcelResponse, etc.) naar de manier
 *     waarop de bestaande scoring-engine de leerling-input ontvangt.
 *   - Plaats de helpers in de scoring-module (waarschijnlijk
 *     `src/scoring/` of `backend/scoring/`); volg projectstructuur.
 *   - Schrijf unit tests die bij elke helper de drie scenario's dekken die
 *     onderaan elke sectie als TEST CASES staan.
 */

import type {
  MailItem,
  ExcelItem,
  SourceEvalItem,
  PT7Item,
  BlockNode,
} from "./nulmeting_v6_items";

// =============================================================================
// 1. MAIL — scoring (Fix 3a)
// =============================================================================

export type MailResponse = {
  aan: string[];
  cc?: string[];
  bcc?: string[];
  /** Bij subjectMode === "freeText" */
  onderwerpText?: string;
  /** Bij subjectMode === "dropdown" */
  subjectOptionId?: string;
  bijlage: string[];
  verzonden: boolean;
  priorityHigh?: boolean;
  greetingOptionId?: string;
  closingOptionId?: string;
};

export type ScoreBreakdown = { criterion: string; points: number; max: number };

export function scoreMailItem(item: MailItem, response: MailResponse): ScoreBreakdown[] {
  const breakdown: ScoreBreakdown[] = [];

  // (1) Aan correct
  const aanCorrect = item.expected.aan.every((adr) => response.aan.includes(adr));
  breakdown.push({ criterion: "aan", points: aanCorrect ? 1 : 0, max: 1 });

  // (2) CC (alleen indien verwacht)
  if (item.expected.cc && item.expected.cc.length > 0) {
    const ccCorrect = item.expected.cc.every((adr) => (response.cc ?? []).includes(adr));
    breakdown.push({ criterion: "cc", points: ccCorrect ? 1 : 0, max: 1 });
  }

  // (3) Onderwerp — freeText OF dropdown
  if (item.subjectMode === "freeText") {
    const expected = (item.expected.onderwerp ?? "").trim().toLowerCase();
    const actual = (response.onderwerpText ?? "").trim().toLowerCase();
    const match = expected.length > 0 && actual === expected;
    breakdown.push({ criterion: "onderwerp", points: match ? 1 : 0, max: 1 });
  } else if (item.subjectMode === "dropdown") {
    const match = response.subjectOptionId === item.expected.subjectOptionId;
    breakdown.push({ criterion: "onderwerp", points: match ? 1 : 0, max: 1 });
  }

  // (4) Bijlage correct
  const bijlageCorrect = item.expected.bijlage.every((b) => response.bijlage.includes(b));
  breakdown.push({ criterion: "bijlage", points: bijlageCorrect ? 1 : 0, max: 1 });

  // (5) Verzonden
  breakdown.push({
    criterion: "verzonden",
    points: response.verzonden === item.expected.verzonden ? 1 : 0,
    max: 1,
  });

  // (6) Priority — alleen indien verwacht
  if (item.expected.priorityHigh) {
    breakdown.push({
      criterion: "prioriteit",
      points: response.priorityHigh ? 1 : 0,
      max: 1,
    });
  }

  // (7) Aanhef + afsluiting (gecombineerd, alleen indien beide verwacht) — LJ3H only
  if (item.expected.greetingOptionId && item.expected.closingOptionId) {
    const greetingOk = response.greetingOptionId === item.expected.greetingOptionId;
    const closingOk = response.closingOptionId === item.expected.closingOptionId;
    const both = greetingOk && closingOk;
    breakdown.push({
      criterion: "aanhef+afsluiting",
      points: both ? 1 : 0,
      max: 1,
    });
  }

  return breakdown;
}

/*
 * TEST CASES voor scoreMailItem (Codex: schrijf deze in mail.spec.ts):
 *
 *  A) LJ1V item — alles correct → 4/4
 *  B) LJ1V item — verkeerde bijlage gekozen → 3/4
 *  C) LJ3V item — CC vergeten → 4/5
 *  D) LJ3H item — alles correct → 6/6
 *  E) LJ3H item — verkeerde aanhef, juiste afsluiting → 5/6 (combinatie = 0)
 *  F) LJ1H item — onderwerp dropdown verkeerde id → 3/4
 */

// =============================================================================
// 2. EXCEL — scoring (Fix 3b)
// =============================================================================

export type ExcelResponse = {
  /** Maps qId → invoer van leerling (string voor code-cellen, number/string voor formule). */
  answers: Record<string, string | number>;
};

export function scoreExcelItem(item: ExcelItem, response: ExcelResponse): ScoreBreakdown[] {
  const breakdown: ScoreBreakdown[] = [];

  for (const q of item.questions) {
    const raw = response.answers[q.qId];
    let points = 0;

    if (raw === undefined || raw === null || raw === "") {
      breakdown.push({ criterion: q.qId, points: 0, max: q.points });
      continue;
    }

    if (q.tolerance.numeric) {
      // Numeric-mode: parse en vergelijk met tolerantie
      const parsed = parseNumeric(String(raw));
      if (parsed !== null) {
        const expectedNum =
          typeof q.expected === "number" ? q.expected : parseNumeric(String(q.expected)) ?? NaN;
        if (!Number.isNaN(expectedNum)) {
          const delta = Math.abs(parsed - expectedNum);
          if (delta <= (q.tolerance.deltaAbs ?? 0)) {
            points = q.points;
          }
        }
      }
    } else {
      // String-mode: case + trim afhankelijk van tolerance
      let actual = String(raw);
      let expected = String(q.expected);
      if (q.tolerance.trim !== false) {
        actual = actual.trim();
        expected = expected.trim();
      }
      if (q.tolerance.case === "insensitive") {
        actual = actual.toLowerCase();
        expected = expected.toLowerCase();
      }
      if (actual === expected) {
        points = q.points;
      }
    }

    breakdown.push({ criterion: q.qId, points, max: q.points });
  }

  return breakdown;
}

/**
 * Parse "13450", "13.450", "13,450", "€ 13450", "13450,5" → number
 * Strip valuta-symbolen en spaties; herken zowel komma als punt als decimaal-
 * scheiding (heuristisch: laatste van de twee is de decimaal).
 */
export function parseNumeric(s: string): number | null {
  if (s === null || s === undefined) return null;
  let cleaned = String(s).trim();
  cleaned = cleaned.replace(/[€$£\s]/g, "");
  if (cleaned.length === 0) return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    // Beide aanwezig: laatste is decimaal
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    // Alleen komma — kan duizendtal of decimaal zijn; aanname: decimaal als 1-3 digits erna
    const afterComma = cleaned.length - lastComma - 1;
    if (afterComma === 3 && !cleaned.includes(".")) {
      // bv "13,450" — interpreteer als 13450 (duizendtal)
      cleaned = cleaned.replace(/,/g, "");
    } else {
      cleaned = cleaned.replace(",", ".");
    }
  } else if (lastDot > -1) {
    // Alleen punt — vergelijkbaar
    const afterDot = cleaned.length - lastDot - 1;
    if (afterDot === 3) {
      cleaned = cleaned.replace(/\./g, "");
    }
  }

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/*
 * TEST CASES voor parseNumeric (Codex: schrijf deze in excel.spec.ts):
 *
 *  parseNumeric("13450")       → 13450
 *  parseNumeric("13.450")      → 13450
 *  parseNumeric("13,450")      → 13450
 *  parseNumeric("13450,5")     → 13450.5
 *  parseNumeric("€ 13450")     → 13450
 *  parseNumeric("13.450,75")   → 13450.75
 *  parseNumeric("13,450.75")   → 13450.75
 *  parseNumeric("")            → null
 *  parseNumeric("abc")         → null
 *
 * TEST CASES voor scoreExcelItem (LJ3H formulevraag, expected=13450, deltaAbs=1):
 *
 *  q3 input "13450"     → 2/2
 *  q3 input "13.450"    → 2/2
 *  q3 input "€ 13450"   → 2/2
 *  q3 input "13449"     → 2/2 (binnen tolerantie)
 *  q3 input "13448"     → 0/2 (buiten tolerantie)
 *  q3 input ""          → 0/2
 *  q3 input "veertien"  → 0/2
 */

// =============================================================================
// 3. SOURCE EVALUATION — scoring (Fix 5b)
// =============================================================================

export type SourceEvalResponse = {
  /** Maps qId → string (dropdown gekozen id) of string[] (checkboxes geselecteerd). */
  answers: Record<string, string | string[]>;
};

export function scoreSourceEvaluationItem(
  item: SourceEvalItem,
  response: SourceEvalResponse,
): ScoreBreakdown[] {
  const breakdown: ScoreBreakdown[] = [];

  for (const q of item.questions) {
    const raw = response.answers[q.qId];
    let points = 0;

    if (q.type === "dropdown") {
      const correctId = q.options.find((o) => o.correct)?.id;
      if (typeof raw === "string" && raw === correctId) {
        points = q.points;
      }
      breakdown.push({ criterion: q.qId, points, max: q.points });
      continue;
    }

    if (q.type === "multi_checkbox") {
      if (!Array.isArray(raw)) {
        breakdown.push({ criterion: q.qId, points: 0, max: q.scoring.points });
        continue;
      }
      const selected = raw;
      const correctIds = q.options.filter((o) => o.correctAsSignal).map((o) => o.id);
      const distractorIds = q.options.filter((o) => o.distractor).map((o) => o.id);

      const correctSelected = selected.filter((id) => correctIds.includes(id)).length;
      const distractorSelected = selected.filter((id) => distractorIds.includes(id)).length;

      if (correctSelected >= q.scoring.minCorrect && distractorSelected <= q.scoring.maxDistractor) {
        points = q.scoring.points;
      }
      breakdown.push({ criterion: q.qId, points, max: q.scoring.points });
      continue;
    }
  }

  return breakdown;
}

/*
 * TEST CASES voor scoreSourceEvaluationItem (lj3v):
 *
 *  q1="A", q2=["datum","org"], q3="check"               → 3/3
 *  q1="A", q2=["datum","org","lang"], q3="check"        → 2/3 (q2 0pt: distractor)
 *  q1="B", q2=["datum","org"], q3="check"               → 2/3 (q1 0pt)
 *  q1="A", q2=["datum"], q3="check"                     → 2/3 (q2 0pt: <minCorrect)
 *  q1="A", q2=["datum","org","adv"], q3="wel"           → 2/3 (q3 0pt)
 *
 * TEST CASES voor lj3h q3 (let op: "toon" is geen distractor, "lang" wel):
 *
 *  q3=["org-meth","specific"]              → 1/1
 *  q3=["org-meth","specific","toon"]       → 1/1 (toon mag, geen straf)
 *  q3=["org-meth","specific","lang"]       → 0/1 (lang is harde distractor)
 *  q3=["org-meth"]                          → 0/1 (<minCorrect)
 */

// =============================================================================
// 4. PT7 BLOKPROGRAMMEREN — scoring (Fix 1)
// =============================================================================

export type BizzyState = {
  /** start- en eindcoördinaten van Bizzy op het werkvlak (in meters). */
  startX: number;
  startY: number;
  x: number;
  y: number;
  startHeading: number; // graden, 0 = rechts, 90 = onder
  heading: number;
  /** Laatste tekst die Bizzy heeft uitgesproken. */
  lastSpoken: string | null;
  /** Chronologische event-log voor positie-volgorde-checks. */
  events: Array<{ type: string; value?: string; tick: number }>;
};

/**
 * Het programma dat de leerling heeft gebouwd, als AST.
 * Codex: zorg dat de blokprogrammeer-component dit object exposed naast de
 * eindstate. Als de huidige component alleen een flat event-stream exposed,
 * voeg dan een serialize-helper toe die de AST reconstrueert.
 */
export type StudentProgram = BlockNode;

// ------- AST helpers ---------------------------------------------------------

export function findBlock(root: BlockNode | undefined, predicate: (n: BlockNode) => boolean): BlockNode | null {
  if (!root) return null;
  if (predicate(root)) return root;
  for (const c of root.children ?? []) {
    const hit = findBlock(c, predicate);
    if (hit) return hit;
  }
  return null;
}

export function blockMatches(node: BlockNode, expected: Partial<BlockNode>): boolean {
  if (expected.type && node.type !== expected.type) return false;
  if (expected.params) {
    for (const [k, v] of Object.entries(expected.params)) {
      if (node.params?.[k] !== v) return false;
    }
  }
  return true;
}

export function eventIndex(state: BizzyState, predicate: (e: BizzyState["events"][number]) => boolean): number {
  return state.events.findIndex(predicate);
}

// ------- Criteria per item ---------------------------------------------------

type Criterion = {
  description: string;
  check: (program: StudentProgram, state: BizzyState) => boolean;
  points: number;
};

const criteriaByItem: Record<string, Criterion[]> = {
  "pt7-lj1v": [
    {
      description: "Bizzy beweegt 1 meter vooruit",
      check: (p) => findBlock(p, (n) => blockMatches(n, { type: "verplaats", params: { afstand: 1 } })) !== null,
      points: 1,
    },
    {
      description: "Bizzy draait 180 graden",
      check: (p) => findBlock(p, (n) => blockMatches(n, { type: "draai", params: { hoek: 180 } })) !== null,
      points: 1,
    },
    {
      description: "Bizzy wacht 1 seconde voordat hij praat",
      check: (_p, s) => {
        const wacht = eventIndex(s, (e) => e.type === "wacht");
        const zeg = eventIndex(s, (e) => e.type === "zeg");
        return wacht !== -1 && zeg !== -1 && wacht < zeg;
      },
      points: 1,
    },
    {
      description: "Bizzy zegt 'Hoi!' na uitvoeren",
      check: (_p, s) => s.lastSpoken === "Hoi!",
      points: 1,
    },
  ],

  "pt7-lj1h": [
    {
      description: "Bizzy zegt 'Hoi!'",
      check: (_p, s) => s.lastSpoken === "Hoi!",
      points: 1,
    },
    {
      description: "Herhaal-3 met verplaats 1m genest",
      check: (p) => {
        const h = findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 3 } }));
        return !!h?.children?.some((c) => blockMatches(c, { type: "verplaats", params: { afstand: 1 } }));
      },
      points: 1,
    },
    {
      description: "Eindpositie ~3m vooruit",
      check: (_p, s) => Math.abs(s.x - s.startX - 3) < 0.1,
      points: 1,
    },
    {
      description: "Afleider herhaal-10 niet gebruikt",
      check: (p) => findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 10 } })) === null,
      points: 1,
    },
  ],

  "pt7-lj3v": [
    {
      description: "Herhaal-4 gebruikt",
      check: (p) => findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 4 } })) !== null,
      points: 1,
    },
    {
      description: "Verplaats 1m én draai 90 genest in herhaal-4",
      check: (p) => {
        const h = findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 4 } }));
        if (!h) return false;
        const hasV = h.children?.some((c) => blockMatches(c, { type: "verplaats", params: { afstand: 1 } }));
        const hasD = h.children?.some((c) => blockMatches(c, { type: "draai", params: { hoek: 90 } }));
        return !!(hasV && hasD);
      },
      points: 1,
    },
    {
      description: "Eindpositie = startpositie (vierkant gesloten)",
      check: (_p, s) => Math.abs(s.x - s.startX) < 0.1 && Math.abs(s.y - s.startY) < 0.1,
      points: 1,
    },
    {
      description: "Bizzy zegt 'Klaar!' ná uitvoeren",
      check: (_p, s) => s.lastSpoken === "Klaar!",
      points: 1,
    },
  ],

  "pt7-lj3h": [
    {
      description: "Herhaal-3 gebruikt",
      check: (p) => findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 3 } })) !== null,
      points: 1,
    },
    {
      description: "Vier blokken (2x verplaats 2m, 2x draai 180) in correcte volgorde binnen herhaal-3",
      check: (p) => {
        const h = findBlock(p, (n) => blockMatches(n, { type: "herhaal", params: { aantal: 3 } }));
        if (!h || !h.children || h.children.length !== 4) return false;
        const [c1, c2, c3, c4] = h.children;
        return (
          blockMatches(c1, { type: "verplaats", params: { afstand: 2 } }) &&
          blockMatches(c2, { type: "draai", params: { hoek: 180 } }) &&
          blockMatches(c3, { type: "verplaats", params: { afstand: 2 } }) &&
          blockMatches(c4, { type: "draai", params: { hoek: 180 } })
        );
      },
      points: 1,
    },
    {
      description: "Eindpositie = startpositie en applaus speelt ná de herhaal",
      check: (_p, s) => {
        const eindPos = Math.abs(s.x - s.startX) < 0.1 && Math.abs(s.y - s.startY) < 0.1;
        const applausIdx = eventIndex(s, (e) => e.type === "speel_geluid" && e.value === "applaus");
        const lastDraaiIdx = (() => {
          for (let i = s.events.length - 1; i >= 0; i--) {
            if (s.events[i].type === "draai") return i;
          }
          return -1;
        })();
        return eindPos && applausIdx > lastDraaiIdx;
      },
      points: 1,
    },
    {
      description: "Alleen verplaats 2m gebruikt (geen verplaats 1m)",
      check: (p) => findBlock(p, (n) => blockMatches(n, { type: "verplaats", params: { afstand: 1 } })) === null,
      points: 1,
    },
  ],
};

export function scorePT7Item(
  item: PT7Item,
  program: StudentProgram,
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

/*
 * TEST CASES voor scorePT7Item (Codex: schrijf in pt7.spec.ts):
 *
 *  LJ3V — correct vierkant (herhaal-4 met verplaats+draai 90, zegt Klaar!) → 4/4
 *  LJ3V — vier losse verplaats/draai zonder herhaal (uitgepakt)            → 2/4 (eindpositie OK + zeggen OK; structuur 0)
 *  LJ3V — herhaal-3 ipv herhaal-4                                          → 1/4 (alleen zeggen)
 *  LJ3V — geen zeggen-blok                                                 → 3/4
 *
 *  LJ3H — correct heen-en-weer (herhaal-3 met 4 nested blokken, applaus)   → 4/4
 *  LJ3H — verplaats 1m gebruikt ipv 2m                                     → 2/4 (structuur OK, parameter fout, eindpositie fout)
 *  LJ3H — applaus vóór herhaal                                             → 3/4
 *  LJ3H — herhaal-2 ipv herhaal-3                                          → 1/4
 *
 *  LJ1H — herhaal-10 (afleider) gebruikt                                   → 3/4
 *  LJ1V — wacht-blok ná zeg-blok ipv ervoor                                → 3/4
 */
