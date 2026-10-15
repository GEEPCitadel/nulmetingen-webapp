import { createGroupReportDocument, formatReportNumber as n, groupReportComparison,
  reportGoalLabels, reportMeasurementLabel, reportSubgoals } from "./group-report-document";
import type { GroupReports, ReportGroup, ReportMetric, ReportScope } from "./group-report-document";

type Jpeg = { bytes: Uint8Array; width: number; height: number };
const W = 595, H = 842, LEFT = 36, WIDTH = 523, BOTTOM = 718;
const navy = "0.086 0.271 0.365", gray = "0.35 0.38 0.42", cream = "0.961 0.949 0.922";
// Keep the built-in PDF font encoding explicit and the byte offsets reproducible.
const ascii = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[–—−]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/·/g, " | ")
  .replace(/[^\x20-\x7e]/g, "?");
const literal = (s: string) => ascii(s).replace(/[\\()]/g, c => `\\${c}`);
// Conservative width bound: no glyph in the Latin Helvetica font is wider than 1 em.
// Narrow glyphs use safe upper bounds; this deliberately wraps before clipping.
const textWidth = (s: string, size: number) => [...ascii(s)].reduce((sum, c) => sum +
  ("ilI.,:;'!| ".includes(c) ? .32 : "mwMW@%".includes(c) ? 1 : .7) * size, 0);
const wrap = (s: string, width: number, size: number) => {
  const lines: string[] = []; let line = "";
  for (const word of ascii(s).split(/\s+/)) {
    if (line && textWidth(`${line} ${word}`, size) > width) { lines.push(line); line = ""; }
    for (const c of word) {
      if (line && textWidth(line + c, size) > width) { lines.push(line); line = ""; }
      line += c;
    }
    line += " ";
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
};
const scoreColour = (p: number) => {
  const pct = Math.max(0, Math.min(100, p)), t = (pct <= 50 ? pct : pct - 50) / 50;
  const a = pct <= 50 ? [191,48,59] : [173,114,0], b = pct <= 50 ? [173,114,0] : [20,121,71];
  return a.map((v, i) => ((v * (1-t) + b[i] * t)/255).toFixed(4)).join(" ");
};

/** Vector PDF from the same authorized, privacy-filtered snapshot as the screen.
 * No database writes, individual records, network calls or external PDF service. */
export function createGroupReportPdf(snapshot: GroupReports, scope: ReportScope,
  filters: Record<string, string> = {}, logo?: Jpeg): Uint8Array {
  // Reuse screen schema/date validation; do not accept older weaker privacy data.
  createGroupReportDocument(snapshot, scope, "https://report.invalid", filters);
  const groups = scope === "class" ? snapshot.byClass : scope === "grade" ? snapshot.byGrade : snapshot.byMeasurement;
  const generated = new Date(snapshot.generatedAt).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" });
  const pages: string[] = []; let commands: string[] = [], y = 108;
  let active: ReportGroup | null = null;
  const add = (s: string) => { commands.push(s); };
  const rect = (x: number, top: number, w: number, h: number, colour: string) => {
    const b = H-top-h, r = x === 0 && top === 0 ? 0 : 9, k = .55228475*r;
    if (!r) {add(`q ${colour} rg ${x} ${b} ${w} ${h} re f Q`); return;}
    add(`q ${colour} rg ${x+r} ${b} m ${x+w-r} ${b} l ${x+w-r+k} ${b} ${x+w} ${b+r-k} ${x+w} ${b+r} c ${x+w} ${b+h-r} l ${x+w} ${b+h-r+k} ${x+w-r+k} ${b+h} ${x+w-r} ${b+h} c ${x+r} ${b+h} l ${x+r-k} ${b+h} ${x} ${b+h-r+k} ${x} ${b+h-r} c ${x} ${b+r} l ${x} ${b+r-k} ${x+r-k} ${b} ${x+r} ${b} c f Q`);
  };
  const text = (s: string, x: number, top: number, size = 10, bold = false, colour = navy) =>
    add(`BT /${bold ? "F2" : "F1"} ${size} Tf ${colour} rg ${x} ${H-top-size} Td (${literal(s)}) Tj ET`);
  const paragraphAt = (s: string, x: number, top: number, width: number, size = 9, colour = gray) => {
    const lines = wrap(s, width, size);
    lines.forEach((line, i) => text(line, x, top + i * (size+4), size, false, colour));
    return lines.length * (size+4);
  };
  const footer = () => {
    let top = 744;
    const lines = active ? [
      `Meting: ${reportMeasurementLabel(active.metadata.versionId)} | Periode: ${active.metadata.assessmentWindow || "niet vastgelegd"} | Cohort: ${active.metadata.cohort || "niet vastgelegd"}`,
      `Inhoudsversie: ${active.metadata.assessmentBuildVersion || "onbekend"}`,
      `Kenmerk: ${active.metadata.contentKey || "onbekend"}`,
    ] : [];
    // Footer stays bounded even with imported, unusually long class metadata.
    // Full identifiers are included on the final provenance pages below.
    for (const line of lines) {
      const pieces = wrap(line, WIDTH, 7);
      text(pieces.length > 1 ? pieces[0].slice(0, -3) + "..." : pieces[0], LEFT, top, 7, false, gray);
      top += 11;
    }
    text(`Gegenereerd ${generated} | Momentopname | Pagina ${pages.length+1}`, LEFT, Math.max(top, 802), 7);
    pages.push(commands.join("\n")); commands = [];
  };
  const start = (title: string) => {
    rect(0, 0, W, H, cream);
    if (logo) add(`q 88 0 0 ${88*logo.height/logo.width} ${LEFT} ${H-86} cm /Logo Do Q`);
    else text("citadel college", LEFT, 45, 15, true);
    text("Digitale geletterdheid", 325, 43, 12, true);
    text(generated, 325, 62, 8, false, gray);
    y = 108;
    const height = wrap(title, WIDTH-28, 20).length * 24 + 22;
    rect(LEFT, y, WIDTH, height, "0.871 0.831 0.729");
    paragraphAt(title, LEFT+14, y+11, WIDTH-28, 20, navy);
    y += height + 14;
  };
  const ensure = (height: number) => {
    if (y+height > BOTTOM) { footer(); start("Resultaten - vervolg"); }
  };
  const paragraph = (s: string, size = 9, colour = gray) => {
    for (const line of wrap(s, WIDTH, size)) { ensure(size+4); text(line, LEFT, y, size, false, colour); y += size+4; }
    y += 7;
  };
  const ring = (p: number, x: number, top: number, self = false) => {
    const pct = Math.max(0, Math.min(100, p)), r = 23, cx = x+28, cy = H-top-28;
    const arc = (fraction: number, colour: string) => {
      if (fraction <= 0) return;
      const steps = Math.max(2, Math.ceil(120*fraction));
      let path = `q ${colour} RG 6 w `;
      for (let i = 0; i <= steps; i++) {
        const angle = Math.PI/2 - 2*Math.PI*fraction*i/steps;
        path += `${(cx+r*Math.cos(angle)).toFixed(3)} ${(cy+r*Math.sin(angle)).toFixed(3)} ${i ? "l" : "m"} `;
      }
      add(path + "S Q");
    };
    arc(1, "0.882 0.906 0.925"); arc(pct/100, self ? "0.031 0.482 0.663" : scoreColour(pct));
    const label = `${n(pct)}${self ? "" : "%"}`;
    text(label, cx - textWidth(label, 10)/2, top+21, 10, true);
  };
  const tile = (title: string, description: string, data: ReportMetric | null, x: number, top: number, w: number, h: number,
    self?: {mean: number; sampleCount: number} | null) => {
    rect(x, top, w, h, "1 1 1");
    let ty = top+12;
    ty += paragraphAt(title, x+12, ty, w-24, 11, navy) + 2;
    if (description) ty += paragraphAt(description, x+12, ty, w-24, 8, navy) + 4;
    if (self) {
      ring(self.mean, x+12, ty, true);
      paragraphAt(`${n(self.mean)} van 100`, x+76, ty+13, w-88, 10, navy);
      paragraphAt(`${self.sampleCount} geldige zelfinschattingen`, x+12, top+h-28, w-24, 8);
    } else if (data) {
      if (data.reportingMode === "signal") {
        paragraphAt("1 opdracht", x+12, ty+14, 60, 9);
      } else ring(data.percentage!, x+12, ty);
      paragraphAt(`${n(data.averagePoints, 2)} van ${n(data.maxPoints, 2)} punten`, x+76, ty+13, w-88, 9, navy);
      paragraphAt(`${data.reportingMode === "signal" ? "Itemsignaal | " : ""}${data.itemCount} opdracht${data.itemCount === 1 ? "" : "en"} | n=${data.sampleCount}`, x+12, top+h-28, w-24, 8);
    } else paragraphAt("Geen score: gegevens ontbreken of de groep is afgeschermd.", x+12, ty+8, w-24, 9);
  };
  const grid = (ids: string[]) => {
    const cols = 3, gap = 10, w = (WIDTH-2*gap)/3, height = 148;
    for (let i = 0; i < ids.length; i += cols) {
      ensure(height+12);
      ids.slice(i, i+cols).forEach((id, j) => tile(id.length === 2 ? `Kerndoel ${id}` : id,
        reportGoalLabels[id] ?? id, active!.goals[id] ?? null, LEFT+j*(w+gap), y, w, height));
      y += height+12;
    }
  };
  if (!groups.length) {
    start("Nog geen rapportgegevens"); paragraph("Er zijn geen klassen of afnames binnen deze selectie. Pas de filters in beheer aan en genereer opnieuw."); footer();
  }
  for (const group of groups) {
    active = group;
    const heading = scope === "class" ? `Klas ${group.metadata.classCode}` : scope === "grade" ? `Leerjaar ${group.metadata.gradeLevel.replace(/^lj/, "")}` : reportMeasurementLabel(group.metadata.versionId);
    start(heading);
    paragraph(`Gemaakte meting: ${reportMeasurementLabel(group.metadata.versionId)}`, 11, navy);
    paragraph(`${group.completedCount} opgeslagen eindresultaten | ${group.createdCodes} uitgegeven codes`);
    if (group.missingResultCount) paragraph(`Opslagcontrole: ${group.missingResultCount} code(s) staan als afgerond, maar het resultaat ontbreekt binnen deze selectie. Controleer ook de afnameperiode. Niet als nul gescoord.`, 10, "0.58 0.30 0");
    if (group.excludedFromTotalCount) paragraph(`${group.excludedFromTotalCount} eindresultaten niet meegenomen: groep afgeschermd, inhoudsversie onbekend of vergelijkbare puntgegevens ontbreken.`, 9, "0.58 0.30 0");
    ensure(152);
    tile("Gemiddelde zelfinschatting", "Zelfbeeld voor de meting", null, LEFT, y, (WIDTH-12)/2, 140, group.selfAssessment);
    tile("Gemiddelde itemsetscore", "Score op deze opdrachten", group.total, LEFT+(WIDTH+12)/2, y, (WIDTH-12)/2, 140);
    y += 152;
    paragraph(groupReportComparison(group), 10, navy);
    ensure(28); text("Resultaten per kerndoel", LEFT, y, 14, true); y += 28;
    grid(["21", "22", "23"]);
    paragraph("Kleur toont het behaalde puntaandeel, geen grens voor voldoende of beheersing. Zelfinschatting blijft neutraal blauw. Codes zijn geen gecontroleerde klassenlijst. Dit is een formatieve/pilotmeting, geen gevalideerde vaardigheidsschaal.", 8);
    footer();
    start("Subdoelen in beeld"); paragraph(`${heading} | ${reportMeasurementLabel(group.metadata.versionId)}`);
    grid(reportSubgoals);
    paragraph("Bij een opdracht blijft het een itemsignaal: alleen punten, geen percentage. Een opdracht kan bij meerdere subdoelen meetellen: tel de punten niet bij elkaar op. Getallen zijn afzonderlijk afgerond vanuit ongeronde gemiddelden.", 8);
    footer();
    if (scope !== "class") {
      start("Klassen in deze selectie");
      paragraph(`${heading} | ${reportMeasurementLabel(group.metadata.versionId)}`);
      paragraph("Verschillende metingen, inhoudsversies, periodes en cohorten blijven aparte profielen; geen gezamenlijk scoregemiddelde. Alleen voldoende grote, vergelijkbare klassen tellen mee in het gemiddelde.");
      for (const member of group.classes) paragraph(`Klas ${member.classCode}: ${member.completedCount} eindresultaten, ${member.createdCodes} codes. ${member.includedInTotal ? "Meegenomen in itemsetscore." : "Niet meegenomen in itemsetscore."}`, 10, navy);
      paragraph("Gemaakte meting is niet hetzelfde als het onderwijsniveau van de klas. In 2026 hebben onder meer de VMBO-T-klassen 1C en 3T de HAVO/VWO-meting gemaakt.");
      footer();
    }
  }
  // A final selection/provenance page prevents technical metadata crowding the start.
  active = null; start("Over dit overzicht");
  paragraph("Alleen klassen binnen de gekozen filters en je toegangsrechten. Ieder nieuw overzicht haalt actuele gegevens op; dit bestand blijft een gedateerde momentopname.");
  const names: Record<string, string> = { assessmentWindow: "Periode", gradeLevel: "Leerjaar", track: "Metingniveau", classCode: "Klas", cohort: "Cohort", assessmentId: "Meting" };
  for (const [key, value] of Object.entries(filters).filter(([, v]) => v)) paragraph(`${names[key] ?? key}: ${value}`);
  paragraph(`Groepsscores worden pas getoond vanaf ${snapshot.minimumReportingCount} vergelijkbare eindresultaten per klas. Ontbrekende zelfinschattingen tellen niet als nul. De aantallen kunnen per gemiddelde verschillen.`);
  paragraph("De vergelijking tussen zelfbeeld en itemsetscore is een eerste indruk op groepsniveau. Ze is geen bewijs dat individuele leerlingen zichzelf over- of onderschatten.");
  for (const group of groups) {
    paragraph(`Profiel: ${scope === "class" ? group.metadata.classCode : reportMeasurementLabel(group.metadata.versionId)}`, 10, navy);
    for (const [key, label] of [["assessmentWindow", "Periode"], ["cohort", "Cohort"], ["assessmentBuildVersion", "Inhoudsversie"], ["contentKey", "Inhoudskenmerk"]]) {
      paragraph(`${label}: ${group.metadata[key] || "niet vastgelegd"}`, 8);
    }
  }
  footer();

  const enc = new TextEncoder();
  const pageStart = logo ? 6 : 5;
  const ids = pages.map((_, i) => pageStart+2*i);
  const objects: Uint8Array[] = [
    enc.encode("<< /Type /Catalog /Pages 2 0 R /Lang (nl-NL) >>"),
    enc.encode(`<< /Type /Pages /Kids [${ids.map(id => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`),
    enc.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    enc.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
  ];
  const concat = (parts: Uint8Array[]) => {
    const out = new Uint8Array(parts.reduce((sum, p) => sum+p.length, 0)); let pos = 0;
    parts.forEach(p => {out.set(p,pos);pos+=p.length;}); return out;
  };
  if (logo) objects.push(concat([enc.encode(`<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\nstream\n`),logo.bytes,enc.encode("\nendstream")]));
  pages.forEach((stream, i) => {
    objects.push(enc.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> ${logo ? "/XObject << /Logo 5 0 R >>" : ""} >> /Contents ${ids[i]+1} 0 R >>`));
    objects.push(enc.encode(`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}\nendstream`));
  });
  const parts = [enc.encode("%PDF-1.4\n")], offsets = [0]; let length = parts[0].length;
  objects.forEach((object, i) => {
    offsets.push(length); const bytes = concat([enc.encode(`${i+1} 0 obj\n`),object,enc.encode("\nendobj\n")]);
    parts.push(bytes); length += bytes.length;
  });
  parts.push(enc.encode(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(v=>`${String(v).padStart(10,"0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF`));
  return concat(parts);
}

/** Use only the app's own public logo. No authentication or pupil data is sent. */
export async function loadGroupReportLogo(): Promise<Jpeg> {
  const image = new Image(); image.src = "/brand/logos/citadel-logo-5-fc.png";
  await image.decode();
  const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Het rapportlogo kon niet worden gemaakt.");
  context.fillStyle = "white"; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(image,0,0);
  const binary = atob(canvas.toDataURL("image/jpeg", .95).split(",")[1]);
  return {bytes:Uint8Array.from(binary,c=>c.charCodeAt(0)),width:canvas.width,height:canvas.height};
}

