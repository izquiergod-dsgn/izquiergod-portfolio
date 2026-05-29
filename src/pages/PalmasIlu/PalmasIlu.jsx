import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import './PalmasIlu.css';

import palmaImg   from '../../assets/palmasilu/palma.png';
import { audio }  from '../../audio/AudioManager.js';
import BackBtn    from '../../components/BackBtn/BackBtn.jsx';

// ── Assets reales — sustituir archivo en src/assets/palmasilu/ ──────────────
// Cristo
import retratoCristo  from '../../assets/palmasilu/retrato-cristo.webp';
import bocetoCristo   from '../../assets/palmasilu/boceto-cristo.webp';
import fotoCristo     from '../../assets/palmasilu/foto-cristo.webp';
// Científico
import ilustCientifico from '../../assets/palmasilu/ilustracion-cientifico.webp';
// Enalge
import retratoEnalge  from '../../assets/palmasilu/retrato-enalge.webp';
import bEALGE from '../../assets/palmasilu/boceto-enalge.webp';
import fotoEnalge     from '../../assets/palmasilu/foto-enalge.webp';
// Cómic (ya llenados por el usuario — estos son los imports existentes)
import comicPortada   from '../../assets/palmasilu/comic-portada.webp';
import comicPag01     from '../../assets/palmasilu/comic-pag-01.png';
import comicPag02     from '../../assets/palmasilu/comic-pag-02.png';
import comicPag03     from '../../assets/palmasilu/comic-pag-03.png';
import comicPag04     from '../../assets/palmasilu/comic-pag-04.png';
import comicSk01a     from '../../assets/palmasilu/comic-sk-01a.webp';
import comicSk01b     from '../../assets/palmasilu/comic-sk-01b.webp';
import comicSk02a     from '../../assets/palmasilu/comic-sk-02a.webp';
import comicSk02b     from '../../assets/palmasilu/comic-sk-02b.webp';
import comicSk03a     from '../../assets/palmasilu/comic-sk-03a.webp';
import comicSk03b     from '../../assets/palmasilu/comic-sk-03b.webp';
import comicSk04a     from '../../assets/palmasilu/comic-sk-04a.webp';
import comicSk04b     from '../../assets/palmasilu/comic-sk-04b.webp';
// Proceso (Palma y sus partes) — reemplazar cuando se tengan los archivos

const COMIC_IMGS = [comicPag01, comicPag02, comicPag03, comicPag04];
const COMIC_SKA  = [comicSk01a, comicSk02a, comicSk03a, comicSk04a];
const COMIC_SKB  = [comicSk01b, comicSk02b, comicSk03b, comicSk04b];

// ── Paneles — 5 tarjetas sobre la palma ──────────────────────────────────────
const PANELS = [
  { id:'p1', type:'cristo',      cat:'RETRATO',     title:'Cristo',
    desc:'Serie · 12 piezas · 2025',
    thumb: retratoCristo,   // imagen en miniatura de la tarjeta
    wide:false, rot: 6  },
  { id:'p2', type:'comic',       cat:'CÓMIC',       title:'La Palma y\nsus Raíces',
    desc:'Narrativa gráfica · 24 págs',
    thumb: comicPortada,
    wide:true,  rot: 1  },
  { id:'p3', type:'process',     cat:'ILUSTRACIÓN', title:'Palma y\nsus partes',
    desc:'Investigación-creación · OIT',
    thumb: ilustCientifico,
    wide:false, rot:-12 },
  { id:'p4', type:'enalge',      cat:'RETRATO',     title:'Enalge',
    desc:'Bocetos etnográficos · campo',
    thumb: retratoEnalge,
    wide:true,  rot:-4  },
];

const INIT_POS = [
  { fx: 0.34, fy: 0.30 },   // Cristo — izq-arriba
  { fx: 0.55, fy: 0.28 },   // Cómic  — der-arriba
  { fx: 0.32, fy: 0.60 },   // Proceso — centro-izq-abajo
  { fx: 0.58, fy: 0.58 },   // Enalge — der-abajo
];

const COMIC_PAGES = [
  { n:1, title:'Capítulo 1 — La tierra',  noteTitle:'Bocetos de campo',      noteText:'[Notas de campo: contexto, inspiración, lo que no cabe en la imagen.]', sk1:'Boceto campo — escena 01', sk2:'Boceto campo — variante 01' },
  { n:2, title:'Capítulo 2 — Las manos',  noteTitle:'Proceso de línea',      noteText:'[Qué cambió entre boceto y página final. Referencias visuales.]',       sk1:'Boceto composición — escena 02', sk2:'Estudio de línea — detalle' },
  { n:3, title:'Capítulo 3 — La memoria', noteTitle:'Referentes narrativos', noteText:'[Referentes gráficos y literarios. Paleta, ritmo visual, tono.]',        sk1:'Referente visual 01', sk2:'Referente visual 02' },
  { n:4, title:'Capítulo 4 — El futuro',  noteTitle:'Reflexiones finales',   noteText:'[Conexión con el sistema transmedia. Vínculo OIT. Lo que queda abierto.]', sk1:'Boceto final — cierre', sk2:'Variante descartada' },
];

// ── Árbol de palma ────────────────────────────────────────────────────────────
const PliTree = forwardRef(function PliTree(_, ref) {
  return <img ref={ref} src={palmaImg} alt="" aria-hidden="true" className="pli-tree-img" />;
});

// ── Panel arrastrable ─────────────────────────────────────────────────────────
function PliPanel({ panel, position, dimmed, containerRef, onPosition, onHover, onOpen, enterDelay }) {
  const outerRef = useRef(null), stageRef = useRef(null), innerRef = useRef(null), floatRef = useRef(null);
  const drag = useRef({ active:false, ox:0, oy:0, moved:false, lastX:0 });

  useEffect(() => {
    const el = outerRef.current;
    if (!el || drag.current.active) return;
    el.style.left = position.x + 'px'; el.style.top = position.y + 'px';
  }, [position.x, position.y]);

  useEffect(() => {
    const stage = stageRef.current; if (!stage) return;
    gsap.set(stage, { rotation: panel.rot, y: 0 });
    const idx = parseInt(panel.id.slice(1)) - 1;
    floatRef.current = gsap.to(stage, { y:-9, duration:2.4+idx*0.38, ease:'sine.inOut', yoyo:true, repeat:-1, delay:idx*0.62 });
    return () => floatRef.current?.kill();
  }, [panel.id, panel.rot]);

  const handleMouseMove = useCallback((e) => {
    const inner = innerRef.current; if (!inner) return;
    const rect = inner.getBoundingClientRect();
    inner.style.setProperty('--mx', ((e.clientX-rect.left)/rect.width*100)+'%');
    inner.style.setProperty('--my', ((e.clientY-rect.top)/rect.height*100)+'%');
  }, []);

  const startDrag = useCallback((e) => {
    e.preventDefault();
    const cx = e.clientX??e.touches?.[0]?.clientX, cy = e.clientY??e.touches?.[0]?.clientY;
    const r = containerRef.current.getBoundingClientRect(), el = outerRef.current;
    drag.current = { active:true, ox:cx-r.left-parseFloat(el.style.left||position.x), oy:cy-r.top-parseFloat(el.style.top||position.y), moved:false, lastX:cx };
    floatRef.current?.pause();
    gsap.to(stageRef.current, { scale:1.04, duration:0.2, ease:'power2.out' });
    const move = (ev) => {
      const ex=ev.clientX??ev.touches?.[0]?.clientX, ey=ev.clientY??ev.touches?.[0]?.clientY;
      const rr=containerRef.current.getBoundingClientRect();
      drag.current={...drag.current, moved:true, lastX:ex};
      el.style.left=(ex-rr.left-drag.current.ox)+'px'; el.style.top=(ey-rr.top-drag.current.oy)+'px';
      gsap.set(stageRef.current,{rotation:panel.rot+Math.max(-10,Math.min(10,(ex-drag.current.lastX)*0.42))});
    };
    const end = () => {
      drag.current.active=false;
      onPosition(panel.id,{x:parseFloat(el.style.left),y:parseFloat(el.style.top)});
      gsap.to(stageRef.current,{scale:1,rotation:panel.rot,duration:0.65,ease:'elastic.out(1,0.45)'});
      floatRef.current?.resume();
      document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',end);
      document.removeEventListener('touchmove',move); document.removeEventListener('touchend',end);
    };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',end);
    document.addEventListener('touchmove',move,{passive:false}); document.addEventListener('touchend',end);
  }, [panel.id, panel.rot, position, containerRef, onPosition]);

  const handleEnter = useCallback(() => {
    onHover(panel.id); floatRef.current?.pause();
    gsap.to(stageRef.current,{y:-14,scale:1.06,duration:0.32,ease:'power2.out',overwrite:'auto'});
  }, [panel.id, onHover]);

  const handleLeave = useCallback(() => {
    onHover(null);
    gsap.to(stageRef.current,{scale:1,duration:0.45,ease:'power2.inOut',overwrite:'auto'});
    floatRef.current?.resume();
    if (innerRef.current){innerRef.current.style.setProperty('--mx','50%');innerRef.current.style.setProperty('--my','50%');}
  }, [onHover]);

  const handleClick = useCallback(() => {
    audio.play('open');
    if (drag.current.moved) return;
    gsap.timeline()
      .to(stageRef.current,{scale:0.9,rotation:panel.rot-2,duration:0.10,ease:'power2.in'})
      .to(stageRef.current,{scale:1.08,rotation:panel.rot+1,duration:0.18,ease:'power2.out'})
      .to(stageRef.current,{scale:1,rotation:panel.rot,duration:0.28,ease:'elastic.out(1.2,0.5)'})
      .call(()=>onOpen(panel));
  }, [panel, onOpen]);

  return (
    <div
      ref={outerRef}
      className={['pli-panel', panel.wide?'pli-panel--wide':'', dimmed?'pli-panel--dim':''].filter(Boolean).join(' ')}
      style={{left:position.x+'px', top:position.y+'px', '--ed':enterDelay}}
      onMouseDown={startDrag} onMouseEnter={handleEnter} onMouseLeave={handleLeave}
      onMouseMove={handleMouseMove} onClick={handleClick} data-hover
    >
      <div ref={stageRef} className="pli-panel__stage">
        <div ref={innerRef} className="pli-panel__inner">
          <span className="pli-panel__cat">{panel.cat}</span>
          <h3 className="pli-panel__title">{panel.title}</h3>
          {/* Miniatura real — muestra la imagen del panel */}
          <div className="pli-panel__thumb">
            <img src={panel.thumb} alt={panel.title} className="pli-panel__thumb-img"  loading="lazy" decoding="async" />
          </div>
          <p className="pli-panel__desc">{panel.desc}</p>
        </div>
      </div>
      <span className="pli-panel__hint" aria-hidden="true">· abrir ·</span>
    </div>
  );
}

// ── Sección helper ────────────────────────────────────────────────────────────
function PliSection({ title, children }) {
  return (
    <section className="pli-det__sec">
      <h4 className="pli-det__sec-title">{title}</h4>
      <div className="pli-det__sec-rule" />
      {children}
    </section>
  );
}

// ── Contenido: Cristo ─────────────────────────────────────────────────────────
function CristoContent() {
  return (
    <>
      <PliSection title="RETRATO FINAL">
        <img src={retratoCristo} alt="Retrato Cristo" className="pli-det__img-main"  loading="lazy" decoding="async" />
        <p className="pli-det__body">Cristo es la cara de la palma, un hombre que representa la esencia de la cultura palmera y que ha luchado incansablemente por ella.</p>
      </PliSection>
      <PliSection title="FOTOGRAFÍA DE REFERENCIA">
        <img src={fotoCristo} alt="Foto referencia Cristo" className="pli-det__img-main"  loading="lazy" decoding="async" />
        <p className="pli-det__body">Foto entregada por la OIT.</p>
      </PliSection>
      <PliSection title="PRIMER INTENTO / BOCETO">
        <img src={bocetoCristo} alt="Boceto Cristo" className="pli-det__img-main"  loading="lazy" decoding="async" />
        <p className="pli-det__body">Estaba apenas probando el estilo pero el resultado no me convenció.</p>
      </PliSection>
    </>
  );
}

// ── Contenido: Enalge ─────────────────────────────────────────────────────────
function EnalgeContent() {
  return (
    <>
      <PliSection title="RETRATO FINAL">
        <img src={retratoEnalge} alt="Retrato Enalge" className="pli-det__img-main"  loading="lazy" decoding="async" />
        <p className="pli-det__body">Enalge primero fue un lider de un grupo de trabajadores, una cooperativa, y como hombre de la comunidad, representa la voz de los trabajadores rurales.</p>
      </PliSection>
      <PliSection title="FOTOGRAFÍA DE REFERENCIA">
        <img src={fotoEnalge} alt="Foto referencia Enalge" className="pli-det__img-main"  loading="lazy" decoding="async" />
        <p className="pli-det__body">Foto tomada durante la visita al Sindicato SINTRAINAGRO Seccional San Martín.</p>
      </PliSection>
      <PliSection title="BOCETO REPRESENTATIVO">
        <img src={bEALGE} alt="Boceto Enalge" className="pli-det__img-main"  loading="lazy" decoding="async" />
        <p className="pli-det__body">Originalmente iba a ser un retrato más similar al de Cristo, pero decidí optar por un estilo más expresivo.</p>
      </PliSection>
    </>
  );
}

// ── Contenido: Palma y sus partes ────────────────────────────────────────────
function ProcessContent() {
  return (
    <>
      <PliSection title="LA PALMA Y SUS PARTES">
        <img src={ilustCientifico} alt="Palma y sus partes" className="pli-det__img-main"  loading="lazy" decoding="async" />
        <div className="pli-det__partes">
          <div className="pli-det__parte">
            <span className="pli-det__parte-n">01</span>
            <div>
              <strong>Estípite</strong>
              <p className="pli-det__body">Tronco de la palma de aceite. Puede alcanzar hasta 20 metros de altura y concentra la historia de producción de cada planta.</p>
            </div>
          </div>
          <div className="pli-det__parte">
            <span className="pli-det__parte-n">02</span>
            <div>
              <strong>Hojas (frondes)</strong>
              <p className="pli-det__body">Hojas pinnadas que pueden superar los 7 metros de longitud. Cada palma produce entre 20 y 25 hojas nuevas por año.</p>
            </div>
          </div>
          <div className="pli-det__parte">
            <span className="pli-det__parte-n">03</span>
            <div>
              <strong>Raquis</strong>
              <p className="pli-det__body">Eje central de la hoja del que nacen los folíolos. Elemento estructural fundamental en la arquitectura de la planta.</p>
            </div>
          </div>
          <div className="pli-det__parte">
            <span className="pli-det__parte-n">04</span>
            <div>
              <strong>Racimo de frutos</strong>
              <p className="pli-det__body">Infrutescencia que puede pesar entre 10 y 25 kg. De cada racimo se extraen el aceite de palma y el palmiste, base de la industria palmera.</p>
            </div>
          </div>
          <div className="pli-det__parte">
            <span className="pli-det__parte-n">05</span>
            <div>
              <strong>Corona</strong>
              <p className="pli-det__body">Zona de emisión de hojas nuevas. Punto de mayor actividad vegetativa y de mayor riesgo en las labores de cosecha.</p>
            </div>
          </div>
        </div>
      </PliSection>
    </>
  );
}

const CONTENT_MAP = {
  cristo:  CristoContent,
  enalge:  EnalgeContent,
  process: ProcessContent,
};

// ── Detail overlay ────────────────────────────────────────────────────────────
function PliDetail({ panel, onClose }) {
  const overlayRef = useRef(null), paperRef = useRef(null), closingRef = useRef(false);

  useEffect(() => {
    gsap.fromTo(overlayRef.current,{opacity:0},{opacity:1,duration:0.32,ease:'power2.out'});
    gsap.fromTo(paperRef.current,
      {opacity:0,scale:0.86,y:34,rotationX:7,transformPerspective:1100},
      {opacity:1,scale:1,y:0,rotationX:0,duration:0.52,ease:'power3.out',delay:0.04,
       onComplete(){gsap.set(paperRef.current,{clearProps:'rotationX,transformPerspective'});}});
    const t = setTimeout(()=>{
      const secs = paperRef.current?.querySelectorAll('.pli-det__sec');
      if(secs?.length) gsap.from(secs,{opacity:0,y:12,stagger:0.07,duration:0.36,ease:'power2.out'});
    },280);
    return ()=>clearTimeout(t);
  }, []);

  useEffect(()=>{
    const fn=(e)=>{if(e.key==='Escape')handleClose();};
    window.addEventListener('keydown',fn); return ()=>window.removeEventListener('keydown',fn);
  },[]);

  const handleClose = useCallback(()=>{
    if(closingRef.current)return; closingRef.current=true;
    audio.play('close');
    gsap.to(paperRef.current,{opacity:0,scale:0.9,y:18,duration:0.26,ease:'power2.in'});
    gsap.to(overlayRef.current,{opacity:0,duration:0.3,ease:'power2.in',onComplete:onClose});
  },[onClose]);

  const Content = CONTENT_MAP[panel.type] ?? ProcessContent;
  return (
    <div ref={overlayRef} className="pli-det__overlay" onClick={handleClose}>
      <div ref={paperRef} className="pli-det__paper" onClick={e=>e.stopPropagation()}>
        <div className="pli-det__scroll">
          <div className="pli-det__inner">
            <header className="pli-det__header">
              <div><span className="pli-det__cat">{panel.cat}</span><h2 className="pli-det__title">{panel.title}</h2></div>
              <button className="pli-det__close" onClick={handleClose}>CERRAR</button>
            </header>
            <div className="pli-det__rule" />
            <div className="pli-det__content"><Content /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Comic reader ──────────────────────────────────────────────────────────────
function PliComic({ panel, onClose }) {
  const [page,setPage]=useState(0);
  const total=COMIC_PAGES.length, meta=COMIC_PAGES[page];
  const overlayRef=useRef(null), boxRef=useRef(null), closingRef=useRef(false);

  useEffect(()=>{
    gsap.fromTo(overlayRef.current,{opacity:0},{opacity:1,duration:0.32,ease:'power2.out'});
    gsap.fromTo(boxRef.current,
      {opacity:0,scale:0.86,y:34,rotationX:7,transformPerspective:1100},
      {opacity:1,scale:1,y:0,rotationX:0,duration:0.52,ease:'power3.out',delay:0.04,
       onComplete(){gsap.set(boxRef.current,{clearProps:'rotationX,transformPerspective'});}});
  },[]);

  useEffect(()=>{
    const fn=(e)=>{
      if(e.key==='Escape')handleClose();
      if(e.key==='ArrowRight')setPage(p=>Math.min(p+1,total-1));
      if(e.key==='ArrowLeft') setPage(p=>Math.max(p-1,0));
    };
    window.addEventListener('keydown',fn); return ()=>window.removeEventListener('keydown',fn);
  },[total]);

  const handleClose=useCallback(()=>{
    if(closingRef.current)return; closingRef.current=true;
    audio.play('close');
    gsap.to(boxRef.current,{opacity:0,scale:0.9,y:18,duration:0.26,ease:'power2.in'});
    gsap.to(overlayRef.current,{opacity:0,duration:0.3,ease:'power2.in',onComplete:onClose});
  },[onClose]);

  return (
    <div ref={overlayRef} className="pli-comic__overlay">
      <div className="pli-comic__backdrop" onClick={handleClose}/>
      <div ref={boxRef} className="pli-comic__box">
        <div className="pli-comic__safe">
          <header className="pli-comic__header">
            <div><span className="pli-comic__cat">{panel.cat}</span><h2 className="pli-comic__title">{panel.title.replace('\n',' ')}</h2></div>
            <button className="pli-comic__close" onClick={handleClose}>CERRAR</button>
          </header>
          <div className="pli-comic__rule"/>
          <div className="pli-comic__body">
            <div className="pli-comic__reader">
              <p className="pli-comic__chapter">{meta.title}</p>
              <img src={COMIC_IMGS[page]} alt={'Página '+meta.n} className="pli-comic__page-img"  loading="lazy" decoding="async" />
              <div className="pli-comic__nav">
                <button className="pli-comic__btn" onClick={()=>setPage(p=>Math.max(p-1,0))} disabled={page===0}>← ANTERIOR</button>
                <span className="pli-comic__count">{page+1} / {total}</span>
                <button className="pli-comic__btn" onClick={()=>setPage(p=>Math.min(p+1,total-1))} disabled={page===total-1}>SIGUIENTE →</button>
              </div>
            </div>
            <aside className="pli-comic__aside">
              <div className="pli-comic__aside-sec"><h4 className="pli-comic__aside-h">{meta.noteTitle}</h4>
                <div className="pli-comic__sk-grid">
                  <img src={COMIC_SKA[page]} alt={meta.sk1} className="pli-comic__sk-img"  loading="lazy" decoding="async" />
                  <img src={COMIC_SKB[page]} alt={meta.sk2} className="pli-comic__sk-img"  loading="lazy" decoding="async" />
                </div>
              </div>
              <div className="pli-comic__aside-sec"><h4 className="pli-comic__aside-h">NOTAS DEL PROCESO</h4><p className="pli-comic__note">{meta.noteText}</p></div>
              <div className="pli-comic__aside-sec"><h4 className="pli-comic__aside-h">PÁGINAS</h4>
                <div className="pli-comic__pages">
                  {COMIC_PAGES.map((_,i)=>(<button key={i} className={['pli-comic__pg',i===page?'pli-comic__pg--on':''].filter(Boolean).join(' ')} onClick={()=>setPage(i)}>{i+1}</button>))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PalmasIlu() {
  useEffect(() => {
    audio.soundtrackLeave();
    return () => audio.soundtrackEnter();
  }, []);

  const navigate=useNavigate();
  const containerRef=useRef(null), treeRef=useRef(null), titleRef=useRef(null);
  const [positions,setPositions]=useState(null);
  const [openPanel,setOpenPanel]=useState(null);
  const [hoverId,setHoverId]=useState(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const fn = e => setIsMobile(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  useEffect(()=>{
    const el=containerRef.current; if(!el)return;
    const measure=()=>{
      const{width:W,height:H}=el.getBoundingClientRect(); if(!W||!H)return;
      const pos={};
      PANELS.forEach((p,i)=>{pos[p.id]={x:INIT_POS[i].fx*W,y:INIT_POS[i].fy*H};});
      setPositions(pos);
    };
    measure();
    const ro=new ResizeObserver(measure); ro.observe(el); return()=>ro.disconnect();
  },[]);

  useEffect(()=>{
    const fit=()=>{
      const c=titleRef.current; if(!c)return;
      const target=window.innerWidth*0.96;
      c.querySelectorAll('.pli-main-title__line').forEach(line=>{
        line.style.fontSize='100px';
        const w=line.scrollWidth; if(!w)return;
        line.style.fontSize=Math.floor(100*target/w)+'px';
      });
    };
    if(document.fonts?.ready)document.fonts.ready.then(fit); else setTimeout(fit,200);
    window.addEventListener('resize',fit); return()=>window.removeEventListener('resize',fit);
  },[]);

  useEffect(()=>{
    const el=containerRef.current,tree=treeRef.current; if(!el||!tree)return;
    let mx=0,my=0,tx=0,ty=0,rafId;
    const onMove=(e)=>{const r=el.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-0.5)*20;my=((e.clientY-r.top)/r.height-0.5)*14;};
    const tick=()=>{tx+=(mx-tx)*0.055;ty+=(my-ty)*0.055;gsap.set(tree,{x:tx,y:ty});rafId=requestAnimationFrame(tick);};
    el.addEventListener('mousemove',onMove,{passive:true}); rafId=requestAnimationFrame(tick);
    return()=>{el.removeEventListener('mousemove',onMove);cancelAnimationFrame(rafId);};
  },[]);

  useEffect(()=>{
    if(!treeRef.current)return;
    const tl=gsap.to(treeRef.current,{scale:1.01,transformOrigin:'50% 80%',duration:7,ease:'sine.inOut',yoyo:true,repeat:-1});
    return()=>tl.kill();
  },[]);

  useEffect(()=>{
    const t=setTimeout(()=>{
      gsap.from('.sys-back',{x:-24,opacity:0,duration:0.5,ease:'power3.out'});
      if(treeRef.current)gsap.from(treeRef.current,{opacity:0,duration:1.8,ease:'power2.out',delay:0.1});
    },60);
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    const fn=(e)=>{if(e.key==='Escape'&&!openPanel){audio.play('back');navigate(-1);}};
    window.addEventListener('keydown',fn); return()=>window.removeEventListener('keydown',fn);
  },[openPanel,navigate]);

  const handlePosition=useCallback((id,pos)=>setPositions(prev=>({...prev,[id]:pos})),[]);

  return (
    <>
      <div className="pli-root">
        <div className="pli-main-title" ref={titleRef} aria-hidden="true">
          <span className="pli-main-title__line">NARRATIVAS TRANSMEDIA</span>
          <span className="pli-main-title__line">PARA LA DIGNIFICACIÓN</span>
          <span className="pli-main-title__line">DEL TRABAJO PALMERO</span>
        </div>
        <div className="pli-noise" aria-hidden="true"/>
        <BackBtn bg="rgba(42,34,24,0.85)" color="rgba(244,239,232,0.75)" />
        <p className="pli-stage-lbl">PALMAS ILU. · OIT · 2025</p>
                {/* Mobile: tap-grid outside the floating stage */}
        {isMobile && (
          <div className="pli-mobile-grid">
            {PANELS.map((panel) => (
              <button key={panel.id} className="pli-mobile-card" onClick={() => { audio.play('open'); setOpenPanel(panel); }}>
                <span className="pli-mobile-card__cat">{panel.cat}</span>
                <h3 className="pli-mobile-card__title">{panel.title}</h3>
                <img src={panel.thumb} alt={panel.title} className="pli-mobile-card__img" loading="lazy" decoding="async" />
                <span className="pli-mobile-card__desc">{panel.desc}</span>
              </button>
            ))}
          </div>
        )}
        {!isMobile && (
          <div className="pli-stage" ref={containerRef}>
            <PliTree ref={treeRef}/>
            {positions && PANELS.map((panel,i) => (
              <PliPanel key={panel.id} panel={panel} position={positions[panel.id]}
                dimmed={hoverId!==null&&hoverId!==panel.id}
                containerRef={containerRef} onPosition={handlePosition}
                onHover={setHoverId} onOpen={setOpenPanel}
                enterDelay={(0.28+i*0.18)+'s'}/>
            ))}
          </div>
        )}
      </div>
      {openPanel&&openPanel.type!=='comic'&&<PliDetail panel={openPanel} onClose={()=>setOpenPanel(null)}/>}
      {openPanel&&openPanel.type==='comic'&&<PliComic  panel={openPanel} onClose={()=>setOpenPanel(null)}/>}
    </>
  );
}
