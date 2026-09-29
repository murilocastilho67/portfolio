/**
 * Peso variável reativo ao cursor nos títulos cinéticos. Um único conjunto de listeners na janela
 * atende todos os títulos: cada movimento do mouse só agenda um quadro (rAF); no quadro, primeiro
 * LEMOS as caixas (a do título e, se o cursor está perto, a de cada letra) e só depois ESCREVEMOS
 * o nível 0..1 de cada letra em `--kt-t` (o CSS converte em `wght`). Toque e caneta não participam.
 */

/** Distância (px) do cursor até o centro da letra em que o efeito some. */
const RADIUS = 130
/** Fração do caminho percorrida por quadro rumo ao alvo (1 = instantâneo). */
const EASE = 0.2

interface Title {
  root: HTMLElement
  chars: HTMLElement[]
  levels: number[]
  /** Alguma letra ainda está acima de zero (precisa voltar ao repouso mesmo com o cursor longe). */
  raised: boolean
}

interface Point {
  x: number
  y: number
}

const titles = new Set<Title>()
let pointer: Point | null = null
let frame = 0

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const smooth = (t: number) => t * t * (3 - 2 * t)

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick)
}

/** Alvo 0..1 de cada letra: 1 sob o cursor, 0 a partir do raio. */
function goalsFor(title: Title, at: Point): number[] {
  return title.chars.map((char) => {
    const rect = char.getBoundingClientRect()
    const distance = Math.hypot(
      at.x - (rect.left + rect.width / 2),
      at.y - (rect.top + rect.height / 2),
    )
    return distance >= RADIUS ? 0 : smooth(1 - distance / RADIUS)
  })
}

function isNear(box: DOMRect, at: Point) {
  return (
    at.x > box.left - RADIUS &&
    at.x < box.right + RADIUS &&
    at.y > box.top - RADIUS &&
    at.y < box.bottom + RADIUS
  )
}

function tick() {
  frame = 0
  // Sem redução de movimento a subida/descida é suavizada; com ela, o peso segue o cursor direto.
  const ease = reducedMotion() ? 1 : EASE
  let unsettled = false

  // Leitura: nada é escrito até todas as caixas serem lidas.
  const goals = new Map<Title, number[]>()
  for (const title of titles) {
    const near = pointer !== null && isNear(title.root.getBoundingClientRect(), pointer)
    if (pointer && near) goals.set(title, goalsFor(title, pointer))
    else if (title.raised)
      goals.set(
        title,
        title.chars.map(() => 0),
      )
  }

  // Escrita.
  for (const [title, targets] of goals) {
    let raised = false
    title.chars.forEach((char, i) => {
      const goal = targets[i] ?? 0
      const before = title.levels[i] ?? 0
      const level = Math.abs(goal - before) < 0.01 ? goal : before + (goal - before) * ease
      if (level !== goal) unsettled = true
      if (level > 0) raised = true
      if (level === before) return
      title.levels[i] = level
      if (level > 0) char.style.setProperty('--kt-t', level.toFixed(3))
      else char.style.removeProperty('--kt-t')
    })
    title.raised = raised
  }
  if (unsettled) schedule()
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  // Sobre uma janela modal (demo, paleta) os títulos de trás não reagem.
  const modal = event.target instanceof Element && event.target.closest('[aria-modal="true"]')
  pointer = modal ? null : { x: event.clientX, y: event.clientY }
  schedule()
}

/** O cursor saiu da página (relatedTarget nulo): os títulos voltam ao repouso. */
function onPointerOut(event: PointerEvent) {
  if (event.relatedTarget !== null) return
  pointer = null
  schedule()
}

/** Com o cursor parado a página rola por baixo dele: recalcula. */
function onScroll() {
  if (pointer) schedule()
}

function attach() {
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerout', onPointerOut, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
}

function detach() {
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerout', onPointerOut)
  window.removeEventListener('scroll', onScroll)
  pointer = null
  cancelAnimationFrame(frame)
  frame = 0
}

/** Liga o efeito nas letras (`.kt-c`) de um título; devolve a função que desliga e limpa os estilos. */
export function registerKinetic(root: HTMLElement): () => void {
  const chars = Array.from(root.querySelectorAll<HTMLElement>('.kt-c'))
  const title: Title = { root, chars, levels: chars.map(() => 0), raised: false }
  if (titles.size === 0) attach()
  titles.add(title)
  return () => {
    titles.delete(title)
    chars.forEach((char) => char.style.removeProperty('--kt-t'))
    if (titles.size === 0) detach()
  }
}
