import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// CONFIGURACIÓN DE CONEXIÓN
// ==========================================
const SUPABASE_URL = 'https://khyuzutnvoqeqkllnsmy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Z9NzjlREhW6RgIqQ3zZ58A_5G6ivYHX';
const FASTAPI_URL = 'https://rollercoin-ai-backend.onrender.com';

// La publishable key puede estar en el navegador. NO uses service_role/secret keys aquí.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const hoyLocal = () => {
  const hoy = new Date();
  const dos = n => String(n).padStart(2, '0');
  return `${hoy.getFullYear()}-${dos(hoy.getMonth() + 1)}-${dos(hoy.getDate())}`;
};

const firmaDatos = datos => JSON.stringify([
  datos.hamster,
  Number(datos.stats),
  datos.expedicion,
  Number(datos.porcentaje)
]);

// Muestra el identificador histórico real sin confundirlo con otro mapa.
const resolverMapa = valor => MAPAS_OFICIALES.find(m => m.valor === valor) || {
  nombre: `Expedición ${valor || 'desconocida'}`,
  valor,
  horas: String(valor || '?'),
  dificultad: valor === '12h' ? 5 : 0,
  bg: '',
};


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
  // Estimación propia de la web: nunca se presenta como probabilidad oficial verificada.
  return Number(Math.max(0, Math.min(100, total)).toFixed(2));
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

function RollerCard({ mapa, hamsterName, stats, nivel, probabilidad, viveIA, onAction, actionLabel, isPreview, bonoManual, disabled = false }) {
  const hamsterObj = HAMSTERS_DEFAULT.find(h => h.nombre === hamsterName) || HAMSTERS_DEFAULT[0];
  const colorBoton = isPreview ? '#345b99' : '#283e5a';
  const imagenCalculada = isPreview || hamsterName ? getImagenEvolucion(hamsterObj.slug, nivel) : '';
  const bonoAMostrar = bonoManual !== undefined ? bonoManual : hamsterObj.bono;
  const tienePrediccion = probabilidad !== null && probabilidad !== undefined && probabilidad !== '' && Number.isFinite(Number(probabilidad));

  return (
    <div className="card-hover" style={styles.rcCard}>
      <div style={{ ...styles.rcBanner, backgroundImage: `url(${mapa.bg})` }}>
        <div style={styles.rcBannerOverlay}></div>
        <h2 style={styles.rcBannerTitle}>{mapa.nombre.toUpperCase()}</h2>
      </div>

      <div style={styles.rcFeatures}>
        <div style={styles.rcFeatureRow}>
          <span style={styles.rcFeatureLabel}>Duración</span>
          <div style={styles.rcBarContainer}><div style={{...styles.rcBarFill, width: `${(parseInt(mapa.horas)/30)*100}%`}}></div></div>
          <span style={styles.rcFeatureValue}>{mapa.horas}</span>
        </div>
        <div style={styles.rcFeatureRow}>
          <span style={styles.rcFeatureLabel}>Dificultad</span>
          <div style={styles.rcBarContainer}><div style={{...styles.rcBarFill, width: `${mapa.dificultad*10}%`}}></div></div>
          <span style={styles.rcFeatureValue}>{mapa.dificultad}</span>
        </div>
      </div>

      <div style={styles.rcHamsterBox}>
        <div style={styles.rcLevelBadge}>{nivel || 1}</div>
        <div style={styles.rcIconTopRight}>AI</div>
        <div style={styles.rcHamsterName}>{hamsterName}</div>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
          {bonoAMostrar !== 0 && (
            <div style={{...styles.rcHiddenBonus, backgroundColor: bonoAMostrar > 0 ? 'rgba(23, 50, 74, 0.95)' : 'rgba(76, 5, 25, 0.8)', borderColor: bonoAMostrar > 0 ? 'rgba(207, 250, 254, 0.1)' : 'rgba(254, 205, 211, 0.15)', color: bonoAMostrar > 0 ? '#67e8f9' : '#fda4af'}}>
               <span>{bonoAMostrar > 0 ? `+${bonoAMostrar}%` : `${bonoAMostrar}%`}</span>
            </div>
          )}
        </div>
        
        <img src={imagenCalculada} alt={hamsterName} style={styles.rcHamsterImg} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = hamsterObj.img; }} />
        
        {tienePrediccion ? (
          <div style={styles.rcTimerPill}>
            PROB. IA <span style={{ color: viveIA === 'SI' ? '#4ade80' : '#f87171' }}>{probabilidad}%</span>
          </div>
        ) : (
          <div style={styles.rcTimerPill}>SIN SIMULAR</div>
        )}
        
        {tienePrediccion && (
          <div style={{ ...styles.rcMoreInfo, color: viveIA === 'SI' ? '#4ade80' : '#f87171' }}>
            {viveIA === 'SI' ? 'SOBREVIVE' : 'MUERE'}
          </div>
        )}
      </div>

      <button className="btn-hover" onClick={onAction} disabled={disabled} style={{ ...styles.rcViewBtn, background: colorBoton, opacity: disabled ? 0.55 : 1, cursor: disabled ? 'wait' : 'pointer' }}>
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
  const [evaluacionModelo, setEvaluacionModelo] = useState(null);
  const [estadoModelo, setEstadoModelo] = useState('');
  const [expedicionesEntrenables, setExpedicionesEntrenables] = useState(0);
  const [simulacion, setSimulacion] = useState(null);
  const [simulando, setSimulando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [errorDashboard, setErrorDashboard] = useState('');
  const [mensajeOperacion, setMensajeOperacion] = useState('');
  const operacionEnCurso = useRef(false);
  const versionSimulacion = useRef(0);

  // Estado para el Modal Personalizado
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', id: null, title: '', message: '', onConfirm: null });

  const hoy = hoyLocal();
  const formPorDefecto = {
    fecha: hoy,
    hamster: 'Cuscuz',
    nivel: 50,
    stats: 255,
    expedicion: '30h',
    porcentaje: calcularExitoJuego(255, 10, 0),
    bono: 0
  };

  const [form, setForm] = useState(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem('rc_expeditions_form') || '{}');
      const combinado = { ...formPorDefecto, ...guardado, fecha: hoy };
      const h = HAMSTERS_DEFAULT.find(x => x.nombre === combinado.hamster) || HAMSTERS_DEFAULT[0];
      const mapa = MAPAS_OFICIALES.find(x => x.valor === combinado.expedicion) || MAPAS_OFICIALES[0];
      const nivel = Math.max(1, Math.min(50, Number(combinado.nivel) || h.nivelInicial || 1));
      const bono = Number.isFinite(Number(combinado.bono)) ? Number(combinado.bono) : h.bono;
      const stats = h.baseStats + nivel - 1;
      return {
        ...combinado, hamster: h.nombre, nivel, stats,
        expedicion: mapa.valor, bono,
        porcentaje: calcularExitoJuego(stats, mapa.dificultad, bono)
      };
    } catch {
      return formPorDefecto;
    }
  });

  useEffect(() => {
    localStorage.setItem('rc_expeditions_form', JSON.stringify(form));
  }, [form]);

  // Uso sin inicio de sesión: Supabase aplica los permisos RLS de la base de datos.
  // Quitar el login de React no concede permisos si RLS los restringe.

  const cargarDashboard = async () => {
    setErrorDashboard('');
    try {
      const [respuestaActivas, respuestaHist] = await Promise.all([
        supabase.from('expediciones').select('*').is('finalizado', null).order('id', { ascending: false }),
        supabase.from('expediciones').select('*').not('finalizado', 'is', null).order('fecha', { ascending: false }).order('id', { ascending: false }).limit(50),
      ]);
      if (respuestaActivas.error) throw respuestaActivas.error;
      if (respuestaHist.error) throw respuestaHist.error;
      setActivas(respuestaActivas.data || []);
      setHistorial(respuestaHist.data || []);

      let res;
      try {
        res = await fetch(`${FASTAPI_URL}/metricas`);
      } catch (error) {
        throw new Error(`No hay conexión desde Vercel hacia Render. Revisa CORS_ORIGINS en Render (incluye https://rollercoin-ai-panel.vercel.app). Detalle: ${error.message}`);
      }
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.detail || `Error del backend: ${res.status}`);
      setMetricas(datos.metricas);
      setResumenHamsters(datos.resumen_hamsters || []);
      setEvaluacionModelo(datos.evaluacion_modelo || null);
      setEstadoModelo(datos.estado_modelo || 'desconocido');
      setExpedicionesEntrenables(datos.expediciones_entrenables || 0);
    } catch (error) {
      setErrorDashboard(`No se pudo actualizar el tablero: ${error.message}`);
      console.error('Error sincronizando:', error);
    }
  };

  useEffect(() => { cargarDashboard(); }, []);

  const recalcularTodo = (nombreH, nivelActual, mapaValor, bonoManual, esNuevoHamster = false) => {
    const hObj = HAMSTERS_DEFAULT.find(x => x.nombre === nombreH) || HAMSTERS_DEFAULT[0];
    const mObj = MAPAS_OFICIALES.find(m => m.valor === mapaValor) || MAPAS_OFICIALES[0];
    
    let lvl = parseInt(nivelActual) || 1;
    if (esNuevoHamster) { lvl = hObj.nivelInicial || 1; }
    
    let bonoFinal = parseFloat(bonoManual);
    if (isNaN(bonoFinal) || esNuevoHamster) { bonoFinal = hObj.bono; }

    const statsCalc = hObj.baseStats + (lvl - 1);
    const porcentajeCalc = calcularExitoJuego(statsCalc, mObj.dificultad, bonoFinal);
    
    setForm(prev => ({...prev, hamster: nombreH, nivel: lvl, stats: statsCalc, expedicion: mapaValor, porcentaje: porcentajeCalc, bono: bonoFinal}));
    versionSimulacion.current += 1; // invalida las respuestas anteriores si cambió el formulario
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
    if (simulando) return;
    const versionActual = ++versionSimulacion.current;
    setSimulacion(null);
    setSimulando(true);
    setMensajeOperacion('');

    try {
      const porcentaje = Number(String(form.porcentaje).replace(',', '.'));
      const stats = Number(form.stats);
      if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100 ||
          !Number.isFinite(stats) || stats < 0) {
        throw new Error('Las estadísticas o el porcentaje no son válidos.');
      }

      let respuesta;
      try {
        respuesta = await fetch(`${FASTAPI_URL}/simular`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hamster: form.hamster,
            stats,
            expedicion: form.expedicion,
            porcentaje,
          })
        });
      } catch (error) {
        throw new Error(`No hay conexión desde Vercel hacia Render. Revisa CORS_ORIGINS en Render (incluye https://rollercoin-ai-panel.vercel.app). Detalle: ${error.message}`);
      }
      const datos = await respuesta.json();
      if (!respuesta.ok || datos.error || typeof datos.probabilidad_ia !== 'number') {
        const detalle = Array.isArray(datos.detail)
          ? datos.detail.map(x => x.msg).join('; ')
          : datos.detail;
        throw new Error(detalle || datos.error || `Error HTTP ${respuesta.status}`);
      }
      if (versionActual === versionSimulacion.current) {
        setSimulacion({ ...datos, _firma: firmaDatos(form) });
      }
    } catch (error) {
      if (versionActual === versionSimulacion.current) {
        setMensajeOperacion(`No se pudo simular: ${error.message}`);
      }
      console.error('Error de simulación:', error);
    } finally {
      setSimulando(false);
    }
  };

  // --- LÓGICA DE GUARDAR (MODAL) ---
  const confirmarGuardar = (e) => {
    e?.preventDefault();
    if (operacionEnCurso.current) return;
    const mapaSelec = resolverMapa(form.expedicion).nombre;
    setModalConfig({
      isOpen: true,
      type: 'send',
      title: 'Confirmar expedición',
      message: `¿Confirmas que deseas enviar a ${form.hamster} a la expedición de ${mapaSelec}?`,
      onConfirm: ejecutarGuardar
    });
  };

  const ejecutarGuardar = async () => {
    if (operacionEnCurso.current) return;
    operacionEnCurso.current = true;
    setGuardando(true);
    setMensajeOperacion('');
    setModalConfig(prev => ({ ...prev, isOpen: false }));

    try {
      const nivelFinal = Number(form.nivel) || 1;
      const porcentajeLimpio = Number(String(form.porcentaje).replace(',', '.').replace('%', ''));
      if (!Number.isFinite(porcentajeLimpio) || porcentajeLimpio < 0 || porcentajeLimpio > 100) {
        throw new Error('El porcentaje de la expedición no es válido.');
      }
      const nuevaExpedicion = {
        fecha: form.fecha,
        hamster: form.hamster,
        nivel: nivelFinal,
        stats: Number(form.stats),
        expedicion: form.expedicion,
        porcentaje: porcentajeLimpio,
        finalizado: null,
      };

      // No guardar una predicción que pertenezca a otra selección anterior.
      if (simulacion && simulacion._firma === firmaDatos(form)) {
        nuevaExpedicion.probabilidad_ia = simulacion.probabilidad_ia;
        nuevaExpedicion.vive_ia = simulacion.vive_ia;
      }

      const { data, error } = await supabase
        .from('expediciones')
        .insert([nuevaExpedicion])
        .select('id')
        .single();
      if (error) throw error;
      if (!data?.id) throw new Error('Supabase no confirmó la creación del registro.');

      setSimulacion(null);
      setMensajeOperacion(`Expedición registrada correctamente (ID ${data.id}).`);
      await cargarDashboard();
    } catch (error) {
      setMensajeOperacion(`No se pudo guardar la expedición: ${error.message}${String(error.code) === '42501' ? ' (verifica los permisos RLS en Supabase)' : ''}`);
      console.error('Error al guardar:', error);
    } finally {
      operacionEnCurso.current = false;
      setGuardando(false);
    }
  };

  // --- LÓGICA DE ELIMINAR (MODAL) ---
  const confirmarEliminar = (id, hamsterName) => {
    if (operacionEnCurso.current) return;
    setModalConfig({
      isOpen: true,
      type: 'delete',
      title: 'Eliminar expedición',
      message: `¿Estás completamente seguro de que deseas cancelar y borrar la expedición activa de ${hamsterName}? Esta acción no se puede deshacer.`,
      onConfirm: () => ejecutarEliminar(id)
    });
  };

  const ejecutarEliminar = async (id) => {
    if (operacionEnCurso.current) return;
    operacionEnCurso.current = true;
    setProcesandoId(id);
    setMensajeOperacion('');
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    try {
      const { data, error } = await supabase.from('expediciones')
        .delete().eq('id', id).is('finalizado', null).select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('Registro inexistente o sin permiso para eliminar.');
      setMensajeOperacion('Expedición activa eliminada correctamente.');
      await cargarDashboard();
    } catch (error) {
      setMensajeOperacion(`No se pudo eliminar: ${error.message}${String(error.code) === '42501' ? ' (verifica los permisos RLS en Supabase)' : ''}`);
      console.error('Error al eliminar:', error);
    } finally {
      operacionEnCurso.current = false;
      setProcesandoId(null);
    }
  };

  const finalizar = async (id, sobrevivio) => {
    if (operacionEnCurso.current) return;
    operacionEnCurso.current = true;
    setProcesandoId(id);
    setMensajeOperacion('');
    try {
      const { data, error } = await supabase.from('expediciones')
        .update({ finalizado: sobrevivio })
        .eq('id', id)
        .is('finalizado', null)
        .select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('El registro ya estaba cerrado o no tienes permiso.');
      setMensajeOperacion(`Resultado registrado: ${sobrevivio ? 'VIVIÓ' : 'MURIÓ'}. Las métricas del modelo pueden reflejarlo después de actualizar su caché.`);
      await cargarDashboard();
    } catch (error) {
      setMensajeOperacion(`No se pudo finalizar: ${error.message}${String(error.code) === '42501' ? ' (verifica los permisos RLS en Supabase)' : ''}`);
      console.error('Error al finalizar:', error);
    } finally {
      operacionEnCurso.current = false;
      setProcesandoId(null);
    }
  };

  const mapaSeleccionado = resolverMapa(form.expedicion);

  // ==========================================
  // ESTILOS GLOBALES Y MEDIA QUERIES
  // ==========================================
  const cssGlobal = `
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 7px; height: 7px; }
    ::-webkit-scrollbar-track { background: #0c1017; }
    ::-webkit-scrollbar-thumb { background: #2f3a4b; border-radius: 8px; }
    ::selection { background: rgba(54,192,220,.24); }
    button, input { font: inherit; }
    button:focus-visible, input:focus-visible, .premium-input:focus-visible { outline: 2px solid #42bad3; outline-offset: 2px; }
    button:disabled { opacity: .50; cursor: not-allowed !important; transform: none !important; }
    .rc-eyebrow { color: #6d879c; font-size: 10px; font-weight: 800; letter-spacing: .16em; line-height: 1.5; }
    .rc-bullet { color: #526474; margin: 0 5px; }

    /* Product header */
    .rc-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 22px 0 23px; border-bottom: 1px solid #1f2936; margin-bottom: 25px; }
    .rc-brand { display: flex; align-items: center; gap: 19px; min-width: 0; }
    .rc-brand-mark { background: #152a32; border: 1px solid #27505b; color: #f0fcff; border-radius: 11px; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 850; letter-spacing: -.08em; flex: 0 0 auto; }
    .rc-brand-mark span { color: #45c5d5; }
    .rc-brand-copy h1 { color: #edf2f8; font-size: clamp(20px, 3vw, 28px); font-weight: 760; line-height: 1.15; letter-spacing: -.045em; margin: 4px 0 6px; }
    .rc-heading-dot { color: #49bfd2; }
    .rc-brand-copy p { font-size: 12px; color: #8192a5; margin: 0; }
    .rc-header-actions { display: flex; gap: 12px; align-items: center; flex-shrink: 0; }
    .rc-status { border: 1px solid #243640; background: #111c22; border-radius: 50px; padding: 9px 12px; color: #9db5bd; font-size: 11px; white-space: nowrap; }
    .rc-status-dot { background: #53c6ae; display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 8px; box-shadow: 0 0 0 3px rgba(83,198,174,.1); }
    .rc-refresh { cursor: pointer; background: #18212b; border: 1px solid #2c3949; border-radius: 8px; padding: 10px 14px; color: #d1dfeb; font-size: 12px; font-weight: 650; transition: background .16s,border-color .16s; }
    .rc-refresh:hover { background: #202d3a; border-color: #38596b; }
    .rc-notice { display: flex; align-items: flex-start; gap: 10px; margin: 0 0 16px; padding: 12px 14px; border: 1px solid #29544d; background: #122320; border-radius: 8px; color: #b9e4d2; line-height: 1.55; font-size: 12px; }
    .rc-notice-error { border-color: #654039; background: #281c1d; color: #f1c9c3; }
    .rc-notice-mark { margin-top: 5px; border-radius: 50%; width: 6px; height: 6px; background: #65bc9c; flex-shrink: 0; }
    .rc-notice-error .rc-notice-mark { background: #e28e7c; }

    /* KPI strip */
    .rc-overview { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); margin-bottom: 23px; border: 1px solid #293341; border-radius: 12px; background: #121923; overflow: hidden; }
    .rc-stat { min-width: 0; padding: 19px 20px 17px; position: relative; }
    .rc-stat + .rc-stat { border-left: 1px solid #25303c; }
    .rc-stat-label { display: block; font-size: 11px; font-weight: 650; color: #8393a7; margin-bottom: 8px; }
    .rc-stat-number { display: block; color: #edf4f9; font-size: clamp(24px,2.8vw,32px); letter-spacing: -.05em; font-weight: 740; font-variant-numeric: tabular-nums; }
    .rc-stat-meta { color: #64768b; font-size: 10px; line-height: 1.5; display: block; margin-top: 5px; }
    .rc-stat-positive .rc-stat-number { color: #76c8aa; }
    .rc-stat-negative .rc-stat-number { color: #e2a09a; }
    .rc-stat-cyan .rc-stat-number { color: #79c2d5; }

    /* Analysis: integrated not nested cards */
    .rc-model-panel { background: #111821; border: 1px solid #283442; border-radius: 12px; margin: 0 0 34px; overflow: hidden; }
    .rc-panel-heading { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding: 23px 25px 20px; border-bottom: 1px solid #242e3b; }
    .rc-panel-heading h2, .rc-section-heading h2, .rc-prediction-head h2 { color: #edf3f8; font-size: 18px; letter-spacing: -.025em; font-weight: 725; margin: 6px 0 0; }
    .rc-panel-heading p { margin: 7px 0 0; color: #718498; font-size: 12px; }
    .rc-panel-tag { display: inline-flex; align-items: center; gap: 7px; background: #173128; color: #91d7ad; border: 1px solid #2b5940; border-radius: 6px; padding: 6px 10px; font-size: 11px; flex-shrink: 0; }
    .rc-panel-tag:before { content: ''; background: currentColor; border-radius: 50%; width: 6px; height: 6px; }
    .rc-model-grid { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(250px,1fr); }
    .rc-model-comparison { padding: 27px 26px 24px; }
    .rc-model-item + .rc-model-item { margin-top: 22px; }
    .rc-model-item-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 10px; }
    .rc-model-item-top span { color: #b2c0d1; font-size: 12px; }
    .rc-model-item-top strong { color: #f1f5f9; font-size: 18px; font-weight: 740; font-variant-numeric: tabular-nums; }
    .rc-track { overflow: hidden; height: 7px; background: #273442; border-radius: 100px; }
    .rc-track-fill { height: 100%; border-radius: inherit; transition: width .5s ease; }
    .rc-fill-ia { background: #51bed1; }
    .rc-fill-base { background: #8d90aa; }
    .rc-fill-win { background: #67bfa7; }
    .rc-model-source { margin-top: 24px; color: #728499; font-size: 11px; line-height: 1.6; max-width: 500px; }
    .rc-model-side { background: #151e2a; border-left: 1px solid #273343; padding: 25px 26px; }
    .rc-side-title { color: #a5b5c8; font-size: 11px; font-weight: 650; margin-bottom: 17px; }
    .rc-side-title span { display: block; font-size: 10px; color: #6c8194; font-weight: 450; margin-top: 3px; }
    .rc-brier-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; color: #8fa2b4; font-size: 12px; border-bottom: 1px solid #293645; }
    .rc-brier-row strong { color: #e2e9f3; font-size: 14px; font-weight: 670; font-variant-numeric: tabular-nums; }
    .rc-training-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 20px; }
    .rc-training-meta div { display: flex; flex-direction: column; gap: 4px; }
    .rc-training-meta strong { color: #e4edf6; font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
    .rc-training-meta span { color: #718498; font-size: 10px; }
    .rc-model-footer { border-top: 1px solid #242f3d; padding: 13px 25px 15px; display: flex; flex-wrap: wrap; gap: 7px 18px; color: #718599; font-size: 10.5px; }
    .rc-model-footer span:not(:first-child):before { content: '·'; padding-right: 16px; color: #506477; }
    .rc-model-empty { padding: 32px 25px; font-size: 12px; color: #8095a8; }

    /* Section headings and roster */
    .rc-section-heading { display: flex; justify-content: space-between; align-items: end; gap: 12px; margin: 0 0 17px; }
    .rc-section-heading h2 { margin-top: 4px; }
    .rc-section-aside { font-size: 11px; color: #778a9e; padding-bottom: 2px; text-align: right; }
    .rc-roster { margin: 0 0 29px; }
    .rc-roster-scroll { display: flex; overflow-x: auto; gap: 11px; padding-bottom: 12px; scrollbar-width: thin; }
    .rc-hamster-card { width: 174px; min-width: 174px; text-align: left; background: #131b26; border: 1px solid #263241; border-radius: 10px; padding: 14px; cursor: pointer; transition: background .18s, border-color .18s, transform .18s; color: inherit; }
    .rc-hamster-card:hover { background: #1a2531; border-color: #4a7680; transform: translateY(-2px); }
    .rc-hamster-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 4px; }
    .rc-hamster-avatar { display: flex; justify-content: center; align-items: center; background: #202b39; border: 1px solid #2b3949; border-radius: 9px; height: 51px; width: 51px; }
    .rc-hamster-avatar img { width: 47px; height: 47px; object-fit: contain; }
    .rc-hamster-total { color: #697f94; font-size: 10px; white-space: nowrap; padding-top: 3px; }
    .rc-hamster-name { color: #e5edf5; font-size: 12px; font-weight: 680; margin-top: 14px; min-height: 18px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .rc-hamster-win { display: flex; align-items: baseline; gap: 7px; margin-top: 9px; margin-bottom: 8px; }
    .rc-hamster-win strong { font-size: 21px; font-weight: 750; letter-spacing: -.045em; color: #e2eaf4; }
    .rc-hamster-win span { color: #778b9d; font-size: 10px; }
    .rc-track-small { height: 4px; }
    .rc-hamster-stats { display: flex; justify-content: space-between; gap: 4px; color: #7a8da1; font-size: 9px; margin-top: 10px; }
    .rc-dot-green { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #61b699; vertical-align: 1px; }
    .rc-hamster-streak { border-top: 1px solid #263140; padding-top: 10px; margin-top: 12px; color: #8599ad; font-size: 10px; }

    /* Launch area */
    .rc-launch-shell { margin-bottom: 26px; }
    .rc-launch-heading { margin: 0 0 17px; }
    .form-grid { display: grid; grid-template-columns: minmax(0,1.1fr) minmax(270px,.9fr); gap: 32px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 11px; }
    .card-container { display: flex; justify-content: center; align-items: center; }
    .premium-input:focus-within { border-color: #4597ac !important; box-shadow: 0 0 0 3px rgba(68,174,196,.09) !important; }
    .btn-hover { transition: filter .2s, transform .2s !important; }
    .btn-hover:not(:disabled):hover { filter: brightness(1.10); transform: translateY(-1px); }
    .card-hover { transition: transform .2s, border-color .2s !important; }
    .card-hover:hover { transform: translateY(-2px); border-color: #3b5260 !important; }
    .rc-predict-btn { display: flex; justify-content: space-between; align-items: center; gap: 10px; background: #37a6bc; color: #06151b; border: 1px solid #62bdce; border-radius: 8px; padding: 14px 18px; font-size: 13px; font-weight: 780; cursor: pointer; margin-top: 9px; transition: background .2s, transform .2s; }
    .rc-predict-btn:hover:not(:disabled) { background: #61c5d6; transform: translateY(-1px); }
    .rc-predict-btn span { font-size: 19px; line-height: 0; }

    /* Simulation, less tiles and more hierarchy */
    .rc-prediction { border: 1px solid #2d4550; background: #121d25; border-radius: 12px; margin: 23px 0 32px; overflow: hidden; }
    .rc-prediction-head { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 20px 24px; border-bottom: 1px solid #2b3a44; }
    .rc-prediction-outcome { font-size: 11px; color: #84cfb4; background: #16352d; border: 1px solid #2a604e; padding: 8px 11px; border-radius: 6px; }
    .rc-prediction-outcome.is-negative { color: #e5a29b; background: #371f23; border-color: #6b383e; }
    .rc-prediction-grid { display: grid; grid-template-columns: minmax(200px,.8fr) minmax(0,1.4fr); }
    .rc-primary-prob { padding: 25px 27px; border-right: 1px solid #2b3a44; }
    .rc-primary-label { color: #90a9b7; font-size: 12px; }
    .rc-primary-value { color: #edf5f8; font-size: clamp(42px,5vw,58px); letter-spacing: -.065em; font-weight: 760; line-height: 1.25; margin: 6px 0; font-variant-numeric: tabular-nums; }
    .rc-primary-value span { color: #78adbc; font-size: .48em; padding-left: 3px; }
    .rc-primary-caption { color: #6f8795; font-size: 10px; }
    .rc-prediction-bars { padding: 25px 27px; }
    .rc-prediction-row + .rc-prediction-row { margin-top: 18px; }
    .rc-prediction-row > div:first-child { display: flex; justify-content: space-between; gap: 16px; color: #a5b8c4; font-size: 11px; margin-bottom: 9px; }
    .rc-prediction-row strong { color: #eaf2f6; font-size: 13px; }
    .rc-prediction-diff { border-top: 1px solid #2d3d48; display: flex; justify-content: space-between; gap: 15px; color: #8da6b4; font-size: 11px; margin-top: 19px; padding-top: 13px; }
    .rc-prediction-diff strong { color: #d5e6ed; }
    .rc-prediction-footer { background: #101820; border-top: 1px solid #2b3a44; padding: 14px 24px; color: #728a99; font-size: 10.5px; display: flex; flex-wrap: wrap; gap: 7px 18px; }
    .rc-prediction-footer span:not(:first-child):before { content: '·'; padding-right: 16px; color: #4c6977; }
    .rc-count { background: #253140; color: #a6bdce; font-size: 12px; padding: 3px 8px; border-radius: 6px; vertical-align: 2px; margin-left: 3px; }

    /* Active and history */
    .rc-active-entry { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 300px; }
    .rc-result-button { flex: 1; padding: 12px 9px; border-radius: 7px; color: #dbf1eb; cursor: pointer; font-size: 12px; font-weight: 720; border: 1px solid #346a56; background: #1d4839; }
    .rc-result-lose { color: #f5d7d4; background: #4a282b; border-color: #7a444a; }
    .rc-result-button:hover { filter: brightness(1.1); }
    .historial-item { display: grid; grid-template-columns: 1.25fr 1fr .95fr; align-items: center; gap: 15px; background: #111922; border: 1px solid #25303d; border-radius: 8px; margin-bottom: 8px; padding: 15px 19px; }
    .rc-history-win { border-left: 2px solid #4f967b; }
    .rc-history-lose { border-left: 2px solid #9b6261; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(1,5,11,.84); backdrop-filter: blur(6px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: #161f2a; border: 1px solid #364452; border-radius: 12px; padding: 26px; max-width: 420px; width: 90%; box-shadow: 0 26px 75px rgba(0,0,0,.55); text-align: left; }
    .modal-title { color: #f0f5f8; font-size: 17px; font-weight: 760; margin: 0 0 12px; }
    .modal-message { color: #a3b4c6; font-size: 13px; margin: 0 0 24px; line-height: 1.65; }
    .modal-actions { display: flex; gap: 11px; }
    .modal-btn { flex: 1; border-radius: 7px; padding: 12px; cursor: pointer; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
    .btn-cancel { background: #253140; color: #e7edf4; border-color: #344453; }
    .btn-confirm-delete { background: #7c3f46; color: #fdf0f0; border-color: #9d4b54; }
    .btn-confirm-send { background: #2797af; color: #06161e; border-color: #48b6c5; }


    /* v4 · ajustes de jerarquía + color contenido, sin gradientes multicolor */
    :root { --rc-bg:#0b1120; --rc-surface:#121d2d; --rc-line:#29405a; --rc-main:#43c6ea; --rc-main-bright:#60d7f3; --rc-muted:#9bb1c9; --rc-green:#4fdda6; --rc-red:#f18a94; }
    .rc-eyebrow { color:#86b4ce; font-weight:800; letter-spacing:.14em; font-size:10px; }
    .rc-bullet { color:#51778f; }
    .rc-heading-dot { color:var(--rc-main); }
    .rc-header { border-bottom-color:#28374b; }
    .rc-brand-mark { background:#123041; border-color:#297996; color:#f2fbff; box-shadow:inset 0 0 0 1px rgba(75,193,228,.05); }
    .rc-brand-mark span { color:var(--rc-main-bright); }
    .rc-brand-copy h1 { color:#f6fbff; font-size:clamp(23px,3vw,30px); font-weight:800; }
    .rc-brand-copy p { color:#a2b6cb; }
    .rc-status { border-color:#2b514d; background:#132522; color:#b5e0d2; }
    .rc-status-dot { background:#4fdda6; box-shadow:0 0 0 3px rgba(79,221,166,.13); }
    .rc-refresh { background:#1a2c40; border-color:#36506b; color:#e7f4ff; font-weight:700; }
    .rc-refresh:hover { background:#23405b; border-color:#4bbbd7; }
    .rc-overview { background:#131e2d; border-color:#2a415a; box-shadow:0 7px 30px rgba(0,0,0,.11); }
    .rc-stat + .rc-stat { border-left-color:#2b3b4f; }
    .rc-stat { padding-top:20px; }
    .rc-stat-label { color:#a7bad0; font-weight:670; letter-spacing:.012em; }
    .rc-stat-number { color:#f5f9fe; font-size:clamp(27px,3vw,35px); font-weight:790; }
    .rc-stat-meta { color:#8ca0b7; }
    .rc-stat-positive .rc-stat-number { color:#4fdda6; }
    .rc-stat-negative .rc-stat-number { color:#f18a94; }
    .rc-stat-cyan .rc-stat-number { color:#55c8f1; }
    .rc-stat-cyan:after { content:""; position:absolute; left:20px; right:20px; bottom:0; height:2px; background:#3bb8df; opacity:.8; border-radius:2px; }
    .rc-panel-heading { border-bottom-color:#2b4258; padding-top:25px; padding-bottom:24px; }
    .rc-panel-heading h2,.rc-section-heading h2,.rc-prediction-head h2 { color:#f4f9ff; font-size:20px; font-weight:790; letter-spacing:-.03em; }
    .rc-panel-heading p { color:#9fb4c9; }
    .rc-model-panel { background:#121e2d; border-color:#2a415c; }
    .rc-panel-tag { background:#143a30; color:#6ce4b1; border-color:#2f785f; font-weight:730; }
    .rc-comparison-kicker { color:#6dbee0; font-size:10px; letter-spacing:.12em; font-weight:800; margin-bottom:18px; display:flex; align-items:center; gap:9px; }
    .rc-kicker-line { flex:0 0 auto; width:15px; height:3px; border-radius:4px; background:var(--rc-main); display:inline-block; vertical-align:middle; }
    .rc-model-item-featured .rc-model-item-top strong { color:#5ad2f2; font-size:32px; letter-spacing:-.045em; font-weight:820; line-height:1.15; }
    .rc-model-item-featured .rc-model-item-top span { color:#d1e3f1; font-size:13px; font-weight:730; }
    .rc-model-item + .rc-model-item { margin-top:22px; }
    .rc-model-item-top span { color:#a8bdd0; }
    .rc-model-item-top strong { color:#e7f0fa; font-weight:720; }
    .rc-track { background:#2b3d51; height:8px; }
    .rc-fill-ia { background:#43c6ea; }
    .rc-fill-base { background:#8598c5; }
    .rc-fill-win { background:#54d4a7; }
    .rc-model-side { background:#172538; border-left-color:#2d435b; }
    .rc-side-title { font-size:12px; font-weight:720; color:#d2e5f5; }
    .rc-side-title span { font-size:11px; color:#91a8bf; }
    .rc-brier-row { color:#afc1d2; border-bottom-color:#334960; }
    .rc-brier-row strong { color:#edf6fe; font-weight:760; }
    .rc-training-meta strong { color:#f3f9ff; font-size:23px; font-weight:780; }
    .rc-training-meta span { color:#a1b7cb; font-size:11px; }
    .rc-model-source { margin-top:23px; padding:11px 13px; border-left:2px solid #528db2; background:#1a2a3c; color:#a6c0d4; border-radius:0 6px 6px 0; }
    .rc-model-source strong { color:#c5e8fa; font-weight:750; }
    .rc-model-footer { color:#92a8bc; border-top-color:#293f56; background:rgba(12,24,39,.45); }
    .rc-section-heading { position:relative; }
    .rc-section-heading h2 { font-size:20px; }
    .rc-section-aside { color:#91a6bd; }
    .rc-hamster-card { background:#142135; border-color:#293f57; }
    .rc-hamster-card:hover { background:#1b2d43; border-color:#4faac8; box-shadow:0 8px 20px rgba(7,26,47,.26); }
    .rc-hamster-avatar { background:#233249; border-color:#354d69; }
    .rc-hamster-name { color:#f1f7fc; font-size:13px; }
    .rc-hamster-win strong { color:#eff9ff; font-size:24px; font-weight:800; }
    .rc-hamster-win span,.rc-hamster-total,.rc-hamster-stats,.rc-hamster-streak { color:#a1b7cc; }
    .rc-hamster-streak { border-top-color:#2e435a; }
    .rc-dot-green { background:#4fdda6; }
    .premium-input:focus-within { border-color:#4bc0e1 !important; box-shadow:0 0 0 3px rgba(67,198,234,.13)!important; }
    .card-hover:hover { border-color:#54849d !important; }
    .rc-predict-btn { background:#36b9df; border-color:#55c9eb; color:#061926; font-weight:840; box-shadow:0 5px 16px rgba(17,153,199,.14); }
    .rc-predict-btn:hover:not(:disabled) { background:#60d4f2; box-shadow:0 7px 20px rgba(29,165,210,.23); }
    .rc-prediction { background:#121f2e; border:1px solid #3b7796; box-shadow:0 10px 35px rgba(19,72,103,.13); }
    .rc-prediction-head { border-bottom-color:#29485e; background:#15263a; }
    .rc-prediction-outcome { background:#14382f; border-color:#2f8669; color:#7df0ba; font-size:12px; font-weight:730; }
    .rc-prediction-outcome.is-negative { background:#3a242d; border-color:#a45765; color:#ffa2aa; }
    .rc-primary-prob { border-right-color:#29485e; }
    .rc-primary-label { display:flex; align-items:center; gap:8px; color:#a8d5e8; font-size:10px; font-weight:800; letter-spacing:.045em; }
    .rc-primary-value { color:#5bd3f5; font-size:clamp(49px,5vw,66px); font-weight:830; line-height:1.16; margin:11px 0; }
    .rc-primary-value span { color:#8fb8cf; font-size:.47em; }
    .rc-primary-caption { color:#a5bacc; font-size:11px; }
    .rc-prediction-row > div:first-child { color:#b1c5d6; font-size:12px; }
    .rc-prediction-row strong { color:#f0f8ff; font-size:14px; }
    .rc-prediction-diff { background:#1b3144; border:1px solid #315773; border-radius:8px; margin-top:21px; padding:12px 14px; color:#bfd5e5; align-items:center; font-size:11px; }
    .rc-prediction-diff strong { font-size:21px; line-height:1.2; color:#73dbf7; white-space:nowrap; font-variant-numeric:tabular-nums; }
    .rc-prediction-diff small { font-size:11px; font-weight:570; color:#9fbdd2; }
    .rc-prediction-footer { background:#122030; border-top-color:#294459; color:#a0b5c9; }
    .rc-count { background:#1d4058; border:1px solid #2e607e; color:#8dddf4; font-weight:800; }
    .rc-result-button { background:#215a48; border-color:#367f64; color:#dcfbee; }
    .rc-result-lose { background:#603139; border-color:#994a56; color:#ffe6e9; }
    .historial-item { background:#142032; border-color:#294056; }
    .rc-history-win { border-left:3px solid #4fdda6; }
    .rc-history-lose { border-left:3px solid #f18a94; }
    .modal-content { background:#18263a; border-color:#385775; }
    .btn-confirm-send { background:#38bcdf; border-color:#55d2f0; color:#061c24; }
    @media (max-width:780px) { .rc-model-side { border-left:0; border-top:1px solid #2d435b; } .rc-primary-prob { border-right:0; border-bottom:1px solid #29485e; } }
    @media (max-width:560px) { .rc-prediction-diff { flex-wrap:wrap; gap:7px; } .rc-comparison-kicker { font-size:9px; } .rc-stat { padding-top:18px; } .rc-stat-cyan:after { left:14px; right:14px; } }

    @media (max-width: 1020px) {
      .rc-overview { grid-template-columns: repeat(3,minmax(0,1fr)); }
      .rc-stat:nth-child(4) { border-left: 0; border-top: 1px solid #25303c; }
      .rc-stat:nth-child(5) { border-top: 1px solid #25303c; }
    }
    @media (max-width: 780px) {
      .rc-header { align-items: flex-start; }
      .rc-header-actions { flex-direction: column; align-items: flex-end; }
      .form-grid { grid-template-columns: 1fr; gap: 24px; padding: 21px !important; }
      .rc-model-grid { grid-template-columns: 1fr; }
      .rc-model-side { border-left: 0; border-top: 1px solid #273343; }
      .rc-prediction-grid { grid-template-columns: 1fr; }
      .rc-primary-prob { border-right: 0; border-bottom: 1px solid #2b3a44; }
      .rc-active-entry { max-width: 100%; }
      .historial-item { grid-template-columns: 1fr; gap: 12px; }
      .historial-item > div:last-child { text-align: left !important; }
    }
    @media (max-width: 560px) {
      .rc-header { flex-direction: column; }
      .rc-header-actions { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
      .rc-overview { grid-template-columns: repeat(2,minmax(0,1fr)); }
      .rc-stat { padding: 17px 14px; border-top: 1px solid #25303c; }
      .rc-stat:nth-child(odd) { border-left: 0; }
      .rc-stat:nth-child(1),.rc-stat:nth-child(2) { border-top: 0; }
      .rc-stat:nth-child(4) { border-left: 1px solid #25303c; }
      .rc-panel-heading,.rc-prediction-head { align-items: flex-start; flex-direction: column; }
      .rc-model-comparison,.rc-model-side { padding: 22px 18px; }
      .rc-panel-heading { padding: 22px 18px; }
      .rc-section-heading { align-items: flex-start; flex-direction: column; gap: 6px; }
      .rc-section-aside { text-align: left; }
      .rc-prediction-head,.rc-primary-prob,.rc-prediction-bars { padding: 20px 18px; }
      .rc-prediction-footer,.rc-model-footer { padding: 14px 18px; }
      .stats-grid { grid-template-columns: repeat(3,minmax(0,1fr)); }
    }
    @media (prefers-reduced-motion: reduce) { *, *:before, *:after { transition-duration: .01ms !important; animation-duration: .01ms !important; } }
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
                disabled={guardando || procesandoId !== null}
                onClick={modalConfig.onConfirm}
              >
                {modalConfig.type === 'delete' ? 'Borrar' : 'Confirmar Envío'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <header className="rc-header">
          <div className="rc-brand">
            <div className="rc-brand-mark" aria-hidden="true">R<span>C</span></div>
            <div className="rc-brand-copy">
              <div className="rc-eyebrow">ROLLERCOIN · EXPEDITIONS</div>
              <h1>Expedition Control<span className="rc-heading-dot">.</span></h1>
              <p>Simulaciones, rendimiento e historial en un solo lugar.</p>
            </div>
          </div>
          <div className="rc-header-actions">
            <div className="rc-status"><span className="rc-status-dot" />{estadoModelo === 'entrenado' ? 'Modelo disponible' : estadoModelo ? `Modelo: ${estadoModelo}` : 'Comprobando modelo'}</div>
            <button type="button" className="rc-refresh" onClick={cargarDashboard} title="Actualizar estadísticas">↻ <span>Actualizar</span></button>
          </div>
        </header>

        {mensajeOperacion && <div className="rc-notice" role="status"><span className="rc-notice-mark" />{mensajeOperacion}</div>}
        {errorDashboard && <div className="rc-notice rc-notice-error" role="alert"><span className="rc-notice-mark" />{errorDashboard}</div>}

        {/* PANORAMA: métricas históricas */}
        {metricas && (
          <section className="rc-overview" aria-label="Resumen de expediciones">
            <div className="rc-stat">
              <span className="rc-stat-label">Expediciones</span>
              <strong className="rc-stat-number">{metricas.total_partidas}</strong>
              <span className="rc-stat-meta">Registros finalizados</span>
            </div>
            <div className="rc-stat rc-stat-positive">
              <span className="rc-stat-label">Supervivencias</span>
              <strong className="rc-stat-number">{metricas.vivieron_num}</strong>
              <span className="rc-stat-meta">{metricas.vivieron_porc}% del total</span>
            </div>
            <div className="rc-stat rc-stat-negative">
              <span className="rc-stat-label">Derrotas</span>
              <strong className="rc-stat-number">{metricas.murieron_num}</strong>
              <span className="rc-stat-meta">{metricas.murieron_porc}% del total</span>
            </div>
            <div className="rc-stat rc-stat-cyan">
              <span className="rc-stat-label">Aciertos de IA</span>
              <strong className="rc-stat-number">{metricas.ia_aciertos}</strong>
              <span className="rc-stat-meta">{metricas.ia_exactitud_porc ?? metricas.ia_precision_porc}% en registros evaluados</span>
            </div>
            <div className="rc-stat">
              <span className="rc-stat-label">Fallos de IA</span>
              <strong className="rc-stat-number">{metricas.ia_fallos}</strong>
              <span className="rc-stat-meta">{metricas.ia_predicciones_evaluadas ?? (metricas.ia_aciertos + metricas.ia_fallos)} predicciones guardadas</span>
            </div>
          </section>
        )}

        {/* Evaluación cronológica, distinta de los registros guardados */}
        <section className="rc-model-panel" aria-label="Rendimiento del modelo">
          <div className="rc-panel-heading">
            <div>
              <div className="rc-eyebrow">ANÁLISIS DEL MODELO <span className="rc-bullet">/</span> RANDOM FOREST</div>
              <h2>¿Qué tan precisa es la IA?</h2>
              <p>Comparación con expediciones que el modelo no utilizó para entrenar.</p>
            </div>
            <span className="rc-panel-tag">{estadoModelo === 'entrenado' ? 'Entrenado' : estadoModelo || 'Sin verificar'}</span>
          </div>
          {evaluacionModelo ? (
            <>
              <div className="rc-model-grid">
                <div className="rc-model-comparison">
                  <div className="rc-comparison-kicker"><span className="rc-kicker-line"/> RESULTADOS EN DATOS DE PRUEBA</div>
                  <div className="rc-model-item rc-model-item-featured">
                    <div className="rc-model-item-top"><span>Exactitud de la IA</span><strong>{evaluacionModelo.exactitud_ia_porc}%</strong></div>
                    <div className="rc-track"><div className="rc-track-fill rc-fill-ia" style={{width: `${Math.max(0, Math.min(100, Number(evaluacionModelo.exactitud_ia_porc) || 0))}%`}} /></div>
                  </div>
                  <div className="rc-model-item">
                    <div className="rc-model-item-top"><span>Exactitud de la estimación base</span><strong>{evaluacionModelo.exactitud_oficial_porc}%</strong></div>
                    <div className="rc-track"><div className="rc-track-fill rc-fill-base" style={{width: `${Math.max(0, Math.min(100, Number(evaluacionModelo.exactitud_oficial_porc) || 0))}%`}} /></div>
                  </div>
                  <div className="rc-model-source"><strong>Referencia estimada.</strong> El porcentaje base se calcula en tu página; no procede directamente de RollerCoin.</div>
                </div>
                <div className="rc-model-side">
                  <div className="rc-side-title">Error de probabilidad <span>Brier Score · mientras más bajo, mejor</span></div>
                  <div className="rc-brier-row"><span>Brier · IA</span><strong>{evaluacionModelo.brier_ia}</strong></div>
                  <div className="rc-brier-row"><span>Brier · Referencia</span><strong>{evaluacionModelo.brier_oficial}</strong></div>
                  <div className="rc-training-meta">
                    <div><strong>{evaluacionModelo.expediciones_entrenamiento}</strong><span>Entrenamiento</span></div>
                    <div><strong>{evaluacionModelo.expediciones_prueba}</strong><span>Prueba temporal</span></div>
                  </div>
                </div>
              </div>
              <div className="rc-model-footer">
                <span>{expedicionesEntrenables} expediciones entrenables</span>
                <span>Una diferencia pequeña de exactitud no demuestra superioridad estadística.</span>
                {metricas && <span>{metricas.ia_predicciones_evaluadas ?? 0} predicciones registradas evaluadas por separado.</span>}
              </div>
            </>
          ) : (
            <div className="rc-model-empty">{estadoModelo ? 'La evaluación temporal todavía no está disponible.' : 'Consultando los resultados del modelo…'}</div>
          )}
        </section>

        {/* RENDIMIENTO INDIVIDUAL */}
        {resumenHamsters.length > 0 && (
          <section className="rc-roster">
            <div className="rc-section-heading">
              <div><div className="rc-eyebrow">HISTORIAL POR PERSONAJE</div><h2>Rendimiento de hámsteres</h2></div>
              <span className="rc-section-aside">Selecciona uno para preparar una expedición</span>
            </div>
            <div className="rc-roster-scroll">
              {resumenHamsters.map(h => {
                const hInfo = HAMSTERS_DEFAULT.find(x => x.nombre === h.hamster) || HAMSTERS_DEFAULT[0];
                const winrate = Math.max(0, Math.min(100, Number(h.winrate) || 0));
                return (
                  <button type="button" key={h.hamster} className="rc-hamster-card" onClick={() => recalcularTodo(h.hamster, form.nivel || 1, form.expedicion, undefined, true)} title={`Preparar expedición con ${h.hamster}`}>
                    <div className="rc-hamster-top"><span className="rc-hamster-avatar"><img src={hInfo.img} alt="" loading="lazy" /></span><span className="rc-hamster-total">{h.total} envíos</span></div>
                    <div className="rc-hamster-name" title={h.hamster}>{h.hamster}</div>
                    <div className="rc-hamster-win"><strong>{h.winrate}%</strong><span>victorias</span></div>
                    <div className="rc-track rc-track-small"><div className="rc-track-fill rc-fill-win" style={{width:`${winrate}%`}} /></div>
                    <div className="rc-hamster-stats"><span><i className="rc-dot-green" /> {h.victorias} vivieron</span><span>{h.derrotas} murieron</span></div>
                    <div className="rc-hamster-streak">Racha: {h.racha_conteo} {h.racha_tipo === 'VIVIÓ' ? 'victorias' : 'derrotas'}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 1. SECCIÓN: FORMULARIO Y PREDICCIÓN */}
        <div className="rc-launch-shell">
          <div className="rc-section-heading rc-launch-heading">
            <div><div className="rc-eyebrow">CONFIGURACIÓN</div><h2>Nueva expedición</h2></div>
            <span className="rc-section-aside">Selecciona un hámster y calcula su probabilidad</span>
          </div>
          <div className="form-grid" style={styles.contenedorFormulario}>
          <div style={styles.controlPanel}>
            
            <label style={styles.label}>HÁMSTER</label>
            <BuscadorHamster valorActual={form.hamster} onSelect={(nombre) => recalcularTodo(nombre, form.nivel || 1, form.expedicion, undefined, true)} />

            <label style={styles.label}>MAPA DE EXPEDICIÓN</label>
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
                <input type="number" value={form.stats} readOnly style={{ ...styles.input, backgroundColor: '#102238', color: '#84d9ef', borderColor: '#38546b', cursor: 'not-allowed', boxShadow: 'none' }} />
              </div>
            </div>

            <label style={styles.label}>PROBABILIDAD BASE ESTIMADA</label>
            <input type="text" value={`${form.porcentaje}%`} readOnly style={{ ...styles.input, backgroundColor: '#102238', color: '#74ddb3', borderColor: '#38546b', fontWeight: 'bold', cursor: 'not-allowed', boxShadow: 'none' }} />

            <button className="rc-predict-btn" onClick={simular} disabled={simulando}>{simulando ? 'Calculando predicción…' : 'Calcular probabilidad'} <span aria-hidden="true">→</span></button>
          </div>

          <div className="card-container">
            <RollerCard 
              mapa={mapaSeleccionado} 
              hamsterName={form.hamster} 
              stats={form.stats}
              nivel={form.nivel} 
              probabilidad={simulacion ? simulacion.probabilidad_ia : null}
              viveIA={simulacion ? simulacion.vive_ia : null}
              onAction={confirmarGuardar}
              disabled={guardando || procesandoId !== null}
              actionLabel={guardando ? 'GUARDANDO...' : 'Registrar expedición'}
              isPreview={true}
              bonoManual={form.bono} 
            />
          </div>
        </div>
        </div>

        {/* Resultado de la simulación */}
        {simulacion && (
          <section className="rc-prediction" aria-label="Resultado de la predicción">
            <div className="rc-prediction-head">
              <div><div className="rc-eyebrow">SIMULACIÓN FINALIZADA</div><h2>Pronóstico de supervivencia</h2></div>
              <span className={`rc-prediction-outcome ${simulacion.vive_ia === 'SI' ? 'is-positive' : 'is-negative'}`}>{simulacion.vive_ia === 'SI' ? 'Supervivencia prevista' : 'Riesgo de derrota'}</span>
            </div>
            <div className="rc-prediction-grid">
              <div className="rc-primary-prob">
                <div className="rc-primary-label"><span className="rc-kicker-line"/> PROBABILIDAD DE SUPERVIVENCIA · IA</div>
                <div className="rc-primary-value">{simulacion.probabilidad_ia}<span>%</span></div>
                <div className="rc-primary-caption">Predicción estadística de Random Forest</div>
              </div>
              <div className="rc-prediction-bars">
                <div className="rc-prediction-row">
                  <div><span>IA</span><strong>{simulacion.probabilidad_ia}%</strong></div>
                  <div className="rc-track"><div className="rc-track-fill rc-fill-ia" style={{width:`${Math.max(0, Math.min(100, Number(simulacion.probabilidad_ia) || 0))}%`}} /></div>
                </div>
                <div className="rc-prediction-row">
                  <div><span>Estimación calculada del juego</span><strong>{simulacion.probabilidad_oficial}%</strong></div>
                  <div className="rc-track"><div className="rc-track-fill rc-fill-base" style={{width:`${Math.max(0, Math.min(100, Number(simulacion.probabilidad_oficial) || 0))}%`}} /></div>
                </div>
                <div className="rc-prediction-diff"><span>Diferencia frente a la referencia</span><strong>{Number(simulacion.diferencia_puntos) > 0 ? '+' : ''}{simulacion.diferencia_puntos} <small>puntos</small></strong></div>
              </div>
            </div>
            <div className="rc-prediction-footer">
              <span>{simulacion.hamster_con_historial ? 'Historial del hámster disponible' : 'Hámster sin historial previo'}</span>
              <span>Racha anterior de derrotas: {simulacion.racha_actual ?? 0}</span>
              <span>Son estimaciones estadísticas, no resultados garantizados.</span>
            </div>
          </section>
        )}

        {/* 2. SECCIÓN: EXPEDICIONES ACTIVAS */}
        <div style={{ marginTop: '30px' }}>
          <div className="rc-section-heading"><div><div className="rc-eyebrow">SEGUIMIENTO</div><h2>Expediciones activas <span className="rc-count">{activas.length}</span></h2></div></div>
          {activas.length === 0 ? (
            <p style={{color: '#94a3b8', textAlign: 'center', marginTop: '20px'}}>No hay expediciones activas en este momento.</p>
          ) : (
            <div style={styles.gridActivas}>
              {activas.map(activa => (
                <div key={activa.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
                  <RollerCard 
                    mapa={resolverMapa(activa.expedicion)} 
                    hamsterName={activa.hamster} 
                    stats={activa.stats} 
                    nivel={activa.nivel} 
                    probabilidad={activa.probabilidad_ia}
                    viveIA={activa.vive_ia}
                    onAction={() => confirmarEliminar(activa.id, activa.hamster)}
                    disabled={guardando || procesandoId !== null}
                    actionLabel={procesandoId === activa.id ? 'Procesando...' : 'Cancelar expedición'}
                    isPreview={false}
                    bonoManual={(HAMSTERS_DEFAULT.find(h => h.nombre === activa.hamster) || HAMSTERS_DEFAULT[0]).bono} 
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="rc-result-button rc-result-win" disabled={procesandoId !== null || guardando} onClick={() => finalizar(activa.id, true)}>Vivió</button>
                    <button className="rc-result-button rc-result-lose" disabled={procesandoId !== null || guardando} onClick={() => finalizar(activa.id, false)}>Murió</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. SECCIÓN: HISTORIAL DE RESULTADOS */}
        <div style={{ marginTop: '30px' }}>
          <div className="rc-section-heading"><div><div className="rc-eyebrow">REGISTROS</div><h2>Historial de resultados</h2></div><span className="rc-section-aside">Últimas 50 expediciones</span></div>
          {historial.length === 0 ? (
            <p style={{color: '#94a3b8', textAlign: 'center', marginTop: '20px'}}>No hay registros en el historial.</p>
          ) : (
            <div>
              {historial.map(item => (
                <div key={item.id} className={`historial-item ${item.finalizado ? 'rc-history-win' : 'rc-history-lose'}`}>
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
                      {item.probabilidad_ia !== null && item.probabilidad_ia !== undefined ? (
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Predicción: <strong style={{color: item.vive_ia === 'SI' ? '#4ade80' : '#f87171'}}>{item.vive_ia === 'SI' ? 'VIVIRÁ' : 'MORIRÁ'} ({item.probabilidad_ia}%)</strong>
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>IA NO CONSULTADA</div>
                      )}
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: item.finalizado ? '#4ade80' : '#f87171' }}>
                         {item.finalizado ? 'Vivió' : 'Murió'}
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
  page: { backgroundColor: '#0b1120', minHeight: '100vh', color: '#edf5ff', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', padding: '10px 22px 54px' },
  container: { maxWidth: '1160px', margin: '0 auto' },
  navBar: { display: 'none' },
  controlPanel: { display: 'flex', flexDirection: 'column', gap: '13px' },
  contenedorFormulario: { background: '#142135', padding: '30px', borderRadius: '12px', border: '1px solid #2b4762', boxSizing: 'border-box' },
  label: { display: 'block', color: '#b0c8dc', fontSize: '10px', fontWeight: 760, letterSpacing: '1.12px', textTransform: 'uppercase' },
  input: { width: '100%', backgroundColor: '#0d1828', border: '1px solid #34516c', padding: '12px 13px', borderRadius: '7px', color: '#e1eaf4', fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'border-color .18s, box-shadow .18s' },
  dropdownList: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#18283b', border: '1px solid #42627f', borderRadius: '8px', maxHeight: '240px', overflowY: 'auto', zIndex: 100, marginTop: '5px', boxShadow: '0 14px 30px rgba(0,0,0,.4)' },
  dropdownItem: { padding: '11px 13px', color: '#dce8f1', cursor: 'pointer', borderBottom: '1px solid #263441', fontSize: '12px' },
  rcCard: { position: 'relative', background: '#18283b', width: '300px', borderRadius: '10px', padding: '11px', border: '1px solid #35506c', boxSizing: 'border-box' },
  rcBanner: { position: 'relative', height: '105px', borderRadius: '7px', backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden', marginBottom: '14px' },
  rcBannerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(12,20,29,.06),rgba(12,20,29,.9))' },
  rcBannerTitle: { position: 'absolute', bottom: '11px', left: '12px', margin: 0, color: '#f8fafc', fontSize: '16px', fontWeight: 820, letterSpacing: '.03em', textShadow: '0 2px 4px rgba(0,0,0,.85)' },
  rcFeatures: { padding: '0 5px', marginBottom: '14px' },
  rcFeatureRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '7px', marginBottom: '8px' },
  rcFeatureLabel: { color: '#b0c3d6', fontSize: '11px', fontWeight: 540, width: '84px' },
  rcBarContainer: { flex: 1, margin: '0 5px', background: '#2f425b', height: '6px', borderRadius: '50px', overflow: 'hidden' },
  rcBarFill: { background: '#587ec1', height: '100%', borderRadius: '50px' },
  rcFeatureValue: { color: '#e0eaf3', fontSize: '11px', fontWeight: 720, width: '25px', textAlign: 'right' },
  rcHamsterBox: { position: 'relative', background: '#121e2d', border: '1px solid #30475f', borderRadius: '7px', padding: '16px 10px 14px', minHeight: '145px', marginBottom: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
  rcLevelBadge: { position: 'absolute', top: '8px', left: '8px', background: '#236b83', color: '#e6faff', padding: '4px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 740 },
  rcIconTopRight: { position: 'absolute', top: '8px', right: '8px', color: '#7f9eac', fontWeight: 800, letterSpacing: '.13em', fontSize: '10px' },
  rcHamsterName: { color: '#eaf1f8', fontSize: '14px', fontWeight: 710, marginBottom: '8px', marginTop: '1px', textAlign: 'center' },
  rcHiddenBonus: { display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '50px', fontSize: '10px', fontWeight: 700, marginBottom: '6px', border: '1px solid' },
  rcHamsterImg: { height: '76px', objectFit: 'contain', marginBottom: '9px', filter: 'drop-shadow(0 5px 6px rgba(0,0,0,.2))' },
  rcTimerPill: { color: '#b7cfdf', padding: '4px 11px', borderRadius: '5px', fontSize: '11px', fontWeight: 720, background: '#203449', marginBottom: '7px' },
  rcMoreInfo: { fontSize: '11px', fontWeight: 750, textAlign: 'center', letterSpacing: '.09em' },
  rcViewBtn: { width: '100%', color: '#eef8ff', border: '1px solid #486ba0', padding: '12px', borderRadius: '7px', fontSize: '12px', fontWeight: 730, letterSpacing: '.015em', cursor: 'pointer' },
  gridActivas: { display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'flex-start' },
};
