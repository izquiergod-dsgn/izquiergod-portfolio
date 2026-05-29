import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BackBtn from "../../components/BackBtn/BackBtn.jsx";
import { gsap } from "gsap";
import { audio } from "../../audio/AudioManager.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Powerlifting.css";

/*
  Rutas relativas desde src/pages/projects/
  Si el componente está más anidado, ajusta los "../" necesarios.
*/
import screenSesion from "../../assets/powerlifting/screen-sesion.webp";
import screenPerfil from "../../assets/powerlifting/screen-perfil.webp";
/* Reemplazar: intro-bg.webp — foto fondo panel intro, atmosférica */
import introBg       from "../../assets/powerlifting/intro-bg.webp";
/* Reemplazar: atleta.png — retrato atleta para panel de sesión */
import atleta        from "../../assets/powerlifting/atleta.png";

/* ═══════════════════════════════════════════════════════
   DISCIPLINA BAJO CARGA — v3 Panel Edition
   GSAP ScrollTrigger · Paneles fijos · Scroll físico
   ═══════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·-/█▓▒░";

// Cada panel define su dirección de entrada:
//   from:"y" dir:1  → entra desde abajo
//   from:"x" dir:1  → entra desde la derecha
//   from:"x" dir:-1 → entra desde la izquierda
const PANEL_DEFS = [
  { key: "intro",      label: "INTRO",     from: null, dir:  0 },
  { key: "context",    label: "CONTEXTO",  from: "y",  dir:  1 },
  { key: "visual",     label: "SISTEMA",   from: "x",  dir:  1 },
  { key: "experience", label: "INTERFAZ",  from: "y",  dir:  1 },
  { key: "atmosphere", label: "AFTERMATH", from: "x",  dir: -1 },
  { key: "final",      label: "315",       from: "y",  dir:  1 },
];

const PANEL_COUNT = PANEL_DEFS.length; // 6

/* ─── HOOK: usePanelScroll ──────────────────────────────
   Registra un ScrollTrigger por transición.
   Cada panel entra desde su dirección, empuja al anterior
   hacia atrás con scale + overlay oscuro.
   scrub:1.8 → inercia pesada, sensación de masa.
   ─────────────────────────────────────────────────── */
function usePanelScroll() {
  useEffect(() => {
    /*
      App.jsx envuelve cada página en <motion.div position:fixed inset:0>.
      Todo el árbol React está dentro de un contenedor fixed — el scroll-track JSX
      nunca contribuye a la altura del documento → window.scrollY siempre 0.

      SOLUCIÓN: spacer creado en document.body (fuera del árbol React).
      document.body está en el flujo del documento → genera scroll real.
    */
    document.documentElement.style.height   = 'auto'
    document.documentElement.style.overflow = 'auto'
    document.body.style.height              = 'auto'
    document.body.style.overflow            = 'auto'

    const spacer = document.createElement('div')
    spacer.style.cssText = `height:${PANEL_COUNT * 100}vh;pointer-events:none;visibility:hidden;position:relative;`
    document.body.appendChild(spacer)

    /* On mobile (touch) panels use CSS-only scroll (no GSAP spacer needed).
       The media query in CSS handles this. Skip GSAP setup on touch devices. */
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice) return () => {
      if (document.body.contains(spacer)) document.body.removeChild(spacer)
      document.documentElement.style.height = ''
      document.documentElement.style.overflow = ''
      document.body.style.height = ''
      document.body.style.overflow = ''
    }

    const panelEls  = PANEL_DEFS.map((d) => document.querySelector(`.panel-${d.key}`))
    const overlayEls = panelEls.map((el) => el?.querySelector('.panel-overlay'))

    panelEls.forEach((el, i) => { if (el) el.style.zIndex = (i + 1) * 10 })

    PANEL_DEFS.forEach((def, i) => {
      if (i === 0 || !def.from || !panelEls[i]) return
      gsap.set(panelEls[i], { [def.from]: `${def.dir * 100}%` })
    })

    const TRANSITIONS = PANEL_COUNT - 1

    PANEL_DEFS.forEach((def, i) => {
      if (i === 0 || !def.from || !panelEls[i]) return

      const ti       = i - 1
      const startPct = (ti / TRANSITIONS) * 100
      const endPct   = ((ti + 1) / TRANSITIONS) * 100
      const fromVal  = `${def.dir * 100}%`

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: spacer,
          start:   `${startPct}% top`,
          end:     `${endPct}% top`,
          scrub:   1.8,
        },
      })

      tl.fromTo(panelEls[i], { [def.from]: fromVal }, { [def.from]: '0%', ease: 'power4.out', duration: 1 }, 0)
      if (panelEls[i - 1]) tl.to(panelEls[i - 1], { scale: 0.962, ease: 'power4.out', duration: 1 }, 0)
      if (overlayEls[i - 1]) tl.to(overlayEls[i - 1], { opacity: 0.52, ease: 'power4.out', duration: 1 }, 0)
    })

    const rfId = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(rfId)
      if (document.body.contains(spacer)) document.body.removeChild(spacer)
      document.documentElement.style.height   = ''
      document.documentElement.style.overflow = ''
      document.body.style.height              = ''
      document.body.style.overflow            = ''
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])
}


/* ─── HOOK: useScrollProgress ───────────────────────── */
function useScrollProgress() {
  const [state, setState] = useState({ progress: 0, activePanel: 0, velocity: 0 });
  const prevY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const p = window.scrollY / max;
      const v = window.scrollY - prevY.current;
      prevY.current = window.scrollY;
      setState({
        progress:    p,
        activePanel: Math.min(Math.round(p * (PANEL_COUNT - 1)), PANEL_COUNT - 1),
        velocity:    v,
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return state;
}

/* ─── HOOK: useMousePosition ────────────────────────── */
function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0, nx: 0, ny: 0 });
  useEffect(() => {
    const onMove = (e) =>
      setMouse({
        x:  e.clientX,
        y:  e.clientY,
        nx: (e.clientX / window.innerWidth)  * 2 - 1,
        ny: (e.clientY / window.innerHeight) * 2 - 1,
      });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return mouse;
}

/* ─── COMPONENT: CursorFX ────────────────────────────
   Dot instantáneo + ring con lag (lerp 0.1).
   Ring escala 2.5× sobre elementos interactivos.
   ─────────────────────────────────────────────────── */
function CursorFX() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const lerp    = useRef({ x: 0, y: 0 });
  const pos     = useRef({ x: 0, y: 0 });
  const scale   = useRef(1);

  useEffect(() => {
    const INTERACTIVE =
      "a, button, .palette-swatch, .ref-block, .type-row, " +
      ".mock-stat, .exp-screen, .marquee-item, .section-nav-item, " +
      ".exp-film-still";

    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const onOver = (e) => {
      scale.current = e.target.closest(INTERACTIVE) ? 2.5 : 1;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);

    const animate = () => {
      lerp.current.x += (pos.current.x - lerp.current.x) * 0.1;
      lerp.current.y += (pos.current.y - lerp.current.y) * 0.1;
      if (dotRef.current)
        dotRef.current.style.transform =
          `translate(calc(${pos.current.x}px - 50%), calc(${pos.current.y}px - 50%))`;
      if (ringRef.current)
        ringRef.current.style.transform =
          `translate(calc(${lerp.current.x}px - 50%), calc(${lerp.current.y}px - 50%)) scale(${scale.current})`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ─── COMPONENT: ScrollProgress ─────────────────────── */
function ScrollProgress({ progress }) {
  return (
    <div className="scroll-progress">
      <div className="scroll-progress-fill" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

/* ─── COMPONENT: SectionNav ─────────────────────────── */
function SectionNav({ activePanel }) {
  const scrollToPanel = (index) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = (index / (PANEL_COUNT - 1)) * max;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <nav className="section-nav" aria-label="Navegación de secciones">
      {PANEL_DEFS.map((def, i) => (
        <button
          key={i}
          className={`section-nav-item${activePanel === i ? " section-nav-item--active" : ""}`}
          onClick={() => scrollToPanel(i)}
          aria-label={`Ir a ${def.label}`}
        >
          <span className="section-nav-label">{def.label}</span>
          <span className="section-nav-dot" />
        </button>
      ))}
    </nav>
  );
}

/* ─── COMPONENT: ScrambleText ───────────────────────── */
function ScrambleText({ text, tag: Tag = "span", className = "" }) {
  const [display, setDisplay] = useState(text);
  const iRef = useRef(null);

  const scramble = useCallback(() => {
    let step = 0;
    clearInterval(iRef.current);
    iRef.current = setInterval(() => {
      setDisplay(
        text.split("").map((char, i) => {
          if (char === " " || char === "\n") return char;
          if (i < step) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join("")
      );
      step += 0.45;
      if (step >= text.length) {
        setDisplay(text);
        clearInterval(iRef.current);
      }
    }, 28);
  }, [text]);

  useEffect(() => () => clearInterval(iRef.current), []);

  return <Tag className={className} onMouseEnter={scramble}>{display}</Tag>;
}

/* ─── COMPONENT: TiltBlock ──────────────────────────── */
function TiltBlock({ children, intensity = 6, className = "" }) {
  const ref  = useRef(null);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const raf  = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      tilt.current.tx = ((e.clientX - (r.left + r.width  / 2)) / r.width)  *  intensity;
      tilt.current.ty = ((e.clientY - (r.top  + r.height / 2)) / r.height) * -intensity;
    };
    const onLeave = () => { tilt.current.tx = 0; tilt.current.ty = 0; };

    const animate = () => {
      tilt.current.x += (tilt.current.tx - tilt.current.x) * 0.06;
      tilt.current.y += (tilt.current.ty - tilt.current.y) * 0.06;
      if (el)
        el.style.transform =
          `perspective(1000px) rotateY(${tilt.current.x}deg) rotateX(${tilt.current.y}deg)`;
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [intensity]);

  return (
    <div ref={ref} className={className} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
      {children}
    </div>
  );
}

/* ─── COMPONENT: Particles ──────────────────────────── */
function Particles({ count = 40 }) {
  return (
    <div className="particles">
      {Array.from({ length: count }).map((_, i) => {
        const size     = Math.random() * 2 + 0.5;
        const left     = Math.random() * 100;
        const duration = Math.random() * 20 + 12;
        const delay    = Math.random() * 15;
        const drift    = (Math.random() - 0.5) * 80;
        return (
          <div
            key={i}
            className="particle"
            style={{
              left:              `${left}%`,
              width:             `${size}px`,
              height:            `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay:    `${delay}s`,
              "--drift":         `${drift}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── COMPONENT: HUDOverlay ─────────────────────────── */
function HUDOverlay() {
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 8));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toTimeString().slice(0, 8)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hud-lines">
      <div className="hud-line-h hud-line--scan" style={{ top: "33%" }} />
      <div className="hud-line-h hud-line--scan" style={{ top: "67%", animationDelay: "0.6s" }} />
      <div className="hud-line-v" style={{ left: "20%" }} />
      <div className="hud-line-v" style={{ right: "20%" }} />
      <div className="hud-corner hud-corner--tl" />
      <div className="hud-corner hud-corner--tr" />
      <div className="hud-corner hud-corner--bl" />
      <div className="hud-corner hud-corner--br" />
      <div className="hud-coords">
        <div>SQT / BNCH / DL</div>
        <div>04°51'N 74°07'W</div>
        <div className="hud-coords-live">T {time}</div>
        <div>CYCLE 12 · WK 08</div>
      </div>
      <div className="hud-label" style={{ top: "calc(33% - 14px)", left: "6vw" }}>FASE · PEAK</div>
      <div className="hud-label" style={{ top: "calc(67% - 14px)", right: "6vw" }}>INTENSIDAD · 97.5%</div>
      <div className="bio-tag" style={{ top: "45%", right: "8vw" }}>COLUMNA NEUTRAL</div>
      <div className="bio-tag" style={{ top: "55%", left: "8vw" }}>TENSION MÁXIMA</div>
    </div>
  );
}

/* ─── COMPONENT: LiveMockUI ─────────────────────────── */
function LiveMockUI() {
  const [bars, setBars] = useState([40, 70, 55, 90, 65, 80, 45, 95, 60, 75, 50, 85]);
  const [rpe,  setRpe]  = useState(9.5);
  const containerRef    = useRef(null);
  const glowRef         = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setBars((prev) => prev.map((b) => Math.max(15, Math.min(100, b + (Math.random() - 0.5) * 7))));
      setRpe((prev)  => parseFloat(Math.max(9.0, Math.min(10.0, prev + (Math.random() - 0.5) * 0.12)).toFixed(1)));
    }, 900);
    return () => clearInterval(id);
  }, []);

  const onMouseMove = (e) => {
    const el   = containerRef.current;
    const glow = glowRef.current;
    if (!el || !glow) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width)  * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;
    glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(139,26,26,0.09) 0%, transparent 55%)`;
  };

  return (
    <div className="mock-ui mock-ui--live" ref={containerRef} onMouseMove={onMouseMove}>
      <div className="mock-scanlines" />
      <div ref={glowRef} className="mock-cursor-glow" />
      <div className="mock-bar">
        <div className="mock-dot mock-dot--red mock-dot--pulse" />
        <div className="mock-dot" />
        <div className="mock-dot" />
        <div className="mock-status-indicator">
          SYS:LIVE · {new Date().toTimeString().slice(0, 8)}
        </div>
      </div>
      <div className="mock-body">
        <div className="mock-sidebar">
          {["DASHBOARD","SESIONES","FUERZA","CARGA","FATIGA","CICLOS"].map((n, i) => (
            <div key={i} className={`mock-nav-item${i === 2 ? " mock-nav-item--active" : ""}`}>
              <span className="mock-nav-code">{String(i).padStart(2, "0")}</span>
              <span className="mock-nav-text">{n}</span>
            </div>
          ))}
        </div>
        <div className="mock-main">
          <div className="mock-hero-block">
            <div className="mock-hero-bg-lines" />
            <div className="mock-hero-glow" />
            <div className="mock-hero-text">490</div>
            <div className="mock-hero-tag">MAX · DEADLIFT · KG</div>
          </div>
          <div className="mock-stat-row">
            {[
              { n: "490",           l: "MAX · KG", active: false },
              { n: rpe.toFixed(1),  l: "RPE",      active: true  },
              { n: "08",            l: "SEMANA",   active: false },
              { n: "3×1",           l: "ESQUEMA",  active: false },
            ].map((s, i) => (
              <div key={i} className={`mock-stat${s.active ? " mock-stat--active" : ""}`}>
                <div className="mock-stat-num">{s.n}</div>
                <div className="mock-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mock-chart">
            {bars.map((h, i) => (
              <div
                key={i}
                className={`mock-bar-chart${i === 9 ? " mock-bar-chart--peak" : ""}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── COMPONENT: GhostFinal ─────────────────────────── */
function GhostFinal({ mouse }) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const randomGlitch = () => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
      setTimeout(randomGlitch, 4000 + Math.random() * 8000);
    };
    const tid = setTimeout(randomGlitch, 3000 + Math.random() * 4000);
    return () => clearTimeout(tid);
  }, []);

  const GHOSTS = [
    { opacity: 0.025, blur: 14, scale: 1.07,  dx: -5, dy: -3   },
    { opacity: 0.05,  blur: 7,  scale: 1.035, dx:  3, dy:  1.5 },
    { opacity: 0.09,  blur: 3,  scale: 1.015, dx: -2, dy: -1   },
    { opacity: 0.14,  blur: 1,  scale: 1.005, dx:  1, dy:  0.5 },
  ];

  return (
    <>
      <div className="final-corners hud-lines">
        <div className="hud-corner hud-corner--tl" />
        <div className="hud-corner hud-corner--tr" />
        <div className="hud-corner hud-corner--bl" />
        <div className="hud-corner hud-corner--br" />
      </div>

      {[
        { text: "SQT · 180KG", style: { top: "18%",    left: "6vw"  } },
        { text: "BNCH · 100KG",  style: { top: "18%",    right: "6vw" } },
        { text: "TOTAL · 490", style: { bottom: "18%", left: "6vw"  } },
        { text: "WILKS · 242",   style: { bottom: "18%", right: "6vw" } },
      ].map((t, i) => (
        <div key={i} className="tech-float" style={t.style}>{t.text}</div>
      ))}

      <div className="final-ghost-wrap">
        {GHOSTS.map((g, i) => (
          <div
            key={i}
            className="ghost-315"
            style={{
              opacity: g.opacity,
              filter: `blur(${g.blur}px)`,
              transform: `translate(
                calc(-50% + ${g.dx + mouse.nx * (i + 1) * 5}px),
                calc(-50% + ${g.dy + mouse.ny * (i + 1) * 3}px)
              ) scale(${g.scale})`,
            }}
          >
            490
          </div>
        ))}
        <div
          className={`final-number${glitch ? " final-number--glitch" : ""}`}
          style={{ transform: `translate(${mouse.nx * -4}px, ${mouse.ny * -2.5}px)` }}
        >
          490
        </div>
      </div>

      <div
        className="final-unit"
        style={{ transform: `translate(${mouse.nx * -2}px, ${mouse.ny * -1}px)` }}
      >
        KG
      </div>

      <div className="final-rule" />
      <ScrambleText text="NO MISSED LIFTS" tag="div" className="final-tagline" />

      <div className="final-meta">
        <div>DISCIPLINA BAJO CARGA · EXPERIENCIA DIGITAL · 2026</div>
        <div>POWERLIFTING · DISEÑO EXPERIMENTAL · DIRECCIÓN DE ARTE</div>
        <div className="final-meta-rule">──────────────────────────</div>
        <div>DISEÑADO Y DESARROLLADO POR LUIS IZQUIERDO</div>
      </div>

      <div className="final-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="final-particle"
            style={{
              left:              `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 14}s`,
              animationDelay:    `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function DisciplinaUnderLoad() {
  /* Silenciar soundtrack al entrar a una sección de proyecto */
  useEffect(() => {
    audio.soundtrackLeave()
    return () => audio.soundtrackEnter()  // restaurar al salir (back to menu)
  }, [])

  const { progress, activePanel, velocity } = useScrollProgress();
  const mouse     = useMousePosition();
  const panelsRef = useRef(null);

  usePanelScroll();
  const navigate = useNavigate();

  /* ESC → volver a proyectos */
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') navigate('/projects') }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [navigate])

  // Velocity blur — blur leve al hacer scroll rápido (inercia visual)
  useEffect(() => {
    const el = panelsRef.current;
    if (!el) return;
    const absV = Math.abs(velocity);
    el.style.filter = absV > 8 ? `blur(${Math.min(absV * 0.03, 0.9)}px)` : "";
  }, [velocity]);

  return (
    <>
      {/* ══ UI FIJA — siempre encima de los paneles ══ */}
      <CursorFX />
      <ScrollProgress progress={progress} />
      <SectionNav activePanel={activePanel} />

      <BackBtn accentColor="var(--red)" bg="rgba(6,6,7,0.75)" color="rgba(216,213,204,0.5)" />

      {/* ══ SCROLL TRACK — genera la altura de scroll ══
          600vh para 6 paneles / 5 transiciones.
          GSAP lee su progreso para mover los paneles.    */}
      <div className="scroll-track" />

      {/* ══ PANELES FIJOS — todos position:absolute inset:0 ══ */}
      <div className="panels-container" ref={panelsRef}>

        {/* ── PANEL 0: INTRO ─────────────────────────────── */}
        <section className="panel panel-intro s-intro" id="s-intro">
          <div className="intro-bg">
            <img
              src={introBg}
              alt=""
              aria-hidden="true"
              className="intro-bg-img"
            />
            <Particles count={45} />
          </div>

          <HUDOverlay />

          {/* Número de profundidad — se mueve con el mouse */}
          <div
            className="intro-depth-text"
            style={{ transform: `translate(${mouse.nx * 10}px, ${mouse.ny * 6}px)` }}
          >
            490
          </div>

          <div className="intro-content">
            <p className="intro-eyebrow">
              <ScrambleText text="Case Study — 2024" />
            </p>
            <h1
              className="intro-title"
              style={{ transform: `translate(${mouse.nx * -5}px, ${mouse.ny * -3}px)` }}
            >
              Disciplina
              <em>Bajo Carga</em>
            </h1>
            <p className="intro-sub">
              Herramienta digital para el levantador serio — calculadoras RPE, periodización, registro de sesiones y dirección de arte que siente el peso real.
            </p>
          </div>

          <div className="intro-bottom-row">
            <div className="intro-spec">
              <div>TIPO · EXPERIENCIA DIGITAL INTERACTIVA</div>
              <div>ROL · DISEÑO · DESARROLLO · DIRECCIÓN DE ARTE</div>
              <div>AÑO · MMXXIV</div>
            </div>
            <div className="intro-index">01</div>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-line" />
            <span>Scroll</span>
          </div>

          <div className="panel-overlay" />
        </section>

        {/* ── PANEL 1: CONTEXTO ──────────────────────────── */}
        <section className="panel panel-context s-context" id="s-context">

          {/* Marquee integrado al tope del panel */}
          <div className="marquee-wrap marquee-wrap--compact">
            <div className="marquee-track">
              {[...Array(2)].map((_, rep) => (
                <div key={rep} style={{ display: "flex" }}>
                  {["DEADLIFT","SQUAT","BENCH","TENSION","FATIGA","INERTIA",
                    "BIOMECÁNICA","REPEAT","MASS","BRUTAL","FUERZA","DISCIPLINE"]
                    .map((word, i) => (
                      <div key={i} className="marquee-item">
                        {word}<span>✦</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          <div className="context-panel-grid">
            <div className="context-tag">
              <div className="context-tag-label">
                <ScrambleText text="Contexto" />
              </div>
              <h2 className="context-headline">
                Por qué
                <span className="break">existe esto</span>
              </h2>
              {/*
                FOTO DEL ATLETA
                Tipo: foto en plataforma durante intento. B&W, sin pose.
                Formato: portrait, mín. 800×1000px.
                <div className="context-athlete-img">
                  <img
                    src={atleta}
                    alt="Luis Izquierdo — powerlifter competitivo"
                   loading="lazy" decoding="async" />
                </div>
              */}
            </div>

            <div className="context-body">
              <p className="context-para">
                Compito en la categoría <strong>-59kg</strong>. Conozco la
                sensación de tener 300kg sobre la espalda. La mente se vacía.
                Solo queda tensión, respiración y el suelo.
              </p>
              <p className="context-para">
                <strong>IRON</strong> nació de esa obsesión. No una app fitness
                con gráficas vibrantes — sino una herramienta real: calculadoras
                de e1RM y RPE, tablas de periodización, registro de sesiones y
                protocolo de bajada de peso. Todo lo que uso en competencia.
              </p>
              <p className="context-para">
                Y visualmente: el opuesto deliberado de la estética deportiva
                genérica. Sin gradientes de neón. Sin tipografía motivacional.
                Solo <strong>peso, estructura y datos</strong>.
              </p>
            </div>

            <div className="context-rule" />

            <div className="context-statement">
              <p className="context-statement-text">
                No es una <span>app fitness</span> es una <span>herramienta de campo</span>
              </p>
              <div className="context-aside">
                <div>PROYECTO PERSONAL</div>
                <div>DISEÑO EXPERIMENTAL</div>
                <div>2024</div>
              </div>
            </div>
          </div>

          <div className="panel-overlay" />
        </section>

        {/* ── PANEL 2: SISTEMA GRÁFICO ───────────────────── */}
        <section className="panel panel-visual s-visual" id="s-visual">

          <div className="visual-intro">
            <span className="visual-intro-num">03 / LENGUAJE VISUAL</span>
            <h2 className="visual-intro-title">
              Sistema<br />Gráfico
            </h2>
          </div>

          <div className="visual-palette">
            {[
              { bg: "#060607", name: "VOID"   },
              { bg: "#111113", name: "CARBON" },
              { bg: "#1a1a1d", name: "SMOKE"  },
              { bg: "#2c2c30", name: "ASH"    },
              { bg: "#8b1a1a", name: "BLOOD"  },
              { bg: "#c0392b", name: "HEAT"   },
              { bg: "#d8d5cc", name: "BONE"   },
            ].map((s, i) => (
              <div key={i} className="palette-swatch" data-name={s.name} style={{ background: s.bg }} />
            ))}
          </div>

          <div className="visual-type">
            {[
              { label: "Display",   el: <div className="type-sample-display">FUERZA</div> },
              { label: "Condensed", el: <div className="type-sample-condensed">BARLOW CONDENSED — INTENSIDAD MÁXIMA</div> },
              { label: "Mono",      el: <div className="type-sample-mono">IBM_PLEX_MONO · DATOS · 97.5% · TOTAL:490KG</div> },
            ].map((row, i) => (
              <div key={i} className="type-row">
                <div className="type-label">{row.label}</div>
                <div className="type-sample">{row.el}</div>
              </div>
            ))}
          </div>

          <div className="visual-refs visual-refs--panel">
            {[
              { code: "REF·001", title: "Brutalismo", desc: "Estructura expuesta. El esqueleto como diseño." },
              { code: "REF·002", title: "Industrial",  desc: "Hierro, óxido, peso. Historia en el cuerpo."  },
              { code: "REF·003", title: "Editorial",   desc: "Tipografía como silencio en la plataforma."   },
            ].map((ref, i) => (
              <TiltBlock key={i} className="ref-block" intensity={5}>
                <div className="ref-block-code">
                  <ScrambleText text={ref.code} />
                </div>
                <div>
                  <div className="ref-block-title">{ref.title}</div>
                  <div className="ref-block-desc">{ref.desc}</div>
                </div>
              </TiltBlock>
            ))}
          </div>

          <div className="panel-overlay" />
        </section>

        {/* ── PANEL 3: EXPERIENCIA ───────────────────────── */}
        <section className="panel panel-experience s-experience" id="s-experience">

          <div className="exp-panel-layout">

            {/* Columna izquierda: iframe a pantalla completa */}
            <div className="exp-panel-main">
              <div className="exp-iframe-wrap">
                <div className="mock-scanlines" />
                <div className="exp-iframe-label">IRON · SISTEMA DE POWERLIFTING · LIVE</div>
                <iframe
                  src="https://intothepower.netlify.app"
                  title="IRON — Sistema de Powerlifting"
                  className="exp-iframe"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>

            {/* Columna derecha: título + live mock + módulos */}
            <div className="exp-panel-side">

              <div className="exp-panel-header">
                <h2 className="exp-header-title">
                  La<br /><span className="dim">Inter</span><br />Faz
                </h2>
                <div className="exp-header-meta">
                  <div>04 / EXPERIENCIA</div>
                  <div>UI · UX · MOTION</div>
                </div>
              </div>

              {/* Live mock UI — simulación del dashboard */}
              <div className="exp-screen-inner exp-screen-inner--panel" style={{flex:1,minHeight:0}}>
                <LiveMockUI />
              </div>

              {/* Módulos del sistema */}
              <div className="exp-modules">
                {[
                  { code:'01', name:'CALCULADORAS', sub:'e1RM · RPE · Wilks · DOTS' },
                  { code:'02', name:'PERIODIZACIÓN', sub:'Bloques · Peak · Deload' },
                  { code:'03', name:'REGISTRO',      sub:'Sesiones · PRs · Progresión' },
                  { code:'04', name:'BAJADA PESO',   sub:'Protocolo · Fases · Rehidratación' },
                ].map((m,i) => (
                  <div key={i} className="exp-module">
                    <span className="exp-module-code">{m.code}</span>
                    <div>
                      <div className="exp-module-name">{m.name}</div>
                      <div className="exp-module-sub">{m.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="exp-panel-meta">
                <div>EASING · CUBIC-BEZIER(0.87, 0, 0.13, 1)</div>
                <div>DURATION · 800–1400MS</div>
                <div>LERP · 0.075 / SCRUB · 1.8</div>
              </div>
            </div>
          </div>

          <div className="panel-overlay" />
        </section>

        {/* ── PANEL 4: ATMÓSFERA ─────────────────────────── */}
        <section className="panel panel-atmosphere s-atmosphere" id="s-atmosphere">

          {/* Imágenes laterales */}
          <div className="atm-side atm-side--left">
            <div className="mock-scanlines" />
            <img src={screenSesion} alt="Sesión de entrenamiento" className="atm-side-img"  loading="lazy" decoding="async" />
            <div className="atm-side-label">SQUAT DAY · PEAK</div>
          </div>
          <div className="atm-side atm-side--right">
            <div className="mock-scanlines" />
            <img src={screenPerfil} alt="Perfil atleta" className="atm-side-img"  loading="lazy" decoding="async" />
            <div className="atm-side-label">CICLO ACTIVO · RPE 9.5</div>
          </div>

          <div className="atm-container">
            <div className="atm-pre">
              <ScrambleText text="05 · AFTERMATH" />
            </div>

            <div className="atm-statement">
              <h2 className="atm-statement-text">
                La fuerza<br />no es limpia
              </h2>
              <div className="atm-statement-annotation">PSICOLOGÍA · LÍMITE</div>
            </div>

            <div className="atm-divider" />

            <div className="atm-statement">
              <h2 className="atm-statement-text"
                style={{ fontSize: "clamp(32px, 4.5vw, 68px)", color: "var(--grey-light)" }}
              >
                todo movimiento<br />es adaptación
              </h2>
            </div>

            <div className="atm-divider" />

            <div className="atm-statement">
              <h2 className="atm-statement-text"
                style={{ fontSize: "clamp(26px, 3.5vw, 52px)", color: "var(--grey)" }}
              >
                la fatiga también<br />diseña la interfaz
              </h2>
              <div className="atm-statement-annotation" style={{ opacity: 0.4 }}>
                DISEÑO · SISTÉMICO
              </div>
            </div>

            <div className="atm-technical">
              {[
                { label: "Decisión de diseño",     value: "Sin colores primarios vibrantes. El rojo es sangre, no CTA. La paleta es hierro, carbono y hueso." },
                { label: "Decisión de tipografía", value: "Bebas Neue comprime. Como el cuerpo bajo carga máxima. Mono para datos — los números tienen que leerse como lecturas de sensor." },
                { label: "Decisión de motion",     value: "Scrub 1.8 y easing pesado. Nada entra rápido. Todo llega con masa. El scroll se siente como agregar platos a la barra." },
                { label: "Decisión de espacio",    value: "El vacío no es falta de diseño. Es el descanso entre series. El silencio visual antes del siguiente intento." },
              ].map((item, i) => (
                <div key={i} className="atm-tech-item">
                  <div className="atm-tech-label">
                    <ScrambleText text={item.label} />
                  </div>
                  <div className="atm-tech-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-overlay" />
        </section>

        {/* ── PANEL 5: FINAL 315 ─────────────────────────── */}
        <section className="panel panel-final s-final" id="s-final">
          <GhostFinal mouse={mouse} />
          <div className="panel-overlay" />
        </section>

      </div>{/* /panels-container */}
    </>
  );
}
