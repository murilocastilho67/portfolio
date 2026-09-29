import ragIndex from './data/rag-index.json' with { type: 'json' }
import { encodeEvent, jsonError, type AskEvent } from './lib/events.ts'
import { embedQuery, GeminiError, streamAnswer } from './lib/gemini.ts'
import { createGeminiSseParser } from './lib/gemini-sse.ts'
import { buildPrompt } from './lib/prompt.ts'
import { clientIp, createRateLimiter } from './lib/rate-limit.ts'
import { retrieve } from './lib/retrieve.ts'
import {
  chunkLabel,
  type AskSource,
  type Lang,
  type RagChunk,
  type ScoredChunk,
} from './lib/types.ts'
import { validateAsk } from './lib/validate.ts'

const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
const DEFAULT_EMBED_MODEL = 'gemini-embedding-001'

const index: readonly RagChunk[] = ragIndex
const allow = createRateLimiter({ perMinute: 6, perDay: 40 })

/** Fontes citadas: uma por rótulo, na ordem de relevância. */
function toSources(chunks: readonly ScoredChunk[], lang: Lang): AskSource[] {
  const sources = new Map<string, AskSource>()
  for (const { chunk } of chunks) {
    const label = chunkLabel(chunk, lang)
    if (!sources.has(label)) sources.set(label, { id: chunk.section, label })
  }
  return [...sources.values()]
}

/** Converte o SSE do Gemini no SSE do site: `sources`, vários `delta` e `done` (ou `error`). */
function relay(upstream: Response, sources: AskSource[], count: number): Response {
  const reader = (upstream.body as ReadableStream<Uint8Array>).getReader()
  const decoder = new TextDecoder()
  const parse = createGeminiSseParser()
  let cancelled = false

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Depois que o cliente desconecta o controller já não aceita eventos.
      const send = (event: AskEvent) => {
        if (!cancelled) controller.enqueue(encodeEvent(event))
      }
      let answered = false

      send({ event: 'sources', data: { count, sources } })
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          for (const event of parse(decoder.decode(value, { stream: true }))) {
            if (event.type === 'error') {
              send({ event: 'error', data: { error: 'upstream' } })
              return
            }
            answered = true
            send({ event: 'delta', data: { text: event.text } })
          }
        }
        if (answered) send({ event: 'done', data: {} })
        else send({ event: 'error', data: { error: 'upstream' } })
      } catch {
        send({ event: 'error', data: { error: 'upstream' } })
      } finally {
        if (!cancelled) controller.close()
      }
    },
    cancel() {
      cancelled = true
      return reader.cancel()
    },
  })

  return new Response(body, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
    },
  })
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') return jsonError(405, 'bad_request', { allow: 'POST' })

  if (!allow(clientIp(request.headers))) return jsonError(429, 'rate_limited')

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return jsonError(503, 'offline')
  if (index.length === 0 || index.some((chunk) => chunk.embedding.length === 0)) {
    return jsonError(503, 'index_missing')
  }

  const input = validateAsk(await request.json().catch(() => null))
  if (!input.ok) return jsonError(400, 'bad_request')
  const { question, lang } = input

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const embedModel = process.env.GEMINI_EMBED_MODEL || DEFAULT_EMBED_MODEL

  try {
    const query = await embedQuery(apiKey, embedModel, question)
    const { chunks, confident } = retrieve(query, index)
    const prompt = buildPrompt(question, lang, chunks, confident)
    const upstream = await streamAnswer(apiKey, model, prompt, request.signal)
    return relay(upstream, toSources(chunks, lang), chunks.length)
  } catch (error) {
    if (error instanceof GeminiError && error.status === 429) return jsonError(429, 'rate_limited')
    return jsonError(502, 'upstream')
  }
}
