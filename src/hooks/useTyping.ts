import { useEffect, useState } from 'react'

interface Options {
  /** Volta ao início após apagar a última frase. Sem `loop`, digita só a primeira e para. */
  loop?: boolean
  /** Com `false` (ex.: prefers-reduced-motion) devolve a primeira frase completa, sem animar. */
  animate?: boolean
  typeMs?: number
  deleteMs?: number
  holdMs?: number
}

interface State {
  phrases: readonly string[]
  index: number
  length: number
  deleting: boolean
}

const initial = (phrases: readonly string[]): State => ({
  phrases,
  index: 0,
  length: 0,
  deleting: false,
})

/** Efeito de digitação: retorna o texto visível e se a primeira frase já foi digitada por completo. */
export function useTyping(
  phrases: readonly string[],
  { loop = false, animate = true, typeMs = 45, deleteMs = 22, holdMs = 1700 }: Options = {},
) {
  const [state, setState] = useState<State>(() => initial(phrases))

  // Reinicia quando as frases mudam (troca de idioma). Ajuste de estado durante o render,
  // conforme https://react.dev/learn/you-might-not-need-an-effect
  if (state.phrases !== phrases) setState(initial(phrases))

  useEffect(() => {
    if (!animate) return

    const current = phrases[state.index] ?? ''
    const fullyTyped = state.length >= current.length
    let delay: number
    let next: State

    if (!state.deleting && !fullyTyped) {
      delay = typeMs
      next = { ...state, length: state.length + 1 }
    } else if (!state.deleting) {
      if (!loop) return
      delay = holdMs
      next = { ...state, deleting: true }
    } else if (state.length > 0) {
      delay = deleteMs
      next = { ...state, length: state.length - 1 }
    } else {
      delay = 350
      next = { ...state, deleting: false, index: (state.index + 1) % phrases.length }
    }

    const timer = window.setTimeout(() => setState(next), delay)
    return () => window.clearTimeout(timer)
  }, [state, phrases, animate, loop, typeMs, deleteMs, holdMs])

  const first = phrases[0] ?? ''
  if (!animate) return { text: first, done: true }

  const current = phrases[state.index] ?? ''
  return {
    text: current.slice(0, state.length),
    done: state.index > 0 || state.length >= first.length,
  }
}
