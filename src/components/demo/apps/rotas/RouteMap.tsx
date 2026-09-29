import { useId, type KeyboardEvent } from 'react'
import { useReducedMotion } from '../../../../hooks/useReducedMotion'
import { useCopy, useMediaQuery } from '../../kit/lib'
import { routesCopy } from '../routes.copy'
import { nodeIds, nodes, type NodeId, type Route, type Stop } from '../routes.data'

type Point = { x: number; y: number }

/** Trecho em estilo mapa de metrô: um segmento reto e um em 45°. */
function segment(a: Point, b: Point): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const adx = Math.abs(dx)
  const ady = Math.abs(dy)
  if (adx >= ady) return `L ${a.x + Math.sign(dx) * (adx - ady)} ${a.y} L ${b.x} ${b.y}`
  return `L ${a.x} ${a.y + Math.sign(dy) * (ady - adx)} L ${b.x} ${b.y}`
}

function pathOf(codes: readonly NodeId[]): string {
  const points = codes.map((code) => nodes[code])
  return points.reduce(
    (d, point, i) =>
      i === 0 ? `M ${point.x} ${point.y}` : `${d} ${segment(points[i - 1], point)}`,
    '',
  )
}

/** Enquadra o trajeto (proporção 5:2, com folga) dentro do mapa fixo de 640 x 380. */
function viewBoxOf(codes: readonly NodeId[]): string {
  const xs = codes.map((c) => nodes[c].x)
  const ys = codes.map((c) => nodes[c].y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  let w = Math.max(380, maxX - minX + 130)
  let h = w * 0.42
  if (maxY - minY + 110 > h) {
    h = maxY - minY + 110
    w = h / 0.42
  }
  return `${(minX + maxX) / 2 - w / 2} ${(minY + maxY) / 2 - h / 2} ${w} ${h}`
}

interface RouteMapProps {
  routeId: string
  stops: readonly Stop[]
  /** Parada em destaque por mouse/foco na lista ou no mapa, e a "fixada" por clique. */
  hover: number | null
  pinned: number | null
  onHover: (index: number | null) => void
  onPin: (index: number) => void
}

/** Mapa esquemático do trajeto da rota: SVG puro, sem biblioteca nem tiles. */
export function RouteMap({ routeId, stops, hover, pinned, onHover, onPin }: RouteMapProps) {
  const copy = useCopy(routesCopy)
  const reduced = useReducedMotion()
  const narrow = useMediaQuery('(max-width: 639px)')
  const pathId = useId()
  const codes = stops.map((s) => s.code)
  const d = pathOf(codes)
  const active = hover ?? pinned
  const label = copy.map.route(routeId, codes.join(' → '))
  const size = narrow ? 13 : 11

  function onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onPin(index)
    }
  }

  return (
    <figure className="rt-map">
      <svg viewBox={viewBoxOf(codes)} role="group" aria-label={label} className="rt-svg">
        <g aria-hidden="true">
          {nodeIds
            .filter((id) => !codes.includes(id))
            .map((id) => (
              <g key={id}>
                <circle cx={nodes[id].x} cy={nodes[id].y} r="4" className="rt-node-faint" />
                <text
                  x={nodes[id].x + 8}
                  y={nodes[id].y + 4}
                  className="rt-faint-label"
                  fontSize={size - 2}
                >
                  {id}
                </text>
              </g>
            ))}
        </g>
        <path d={d} pathLength={1} className="rt-casing" />
        <path id={pathId} d={d} pathLength={1} className="rt-line" key={d} />
        {stops.map((stop, i) => {
          const { x, y } = nodes[stop.code]
          const end = i === 0 || i === stops.length - 1
          const r = end ? 9 : 6.5
          const above = i % 2 === 1
          const ly = above ? y - r - 8 : y + r + size + 3
          return (
            <g
              key={`${stop.code}-${i}`}
              className="rt-stop"
              data-active={active === i || undefined}
              role="button"
              tabIndex={0}
              aria-pressed={pinned === i}
              aria-label={copy.map.stop(i + 1, stop.code, stop.offset, stop.time)}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(i)}
              onBlur={() => onHover(null)}
              onClick={() => onPin(i)}
              onKeyDown={(event) => onKeyDown(event, i)}
            >
              <circle cx={x} cy={y} r={r + 9} className="rt-hit" />
              <circle cx={x} cy={y} r={r} className={end ? 'rt-dot rt-dot--end' : 'rt-dot'} />
              <text x={x} y={ly} textAnchor="middle" fontSize={size} className="rt-code">
                {stop.code}
              </text>
              {!narrow && (
                <text
                  x={x}
                  y={ly + (above ? -size + 1 : size)}
                  textAnchor="middle"
                  fontSize={size - 1.5}
                  className="rt-time"
                >
                  {`D+${stop.offset} ${stop.time}`}
                </text>
              )}
            </g>
          )
        })}
        {!reduced && (
          <g className="rt-truck" aria-hidden="true" key={d}>
            <rect x="-9" y="-5" width="11" height="8" rx="1.5" />
            <rect x="3" y="-3" width="6" height="6" rx="1.5" className="rt-truck-cab" />
            <circle cx="-4" cy="4" r="2" />
            <circle cx="5" cy="4" r="2" />
            <animateMotion dur="10s" repeatCount="indefinite" rotate="0">
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </g>
        )}
      </svg>
      <figcaption className="rt-caption">{copy.map.caption}</figcaption>
    </figure>
  )
}

/** Visão geral da lista: todas as rotas ativas em cinza claro e a focada em destaque. */
export function OverviewMap({
  routes,
  focusId,
}: {
  routes: readonly Route[]
  focusId: string | null
}) {
  const copy = useCopy(routesCopy)
  const active = routes.filter((r) => r.status !== 'suspended')
  const focus = routes.find((r) => r.id === focusId)

  return (
    <figure className="rt-overview">
      <svg viewBox="0 0 640 380" role="img" aria-label={copy.map.overview} className="rt-svg">
        {active
          .filter((r) => r.id !== focusId)
          .map((r) => (
            <path key={r.id} d={pathOf(r.stops.map((s) => s.code))} className="rt-faintline" />
          ))}
        {focus && (
          <path d={pathOf(focus.stops.map((s) => s.code))} className="rt-line rt-line--focus" />
        )}
        {nodeIds.map((id) => (
          <g key={id}>
            <circle cx={nodes[id].x} cy={nodes[id].y} r="8" className="rt-dot" />
            <text
              x={nodes[id].x}
              y={nodes[id].y - 14}
              textAnchor="middle"
              fontSize="17"
              className="rt-code"
            >
              {id}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="rt-caption">{copy.map.caption}</figcaption>
    </figure>
  )
}
