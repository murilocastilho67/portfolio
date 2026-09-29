/**
 * Gera `server/data/rag-index.json`: o conteúdo do site (dicionário pt + `rag/sobre-mim.md`)
 * quebrado em trechos e vetorizado com o Gemini.
 *
 *   npm run rag:index               indexa (precisa de GEMINI_API_KEY em .env.local)
 *   npm run rag:index -- --no-embed grava os trechos sem embeddings (índice placeholder)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { embedDocuments } from '../server/lib/gemini.ts'
import type { RagChunk } from '../server/lib/types.ts'
import { careerItems, educationItems } from '../src/data/career.ts'
import { EMAIL, GITHUB_PERSONAL_URL, GITHUB_PROJECTS_URL, LINKEDIN_URL } from '../src/data/links.ts'
import { projects } from '../src/data/projects.ts'
import { stackGroups } from '../src/data/stack.ts'
import { en } from '../src/i18n/en.ts'
import { pt, type Dict } from '../src/i18n/pt.ts'

type Draft = Omit<RagChunk, 'embedding'>
type SectionKey = keyof Dict['sections']

const OUT_FILE = new URL('../server/data/rag-index.json', import.meta.url)
const ENV_FILE = new URL('../.env.local', import.meta.url)
const MARKDOWN_FILE = new URL('../rag/sobre-mim.md', import.meta.url)
const BATCH_SIZE = 50
const DEFAULT_EMBED_MODEL = 'gemini-embedding-001'

const log = (message: string) => process.stdout.write(`${message}\n`)

/** Lê `KEY=valor` do `.env.local`, sem dependência de dotenv. */
function loadEnvFile() {
  if (!existsSync(ENV_FILE)) return
  for (const line of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (!match || match[1] in process.env) continue
    process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2')
  }
}

const label = (dict: Dict, section: SectionKey, detail?: string) =>
  detail ? `${dict.sections[section].eyebrow} · ${detail}` : dict.sections[section].eyebrow

/** Chunk com o rótulo montado a partir dos dois dicionários (o texto vem sempre do pt). */
function draft(
  id: string,
  section: SectionKey,
  text: string,
  detail?: (dict: Dict) => string | undefined,
): Draft {
  return {
    id,
    section,
    label_pt: label(pt, section, detail?.(pt)),
    label_en: label(en, section, detail?.(en)),
    text,
  }
}

const flow = (steps: readonly string[]) => steps.map((step) => step.replace('|', ' – ')).join(' → ')

function siteChunks(): Draft[] {
  const chunks: Draft[] = []

  chunks.push(
    draft(
      'hero',
      'sobre',
      `${pt.hero.name}: ${pt.hero.headline1} ${pt.hero.headline2} Foco atual: ${pt.hero.roles.join('; ')}. ${pt.hero.lede} ${pt.hero.status}.`,
    ),
    draft('sobre-resumo', 'sobre', pt.about.lede),
  )

  pt.about.cards.forEach((card, i) => {
    chunks.push(
      draft(
        `sobre-card-${i + 1}`,
        'sobre',
        `${card.title}. ${card.text}`,
        (d) => d.about.cards[i].title,
      ),
    )
  })

  for (const group of stackGroups) {
    chunks.push(
      draft(
        `stack-${group.id}`,
        'stack',
        `${pt.stack.groups[group.id]}: ${group.items.join(', ')}.`,
        (d) => d.stack.groups[group.id],
      ),
    )
  }
  chunks.push(
    draft(
      'stack-construcao',
      'stack',
      `${pt.stack.building.title}: ${pt.stack.building.items.join('; ')}.`,
      (d) => d.stack.building.title,
    ),
  )

  chunks.push(draft('projetos-resumo', 'projetos', pt.projects.lede))
  for (const project of projects) {
    const item = pt.projects.items[project.id]
    const status = project.production ? `${item.domain}, ${pt.projects.production}` : item.domain
    chunks.push(
      draft(
        `projeto-${project.id}`,
        'projetos',
        `${item.title} (${status}). ${item.text} Fluxo: ${flow(item.steps)}. Tecnologias: ${project.tags.join(', ')}.`,
        (d) => d.projects.items[project.id].title,
      ),
    )
  }

  const also = Object.values(pt.projects.also).map((item) => `${item.name}: ${item.text}`)
  const half = Math.ceil(also.length / 2)
  const alsoDetail = (d: Dict) => d.projects.alsoTitle.replace(/^\+\s*/, '')
  chunks.push(
    draft(
      'projetos-tambem-1',
      'projetos',
      `Também construí. ${also.slice(0, half).join('. ')}.`,
      alsoDetail,
    ),
    draft(
      'projetos-tambem-2',
      'projetos',
      `Também construí. ${also.slice(half).join('. ')}.`,
      alsoDetail,
    ),
  )

  chunks.push(draft('carreira-resumo', 'carreira', pt.career.lede))
  for (const item of careerItems) {
    const text = pt.career.items[item.id]
    const period = `${item.start}–${item.end ?? pt.career.present}`
    const bullets = text.bullets.length > 0 ? ` ${text.bullets.join('; ')}.` : ''
    chunks.push(
      draft(
        `carreira-${item.id}`,
        'carreira',
        `${text.role}, ${pt.career.org[item.unit]} (${period}).${bullets}`,
        (d) => d.career.items[item.id].role,
      ),
    )
  }
  const education = educationItems.map((item) => {
    const { course, school } = pt.career.education[item.id]
    return `${course} na ${school} (${item.start}–${item.end})`
  })
  chunks.push(
    draft(
      'carreira-formacao',
      'carreira',
      `${pt.career.educationTitle}: ${education.join('; ')}.`,
      (d) => d.career.educationTitle,
    ),
  )

  pt.process.steps.forEach((step, i) => {
    chunks.push(
      draft(
        `processo-${i + 1}`,
        'processo',
        `${step.title}. ${step.text}`,
        (d) => d.process.steps[i].title,
      ),
    )
  })
  chunks.push(draft('processo-cliente', 'processo', pt.process.closing))

  chunks.push(
    draft(
      'contato',
      'contato',
      `${pt.contact.lede} E-mail: ${EMAIL}. LinkedIn: ${LINKEDIN_URL}. GitHub (projetos): ${GITHUB_PROJECTS_URL}. GitHub (pessoal): ${GITHUB_PERSONAL_URL}.`,
    ),
  )

  return chunks
}

/** Um chunk por bloco `## ` de `rag/sobre-mim.md`; `<!-- section: x -->` define a seção da fonte. */
function markdownChunks(): Draft[] {
  const blocks = readFileSync(MARKDOWN_FILE, 'utf8').split(/^## /m).slice(1)
  return blocks.map((block, i) => {
    const [title, ...rest] = block.split(/\r?\n/)
    const body = rest.join('\n')
    const section = /<!--\s*section:\s*(\w+)\s*-->/.exec(body)?.[1]
    if (!section || !(section in pt.sections)) {
      throw new Error(`rag/sobre-mim.md: bloco "${title}" sem <!-- section: ... --> válido`)
    }
    const text = body.replace(/<!--.*?-->/g, '').trim()
    return draft(`sobre-mim-${i + 1}`, section as SectionKey, `${title.trim()}. ${text}`)
  })
}

const round5 = (values: readonly number[]) => values.map((x) => Math.round(x * 1e5) / 1e5)

async function embedAll(drafts: readonly Draft[]): Promise<RagChunk[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY ausente (defina em .env.local ou no ambiente)')
  const model = process.env.GEMINI_EMBED_MODEL || DEFAULT_EMBED_MODEL

  const chunks: RagChunk[] = []
  for (let start = 0; start < drafts.length; start += BATCH_SIZE) {
    const batch = drafts.slice(start, start + BATCH_SIZE)
    const vectors = await embedDocuments(
      apiKey,
      model,
      batch.map((d) => d.text),
    )
    batch.forEach((d, i) => chunks.push({ ...d, embedding: round5(vectors[i]) }))
    log(`embeddings: ${chunks.length}/${drafts.length}`)
  }
  return chunks
}

async function main() {
  loadEnvFile()
  const drafts = [...siteChunks(), ...markdownChunks()]
  const noEmbed = process.argv.includes('--no-embed')
  const chunks = noEmbed ? drafts.map((d) => ({ ...d, embedding: [] })) : await embedAll(drafts)

  // Um chunk por linha: diffs legíveis mesmo com os vetores inline.
  const json = `[\n${chunks.map((chunk) => `  ${JSON.stringify(chunk)}`).join(',\n')}\n]\n`
  writeFileSync(OUT_FILE, json)
  log(
    `${chunks.length} trechos gravados em server/data/rag-index.json${noEmbed ? ' (sem embeddings)' : ''}`,
  )
}

await main()
