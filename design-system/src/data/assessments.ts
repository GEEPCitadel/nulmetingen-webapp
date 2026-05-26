import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentVersion,
  AssessmentVersionId,
  BlockProgrammingTaskConfig,
  CodeMapping,
  FileTaskRequirement,
  InteractionTaskConfig,
  MailTaskConfig,
  Option,
  ProgrammingBlockDefinition,
  Pt1Node,
  Pt1Simulation,
  TeamsTaskConfig,
  ThemeDefinition,
  ThemeKey,
} from "../types";

export const ADMIN_CODE = "beheer";

export const themes: Record<ThemeKey, ThemeDefinition> = {
  /* P4 — Lime · Teal · Cyan · Cream (logo 4) — LJ1 VMBO */
  limeTeal: {
    key: "limeTeal",
    palette: "p4",
    label: "Lime, turquoise en cyaan",
    primary: "#C7D400",
    secondary: "#009991",
    tertiary: "#63C2C7",
    panel: "#EFF5C2",
    ribbon: "/brand/shapes/slinger-4.png",
    accent: "#009991",
    logo: "/brand/logos/citadel-logo-4-fc.png",
  },
  /* P3 — Sky · Yellow · Orange (logo 3) — LJ1 HAVO/VWO */
  skyOrange: {
    key: "skyOrange",
    palette: "p3",
    label: "Sky, geel en oranje",
    primary: "#91D4ED",
    secondary: "#FFED00",
    tertiary: "#E88500",
    panel: "#D9F0F9",
    ribbon: "/brand/shapes/slinger-3.png",
    accent: "#E88500",
    logo: "/brand/logos/citadel-logo-3-fc.png",
  },
  /* P2 — Mint · Pink · Red (logo 2) — LJ3 VMBO */
  mintPink: {
    key: "mintPink",
    palette: "p2",
    label: "Mint, pink en rood",
    primary: "#8AC9B5",
    secondary: "#E85287",
    tertiary: "#E30521",
    panel: "#D6ECE3",
    ribbon: "/brand/shapes/slinger-2.png",
    accent: "#E85287",
    logo: "/brand/logos/citadel-logo-2-fc.png",
  },
  /* P5 — Rose · Blue · Navy · Cyan (logo 5) — LJ3 HAVO/VWO
     Replaces the old "sandCoral" which used a non-brand #EF735C coral. */
  roseNavy: {
    key: "roseNavy",
    palette: "p5",
    label: "Rose, blauw en navy",
    primary: "#F7D1D6",
    secondary: "#0075BA",
    tertiary: "#0D4580",
    panel: "#FCE5E9",
    ribbon: "/brand/shapes/slinger-1.png",
    accent: "#0075BA",
    logo: "/brand/logos/citadel-logo-5-fc.png",
  },
  /* P1 — Rainbow on cream (logo 1) — entry / admin / fallback */
  rainbowCream: {
    key: "rainbowCream",
    palette: "p1",
    label: "Cream, geel, magenta en paars",
    primary: "#DED4BA",
    secondary: "#E51C73",
    tertiary: "#662482",
    panel: "#DED4BA",
    ribbon: "/brand/shapes/slinger-0.png",
    accent: "#E51C73",
    logo: "/brand/logos/citadel-logo-1-fc.png",
  },
};

type VersionSpec = {
  id: AssessmentVersionId;
  title: string;
  level: string;
  themeKey: AssessmentVersion["themeKey"];
  pt1: FileTaskSpec;
  pt2: MailTaskSpec;
  pt3?: SecurityTaskSpec;
  pt4: ExcelTaskSpec;
  pt6: TeamsTaskSpec;
  pt7: BlockTaskSpec;
  pt8: SocialTaskSpec;
  sr: SelectedResponseSpec[];
};

type FileTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  startFolders: string[];
  startFiles: string[];
  tasks: FileTaskRequirement[];
  ankerItemFlag?: boolean;
};

type MailTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config: MailTaskConfig;
};

type SecurityTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config: InteractionTaskConfig;
};

type ExcelTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  filename: string;
  sheetName: string;
  questions: Array<{ id: string; prompt: string; answer: string; points: number }>;
};

type TeamsTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config: TeamsTaskConfig;
  ankerItemFlag?: boolean;
};

type BlockTaskSpec = {
  id: string;
  title: string;
  intro: string;
  instruction: string;
  config: BlockProgrammingTaskConfig;
};

type SocialTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config: InteractionTaskConfig;
  aiSnelVeranderendFlag?: boolean;
};

type SelectedResponseSpec = {
  id: string;
  title: string;
  kerndoel: string;
  question: string;
  options: string[];
  correct: string;
  ankerItemFlag?: boolean;
  aiSnelVeranderendFlag?: boolean;
};

const optionId = (prefix: string, index: number) => `${prefix}-${index + 1}`;

const makeOptions = (prefix: string, labels: string[]): Option[] =>
  labels.map((label, index) => ({ id: optionId(prefix, index), label }));

const fixedOptions = (labels: string[]): Option[] =>
  labels.map((label) => ({ id: label, label }));

const correctId = (prefix: string, labels: string[], correctLabel: string) => {
  const index = labels.findIndex((label) => label === correctLabel);
  if (index === -1) {
    throw new Error(`Correct option not found for ${prefix}: ${correctLabel}`);
  }
  return optionId(prefix, index);
};

const createSimulation = (folders: string[], files: string[]): Pt1Simulation => {
  const nodes: Pt1Node[] = [];
  const pathToId = new Map<string, string>();

  const addFolder = (path: string) => {
    const parts = path.split("/");
    let currentPath = "";
    let parentId: string | null = null;

    parts.forEach((part) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!pathToId.has(currentPath)) {
        const id = currentPath === "Thuis" ? "root" : `node-${pathToId.size}`;
        pathToId.set(currentPath, id);
        nodes.push({ id, name: part, type: "folder", parentId });
      }
      parentId = pathToId.get(currentPath) ?? null;
    });
  };

  const addFile = (path: string) => {
    const parts = path.split("/");
    const name = parts.pop();
    if (!name) {
      return;
    }
    const parentPath = parts.join("/");
    addFolder(parentPath);
    nodes.push({
      id: `node-${pathToId.size}-${nodes.length}`,
      name,
      type: "file",
      parentId: pathToId.get(parentPath) ?? null,
    });
  };

  addFolder("Thuis");
  folders.forEach(addFolder);
  files.forEach(addFile);

  return { rootId: "root", nodes };
};

const selfAssessmentItem = (): AssessmentItem => ({
  id: "self-assessment",
  type: "self_assessment",
  title: "Zelfinschatting",
  instruction: "Hoe digitaal geletterd schat je jezelf in?",
  points: 0,
  skillDomain: "Zelfinschatting",
  kerndoel: "niet-scorend",
  selfAssessmentScale: [
    { value: 0, label: "bijna niet" },
    { value: 50, label: "redelijk" },
    { value: 100, label: "heel goed" },
  ],
});

const fileTaskItem = (spec: FileTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "file_task_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: 4,
  skillDomain: "21A Digitale systemen",
  kerndoel: "21A",
  ankerItemFlag: spec.ankerItemFlag,
  fileTask: {
    simulation: createSimulation(spec.startFolders, spec.startFiles),
    tasks: spec.tasks,
  },
  correctState: {
    requiredPaths: spec.tasks,
  },
});

const mailTaskItem = (spec: MailTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "outlook_mail_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: 4,
  skillDomain: "21A Digitale systemen / 23B Digitaal burgerschap",
  kerndoel: spec.kerndoel,
  mailTask: spec.config,
});

const securityTaskItem = (spec: SecurityTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "account_security_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: 4,
  skillDomain: "23A Veiligheid en privacy",
  kerndoel: spec.kerndoel,
  securityTask: spec.config,
});

const excelTaskItem = (spec: ExcelTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "excel_download_task",
  title: spec.title,
  instruction: spec.instruction,
  points: 4,
  skillDomain: "21C Data",
  kerndoel: "21C, 21A",
  excelTask: {
    filename: spec.filename,
    sheetName: spec.sheetName,
    questions: spec.questions,
  },
});

const teamsTaskItem = (spec: TeamsTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "teams_share_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: 3,
  skillDomain: "21A Digitale systemen / 23B Digitaal burgerschap",
  kerndoel: spec.kerndoel,
  ankerItemFlag: spec.ankerItemFlag,
  teamsTask: spec.config,
});

const blockTaskItem = (spec: BlockTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "block_programming_task",
  title: spec.title,
  instruction: spec.instruction,
  points: 4,
  skillDomain: "22B Programmeren",
  kerndoel: "22B",
  blockTask: {
    ...spec.config,
    intro: spec.intro,
  },
});

const socialTaskItem = (spec: SocialTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "social_action_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: 3,
  skillDomain: "23B Digitaal burgerschap",
  kerndoel: spec.kerndoel,
  aiSnelVeranderendFlag: spec.aiSnelVeranderendFlag,
  socialTask: spec.config,
});

const selectedResponseItem = (spec: SelectedResponseSpec): AssessmentItem => ({
  id: spec.id,
  type: "multiple_choice",
  title: spec.title,
  instruction: spec.question,
  options: makeOptions(spec.id, spec.options),
  correctAnswer: correctId(spec.id, spec.options, spec.correct),
  points: 1,
  skillDomain:
    spec.kerndoel === "21D"
      ? "21D AI"
      : spec.kerndoel === "21B"
        ? "21B Informatievaardigheden"
        : spec.kerndoel === "22A"
          ? "22A Creëren met digitale technologie"
          : spec.kerndoel === "21A"
            ? "21A Digitale systemen"
            : "23C Digitale technologie, samenleving en wereld",
  kerndoel: spec.kerndoel,
  allowUnknown: true,
  randomizeOptions: true,
  ankerItemFlag: spec.ankerItemFlag,
  aiSnelVeranderendFlag: spec.aiSnelVeranderendFlag,
});

const makeSections = (spec: VersionSpec): AssessmentSection[] => [
  {
    id: "zelfinschatting",
    title: "Zelfinschatting",
    items: [selfAssessmentItem()],
  },
  {
    id: "pt1",
    title: "PT1 - Bestanden en mappen",
    items: [fileTaskItem(spec.pt1)],
  },
  {
    id: "pt2",
    title: "PT2 - Mail opstellen",
    items: [mailTaskItem(spec.pt2)],
  },
  ...(spec.pt3
    ? [
        {
          id: "pt3",
          title: "PT3 - Account, apparaat en verbinding beveiligen",
          items: [securityTaskItem(spec.pt3)],
        },
      ]
    : []),
  {
    id: "pt4",
    title: "PT4 - Excel/data sorteren en filteren",
    items: [excelTaskItem(spec.pt4)],
  },
  {
    id: "pt6",
    title: "PT6 - Videovergadering en schermdelen",
    items: [teamsTaskItem(spec.pt6)],
  },
  {
    id: "pt7",
    title: "PT7 - Blokprogrammeren",
    items: [blockTaskItem(spec.pt7)],
  },
  {
    id: "pt8",
    title: "PT8 - Online gedrag",
    items: [socialTaskItem(spec.pt8)],
  },
  {
    id: "sr",
    title: "Meerkeuze",
    instruction: "Kies steeds het beste antwoord.",
    items: spec.sr.map(selectedResponseItem),
  },
];

const buildAssessment = (spec: VersionSpec): AssessmentVersion => {
  const sections = makeSections(spec);
  const maxScore = sections.reduce(
    (sectionSum, section) =>
      sectionSum + section.items.reduce((itemSum, item) => itemSum + item.points, 0),
    0,
  );

  if (maxScore !== 32) {
    throw new Error(`${spec.id} heeft ${maxScore} punten in plaats van 32.`);
  }

  return {
    id: spec.id,
    title: spec.title,
    level: spec.level,
    maxScore,
    durationMinutes: 30,
    themeKey: spec.themeKey,
    sections,
  };
};

const shareRules = (): TeamsTaskConfig["rules"] => [
  {
    id: "share-opened",
    description: "op Delen geklikt.",
    points: 1,
    conditions: ["clicked_share"],
  },
  {
    id: "window-opened",
    description: "na Delen voor Venster gekozen.",
    points: 1,
    conditions: ["clicked_window"],
  },
  {
    id: "media-window-selected",
    description: "Windows Media Player in de juiste volgorde geselecteerd.",
    points: 1,
    conditions: ["selected_windows_media_player"],
  },
];

const blockColors = {
  gebeurtenissen: "#ffb22e",
  uiterlijk: "#8f5acb",
  beweging: "#55a9dc",
  besturing: "#f47b32",
  variabelen: "#f2a23a",
  waarnemen: "#2eb8a6",
  geluid: "#cf63c7",
  data: "#3f8edb",
};

const block = (
  label: string,
  category: keyof typeof blockColors,
  options: Pick<ProgrammingBlockDefinition, "isContainer" | "isCriticalDistractor"> = {},
): ProgrammingBlockDefinition => ({
  label,
  category,
  color: blockColors[category],
  ...options,
});

const mailButtons = [
  "Verzenden",
  "BCC tonen",
  "Bestand bijvoegen",
  "Hyperlink invoegen",
  "Prioriteit",
  "Concept opslaan",
  "Verwijderen",
];

const reportMailInstruction =
  "Je moet een verslag voor Nederlands naar je mentor sturen. Stel hieronder een e-mail op. Let op de volgende punten:\n- Zet het juiste mailadres op de juiste plek.\n- Gebruik als onderwerp: 'Verslag Nederlands'.\n- Voeg het juiste bestand toe aan de mail.\n- Als je mail klaar is, klik op 'Verzenden'.";

const createReportMailConfig = (): MailTaskConfig => ({
  visibleButtons: mailButtons,
  contacts: [
    "mentor@school.nl",
    "vriend@school.nl",
    "klasgroep@school.nl",
    "administratie@school.nl",
  ],
  files: [
    "Verslag_Nederlands.docx",
    "Foto_vakantie.jpg",
    "Rooster.pdf",
    "Muziek.mp3",
  ],
  rules: [
    {
      id: "to-mentor",
      description: "juiste mailadres staat in Aan.",
      points: 1,
      conditions: [{ field: "to", operator: "includes", value: "mentor@school.nl" }],
    },
    {
      id: "subject",
      description: "onderwerp is exact Verslag Nederlands.",
      points: 1,
      conditions: [{ field: "subject", operator: "equals", value: "Verslag Nederlands" }],
    },
    {
      id: "attachment",
      description: "juiste bestand is toegevoegd.",
      points: 1,
      conditions: [
        { field: "attachments", operator: "includes", value: "Verslag_Nederlands.docx" },
      ],
    },
    {
      id: "sent",
      description: "mail is verzonden.",
      points: 1,
      conditions: [{ field: "sent", operator: "true" }],
    },
  ],
});

const advancedMailInstruction =
  "Je werkt met twee klasgenoten aan een onderzoeksverslag. Stel hieronder een e-mail op. Let op de volgende punten:\n- Stuur de mail aan je mentor.\n- Zet je projectgroep in CC.\n- Gebruik als onderwerp: 'Onderzoeksverslag mediawijsheid'.\n- Voeg het juiste verslag toe en klik op 'Verzenden'.";

const createAdvancedMailConfig = (): MailTaskConfig => ({
  visibleButtons: mailButtons,
  contacts: [
    "mentor@school.nl",
    "projectgroep@school.nl",
    "klasgroep@school.nl",
    "administratie@school.nl",
  ],
  files: [
    "Onderzoeksverslag_mediawijsheid.docx",
    "Bronnenlijst.xlsx",
    "Foto_vakantie.jpg",
    "Rooster.pdf",
  ],
  rules: [
    {
      id: "to-mentor",
      description: "juiste mailadres staat in Aan.",
      points: 1,
      conditions: [{ field: "to", operator: "includes", value: "mentor@school.nl" }],
    },
    {
      id: "cc-projectgroup",
      description: "projectgroep staat in CC.",
      points: 1,
      conditions: [{ field: "cc", operator: "includes", value: "projectgroep@school.nl" }],
    },
    {
      id: "subject",
      description: "onderwerp is exact Onderzoeksverslag mediawijsheid.",
      points: 1,
      conditions: [
        { field: "subject", operator: "equals", value: "Onderzoeksverslag mediawijsheid" },
      ],
    },
    {
      id: "attachment-and-sent",
      description: "juiste bestand is toegevoegd en mail is verzonden.",
      points: 1,
      conditions: [
        {
          field: "attachments",
          operator: "includes",
          value: "Onderzoeksverslag_mediawijsheid.docx",
        },
        { field: "sent", operator: "true" },
      ],
    },
  ],
});

const fakeTeamsInstruction =
  "Voer in de Teams-vergadering het juiste klikpad uit: klik op Delen, kies Venster en selecteer Windows Media Player.";

const excelInstruction = (filename: string) =>
  `Download ${filename}. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.`;

const createFakeTeamsConfig = (): TeamsTaskConfig => ({
  scenario:
    "Je zit in een Teams-achtige vergadering als Leerling Anoniem. Deel alleen het venster van Windows Media Player.",
  buttons: ["Camera", "Microfoon", "Chat", "Deelnemers", "Reageren", "Delen", "Meer"],
  shareOptions: ["Scherm", "Venster"],
  windows: [
    "Windows Media Player",
    "Browser - schoolsite",
    "Word - Verslag Nederlands",
    "Excel - Cijferlijst",
    "Teams chat",
  ],
  correctWindow: "Windows Media Player",
  rules: shareRules(),
});

const versionSpecs: VersionSpec[] = [
  {
    id: "lj1-vmbo",
    title: "Leerjaar 1 VMBO",
    level: "LJ1 VMBO",
    themeKey: "limeTeal",
    pt1: {
      id: "lj1v-pt1-files",
      title: "PT1 - Bestanden en mappen",
      instruction:
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op de bestandsnamen.\nKlik daarna op Taak afronden.",
      startFolders: [
        "Thuis/OneDrive",
        "Thuis/Downloads",
        "Thuis/Documenten",
        "Thuis/Afbeeldingen",
      ],
      startFiles: [
        "Thuis/OneDrive/Verslag_Nederlands.docx",
        "Thuis/OneDrive/Presentatie_v1.pptx",
        "Thuis/OneDrive/Foto_project.jpg",
        "Thuis/Downloads/Installatiebestand.exe",
        "Thuis/Documenten/Aantekeningen.docx",
      ],
      ankerItemFlag: true,
      tasks: [
        {
          id: "lj1v-pt1-schoolwerk",
          description: "Maak in OneDrive de map Schoolwerk.",
          expectedPath: "Thuis/OneDrive/Schoolwerk",
          points: 1,
        },
        {
          id: "lj1v-pt1-presentatie",
          description: "Hernoem Presentatie_v1.pptx naar Presentatie_OUD.pptx.",
          expectedPath: "Thuis/OneDrive/Presentatie_OUD.pptx",
          forbiddenPaths: ["Thuis/OneDrive/Presentatie_v1.pptx"],
          points: 1,
        },
        {
          id: "lj1v-pt1-verslag",
          description: "Verplaats Verslag_Nederlands.docx naar Schoolwerk.",
          expectedPath: "Thuis/OneDrive/Schoolwerk/Verslag_Nederlands.docx",
          points: 1,
        },
        {
          id: "lj1v-pt1-fotos",
          description: "Maak in Schoolwerk de map Fotos en verplaats Foto_project.jpg daarheen.",
          expectedPath: "Thuis/OneDrive/Schoolwerk/Fotos/Foto_project.jpg",
          points: 1,
        },
      ],
    },
    pt2: {
      id: "lj1v-pt2-mail",
      title: "Mail opstellen",
      instruction: reportMailInstruction,
      kerndoel: "21A, 23B",
      config: createReportMailConfig(),
    },
    pt4: {
      id: "lj1v-pt4-excel",
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ1_VMBO_Liedjes.xlsx"),
      filename: "LJ1_VMBO_Liedjes.xlsx",
      sheetName: "Liedjes",
      questions: [
        {
          id: "a",
          prompt: "Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "L09",
          points: 2,
        },
        {
          id: "b",
          prompt:
            "Filter op Genre = pop. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?",
          answer: "L12",
          points: 2,
        },
      ],
    },
    pt6: {
      id: "lj1v-pt6-meeting",
      title: "PT6 - Videovergadering en schermdelen",
      instruction: fakeTeamsInstruction,
      kerndoel: "21A, 23B",
      ankerItemFlag: true,
      config: createFakeTeamsConfig(),
    },
    pt7: {
      id: "lj1v-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro:
        "Dit is Bizzy, een robot die kan bewegen, draaien en praten. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren.",
      instruction:
        "Maak een programma dat dit doet: na klikken op Afspelen zegt Bizzy Hoi!, gaat hij 1 meter vooruit en draait hij naar 180 graden.",
      config: {
        device: "bizzy",
        codingSteps: [
          "Gebruik het startblok Wanneer er geklikt wordt op afspelen.",
          "Laat Bizzy Hoi! zeggen.",
          "Laat Bizzy 1 meter vooruit bewegen.",
          "Laat Bizzy naar 180 graden draaien.",
        ],
        blocks: [
          block("Wanneer er geklikt wordt op afspelen", "gebeurtenissen"),
          block("wanneer er op Bizzy wordt geklikt", "gebeurtenissen"),
          block("verander animatie van Bizzy naar niet animeren", "uiterlijk"),
          block('Bizzy zegt "Hoi!"', "uiterlijk"),
          block("verplaats Bizzy 1 meter vooruit in 1 sec.", "beweging"),
          block("draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.", "beweging"),
          block("als 1 < 2", "besturing", { isCriticalDistractor: true }),
          block("speel geluid applaus", "geluid"),
          block("wacht 1 seconde", "besturing"),
          block("zet score op 0", "variabelen"),
          block("verplaats Bizzy 5 meters achteruit in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
        ],
        correctProgram: [
          "Wanneer er geklikt wordt op afspelen",
          'Bizzy zegt "Hoi!"',
          "verplaats Bizzy 1 meter vooruit in 1 sec.",
          "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
        ],
        rules: [
          {
            id: "start",
            description: "juiste startblok.",
            points: 1,
            firstBlock: "Wanneer er geklikt wordt op afspelen",
          },
          {
            id: "say",
            description: 'Bizzy zegt "Hoi!" gebruikt.',
            points: 1,
            requiredBlocks: ['Bizzy zegt "Hoi!"'],
          },
          {
            id: "move",
            description: "verplaats Bizzy 1 meter vooruit in 1 sec. gebruikt.",
            points: 1,
            requiredBlocks: ["verplaats Bizzy 1 meter vooruit in 1 sec."],
          },
          {
            id: "behavior",
            description:
              "eindgedrag klopt en er zijn geen kritieke afleider-blokken gebruikt.",
            points: 1,
            requireExecuted: true,
            requiredBlocks: [
              'Bizzy zegt "Hoi!"',
              "verplaats Bizzy 1 meter vooruit in 1 sec.",
              "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
            ],
            forbiddenBlocks: ["als 1 < 2", "verplaats Bizzy 5 meters achteruit in 1 sec."],
          },
        ],
      },
    },
    pt8: {
      id: "lj1v-pt8-online",
      title: "PT8 - Online gedrag: delen en pesten",
      instruction:
        "Maak beide schermen af.\nScherm 1: kies wie de informatie mag zien.\nScherm 2: kies twee veilige acties.",
      kerndoel: "23A, 23B",
      config: {
        screens: [
          {
            id: "sharing",
            title: "Scherm 1 - Deelinstellingen",
            instruction: "Kies bij elk kaartje de veiligste deelinstelling.",
            groups: [
              {
                id: "shareSettings",
                title: "Kies per kaartje",
                inputType: "matching",
                cards: fixedOptions([
                  "Wachtwoord voor Magister",
                  "Groepsplanning voor project",
                  "Poster voor de openbare open dag",
                ]),
                options: fixedOptions([
                  "Niet delen",
                  "Alleen mentor",
                  "Alleen projectgroep",
                  "Hele klas",
                  "Openbaar",
                ]),
              },
            ],
          },
          {
            id: "classchat",
            title: "Scherm 2 - Klassenapp",
            instruction:
              'In de klassenapp van klas 1V2 staat een bewerkte foto van Sam. Er staat: "Stuur door 😂". Sam zegt: "Stop, ik wil dit niet." Kies twee acties die jij zou doen.',
            body:
              "Rapporteren = via de meld-knop in de app aan de beheerder of het platform melden.",
            groups: [
              {
                id: "actions",
                title: "Kies twee acties die jij zou doen.",
                inputType: "multi",
                options: fixedOptions([
                  "Doorsturen",
                  "Reactie plaatsen om de sfeer luchtig te houden",
                  "Rapporteren",
                  "Niet doorsturen",
                  "Aan mentor of vertrouwenspersoon melden",
                  "Een neutrale reactie plaatsen ('ik weet niet wat ik moet zeggen')",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "share-settings",
            description: "deelinstellingen correct.",
            points: 2,
            partialPoints: 1,
            groupId: "shareSettings",
            kind: "matchingPartial",
            correctMatches: {
              "Wachtwoord voor Magister": "Niet delen",
              "Groepsplanning voor project": "Alleen projectgroep",
              "Poster voor de openbare open dag": "Openbaar",
            },
          },
          {
            id: "classchat-actions",
            description: "minstens twee correcte acties en geen schadelijke actie.",
            points: 1,
            groupId: "actions",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: [
              "Niet doorsturen",
              "Rapporteren",
              "Aan mentor of vertrouwenspersoon melden",
            ],
            forbiddenByGroup: {
              actions: [
                "Doorsturen",
                "Reactie plaatsen om de sfeer luchtig te houden",
              ],
            },
          },
        ],
      },
    },
    sr: [
      {
        id: "lj1v-sr1-pw",
        title: "SR1 - Wachtwoord",
        kerndoel: "23A",
        question: "Welk wachtwoord is het veiligst?",
        options: [
          "Een lange zin die jij kunt onthouden: MijnGroeneFietsStaatNaastSchool",
          "Je naam met een jaartal: Nora2026!",
          "Een kort woord: fietsbel",
          "Een rij op het toetsenbord: Qwerty!23",
        ],
        correct: "Een lange zin die jij kunt onthouden: MijnGroeneFietsStaatNaastSchool",
        ankerItemFlag: true,
      },
      {
        id: "lj1v-sr2-device",
        title: "SR2 - Trage telefoon",
        kerndoel: "21A",
        question:
          "De telefoon van Youssef is traag. Wat helpt meestal zonder foto's of accounts te wissen?",
        options: [
          "Ongebruikte apps of downloads opruimen en updates installeren.",
          "De helderheid van het scherm verlagen.",
          "Het toetsenbordgeluid uitzetten.",
          "Alle foto's naar de prullenbak verplaatsen.",
        ],
        correct: "Ongebruikte apps of downloads opruimen en updates installeren.",
      },
      {
        id: "lj1v-sr3-ai-check",
        title: "SR3 - AI-output controleren",
        kerndoel: "21D",
        question:
          "Een chatbot geeft een antwoord voor je werkstuk. Je weet niet of het klopt. Wat kun je het best doen?",
        options: [
          "Ik controleer het in een andere bron.",
          "Ik gebruik het meteen, want het klinkt netjes.",
          "Ik vraag dezelfde chatbot om het nog eens te zeggen.",
          "Ik deel het met mijn vrienden.",
        ],
        correct: "Ik controleer het in een andere bron.",
      },
      {
        id: "lj1v-sr4-platform",
        title: "SR4 - Platformafhankelijkheid",
        kerndoel: "23C",
        question:
          "Veel scholen gebruiken dezelfde grote app voor school en contact. Wat kan er dan misgaan?",
        options: [
          "Bij een storing kunnen veel scholen tegelijk niet bij hun berichten.",
          "De app krijgt soms een ander icoon.",
          "Leerlingen krijgen automatisch hetzelfde wachtwoord.",
          "De telefoon van leerlingen wordt dan altijd sneller.",
        ],
        correct: "Bij een storing kunnen veel scholen tegelijk niet bij hun berichten.",
      },
      {
        id: "lj1v-sr5-source",
        title: "SR5 - Bron herkennen",
        kerndoel: "21B",
        question:
          "Je leest koppen op internet. Welke kop lijkt het meest betrouwbaar?",
        options: [
          "Stadskrant Lentia, 10 juni 2026: Gemeente Lentia geeft geld aan jeugdsportclubs.",
          "ONGELOOFLIJK!! Stadhuis Nijmegen schenkt geld weg!!!",
          "Mijn mening over de gemeente",
          "Jongeren zeggen op TikTok dat...",
        ],
        correct: "Stadskrant Lentia, 10 juni 2026: Gemeente Lentia geeft geld aan jeugdsportclubs.",
      },
      {
        id: "lj1v-sr6-algorithm",
        title: "SR6 - Algoritmische selectie",
        kerndoel: "21B",
        question:
          "Twee leerlingen kijken op TikTok en zien andere video's. Hoe komt dat meestal?",
        options: [
          "De app kijkt naar wat iemand eerder bekeek of leuk vond.",
          "TikTok werkt niet altijd goed op elk apparaat.",
          "Twee leerlingen zien altijd dezelfde video's.",
          "Het komt alleen door het tijdstip van de dag.",
        ],
        correct: "De app kijkt naar wat iemand eerder bekeek of leuk vond.",
      },
      {
        id: "lj1v-sr7-hallucination",
        title: "SR7 - AI controleren",
        kerndoel: "21D",
        question:
          "Een AI-tool noemt een naam van een persoon. Je kunt die persoon nergens anders vinden. Wat is het meest waarschijnlijk?",
        options: [
          "De AI heeft de naam verzonnen.",
          "Die persoon bestaat zeker, maar is niet beroemd.",
          "De AI zegt altijd alleen kloppende dingen.",
          "De persoon staat alleen in betaalde bronnen.",
        ],
        correct: "De AI heeft de naam verzonnen.",
        aiSnelVeranderendFlag: true,
      },
      {
        id: "lj1v-sr8-copyright",
        title: "SR8 - Auteursrecht en bronvermelding",
        kerndoel: "22A",
        question:
          "Je vindt een mooie foto op internet voor je werkstuk. Wat doe je eerst?",
        options: [
          "Kijken of je de foto mag gebruiken en de bron erbij zetten.",
          "Foto kopiëren en gebruiken; op internet is alles vrij.",
          "Foto verkleinen, dan is hij van jou.",
          "Foto bewerken in een app, dan mag het.",
        ],
        correct: "Kijken of je de foto mag gebruiken en de bron erbij zetten.",
      },
      {
        id: "lj1v-sr9-divide",
        title: "SR9 - Digitale kloof",
        kerndoel: "23C",
        question:
          "Niet alle leerlingen hebben thuis een goede laptop of snel internet. Waarom is dat een probleem?",
        options: [
          "Sommige leerlingen kunnen schoolwerk thuis moeilijker maken.",
          "Hun laptop wordt sneller stuk.",
          "Ze worden minder slim.",
          "Ze mogen geen huiswerk meer maken.",
        ],
        correct: "Sommige leerlingen kunnen schoolwerk thuis moeilijker maken.",
      },
      {
        id: "lj1v-sr10-energy",
        title: "SR10 - Energie en duurzaamheid",
        kerndoel: "23C",
        question: "Welke optie verbruikt de meeste energie?",
        options: [
          "Een uur video streamen in hoge kwaliteit.",
          "Een kort tekstbericht versturen.",
          "Een foto opslaan in je galerij.",
          "Een wekker instellen op je telefoon.",
        ],
        correct: "Een uur video streamen in hoge kwaliteit.",
      },
    ],
  },
  {
    id: "lj1-hv",
    title: "Leerjaar 1 HAVO/VWO",
    level: "LJ1 HAVO/VWO",
    themeKey: "skyOrange",
    pt1: {
      id: "lj1h-pt1-files",
      title: "PT1 - Bestanden en mappen",
      instruction:
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op de bestandsnamen.\nKlik daarna op Taak afronden.",
      startFolders: [
        "Thuis/OneDrive",
        "Thuis/Downloads",
        "Thuis/Documenten",
        "Thuis/Afbeeldingen",
      ],
      startFiles: [
        "Thuis/OneDrive/Boekverslag_Nederlands.docx",
        "Thuis/OneDrive/Presentatie_Biologie_v1.pptx",
        "Thuis/OneDrive/Diagram_Biologie.png",
        "Thuis/OneDrive/Rooster.pdf",
        "Thuis/Documenten/Aantekeningen.docx",
      ],
      ankerItemFlag: true,
      tasks: [
        {
          id: "lj1h-pt1-schoolwerk",
          description: "Maak de map Schoolwerk.",
          expectedPath: "Thuis/OneDrive/Schoolwerk",
          points: 1,
        },
        {
          id: "lj1h-pt1-subfolders",
          description: "Maak in Schoolwerk de mappen Nederlands en Biologie.",
          expectedPaths: [
            "Thuis/OneDrive/Schoolwerk/Nederlands",
            "Thuis/OneDrive/Schoolwerk/Biologie",
          ],
          points: 1,
        },
        {
          id: "lj1h-pt1-book",
          description: "Verplaats Boekverslag_Nederlands.docx naar Schoolwerk/Nederlands.",
          expectedPath: "Thuis/OneDrive/Schoolwerk/Nederlands/Boekverslag_Nederlands.docx",
          points: 1,
        },
        {
          id: "lj1h-pt1-diagram",
          description: "Verplaats Diagram_Biologie.png naar Schoolwerk/Biologie.",
          expectedPath: "Thuis/OneDrive/Schoolwerk/Biologie/Diagram_Biologie.png",
          points: 1,
        },
      ],
    },
    pt2: {
      id: "lj1h-pt2-mail",
      title: "Mail opstellen",
      instruction: reportMailInstruction,
      kerndoel: "21A, 23B",
      config: createReportMailConfig(),
    },
    pt4: {
      id: "lj1h-pt4-excel",
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ1_HV_Bibliotheek.xlsx"),
      filename: "LJ1_HV_Bibliotheek.xlsx",
      sheetName: "Boeken",
      questions: [
        {
          id: "a",
          prompt: "Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "B07",
          points: 2,
        },
        {
          id: "b",
          prompt:
            "Filter op Vak = biologie. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?",
          answer: "B06",
          points: 2,
        },
      ],
    },
    pt6: {
      id: "lj1h-pt6-meeting",
      title: "PT6 - Videovergadering en schermdelen",
      instruction: fakeTeamsInstruction,
      kerndoel: "21A, 23B",
      ankerItemFlag: true,
      config: createFakeTeamsConfig(),
    },
    pt7: {
      id: "lj1h-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro:
        "Dit is Bizzy, een robot die kan bewegen, draaien en praten. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren.",
      instruction:
        "Maak een programma dat dit doet: na klikken op Afspelen zegt Bizzy Hoi! en beweegt hij drie keer vooruit.",
      config: {
        device: "bizzy",
        codingSteps: [
          "Gebruik het startblok Wanneer er geklikt wordt op afspelen.",
          "Laat Bizzy Hoi! zeggen.",
          "Gebruik herhaal 3 keer.",
          "Zet verplaats Bizzy 1 meter vooruit in de herhaling.",
        ],
        blocks: [
          block("Wanneer er geklikt wordt op afspelen", "gebeurtenissen"),
          block("wanneer er op Bizzy wordt geklikt", "gebeurtenissen"),
          block("verander animatie van Bizzy naar niet animeren", "uiterlijk"),
          block('Bizzy zegt "Hoi!"', "uiterlijk"),
          block("verplaats Bizzy 1 meter vooruit in 1 sec.", "beweging"),
          block("draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.", "beweging"),
          block("als 1 < 2", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("herhaal 3 keer", "besturing", { isContainer: true }),
          block("herhaal 10 keer", "besturing", { isContainer: true }),
          block("speel geluid start", "geluid"),
          block("zet snelheid op 2", "variabelen"),
          block("als Bizzy rand raakt", "waarnemen", { isContainer: true }),
          block("stop alles", "besturing"),
        ],
        correctProgram: [
          "Wanneer er geklikt wordt op afspelen",
          'Bizzy zegt "Hoi!"',
          "herhaal 3 keer",
          "verplaats Bizzy 1 meter vooruit in 1 sec.",
        ],
        rules: [
          {
            id: "start",
            description: "juiste startblok.",
            points: 1,
            firstBlock: "Wanneer er geklikt wordt op afspelen",
          },
          {
            id: "say",
            description: 'Bizzy zegt "Hoi!" gebruikt.',
            points: 1,
            requiredBlocks: ['Bizzy zegt "Hoi!"'],
          },
          {
            id: "repeat-three",
            description:
              "herhaal 3 keer met verplaats Bizzy 1 meter vooruit in 1 sec. als geneste body.",
            points: 1,
            nestedBlocks: [
              {
                parent: "herhaal 3 keer",
                child: "verplaats Bizzy 1 meter vooruit in 1 sec.",
              },
            ],
          },
          {
            id: "behavior",
            description: "eindgedrag klopt en er is geen kritieke afleider gebruikt.",
            points: 1,
            requireExecuted: true,
            requiredBlocks: ['Bizzy zegt "Hoi!"', "herhaal 3 keer"],
            nestedBlocks: [
              {
                parent: "herhaal 3 keer",
                child: "verplaats Bizzy 1 meter vooruit in 1 sec.",
              },
            ],
            forbiddenBlocks: ["als 1 < 2"],
          },
        ],
      },
    },
    pt8: {
      id: "lj1h-pt8-online",
      title: "PT8 - Online gedrag: misleidende appmelding",
      instruction:
        "Een app probeert Silke steeds naar dezelfde keuze te sturen.\nOpen de instellingen.\nKies een veilige meldingsinstelling.\nKlik daarna op Taak afronden.",
      kerndoel: "23B, 21B, 23A",
      config: {
        screens: [
          {
            id: "feeblemind",
            title: "Misleidende appmelding",
            instruction:
              'Op je telefoon vraagt de app Feeblemind steeds opnieuw: "Zet notificaties aan". Silke heeft al drie keer op "Nu niet" geklikt, maar de melding blijft terugkeren.',
            body:
              "Notificatie-instellingen kun je vinden in de app-instellingen of in het meldingsbeheer van de telefoon.",
            groups: [
              {
                id: "promptAction",
                title: "Interface",
                inputType: "single",
                options: fixedOptions(["Nu niet", "Oké", "Instellingen"]),
              },
              {
                id: "notificationSetting",
                title: "Bij Instellingen",
                inputType: "single",
                options: fixedOptions([
                  "Meldingen aan",
                  "Meldingen uit",
                  "Meldingen beperkt",
                  "Account verwijderen",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "settings-opened",
            description: "instellingen geopend.",
            points: 1,
            groupId: "promptAction",
            kind: "singleCorrect",
            correctOptionIds: ["Instellingen"],
          },
          {
            id: "notifications-limited",
            description: "meldingen uit of beperkt.",
            points: 1,
            groupId: "notificationSetting",
            kind: "singleCorrect",
            correctOptionIds: ["Meldingen uit", "Meldingen beperkt"],
          },
          {
            id: "no-harmful-action",
            description:
              "niet akkoord gegaan met volledige notificaties en account niet verwijderd.",
            points: 1,
            groupId: "promptAction",
            kind: "noForbidden",
            forbiddenByGroup: {
              promptAction: ["Oké"],
              notificationSetting: ["Account verwijderen"],
            },
          },
        ],
      },
    },
    sr: [
      {
        id: "lj1h-sr1-pw",
        title: "SR1 - Wachtwoord",
        kerndoel: "23A",
        question: "Welk wachtwoord is het veiligst?",
        options: ["BlauweTreinLampSchoolTas", "Herfst2026", "Welkom123!", "11112222"],
        correct: "BlauweTreinLampSchoolTas",
        ankerItemFlag: true,
      },
      {
        id: "lj1h-sr2-https",
        title: "SR2 - Versleutelde verbinding",
        kerndoel: "23A",
        question: "Aan welk teken zie je dat een verbinding versleuteld is?",
        options: [
          "Het slotje in de adresbalk of https:// voor het webadres.",
          "De website laadt sneller.",
          "De website heeft .nl in de naam.",
          "De website heeft kleurrijke afbeeldingen.",
        ],
        correct: "Het slotje in de adresbalk of https:// voor het webadres.",
      },
      {
        id: "lj1h-sr3-access",
        title: "SR3 - Toegang weigeren",
        kerndoel: "23A",
        question:
          'Je krijgt op je leeromgeving de melding "Je hebt geen toegang tot Werkstuk.docx". Wat kun je het best doen?',
        options: [
          "Toegang aanvragen bij de eigenaar.",
          "Het wachtwoord van een klasgenoot lenen.",
          "Het bestand openbaar laten maken.",
          "Via een onbekende link downloaden.",
        ],
        correct: "Toegang aanvragen bij de eigenaar.",
      },
      {
        id: "lj1h-sr4-ai-verify",
        title: "SR4 - AI verifiëren",
        kerndoel: "21D",
        question: "Een AI-tool noemt een jaartal zonder bron. Welke controle is het sterkst?",
        options: [
          "Controleren in een onafhankelijke betrouwbare bron.",
          "De vraag opnieuw stellen aan dezelfde AI.",
          "Kijken of de tekst zeker klinkt.",
          "Het antwoord gebruiken als het lang genoeg is.",
        ],
        correct: "Controleren in een onafhankelijke betrouwbare bron.",
      },
      {
        id: "lj1h-sr5-sample",
        title: "SR5 - Steekproef en generaliseerbaarheid",
        kerndoel: "21C, 23C",
        question:
          "Een dataset bevat alleen antwoorden van leerlingen uit 1 klas. Waar moet je voor oppassen?",
        options: [
          "Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt.",
          "Een klas is altijd genoeg om iets over heel Nederland te zeggen.",
          "De dataset is automatisch fout.",
          "Meer data maakt nooit verschil.",
        ],
        correct: "Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt.",
      },
      {
        id: "lj1h-sr6-source",
        title: "SR6 - Bron en autoriteit",
        kerndoel: "21B",
        question:
          "Welke bron is naar verwachting het betrouwbaarst voor een werkstuk over klimaat?",
        options: [
          "Een artikel van het KNMI met datum en auteur.",
          "Een viral TikTok van een influencer met veel volgers.",
          "Een blog zonder auteursnaam met sterke meningen.",
          "Een meme met cijfers.",
        ],
        correct: "Een artikel van het KNMI met datum en auteur.",
      },
      {
        id: "lj1h-sr7-algorithm",
        title: "SR7 - Algoritme en feed",
        kerndoel: "21B",
        question:
          "Twee leerlingen krijgen op Instagram totaal andere posts te zien. Wat is de belangrijkste oorzaak?",
        options: [
          "Het algoritme kiest posts op basis van eerder gedrag van de gebruiker.",
          "Instagram laadt andere posts bij verschillend internet.",
          "Iedereen ziet eigenlijk dezelfde posts.",
          "Posts worden willekeurig getoond.",
        ],
        correct:
          "Het algoritme kiest posts op basis van eerder gedrag van de gebruiker.",
      },
      {
        id: "lj1h-sr8-hallucination",
        title: "SR8 - AI controleren",
        kerndoel: "21D",
        question:
          "Een AI-chatbot noemt een wetenschappelijk artikel dat je nergens kunt vinden. Wat is het meest waarschijnlijk?",
        options: [
          "De AI heeft het artikel waarschijnlijk verzonnen.",
          "Het artikel staat misschien in een onbekend tijdschrift.",
          "Het artikel is mogelijk nog niet openbaar gepubliceerd.",
          "Je zoekterm kan te breed of te smal zijn.",
        ],
        correct: "De AI heeft het artikel waarschijnlijk verzonnen.",
        aiSnelVeranderendFlag: true,
      },
      {
        id: "lj1h-sr9-cc",
        title: "SR9 - Creative Commons",
        kerndoel: "22A",
        question:
          "Je gebruikt een afbeelding met een Creative Commons BY-licentie in je presentatie. Wat moet je dan doen?",
        options: [
          "De maker noemen (naamsvermelding).",
          "Niets, CC-BY betekent dat alles vrij is.",
          "Toestemming vragen via e-mail.",
          "De afbeelding alleen voor commercieel gebruik gebruiken.",
        ],
        correct: "De maker noemen (naamsvermelding).",
      },
      {
        id: "lj1h-sr10-divide",
        title: "SR10 - Digitale ongelijkheid",
        kerndoel: "23C",
        question:
          "Wat is een gevolg van het feit dat niet alle leerlingen thuis een goede laptop en snel internet hebben?",
        options: [
          "Schoolwerk en kansen worden ongelijk verdeeld tussen leerlingen.",
          "Leerlingen zonder laptop worden minder slim.",
          "Internet wordt voor iedereen langzamer.",
          "De school moet voor iedereen betalen.",
        ],
        correct: "Schoolwerk en kansen worden ongelijk verdeeld tussen leerlingen.",
      },
    ],
  },
  {
    id: "lj3-vmbo",
    title: "Leerjaar 3 VMBO",
    level: "LJ3 VMBO",
    themeKey: "mintPink",
    pt1: {
      id: "lj3v-pt1-files",
      title: "PT1 - Bestanden en mappen",
      instruction:
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op mappen en bestandsnamen.\nKlik daarna op Taak afronden.",
      startFolders: ["Thuis/OneDrive", "Thuis/OneDrive/Project_stage"],
      startFiles: [
        "Thuis/OneDrive/Project_stage/Plan_stage_v1.docx",
        "Thuis/OneDrive/Project_stage/Plan_stage_DEF.docx",
        "Thuis/OneDrive/Project_stage/Foto_stage.jpg",
        "Thuis/OneDrive/Project_stage/Notities.txt",
      ],
      ankerItemFlag: true,
      tasks: [
        {
          id: "lj3v-pt1-archief",
          description: "Maak de map Archief in Project_stage.",
          expectedPath: "Thuis/OneDrive/Project_stage/Archief",
          points: 1,
        },
        {
          id: "lj3v-pt1-old",
          description: "Verplaats Plan_stage_v1.docx naar Archief.",
          expectedPath: "Thuis/OneDrive/Project_stage/Archief/Plan_stage_v1.docx",
          points: 1,
        },
        {
          id: "lj3v-pt1-final",
          description: "Hernoem Plan_stage_DEF.docx naar Plan_stage_eindversie.docx.",
          expectedPath: "Thuis/OneDrive/Project_stage/Plan_stage_eindversie.docx",
          forbiddenPaths: ["Thuis/OneDrive/Project_stage/Plan_stage_DEF.docx"],
          points: 1,
        },
        {
          id: "lj3v-pt1-images",
          description: "Maak de map Beelden en verplaats Foto_stage.jpg daarheen.",
          expectedPath: "Thuis/OneDrive/Project_stage/Beelden/Foto_stage.jpg",
          points: 1,
        },
      ],
    },
    pt2: {
      id: "lj3v-pt2-mail",
      title: "Mail opstellen",
      instruction: reportMailInstruction,
      kerndoel: "21A, 23B",
      config: createReportMailConfig(),
    },
    pt3: {
      id: "lj3v-pt3-security",
      title: "PT3 - Account, apparaat en verbinding beveiligen",
      instruction: "Kies veilige acties bij twee meldingen op je telefoon.",
      kerndoel: "23A, 21A",
      config: {
        screens: [
          {
            id: "update",
            title: "Scherm 1 - Verdachte update",
            instruction: "Je krijgt deze melding op je telefoon: je videospeler is verouderd. Klik hier om update.exe te downloaden.",
            groups: [
              {
                id: "updateActions",
                title: "Acties",
                inputType: "multi",
                options: fixedOptions([
                  "Download update.exe",
                  "Sluit melding",
                  "Open officiële app/instellingen voor updates",
                  "Sta meldingen altijd toe",
                ]),
              },
            ],
          },
          {
            id: "login",
            title: "Scherm 2 - Verdachte login",
            instruction: "Je krijgt deze melding op je telefoon: nieuwe login op je schoolaccount vanaf onbekend apparaat.",
            groups: [
              {
                id: "loginActions",
                title: "Acties",
                inputType: "multi",
                options: fixedOptions([
                  "Officiële accountbeveiliging openen",
                  "Wachtwoord wijzigen",
                  "Sessie/apparaat controleren",
                  "Bericht negeren",
                  "Wachtwoord naar vriend sturen",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "no-download",
            description: "download niet gestart.",
            points: 1,
            groupId: "updateActions",
            kind: "noForbidden",
            forbiddenOptionIds: ["Download update.exe"],
          },
          {
            id: "official-update",
            description: "officiële updateplek gekozen.",
            points: 1,
            groupId: "updateActions",
            kind: "allSelected",
            correctOptionIds: ["Open officiële app/instellingen voor updates"],
          },
          {
            id: "official-account",
            description: "officiële accountbeveiliging geopend.",
            points: 1,
            groupId: "loginActions",
            kind: "allSelected",
            correctOptionIds: ["Officiële accountbeveiliging openen"],
          },
          {
            id: "login-followup",
            description: "sessie/apparaat gecontroleerd of wachtwoord gewijzigd.",
            points: 1,
            groupId: "loginActions",
            kind: "minCorrect",
            minCorrect: 1,
            correctOptionIds: ["Sessie/apparaat controleren", "Wachtwoord wijzigen"],
          },
        ],
      },
    },
    pt4: {
      id: "lj3v-pt4-excel",
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ3_VMBO_Bestellingen.xlsx"),
      filename: "LJ3_VMBO_Bestellingen.xlsx",
      sheetName: "Bestellingen",
      questions: [
        {
          id: "a",
          prompt:
            "Filter op Categorie = elektronica. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "W02",
          points: 2,
        },
        {
          id: "b",
          prompt:
            "Filter op Bedrag > 60. Sorteer daarna op Bedrag, van hoog naar laag. Welke code staat bovenaan?",
          answer: "W06",
          points: 2,
        },
      ],
    },
    pt6: {
      id: "lj3v-pt6-meeting",
      title: "PT6 - Videovergadering en schermdelen",
      instruction: fakeTeamsInstruction,
      kerndoel: "21A, 23B, 23A",
      ankerItemFlag: true,
      config: createFakeTeamsConfig(),
    },
    pt7: {
      id: "lj3v-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro:
        "Dit is een micro:bit-achtig apparaat met een klein scherm en twee knoppen (A en B). Programmeer een teller die op het scherm verschijnt. Klik op ▶ om je programma uit te voeren; klik daarna op A of B om de knoppen te testen.",
      instruction:
        "Maak een programma. De teller begint op 0. Elke keer dat knop A wordt ingedrukt, gaat de teller 1 omhoog. Bij 5 of meer toont het scherm vol.",
      config: {
        device: "microbit",
        codingSteps: [
          "Zet de teller bij start op 0.",
          "Laat knop A de teller met 1 verhogen.",
          "Controleer of de teller 5 of meer is.",
          "Toon vol als de teller 5 of meer is.",
        ],
        blocks: [
          block("bij start", "gebeurtenissen", { isContainer: true }),
          block("zet teller op 0", "variabelen"),
          block("als knop A wordt ingedrukt", "gebeurtenissen", { isContainer: true }),
          block("als knop B wordt ingedrukt", "gebeurtenissen", { isContainer: true }),
          block("verander teller met 1", "variabelen"),
          block("verander teller met -1", "variabelen"),
          block("als teller >= 5 dan", "besturing", { isContainer: true }),
          block("als teller < 5 dan", "besturing", {
            isContainer: true,
            isCriticalDistractor: true,
          }),
          block('toon "vol"', "uiterlijk"),
          block('toon "leeg"', "uiterlijk"),
          block("wacht 10 seconden", "besturing"),
          block("speel geluid klaar", "geluid"),
        ],
        correctProgram: [
          "bij start",
          "zet teller op 0",
          "als knop A wordt ingedrukt",
          "verander teller met 1",
          "als teller >= 5 dan",
          'toon "vol"',
        ],
        rules: [
          {
            id: "init",
            description: "teller initialiseert op 0 binnen bij start.",
            points: 1,
            nestedBlocks: [{ parent: "bij start", child: "zet teller op 0" }],
          },
          {
            id: "button-a",
            description: "als knop A wordt ingedrukt met geneste verander teller met 1.",
            points: 1,
            nestedBlocks: [
              { parent: "als knop A wordt ingedrukt", child: "verander teller met 1" },
            ],
          },
          {
            id: "show-full",
            description: 'als teller >= 5 dan met geneste toon "vol".',
            points: 1,
            nestedBlocks: [{ parent: "als teller >= 5 dan", child: 'toon "vol"' }],
          },
          {
            id: "behavior",
            description:
              "eindgedrag bij testen van A klopt en er is geen kritieke afleider gebruikt.",
            points: 1,
            requireExecuted: true,
            nestedBlocks: [
              { parent: "als knop A wordt ingedrukt", child: "verander teller met 1" },
              { parent: "als teller >= 5 dan", child: 'toon "vol"' },
            ],
            forbiddenBlocks: ["als teller < 5 dan"],
          },
        ],
      },
    },
    pt8: {
      id: "lj3v-pt8-online",
      title: "PT8 - Online gedrag: deepfake/pesten",
      instruction: "Bekijk de situatie.\nKies twee signalen.\nKies twee veilige acties.",
      kerndoel: "21D, 23A, 23B",
      aiSnelVeranderendFlag: true,
      config: {
        screens: [
          {
            id: "deepfake",
            title: "Deepfake/pesten",
            instruction:
              'In de klassenapp van klas 3V2 verschijnt een AI-gemaakte afbeelding van een leerling in een beschamende situatie. Iemand schrijft: "Dit is echt, stuur door." De handen zien er vreemd uit. De leerling reageert: "Dit ben ik niet."',
            body:
              "Rapporteren = via de meld-knop in de app aan de beheerder of het platform melden.\nBewijs bewaren = de afbeelding/het bericht opslaan voor je het bericht verlaat, zodat het later getoond kan worden.",
            groups: [
              {
                id: "judgement",
                title: "Beoordeel de afbeelding",
                inputType: "single",
                options: fixedOptions(["echt", "twijfelachtig", "waarschijnlijk nep of AI"]),
              },
              {
                id: "signals",
                title: "Klik twee signalen aan",
                inputType: "multi",
                options: fixedOptions(["vreemde handen", "leerling ontkent", "schadelijke context"]),
              },
              {
                id: "actions",
                title: "Kies twee acties",
                inputType: "multi",
                options: fixedOptions([
                  "niet doorsturen",
                  "rapporteren",
                  "bewijs bewaren",
                  "melden bij mentor/vertrouwde volwassene",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "judgement",
            description: "juist oordeel.",
            points: 1,
            groupId: "judgement",
            kind: "singleCorrect",
            correctOptionIds: ["waarschijnlijk nep of AI"],
          },
          {
            id: "signals",
            description: "minstens twee juiste signalen.",
            points: 1,
            groupId: "signals",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: ["vreemde handen", "leerling ontkent", "schadelijke context"],
          },
          {
            id: "actions",
            description: "minstens twee juiste acties en geen schadelijke actie.",
            points: 1,
            groupId: "actions",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: [
              "niet doorsturen",
              "rapporteren",
              "bewijs bewaren",
              "melden bij mentor/vertrouwde volwassene",
            ],
          },
        ],
      },
    },
    sr: [
      {
        id: "lj3v-sr1-ai-check",
        title: "SR1 - AI controleren",
        kerndoel: "21D",
        question:
          "Een AI-chatbot geeft een zelfverzekerd antwoord zonder bron. Wat is de beste eerste controle?",
        options: [
          "De informatie controleren in een onafhankelijke bron.",
          "De tekst gebruiken omdat hij zelfverzekerd klinkt.",
          "Dezelfde vraag opnieuw stellen aan dezelfde chatbot.",
          "Alleen controleren of er moeilijke woorden in staan.",
        ],
        correct: "De informatie controleren in een onafhankelijke bron.",
      },
      {
        id: "lj3v-sr2-platform",
        title: "SR2 - Platformafhankelijkheid",
        kerndoel: "23C",
        question:
          "Scholen en bedrijven gebruiken vaak dezelfde grote techbedrijven. Wat kan er misgaan?",
        options: [
          "Een storing of nieuwe regel kan veel mensen tegelijk raken.",
          "Een bedrijf heeft dan minder werknemers nodig.",
          "Internet wordt sneller bij minder providers.",
          "Wachtwoorden zijn dan niet meer nodig.",
        ],
        correct: "Een storing of nieuwe regel kan veel mensen tegelijk raken.",
      },
      {
        id: "lj3v-sr3-source",
        title: "SR3 - Bronkwaliteit",
        kerndoel: "21B",
        question:
          "Welke bron geeft naar verwachting de meest betrouwbare informatie over een gezondheidsvraag?",
        options: [
          "Een artikel op Thuisarts.nl van een arts.",
          "Een YouTuber die zijn ervaring deelt.",
          "Een advertentie voor pillen.",
          "Een groepsapp met klasgenoten.",
        ],
        correct: "Een artikel op Thuisarts.nl van een arts.",
      },
      {
        id: "lj3v-sr4-bias",
        title: "SR4 - AI bias en trainingsdata",
        kerndoel: "21D",
        question:
          'Een AI laat alleen mannen zien als je vraagt om een afbeelding van "een directeur". Wat is de meest waarschijnlijke oorzaak?',
        options: [
          "De AI heeft vooral voorbeelden met mannen in die rol geleerd.",
          "De AI vindt mannen aardiger.",
          "Vrouwen zijn nooit directeur.",
          "Het programma is kapot.",
        ],
        correct:
          "De AI heeft vooral voorbeelden met mannen in die rol geleerd.",
        aiSnelVeranderendFlag: true,
      },
      {
        id: "lj3v-sr5-copyright",
        title: "SR5 - Auteursrecht en bronvermelding",
        kerndoel: "22A",
        question: "Je gebruikt een foto in je werkstuk. Wat moet je doen?",
        options: [
          "Maker noemen en bron vermelden.",
          "Foto bewerken zodat je hem als eigen werk kan gebruiken.",
          "Foto kleiner maken; dan is het geen kopie.",
          "Foto direct kopiëren; op internet mag alles.",
        ],
        correct: "Maker noemen en bron vermelden.",
      },
      {
        id: "lj3v-sr6-energy",
        title: "SR6 - Streaming en energie",
        kerndoel: "23C",
        question: "Wat is een belangrijk gevolg van het massaal kijken van streaming-video?",
        options: [
          "Datacenters verbruiken veel energie.",
          "Internetkabels worden korter.",
          "Telefoons worden zwaarder.",
          "Beeld wordt vanzelf scherper.",
        ],
        correct: "Datacenters verbruiken veel energie.",
      },
    ],
  },
  {
    id: "lj3-hv",
    title: "Leerjaar 3 HAVO/VWO",
    level: "LJ3 HAVO/VWO",
    themeKey: "roseNavy",
    pt1: {
      id: "lj3h-pt1-files",
      title: "PT1 - Bestanden en mappen",
      instruction:
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op mappen en bestandsnamen.\nKlik daarna op Taak afronden.",
      startFolders: ["Thuis/OneDrive", "Thuis/OneDrive/Onderzoek"],
      startFiles: [
        "Thuis/OneDrive/Onderzoek/Onderzoek_v1.docx",
        "Thuis/OneDrive/Onderzoek/Onderzoek_v2.docx",
        "Thuis/OneDrive/Onderzoek/Onderzoek_DEF.docx",
        "Thuis/OneDrive/Onderzoek/Bronnen.xlsx",
        "Thuis/OneDrive/Onderzoek/Afbeelding_CC_BY.png",
      ],
      ankerItemFlag: true,
      tasks: [
        {
          id: "lj3h-pt1-archief",
          description: "Maak de map Archief.",
          expectedPath: "Thuis/OneDrive/Onderzoek/Archief",
          points: 1,
        },
        {
          id: "lj3h-pt1-old",
          description: "Verplaats Onderzoek_v1.docx en Onderzoek_v2.docx naar Archief.",
          expectedPaths: [
            "Thuis/OneDrive/Onderzoek/Archief/Onderzoek_v1.docx",
            "Thuis/OneDrive/Onderzoek/Archief/Onderzoek_v2.docx",
          ],
          points: 1,
        },
        {
          id: "lj3h-pt1-final",
          description: "Hernoem Onderzoek_DEF.docx naar Onderzoek_eindversie.docx.",
          expectedPath: "Thuis/OneDrive/Onderzoek/Onderzoek_eindversie.docx",
          forbiddenPaths: ["Thuis/OneDrive/Onderzoek/Onderzoek_DEF.docx"],
          points: 1,
        },
        {
          id: "lj3h-pt1-media",
          description:
            "Maak map Bronnen_en_media en verplaats Bronnen.xlsx en Afbeelding_CC_BY.png daarnaartoe.",
          expectedPaths: [
            "Thuis/OneDrive/Onderzoek/Bronnen_en_media/Bronnen.xlsx",
            "Thuis/OneDrive/Onderzoek/Bronnen_en_media/Afbeelding_CC_BY.png",
          ],
          points: 1,
        },
      ],
    },
    pt2: {
      id: "lj3h-pt2-mail",
      title: "Mail opstellen",
      instruction: advancedMailInstruction,
      kerndoel: "21A, 23A, 23B",
      config: createAdvancedMailConfig(),
    },
    pt3: {
      id: "lj3h-pt3-security",
      title: "PT3 - Account, apparaat en verbinding beveiligen",
      instruction: "Kies veilige acties bij een bestand en een loginmelding.",
      kerndoel: "23A, 21A",
      config: {
        screens: [
          {
            id: "macro",
            title: "Scherm 1 - Macro-waarschuwing",
            instruction:
              "Je ontvangt een bestand: Factuur_stage.xlsm. Macro's zijn uitgeschakeld. Het bestand komt van een onbekende afzender.",
            groups: [
              {
                id: "macroActions",
                title: "Acties",
                inputType: "multi",
                options: fixedOptions([
                  "Macro's inschakelen",
                  "Afzender controleren",
                  "Bestand melden bij ICT",
                  "Bestand als vertrouwd markeren",
                  "Bestand doorsturen naar klasgroep",
                ]),
              },
            ],
          },
          {
            id: "login",
            title: "Scherm 2 - Verdachte login",
            instruction: "Je krijgt deze melding op je telefoon: nieuwe login op je schoolaccount vanaf onbekend apparaat.",
            groups: [
              {
                id: "loginActions",
                title: "Acties",
                inputType: "multi",
                options: fixedOptions([
                  "Officiële accountbeveiliging openen",
                  "Sessie/apparaten controleren",
                  "Wachtwoord wijzigen",
                  "Tweestapsverificatie controleren/aanzetten",
                  "Bericht negeren",
                  "Wachtwoord naar vriend sturen",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "no-macros",
            description: "macro's niet ingeschakeld.",
            points: 1,
            groupId: "macroActions",
            kind: "noForbidden",
            forbiddenOptionIds: ["Macro's inschakelen"],
          },
          {
            id: "macro-followup",
            description: "afzender controleren of melden bij ICT.",
            points: 1,
            groupId: "macroActions",
            kind: "minCorrect",
            minCorrect: 1,
            correctOptionIds: ["Afzender controleren", "Bestand melden bij ICT"],
          },
          {
            id: "official-account",
            description: "officiële accountomgeving geopend.",
            points: 1,
            groupId: "loginActions",
            kind: "allSelected",
            correctOptionIds: ["Officiële accountbeveiliging openen"],
          },
          {
            id: "login-followup",
            description: "sessies/apparaten gecontroleerd en/of wachtwoord/2FA veilig aangepast.",
            points: 1,
            groupId: "loginActions",
            kind: "minCorrect",
            minCorrect: 1,
            correctOptionIds: [
              "Sessie/apparaten controleren",
              "Wachtwoord wijzigen",
              "Tweestapsverificatie controleren/aanzetten",
            ],
          },
        ],
      },
    },
    pt4: {
      id: "lj3h-pt4-excel",
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ3_HV_OpenData.xlsx"),
      filename: "LJ3_HV_OpenData.xlsx",
      sheetName: "Energie",
      questions: [
        {
          id: "a",
          prompt:
            "Filter op Kosten > 500. Sorteer daarna op Kosten, van hoog naar laag. Welke code staat bovenaan?",
          answer: "E13",
          points: 2,
        },
        {
          id: "b",
          prompt:
            "Filter op Woningtype = B. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "E02",
          points: 2,
        },
      ],
    },
    pt6: {
      id: "lj3h-pt6-meeting",
      title: "PT6 - Videovergadering en schermdelen",
      instruction: fakeTeamsInstruction,
      kerndoel: "21A, 23A, 23B",
      ankerItemFlag: true,
      config: createFakeTeamsConfig(),
    },
    pt7: {
      id: "lj3h-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro:
        "Een sensor meet temperatuur en raamstand. Op het scherm verschijnt waarschuwing of ok. Programmeer de logica met blokken; klik op ▶ om te testen met de schuifregelaars voor temperatuur en raamstand.",
      instruction:
        "Maak een programma. Als de temperatuur hoger is dan 25 en het raam open staat, toon waarschuwing. Anders toon ok.",
      config: {
        device: "sensor",
        codingSteps: [
          "Lees de temperatuur en de raamstand.",
          "Gebruik de voorwaarde temperatuur hoger dan 25 EN raam open.",
          "Toon waarschuwing in de dan-tak.",
          "Toon ok in de anders-tak.",
        ],
        blocks: [
          block("bij start", "gebeurtenissen", { isContainer: true }),
          block("lees temperatuur", "waarnemen"),
          block("lees raamstand", "waarnemen"),
          block("als (temperatuur > 25) EN (raam = open) dan", "besturing", {
            isContainer: true,
          }),
          block("als (temperatuur > 25) OF (raam = open) dan", "besturing", {
            isContainer: true,
            isCriticalDistractor: true,
          }),
          block("als (temperatuur < 25) EN (raam = open) dan", "besturing", {
            isContainer: true,
            isCriticalDistractor: true,
          }),
          block('toon "waarschuwing"', "uiterlijk"),
          block('toon "ok"', "uiterlijk"),
          block('toon "koud"', "uiterlijk"),
          block("anders", "besturing", { isContainer: true }),
          block("herhaal altijd", "besturing", { isContainer: true }),
          block("verwijder temperatuur", "data"),
          block("zet temperatuur op 0", "variabelen"),
          block("speel alarmgeluid", "geluid"),
        ],
        correctProgram: [
          "bij start",
          "lees temperatuur",
          "lees raamstand",
          "als (temperatuur > 25) EN (raam = open) dan",
          'toon "waarschuwing"',
          "anders",
          'toon "ok"',
        ],
        rules: [
          {
            id: "read",
            description: "temperatuur en raamstand worden gelezen.",
            points: 1,
            requiredBlocks: ["lees temperatuur", "lees raamstand"],
          },
          {
            id: "condition",
            description: "juiste EN-voorwaarde gekozen.",
            points: 1,
            requiredBlocks: ["als (temperatuur > 25) EN (raam = open) dan"],
          },
          {
            id: "branches",
            description: "waarschuwing in juiste tak en ok in anders-tak.",
            points: 1,
            nestedBlocks: [
              {
                parent: "als (temperatuur > 25) EN (raam = open) dan",
                child: 'toon "waarschuwing"',
              },
              { parent: "anders", child: 'toon "ok"' },
            ],
          },
          {
            id: "behavior",
            description:
              "eindgedrag bij testwaarden klopt en er is geen kritieke afleider gebruikt.",
            points: 1,
            requireExecuted: true,
            requiredBlocks: ["lees temperatuur", "lees raamstand"],
            nestedBlocks: [
              {
                parent: "als (temperatuur > 25) EN (raam = open) dan",
                child: 'toon "waarschuwing"',
              },
              { parent: "anders", child: 'toon "ok"' },
            ],
            forbiddenBlocks: [
              "als (temperatuur > 25) OF (raam = open) dan",
              "als (temperatuur < 25) EN (raam = open) dan",
            ],
          },
        ],
      },
    },
    pt8: {
      id: "lj3h-pt8-online",
      title: "PT8 - Online gedrag: gemanipuleerde video",
      instruction:
        "Beoordeel de video.\nKies twee verdachte signalen.\nKies een verificatieactie.",
      kerndoel: "21D, 21B, 23B, 23C",
      aiSnelVeranderendFlag: true,
      config: {
        screens: [
          {
            id: "video",
            title: "Gemanipuleerde video",
            instruction:
              'Je ziet op een sociaal platform een video waarin een docent iets raars lijkt te zeggen. De video staat op een anoniem account zonder profielinformatie. De mondbeweging klopt niet goed met de stem. Onder de video staat: "Deel dit voordat school het verwijdert." Er is geen bron of context.',
            body:
              "Verifiëren = de informatie controleren via een officieel kanaal (bv. de school zelf, je mentor, een betrouwbare nieuwsbron).",
            groups: [
              {
                id: "judgement",
                title: "Beoordeel de video",
                inputType: "single",
                options: fixedOptions([
                  "waarschijnlijk echt",
                  "twijfelachtig",
                  "waarschijnlijk gemanipuleerd of nep",
                ]),
              },
              {
                id: "signals",
                title: "Klik twee verdachte signalen aan",
                inputType: "multi",
                options: fixedOptions([
                  "anoniem account",
                  "mondbeweging klopt niet",
                  'urgentie "deel dit"',
                  "geen bron/context",
                ]),
              },
              {
                id: "verifyAction",
                title: "Kies één verificatieactie",
                inputType: "single",
                options: fixedOptions([
                  "Check via officiele school/mentor of betrouwbare bron",
                  "Deel de video in de klas om te vragen of het klopt",
                  "Kijk alleen naar de reacties onder de video",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "judgement",
            description: "juiste beoordeling.",
            points: 1,
            groupId: "judgement",
            kind: "singleCorrect",
            correctOptionIds: ["waarschijnlijk gemanipuleerd of nep", "twijfelachtig"],
          },
          {
            id: "signals",
            description: "minstens twee juiste signalen.",
            points: 1,
            groupId: "signals",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: [
              "anoniem account",
              "mondbeweging klopt niet",
              'urgentie "deel dit"',
              "geen bron/context",
            ],
          },
          {
            id: "verify",
            description: "juiste verificatieactie.",
            points: 1,
            groupId: "verifyAction",
            kind: "singleCorrect",
            correctOptionIds: ["Check via officiele school/mentor of betrouwbare bron"],
          },
        ],
      },
    },
    sr: [
      {
        id: "lj3h-sr1-bias",
        title: "SR1 - AI bias en trainingsdata",
        kerndoel: "21D",
        question: "Waarom kan een AI-systeem scheve of oneerlijke uitkomsten geven?",
        options: [
          "Omdat trainingsdata onvolledig of scheef kunnen zijn.",
          "Omdat de vraag soms niet precies genoeg is.",
          "Omdat het systeem op een druk moment trager werkt.",
          "Omdat de gebruiker een nieuw account heeft.",
        ],
        correct: "Omdat trainingsdata onvolledig of scheef kunnen zijn.",
        aiSnelVeranderendFlag: true,
      },
      {
        id: "lj3h-sr2-regulation",
        title: "SR2 - Regulering",
        kerndoel: "23C",
        question:
          "Waarom worden grote digitale platforms en AI-systemen vaak op EU-niveau gereguleerd?",
        options: [
          "Omdat één land vaak te weinig invloed heeft op wereldwijde bedrijven.",
          "Omdat alleen Brussel mag beslissen over digitale regels.",
          "Omdat alle techbedrijven in Nederland zitten.",
          "Omdat AI zonder regels altijd eerlijk werkt.",
        ],
        correct: "Omdat één land vaak te weinig invloed heeft op wereldwijde bedrijven.",
        aiSnelVeranderendFlag: true,
      },
      {
        id: "lj3h-sr3-hallucination",
        title: "SR3 - AI-bron controleren",
        kerndoel: "21D",
        question:
          "Een AI-tool noemt een wetenschappelijk artikel met titel en auteurs. Je vindt het artikel niet in zoeksystemen. Wat is waarschijnlijk?",
        options: [
          "De AI heeft het artikel waarschijnlijk verzonnen.",
          "Het artikel staat mogelijk in een tijdschrift zonder open toegang.",
          "Je zoekt misschien in een database die niet alles indexeert.",
          "De titel kan licht anders gespeld zijn in de bron.",
        ],
        correct: "De AI heeft het artikel waarschijnlijk verzonnen.",
        aiSnelVeranderendFlag: true,
      },
      {
        id: "lj3h-sr4-filter",
        title: "SR4 - Filter bubble en polarisatie",
        kerndoel: "21B",
        question:
          "Wat is een mogelijk maatschappelijk effect van algoritmische selectie van nieuws?",
        options: [
          "Mensen zien vaker berichten die hun eigen mening bevestigen.",
          "Iedereen ziet uiteindelijk hetzelfde nieuws.",
          "Nieuws wordt automatisch waar.",
          "Algoritmes verminderen verschil van mening.",
        ],
        correct:
          "Mensen zien vaker berichten die hun eigen mening bevestigen.",
      },
      {
        id: "lj3h-sr5-cc-sa",
        title: "SR5 - Open licenties",
        kerndoel: "22A",
        question: "Wat betekent het als content een Creative Commons BY-SA-licentie heeft?",
        options: [
          "Je noemt de maker en deelt jouw versie onder dezelfde licentie.",
          "Je mag het alleen voor commercieel gebruik gebruiken.",
          "Je hoeft niets te vermelden.",
          "Het mag alleen op papier worden gedeeld.",
        ],
        correct:
          "Je noemt de maker en deelt jouw versie onder dezelfde licentie.",
      },
      {
        id: "lj3h-sr6-energy",
        title: "SR6 - Energie en duurzaamheid",
        kerndoel: "23C",
        question:
          "Welk aspect maakt het trainen van grote AI-modellen relatief energie-intensief?",
        options: [
          "Het rekenen op grote datasets vereist langdurig veel rekenkracht in datacenters.",
          "De modellen worden vooral getraind op gewone laptops van gebruikers.",
          "De meeste energie gaat naar het tonen van het icoon van de app.",
          "Na de training gebruikt een AI-systeem geen elektriciteit meer.",
        ],
        correct:
          "Het rekenen op grote datasets vereist langdurig veel rekenkracht in datacenters.",
      },
    ],
  },
];

export const assessments: AssessmentVersion[] = versionSpecs.map(buildAssessment);

export const assessmentMap: Record<AssessmentVersionId, AssessmentVersion> =
  assessments.reduce(
    (map, assessment) => ({
      ...map,
      [assessment.id]: assessment,
    }),
    {} as Record<AssessmentVersionId, AssessmentVersion>,
  );

export const defaultCodeMappings: CodeMapping[] = [
  { codes: ["vmbo1", "6663"], instrumentId: "lj1-vmbo", label: "Leerjaar 1 VMBO" },
  { codes: ["hv1"], instrumentId: "lj1-hv", label: "Leerjaar 1 HAVO/VWO" },
  { codes: ["vmbo3", "vmbo 3"], instrumentId: "lj3-vmbo", label: "Leerjaar 3 VMBO" },
  { codes: ["hv3"], instrumentId: "lj3-hv", label: "Leerjaar 3 HAVO/VWO" },
];
