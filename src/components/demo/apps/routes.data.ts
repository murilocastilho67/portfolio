import { DEMO_TODAY } from '../kit/lib'

export type NodeId = 'CDR' | 'ITJ' | 'BLU' | 'JVL' | 'SPL' | 'CWB' | 'FLN' | 'MGF' | 'LDA' | 'POA'
export type RouteStatus = 'active' | 'pending' | 'suspended'
export type StopOp = 'load' | 'unload' | 'pass'
export type Actor = 'regional' | 'manager' | 'system'

export const TODAY = DEMO_TODAY

/** Disposição fixa e fictícia das unidades no mapa esquemático (fora de escala). */
export const nodes: Record<NodeId, { x: number; y: number }> = {
  CDR: { x: 110, y: 100 },
  ITJ: { x: 250, y: 55 },
  BLU: { x: 400, y: 65 },
  JVL: { x: 545, y: 115 },
  SPL: { x: 330, y: 170 },
  CWB: { x: 210, y: 235 },
  FLN: { x: 510, y: 245 },
  MGF: { x: 420, y: 325 },
  LDA: { x: 290, y: 330 },
  POA: { x: 95, y: 305 },
}
export const nodeIds = Object.keys(nodes) as NodeId[]

export interface Stop {
  code: NodeId
  /** Dias após a saída (D+0, D+1…). */
  offset: number
  time: string
  op: StopOp
}

export type Change =
  | { kind: 'time'; stop: number; code: NodeId; from: string; to: string }
  | { kind: 'day'; day: number }
  | { kind: 'stop'; code: NodeId; after: number; time: string }

export interface Period {
  version: number
  from: string
  to: string | null
  kind: 'initial' | 'adjust' | 'change'
  changes?: readonly Change[]
}

export interface HistoryEntry {
  date: string
  actor: Actor
  kind: 'created' | 'submitted' | 'approved' | 'rejected' | 'suspended'
}

export interface Route {
  id: string
  /** 7 posições, segunda a domingo. */
  days: readonly boolean[]
  vehicle: string
  status: RouteStatus
  stops: readonly Stop[]
  periods: readonly Period[]
  history: readonly HistoryEntry[]
}

export interface ChangeRequest {
  id: string
  routeId: string
  note: string
  changes: readonly Change[]
  status: 'pending' | 'approved' | 'rejected'
  /** Situação da rota antes do pedido, para a recusa devolvê-la. */
  prevStatus: RouteStatus
  date: string
}

/** Monta as paradas a partir da lista de unidades: horário inicial e passo entre paradas. */
function stops(codes: readonly NodeId[], startMin: number, stepMin: number): Stop[] {
  return codes.map((code, i) => {
    const total = startMin + i * stepMin
    const hh = String(Math.floor((total % 1440) / 60)).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    const op: StopOp =
      i === 0 ? 'load' : i === codes.length - 1 ? 'unload' : i % 2 ? 'pass' : 'unload'
    return { code, offset: Math.floor(total / 1440), time: `${hh}:${mm}`, op }
  })
}

function route(
  id: string,
  codes: readonly NodeId[],
  days: string,
  vehicle: string,
  status: RouteStatus,
  startMin: number,
  stepMin: number,
  versions: 1 | 2 = 1,
): Route {
  const created = { date: '2026-01-05', actor: 'regional', kind: 'created' } as const
  return {
    id,
    days: [...days].map((d) => d === '1'),
    vehicle,
    status,
    stops: stops(codes, startMin, stepMin),
    periods:
      versions === 2
        ? [
            { version: 1, from: '2025-07-01', to: '2026-03-31', kind: 'initial' },
            { version: 2, from: '2026-04-01', to: null, kind: 'adjust' },
          ]
        : [{ version: 1, from: '2026-01-05', to: null, kind: 'initial' }],
    history:
      versions === 2
        ? [
            { date: '2025-07-01', actor: 'regional', kind: 'created' },
            { date: '2026-04-01', actor: 'manager', kind: 'approved' },
          ]
        : status === 'suspended'
          ? [created, { date: '2026-05-12', actor: 'manager', kind: 'suspended' }]
          : [created],
  }
}

export const initialRoutes: readonly Route[] = [
  route(
    'R-014',
    ['CDR', 'SPL', 'CWB', 'FLN'],
    '1111100',
    'Carreta 12',
    'active',
    7 * 60 + 30,
    210,
    2,
  ),
  route('R-015', ['CDR', 'ITJ', 'BLU', 'JVL'], '1010100', 'Carreta 08', 'active', 6 * 60, 150),
  route('R-016', ['POA', 'CWB', 'SPL', 'CDR'], '0111110', 'Bitrem 03', 'active', 20 * 60, 200),
  route('R-017', ['FLN', 'CWB', 'POA'], '1100110', 'Truck 04', 'active', 5 * 60 + 15, 240),
  route('R-018', ['JVL', 'BLU', 'ITJ', 'CDR'], '0011100', 'Carreta 21', 'pending', 9 * 60, 180, 2),
  route('R-019', ['MGF', 'SPL', 'BLU'], '1111000', 'Carreta 05', 'active', 22 * 60, 190),
  route('R-020', ['LDA', 'CWB', 'SPL'], '0101010', 'Truck 09', 'suspended', 8 * 60, 130),
  route('R-021', ['POA', 'LDA', 'MGF', 'FLN'], '1000110', 'Bitrem 07', 'active', 18 * 60, 260),
  route('R-022', ['CDR', 'CWB', 'POA'], '1111111', 'Carreta 17', 'active', 4 * 60 + 45, 230),
  route('R-023', ['BLU', 'JVL', 'FLN'], '0110011', 'Carreta 02', 'active', 10 * 60, 170, 2),
  route('R-024', ['SPL', 'MGF', 'FLN'], '1010101', 'Truck 11', 'active', 13 * 60 + 30, 160),
  route('R-025', ['ITJ', 'SPL', 'LDA'], '0001110', 'Carreta 14', 'suspended', 7 * 60, 145),
  route('R-026', ['JVL', 'SPL', 'CWB', 'LDA'], '1111100', 'Bitrem 01', 'active', 21 * 60, 220),
  route('R-027', ['CWB', 'FLN', 'MGF'], '1100000', 'Truck 06', 'active', 11 * 60 + 15, 185),
]

export const initialRequests: readonly ChangeRequest[] = [
  {
    id: 'S-001',
    routeId: 'R-018',
    note: '',
    changes: [
      { kind: 'time', stop: 1, code: 'BLU', from: '12:00', to: '12:40' },
      { kind: 'day', day: 5 },
    ],
    status: 'pending',
    prevStatus: 'active',
    date: '2026-06-29',
  },
]
