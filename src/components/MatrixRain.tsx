import { useEffect, useRef, useState } from 'react'

const GLYPHS = '01{}<>/;λ=>_[]'.split('')
const FONT_PX = 16
const TRAIL = 16
/** Duração total do efeito; o último segundo é o esmaecer. */
const TOTAL_MS = 6000
const FADE_MS = 1000

interface Drop {
  /** Linha da cabeça (fracionária, avança por frame). */
  row: number
  speed: number
  chars: string[]
}

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

/**
 * "Modo turbo": chuva digital âmbar sobre a página por 6 s. Decorativa (aria-hidden) e sem
 * captura de ponteiro. Cada coluna guarda os últimos caracteres da cabeça para a cauda não piscar.
 */
export function MatrixRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fade = window.setTimeout(() => setFading(true), TOTAL_MS - FADE_MS)
    const done = window.setTimeout(onDone, TOTAL_MS)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(done)
    }
  }, [onDone])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = `${FONT_PX}px 'JetBrains Mono Variable', ui-monospace, monospace`
    ctx.textAlign = 'center'

    const rows = Math.ceil(height / FONT_PX)
    const drops: Drop[] = Array.from({ length: Math.ceil(width / FONT_PX) }, () => ({
      row: -Math.random() * rows,
      speed: 0.25 + Math.random() * 0.4,
      chars: [],
    }))

    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3)
      last = now
      // Véu escuro: dá contraste ao âmbar também sobre o tema claro.
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(11, 13, 16, 0.62)'
      ctx.fillRect(0, 0, width, height)

      drops.forEach((drop, col) => {
        const before = Math.floor(drop.row)
        drop.row += drop.speed * dt
        for (let r = before; r < Math.floor(drop.row); r++) drop.chars.unshift(randomGlyph())
        drop.chars.length = Math.min(drop.chars.length, TRAIL)

        const head = Math.floor(drop.row)
        drop.chars.forEach((glyph, i) => {
          const y = (head - i) * FONT_PX
          if (y < -FONT_PX || y > height + FONT_PX) return
          ctx.fillStyle = i === 0 ? 'rgb(255, 226, 168)' : `rgba(242, 169, 59, ${1 - i / TRAIL})`
          ctx.fillText(glyph, col * FONT_PX + FONT_PX / 2, y)
        })
        if ((head - TRAIL) * FONT_PX > height) {
          drop.row = -Math.random() * 12
          drop.chars = []
        }
      })
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[75] size-full transition-opacity duration-1000 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    />
  )
}
