import type { SectionId } from '../data/sections'
import type { Lang } from '../i18n/context'

export type OutputId =
  | 'help'
  | 'about'
  | 'stack'
  | 'projects'
  | 'career'
  | 'contact'
  | 'hire'
  | 'langPt'
  | 'langEn'
  | 'unknown'

export type CommandResult =
  { type: 'clear' } | { type: 'output'; output: OutputId; section?: SectionId; lang?: Lang }

const sectionCommands: Record<string, { output: OutputId; section: SectionId }> = {
  sobre: { output: 'about', section: 'sobre' },
  about: { output: 'about', section: 'sobre' },
  stack: { output: 'stack', section: 'stack' },
  projetos: { output: 'projects', section: 'projetos' },
  projects: { output: 'projects', section: 'projetos' },
  carreira: { output: 'career', section: 'carreira' },
  career: { output: 'career', section: 'carreira' },
  contato: { output: 'contact', section: 'contato' },
  contact: { output: 'contact', section: 'contato' },
}

/** Interpreta a linha digitada no terminal. Retorna `null` para entrada vazia. */
export function parseCommand(raw: string): CommandResult | null {
  const input = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!input) return null

  if (input === 'clear' || input === 'cls') return { type: 'clear' }
  if (input === 'help' || input === 'ajuda' || input === '?')
    return { type: 'output', output: 'help' }
  if (input === 'lang pt' || input === 'lang pt-br')
    return { type: 'output', output: 'langPt', lang: 'pt' }
  if (input === 'lang en') return { type: 'output', output: 'langEn', lang: 'en' }
  if (input === 'sudo contratar' || input === 'sudo hire' || input === 'sudo hire me') {
    return { type: 'output', output: 'hire', section: 'contato' }
  }

  const section = sectionCommands[input]
  if (section) return { type: 'output', ...section }

  return { type: 'output', output: 'unknown' }
}
