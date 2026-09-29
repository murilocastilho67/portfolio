import type { Lang } from '../../../i18n/context'
import type { Assignee, Col, Priority } from './planner.data'

interface CardText {
  title: string
  subtasks: string[]
  /** Impedimento padrão, só nos cartões que começam impedidos. */
  blocked?: string
}

const pt = {
  brand: 'Planner',
  user: 'Coordenação',
  nav: { board: 'Quadro', feed: 'Feed' },
  columns: {
    todo: 'A fazer',
    doing: 'Fazendo',
    blocked: 'Impedido',
    done: 'Feito',
  } satisfies Record<Col, string>,
  priorities: { urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa' } satisfies Record<
    Priority,
    string
  >,
  assignees: {
    coord: 'Coordenação',
    sales: 'Comercial 03',
    regional: 'Regional Sul',
    fleet: 'Gestor de frota',
    finance: 'Analista financeiro',
  } satisfies Record<Assignee, string>,
  score: { open: 'Abertas', late: 'Atrasadas', doneWeek: 'Concluídas na semana' },
  board: 'Quadro de tarefas',
  due: (d: string) => `vence ${d}`,
  overdue: (d: string) => `atrasada · ${d}`,
  progress: (done: number, total: number) => `${done}/${total} subtarefas`,
  moveTo: 'Mover para…',
  moveLabel: (title: string) => `Mover “${title}” para`,
  grip: 'Arrastar',
  moved: (title: string, col: string) => `“${title}” movido para ${col}`,
  drawer: {
    subtasks: 'Subtarefas',
    noSubtasks: 'Sem subtarefas',
    delegate: 'Delegar a',
    status: 'Situação',
    blockNote: 'Impedimento',
    blockPlaceholder: 'O que está travando esta tarefa?',
    priority: 'Prioridade',
  },
  feed: {
    title: 'Atividade recente',
    delegated: (title: string, who: string) => `“${title}” delegada a ${who}`,
    blocked: (title: string) => `“${title}” foi para Impedido`,
    moved: (title: string, col: string) => `“${title}” movida para ${col}`,
    subtask: (title: string, text: string) => `Subtarefa concluída em “${title}”: ${text}`,
    seed: [
      'Plano do trimestre criado',
      'Coordenação comentou em uma tarefa',
      'Nova tarefa atribuída a Comercial 03',
    ],
    new: 'nova',
    empty: 'Sem atividade',
  },
  cards: {
    p1: {
      title: 'Revisar metas da regional',
      subtasks: ['Levantar resultados', 'Alinhar com a coordenação', 'Publicar metas'],
    },
    p2: {
      title: 'Atualizar tabela de rotas do trimestre',
      subtasks: ['Conferir paradas', 'Enviar para aprovação'],
    },
    p3: {
      title: 'Conferir adiantamentos de fornecedores',
      subtasks: [
        'Listar adiantamentos',
        'Cruzar com títulos',
        'Corrigir divergências',
        'Registrar conclusão',
      ],
    },
    p4: { title: 'Arquivar documentos do semestre', subtasks: [] },
    p5: {
      title: 'Agendar revisão da frota',
      subtasks: ['Listar veículos', 'Reservar oficina', 'Avisar motoristas', 'Confirmar datas'],
    },
    p6: {
      title: 'Preparar apresentação mensal',
      subtasks: ['Coletar indicadores', 'Montar slides', 'Ensaiar'],
    },
    p7: {
      title: 'Renegociar prazo com fornecedor',
      subtasks: [
        'Levantar histórico',
        'Definir proposta',
        'Reunião',
        'Registrar acordo',
        'Comunicar equipe',
      ],
    },
    p8: {
      title: 'Liberação de acesso ao sistema',
      subtasks: ['Abrir chamado', 'Validar perfil', 'Testar login'],
      blocked: 'Aguardando aprovação da área responsável',
    },
    p9: {
      title: 'Cotação sem retorno do cliente',
      subtasks: ['Reenviar proposta', 'Ligar para o cliente'],
      blocked: 'Cliente ainda não respondeu',
    },
    p10: {
      title: 'Fechar relatório de frequência',
      subtasks: ['Consolidar dados', 'Revisar', 'Enviar'],
    },
    p11: {
      title: 'Treinar equipe no novo fluxo',
      subtasks: ['Preparar material', 'Realizar treinamento'],
    },
    p12: {
      title: 'Migrar planilha para o sistema',
      subtasks: ['Mapear colunas', 'Importar dados', 'Validar', 'Desligar planilha'],
    },
  } as Record<string, CardText>,
}

const en: typeof pt = {
  brand: 'Planner',
  user: 'Coordination',
  nav: { board: 'Board', feed: 'Feed' },
  columns: { todo: 'To do', doing: 'Doing', blocked: 'Blocked', done: 'Done' },
  priorities: { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' },
  assignees: {
    coord: 'Coordination',
    sales: 'Sales 03',
    regional: 'South regional',
    fleet: 'Fleet manager',
    finance: 'Finance analyst',
  },
  score: { open: 'Open', late: 'Overdue', doneWeek: 'Done this week' },
  board: 'Task board',
  due: (d) => `due ${d}`,
  overdue: (d) => `overdue · ${d}`,
  progress: (done, total) => `${done}/${total} subtasks`,
  moveTo: 'Move to…',
  moveLabel: (title) => `Move “${title}” to`,
  grip: 'Drag',
  moved: (title, col) => `“${title}” moved to ${col}`,
  drawer: {
    subtasks: 'Subtasks',
    noSubtasks: 'No subtasks',
    delegate: 'Delegate to',
    status: 'Status',
    blockNote: 'Blocker',
    blockPlaceholder: 'What is blocking this task?',
    priority: 'Priority',
  },
  feed: {
    title: 'Recent activity',
    delegated: (title, who) => `“${title}” delegated to ${who}`,
    blocked: (title) => `“${title}” went to Blocked`,
    moved: (title, col) => `“${title}” moved to ${col}`,
    subtask: (title, text) => `Subtask done in “${title}”: ${text}`,
    seed: [
      'Quarter plan created',
      'Coordination commented on a task',
      'New task assigned to Sales 03',
    ],
    new: 'new',
    empty: 'No activity',
  },
  cards: {
    p1: {
      title: 'Review regional targets',
      subtasks: ['Gather results', 'Align with coordination', 'Publish targets'],
    },
    p2: {
      title: 'Update the quarterly route table',
      subtasks: ['Check stops', 'Send for approval'],
    },
    p3: {
      title: 'Check supplier advances',
      subtasks: ['List advances', 'Match with invoices', 'Fix divergences', 'Log completion'],
    },
    p4: { title: 'Archive semester documents', subtasks: [] },
    p5: {
      title: 'Schedule fleet service',
      subtasks: ['List vehicles', 'Book the workshop', 'Notify drivers', 'Confirm dates'],
    },
    p6: {
      title: 'Prepare the monthly presentation',
      subtasks: ['Collect indicators', 'Build slides', 'Rehearse'],
    },
    p7: {
      title: 'Renegotiate terms with a supplier',
      subtasks: [
        'Gather history',
        'Define proposal',
        'Meeting',
        'Log agreement',
        'Inform the team',
      ],
    },
    p8: {
      title: 'System access approval',
      subtasks: ['Open a ticket', 'Validate profile', 'Test login'],
      blocked: 'Waiting for approval from the owning area',
    },
    p9: {
      title: 'Quote with no customer reply',
      subtasks: ['Resend proposal', 'Call the customer'],
      blocked: 'Customer has not replied yet',
    },
    p10: { title: 'Close the attendance report', subtasks: ['Consolidate data', 'Review', 'Send'] },
    p11: {
      title: 'Train the team on the new flow',
      subtasks: ['Prepare material', 'Run the training'],
    },
    p12: {
      title: 'Move the spreadsheet into the system',
      subtasks: ['Map columns', 'Import data', 'Validate', 'Retire the spreadsheet'],
    },
  },
}

export const plannerCopy: Record<Lang, typeof pt> = { pt, en }
