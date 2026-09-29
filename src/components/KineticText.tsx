import { Fragment, useEffect, useLayoutEffect, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { decode, fillNoise } from '../lib/decode'
import { registerKinetic } from '../lib/kinetic'

interface KineticTextProps {
  text: string
  className?: string
  /** Segura a decodificação enquanto for true (ex.: abertura em tela cheia por cima). */
  hold?: boolean
}

const layersOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('.kt-g'))

/**
 * Título cinético: decodifica ao entrar na viewport e, com o mouse perto, as letras engrossam
 * (fonte variável). O texto real está sempre no DOM e é o único lido por leitores de tela; durante
 * a decodificação ele fica transparente e define o layout, e uma camada aria-hidden por letra,
 * centrada sobre ela, mostra os símbolos. Cada palavra reserva a largura no peso máximo, então nem a
 * decodificação nem o peso mudam a quebra de linha.
 */
export function KineticText({ text, className = '', hold = false }: KineticTextProps) {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [decoded, setDecoded] = useState(false)
  const scrambling = !reduced && !decoded

  // Ruído inicial antes da primeira pintura: nada de texto "de verdade" piscando antes de decodificar.
  useLayoutEffect(() => {
    if (scrambling && ref.current) fillNoise(layersOf(ref.current))
  }, [scrambling, text, ref])

  useEffect(() => {
    const root = ref.current
    if (!scrambling || !inView || hold || !root) return
    return decode(layersOf(root), () => setDecoded(true))
  }, [scrambling, inView, hold, text, ref])

  // O texto muda com o idioma: as letras são refeitas, então o registro também.
  useEffect(() => (ref.current ? registerKinetic(ref.current) : undefined), [text, ref])

  return (
    <span ref={ref} className={`kt ${className}`} data-scramble={scrambling || undefined}>
      {text.split(' ').map((word, w) => (
        <Fragment key={`${w}-${word}`}>
          {w > 0 && ' '}
          <span className="kt-w" data-word={word}>
            {Array.from(word, (char, i) => (
              <span key={i} className="kt-c">
                <span className="kt-r">{char}</span>
                {scrambling && <i className="kt-g" aria-hidden="true" />}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  )
}
