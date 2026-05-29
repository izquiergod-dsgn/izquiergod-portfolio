import { useState, useEffect, useRef, useCallback } from 'react'
import { audio } from '../../audio/AudioManager.js'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { PROJECTS } from '../../data/projects.js'
import './Projects.css'

/*
  import.meta.glob con eager:true + import:'default' →
  Vite genera URLs hasheadas en build time para cada imagen.
  La clave es la ruta relativa exacta al glob, que coincide con
  `../../assets/projects/${proj.id}.webp` en render.
*/
const projectImgs = import.meta.glob(
  '../../assets/projects/*.webp',
  { eager: true, import: 'default' }
)

/*
  ROTACIÓN: aplicada por CSS nth-child, no por inline style.
  GSAP solo anima x/opacity en la entrada y no toca transform,
  así que la rotación CSS nunca se pierde.

  TECLADO: useCallback con dependencia en `active` evita el stale closure.
*/

function tri(w, h) {
  return `polygon(0 0, ${w}px ${h * .5}px, 0 ${h}px)`
}

export default function Projects() {
  /* Soundtrack — se mantiene vivo al navegar entre Home/Projects/About */
  useEffect(() => {
    audio.soundtrackEnter()
    return () => {
      /* Solo para cuando se va a una sección fuera del trio de menú */
      /* soundtrackLeave se llama desde las otras páginas en su cleanup */
    }
  }, [])

  const [active, setActive]   = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [glitch, setGlitch]   = useState(false)
  const [ready, setReady]     = useState(false)
  const navigate              = useNavigate()
  const rowRefs               = useRef([])

  /* Entrada: GSAP solo anima x y opacity — NO toca transform */
  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true)
      rowRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(el,
          { x: -80, opacity: 0 },
          { x: 0, opacity: 1, duration: .48, delay: i * .07,
            ease: 'power3.out',
            clearProps: 'x'   /* limpia la propiedad x después para no interferir */ }
        )
      })
    }, 80)
    return () => clearTimeout(t)
  }, [])

  /* go: useCallback con active como dependencia → sin stale closure */
  const go = useCallback((idx) => {
    if (idx === active) return
    audio.play('whoosh')
    setActive(idx)
    setAnimKey(k => k + 1)
    setGlitch(true)
    setTimeout(() => setGlitch(false), 220)
  }, [active])

  /* Touch swipe: navegar entre proyectos (mobile only) */
  const touchStartX = useRef(null)
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) {
      if (dx < 0) go(Math.min(PROJECTS.length - 1, active + 1))
      else         go(Math.max(0, active - 1))
    }
    touchStartX.current = null
  }, [active, go])

  /* Teclado: re-registra cuando active o go cambian */
  useEffect(() => {
    const fn = e => {
      if (e.key === 'ArrowUp')   go(Math.max(0, active - 1))
      if (e.key === 'ArrowDown') go(Math.min(PROJECTS.length - 1, active + 1))
      if (e.key === 'Enter' && PROJECTS[active].route) { audio.play('confirm'); navigate(PROJECTS[active].route) }
      if (e.key === 'Escape') { audio.play('back'); navigate('/') }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, go, navigate])

  const proj = PROJECTS[active]
  const N    = PROJECTS.length

  return (
    <div className="ps-root">

      <header className="ps-head">
        <button className="ps-back" onClick={() => { audio.play('back'); navigate('/') }} data-hover>INICIO</button>
        <div className="ps-head-c">
          <span className="ps-head-lbl">★ PROYECTOS</span>
          <div className="ps-prog">
            <div className="ps-prog-f"
              style={{ width:`${(active+1)/N*100}%`, background: proj.acento }}/>
          </div>
        </div>
        <span className="ps-idx">
          {String(active+1).padStart(2,'0')}<em>/</em>{N}
        </span>
      </header>

      <div className="ps-body">

        {/* ════ LEFT ════ */}
        <nav className="ps-left">
          <div className="ps-bgn" style={{ color: proj.acento + '0e' }}>{proj.num}</div>

          <div className="ps-stack">
            {PROJECTS.map((p, i) => {
              const isActive = active === i
              const dist     = Math.abs(i - active)
              const center   = (N - 1) / 2

              /* Arco: parábola horizontal */
              const t    = (i - center) / center
              const arcX = Math.round(80 * t * t)

              /* Tamaño: activo domina */
              const fs = isActive
                ? p.fontSize
                : Math.max(26, p.fontSize * Math.max(0.33, 1 - dist * 0.2))

              const op = isActive ? 1 : Math.max(0.22, 1 - dist * 0.22)

              /* Triángulo P3 */
              const triW = Math.round(p.label.length * fs * 0.54 + 70)
              const triH = Math.round(fs * 0.94)
              const clip = tri(triW, triH)

              return (
                <div
                  key={p.id}
                  ref={el => rowRefs.current[i] = el}
                  /* data-idx → CSS nth-child aplica la rotación */
                  className={`pi-row pi-row-${i}${isActive ? ' pi-on' : ''}`}
                  style={{
                    marginLeft: arcX,
                    '--ac':     p.acento,
                  }}
                  onClick={() => { if (isActive && p.route) { audio.play('confirm'); navigate(p.route) } else go(i) }}
                  onMouseEnter={() => go(i)}
                  data-hover
                >
                  <div className="pi-glow" />

                  {/* Triángulo P3 pop */}
                  <div
                    key={isActive ? `tri-${i}-${animKey}` : `tri-idle-${i}`}
                    className={`pi-tri${isActive ? ' pi-tri-pop' : ''}`}
                    style={{ width: triW, height: triH, clipPath: clip, background: p.acento }}
                  />

                  {/* Highlight blanco */}
                  <div className="pi-hl"
                    style={{
                      width: triW, height: triH, clipPath: clip,
                      transform: `translateY(-50%) scaleX(${isActive ? 1 : 0})`,
                    }}
                  />

                  <div className="pi-labels" style={{ opacity: op }}>
                    <span className="pi-num"
                      style={{ color: isActive ? p.acento : 'rgba(255,255,255,.22)' }}>
                      {isActive && <b>★ </b>}{p.num}
                    </span>

                    <div className="pi-textcol">
                      <span className="pi-name pi-name-dark" style={{
                        fontSize:         fs,
                        color:            isActive ? '#0d0200' : '#ffffff',
                        WebkitTextStroke: isActive ? '0px' : `1.5px ${p.acento}`,
                        paintOrder:       'stroke fill',
                      }}>
                        {p.label}
                      </span>

                      <span className="pi-name pi-name-bright"
                        style={{ fontSize: fs, clipPath: clip }}>
                        {p.label}
                      </span>

                      <span className="pi-sub" style={{
                        opacity: isActive ? .7 : Math.max(0, .35 - dist*.1)
                      }}>
                        {p.type} · {p.year}
                      </span>
                    </div>

                    {isActive && (
                      <span className="pi-arr" style={{ color: p.acento }}>
                        {p.route ? '→' : '○'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </nav>

        {/* ════ RIGHT ════ */}
        <div className={`ps-right${glitch ? ' ps-glitch' : ''}`}>
          <div className="pi-ph" style={{ background: proj.bg }}>
            {<img
              src={projectImgs[`../../assets/projects/${proj.id}.webp`] ?? ''}
              alt={proj.label}
              loading="lazy"
              decoding="async"
            />}
            <span className="pi-ph-g">{proj.label}</span>
          </div>
          <div className="pi-ov"/>
          <div className="pi-scn"/>

          <div className="pi-hud">
            <span className="pi-hud-d" style={{ background: proj.acento }}/>
          </div>

          <div className="pi-info">
            <div className="pi-iline" style={{ background: proj.acento }}/>
            <h2 className="pi-ittl" style={{ color: proj.acento }}>{proj.label}</h2>
            <div className="pi-imeta">
              <span>{proj.type}</span>
              <span className="pi-iyr"
                style={{ borderColor: proj.acento, color: proj.acento }}>{proj.year}</span>
            </div>
            <p className="pi-idesc">{proj.desc}</p>
            <div className="pi-itags">
              {proj.tags.map(t=><span key={t} className="pi-itag">{t}</span>)}
            </div>
            <button className="pi-icta"
              style={{
                background: proj.route ? proj.acento : 'transparent',
                color:      proj.route ? '#080806' : 'rgba(255,255,255,.3)',
                border:     proj.route ? 'none' : '1px solid rgba(255,255,255,.15)',
              }}
              onClick={() => proj.route && navigate(proj.route)}>
              {proj.route ? '★ ABRIR PROYECTO' : '★ EN CONSTRUCCIÓN'}
            </button>
          </div>

          <div className="pi-coords">
            <span>X {(active*128.4+44.2).toFixed(1)}</span>
            <span>Y {(active*76.3+22.8).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="ps-st">
        <span className="ps-std" style={{ background: proj.acento }}/>
        <span>ACTIVE · {proj.id.toUpperCase()}</span>
      </div>

      <div className={`ps-hints${ready ? ' ps-hon' : ''}`}>
        <div className="ps-hr"><kbd>↑↓</kbd><span>NAVEGAR</span></div>
        <div className="ps-hr"><kbd>↵</kbd><span>ABRIR</span></div>
        <div className="ps-hr"><kbd>ESC</kbd><span>VOLVER</span></div>
      </div>
    </div>
  )
}
