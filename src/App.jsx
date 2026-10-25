import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// CONFIGURACIÓN DE CONEXIÓN
// ==========================================
const SUPABASE_URL = 'https://khyuzutnvoqeqkllnsmy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Z9NzjlREhW6RgIqQ3zZ58A_5G6ivYHX';
const FASTAPI_URL = 'https://rollercoin-ai-backend.onrender.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// DATOS BASE
// ==========================================
const HAMSTERS_DEFAULT = [
{ nombre: "Jack O’Mine", baseStats: 220, bono: 0, slug: 'jack_omine', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/jack_omine/lvl01/idle.png', nivelInicial: 1 },
  { nombre: "Uncle'Azoth", baseStats: 230, bono: 5, slug: 'uncle-azoth', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/uncle-azoth/lvl30/idle.png', nivelInicial: 1 },
  { nombre: 'Sir Catch-a-Lot', baseStats: 215, bono: 0, slug: 'sir-catch-a-lot', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/sir-catch-a-lot/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Davy Coins', baseStats: 200, bono: 5, slug: 'davy-coins', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/davy-coins/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Cuscuz', baseStats: 206, bono: 0, slug: 'cuscuz', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/cuscuz/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Mamita', baseStats: 200, bono: 0, slug: 'mamita', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/mamita/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Lady Minerra', baseStats: 205, bono: -5, slug: 'lady_minerra', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/lady_minerra/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Goodncle', baseStats: 180, bono: 5, slug: 'goodncle', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/goodncle/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Plague Dancer', baseStats: 195, bono: 15, slug: 'plague-dancer', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/plague-dancer/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'SOLaire', baseStats: 175, bono: 5, slug: 'solaire', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/solaire/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Gordon Hamzy', baseStats: 210, bono: 10, slug: 'gordon-hamzy', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/gordon-hamzy/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'GFeast', baseStats: 211, bono: -10, slug: 'gfeast', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/gfeast/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Hammy Hooks', baseStats: 205, bono: 10, slug: 'hammy-hooks', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/hammy-hooks/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Eliza Bit', baseStats: 180, bono: 0, slug: 'eliza-bit', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/eliza-bit/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Joga Bonito', baseStats: 210, bono: 5, slug: 'joga-bonito', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/joga-bonito/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Kitsumi', baseStats: 220, bono: 0, slug: 'kitsumi', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/kitsumi/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Captain Jack Pot', baseStats: 220, bono: 5, slug: 'captain-jack-pot', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/captain-jack-pot/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Naughty Claus', baseStats: 185, bono: 10, slug: 'naughty-claus', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/naughty-claus/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Valkirita', baseStats: 205, bono: 0, slug: 'valkirita', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/valkirita/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Lord Hexron', baseStats: 205, bono: 0, slug: 'lord-hexron', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/lord-hexron/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Uncle', baseStats: 200, bono: 0, slug: 'uncle', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/uncle/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Dusty McUncle', baseStats: 200, bono: 0, slug: 'dusty-mcuncle', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/dusty-mcuncle/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Lucky Red', baseStats: 200, bono: 0, slug: 'lucky-red', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/lucky-red/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Badncle', baseStats: 180, bono: 5, slug: 'badncle', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/badncle/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Big Daddy', baseStats: 190, bono: 0, slug: 'big-daddy', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/big-daddy/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Banjo Walker', baseStats: 175, bono: 0, slug: 'banjo-walker', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/banjo-walker/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Guile', baseStats: 100, bono: 5, slug: 'guile', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/guile/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Anomaly', baseStats: 160, bono: 0, slug: 'anomaly', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/anomaly/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'The Dracula', baseStats: 150, bono: 0, slug: 'the-dracula', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/the-dracula/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Birthday Bob', baseStats: 70, bono: 0, slug: 'birthday-bob', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/birthday-bob/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Mr. Jack', baseStats: 65, bono: 0, slug: 'mr-jack', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/mr-jack/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Birthday Jack', baseStats: 65, bono: 0, slug: 'mr-jack', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/mr-jack/lvl50/idle.png', nivelInicial: 50 },
  { nombre: 'Cowham', baseStats: 110, bono: 0, slug: 'cowham', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/cowham/lvl01/idle.png', nivelInicial: 1 },
  { nombre: 'Partello', baseStats: 90, bono: 0, slug: 'partello', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/partello/lvl20/idle.png', nivelInicial: 1 },
  { nombre: 'The Hamster', baseStats: 50, bono: 0, slug: 'the-hamster', img: 'https://api.minaryganar.com/assets/rollercoin/hamsters/pets/the-hamster/lvl50/idle.png', nivelInicial: 1 },
];

const MAPAS_OFICIALES = [
  { nombre: 'Deep Forest', valor: '3h', horas: '3h', dificultad: 2, rewardVal: 2, rewardAmt: 4, bg: 'https://api.minaryganar.com/assets/rollercoin/expeditions/deep_forest.png' },
  { nombre: 'Plague City', valor: '20h', horas: '20h', dificultad: 6, rewardVal: 8, rewardAmt: 6, bg: 'https://api.minaryganar.com/assets/rollercoin/expeditions/plague_city.png' },
  { nombre: 'Dark Valleys', valor: '24h Dark', horas: '24h', dificultad: 7, rewardVal: 8, rewardAmt: 9, bg: 'https://api.minaryganar.com/assets/rollercoin/expeditions/dark_valleys.png' },
  { nombre: 'Valhalla Trail', valor: '18h', horas: '18h', dificultad: 8, rewardVal: 7, rewardAmt: 8, bg: 'https://api.minaryganar.com/assets/rollercoin/expeditions/valhalla_trail.png' },
  { nombre: 'Beach Walk', valor: '24h Beach', horas: '24h', dificultad: 8, rewardVal: 9, rewardAmt: 6, bg: 'https://api.minaryganar.com/assets/rollercoin/expeditions/beach_walk.png' },
  { nombre: 'Lost Shrine', valor: '30h', horas: '30h', dificultad: 10, rewardVal: 10, rewardAmt: 10, bg: 'https://api.minaryganar.com/assets/rollercoin/expeditions/lost_shrine.png' },
];

const getImagenEvolucion = (slug, nivel) => {
  const n = parseInt(nivel) || 1;
  let fase = '01';
  if (n >= 50) fase = '50';
  else if (n >= 40) fase = '40';
  else if (n >= 30) fase = '30';
  else if (n >= 20) fase = '20';
  else if (n >= 10) fase = '10';
  return `https://api.minaryganar.com/assets/rollercoin/hamsters/pets/${slug}/lvl${fase}/idle.png`;
};

const getBasePercent = (stats) => {
  const curve = [
    [50, 24.50], [99, 30.67], [109, 32.09], [110, 32.25], [114, 32.88], [119, 33.71], 
    [149, 39.70], [150, 39.93], [160, 42.33], [175, 46.29], [180, 47.70], [190, 50.68], 
    [195, 52.24], [200, 53.85], [205, 55.51], [210, 57.21], [215, 58.95], [220, 60.76], 
    [224, 62.24], [229, 64.13], [230, 64.51], [249, 72.15], [254, 74.28], [255, 74.71], 
    [260, 76.90], [264, 78.68], [300, 90.00]
  ];
  if (stats <= curve[0][0]) return curve[0][1];
  if (stats >= curve[curve.length-1][0]) return curve[curve.length-1][1];
  for (let i = 0; i < curve.length - 1; i++) {
    if (stats >= curve[i][0] && stats <= curve[i+1][0]) {
      const [x1, y1] = curve[i];
      const [x2, y2] = curve[i+1];
      return y1 + ((stats - x1) / (x2 - x1)) * (y2 - y1);
    }
  }
  return 0;
};

const calcularExitoJuego = (stats, dificultadMapa, bonoHamster) => {
  const probBase = getBasePercent(stats);
  const total = probBase - (dificultadMapa * 1.11) + bonoHamster;
  return total.toFixed(2);
};

// ==========================================
// COMPONENTES DE UI
// ==========================================
function BuscadorHamster({ valorActual, onSelect }) {
  const [busqueda, setBusqueda] = useState(valorActual);
  const [mostrar, setMostrar] = useState(false);
  useEffect(() => { setBusqueda(valorActual); }, [valorActual]);
  const filtrados = HAMSTERS_DEFAULT.filter(h => h.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div style={{ position: 'relative', zIndex: 50 }}>
      <input type="text" className="premium-input" style={styles.input} value={busqueda}
        onChange={e => { setBusqueda(e.target.value); setMostrar(true); }}
        onFocus={() => setMostrar(true)} onBlur={() => setTimeout(() => setMostrar(false), 200)}
        placeholder="Escribe para buscar hámster..."
      />
      {mostrar && (
        <div style={styles.dropdownList}>
          {filtrados.length > 0 ? filtrados.map(h => (
            <div key={h.nombre} onClick={() => { setBusqueda(h.nombre); setMostrar(false); onSelect(h.nombre); }}
              style={{ ...styles.dropdownItem, background: valorActual === h.nombre ? 'rgba(14, 165, 233, 0.15)' : 'transparent', borderLeft: valorActual === h.nombre ? '3px solid #0ea5e9' : '3px solid transparent'}}
            >
              <img src={h.img} alt="" style={{ width:'22px', height:'22px', objectFit:'contain', marginRight:'10px', verticalAlign:'middle' }} />
              {h.nombre}
            </div>
          )) : (<div style={styles.dropdownItem}>No se encontró el hámster</div>)}
        </div>
      )}
    </div>
  );
}

function SelectorMapa({ valorActual, onSelect }) {
  const [abierto, setAbierto] = useState(false);
  const mapaSeleccionado = MAPAS_OFICIALES.find(m => m.valor === valorActual) || MAPAS_OFICIALES[0];

  return (
    <div style={{ position: 'relative', zIndex: 40 }} tabIndex="0" onBlur={() => setTimeout(() => setAbierto(false), 200)}>
      <div className="premium-input" onClick={() => setAbierto(!abierto)}
        style={{...styles.input, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderColor: abierto ? '#38bdf8' : '#2a2d40'}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={mapaSeleccionado.bg} alt="" style={{ width: '28px', height: '18px', borderRadius: '3px', objectFit: 'cover' }} />
          <span>{mapaSeleccionado.nombre} <span style={{color: '#64748b'}}>({mapaSeleccionado.horas})</span></span>
        </div>
        <span style={{ fontSize: '10px', transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}>▼</span>
      </div>
      
      {abierto && (
        <div style={styles.dropdownList}>
          {MAPAS_OFICIALES.map(m => (
            <div key={m.valor} onClick={() => { onSelect(m.valor); setAbierto(false); }}
              style={{...styles.dropdownItem, background: valorActual === m.valor ? 'rgba(14, 165, 233, 0.15)' : 'transparent', color: valorActual === m.valor ? '#38bdf8' : '#e2e8f0', borderLeft: valorActual === m.valor ? '3px solid #0ea5e9' : '3px solid transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={m.bg} alt="" style={{ width: '32px', height: '20px', borderRadius: '3px', objectFit: 'cover'}} />
                <span>{m.nombre} <span style={{ color: '#64748b', fontSize: '11px' }}>({m.horas})</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RollerCard({ mapa, hamsterName, stats, nivel, probabilidad, viveIA, onAction, actionLabel, isPreview, bonoManual }) {
  const hamsterObj = HAMSTERS_DEFAULT.find(h => h.nombre === hamsterName) || HAMSTERS_DEFAULT[0];
  const colorBoton = isPreview ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' : 'linear-gradient(135deg, #7c3aed, #9333ea)';
  const imagenCalculada = isPreview || hamsterName ? getImagenEvolucion(hamsterObj.slug, nivel) : '';
  const bonoAMostrar = bonoManual !== undefined ? bonoManual : hamsterObj.bono;

  return (
    <div className="card-hover" style={styles.rcCard}>
      <div style={{ ...styles.rcBanner, backgroundImage: `url(${mapa.bg})` }}>
        <div style={styles.rcBannerOverlay}></div>
        <h2 style={styles.rcBannerTitle}>{mapa.nombre.toUpperCase()}</h2>
      </div>

      <div style={styles.rcFeatures}>
        <div style={styles.rcFeatureRow}>
          <span style={styles.rcFeatureLabel}>Duration</span>
          <div style={styles.rcBarContainer}><div style={{...styles.rcBarFill, width: `${(parseInt(mapa.horas)/30)*100}%`}}></div></div>
          <span style={styles.rcFeatureValue}>{mapa.horas}</span>
        </div>
        <div style={styles.rcFeatureRow}>
          <span style={styles.rcFeatureLabel}>Difficulty</span>
          <div style={styles.rcBarContainer}><div style={{...styles.rcBarFill, width: `${mapa.dificultad*10}%`}}></div></div>
          <span style={styles.rcFeatureValue}>{mapa.dificultad}</span>
        </div>
      </div>

      <div style={styles.rcHamsterBox}>
        <div style={styles.rcLevelBadge}>{nivel || 1}</div>
        <div style={styles.rcIconTopRight}>🤖</div>
        <div style={styles.rcHamsterName}>{hamsterName}</div>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
          {bonoAMostrar !== 0 && (
            <div style={{...styles.rcHiddenBonus, backgroundColor: bonoAMostrar > 0 ? 'rgba(23, 50, 74, 0.95)' : 'rgba(76, 5, 25, 0.8)', borderColor: bonoAMostrar > 0 ? 'rgba(207, 250, 254, 0.1)' : 'rgba(254, 205, 211, 0.15)', color: bonoAMostrar > 0 ? '#67e8f9' : '#fda4af'}}>
               <span>{bonoAMostrar > 0 ? `+${bonoAMostrar}%` : `${bonoAMostrar}%`}</span>
            </div>
          )}
        </div>
        
        <img src={imagenCalculada} alt={hamsterName} style={styles.rcHamsterImg} onError={(e) => { e.target.src = hamsterObj.img; }} />
        
        {probabilidad ? (
          <div style={styles.rcTimerPill}>
            PROB IA: <span style={{ color: viveIA === 'SI' ? '#4ade80' : '#f87171' }}>{probabilidad}%</span>
          </div>
        ) : (
          <div style={styles.rcTimerPill}>SIN SIMULAR</div>
        )}
        
        {probabilidad && (
          <div style={{ ...styles.rcMoreInfo, color: viveIA === 'SI' ? '#4ade80' : '#f87171' }}>
            {viveIA === 'SI' ? 'SOBREVIVE' : 'MUERE'}
          </div>
        )}
      </div>

      <button className="btn-hover" onClick={onAction} style={{ ...styles.rcViewBtn, background: colorBoton }}>
        {actionLabel}
      </button>
    </div>
  );
}

// ==========================================
// APLICACIÓN PRINCIPAL
// ==========================================
export default function App() {
  const [activas, setActivas] = useState([]);
  const [historial, setHistorial] = useState([]); 
  const [metricas, setMetricas] = useState(null); 
  const [resumenHamsters, setResumenHamsters] = useState([]);
  const [simulacion, setSimulacion] = useState(null); 
  
  // Estado para el Modal Personalizado
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', id: null, title: '', message: '', onConfirm: null });

  const hoy = new Date().toISOString().split('T')[0];
  const formPorDefecto = { fecha: hoy, hamster: "Cuscuz", nivel: 50, stats: 255, expedicion: '30h', porcentaje: '74.71', bono: 0 };

  const [form, setForm] = useState(() => {
    const guardado = localStorage.getItem('rc_expeditions_form');
    return guardado ? { ...formPorDefecto, ...JSON.parse(guardado), fecha: hoy } : formPorDefecto;
  });

  useEffect(() => { localStorage.setItem('rc_expeditions_form', JSON.stringify(form)); }, [form]);

  const cargarDashboard = async () => {
    try {
      const { data: act } = await supabase.from('expediciones').select('*').is('finalizado', null).order('id', { ascending: false });
      const { data: hist } = await supabase.from('expediciones').select('*').not('finalizado', 'is', null).order('fecha', { ascending: false }).order('id', { ascending: false }).limit(50);
      
      setActivas(act || []);
      setHistorial(hist || []);

      const res = await fetch(`${FASTAPI_URL}/metricas`);
      if (res.ok) {
        const data = await res.json();
        setMetricas(data.metricas);
        setResumenHamsters(data.resumen_hamsters || []);
      }
    } catch (err) { 
      console.error("Error sincronizando:", err);
    }
  };

  useEffect(() => { cargarDashboard(); }, []);

  const recalcularTodo = (nombreH, nivelActual, mapaValor, bonoManual, esNuevoHamster = false) => {
    const hObj = HAMSTERS_DEFAULT.find(x => x.nombre === nombreH) || HAMSTERS_DEFAULT[0];
    const mObj = MAPAS_OFICIALES.find(m => m.valor === mapaValor) || MAPAS_OFICIALES[5];
    
    let lvl = parseInt(nivelActual) || 1;
    if (esNuevoHamster) { lvl = hObj.nivelInicial || 1; }
    
    let bonoFinal = parseFloat(bonoManual);
    if (isNaN(bonoFinal) || esNuevoHamster) { bonoFinal = hObj.bono; }

    const statsCalc = hObj.baseStats + (lvl - 1);
    const porcentajeCalc = calcularExitoJuego(statsCalc, mObj.dificultad, bonoFinal);
    
    setForm(prev => ({...prev, hamster: nombreH, nivel: lvl, stats: statsCalc, expedicion: mapaValor, porcentaje: porcentajeCalc, bono: bonoFinal}));
    setSimulacion(null);
  };

  const manejarNivel = (e) => {
    let valor = parseInt(e.target.value, 10);
    if (isNaN(valor)) { setForm({...form, nivel: ''}); return; }
    if (valor > 50) valor = 50;
    if (valor < 1) valor = 1;
    recalcularTodo(form.hamster, valor, form.expedicion, form.bono, false);
  };

  const manejarBono = (e) => {
    let valor = parseFloat(e.target.value);
    if (isNaN(valor)) valor = 0;
    recalcularTodo(form.hamster, form.nivel, form.expedicion, valor, false);
  };

  const simular = async () => {
    try {
      const porcentajeFix = parseFloat(form.porcentaje.toString().replace(',', '.'));
      const res = await fetch(`${FASTAPI_URL}/simular`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hamster: form.hamster, stats: Number(form.stats), expedicion: form.expedicion, porcentaje: porcentajeFix })
      });
      setSimulacion(await res.json());
    } catch(err) { alert('Error: Asegúrate de que el backend en Render esté activo.'); }
  };

  // --- LÓGICA DE GUARDAR (MODAL) ---
  const confirmarGuardar = (e) => {
    if(e) e.preventDefault();
    const mapaSelec = MAPAS_OFICIALES.find(m => m.valor === form.expedicion)?.nombre || form.expedicion;
    setModalConfig({
      isOpen: true,
      type: 'send',
      title: '🚀 ENVIAR EXPEDICIÓN',
      message: `¿Confirmas que deseas enviar a ${form.hamster} a la expedición de ${mapaSelec}? Esto prevendrá envíos duplicados.`,
      onConfirm: ejecutarGuardar
    });
  };

  const ejecutarGuardar = async () => {
    setModalConfig({ ...modalConfig, isOpen: false }); // Cerrar modal
    const nivelFinal = form.nivel === '' ? 1 : form.nivel;
    const porcentajeLimpio = parseFloat(String(form.porcentaje).replace(',', '.').replace('%', ''));

    let nuevaExpedicion = { fecha: form.fecha, hamster: form.hamster, nivel: Number(nivelFinal), stats: Number(form.stats), expedicion: form.expedicion, porcentaje: porcentajeLimpio, finalizado: null };

    if (simulacion) {
      nuevaExpedicion.probabilidad_ia = simulacion.probabilidad_ia;
      nuevaExpedicion.vive_ia = simulacion.vive_ia;
    }

    let res = await supabase.from('expediciones').insert([nuevaExpedicion]);
    if(res.error) alert("Error DB:\n" + res.error.message);
    else { 
      setSimulacion(null); 
      await cargarDashboard(); 
    }
  };

  // --- LÓGICA DE ELIMINAR (MODAL) ---
  const confirmarEliminar = (id, hamsterName) => {
    setModalConfig({
      isOpen: true,
      type: 'delete',
      title: '⚠️ BORRAR REGISTRO',
      message: `¿Estás completamente seguro de que deseas cancelar y borrar la expedición activa de ${hamsterName}? Esta acción no se puede deshacer.`,
      onConfirm: () => ejecutarEliminar(id)
    });
  };

  const ejecutarEliminar = async (id) => {
    setModalConfig({ ...modalConfig, isOpen: false }); // Cerrar modal
    await supabase.from('expediciones').delete().eq('id', id);
    cargarDashboard();
  };

  const finalizar = async (id, sobrevivio) => {
    await supabase.from('expediciones').update({ finalizado: sobrevivio }).eq('id', id);
    cargarDashboard();
  };

  const mapaSeleccionado = MAPAS_OFICIALES.find(m => m.valor === form.expedicion) || MAPAS_OFICIALES[5];

  // ==========================================
  // ESTILOS GLOBALES Y MEDIA QUERIES
  // ==========================================
  const cssGlobal = `
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0b0d14; border-radius: 4px; }
    ::-webkit-scrollbar-thumb { background: #2a2d40; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #3b4260; }
    
    .btn-hover { transition: all 0.2s ease-in-out !important; }
    .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(14, 165, 233, 0.5), inset 0 2px 0 rgba(255,255,255,0.3) !important; filter: brightness(1.15); }
    
    .card-hover { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; }
    .card-hover:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.6) !important; border-color: rgba(255,255,255,0.1) !important; }

    .premium-input:focus-within { border-color: #38bdf8 !important; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2) !important; }
    
    .horizontal-scroll { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 15px; scroll-behavior: smooth; }
    .mini-card { flex: 0 0 auto; width: 140px; background: #1b1c2b; padding: 15px 12px; border-radius: 8px; border: 1px solid #2a2d40; cursor: pointer; text-align: center; transition: all 0.2s; position: relative; }
    .mini-card:hover { transform: translateY(-3px); border-color: #0ea5e9 !important; background: #1e2130; box-shadow: 0 8px 20px rgba(0,0,0,0.5); }
    
    .historial-item { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr; background: #16192b; border: 1px solid #2a2d40; margin-bottom: 10px; padding: 15px 20px; border-radius: 8px; align-items: center; }

    /* Clases Responsivas para Layout Móvil */
    .form-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .card-container { display: flex; justify-content: center; align-items: center; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; gap: 30px; padding: 20px !important; }
      .stats-grid { grid-template-columns: 1fr; }
      .card-container { width: 100%; }
      .card-container > div { width: 100% !important; max-width: 320px; }
      .historial-item { grid-template-columns: 1fr; gap: 15px; text-align: center; }
      .historial-item > div { justify-content: center; text-align: center; }
    }

    /* Estilos del Modal Premium */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
    .modal-content { background: #1b1c2b; border: 1px solid #2a2d40; border-radius: 16px; padding: 25px; max-width: 380px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.8); text-align: center; animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .modal-title { color: #fff; font-size: 18px; font-weight: 900; margin-top: 0; margin-bottom: 15px; letter-spacing: 1px; }
    .modal-message { color: #cbd5e1; font-size: 14px; margin-bottom: 25px; line-height: 1.6; }
    .modal-actions { display: flex; gap: 12px; justify-content: center; }
    .modal-btn { flex: 1; padding: 14px; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; border: none; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.2s; }
    .btn-cancel { background: #2a2d40; color: #fff; border: 1px solid #3b4260; }
    .btn-cancel:hover { background: #3b4260; }
    .btn-confirm-delete { background: linear-gradient(135deg, #b91c1c, #dc2626); color: white; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4); }
    .btn-confirm-delete:hover { filter: brightness(1.1); transform: translateY(-2px); }
    .btn-confirm-send { background: linear-gradient(135deg, #0284c7, #0ea5e9); color: white; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4); }
    .btn-confirm-send:hover { filter: brightness(1.1); transform: translateY(-2px); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `;

  return (
    <div style={styles.page}>
      <style>{cssGlobal}</style>
      
      {/* MODAL PERSONALIZADO */}
      {modalConfig.isOpen && (
        <div className="modal-overlay" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{modalConfig.title}</h3>
            <p className="modal-message">{modalConfig.message}</p>
            <div className="modal-actions">
              <button className="modal-btn btn-cancel" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                Cancelar
              </button>
              <button 
                className={`modal-btn ${modalConfig.type === 'delete' ? 'btn-confirm-delete' : 'btn-confirm-send'}`} 
                onClick={modalConfig.onConfirm}
              >
                {modalConfig.type === 'delete' ? 'Borrar' : 'Confirmar Envío'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.navBar}>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#fff', letterSpacing: '1px' }}>🐹 AI EXPEDITIONS CONTROL PANEL</h1>
        </div>

        {/* ========================================== */}
        {/* PANEL DE ESTADÍSTICAS GLOBALES             */}
        {/* ========================================== */}
        {metricas && (
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>PARTIDAS TOTALES</span>
              <span style={styles.metricVal}>{metricas.total_partidas}</span>
            </div>
            <div style={{...styles.metricCard, borderLeft: '4px solid #22c55e'}}>
              <span style={styles.metricLabel}>✅ VIVIERON (REAL)</span>
              <span style={{...styles.metricVal, color: '#4ade80'}}>{metricas.vivieron_num} <small style={{fontSize:'12px'}}>({metricas.vivieron_porc}%)</small></span>
            </div>
            <div style={{...styles.metricCard, borderLeft: '4px solid #ef4444'}}>
              <span style={styles.metricLabel}>💀 MURIERON (REAL)</span>
              <span style={{...styles.metricVal, color: '#f87171'}}>{metricas.murieron_num} <small style={{fontSize:'12px'}}>({metricas.murieron_porc}%)</small></span>
            </div>
            <div style={{...styles.metricCard, borderLeft: '4px solid #0ea5e9'}}>
              <span style={styles.metricLabel}>🤖 ACIERTOS IA</span>
              <span style={{...styles.metricVal, color: '#38bdf8'}}>{metricas.ia_aciertos} <small style={{fontSize:'12px'}}>({metricas.ia_precision_porc}%)</small></span>
            </div>
            <div style={{...styles.metricCard, borderLeft: '4px solid #f97316'}}>
              <span style={styles.metricLabel}>❌ FALLOS IA</span>
              <span style={{...styles.metricVal, color: '#fb923c'}}>{metricas.ia_fallos}</span>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PANEL DE RENDIMIENTO INDIVIDUAL (CARRUSEL) */}
        {/* ========================================== */}
        {resumenHamsters.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{...styles.label, marginBottom: '15px', color: '#fff', fontSize: '13px'}}>📊 RENDIMIENTO POR HÁMSTER</h3>
            <div className="horizontal-scroll">
              {resumenHamsters.map(h => {
                const hInfo = HAMSTERS_DEFAULT.find(x => x.nombre === h.hamster) || HAMSTERS_DEFAULT[0];
                return (
                  <div key={h.hamster} className="mini-card" onClick={() => recalcularTodo(h.hamster, form.nivel || 1, form.expedicion, undefined, true)}
                       style={{ borderColor: h.winrate >= 50 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)' }}>
                    <img src={hInfo.img} alt={h.hamster} style={{ height: '45px', objectFit: 'contain', marginBottom: '8px' }} />
                    <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.hamster}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '10px', margin: '4px 0' }}>Envíos: {h.total}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', padding: '0 10px' }}>
                      <span style={{color: '#4ade80'}} title="Vivieron">✅ {h.victorias}</span>
                      <span style={{color: '#f87171'}} title="Murieron">💀 {h.derrotas}</span>
                    </div>

                    <div style={{ marginTop: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', color: h.winrate >= 50 ? '#4ade80' : '#f87171' }}>
                      Winrate: {h.winrate}%
                    </div>

                    <div style={{ marginTop: '6px', fontSize: '10px', fontWeight: 'bold', color: h.racha_tipo === 'VIVIÓ' ? '#4ade80' : '#f87171' }}>
                      {h.racha_tipo === 'VIVIÓ' ? '🔥' : '💔'} Racha: {h.racha_conteo} {h.racha_tipo}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 1. SECCIÓN: FORMULARIO Y PREDICCIÓN */}
        <div className="form-grid" style={styles.contenedorFormulario}>
          <div style={styles.controlPanel}>
            <h3 style={{ marginTop: 0, color: '#fff', letterSpacing: '1px' }}>DATOS DE LANZAMIENTO</h3>
            
            <label style={styles.label}>BUSCAR Y SELECCIONAR HÁMSTER</label>
            <BuscadorHamster valorActual={form.hamster} onSelect={(nombre) => recalcularTodo(nombre, form.nivel || 1, form.expedicion, undefined, true)} />

            <label style={styles.label}>SELECCIONAR MAPA</label>
            <SelectorMapa valorActual={form.expedicion} onSelect={(mapa) => recalcularTodo(form.hamster, form.nivel || 1, mapa, form.bono, false)} />

            <div className="stats-grid">
              <div>
                <label style={styles.label}>NIVEL</label>
                <input type="number" className="premium-input" value={form.nivel} onChange={manejarNivel} style={styles.input} />
              </div>
              <div>
                <label style={styles.label} title="Kits de Supervivencia">BONO EXTRA (%)</label>
                <input type="number" className="premium-input" value={form.bono} onChange={manejarBono} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>STATS</label>
                <input type="number" value={form.stats} readOnly style={{ ...styles.input, backgroundColor: '#06070a', color: '#0bd4c1', borderColor: 'rgba(11, 212, 193, 0.3)', cursor: 'not-allowed', boxShadow: 'none' }} />
              </div>
            </div>

            <label style={styles.label}>% TEÓRICO DEL JUEGO</label>
            <input type="text" value={`${form.porcentaje}%`} readOnly style={{ ...styles.input, backgroundColor: '#06070a', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)', fontWeight: 'bold', cursor: 'not-allowed', boxShadow: 'none' }} />

            <button className="btn-hover" onClick={simular} style={styles.btnSimular}>🔍 PREDECIR SUPERVIVENCIA (FAST API)</button>
          </div>

          <div className="card-container">
            <RollerCard 
              mapa={mapaSeleccionado} 
              hamsterName={form.hamster} 
              stats={form.stats}
              nivel={form.nivel} 
              probabilidad={simulacion ? simulacion.probabilidad_ia : null}
              viveIA={simulacion ? simulacion.vive_ia : null}
              onAction={confirmarGuardar} // Llama al Modal
              actionLabel="ENVIAR DE EXPEDICIÓN"
              isPreview={true}
              bonoManual={form.bono} 
            />
          </div>
        </div>

        {/* 2. SECCIÓN: EXPEDICIONES ACTIVAS */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{...styles.label, marginBottom: '15px', color: '#fff', fontSize: '13px'}}>⏳ EXPEDICIONES ACTIVAS ({activas.length})</h3>
          {activas.length === 0 ? (
            <p style={{color: '#94a3b8', textAlign: 'center', marginTop: '20px'}}>No hay expediciones activas en este momento.</p>
          ) : (
            <div style={styles.gridActivas}>
              {activas.map(activa => (
                <div key={activa.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
                  <RollerCard 
                    mapa={MAPAS_OFICIALES.find(m => m.valor === activa.expedicion) || MAPAS_OFICIALES[0]} 
                    hamsterName={activa.hamster} 
                    stats={activa.stats} 
                    nivel={activa.nivel} 
                    probabilidad={activa.probabilidad_ia}
                    viveIA={activa.vive_ia}
                    onAction={() => confirmarEliminar(activa.id, activa.hamster)} // Llama al Modal
                    actionLabel="CANCELAR / BORRAR"
                    isPreview={false}
                    bonoManual={(HAMSTERS_DEFAULT.find(h => h.nombre === activa.hamster) || HAMSTERS_DEFAULT[0]).bono} 
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-hover" onClick={() => finalizar(activa.id, true)} style={styles.btnWin}>✅ VIVIÓ</button>
                    <button className="btn-hover" onClick={() => finalizar(activa.id, false)} style={styles.btnLose}>💀 MURIÓ</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. SECCIÓN: HISTORIAL DE RESULTADOS */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{...styles.label, marginBottom: '15px', color: '#fff', fontSize: '13px'}}>📜 HISTORIAL DE RESULTADOS</h3>
          {historial.length === 0 ? (
            <p style={{color: '#94a3b8', textAlign: 'center', marginTop: '20px'}}>No hay registros en el historial.</p>
          ) : (
            <div>
              {historial.map(item => (
                <div key={item.id} className="historial-item" style={{ borderLeft: item.finalizado ? '5px solid #22c55e' : '5px solid #ef4444' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={(HAMSTERS_DEFAULT.find(h => h.nombre === item.hamster) || HAMSTERS_DEFAULT[0]).img} style={{ height: '40px', objectFit: 'contain' }} alt=""/>
                      <div>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>{item.hamster}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px' }}>Fecha: {item.fecha}</div>
                      </div>
                   </div>
                   <div>
                      <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>Mapa: {MAPAS_OFICIALES.find(m => m.valor === item.expedicion)?.nombre || item.expedicion}</div>
                      <div style={{ color: '#cbd5e1', fontSize: '12px', marginTop: '3px' }}>Nivel: {item.nivel || '?'} | Stats: {item.stats}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      {item.probabilidad_ia ? (
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                          IA Dijo: <strong style={{color: item.vive_ia === 'SI' ? '#4ade80' : '#f87171'}}>{item.vive_ia === 'SI' ? 'VIVIRÁ' : 'MORIRÁ'} ({item.probabilidad_ia}%)</strong>
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>IA NO CONSULTADA</div>
                      )}
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: item.finalizado ? '#4ade80' : '#f87171' }}>
                         {item.finalizado ? '✅ REAL: VIVIÓ' : '💀 REAL: MURIÓ'}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ESTILOS INLINE PREMIUM
// ==========================================
const styles = {
  page: { backgroundColor: '#0d0f17', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif', padding: '20px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  navBar: { display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(180deg, #1c2033, #151826)', padding: '15px 25px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #2a2d40', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' },
  metricCard: { background: 'linear-gradient(135deg, #16192b, #11131f)', border: '1px solid #2a2d40', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' },
  metricLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' },
  metricVal: { color: '#fff', fontSize: '20px', fontWeight: '900' },
  contenedorFormulario: { background: 'linear-gradient(135deg, #16192b, #11131f)', padding: '30px', borderRadius: '16px', border: '1px solid #2a2d40', boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  controlPanel: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase' },
  input: { width: '100%', background: '#0b0d14', border: '1px solid #2a2d40', padding: '14px', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', transition: 'border-color 0.2s, box-shadow 0.2s' },
  dropdownList: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#11131c', border: '1px solid #2a2d40', borderRadius: '8px', maxHeight: '220px', overflowY: 'auto', zIndex: 100, marginTop: '5px', boxShadow: '0 10px 25px rgba(0,0,0,0.6)' },
  dropdownItem: { padding: '10px 14px', color: '#e2e8f0', cursor: 'pointer', borderBottom: '1px solid #1a1b26', fontSize: '13px', transition: 'background 0.2s' },
  btnSimular: { background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)', color: 'white', padding: '18px', border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: '900', letterSpacing: '1px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 6px 15px rgba(14, 165, 233, 0.3), inset 0 2px 0 rgba(255,255,255,0.2)', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.3)' },
  gridActivas: { display: 'flex', flexWrap: 'wrap', gap: '30px', justifyItems: 'center' }, 
  btnWin: { flex: 1, background: 'linear-gradient(135deg, #15803d, #16a34a)', color: '#fff', border: '1px solid #22c55e', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' },
  btnLose: { flex: 1, background: 'linear-gradient(135deg, #b91c1c, #dc2626)', color: '#fff', border: '1px solid #ef4444', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' },
  rcCard: { position: 'relative', background: '#1b1c2b', width: '300px', borderRadius: '12px', padding: '12px', border: '1px solid #2a2d40', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', boxSizing: 'border-box' },
  rcBanner: { position: 'relative', height: '90px', borderRadius: '8px', backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden', marginBottom: '15px', border: '1px solid #11131c' },
  rcBannerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(27,28,43,0.1), rgba(27,28,43,0.95))' },
  rcBannerTitle: { position: 'absolute', bottom: '10px', left: '15px', margin: 0, color: 'white', fontSize: '18px', fontWeight: '900', letterSpacing: '1px', textShadow: '2px 2px 0px rgba(0,0,0,0.8)' },
  rcFeatures: { padding: '0 5px', marginBottom: '15px' },
  rcFeatureRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  rcFeatureLabel: { color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold', width: '105px' },
  rcBarContainer: { flex: 1, margin: '0 8px', background: '#11131c', height: '10px', borderRadius: '5px', overflow: 'hidden', border: '1px solid #2a2d40' },
  rcBarFill: { background: 'linear-gradient(90deg, #6d28d9, #8b5cf6)', height: '100%', borderRadius: '5px' },
  rcFeatureValue: { color: '#fff', fontSize: '12px', fontWeight: 'bold', width: '25px', textAlign: 'right' },
  rcHamsterBox: { position: 'relative', background: '#141522', border: '1px solid #2a2d40', borderRadius: '8px', padding: '16px 10px 12px 10px', minHeight: '140px', marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.2)' },
  rcLevelBadge: { position: 'absolute', top: '8px', left: '8px', background: '#0d9488', color: 'white', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '900', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' },
  rcIconTopRight: { position: 'absolute', top: '8px', right: '8px', background: '#1b1c2b', border: '1px solid #3b4260', padding: '4px', borderRadius: '6px', fontSize: '12px' },
  rcHamsterName: { color: 'white', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px', marginTop: '2px', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.5)' },
  rcHiddenBonus: { display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', marginBottom: '8px', border: '1px solid', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' },
  rcHamsterImg: { height: '65px', objectFit: 'contain', marginBottom: '10px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' },
  rcTimerPill: { background: '#090a0f', color: '#cbd5e1', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #1e293b', marginBottom: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' },
  rcMoreInfo: { fontSize: '13px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' },
  rcViewBtn: { width: '100%', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '8px', fontSize: '14px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.3)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }
};