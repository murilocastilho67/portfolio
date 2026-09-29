import { useEffect, useRef, useState, type RefObject } from 'react'

interface Options {
  threshold?: number
  rootMargin?: string
}

const supportsObserver = typeof IntersectionObserver !== 'undefined'

/**
 * Indica se o elemento já entrou na viewport (dispara uma única vez).
 * Sem suporte a IntersectionObserver retorna `true`, para nunca esconder conteúdo.
 */
export function useInView<T extends Element>({
  threshold = 0.15,
  rootMargin = '0px 0px -8% 0px',
}: Options = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(!supportsObserver)

  useEffect(() => {
    const el = ref.current
    if (!el || !supportsObserver) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, inView]
}
