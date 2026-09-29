import type { Lang } from '../i18n/context'

export type AskErrorCode = 'offline' | 'rate_limited' | 'network'

export interface AskSource {
  id: string
  label: string
}

export interface AskHandlers {
  onSources: (count: number, sources: AskSource[]) => void
  onDelta: (text: string) => void
}

export class AskError extends Error {
  code: AskErrorCode

  constructor(code: AskErrorCode) {
    super(code)
    this.code = code
  }
}

/** Códigos do backend → mensagem do terminal. Falha do Gemini é tratada como falha de conexão. */
function toErrorCode(raw: unknown): AskErrorCode {
  if (raw === 'rate_limited') return 'rate_limited'
  if (raw === 'offline' || raw === 'index_missing') return 'offline'
  return 'network'
}

async function errorFromResponse(response: Response): Promise<AskError> {
  // Sem `/api` (ex.: preview estático) o servidor responde 404 com HTML, não JSON.
  if (response.status === 404) return new AskError('offline')
  const body: unknown = await response.json().catch(() => null)
  const code = typeof body === 'object' && body !== null && 'error' in body ? body.error : null
  return new AskError(toErrorCode(code))
}

/** Trata um evento do stream (`event:` + `data:`). Devolve `true` no evento `done`. */
function handleEvent(block: string, handlers: AskHandlers): boolean {
  const name = /^event: (.+)$/m.exec(block)?.[1]
  const data = /^data: (.*)$/m.exec(block)?.[1]
  if (!name || data === undefined) return false

  const payload = JSON.parse(data) as {
    count?: number
    sources?: AskSource[]
    text?: string
    error?: string
  }
  if (name === 'sources') handlers.onSources(payload.count ?? 0, payload.sources ?? [])
  else if (name === 'delta') handlers.onDelta(payload.text ?? '')
  else if (name === 'error') throw new AskError(toErrorCode(payload.error))
  return name === 'done'
}

/**
 * Faz a pergunta em `/api/ask` e repassa o stream (`sources`, `delta`...) aos handlers.
 * Rejeita com `AskError`; cancelar pelo `signal` rejeita com `AbortError`.
 */
export async function ask(
  question: string,
  lang: Lang,
  signal: AbortSignal,
  handlers: AskHandlers,
): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question, lang }),
      signal,
    })
  } catch (error) {
    if (signal.aborted) throw error
    throw new AskError('network')
  }
  if (!response.ok || !response.body) throw await errorFromResponse(response)

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finished = false
  try {
    while (!finished) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split('\n\n')
      buffer = blocks.pop() ?? ''
      for (const block of blocks) finished = handleEvent(block, handlers) || finished
    }
  } catch (error) {
    if (signal.aborted || error instanceof AskError) throw error
    throw new AskError('network')
  }
  if (!finished) throw new AskError('network')
}
