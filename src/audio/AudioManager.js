/**
 * AudioManager — sistema centralizado de audio UI
 * ─────────────────────────────────────────────────────────────────────────────
 * Singleton: una instancia que sobrevive cambios de ruta.
 * UI sounds: síntesis Web Audio API puro (sin archivos).
 * Soundtrack: elemento <audio> HTML con streaming real desde /public/.
 *
 * Uso:
 *   import { audio } from '../audio/AudioManager.js'
 *   audio.play('tick')
 *   audio.soundtrackEnter()   // al entrar a Home / Projects / About
 *   audio.soundtrackLeave()   // al entrar a cualquier otra sección
 */

const SOUNDTRACK_SRC = '/menu-soundtrack.opus'
const SOUNDTRACK_VOL = 0.22   // volumen inicial (sube con fade-in)
const FADE_IN_MS     = 2200
const FADE_OUT_MS    = 1400

class AudioManager {
  constructor() {
    this._ctx        = null
    this._enabled    = true
    this._vol        = 0.55

    /* Soundtrack — un único <audio> que vive toda la sesión */
    this._track      = null   // HTMLAudioElement, creado en primer interact
    this._trackReady = false
    this._trackFade  = null   // handle de setInterval para fade
    this._inMenuZone = false  // true cuando estamos en Home / Projects / About

    /* Cooldown por evento */
    this._lastPlayed = {}
    this._COOLDOWN = {
      tick: 30, whoosh: 80, confirm: 200,
      open: 160, close: 160, back: 200, glitch: 60, reveal: 200,
    }

    /* Resume AudioContext tras primer gesto */
    this._onGesture = this._onGesture.bind(this)
    document.addEventListener('mousedown', this._onGesture, { once: true })
    document.addEventListener('keydown',   this._onGesture, { once: true })
  }

  /* ── AudioContext ── */
  _ctx_get() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this._ctx
  }

  _onGesture() {
    const ctx = this._ctx_get()
    if (ctx.state === 'suspended') ctx.resume()
    /*
      Usar track.paused como señal — NO _trackReady.
      _trackReady se marcaba true aunque play() fuera bloqueado por autoplay,
      impidiendo el reintento aquí. Con .paused sabemos el estado real.
      Re-registrar el listener para que funcione también en gestos posteriores
      (aunque normalmente el primero desbloquea el audio para la sesión entera).
    */
    if (this._inMenuZone && this._track && this._track.paused) {
      this._startTrack()
    }
    /* Volver a escuchar por si el primer gesto falla en algún edge case */
    document.addEventListener('mousedown', this._onGesture, { once: true })
    document.addEventListener('keydown',   this._onGesture, { once: true })
  }

  /* ── Crear el <audio> la primera vez ── */
  _ensureTrack() {
    if (this._track) return
    const a = new Audio()
    a.src     = SOUNDTRACK_SRC
    a.loop    = true
    a.preload = 'auto'
    a.volume  = 0
    this._track = a
  }

  /* ── Iniciar reproducción con fade-in ── */
  _startTrack() {
    if (!this._track || !this._enabled) return
    clearInterval(this._trackFade)

    if (this._track.paused) {
      this._track.play()
        .then(() => { this._trackReady = true })
        .catch(() => {
          /* Autoplay bloqueado — _trackReady queda false,
             _onGesture lo reintentará en el primer gesto del usuario */
          this._trackReady = false
        })
    }

    /* Fade in lineal */
    const targetVol = SOUNDTRACK_VOL * this._vol
    const steps     = 40
    const stepMs    = FADE_IN_MS / steps
    const stepVol   = targetVol / steps

    this._trackFade = setInterval(() => {
      if (!this._track) return clearInterval(this._trackFade)
      const next = Math.min(this._track.volume + stepVol, targetVol)
      this._track.volume = next
      if (next >= targetVol) clearInterval(this._trackFade)
    }, stepMs)

  }

  /* ── Fade out (sin detener — pausa al terminar) ── */
  _fadeOutTrack(cb) {
    if (!this._track) return cb?.()
    clearInterval(this._trackFade)

    const startVol = this._track.volume
    const steps    = 30
    const stepMs   = FADE_OUT_MS / steps
    const stepVol  = startVol / steps

    this._trackFade = setInterval(() => {
      if (!this._track) return clearInterval(this._trackFade)
      const next = Math.max(this._track.volume - stepVol, 0)
      this._track.volume = next
      if (next <= 0) {
        clearInterval(this._trackFade)
        cb?.()
      }
    }, stepMs)
  }

  /* ── API pública de soundtrack ── */

  /**
   * Llamar al montar Home, Projects o About.
   * Si la canción ya estaba corriendo solo sube el volumen (sin reiniciar).
   */
  soundtrackEnter() {
    this._inMenuZone = true
    this._ensureTrack()
    if (!this._enabled) return

    /* Si ya está sonando, solo restaurar volumen si se había bajado */
    if (!this._track.paused && this._track.volume > 0) return

    this._startTrack()
  }

  /**
   * Llamar al desmontar Home, Projects o About (o al entrar a otra sección).
   * Hace fade-out y pausa sin destruir el elemento — al volver retoma desde donde estaba.
   */
  soundtrackLeave() {
    this._inMenuZone = false
    if (!this._track) return
    this._fadeOutTrack(() => {
      if (this._track && !this._inMenuZone) {
        this._track.pause()
        /* NO resetear currentTime → la canción reanuda desde donde pausó */
      }
    })
  }

  /* ── Master toggle (incluye soundtrack) ── */
  setEnabled(v) {
    this._enabled = v
    if (!v) {
      this._fadeOutTrack(() => { if (this._track) this._track.pause() })
    } else if (this._inMenuZone) {
      this.soundtrackEnter()
    }
  }

  get enabled() { return this._enabled }

  setVolume(v) {
    this._vol = Math.max(0, Math.min(1, v))
    if (this._track && !this._track.paused) {
      this._track.volume = SOUNDTRACK_VOL * this._vol
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     SÍNTESIS — bloques reutilizables (sin cambios)
  ───────────────────────────────────────────────────────────────── */

  _canPlay(name) {
    const now   = performance.now()
    const last  = this._lastPlayed[name] || 0
    const limit = this._COOLDOWN[name] || 60
    if (now - last < limit) return false
    this._lastPlayed[name] = now
    return true
  }

  _tone(freq, vol, decay, type = 'sine', attack = 0) {
    const ctx  = this._ctx_get()
    if (ctx.state === 'suspended') ctx.resume()
    const now  = ctx.currentTime
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type      = type
    osc.frequency.setValueAtTime(freq, now)
    if (attack > 0) {
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(vol * this._vol, now + attack)
    } else {
      gain.gain.setValueAtTime(vol * this._vol, now)
    }
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + decay + 0.01)
  }

  _noise(vol, duration, filterFreq = 4000, filterQ = 1) {
    const ctx      = this._ctx_get()
    if (ctx.state === 'suspended') ctx.resume()
    const now      = ctx.currentTime
    const bufSize  = Math.ceil(ctx.sampleRate * duration)
    const buf      = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data     = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1)
    const src    = ctx.createBufferSource()
    src.buffer   = buf
    const filter = ctx.createBiquadFilter()
    filter.type  = 'bandpass'
    filter.frequency.setValueAtTime(filterFreq, now)
    filter.Q.setValueAtTime(filterQ, now)
    const gain   = ctx.createGain()
    gain.gain.setValueAtTime(vol * this._vol, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    src.start(now)
  }

  _sfx_tick()    { this._tone(880, 0.22, 0.055, 'triangle'); setTimeout(() => this._tone(660, 0.10, 0.04, 'sine'), 18) }
  _sfx_confirm() { this._tone(440, 0.28, 0.22, 'sine', 0.008); setTimeout(() => this._tone(660, 0.20, 0.30, 'sine', 0.005), 60); this._noise(0.06, 0.04, 3000, 2) }
  _sfx_whoosh()  { this._noise(0.14, 0.07, 2200, 0.8); this._tone(220, 0.06, 0.08, 'sawtooth') }
  _sfx_open() {
    const ctx = this._ctx_get(); if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime; const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.type = 'sine'; osc.frequency.setValueAtTime(240, now); osc.frequency.linearRampToValueAtTime(380, now + 0.18)
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.18 * this._vol, now + 0.04); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.24)
  }
  _sfx_close() {
    const ctx = this._ctx_get(); if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime; const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.type = 'sine'; osc.frequency.setValueAtTime(360, now); osc.frequency.exponentialRampToValueAtTime(180, now + 0.16)
    gain.gain.setValueAtTime(0.16 * this._vol, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.20)
  }
  _sfx_back()   { this._tone(320, 0.16, 0.12, 'triangle'); setTimeout(() => this._tone(220, 0.10, 0.10, 'sine'), 35) }
  _sfx_glitch() { this._noise(0.18, 0.03, 6000, 3); this._tone(1200, 0.08, 0.04, 'square') }
  _sfx_reveal() { this._tone(180, 0.20, 0.35, 'sine', 0.04); setTimeout(() => this._tone(270, 0.10, 0.25, 'sine', 0.02), 80) }

  play(name) {
    if (!this._enabled) return
    if (!this._canPlay(name)) return
    switch (name) {
      case 'tick':    this._sfx_tick();    break
      case 'confirm': this._sfx_confirm(); break
      case 'whoosh':  this._sfx_whoosh();  break
      case 'open':    this._sfx_open();    break
      case 'close':   this._sfx_close();   break
      case 'back':    this._sfx_back();    break
      case 'glitch':  this._sfx_glitch();  break
      case 'reveal':  this._sfx_reveal();  break
    }
  }

  /* Mantener retrocompatibilidad con el drone anterior */
  ambientStart()  { this.soundtrackEnter() }
  ambientStop()   { this.soundtrackLeave() }
  ambientResume() { if (this._inMenuZone) this.soundtrackEnter() }
}

export const audio = new AudioManager()
