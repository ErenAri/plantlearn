import { Audio } from 'expo-av'
import { useCallback, useEffect, useRef } from 'react'
import { getSetting } from '@/db'

type SoundName = 'correct' | 'wrong' | 'levelUp' | 'complete' | 'tap'

let muted = false

export async function loadAudioSetting() {
  const val = await getSetting('soundMuted')
  muted = val === '1'
}

export function setSoundMuted(value: boolean) {
  muted = value
}

// Inline-generated sounds using expo-av tone generation isn't possible,
// so we use short beep-like sounds created from Audio.Sound with base64-encoded minimal WAV data.
// These are tiny placeholder tones. Replace with real .mp3 files in assets/sounds/ for production.

// Minimal WAV: 44-byte header + samples. We generate them at runtime for zero-asset deployment.
function generateWavBase64(frequency: number, durationMs: number, volume = 0.3): string {
  const sampleRate = 22050
  const numSamples = Math.floor(sampleRate * durationMs / 1000)
  const dataSize = numSamples * 2
  const fileSize = 44 + dataSize
  const buf = new ArrayBuffer(fileSize)
  const view = new DataView(buf)

  // WAV header
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, fileSize - 8, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)

  // Generate sine wave with fade-out
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const fadeOut = Math.max(0, 1 - (i / numSamples) * 1.5)
    const sample = Math.sin(2 * Math.PI * frequency * t) * volume * fadeOut
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)))
    view.setInt16(44 + i * 2, intSample, true)
  }

  // Convert to base64
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const SOUND_CONFIGS: Record<SoundName, { frequency: number; durationMs: number; volume?: number }> = {
  correct: { frequency: 880, durationMs: 150, volume: 0.25 },
  wrong: { frequency: 220, durationMs: 200, volume: 0.2 },
  levelUp: { frequency: 1320, durationMs: 300, volume: 0.3 },
  complete: { frequency: 660, durationMs: 250, volume: 0.25 },
  tap: { frequency: 1000, durationMs: 50, volume: 0.1 },
}

export function useAudio() {
  const sounds = useRef<Map<SoundName, Audio.Sound>>(new Map())
  const loaded = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function preload() {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })

        for (const [name, config] of Object.entries(SOUND_CONFIGS) as [SoundName, typeof SOUND_CONFIGS[SoundName]][]) {
          if (cancelled) return
          const base64 = generateWavBase64(config.frequency, config.durationMs, config.volume)
          const { sound } = await Audio.Sound.createAsync(
            { uri: `data:audio/wav;base64,${base64}` },
            { shouldPlay: false },
          )
          sounds.current.set(name, sound)
        }
        loaded.current = true
      } catch {
        // Audio not available (e.g., web), silently degrade
      }
    }

    preload()

    return () => {
      cancelled = true
      for (const sound of sounds.current.values()) {
        sound.unloadAsync().catch(() => {})
      }
      sounds.current.clear()
    }
  }, [])

  const play = useCallback(async (name: SoundName) => {
    if (muted || !loaded.current) return
    const sound = sounds.current.get(name)
    if (!sound) return
    try {
      await sound.setPositionAsync(0)
      await sound.playAsync()
    } catch {
      // ignore playback errors
    }
  }, [])

  return { play }
}
