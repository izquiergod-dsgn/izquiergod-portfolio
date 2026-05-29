import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import './Canciones.css';
import { audio } from '../../audio/AudioManager.js';
import BackBtn from '../../components/BackBtn/BackBtn.jsx';

/* ─── Assets ─── */
import imgLilaAleli    from '../../assets/canciones/lila-aleli.webp';
import imgDiosEsVerbo  from '../../assets/canciones/dios-es-verbo.webp';
import imgSietePalabras from '../../assets/canciones/siete-palabras.webp';
import imgYaNoSe       from '../../assets/canciones/ya-no-se.webp';
import imgSoyCulpable  from '../../assets/canciones/soy-culpable.webp';

// Audios
import audioLilaAleli    from '../../assets/canciones/lila-aleli.opus';
import audioDiosEsVerbo  from '../../assets/canciones/dios-es-verbo.opus';
import audioSietePalabras from '../../assets/canciones/siete-palabras.opus';
import audioYaNoSe       from '../../assets/canciones/ya-no-se.opus';
import audioSoyCulpable  from '../../assets/canciones/soy-culpable.opus';

const SONGS = [
  {
    id: 'lila-aleli', num: '001',
    title: 'LILA ALELÍ',
    artist: 'Silvana Estrada', year: '2025',
    genre: 'Folk · Pop Latino', album: 'Vendrán Suaves Lluvias',
    img: imgLilaAleli,
    audio: audioLilaAleli,
    originalUrl: 'https://open.spotify.com/intl-es/track/2xGAVeckOuMklQdClxW7iP?si=2a886c20630b4d68',
    desc: 'Habla del momento en el que te das cuenta de que esa persona que quieres tanto no te quiere de vuelta. Un amor no correspondido convertido en alivio. La lila alelí, flor silvestre imaginaria, como metáfora de lo que florece pero no es devuelto.',
    note: 'La flor no decora. Acusa.',
  },
  {
    id: 'jesus-es-verbo', num: '002',
    title: 'JESÚS ES VERBO NO SUSTANTIVO',
    artist: 'Ricardo Arjona', year: '1988',
    genre: 'Pop · Folk · Guatemala', album: 'Jesús, Verbo No Sustantivo',
    img: imgDiosEsVerbo,
    audio: audioDiosEsVerbo,
    originalUrl: 'https://open.spotify.com/intl-es/track/6AuFKO7zmLnt4egrHtIlAj?si=4e38c66bf57742ae',
    desc: 'Arjona propone que Jesús no es un nombre, es una acción. La fe como verbo, no como etiqueta. Una crítica a quienes declaran creer pero no practican. La divinidad como movimiento perpetuo.',
    note: 'Lo sagrado como movimiento, no como reposo.',
  },
  {
    id: 'siete-palabras', num: '003',
    title: '7 PALABRAS',
    artist: 'Kaleth Morales', year: '2005',
    genre: 'Vallenato · Colombia', album: 'La Hora de la Verdad',
    img: imgSietePalabras,
    audio: audioSietePalabras,
    originalUrl: 'https://open.spotify.com/intl-es/track/5QYH8Sufitu4q7LQwdYcbv?si=528dac0cff274e12',
    desc: 'Siete palabras para decir todo lo que no se puede decir. Una de las canciones fundacionales del vallenato contemporáneo. Sencillez como poder absoluto.',
    note: 'La imagen no explica. Interrumpe.',
  },
  {
    id: 'ya-no-se', num: '004',
    title: 'YA NO SÉ QUÉ HACER CONMIGO',
    artist: 'El Cuarteto de Nos', year: '2006',
    genre: 'Rock Alternativo · Uruguay', album: 'Raro',
    img: imgYaNoSe,
    audio: audioYaNoSe,
    originalUrl: 'https://open.spotify.com/intl-es/track/6uaaUABuK03YkEPwlsuoKq?si=d80e36e00c22416f',
    desc: 'La confusión emocional como estado permanente. La incapacidad de entenderse a uno mismo. El Cuarteto de Nos captura el desconcierto de quien se mira al espejo y no se reconoce.',
    note: 'Dos horizontes que no convergen.',
  },
  {
    id: 'soy-culpable', num: '005',
    title: 'SOY CULPABLE',
    artist: 'Mauricio Sánchez', year: '2018',
    genre: 'Rock · Pop', album: 'Fallas de Fábrica',
    img: imgSoyCulpable,
    audio: audioSoyCulpable,
    originalUrl: 'https://open.spotify.com/intl-es/track/3GVOYu68NDrLZjscXTt6B2?si=38f9567b953c49a7',
    desc: 'La culpa como confesión voluntaria. Mauricio Sánchez en su momento más despojado: admitir que uno mismo es el problema. El cuerpo como escena del crimen sentimental.',
    note: 'El cuerpo como escena del crimen.',
  },
];

function getSize(dist) {
  if (dist === 0) return 'clamp(72px, 10.5vw, 148px)';
  if (dist === 1) return 'clamp(40px, 5.5vw, 78px)';
  if (dist === 2) return 'clamp(28px, 3.6vw, 52px)';
  return 'clamp(20px, 2.6vw, 36px)';
}

function getOpacity(dist) {
  if (dist === 0) return 1;
  if (dist === 1) return 0.68;
  if (dist === 2) return 0.44;
  return 0.22;
}

export default function Canciones({ onBack }) {
  /* Silenciar soundtrack al entrar a una sección de proyecto */
  useEffect(() => {
    audio.soundtrackLeave()
    return () => audio.soundtrackEnter()  // restaurar al salir (back to menu)
  }, [])

  const [active, setActive] = useState(0);
  const [detail, setDetail] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCardHover, setIsCardHover] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);

  const cardRef = useRef(null);
  const trackRef = useRef(null);
  const marqueeTimeline = useRef(null);
  const resizeTimeout = useRef(null);
  const detailRef = useRef(null);
  const wheelTimeout = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Cleanup en desmontaje — detiene el audio al navegar fuera de la página */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // Cargar y reproducir canción cuando cambia la canción activa o se abre el detalle (sin depender del volumen)
  useEffect(() => {
    if (!detail || !audioRef.current) return;
    const audio = audioRef.current;
    const newSrc = SONGS[active].audio;
    const wasPlaying = !audio.paused;

    if (audio.src !== newSrc) {
      audio.src = newSrc;
      audio.load();
      audio.volume = volume; // establecer volumen inicial
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else if (wasPlaying) {
      setIsPlaying(true);
    } else {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, active]); // ⬅️ SIN volume para evitar reinicios

  // Control de volumen independiente (solo cambia el volumen, no recarga)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Pausar al cerrar detalle
  useEffect(() => {
    if (!detail && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [detail]);

  // Sincronizar estado isPlaying con eventos del audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => console.warn(e));
    } else {
      audioRef.current.pause();
    }
  };

  // Marquee de fondo
  const initMarquee = useCallback(() => {
    if (!trackRef.current || detail) return;
    if (marqueeTimeline.current) marqueeTimeline.current.kill();

    const track = trackRef.current;
    const fullWidth = track.scrollWidth;
    const halfWidth = fullWidth / 2;
    const duration = halfWidth / 65;

    marqueeTimeline.current = gsap.fromTo(track,
      { x: 0 },
      { x: -halfWidth, duration, ease: 'none', repeat: -1, repeatDelay: 0 }
    );
  }, [detail]);

  useEffect(() => {
    initMarquee();
    const handleResize = () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => initMarquee(), 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (marqueeTimeline.current) marqueeTimeline.current.kill();
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
  }, [initMarquee, active]);

  const activate = useCallback((i) => {
    if (i === active) return;
    setActive(i);
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { rotate: -16, x: -24, opacity: 0, scale: 0.96 },
        { rotate: -8, x: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [active]);

  // Navegación con scroll en vista principal
  useEffect(() => {
    if (detail) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (wheelTimeout.current) return;
      if (e.deltaY > 0) {
        activate(Math.min(SONGS.length - 1, active + 1));
      } else if (e.deltaY < 0) {
        activate(Math.max(0, active - 1));
      }
      wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 200);
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [active, detail, activate]);

  // Navegación con scroll en detalle
  useEffect(() => {
    if (!detail || !detailRef.current) return;
    const handleWheelDetail = (e) => {
      e.preventDefault();
      if (wheelTimeout.current) return;
      if (e.deltaY > 0) {
        activate(Math.min(SONGS.length - 1, active + 1));
      } else if (e.deltaY < 0) {
        activate(Math.max(0, active - 1));
      }
      wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 200);
    };
    const detailElement = detailRef.current;
    detailElement.addEventListener('wheel', handleWheelDetail, { passive: false });
    return () => detailElement.removeEventListener('wheel', handleWheelDetail);
  }, [detail, active, activate]);

  // Teclado
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') {
        if (detail) setDetail(false);
        else onBack?.();
      }
      if (!detail) {
        if (e.key === 'ArrowUp') activate(Math.max(0, active - 1));
        if (e.key === 'ArrowDown') activate(Math.min(SONGS.length - 1, active + 1));
        if (e.key === 'Enter') setDetail(true);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [active, detail, activate, onBack]);

  const song = SONGS[active];

  const openDetail = () => {
    audio.play('open');
    if (marqueeTimeline.current) marqueeTimeline.current.pause();
    setDetail(true);
  };
  const closeDetail = () => {
    setDetail(false);
    setTimeout(() => initMarquee(), 100);
  };

  const handleCardMouseEnter = () => {
    if (!detail) setIsCardHover(true);
  };
  const handleCardMouseLeave = () => {
    if (!detail) setIsCardHover(false);
  };

  return (
    <div className={`sq-root ${isCardHover ? 'card-hover' : ''}`}>
      <div className="sq-bg" />

      <audio ref={audioRef} preload="auto" loop />

      <header className="sq-nav">
        <div className="sq-nav-l">
          {/* Botón siempre a la izquierda — misma posición sistémica */}
          {detail ? (
            <button className="sq-close" onClick={closeDetail}>← VOLVER</button>
          ) : (
            onBack && <BackBtn fixed={false} to="/projects" accentColor="#E3000B" bg="rgba(8,8,6,0.0)" color="rgba(244,241,234,0.55)" />
          )}
          <div className="sq-logo-sq" />
          <span className="sq-logo-t">CANCIONES</span>
        </div>
        <div className="sq-nav-r">
          <span className="sq-nav-meta">ILUSTRACIÓN · 2024</span>
        </div>
      </header>

      {!detail && (
        <>
          <div className="sq-bg-layer" aria-hidden="true">
            <div className="sq-bg-track" ref={trackRef}>
              {[0, 1].map((i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <span className="sq-bg-num">{song.num}</span>
                  <span className="sq-bg-text">{song.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sq-card-zone">
            <div
              className="sq-card"
              ref={cardRef}
              onClick={openDetail}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="sq-card-img">
                <img src={song.img} alt={song.title}  loading="lazy" decoding="async" />
              </div>
              <div className="sq-card-info">
                <div className="sq-card-sep" />
                <div className="sq-card-title">{song.title}</div>
                <div className="sq-card-sub">{song.artist} · {song.year}</div>
                <div className="sq-card-cta">VER ILUSTRACIÓN ↗</div>
              </div>
            </div>
          </div>

          <nav className="sq-list">
            {SONGS.map((s, i) => {
              const dist = Math.abs(i - active);
              const isActive = active === i;
              return (
                <div
                  key={s.id}
                  className={`sq-item ${isActive ? 'sq-active' : ''}`}
                  onMouseEnter={() => activate(i)}
                  onClick={openDetail}
                >
                  <div className="sq-item-left">
                    <span
                      className="sq-num"
                      style={{ color: isActive ? '#FFD000' : 'rgba(0,0,0,.55)' }}
                    >
                      {s.num}
                    </span>
                    {isActive && (
                      <div className="sq-thumb">
                        <img src={s.img} alt={s.title}  loading="lazy" decoding="async" />
                      </div>
                    )}
                  </div>
                  <div className="sq-title-wrap">
                    <h2
                      className="sq-title"
                      style={{
                        fontSize: getSize(dist),
                        opacity: getOpacity(dist),
                        color: isActive ? '#F4F1EA' : 'transparent',
                        WebkitTextStroke: isActive
                          ? 'none'
                          : `${dist <= 1 ? 2 : 1.5}px rgba(0,0,0,${dist === 1 ? 0.65 : 0.45})`,
                        paintOrder: 'stroke fill',
                      }}
                    >
                      {s.title}
                    </h2>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="sq-tagline">
            Sonido<br />es imagen<span className="sq-dot">.</span>
          </div>
          <div className="sq-counter">
            {String(active + 1).padStart(2, '0')} / {SONGS.length}
          </div>
        </>
      )}

      {detail && (
        <div className="sq-detail" ref={detailRef}>
          <div className="sq-det-left">
            <div className="sq-det-main-img sq-det-main-img--full" data-hover>
              <img src={song.img} alt={song.title}  loading="lazy" decoding="async" />
            </div>
          </div>

          <div className="sq-det-right">
            <div className="sq-det-num">{song.num}</div>
            <h2 className="sq-det-title">{song.title}</h2>
            <div className="sq-det-meta-row">
              {[
                ['ARTISTA', song.artist],
                ['AÑO',     song.year],
                ['ÁLBUM',   song.album],
                ['GÉNERO',  song.genre],
              ].map(([k, v]) => (
                <div key={k} className="sq-det-meta-item">
                  <span className="sq-det-meta-k">{k}</span>
                  <span className="sq-det-meta-v">{v}</span>
                </div>
              ))}
            </div>

            {/* Reproductor funcional */}
            <div className="sq-det-player">
              <button className="sq-player-btn" onClick={togglePlay} aria-label={isPlaying ? "Pausar" : "Reproducir"}>
                {isPlaying ? '⏸︎' : '▶︎'}
              </button>

              <div className="sq-volume-control">
                <span className="sq-volume-icon">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="sq-volume-slider"
                  aria-label="Volumen"
                />
                <span className="sq-volume-value">{Math.round(volume * 100)}%</span>
              </div>

              <a
                href={song.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sq-external-link"
              >
                🎵 Escuchar original
              </a>
            </div>

            <div className="sq-det-sep" />
            <div className="sq-det-note-label">NOTA EDITORIAL</div>
            <p className="sq-det-note">"{song.note}"</p>
            <p className="sq-det-desc">{song.desc}</p>
            <div className="sq-det-nav">
              {active > 0 && (
                <button className="sq-det-nav-btn" onClick={() => activate(active - 1)} data-hover>
                  ← {SONGS[active - 1].num}
                </button>
              )}
              {active < SONGS.length - 1 && (
                <button className="sq-det-nav-btn" onClick={() => activate(active + 1)} data-hover>
                  {SONGS[active + 1].num} →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}