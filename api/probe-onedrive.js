// Diagnóstico temporal de enlaces públicos; no devuelve datos ni enlaces firmados.
// Solo se ejecuta en preview, nunca almacenar una copia del Excel.
export default async function handler(req,res) {
  if(process.env.VERCEL_ENV !== 'preview') return res.status(404).json({error:'No disponible'});
  const raw = process.env.ONEDRIVE_SHARED_PROBE_URL;
  if(!raw) return res.status(503).json({error:'No configurado'});
  try {
    const input = new URL(raw);
    if(input.hostname !== 'onedrive.live.com') return res.status(400).json({error:'Host inválido'});
    const candidates = [input.href];
    const copy = new URL(input);
    copy.searchParams.set('download','1');
    candidates.push(copy.href);
    const out = [];
    for(const u of candidates) {
      try {
        const r = await fetch(u,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(8000),
          headers:{'User-Agent':'Mozilla/5.0','Accept':'application/octet-stream,*/*'}});
        const to = r.headers.get('location');
        let redirectHost = null;
        if(to){try{redirectHost = new URL(to,u).hostname;}catch{}}
        out.push({status:r.status,contentType:r.headers.get('content-type'),size:r.headers.get('content-length'),
          disposition:Boolean(r.headers.get('content-disposition')), redirectHost});
        await r.body?.cancel?.().catch(()=>{});
      }catch(e){out.push({error:String(e.name||'NetworkFailure')})}
    }
    return res.status(200).json({results:out});
  } catch {return res.status(500).json({error:'Diagnóstico no disponible'});}
}
