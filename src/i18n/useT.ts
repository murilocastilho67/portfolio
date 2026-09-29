import { useContext } from 'react'
import { LangContext, type LangContextValue } from './context'

export function useT(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT deve ser usado dentro de <LangProvider>')
  return ctx
}
