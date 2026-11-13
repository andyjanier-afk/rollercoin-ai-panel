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
