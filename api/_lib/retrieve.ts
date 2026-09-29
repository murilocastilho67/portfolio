import type { RagChunk, ScoredChunk } from './types.ts'
import { dot } from './vector.ts'

export interface RetrieveOptions {
  topK?: number
  /** Similaridade mínima para um trecho contar como relevante. */
  minScore?: number
  /** Quantos trechos ainda seguem para o prompt quando nenhum passa do mínimo. */
  fallbackK?: number
}

export interface Retrieval {
  chunks: ScoredChunk[]
  /** `false` quando nenhum trecho passou do mínimo: o prompt deve deixar o modelo admitir que não sabe. */
  confident: boolean
}

/** Ordena os trechos por similaridade com a consulta (vetores já normalizados). */
export function retrieve(
  query: readonly number[],
  index: readonly RagChunk[],
  { topK = 4, minScore = 0.45, fallbackK = 2 }: RetrieveOptions = {},
): Retrieval {
  const ranked = index
    .filter((chunk) => chunk.embedding.length === query.length)
    .map((chunk) => ({ chunk, score: dot(query, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)

  const relevant = ranked.filter((item) => item.score >= minScore).slice(0, topK)
  if (relevant.length > 0) return { chunks: relevant, confident: true }
  return { chunks: ranked.slice(0, fallbackK), confident: false }
}
