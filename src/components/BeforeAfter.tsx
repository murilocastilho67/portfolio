import { useRef, useState, type PointerEvent } from 'react'
import {
  SHEET_EMPTY_ROWS,
  SHEET_ERROR_CELL,
  SHEET_WARN_ROW,
  SHEET_WIDE_COLS,
  appRoutes,
} from '../data/beforeAfter'
import { useT } from '../i18n/useT'

/** Espaço sem quebra: célula vazia com conteúdo, para manter a altura da linha. */
const EMPTY = ' '
const COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
/** Colunas extras só no desktop: escondidas abaixo de `sm` para não estourar a largura. */
const wide = (col: number) => (col >= SHEET_WIDE_COLS ? 'hidden sm:table-cell' : '')

/** Planilha "antes": clara nos dois temas, com os vícios de planilha manual. */
function Sheet() {
  const { t } = useT()
  const { sheet, before } = t.beforeAfter
  const cell =
    'h-[26px] truncate border border-sheet-line px-1 text-left text-[10px] font-normal sm:px-1.5 sm:text-[11px]'
  const rowNumber = `${cell} w-7 bg-sheet-head text-center text-sheet-muted`

  return (
    <div className="absolute inset-0 flex flex-col bg-sheet font-mono text-sheet-text">
      <div className="flex h-9 shrink-0 items-end gap-2 border-b border-sheet-line bg-sheet-head px-2">
        <span className="mb-1.5 rounded-sm bg-sheet-text px-1.5 py-0.5 text-[10px] font-bold text-sheet">
          {before}
        </span>
        <span className="min-w-0 truncate rounded-t-sm border border-b-0 border-sheet-line bg-sheet px-3 py-1.5 text-[11px]">
          {sheet.file}
        </span>
      </div>
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="text-sheet-muted">
            <th className={rowNumber}>{EMPTY}</th>
            {COLUMN_LETTERS.map((letter, col) => (
              <th key={letter} className={`${cell} bg-sheet-head text-center ${wide(col)}`}>
                {letter}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={rowNumber}>1</th>
            <td
              colSpan={COLUMN_LETTERS.length}
              className={`${cell} bg-sheet-title text-center font-bold`}
            >
              {sheet.title}
            </td>
          </tr>
          <tr className="font-bold">
            <th className={rowNumber}>2</th>
            {sheet.cols.map((name, col) => (
              <td key={name} className={`${cell} bg-sheet-head font-bold ${wide(col)}`}>
                {name}
              </td>
            ))}
          </tr>
          {sheet.rows.map((row, r) => (
            <tr key={r} className={r === SHEET_WARN_ROW ? 'bg-sheet-warn' : ''}>
              <th className={rowNumber}>{r + 3}</th>
              {row.map((text, col) => {
                const isError = r === SHEET_ERROR_CELL.row && col === SHEET_ERROR_CELL.col
                return (
                  <td
                    key={col}
                    className={`${cell} ${wide(col)} ${
                      isError ? 'bg-sheet-err font-bold text-sheet-err-text' : ''
                    }`}
                  >
                    {text}
                  </td>
                )
              })}
            </tr>
          ))}
          {Array.from({ length: SHEET_EMPTY_ROWS }, (_, i) => (
            <tr key={i}>
              <th className={rowNumber}>{sheet.rows.length + 3 + i}</th>
              {COLUMN_LETTERS.map((letter, col) => (
                <td key={letter} className={`${cell} ${wide(col)}`}>
                  {EMPTY}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Tela "depois": segue o tema do site. */
function AppScreen() {
  const { t } = useT()
  const { app, after } = t.beforeAfter
  const head = 'px-3 py-2 text-left text-[11px] font-medium text-muted'
  const rowCell = 'h-9 truncate px-3'

  return (
    <div className="absolute inset-0 flex flex-col bg-surface text-sm text-text">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface-2 px-3">
        <span className="truncate font-semibold">{app.title}</span>
        <span className="shrink-0 rounded-sm bg-accent-fill px-1.5 py-0.5 font-mono text-[10px] font-bold text-on-accent">
          {after}
        </span>
      </div>

      <div className="flex gap-2 overflow-hidden px-3 py-2.5">
        {app.chips.map((chip, i) => (
          <span
            key={chip}
            className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${
              i === 0 ? 'border-accent/60 bg-accent-soft text-accent' : 'border-line text-muted'
            }`}
          >
            {chip}
          </span>
        ))}
      </div>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-y border-line bg-surface-2/60">
            <th className={`${head} w-[4.5rem]`}>{app.cols.route}</th>
            <th className={head}>{app.cols.path}</th>
            <th className={`${head} hidden w-24 sm:table-cell`}>{app.cols.days}</th>
            <th className={`${head} w-[8.25rem]`}>{app.cols.status}</th>
            <th className={`${head} hidden w-52 md:table-cell`}>{app.cols.changed}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {appRoutes.map(({ id, route, from, to, status }) => (
            <tr key={id}>
              <td className={`${rowCell} font-mono text-[13px] font-semibold`}>{route}</td>
              <td className={`${rowCell} font-mono text-[13px]`}>
                {from} <span className="text-muted">→</span> {to}
              </td>
              <td className={`${rowCell} hidden text-muted sm:table-cell`}>{app.rows[id].days}</td>
              <td className={rowCell}>
                <span
                  className={`inline-block max-w-full truncate rounded-full border px-2 py-0.5 align-middle font-mono text-[11px] ${
                    status === 'active'
                      ? 'border-ok/40 text-ok'
                      : 'border-accent/50 bg-accent-soft text-accent'
                  }`}
                >
                  {app.status[status]}
                </span>
              </td>
              <td className={`${rowCell} hidden text-muted md:table-cell`}>
                {app.rows[id].changed}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-auto truncate border-t border-line px-3 py-2 font-mono text-[11px] text-ok">
        ✓ {app.audit}
      </p>
    </div>
  )
}

/**
 * Comparador "planilha → sistema". As duas telas são HTML/CSS empilhadas; a de "depois" é
 * recortada por clip-path conforme a posição. O controle acessível é um <input type="range">
 * nativo (setas do teclado); o arrasto com ponteiro, em qualquer ponto do componente, usa
 * pointer capture. A barra e a bolinha são só o desenho da posição atual.
 */
export function BeforeAfter() {
  const { t } = useT()
  const copy = t.beforeAfter
  const [value, setValue] = useState(50)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragging = useRef(false)

  function fromPointer(event: PointerEvent<HTMLDivElement>) {
    const box = boxRef.current?.getBoundingClientRect()
    if (!box || box.width === 0) return
    const percent = ((event.clientX - box.left) / box.width) * 100
    setValue(Math.round(Math.min(100, Math.max(0, percent))))
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    inputRef.current?.focus({ preventScroll: true })
    fromPointer(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current) fromPointer(event)
  }

  const stopDragging = () => {
    dragging.current = false
  }

  const valueText = copy.valueText.replace('{n}', String(value)).replace('{m}', String(100 - value))

  return (
    <figure className="mb-12">
      <p className="mb-3 font-mono text-sm text-accent">{copy.label}</p>

      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        className="card relative h-[22rem] cursor-ew-resize touch-pan-y overflow-hidden select-none has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-accent"
      >
        <div aria-hidden="true" className="absolute inset-0">
          <Sheet />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${value}%)` }}>
            <AppScreen />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-accent-fill"
            style={{ left: `${value}%` }}
          >
            <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-bg bg-accent-fill font-mono text-xs font-bold text-on-accent shadow-lg">
              ‹›
            </span>
          </div>
        </div>

        <label htmlFor="antes-depois-range" className="sr-only">
          {copy.sliderLabel}
        </label>
        <input
          ref={inputRef}
          id="antes-depois-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          aria-valuetext={valueText}
          aria-describedby="antes-depois-desc"
          className="pointer-events-none absolute inset-0 size-full opacity-0"
        />
      </div>

      <figcaption id="antes-depois-desc" className="mt-3 font-mono text-[13px] text-muted">
        {copy.caption}
        <span className="sr-only"> {copy.description}</span>
      </figcaption>
    </figure>
  )
}
