import { useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { DIcon } from './DIcon'
import { useKit } from './lib'
import { EmptyState } from './primitives'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Comparador: habilita a ordenação pelo cabeçalho. */
  sort?: (a: T, b: T) => number
  align?: 'right' | 'center'
  /** A célula principal vira um botão real (teclado) que abre o registro. */
  primary?: boolean
  /** Some no celular para a tabela caber sem rolagem horizontal. */
  hideSm?: boolean
}

interface Selection {
  selected: ReadonlySet<string>
  onToggle: (key: string) => void
  onToggleAll: (keys: string[], on: boolean) => void
  isDisabled?: (key: string) => boolean
}

interface DataTableProps<T> {
  caption: string
  rows: readonly T[]
  columns: readonly Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  /** Linha sob o mouse ou com foco (null ao sair), para destacar algo fora da tabela. */
  onRowHover?: (key: string | null) => void
  activeKey?: string | null
  selection?: Selection
  initialSort?: { key: string; dir: 'asc' | 'desc' }
  rowClass?: (row: T) => string | undefined
  empty?: ReactNode
}

/** Cliques em controles internos (caixa de seleção, botão, link) não abrem a linha. */
const INTERACTIVE = 'input, select, textarea, a, button:not(.dm-rowbtn)'

const cellClass = <T,>(column: Column<T>) =>
  `${column.align ? `dm-${column.align}` : ''}${column.hideSm ? ' dm-hide-sm' : ''}`

export function DataTable<T>({
  caption,
  rows,
  columns,
  rowKey,
  onRowClick,
  onRowHover,
  activeKey,
  selection,
  initialSort,
  rowClass,
  empty,
}: DataTableProps<T>) {
  const kit = useKit()
  const [sort, setSort] = useState(initialSort ?? null)

  const sorted = useMemo(() => {
    const compare = columns.find((c) => c.key === sort?.key)?.sort
    if (!compare || !sort) return rows
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compare(a, b))
  }, [rows, columns, sort])

  function toggleSort(key: string) {
    setSort((current) =>
      current?.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
  }

  function onClickRow(event: MouseEvent, row: T) {
    if (!onRowClick) return
    if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return
    onRowClick(row)
  }

  if (rows.length === 0) {
    return <>{empty ?? <EmptyState title={kit.noResults} text={kit.noResultsText} />}</>
  }

  const selectable = selection
    ? sorted.map(rowKey).filter((key) => !selection.isDisabled?.(key))
    : []
  const allOn = selectable.length > 0 && selectable.every((key) => selection?.selected.has(key))

  return (
    <div className="dm-table-wrap">
      <table className="dm-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {selection && (
              <th className="dm-th-check">
                <input
                  type="checkbox"
                  aria-label={kit.selectAll}
                  checked={allOn}
                  onChange={() => selection.onToggleAll(selectable, !allOn)}
                />
              </th>
            )}
            {columns.map((column) => {
              const dir = sort?.key === column.key ? sort.dir : null
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cellClass(column)}
                >
                  {column.sort ? (
                    <button
                      type="button"
                      className="dm-sortbtn"
                      aria-label={`${kit.sortBy}: ${column.header}`}
                      onClick={() => toggleSort(column.key)}
                    >
                      {column.header}
                      <DIcon
                        name="chevronD"
                        className={`dm-icon dm-sort dm-sort--${dir ?? 'none'}`}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const key = rowKey(row)
            return (
              <tr
                key={key}
                data-active={activeKey === key || undefined}
                data-clickable={onRowClick ? true : undefined}
                className={rowClass?.(row)}
                onClick={(event) => onClickRow(event, row)}
                onMouseEnter={onRowHover && (() => onRowHover(key))}
                onMouseLeave={onRowHover && (() => onRowHover(null))}
                onFocus={onRowHover && (() => onRowHover(key))}
                onBlur={onRowHover && (() => onRowHover(null))}
              >
                {selection && (
                  <td className="dm-th-check">
                    <input
                      type="checkbox"
                      aria-label={kit.selectRow}
                      checked={selection.selected.has(key)}
                      disabled={selection.isDisabled?.(key)}
                      onChange={() => selection.onToggle(key)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className={cellClass(column)}>
                    {column.primary ? (
                      <button type="button" className="dm-rowbtn">
                        {column.cell(row)}
                      </button>
                    ) : (
                      column.cell(row)
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
