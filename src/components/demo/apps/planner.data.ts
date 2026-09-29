import { DEMO_TODAY } from '../kit/lib'

export type Col = 'todo' | 'doing' | 'blocked' | 'done'
export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type Assignee = 'coord' | 'sales' | 'regional' | 'fleet' | 'finance'

export const columns: readonly Col[] = ['todo', 'doing', 'blocked', 'done']
export const priorities: readonly Priority[] = ['urgent', 'high', 'medium', 'low']
export const assignees: readonly Assignee[] = ['coord', 'sales', 'regional', 'fleet', 'finance']

export interface Card {
  id: string
  col: Col
  priority: Priority
  due: string
  assignee: Assignee
  /** Marcação de cada subtarefa (os textos ficam no copy, na mesma ordem). */
  subtasks: readonly boolean[]
  /** Texto do impedimento; null usa o texto-padrão do copy. */
  blockedNote: string | null
  /** Concluída nesta semana (alimenta o indicador). */
  doneThisWeek: boolean
}

const card = (
  id: string,
  col: Col,
  priority: Priority,
  due: string,
  assignee: Assignee,
  subtasks: readonly boolean[],
  doneThisWeek = false,
): Card => ({ id, col, priority, due, assignee, subtasks, blockedNote: null, doneThisWeek })

export const initialCards: readonly Card[] = [
  card('p1', 'todo', 'urgent', '2026-07-02', 'coord', [true, false, false]),
  card('p2', 'todo', 'high', '2026-07-08', 'regional', [false, false]),
  card('p3', 'todo', 'medium', '2026-07-15', 'finance', [false, false, false, false]),
  card('p4', 'todo', 'low', '2026-07-30', 'sales', []),
  card('p5', 'doing', 'high', '2026-06-30', 'fleet', [true, true, false, false]),
  card('p6', 'doing', 'medium', '2026-07-10', 'coord', [true, false, false]),
  card('p7', 'doing', 'urgent', '2026-07-03', 'regional', [true, true, true, false, false]),
  card('p8', 'blocked', 'high', '2026-07-05', 'finance', [true, false, false]),
  card('p9', 'blocked', 'medium', '2026-07-12', 'sales', [false, false]),
  card('p10', 'done', 'low', '2026-06-26', 'coord', [true, true, true], true),
  card('p11', 'done', 'medium', '2026-06-25', 'fleet', [true, true], true),
  card('p12', 'done', 'high', '2026-06-10', 'regional', [true, true, true, true]),
]

export interface Activity {
  id: number
  text: string
  /** Gera notificação no sino (delegar e impedir). */
  notify: boolean
}

export const isOverdue = (card: Card) => card.col !== 'done' && card.due < DEMO_TODAY
