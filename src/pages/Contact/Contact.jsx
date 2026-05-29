import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../../audio/AudioManager.js'
import './Contact.css'

const LINKS = [
  { id: 'email',     label: 'EMAIL',     value: 'izquiergod@gmail.com', href: 'mailto:izquiergod@gmail.com' },
  { id: 'instagram', label: 'INSTAGRAM', value: '@izquier.god',        href: 'https://www.instagram.com/izquier.god/' },
  { id: 'behance',   label: 'BEHANCE',   value: 'Luis Izquierdo',         href: 'https://behance.net/luisizquierdo7' },
  { id: 'linkedin',  label: 'LINKEDIN',  value: 'Luis Izquierdo',         href: 'https://linkedin.com/in/luis-izquierdo-06a50b408' },
]

export default function Contact() {
  const [active, setActive]   = useState(0)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowUp')   { audio.play('tick'); setActive(i => Math.max(0, i - 1)) }
      if (e.key === 'ArrowDown') { audio.play('tick'); setActive(i => Math.min(LINKS.length - 1, i + 1)) }
      if (e.key === 'Enter') { audio.play('confirm'); window.open(LINKS[active].href, '_blank') }
      if (e.key === 'Escape' || e.key === 'Backspace') { audio.play('back'); navigate(-1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, navigate])

  return (
    <div className="screen contact-screen">

      {/* fondo — halftone + scanlines sobre rojo */}
      <div className="contact-bg" />
      <div className="scanlines"  aria-hidden="true" />
      <div className="halftone"   aria-hidden="true" />

      {/* header */}
      <div className="contact-header">
        <button className="contact-back" onClick={() => { audio.play('back'); navigate(-1) }} data-hover>◄ VOLVER</button>
        <span className="contact-header-t">INICIAR MISIÓN</span>
      </div>

      {/* ghost de fondo masivo */}
      <div className="contact-ghost" aria-hidden="true">
        CONTACTO
      </div>

      {/* título principal */}
      <div className="contact-title">
        <span>TRABAJE-</span>
        <span>MOS</span>
        <span className="ct-outline">JUNTOS.</span>
      </div>

      {/* menú P5 apilado */}
      <nav className="contact-menu" aria-label="Contacto">
        {LINKS.map((link, i) => {
          const isActive = active === i
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank" rel="noopener noreferrer"
              className={`ct-item${isActive ? ' active' : ''}${mounted ? ' mounted' : ''}`}
              style={{ transitionDelay: mounted ? `${i * 60}ms` : '0ms' }}
              onMouseEnter={() => setActive(i)}
              data-hover
            >
              <span className="ct-bul" aria-hidden="true">★</span>
              <span className="ct-label">{link.label}</span>
              <span className="ct-val">{link.value}</span>
              <span className="ct-arr" aria-hidden="true">→</span>
            </a>
          )
        })}
      </nav>

      {/* footer */}
      <div className="contact-footer">
        <span>© 2026 LUIS IZQUIERDO</span>
        <span className="ct-ft-joke">ESTO TOMÓ DEMASIADAS NOCHES ✦ PROCEED ANYWAY</span>
      </div>

      {/* hints */}
      <div className={`hints${mounted ? ' visible' : ''}`}>
        <div className="hints-row"><span className="hints-key">↑↓</span><span>SELECCIONAR</span></div>
        <div className="hints-row"><span className="hints-key">↵</span><span>ABRIR</span></div>
        <div className="hints-row"><span className="hints-key">ESC</span><span>VOLVER</span></div>
      </div>

      <div className="stripe-r"  aria-hidden="true" />
      <div className="stripe-r2" aria-hidden="true" />
    </div>
  )
}
