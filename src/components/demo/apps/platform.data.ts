export type Role = 'director' | 'south' | 'hr'
export type ToolId = 'assistant' | 'panels' | 'regions' | 'vehicles' | 'access'
export type PanelId =
  'frequency' | 'fleet' | 'costKm' | 'routesPerf' | 'turnover' | 'headcount' | 'margin' | 'budget'
export type QuestionId = 'q1' | 'q2' | 'q3'

export const roles: readonly Role[] = ['director', 'south', 'hr']
export const tools: readonly ToolId[] = ['assistant', 'panels', 'regions', 'vehicles', 'access']

export interface Panel {
  id: PanelId
  /** Perfis que enxergam o painel (o filtro de linha por região vem do perfil). */
  roles: readonly Role[]
  /** Barras decorativas do mini-gráfico (0–100). */
  trend: readonly number[]
}

export const panels: readonly Panel[] = [
  { id: 'frequency', roles: ['director', 'south', 'hr'], trend: [62, 70, 66, 78, 74, 84] },
  { id: 'fleet', roles: ['director', 'south'], trend: [40, 48, 44, 52, 60, 55] },
  { id: 'costKm', roles: ['director', 'south'], trend: [55, 58, 61, 60, 66, 70] },
  { id: 'routesPerf', roles: ['director', 'south'], trend: [72, 68, 75, 80, 78, 86] },
  { id: 'turnover', roles: ['director', 'hr'], trend: [30, 34, 28, 26, 31, 24] },
  { id: 'headcount', roles: ['director', 'hr'], trend: [80, 81, 82, 82, 84, 85] },
  { id: 'margin', roles: ['director'], trend: [45, 52, 50, 58, 63, 66] },
  { id: 'budget', roles: ['director'], trend: [70, 74, 71, 77, 80, 82] },
]

/** Painéis citados como fonte em cada resposta, por pergunta e perfil (vazio = sem acesso). */
export const sources: Record<QuestionId, Record<Role, readonly PanelId[]>> = {
  q1: { director: ['frequency'], south: ['frequency'], hr: ['frequency', 'headcount'] },
  q2: { director: ['fleet', 'routesPerf'], south: ['fleet'], hr: [] },
  q3: { director: ['costKm', 'budget'], south: ['costKm'], hr: [] },
}

export interface UserRow {
  id: string
  /** Só o rótulo do papel: a demo não tem pessoas. */
  access: readonly ToolId[]
}

export const users: readonly UserRow[] = [
  { id: 'director', access: ['assistant', 'panels', 'regions', 'vehicles', 'access'] },
  { id: 'south', access: ['assistant', 'panels', 'regions', 'vehicles'] },
  { id: 'hr', access: ['assistant', 'panels'] },
  { id: 'fleet', access: ['panels', 'vehicles'] },
  { id: 'finance', access: ['assistant', 'panels'] },
  { id: 'sales', access: ['panels'] },
]
