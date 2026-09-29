import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface Particle {
  x: number
  /** Posição no campo inteiro (altura da página), não na tela. */
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
/** Área (px²) por partícula: define a densidade. */
const AREA_PER_PARTICLE = 15000
/**
 * Fração da rolagem que o campo acompanha. Menor que 1 = parallax: os pontos descem mais
 * devagar que o conteúdo e dão profundidade. Com redução de movimento usa 1 (rola junto
 * com a página, sem movimento extra).
 */
const PARALLAX = 0.5

function spawn(width: number, fromY: number, toY: number): Particle[] {
  const count = Math.round((width * (toY - fromY)) / AREA_PER_PARTICLE)
  return Array.from({ length: Math.max(0, count) }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.08 + Math.random() * 0.18
    return {
      x: Math.random() * width,
      y: fromY + Math.random() * (toY - fromY),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 0.8 + Math.random() * 1.3,
    }
  })
}

/**
 * Fundo: luz ambiente difusa + rede de partículas em canvas que cobre a página inteira.
 * O canvas é fixo, mas o campo de pontos rola em parallax, então cada trecho da página tem
 * pontos próprios. Os pontos flutuam devagar e se ligam entre si; perto do cursor, ganham
 * linhas até ele. Com redução de movimento os pontos não flutuam, mas as linhas até o cursor
 * continuam, porque só aparecem em resposta ao próprio usuário.
 */
export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const parallax = reduced ? 1 : PARALLAX
    let width = 0
    let height = 0
    let fieldHeight = 0
    let particles: Particle[] = []
    const pointer = { x: 0, y: 0, active: false }
    let frame = 0
    let pendingDraw = 0
    let last = performance.now()

    const offset = () => window.scrollY * parallax

    /** Ajusta o campo à altura da página; só recria tudo se a largura mudar. */
    const syncField = () => {
      const docHeight = document.documentElement.scrollHeight
      const next = height + Math.max(0, docHeight - height) * parallax
      if (particles.length === 0) {
        particles = spawn(width, 0, next)
      } else if (next > fieldHeight) {
        particles.push(...spawn(width, fieldHeight, next))
      } else if (next < fieldHeight) {
        particles = particles.filter((p) => p.y <= next)
      }
      fieldHeight = next
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      // No celular a altura muda quando a barra de endereço some; recriar aí faria os pontos saltarem.
      if (canvas.clientWidth !== width) particles = []
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      syncField()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const top = offset()
      // Só o que está na tela (com folga para as linhas que entram pela borda).
      const visible = particles.filter((p) => p.y - top > -LINK && p.y - top < height + LINK)

      for (let i = 0; i < visible.length; i++) {
        const a = visible[i]
        for (let j = i + 1; j < visible.length; j++) {
          const b = visible[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - d / LINK) * 0.22})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(a.x, a.y - top)
            ctx.lineTo(b.x, b.y - top)
            ctx.stroke()
          }
        }
      }

      if (pointer.active) {
        for (const p of visible) {
          const d = Math.hypot(p.x - pointer.x, p.y - top - pointer.y)
          if (d < REACH) {
            ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - d / REACH) * 0.6})`
            ctx.lineWidth = 0.9
            ctx.beginPath()
            ctx.moveTo(pointer.x, pointer.y)
            ctx.lineTo(p.x, p.y - top)
            ctx.stroke()
          }
        }
      }

      ctx.fillStyle = `rgba(${ACCENT}, 0.55)`
      for (const p of visible) {
        ctx.beginPath()
        ctx.arc(p.x, p.y - top, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = (now: number) => {
      // dt normalizado para 60 fps: a velocidade não depende da taxa de atualização da tela.
      const dt = Math.min((now - last) / 16.67, 3)
      last = now
      const top = offset()
      for (const p of particles) {
        if (pointer.active) {
          const dx = pointer.x - p.x
          const dy = pointer.y - (p.y - top)
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
        if (p.y < -10) p.y = fieldHeight + 10
        else if (p.y > fieldHeight + 10) p.y = -10
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
    /** Sem o laço de animação (redução de movimento), redesenha uma vez por frame sob demanda. */
    const requestDraw = () => {
      if (frame || pendingDraw) return
      pendingDraw = requestAnimationFrame(() => {
        pendingDraw = 0
        draw()
      })
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
      requestDraw()
    }
    const onPointerLeave = () => {
      pointer.active = false
      requestDraw()
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    // Canvas: pega também a página que carrega numa aba oculta (tamanho 0).
    // Documento: a altura muda com a troca de idioma e com o conteúdo que entra ao rolar.
    const observer = new ResizeObserver((entries) => {
      if (entries.some((e) => e.target === canvas)) resize()
      else syncField()
      requestDraw()
    })

    observer.observe(canvas)
    observer.observe(document.documentElement)
    start()
    window.addEventListener('scroll', requestDraw, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      cancelAnimationFrame(pendingDraw)
      observer.disconnect()
      window.removeEventListener('scroll', requestDraw)
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
