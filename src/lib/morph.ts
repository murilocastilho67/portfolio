/**
 * "Card vira o sistema": transição de elemento compartilhado (View Transitions) entre o card do
 * projeto e a janela da demonstração. Os nomes precisam ser únicos em cada snapshot, então só
 * existem enquanto a transição roda: o card os recebe antes de começar e a janela os recebe no
 * callback de atualização (e o inverso ao fechar).
 */
export const MORPH_CARD = 'demo-morph'
export const MORPH_TAG = 'demo-morph-tag'

/** Trecho do card (linha da pilha, marcada com data-morph-tag) que viaja até a barra de endereço. */
const TAG_SELECTOR = '[data-morph-tag]'

function setName(el: Element | null, name: string | null) {
  if (!(el instanceof HTMLElement)) return
  if (name) el.style.setProperty('view-transition-name', name)
  else el.style.removeProperty('view-transition-name')
}

/** Dá (ou tira) os nomes de transição do card e da linha da pilha dentro dele. */
export function nameCard(card: HTMLElement, on: boolean) {
  setName(card, on ? MORPH_CARD : null)
  setName(card.querySelector(TAG_SELECTOR), on ? MORPH_TAG : null)
}

/** Só anima com suporte, sem redução de movimento e com o card visível na tela. */
export function canMorph(card: HTMLElement | null): card is HTMLElement {
  if (!card || typeof document.startViewTransition !== 'function') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const box = card.getBoundingClientRect()
  return (
    box.width > 0 &&
    box.bottom > 0 &&
    box.right > 0 &&
    box.top < window.innerHeight &&
    box.left < window.innerWidth
  )
}

/**
 * Roda `update` dentro de uma View Transition. A classe em <html> restringe o CSS do fundo a esta
 * transição (a do tema, com revelação circular, fica intacta); `closing` troca o fundo de "corte
 * seco" (abertura, o painel escurece sozinho) para esmaecer (fechamento). Resolve ao terminar.
 */
export async function morph(update: () => void, closing: boolean): Promise<void> {
  const classes = closing ? ['vt-demo', 'vt-demo-out'] : ['vt-demo']
  const root = document.documentElement
  root.classList.add(...classes)
  try {
    await document.startViewTransition(update).finished
  } catch {
    // transição pulada (aba oculta, outra transição no lugar): o DOM já foi atualizado
  } finally {
    root.classList.remove(...classes)
  }
}
