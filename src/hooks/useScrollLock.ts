import { useEffect } from 'react'

/** Trava o scroll do body enquanto `active`, compensando a largura da barra de rolagem. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    const { style } = document.body
    const previous = { overflow: style.overflow, paddingRight: style.paddingRight }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth

    style.overflow = 'hidden'
    if (scrollbar > 0) style.paddingRight = `${scrollbar}px`

    return () => {
      style.overflow = previous.overflow
      style.paddingRight = previous.paddingRight
    }
  }, [active])
}
