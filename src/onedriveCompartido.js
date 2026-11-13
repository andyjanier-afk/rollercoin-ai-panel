// Solo aceptamos enlaces oficiales de OneDrive y SharePoint.
// El enlace y sus parámetros pueden dar acceso al archivo: no enviarlos a Supabase.
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

// Algunos enlaces nuevos "onedrive.live.com/:x:/g/personal/..." contienen
// en redeem el enlace CORTO 1drv.ms original. Microsoft Graph puede rechazar
// el enlace largo con HTTP 400. Probamos primero el enlace compartido real.
export function enlacesCompartidosCandidatos(raw) {
  const original = validarEnlaceOneDrive(raw);
  const url = new URL(original);
  const candidates = [];
  const encoded = url.searchParams.get('redeem');
  if (encoded) {
    try {
      const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const bytes = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
      const decoded = new TextDecoder().decode(Uint8Array.from(bytes, c => c.charCodeAt(0)));
      const short = validarEnlaceOneDrive(decoded);
      // Un parámetro externo "redeem" nunca puede llevar a dominios ajenos.
      if (new URL(short).hostname.toLowerCase() === '1drv.ms') candidates.push(short);
    } catch {
      // Si redeem estuviese malformado, se mantiene el enlace original.
    }
  }
  candidates.push(original);
  return [...new Set(candidates)];
}

export function tokenCompartido(raw) {
  const url = validarEnlaceOneDrive(raw);
  const bytes = new TextEncoder().encode(url);
  let bin = '';
  for (const value of bytes) bin += String.fromCharCode(value);
  return 'u!' + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
