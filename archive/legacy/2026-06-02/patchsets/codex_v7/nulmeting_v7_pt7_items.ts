/**
 * NULMETING DG — v7 PT7 ITEM PAYLOAD
 * ===================================
 * Pure data-export van de vier PT7-Blokprogrammeren items voor versie 7.
 *
 * INSTRUCTIE VOOR CODEX:
 *  - Vervangt de v6 PT7-items in `src/data/assessments.ts`.
 *  - ItemIds blijven gelijk aan v6 (`lj1v-pt7-programming` etc.) zodat aggregaat-
 *    rapportages niet breken.
 *  - `criteriaSpec` is geupdate naar v7-waarden (`pt7-lj1v-v7` etc.).
 *  - Karakter: "Bizzy" (default in actor-dropdown; verifieer in `src/data/blocks.ts`).
 *  - Volg `CODEX_INSTRUCTIONS_PT7_v7.md` voor de operaties per versie.
 *  - Niet renderen vóór `nulmeting_v7_pt7_scoring_helpers.ts` is geïntegreerd —
 *    items zonder scoring-logica falen op runtime.
 *  - De `BlockNode` en `PT7Item` types blijven ongewijzigd t.o.v. v6; deze worden
 *    hieronder geherexporteerd voor self-containment maar verwijzen naar dezelfde
 *    canonical schema.
 */

// =============================================================================
// CANONICAL SCHEMAS (identiek aan v6; geherexporteerd voor self-containment)
// =============================================================================

export type BlockNode = {
  type: string;
  params?: Record<string, unknown>;
  children?: BlockNode[];
};

export type PT7Item = {
  itemId: string;
  type: "blokprogrammeer_simulatie";
  points: number;
  kdTags: string[];
  instructie: string;
  beschikbareBlokken: string[];
  correctProgram: BlockNode;
  criteriaSpec: string;
};

// =============================================================================
// LJ1V — `lj1v-pt7-programming` (kleine herziening vs. v6)
// =============================================================================
//
// Wijziging t.o.v. v6: `wacht 1 sec.` vervangen door `denkt "Klaar!"` als 4e
// actie. Scoring nu met expliciete blok-keuze-criteria (zeg vs denk, vooruit
// vs achteruit, 180° vs 90°) i.p.v. positionele wacht-vóór-zeg check.

export const lj1vPt7Programming: PT7Item = {
  itemId: "lj1v-pt7-programming",
  type: "blokprogrammeer_simulatie",
  points: 4,
  kdTags: ["KD22B"],
  instructie:
    "Programmeer Bizzy zo. Als er op afspelen wordt geklikt: Bizzy zegt \"Hoi!\", loopt 1 meter vooruit, draait naar 180°, en denkt tot slot \"Klaar!\".",
  beschikbareBlokken: [
    "wanneer_klik_afspelen",
    "wanneer_klik_bizzy",          // afleider
    "verander_animatie",           // neutraal — niet vereist, geen afleider
    "zeg_hoi",
    "denk_klaar",
    "verplaats_1m_vooruit",
    "verplaats_1m_achteruit",      // afleider
    "draai_180_graden",
    "draai_90_graden",             // afleider
    "wacht_1_sec",
    "herstart_scene",              // afleider
    "als_1_kleiner_2",             // afleider
  ],
  correctProgram: {
    type: "wanneer_klik_afspelen",
    children: [
      { type: "zeg", params: { tekst: "Hoi!" } },
      { type: "verplaats", params: { afstand: 1, richting: "vooruit" } },
      { type: "draai", params: { hoek: 180, draairichting: "mee" } },
      { type: "denk", params: { tekst: "Klaar!" } },
    ],
  },
  criteriaSpec: "pt7-lj1v-v7",
};

// =============================================================================
// LJ1H — `lj1h-pt7-programming` (kleine herziening vs. v6)
// =============================================================================
//
// Wijziging t.o.v. v6: opdracht-tekst aangescherpt naar "Klaar voor de start!";
// `draai 180°` toegevoegd als 4e actie ná de herhaal. Scoring met strikte
// nesting-check + anti-bypass via afleider `verplaats_3m_vooruit`.

export const lj1hPt7Programming: PT7Item = {
  itemId: "lj1h-pt7-programming",
  type: "blokprogrammeer_simulatie",
  points: 4,
  kdTags: ["KD22B"],
  instructie:
    "Programmeer Bizzy zo. Als er op afspelen wordt geklikt: Bizzy zegt \"Klaar voor de start!\", loopt drie keer 1 meter vooruit (gebruik een herhaal-blok), en draait naar 180°.",
  beschikbareBlokken: [
    "wanneer_klik_afspelen",
    "verander_animatie",           // neutraal
    "zeg_klaar_voor_de_start",
    "denk_hm",                     // afleider
    "verplaats_1m_vooruit",
    "verplaats_3m_vooruit",        // afleider — schijnoplossing zonder iteratie
    "verplaats_1m_achteruit",      // afleider
    "draai_180_graden",
    "draai_90_graden",             // afleider
    "herhaal_3_keer",
    "herhaal_10_keer",             // afleider
    "herhaal_1_keer",              // afleider
    "wacht_1_sec",
    "als_1_kleiner_2",             // afleider
    "herstart_scene",              // afleider
  ],
  correctProgram: {
    type: "wanneer_klik_afspelen",
    children: [
      { type: "zeg", params: { tekst: "Klaar voor de start!" } },
      {
        type: "herhaal",
        params: { aantal: 3 },
        children: [
          { type: "verplaats", params: { afstand: 1, richting: "vooruit" } },
        ],
      },
      { type: "draai", params: { hoek: 180, draairichting: "mee" } },
    ],
  },
  criteriaSpec: "pt7-lj1h-v7",
};

// =============================================================================
// LJ3V — `lj3v-pt7-programming` (inhoudelijke aanpassing vs. v6)
// =============================================================================
//
// Wijziging t.o.v. v6: vervang afsluitend `zegt "Klaar!"` door `denkt "Klaar!"`
// (zeg/denk-discriminatie toegevoegd). Begin met `zegt "Start!"`. Scoring met
// strikte volgorde-eis op body [verp 1m vooruit, draai 90°] + oriëntatie-check.

export const lj3vPt7Programming: PT7Item = {
  itemId: "lj3v-pt7-programming",
  type: "blokprogrammeer_simulatie",
  points: 4,
  kdTags: ["KD22B"],
  instructie:
    "Bizzy loopt een vierkant op het werkvlak. Elke zijde is 1 meter; op elke hoek draait Bizzy een kwartslag (90°). Bizzy zegt vóór het lopen \"Start!\" en denkt na het lopen \"Klaar!\".",
  beschikbareBlokken: [
    "wanneer_klik_afspelen",
    "verander_animatie",           // neutraal
    "zeg_start",
    "denk_klaar",
    "zeg_klaar",                   // afleider — wisselt zeg/denk
    "verplaats_1m_vooruit",
    "verplaats_1m_achteruit",      // afleider
    "draai_90_graden",
    "draai_180_graden",            // afleider — verkeerde hoek
    "herhaal_4_keer",
    "herhaal_3_keer",              // afleider
    "herhaal_2_keer",              // afleider
    "wacht_1_sec",
    "als_1_kleiner_2",             // afleider
    "herstart_scene",              // afleider
  ],
  correctProgram: {
    type: "wanneer_klik_afspelen",
    children: [
      { type: "zeg", params: { tekst: "Start!" } },
      {
        type: "herhaal",
        params: { aantal: 4 },
        children: [
          { type: "verplaats", params: { afstand: 1, richting: "vooruit" } },
          { type: "draai", params: { hoek: 90, draairichting: "mee" } },
        ],
      },
      { type: "denk", params: { tekst: "Klaar!" } },
    ],
  },
  criteriaSpec: "pt7-lj3v-v7",
};

// =============================================================================
// LJ3H — `lj3h-pt7-programming` (inhoudelijke aanpassing vs. v6)
// =============================================================================
//
// Wijziging t.o.v. v6: strikte volgorde-eis op body
// [verp 2m, draai 180°, verp 2m, draai 180°] gehandhaafd (sequentie is bij
// programmeren betekenisdragend). Oriëntatie-check toegevoegd. "Bravo!" moet
// ná de herhaal; herhaal-blok is verplicht voor criterium 3.

export const lj3hPt7Programming: PT7Item = {
  itemId: "lj3h-pt7-programming",
  type: "blokprogrammeer_simulatie",
  points: 4,
  kdTags: ["KD22B"],
  instructie:
    "Bizzy danst een choreografie. Drie keer maakt hij hetzelfde heen-en-weer-rondje: 2 meter vooruit, omdraaien (180°), 2 meter vooruit (= terug), opnieuw omdraaien (180°). Aan het eind zegt hij \"Bravo!\".",
  beschikbareBlokken: [
    "wanneer_klik_afspelen",
    "verander_animatie",           // neutraal
    "zeg_bravo",
    "denk_bravo",                  // afleider
    "verplaats_2m_vooruit",
    "verplaats_1m_vooruit",        // afleider — parameter-fout
    "verplaats_2m_achteruit",      // afleider
    "draai_180_graden",
    "draai_90_graden",             // afleider
    "herhaal_3_keer",
    "herhaal_6_keer",              // afleider — uitgepakte iteratie
    "herhaal_2_keer",              // afleider
    "wacht_1_sec",
    "als_1_kleiner_2",             // afleider
    "herstart_scene",              // afleider
  ],
  correctProgram: {
    type: "wanneer_klik_afspelen",
    children: [
      {
        type: "herhaal",
        params: { aantal: 3 },
        children: [
          { type: "verplaats", params: { afstand: 2, richting: "vooruit" } },
          { type: "draai", params: { hoek: 180, draairichting: "mee" } },
          { type: "verplaats", params: { afstand: 2, richting: "vooruit" } },
          { type: "draai", params: { hoek: 180, draairichting: "mee" } },
        ],
      },
      { type: "zeg", params: { tekst: "Bravo!" } },
    ],
  },
  criteriaSpec: "pt7-lj3h-v7",
};

// =============================================================================
// COMPOSITION: items per versie
// =============================================================================

export type VersionId = "lj1-vmbo" | "lj1-hv" | "lj3-vmbo" | "lj3-hv";

/** Mapping naar de versie-arrays in `assessments.ts`. Codex: deze items
 *  vervangen 1-op-1 de bestaande PT7-items met dezelfde itemId. */
export const v7Pt7ItemsByVersion: Record<VersionId, PT7Item> = {
  "lj1-vmbo": lj1vPt7Programming,
  "lj1-hv":   lj1hPt7Programming,
  "lj3-vmbo": lj3vPt7Programming,
  "lj3-hv":   lj3hPt7Programming,
};
