/** Dados fictícios da comparação "planilha → sistema". Os textos de cada linha vêm do i18n por id. */
export type RouteStatus = 'active' | 'pending'
export type RouteRowId = 'r014' | 'r015' | 'r016' | 'r017' | 'r018'

export const appRoutes: readonly {
  id: RouteRowId
  route: string
  from: string
  to: string
  status: RouteStatus
}[] = [
  { id: 'r014', route: 'R-014', from: 'CDR', to: 'FLN', status: 'active' },
  { id: 'r015', route: 'R-015', from: 'CDR', to: 'CWB', status: 'active' },
  { id: 'r016', route: 'R-016', from: 'JVL', to: 'CWB', status: 'pending' },
  { id: 'r017', route: 'R-017', from: 'FLN', to: 'CDR', status: 'active' },
  { id: 'r018', route: 'R-018', from: 'JVL', to: 'FLN', status: 'active' },
]

/** Estilo manual da planilha bagunçada: linha inteira com marca-texto amarelo e célula com erro. */
export const SHEET_WARN_ROW = 2
export const SHEET_ERROR_CELL = { row: 3, col: 3 }
/** Colunas da planilha (E e F) que só aparecem a partir de `sm`. */
export const SHEET_WIDE_COLS = 4
/** Linhas vazias no fim, como numa planilha de verdade. */
export const SHEET_EMPTY_ROWS = 3
