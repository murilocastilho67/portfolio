import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Lang } from '../../../i18n/context'
import { useT } from '../../../i18n/useT'
import { kitCopy } from './kit.copy'

/** Textos de um app: cada `*.copy.ts` exporta `{ pt, en }` e o idioma vem do site. */
export function useCopy<T>(copy: Record<Lang, T>): T {
  return copy[useT().lang]
}

/** "Hoje" fictício, comum a todas as demonstrações. */
export const DEMO_TODAY = '2026-07-01'

export const useKit = () => useCopy(kitCopy)

/** Consulta de mídia reativa (a janela da demo troca de layout por largura). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Mensagem temporária dentro da janela (o AppFrame exibe). */
export function useToast(ms = 2600): [string | null, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const show = useCallback(
    (next: string) => {
      window.clearTimeout(timer.current)
      setMessage(next)
      timer.current = window.setTimeout(() => setMessage(null), ms)
    },
    [ms],
  )
  return [message, show]
}

const localeOf: Record<Lang, string> = { pt: 'pt-BR', en: 'en-US' }

export function useFormat() {
  const { lang } = useT()
  const locale = localeOf[lang]
  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${iso}T00:00:00Z`))
  const shortDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(
      new Date(`${iso}T00:00:00Z`),
    )
  const money = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  return { date, shortDate, money, number }
}
