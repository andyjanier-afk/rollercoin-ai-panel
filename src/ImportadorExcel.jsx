import { useMemo, useRef, useState } from 'react';
import { leerExpedicionesExcel, planificarImportacion, consultarRegistrosExistentes } from './importacionExcel';

const ink='#eaf7ff', muted='#a9c7d9', green='#7be6b4', red='#ffadb6', cyan='#8fe4fb', gold='#ffd492';
const btn=(primary=false)=>({
  background:primary?'linear-gradient(120deg,#36c4e5,#178db3)':'#183b53',
  color:primary?'#072232':'#d5f0ff',border:'1px solid #4285a1',
  borderRadius:8,padding:'9px 12px',cursor:'pointer',fontSize:12,fontWeight:800
});
const estadoLabel={
  nueva:['Sin registrar',green],
  actualizar:['Resultado pendiente',cyan],
  registrada:['Ya registrada',muted],
  conflicto:['Revisar coincidencia',gold]
};
const resultadoLabel = r => r === true?'VIVIÓ':r === false?'MURIÓ':'PENDIENTE';
const resultadoColor = r => r === true?green:r === false?red:muted;

function enumerarFilas(revision,plan) {
  const estados=new Map();
  for(const r of plan.insertar) estados.set(r.filaExcel,'nueva');
  for(const r of plan.actualizar) estados.set(r.filaExcel,'actualizar');
  for(const r of plan.ignorar) estados.set(r.filaExcel,'registrada');
  for(const r of plan.conflictos) estados.set(r.filaExcel,'conflicto');
  return revision.validas.map(r=>({...r,_estado:estados.get(r.filaExcel)||'conflicto'}))
    .sort((a,b)=>b.filaExcel-a.filaExcel);
}

export default function ImportadorExcel({supabase,catalogo,onImportado,onSeleccionar}) {
  const archivoInput=useRef(null);
  const [abierto,setAbierto]=useState(false);
  const [leyendo,setLeyendo]=useState(false);
  const [guardando,setGuardando]=useState(false);
  const [archivo,setArchivo]=useState('');
  const [revision,setRevision]=useState(null);
  const [plan,setPlan]=useState(null);
  const [filas,setFilas]=useState([]);
  const [filtro,setFiltro]=useState('nueva');
  const [busqueda,setBusqueda]=useState('');
  const [visibles,setVisibles]=useState(60);
  const [elegida,setElegida]=useState(null);
  const [error,setError]=useState('');
  const [aviso,setAviso]=useState('');

  const filtradas=useMemo(()=>{
    const q=busqueda.toLowerCase().trim();
    return filas.filter(r=>(filtro==='todas'||r._estado===filtro)
      && (!q||[r.hamster,r.expedicion,r.fecha,r.stats,r.filaExcel]
        .some(v=>String(v??'').toLowerCase().includes(q))));
  },[filas,busqueda,filtro]);

  async function leer(event) {
    const file=event.target.files?.[0]; if(!file)return;
    setLeyendo(true);setError('');setAviso('');setPlan(null);setRevision(null);setElegida(null);
    setArchivo(file.name);setFiltro('nueva');setBusqueda('');setVisibles(60);
    try {
      const datos=await leerExpedicionesExcel(file,catalogo);
      const anteriores=await consultarRegistrosExistentes(supabase);
      const nuevoPlan=planificarImportacion(datos.validas,anteriores);
      setRevision(datos);setPlan(nuevoPlan);setFilas(enumerarFilas(datos,nuevoPlan));
    }catch(e){setError('No se pudo revisar el Excel: '+e.message);}
    finally{setLeyendo(false);event.target.value='';}
  }

  function ponerEnFormulario(fila) {
    onSeleccionar(fila);
    setAbierto(false);
  }

  async function guardarUna(fila) {
    if(!fila||guardando)return;
    if(!['nueva','actualizar'].includes(fila._estado))return;
    const confirmacion=
      'Confirmar una sola expedición:\n\n'+fila.hamster+' · '+fila.expedicion+
      '\nFecha: '+fila.fecha+' · STATS: '+fila.stats+
      '\nPorcentaje del Excel: '+fila.porcentaje+'%'+
      '\nResultado real: '+resultadoLabel(fila.finalizado)+
      '\n\n¿Son correctos estos datos?';
    if(!window.confirm(confirmacion))return;
    setGuardando(true);setError('');setAviso('');
    try{
      // Revisión nueva de la base antes de guardar: no asumir que
      // las filas siguen pendientes desde que se abrió el cuadro.
      const anteriores=await consultarRegistrosExistentes(supabase);
      const vigente=planificarImportacion(revision.validas,anteriores);
      const nuevo=vigente.insertar.find(r=>r.filaExcel===fila.filaExcel);
      const pendiente=vigente.actualizar.find(r=>r.filaExcel===fila.filaExcel);
      if(fila._estado==='nueva'&&nuevo){
        const {data,error:e}=await supabase.from('expediciones').insert([{
          fecha:nuevo.fecha,hamster:nuevo.hamster,stats:nuevo.stats,
          nivel:nuevo.nivel,expedicion:nuevo.expedicion,
          porcentaje:nuevo.porcentaje,finalizado:nuevo.finalizado
          // Nunca registrar predicciones IA falsas sobre expediciones antiguas.
        }]).select('id').single();
        if(e)throw e;
        if(!data?.id)throw Error('Supabase no confirmó el registro.');
        setAviso('Expedición '+data.id+' guardada correctamente ('+resultadoLabel(nuevo.finalizado)+').');
      }else if(fila._estado==='actualizar'&&pendiente){
        const {data,error:e}=await supabase.from('expediciones')
          .update({finalizado:pendiente.finalizado})
          .eq('id',pendiente.id).is('finalizado',null).select('id');
        if(e)throw e;
        if(!data?.length)throw Error('El registro dejó de estar pendiente.');
        setAviso('Resultado de la expedición '+pendiente.id+' actualizado sin alterar su predicción.');
      }else{
        throw Error('La fila cambió desde que abriste el Excel. No se registró para evitar duplicados.');
      }
      const otraLectura=await consultarRegistrosExistentes(supabase);
      const otroPlan=planificarImportacion(revision.validas,otraLectura);
      setPlan(otroPlan);setFilas(enumerarFilas(revision,otroPlan));setElegida(null);
      void onImportado();
    }catch(e){setError('No se pudo guardar: '+e.message);}
    finally{setGuardando(false);}
  }

  return <>
    <button type="button" style={btn(true)} onClick={()=>{setAbierto(true);setError('');}}>
      ▤ Seleccionar expedición del Excel
    </button>
    {abierto&&<div className="modal-overlay" style={{zIndex:20002,padding:12}}
      onMouseDown={e=>{if(e.target===e.currentTarget&&!guardando)setAbierto(false);}}>
      <div role="dialog" aria-modal="true" aria-label="Seleccionar expedición del Excel"
        onMouseDown={e=>e.stopPropagation()}
        style={{background:'#0e2135',color:ink,padding:22,width:'min(1060px,100%)',
          maxHeight:'94vh',overflowY:'auto',border:'1px solid #387e9b',borderRadius:14}}>
        <div style={{display:'flex',gap:10,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
          <div>
            <small style={{color:cyan,fontWeight:800,letterSpacing:1.1}}>ROLLERCOIN AI · SELECCIÓN MANUAL</small>
            <h2 style={{fontSize:22,margin:'5px 0'}}>Elegir expedición del Excel</h2>
          </div>
          <button type="button" style={btn()} disabled={guardando} onClick={()=>setAbierto(false)}>Cerrar ✕</button>
        </div>
        <p style={{color:muted,fontSize:12,lineHeight:1.7}}>
          Selecciona tu archivo, busca una expedición y elige qué hacer con esa fila.
          <strong style={{color:ink}}> No se importa todo el Excel ni se ejecutan macros.</strong>
        </p>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',
          border:'1px dashed #47829f',borderRadius:10,padding:14,background:'#132c43'}}>
          <button type="button" style={btn(true)} disabled={leyendo||guardando}
            onClick={()=>archivoInput.current?.click()}>{leyendo?'Leyendo…':'Abrir Excel (.xlsm/.xlsx)'}</button>
          <input type="file" ref={archivoInput} accept=".xlsm,.xlsx"
            style={{display:'none'}} onChange={leer}/>
          <span style={{fontSize:12,color:muted}}>{archivo||'No se ha seleccionado archivo'}</span>
        </div>
        {error&&<p role="alert" style={{fontSize:12,color:red}}>{error}</p>}
        {aviso&&<p role="status" style={{fontSize:12,color:green}}>{aviso}</p>}
        {revision&&plan&&<>
          <div style={{display:'flex',gap:9,flexWrap:'wrap',margin:'17px 0'}}>
            {[
              ['Nuevas',plan.insertar.length,green],
              ['Ya registradas',plan.ignorar.length,muted],
              ['Resultados pendientes',plan.actualizar.length,cyan],
              ['Coincidencias dudosas',plan.conflictos.length,gold],
              ['Filas con errores',revision.invalidas.length,red]
            ].map(([label,n,color])=><div key={label} style={{background:'#142f46',
              border:'1px solid #315d78',borderRadius:9,padding:'11px 12px',flex:'1 1 135px'}}>
              <small style={{display:'block',color:muted,fontSize:10}}>{label}</small>
              <strong style={{fontSize:21,color}}>{n}</strong>
            </div>)}
          </div>
          <div style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:12}}>
            <input type="search" value={busqueda} placeholder="Buscar hámster, fecha, mapa, STATS o fila…"
              onChange={e=>{setBusqueda(e.target.value);setVisibles(60);}}
              style={{minWidth:0,flex:'1 1 250px',padding:11,borderRadius:8,
                background:'#102a42',color:ink,border:'1px solid #46728d'}}/>
            <select aria-label="Filtrar por estado" value={filtro}
              onChange={e=>{setFiltro(e.target.value);setElegida(null);setVisibles(60);}}
              style={{padding:11,background:'#14334b',color:ink,border:'1px solid #46728d',borderRadius:8}}>
              <option value="nueva">Solo nuevas</option>
              <option value="todas">Todas las filas válidas</option>
              <option value="actualizar">Completar resultado</option>
              <option value="registrada">Ya registradas</option>
              <option value="conflicto">Revisar coincidencias</option>
            </select>
          </div>
          <p style={{fontSize:11,color:muted}}>Mostrando {Math.min(filtradas.length,visibles)} de {filtradas.length} filas.</p>
          <div style={{border:'1px solid #365873',borderRadius:9,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead style={{background:'#1c435d',textAlign:'left'}}>
                <tr>{['Fila','Fecha','Hámster','Mapa','STATS','%','Resultado','Estado',''].map(h=>
                  <th key={h} style={{padding:'11px 9px',whiteSpace:'nowrap'}}>{h}</th>)}</tr>
              </thead>
              <tbody>{filtradas.slice(0,visibles).map(row=><tr key={row.filaExcel}
                style={{borderTop:'1px solid #2c4e65',background:elegida?.filaExcel===row.filaExcel?'#174765':'transparent'}}>
                <td style={{padding:'9px'}}>{row.filaExcel}</td>
                <td style={{padding:'9px',whiteSpace:'nowrap'}}>{row.fecha}</td>
                <td style={{padding:'9px',fontWeight:750,minWidth:106}}>{row.hamster}</td>
                <td style={{padding:'9px',whiteSpace:'nowrap'}}>{row.expedicion}</td>
                <td style={{padding:'9px'}}>{row.stats}</td>
                <td style={{padding:'9px'}}>{row.porcentaje}%</td>
                <td style={{padding:'9px',color:resultadoColor(row.finalizado)}}>{resultadoLabel(row.finalizado)}</td>
                <td style={{padding:'9px',color:estadoLabel[row._estado]?.[1],fontSize:11}}>{estadoLabel[row._estado]?.[0]}</td>
                <td style={{padding:'9px'}}>
                  <button type="button" style={{...btn(),padding:'7px 10px'}}
                    onClick={()=>setElegida(row)}>
                    {elegida?.filaExcel===row.filaExcel?'✓ Elegida':'Elegir'}
                  </button>
                </td>
              </tr>)}</tbody>
            </table>
            {!filtradas.length&&<p style={{color:muted,fontSize:12,textAlign:'center',padding:18}}>No hay coincidencias.</p>}
          </div>
          {filtradas.length>visibles&&<button type="button" style={{...btn(),marginTop:10}}
            onClick={()=>setVisibles(v=>v+60)}>Mostrar 60 más</button>}
          {revision.invalidas.length>0&&<details style={{marginTop:15}}>
            <summary style={{fontSize:12,color:red,cursor:'pointer',fontWeight:750}}>
              Ver {revision.invalidas.length} filas inválidas (no se registrarán)
            </summary>
            <div style={{maxHeight:175,overflowY:'auto'}}>
              {revision.invalidas.map(r=><div key={r.filaExcel} style={{fontSize:11,color:red,padding:'3px 0'}}>
                Fila {r.filaExcel}: {r.errores.join(' · ')}
              </div>)}
            </div>
          </details>}
          {elegida&&<div style={{marginTop:17,padding:17,border:'1px solid #4393b4',borderRadius:12,
            background:'#113047'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
              <strong>Expedición seleccionada · fila {elegida.filaExcel}</strong>
              <span style={{fontSize:11,color:estadoLabel[elegida._estado]?.[1]}}>{estadoLabel[elegida._estado]?.[0]}</span>
            </div>
            <p style={{fontSize:12,color:muted,lineHeight:1.7}}>
              <strong style={{color:ink}}>{elegida.hamster}</strong> · {elegida.expedicion} · Nivel {elegida.nivel}
              · {elegida.stats} STATS · {elegida.porcentaje}% · {elegida.fecha} ·
              <strong style={{color:resultadoColor(elegida.finalizado)}}> {resultadoLabel(elegida.finalizado)}</strong>
            </p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <button type="button" style={btn()} disabled={guardando} onClick={()=>ponerEnFormulario(elegida)}>
                Rellenar formulario de la página
              </button>
              <button type="button" style={{...btn(true),
                opacity:['nueva','actualizar'].includes(elegida._estado)?1:.45}}
                disabled={guardando||!['nueva','actualizar'].includes(elegida._estado)}
                onClick={()=>guardarUna(elegida)}>
                {guardando?'Registrando…':elegida._estado==='actualizar'?'Completar este resultado':'Registrar solo esta fila'}
              </button>
            </div>
            <p style={{fontSize:11,color:muted,lineHeight:1.6}}>
              Rellenar formulario no guarda nada. Registrar una fila requiere confirmación,
              y no genera predicciones IA históricas inventadas.
            </p>
          </div>}
        </>}
      </div>
    </div>}
  </>;
}
