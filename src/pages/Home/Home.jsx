import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Menu from '../../components/Menu/Menu.jsx'
import './Home.css'
import homeBg from '../../assets/mainMenu.webp'
import { audio } from '../../audio/AudioManager.js'

export default function Home() {
  const navigate = useNavigate()

  /* Soundtrack — mismo sistema que Projects y About.
     soundtrackEnter() no reinicia si ya está sonando,
     así que navegar entre estas tres páginas no corta la música.
     soundtrackLeave() solo lo llaman las páginas de proyecto al montarse. */
  useEffect(() => {
    const t = setTimeout(() => audio.soundtrackEnter(), 400)
    return () => clearTimeout(t)
  }, [])

  /* Touch swipe on home background → navigate to projects */
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      // swipe left → projects, swipe right → no-op (already at root)
      if (dx < 0) handleNavigate('projects')
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const handleNavigate = (page) => {
    audio.play('confirm')
    navigate(`/${page}`)
  }

  return (
    <div 
      className="screen home-screen"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        backgroundImage: `url(${homeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* overlay scanlines */}
      <div className="scanlines" aria-hidden="true" />

      {/* HUD: esquina superior izquierda */}
      <div className="home-hud-tl" aria-hidden="true">
        <span className="home-hud-item">EDICIÓN 01</span>
        <span className="home-hud-item">2026</span>
        <span className="home-hud-item home-hud-available">★ DISPONIBLE</span>
      </div>

      {/* HUD: esquina superior derecha */}
      <div className="home-hud-tr" aria-hidden="true">
        <span className="home-hud-item">VALLEDUPAR · COL</span>
        <span className="home-hud-item">DISEÑO · ILUSTRACIÓN · DEV</span>
      </div>

      {/* menú principal */}
      <Menu onNavigate={handleNavigate} />

      {/* decorativo — número de versión esquina inferior izquierda */}
      <div className="home-version" aria-hidden="true">
        <span>v1.0</span>
        <span>PORTFOLIO</span>
      </div>
    </div>
  )
}