const STORAGE_KEY = 'booted'

/** A abertura toca na primeira visita ou com `?boot` na URL (para demos). */
export function shouldBoot(): boolean {
  if (new URLSearchParams(window.location.search).has('boot')) return true
  try {
    return localStorage.getItem(STORAGE_KEY) === null
  } catch {
    // Sem como lembrar que já tocou, é melhor não repetir a cada visita.
    return false
  }
}

export function markBooted() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // sem persistência, sem impacto
  }
}
