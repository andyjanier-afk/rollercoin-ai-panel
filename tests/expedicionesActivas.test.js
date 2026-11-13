import test from 'node:test';
import assert from 'node:assert/strict';
import { ordenarExcelRecientePrimero, prepararPrediccionActiva } from '../src/expedicionesActivas.js';

const catalogo=[
  { nombre:'Mamita', baseStats:200, bono:0 },
  { nombre:'Birthday Bob', baseStats:70, bono:0 },
];
const mapas=[{valor:'3h'}, {valor:'20h'}, {valor:'24h Dark'}];

test('muestra primero la fecha más reciente y conserva orden original del Excel dentro del día',()=>{
  const filas=[
    {fecha:'2026-11-11',filaExcel:5},
    {fecha:'2026-11-13',filaExcel:22},
    {fecha:'2026-11-12',filaExcel:9},
    {fecha:'2026-11-13',filaExcel:18},
    {fecha:'2026-11-12',filaExcel:7},
  ];
  const orden=ordenarExcelRecientePrimero(filas);
  assert.deepEqual(orden.map(f=>f.filaExcel),[18,22,7,9,5]);
  assert.deepEqual(filas.map(f=>f.filaExcel),[5,22,9,18,7], 'no debe alterar el array original');
});

test('carga datos auténticos de una expedición activa para predecir sin crear nueva fila',()=>{
  const activa={id:123,fecha:'2026-11-13',hamster:'Mamita',
    nivel:50,stats:249,expedicion:'20h',porcentaje:58.78,finalizado:null,
    probabilidad_ia:null};
  const form=prepararPrediccionActiva(activa,catalogo,mapas);
  assert.equal(form.id,123);
  assert.equal(form.hamster,'Mamita');
  assert.equal(form.stats,249);
  assert.equal(form.nivel,50);
  assert.equal(form.expedicion,'20h');
  assert.equal(form.porcentaje,58.78);
  assert.equal(form.bono,0);
  assert.equal(form.fecha,'2026-11-13');
});

test('no modifica la expedición original al preparar la predicción',()=>{
  const original={id:14,fecha:'2026-11-13',hamster:'Birthday Bob',
    stats:119,expedicion:'3h',porcentaje:32,finalizado:null};
  const snapshot=structuredClone(original);
  prepararPrediccionActiva(original,catalogo,mapas);
  assert.deepEqual(original,snapshot);
});

test('rechaza resultados ya finalizados y datos fuera de rango',()=>{
  const r={id:12,fecha:'2026-11-13',hamster:'Mamita',stats:240,
    expedicion:'20h',porcentaje:65,finalizado:null};
  assert.throws(()=>prepararPrediccionActiva({...r,finalizado:true},catalogo,mapas),/ya finalizó/);
  assert.throws(()=>prepararPrediccionActiva({...r,stats:10000},catalogo,mapas),/STATS/);
  assert.throws(()=>prepararPrediccionActiva({...r,expedicion:'90'},catalogo,mapas),/Mapa/);
  assert.throws(()=>prepararPrediccionActiva({...r,hamster:'No existe'},catalogo,mapas),/Hámster/);
  assert.throws(()=>prepararPrediccionActiva({...r,porcentaje:173.91},catalogo,mapas),/probabilidad/);
});
