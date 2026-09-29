import type { Lang } from '../../../i18n/context'

const pt = {
  search: 'Buscar…',
  notifications: 'Notificações',
  noNotifications: 'Nenhuma notificação',
  role: 'Perfil',
  reset: 'Reiniciar demo',
  collapse: 'Recolher menu',
  expand: 'Expandir menu',
  navLabel: 'Navegação do sistema',
  soon: 'Fora do escopo desta demonstração',
  closePanel: 'Fechar painel',
  noResults: 'Nada encontrado',
  noResultsText: 'Ajuste os filtros ou a busca.',
  sortBy: 'Ordenar por',
  selectAll: 'Selecionar todos',
  selectRow: 'Selecionar linha',
  clearFilter: 'limpar filtro',
  banner: 'Demonstração · dados fictícios',
  closeDemo: 'Fechar demonstração',
  chartValue: (label: string, value: number) => `${label}: ${value}`,
}

const en: typeof pt = {
  search: 'Search…',
  notifications: 'Notifications',
  noNotifications: 'No notifications',
  role: 'Role',
  reset: 'Reset demo',
  collapse: 'Collapse menu',
  expand: 'Expand menu',
  navLabel: 'System navigation',
  soon: 'Outside the scope of this demo',
  closePanel: 'Close panel',
  noResults: 'Nothing found',
  noResultsText: 'Adjust the filters or the search.',
  sortBy: 'Sort by',
  selectAll: 'Select all',
  selectRow: 'Select row',
  clearFilter: 'clear filter',
  banner: 'Demo · fictitious data',
  closeDemo: 'Close demo',
  chartValue: (label, value) => `${label}: ${value}`,
}

export const kitCopy: Record<Lang, typeof pt> = { pt, en }
