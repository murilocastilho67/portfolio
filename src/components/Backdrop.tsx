import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { subscribeTheme } from '../lib/theme'

interface Particle {
  x: number
  /** Posição no campo inteiro (altura da página), não na tela. */
  y: number
  vx: number
  vy: number
  r: number
}

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
/** Níveis de opacidade das linhas: cada nível é traçado de uma vez só. */
const BUCKETS = 8
/** Teto de resolução do canvas: acima disso o custo cresce e a diferença não aparece em linhas finas. */
const MAX_DPR = 1.5
/** Com o fundo "sozinho" (sem cursor nem rolagem), a flutuação lenta é desenhada a 30 fps. */
const IDLE_FRAME_MS = 33

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
    // Cor e opacidade das partículas vêm de variáveis CSS do tema; lidas só quando o tema muda.
    let accent = '242, 169, 59'
    let alpha = 1
    const readColors = () => {
      const styles = getComputedStyle(document.documentElement)
      accent = styles.getPropertyValue('--c-particle').trim() || accent
      alpha = Number(styles.getPropertyValue('--c-particle-alpha')) || 1
    }
    readColors()
    const pointer = { x: 0, y: 0, active: false }
    let frame = 0
    let pendingDraw = 0
    let last = performance.now()
    let lastDraw = 0
    let lastActivity = 0

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
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      // No celular a altura muda quando a barra de endereço some; recriar aí faria os pontos saltarem.
      if (canvas.clientWidth !== width) particles = []
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      syncField()
    }

    // Buffers reaproveitados entre quadros: o desenho não aloca nada no caminho quente.
    const visible: Particle[] = []
    const linkPaths = Array.from({ length: BUCKETS }, () => [] as number[])
    const reachPaths = Array.from({ length: BUCKETS }, () => [] as number[])

    /** Traça cada balde (mesma opacidade) com um único stroke, em vez de um por linha. */
    const strokeBuckets = (paths: number[][], maxAlpha: number, lineWidth: number) => {
      ctx.lineWidth = lineWidth
      paths.forEach((coords, bucket) => {
        if (coords.length === 0) return
        ctx.strokeStyle = `rgba(${accent}, ${((bucket + 1) / BUCKETS) * maxAlpha * alpha})`
        ctx.beginPath()
        for (let k = 0; k < coords.length; k += 4) {
          ctx.moveTo(coords[k], coords[k + 1])
          ctx.lineTo(coords[k + 2], coords[k + 3])
        }
        ctx.stroke()
        coords.length = 0
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const top = offset()
      // Só o que está na tela (com folga para as linhas que entram pela borda).
      visible.length = 0
      for (const p of particles) {
        if (p.y - top > -LINK && p.y - top < height + LINK) visible.push(p)
      }

      for (let i = 0; i < visible.length; i++) {
        const a = visible[i]
        for (let j = i + 1; j < visible.length; j++) {
          const b = visible[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 >= LINK * LINK) continue
          const bucket = Math.min(BUCKETS - 1, Math.floor((1 - Math.sqrt(d2) / LINK) * BUCKETS))
          linkPaths[bucket].push(a.x, a.y - top, b.x, b.y - top)
        }
      }
      strokeBuckets(linkPaths, 0.22, 0.7)

      if (pointer.active) {
        for (const p of visible) {
          const dx = p.x - pointer.x
          const dy = p.y - top - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 >= REACH * REACH) continue
          const bucket = Math.min(BUCKETS - 1, Math.floor((1 - Math.sqrt(d2) / REACH) * BUCKETS))
          reachPaths[bucket].push(pointer.x, pointer.y, p.x, p.y - top)
        }
        strokeBuckets(reachPaths, 0.6, 0.9)
      }

      ctx.fillStyle = `rgba(${accent}, ${0.55 * alpha})`
      ctx.beginPath()
      for (const p of visible) {
        ctx.moveTo(p.x + p.r, p.y - top)
        ctx.arc(p.x, p.y - top, p.r, 0, Math.PI * 2)
      }
      ctx.fill()
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
      // Com cursor ou rolagem recentes desenha todo quadro; só flutuando, um quadro sim, outro não.
      const idle = now - lastActivity > 400
      if (!idle || now - lastDraw >= IDLE_FRAME_MS) {
        draw()
        lastDraw = now
      }
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
      lastActivity = performance.now()
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
    const unsubscribeTheme = subscribeTheme(() => {
      readColors()
      requestDraw()
    })
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
      unsubscribeTheme()
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
      {/* Luz ambiente em gradiente radial: o mesmo halo do antigo blur(120px), sem o custo do filtro. */}
      <div className="absolute -top-[26rem] -left-[26rem] size-[62rem] bg-[radial-gradient(closest-side,var(--c-glow-a),transparent)]" />
      <div className="absolute top-[calc(33%-8rem)] -right-[26rem] size-[56rem] bg-[radial-gradient(closest-side,var(--c-glow-b),transparent)]" />
      <div className="absolute -bottom-[34rem] left-[calc(25%-8rem)] size-[58rem] bg-[radial-gradient(closest-side,var(--c-glow-c),transparent)]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-80" />
    </div>
  )
}
