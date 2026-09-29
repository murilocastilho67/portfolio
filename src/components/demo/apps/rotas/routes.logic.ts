import { TODAY, type Change, type ChangeRequest, type Route, type Stop } from '../routes.data'

export interface DemoState {
  routes: readonly Route[]
  requests: readonly ChangeRequest[]
}

export type Action =
  | { type: 'submit'; id: string; routeId: string; changes: readonly Change[]; note: string }
  | { type: 'approve'; id: string }
  | { type: 'reject'; id: string }

/** Resultado de aplicar as alterações pedidas: novas paradas e novos dias. */
export function applyChanges(
  route: Route,
  changes: readonly Change[],
): { stops: Stop[]; days: boolean[] } {
  const days = [...route.days]
  const stops = route.stops.map((stop) => ({ ...stop }))
  for (const change of changes) {
    if (change.kind === 'day') days[change.day] = true
    else if (change.kind === 'time') stops[change.stop].time = change.to
  }
  // Inserções de trás para frente: os índices pedidos são os da lista original.
  const additions = changes
    .filter((c): c is Extract<Change, { kind: 'stop' }> => c.kind === 'stop')
    .sort((a, b) => b.after - a.after)
  for (const add of additions) {
    const previous = route.stops[add.after]
    stops.splice(add.after + 1, 0, {
      code: add.code,
      time: add.time,
      offset: previous.offset + (add.time < previous.time ? 1 : 0),
      op: 'unload',
    })
  }
  return { stops, days }
}

function dayBefore(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

function updateRoute(state: DemoState, id: string, patch: (route: Route) => Route): Route[] {
  return state.routes.map((route) => (route.id === id ? patch(route) : route))
}

function decide(state: DemoState, id: string, approved: boolean): DemoState {
  const request = state.requests.find((r) => r.id === id)
  if (!request || request.status !== 'pending') return state

  const requests = state.requests.map((r) =>
    r.id === id ? { ...r, status: approved ? ('approved' as const) : ('rejected' as const) } : r,
  )
  const routes = updateRoute(state, request.routeId, (route) => {
    const history = [
      ...route.history,
      {
        date: TODAY,
        actor: 'manager' as const,
        kind: approved ? ('approved' as const) : ('rejected' as const),
      },
    ]
    if (!approved) return { ...route, status: request.prevStatus, history }

    const { stops, days } = applyChanges(route, request.changes)
    const version = route.periods[route.periods.length - 1].version + 1
    return {
      ...route,
      stops,
      days,
      status: request.prevStatus === 'pending' ? 'active' : request.prevStatus,
      periods: [
        ...route.periods.map((p) => (p.to === null ? { ...p, to: dayBefore(TODAY) } : p)),
        { version, from: TODAY, to: null, kind: 'change' as const, changes: request.changes },
      ],
      history,
    }
  })
  return { routes, requests }
}

export function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'submit': {
      const route = state.routes.find((r) => r.id === action.routeId)
      if (!route) return state
      const request: ChangeRequest = {
        id: action.id,
        routeId: route.id,
        note: action.note,
        changes: action.changes,
        status: 'pending',
        prevStatus: route.status,
        date: TODAY,
      }
      return {
        requests: [request, ...state.requests],
        routes: updateRoute(state, route.id, (r) => ({
          ...r,
          status: 'pending',
          history: [...r.history, { date: TODAY, actor: 'regional', kind: 'submitted' }],
        })),
      }
    }
    case 'approve':
      return decide(state, action.id, true)
    case 'reject':
      return decide(state, action.id, false)
  }
}
