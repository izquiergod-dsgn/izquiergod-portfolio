import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { audio } from '../../audio/AudioManager.js';
import './About.css';

import homeBg from '../../assets/about/aboutMenu.webp';  // <- imagen de fondo (cambia la ruta si quieres otra)
import char1 from '../../assets/about/char1.png';
import char2 from '../../assets/about/char2.png';
import img03 from '../../assets/about/about-03-educacion.png';
import img04 from '../../assets/about/about-04-experiencia.png';
import img05 from '../../assets/about/about-05-habilidades.png';
import img06 from '../../assets/about/about-06-manifiesto.png';

/* Mapa de imagen por sección — índice 0-5 */
const SECTION_IMGS = [char1, char2, img03, img04, img05, img06];

const SECTIONS = [
  {
    id: 'perfil',
    label: 'PERFIL PROFESIONAL',
    role: '01',
    color: '#BB1010',
    stats: [
      { tag: 'ENFOQUE', value: 'INTENCIÓN', color: '#BB1010' },
      { tag: 'MÉTODO', value: 'PENSAMIENTO', color: '#FF5500' },
    ],
    content: {
      title: 'PERFIL PROFESIONAL',
      body: `Diseñador gráfico interesado en la construcción de narrativas visuales a través de la ilustración y los medios digitales. Mi trabajo se orienta al desarrollo de propuestas gráficas claras y coherentes, donde la estética y el concepto se integran para comunicar ideas de forma efectiva. Me interesa explorar el diseño como un espacio de experimentación visual, combinando sensibilidad estética con pensamiento conceptual para crear piezas con identidad y sentido.`,
    },
  },
  {
    id: 'sobremi',
    label: 'SOBRE MÍ',
    role: '02',
    color: '#FF5500',
    stats: [
      { tag: 'FILOSOFÍA', value: 'SOY', color: '#FF5500' },
      { tag: 'MOTOR', value: 'YO', color: '#FF7A22' },
    ],
    content: {
      title: 'SOBRE MÍ',
      body: `Hola, soy diseñador gráfico, ilustrador y diseñador web. Soy un diseñador que cree en la intención. Me interesa crear piezas que comuniquen, generen conexión y dejen huella. Combino composición, conceptualización y pensamiento visual para desarrollar propuestas con identidad y propósito.

El diseño es mi forma de pensar y de actuar. Cada decisión visual que tomo tiene un porqué, un mensaje y un objetivo. No diseño para llenar espacios, diseño para provocar algo.

Me interesa crear trabajos que se sientan auténticos, que cuenten historias, que conecten y que dejen una impresión real. Para mí, el diseño es una herramienta para transformar ideas en realidades.`,
    },
  },
  {
    id: 'datos',
    label: 'EDUCACIÓN',
    role: '03',
    color: '#3355FF',
    stats: [
      { tag: 'UNIVERSIDAD', value: 'CURSOS', color: '#3355FF' },
      { tag: 'UBICACIÓN', value: 'APRENDER', color: '#AAFF00' },
    ],
    content: {
      title: 'EDUCACIÓN',
      body: ` EDUCACIÓN  
Diseñador Gráfico Profesional – Fundación Universitaria del Área Andina (2022 – Actual)  
Bachiller – Colegio Gimnasio del Saber (2021)  

CURSOS Y CERTIFICACIONES  
Inteligencia Artificial: Transformando el Futuro del Marketing y las Ventas – Pontificia Universidad Javeriana (2024)  
Gerencia del Servicio y Experiencia del Cliente – PUJ (2024)`,
    },
  },
  {
    id: 'experiencia',
    label: 'EXPERIENCIA',
    role: '04',
    color: '#AAFF00',
    stats: [
      { tag: 'PROYECTO', value: 'CAMPO', color: '#AAFF00' },
      { tag: 'ORGANIZACIÓN', value: 'PROYECTO', color: '#88DD00' },
    ],
    content: {
      title: 'EXPERIENCIA LABORAL',
      body: `Investigador–Diseñador – Proyecto "Narrativas transmedia para la dignificación del trabajo palmero" (en colaboración con la Organización Internacional del Trabajo – OIT), 2025.

Diseño y desarrollo de piezas editoriales y gráficas derivadas de procesos de investigación con comunidades y trabajadores del sector. Apoyo en talleres participativos y recolección de información, traduciendo hallazgos de investigación en propuestas visuales y narrativas.

Referencia laboral: Ana Marcela Daza Martinez (Fundación Universitaria del Área Andina) – adaza14@areandina.edu.co`,
    },
  },
  {
    id: 'habilidades',
    label: 'HABILIDADES',
    role: '05',
    color: '#db1398',
    stats: [
      { tag: 'TÉCNICAS', value: 'BLANDAS', color: '#db1398' },
      { tag: 'BLANDAS', value: 'TÉCNICAS', color: '#00e1ff' },
    ],
    content: {
      title: 'HABILIDADES Y COMPETENCIAS',
      body: `TÉCNICAS 
Adobe Photoshop · Adobe Illustrator · Figma · Conceptualización · Composición  

BLANDAS 
Habilidad para aprender · Flexibilidad y adaptabilidad · Responsabilidad · Oratoria · Pensamiento crítico  

IDIOMAS  
Inglés – B2 (Certificado por Pruebas Saber Pro, 2025)`,
    },
  },
  {
    id: 'manifiesto',
    label: 'MANIFIESTO',
    role: '06',
    color: '#db394f',
    stats: [
      { tag: 'CREENCIA', value: 'NARRATIVA', color: '#fffb00' },
      { tag: 'MISIÓN', value: 'TRANSFORMAR', color: '#FF7A22' },
    ],
    content: {
      title: 'MANIFIESTO',
      body: `Antes de que algo exista, alguien lo imaginó.  
Esa es la condición del diseño: vivir en el espacio entre lo que se piensa y lo que se toca. Entre la idea que flota y la forma que la ancla al mundo.  

Ahí es donde trabajo. Creo que las narrativas no describen la realidad, la construyen. Que una imagen bien pensada puede cambiar cómo alguien entiende su propio oficio, su historia, su lugar.  
Que el diseño, cuando tiene propósito, no comunica: transforma.  

Me mueve lo que aún no tiene forma. Lo invisible que merece ser visto. Las historias que existen pero que nadie ha dibujado todavía.  

Ese es el diseño que quiero hacer. El que ocurre en el límite entre imaginar y construir.`,
    },
  },
];

export default function About() {
  /* Soundtrack — continúa sin interrupción desde Home/Projects */
  useEffect(() => {
    audio.soundtrackEnter()
  }, [])

  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();
  const revealRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowUp') {
        setActive(i => Math.max(0, i - 1));
        e.preventDefault();
      }
      if (e.key === 'ArrowDown') {
        setActive(i => Math.min(SECTIONS.length - 1, i + 1));
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        setRevealed(true);
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') {
        if (revealed) setRevealed(false);
        else navigate('/');
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        if (revealed) setRevealed(false);
        else navigate('/');
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, navigate]);

  // Rueda: solo cambia de barra si el mouse no está dentro del reveal
  useEffect(() => {
    const onWheel = (e) => {
      if (revealRef.current && revealRef.current.contains(e.target)) return;
      if (e.deltaY > 0) setActive(i => Math.min(SECTIONS.length - 1, i + 1));
      else setActive(i => Math.max(0, i - 1));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  const handleHeaderClick = () => {
    if (revealed) setRevealed(false);
    else navigate('/');
  };

  const handleBarClick = (index) => {
    audio.play('reveal');
    setActive(index);
    setRevealed(true);
  };

  const current = SECTIONS[active];

  return (
    <div 
      className="screen about-screen"
      style={{
        backgroundImage: `url(${homeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="scanlines" aria-hidden="true" />

      <div className="about-header">
        <button className="about-back" onClick={() => { audio.play(revealed ? 'close' : 'back'); handleHeaderClick(); }}>
          {revealed ? 'CERRAR' : 'VOLVER'}
        </button>
        <span className="about-header-t">SOBRE MÍ</span>
      </div>

      {/* role="group" + role="button" es la estructura ARIA válida
          para una lista de opciones interactivas sin ser un select. */}
      <div
        className={`about-bars ${revealed ? 'bars-disabled' : ''}`}
        role="group"
        aria-label="Secciones"
      >
        {SECTIONS.map((sec, i) => (
          <div
            key={sec.id}
            role="button"
            tabIndex={revealed ? -1 : 0}
            aria-pressed={active === i}
            aria-label={sec.label}
            className={`about-bar-outer${active === i ? ' active' : ''}${mounted ? ' mounted' : ''}`}
            onClick={() => handleBarClick(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBarClick(i) } }}
            onMouseEnter={() => !revealed && setActive(i)}
            data-hover
            style={{ '--bar-color': sec.color, pointerEvents: 'all', cursor: 'pointer' }}
          >
            <div className="about-bar-accent" style={{ background: sec.color }} />
            <div className="about-bar">
              <div className="about-bar-fill" />
              <div className="about-bar-shade" />
              <div className="about-bar-content">
                <div className="about-role" style={{ color: active === i ? sec.color : 'rgba(255,255,255,.15)' }}>
                  {sec.role}
                </div>
                <div className="about-bar-main">
                  <div className="about-bar-label" style={{ color: active === i ? '#0a0a08' : 'rgba(255,255,255,.8)' }}>
                    {sec.label}
                  </div>
                </div>
                <div className="about-bar-stats">
                  {sec.stats.map((s) => (
                    <div key={s.tag} className="about-stat">
                      <span className="about-stat-tag" style={{ color: s.color, borderColor: s.color }}>
                        {s.tag}
                      </span>
                      <span className="about-stat-val" style={{ color: active === i ? '#0a0a08' : '#fff' }}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {revealed && <div className="about-dim" onClick={() => setRevealed(false)} />}

      {revealed && (
        <div ref={revealRef} className={`about-reveal${mounted ? ' mounted' : ''}`} style={{ '--accent-color': current.color }}>
          <div className="about-reveal-inner">
            {/* Mobile close button — inside reveal so it's always accessible */}
            <button
              className="about-reveal-mobile-close"
              onClick={() => { audio.play('close'); setRevealed(false); }}
              data-hover
            >
              ◄ CERRAR
            </button>
            <div className="about-reveal-title">{current.content.title}</div>
            <div className="about-reveal-body">{current.content.body}</div>
          </div>
        </div>
      )}

      {revealed && (
        <div className={`about-portrait-shell${mounted ? ' mounted' : ''}`}>
          <div className="about-portrait-placeholder">
            <img
              src={SECTION_IMGS[active]}
              alt="retrato"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
             loading="lazy" decoding="async" />
          </div>
        </div>
      )}

      <div className={`hints${mounted ? ' visible' : ''}`}>
        <div className="hints-row"><span className="hints-key">↑↓</span><span>SELECCIONAR</span></div>
        <div className="hints-row"><span className="hints-key">↵</span><span>REVELAR</span></div>
        <div className="hints-row"><span className="hints-key">ESC / ←</span><span>CERRAR</span></div>
      </div>

      <div className="stripe-r" aria-hidden="true" />
      <div className="stripe-r2" aria-hidden="true" />
    </div>
  );
}