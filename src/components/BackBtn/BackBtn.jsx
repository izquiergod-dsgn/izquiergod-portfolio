import { useNavigate } from 'react-router-dom'
import { audio } from '../../audio/AudioManager.js'
import './BackBtn.css'

/**
 * BackBtn — botón de regreso sistémico
 * ─────────────────────────────────────────────────────────────────
 * Dos modos de posicionamiento:
 *   fixed=true  → position:fixed top:16px left:16px (páginas sin header)
 *   fixed=false → position:static, fluye en el flex del header padre
 *
 * Props:
 *   to          string   — ruta destino (default '/projects')
 *   label       string   — texto (default 'PROYECTOS')
 *   fixed       bool     — fixed vs inline (default true)
 *   accentColor string   — color del borde izq y flecha (default var(--or))
 *   bg          string   — background override
 *   color       string   — color del texto override
 *   onClick     fn       — override del click
 */
export default function BackBtn({
  to          = '/projects',
  label       = 'PROYECTOS',
  fixed       = true,
  accentColor,
  bg,
  color,
  onClick,
}) {
  const navigate = useNavigate()

  const handle = (e) => {
    e.preventDefault()
    audio.play('back')
    if (onClick) onClick()
    else navigate(to)
  }

  const style = {
    ...(accentColor && { '--sys-back-accent': accentColor }),
    ...(bg          && { '--sys-back-bg':     bg }),
    ...(color       && { '--sys-back-color':  color }),
  }

  return (
    <button
      className={`sys-back${fixed ? ' sys-back--fixed' : ' sys-back--inline'}`}
      style={Object.keys(style).length ? style : undefined}
      onClick={handle}
      data-hover
      aria-label={`Volver a ${label.toLowerCase()}`}
    >
      <span className="sys-back__arrow" aria-hidden="true">◄</span>
      <span className="sys-back__label">{label}</span>
    </button>
  )
}
