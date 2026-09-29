import { createContext } from 'react'
import type { Dict } from './pt'

export type Lang = 'pt' | 'en'

export interface LangContextValue {
  lang: Lang
  t: Dict
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

export const LangContext = createContext<LangContextValue | null>(null)
