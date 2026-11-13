// Enlaces compartidos de OneDrive: validar sin visitar ni publicar la URL.
// Un enlace compartido puede incluir un token de acceso; no enviarlo a Supabase.
export function validarEnlaceOneDrive(raw) {
  const enlace = String(raw || '').trim();
  if (!enlace || enlace.length > 4096) throw Error('Pega el enlace completo que te compartieron.');
  let url;
  try { url = new URL(enlace); } catch { throw Error('El enlace no es una URL válida.'); }
  if (url.protocol !== 'https:') throw Error('El enlace debe comenzar con https://');
  const host = url.hostname.toLowerCase();
  const valido = host === 'onedrive.live.com' || host === '1drv.ms'
    || host === 'onedrive.com' || host.endsWith('.sharepoint.com');
  if (!valido || url.username || url.password || url.port)
    throw Error('Solo se admiten enlaces seguros de OneDrive o SharePoint.');
  return url.href;
}

export function tokenCompartido(raw) {
  const url = validarEnlaceOneDrive(raw);
  // Microsoft Graph exige: u! + Base64URL de la URL compartida, sin padding.
  const bytes = new TextEncoder().encode(url);
  let bin = '';
  for (const value of bytes) bin += String.fromCharCode(value);
  return 'u!' + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
