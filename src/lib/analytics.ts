import { track as vercelTrack } from '@vercel/analytics'
import type { ProjectId } from '../data/projects'

/**
 * Eventos customizados e seus dados. Nunca enviar texto digitado pelo usuário (a pergunta do
 * `ask` fica de fora). Os eventos customizados dependem do plano da Vercel; as visualizações de
 * página funcionam sempre. Fora da Vercel/produção o `track` não faz nada.
 */
interface EventData {
  ask_question: { source: 'terminal' | 'chip' }
  copy_email: undefined
  open_linkedin: undefined
  open_github: undefined
  open_whatsapp: undefined
  open_palette: undefined
  switch_lang: undefined
  switch_theme: undefined
  konami: undefined
  boot_skipped: undefined
  open_demo: { project: ProjectId }
}

export type AnalyticsEvent = keyof EventData

export function track<E extends AnalyticsEvent>(
  event: E,
  ...[data]: EventData[E] extends undefined ? [] : [EventData[E]]
): void {
  vercelTrack(event, data)
}
