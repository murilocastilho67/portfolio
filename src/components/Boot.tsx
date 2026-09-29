import { useCallback, useEffect, useRef, useState } from 'react'
import { useScrollLock } from '../hooks/useScrollLock'
import { useT } from '../i18n/useT'
import { track } from '../lib/analytics'
import { markBooted } from '../lib/boot'

/** Intervalo entre as linhas; com 5 linhas + saída, a abertura dura cerca de 1,6 s. */
const STEP_MS = 240
/** Duração da saída (deslizar + esmaecer), igual à transição do CSS. */
const EXIT_MS = 450

/**
 * Abertura estilo boot de terminal, só na primeira visita. Decorativa: o texto fica em
 * aria-hidden e o único foco é o botão "pular"; qualquer tecla (Tab incluso) ou clique também pula.
 * O site já está renderizado por baixo, então nada de conteúdo fica preso atrás dela.
 */
export function Boot({ onDone }: { onDone: () => void }) {
  const { t } = useT()
  const lines = t.boot.steps
  const [shown, setShown] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const left = useRef(false)

  useScrollLock(true)

  const leave = useCallback((skipped: boolean) => {
    if (left.current) return
    left.current = true
    if (skipped) track('boot_skipped')
    setLeaving(true)
  }, [])

  useEffect(() => {
    markBooted()
    const timers = Array.from({ length: lines.length }, (_, i) =>
      window.setTimeout(() => setShown(i + 1), i * STEP_MS),
    )
    timers.push(window.setTimeout(() => leave(false), lines.length * STEP_MS + 200))
    return () => timers.forEach(window.clearTimeout)
  }, [lines.length, leave])

  useEffect(() => {
    const skip = () => leave(true)
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [leave])

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(onDone, EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [leaving, onDone])

  return (
    <div
      className={`theme-dark-island fixed inset-0 z-[90] flex items-center justify-center bg-bg px-6 font-mono transition-[transform,opacity] duration-[450ms] ease-soft ${
        leaving ? '-translate-y-full opacity-0' : ''
      }`}
    >
      <div aria-hidden="true" className="w-full max-w-sm text-[13px] leading-relaxed sm:text-sm">
        <p className="mb-2 font-bold text-text">{t.boot.title}</p>
        {lines.slice(0, shown).map((line) => (
          <p key={line} className="text-text/90">
            <span className="text-ok">[ ok ]</span> {line}
          </p>
        ))}
        <div className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-accent transition-[width] duration-[240ms] ease-linear"
            style={{ width: `${(shown / lines.length) * 100}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => leave(true)}
        aria-label={t.boot.skipLabel}
        className="soft absolute right-5 bottom-5 inline-flex min-h-11 cursor-pointer items-center rounded-md border border-line px-4 text-xs text-muted hover:border-accent/60 hover:text-text"
      >
        {t.boot.skip}
      </button>
    </div>
  )
}
