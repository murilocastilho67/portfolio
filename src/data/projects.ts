export type ProjectId = 'platform' | 'routes' | 'balance' | 'payments' | 'planner' | 'crm'

export interface Project {
  id: ProjectId
  /** Stack resumida exibida em caixa alta no topo do card. */
  stack: readonly string[]
  tags: readonly string[]
  production: boolean
}

export const projects: readonly Project[] = [
  {
    id: 'platform',
    stack: ['Python', 'Streamlit', 'LangChain', 'RAG'],
    tags: ['Python', 'Streamlit', 'LangChain', 'Gemini', 'RAG', 'MySQL'],
    production: true,
  },
  {
    id: 'routes',
    stack: ['React', 'FastAPI', 'MySQL'],
    tags: ['React', 'FastAPI', 'Python', 'MySQL'],
    production: true,
  },
  {
    id: 'balance',
    stack: ['Python', 'SQL', 'Oracle'],
    tags: ['Python', 'SQL', 'Oracle', 'Power BI'],
    production: false,
  },
  {
    id: 'payments',
    stack: ['React', 'FastAPI', 'Oracle'],
    tags: ['React', 'FastAPI', 'Python', 'Oracle', 'MySQL'],
    production: false,
  },
  {
    id: 'planner',
    stack: ['React', 'FastAPI', 'MySQL'],
    tags: ['React', 'FastAPI', 'Python', 'MySQL'],
    production: true,
  },
  {
    id: 'crm',
    stack: ['React', 'FastAPI', 'MySQL'],
    tags: ['React', 'FastAPI', 'Python', 'MySQL'],
    production: false,
  },
]

export type AlsoBuiltId =
  | 'portaria'
  | 'aparelhos'
  | 'parametrizacao'
  | 'metas'
  | 'rh'
  | 'interjornada'
  | 'bilhetagem'
  | 'whatsapp'
  | 'frequencia'
  | 'pezinhos'
  | 'domos'

export const alsoBuilt: readonly { id: AlsoBuiltId; stack: string }[] = [
  { id: 'portaria', stack: 'Python, Streamlit' },
  { id: 'aparelhos', stack: 'Python, Streamlit' },
  { id: 'parametrizacao', stack: 'Python, Streamlit' },
  { id: 'metas', stack: 'Power BI, DAX' },
  { id: 'rh', stack: 'Power BI, DAX' },
  { id: 'interjornada', stack: 'Python, Oracle, MySQL' },
  { id: 'bilhetagem', stack: 'SQL, Oracle' },
  { id: 'whatsapp', stack: 'Python' },
  { id: 'frequencia', stack: 'HTML, Chart.js' },
  { id: 'pezinhos', stack: 'React, TypeScript' },
  { id: 'domos', stack: 'HTML, CSS, JS' },
]
