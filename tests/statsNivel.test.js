import test from 'node:test';
import assert from 'node:assert/strict';
import { nivelDesdeStats, statsDesdeNivel } from '../src/statsNivel.js';

test('stats determinan nivel para hámsteres existentes', () => {
  assert.equal(nivelDesdeStats(175,175),1);
  assert.equal(nivelDesdeStats(198,175),24);
  assert.equal(nivelDesdeStats(224,175),50);
  assert.equal(nivelDesdeStats(255,206),50);
});

test('nivel manual sigue calculando stats como antes', () => {
  assert.equal(statsDesdeNivel(24,175),198);
  assert.equal(statsDesdeNivel(50,206),255);
  assert.equal(statsDesdeNivel(1,175),175);
});

test('no inventar nivel cuando las stats no corresponden al hámster', () => {
  assert.equal(nivelDesdeStats('',175),null);
  assert.equal(nivelDesdeStats(174,175),null);
  assert.equal(nivelDesdeStats(225,175),null);
  assert.equal(nivelDesdeStats(198.5,175),null);
  assert.equal(nivelDesdeStats('texto',175),null);
  assert.equal(statsDesdeNivel('',175),null);
  assert.equal(statsDesdeNivel(51,175),null);
});

test('rango de stats propio de cada hámster', async () => {
  const { limitesStats, ajustarStatsAlRango } = await import('../src/statsNivel.js');
  assert.deepEqual(limitesStats(175), { min: 175, max: 224 });
  assert.deepEqual(limitesStats(206), { min: 206, max: 255 });
  assert.deepEqual(limitesStats(230), { min: 230, max: 279 });
  assert.deepEqual(limitesStats(50), { min: 50, max: 99 });
  assert.equal(ajustarStatsAlRango(10000, 175), 224);
  assert.equal(ajustarStatsAlRango(160, 175), 175);
  assert.equal(ajustarStatsAlRango('', 206), 206);
  assert.equal(ajustarStatsAlRango(200.6, 175), 201);
  assert.equal(ajustarStatsAlRango(240, 206), 240);
});

test('los niveles permitidos usan el límite exacto de cada hámster', () => {
  assert.equal(nivelDesdeStats(230,230),1);
  assert.equal(nivelDesdeStats(279,230),50);
  assert.equal(nivelDesdeStats(280,230),null);
  assert.equal(nivelDesdeStats(229,230),null);
  assert.equal(statsDesdeNivel(50,230),279);
});
