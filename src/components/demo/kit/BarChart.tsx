import type { KeyboardEvent } from 'react'
import { useKit } from './lib'

export interface Bar {
  id: string
  label: string
  value: number
}

const ROW = 30
const LABEL_W = 132
const BAR_W = 150
const VALUE_W = 32
const TOTAL_W = LABEL_W + BAR_W + VALUE_W

/** Gráfico de barras horizontais em SVG; com `onSelect` cada barra é um botão (filtro cruzado). */
export function BarChart({
  title,
  data,
  selected,
  onSelect,
}: {
  title: string
  data: readonly Bar[]
  selected?: string | null
  onSelect?: (id: string | null) => void
}) {
  const kit = useKit()
  const max = Math.max(1, ...data.map((bar) => bar.value))

  function onKeyDown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.(selected === id ? null : id)
    }
  }

  return (
    <svg
      className="dm-chart"
      viewBox={`0 0 ${TOTAL_W} ${data.length * ROW + 4}`}
      role="group"
      aria-label={title}
    >
      {data.map((bar, i) => {
        const width = bar.value ? Math.max(3, (bar.value / max) * BAR_W) : 0
        return (
          <g
            key={bar.id}
            transform={`translate(0 ${i * ROW + 2})`}
            className="dm-bar"
            data-dimmed={(selected != null && selected !== bar.id) || undefined}
            data-selected={selected === bar.id || undefined}
            role={onSelect ? 'button' : 'img'}
            tabIndex={onSelect ? 0 : undefined}
            aria-pressed={onSelect ? selected === bar.id : undefined}
            aria-label={kit.chartValue(bar.label, bar.value)}
            onClick={onSelect ? () => onSelect(selected === bar.id ? null : bar.id) : undefined}
            onKeyDown={onSelect ? (event) => onKeyDown(event, bar.id) : undefined}
          >
            <rect className="dm-bar-hit" width={TOTAL_W} height={ROW - 2} rx="4" />
            <text x="4" y={ROW / 2 - 1} className="dm-bar-label" dominantBaseline="middle">
              {bar.label}
            </text>
            <rect
              className="dm-bar-fill"
              x={LABEL_W}
              y="5"
              width={width}
              height={ROW - 12}
              rx="3"
            />
            <text
              x={LABEL_W + width + 5}
              y={ROW / 2 - 1}
              className="dm-bar-value"
              dominantBaseline="middle"
            >
              {bar.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
