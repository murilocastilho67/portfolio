import type { ReactNode } from 'react'
import { useCopy } from '../../kit/lib'
import { routesCopy } from '../routes.copy'
import type { Change, Route } from '../routes.data'

/** Sete pontos (segunda a domingo): cheio = opera; contorno = não opera. */
export function DayDots({
  days,
  added = [],
}: {
  days: readonly boolean[]
  added?: readonly number[]
}) {
  const copy = useCopy(routesCopy)
  const names = copy.days.long.filter((_, i) => days[i]).join(', ')
  return (
    <span className="rt-days" role="img" aria-label={copy.days.label(names)}>
      {days.map((on, i) => (
        <i key={i} data-on={on || undefined} data-added={added.includes(i) || undefined} />
      ))}
    </span>
  )
}

function Row({ kind, children }: { kind: 'del' | 'add'; children: ReactNode }) {
  const copy = useCopy(routesCopy)
  return (
    <li className={`rt-diff-row rt-diff-row--${kind}`}>
      <span className="rt-sign" aria-hidden="true">
        {kind === 'del' ? '−' : '+'}
      </span>
      <span className="sr-only">{copy.requests.diffSr[kind]}: </span>
      {children}
    </li>
  )
}

/** Comparativo antes/depois: removido em vermelho (−), adicionado em verde (+). */
export function ChangeDiff({ route, changes }: { route: Route; changes: readonly Change[] }) {
  const copy = useCopy(routesCopy)
  const addedDays = changes.filter((c) => c.kind === 'day').map((c) => c.day)
  const before = route.days.map((on, i) => on && !addedDays.includes(i))

  return (
    <ul className="rt-diff">
      {changes.map((change, i) => {
        if (change.kind === 'time') {
          return (
            <li key={i}>
              <ul>
                <Row kind="del">
                  {copy.changes.stopLine(change.stop + 1, change.code, change.from)}
                </Row>
                <Row kind="add">
                  {copy.changes.stopLine(change.stop + 1, change.code, change.to)}
                </Row>
              </ul>
            </li>
          )
        }
        if (change.kind === 'day') {
          return (
            <li key={i}>
              <ul>
                <Row kind="del">
                  {copy.changes.daysLine} <DayDots days={before} />
                </Row>
                <Row kind="add">
                  {copy.changes.daysLine} <DayDots days={route.days} added={[change.day]} />
                </Row>
              </ul>
            </li>
          )
        }
        return (
          <li key={i}>
            <ul>
              <Row kind="add">{copy.changes.stop(change.code, change.time)}</Row>
            </ul>
          </li>
        )
      })}
    </ul>
  )
}
