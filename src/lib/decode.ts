/** Símbolos do "ruído" de terminal que antecede cada letra. */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*+=<>/\\_'
/** Cada letra ainda embaralhada troca de símbolo neste intervalo (ms). */
const FLIP_MS = 55
/** Quando a primeira letra trava e em quanto tempo as demais a seguem, da esquerda para a direita. */
const FIRST_LOCK_MS = 260
const SPREAD_MS = 520
const JITTER_MS = 70
/** Pausa com tudo travado antes de encerrar. */
const HOLD_MS = 90

const noise = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '#'

/** Preenche as camadas de ruído com símbolos aleatórios (estado antes de decodificar). */
export function fillNoise(layers: readonly HTMLElement[]) {
  layers.forEach((layer) => {
    layer.textContent = noise()
  })
}

/**
 * Decodifica da esquerda para a direita (~0,9 s): cada camada troca de símbolo até "travar", quando
 * some e a letra real (já no DOM, com acento e kerning certos) aparece no lugar (`data-locked` na
 * letra). Só mexe nas camadas de ruído, nunca no layout. Devolve o cancelamento.
 */
export function decode(layers: readonly HTMLElement[], onDone: () => void): () => void {
  const last = Math.max(layers.length - 1, 1)
  const lockAt = layers.map(
    (_, i) => FIRST_LOCK_MS + (i / last) * SPREAD_MS + Math.random() * JITTER_MS,
  )
  const locked = layers.map(() => false)
  // Recomeço depois de uma interrupção: nenhuma letra começa travada.
  layers.forEach((layer) => layer.parentElement?.removeAttribute('data-locked'))
  const end = Math.max(...lockAt, 0) + HOLD_MS
  let flippedAt = 0
  let start = 0
  let id = 0

  const step = (now: number) => {
    if (!start) start = now
    const elapsed = now - start
    if (elapsed >= end) {
      onDone()
      return
    }
    const flip = now - flippedAt >= FLIP_MS
    if (flip) flippedAt = now
    layers.forEach((layer, i) => {
      if (locked[i]) return
      if (elapsed >= (lockAt[i] ?? 0)) {
        layer.textContent = ''
        layer.parentElement?.setAttribute('data-locked', '')
        locked[i] = true
      } else if (flip) {
        layer.textContent = noise()
      }
    })
    id = requestAnimationFrame(step)
  }
  id = requestAnimationFrame(step)
  return () => cancelAnimationFrame(id)
}
