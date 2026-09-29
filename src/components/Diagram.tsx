import { useId, type CSSProperties } from 'react'
import { useInView } from '../hooks/useInView'

interface DiagramProps {
  /** Quatro etapas; use `Título|subtítulo` para uma segunda linha. */
  steps: readonly string[]
  label: string
}

const NODE_W = 140
const NODE_H = 52
const COLS = [10, 190] as const
const ROWS = [10, 98] as const

/** Posições em zigue-zague: 1→2 na linha de cima, 2→3 desce em cotovelo, 3→4 na linha de baixo. */
const positions = [
  { x: COLS[0], y: ROWS[0] },
  { x: COLS[1], y: ROWS[0] },
  { x: COLS[0], y: ROWS[1] },
  { x: COLS[1], y: ROWS[1] },
]

const connectors = [
  { path: 'M150 36H188', head: 'M182 31.5 188 36 182 40.5' },
  { path: 'M260 62V80H80V96', head: 'M75.5 90 80 96 84.5 90' },
  { path: 'M150 124H188', head: 'M182 119.5 188 124 182 128.5' },
]

/** Esquema do fluxo de um sistema: quatro caixas ligadas por setas que se desenham ao entrar na tela. */
export function Diagram({ steps, label }: DiagramProps) {
  const titleId = useId()
  const [ref, inView] = useInView<SVGSVGElement>({ threshold: 0.4 })

  return (
    <svg
      ref={ref}
      viewBox="0 0 340 160"
      role="img"
      aria-labelledby={titleId}
      data-inview={inView}
      className="diagram mx-auto h-auto w-full max-w-[26rem]"
    >
      <title id={titleId}>{label}</title>

      {connectors.map((c, i) => (
        <g key={c.path} style={{ '--i': i } as CSSProperties}>
          <path
            d={c.path}
            pathLength={1}
            className="dg-conn fill-none stroke-accent"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={c.head}
            className="dg-head fill-none stroke-accent"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {positions.map(({ x, y }, i) => {
        const [title = '', sub] = (steps[i] ?? '').split('|')
        const last = i === positions.length - 1
        return (
          <g key={i} aria-hidden="true">
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx="6"
              className={last ? 'fill-accent-soft stroke-accent' : 'fill-bg stroke-line'}
              strokeWidth="1"
            />
            <text
              x={x + NODE_W / 2}
              y={sub ? y + 22 : y + 31}
              textAnchor="middle"
              className={`font-mono text-[12px] font-semibold ${last ? 'fill-accent' : 'fill-text'}`}
            >
              {title}
            </text>
            {sub && (
              <text
                x={x + NODE_W / 2}
                y={y + 38}
                textAnchor="middle"
                className="fill-muted font-mono text-[10.5px]"
              >
                {sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
