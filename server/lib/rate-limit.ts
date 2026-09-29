const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
/** Acima disso o mapa é varrido para descartar IPs sem atividade recente. */
const SWEEP_AT = 5_000

export interface RateLimits {
  perMinute: number
  perDay: number
}

/**
 * Limitador por IP em memória, best-effort: as instâncias da função são efêmeras e não
 * compartilham estado, então o limite real de custo é a cota gratuita do Gemini em um projeto
 * sem billing. Isto só barra rajadas óbvias de um mesmo cliente.
 */
export function createRateLimiter({ perMinute, perDay }: RateLimits) {
  const hits = new Map<string, number[]>()

  function sweep(now: number) {
    for (const [ip, times] of hits) {
      if (times.every((time) => now - time >= DAY)) hits.delete(ip)
    }
  }

  /** Registra a tentativa e devolve `false` se o IP estourou o limite. */
  return function allow(ip: string, now: number = Date.now()): boolean {
    if (hits.size > SWEEP_AT) sweep(now)

    const times = (hits.get(ip) ?? []).filter((time) => now - time < DAY)
    const lastMinute = times.filter((time) => now - time < MINUTE).length
    if (lastMinute >= perMinute || times.length >= perDay) {
      hits.set(ip, times)
      return false
    }
    times.push(now)
    hits.set(ip, times)
    return true
  }
}

/** IP do cliente: primeiro item de `x-forwarded-for`, depois `x-real-ip`. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown'
}
