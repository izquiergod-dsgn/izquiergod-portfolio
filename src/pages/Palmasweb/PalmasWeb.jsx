/**
 * PalmasWeb.jsx — Flipbook con react-pageflip
 * Instalar: npm install react-pageflip --legacy-peer-deps
 *
 * IMÁGENES: cada <img> referencia un archivo en src/assets/palmasweb/.
 * Para reemplazar una imagen, simplemente sustituye el archivo en esa
 * carpeta por tu imagen definitiva manteniendo el mismo nombre.
 *
 * Los comentarios type/size encima de cada <img> indican qué debería ir.
 */
import React, {
  useState, useEffect, useRef, useCallback, forwardRef
} from 'react'
import HTMLFlipBook from 'react-pageflip'
import { useNavigate } from 'react-router-dom'
import './PalmasWeb.css'
import { audio } from '../../audio/AudioManager.js'
import BackBtn from '../../components/BackBtn/BackBtn.jsx'

// ── Importaciones de imágenes (Vite hashea en build) ─────────
import imgPortada         from '../../assets/palmasweb/portada.webp'
import imgAperturaLogo    from '../../assets/palmasweb/apertura-logo.webp'
import imgAperturaCosecha from '../../assets/palmasweb/apertura-cosecha.webp'
import imgAperturaManos   from '../../assets/palmasweb/apertura-manos.webp'
import imgAperturaRetrato from '../../assets/palmasweb/apertura-retrato.webp'
import imgScreenHomepage  from '../../assets/palmasweb/screen-homepage.webp'
import imgScreenDetalle1  from '../../assets/palmasweb/screen-detalle-1.webp'
import imgFotoPrincipal   from '../../assets/palmasweb/foto-principal.png'
import imgGrid01          from '../../assets/palmasweb/grid-01.webp'
import imgGrid02          from '../../assets/palmasweb/grid-02.webp'
import imgGrid03          from '../../assets/palmasweb/grid-03.webp'
import imgGrid04          from '../../assets/palmasweb/grid-04.webp'
import imgFilmA01         from '../../assets/palmasweb/film-a-01.webp'
import imgFilmA02         from '../../assets/palmasweb/film-a-02.webp'
import imgFilmA03         from '../../assets/palmasweb/film-a-03.webp'
import imgFilmA04         from '../../assets/palmasweb/film-a-04.webp'
import imgFilmA05         from '../../assets/palmasweb/film-a-05.webp'
import imgFilmA06         from '../../assets/palmasweb/film-a-06.webp'
import imgFilmA07         from '../../assets/palmasweb/film-a-07.webp'
import imgFilmA08         from '../../assets/palmasweb/film-a-08.webp'
import imgFilmA09         from '../../assets/palmasweb/film-a-09.webp'
import imgFilmB10         from '../../assets/palmasweb/film-b-10.webp'
import imgFilmB11         from '../../assets/palmasweb/film-b-11.webp'
import imgFilmB12         from '../../assets/palmasweb/film-b-12.webp'
import imgFilmB13         from '../../assets/palmasweb/film-b-13.webp'
import imgFilmB14         from '../../assets/palmasweb/film-b-14.webp'
import imgFilmB15         from '../../assets/palmasweb/film-b-15.webp'
import imgFilmB16         from '../../assets/palmasweb/film-b-16.webp'
import imgFilmB17         from '../../assets/palmasweb/film-b-17.webp'
import imgFilmB18         from '../../assets/palmasweb/film-b-18.webp'
import imgManifiestoIzq   from '../../assets/palmasweb/manifiesto-izq.webp'
import imgManifeistoDer   from '../../assets/palmasweb/manifiesto-der.webp'
import imgBocetoMapa      from '../../assets/palmasweb/boceto-mapa.webp'
import imgBocetoWeb       from '../../assets/palmasweb/boceto-web.webp'
import imgBocetoFanzine   from '../../assets/palmasweb/boceto-fanzine.webp'
import imgBocetoVideo     from '../../assets/palmasweb/boceto-video.webp'
import imgProcesoTaller   from '../../assets/palmasweb/proceso-taller.webp'
import imgProcesoBoceto   from '../../assets/palmasweb/proceso-boceto.webp'
import imgProcesoNotas    from '../../assets/palmasweb/proceso-notas.webp'
import imgCollageDoc      from '../../assets/palmasweb/collage-doc.png'
import imgCollageTaller   from '../../assets/palmasweb/collage-taller.webp'
import imgCollageFanzine  from '../../assets/palmasweb/collage-fanzine.webp'
import imgCollageDetalle  from '../../assets/palmasweb/collage-detalle.png'
import imgGrupoPrincipal  from '../../assets/palmasweb/grupo-principal.webp'
import imgGrupoImpreso    from '../../assets/palmasweb/grupo-impreso.webp'
import imgGrupoCollage    from '../../assets/palmasweb/grupo-collage.png'
import imgPanoramicaIzq   from '../../assets/palmasweb/panoramica-izq.webp'
import imgPanoramicaDer   from '../../assets/palmasweb/panoramica-der.webp'
import imgArchivoScanPrin from '../../assets/palmasweb/archivo-scan-principal.png'
import imgArchivoScan2    from '../../assets/palmasweb/archivo-scan-2.png'
import imgArchivoScan3    from '../../assets/palmasweb/archivo-scan-3.png'
import imgContraPortada   from '../../assets/palmasweb/contra-portada.webp'

// ─────────────────────────────────────────────────────────────
// WRAPPER DE PÁGINA — obligatorio forwardRef para react-pageflip
// ─────────────────────────────────────────────────────────────
const Page = forwardRef(({ children, isHard }, ref) => (
  <div
    className={`pw-page-wrap${isHard ? ' pw-page-hard' : ''}`}
    ref={ref}
  >
    {children}
  </div>
))
Page.displayName = 'Page'

// ─────────────────────────────────────────────────────────────
// TEXTO DE FONDO
// ─────────────────────────────────────────────────────────────
const BG_LINES = [
  ['NARRATIVAS', 'TRANSMEDIA'],
  ['PARA', 'LA', 'DIGNIFICACIÓN'],
  ['DEL', 'TRABAJO', 'PALMERO'],
]

// ─────────────────────────────────────────────────────────────
// CONTACT SHEET FRAMES — arrays para páginas 06 y 07
// ─────────────────────────────────────────────────────────────
const FILM_A = [imgFilmA01,imgFilmA02,imgFilmA03,imgFilmA04,imgFilmA05,imgFilmA06,imgFilmA07,imgFilmA08,imgFilmA09]
const FILM_B = [imgFilmB10,imgFilmB11,imgFilmB12,imgFilmB13,imgFilmB14,imgFilmB15,imgFilmB16,imgFilmB17,imgFilmB18]

// ─────────────────────────────────────────────────────────────
// CONTENIDO DE PÁGINAS (20 páginas → 10 spreads)
// ─────────────────────────────────────────────────────────────
const PAGE_CONTENT = [

  // 00 · PORTADA
  // Reemplazar: portada.webp — foto full bleed, zona palmera, atmósfera
  <div className="pw-pg pw-cvr" key="p00">
    <img src={imgPortada} alt="Portada" className="pw-img-fill"  loading="lazy" decoding="async" />
  </div>,

  // 01 · APERTURA
  <div className="pw-pg pw-padded pw-gap" key="p01">
    <img src={imgAperturaLogo} alt="Logo editorial" className="pw-img" style={{aspectRatio:'4/1', objectFit:'cover'}}  loading="lazy" decoding="async" />
    <div className="pw-r2">
      <img src={imgAperturaCosecha} alt="Detalle cosecha" className="pw-img" style={{aspectRatio:'3/2'}}  loading="lazy" decoding="async" />
      <img src={imgAperturaManos} alt="Manos herramienta" className="pw-img" style={{aspectRatio:'3/2'}}  loading="lazy" decoding="async" />
    </div>
    <img src={imgAperturaRetrato} alt="Retrato trabajador" className="pw-img pw-img-flex"  loading="lazy" decoding="async" />
  </div>,

  // 02 · SCREENSHOT HOMEPAGE
  <div className="pw-pg" key="p02">
    <div className="pw-bar pw-bar-dk">
      <span>SITIO WEB</span>
      <span>narrativastransmedia.webflow.io</span>
    </div>
    <img src={imgScreenHomepage} alt="Homepage" className="pw-img pw-img-flex"  loading="lazy" decoding="async" />
    <div className="pw-bar-foot">FIG. 01 · Homepage · 2024</div>
  </div>,

  // 03 · SCREENSHOT DETALLES
  <div className="pw-pg pw-padded pw-gap" key="p03">
    <img src={imgScreenDetalle1} alt="Sección testimonios" className="pw-img"  loading="lazy" decoding="async" />
  </div>,

  // 04 · FOTO PRINCIPAL
  <div className="pw-pg" key="p04">
    <img src={imgFotoPrincipal} alt="Foto principal cosecha" className="pw-img-fill"  loading="lazy" decoding="async" />
  </div>,

  // 05 · FOTO GRID 2×2
  <div className="pw-pg pw-g22" key="p05">
    {/* Reemplazar: grid-01.webp — reunión sindical */}
    <img src={imgGrid01} alt="Reunión sindical" className="pw-img-fill"  loading="lazy" decoding="async" />
    {/* Reemplazar: grid-02.webp — proceso extracción */}
    <img src={imgGrid02} alt="Proceso extracción" className="pw-img-fill"  loading="lazy" decoding="async" />
    {/* Reemplazar: grid-03.webp — planta / infraestructura */}
    <img src={imgGrid03} alt="Planta infraestructura" className="pw-img-fill"  loading="lazy" decoding="async" />
    {/* Reemplazar: grid-04.webp — retrato trabajador */}
    <img src={imgGrid04} alt="Retrato trabajador" className="pw-img-fill"  loading="lazy" decoding="async" />
  </div>,

  // 06 · CONTACT SHEET A — Reemplazar: film-a-01.webp … film-a-09.webp (9 frames)
  <div className="pw-pg pw-film" key="p06">
    <div className="pw-bar pw-bar-film">
      <span className="pw-kodak">KODAK T-MAX 400</span>
      <span>ROLLO Nº 03 · EXP. 2023</span>
    </div>
    <div className="pw-cg">
      {FILM_A.map((src, i) => (
        <img key={i} src={src} alt={`Frame ${String(i+1).padStart(2,'0')}`} className="pw-img-fill"  loading="lazy" decoding="async" />
      ))}
    </div>
    <div className="pw-fs">
      {Array.from({length:14}, (_,i) => <div key={i} className="pw-sp" />)}
    </div>
  </div>,

  // 07 · CONTACT SHEET B — Reemplazar: film-b-10.webp … film-b-18.webp (9 frames)
  <div className="pw-pg pw-film" key="p07">
    <div className="pw-bar pw-bar-film">
      <span className="pw-kodak">KODAK T-MAX 400</span>
      <span>ROLLO Nº 04 · EXP. 2023</span>
    </div>
    <div className="pw-cg">
      {FILM_B.map((src, i) => (
        <img key={i} src={src} alt={`Frame ${String(i+10).padStart(2,'0')}`} className="pw-img-fill"  loading="lazy" decoding="async" />
      ))}
    </div>
    <div className="pw-fs">
      {Array.from({length:14}, (_,i) => <div key={i} className="pw-sp" />)}
    </div>
  </div>,

  // 08 · MANIFIESTO L
  // Reemplazar: manifiesto-izq.webp — diagrama sistema transmedia o mapa visual
  <div className="pw-pg" key="p08">
    <img src={imgManifiestoIzq} alt="Diagrama sistema transmedia" className="pw-img-fill"  loading="lazy" decoding="async" />
  </div>,

  // 09 · MANIFIESTO R
  // Reemplazar: manifiesto-der.webp — cita visual tipográfica sobre imagen, formato poster
  <div className="pw-pg" key="p09">
    <img src={imgManifeistoDer} alt="Cita visual editorial" className="pw-img-fill"  loading="lazy" decoding="async" />
  </div>,

  // 14 · PANORÁMICA L
  <div className="pw-pg" key="p14">
    <img src={imgPanoramicaIzq} alt="Panorámica izquierda" className="pw-img-fill"  loading="lazy" decoding="async" />
  </div>,

  // 15 · PANORÁMICA R
  <div className="pw-pg" key="p15">
    <img src={imgPanoramicaDer} alt="Panorámica derecha" className="pw-img-fill"  loading="lazy" decoding="async" />
  </div>,

  // 10 · PROCESO BOCETOS
  <div className="pw-pg pw-padded pw-gap" key="p10">
    <img src={imgBocetoMapa} alt="Mapa sistema transmedia" className="pw-img" loading="lazy" decoding="async" />
    <div className="pw-r3">
    </div>
  </div>,

  // 11 · PROCESO FOTOS
  <div className="pw-pg pw-padded pw-gap" key="p11">
    <img src={imgProcesoTaller} alt="Taller co-creativo" className="pw-img pw-img-flex"  loading="lazy" decoding="async" />
    <div className="pw-r2">
      <img src={imgProcesoBoceto} alt="Bocetos en papel" className="pw-img" style={{aspectRatio:'4/3'}}  loading="lazy" decoding="async" />
      <img src={imgProcesoNotas} alt="Notas de campo" className="pw-img" style={{aspectRatio:'4/3'}}  loading="lazy" decoding="async" />
    </div>
  </div>,

  // 12 · COLLAGE MATERIALES
  <div className="pw-pg pw-padded pw-gap" key="p12">
    <img src={imgCollageDoc} alt="Mapa sistema transmedia" className="pw-img" loading="lazy" decoding="async" />
    <div className="pw-r3">
    </div>
  </div>,

  // 13 · COLLAGE GRUPO
  <div className="pw-pg pw-padded pw-gap" key="p13">
    {/* Reemplazar: grupo-principal.webp — sesión participativa, grupo completo */}
    <img src={imgGrupoPrincipal} alt="Sesión participativa" className="pw-img pw-img-flex"  loading="lazy" decoding="async" />
    <div className="pw-r2">
      {/* Reemplazar: grupo-impreso.webp — material impreso, recorte (4:3) */}
      <img src={imgGrupoImpreso} alt="Material impreso" className="pw-img" style={{aspectRatio:'4/3'}}  loading="lazy" decoding="async" />
      {/* Reemplazar: grupo-collage.png — cinta, papel, collage físico (4:3) */}
      <img src={imgGrupoCollage} alt="Collage físico" className="pw-img" style={{aspectRatio:'4/3'}}  loading="lazy" decoding="async" />
    </div>
  </div>,

  // 16 · ARCHIVO SCANS
  <div className="pw-pg pw-padded pw-gap" key="p16">
    <div className="pw-abar">
      <span>REF. ARQ/2023/COL/07</span><span>Enero 2024</span>
    </div>
    {/* Reemplazar: archivo-scan-principal.png — contrato o acta sindical */}
    <img src={imgArchivoScanPrin} alt="Contrato sindical" className="pw-img pw-img-flex"  loading="lazy" decoding="async" />
    <div className="pw-r2">
      {/* Reemplazar: archivo-scan-2.png — documento 2 (3:4 vertical) */}
      <img src={imgArchivoScan2} alt="Documento 2" className="pw-img" style={{aspectRatio:'3/4'}}  loading="lazy" decoding="async" />
      {/* Reemplazar: archivo-scan-3.png — documento 3 (3:4 vertical) */}
      <img src={imgArchivoScan3} alt="Documento 3" className="pw-img" style={{aspectRatio:'3/4'}}  loading="lazy" decoding="async" />
    </div>
  </div>,

  // 19 · CONTRA-PORTADA
  // Reemplazar: contra-portada.webp — imagen de cierre, full bleed, atmósfera tranquila
  <div className="pw-pg pw-cvr" key="p19">
    <img src={imgContraPortada} alt="Contra-portada" className="pw-img-fill"  loading="lazy" decoding="async" />
  </div>,
]

const LABELS = [
  'Portada','Apertura','Plataforma','Plataforma',
  'Fotografía','Fotografía','Contactos','Contactos',
  'Manifiesto','Manifiesto','Proceso','Proceso',
  'Collage','Collage','Panorámica','Panorámica',
  'Archivo','Archivo','Cierre','Contra-portada',
]

const TOTAL         = PAGE_CONTENT.length
const TOTAL_SPREADS = TOTAL / 2

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function PalmasWeb() {
  /* Silenciar soundtrack al entrar a una sección de proyecto */
  useEffect(() => {
    audio.soundtrackLeave()
    return () => audio.soundtrackEnter()  // restaurar al salir (back to menu)
  }, [])

  const navigate = useNavigate()
  const book     = useRef(null)
  const rootRef  = useRef(null)
  const [pageIdx, setPageIdx] = useState(0)
  /* Mobile: detect touch device and use simple carousel instead of 3D flipbook */
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const fn = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  // ── dimensiones responsive ────────────────────────────────
  const [dims, setDims] = useState({ w: 460, h: 620 })
  useEffect(() => {
    const calc = () => {
      const w = Math.round(Math.min(window.innerWidth  * 0.385, 520))
      const h = Math.round(Math.min(window.innerHeight * 0.90,  680))
      setDims({ w, h })
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // ── parallax del fondo con el cursor ─────────────────────
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let raf = null
    let tx = 0, ty = 0, cx = 0, cy = 0
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      tx = ((e.clientX - rect.left)  / rect.width  - 0.5) * 2
      ty = ((e.clientY - rect.top)   / rect.height - 0.5) * 2
    }
    const tick = () => {
      cx += (tx - cx) * 0.05
      cy += (ty - cy) * 0.05
      el.style.setProperty('--pw-rx', `${cy * 6}`)
      el.style.setProperty('--pw-ry', `${cx * 8}`)
      el.style.setProperty('--pw-gx', `${(cx * 0.5 + 0.5) * 100}%`)
      el.style.setProperty('--pw-gy', `${(cy * 0.5 + 0.5) * 100}%`)
      raf = requestAnimationFrame(tick)
    }
    const onLeave = () => { tx = 0; ty = 0 }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  // ── teclado ───────────────────────────────────────────────
  useEffect(() => {
    const h = e => {
      if (e.key === 'Escape') { navigate('/projects'); return }
      if (!book.current) return
      const pf = book.current.pageFlip()
      if (e.key === 'ArrowRight' || e.key === 'PageDown') pf.flipNext()
      if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   pf.flipPrev()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [navigate])

  // ── scroll ────────────────────────────────────────────────
  useEffect(() => {
    let lock = false
    const h = e => {
      e.preventDefault()
      if (lock || !book.current) return
      lock = true
      const pf = book.current.pageFlip()
      if (e.deltaY > 0) pf.flipNext()
      else              pf.flipPrev()
      setTimeout(() => { lock = false }, 900)
    }
    window.addEventListener('wheel', h, { passive: false })
    return () => window.removeEventListener('wheel', h)
  }, [])

  // ── swipe táctil ──────────────────────────────────────────
  const touchX = useRef(null)
  const onTouchStart = e => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = e => {
    if (touchX.current === null || !book.current) return
    const dx = e.changedTouches[0].clientX - touchX.current
    const pf = book.current.pageFlip()
    if (dx < -50) pf.flipNext()
    else if (dx > 50) pf.flipPrev()
    touchX.current = null
  }

  const onFlip = useCallback(e => {
    setPageIdx(e.data)
    audio.play('tick')
  }, [])

  const spreadIdx    = Math.floor(pageIdx / 2)
  const currentLabel = LABELS[pageIdx] || ''

  /* Mobile carousel — simple horizontal scroll, no 3D */
  if (isMobile) {
    const spreadIdx = Math.floor(pageIdx / 2)
    return (
      <div className="pw-root pw-mobile-root">
        <BackBtn bg="rgba(9,8,10,0.75)" color="rgba(255,255,255,0.45)" />
        <div className="pw-bg">
          <div className="pw-bg-grain" />
          <div className="pw-bg-text" aria-hidden="true">
            {BG_LINES.map((words, i) => (
              <div className="pw-bg-line" key={i}>
                {words.map(w => <span key={w}>{w}</span>)}
              </div>
            ))}
          </div>
        </div>
        <div className="pw-mobile-carousel">
          <div
            className="pw-mobile-track"
            style={{ transform: `translateX(calc(-${pageIdx} * 100%))` }}
          >
            {PAGE_CONTENT.map((content, i) => (
              <div key={i} className="pw-mobile-slide">
                {content}
              </div>
            ))}
          </div>
        </div>
        <nav className="pw-nav">
          <button className="pw-arr" onClick={() => setPageIdx(p => Math.max(p-1,0))} aria-label="Anterior">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5l-5 5 5 5"/></svg>
          </button>
          <div className="pw-nav-c">
            <div className="pw-dots">
              {Array.from({length: Math.ceil(PAGE_CONTENT.length/2)}, (_,i) => (
                <div key={i} className={`pw-dot${i===spreadIdx?' pw-dot-on':''}`} onClick={() => setPageIdx(i*2)} />
              ))}
            </div>
            <span className="pw-nav-lbl">{LABELS[pageIdx]} · {pageIdx+1} / {PAGE_CONTENT.length}</span>
          </div>
          <button className="pw-arr" onClick={() => setPageIdx(p => Math.min(p+1,PAGE_CONTENT.length-1))} aria-label="Siguiente">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 5l5 5-5 5"/></svg>
          </button>
        </nav>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className="pw-root"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── FONDO ─────────────────────────────────────────── */}
      <div className="pw-bg pw-bg-parallax">
        <div className="pw-bg-grain" />
        <div className="pw-bg-text" aria-hidden="true">
          {BG_LINES.map((words, i) => (
            <div className="pw-bg-line" key={i}>
              {words.map(w => <span key={w}>{w}</span>)}
            </div>
          ))}
        </div>
        <div className="pw-bg-vignette" />
      </div>

      {/* ── BOTÓN VOLVER ──────────────────────────────────── */}
      <BackBtn bg="rgba(9,8,10,0.75)" color="rgba(255,255,255,0.45)" />

      {/* ── ESCENA ────────────────────────────────────────── */}
      <div className="pw-scene">
        <div className="pw-ground" />

        <div className="pw-book-wrap">
          <div className="pw-stack-l" />
          <div className="pw-stack-r" />

          {/* Clip exacto al tamaño del libro — contiene páginas durante el flip */}
        <div style={{
          width:    dims.w * 2,
          height:   dims.h,
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}>
        <HTMLFlipBook
            ref={book}
            width={dims.w}
            height={dims.h}
            size="fixed"
            minWidth={200}
            maxWidth={520}
            minHeight={280}
            maxHeight={680}
            autoSize={false}
            startPage={0}
            showCover={false}
            drawShadow={false}
            maxShadowOpacity={0}
            flippingTime={800}
            useMouseEvents={true}
            usePortrait={false}
            showPageCorners={false}
            disableFlipByClick={false}
            mobileScrollSupport={false}
            clickEventForward={true}
            swipeDistance={30}
            startZIndex={10}
            className="pw-flipbook"
            style={{}}
            onFlip={onFlip}
          >
            {PAGE_CONTENT.map((content, i) => (
              <Page key={i} isHard={i === 0 || i === TOTAL - 1}>
                {content}
              </Page>
            ))}
          </HTMLFlipBook>
        </div>{/* end clip wrapper */}
        </div>

        {/* ── NAVEGACIÓN ──────────────────────────────────── */}
        <nav className="pw-nav">
          <button
            className="pw-arr"
            onClick={() => book.current?.pageFlip().flipPrev()}
            aria-label="Página anterior"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 5l-5 5 5 5" />
            </svg>
          </button>

          <div className="pw-nav-c">
            <div className="pw-dots">
              {Array.from({ length: TOTAL_SPREADS }, (_, i) => (
                <div
                  key={i}
                  className={`pw-dot${i === spreadIdx ? ' pw-dot-on' : ''}`}
                  onClick={() => book.current?.pageFlip().flip(i * 2)}
                />
              ))}
            </div>
            <span className="pw-nav-lbl">
              {currentLabel} · {spreadIdx + 1} / {TOTAL_SPREADS}
            </span>
          </div>

          <button
            className="pw-arr"
            onClick={() => book.current?.pageFlip().flipNext()}
            aria-label="Página siguiente"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 5l5 5-5 5" />
            </svg>
          </button>
        </nav>

        <p className="pw-hint-txt">
          Arrastra · hover en esquinas · <span>← →</span> · scroll
        </p>
      </div>
    </div>
  )
}
