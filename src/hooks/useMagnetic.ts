import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

/** Quanto o botão acompanha o cursor (fração da distância ao centro) e o limite em px. */
const STRENGTH = 0.22
const MAX = 7

/**
 * Botões "magnéticos": os `.btn` dentro do contêiner são puxados de leve na direção do cursor
 * e expõem a posição dele (`--gx`/`--gy`) para o brilho interno. Só com mouse e sem redução
 * de movimento; ao sair, o botão volta ao lugar pela transição do CSS.
 */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root) return

    let current: HTMLElement | null = null
    const reset = (el: HTMLElement) => {
      el.style.removeProperty('--mx')
      el.style.removeProperty('--my')
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const btn = e.target instanceof Element ? e.target.closest<HTMLElement>('.btn') : null
      if (current && current !== btn) reset(current)
      current = btn
      if (!btn) return

      const box = btn.getBoundingClientRect()
      const dx = e.clientX - (box.left + box.width / 2)
      const dy = e.clientY - (box.top + box.height / 2)
      btn.style.setProperty('--gx', `${e.clientX - box.left}px`)
      btn.style.setProperty('--gy', `${e.clientY - box.top}px`)
      if (reduced) return
      const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v * STRENGTH))
      btn.style.setProperty('--mx', `${clamp(dx)}px`)
      btn.style.setProperty('--my', `${clamp(dy)}px`)
    }
    const onLeave = () => {
      if (current) reset(current)
      current = null
    }

    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  return ref
}
