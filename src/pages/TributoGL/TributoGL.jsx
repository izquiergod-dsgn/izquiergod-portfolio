import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { audio } from '../../audio/AudioManager.js'
import BackBtn from '../../components/BackBtn/BackBtn.jsx'
import './TributoGL.css'

/*
  TRIBUTO GL
  Cinematic Modular Archive System — Enhanced
*/

const SECCIONES = [
  { id: 'S01', label: 'LANDING', sub: 'Pantalla principal.' },
  { id: 'S02', label: 'GALLERY', sub: 'Archivo visual.' },
  { id: 'S03', label: 'WATCH',   sub: 'Episodios.' },
  { id: 'S04', label: 'MANGA',   sub: 'Lectura.' },
]

const CONTENT = [
  {
    title: ['GURREN', 'LAGANN'],
    sub:   'TRIBUTO WEB EXPERIMENTAL',
    desc:  'Sitio web inspirado en la intensidad visual y emocional de Tengen Toppa Gurren Lagann. Diseñado como una experiencia cinética utilizando únicamente HTML, CSS y JavaScript.',
    tags:  ['HTML5', 'CSS3', 'JAVASCRIPT', 'ANIME TRIBUTE', '2025'],
  },
  {
    title: ['VISUAL', 'ARCHIVE'],
    sub:   'GALERÍA CINEMATOGRÁFICA',
    desc:  'Colección interactiva de escenas, composición gráfica y momentos icónicos reinterpretados como un archivo visual experimental.',
    tags:  ['GALLERY', 'VISUAL DESIGN', 'ANIMATION', 'COMPOSITION'],
  },
  {
    title: ['WATCH', 'MODULE'],
    sub:   'NAVEGACIÓN AUDIOVISUAL',
    desc:  'Exploración de episodios utilizando diseño editorial, estructuras cinematográficas y navegación inspirada en interfaces anime.',
    tags:  ['EPISODES', 'VIDEO UI', 'CINEMATIC', 'MEDIA'],
  },
  {
    title: ['MANGA', 'MODE'],
    sub:   'LECTURA INTERACTIVA',
    desc:  'Interpretación web del manga mediante composición vertical, navegación dinámica y diseño inmersivo.',
    tags:  ['MANGA', 'SCROLL', 'READING', 'EXPERIMENTAL'],
  },
]

const TICKER =
  'GURREN LAGANN · TENGEN TOPPA · DAI-GURREN BRIGADE · WHO THE HELL DO YOU THINK I AM · PIERCE THE HEAVENS WITH YOUR DRILL · '

const PARTICLES = [
  [8,  160, 0,   7.5],
  [17, 240, 1.2, 9.1],
  [29, 120, 0.4, 8.3],
  [43, 300, 2.0, 10.2],
  [56, 180, 0.7, 7.8],
  [68, 90,  1.5, 9.6],
  [79, 210, 0.2, 8.9],
  [88, 270, 1.8, 11.0],
  [23, 350, 0.9, 8.4],
  [62, 400, 1.3, 10.5],
  [37, 140, 2.4, 7.2],
  [74, 320, 0.6, 9.3],
]

const SYS_BARS = [
  ['CPU', 78],
  ['MEM', 45],
  ['GFX', 92],
  ['NET', 61],
]

export default function TributoGL() {
  /* Silenciar soundtrack al entrar a una sección de proyecto */
  useEffect(() => {
    audio.soundtrackLeave()
    return () => audio.soundtrackEnter()  // restaurar al salir (back to menu)
  }, [])


  const [active,       setActive]       = useState(0)
  const [busy,         setBusy]         = useState(false)
  const [glitch,       setGlitch]       = useState(false)
  const [cur,          setCur]          = useState({ x: -300, y: -300 })
  const [fol,          setFol]          = useState({ x: -300, y: -300 })

  const titleRef  = useRef(null)
  const folRef    = useRef({ x: -300, y: -300 })
  const rafRef    = useRef(null)
  const navigate  = useNavigate()

 
  /* =========================================================
     MOUSE PARALLAX ON TITLE
  ========================================================= */

  useEffect(() => {
    const move = e => {
      if (!titleRef.current) return
      const cx = window.innerWidth  / 2
      const cy = window.innerHeight / 2
      gsap.to(titleRef.current, {
        x: ((e.clientX - cx) / cx) * 18,
        y: ((e.clientY - cy) / cy) * 12,
        duration: 0.9,
        ease: 'power2.out',
      })
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  /* =========================================================
     PERIODIC GLITCH
  ========================================================= */

  useEffect(() => {
    let t
    const schedule = () => {
      t = setTimeout(() => {
        setGlitch(true)
        setTimeout(() => { setGlitch(false); schedule() }, 400)
      }, 3200 + Math.random() * 4500)
    }
    schedule()
    return () => clearTimeout(t)
  }, [])

  /* =========================================================
     INTRO ANIMATIONS
  ========================================================= */

  useEffect(() => {
    const t = setTimeout(() => {

      gsap.from('.gl-line-1', {
        y: 160, skewX: -22, opacity: 0,
        duration: .75, ease: 'power4.out', delay: .05,
      })
      gsap.from('.gl-line-2', {
        y: 160, skewX: -22, opacity: 0,
        duration: .75, ease: 'power4.out', delay: .2,
      })
      gsap.from('.gl-header', {
        y: -44, opacity: 0, duration: .5, ease: 'power3.out',
      })
      gsap.from('.gl-progress', {
        scaleX: 0, duration: .45, ease: 'power3.out',
        transformOrigin: 'left',
      })
      gsap.from('.gl-panel', {
        x: 50, opacity: 0, duration: .55,
        stagger: .08, ease: 'power3.out', delay: .45,
      })
      gsap.from('.gl-sys-status', {
        opacity: 0, y: 20, duration: .4, delay: .9, ease: 'power3.out',
      })
      gsap.from('.gl-beam', {
        scaleY: 0, duration: 1, ease: 'expo.out',
        delay: .15, transformOrigin: 'top',
      })
      gsap.from('.gl-viewport', {
        opacity: 0, scale: .94, duration: .9,
        delay: .28, ease: 'power3.out',
      })
      gsap.from('.gl-hero-meta', {
        opacity: 0, y: 24, duration: .5,
        delay: .55, ease: 'power3.out',
      })
      gsap.from('.gl-bottom-bar', {
        y: 28, opacity: 0, duration: .4,
        delay: .75, ease: 'power3.out',
      })
      gsap.from('.gl-ind-dot', {
        scaleX: 0, duration: .3,
        stagger: .07, delay: .65, ease: 'power3.out',
      })
      gsap.from('.gl-particle', {
        opacity: 0, stagger: .04, duration: .35, delay: .9,
      })

    }, 80)
    return () => clearTimeout(t)
  }, [])

  /* =========================================================
     ESC TO EXIT
  ========================================================= */

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { audio.play('back'); navigate(-1) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [navigate])

  /* =========================================================
     SECTION SWITCH
  ========================================================= */

  const activateSection = i => {
    if (i === active || busy) return
    audio.play('glitch')
    setBusy(true)
    setGlitch(true)

    gsap.to('.gl-module', {
      opacity: 0, scale: .97, filter: 'blur(10px)',
      duration: .2, ease: 'power2.out',
    })
    gsap.to(['.gl-line-1', '.gl-line-2'], {
      y: -80, skewX: 16, opacity: 0,
      duration: .15, ease: 'power2.in',
    })
    gsap.to('.gl-hero-meta', { opacity: 0, y: -14, duration: .15 })
    gsap.to('.gl-viewport',  {
      filter: 'brightness(.5) contrast(1.4) saturate(.3)',
      duration: .18,
    })
    gsap.to('.gl-progress-fill', {
      scaleX: 1, duration: .24,
      ease: 'power2.inOut', transformOrigin: 'left',
    })

    setTimeout(() => {
      setActive(i)
      setGlitch(false)
      setBusy(false)

      gsap.fromTo('.gl-module',
        { opacity: 0, scale: 1.05, filter: 'blur(16px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .55, ease: 'power3.out' }
      )
      gsap.fromTo(['.gl-line-1', '.gl-line-2'],
        { y: 120, skewX: -18, opacity: 0 },
        { y: 0, skewX: 0, opacity: 1, stagger: .055, duration: .62, ease: 'power4.out' }
      )
      gsap.fromTo('.gl-hero-meta',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: .45, delay: .1, ease: 'power3.out' }
      )
      gsap.to('.gl-viewport', {
        filter: 'brightness(1) contrast(1) saturate(1)',
        duration: .45,
      })
      gsap.to('.gl-progress-fill', { scaleX: 0, duration: 0, delay: .05 })

    }, 250)
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="gl-root">

      {/* =====================================================
          CUSTOM CURSOR
      ===================================================== */}

      <div
        className="gl-cursor"
        style={{ transform: `translate(${cur.x - 4}px, ${cur.y - 4}px)` }}
      />
      <div
        className="gl-cursor-follower"
        style={{ transform: `translate(${fol.x - 22}px, ${fol.y - 22}px)` }}
      />

      {/* =====================================================
          BACKGROUND ELEMENTS
      ===================================================== */}

      <div className="gl-bg-noise"  aria-hidden="true" />
      <div className="gl-beam"      aria-hidden="true" />

      <div className="gl-particles" aria-hidden="true">
        {PARTICLES.map(([l, b, d, dur], i) => (
          <div
            key={i}
            className="gl-particle"
            style={{
              left:              `${l}%`,
              bottom:            `${b}px`,
              animationDelay:    `${d}s`,
              animationDuration: `${dur}s`,
            }}
          />
        ))}
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="gl-header">

        <BackBtn fixed={false} accentColor="var(--theme)" bg="var(--theme)" color="var(--dark)" />

        <div className="gl-header-c">
          <span className="gl-badge">05 · WEB EXPERIENCE · 2025</span>
          <span className="gl-header-title">TRIBUTO GL</span>
        </div>

        <div className="gl-ticker-wrap" aria-hidden="true">
          <div className="gl-ticker">{TICKER.repeat(6)}</div>
        </div>

        <span className="gl-type">HTML · CSS · JS</span>

      </header>

      {/* =====================================================
          PROGRESS BAR
      ===================================================== */}

      <div className="gl-progress" aria-hidden="true">
        <div className="gl-progress-fill" />
      </div>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="gl-layout">

        {/* ===================================================
            LEFT INFO
        =================================================== */}

        <div className="gl-info">

          {/* Section indicator dots */}
          <div className="gl-section-ind" aria-label="Secciones">
            {SECCIONES.map((_, i) => (
              <button
                key={i}
                className={`gl-ind-dot ${i === active ? 'gl-ind-on' : ''}`}
                onClick={() => activateSection(i)}
                aria-label={`Sección ${i + 1}`}
              />
            ))}
          </div>

          {/* Big title */}
          <div
            className={`gl-hero-titles ${glitch ? 'gl-glitch-on' : ''}`}
            ref={titleRef}
          >
            <div className="gl-line-wrap">
              <div className="gl-line-1">{CONTENT[active].title[0]}</div>
            </div>
            <div className="gl-line-wrap">
              <div className="gl-line-2">{CONTENT[active].title[1]}</div>
            </div>
          </div>

          {/* Meta block */}
          <div className="gl-hero-meta">

            <div className="gl-hero-sub">{CONTENT[active].sub}</div>
            <p   className="gl-hero-desc">{CONTENT[active].desc}</p>

            <div className="gl-hero-tags">
              {CONTENT[active].tags.map(t => (
                <span key={t} className="gl-tag">{t}</span>
              ))}
            </div>

            {/* Readout strip */}
            <div className="gl-readout">
              <div className="gl-readout-item">
                <span className="gl-readout-label">MODULE</span>
                <span className="gl-readout-val">
                  {String(active + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="gl-readout-divider" />
              <div className="gl-readout-item">
                <span className="gl-readout-label">STATUS</span>
                <span className="gl-readout-val gl-readout-live">LIVE</span>
              </div>
              <div className="gl-readout-divider" />
              <div className="gl-readout-item">
                <span className="gl-readout-label">ARCHIVE</span>
                <span className="gl-readout-val">GL-2025</span>
              </div>
            </div>

          </div>

        </div>

        {/* ===================================================
            CENTER VIEWPORT
        =================================================== */}

        <div className="gl-viewport">

          {/* Effects */}
          <div className="gl-scanlines"         aria-hidden="true" />
          <div className="gl-viewport-vignette" aria-hidden="true" />

          {/* HUD labels */}
          <div className="gl-hud gl-hud-tl">
            ACTIVE MODULE / {SECCIONES[active].label}
          </div>
          <div className="gl-hud gl-hud-tr">
            {String(active + 1).padStart(2, '0')} / 04
          </div>
          <div className="gl-hud gl-hud-bl">
            <span className="gl-hud-led" aria-hidden="true" />
            LIVE
          </div>
          <div className="gl-hud gl-hud-br">
            SYS·READY · GL-ARCHIVE
          </div>

          {/* Corner brackets */}
          <div className="gl-bracket gl-br-tl" aria-hidden="true" />
          <div className="gl-bracket gl-br-tr" aria-hidden="true" />
          <div className="gl-bracket gl-br-bl" aria-hidden="true" />
          <div className="gl-bracket gl-br-br" aria-hidden="true" />

          {/* Modules */}
          {active === 0 && (
            <div className="gl-module">
              <iframe src="/gurren/landing.html" title="Landing" className="gl-frame" />
            </div>
          )}
          {active === 1 && (
            <div className="gl-module">
              <iframe src="/gurren/gallery.html" title="Gallery" className="gl-frame" />
            </div>
          )}
          {active === 2 && (
            <div className="gl-module">
              <iframe src="/gurren/watch.html"   title="Watch"   className="gl-frame" />
            </div>
          )}
          {active === 3 && (
            <div className="gl-module">
              <iframe src="/gurren/manga.html"   title="Manga"   className="gl-frame" />
            </div>
          )}

        </div>

        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <div className="gl-sections-wrap">

          <div className="gl-sections-label">SITE MODULES</div>

          <div className="gl-panels">
            {SECCIONES.map((s, i) => (
              <div
                key={s.id}
                className={`gl-panel ${active === i ? 'gl-panel-on' : ''}`}
                onClick={() => activateSection(i)}
              >
                <div className="gl-panel-accent"   />
                <div className="gl-panel-scanline" aria-hidden="true" />
                <div className="gl-panel-id">{s.id}</div>
                <div className="gl-panel-label">{s.label}</div>
                {active === i && (
                  <div className="gl-panel-sub">{s.sub}</div>
                )}
              </div>
            ))}
          </div>

          {/* System status */}
          <div className="gl-sys-status">
            <div className="gl-sys-title">SYS STATUS</div>
            {SYS_BARS.map(([label, pct], i) => (
              <div key={label} className="gl-sys-row">
                <span className="gl-sys-label">{label}</span>
                <div className="gl-sys-track">
                  <div
                    className="gl-sys-fill"
                    style={{
                      width:          `${pct}%`,
                      animationDelay: `${i * 0.28}s`,
                    }}
                  />
                </div>
                <span className="gl-sys-val">{pct}%</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* =====================================================
          BOTTOM BAR / TICKER
      ===================================================== */}

      <div className="gl-bottom-bar" aria-hidden="true">
        <div className="gl-bottom-ticker-wrap">
          <div className="gl-bottom-ticker">{TICKER.repeat(8)}</div>
        </div>
      </div>

    </div>
  )
}
