export type ReportMetric = {
  averagePoints: number; maxPoints: number; itemCount: number; sampleCount: number;
  reportingMode: "percentage" | "signal"; percentage: number | null;
};
export type ReportGroup = {
  metadata: Record<string, string>;
  completedCount: number; createdCodes: number; startedCount: number;
  registeredCompletedCount: number; missingResultCount: number;
  total: ReportMetric | null;
  selfAssessment: { mean: number; sampleCount: number } | null;
  goals: Record<string, ReportMetric | null>;
  excludedFromTotalCount: number; comparisonAvailable: boolean; reportable: boolean;
  classes: { classCode: string; completedCount: number; createdCodes: number;
    startedCount: number; registeredCompletedCount: number; missingResultCount: number; includedInTotal: boolean }[];
};
export type GroupReports = {
  schemaVersion: number; generatedAt: string; minimumReportingCount: number;
  byClass: ReportGroup[]; byGrade: ReportGroup[]; byMeasurement: ReportGroup[];
};
export type ReportScope = "class" | "grade" | "measurement";
const labels: Record<string, string> = {
  "21": "Digitale technologie en media gebruiken", "22": "Digitale producten maken", "23": "Deelnemen aan de digitale wereld",
  "21A": "Digitale systemen gebruiken", "21B": "Informatie zoeken en beoordelen", "21C": "Data gebruiken en verwerken", "21D": "Mogelijkheden en beperkingen van AI",
  "22A": "Digitale producten en auteursrecht", "22B": "Programmeren", "23A": "Veiligheid en privacy", "23B": "Bewuste digitale keuzes", "23C": "Digitale technologie en samenleving",
};
const subgoals = ["21A", "21B", "21C", "21D", "22A", "22B", "23A", "23B", "23C"];
const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
const num = (value: number, digits = 1) => Number.isFinite(value) ? value.toLocaleString("nl-NL", { maximumFractionDigits: digits }) : "Niet beschikbaar";
const scoreColour = (value: number) => {
  const pct = Math.max(0, Math.min(100, value));
  const stops = pct <= 50 ? [[191,48,59], [173,114,0]] : [[173,114,0], [20,121,71]];
  const t = (pct <= 50 ? pct : pct - 50) / 50;
  return `rgb(${stops[0].map((start, i) => Math.round(start * (1 - t) + stops[1][i] * t)).join(",")})`;
};
const ring = (value: number, self = false) => {
  const pct = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * 32;
  const text = `${num(pct)}${self ? "" : "%"}`;
  return `<svg class="donut" viewBox="0 0 84 84" role="img" aria-label="${escape(self ? `Zelfinschatting ${text} op schaal 0 tot 100` : `${text} van de mogelijke punten`)}"><circle cx="42" cy="42" r="32" fill="none" stroke="#e1e7ec" stroke-width="9"/><circle cx="42" cy="42" r="32" fill="none" stroke="${self ? "#087ba9" : scoreColour(pct)}" stroke-width="9" stroke-dasharray="${circumference * pct / 100} ${circumference}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle">${escape(text)}</text></svg>`;
};
const signal = `<div class="signal" role="img" aria-label="Itemsignaal uit één opdracht, geen percentage">1<small>opdracht</small></div>`;
const unavailable = `<p class="muted">Geen voldoende grote, vergelijkbare groep of gegevens ontbreken. Geen score weergegeven.</p>`;
const metric = (id: string, data: ReportMetric | null) => `<section class="tile"><h3>${id.length === 2 ? "Kerndoel " : ""}${escape(id)}</h3><p class="goal-name">${escape(labels[id] ?? id)}</p>${data ? `<div class="metric-body">${data.reportingMode === "signal" ? signal : ring(data.percentage!)}<div><strong>${num(data.averagePoints, 2)} van ${num(data.maxPoints, 2)}</strong><span>punten gemiddeld</span></div></div><p class="muted">${data.reportingMode === "signal" ? "Itemsignaal · " : ""}${data.itemCount} opdracht${data.itemCount === 1 ? "" : "en"} · n = ${data.sampleCount}</p>` : unavailable}</section>`;
const measurement = (version: string) => ({ "lj1-vmbo": "Leerjaar 1 VMBO", "lj1-hv": "Leerjaar 1 HAVO/VWO", "lj3-vmbo": "Leerjaar 3 VMBO", "lj3-hv": "Leerjaar 3 HAVO/VWO" }[version] ?? version);

function comparison(group: ReportGroup) {
  if (!group.total || !group.selfAssessment) return "De vergelijking is niet beschikbaar: onvoldoende geldige, vergelijkbare gegevens.";
  if (!group.comparisonAvailable) return "De zelfinschatting en itemsetscore zijn niet gebaseerd op precies dezelfde groep. Vergelijk deze gemiddelden daarom niet als een gezamenlijke groepsinschatting.";
  const self = Math.round(group.selfAssessment.mean * 10), score = Math.round(group.total.percentage! * 10);
  if (self === score) return "De weergegeven gemiddelde zelfinschatting en itemsetscore liggen dicht bij elkaar. Op groepsniveau lijken zelfbeeld en prestaties op deze opdrachten redelijk aan te sluiten.";
  const higher = self > score;
  return `De groep schat zichzelf gemiddeld ${higher ? "hoger" : "lager"} in dan de score op deze opdrachten. Dit kan wijzen op zelf${higher ? "overschatting" : "onderschatting"}, maar is vooral een aanleiding om het zelfbeeld en de resultaten samen te bespreken.`;
}

// Shared semantics for the screen and the directly downloadable PDF.
export { labels as reportGoalLabels, subgoals as reportSubgoals, num as formatReportNumber,
  measurement as reportMeasurementLabel, comparison as groupReportComparison };

export function createGroupReportDocument(snapshot: GroupReports, scope: ReportScope, origin: string, filters: Record<string, string> = {}) {
  if (snapshot.schemaVersion !== 1 || snapshot.minimumReportingCount < 5) throw new Error("Deze rapportgegevens worden niet ondersteund.");
  const date = new Date(snapshot.generatedAt);
  if (!Number.isFinite(date.getTime())) throw new Error("De generatiedatum ontbreekt.");
  const base = new URL(origin);
  if (!["http:", "https:"].includes(base.protocol)) throw new Error("Onbekende website voor het rapport.");
  const groups = scope === "class" ? snapshot.byClass : scope === "grade" ? snapshot.byGrade : snapshot.byMeasurement;
  const title = scope === "class" ? "Resultaten per klas" : scope === "grade" ? "Resultaten per leerjaar" : "Resultaten per meting";
  const generated = date.toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" });
  const selection = Object.entries(filters).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(" · ");
  const header = `<header><img src="${escape(base.origin)}/brand/logos/citadel-logo-5-fc.png" alt="Citadel College"/><div>Digitale geletterdheid<br><small>${escape(generated)} · momentopname</small></div></header>`;
  const footer = (group: ReportGroup) => `<footer>Meting: ${escape(measurement(group.metadata.versionId))} · Periode: ${escape(group.metadata.assessmentWindow || "niet vastgelegd")} · Cohort: ${escape(group.metadata.cohort || "niet vastgelegd")}<br>Inhoudsversie: ${escape(group.metadata.assessmentBuildVersion || "onbekend")} · Kenmerk: ${escape(group.metadata.contentKey || "onbekend")}<br>Gegenereerd ${escape(generated)}. Alleen bevoegde, geselecteerde klassen. Korte omschrijvingen van doelen; geen gevalideerde vaardigheidsschaal.</footer>`;
  const pages = groups.map(group => {
    const heading = scope === "class" ? `Klas ${group.metadata.classCode}` : scope === "grade" ? `Leerjaar ${group.metadata.gradeLevel.replace(/^lj/, "")}` : measurement(group.metadata.versionId);
    const band = `<div class="band"><h1>${escape(heading)}</h1><p>Gemaakte meting: ${escape(measurement(group.metadata.versionId))}</p><p>${group.completedCount} opgeslagen eindresultaten · ${group.createdCodes} uitgegeven codes</p></div>`;
    const alert = group.missingResultCount ? `<p class="attention" role="alert">Opslagcontrole: ${group.missingResultCount} code(s) staan als afgerond, maar het resultaat is niet teruggevonden binnen deze selectie. Controleer ook de afnameperiode. Deze afnames worden niet als nul gescoord.</p>` : "";
    const excluded = group.excludedFromTotalCount ? `<p class="attention">${group.excludedFromTotalCount} eindresultaat/resultaten niet meegenomen in de itemsetscore: een groep is afgeschermd, de inhoudsversie is onbekend of vergelijkbare puntgegevens ontbreken.</p>` : "";
    const tops = `<div class="grid2"><section class="tile"><h2>Gemiddelde zelfinschatting</h2>${group.selfAssessment ? `<div class="metric-body">${ring(group.selfAssessment.mean, true)}<div><strong>${num(group.selfAssessment.mean)} van 100</strong><span>Zelfbeeld vóór de meting</span></div></div><p class="muted">${group.selfAssessment.sampleCount} geldige zelfinschattingen. Ontbrekend is niet nul.</p>` : unavailable}</section><section class="tile"><h2>Gemiddelde itemsetscore</h2>${group.total ? `<div class="metric-body">${ring(group.total.percentage!)}<div><strong>${num(group.total.averagePoints, 2)} van ${num(group.total.maxPoints, 2)} punten</strong><span>${group.total.itemCount} opdrachten · n = ${group.total.sampleCount}</span></div></div>` : unavailable}</section></div>`;
    const part1 = `<article class="sheet">${header}${band}${alert}${excluded}${tops}<p class="interpretation">${escape(comparison(group))}</p><h2>Resultaten per kerndoel</h2><div class="grid3">${["21", "22", "23"].map(id => metric(id, group.goals[id])).join("")}</div><p class="muted">Kleur volgt het behaalde puntaandeel, niet een grens voor voldoende of beheersing. Zelfinschatting blijft neutraal blauw. Opdrachten hebben verschillende gewichten. Codes zijn geen gecontroleerde klassenlijst.</p>${footer(group)}</article>`;
    const part2 = `<article class="sheet">${header}<div class="band"><h1>Subdoelen in beeld</h1><p>${escape(heading)} · ${escape(measurement(group.metadata.versionId))}</p></div><div class="grid3">${subgoals.map(id => metric(id, group.goals[id])).join("")}</div><p class="muted">Bij één opdracht blijft het een itemsignaal: alleen punten, geen percentage. Een klasgemiddelde maakt één opdracht niet tot een brede meting. Een opdracht kan bij meerdere subdoelen meetellen: tel de punten niet bij elkaar op. Getallen zijn afzonderlijk afgerond vanuit ongeronde gemiddelden.</p>${footer(group)}</article>`;
    const members = `<article class="sheet">${header}<div class="band"><h1>Klassen in deze selectie</h1><p>${escape(heading)} · ${escape(measurement(group.metadata.versionId))}</p></div><table><thead><tr><th>Klas</th><th>Eindresultaten</th><th>Codes</th><th>In itemsetscore</th><th>Opslagcontrole</th></tr></thead><tbody>${group.classes.map(member => `<tr><th scope="row">${escape(member.classCode || "Niet vastgelegd")}</th><td>${member.completedCount}</td><td>${member.createdCodes}</td><td>${member.includedInTotal ? "Ja" : "Nee"}</td><td>${member.missingResultCount || "Geen signaal"}</td></tr>`).join("")}</tbody></table><p>Klassen worden alleen samengevoegd binnen dezelfde meting, inhoudsversie, periode en cohort. VMBO en HAVO/VWO hebben geen gezamenlijk scoregemiddelde.</p><p>Kleine klassen worden niet via een gepoold gemiddelde alsnog ontsloten. Verschillende aantallen geldige antwoorden kunnen betekenen dat een kengetal op minder afnames is gebaseerd.</p><p>Het genoemde niveau beschrijft de gemaakte meting, niet noodzakelijk het onderwijsniveau van de klas. In 2026 hebben de VMBO-T-klassen 1C en 3T de HAVO/VWO-meting gemaakt.</p>${footer(group)}</article>`;
    return part1 + part2 + (scope === "class" ? "" : members);
  }).join("");
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src ${escape(base.origin)}; base-uri 'none'; connect-src 'none'; form-action 'none'"><title>${escape(title)} - ${escape(generated)}</title><style>
*{box-sizing:border-box}body{margin:0;color:#30333b;background:#e8e8e8;font:14px/1.5 Arial,sans-serif}button{font:inherit;min-height:44px;border:0;border-radius:24px;padding:10px 20px;background:#087ba9;color:white;font-weight:bold}nav{max-width:920px;margin:20px auto;padding:12px 24px}nav p{margin:8px 0;color:#414752}.sheet{max-width:210mm;margin:20px auto;padding:28px;background:#f5f2eb;border-radius:20px}header{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:22px;color:#16455d}header img{width:105px;height:63px;object-fit:contain}header small{color:#626570}h1,h2,h3{color:#16455d;margin:0 0 12px}h1{font-size:26px}h2{font-size:18px}h3{font-size:15px}p{margin:8px 0 14px}.band{background:#ded4ba;border-radius:22px;padding:18px 22px;margin:0 0 20px}.band p{margin:4px 0}.grid2,.grid3{display:grid;gap:14px;margin-bottom:20px}.grid2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid3{grid-template-columns:repeat(3,minmax(0,1fr))}.tile{padding:18px;background:white;border-radius:18px;break-inside:avoid}.tile h2{font-size:16px}.goal-name{min-height:42px;font-weight:bold;color:#16455d}.metric-body{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.metric-body strong{display:block;color:#16455d}.metric-body span{display:block;font-size:12px;color:#626570}.donut{width:80px;flex:0 0 80px}.donut text{font:bold 15px Arial,sans-serif;fill:#16455d}.signal{border-radius:100%;width:72px;height:72px;background:#eef0f2;display:grid;align-content:center;text-align:center;font-size:21px;color:#626570;flex:0 0 72px}.signal small{font-size:10px}.muted{font-size:12px;color:#626570}.interpretation{margin:0 0 24px}.attention{padding:14px;border-left:5px solid #ad7200;background:#fff4cd}.sheet footer{margin-top:20px;padding-top:12px;border-top:1px solid #e5e1d8;font-size:10px;color:#626570;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;margin:20px 0;font-size:12px}th,td{padding:10px 6px;text-align:left;border-bottom:1px solid #ded4ba;overflow-wrap:anywhere}@media(max-width:680px){.grid2,.grid3{grid-template-columns:1fr}.sheet{margin:12px;padding:18px}header{flex-wrap:wrap}table{font-size:11px}}@page{size:A4 portrait;margin:12mm}@media print{body{background:white;color:#30333b;print-color-adjust:exact;-webkit-print-color-adjust:exact}nav{display:none}.sheet{max-width:none;margin:0;padding:0;background:#f5f2eb;border-radius:0;break-after:page}.sheet:last-child{break-after:auto}.grid2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid3{grid-template-columns:repeat(3,minmax(0,1fr))}.tile{padding:12px}.donut{width:68px;flex-basis:68px}.signal{width:60px;height:60px;flex-basis:60px}header{break-inside:avoid}tr{break-inside:avoid}}
</style></head><body><nav><h1>${escape(title)}</h1><button type="button" onclick="window.print()">Afdrukken of opslaan als PDF</button><p>Voor een nieuw rapport: ga terug naar beheer en genereer opnieuw. Iedere generatie haalt actuele gegevens op. Dit rapport blijft een momentopname.</p><p>Alleen klassen binnen de gekozen filters en je toegangsrechten. ${escape(selection || "Geen aanvullende filters")}</p><p>Scores zijn afgeschermd voor kleine groepen (minimaal ${snapshot.minimumReportingCount} eindresultaten). Verschillende metingen blijven gescheiden.</p></nav>${pages || '<article class="sheet"><h1>Nog geen rapportgegevens</h1><p>Er zijn geen klassen of afnames binnen deze selectie. Pas de filters in beheer aan en genereer opnieuw.</p></article>'}</body></html>`;
}

