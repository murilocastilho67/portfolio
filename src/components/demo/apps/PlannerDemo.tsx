import { useRef, useState } from 'react'
import { AppFrame } from '../kit/AppFrame'
import type { DemoAppProps } from '../kit/context'
import { useCopy, useToast } from '../kit/lib'
import { EmptyState, Kpi } from '../kit/primitives'
import './planner.css'
import { Board } from './planner/Board'
import { CardDrawer } from './planner/CardDrawer'
import { plannerCopy } from './planner.copy'
import {
  initialCards,
  isOverdue,
  type Activity,
  type Assignee,
  type Card,
  type Col,
} from './planner.data'

type Screen = 'board' | 'feed'

export default function PlannerDemo({ onReset }: DemoAppProps) {
  const copy = useCopy(plannerCopy)
  const [cards, setCards] = useState<readonly Card[]>(initialCards)
  const [screen, setScreen] = useState<Screen>('board')
  const [openId, setOpenId] = useState<string | null>(null)
  const [activity, setActivity] = useState<readonly Activity[]>([])
  const [toast, showToast] = useToast()
  const nextId = useRef(1)

  const open = cards.find((c) => c.id === openId)
  const titleOf = (id: string) => copy.cards[id].title
  const log = (text: string, notify: boolean) =>
    setActivity((all) => [...all, { id: nextId.current++, text, notify }])
  const patch = (id: string, change: Partial<Card>) =>
    setCards((all) => all.map((c) => (c.id === id ? { ...c, ...change } : c)))

  function move(id: string, col: Col) {
    const card = cards.find((c) => c.id === id)
    if (!card || card.col === col) return
    // O cartão movido vai para o fim da coluna de destino.
    setCards((all) => [
      ...all.filter((c) => c.id !== id),
      { ...card, col, doneThisWeek: col === 'done' ? true : card.doneThisWeek },
    ])
    log(
      col === 'blocked'
        ? copy.feed.blocked(titleOf(id))
        : copy.feed.moved(titleOf(id), copy.columns[col]),
      col === 'blocked',
    )
    showToast(copy.moved(titleOf(id), copy.columns[col]))
  }

  function delegate(id: string, who: Assignee) {
    patch(id, { assignee: who })
    log(copy.feed.delegated(titleOf(id), copy.assignees[who]), true)
  }

  function toggleSubtask(card: Card, index: number) {
    patch(card.id, { subtasks: card.subtasks.map((v, i) => (i === index ? !v : v)) })
    if (!card.subtasks[index])
      log(copy.feed.subtask(titleOf(card.id), copy.cards[card.id].subtasks[index]), false)
  }

  const notifications = activity.filter((a) => a.notify).map((a) => a.text)
  const feed = [...activity.map((a) => a.text), ...copy.feed.seed].reverse()

  return (
    <AppFrame
      brand={{ name: copy.brand, mark: 'P' }}
      nav={[
        { id: 'board', label: copy.nav.board, icon: 'kanban' },
        { id: 'feed', label: copy.nav.feed, icon: 'bell' },
      ]}
      active={screen}
      onNav={(id) => setScreen(id as Screen)}
      title={screen === 'board' ? copy.nav.board : copy.nav.feed}
      userLabel={copy.user}
      notifications={notifications}
      onReset={onReset}
      toast={toast}
      drawer={
        open && (
          <CardDrawer
            card={open}
            onClose={() => setOpenId(null)}
            onToggleSubtask={(i) => toggleSubtask(open, i)}
            onDelegate={(who) => who !== open.assignee && delegate(open.id, who)}
            onStatus={(col) => move(open.id, col)}
            onNote={(text) => patch(open.id, { blockedNote: text })}
          />
        )
      }
    >
      {screen === 'board' ? (
        <>
          <div className="dm-kpis">
            <Kpi label={copy.score.open} value={cards.filter((c) => c.col !== 'done').length} />
            <Kpi label={copy.score.late} value={cards.filter(isOverdue).length} tone="red" />
            <Kpi
              label={copy.score.doneWeek}
              value={cards.filter((c) => c.col === 'done' && c.doneThisWeek).length}
              tone="green"
            />
          </div>
          <Board cards={cards} onMove={move} onOpen={setOpenId} />
        </>
      ) : feed.length === 0 ? (
        <EmptyState title={copy.feed.empty} />
      ) : (
        <>
          <h4 className="dm-h">{copy.feed.title}</h4>
          <ul className="pn-feed">
            {feed.map((text, i) => (
              <li key={i} className="dm-card">
                {text}
              </li>
            ))}
          </ul>
        </>
      )}
    </AppFrame>
  )
}
