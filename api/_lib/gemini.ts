import { l2Normalize } from './vector.ts'
import { EMBED_DIMENSIONS } from './types.ts'
import type { Prompt } from './prompt.ts'

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const EMBED_TIMEOUT_MS = 15_000

type TaskType = 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT'

/** Falha de uma chamada ao Gemini, com o status HTTP devolvido por ele. */
export class GeminiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function post(url: string, apiKey: string, body: unknown, signal?: AbortSignal) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
    signal,
  })
  if (!response.ok) throw new GeminiError(response.status, await response.text())
  return response
}

interface EmbedContentResponse {
  embedding: { values: number[] }
}

interface BatchEmbedResponse {
  embeddings: { values: number[] }[]
}

/** Embedding normalizado de uma pergunta (`RETRIEVAL_QUERY`). */
export async function embedQuery(apiKey: string, model: string, text: string): Promise<number[]> {
  const response = await post(
    `${BASE_URL}/models/${model}:embedContent`,
    apiKey,
    {
      model: `models/${model}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_QUERY' satisfies TaskType,
      outputDimensionality: EMBED_DIMENSIONS,
    },
    AbortSignal.timeout(EMBED_TIMEOUT_MS),
  )
  const data = (await response.json()) as EmbedContentResponse
  return l2Normalize(data.embedding.values)
}

/** Embeddings normalizados de vários trechos (`RETRIEVAL_DOCUMENT`), na mesma ordem da entrada. */
export async function embedDocuments(
  apiKey: string,
  model: string,
  texts: readonly string[],
): Promise<number[][]> {
  const response = await post(`${BASE_URL}/models/${model}:batchEmbedContents`, apiKey, {
    requests: texts.map((text) => ({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT' satisfies TaskType,
      outputDimensionality: EMBED_DIMENSIONS,
    })),
  })
  const data = (await response.json()) as BatchEmbedResponse
  return data.embeddings.map((embedding) => l2Normalize(embedding.values))
}

/** Abre o stream SSE de geração; o corpo da resposta é lido por `createGeminiSseParser`. */
export function streamAnswer(
  apiKey: string,
  model: string,
  { systemInstruction, userText }: Prompt,
  signal: AbortSignal,
): Promise<Response> {
  return post(
    `${BASE_URL}/models/${model}:streamGenerateContent?alt=sse`,
    apiKey,
    {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 350 },
    },
    signal,
  )
}
