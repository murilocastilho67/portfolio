import { useEffect, useRef } from 'react'
import { GITHUB_PROJECTS_URL } from '../data/links'
import { useT } from '../i18n/useT'

/** Recado para quem abre o DevTools, impresso uma vez por carregamento da página. */
export function useConsoleBanner() {
  const { t } = useT()
  const printed = useRef(false)
  const message = t.banner.replace('{url}', GITHUB_PROJECTS_URL)

  useEffect(() => {
    if (printed.current) return
    printed.current = true
    // oxlint-disable-next-line no-console -- o recado no console é o objetivo deste hook
    console.log(
      '%c>_ murilo.dev',
      'color:#f2a93b;background:#0b0d10;font:700 18px monospace;padding:6px 10px;border-radius:4px',
      `\n${message}`,
    )
  }, [message])
}
