import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { DIcon } from '../../kit/DIcon'
import { useCopy, useFormat } from '../../kit/lib'
import { ProgressBar } from '../../kit/primitives'
import { plannerCopy } from '../planner.copy'
import { columns, isOverdue, type Card, type Col } from '../planner.data'

interface DragState {
  id: string
  x: number
  y: number
  /** Onde, dentro do cartão, o ponteiro o pegou (o fantasma acompanha sem pular). */
  dx: number
  dy: number
  w: number
  over: Col | null
}

interface BoardProps {
  cards: readonly Card[]
  onMove: (id: string, col: Col) => void
  onOpen: (id: string) => void
}

const DRAG_THRESHOLD = 6

const colAt = (x: number, y: number): Col | null =>
  (document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-col]')?.dataset.col as
    Col | undefined) ?? null

/**
 * Kanban com arrastar e soltar por eventos de ponteiro (mouse, toque pela alça, caneta) e, para
 * teclado e leitor de tela, um seletor "Mover para…" em cada cartão.
 */
export function Board({ cards, onMove, onOpen }: BoardProps) {
  const copy = useCopy(plannerCopy)
  const { shortDate } = useFormat()
  const [drag, setDrag] = useState<DragState | null>(null)
  const focusId = useRef<string | null>(null)
  const swallowClick = useRef(false)
  const stopTracking = useRef<(() => void) | null>(null)

  useEffect(() => () => stopTracking.current?.(), [])

  // Depois de mover pelo teclado o cartão troca de coluna (é remontado): devolve o foco ao seletor.
  useEffect(() => {
    if (!focusId.current) return
    document.querySelector<HTMLElement>(`[data-card="${focusId.current}"] select`)?.focus()
    focusId.current = null
  }, [cards])

  function onPointerDown(event: PointerEvent<HTMLElement>, card: Card) {
    if (event.button !== 0) return
    const target = event.target as Element
    if (target.closest('select')) return
    if (event.pointerType === 'touch' && !target.closest('.pn-grip')) return

    const rect = event.currentTarget.getBoundingClientRect()
    const start = { x: event.clientX, y: event.clientY }
    const grab = { dx: start.x - rect.left, dy: start.y - rect.top, w: rect.width }
    let dragging = false

    const move = (e: globalThis.PointerEvent) => {
      if (!dragging) {
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < DRAG_THRESHOLD) return
        dragging = true
      }
      setDrag({
        id: card.id,
        x: e.clientX,
        y: e.clientY,
        ...grab,
        over: colAt(e.clientX, e.clientY),
      })
    }
    const finish = (e: globalThis.PointerEvent, drop: boolean) => {
      stopTracking.current?.()
      if (!dragging) return
      swallowClick.current = true
      window.setTimeout(() => (swallowClick.current = false), 0)
      setDrag(null)
      const over = drop ? colAt(e.clientX, e.clientY) : null
      if (over) onMove(card.id, over)
    }
    const up = (e: globalThis.PointerEvent) => finish(e, true)
    const cancel = (e: globalThis.PointerEvent) => finish(e, false)

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    stopTracking.current = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      stopTracking.current = null
    }
  }

  const dragged = cards.find((c) => c.id === drag?.id)

  return (
    <div
      className="pn-board"
      data-dragging={drag ? true : undefined}
      role="group"
      aria-label={copy.board}
    >
      {columns.map((col) => {
        const list = cards.filter((c) => c.col === col)
        return (
          <section
            key={col}
            className="pn-col"
            data-col={col}
            data-over={drag?.over === col || undefined}
            aria-label={copy.columns[col]}
          >
            <h4 className="pn-col-head">
              {copy.columns[col]} <span className="dm-fchip-count">{list.length}</span>
            </h4>
            <ul className="pn-list">
              {list.map((card) => {
                const text = copy.cards[card.id]
                const done = card.subtasks.filter(Boolean).length
                const late = isOverdue(card)
                return (
                  <li
                    key={card.id}
                    className="pn-card"
                    data-card={card.id}
                    data-priority={card.priority}
                    data-dragging={drag?.id === card.id || undefined}
                    onPointerDown={(event) => onPointerDown(event, card)}
                  >
                    <div className="pn-card-top">
                      <button
                        type="button"
                        className="pn-title"
                        onClick={() => !swallowClick.current && onOpen(card.id)}
                      >
                        {text.title}
                      </button>
                      <span className="pn-grip" title={copy.grip} aria-hidden="true">
                        <DIcon name="grip" />
                      </span>
                    </div>
                    <p className="pn-meta">
                      <span className="pn-prio">{copy.priorities[card.priority]}</span>
                      <span className={late ? 'pn-due pn-due--late' : 'pn-due'}>
                        {late ? copy.overdue(shortDate(card.due)) : copy.due(shortDate(card.due))}
                      </span>
                    </p>
                    <p className="pn-meta">
                      <span className="pn-assignee">{copy.assignees[card.assignee]}</span>
                    </p>
                    {card.subtasks.length > 0 && (
                      <div className="pn-sub">
                        <ProgressBar
                          value={done}
                          max={card.subtasks.length}
                          label={copy.progress(done, card.subtasks.length)}
                          tone={done === card.subtasks.length ? 'green' : 'crimson'}
                        />
                        <span>{copy.progress(done, card.subtasks.length)}</span>
                      </div>
                    )}
                    <label className="pn-move">
                      <span className="sr-only">{copy.moveLabel(text.title)}</span>
                      <select
                        value=""
                        onChange={(event) => {
                          onMove(card.id, event.target.value as Col)
                          focusId.current = card.id
                        }}
                      >
                        <option value="" disabled>
                          {copy.moveTo}
                        </option>
                        {columns
                          .filter((c) => c !== card.col)
                          .map((c) => (
                            <option key={c} value={c}>
                              {copy.columns[c]}
                            </option>
                          ))}
                      </select>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      {drag && dragged && (
        <div
          className="pn-ghost"
          data-priority={dragged.priority}
          style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, width: drag.w }}
          aria-hidden="true"
        >
          {copy.cards[dragged.id].title}
        </div>
      )}
    </div>
  )
}
