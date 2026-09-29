import type { Lang } from './types.ts'

export const MIN_QUESTION = 3
export const MAX_QUESTION = 300

export type AskInput = { ok: true; question: string; lang: Lang } | { ok: false }

/** Valida o corpo `{ question, lang }` da requisição. */
export function validateAsk(body: unknown): AskInput {
  if (typeof body !== 'object' || body === null) return { ok: false }
  const { question, lang } = body as Record<string, unknown>
  if (typeof question !== 'string') return { ok: false }
  if (lang !== 'pt' && lang !== 'en') return { ok: false }

  const trimmed = question.trim()
  if (trimmed.length < MIN_QUESTION || trimmed.length > MAX_QUESTION) return { ok: false }
  return { ok: true, question: trimmed, lang }
}
