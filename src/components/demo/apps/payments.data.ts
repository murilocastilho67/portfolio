export type TitleStatus = 'open' | 'advance' | 'cancelled'

export interface Supplier {
  id: string
  /** Nome obviamente fictício. */
  name: string
}

export interface BankAccount {
  id: string
  supplierId: string
  bank: string
  /** Agência e conta já mascaradas: a demonstração nunca guarda número de conta. */
  agency: string
  account: string
  principal: boolean
}

export interface Title {
  id: string
  supplierId: string
  doc: string
  installment: string
  due: string
  amount: number
  status: TitleStatus
  /** Valor de adiantamento já abatido (só quando status = advance). */
  advance?: number
}

export const suppliers: readonly Supplier[] = [
  { id: 'alfa', name: 'Transportes Alfa Ltda' },
  { id: 'beta', name: 'Oficina Beta ME' },
  { id: 'gama', name: 'Auto Peças Gama Ltda' },
  { id: 'delta', name: 'Logística Delta S.A.' },
  { id: 'epsilon', name: 'Pneus Épsilon ME' },
  { id: 'zeta', name: 'Combustíveis Zeta Ltda' },
]

export const initialAccounts: readonly BankAccount[] = [
  {
    id: 'a1',
    supplierId: 'alfa',
    bank: 'Banco A',
    agency: '••12',
    account: '••••-3',
    principal: true,
  },
  {
    id: 'a2',
    supplierId: 'alfa',
    bank: 'Banco B',
    agency: '••40',
    account: '••••-7',
    principal: false,
  },
  {
    id: 'b1',
    supplierId: 'beta',
    bank: 'Banco C',
    agency: '••08',
    account: '••••-1',
    principal: true,
  },
  {
    id: 'g1',
    supplierId: 'gama',
    bank: 'Banco A',
    agency: '••33',
    account: '••••-9',
    principal: true,
  },
  {
    id: 'g2',
    supplierId: 'gama',
    bank: 'Banco D',
    agency: '••15',
    account: '••••-2',
    principal: false,
  },
  {
    id: 'g3',
    supplierId: 'gama',
    bank: 'Banco B',
    agency: '••27',
    account: '••••-5',
    principal: false,
  },
  {
    id: 'd1',
    supplierId: 'delta',
    bank: 'Banco C',
    agency: '••51',
    account: '••••-4',
    principal: true,
  },
  {
    id: 'd2',
    supplierId: 'delta',
    bank: 'Banco A',
    agency: '••19',
    account: '••••-8',
    principal: false,
  },
  {
    id: 'e1',
    supplierId: 'epsilon',
    bank: 'Banco D',
    agency: '••62',
    account: '••••-6',
    principal: true,
  },
  {
    id: 'z1',
    supplierId: 'zeta',
    bank: 'Banco B',
    agency: '••07',
    account: '••••-0',
    principal: true,
  },
  {
    id: 'z2',
    supplierId: 'zeta',
    bank: 'Banco C',
    agency: '••36',
    account: '••••-2',
    principal: false,
  },
]

export const titles: readonly Title[] = [
  {
    id: 'T-101',
    supplierId: 'alfa',
    doc: 'NF 1042',
    installment: '1/3',
    due: '2026-07-05',
    amount: 12000,
    status: 'open',
  },
  {
    id: 'T-102',
    supplierId: 'alfa',
    doc: 'NF 1042',
    installment: '2/3',
    due: '2026-08-05',
    amount: 12000,
    status: 'open',
  },
  {
    id: 'T-103',
    supplierId: 'alfa',
    doc: 'NF 1042',
    installment: '3/3',
    due: '2026-09-05',
    amount: 12000,
    status: 'open',
  },
  {
    id: 'T-104',
    supplierId: 'beta',
    doc: 'NF 0877',
    installment: '1/1',
    due: '2026-07-08',
    amount: 4500,
    status: 'open',
  },
  {
    id: 'T-105',
    supplierId: 'beta',
    doc: 'NF 0912',
    installment: '1/2',
    due: '2026-07-12',
    amount: 3000,
    status: 'advance',
    advance: 1000,
  },
  {
    id: 'T-106',
    supplierId: 'gama',
    doc: 'NF 2210',
    installment: '1/2',
    due: '2026-07-10',
    amount: 8000,
    status: 'open',
  },
  {
    id: 'T-107',
    supplierId: 'gama',
    doc: 'NF 2210',
    installment: '2/2',
    due: '2026-08-10',
    amount: 8000,
    status: 'open',
  },
  {
    id: 'T-108',
    supplierId: 'gama',
    doc: 'NF 2305',
    installment: '1/1',
    due: '2026-07-15',
    amount: 2500,
    status: 'cancelled',
  },
  {
    id: 'T-109',
    supplierId: 'delta',
    doc: 'NF 5531',
    installment: '1/4',
    due: '2026-07-06',
    amount: 15000,
    status: 'advance',
    advance: 5000,
  },
  {
    id: 'T-110',
    supplierId: 'delta',
    doc: 'NF 5531',
    installment: '2/4',
    due: '2026-08-06',
    amount: 15000,
    status: 'open',
  },
  {
    id: 'T-111',
    supplierId: 'delta',
    doc: 'NF 5620',
    installment: '1/1',
    due: '2026-07-20',
    amount: 6000,
    status: 'open',
  },
  {
    id: 'T-112',
    supplierId: 'epsilon',
    doc: 'NF 0331',
    installment: '1/3',
    due: '2026-07-09',
    amount: 5000,
    status: 'open',
  },
  {
    id: 'T-113',
    supplierId: 'epsilon',
    doc: 'NF 0331',
    installment: '2/3',
    due: '2026-08-09',
    amount: 5000,
    status: 'open',
  },
  {
    id: 'T-114',
    supplierId: 'epsilon',
    doc: 'NF 0349',
    installment: '1/1',
    due: '2026-07-22',
    amount: 1800,
    status: 'cancelled',
  },
  {
    id: 'T-115',
    supplierId: 'zeta',
    doc: 'NF 7710',
    installment: '1/2',
    due: '2026-07-07',
    amount: 20000,
    status: 'open',
  },
  {
    id: 'T-116',
    supplierId: 'zeta',
    doc: 'NF 7710',
    installment: '2/2',
    due: '2026-08-07',
    amount: 20000,
    status: 'open',
  },
]

/** Valor líquido a pagar: o título menos o adiantamento já abatido. */
export const netAmount = (title: Title) => title.amount - (title.advance ?? 0)
