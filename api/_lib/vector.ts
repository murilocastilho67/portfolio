/** Normaliza para norma L2 = 1. O Gemini não normaliza embeddings de dimensão reduzida. */
export function l2Normalize(vector: readonly number[]): number[] {
  let sum = 0
  for (const x of vector) sum += x * x
  const norm = Math.sqrt(sum)
  return norm === 0 ? [...vector] : vector.map((x) => x / norm)
}

/** Produto escalar; equivale ao cosseno quando os dois vetores já estão normalizados. */
export function dot(a: readonly number[], b: readonly number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}
