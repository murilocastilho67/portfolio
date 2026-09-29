import type { AskSource } from './types.ts'

/** Códigos de erro que o cliente entende (`error` do JSON e do evento `error`). */
export type AskErrorCode = 'bad_request' | 'rate_limited' | 'offline' | 'index_missing' | 'upstream'

export type AskEvent =
  | { event: 'sources'; data: { count: number; sources: AskSource[] } }
  | { event: 'delta'; data: { text: string } }
  | { event: 'done'; data: Record<string, never> }
  | { event: 'error'; data: { error: AskErrorCode } }

const encoder = new TextEncoder()

/** Serializa um evento no formato `text/event-stream`. */
export function encodeEvent({ event, data }: AskEvent): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

export function jsonError(
  status: number,
  error: AskErrorCode,
  headers?: Record<string, string>,
): Response {
  return Response.json({ error }, { status, headers })
}
