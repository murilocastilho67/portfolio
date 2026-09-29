import { useEffect, useRef } from 'react'
import { isTypingTarget } from '../lib/dom'

const CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

/** Chama `onCode` quando a sequência ↑ ↑ ↓ ↓ ← → ← → B A é digitada fora de campos de texto. */
export function useKonami(onCode: () => void) {
  const callback = useRef(onCode)
  useEffect(() => {
    callback.current = onCode
  })

  useEffect(() => {
    let progress = 0
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (key === CODE[progress]) {
        progress++
      } else {
        progress = key === CODE[0] ? 1 : 0
      }
      if (progress === CODE.length) {
        progress = 0
        callback.current()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
