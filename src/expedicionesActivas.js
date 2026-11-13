// El orden de Excel se conserva dentro de cada fecha.
// Como las fechas se guardan en ISO (AAAA-MM-DD), podemos ordenarlas
// directamente de forma descendente sin cambiar el orden entre empates.
export function ordenarExcelRecientePrimero(filas) {
  return [...filas].sort((a, b) =>
    String(b.fecha || '').localeCompare(String(a.fecha || '')) ||
    Number(a.filaExcel || 0) - Number(b.filaExcel || 0)
  );
}

// Rellena una expedición pendiente con sus datos originales de Supabase.
// Nunca generamos una expedición nueva para obtener su predicción.
export function prepararPrediccionActiva(activa, catalogo, mapas) {
  if (!activa || activa.id === null || activa.id === undefined)
    throw new Error('La expedición no tiene un identificador válido.');
  if (activa.finalizado !== null && activa.finalizado !== undefined)
    throw new Error('La expedición ya finalizó. No se puede generar una predicción retrospectiva.');
  const hamster = catalogo.find(h => h.nombre === activa.hamster);
  if (!hamster) throw new Error('Hámster no registrado en el catálogo: ' + String(activa.hamster));
  if (!mapas.some(m => m.valor === activa.expedicion))
    throw new Error('Mapa no disponible en el selector: ' + String(activa.expedicion));
  const stats = Number(activa.stats);
  if (!Number.isInteger(stats) || stats < hamster.baseStats || stats > hamster.baseStats + 49)
    throw new Error('Los STATS guardados no corresponden a un nivel de 1 a 50 para ' + hamster.nombre + '.');
  const porcentaje = Number(activa.porcentaje);
  if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100)
    throw new Error('La probabilidad de referencia de esta expedición no es válida.');
  return {
    id: activa.id,
    fecha: activa.fecha,
    hamster: hamster.nombre,
    nivel: stats - hamster.baseStats + 1,
    stats,
    expedicion: activa.expedicion,
    porcentaje,
    bono: hamster.bono,
  };
}
