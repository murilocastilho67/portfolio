import { track } from './analytics'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const META_COLOR: Record<Theme, string> = { light: '#F6F3EC', dark: '#0B0D10' }
const listeners = new Set<() => void>()

function readSaved(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage indisponível (modo privado, bloqueio de cookies)
  }
  return null
}

const systemQuery = () => window.matchMedia('(prefers-color-scheme: light)')

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Aplica o tema no documento (atributo, metas do navegador) e avisa quem escuta. */
function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme])
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme)
  listeners.forEach((listener) => listener())
}

export interface Origin {
  x: number
  y: number
}

/**
 * Troca o tema por escolha explícita (persiste). Com View Transitions e sem redução de
 * movimento, o tema novo se revela em círculo a partir de `origin` (padrão: centro da tela).
 */
export function setTheme(theme: Theme, origin?: Origin) {
  if (theme === getTheme()) return
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // preferência não persistida, sem impacto na navegação
  }
  track('switch_theme')

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof document.startViewTransition !== 'function') {
    apply(theme)
    return
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const { style } = document.documentElement
  style.setProperty('--vt-x', `${x}px`)
  style.setProperty('--vt-y', `${y}px`)
  style.setProperty('--vt-r', `${radius}px`)
  document.startViewTransition(() => apply(theme))
}

/** Enquanto não houver escolha salva, acompanha o tema do sistema ao vivo. */
export function followSystemTheme(): () => void {
  const query = systemQuery()
  const onChange = () => {
    if (readSaved() === null) apply(query.matches ? 'light' : 'dark')
  }
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
