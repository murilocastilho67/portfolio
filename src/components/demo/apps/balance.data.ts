export type GroupId =
  | 'ativoCirc'
  | 'ativoNaoCirc'
  | 'passivoCirc'
  | 'passivoNaoCirc'
  | 'patrimonio'
  | 'receita'
  | 'deducoes'
  | 'custos'
  | 'despesas'
  | 'financeiro'
  | 'impostos'

export const balanceAssetGroups: readonly GroupId[] = ['ativoCirc', 'ativoNaoCirc']
export const balanceLiabilityGroups: readonly GroupId[] = [
  'passivoCirc',
  'passivoNaoCirc',
  'patrimonio',
]

/** Grupos que o usuário pode escolher ao mapear um nó, conforme a raiz do plano (1 a 4). */
export const groupsByRoot: Record<string, readonly GroupId[]> = {
  '1': balanceAssetGroups,
  '2': balanceLiabilityGroups,
  '3': ['receita', 'deducoes'],
  '4': ['custos', 'despesas', 'financeiro', 'impostos'],
}

export interface Account {
  code: string
  parent: string | null
  /** S = sintética (agrupa), A = analítica (recebe lançamento). */
  kind: 'S' | 'A'
  /** Grupo de relatório atribuído a este nó; as contas abaixo herdam do ancestral mais próximo. */
  group?: GroupId
  /** Saldo por mês (jan a jun), em R$ mil, fictício. */
  values?: readonly number[]
  /** Valor derivado: caixa fecha o balanço; resultado vem da DRE acumulada. */
  calc?: 'cash' | 'result'
}

const s = (code: string, parent: string | null, group?: GroupId): Account => ({
  code,
  parent,
  kind: 'S',
  group,
})
const a = (
  code: string,
  parent: string,
  values?: readonly number[],
  calc?: Account['calc'],
): Account => ({
  code,
  parent,
  kind: 'A',
  values,
  calc,
})
const flat = (n: number) => [n, n, n, n, n, n]

/** O nó 1.3 nasce sem grupo: é a divergência que a demonstração pede para corrigir. */
export const accounts: readonly Account[] = [
  s('1', null),
  s('1.1', '1', 'ativoCirc'),
  s('1.1.01', '1.1'),
  a('1.1.01.001', '1.1.01', [40, 40, 45, 45, 50, 50]),
  a('1.1.01.002', '1.1.01', undefined, 'cash'),
  s('1.1.02', '1.1'),
  a('1.1.02.001', '1.1.02', [3800, 3900, 4200, 4100, 4300, 4500]),
  a('1.1.02.002', '1.1.02', [-120, -120, -130, -130, -140, -140]),
  s('1.1.03', '1.1'),
  a('1.1.03.001', '1.1.03', [320, 330, 340, 340, 350, 360]),
  s('1.2', '1', 'ativoNaoCirc'),
  s('1.2.01', '1.2'),
  a('1.2.01.001', '1.2.01', [9200, 9200, 9600, 9600, 9900, 9900]),
  a('1.2.01.002', '1.2.01', flat(2400)),
  a('1.2.01.003', '1.2.01', [-3100, -3200, -3300, -3400, -3500, -3600]),
  s('1.3', '1'),
  s('1.3.01', '1.3'),
  a('1.3.01.001', '1.3.01', [350, 350, 360, 360, 370, 370]),
  a('1.3.01.002', '1.3.01', [280, 280, 280, 290, 290, 290]),
  s('1.3.02', '1.3'),
  a('1.3.02.001', '1.3.02', [190, 190, 200, 200, 210, 210]),

  s('2', null),
  s('2.1', '2', 'passivoCirc'),
  s('2.1.01', '2.1'),
  a('2.1.01.001', '2.1.01', [2100, 2200, 2300, 2250, 2350, 2400]),
  a('2.1.01.002', '2.1.01', [900, 950, 980, 960, 1000, 1020]),
  s('2.1.02', '2.1'),
  a('2.1.02.001', '2.1.02', [650, 650, 660, 660, 670, 670]),
  a('2.1.02.002', '2.1.02', [420, 420, 430, 430, 440, 440]),
  s('2.1.03', '2.1'),
  a('2.1.03.001', '2.1.03', [510, 520, 560, 550, 580, 600]),
  s('2.2', '2', 'passivoNaoCirc'),
  s('2.2.01', '2.2'),
  a('2.2.01.001', '2.2.01', [4200, 4100, 4300, 4200, 4100, 4000]),
  s('2.3', '2', 'patrimonio'),
  s('2.3.01', '2.3'),
  a('2.3.01.001', '2.3.01', flat(3000)),
  s('2.3.02', '2.3'),
  a('2.3.02.001', '2.3.02', flat(1800)),
  a('2.3.02.002', '2.3.02', undefined, 'result'),

  s('3', null),
  s('3.1', '3', 'receita'),
  s('3.1.01', '3.1'),
  a('3.1.01.001', '3.1.01', [4800, 4900, 5200, 5100, 5400, 5600]),
  a('3.1.01.002', '3.1.01', [1200, 1250, 1300, 1300, 1400, 1450]),
  a('3.1.01.003', '3.1.01', [300, 300, 320, 310, 330, 340]),
  s('3.2', '3', 'deducoes'),
  s('3.2.01', '3.2'),
  a('3.2.01.001', '3.2.01', [600, 620, 650, 640, 680, 700]),
  a('3.2.01.002', '3.2.01', [50, 40, 60, 50, 60, 60]),

  s('4', null),
  s('4.1', '4', 'custos'),
  s('4.1.01', '4.1'),
  a('4.1.01.001', '4.1.01', [1900, 1950, 2050, 2000, 2100, 2150]),
  a('4.1.01.002', '4.1.01', [420, 430, 450, 440, 460, 470]),
  a('4.1.01.003', '4.1.01', [560, 540, 600, 580, 610, 620]),
  a('4.1.01.004', '4.1.01', [1300, 1300, 1320, 1320, 1350, 1350]),
  s('4.2', '4', 'despesas'),
  s('4.2.01', '4.2'),
  a('4.2.01.001', '4.2.01', [520, 520, 530, 530, 540, 540]),
  a('4.2.01.002', '4.2.01', [210, 210, 220, 220, 230, 230]),
  s('4.3', '4', 'financeiro'),
  s('4.3.01', '4.3'),
  a('4.3.01.001', '4.3.01', [60, 60, 70, 70, 80, 80]),
  a('4.3.01.002', '4.3.01', [-240, -240, -230, -230, -220, -220]),
  s('4.4', '4', 'impostos'),
  s('4.4.01', '4.4'),
  a('4.4.01.001', '4.4.01', [150, 160, 180, 170, 190, 200]),
]

export const dreGroups: readonly GroupId[] = [
  'receita',
  'deducoes',
  'custos',
  'despesas',
  'financeiro',
  'impostos',
]
