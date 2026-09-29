import { useCopy, useFormat } from '../../kit/lib'
import { Chip, EmptyState } from '../../kit/primitives'
import { routesCopy } from '../routes.copy'
import type { ChangeRequest, Route } from '../routes.data'
import { ChangeDiff } from './parts'

interface RequestsPageProps {
  requests: readonly ChangeRequest[]
  routes: readonly Route[]
  canDecide: boolean
  highlightId: string | null
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onViewRoute: (routeId: string) => void
}

const resultTone = { pending: 'amber', approved: 'green', rejected: 'red' } as const

/** Fila de solicitações: cada cartão mostra o antes/depois e, para o Gestor, Aprovar/Recusar. */
export function RequestsPage({
  requests,
  routes,
  canDecide,
  highlightId,
  onApprove,
  onReject,
  onViewRoute,
}: RequestsPageProps) {
  const copy = useCopy(routesCopy)
  const { date } = useFormat()

  if (requests.length === 0) {
    return <EmptyState title={copy.requests.empty} text={copy.requests.emptyText} />
  }

  const sections = [
    { title: copy.requests.pendingSection, items: requests.filter((r) => r.status === 'pending') },
    { title: copy.requests.decidedSection, items: requests.filter((r) => r.status !== 'pending') },
  ].filter((section) => section.items.length > 0)

  return (
    <div className="rt-requests">
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title}>
          <h4 className="dm-h">
            {section.title} · {section.items.length}
          </h4>
          <ul className="rt-reqlist">
            {section.items.map((request) => {
              const route = routes.find((r) => r.id === request.routeId)
              if (!route) return null
              const first = route.stops[0].code
              const last = route.stops[route.stops.length - 1].code
              return (
                <li
                  key={request.id}
                  className="dm-card rt-req"
                  data-new={highlightId === request.id || undefined}
                >
                  <header className="rt-req-head">
                    <div>
                      <p className="dm-strong">
                        {route.id} · {first} → {last}
                      </p>
                      <p className="dm-muted">
                        {copy.requests.by(copy.actors.regional, date(request.date))}
                      </p>
                    </div>
                    <Chip tone={resultTone[request.status]}>{copy.requests[request.status]}</Chip>
                  </header>
                  <ChangeDiff route={route} changes={request.changes} />
                  {request.note && (
                    <p className="rt-note">
                      <span className="dm-muted">{copy.requests.note}:</span> {request.note}
                    </p>
                  )}
                  <footer className="rt-req-foot">
                    {request.status === 'pending' && canDecide && (
                      <>
                        <button
                          type="button"
                          className="dm-btn dm-btn--danger"
                          onClick={() => onReject(request.id)}
                        >
                          {copy.requests.reject}
                        </button>
                        <button
                          type="button"
                          className="dm-btn dm-btn--good"
                          onClick={() => onApprove(request.id)}
                        >
                          {copy.requests.approve}
                        </button>
                      </>
                    )}
                    {request.status === 'pending' && !canDecide && (
                      <span className="dm-muted">{copy.requests.waiting}</span>
                    )}
                    {request.status !== 'pending' && (
                      <button
                        type="button"
                        className="dm-btn"
                        onClick={() => onViewRoute(route.id)}
                      >
                        {copy.requests.viewRoute}
                      </button>
                    )}
                  </footer>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
