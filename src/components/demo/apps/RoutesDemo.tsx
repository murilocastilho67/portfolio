import { useMemo, useReducer, useState } from 'react'
import { AppFrame } from '../kit/AppFrame'
import { DataTable, type Column } from '../kit/DataTable'
import type { DemoAppProps } from '../kit/context'
import { useCopy, useToast } from '../kit/lib'
import { Chip, FilterChips, SearchField } from '../kit/primitives'
import './routes.css'
import { OverviewMap } from './rotas/RouteMap'
import { RouteDrawer } from './rotas/RouteDrawer'
import { RequestsPage } from './rotas/RequestsPage'
import { DayDots } from './rotas/parts'
import { reducer, type DemoState } from './rotas/routes.logic'
import { statusTone } from './rotas/status'
import { routesCopy } from './routes.copy'
import {
  initialRequests,
  initialRoutes,
  type Change,
  type Route,
  type RouteStatus,
} from './routes.data'

type Role = 'regional' | 'manager'
type Screen = 'routes' | 'requests'
type StatusFilter = 'all' | RouteStatus

const initialState: DemoState = { routes: initialRoutes, requests: initialRequests }
const pathOf = (route: Route) =>
  `${route.stops[0].code} → ${route.stops[route.stops.length - 1].code}`

export default function RoutesDemo({ onReset }: DemoAppProps) {
  const copy = useCopy(routesCopy)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [role, setRole] = useState<Role>('regional')
  const [screen, setScreen] = useState<Screen>('routes')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [drawerTab, setDrawerTab] = useState<'periods' | 'stops'>('stops')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [sentId, setSentId] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [toast, showToast] = useToast()

  const pendingCount = state.requests.filter((r) => r.status === 'pending').length
  const open = state.routes.find((r) => r.id === openId)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return state.routes.filter(
      (route) =>
        (filter === 'all' || route.status === filter) &&
        (!needle || `${route.id} ${pathOf(route)} ${route.vehicle}`.toLowerCase().includes(needle)),
    )
  }, [state.routes, filter, query])

  const count = (status: RouteStatus) => state.routes.filter((r) => r.status === status).length

  const columns: Column<Route>[] = [
    {
      key: 'code',
      header: copy.columns.code,
      primary: true,
      sort: (a, b) => a.id.localeCompare(b.id),
      cell: (route) => route.id,
    },
    {
      key: 'path',
      header: copy.columns.path,
      cell: (route) => (
        <span className="dm-mono">
          {pathOf(route)}{' '}
          <span className="dm-muted">· {copy.drawer.stopsCount(route.stops.length)}</span>
        </span>
      ),
    },
    {
      key: 'days',
      header: copy.columns.days,
      hideSm: true,
      cell: (route) => <DayDots days={route.days} />,
    },
    { key: 'vehicle', header: copy.columns.vehicle, hideSm: true, cell: (route) => route.vehicle },
    {
      key: 'status',
      header: copy.columns.status,
      sort: (a, b) => a.status.localeCompare(b.status),
      cell: (route) => <Chip tone={statusTone[route.status]}>{copy.status[route.status]}</Chip>,
    },
  ]

  function openRoute(id: string, tab: 'periods' | 'stops' = 'stops') {
    setDrawerTab(tab)
    setSentId(null)
    setOpenId(id)
  }

  function submit(route: Route, changes: Change[], note: string) {
    const id = `S-${String(state.requests.length + 1).padStart(3, '0')}`
    dispatch({ type: 'submit', id, routeId: route.id, changes, note })
    setSentId(id)
    setHighlightId(id)
    showToast(copy.requests.toastSent(route.id))
  }

  function decide(id: string, approved: boolean) {
    const request = state.requests.find((r) => r.id === id)
    const route = state.routes.find((r) => r.id === request?.routeId)
    if (!request || !route) return
    dispatch({ type: approved ? 'approve' : 'reject', id })
    showToast(
      approved
        ? copy.requests.toastApproved(route.id, route.periods[route.periods.length - 1].version + 1)
        : copy.requests.toastRejected(route.id),
    )
  }

  function goManager() {
    setOpenId(null)
    setRole('manager')
    setScreen('requests')
  }

  return (
    <AppFrame
      brand={{ name: copy.brand, mark: 'R' }}
      nav={[
        { id: 'routes', label: copy.nav.routes, icon: 'route' },
        { id: 'requests', label: copy.nav.requests, icon: 'inbox', badge: pendingCount },
      ]}
      active={screen}
      onNav={(id) => setScreen(id as Screen)}
      title={screen === 'routes' ? copy.nav.routes : copy.nav.requests}
      roles={{
        options: [
          { id: 'regional', label: copy.roles.regional },
          { id: 'manager', label: copy.roles.manager },
        ],
        value: role,
        onChange: (id) => setRole(id as Role),
      }}
      onReset={onReset}
      toast={toast}
      drawer={
        open && (
          <RouteDrawer
            key={`${open.id}-${drawerTab}`}
            route={open}
            canRequest={role === 'regional'}
            initialTab={drawerTab}
            sentId={sentId}
            onClose={() => setOpenId(null)}
            onSubmit={(changes, note) => submit(open, changes, note)}
            onGoManager={goManager}
          />
        )
      }
    >
      {screen === 'routes' ? (
        <>
          <div className="dm-toolbar">
            <FilterChips
              label={copy.filterStatus}
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: copy.all, count: state.routes.length },
                { id: 'active', label: copy.status.active, count: count('active') },
                { id: 'pending', label: copy.status.pending, count: count('pending') },
                { id: 'suspended', label: copy.status.suspended, count: count('suspended') },
              ]}
            />
            <div className="dm-grow">
              <SearchField value={query} onChange={setQuery} label={copy.searchLabel} />
            </div>
          </div>
          <div className="rt-layout">
            <DataTable
              caption={copy.routesTable}
              rows={visible}
              columns={columns}
              rowKey={(route) => route.id}
              activeKey={openId}
              onRowClick={(route) => openRoute(route.id)}
              onRowHover={setHoverId}
              initialSort={{ key: 'code', dir: 'asc' }}
            />
            <OverviewMap routes={state.routes} focusId={hoverId ?? openId} />
          </div>
        </>
      ) : (
        <RequestsPage
          requests={state.requests}
          routes={state.routes}
          canDecide={role === 'manager'}
          highlightId={highlightId}
          onApprove={(id) => decide(id, true)}
          onReject={(id) => decide(id, false)}
          onViewRoute={(id) => {
            setScreen('routes')
            openRoute(id, 'periods')
          }}
        />
      )}
    </AppFrame>
  )
}
