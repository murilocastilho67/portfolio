/** Rola até a seção; o comportamento suave (ou não) vem do CSS e respeita prefers-reduced-motion. */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
}
