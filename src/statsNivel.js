// El catálogo actual considera +1 stat por cada nivel de evolución (niveles 1 a 50).
// No se infieren niveles fuera de ese rango; es preferible solicitar corrección.
export function nivelDesdeStats(valor, baseStats) {
  if (valor === '' || valor === null || valor === undefined) return null;
  const stats = Number(valor);
  const base = Number(baseStats);
  if (!Number.isInteger(stats) || !Number.isFinite(base)) return null;
  const nivel = stats - base + 1;
  return Number.isInteger(nivel) && nivel >= 1 && nivel <= 50 ? nivel : null;
}

export function statsDesdeNivel(valor, baseStats) {
  if (valor === '' || valor === null || valor === undefined) return null;
  const nivel = Number(valor);
  const base = Number(baseStats);
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 50 || !Number.isFinite(base)) return null;
  return base + nivel - 1;
}
