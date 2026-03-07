import { useRef, useCallback, useState, useEffect } from 'react'
import * as Speech from 'expo-speech'

export function useTts() {
  const [speaking, setSpeaking] = useState(false)
  const lastTextRef = useRef('')

  const speak = useCallback((text: string, lang: string) => {
    Speech.stop()
    lastTextRef.current = text
    setSpeaking(true)
    Speech.speak(text, {
      language: lang,
      rate: 0.85,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    })
  }, [])

  const replay = useCallback((lang: string) => {
    if (lastTextRef.current) {
      speak(lastTextRef.current, lang)
    }
  }, [speak])

  const stop = useCallback(() => {
    Speech.stop()
    setSpeaking(false)
  }, [])

  useEffect(() => {
    return () => { Speech.stop() }
  }, [])

  return { speak, replay, stop, speaking }
}
