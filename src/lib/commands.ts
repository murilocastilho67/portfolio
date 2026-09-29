import type { SectionId } from '../data/sections'
import type { Lang } from '../i18n/context'
// Mesmos limites que o backend valida; importar evita os dois lados divergirem.
import { MAX_QUESTION, MIN_QUESTION } from '../../api/_lib/validate.ts'

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
  | 'askUsage'
  | 'askInvalid'
  | 'unknown'

export type CommandResult =
  | { type: 'clear' }
  | { type: 'ask'; question: string }
  | { type: 'output'; output: OutputId; section?: SectionId; lang?: Lang }

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

/** Sem comando, uma linha com "?" no fim ou com 4+ palavras é tratada como pergunta. */
const QUESTION_MIN_WORDS = 4

function askResult(question: string): CommandResult {
  const cleaned = question.replace(/^["'“”‘’](.*)["'“”‘’]$/, '$1').trim()
  if (cleaned.length < MIN_QUESTION || cleaned.length > MAX_QUESTION) {
    return { type: 'output', output: 'askInvalid' }
  }
  return { type: 'ask', question: cleaned }
}

/** Interpreta a linha digitada no terminal. Retorna `null` para entrada vazia. */
export function parseCommand(raw: string): CommandResult | null {
  const text = raw.trim().replace(/\s+/g, ' ')
  const input = text.toLowerCase()
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

  const asked = /^(?:ask|pergunte)(?: (.+))?$/i.exec(text)
  if (asked) return asked[1] ? askResult(asked[1]) : { type: 'output', output: 'askUsage' }

  const section = sectionCommands[input]
  if (section) return { type: 'output', ...section }

  if (input.endsWith('?') || input.split(' ').length >= QUESTION_MIN_WORDS) return askResult(text)

  return { type: 'output', output: 'unknown' }
}
