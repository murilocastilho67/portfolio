import type { Lang } from '../../../i18n/context'
import type { PanelId, QuestionId, Role, ToolId } from './platform.data'

const pt = {
  brand: 'Portal Interno',
  roles: { director: 'Diretoria', south: 'Coordenação Sul', hr: 'Analista RH' } satisfies Record<
    Role,
    string
  >,
  tools: {
    assistant: 'Assistente IA',
    panels: 'Painéis',
    regions: 'Regionais',
    vehicles: 'Veículos',
    access: 'Acessos',
  } satisfies Record<ToolId, string>,
  toolsShort: {
    assistant: 'IA',
    panels: 'Painéis',
    regions: 'Reg.',
    vehicles: 'Veíc.',
    access: 'Acessos',
  } satisfies Record<ToolId, string>,
  users: {
    director: 'Diretoria',
    south: 'Coordenação Sul',
    hr: 'Analista RH',
    fleet: 'Gestor de frota',
    finance: 'Analista financeiro',
    sales: 'Comercial 03',
  } as Record<string, string>,
  panelNames: {
    frequency: 'Frequência por regional',
    fleet: 'Manutenção de frota',
    costKm: 'Custo por km',
    routesPerf: 'Desempenho de rotas',
    turnover: 'Turnover e absenteísmo',
    headcount: 'Quadro de pessoal',
    margin: 'Margem por unidade',
    budget: 'Orçado x realizado',
  } satisfies Record<PanelId, string>,
  panels: {
    title: 'Painéis',
    granted: (n: number) => `${n} liberados`,
    locked: (n: number) => `${n} sem permissão`,
    scope: 'Filtro de linha aplicado',
    scopeAll: 'todas as regionais',
    scopeSouth: 'Regional Sul',
    updated: 'atualizado às 06:00',
    noAccess: 'sem permissão',
    open: (name: string) => `Abrindo “${name}” (demonstração)`,
    lede: 'A lista de painéis muda conforme o perfil, sem ninguém configurar tela por tela.',
  },
  chat: {
    title: 'Assistente IA',
    hello: 'Pergunte sobre os painéis a que você tem acesso. As respostas citam a fonte.',
    suggested: 'Perguntas sugeridas',
    questions: {
      q1: 'Como está a frequência do mês por regional?',
      q2: 'Quais veículos estão com manutenção vencida?',
      q3: 'O custo por km subiu neste trimestre?',
    } satisfies Record<QuestionId, string>,
    answers: {
      q1: {
        director:
          'Frequência média do mês em 94%. A Regional Sul lidera com 96%, a Regional Norte fica em 91% e concentra as faltas sem justificativa. Ao todo são 5 regionais no comparativo.',
        south:
          'Na Regional Sul a frequência do mês está em 96%, acima da meta de 95%. As duas unidades com mais faltas somam 11 ocorrências, ambas com atestado.',
        hr: 'Frequência média do mês em 94% no consolidado. O quadro de pessoal ativo é de 1.200 colaboradores e as faltas sem justificativa caíram em relação ao mês anterior.',
      },
      q2: {
        director:
          'Há 14 veículos com revisão vencida no consolidado: 6 na Regional Sul, 5 na Norte e 3 na Leste. 4 deles rodam rotas de longa distância e merecem prioridade.',
        south:
          'Na Regional Sul são 6 veículos com revisão vencida. 2 são carretas de rotas longas; a maior atraso é de 18 dias.',
        hr: 'Você não tem permissão para os painéis de frota, então não consigo responder a partir deles. Posso ajudar com frequência, quadro de pessoal e turnover.',
      },
      q3: {
        director:
          'O custo por km subiu 3,2% no trimestre, puxado por combustível. A margem por unidade ainda está acima do orçado em 4 das 6 regionais.',
        south:
          'Na Regional Sul o custo por km subiu 2,1% no trimestre, abaixo da média geral. O painel mostra o combustível como principal fator.',
        hr: 'Você não tem permissão para os painéis de custo, então não consigo responder a partir deles. Posso ajudar com frequência, quadro de pessoal e turnover.',
      },
    } satisfies Record<QuestionId, Record<Role, string>>,
    sources: 'Fontes',
    noSources: 'sem fonte liberada para este perfil',
    inputLabel: 'Sua pergunta',
    inputPlaceholder: 'Escreva uma pergunta…',
    send: 'Enviar',
    demoOnly:
      'Nesta demonstração só as perguntas sugeridas têm resposta pronta. No sistema real, o modelo busca nos painéis liberados para o seu perfil.',
    you: 'Você',
    assistant: 'Assistente',
    done: 'Resposta pronta',
    typing: 'Escrevendo…',
  },
  access: {
    title: 'Acessos',
    user: 'Perfil',
    lede: 'Quem enxerga cada ferramenta. Só a Diretoria altera.',
    readOnly: 'Somente leitura: apenas o perfil Diretoria altera acessos.',
    granted: (tool: string, user: string) => `Acesso a ${tool} concedido: ${user}`,
    revoked: (tool: string, user: string) => `Acesso a ${tool} removido: ${user}`,
    toggle: (tool: string, user: string) => `${tool} para ${user}`,
  },
}

const en: typeof pt = {
  brand: 'Internal Portal',
  roles: { director: 'Executive board', south: 'South coordination', hr: 'HR analyst' },
  tools: {
    assistant: 'AI assistant',
    panels: 'Dashboards',
    regions: 'Regions',
    vehicles: 'Vehicles',
    access: 'Access',
  },
  toolsShort: {
    assistant: 'AI',
    panels: 'Dash.',
    regions: 'Reg.',
    vehicles: 'Veh.',
    access: 'Access',
  },
  users: {
    director: 'Executive board',
    south: 'South coordination',
    hr: 'HR analyst',
    fleet: 'Fleet manager',
    finance: 'Finance analyst',
    sales: 'Sales 03',
  },
  panelNames: {
    frequency: 'Attendance by region',
    fleet: 'Fleet maintenance',
    costKm: 'Cost per km',
    routesPerf: 'Route performance',
    turnover: 'Turnover and absenteeism',
    headcount: 'Headcount',
    margin: 'Margin by unit',
    budget: 'Budget vs actual',
  },
  panels: {
    title: 'Dashboards',
    granted: (n) => `${n} granted`,
    locked: (n) => `${n} without permission`,
    scope: 'Row filter applied',
    scopeAll: 'all regions',
    scopeSouth: 'South region',
    updated: 'updated at 6:00 AM',
    noAccess: 'no permission',
    open: (name) => `Opening “${name}” (demo)`,
    lede: 'The dashboard list changes with the role, with no per-screen setup.',
  },
  chat: {
    title: 'AI assistant',
    hello: 'Ask about the dashboards you can access. Answers cite their source.',
    suggested: 'Suggested questions',
    questions: {
      q1: 'How is this month’s attendance by region?',
      q2: 'Which vehicles are overdue for maintenance?',
      q3: 'Did cost per km go up this quarter?',
    },
    answers: {
      q1: {
        director:
          'Average attendance this month is 94%. The South region leads with 96%, while the North region sits at 91% and concentrates unexcused absences. Five regions are in the comparison.',
        south:
          'In the South region attendance is 96% this month, above the 95% target. The two units with the most absences add up to 11 occurrences, all with a medical note.',
        hr: 'Average attendance is 94% overall. Active headcount is 1,200 employees and unexcused absences dropped compared with last month.',
      },
      q2: {
        director:
          '14 vehicles are overdue for service overall: 6 in the South region, 5 in the North and 3 in the East. 4 of them run long-haul routes and deserve priority.',
        south:
          'In the South region 6 vehicles are overdue for service. 2 are long-haul trucks; the longest delay is 18 days.',
        hr: 'You do not have permission for the fleet dashboards, so I cannot answer from them. I can help with attendance, headcount and turnover.',
      },
      q3: {
        director:
          'Cost per km rose 3.2% this quarter, driven by fuel. Margin by unit is still above budget in 4 of 6 regions.',
        south:
          'In the South region cost per km rose 2.1% this quarter, below the overall average. The dashboard points to fuel as the main factor.',
        hr: 'You do not have permission for the cost dashboards, so I cannot answer from them. I can help with attendance, headcount and turnover.',
      },
    },
    sources: 'Sources',
    noSources: 'no source available for this role',
    inputLabel: 'Your question',
    inputPlaceholder: 'Write a question…',
    send: 'Send',
    demoOnly:
      'In this demo only the suggested questions have a ready answer. In the real system the model searches the dashboards your role can see.',
    you: 'You',
    assistant: 'Assistant',
    done: 'Answer ready',
    typing: 'Writing…',
  },
  access: {
    title: 'Access',
    user: 'Role',
    lede: 'Who sees each tool. Only the executive board can change it.',
    readOnly: 'Read only: just the Executive board role can change access.',
    granted: (tool, user) => `Access to ${tool} granted: ${user}`,
    revoked: (tool, user) => `Access to ${tool} removed: ${user}`,
    toggle: (tool, user) => `${tool} for ${user}`,
  },
}

export const platformCopy: Record<Lang, typeof pt> = { pt, en }
