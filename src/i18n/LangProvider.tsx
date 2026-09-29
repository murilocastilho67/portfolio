import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LangContext, type Lang, type LangContextValue } from './context'
import { en } from './en'
import { pt } from './pt'

const STORAGE_KEY = 'lang'
const dictionaries = { pt, en }
const htmlLang: Record<Lang, string> = { pt: 'pt-BR', en: 'en' }

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'pt' || saved === 'en') return saved
  } catch {
    // localStorage indisponível (modo privado, bloqueio de cookies)
  }
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

function setMeta(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)
  const t = dictionaries[lang]

  useEffect(() => {
    document.documentElement.lang = htmlLang[lang]
    document.title = t.meta.title
    setMeta('meta[name="description"]', t.meta.description)
    setMeta('meta[property="og:title"]', t.meta.title)
    setMeta('meta[property="og:description"]', t.meta.ogDescription)
    setMeta('meta[property="og:locale"]', lang === 'pt' ? 'pt_BR' : 'en_US')
    setMeta('meta[property="og:locale:alternate"]', lang === 'pt' ? 'en_US' : 'pt_BR')
    setMeta('meta[name="twitter:title"]', t.meta.title)
    setMeta('meta[name="twitter:description"]', t.meta.ogDescription)
  }, [lang, t])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // preferência não persistida, sem impacto na navegação
    }
  }, [])

  const toggleLang = useCallback(() => setLang(lang === 'pt' ? 'en' : 'pt'), [lang, setLang])

  const value = useMemo<LangContextValue>(
    () => ({ lang, t, setLang, toggleLang }),
    [lang, t, setLang, toggleLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
