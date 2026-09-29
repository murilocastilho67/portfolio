import { useId, useState } from 'react'
import { Drawer } from '../../kit/Drawer'
import { useCopy, useFormat } from '../../kit/lib'
import { Chip, Tabs } from '../../kit/primitives'
import { routesCopy } from '../routes.copy'
import type { Change, Route } from '../routes.data'
import { RequestForm } from './RequestForm'
import { RouteMap } from './RouteMap'
import { useDescribeChange } from './describe'
import { DayDots } from './parts'
import { statusTone } from './status'

type Tab = 'periods' | 'stops' | 'history'

interface RouteDrawerProps {
  route: Route
  canRequest: boolean
  initialTab?: Tab
  /** Id da solicitação recém-enviada por esta gaveta, para mostrar a confirmação. */
  sentId: string | null
  onClose: () => void
  onSubmit: (changes: Change[], note: string) => void
  onGoManager: () => void
}

export function RouteDrawer({
  route,
  canRequest,
  initialTab = 'stops',
  sentId,
  onClose,
  onSubmit,
  onGoManager,
}: RouteDrawerProps) {
  const copy = useCopy(routesCopy)
  const { date } = useFormat()
  const describe = useDescribeChange()
  const formId = useId()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [editing, setEditing] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)

  const first = route.stops[0]
  const last = route.stops[route.stops.length - 1]
  const highlight = hover ?? pinned
  const togglePin = (index: number) => setPinned((p) => (p === index ? null : index))
  const pending = route.status === 'pending'

  const tabs = [
    { id: 'periods', label: copy.drawer.tabs.periods, count: route.periods.length },
    { id: 'stops', label: copy.drawer.tabs.stops, count: route.stops.length },
    { id: 'history', label: copy.drawer.tabs.history, count: route.history.length },
  ] as const

  const footer = editing ? (
    <>
      <button type="button" className="dm-btn" onClick={() => setEditing(false)}>
        {copy.form.cancel}
      </button>
      <button type="submit" form={formId} className="dm-btn dm-btn--primary">
        {copy.form.send}
      </button>
    </>
  ) : canRequest ? (
    <>
      {pending && <span className="dm-muted rt-foot-hint">{copy.drawer.pendingHint}</span>}
      <button
        type="button"
        className="dm-btn dm-btn--primary"
        disabled={pending}
        onClick={() => setEditing(true)}
      >
        {copy.drawer.request}
      </button>
    </>
  ) : (
    <span className="dm-muted rt-foot-hint">{copy.drawer.managerHint}</span>
  )

  return (
    <Drawer
      size="lg"
      title={`${route.id} · ${first.code} → ${last.code}`}
      subtitle={
        <span className="rt-sub">
          <Chip tone={statusTone[route.status]}>{copy.status[route.status]}</Chip>
          <span>{route.vehicle}</span>
          <DayDots days={route.days} />
        </span>
      }
      onClose={onClose}
      footer={footer}
    >
      <RouteMap
        routeId={route.id}
        stops={route.stops}
        hover={hover}
        pinned={pinned}
        onHover={setHover}
        onPin={togglePin}
      />

      {sentId && !editing && (
        <div role="status" className="rt-callout">
          <p className="dm-strong">{copy.drawer.sentTitle(sentId)}</p>
          <p>{copy.drawer.sentText}</p>
          <button type="button" className="dm-btn dm-btn--primary" onClick={onGoManager}>
            {copy.drawer.goManager}
          </button>
        </div>
      )}

      {editing ? (
        <>
          <h4 className="dm-h" style={{ marginTop: 14 }}>
            {copy.form.title}
          </h4>
          <RequestForm
            id={formId}
            route={route}
            onSubmit={(changes, note) => {
              onSubmit(changes, note)
              setEditing(false)
            }}
          />
        </>
      ) : (
        <Tabs label={copy.drawer.tabsLabel} tabs={tabs} value={tab} onChange={setTab}>
          {tab === 'periods' && (
            <ol className="rt-timeline">
              {[...route.periods].reverse().map((period) => (
                <li key={period.version} data-current={period.to === null || undefined}>
                  <p>
                    <Chip tone={period.to === null ? 'green' : 'gray'}>
                      {copy.drawer.version(period.version)}
                    </Chip>{' '}
                    <span className="dm-strong">
                      {copy.drawer.periodRange(
                        date(period.from),
                        period.to && date(period.to),
                        copy.drawer.current,
                      )}
                    </span>
                  </p>
                  <p className="dm-muted">{copy.periodNotes[period.kind]}</p>
                  {period.changes?.map((change, i) => (
                    <p key={i} className="rt-change">
                      {describe(change)}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
          )}
          {tab === 'stops' && (
            <ol className="rt-stops">
              {route.stops.map((stop, i) => (
                <li key={`${stop.code}-${i}`}>
                  <button
                    type="button"
                    className="rt-stoprow"
                    data-active={highlight === i || undefined}
                    aria-pressed={pinned === i}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    onClick={() => togglePin(i)}
                  >
                    <span className="rt-num">{i + 1}</span>
                    <span className="dm-strong">{stop.code}</span>
                    <span className="dm-mono">
                      D+{stop.offset} · {stop.time}
                    </span>
                    <Chip tone="gray">{copy.ops[stop.op]}</Chip>
                  </button>
                </li>
              ))}
            </ol>
          )}
          {tab === 'history' && (
            <ul className="rt-history">
              {[...route.history].reverse().map((entry, i) => (
                <li key={i}>
                  <span className="dm-mono dm-muted">{date(entry.date)}</span>
                  <span className="dm-strong">{copy.history[entry.kind]}</span>
                  <span className="dm-muted">{copy.actors[entry.actor]}</span>
                </li>
              ))}
            </ul>
          )}
        </Tabs>
      )}
    </Drawer>
  )
}
