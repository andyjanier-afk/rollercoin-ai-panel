import {useRef,useState} from 'react';

export const CLAVE_HAMSTERS = 'rc_hamsters_personalizados_v1';
export const IMAGEN_GENERICA = 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/the-hamster/lvl50/idle.png';
const key = s => String(s||'').trim().toLocaleLowerCase('es');
const empty = () => ({nombre:'',nivel:'1',stats:'',bono:'0',img:''});
export function limpiarHamsters(rows, defaults=[]) {
  if (!Array.isArray(rows)) return [];
  const seen = new Set(defaults.map(h=>key(h.nombre)));
  const result = [];
  for (const raw of rows.slice(0,300)) {
    if (!raw || typeof raw !== 'object') continue;
    const nombre=String(raw.nombre||'').trim().replace(/\s+/g,' ').slice(0,70);
    const nivelInicial=Number(raw.nivelInicial),baseStats=Number(raw.baseStats),bono=Number(raw.bono);
    const url=String(raw.img||'').trim();
    if (!nombre||seen.has(key(nombre))||!Number.isInteger(nivelInicial)||nivelInicial<1||nivelInicial>50||
      !Number.isFinite(baseStats)||baseStats<1||baseStats>10000||!Number.isFinite(bono)||bono< -100||bono>100) continue;
    seen.add(key(nombre));
    result.push({nombre,nivelInicial,baseStats,bono,slug:'',img:/^https:\/\/[^\s]+$/i.test(url)?url.slice(0,500):''});
    if (result.length>=200) break;
  }
  return result;
}
export function cargarHamsters(defaults) {
  try {return limpiarHamsters(JSON.parse(localStorage.getItem(CLAVE_HAMSTERS)||'[]'),defaults);}
  catch{return [];}
}
const style={
  btn:{background:'#133b53',border:'1px solid #3f94b8',color:'#9ee8fb',padding:'10px 13px',borderRadius:8,fontWeight:750,fontSize:12,cursor:'pointer'},
  box:{background:'#111f31',border:'1px solid #417591',color:'#e3f3fa',width:'min(760px,100%)',maxHeight:'92vh',overflowY:'auto',padding:22},
  label:{fontSize:11,fontWeight:700,color:'#a9c7da',display:'flex',flexDirection:'column',gap:6},
  input:{width:'100%',background:'#10243a',border:'1px solid #39647e',borderRadius:7,padding:'10px 11px',color:'#eaf7ff',fontSize:13,boxSizing:'border-box'},
  panel:{background:'#152b3e',border:'1px solid #345c74',borderRadius:10,padding:14},
  note:{fontSize:11,lineHeight:1.65,color:'#a1bbd0'},
  small:{background:'#203d53',border:'1px solid #467088',color:'#d4eaf6',borderRadius:7,padding:'7px 10px',fontSize:11,cursor:'pointer'},
};
export default function GestorHamsters({defaults,personalizados,onChange,onSeleccionar,onEliminar}) {
  const [open,setOpen]=useState(false),[editando,setEditando]=useState('');
  const [form,setForm]=useState(empty),[error,setError]=useState(''),[status,setStatus]=useState('');
  const fileRef=useRef(null);
  const campo=(k,v)=>{setForm(p=>({...p,[k]:v}));setError('');};
  const nuevo=()=>{setForm(empty());setEditando('');setError('');setStatus('');setOpen(true);};
  const editar=h=>{setEditando(h.nombre);setForm({nombre:h.nombre,nivel:String(h.nivelInicial),stats:String(h.baseStats+h.nivelInicial-1),bono:String(h.bono),img:h.img||''});setError('');};
  const guardar=e=>{
    e.preventDefault();
    const nombre=form.nombre.trim().replace(/\s+/g,' '),nivel=Number(form.nivel),stats=Number(form.stats),bono=Number(form.bono),img=form.img.trim();
    if (!nombre||nombre.length>70) return setError('Nombre inválido.');
    if (!Number.isInteger(nivel)||nivel<1||nivel>50) return setError('El nivel debe estar entre 1 y 50.');
    if (!Number.isInteger(stats)||stats<nivel||stats>10000) return setError('Escribe los stats reales en ese nivel.');
    if (!Number.isFinite(bono)||bono< -100||bono>100) return setError('El bono debe estar entre -100 y 100.');
    if (img&&(!/^https:\/\/[^\s]+$/i.test(img)||img.length>500)) return setError('La imagen debe tener una URL HTTPS válida.');
    if ([...defaults,...personalizados].some(h=>key(h.nombre)===key(nombre)&&key(h.nombre)!==key(editando))) return setError('Ya existe un hámster con ese nombre.');
    if (!editando&&personalizados.length>=200) return setError('Límite: 200 hámsteres adicionales.');
    const h={nombre,nivelInicial:nivel,baseStats:stats-nivel+1,bono,slug:'',img};
    onChange(editando?personalizados.map(x=>key(x.nombre)===key(editando)?h:x):[...personalizados,h]);
    onSeleccionar(h);setForm(empty());setEditando('');setError('');setStatus('Guardado y seleccionado para la siguiente expedición.');
  };
  const quitar=h=>{
    if(!window.confirm('¿Quitar '+h.nombre+' del catálogo? No se borrará su historial.'))return;
    onChange(personalizados.filter(x=>key(x.nombre)!==key(h.nombre)));
    onEliminar(h.nombre);
    if(editando===h.nombre){setEditando('');setForm(empty());}
    setStatus('Quitado del catálogo. Su historial permanece guardado.');
  };
  const exportar=()=>{
    const blob=new Blob([JSON.stringify({version:1,hamsters:personalizados},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='rollercoin-mis-hamsters.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    setStatus('Catálogo exportado. Impórtalo en tu otra computadora.');
  };
  const importar=async e=>{
    const f=e.target.files?.[0];if(!f)return;
    try {
      if(f.size>150000)throw Error('Archivo demasiado grande.');
      const data=JSON.parse(await f.text()),rows=Array.isArray(data)?data:data.hamsters;
      if(!Array.isArray(rows))throw Error('Formato incorrecto.');
      const nuevos=limpiarHamsters(rows,defaults);
      if(rows.length&&!nuevos.length)throw Error('Ningún hámster válido.');
      const map=new Map(personalizados.map(h=>[key(h.nombre),h]));nuevos.forEach(h=>map.set(key(h.nombre),h));
      onChange(limpiarHamsters([...map.values()],defaults));
      setStatus('Importados '+nuevos.length+' hámster(es).');setError('');
    } catch(ex) {setError('No se pudo importar: '+ex.message);}
    finally{e.target.value='';}
  };
  return <>
    <button type="button" style={{...style.btn,alignSelf:'flex-start'}} onClick={nuevo}>＋ Añadir o gestionar hámsteres {personalizados.length?'('+personalizados.length+')':''}</button>
    {open&&<div className="modal-overlay" style={{zIndex:20000,padding:12}} onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Gestor de hámsteres" onMouseDown={e=>e.stopPropagation()} style={style.box}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div><small style={{color:'#68d5f2',fontWeight:800}}>CATÁLOGO PERSONALIZADO</small><h2 style={{margin:'5px 0',color:'#f0f9ff'}}>Mis hámsteres</h2></div>
          <button type="button" style={style.small} onClick={()=>setOpen(false)}>✕ Cerrar</button>
        </div>
        <div style={{display:'flex',gap:20,flexWrap:'wrap',marginTop:18}}>
          <form onSubmit={guardar} style={{flex:'1 1 280px',minWidth:0,display:'flex',flexDirection:'column',gap:12}}>
            <strong>{editando?'Editar':'Registrar nuevo hámster'}</strong>
            <label style={style.label}>Nombre<input style={style.input} value={form.nombre} required maxLength={70} disabled={!!editando} onChange={e=>campo('nombre',e.target.value)} placeholder="Nombre exacto del juego"/></label>
            <div style={{display:'flex',gap:10}}>
              <label style={{...style.label,flex:1,minWidth:0}}>Nivel<input style={style.input} type="number" min="1" max="50" required value={form.nivel} onChange={e=>campo('nivel',e.target.value)}/></label>
              <label style={{...style.label,flex:1,minWidth:0}}>Stats actuales<input style={style.input} type="number" min="1" max="10000" required value={form.stats} onChange={e=>campo('stats',e.target.value)} placeholder="Ej.: 220"/></label>
            </div>
            <label style={style.label}>Bono (%)<input style={style.input} type="number" min="-100" max="100" step=".01" value={form.bono} onChange={e=>campo('bono',e.target.value)}/></label>
            <label style={style.label}>URL de imagen (opcional)<input style={style.input} type="url" placeholder="https://..." value={form.img} onChange={e=>campo('img',e.target.value)}/></label>
            <p style={style.note}>Introduce datos reales del juego. Se calcula una base suponiendo +1 stat por nivel, como en el catálogo actual. Sin foto se muestra una genérica.</p>
            {error&&<span role="alert" style={{color:'#ffaaa9',fontSize:12}}>{error}</span>}
            {status&&<span role="status" style={{color:'#84e2ba',fontSize:12}}>{status}</span>}
            {editando&&<button type="button" style={style.small} onClick={nuevo}>Cancelar edición</button>}
            <button type="submit" style={{...style.btn,background:'#35b9d7',color:'#082334',fontWeight:850}}>{editando?'Guardar cambios':'+ Registrar hámster'}</button>
          </form>
          <aside style={{flex:'1 1 260px',minWidth:0}}>
            <div style={style.panel}>
              <strong style={{fontSize:13}}>Registrados manualmente: {personalizados.length}</strong>
              <div style={{maxHeight:260,overflowY:'auto',marginTop:12}}>
                {!personalizados.length&&<p style={style.note}>Aquí aparecerán los hámsteres que añadas.</p>}
                {personalizados.map(h=><div key={h.nombre} style={{display:'flex',gap:7,alignItems:'center',padding:'8px 0',borderBottom:'1px solid #2b455b'}}>
                  <span aria-hidden="true">🐹</span><div style={{flex:1,minWidth:0}}>
                    <strong style={{fontSize:12,display:'block',overflowWrap:'anywhere'}}>{h.nombre}</strong>
                    <small style={{fontSize:10,color:'#a7c6d9'}}>Nv. {h.nivelInicial} · {h.baseStats+h.nivelInicial-1} stats</small>
                  </div>
                  <button type="button" style={style.small} onClick={()=>editar(h)}>Editar</button>
                  <button type="button" style={{...style.small,color:'#ffbfc3'}} onClick={()=>quitar(h)}>Quitar</button>
                </div>)}
              </div>
            </div>
            <div style={{...style.panel,marginTop:14}}>
              <strong style={{fontSize:12,color:'#9ee9f9'}}>Usar en laptop y escritorio</strong>
              <p style={style.note}>El catálogo solo se guarda en este navegador. Para llevarlo a otro equipo utiliza Exportar e Importar.</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button type="button" disabled={!personalizados.length} style={style.small} onClick={exportar}>Exportar JSON</button>
                <button type="button" style={style.small} onClick={()=>fileRef.current?.click()}>Importar JSON</button>
                <input type="file" ref={fileRef} accept=".json,application/json" style={{display:'none'}} onChange={importar}/>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>}
  </>;
}
