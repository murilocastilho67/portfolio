import Lenis from 'lenis'

/** Altura do cabeçalho fixo, descontada ao rolar até uma seção. */
const HEADER_OFFSET = -72

let lenis: Lenis | null = null

/**
 * Liga a rolagem com inércia (Lenis). Retorna a função que desliga.
 * Quem chama decide quando ligar; com redução de movimento, não ligue.
 */
export function startSmoothScroll(): () => void {
  const instance = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 0.9,
    autoRaf: true,
    anchors: { offset: HEADER_OFFSET },
  })
  lenis = instance
  return () => {
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

/** Congela/retoma a inércia enquanto um diálogo trava o scroll da página. */
export function setSmoothScrollPaused(paused: boolean) {
  if (paused) lenis?.stop()
  else lenis?.start()
}

/** Rola até a seção: com Lenis ativo desliza com inércia; sem ele, o CSS decide (e respeita prefers-reduced-motion). */
export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  if (lenis) lenis.scrollTo(target, { offset: HEADER_OFFSET })
  else target.scrollIntoView({ block: 'start' })
}
