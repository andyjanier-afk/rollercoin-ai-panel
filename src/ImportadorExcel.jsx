import { useRef, useState } from 'react';
import { leerExpedicionesExcel, planificarImportacion, consultarRegistrosExistentes } from './importacionExcel';

const skin = {
  button: { background:'linear-gradient(135deg,#0a5470,#10364d)', color:'#b5efff', border:'1px solid #388daf',
    borderRadius:9,padding:'11px 15px',fontWeight:800,fontSize:12,cursor:'pointer' },
  neutral:{background:'#173049',color:'#d2eaf8',border:'1px solid #456880',borderRadius:8,padding:'9px 13px',fontWeight:700,fontSize:12,cursor:'pointer'},
  modal:{background:'#0d1f33',color:'#eefaff',width:'min(960px,100%)',maxHeight:'93vh',overflowY:'auto',border:'1px solid #347895',borderRadius:14,padding:23,boxShadow:'0 20px 70px #020915cc'},
  stat:{background:'#122a42',border:'1px solid #2c5875',borderRadius:10,padding:'12px 16px',flex:'1 1 130px'},
  table:{width:'100%',borderCollapse:'collapse',fontSize:12},
  note:{color:'#a8c8db',fontSize:12,lineHeight:1.65},
  error:{color:'#ffb5ba',fontSize:12,lineHeight:1.6}
};
const fmt = n => Number(n||0).toLocaleString('es-EC');

export default function ImportadorExcel({ supabase, catalogo, onImportado }) {
  const [abierto,setAbierto] = useState(false);
  const [analizando,setAnalizando] = useState(false);
  const [importando,setImportando] = useState(false);
  const [archivo,setArchivo] = useState('');
  const [revision,setRevision] = useState(null);
  const [plan,setPlan] = useState(null);
  const [error,setError] = useState('');
  const [resultado,setResultado] = useState('');
  const [progreso,setProgreso] = useState('');
  const [incluirPendientes,setIncluirPendientes] = useState(false);
  const inputFile=useRef(null);

  const abrir=()=>{
    setAbierto(true);
    setError('');
    setResultado('');
  };

  const procesar = async event => {
    const file=event.target.files?.[0];
    if (!file) return;
    setAnalizando(true);setError('');setResultado('');setPlan(null);setRevision(null);
    setArchivo(file.name);setIncluirPendientes(false);
    try {
      const dato=await leerExpedicionesExcel(file,catalogo);
      const existentes=await consultarRegistrosExistentes(supabase);
      const planificado=planificarImportacion(dato.validas,existentes);
      setRevision({...dato, existentes:existentes.length});
      setPlan(planificado);
    } catch(err) {
      setError('No se pudo analizar el archivo: '+err.message);
    } finally {
      setAnalizando(false);
      event.target.value='';
    }
  };

  const importar = async () => {
    if(!plan||importando)return;
    const actualizaciones=incluirPendientes?plan.actualizar:[];
    const total=plan.insertar.length+actualizaciones.length;
    if (!total) {setResultado('No hay nuevas expediciones seleccionadas.');return;}
    if(!window.confirm('¿Importar '+plan.insertar.length+' expediciones NUEVAS'
      +(incluirPendientes?' y actualizar '+actualizaciones.length+' resultados pendientes':'')
      +' en Supabase? La importación se hará en tu base de datos real.'))return;
    setImportando(true);setError('');setResultado('');
    let creadas=0,actualizadas=0,fallos=0;
    const incidencias=[];
    try {
      // Verificar nuevamente antes de importar para evitar cargas duplicadas al
      // utilizar simultáneamente varias ventanas o computadoras.
      const existentes=await consultarRegistrosExistentes(supabase);
      const verificado=planificarImportacion(revision.validas,existentes);
      const preAprobados = new Map(plan.insertar.map(x=>[x.filaExcel,x]));
      const nuevos=verificado.insertar.filter(x=>preAprobados.has(x.filaExcel));
      const actualizacionesSeguras=incluirPendientes
        ?verificado.actualizar.filter(x=>actualizaciones.some(y=>y.filaExcel===x.filaExcel))
        :[];
      if (!nuevos.length&&!actualizacionesSeguras.length) {
        setResultado('No quedan registros nuevos por importar; Supabase ya contiene esos resultados.');
        setPlan(verificado);
        return;
      }
      const cantidad=nuevos.length+actualizacionesSeguras.length;
      for (let n=0;n<nuevos.length;n+=25) {
        const lote=nuevos.slice(n,n+25);
        setProgreso('Guardando expediciones nuevas: '+Math.min(n+25,nuevos.length)+'/'+nuevos.length);
        const {error:err}=await supabase.from('expediciones').insert(lote.map(item=>({
          fecha:item.fecha,hamster:item.hamster,nivel:item.nivel,stats:item.stats,
          expedicion:item.expedicion,porcentaje:item.porcentaje,finalizado:item.finalizado
          // Sin vive_ia ni probabilidad_ia: no inventar aciertos históricos.
        })));
        if(err) {fallos+=lote.length;incidencias.push('Lote '+(n+1)+': '+err.message);break;}
        creadas+=lote.length;
      }
      if(fallos===0){
        for(const item of actualizacionesSeguras) {
          setProgreso('Completando resultados pendientes: '+(actualizadas+1)+'/'+actualizacionesSeguras.length);
          const {data,error:err}=await supabase.from('expediciones')
            .update({finalizado:item.finalizado})
            .eq('id',item.id).is('finalizado',null).select('id');
          if(err || !data?.length) {
            fallos+=1;incidencias.push('Fila Excel '+item.filaExcel+': '+(err?.message||'Registro ya finalizado'));
          } else actualizadas+=1;
        }
      }
      setResultado(
        'Importación finalizada: '+fmt(creadas)+' nuevas, '+fmt(actualizadas)+' resultados actualizados'
        +(fallos?' y '+fmt(fallos)+' operaciones sin completar.':' sin errores.')
      );
      setProgreso('');
      if(incidencias.length)setError(incidencias.slice(0,4).join(' · '));
      // Recalcular el plan a partir de la base actual tras una importación parcial o total.
      const reconsulta=await consultarRegistrosExistentes(supabase);
      setPlan(planificarImportacion(revision.validas,reconsulta));
      if(creadas||actualizadas)onImportado();
    }catch(err){
      setError('La importación se interrumpió: '+err.message
        +(creadas?' Se guardaron '+creadas+' registros antes del problema; vuelve a analizar el Excel para continuar.':''));
    }finally{
      setImportando(false);setProgreso('');
    }
  };

  const sample = plan ? [
    ...plan.insertar.slice(0,4).map(x=>({...x,_tipo:'Nueva'})),
    ...plan.actualizar.slice(0,2).map(x=>({
      ...(revision?.validas.find(r=>r.filaExcel===x.filaExcel) || {}),
      ...x,_tipo:'Actualizar pendiente'
    })),
    ...plan.conflictos.slice(0,2).map(x=>({...x,_tipo:'Revisar'})),
  ].slice(0,7):[];

  return <>
    <button type="button" style={skin.button} onClick={abrir}> <span aria-hidden="true">⇧</span> Importar Excel (.xlsm/.xlsx)</button>
    {abierto&&<div className="modal-overlay" style={{zIndex:20002,padding:12}}
      onMouseDown={e=>{if(e.target===e.currentTarget&&!importando)setAbierto(false);}}>
      <div role="dialog" aria-modal="true" aria-label="Importar expediciones desde Excel"
        onMouseDown={e=>e.stopPropagation()} style={skin.modal}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div><small style={{color:'#62d5f2',fontWeight:800,letterSpacing:1.1}}>ROLLERCOIN · IMPORTACIÓN SEGURA</small>
            <h2 style={{margin:'7px 0',fontSize:22}}>Importar expediciones del Excel</h2></div>
          <button type="button" onClick={()=>setAbierto(false)} disabled={importando} style={skin.neutral}>Cerrar ✕</button>
        </div>
        <p style={skin.note}>Acepta tu archivo con macros (<strong>.xlsm</strong>) o .xlsx. Se leen solamente las celdas
          de Fecha, stats, Hamster, expedicion, %, finalizado. No se ejecutan macros ni se modifica el Excel.</p>
        <div style={{padding:17,border:'1px dashed #4c98b5',borderRadius:11,background:'#122b40',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
          <button type="button" style={skin.button} disabled={analizando||importando} onClick={()=>inputFile.current?.click()}>
            {analizando?'Analizando…':'Seleccionar archivo Excel'}
          </button>
          <input type="file" ref={inputFile} accept=".xlsm,.xlsx" onChange={procesar} style={{display:'none'}} />
          <span style={{color:'#a8cade',fontSize:12}}>{archivo||'Ningún archivo seleccionado'}</span>
        </div>
        {error&&<p style={skin.error} role="alert">{error}</p>}
        {resultado&&<p style={{fontSize:13,color:'#74e3b8'}} role="status">{resultado}</p>}
        {progreso&&<p style={skin.note} role="status">{progreso}</p>}
        {revision&&plan&&<div style={{marginTop:17}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:9,marginBottom:14}}>
            {[
              ['Filas Excel',revision.total,'#e5f5ff'],
              ['Para importar',plan.insertar.length,'#6fe4b2'],
              ['Ya registradas',plan.ignorar.length,'#adc5d7'],
              ['Pendientes por completar',plan.actualizar.length,'#8ed7f2'],
              ['Conflictos',plan.conflictos.length,'#ffcf8c'],
              ['Filas inválidas',revision.invalidas.length,'#ff9ca5'],
            ].map(([title,num,color])=><div key={title} style={skin.stat}>
                <div style={{fontSize:11,color:'#a3c1d4'}}>{title}</div>
                <strong style={{fontSize:22,color}}>{fmt(num)}</strong>
              </div>)}
          </div>
          {sample.length>0&&<div style={{overflowX:'auto',border:'1px solid #345970',borderRadius:10}}>
            <table style={skin.table}>
              <thead><tr style={{background:'#183b55',textAlign:'left'}}>
                {['Fila','Acción','Fecha','Hámster','Mapa','Stats','Resultado'].map(h=>
                  <th key={h} style={{padding:'11px 9px'}}>{h}</th>)}
              </tr></thead>
              <tbody>{sample.map((r,i)=><tr key={r.filaExcel+'-'+i} style={{borderTop:'1px solid #304d64'}}>
                <td style={{padding:'9px'}}>{r.filaExcel}</td><td style={{padding:'9px'}}>{r._tipo}</td>
                <td style={{padding:'9px'}}>{r.fecha}</td><td style={{padding:'9px'}}>{r.hamster}</td>
                <td style={{padding:'9px'}}>{r.expedicion}</td><td style={{padding:'9px'}}>{r.stats}</td>
                <td style={{padding:'9px',color:r.finalizado===true?'#78e7b1':r.finalizado===false?'#ff9ca5':'#bfd4e0'}}>
                  {r.finalizado===true?'Vivió':r.finalizado===false?'Murió':'Pendiente'}
                </td>
              </tr>)}</tbody>
            </table>
          </div>}
          {revision.invalidas.length>0&&<details style={{marginTop:15}}>
            <summary style={{cursor:'pointer',color:'#ffbdc4',fontSize:12,fontWeight:750}}>
              Ver {revision.invalidas.length} filas con errores (NO se importan)
            </summary>
            <div style={{maxHeight:160,overflowY:'auto',marginTop:9}}>
              {revision.invalidas.slice(0,80).map(x=><div key={x.filaExcel} style={skin.error}>
                Fila {x.filaExcel}: {x.errores.join(' · ')}
              </div>)}
            </div>
          </details>}
          {plan.conflictos.length>0&&<details style={{marginTop:12}}>
            <summary style={{cursor:'pointer',color:'#ffd096',fontSize:12,fontWeight:750}}>
              Ver {plan.conflictos.length} coincidencias ambiguas (NO se importan)
            </summary>
            <div style={{maxHeight:160,overflowY:'auto',marginTop:9}}>
              {plan.conflictos.slice(0,80).map(x=><div key={x.filaExcel} style={skin.note}>Fila {x.filaExcel}: {x.motivo}</div>)}
            </div>
          </details>}
          {plan.actualizar.length>0&&<label style={{display:'flex',alignItems:'flex-start',gap:9,fontSize:12,color:'#c9e4f3',marginTop:18}}>
            <input type="checkbox" checked={incluirPendientes} disabled={importando}
              onChange={e=>setIncluirPendientes(e.target.checked)}/>
            <span>También completar <strong>{plan.actualizar.length} resultados pendientes</strong> en Supabase usando los resultados del Excel.
              No se modificarán predicciones guardadas.</span>
          </label>}
          <p style={{...skin.note,marginTop:13}}>
            Las expediciones antiguas se registran <strong>sin predicción IA histórica</strong>: entrenan el modelo,
            pero no se cuentan como aciertos o fallos de pronósticos que nunca se hicieron.
            La detección de repetidos compara fecha, hámster, mapa y stats, respetando cuántas veces aparece cada combinación.
            Las coincidencias ambiguas quedan pendientes de revisión manual.
          </p>
          <div style={{display:'flex',justifyContent:'flex-end',gap:9,flexWrap:'wrap',marginTop:15}}>
            <button type="button" style={skin.neutral} onClick={()=>setAbierto(false)} disabled={importando}>Cancelar</button>
            <button type="button" style={{...skin.button,opacity:importando||(!plan.insertar.length&&!(incluirPendientes&&plan.actualizar.length))?.6:1}}
              disabled={importando||(!plan.insertar.length&&!(incluirPendientes&&plan.actualizar.length))}
              onClick={importar}>
              {importando?'Importando…': 'Confirmar '+(plan.insertar.length+(incluirPendientes?plan.actualizar.length:0))+' registros'}
            </button>
          </div>
        </div>}
      </div>
    </div>}
  </>;
}
