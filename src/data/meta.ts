import type { ThemeDefinition } from "../types";

export const ADMIN_CODE = "beheer";

export const themes: Record<string, ThemeDefinition> = {
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


export const sloLabels: Record<string, string> = {
  "21": "De leerling zet digitale technologie en digitale media in.",
  "21A": "De leerling zet digitale systemen functioneel in.",
  "21B":
    "De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.",
  "21C": "De leerling verkent het gebruik van data en dataverwerking.",
  "21D": "De leerling verkent mogelijkheden en beperkingen van AI.",
  "22": "De leerling creëert digitale producten.",
  "22A":
    "De leerling gebruikt passende werkwijzen bij het creëren en gebruiken van verschillende typen digitale producten.",
  "22B":
    "De leerling programmeert een computerprogramma met behulp van computationele denkstrategieën.",
  "23": "De leerling participeert in de gedigitaliseerde wereld.",
  "23A":
    "De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.",
  "23B":
    "De leerling maakt weloverwogen keuzes bij het gebruik van digitale technologie en digitale media.",
  "23C":
    "De leerling analyseert hoe digitale technologie, digitale media en de samenleving elkaar wederzijds beïnvloeden.",
};
