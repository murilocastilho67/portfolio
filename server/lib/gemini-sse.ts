export type GeminiEvent =
  { type: 'delta'; text: string } | { type: 'error'; reason: 'blocked' | 'malformed' }

interface GeminiChunk {
  promptFeedback?: { blockReason?: string }
  candidates?: {
    finishReason?: string
    content?: { parts?: { text?: string; thought?: boolean }[] }
  }[]
}

function parseChunk(data: string): GeminiEvent[] {
  let chunk: GeminiChunk
  try {
    chunk = JSON.parse(data) as GeminiChunk
  } catch {
    return [{ type: 'error', reason: 'malformed' }]
  }
  if (chunk.promptFeedback?.blockReason) return [{ type: 'error', reason: 'blocked' }]

  const events: GeminiEvent[] = []
  for (const candidate of chunk.candidates ?? []) {
    // Partes marcadas como `thought` são raciocínio interno do modelo: nunca vão para o usuário.
    for (const part of candidate.content?.parts ?? []) {
      if (part.text && !part.thought) events.push({ type: 'delta', text: part.text })
    }
    if (candidate.finishReason === 'SAFETY') events.push({ type: 'error', reason: 'blocked' })
  }
  return events
}

/**
 * Parser incremental do SSE do `streamGenerateContent?alt=sse`. Os pedaços de rede podem cortar
 * um evento ao meio, então o resto incompleto fica guardado até o próximo `push`.
 */
export function createGeminiSseParser() {
  let buffer = ''

  return function push(text: string): GeminiEvent[] {
    buffer += text
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''

    const events: GeminiEvent[] = []
    for (const block of blocks) {
      const data = block
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n')
      if (data) events.push(...parseChunk(data))
    }
    return events
  }
}
