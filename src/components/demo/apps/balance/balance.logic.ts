import {
  accounts,
  balanceAssetGroups,
  balanceLiabilityGroups,
  type Account,
  type GroupId,
} from '../balance.data'

export const MONTHS = 6

export const byCode = new Map(accounts.map((account) => [account.code, account]))
export const childrenOf = (code: string | null) =>
  accounts.filter((account) => account.parent === code)

/** Grupo de um nó: o dele, ou o do ancestral mais próximo que tenha um. */
export type Mapping = Readonly<Record<string, GroupId>>

export function initialMapping(): Mapping {
  return Object.fromEntries(
    accounts.flatMap((account) => (account.group ? [[account.code, account.group]] : [])),
  )
}

export function resolveGroup(code: string, mapping: Mapping): GroupId | undefined {
  for (
    let node = byCode.get(code);
    node;
    node = node.parent ? byCode.get(node.parent) : undefined
  ) {
    if (mapping[node.code]) return mapping[node.code]
  }
  return undefined
}

/** Contas analíticas abaixo de um nó (ele mesmo, se for analítico). */
export function leavesUnder(code: string): Account[] {
  const node = byCode.get(code)
  if (!node) return []
  if (node.kind === 'A') return [node]
  return childrenOf(code).flatMap((child) => leavesUnder(child.code))
}

export const rootOf = (code: string) => code.split('.')[0]
const level3 = (code: string) => code.split('.').slice(0, 3).join('.')

/** Saldos completos por conta: acrescenta o caixa (fecha o balanço) e o resultado acumulado do ano. */
function buildLedger(): Record<string, readonly number[]> {
  const ledger: Record<string, number[]> = {}
  for (const account of accounts) if (account.values) ledger[account.code] = [...account.values]

  const own = initialMapping()
  const net = Array.from({ length: MONTHS }, (_, m) =>
    accounts.reduce((sum, account) => {
      const group = account.kind === 'A' ? resolveGroup(account.code, own) : undefined
      const value = account.values?.[m] ?? 0
      if (group === 'receita' || group === 'financeiro') return sum + value
      if (group && ['deducoes', 'custos', 'despesas', 'impostos'].includes(group))
        return sum - value
      return sum
    }, 0),
  )
  let cumulative = 0
  ledger['2.3.02.002'] = net.map((value) => (cumulative += value))

  const sumRoot = (root: string) =>
    Array.from({ length: MONTHS }, (_, m) =>
      Object.entries(ledger).reduce(
        (sum, [code, values]) => (rootOf(code) === root ? sum + values[m] : sum),
        0,
      ),
    )
  const otherAssets = sumRoot('1')
  const funding = sumRoot('2')
  ledger['1.1.01.002'] = funding.map((value, m) => value - otherAssets[m])
  return ledger
}

export const ledger = buildLedger()

export interface BlockRow {
  code: string
  value: number
}
export interface GroupBlock {
  group: GroupId
  total: number
  rows: BlockRow[]
}

function block(group: GroupId, month: number, mapping: Mapping): GroupBlock {
  const rows = new Map<string, number>()
  for (const account of accounts) {
    if (account.kind !== 'A' || resolveGroup(account.code, mapping) !== group) continue
    const key = level3(account.code)
    rows.set(key, (rows.get(key) ?? 0) + ledger[account.code][month])
  }
  const list = [...rows].map(([code, value]) => ({ code, value }))
  return { group, total: list.reduce((sum, row) => sum + row.value, 0), rows: list }
}

export function balanceSheet(month: number, mapping: Mapping) {
  const assets = balanceAssetGroups.map((group) => block(group, month, mapping))
  const liabilities = balanceLiabilityGroups.map((group) => block(group, month, mapping))
  const totalAssets = assets.reduce((sum, b) => sum + b.total, 0)
  const totalLiabilities = liabilities.reduce((sum, b) => sum + b.total, 0)
  return {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    difference: totalAssets - totalLiabilities,
  }
}

export type DreLineId =
  | 'receita'
  | 'deducoes'
  | 'liquida'
  | 'custos'
  | 'bruto'
  | 'despesas'
  | 'operacional'
  | 'financeiro'
  | 'antesIr'
  | 'impostos'
  | 'liquido'

export interface DreLine {
  id: DreLineId
  month: number
  ytd: number
  /** Linha de subtotal (destacada). */
  total: boolean
}

/** DRE do mês e acumulada até o mês, com os subtotais de Receita bruta a Lucro líquido. */
export function dre(month: number, mapping: Mapping): DreLine[] {
  const sumGroup = (group: GroupId, upTo: number, only: boolean) => {
    let total = 0
    for (let m = only ? month : 0; m <= upTo; m++) {
      for (const account of accounts) {
        if (account.kind === 'A' && resolveGroup(account.code, mapping) === group) {
          total += ledger[account.code][m]
        }
      }
    }
    return total
  }
  const pick = (only: boolean) => {
    const g = (group: GroupId) => sumGroup(group, month, only)
    const receita = g('receita')
    const deducoes = -g('deducoes')
    const liquida = receita + deducoes
    const custos = -g('custos')
    const bruto = liquida + custos
    const despesas = -g('despesas')
    const operacional = bruto + despesas
    const financeiro = g('financeiro')
    const antesIr = operacional + financeiro
    const impostos = -g('impostos')
    return {
      receita,
      deducoes,
      liquida,
      custos,
      bruto,
      despesas,
      operacional,
      financeiro,
      antesIr,
      impostos,
      liquido: antesIr + impostos,
    }
  }
  const monthly = pick(true)
  const yearly = pick(false)
  const totals: readonly DreLineId[] = ['liquida', 'bruto', 'operacional', 'antesIr', 'liquido']
  return (Object.keys(monthly) as DreLineId[]).map((id) => ({
    id,
    month: monthly[id],
    ytd: yearly[id],
    total: totals.includes(id),
  }))
}

/** Nós de 2º nível (filhos de 1 a 4) ainda sem grupo: cada um é uma divergência a mapear. */
export function unmappedRoots(mapping: Mapping): Account[] {
  return accounts.filter(
    (account) =>
      account.kind === 'S' &&
      account.parent !== null &&
      !account.parent.includes('.') &&
      !mapping[account.code],
  )
}
