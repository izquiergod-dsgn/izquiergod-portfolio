import { useState, useEffect, useCallback } from 'react'
import './Menu.css'
import { audio } from '../../audio/AudioManager.js'

/*
  Menú principal — sistema Persona-like
  ──────────────────────────────────────────────────────────────
  ITEMS: rutas internas del portfolio (navegan con onNavigate)
  LINKS: destinos externos (Instagram, LinkedIn, Email)
         misma lógica visual, jerarquía levemente menor
*/

const ITEMS = [
  { id: 'projects', label: 'PROYECTOS', page: 'projects', fontSize: 92, offsetX: 0,  offsetY: 0,  skewX: -8,  skewY: 6  },
  { id: 'about',    label: 'SOBRE MÍ',  page: 'about',    fontSize: 76, offsetX: 22, offsetY: 6,  skewX: -13, skewY: -8 },
]

const LINKS = [
  { id: 'instagram', label: 'INSTAGRAM', href: 'https://www.instagram.com/izquier.god/', fontSize: 52, offsetX: 8,  offsetY: 4,  skewX: -5,  skewY: 4  },
  { id: 'linkedin',  label: 'LINKEDIN',  href: 'https://linkedin.com/in/luis-izquierdo-06a50b408', fontSize: 52, offsetX: 18, offsetY: 2,  skewX: -9,  skewY: -4 },
  { id: 'email',     label: 'EMAIL',     href: 'mailto:izquiergod@gmail.com',             fontSize: 52, offsetX: 12, offsetY: 3,  skewX: -4,  skewY: 6  },
]

const ALL = [
  ...ITEMS.map(i => ({ ...i, type: 'nav' })),
  ...LINKS.map(l => ({ ...l, type: 'link' })),
]

function clipTri(w, h) {
  return `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`
}

export default function Menu({ onNavigate }) {
  const [active, setActive]   = useState(0)
  const [mounted, setMounted] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const activate = useCallback((idx) => {
    if (idx === active) return
    audio.play('tick')
    setActive(idx)
    setAnimKey(k => k + 1)
  }, [active])

  const confirm = useCallback(() => {
    const item = ALL[active]
    audio.play('confirm')
    if (item.type === 'nav') {
      onNavigate?.(item.page)
    } else {
      window.open(item.href, '_blank', 'noopener noreferrer')
    }
  }, [active, onNavigate])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 900)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowUp')   activate(Math.max(0, active - 1))
      if (e.key === 'ArrowDown') activate(Math.min(ALL.length - 1, active + 1))
      if (e.key === 'Enter')     confirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, activate, confirm])

  const isLink = ALL[active]?.type === 'link'

  return (
    <div className="menu-overlay">

      {/* ghost de fondo */}
      <div className="menu-ghost" aria-hidden="true">
        {ALL[active].label}
      </div>

      {/* stripes derecha */}
      <div className="stripe-r"  aria-hidden="true" />
      <div className="stripe-r2" aria-hidden="true" />

      <nav className="menu-nav">
        {/* ── Ítems principales ── */}
        {ITEMS.map((item, i) => {
          const idx      = i
          const isActive = active === idx
          const dist     = Math.abs(idx - active)
          const opacity  = isActive ? 1 : Math.max(0.42, 1 - dist * 0.24)
          const estW     = item.label.length * item.fontSize * 0.56 + 80
          const estH     = item.fontSize * 0.94
          const clip     = clipTri(estW, estH)

          return (
            <a
              key={item.id}
              href="#"
              className={`menu-row${isActive ? ' active' : ''}${mounted ? ' mounted' : ''}`}
              style={{ marginRight: item.offsetX, marginTop: item.offsetY, transitionDelay: mounted ? `${i * 75}ms` : '0ms' }}
              onClick={(e) => { e.preventDefault(); audio.play('confirm'); onNavigate?.(item.page) }}
              onMouseEnter={() => activate(idx)}
              aria-current={isActive ? 'page' : undefined}
              data-hover
            >
              <div className="menu-glow" />
              <div className="menu-skew" style={{ transform: `skewX(${item.skewX}deg) skewY(${item.skewY}deg)` }}>
                <div
                  key={isActive ? `pop-${i}-${animKey}` : `idle-${i}`}
                  className={`menu-tri${isActive ? ' pop' : ''}`}
                  style={{ width: estW, height: estH, clipPath: clip }}
                />
                <div
                  className="menu-highlight"
                  style={{ width: estW, height: estH, clipPath: clip, transform: `translateY(-50%) scaleX(${isActive ? 1 : 0})` }}
                />
                <div className="menu-label-wrap" style={{ opacity }}>
                  <span className="menu-label menu-label-dark" style={{ fontSize: item.fontSize }}>{item.label}</span>
                  <span className="menu-label menu-label-bright" style={{ fontSize: item.fontSize, clipPath: clip }}>{item.label}</span>
                </div>
              </div>
            </a>
          )
        })}

        {/* ── Separador ── */}
        <div className={`menu-sep${mounted ? ' mounted' : ''}`} aria-hidden="true" />

        {/* ── Links externos — misma mecánica, escala menor ── */}
        {LINKS.map((link, li) => {
          const idx      = ITEMS.length + li
          const isActive = active === idx
          const dist     = Math.abs(idx - active)
          const opacity  = isActive ? 1 : Math.max(0.32, 1 - dist * 0.22)
          const estW     = link.label.length * link.fontSize * 0.56 + 60
          const estH     = link.fontSize * 0.94
          const clip     = clipTri(estW, estH)
          const delay    = (ITEMS.length + li) * 75

          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`menu-row menu-row--link${isActive ? ' active' : ''}${mounted ? ' mounted' : ''}`}
              style={{ marginRight: link.offsetX, marginTop: link.offsetY, transitionDelay: mounted ? `${delay}ms` : '0ms' }}
              onClick={() => audio.play('confirm')}
              onMouseEnter={() => activate(idx)}
              data-hover
            >
              <div className="menu-glow menu-glow--link" />
              <div className="menu-skew" style={{ transform: `skewX(${link.skewX}deg) skewY(${link.skewY}deg)` }}>
                <div
                  key={isActive ? `pop-link-${li}-${animKey}` : `idle-link-${li}`}
                  className={`menu-tri menu-tri--link${isActive ? ' pop' : ''}`}
                  style={{ width: estW, height: estH, clipPath: clip }}
                />
                <div
                  className="menu-highlight"
                  style={{ width: estW, height: estH, clipPath: clip, transform: `translateY(-50%) scaleX(${isActive ? 1 : 0})` }}
                />
                <div className="menu-label-wrap" style={{ opacity }}>
                  <span className="menu-label menu-label-dark menu-label--link" style={{ fontSize: link.fontSize }}>{link.label}</span>
                  <span className="menu-label menu-label-bright" style={{ fontSize: link.fontSize, clipPath: clip }}>{link.label}</span>
                </div>
              </div>
              {/* indicador externo — símbolo discret */}
              {isActive && <span className="menu-ext-badge" aria-hidden="true">↗</span>}
            </a>
          )
        })}
      </nav>

      {/* hints teclado */}
      <div className={`hints${mounted ? ' visible' : ''}`}>
        <div className="hints-row"><span className="hints-key">↑↓</span><span>NAVEGAR</span></div>
        <div className="hints-row"><span className="hints-key">↵</span><span>{isLink ? 'ABRIR' : 'ENTRAR'}</span></div>
      </div>
    </div>
  )
}
