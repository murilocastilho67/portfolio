import type { ComponentType } from 'react'
import type { ProjectId } from '../../data/projects'
import type { DemoAppProps } from './kit/context'

interface DemoApp {
  /** Trecho do endereço fictício exibido na barra do "navegador". */
  path: string
  load: () => Promise<{ default: ComponentType<DemoAppProps> }>
}

export const apps: Record<ProjectId, DemoApp> = {
  platform: { path: 'portal', load: () => import('./apps/PlatformDemo') },
  routes: { path: 'rotas', load: () => import('./apps/RoutesDemo') },
  balance: { path: 'contabil', load: () => import('./apps/BalanceDemo') },
  payments: { path: 'pagamentos', load: () => import('./apps/PaymentsDemo') },
  planner: { path: 'planner', load: () => import('./apps/PlannerDemo') },
  crm: { path: 'cotacoes', load: () => import('./apps/CrmDemo') },
}

/** Carrega o chunk do app do projeto; quem abre a janela espera isso antes de montá-la. */
export async function loadApp(project: ProjectId): Promise<ComponentType<DemoAppProps>> {
  return (await apps[project].load()).default
}
