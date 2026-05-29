import { useEffect, useRef, Suspense, lazy, useState, useCallback } from 'react'
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PageTransition from './components/Transition/PageTransition.jsx'
import { audio } from './audio/AudioManager.js'

/* ─── Code splitting — cada página se carga solo cuando se navega a ella ─── */
const Home        = lazy(() => import('./pages/Home/Home.jsx'))
const Projects    = lazy(() => import('./pages/Projects/Projects.jsx'))
const About       = lazy(() => import('./pages/About/About.jsx'))
const Canciones   = lazy(() => import('./pages/Canciones/Canciones.jsx'))
const PalmasIlu   = lazy(() => import('./pages/PalmasIlu/PalmasIlu.jsx'))
const PalmasWeb   = lazy(() => import('./pages/Palmasweb/PalmasWeb.jsx'))
const Exploracion = lazy(() => import('./pages/Exploracion/Exploracion.jsx'))
const TributoGL   = lazy(() => import('./pages/TributoGL/TributoGL.jsx'))
const Powerlifting= lazy(() => import('./pages/Powerlifting/Powerlifting.jsx'))

/*
  SISTEMA DE TRANSICIÓN — arquitectura unificada
  ────────────────────────────────────────────────────────────────────
  UN SOLO AnimatePresence (aquí, en la raíz) controla entrada/salida.
  motion.div key={pathname} → AnimatePresence detecta el cambio y:
    1. Ejecuta exit (opacity 0, 0.15s) en la página saliente
    2. Monta la nueva página (opacity 0 → 1)
    3. El Overlay de PageTransition (slash/about/vertical) corre en mount,
       cubriendo la transición con la estética cinematográfica.

  PageTransition ya NO tiene su propio AnimatePresence — evita el
  doble control que causaba race conditions y desmontajes conflictivos.
*/

/* ── Audio toggle — persiste entre rutas, visible en todas las páginas ── */
function AudioToggle() {
  const [enabled, setEnabled] = useState(true)

  const toggle = useCallback(() => {
    const next = !enabled
    audio.setEnabled(next)
    setEnabled(next)
  }, [enabled])

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? 'Silenciar audio' : 'Activar audio'}
      title={enabled ? 'Silenciar audio' : 'Activar audio'}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9990,
        width: '28px',
        height: '28px',
        background: 'transparent',
        border: '1px solid rgba(244,241,234,0.15)',
        color: enabled ? 'rgba(244,241,234,0.5)' : 'rgba(244,241,234,0.18)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        transition: 'border-color 0.2s, color 0.2s',
        outline: 'none',
      }}
    >
      {enabled ? '♪' : '✕'}
    </button>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const navigate  = useNavigate()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'linear' }}
      >
        {/* fallback null: sin spinner que rompa la estética, AnimatePresence
            en mode="wait" da tiempo suficiente al lazy load */}
        <Suspense fallback={null}>
          <Routes location={location}>
            <Route path="/" element={
              <PageTransition variant="home"><Home /></PageTransition>
            } />
            <Route path="/projects" element={
              <PageTransition variant="slash"><Projects /></PageTransition>
            } />
            <Route path="/projects/canciones" element={
              <PageTransition variant="slash">
                <Canciones onBack={() => navigate('/projects')} />
              </PageTransition>
            } />
            <Route path="/projects/palmas-ilu" element={
              <PageTransition variant="slash"><PalmasIlu /></PageTransition>
            } />
            <Route path="/projects/palmas-web" element={
              <PageTransition variant="slash"><PalmasWeb /></PageTransition>
            } />
            <Route path="/projects/exploracion" element={
              <PageTransition variant="slash"><Exploracion /></PageTransition>
            } />
            <Route path="/projects/tributo-gl" element={
              <PageTransition variant="slash"><TributoGL /></PageTransition>
            } />
            <Route path="/projects/powerlifting" element={
              <PageTransition variant="slash"><Powerlifting /></PageTransition>
            } />
            <Route path="/about" element={
              <PageTransition variant="about"><About /></PageTransition>
            } />
            {/* /contact redirige a Home — los links están ahora en el menú principal */}
            <Route path="/contact" element={<Navigate to="/" replace />} />
            {/* 404 — redirige a Home sin romper el historial */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const dot = document.createElement('div')
    dot.id = 'cursor-dot'
    document.body.appendChild(dot)
    cursorRef.current = dot

    const move = (e) => {
      dot.style.left = e.clientX + 'px'
      dot.style.top  = e.clientY + 'px'
    }

    const over = () => dot.classList.add('hovering')
    const out  = () => dot.classList.remove('hovering')

    const handleOver = (e) => {
      if (e.target.closest('a, button, [data-hover]')) over()
      else out()
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseover', handleOver)

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', handleOver)
      if (document.body.contains(dot)) document.body.removeChild(dot)
    }
  }, [])

  return (
    <>
      <AnimatedRoutes />
      <AudioToggle />
    </>
  )
}
