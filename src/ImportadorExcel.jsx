import { useEffect, useMemo, useRef, useState } from 'react';
import { leerExpedicionesExcel, planificarImportacion, consultarRegistrosExistentes, validarFilaExcel } from './importacionExcel';
import { ordenarExcelRecientePrimero } from './expedicionesActivas';
import { oneDriveConfigurado, conectarOneDrive, recibirSesionOneDrive, conectadoOneDrive, desconectarOneDrive, tienePermisoEnlacesCompartidos, buscarExcelEnOneDrive, descargarExcelDeOneDrive, descargarExcelCompartido } from './onedrive';

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
  return ordenarExcelRecientePrimero(
    revision.validas.map(r=>({...r,_estado:estados.get(r.filaExcel)||'conflicto'}))
  );
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
  const [fechasCorregidas,setFechasCorregidas]=useState({});
  const [corrigiendoFecha,setCorrigiendoFecha]=useState(false);
  const [onedriveConectado,setOnedriveConectado]=useState(conectadoOneDrive);
  const [permisoCompartido,setPermisoCompartido]=useState(tienePermisoEnlacesCompartidos);
  const [onedriveResultados,setOnedriveResultados]=useState([]);
  const [onedriveCargando,setOnedriveCargando]=useState(false);
  const [onedriveArchivo,setOnedriveArchivo]=useState(null);
  const [onedriveBusqueda,setOnedriveBusqueda]=useState('expediciones');
  const [enlaceCompartido,setEnlaceCompartido]=useState(()=>{
    try {return localStorage.getItem('rc_excel_compartido_v1') || '';} catch {return '';}
  });
  const [recordarEnlace,setRecordarEnlace]=useState(()=>{
    try {return Boolean(localStorage.getItem('rc_excel_compartido_v1'));} catch {return false;}
  });

  useEffect(()=>{
    let mounted=true;
    recibirSesionOneDrive()
      .then(connected=>{
        if(mounted && connected){
          setOnedriveConectado(true);
          setPermisoCompartido(tienePermisoEnlacesCompartidos());
          setAbierto(true);
          setAviso('OneDrive conectado. Busca tu Excel para leerlo directamente de la nube.');
        }
      })
      .catch(error=>{
        if(mounted){
          setAbierto(true);
          setError('No se pudo conectar OneDrive: '+error.message);
        }
      });
    return ()=>{mounted=false;};
  },[]);


  const filtradas=useMemo(()=>{
    const q=busqueda.toLowerCase().trim();
    return filas.filter(r=>(filtro==='todas'||r._estado===filtro)
      && (!q||[r.hamster,r.expedicion,r.fecha,r.stats,r.filaExcel]
        .some(v=>String(v??'').toLowerCase().includes(q))));
  },[filas,busqueda,filtro]);

  async function analizarArchivo(file) {
    if(!file)return;
    setLeyendo(true);setError('');setAviso('');setPlan(null);setRevision(null);setElegida(null);
    setArchivo(file.name);setFiltro('nueva');setBusqueda('');setVisibles(60);setFechasCorregidas({});
    try {
      const datos=await leerExpedicionesExcel(file,catalogo);
      const anteriores=await consultarRegistrosExistentes(supabase);
      const nuevoPlan=planificarImportacion(datos.validas,anteriores);
      setRevision(datos);setPlan(nuevoPlan);setFilas(enumerarFilas(datos,nuevoPlan));
    }catch(e){setError('No se pudo revisar el Excel: '+e.message);}
    finally{setLeyendo(false);}
  }

  async function leer(event){
    const file=event.target.files?.[0];
    if(file)await analizarArchivo(file);
    event.target.value='';
  }

  async function buscarOneDrive(){
    setOnedriveCargando(true);setError('');
    try {
      const encontrados=await buscarExcelEnOneDrive(onedriveBusqueda);
      setOnedriveResultados(encontrados);
      if(!encontrados.length)setAviso('No se encontraron Excel con ese nombre. Prueba con una búsqueda diferente.');
      else setAviso('Selecciona el Excel correcto para cargar sus filas.');
    } catch(e){setError('No se pudo buscar en OneDrive: '+e.message);}
    finally{setOnedriveCargando(false);}
  }

  async function cargarOneDrive(item) {
    setOnedriveCargando(true);setError('');
    try {
      const file=await descargarExcelDeOneDrive(item.id,item.name);
      setOnedriveArchivo({id:item.id,name:item.name});
      await analizarArchivo(file);
    } catch(e){setError('No se pudo leer el Excel desde OneDrive: '+e.message);}
    finally{setOnedriveCargando(false);}
  }

  async function actualizarOneDrive() {
    if(!onedriveArchivo)return;
    if(onedriveArchivo.tipo==='compartido'){
      setEnlaceCompartido(onedriveArchivo.enlace);
      setOnedriveCargando(true);setError('');
      try {
        const file=await descargarExcelCompartido(onedriveArchivo.enlace);
        await analizarArchivo(file);
        setAviso('Archivo compartido actualizado desde OneDrive.');
      }catch(e){setError('No se pudo actualizar el enlace compartido: '+e.message);}
      finally{setOnedriveCargando(false);}
      return;
    }
    await cargarOneDrive(onedriveArchivo);
  }

  async function cargarEnlaceCompartido() {
    if(onedriveCargando)return;
    if(!permisoCompartido){
      setError('Antes de abrir enlaces compartidos, debes decidir si autorizas Files.ReadWrite. Este permiso incluye escritura aunque RollerCoin AI solo lee archivos.');
      return;
    }
    setOnedriveCargando(true);
    setError('');
    try {
      const file=await descargarExcelCompartido(enlaceCompartido);
      if(recordarEnlace) {
        try {localStorage.setItem('rc_excel_compartido_v1',enlaceCompartido.trim());} catch {}
      } else {
        try {localStorage.removeItem('rc_excel_compartido_v1');} catch {}
      }
      setOnedriveArchivo({tipo:'compartido',enlace:enlaceCompartido.trim(),name:file.name});
      await analizarArchivo(file);
      setAviso('Excel compartido cargado desde OneDrive. Elige las filas que deseas utilizar.');
    } catch(e) {
      setError('No se pudo abrir el enlace compartido: '+e.message+
        ' Si el archivo requiere iniciar sesión con otra cuenta, solicita al propietario acceso para tu cuenta Microsoft.');
    } finally {setOnedriveCargando(false);}
  }

  async function confirmarFecha(row) {
    const fechaReal = fechasCorregidas[row.filaExcel] || '';
    const hoy = new Date();
    const hoyLocal = [hoy.getFullYear(),String(hoy.getMonth()+1).padStart(2,'0'),String(hoy.getDate()).padStart(2,'0')].join('-');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaReal) || fechaReal > hoyLocal) {
      setError('Debes introducir la fecha real de la expedición (no puede ser una fecha futura).');
      return;
    }
    if (!revision || !revision.fechasPorRevisar?.some(x=>x.filaExcel===row.filaExcel)) return;
    const original = row.origen;
    const revisada = validarFilaExcel({
      ...original, fecha:fechaReal, fechaAutomatica:false,
    }, catalogo);
    setCorrigiendoFecha(true);
    setError('');
    try {
      const validas = revision.validas.filter(x=>x.filaExcel!==row.filaExcel);
      if (revisada.registro) validas.push({...revisada.registro,filaExcel:row.filaExcel});
      const invalidas = revision.invalidas.filter(x=>x.filaExcel!==row.filaExcel);
      if (revisada.errores.length) invalidas.push({filaExcel:row.filaExcel,errores:revisada.errores});
      const revisionNueva = {
        ...revision,validas,invalidas,
        fechasPorRevisar: revision.fechasPorRevisar.filter(x=>x.filaExcel!==row.filaExcel),
      };
      const anteriores = await consultarRegistrosExistentes(supabase);
      const nuevoPlan = planificarImportacion(revisionNueva.validas,anteriores);
      setRevision(revisionNueva);setPlan(nuevoPlan);
      setFilas(enumerarFilas(revisionNueva,nuevoPlan));
      setAviso(revisada.registro
        ? 'Fecha real confirmada para la fila '+row.filaExcel+': '+fechaReal+'. Ahora ya puedes seleccionarla.'
        : 'Fecha corregida en fila '+row.filaExcel+', pero hay otros errores en los datos de esa fila.');
      setElegida(null);
    } catch(e) {setError('No se pudo revisar el registro corregido: '+e.message);}
    finally {setCorrigiendoFecha(false);}
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
          Abre tu Excel y pulsa «Cargar» directamente en la fila: los datos aparecerán arriba sin desplazarte ni registrar nada.
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
        <section style={{marginTop:12,background:'#102c41',border:'1px solid #357993',
          padding:14,borderRadius:10}}>
          <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'space-between',flexWrap:'wrap'}}>
            <div>
              <strong style={{color:cyan,fontSize:13}}>Excel directamente desde OneDrive</strong>
              <p style={{fontSize:11,color:muted,margin:'4px 0 0'}}>
                Solo lectura. Puedes abrir el Excel que otra persona te compartió; las macros permanecen intactas.
              </p>
            </div>
            {onedriveConectado&&<button type="button" style={btn()} onClick={()=>{
              desconectarOneDrive();setOnedriveConectado(false);setPermisoCompartido(false);setOnedriveResultados([]);setOnedriveArchivo(null);
              setAviso('Sesión de OneDrive cerrada.');
            }}>Desconectar</button>}
          </div>
          {!oneDriveConfigurado()?
            <p style={{fontSize:12,color:gold,lineHeight:1.6}}>
              Para activar la conexión Microsoft, el administrador debe configurar
              VITE_MICROSOFT_CLIENT_ID en Vercel y autorizar el dominio como aplicación SPA.
              Puedes seguir abriendo el Excel manualmente mientras tanto.
            </p>
          :!onedriveConectado?
            <button type="button" style={{...btn(true),marginTop:12}} onClick={()=>{
              conectarOneDrive().catch(e=>setError('No se pudo iniciar Microsoft: '+e.message));
            }}>Conectar mi OneDrive</button>
          :<>
            <div style={{marginTop:14,padding:13,borderRadius:9,border:'1px solid #437793',background:'#14374d'}}>
              <strong style={{fontSize:13,color:'#b6f0ff'}}>Abrir Excel que te compartió otra persona</strong>
              <p style={{fontSize:11,color:muted,margin:'6px 0 10px',lineHeight:1.6}}>
                Pega el enlace completo de OneDrive que te enviaron. No hace falta que seas el propietario,
                pero necesitas permiso para acceder al archivo. No se modifica ni se copia a tu OneDrive.
              </p>
              {!permisoCompartido&&<div style={{margin:'10px 0',padding:'11px 12px',borderRadius:8,
                background:'#3c2d1f',border:'1px solid #a88453',fontSize:11,color:'#ffe0ad',lineHeight:1.65}}>
                Para abrir archivos compartidos con Microsoft Graph, Microsoft exige el permiso
                <strong> Files.ReadWrite</strong>. Este permiso concede lectura y escritura sobre archivos
                accesibles de tu cuenta, aunque el código de RollerCoin AI <strong>solo leerá</strong> el Excel.
                Es opcional: puedes seguir cargando el .xlsm manualmente sin autorizarlo.
                <div style={{marginTop:10}}>
                  <button type="button" style={btn()} onClick={()=>{
                    if(!window.confirm('Microsoft solicita Files.ReadWrite para enlaces compartidos. Aunque RollerCoin AI solo leerá archivos, este permiso técnicamente permite modificar los archivos accesibles. ¿Quieres ir a Microsoft y decidir si autorizas el acceso?')) return;
                    conectarOneDrive({compartidos:true}).catch(e=>setError('No se pudo solicitar acceso: '+e.message));
                  }}>Autorizar acceso ampliado a enlaces compartidos</button>
                </div>
              </div>}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                <input type="url" aria-label="Enlace compartido del Excel" value={enlaceCompartido}
                  placeholder="https://onedrive.live.com/..."
                  onChange={e=>setEnlaceCompartido(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void cargarEnlaceCompartido();}}}
                  style={{flex:'1 1 310px',minWidth:0,padding:'10px 12px',borderRadius:8,
                    background:'#0d283b',border:'1px solid #4e829b',color:ink,fontSize:12}}/>
                <button type="button" style={btn(true)}
                  disabled={onedriveCargando||!enlaceCompartido.trim()||!permisoCompartido}
                  onClick={cargarEnlaceCompartido}>
                  {onedriveCargando?'Cargando…':'Abrir enlace compartido'}
                </button>
              </div>
              <label style={{display:'flex',gap:8,alignItems:'center',marginTop:10,fontSize:11,color:muted}}>
                <input type="checkbox" checked={recordarEnlace} onChange={e=>{
                  setRecordarEnlace(e.target.checked);
                  if(!e.target.checked){try{localStorage.removeItem('rc_excel_compartido_v1');}catch{}}
                }}/>
                Recordar el enlace en este navegador (no se envía a Supabase)
              </label>
            </div>
            <details style={{marginTop:13}}>
              <summary style={{cursor:'pointer',fontSize:12,color:cyan}}>
                Buscar archivos que sí están guardados en mi OneDrive
              </summary>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
              <input type="search" aria-label="Buscar Excel en OneDrive" value={onedriveBusqueda}
                onChange={e=>setOnedriveBusqueda(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void buscarOneDrive();}}}
                style={{flex:'1 1 180px',minWidth:0,background:'#102b41',color:ink,
                  border:'1px solid #46718c',padding:'9px 11px',borderRadius:7}}
                placeholder="Buscar expediciones.xlsm" />
              <button type="button" style={btn(true)} disabled={onedriveCargando} onClick={buscarOneDrive}>
                {onedriveCargando?'Consultando…':'Buscar en OneDrive'}
              </button>
              {onedriveArchivo&&<button type="button" style={btn()} disabled={onedriveCargando}
                onClick={actualizarOneDrive}>Actualizar archivo</button>}
            </div>
            {onedriveResultados.length>0&&<div style={{display:'grid',gap:6,maxHeight:160,
              overflowY:'auto',marginTop:11}}>
              {onedriveResultados.map(item=><div key={item.id}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,
                  border:'1px solid #315b77',background:'#17354b',padding:'9px 10px',borderRadius:7}}>
                <div style={{minWidth:0}}>
                  <strong style={{fontSize:12,overflowWrap:'anywhere'}}>{item.name}</strong>
                  <small style={{display:'block',fontSize:10,color:muted}}>
                    {item.modificado?'Modificado '+new Date(item.modificado).toLocaleString('es-EC'):''}
                  </small>
                </div>
                <button type="button" style={btn(true)} disabled={onedriveCargando}
                  onClick={()=>cargarOneDrive(item)}>Cargar</button>
              </div>)}
            </div>}
            {onedriveArchivo&&<p style={{fontSize:11,color:green,margin:'9px 0 0'}}>
              Vinculado: {onedriveArchivo.name}. «Actualizar archivo» lee la versión actual de la nube.
            </p>}
            </details>
            {onedriveArchivo?.tipo==='compartido'&&<p style={{fontSize:11,color:green,margin:'10px 0 0'}}>
              Archivo compartido: {onedriveArchivo.name}. Puedes usar «Abrir enlace compartido» otra vez para leer la última versión.
            </p>}
          </>}
        </section>
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
          <div style={{border:'1px solid #365873',borderRadius:9,overflow:'auto',maxHeight:'min(47vh,410px)'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead style={{background:'#1c435d',textAlign:'left',position:'sticky',top:0,zIndex:2}}>
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
                <td style={{padding:'9px',whiteSpace:'nowrap'}}>
                  <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                    <button type="button" style={{...btn(true),padding:'7px 10px'}} disabled={guardando}
                      onClick={()=>ponerEnFormulario(row)}
                      aria-label={'Cargar fila '+row.filaExcel+' al formulario'}>
                      ↗ Cargar
                    </button>
                    <button type="button" style={{...btn(),padding:'7px 10px'}} disabled={guardando}
                      onClick={()=>setElegida(row)} aria-label={'Ver detalles de fila '+row.filaExcel}>
                      {elegida?.filaExcel===row.filaExcel?'✓':'Ver'}
                    </button>
                  </div>
                </td>
              </tr>)}</tbody>
            </table>
            {!filtradas.length&&<p style={{color:muted,fontSize:12,textAlign:'center',padding:18}}>No hay coincidencias.</p>}
          </div>
          {filtradas.length>visibles&&<button type="button" style={{...btn(),marginTop:10}}
            onClick={()=>setVisibles(v=>v+60)}>Mostrar 60 más</button>}
          {(revision.fechasPorRevisar?.length||0)>0&&<div style={{
            marginTop:17,padding:15,border:'1px solid #bc8855',borderRadius:10,
            background:'#302718'}}>
            <strong style={{fontSize:13,color:'#ffe1a0'}}>
              Fechas automáticas: {revision.fechasPorRevisar.length} filas necesitan confirmación
            </strong>
            <p style={{fontSize:11,lineHeight:1.65,color:'#f0d1a7'}}>
              Estas celdas usan TODAY() / NOW() y Excel cambia la fecha al recalcular.
              El día mostrado no necesariamente corresponde al envío real.
              Indica la fecha correcta para habilitar cada fila. No se modificarán las macros.
            </p>
            <div style={{display:'grid',gap:9,maxHeight:300,overflowY:'auto'}}>
              {revision.fechasPorRevisar.map(row=><div key={row.filaExcel}
                style={{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap',
                  border:'1px solid #866944',borderRadius:7,padding:'9px 10px'}}>
                <div style={{flex:'1 1 170px',fontSize:11,color:'#fbe9c9'}}>
                  <strong>Fila {row.filaExcel} · {row.hamster}</strong>
                  <div style={{color:'#d7bc9a'}}>{row.expedicion} · {row.stats} STATS
                    · Excel muestra {row.fechaMostrada||'sin fecha'}
                  </div>
                </div>
                <label style={{fontSize:11,color:'#f4d8ab'}}>
                  Fecha real
                  <input type="date" aria-label={'Fecha real de fila '+row.filaExcel}
                    max={(()=>{
                      const d=new Date();
                      return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),
                        String(d.getDate()).padStart(2,'0')].join('-');
                    })()}
                    value={fechasCorregidas[row.filaExcel]||''}
                    disabled={corrigiendoFecha||guardando}
                    onChange={e=>setFechasCorregidas(prev=>({...prev,[row.filaExcel]:e.target.value}))}
                    style={{display:'block',marginTop:4,padding:'7px',background:'#1b2a37',
                      color:'#fff',border:'1px solid #a17e51',borderRadius:6}}/>
                </label>
                <button type="button" style={btn()}
                  disabled={!fechasCorregidas[row.filaExcel]||corrigiendoFecha||guardando}
                  onClick={()=>confirmarFecha(row)}>
                  {corrigiendoFecha?'Comprobando…':'Confirmar fecha'}
                </button>
              </div>)}
            </div>
          </div>}
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

        </>}
      </div>
    </div>}
  </>;
}
