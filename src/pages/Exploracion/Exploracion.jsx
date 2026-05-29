import React, { useState, useEffect, useRef, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import './Exploracion.css'

import supermanCutout from '../../assets/exploracion/superman.png'
import redrawCutout   from '../../assets/exploracion/redraw.png'
import superman1      from '../../assets/exploracion/superman1.webp'
import redraw1        from '../../assets/exploracion/redraw1.webp'

/* ── Panel images por capítulo ───────────────────────
   Superman: bocetos / proceso de la ilustración de Superman
   Redraw:   bocetos / proceso de la ilustración de Redraw
   Reemplaza estos paths con tus archivos reales.
   ──────────────────────────────────────────────────── */
import sPanel1 from '../../assets/exploracion/s-proceso-01.webp'
import sPanel2 from '../../assets/exploracion/s-proceso-02.webp'
import sPanel3 from '../../assets/exploracion/s-proceso-03.webp'
import rPanel1 from '../../assets/exploracion/r-proceso-01.webp'
import rPanel2 from '../../assets/exploracion/r-proceso-02.webp'
import rPanel3 from '../../assets/exploracion/r-proceso-03.webp'
import { audio } from '../../audio/AudioManager.js'
import BackBtn from '../../components/BackBtn/BackBtn.jsx'

const lerp = (a, b, t) => a + (b - a) * t

/* ── Grain canvas ── */
function useGrain() {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const c = document.createElement('canvas')
    c.width = 200; c.height = 200
    const ctx = c.getContext('2d')
    const id  = ctx.createImageData(200, 200)
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 255
      id.data[i] = id.data[i+1] = id.data[i+2] = v
      id.data[i+3] = Math.random() * 20 + 4
    }
    ctx.putImageData(id, 0, 0)
    setUrl(c.toDataURL())
  }, [])
  return url
}

/* ── Dust particles — memoized, mounts once ── */
const DustCanvas = memo(() => {
  const cvs = useRef(null)
  useEffect(() => {
    const c = cvs.current; if (!c) return
    c.width  = window.innerWidth
    c.height = window.innerHeight
    const ctx = c.getContext('2d')
    const W = c.width, H = c.height
    const pts = Array.from({ length: 26 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.2,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.2 - 0.04,
      a: Math.random() * 0.08 + 0.015,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      pts.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.a})`
        ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W }
        if (p.x < -4) p.x = W + 4
        if (p.x > W + 4) p.x = -4
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={cvs} className="ex-dust" />
})

/* ── RevealChar — cursor rasca la capa editorial ── */
function RevealChar({ src, onClick }) {
  const box    = useRef(null)
  const over   = useRef(null)
  const target = useRef({ x: 0, y: 0 })
  const cur    = useRef({ x: 0, y: 0 })
  const live   = useRef(false)

  useEffect(() => {
    live.current = false
    if (over.current) {
      over.current.style.maskImage = ''
      over.current.style.webkitMaskImage = ''
    }
  }, [src])

  useEffect(() => {
    let raf
    const tick = () => {
      cur.current.x = lerp(cur.current.x, target.current.x, 0.09)
      cur.current.y = lerp(cur.current.y, target.current.y, 0.09)
      if (over.current && live.current) {
        const { x, y } = cur.current
        const m = `radial-gradient(circle 162px at ${x}px ${y}px,
          transparent 0%, transparent 36%,
          rgba(0,0,0,0.52) 62%, black 82%)`
        over.current.style.maskImage       = m
        over.current.style.webkitMaskImage = m
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={box} className="ex-char"
      onMouseMove={e => {
        const r = box.current?.getBoundingClientRect()
        if (r) target.current = { x: e.clientX - r.left, y: e.clientY - r.top }
      }}
      onMouseEnter={() => { live.current = true }}
      onMouseLeave={() => {
        live.current = false
        if (over.current) {
          over.current.style.maskImage = ''
          over.current.style.webkitMaskImage = ''
        }
      }}
      onClick={onClick}
    >
      <img src={src} className="ex-char-color" alt="" draggable={false} />
      <div ref={over} className="ex-char-editorial" style={{ backgroundImage: `url(${src})` }} />
      {/* RGB ghost layers — print misalignment effect */}
      <div className="ex-char-ghost-r" style={{ backgroundImage: `url(${src})` }} />
      <div className="ex-char-ghost-b" style={{ backgroundImage: `url(${src})` }} />
      <div className="ex-char-ht" />
    </div>
  )
}

/* ── Top bar content per chapter ── */
const TOP_S = ['TO','PROTECT','JUSTICE','AND','PEACE','—','スーパーマン','—','HAS','RETURNED']
const TOP_R = ['RECONSTRUCTION','—','MEMORY','—','IDENTITY','—','再描画','—','SEGUNDO CAPÍTULO']

/* ─────────────────────────────────────────────────────
   ESTADOS:
   null   → superman editorial
   'rd'   → redraw editorial
   'fs-s' → fullscreen superman1
   'fs-r' → fullscreen redraw1
   ───────────────────────────────────────────────────── */
export default function Exploracion() {
  /* Silenciar soundtrack al entrar a una sección de proyecto */
  useEffect(() => {
    audio.soundtrackLeave()
    return () => audio.soundtrackEnter()  // restaurar al salir (back to menu)
  }, [])

  const navigate = useNavigate()
  const grain    = useGrain()

  const [st,        setSt]    = useState(null)
  const [transiting, setTr]   = useState(false)  /* wipe animation active */
  const [entering,   setEn]   = useState(false)  /* content reconstruction */
  const [topKey,     setTopK] = useState(0)       /* remounts top words on change */

  const isFsS   = st === 'fs-s'
  const isFsR   = st === 'fs-r'
  const isFs    = isFsS || isFsR
  const isRdCtx = st === 'rd' || st === 'fs-r'

  /* ── JP parallax RAF ── */
  const jpRef   = useRef(null)
  const mouseP  = useRef({ x: 0, y: 0 })
  const smoothP = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = e => {
      mouseP.current = {
        x: e.clientX / window.innerWidth  - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      }
    }
    window.addEventListener('mousemove', onMove)
    let raf
    const tick = () => {
      smoothP.current.x = lerp(smoothP.current.x, mouseP.current.x, 0.04)
      smoothP.current.y = lerp(smoothP.current.y, mouseP.current.y, 0.04)
      if (jpRef.current) {
        const tx = smoothP.current.x * 42
        const ty = smoothP.current.y * 26
        jpRef.current.style.transform = `translate(${tx}px, ${ty}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  /* ── Cinematic chapter switch ── */
  const switchTo = (newSt) => {
    if (transiting || newSt === st) return
    setTr(true)
    // midpoint: change content behind the wipe bar
    const t1 = setTimeout(() => {
      setSt(newSt)
      setTopK(k => k + 1)
      setEn(true)
      setTimeout(() => setEn(false), 750)
      setTimeout(() => setTr(false), 900)
    }, 440)
    return () => clearTimeout(t1)
  }

  /* ── ESC ── */
  useEffect(() => {
    const fn = e => {
      if (e.key !== 'Escape') return
      if (isFsS)              { audio.play('close'); setSt(null) }
      else if (isFsR)         { audio.play('close'); setSt('rd') }
      else if (st === 'rd')   switchTo(null)
      else                    { audio.play('back'); navigate(-1) }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [st, transiting, navigate])

  /* ── Panel images según capítulo ── */
  const panelData = isRdCtx
    ? [
        ['IDEA / IMG_01', 'PROCESO CREATIVO', rPanel1],
        ['1ST SKETCH',    'PRIMER BOCETO',    rPanel2],
        ['2ND SKETCH',    'EXPLORACIÓN',      rPanel3],
      ]
    : [
        ['IDEA / IMG_01', 'PROCESO CREATIVO', sPanel1],
        ['1ST SKETCH',    'PRIMER BOCETO',    sPanel2],
        ['2ND SKETCH',    'EXPLORACIÓN',      sPanel3],
      ]

  /* ── Computed content ── */
  const centerSrc  = isRdCtx ? redrawCutout : supermanCutout
  const rightSrc   = isRdCtx ? superman1    : redraw1
  const fsSrc      = isRdCtx ? redraw1      : superman1
  const titleEn    = isRdCtx ? 'REDRAW'    : 'SUPERMAN'
  const titleJp    = isRdCtx ? '再描画'    : 'スーパーマン'
  const chapterLbl = isRdCtx ? 'CAPÍTULO 02 — REDRAW' : 'CAPÍTULO 01 — SUPERMAN'
  const captionTxt = isRdCtx
    ? 'Estudio de personaje y lenguaje visual expandido. Ilustración digital de alta fidelidad. Segundo capítulo editorial.'
    : 'Exploración del arquetipo heroico contemporáneo desde una perspectiva de diseño editorial experimental.'
  const rightVlabel = isRdCtx ? 'SUPERMAN / スーパーマン' : 'REDRAW / 再描画'
  const rightHint   = isRdCtx ? '◄ SUPERMAN' : 'REDRAW ►'
  const topWords    = isRdCtx ? TOP_R : TOP_S

  const rootCls = [
    'ex-root',
    isRdCtx   ? 's-rd'      : '',
    isFs      ? 's-fs'      : '',
    transiting ? 's-transit' : '',
    entering   ? 's-enter'   : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={rootCls}>

      {grain && <div className="ex-grain" style={{ backgroundImage: `url(${grain})` }} />}
      <DustCanvas />

      {/* SVG RGB-split filter (used via .s-transit) */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="ex-rgb">
            <feColorMatrix in="SourceGraphic" type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
            <feOffset dx="5" dy="0" in="r" result="r2"/>
            <feColorMatrix in="SourceGraphic" type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
            <feOffset dx="-5" dy="0" in="b" result="b2"/>
            <feMerge>
              <feMergeNode in="r2"/>
              <feMergeNode in="SourceGraphic"/>
              <feMergeNode in="b2"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* ── TOP BAR ── */}
      <header className="ex-topbar">
        <BackBtn fixed={false} />
        <div className="ex-top-words" key={topKey}>
          {topWords.map((t, i) => (
            <span key={i} className="ex-top-word"
              style={{ animationDelay: `${i * 0.045}s` }}>{t}</span>
          ))}
        </div>
      </header>

      {/* ── SPREAD ── */}
      <div className="ex-spread">

        {/* Wipe bar — covers spread during chapter switch */}
        <div className="ex-transit-bar" aria-hidden />

        {/* COLUMNA IZQUIERDA */}
        <div className="ex-left">
          {panelData.map(([lbl, vlbl, img], i) => (
            <div key={i} className="ex-panel-row">
              <div className="ex-panel">
                <span className="ex-panel-label">{lbl}</span>
                {img
                  ? <img src={img} className="ex-panel-img" alt="" draggable={false} />
                  : <span className="ex-panel-num">0{i + 1}</span>
                }
              </div>
              <span className="ex-panel-vlabel">{vlbl}</span>
            </div>
          ))}
        </div>

        {/* COLUMNA CENTRAL */}
        <div className="ex-center">
          <div className="ex-ht"  aria-hidden />
          <div className="ex-scl" aria-hidden />
          <div className="ex-vig" aria-hidden />

          <div className="ex-title-eyebrow">ILUSTRACIÓN EDITORIAL</div>
          <div className="ex-title-main">{titleEn}</div>

          {/* JP — transform controlled by parallax RAF */}
          <div ref={jpRef} className="ex-title-jp" aria-hidden>{titleJp}</div>

          <div className="ex-textblock">
            <span className="ex-text-rule" aria-hidden />
            {captionTxt}
          </div>

          <div className="ex-infocard">
            <div className="ex-info-jp">{titleJp}</div>
            <div className="ex-info-detail">
              N° 04 — 2024<br />
              ILU. EDITORIAL · DIGITAL<br />
              PROYECTO PERSONAL
            </div>
          </div>

          <div className="ex-chapter">{chapterLbl}</div>

          <svg className="ex-ann" viewBox="0 0 500 600"
            preserveAspectRatio="none" aria-hidden>
            <line x1="18" y1="118" x2="80" y2="106"
              stroke="currentColor" strokeWidth="1.2" opacity="0.2"/>
            <line x1="18" y1="122" x2="18" y2="162"
              stroke="currentColor" strokeWidth="0.8" opacity="0.16"/>
            <path d="M418 448 Q430 442 434 456 Q438 466 425 468"
              stroke="currentColor" strokeWidth="1" fill="none" opacity="0.18"/>
          </svg>
        </div>

        {/* PERSONAJE — invade izquierda, reveal por cursor */}
        <RevealChar
          src={centerSrc}
          onClick={() => { if (!transiting) { audio.play('open'); setSt(isRdCtx ? 'fs-r' : 'fs-s') } }}
        />

        {/* PANEL DERECHO — click cambia capítulo */}
        <div className="ex-right"
          onClick={() => switchTo(isRdCtx ? null : 'rd')}>
          <img className="ex-right-img" src={rightSrc} alt="" draggable={false} />
          <div className="ex-right-ht" aria-hidden />
          <div className="ex-right-hint">{rightHint}</div>
          <span className="ex-right-vlabel">{rightVlabel}</span>
        </div>

        {/* FULLSCREEN — obra completa sin filtros */}
        <div className="ex-fullscreen"
          onClick={() => setSt(isFsR ? 'rd' : null)}>
          <div className="ex-fs-label">
            {isFsR ? 'REDRAW — OBRA COMPLETA' : 'SUPERMAN — OBRA COMPLETA'}
          </div>
          <img className="ex-fs-img" src={fsSrc} alt="" />
          <button className="ex-fs-close"
            onClick={e => { e.stopPropagation(); setSt(isFsR ? 'rd' : null) }}>
            [ CERRAR ]
          </button>
        </div>

      </div>{/* /spread */}

      {/* BARRA INFERIOR */}
      <div className="ex-bottombar">
        <span>PROYECTO N°04</span>
        <span>{titleEn} / {titleJp}</span>
        <span>ILUSTRACIÓN EDITORIAL</span>
        <span>2024</span>
        <span>DISEÑO: IZQ.</span>
      </div>

    </div>
  )
}
