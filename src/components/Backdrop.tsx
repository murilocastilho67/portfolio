import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

const ACCENT = '242, 169, 59'
/** Distância máxima para ligar dois pontos entre si. */
const LINK = 130
/** Raio em que os pontos se ligam ao cursor. */
const REACH = 190
/** Quanto o cursor puxa os pontos próximos (0 = nada). */
const PULL = 0.006
/** Abaixo dessa distância o cursor para de puxar, para os pontos não se amontoarem nele. */
const PULL_MIN = 80
/** Área de tela (px²) por partícula: define a densidade. */
const AREA_PER_PARTICLE = 15000

function spawn(width: number, height: number): Particle[] {
  const count = Math.round(Math.min(95, Math.max(28, (width * height) / AREA_PER_PARTICLE)))
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.08 + Math.random() * 0.18
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 0.8 + Math.random() * 1.3,
    }
  })
}

/**
 * Fundo fixo: luz ambiente difusa + rede de partículas em canvas.
 * Os pontos flutuam devagar e se ligam entre si; perto do cursor, ganham linhas até ele.
 * Com redução de movimento os pontos ficam parados, mas as linhas até o cursor continuam,
 * porque só aparecem em resposta ao próprio usuário.
 */
export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    const pointer = { x: 0, y: 0, active: false }
    let frame = 0
    let last = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const widthChanged = canvas.clientWidth !== width
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // No celular a altura muda quando a barra de endereço some; recriar aí faria os pontos saltarem.
      if (widthChanged || particles.length === 0) particles = spawn(width, height)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - d / LINK) * 0.22})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      if (pointer.active) {
        for (const p of particles) {
          const d = Math.hypot(p.x - pointer.x, p.y - pointer.y)
          if (d < REACH) {
            ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - d / REACH) * 0.6})`
            ctx.lineWidth = 0.9
            ctx.beginPath()
            ctx.moveTo(pointer.x, pointer.y)
            ctx.lineTo(p.x, p.y)
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = `rgba(${ACCENT}, 0.55)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = (now: number) => {
      // dt normalizado para 60 fps: a velocidade não depende da taxa de atualização da tela.
      const dt = Math.min((now - last) / 16.67, 3)
      last = now
      for (const p of particles) {
        if (pointer.active) {
          const dx = pointer.x - p.x
          const dy = pointer.y - p.y
          const d = Math.hypot(dx, dy)
          if (d < REACH && d > PULL_MIN) {
            p.x += dx * PULL * dt
            p.y += dy * PULL * dt * 0.5
          }
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < -10) p.x = width + 10
        else if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        else if (p.y > height + 10) p.y = -10
      }
      draw()
      frame = requestAnimationFrame(step)
    }

    const start = () => {
      if (reduced || frame) return
      last = performance.now()
      frame = requestAnimationFrame(step)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
      if (reduced) draw()
    }
    const onPointerLeave = () => {
      pointer.active = false
      if (reduced) draw()
    }
    const onVisibility = () => (document.hidden ? stop() : start())
    // Observa o próprio canvas: pega também o caso de a página carregar numa aba oculta (tamanho 0).
    const observer = new ResizeObserver(() => {
      resize()
      draw()
    })

    observer.observe(canvas)
    start()
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-48 -left-48 size-[46rem] rounded-full bg-accent/[0.11] blur-[120px]" />
      <div className="absolute top-1/3 -right-48 size-[38rem] rounded-full bg-[#f2703b]/[0.08] blur-[140px]" />
      <div className="absolute -bottom-56 left-1/4 size-[40rem] rounded-full bg-accent/[0.04] blur-[140px]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-80" />
    </div>
  )
}
