/**
 * Canal mínimo para o terminal (fundo da árvore) acionar efeitos globais do App sem prop drilling:
 * `boot` reexecuta a abertura e `turbo` liga a chuva âmbar.
 */
export type AppEvent = 'boot' | 'turbo'

const name = (event: AppEvent) => `app:${event}`

export function emitAppEvent(event: AppEvent) {
  window.dispatchEvent(new Event(name(event)))
}

export function onAppEvent(event: AppEvent, handler: () => void): () => void {
  window.addEventListener(name(event), handler)
  return () => window.removeEventListener(name(event), handler)
}
