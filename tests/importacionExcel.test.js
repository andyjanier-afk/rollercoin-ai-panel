import test from 'node:test';
import assert from 'node:assert/strict';
import { claveExpedicion, normalizarNombre, validarFilaExcel, planificarImportacion } from '../src/importacionExcel.js';

const catalogo = [
  {nombre:"Jack O’Mine",baseStats:220},
  {nombre:"Uncle'Azoth",baseStats:230},
  {nombre:'Hammy Hooks',baseStats:205},
  {nombre:'Banjo Walker',baseStats:175},
];

const fila = (cambios={})=>({
  filaExcel:13, fecha:'46338',fecha1904:false,hamster:'Banjo Walker',
  stats:'224',expedicion:'3h',porcentaje:'0.6003',porcentajeNumerico:true,
  finalizado:'no',...cambios
});

test('convierte fechas de Excel y porcentajes numéricos al formato de Supabase',()=>{
  const r=validarFilaExcel(fila(),catalogo);
  assert.deepEqual(r.errores,[]);
  assert.equal(r.registro.fecha,'2026-11-12');
  assert.equal(r.registro.porcentaje,60.03);
  assert.equal(r.registro.nivel,50);
  assert.equal(r.registro.finalizado,false);
});

test('resultado vacío queda pendiente y porcentaje textual funciona',()=>{
  const r=validarFilaExcel(fila({finalizado:'',porcentaje:'60.03%',porcentajeNumerico:false}),catalogo);
  assert.deepEqual(r.errores,[]);
  assert.equal(r.registro.finalizado,null);
  assert.equal(r.registro.porcentaje,60.03);
});

test('rechaza mapas desconocidos, STATS inconsistentes y probabilidades superiores a 100',()=>{
  assert.ok(validarFilaExcel(fila({expedicion:'90'}),catalogo).errores.some(x=>x.includes('Mapa')));
  assert.ok(validarFilaExcel(fila({hamster:'Hammy Hooks',stats:'434'}),catalogo).errores.some(x=>x.includes('STATS')));
  assert.ok(validarFilaExcel(fila({porcentaje:'1.7391'}),catalogo).errores.some(x=>x.includes('Porcentaje')));
  assert.ok(validarFilaExcel(fila({hamster:'Inventado'}),catalogo).errores.some(x=>x.includes('Hámster')));
});

test('nombres y apóstrofos normalizados evitan falsos nombres diferentes',()=>{
  assert.equal(normalizarNombre("Jack O’Mine"),normalizarNombre(" jack  o'mine "));
  assert.equal(claveExpedicion({fecha:'2026-11-12',hamster:"Jack O’Mine",stats:235,expedicion:'3h'}),
    claveExpedicion({fecha:'2026-11-12',hamster:"jack o'mine",stats:235,expedicion:'3h'}));
});

const registro = (extra={})=>({
  fecha:'2026-11-12',hamster:'Banjo Walker',stats:224,
  expedicion:'3h',porcentaje:60.03,nivel:50,finalizado:true,filaExcel:40,...extra
});

test('conserva expediciones repetidas auténticas sin reimportar las anteriores',()=>{
  const excel=[registro({filaExcel:40}),registro({filaExcel:41}),registro({filaExcel:42})];
  const existentes=[{...registro({id:1}),id:1}];
  const p=planificarImportacion(excel,existentes);
  assert.equal(p.ignorar.length,1);
  assert.equal(p.insertar.length,2);
  assert.equal(p.actualizar.length,0);
  const segunda=planificarImportacion(excel,[...existentes,...p.insertar.map((r,i)=>({...r,id:i+2}))]);
  assert.equal(segunda.ignorar.length,3);
  assert.equal(segunda.insertar.length,0);
});

test('resultado de Excel puede completar pendiente y no altera predicciones previas',()=>{
  const excel=[registro({finalizado:false})];
  const previos=[{...registro({id:3,finalizado:null}),id:3,vive_ia:'NO',probabilidad_ia:30}];
  const p=planificarImportacion(excel,previos);
  assert.equal(p.actualizar.length,1);
  assert.deepEqual(p.actualizar[0],{id:3,filaExcel:40,finalizado:false});
  assert.equal(p.insertar.length,0);
});

test('coincidencia con resultados contradictorios queda bajo revisión, sin sobrescribir',()=>{
  const p=planificarImportacion([registro({finalizado:false})],[{...registro(),id:1,finalizado:true}]);
  assert.equal(p.conflictos.length,1);
  assert.equal(p.insertar.length,0);
  assert.equal(p.actualizar.length,0);
});

test('si Excel solo contiene pendiente y la web tiene resultado final se marca para revisión',()=>{
  const p=planificarImportacion([registro({finalizado:null})],[{...registro(),id:1,finalizado:true}]);
  assert.equal(p.conflictos.length,1);
  assert.equal(p.actualizar.length,0);
  assert.equal(p.insertar.length,0);
});

test('no atribuir resultados distintos a pendientes idénticos de manera arbitraria',()=>{
  const excel=[registro({filaExcel:41,finalizado:true}),registro({filaExcel:42,finalizado:false})];
  const previos=[{...registro({id:11,finalizado:null}),id:11},{...registro({id:12,finalizado:null}),id:12}];
  const p=planificarImportacion(excel,previos);
  assert.equal(p.actualizar.length,0);
  assert.equal(p.conflictos.length,2);
  assert.equal(p.insertar.length,0);
});

test('sí puede completar varios pendientes cuando todos los resultados coinciden',()=>{
  const excel=[registro({filaExcel:41,finalizado:true}),registro({filaExcel:42,finalizado:true})];
  const previos=[{...registro({id:11,finalizado:null}),id:11},{...registro({id:12,finalizado:null}),id:12}];
  const p=planificarImportacion(excel,previos);
  assert.equal(p.actualizar.length,2);
  assert.equal(p.conflictos.length,0);
});
