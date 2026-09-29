import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createGeminiSseParser, type GeminiEvent } from '../api/_lib/gemini-sse.ts'
import { buildPrompt } from '../api/_lib/prompt.ts'
import { clientIp, createRateLimiter } from '../api/_lib/rate-limit.ts'
import { retrieve } from '../api/_lib/retrieve.ts'
import type { RagChunk } from '../api/_lib/types.ts'
import { validateAsk } from '../api/_lib/validate.ts'
import { dot, l2Normalize } from '../api/_lib/vector.ts'

function chunk(id: string, embedding: number[]): RagChunk {
  return {
    id,
    section: 'sobre',
    label_pt: `Sobre · ${id}`,
    label_en: `About · ${id}`,
    text: `texto ${id}`,
    embedding,
  }
}

test('l2Normalize devolve vetor de norma 1', () => {
  const v = l2Normalize([3, 4])
  assert.deepEqual(v, [0.6, 0.8])
  assert.ok(Math.abs(dot(v, v) - 1) < 1e-12)
})

test('retrieve ordena por similaridade e respeita topK e o mínimo', () => {
  const index = [
    chunk('c', [0, 1]),
    chunk('a', [1, 0]),
    chunk('b', l2Normalize([1, 1])),
    chunk('sem-vetor', []),
  ]
  const { chunks, confident } = retrieve([1, 0], index, { topK: 2, minScore: 0.5 })
  assert.equal(confident, true)
  assert.deepEqual(
    chunks.map((item) => item.chunk.id),
    ['a', 'b'],
  )
})

test('retrieve sem trecho acima do mínimo cai nos melhores e marca confident=false', () => {
  const index = [chunk('a', [0, 1]), chunk('b', l2Normalize([0.2, 1])), chunk('c', [0, -1])]
  const { chunks, confident } = retrieve([1, 0], index, { minScore: 0.9, fallbackK: 2 })
  assert.equal(confident, false)
  assert.deepEqual(
    chunks.map((item) => item.chunk.id),
    ['b', 'a'],
  )
})

const sse = (...payloads: object[]) =>
  payloads.map((payload) => `data: ${JSON.stringify(payload)}\r\n\r\n`).join('')

const part = (text: string, extra: object = {}) => ({
  candidates: [{ content: { role: 'model', parts: [{ text, ...extra }] } }],
})

test('parser do SSE do Gemini extrai deltas e ignora partes de raciocínio', () => {
  const parse = createGeminiSseParser()
  const events = parse(sse(part('Olá'), part('pensando', { thought: true }), part(', mundo')))
  assert.deepEqual(events, [
    { type: 'delta', text: 'Olá' },
    { type: 'delta', text: ', mundo' },
  ] satisfies GeminiEvent[])
})

test('parser junta um evento cortado entre dois pedaços de rede', () => {
  const parse = createGeminiSseParser()
  const payload = sse(part('resposta completa'))
  const cut = 20
  assert.deepEqual(parse(payload.slice(0, cut)), [])
  assert.deepEqual(parse(payload.slice(cut)), [{ type: 'delta', text: 'resposta completa' }])
})

test('parser sinaliza bloqueio e JSON inválido', () => {
  const parse = createGeminiSseParser()
  assert.deepEqual(parse(sse({ promptFeedback: { blockReason: 'SAFETY' } })), [
    { type: 'error', reason: 'blocked' },
  ])
  assert.deepEqual(parse('data: {quebrado\n\n'), [{ type: 'error', reason: 'malformed' }])
})

test('rate limiter: 6 por minuto, 40 por dia, por IP', () => {
  const allow = createRateLimiter({ perMinute: 6, perDay: 40 })
  const t0 = 1_000_000
  for (let i = 0; i < 6; i++) assert.equal(allow('1.1.1.1', t0 + i), true)
  assert.equal(allow('1.1.1.1', t0 + 10), false)
  assert.equal(allow('2.2.2.2', t0 + 10), true)
  assert.equal(allow('1.1.1.1', t0 + 61_000), true)

  const daily = createRateLimiter({ perMinute: 6, perDay: 40 })
  let allowed = 0
  for (let i = 0; i < 60; i++) if (daily('3.3.3.3', t0 + i * 61_000)) allowed++
  assert.equal(allowed, 40)
  assert.equal(daily('3.3.3.3', t0 + 24 * 60 * 60_000 + 61_000 * 61), true)
})

test('clientIp usa o primeiro x-forwarded-for, depois x-real-ip', () => {
  assert.equal(clientIp(new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' })), '9.9.9.9')
  assert.equal(clientIp(new Headers({ 'x-real-ip': '8.8.8.8' })), '8.8.8.8')
  assert.equal(clientIp(new Headers()), 'unknown')
})

test('validateAsk aceita 3–300 caracteres após trim e exige lang', () => {
  assert.deepEqual(validateAsk({ question: '  oi?  ', lang: 'pt' }), {
    ok: true,
    question: 'oi?',
    lang: 'pt',
  })
  assert.equal(validateAsk({ question: 'ab', lang: 'pt' }).ok, false)
  assert.equal(validateAsk({ question: ' a ', lang: 'pt' }).ok, false)
  assert.equal(validateAsk({ question: 'x'.repeat(300), lang: 'en' }).ok, true)
  assert.equal(validateAsk({ question: 'x'.repeat(301), lang: 'en' }).ok, false)
  assert.equal(validateAsk({ question: 'tudo bem?', lang: 'fr' }).ok, false)
  assert.equal(validateAsk({ question: 42, lang: 'pt' }).ok, false)
  assert.equal(validateAsk(null).ok, false)
})

test('buildPrompt inclui rótulos no idioma pedido e o aviso de baixa confiança', () => {
  const scored = [{ chunk: chunk('a', [1]), score: 0.3 }]
  const weak = buildPrompt('quem é?', 'en', scored, false)
  assert.match(weak.userText, /\[1\] About · a\ntexto a/)
  assert.match(weak.userText, /IDIOMA DA RESPOSTA: en/)
  assert.match(weak.userText, /nenhum trecho ficou claramente próximo/)
  assert.doesNotMatch(buildPrompt('quem é?', 'pt', scored, true).userText, /nenhum trecho/)
})
