import { motion } from 'framer-motion'
import './transitions.css'

/*
  PageTransition — sistema de overlays cinematográficos
  ──────────────────────────────────────────────────────────────────
  Este componente YA NO contiene su propio AnimatePresence.
  El control de entrada/salida de página es responsabilidad del
  AnimatePresence único en App.jsx.

  Aquí solo se definen los overlays (slash, about, vertical, home)
  que se animan en MOUNT (entrada) de cada página nueva.
  La salida de la página anterior es un simple fade manejado por App.
*/

/* ── Slash wipe (Projects y subpáginas) — diagonal panels left→right ── */
function SlashTransition() {
  const panels = [
    { color: '#FF5500', delay: 0    },
    { color: '#FF7A22', delay: 0.04 },
    { color: '#F4F1EA', delay: 0.08 },
  ]
  return panels.map((p, i) => (
    <motion.div key={i} className="trans-slash"
      style={{ background: p.color, zIndex: 999 - i }}
      initial={{ x: '-110%' }}
      animate={{ x: ['-110%', '0%', '0%', '110%'] }}
      transition={{ duration: .55, delay: p.delay, times: [0, .42, .58, 1], ease: [.76,0,.24,1] }}
    />
  ))
}

/* ── About transition — rotated panels burst ── */
function AboutTransition() {
  const panels = [
    { color: '#0B0B09', top: '-18vh', left: '-16vw', w: '90vw', delay: 0   },
    { color: '#FF5500', top:  '28vh', left: '-10vw', w: '74vw', delay: .05 },
    { color: '#F4F1EA', top:  '66vh', left: '-14vw', w: '84vw', delay: .1  },
  ]
  return panels.map((p, i) => (
    <motion.div key={i} className="trans-about"
      style={{ background: p.color, top: p.top, left: p.left, width: p.w, zIndex: 999 - i }}
      initial={{ x: -600, opacity: 1 }}
      animate={{ x: [-600, 24, 0], opacity: [1, 1, 0] }}
      transition={{ duration: .5, delay: p.delay, times: [0, .68, 1], ease: [.22,1,.36,1] }}
    />
  ))
}

/* ── Vertical stripes (Contact) ── */
function VerticalTransition() {
  const stripes = [
    { color: '#080806', left: '68vw', w: '28vw', delay: 0   },
    { color: '#FF5500', left: '78vw', w: '16vw', delay: .06 },
    { color: '#F4F1EA', left: '88vw', w:  '8vw', delay: .12 },
  ]
  return stripes.map((s, i) => (
    <motion.div key={i} className="trans-vert"
      style={{ background: s.color, left: s.left, width: s.w, zIndex: 999 - i }}
      initial={{ y: -1400 }}
      animate={{ y: [-1400, 0, 0, 1400] }}
      transition={{ duration: .58, delay: s.delay, times: [0,.4,.6,1], ease: [.76,0,.24,1] }}
    />
  ))
}

/* ── Default home — fast horizontal blocks ── */
function HomeTransition() {
  const blocks = ['#080806', '#FF5500', '#F4F1EA']
  return blocks.map((color, i) => (
    <motion.div key={i} className="trans-default"
      style={{ background: color, zIndex: 999 - i }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: [0, 1, 1, 0] }}
      transition={{ duration: .44, delay: i * .05, times: [0,.4,.6,1], ease: [.76,0,.24,1] }}
    />
  ))
}

function Overlay({ variant }) {
  if (variant === 'slash')    return <SlashTransition />
  if (variant === 'about')    return <AboutTransition />
  if (variant === 'vertical') return <VerticalTransition />
  return <HomeTransition />
}

export default function PageTransition({ children, variant = 'home' }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Overlay cinematográfico — corre en mount de la nueva página */}
      <Overlay variant={variant} />
      {/* Contenido — aparece con leve delay para dejar pasar el overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: .2, delay: .25 }}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </div>
  )
}
