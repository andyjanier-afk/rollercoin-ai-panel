// Lector OOXML de solo lectura (.xlsx/.xlsm). Nunca carga ni ejecuta VBA.
// El archivo permanece en el navegador hasta que el usuario confirme importar.
const textDecoder = new TextDecoder('utf-8');
const MAPAS = new Set(['3h','12h','18h','20h','24h Dark','24h Beach','30h']);

export const normalizarNombre = value => String(value ?? '').normalize('NFKC')
  .replace(/[’‘]/g, "'").trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');

export const claveExpedicion = r => [
  String(r.fecha || '').slice(0, 10),
  normalizarNombre(r.hamster),
  Number(r.stats),
  String(r.expedicion || '').trim(),
].join('|');

const verU16 = (view, offset) => view.getUint16(offset, true);
const verU32 = (view, offset) => view.getUint32(offset, true);

async function leerEntradasZip(file) {
  if (file.size > 15 * 1024 * 1024) throw new Error('El Excel supera el límite de 15 MB.');
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  let fin = -1;
  const inicio = Math.max(0, buffer.byteLength - 65557);
  for (let pos = buffer.byteLength - 22; pos >= inicio; pos--) {
    if (verU32(view, pos) === 0x06054b50) { fin = pos; break; }
  }
  if (fin < 0) throw new Error('El archivo no tiene una estructura XLSX/XLSM válida.');
  const total = verU16(view, fin + 10);
  const offset = verU32(view, fin + 16);
  if (total > 1500 || offset >= buffer.byteLength) throw new Error('Archivo Excel demasiado complejo.');
  const entradas = new Map();
  let p = offset;
  for (let i = 0; i < total; i++) {
    if (p + 46 > buffer.byteLength || verU32(view, p) !== 0x02014b50)
      throw new Error('Directorio ZIP dañado.');
    const flags = verU16(view, p + 8);
    const metodo = verU16(view, p + 10);
    const comp = verU32(view, p + 20), uncomp = verU32(view, p + 24);
    const nameLen = verU16(view, p + 28), extraLen = verU16(view, p + 30), commentLen = verU16(view, p + 32);
    const local = verU32(view, p + 42);
    const nombre = textDecoder.decode(new Uint8Array(buffer, p + 46, nameLen));
    if (flags & 1) throw new Error('No se admiten archivos Excel cifrados.');
    if (comp === 0xffffffff || uncomp === 0xffffffff) throw new Error('ZIP64 no admitido.');
    entradas.set(nombre, { metodo, comp, uncomp, local });
    p += 46 + nameLen + extraLen + commentLen;
  }
  async function extraer(nombre, optional=false) {
    const item = entradas.get(nombre);
    if (!item) {
      if (optional) return null;
      throw new Error('No se encontró ' + nombre + ' dentro del Excel.');
    }
    if (item.uncomp > 12 * 1024 * 1024 || item.comp > 12 * 1024 * 1024)
      throw new Error('Una sección del Excel es demasiado grande.');
    const p = item.local;
    if (p + 30 > buffer.byteLength || verU32(view, p) !== 0x04034b50)
      throw new Error('Entrada ZIP inválida.');
    const dataPos = p + 30 + verU16(view, p + 26) + verU16(view, p + 28);
    if (dataPos + item.comp > buffer.byteLength) throw new Error('Archivo ZIP incompleto.');
    const bytes = new Uint8Array(buffer, dataPos, item.comp);
    if (item.metodo === 0) return textDecoder.decode(bytes);
    if (item.metodo !== 8) throw new Error('Compresión ZIP no soportada.');
    if (typeof DecompressionStream === 'undefined')
      throw new Error('Tu navegador no admite leer XLSM. Actualiza Chrome, Firefox o Edge.');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    const descomprimido = await new Response(stream).arrayBuffer();
    if (descomprimido.byteLength > 12 * 1024 * 1024) throw new Error('Sección Excel demasiado grande.');
    return textDecoder.decode(descomprimido);
  }
  return { entradas, extraer };
}

function parsearXML(source) {
  const doc = new DOMParser().parseFromString(source, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Excel contiene XML inválido.');
  return doc;
}

function elementos(padre, nombre) {
  return Array.from(padre.getElementsByTagNameNS('*', nombre));
}

function textoCelda(celda, shared) {
  const v = elementos(celda, 'v')[0];
  const tipo = celda.getAttribute('t');
  if (tipo === 'inlineStr') return elementos(celda, 't').map(t => t.textContent || '').join('');
  if (!v) return '';
  const valor = v.textContent || '';
  if (tipo === 's') return shared[Number(valor)] ?? '';
  return valor;
}

function fechaExcel(valor, usa1904) {
  const v = String(valor ?? '').trim();
  if (!v) return null;
  let iso;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) iso = v;
  else if (/^\d+(?:\.\d+)?$/.test(v)) {
    const n = Number(v);
    if (n < 10000 || n > 100000) return null;
    const origen = usa1904 ? Date.UTC(1904,0,1) : Date.UTC(1899,11,30);
    iso = new Date(origen + Math.floor(n) * 86400000).toISOString().slice(0,10);
  } else {
    const m = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (!m) return null;
    iso = m[3] + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0');
  }
  const day = new Date(iso + 'T00:00:00Z');
  return !Number.isNaN(day.getTime()) && day.toISOString().slice(0,10) === iso ? iso : null;
}

function convertirPorcentaje(raw, excelNumerico) {
  const texto = String(raw ?? '').trim();
  if (!texto) return null;
  const conSigno = texto.endsWith('%');
  const num = Number(texto.replace('%','').replace(',', '.'));
  if (!Number.isFinite(num)) return null;
  const pct = conSigno ? num : (excelNumerico ? num * 100 : (num <= 1 ? num * 100 : num));
  return Math.round(pct * 100) / 100;
}

export function validarFilaExcel(fila, catalogo) {
  const errores = [];
  const catalogoMap = new Map(catalogo.map(h => [normalizarNombre(h.nombre), h]));
  const h = catalogoMap.get(normalizarNombre(fila.hamster));
  const fecha = fechaExcel(fila.fecha, Boolean(fila.fecha1904));
  const stats = Number(fila.stats);
  const mapa = String(fila.expedicion || '').trim();
  const pct = convertirPorcentaje(fila.porcentaje, fila.porcentajeNumerico !== false);
  const res = String(fila.finalizado ?? '').trim().toLocaleLowerCase('es');
  let finalizado = null;
  if (res === 'si' || res === 'sí' || res === 'true' || res === '1') finalizado = true;
  else if (res === 'no' || res === 'false' || res === '0') finalizado = false;
  else if (res !== '') errores.push('Resultado no reconocido: ' + res);
  if (!fecha) errores.push('Fecha inválida');
  if (!h) errores.push('Hámster no incluido en el catálogo: ' + String(fila.hamster || 'vacío'));
  if (!MAPAS.has(mapa)) errores.push('Mapa no reconocido: ' + (mapa || 'vacío'));
  if (!Number.isInteger(stats) || !h || stats < h.baseStats || stats > h.baseStats + 49)
    errores.push('STATS fuera de rango' + (h ? ' (' + h.baseStats + '–' + (h.baseStats+49) + ')' : ''));
  if (pct === null || pct < 0 || pct > 100) errores.push('Porcentaje fuera de 0–100%');
  return {
    errores, filaExcel: fila.filaExcel,
    registro: errores.length ? null : {
      fecha, hamster: h.nombre, stats, expedicion: mapa, porcentaje: pct,
      nivel: stats - h.baseStats + 1, finalizado
    }
  };
}

export async function leerExpedicionesExcel(file, catalogo) {
  if (!/\.(xlsm|xlsx)$/i.test(file.name || ''))
    throw new Error('Selecciona un Excel .xlsm o .xlsx.');
  const { entradas, extraer } = await leerEntradasZip(file);
  const workbook = await extraer('xl/workbook.xml');
  const usa1904 = /\bdate1904\s*=\s*["'](?:1|true)["']/i.test(workbook);
  const ssXML = await extraer('xl/sharedStrings.xml', true);
  const shared = ssXML ? elementos(parsearXML(ssXML), 'si').map(si =>
    elementos(si, 't').map(t => t.textContent || '').join('')) : [];
  const files = [...entradas.keys()].filter(n => /^xl\/worksheets\/sheet\d+\.xml$/i.test(n)).sort();
  if (!files.length) throw new Error('No hay hojas de cálculo en el archivo.');
  let datos = null;
  let nombreHoja = '';
  for (const nombre of files.slice(0, 20)) {
    const doc = parsearXML(await extraer(nombre));
    const rows = elementos(doc, 'sheetData')[0];
    if (!rows) continue;
    let encabezado = null, registros = [];
    for (const row of elementos(rows, 'row').slice(0, 10000)) {
      const numero = Number(row.getAttribute('r')) || 0;
      const celdas = new Map();
      for (const c of elementos(row, 'c')) {
        const col = (c.getAttribute('r') || '').match(/^[A-Z]+/)?.[0];
        if (col) celdas.set(col, { valor: textoCelda(c, shared), tipo: c.getAttribute('t') || '' });
      }
      if (!encabezado) {
        const d = Object.fromEntries([...celdas].map(([col,c]) => [String(c.valor).trim().toLocaleLowerCase('es'),col]));
        if (d['fecha'] && d['stats'] && d['hamster'] && d['expedicion'] && d['finalizado']) {
          const pctCol = d['%'] || d['porcentaje'];
          if (pctCol) encabezado = { fecha:d.fecha, stats:d.stats, hamster:d.hamster,
            expedicion:d.expedicion, porcentaje:pctCol, finalizado:d.finalizado };
        }
        continue;
      }
      const get = name => celdas.get(encabezado[name])?.valor ?? '';
      // Ignorar la fila vacía preparada por las macros.
      if (!get('hamster') && !get('stats') && !get('expedicion')) continue;
      registros.push({
        filaExcel: numero, fecha: get('fecha'), fecha1904: usa1904, stats: get('stats'),
        hamster: get('hamster'), expedicion: get('expedicion'), porcentaje:get('porcentaje'),
        porcentajeNumerico: celdas.get(encabezado.porcentaje)?.tipo !== 's',
        finalizado:get('finalizado')
      });
      if (registros.length > 5000) throw new Error('No se pueden importar más de 5000 filas por archivo.');
    }
    if (encabezado) {
      datos = registros;
      nombreHoja = nombre;
      break;
    }
  }
  if (!datos) throw new Error('No encontré las columnas Fecha, stats, Hamster, expedicion, %, finalizado.');
  const revisadas = datos.map(row => validarFilaExcel(row, catalogo));
  return {
    nombreHoja, origen: file.name,
    validas: revisadas.filter(r => !r.errores.length).map(r => ({...r.registro, filaExcel:r.filaExcel})),
    invalidas: revisadas.filter(r => r.errores.length).map(r => ({filaExcel:r.filaExcel, errores:r.errores})),
    total: datos.length,
  };
}

const estado = r => r.finalizado === null || r.finalizado === undefined ? 'pendiente' : r.finalizado ? 'vive' : 'muere';

// La misma combinación puede repetirse muchas veces el mismo día.
// Se comparan cantidades y resultados (multiconjunto), nunca solo un Set.
export function planificarImportacion(validas, existentes) {
  const grupos = new Map();
  for (const r of validas) {
    const key = claveExpedicion(r);
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(r);
  }
  const existentesPorClave = new Map();
  for (const r of existentes) {
    const key = claveExpedicion(r);
    if (!existentesPorClave.has(key)) existentesPorClave.set(key, []);
    existentesPorClave.get(key).push(r);
  }
  const insertar = [], actualizar = [], ignorar = [], conflictos = [];
  for (const [key, rows] of grupos) {
    const previos = [...(existentesPorClave.get(key) || [])];
    const usados = new Set();
    const usadosExcel = new Set();
    const matching = predicate => {
      for (let i = 0; i < rows.length; i++) {
        if (usadosExcel.has(i)) continue;
        const j = previos.findIndex((e,k) => !usados.has(k) && predicate(rows[i], e));
        if (j >= 0) {
          usadosExcel.add(i);
          usados.add(j);
          return [i,j];
        }
      }
      return null;
    };
    let match;
    while ((match = matching((a,b) => estado(a) === estado(b)))) {
      ignorar.push({ ...rows[match[0]], motivo:'Ya registrada' });
    }
    // Nunca asignar un resultado concreto a una predicción previa al azar.
    // Si sobran varios resultados diferentes y faltan envíos pendientes,
    // la correspondencia es ambigua: pedir revisión manual.
    const restantesPrevios = previos.filter((_,j) => !usados.has(j));
    const restantesExcel = rows.filter((_,i) => !usadosExcel.has(i));
    const resultadosFinales = new Set(restantesExcel.filter(r => estado(r) !== 'pendiente').map(estado));
    const emparejamientoSeguro = restantesPrevios.every(r => estado(r) === 'pendiente')
      && resultadosFinales.size <= 1;
    if (emparejamientoSeguro) {
      while ((match = matching((a,b) => estado(a) !== 'pendiente' && estado(b) === 'pendiente'))) {
        actualizar.push({
          id:previos[match[1]].id, filaExcel:rows[match[0]].filaExcel,
          finalizado:rows[match[0]].finalizado
        });
      }
    }
    for (let i = 0; i < rows.length; i++) {
      if (usadosExcel.has(i)) continue;
      if (previos.some((_,k) => !usados.has(k)) || !emparejamientoSeguro) {
        conflictos.push({ ...rows[i],
          motivo:'Coincidencia ambigua: no se puede identificar con seguridad este envío o su resultado' });
      } else {
        insertar.push(rows[i]);
      }
    }
  }
  insertar.sort((a,b) => a.fecha.localeCompare(b.fecha) || b.filaExcel - a.filaExcel);
  return { insertar, actualizar, ignorar, conflictos };
}

export async function consultarRegistrosExistentes(supabase) {
  const registros = [];
  for (let desde=0; desde<30000; desde+=1000) {
    const { data, error } = await supabase.from('expediciones')
      .select('id,fecha,hamster,stats,expedicion,finalizado')
      .order('id', {ascending:true}).range(desde,desde+999);
    if (error) throw new Error('No se pudo comparar con Supabase: ' + error.message);
    registros.push(...(data || []));
    if (!data || data.length < 1000) return registros;
  }
  throw new Error('Demasiados registros para verificar duplicados.');
}
