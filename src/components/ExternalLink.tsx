import type { ReactNode } from 'react'
import { useT } from '../i18n/useT'

interface ExternalLinkProps {
  href: string
  className?: string
  onClick?: () => void
  children: ReactNode
}

/** Link externo: nova aba com rel seguro e aviso para leitores de tela. */
export function ExternalLink({ href, className, onClick, children }: ExternalLinkProps) {
  const { t } = useT()
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
      <span className="sr-only"> {t.a11y.newTab}</span>
    </a>
  )
}
