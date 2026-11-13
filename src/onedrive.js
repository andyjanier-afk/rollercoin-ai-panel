// Conexión OneDrive personal con Microsoft identity platform (OAuth2 + PKCE).
// Files.Read por defecto. Para la API /shares Microsoft exige Files.ReadWrite;
// solo se solicita si el usuario decide autorizarlo expresamente. Nunca ejecuta VBA.
const CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const STORE = 'rc_ms_oauth_v1';
const TOKEN = 'rc_ms_token_v1';

export const oneDriveConfigurado = () => Boolean(CLIENT_ID);

function encode(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function redirectUri() {
  return window.location.origin + window.location.pathname;
}

export async function conectarOneDrive({ compartidos = false } = {}) {
  if (!CLIENT_ID) throw new Error('Falta configurar VITE_MICROSOFT_CLIENT_ID en Vercel.');
  const scope = compartidos ? 'Files.ReadWrite' : 'Files.Read';
  const verifier = encode(crypto.getRandomValues(new Uint8Array(32)));
  const state = encode(crypto.getRandomValues(new Uint8Array(20)));
  const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  sessionStorage.setItem(STORE, JSON.stringify({ verifier, state, scope }));
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri(),
    response_mode: 'query',
    scope,
    state,
    code_challenge: encode(new Uint8Array(hashed)),
    code_challenge_method: 'S256',
    prompt: compartidos ? 'consent' : 'select_account'
  });
  window.location.assign('https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?' + params);
}

export async function recibirSesionOneDrive() {
  const query = new URLSearchParams(window.location.search);
  const code = query.get('code');
  const error = query.get('error');
  if (!code && !error) return null;
  const cleanup = () => window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  const pend = sessionStorage.getItem(STORE);
  sessionStorage.removeItem(STORE);
  cleanup();
  if (error) throw new Error(query.get('error_description') || error);
  if (!pend) throw new Error('La autenticación de OneDrive expiró. Conecta nuevamente.');
  const {state,verifier,scope} = JSON.parse(pend);
  if (!state || state !== query.get('state') || !verifier) throw new Error('Validación de seguridad de OneDrive fallida.');
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    code_verifier: verifier,
    scope: scope || 'Files.Read'
  });
  const response = await fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
    method: 'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(data.error_description || 'No se pudo completar la conexión Microsoft.');
  sessionStorage.setItem(TOKEN, JSON.stringify({
    access_token:data.access_token,
    scope: String(data.scope || scope || ''),
    expires_at:Date.now() + Math.max(0,Number(data.expires_in||3600)-120)*1000
  }));
  return true;
}

export function conectadoOneDrive() {
  try {
    const data=JSON.parse(sessionStorage.getItem(TOKEN) || 'null');
    return Boolean(data?.access_token && data.expires_at > Date.now());
  } catch {return false;}
}

export function tienePermisoEnlacesCompartidos() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(TOKEN) || 'null');
    return Boolean(sesion?.access_token && sesion.expires_at>Date.now() &&
      String(sesion.scope || '').split(/\s+/).some(s=>s.toLowerCase()==='files.readwrite'));
  }catch{return false;}
}

export function desconectarOneDrive() {sessionStorage.removeItem(TOKEN);}

function bearer() {
  const data=JSON.parse(sessionStorage.getItem(TOKEN) || 'null');
  if (!data?.access_token || data.expires_at <= Date.now()) throw new Error('La sesión de OneDrive expiró. Pulsa «Conectar OneDrive».');
  return data.access_token;
}

async function graph(url) {
  const response=await fetch(url,{headers:{Authorization:'Bearer '+bearer()}});
  if(!response.ok) {
    let err={};try{err=await response.json();}catch{}
    if(response.status===401){desconectarOneDrive();}
    throw new Error(err.error?.message || 'Microsoft Graph respondió '+response.status);
  }
  return response;
}

export async function buscarExcelEnOneDrive(nombre='expediciones') {
  const term=String(nombre).trim().replace(/'/g,"''").slice(0,65);
  if (!term) return [];
  const url="https://graph.microsoft.com/v1.0/me/drive/root/search(q='"+encodeURIComponent(term)+"')?$select=id,name,size,file,lastModifiedDateTime,webUrl&$top=100";
  const response=await graph(url);
  const data=await response.json();
  return (data.value||[]).filter(x=>/\.(xlsm|xlsx)$/i.test(x.name||'') && x.file)
    .map(x=>({id:x.id,name:x.name,modificado:x.lastModifiedDateTime,size:x.size}));
}

export async function descargarExcelDeOneDrive(id,nombre) {
  if (!id || !/\.(xlsm|xlsx)$/i.test(nombre||'')) throw new Error('Selecciona un archivo Excel válido.');
  const url='https://graph.microsoft.com/v1.0/me/drive/items/'+encodeURIComponent(id)+'/content';
  const response=await graph(url);
  const bytes=await response.blob();
  if (bytes.size>15*1024*1024) throw new Error('El Excel supera 15 MB.');
  return new File([bytes],nombre,{type:'application/vnd.ms-excel.sheet.macroEnabled.12'});
}


// Abre un Excel compartido usando Microsoft Graph. Algunos links largos
// contienen el enlace 1drv.ms original dentro del parámetro redeem.
import { enlacesCompartidosCandidatos, tokenCompartido } from './onedriveCompartido';

function mensajeGraph(error) {
  const texto=String(error?.message||'');
  if (/HTTP Error 400|request URI is invalid|General Exception While Processing/i.test(texto))
    return 'Microsoft rechazó el formato del enlace (HTTP 400).';
  return texto.length>250 ? texto.slice(0,250) : texto;
}

export async function descargarExcelCompartido(enlace) {
  if(!tienePermisoEnlacesCompartidos())
    throw Error('Falta autorización específica para enlaces compartidos (Files.ReadWrite).');
  const candidatas = enlacesCompartidosCandidatos(enlace);
  let ultimoError = '';
  for (const url of candidatas) {
    const id=tokenCompartido(url);
    const ruta='https://graph.microsoft.com/v1.0/shares/'+encodeURIComponent(id)+'/driveItem';
    try {
      const response=await graph(ruta);
      const item=await response.json();
      const nombre=String(item.name||'').trim();
      if (!item.file || !/\.(xlsx|xlsm)$/i.test(nombre))
        throw Error('El enlace no apunta directamente a un archivo .xlsx o .xlsm.');
      if (Number(item.size)>15*1024*1024) throw Error('El Excel supera el límite de 15 MB.');
      // Descarga la versión vigente, sin ejecutar VBA ni grabar en OneDrive.
      const archivo=await graph(ruta+'/content');
      const bytes=await archivo.blob();
      if (!bytes.size || bytes.size>15*1024*1024)
        throw Error('No se pudo descargar el Excel o supera los 15 MB.');
      return new File([bytes],nombre,{
        type: nombre.toLowerCase().endsWith('.xlsm')
          ? 'application/vnd.ms-excel.sheet.macroEnabled.12'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (e) {
      // Nunca revelar la URL/token compartido completo en mensajes de error.
      ultimoError=mensajeGraph(e);
    }
  }
  throw Error(
    ultimoError+
    ' Abre el enlace en OneDrive con la misma cuenta Microsoft y confirma que tienes acceso. '+
    'Si sigue fallando, pide al propietario un enlace de lectura nuevo o acceso directo a tu cuenta.'
  );
}
