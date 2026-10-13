import { neon } from "@neondatabase/serverless";
import { accessForRequest } from "./access.js";
import { recoverSession } from "../lib/recover-session.js";

export const createRecoveryHandler = (connect=neon) => async (request,response) => {
  response.setHeader("Cache-Control","no-store, private");
  response.setHeader("Vercel-CDN-Cache-Control","no-store");
  if(accessForRequest(request)?.role!=="admin")return response.status(403).json({ok:false,error:"Alleen de beheerder mag herstel uitvoeren."});
  if(!process.env.DATABASE_URL)return response.status(503).json({ok:false,error:"Databasekoppeling ontbreekt."});
  try {
    const sql=connect(process.env.DATABASE_URL);
    if(request.method==="GET") {
      const tables=await sql`SELECT to_regclass('public.assessment_recoveries') AS name`;
      const counts=tables[0]?.name ? await sql`SELECT class_code,version_id,state,COUNT(*) AS sessions FROM assessment_recoveries GROUP BY class_code,version_id,state ORDER BY class_code` : [];
      return response.status(200).json({ok:true,counts});
    }
    if(request.method!=="POST") {response.setHeader("Allow","GET, POST");return response.status(405).json({ok:false});}
    let body=request.body;
    if(!body || typeof body!=="object") {const chunks=[];for await(const chunk of request)chunks.push(Buffer.from(chunk));body=JSON.parse(Buffer.concat(chunks).toString("utf8"));}
    if(body.confirmRecovery!==true)return response.status(400).json({ok:false,error:"Bevestig eerst de herstelopdracht."});
    const result=await recoverSession(sql,{sessionId:String(body.sessionId??""),checksum:String(body.checksum??"")});
    return response.status(200).json({ok:true,...result});
  }catch(error){
    // Do not disclose database driver errors, credentials or pupil answers.
    return response.status(409).json({ok:false,error:"Herstel is voor deze sessie niet uitgevoerd. Controleer of de bron of registratie is veranderd."});
  }
};
export default createRecoveryHandler();
