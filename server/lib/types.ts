/** Trecho do conteúdo do site, já vetorizado. `embedding` vazio = índice ainda não gerado. */
export interface RagChunk {
  id: string
  /** id da seção do site (sobre, projetos, carreira...), usado para rolar até ela. */
  section: string
  label_pt: string
  label_en: string
  text: string
  embedding: number[]
}

export type Lang = 'pt' | 'en'

/** Fonte citada na resposta: `id` é a seção do site. */
export interface AskSource {
  id: string
  label: string
}

export interface ScoredChunk {
  chunk: RagChunk
  score: number
}

export function chunkLabel(chunk: RagChunk, lang: Lang): string {
  return lang === 'pt' ? chunk.label_pt : chunk.label_en
}

/** Dimensão dos embeddings (a mesma na indexação e na consulta). */
export const EMBED_DIMENSIONS = 768
