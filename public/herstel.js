// The selected answer file stays in the browser. Only IDs/checksums are sent.
const recoveryElement=id=>document.getElementById(id);
recoveryElement("recover-form").addEventListener("submit",async event=>{
  event.preventDefault();
  const password=recoveryElement("recovery-password").value;recoveryElement("recovery-password").value="";
  const button=recoveryElement("recover");button.disabled=true;
  const status=recoveryElement("recovery-status");
  const receipt={source:location.origin,startedAt:new Date().toISOString(),results:[],errors:[]};
  try{
    status.textContent="Antwoordkopie wordt gecontroleerd…";
    const file=recoveryElement("recovery-file").files[0];
    const raw=await file.text(),backup=JSON.parse(raw);
    if(backup.format!=="citadel-session-backup-v1" || !backup.complete || !backup.readOnly || backup.source!==location.origin || backup.records.length!==backup.manifest.length)throw new Error("Selecteer de gecontroleerde, volledige antwoordkopie van deze website.");
    const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(raw));
    receipt.backupSha256=[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
    const rows=backup.manifest.filter(row=>!String(row.class_code).startsWith("test-"));
    const seen=new Set();
    for(let index=0;index<backup.records.length;index++){
      const row=backup.records[index],expected=backup.manifest[index];
      if(row.id!==expected.id || seen.has(row.id) || row.checksum!==expected.checksum)throw new Error("De antwoordkopie is niet consistent.");seen.add(row.id);
      const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(row.session_text));
      if([...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,"0")).join("")!==row.sha256)throw new Error("De integriteitscontrole van de antwoordkopie mislukt.");
    }
    for(let index=0;index<rows.length;index++){
      const row=rows[index];status.textContent="Herstel: "+index+" van "+rows.length+" leerlingensessies verwerkt…";
      try{
        const response=await fetch("/api/recovery",{method:"POST",cache:"no-store",credentials:"omit",signal:AbortSignal.timeout(30000),headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({confirmRecovery:true,sessionId:row.id,checksum:row.checksum})});
        const data=await response.json();if(!response.ok || data.ok!==true)throw new Error(data.error || "Geen opslagbevestiging ontvangen.");
        receipt.results.push({sessionId:row.id,classCode:row.class_code,versionId:row.version_id,state:data.state,alreadyRecovered:data.alreadyRecovered});
      }catch(error){receipt.errors.push({sessionId:row.id,classCode:row.class_code,error:error.message});}
    }
    const response=await fetch("/api/recovery",{cache:"no-store",credentials:"omit",headers:{"x-admin-password":password}});
    const server=await response.json();if(!response.ok || !server.ok)throw new Error("Herstelregistraties konden niet worden teruggelezen.");
    receipt.serverCounts=server.counts;receipt.finishedAt=new Date().toISOString();receipt.complete=receipt.errors.length===0;
    const full=receipt.results.filter(row=>row.state!=="partial").length,partial=receipt.results.filter(row=>row.state==="partial").length;
    status.textContent=full+" volledige sessies en "+partial+" gedeeltelijke sessies bevestigd. "+receipt.errors.length+" sessies vragen nog controle. Het herstelverslag wordt gedownload.";
    const element=document.createElement("table"),heading=element.createTHead().insertRow();for(const label of ["Klas","Meting","Registratie","Sessies"]){const th=document.createElement("th");th.textContent=label;heading.append(th);}
    for(const row of server.counts){const tr=element.createTBody().insertRow();for(const value of [row.class_code,row.version_id,row.state,row.sessions])tr.insertCell().textContent=String(value);}
    recoveryElement("recovery-counts").replaceChildren(element);
  }catch(error){status.textContent=error.message;receipt.complete=false;receipt.error=error.message;}
  finally{
    if(receipt.results.length || receipt.errors.length){const url=URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)],{type:"application/json"}));const link=document.createElement("a");link.href=url;link.download="nulmetingen-herstelverslag-"+new Date().toISOString().replace(/[:.]/g,"-")+".json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    button.disabled=false;
  }
});
