/**
 * NULMETING DG — v6 ITEM PAYLOAD
 * ===============================
 * Pure data-export van alle nieuwe en gewijzigde items voor versie 6 van de nulmeting.
 *
 * INSTRUCTIE VOOR CODEX:
 *  - Dit bestand definieert items in een *canonical schema* (zie types onderaan).
 *  - Map de canonical types naar de werkelijke types in `src/data/assessments.ts`.
 *  - De field-namen volgen de bestaande spec-conventie (`huidige_vragenlijsten_specificatie.md`)
 *    waar mogelijk. Waar nieuwe velden nodig zijn (anchor, subjectMode, greetingDropdown,
 *    priorityToggle, snippets, hasImageRequiringReverseSearch, correctProgram, criteria),
 *    voeg deze toe aan de werkelijke types in `assessments.ts`.
 *  - VOLG `CODEX_PR_PLAN_v6.md` voor de add/remove/update operaties per versie.
 *  - Niet renderen vóór de scoring-helpers in `nulmeting_v6_scoring_helpers.ts` zijn
 *    geïntegreerd, of items zullen er zijn zonder scoring-logica.
 */

// =============================================================================
// CANONICAL SCHEMAS
// =============================================================================

export type Option = { id: string; text: string; correct?: boolean };

export type SrItem = {
  itemId: string;
  type: "selected_response";
  kdTags: string[];
  points: number;
  question: string;
  options: Option[];
  unknownOption?: boolean;
  anchor?: boolean;
};

export type MailExpected = {
  aan: string[];
  cc?: string[];
  /** Voor freetext-onderwerp: exacte match na case-insensitive trim */
  onderwerp?: string;
  /** Voor dropdown-onderwerp: de id van de correcte subjectOption */
  subjectOptionId?: string;
  bijlage: string[];
  verzonden: boolean;
  priorityHigh?: boolean;
  greetingOptionId?: string;
  closingOptionId?: string;
};

export type MailItem = {
  itemId: string;
  type: "outlook_mail_simulation";
  points: number;
  kdTags: string[];
  scenario?: string;
  contacten: string[];
  bestanden: string[];
  subjectMode: "freeText" | "dropdown";
  subjectOptions?: Option[];           // alleen bij subjectMode === "dropdown"
  greetingDropdown?: Option[];         // alleen LJ3H of expliciet aangezet
  closingDropdown?: Option[];          // idem
  priorityToggle?: boolean;            // toon prioriteit-checkbox (alleen LJ3H)
  expected: MailExpected;
};

export type ExcelQuestion = {
  qId: string;
  prompt: string;
  /** "user_input_qN" voor code-typing in een dedicated antwoordveld;
   *  echte celreferentie zoals "H2" voor in-cell formule-uitkomst */
  answerCell: string;
  expected: string | number;
  points: number;
  tolerance: {
    case?: "insensitive" | "sensitive";
    trim?: boolean;
    numeric?: boolean;
    deltaAbs?: number;
  };
};

export type ExcelItem = {
  itemId: string;
  type: "excel_simulation";
  points: number;
  kdTags: string[];
  file: string;
  sheet: string;
  questions: ExcelQuestion[];
};

export type Snippet = {
  id: string;
  title: string;
  meta: string;
  body: string;
  isReliable: boolean;
  hasImageRequiringReverseSearch?: boolean;
};

export type SourceEvalQuestion =
  | {
      qId: string;
      type: "dropdown";
      prompt: string;
      options: Option[];
      points: number;
    }
  | {
      qId: string;
      type: "multi_checkbox";
      prompt: string;
      options: Array<Option & { correctAsSignal?: boolean; distractor?: boolean }>;
      scoring: { minCorrect: number; maxDistractor: number; points: number };
    };

export type SourceEvalItem = {
  itemId: string;
  type: "source_evaluation";
  points: number;
  kdTags: string[];
  intro: string;
  snippets: Snippet[];
  questions: SourceEvalQuestion[];
};

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
  criteriaSpec: string;            // ID van scoring-criteria-set in scoring helpers
};

// =============================================================================
// FIX 2 — ANKER-ITEMS (strikt identiek over alle 4 versies)
// =============================================================================

export const ankerSrWachtwoord: SrItem = {
  itemId: "anker-sr-wachtwoord",
  type: "selected_response",
  anchor: true,
  kdTags: ["KD23A"],
  points: 1,
  question: "Welk wachtwoord is het veiligst?",
  options: [
    { id: "a", text: "BlauweTreinLampSchoolTas", correct: true },
    { id: "b", text: "Welkom2026!" },
    { id: "c", text: "Fietsbel" },
    { id: "d", text: "Qwerty!23" },
  ],
  unknownOption: true,
};

export const ankerSrAiHallucinatie: SrItem = {
  itemId: "anker-sr-ai-hallucinatie",
  type: "selected_response",
  anchor: true,
  kdTags: ["KD21D"],
  points: 1,
  question:
    "Een AI-chatbot noemt een wetenschappelijk artikel met titel en auteurs. Je vindt het artikel niet in zoekmachines of databases. Wat is het meest waarschijnlijk?",
  options: [
    { id: "a", text: "De AI heeft het artikel waarschijnlijk verzonnen.", correct: true },
    { id: "b", text: "Het artikel staat misschien in een tijdschrift dat niet door zoekmachines wordt geïndexeerd." },
    { id: "c", text: "Je zoekt misschien op de verkeerde manier." },
    { id: "d", text: "Het artikel is mogelijk nog niet gepubliceerd." },
  ],
  unknownOption: true,
};

export const ankerSrAuteursrechtFoto: SrItem = {
  itemId: "anker-sr-auteursrecht-foto",
  type: "selected_response",
  anchor: true,
  kdTags: ["KD22A"],
  points: 1,
  question: "Je gebruikt een foto van internet in je werkstuk. Wat moet je doen?",
  options: [
    { id: "a", text: "Kijken of je de foto mag gebruiken en de maker erbij zetten.", correct: true },
    { id: "b", text: "De foto kopiëren; op internet is alles vrij." },
    { id: "c", text: "De foto verkleinen of bewerken, dan is hij van jou." },
    { id: "d", text: "De foto alleen gebruiken als hij niet bekend is." },
  ],
  unknownOption: true,
};

export const ankerSrBronbeoordelingKlimaat: SrItem = {
  itemId: "anker-sr-bronbeoordeling-klimaat",
  type: "selected_response",
  anchor: true,
  kdTags: ["KD21B"],
  points: 1,
  question: "Welke bron is het meest betrouwbaar voor een werkstuk over klimaatverandering?",
  options: [
    { id: "a", text: "Een artikel van het KNMI met datum en auteur.", correct: true },
    { id: "b", text: "Een viral TikTok van een influencer met veel volgers." },
    { id: "c", text: "Een meme met cijfers." },
    { id: "d", text: "Een blog zonder auteursnaam met sterke meningen." },
  ],
  unknownOption: true,
};

// =============================================================================
// FIX 4 — TWEEDE AUTEURSRECHT-ITEM PER VERSIE
// =============================================================================

export const lj1vSrCopyright2: SrItem = {
  itemId: "lj1v-sr-cr2-gebruik",
  type: "selected_response",
  kdTags: ["KD22A"],
  points: 1,
  question:
    "Op een website staat onder een afbeelding: “Deze afbeelding mag je vrij gebruiken, maar noem de maker erbij.” Wat mag je dan doen?",
  options: [
    { id: "a", text: "De afbeelding gebruiken in je werkstuk en de maker erbij zetten.", correct: true },
    { id: "b", text: "De afbeelding niet gebruiken." },
    { id: "c", text: "De afbeelding gebruiken zonder maker erbij, het mag toch." },
    { id: "d", text: "De afbeelding alleen gebruiken als je hem eerst aan de maker laat zien." },
  ],
  unknownOption: true,
};

// LJ1H: bestaande `lj1h-sr9-cc` blijft als tweede item (geen nieuwe export nodig).
// VERIFIEER alleen dat dit item nog in `lj1-hv` zit.

export const lj3vSrCopyrightBync: SrItem = {
  itemId: "lj3v-sr-cr2-bync",
  type: "selected_response",
  kdTags: ["KD22A"],
  points: 1,
  question: "Een foto heeft de aanduiding “CC BY-NC”. Wat betekent dat?",
  options: [
    {
      id: "a",
      text: "Je mag de foto gebruiken en moet de maker noemen, maar niet voor commerciële doelen.",
      correct: true,
    },
    { id: "b", text: "Je mag de foto alleen voor commerciële doelen gebruiken." },
    { id: "c", text: "NC betekent No Credit — je hoeft de maker niet te noemen." },
    { id: "d", text: "De foto mag alleen in Nederland worden gebruikt." },
  ],
  unknownOption: true,
};

/** Vervangt huidige `lj3h-sr5-cc-sa` met sterkere afleiders. */
export const lj3hSrCopyrightBySa: SrItem = {
  itemId: "lj3h-sr5-cc-sa",
  type: "selected_response",
  kdTags: ["KD22A"],
  points: 1,
  question: "Wat betekent het als content een Creative Commons BY-SA-licentie heeft?",
  options: [
    { id: "a", text: "Je noemt de maker en deelt jouw versie onder dezelfde licentie.", correct: true },
    { id: "b", text: "Je noemt de maker." },
    { id: "c", text: "Je mag het alleen voor niet-commerciële doeleinden gebruiken." },
    { id: "d", text: "Je mag het alleen ongewijzigd delen." },
  ],
  unknownOption: true,
};

// =============================================================================
// FIX 5a — MEDIAWIJSHEID SR-ITEMS VOOR LJ3
// =============================================================================
//
// Twee items, beide in lj3-vmbo én lj3-hv. Inhoud identiek; itemId krijgt
// versie-prefix om duplicate-id-conflicten te voorkomen.

export function srSponsored(versie: "lj3v" | "lj3h"): SrItem {
  return {
    itemId: `${versie}-sr-sponsored`,
    type: "selected_response",
    kdTags: ["KD21B"],
    points: 1,
    question:
      "Een YouTuber maakt een filmpje over de nieuwste telefoon en zegt dat het zijn favoriete is. Onderaan de beschrijving staat “betaalde samenwerking met [merknaam]”. Wat betekent dat?",
    options: [
      { id: "a", text: "De YouTuber is betaald om positief over deze telefoon te zijn.", correct: true },
      { id: "b", text: "De YouTuber heeft de telefoon zelf gekocht en geeft een eerlijk oordeel." },
      { id: "c", text: "Het maakt niets uit voor de beoordeling, de YouTuber kan nog steeds eerlijk zijn." },
      { id: "d", text: "De YouTuber krijgt alleen geld als kijkers de telefoon kopen." },
    ],
    unknownOption: true,
  };
}

export function srAdsRanking(versie: "lj3v" | "lj3h"): SrItem {
  return {
    itemId: `${versie}-sr-ads-ranking`,
    type: "selected_response",
    kdTags: ["KD21B"],
    points: 1,
    question:
      "Je zoekt op Google op “beste laptop voor school”. Bovenaan de resultaten staat een resultaat met het label “Advertentie” of “Sponsored”. Wat betekent dat?",
    options: [
      { id: "a", text: "Iemand heeft betaald om dat resultaat bovenaan te krijgen.", correct: true },
      { id: "b", text: "Het is het meest betrouwbare resultaat volgens Google." },
      { id: "c", text: "Het resultaat is het meest gelezen door anderen." },
      { id: "d", text: "Google heeft het zelf geschreven." },
    ],
    unknownOption: true,
  };
}

// =============================================================================
// FIX 3a — MAIL-TAKEN MET DROPDOWNS
// =============================================================================

/** Ongewijzigd in inhoud — alleen hier ter referentie voor scoring-mapping. */
export const lj1vPt2Mail: MailItem = {
  itemId: "lj1v-pt2-mail",
  type: "outlook_mail_simulation",
  points: 4,
  kdTags: ["KD21A", "KD23B"],
  contacten: ["mentor@school.nl", "vriend@school.nl", "klasgroep@school.nl", "administratie@school.nl"],
  bestanden: ["Verslag_Nederlands.docx", "Foto_vakantie.jpg", "Rooster.pdf", "Muziek.mp3"],
  subjectMode: "freeText",
  expected: {
    aan: ["mentor@school.nl"],
    onderwerp: "Verslag Nederlands",
    bijlage: ["Verslag_Nederlands.docx"],
    verzonden: true,
  },
};

export const lj1hPt2Mail: MailItem = {
  itemId: "lj1h-pt2-mail",
  type: "outlook_mail_simulation",
  points: 4,
  kdTags: ["KD21A", "KD23B"],
  contacten: ["mentor@school.nl", "vriend@school.nl", "klasgroep@school.nl", "administratie@school.nl"],
  bestanden: ["Verslag_Nederlands.docx", "Foto_vakantie.jpg", "Rooster.pdf", "Muziek.mp3"],
  subjectMode: "dropdown",
  subjectOptions: [
    { id: "subj-a", text: "Verslag" },
    { id: "subj-b", text: "Verslag Nederlands", correct: true },
    { id: "subj-c", text: "RE: opdracht voor jullie" },
  ],
  expected: {
    aan: ["mentor@school.nl"],
    subjectOptionId: "subj-b",
    bijlage: ["Verslag_Nederlands.docx"],
    verzonden: true,
  },
};

export const lj3vPt2Mail: MailItem = {
  itemId: "lj3v-pt2-mail",
  type: "outlook_mail_simulation",
  points: 5,
  kdTags: ["KD21A", "KD23B"],
  scenario: "Stuur een mail naar je mentor over je stageverslag. Zet je begeleider in CC.",
  contacten: ["mentor@school.nl", "begeleider@stagebedrijf.nl", "klasgroep@school.nl", "vriend@school.nl"],
  bestanden: ["Stageverslag.docx", "Foto_stage.jpg", "Rooster.pdf", "Notities.txt"],
  subjectMode: "dropdown",
  subjectOptions: [
    { id: "subj-a", text: "Stage" },
    { id: "subj-b", text: "Stageverslag week 6", correct: true },
    { id: "subj-c", text: "Hoi" },
  ],
  expected: {
    aan: ["mentor@school.nl"],
    cc: ["begeleider@stagebedrijf.nl"],
    subjectOptionId: "subj-b",
    bijlage: ["Stageverslag.docx"],
    verzonden: true,
  },
};

export const lj3hPt2Mail: MailItem = {
  itemId: "lj3h-pt2-mail",
  type: "outlook_mail_simulation",
  points: 6,
  kdTags: ["KD21A", "KD23B"],
  scenario:
    "Stuur een mail naar je mentor over je onderzoeksverslag. Zet je projectgroep in CC. Markeer met hoge prioriteit. Kies een passende aanhef en afsluiting.",
  contacten: ["mentor@school.nl", "projectgroep@school.nl", "klasgroep@school.nl", "administratie@school.nl"],
  bestanden: [
    "Onderzoeksverslag_mediawijsheid.docx",
    "Bronnenlijst.xlsx",
    "Foto_vakantie.jpg",
    "Rooster.pdf",
  ],
  subjectMode: "freeText",
  priorityToggle: true,
  greetingDropdown: [
    { id: "gr-a", text: "Beste meneer/mevrouw [naam]", correct: true },
    { id: "gr-b", text: "Hoi!" },
    { id: "gr-c", text: "Geachte heer/mevrouw, ik wil u hierbij berichten dat" },
  ],
  closingDropdown: [
    { id: "cl-a", text: "Met vriendelijke groet, [naam]", correct: true },
    { id: "cl-b", text: "Groetjes" },
    { id: "cl-c", text: "Cheers!" },
  ],
  expected: {
    aan: ["mentor@school.nl"],
    cc: ["projectgroep@school.nl"],
    onderwerp: "Onderzoeksverslag mediawijsheid",
    bijlage: ["Onderzoeksverslag_mediawijsheid.docx"],
    verzonden: true,
    priorityHigh: true,
    greetingOptionId: "gr-a",
    closingOptionId: "cl-a",
  },
};

// =============================================================================
// FIX 3b — EXCEL LJ3H FORMULEVRAAG
// =============================================================================

/**
 * BELANGRIJK voor Codex:
 * - Open `LJ3_HV_OpenData.xlsx` (frontend/public/assets/ of vergelijkbaar).
 * - Voeg op sheet `Energie` toe:
 *      F2: tekst "Tip: gebruik SOM.ALS om totale Kosten voor Woningtype A te berekenen.
 *           Typ alleen de uitkomst in cel H2."
 *      H2: leeg (leerling vult in)
 * - Bereken SOM.ALS(B:B; "A"; D:D) (waar B = Woningtype, D = Kosten).
 * - Vervang `expected.q3` hieronder met de werkelijke uitkomst.
 * - Verifieer het kolomschema; pas de tip-tekst aan als kolomnamen anders zijn.
 */
export const lj3hPt4Excel: ExcelItem = {
  itemId: "lj3h-pt4-excel",
  type: "excel_simulation",
  points: 6,
  kdTags: ["KD21C"],
  file: "LJ3_HV_OpenData.xlsx",
  sheet: "Energie",
  questions: [
    {
      qId: "q1",
      prompt: "Filter op Kosten > 500. Sorteer daarna op Kosten, van hoog naar laag. Welke code staat bovenaan?",
      answerCell: "user_input_q1",
      expected: "E13",
      points: 2,
      tolerance: { case: "insensitive", trim: true },
    },
    {
      qId: "q2",
      prompt:
        "Filter op Woningtype = B. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
      answerCell: "user_input_q2",
      expected: "E02",
      points: 2,
      tolerance: { case: "insensitive", trim: true },
    },
    {
      qId: "q3",
      prompt:
        "Gebruik een formule om de totale Kosten te berekenen van alle huishoudens met Woningtype = A. Typ de uitkomst in cel H2.",
      answerCell: "H2",
      expected: 0, // ⚠️ VERVANG MET SOM.ALS-UITKOMST UIT HET BESTAND
      points: 2,
      tolerance: { numeric: true, deltaAbs: 1 },
    },
  ],
};

// =============================================================================
// FIX 5b — PT BRONBEOORDELING
// =============================================================================

export const lj3vPt5Bronbeoordeling: SourceEvalItem = {
  itemId: "lj3v-pt5-bronbeoordeling",
  type: "source_evaluation",
  points: 3,
  kdTags: ["KD21B"],
  intro:
    "Hieronder staan twee korte teksten over de vraag: hoeveel uur slaap heeft een tiener nodig? Lees beide en beantwoord de vragen.",
  snippets: [
    {
      id: "A",
      title: "Slaap bij tieners",
      meta: "NJI.nl, 12 maart 2025, door dr. R. de Vries (kinderarts)",
      body:
        "Onderzoek laat zien dat tieners tussen 8 en 10 uur slaap per nacht nodig hebben. Te weinig slaap heeft gevolgen voor concentratie en stemming. Het Nederlands Jeugdinstituut adviseert ouders en scholen om hier rekening mee te houden bij schooltijden en bedtijden.",
      isReliable: true,
    },
    {
      id: "B",
      title: "Beste slaaptips!",
      meta: "SlaapWonder.com — beste slaaptips!",
      body:
        "Tieners hebben minstens 12 uur slaap nodig om gezond te blijven. Slaap minder en je hersenen krimpen. Koop ons matras om gegarandeerd beter te slapen.",
      isReliable: false,
    },
  ],
  questions: [
    {
      qId: "q1",
      type: "dropdown",
      prompt: "Welke snippet is het meest betrouwbaar?",
      options: [
        { id: "A", text: "Snippet A", correct: true },
        { id: "B", text: "Snippet B" },
        { id: "both", text: "Beide even betrouwbaar" },
      ],
      points: 1,
    },
    {
      qId: "q2",
      type: "multi_checkbox",
      prompt: "Welke signalen heb je daarbij gebruikt?",
      options: [
        { id: "datum", text: "Datum en auteur staan erbij", correctAsSignal: true },
        { id: "org", text: "Bron is gekoppeld aan een organisatie", correctAsSignal: true },
        { id: "adv", text: "De snippet bevat advertentie of verkoopdoel", correctAsSignal: true },
        { id: "lang", text: "Snippet is langer", distractor: true },
        { id: "titel", text: "Snippet heeft een aantrekkelijke titel", distractor: true },
      ],
      scoring: { minCorrect: 2, maxDistractor: 0, points: 1 },
    },
    {
      qId: "q3",
      type: "dropdown",
      prompt: "Wat zou je doen met Snippet B?",
      options: [
        { id: "niet", text: "Helemaal niet gebruiken" },
        { id: "check", text: "Alleen gebruiken na controle in een betrouwbare bron", correct: true },
        { id: "wel", text: "Wel gebruiken; alle bronnen zijn nuttig" },
      ],
      points: 1,
    },
  ],
};

export const lj3hPt5Bronbeoordeling: SourceEvalItem = {
  itemId: "lj3h-pt5-bronbeoordeling",
  type: "source_evaluation",
  points: 3,
  kdTags: ["KD21B", "KD21D"],
  intro:
    "Hieronder staan drie korte teksten over de vraag: hoeveel CO₂ stoot een gemiddelde Nederlander uit? Lees ze en beantwoord de vragen.",
  snippets: [
    {
      id: "A",
      title: "CO₂-uitstoot per huishouden, 2024",
      meta: "CBS, gepubliceerd 14 oktober 2024, methodologie: jaarrekening huishoudens",
      body:
        "Een gemiddeld Nederlands huishouden stootte in 2024 circa 18,5 ton CO₂-equivalent uit, voornamelijk via wonen, mobiliteit en voeding. CBS gebruikt hiervoor data van energieleveranciers, het CBS Mobiliteitspanel en NEVO voedingsdata.",
      isReliable: true,
    },
    {
      id: "B",
      title: "Wij stoten te veel uit",
      meta: "Klimaatblog NL, 3 januari 2025, opiniestuk",
      body:
        "Het is duidelijk dat de gemiddelde Nederlander veel meer uitstoot dan de wereldgemiddelde burger. We moeten allemaal minder gaan vliegen en eten. De cijfers liegen niet.",
      isReliable: false,
    },
    {
      id: "C",
      title: "Smog over Amsterdam — schokkende foto",
      meta: "Instagram-post, anoniem account, januari 2025",
      body:
        "Foto: zware smog hangt over de Amsterdamse skyline; gebouwen zijn nauwelijks zichtbaar. Bijschrift: “Dit is wat we elke dag inademen. DEEL DIT.” De foto ziet er fotorealistisch uit maar lijkt op AI-output.",
      hasImageRequiringReverseSearch: true,
      isReliable: false,
    },
  ],
  questions: [
    {
      qId: "q1",
      type: "dropdown",
      prompt: "Welke snippet zou je gebruiken voor een werkstuk?",
      options: [
        { id: "A", text: "Snippet A", correct: true },
        { id: "B", text: "Snippet B" },
        { id: "C", text: "Snippet C" },
        { id: "mix", text: "Een combinatie van meerdere" },
      ],
      points: 1,
    },
    {
      qId: "q2",
      type: "dropdown",
      prompt: "Bij Snippet C — wat is een sterke methode om de afbeelding te controleren?",
      options: [
        { id: "rev", text: "Reverse image search via Google Images of TinEye", correct: true },
        { id: "ai", text: "Vragen aan ChatGPT of het echt is" },
        { id: "zoom", text: "De afbeelding vergroten om beter te kunnen kijken" },
        { id: "likes", text: "Kijken hoeveel likes de post heeft" },
      ],
      points: 1,
    },
    {
      qId: "q3",
      type: "multi_checkbox",
      prompt: "Welke kenmerken maken Snippet A betrouwbaarder dan Snippet B?",
      options: [
        { id: "org-meth", text: "Snippet A noemt een organisatie en methodologie", correctAsSignal: true },
        { id: "specific", text: "Snippet A heeft een specifiek getal met context", correctAsSignal: true },
        { id: "opinie-b", text: "Snippet B heeft een opinie-component", correctAsSignal: true },
        { id: "lang", text: "Snippet A is langer", distractor: true },
        { id: "toon", text: "Snippet A heeft een professionele toon" }, // zwak signaal, geen straf
      ],
      scoring: { minCorrect: 2, maxDistractor: 0, points: 1 },
    },
  ],
};

// =============================================================================
// FIX 1 — PT7 BLOKPROGRAMMEREN (niveau-progressie + anti-bypass)
// =============================================================================

/** Inhoud ongewijzigd; alleen criteriaSpec linkt naar uitgebreide scoring. */
export const lj1vPt7Programming: PT7Item = {
  itemId: "lj1v-pt7-programming",
  type: "blokprogrammeer_simulatie",
  points: 4,
  kdTags: ["KD22B"],
  instructie:
    "Programmeer Bizzy zo: laat Bizzy 1 meter vooruit bewegen, draai 180 graden, en zeg na 1 seconde Hoi!.",
  beschikbareBlokken: [
    "wanneer_klik_afspelen",
    "wanneer_klik_bizzy",
    "verander_animatie",
    "zeg_hoi",
    "verplaats_1m_vooruit",
    "draai_180_graden",
    "herhaal_1_keer",
    "speel_geluid_applaus",
    "wacht_1_sec",
    "zet_score_0",
    "verplaats_5m_achteruit",
  ],
  correctProgram: {
    type: "wanneer_klik_afspelen",
    children: [
      { type: "verplaats", params: { afstand: 1 } },
      { type: "draai", params: { hoek: 180 } },
      { type: "wacht", params: { sec: 1 } },
      { type: "zeg", params: { tekst: "Hoi!" } },
    ],
  },
  criteriaSpec: "pt7-lj1v",
};

/** Inhoud ongewijzigd; scoring uitgebreid met anti-bypass. */
export const lj1hPt7Programming: PT7Item = {
  itemId: "lj1h-pt7-programming",
  type: "blokprogrammeer_simulatie",
  points: 4,
  kdTags: ["KD22B"],
  instructie:
    "Programmeer Bizzy zo: laat Bizzy 'Hoi!' zeggen en daarna drie keer 1 meter vooruit bewegen.",
  beschikbareBlokken: [
    "wanneer_klik_afspelen",
    "verander_animatie",
    "zeg_hoi",
    "verplaats_1m_vooruit",
    "draai_180_graden",
    "herhaal_1_keer",
    "herhaal_10_keer",
    "speel_geluid_applaus",
    "wacht_1_sec",
    "stop_alles",
  ],
  correctProgram: {
    type: "wanneer_klik_afspelen",
    children: [
      { type: "zeg", params: { tekst: "Hoi!" } },
      {
        type: "herhaal",
        params: { aantal: 3 },
        children: [{ type: "verplaats", params: { afstand: 1 } }],
      },
    ],
  },
  criteriaSpec: "pt7-lj1h",
};

/** NIEUWE CONTENT — vervangt huidige lj3v PT7. */
export const lj3vPt7Programming: PT7Item = {
  itemId: "lj3v-pt7-programming",
  type: "blokprogrammeer_simulatie",
  points: 4,
  kdTags: ["KD22B"],
  instructie:
    "Laat Bizzy een vierkant lopen. Bizzy moet vier keer 1 meter vooruit en steeds 90 graden draaien. Laat Bizzy daarna 'Klaar!' zeggen.",
  beschikbareBlokken: [
    "wanneer_klik_afspelen",
    "verplaats_1m_vooruit",
    "draai_90_graden",
    "draai_180_graden",
    "herhaal_4_keer",
    "herhaal_3_keer",
    "wacht_1_sec",
    "speel_geluid_applaus",
    "zeg_klaar",
  ],
  correctProgram: {
    type: "wanneer_klik_afspelen",
    children: [
      {
        type: "herhaal",
        params: { aantal: 4 },
        children: [
          { type: "verplaats", params: { afstand: 1 } },
          { type: "draai", params: { hoek: 90 } },
        ],
      },
      { type: "zeg", params: { tekst: "Klaar!" } },
    ],
  },
  criteriaSpec: "pt7-lj3v",
};

/** NIEUWE CONTENT — vervangt huidige lj3h PT7. */
export const lj3hPt7Programming: PT7Item = {
  itemId: "lj3h-pt7-programming",
  type: "blokprogrammeer_simulatie",
  points: 4,
  kdTags: ["KD22B"],
  instructie:
    "Laat Bizzy drie keer naar voren gaan en weer terug. Elk rondje is: 2 meter vooruit, omdraaien, 2 meter terug, weer omdraaien. Speel daarna het applausgeluid.",
  beschikbareBlokken: [
    "wanneer_klik_afspelen",
    "verplaats_2m_vooruit",
    "verplaats_1m_vooruit", // afleider
    "draai_180_graden",
    "herhaal_3_keer",
    "herhaal_2_keer",
    "speel_geluid_applaus",
    "wacht_1_sec",
    "zeg_hoi",
  ],
  correctProgram: {
    type: "wanneer_klik_afspelen",
    children: [
      {
        type: "herhaal",
        params: { aantal: 3 },
        children: [
          { type: "verplaats", params: { afstand: 2 } },
          { type: "draai", params: { hoek: 180 } },
          { type: "verplaats", params: { afstand: 2 } },
          { type: "draai", params: { hoek: 180 } },
        ],
      },
      { type: "speel_geluid", params: { geluid: "applaus" } },
    ],
  },
  criteriaSpec: "pt7-lj3h",
};

// =============================================================================
// COMPOSITION: items per versie
// =============================================================================
//
// Codex: gebruik deze maps in `assessments.ts` om de versie-arrays te
// reconstrueren. Bestaande items die NIET hier voorkomen blijven ongewijzigd.

export type VersionId = "lj1-vmbo" | "lj1-hv" | "lj3-vmbo" | "lj3-hv";

/** Items die in `assessments.ts` toegevoegd of vervangen worden per versie. */
export const v6ItemPayload: Record<VersionId, Array<SrItem | MailItem | ExcelItem | SourceEvalItem | PT7Item>> = {
  "lj1-vmbo": [
    ankerSrWachtwoord,
    ankerSrAiHallucinatie,
    ankerSrAuteursrechtFoto,
    ankerSrBronbeoordelingKlimaat,
    lj1vSrCopyright2,
    lj1vPt7Programming, // alleen criteriaSpec wijzigt
  ],
  "lj1-hv": [
    ankerSrWachtwoord,
    ankerSrAiHallucinatie,
    ankerSrAuteursrechtFoto,
    ankerSrBronbeoordelingKlimaat,
    lj1hPt2Mail,
    lj1hPt7Programming, // alleen criteriaSpec wijzigt
  ],
  "lj3-vmbo": [
    ankerSrWachtwoord,
    ankerSrAiHallucinatie,
    ankerSrAuteursrechtFoto,
    ankerSrBronbeoordelingKlimaat,
    lj3vSrCopyrightBync,
    srSponsored("lj3v"),
    srAdsRanking("lj3v"),
    lj3vPt2Mail,
    lj3vPt5Bronbeoordeling,
    lj3vPt7Programming,
  ],
  "lj3-hv": [
    ankerSrWachtwoord,
    ankerSrAiHallucinatie,
    ankerSrAuteursrechtFoto,
    ankerSrBronbeoordelingKlimaat,
    lj3hSrCopyrightBySa,
    srSponsored("lj3h"),
    srAdsRanking("lj3h"),
    lj3hPt2Mail,
    lj3hPt4Excel,
    lj3hPt5Bronbeoordeling,
    lj3hPt7Programming,
  ],
};

/** Items die uit `assessments.ts` MOETEN worden verwijderd (overschreven door v6Items). */
export const v6Removals: Record<VersionId, string[]> = {
  "lj1-vmbo": [
    "lj1v-sr1-pw",            // → vervangen door anker-sr-wachtwoord
    "lj1v-sr7-hallucination", // → vervangen door anker-sr-ai-hallucinatie
    "lj1v-sr8-copyright",     // → vervangen door anker-sr-auteursrecht-foto
    "lj1v-sr5-source",        // → vervangen door anker-sr-bronbeoordeling-klimaat
  ],
  "lj1-hv": [
    "lj1h-sr1-pw",
    "lj1h-sr8-hallucination",
    "lj1h-sr6-source",        // → vervangen door anker-sr-bronbeoordeling-klimaat (KNMI-content blijft, alleen itemId normaliseert)
    // lj1h-sr9-cc blijft als tweede auteursrecht-item
  ],
  "lj3-vmbo": [
    "lj3v-sr5-copyright",     // → vervangen door anker-sr-auteursrecht-foto
    "lj3v-sr3-source",        // → vervangen door anker-sr-bronbeoordeling-klimaat
  ],
  "lj3-hv": [
    "lj3h-sr3-hallucination", // → vervangen door anker-sr-ai-hallucinatie
    // lj3h-sr5-cc-sa wordt OVERSCHREVEN (zelfde id, nieuwe inhoud) via v6Items
  ],
};
