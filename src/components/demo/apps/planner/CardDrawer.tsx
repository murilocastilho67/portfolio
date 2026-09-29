import { Drawer } from '../../kit/Drawer'
import { useCopy, useFormat } from '../../kit/lib'
import { Chip, ProgressBar } from '../../kit/primitives'
import { plannerCopy } from '../planner.copy'
import { assignees, columns, type Assignee, type Card, type Col } from '../planner.data'

interface CardDrawerProps {
  card: Card
  onClose: () => void
  onToggleSubtask: (index: number) => void
  onDelegate: (who: Assignee) => void
  onStatus: (col: Col) => void
  onNote: (text: string) => void
}

/** Detalhe do cartão: subtarefas com progresso, delegação, situação e impedimento. */
export function CardDrawer({
  card,
  onClose,
  onToggleSubtask,
  onDelegate,
  onStatus,
  onNote,
}: CardDrawerProps) {
  const copy = useCopy(plannerCopy)
  const { date } = useFormat()
  const text = copy.cards[card.id]
  const done = card.subtasks.filter(Boolean).length

  return (
    <Drawer
      title={text.title}
      onClose={onClose}
      subtitle={
        <span className="pn-drawer-sub">
          <Chip
            tone={card.priority === 'urgent' ? 'red' : card.priority === 'high' ? 'amber' : 'gray'}
          >
            {copy.priorities[card.priority]}
          </Chip>
          <span>{copy.due(date(card.due))}</span>
        </span>
      }
    >
      <section className="pn-block">
        <h4 className="dm-h">{copy.drawer.subtasks}</h4>
        {card.subtasks.length === 0 ? (
          <p className="dm-muted">{copy.drawer.noSubtasks}</p>
        ) : (
          <>
            <ProgressBar
              value={done}
              max={card.subtasks.length}
              label={copy.progress(done, card.subtasks.length)}
              tone={done === card.subtasks.length ? 'green' : 'crimson'}
            />
            <p className="dm-muted">{copy.progress(done, card.subtasks.length)}</p>
            <ul className="pn-checks">
              {card.subtasks.map((checked, i) => (
                <li key={i}>
                  <label>
                    <input type="checkbox" checked={checked} onChange={() => onToggleSubtask(i)} />
                    <span className={checked ? 'dm-strike' : undefined}>{text.subtasks[i]}</span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="pn-fields">
        <label className="dm-field">
          <span>{copy.drawer.delegate}</span>
          <select value={card.assignee} onChange={(e) => onDelegate(e.target.value as Assignee)}>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {copy.assignees[a]}
              </option>
            ))}
          </select>
        </label>
        <label className="dm-field">
          <span>{copy.drawer.status}</span>
          <select value={card.col} onChange={(e) => onStatus(e.target.value as Col)}>
            {columns.map((c) => (
              <option key={c} value={c}>
                {copy.columns[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="dm-field" style={{ marginTop: 12 }}>
        <span>{copy.drawer.blockNote}</span>
        <textarea
          value={card.blockedNote ?? text.blocked ?? ''}
          placeholder={copy.drawer.blockPlaceholder}
          maxLength={200}
          onChange={(e) => onNote(e.target.value)}
        />
      </label>
    </Drawer>
  )
}
