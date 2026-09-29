/**
 * Easter eggs do terminal (ls, cat stack.json, git log, neofetch, coffee, sudo rm, exit, matrix).
 * Tudo aqui é opcional: para remover um, apague a entrada em `extraCommands`, o caso em
 * `dynamicLines` (se houver) e o texto em `terminal.out` / `terminal.extras` no i18n.
 */
import { careerItems } from '../data/career'
import { stackGroups } from '../data/stack'
import { stats } from '../data/stats'
import type { Dict } from '../i18n/pt'
import type { OutputId } from './commands'

/** Linha de terminal; a forma em objeto pinta o começo (`accent`) em âmbar. */
export type TermLine = string | { accent: string; text: string }

/** Saídas montadas a partir dos dados do site, não de texto fixo do i18n. */
export type DynamicId = 'catStack' | 'gitLog' | 'neofetch'

export type Effect = 'turbo' | 'boot'

interface Extra {
  output: OutputId | DynamicId
  effect?: Effect
}

/** Comandos (já em minúsculas, espaços normalizados) que disparam um easter egg. */
export const extraCommands: Record<string, Extra> = {
  ls: { output: 'ls' },
  'cat stack.json': { output: 'catStack' },
  'git log': { output: 'gitLog' },
  neofetch: { output: 'neofetch' },
  coffee: { output: 'coffee' },
  cafe: { output: 'coffee' },
  café: { output: 'coffee' },
  'sudo rm -rf /': { output: 'sudoRm' },
  'sudo rm -rf /*': { output: 'sudoRm' },
  exit: { output: 'exit' },
  matrix: { output: 'matrix', effect: 'turbo' },
}

/** Hashes de mentira, do commit mais recente ao mais antigo (o último é o "commit inicial"). */
const HASHES = ['a1f3e2c', '7c9d0b4', '3e5a8f1', '0000001']

/** Início da carreira, para o uptime do neofetch. */
const CAREER_START_YEAR = 2019

const LOGO = ['┌────┐  ', '│ >  │  ', '│  _ │  ', '└────┘  ']
const BLANK = ' '.repeat(LOGO[0].length)

function gitLog(t: Dict): TermLine[] {
  return careerItems.map((item, i) => {
    const role = t.career.items[item.id].role
    const unit = i === 0 ? '' : ` · ${t.terminal.extras.units[item.unit]}`
    const head = i === 0 ? ' (HEAD -> main)' : ''
    return { accent: `${HASHES[i]}${head}`, text: ` ${item.start} ${role}${unit}` }
  })
}

const stat = (id: (typeof stats)[number]['id']) => {
  const found = stats.find((item) => item.id === id)
  return found ? `${found.value}${found.suffix}` : ''
}

function neofetch(t: Dict): TermLine[] {
  const labels = t.terminal.extras.neofetch
  const years = new Date().getFullYear() - CAREER_START_YEAR
  const info: [string, string][] = [
    ['', 'murilo@castilho'],
    ['', '───────────────'],
    [labels.location, 'Santa Catarina, BR'],
    [labels.stack, 'Python, FastAPI, React'],
    [labels.systems, stat('systems')],
    [labels.ai, stat('ai')],
    [labels.langs, 'pt, en'],
    [labels.uptime, labels.years.replace('{n}', String(years))],
  ]
  const width = Math.max(...info.map(([label]) => label.length))
  return info.map(([label, value], i) => ({
    accent: LOGO[i] ?? BLANK,
    text: label ? `${label.padEnd(width)}  ${value}` : value,
  }))
}

/** Linhas de uma saída do terminal: as dinâmicas são montadas aqui, o resto vem do i18n. */
export function outputLines(t: Dict, id: OutputId | DynamicId): readonly TermLine[] {
  switch (id) {
    case 'catStack':
      return JSON.stringify(
        Object.fromEntries(stackGroups.map((group) => [group.id, group.items])),
        null,
        2,
      ).split('\n')
    case 'gitLog':
      return gitLog(t)
    case 'neofetch':
      return neofetch(t)
    default:
      return t.terminal.out[id]
  }
}
