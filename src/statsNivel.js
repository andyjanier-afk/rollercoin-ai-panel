// Cada hámster tiene sus stats base y suma 1 stat por nivel (niveles 1 a 50).
// El rango depende del catálogo propio de esta aplicación, no de datos
// oficiales verificados automáticamente desde RollerCoin.
export function limitesStats(baseStats) {
  const base = Number(baseStats);
  if (!Number.isInteger(base) || base <= 0) return null;
  return { min: base, max: base + 49 };
}

// Para usar al salir del campo: se fuerza un valor entero dentro del rango.
export function ajustarStatsAlRango(valor, baseStats) {
  const limites = limitesStats(baseStats);
  if (!limites) return null;
  if (valor === '' || valor === null || valor === undefined) return limites.min;
  const stats = Number(valor);
  if (!Number.isFinite(stats)) return limites.min;
  return Math.min(limites.max, Math.max(limites.min, Math.round(stats)));
}

export function nivelDesdeStats(valor, baseStats) {
  if (valor === '' || valor === null || valor === undefined) return null;
  const stats = Number(valor);
  const limites = limitesStats(baseStats);
  if (!Number.isInteger(stats) || !limites || stats < limites.min || stats > limites.max) return null;
  return stats - limites.min + 1;
}

export function statsDesdeNivel(valor, baseStats) {
  if (valor === '' || valor === null || valor === undefined) return null;
  const nivel = Number(valor);
  const limites = limitesStats(baseStats);
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 50 || !limites) return null;
  return limites.min + nivel - 1;
}
