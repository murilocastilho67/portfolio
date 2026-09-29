export type QuoteStatus = 'COTADO' | 'CANCELADA' | 'CONTRATADA'
export type ReasonId =
  'price' | 'deadline' | 'noReply' | 'clientCancelled' | 'competitor' | 'capacity'
export type Unit = 'CDR' | 'FLN' | 'JVL' | 'CWB' | 'POA' | 'BLU'

export const reasons: readonly ReasonId[] = [
  'price',
  'deadline',
  'noReply',
  'clientCancelled',
  'competitor',
  'capacity',
]
export const units: readonly Unit[] = ['CDR', 'FLN', 'JVL', 'CWB', 'POA', 'BLU']

export interface Quote {
  id: string
  client: string
  from: Unit
  to: Unit
  /** Valor fictício, arredondado. */
  value: number
  status: QuoteStatus
  /** Dias parada sem virar receita. */
  idle: number
  unit: Unit
  reason?: ReasonId
  note?: string
}

const q = (
  n: number,
  client: string,
  from: Unit,
  to: Unit,
  value: number,
  status: QuoteStatus,
  idle: number,
  reason?: ReasonId,
): Quote => ({
  id: `C-${2000 + n}`,
  client: `Cliente ${client}`,
  from,
  to,
  value,
  status,
  idle,
  unit: from,
  reason,
})

export const initialQuotes: readonly Quote[] = [
  q(41, '0142', 'CDR', 'FLN', 8500, 'COTADO', 12),
  q(42, '0087', 'CWB', 'POA', 6200, 'COTADO', 9),
  q(43, '0203', 'JVL', 'BLU', 3100, 'CANCELADA', 21),
  q(44, '0142', 'FLN', 'CDR', 7400, 'COTADO', 5),
  q(45, '0311', 'POA', 'CWB', 9800, 'CONTRATADA', 15),
  q(46, '0056', 'BLU', 'JVL', 2700, 'COTADO', 30),
  q(47, '0178', 'CDR', 'CWB', 5600, 'CANCELADA', 18),
  q(48, '0245', 'CWB', 'FLN', 11200, 'COTADO', 7),
  q(49, '0099', 'JVL', 'CDR', 4300, 'COTADO', 26),
  q(50, '0312', 'POA', 'BLU', 12500, 'CONTRATADA', 11),

  q(1, '0101', 'CDR', 'FLN', 7000, 'COTADO', 40, 'price'),
  q(2, '0102', 'CDR', 'CWB', 5200, 'COTADO', 35, 'price'),
  q(3, '0103', 'FLN', 'POA', 9100, 'CANCELADA', 33, 'price'),
  q(4, '0104', 'CWB', 'JVL', 3900, 'COTADO', 28, 'price'),
  q(5, '0105', 'POA', 'CDR', 8800, 'COTADO', 45, 'deadline'),
  q(6, '0106', 'JVL', 'FLN', 4100, 'COTADO', 31, 'deadline'),
  q(7, '0107', 'CDR', 'BLU', 6600, 'CANCELADA', 22, 'deadline'),
  q(8, '0108', 'BLU', 'CWB', 2900, 'COTADO', 50, 'noReply'),
  q(9, '0109', 'FLN', 'CDR', 7700, 'COTADO', 44, 'noReply'),
  q(10, '0110', 'CWB', 'POA', 5300, 'COTADO', 38, 'noReply'),
  q(11, '0111', 'POA', 'JVL', 10400, 'COTADO', 36, 'noReply'),
  q(12, '0112', 'CDR', 'POA', 6100, 'CANCELADA', 19, 'clientCancelled'),
  q(13, '0113', 'JVL', 'CWB', 3600, 'CANCELADA', 27, 'clientCancelled'),
  q(14, '0114', 'FLN', 'BLU', 4800, 'COTADO', 29, 'competitor'),
  q(15, '0115', 'CWB', 'CDR', 5900, 'COTADO', 34, 'competitor'),
  q(16, '0116', 'BLU', 'FLN', 3300, 'CONTRATADA', 24, 'capacity'),
  q(17, '0117', 'POA', 'CWB', 7900, 'COTADO', 41, 'price'),
  q(18, '0118', 'CDR', 'JVL', 4400, 'COTADO', 37, 'noReply'),
]
