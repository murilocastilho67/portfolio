import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Atraso em ms, útil para escalonar itens de uma grade. */
  delay?: number
}

/** Entrada suave ao rolar. O CSS só esconde o conteúdo se o usuário não pediu redução de movimento. */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const [ref, visible] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      data-visible={visible}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
