import { createContext, useContext, useEffect, useRef } from 'react'

/** Pilha de "Esc": o painel mais recente (gaveta, menu) fecha primeiro; sem nenhum, fecha a janela. */
export interface DemoContextValue {
  pushEscape: (handler: () => void) => () => void
}

export const DemoContext = createContext<DemoContextValue>({ pushEscape: () => () => {} })

/** Registra `handler` como tratador de Esc enquanto `active`. */
export function useEscape(active: boolean, handler: () => void) {
  const { pushEscape } = useContext(DemoContext)
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })
  useEffect(
    () => (active ? pushEscape(() => handlerRef.current()) : undefined),
    [active, pushEscape],
  )
}

/** Contrato de todo app de demonstração: ele mesmo monta o AppFrame e recebe só o reset. */
export interface DemoAppProps {
  onReset: () => void
}
