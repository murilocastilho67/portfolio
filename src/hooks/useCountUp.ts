import { useEffect, useState } from 'react'

/** Anima de 0 até `target` quando `run` vira `true`. Sem animação, devolve `target` direto. */
export function useCountUp(
  target: number,
  run: boolean,
  animate: boolean,
  durationMs = 1300,
): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!run || !animate) return

    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, run, animate, durationMs])

  return animate ? value : target
}
