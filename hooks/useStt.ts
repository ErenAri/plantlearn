import { useState, useCallback, useRef } from 'react'
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition'

export function useStt() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resolveRef = useRef<((text: string) => void) | null>(null)

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? ''
    setTranscript(text)
    if (event.isFinal && resolveRef.current) {
      resolveRef.current(text)
      resolveRef.current = null
      setListening(false)
    }
  })

  useSpeechRecognitionEvent('error', (event) => {
    setError(event.message)
    setListening(false)
    if (resolveRef.current) {
      resolveRef.current(transcript)
      resolveRef.current = null
    }
  })

  useSpeechRecognitionEvent('end', () => {
    setListening(false)
    if (resolveRef.current) {
      resolveRef.current(transcript)
      resolveRef.current = null
    }
  })

  const listen = useCallback(async (lang: string): Promise<string> => {
    setTranscript('')
    setError(null)

    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
    if (!granted) {
      setError('Microphone permission denied')
      return ''
    }

    return new Promise<string>((resolve) => {
      resolveRef.current = resolve
      setListening(true)
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        maxAlternatives: 1,
      })
    })
  }, [transcript])

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop()
  }, [])

  return { transcript, listening, error, listen, stop }
}
