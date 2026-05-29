/**
 * useAudio — React hook para acceder al AudioManager
 * ─────────────────────────────────────────────────────────────────
 * Expone play() y el estado enabled/volume.
 * No renderiza nada — solo conecta componentes con el singleton.
 */
import { useState, useCallback, useEffect } from 'react'
import { audio } from './AudioManager.js'

export function useAudio() {
  const [enabled, setEnabledState] = useState(audio.enabled)

  const toggle = useCallback(() => {
    const next = !audio.enabled
    audio.setEnabled(next)
    setEnabledState(next)
  }, [])

  const play = useCallback((name) => {
    audio.play(name)
  }, [])

  return { play, toggle, enabled }
}
