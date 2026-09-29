import { useId, type CSSProperties } from 'react'
import { useInView } from '../hooks/useInView'

interface DiagramProps {
  /** Quatro etapas; use `Título|subtítulo` para uma segunda linha. */
  steps: readonly string[]
  label: string
}

interface Layout {
  viewBox: string
  nodeW: number
  nodeH: number
  nodes: readonly { x: number; y: number }[]
  connectors: readonly { path: string; head: string }[]
  className: string
}

/** Desktop: zigue-zague 2x2 (1→2 em cima, cotovelo descendo, 3→4 embaixo). */
const GRID: Layout = {
  viewBox: '0 0 340 160',
  nodeW: 140,
  nodeH: 52,
  nodes: [
    { x: 10, y: 10 },
    { x: 190, y: 10 },
    { x: 10, y: 98 },
    { x: 190, y: 98 },
  ],
  connectors: [
    { path: 'M150 36H188', head: 'M182 31.5 188 36 182 40.5' },
    { path: 'M260 62V80H80V96', head: 'M75.5 90 80 96 84.5 90' },
    { path: 'M150 124H188', head: 'M182 119.5 188 124 182 128.5' },
  ],
  className: 'hidden max-w-[26rem] sm:block',
}

/** Celular: coluna única, para o texto não encolher junto com o card. */
const STACK: Layout = (() => {
  const nodeW = 220
  const nodeH = 46
  const gap = 22
  const x = 10
  const cx = x + nodeW / 2
  const nodes = [0, 1, 2, 3].map((i) => ({ x, y: 6 + i * (nodeH + gap) }))
  const connectors = nodes.slice(0, -1).map(({ y }) => {
    const from = y + nodeH + 2
    const to = y + nodeH + gap - 2
    return {
      path: `M${cx} ${from}V${to}`,
      head: `M${cx - 4.5} ${to - 6} ${cx} ${to} ${cx + 4.5} ${to - 6}`,
    }
  })
  const height = nodes[3].y + nodeH + 6
  return {
    viewBox: `0 0 ${nodeW + 20} ${height}`,
    nodeW,
    nodeH,
    nodes,
    connectors,
    className: 'max-w-[18rem] sm:hidden',
  }
})()

/** Esquema do fluxo de um sistema: quatro caixas ligadas por setas que se desenham ao entrar na tela. */
export function Diagram({ steps, label }: DiagramProps) {
  return (
    <>
      <DiagramSvg steps={steps} label={label} layout={GRID} />
      <DiagramSvg steps={steps} label={label} layout={STACK} />
    </>
  )
}

function DiagramSvg({ steps, label, layout }: DiagramProps & { layout: Layout }) {
  const titleId = useId()
  const [ref, inView] = useInView<SVGSVGElement>({ threshold: 0.4 })
  const { nodeW, nodeH } = layout

  return (
    <svg
      ref={ref}
      viewBox={layout.viewBox}
      role="img"
      aria-labelledby={titleId}
      data-inview={inView}
      className={`diagram mx-auto h-auto w-full ${layout.className}`}
    >
      <title id={titleId}>{label}</title>

      {layout.connectors.map((c, i) => (
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

      {layout.nodes.map(({ x, y }, i) => {
        const [title = '', sub] = (steps[i] ?? '').split('|')
        const last = i === layout.nodes.length - 1
        return (
          <g key={i} aria-hidden="true">
            <rect
              x={x}
              y={y}
              width={nodeW}
              height={nodeH}
              rx="6"
              className={last ? 'fill-accent-soft stroke-accent' : 'fill-bg stroke-line'}
              strokeWidth="1"
            />
            <text
              x={x + nodeW / 2}
              y={sub ? y + nodeH / 2 - 4 : y + nodeH / 2 + 4.5}
              textAnchor="middle"
              className={`font-mono text-[12px] font-semibold ${last ? 'fill-accent' : 'fill-text'}`}
            >
              {title}
            </text>
            {sub && (
              <text
                x={x + nodeW / 2}
                y={y + nodeH / 2 + 12}
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
