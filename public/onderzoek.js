const byId = id => document.getElementById(id);
let snapshot = null;
const saveJson = (data, filename) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  const link = document.createElement("a"); link.href=url; link.download=filename; link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
const backupAnswers = async password => {
  const read = async parameters => {
    const response = await fetch("/api/response-investigation?"+parameters, {method:"GET",cache:"no-store",credentials:"omit",signal:AbortSignal.timeout(30000),headers:{"x-admin-password":password}});
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "De antwoordkopie kon niet worden gelezen.");
    return data;
  };
  const inventory = await read("export=manifest");
  const records = [];
  for (let offset=0; offset<inventory.manifest.length;) {
    let limit=1, bytes=Number(inventory.manifest[offset].bytes);
    while (limit<5 && offset+limit<inventory.manifest.length && (bytes+Number(inventory.manifest[offset+limit].bytes))*2<1000000) bytes+=Number(inventory.manifest[offset+limit++].bytes);
    byId("status").textContent="Antwoordkopie maken: "+offset+" van "+inventory.manifest.length+" sessies gecontroleerd…";
    const page = await read("export=answers&offset="+offset+"&limit="+limit);
    if (page.records.length !== limit) throw new Error("Sessies zijn tijdens de kopie gewijzigd. Er is nog geen volledige kopie opgeslagen. Probeer opnieuw als er geen afname actief is.");
    for (let index=0; index<page.records.length; index++) {
      const row = page.records[index], expected = inventory.manifest[offset+index];
      const digest = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(row.session_text));
      const checksum = [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
      if (row.id !== expected.id || row.checksum !== expected.checksum || row.sha256 !== checksum) throw new Error("Een antwoordkopie is tijdens het lezen veranderd of niet goed ontvangen. De volledige kopie is niet opgeslagen; probeer opnieuw.");
      records.push(row);
    }
    offset += limit;
  }
  const finalInventory = await read("export=manifest");
  if (JSON.stringify(finalInventory.manifest.map(row=>[row.id,row.checksum,row.updated_at])) !== JSON.stringify(inventory.manifest.map(row=>[row.id,row.checksum,row.updated_at]))) throw new Error("De brongegevens veranderden tijdens de kopie. Probeer opnieuw wanneer er geen afname actief is.");
  const backup = {format:"citadel-session-backup-v1",source:location.origin,readOnly:true,complete:true,observedAt:inventory.observedAt,verifiedAt:new Date().toISOString(),manifest:inventory.manifest,records};
  saveJson(backup,"nulmetingen-antwoordkopie-"+new Date().toISOString().replace(/[:.]/g,"-")+".json");
  return records.length;
};
const table = (id, rows, fields) => {
  const target = byId(id); target.replaceChildren();
  if (!rows?.length) { target.textContent = "Geen gegevens gevonden."; return; }
  const element = document.createElement("table");
  const header = element.createTHead().insertRow();
  for (const [, label] of fields) { const th = document.createElement("th"); th.scope = "col"; th.textContent = label; header.append(th); }
  const body = element.createTBody();
  for (const row of rows) { const tr = body.insertRow(); for (const [key] of fields) tr.insertCell().textContent = String(row[key] ?? "—"); }
  target.append(element);
};
byId("form").addEventListener("submit", async event => {
  event.preventDefault(); snapshot = null; byId("report").hidden = true;
  for (const id of ["classes","codes","orphans","groups","duplicates","multiple"]) byId(id).replaceChildren();
  byId("load").disabled = true; byId("status").textContent = "Database wordt uitsluitend gelezen…";
  const password = byId("password").value; byId("password").value = "";
  try {
    const response = await fetch("/api/response-investigation", {method:"GET",cache:"no-store",credentials:"omit",signal:AbortSignal.timeout(30000),headers:{"x-admin-password":password}});
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "De leescontrole is niet gelukt.");
    byId("location").textContent = "Server: " + data.location.hostname + " · Database: " + data.location.database;
    byId("observed").textContent = "Moment van controle: " + (data.report.identity?.[0]?.observed_at ?? "onbekend");
    byId("cautions").replaceChildren();
    for (const message of data.cautions) { const li = document.createElement("li"); li.textContent = message; byId("cautions").append(li); }
    byId("report").hidden = false;
    if (!data.report.available) { byId("status").textContent = "Database gevonden, maar benodigde tabellen of kolommen ontbreken: " + data.report.missing.join(", "); byId("classes").textContent="Geen telling uitgevoerd."; byId("download").disabled=true; return; }
    snapshot = data; byId("download").disabled=false;
    table("classes",data.report.classes,[["klas","Klas"],["meting","Meting"],["codes_aangemaakt","Codes"],["codes_status_afgerond","Afgerond"],["werkelijk_opgeslagen_eindpogingen","Resultaten opgeslagen"],["codes_status_bezig","Bezig"],["codes_met_bewaarde_sessie","Codes met sessie"],["sessies_met_antwoorden","Sessies met antwoorden"],["sessies_met_afrondingsmarkering","Afrondingsmarkering"]]);
    table("codes",data.report.codes,[["klas","Klas"],["meting","Meting"],["code","Code"],["geregistreerde_status","Status"],["maximaal_bewaarde_antwoordrecords","Max. antwoordrecords"],["laatste_serveropslag","Laatste opslag"],["onderzoeksstatus","Onderzoeksbevinding"]]);
    table("orphans",data.report.orphanSessions,[["klas","Klas"],["meting","Meting"],["code","Code"],["antwoordrecords","Antwoordrecords"],["client_completed_at","Afrondingsmarkering"],["eindresultaat_aanwezig","Eindresultaat aanwezig"]]);
    table("groups",data.report.resultGroups,[["klas","Klas"],["meting","Meting"],["afnameperiode","Periode"],["assessment_build_version","Versie"],["eindpogingen","Resultaten"]]);
    table("duplicates",data.report.duplicateCodes,[["code","Code"],["administratieregels","Registraties"],["verschillende_klassen","Klassen"]]);
    table("multiple",data.report.multipleSessions,[["klas","Klas"],["meting","Meting"],["code","Code"],["bewaarde_pogingen","Sessies"]]);
    if (byId("backup").checked) {
      const count = await backupAnswers(password);
      byId("status").textContent = "Antwoordkopie van "+count+" sessies gecontroleerd en aangeboden als download. Controleer dat het bestand is opgeslagen. Er zijn geen afnames gewijzigd.";
    } else byId("status").textContent = "Controle voltooid. Er zijn geen gegevens gewijzigd.";
  } catch(error) { byId("status").textContent = error.message === "Failed to fetch" ? "Geen verbinding. Probeer de leescontrole later opnieuw." : error.message; }
  finally { byId("load").disabled = false; }
});
byId("download").addEventListener("click", () => {
  if (!snapshot) return;
  saveJson(snapshot,"opslagonderzoek.json");
});

