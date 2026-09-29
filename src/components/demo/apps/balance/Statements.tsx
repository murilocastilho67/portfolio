import { DataTable, type Column } from '../../kit/DataTable'
import { useCopy, useFormat } from '../../kit/lib'
import { Chip, EmptyState } from '../../kit/primitives'
import { balanceCopy } from '../balance.copy'
import type { GroupId } from '../balance.data'
import {
  balanceSheet,
  dre,
  leavesUnder,
  ledger,
  unmappedRoots,
  type DreLine,
  type GroupBlock,
  type Mapping,
} from './balance.logic'

interface StatementProps {
  month: number
  mapping: Mapping
}

function Side({
  title,
  blocks,
  total,
  totalLabel,
}: {
  title: string
  blocks: GroupBlock[]
  total: number
  totalLabel: string
}) {
  const copy = useCopy(balanceCopy)
  const { number } = useFormat()
  return (
    <section className="dm-card bl-side" aria-label={title}>
      <h4 className="dm-h bl-side-head">{title}</h4>
      {blocks.map((block) => (
        <div key={block.group} className="bl-group">
          <p className="bl-line bl-line--group">
            <span>{copy.groups[block.group as GroupId]}</span>
            <span>{number(block.total)}</span>
          </p>
          {block.rows.map((row) => (
            <p key={row.code} className="bl-line">
              <span>{copy.accounts[row.code]}</span>
              <span>{number(row.value)}</span>
            </p>
          ))}
        </div>
      ))}
      <p className="bl-line bl-line--total">
        <span>{totalLabel}</span>
        <span>{number(total)}</span>
      </p>
    </section>
  )
}

/** Balanço: Ativo de um lado, Passivo + PL do outro, com o selo "fecha ✓" ou "diferença". */
export function BalanceReport({ month, mapping }: StatementProps) {
  const copy = useCopy(balanceCopy)
  const { number } = useFormat()
  const sheet = balanceSheet(month, mapping)
  const closes = sheet.difference === 0

  return (
    <div>
      <div className="dm-toolbar">
        {closes ? (
          <Chip tone="green">{copy.balance.closes}</Chip>
        ) : (
          <Chip tone="red">{copy.balance.difference(number(sheet.difference))}</Chip>
        )}
        <span className="dm-muted">{copy.units}</span>
      </div>
      <div className="bl-report">
        <Side
          title={copy.balance.assets}
          blocks={sheet.assets}
          total={sheet.totalAssets}
          totalLabel={copy.balance.totalAssets}
        />
        <Side
          title={copy.balance.liabilities}
          blocks={sheet.liabilities}
          total={sheet.totalLiabilities}
          totalLabel={copy.balance.totalLiabilities}
        />
      </div>
      {!closes && (
        <p className="bl-hint" role="status">
          {copy.balance.hint}
        </p>
      )}
    </div>
  )
}

/** DRE do mês e acumulada, da Receita bruta ao Lucro líquido. */
export function DreReport({ month, mapping }: StatementProps) {
  const copy = useCopy(balanceCopy)
  const { number } = useFormat()
  const columns: Column<DreLine>[] = [
    { key: 'line', header: copy.dre.line, cell: (line) => copy.dre.lines[line.id] },
    { key: 'month', header: copy.dre.month, align: 'right', cell: (line) => number(line.month) },
    {
      key: 'ytd',
      header: copy.dre.ytd,
      align: 'right',
      hideSm: false,
      cell: (line) => number(line.ytd),
    },
  ]
  return (
    <div>
      <p className="dm-muted" style={{ marginBottom: 8 }}>
        {copy.units}
      </p>
      <DataTable
        caption={copy.tabs.dre}
        rows={dre(month, mapping)}
        columns={columns}
        rowKey={(line) => line.id}
        rowClass={(line) => (line.total ? 'bl-total' : undefined)}
      />
    </div>
  )
}

/** Conferência: divergências abertas (nós sem grupo) e as verificações de fechamento. */
export function CheckReport({
  month,
  mapping,
  onMap,
}: StatementProps & { onMap: (code: string) => void }) {
  const copy = useCopy(balanceCopy)
  const { number } = useFormat()
  const roots = unmappedRoots(mapping)
  const sheet = balanceSheet(month, mapping)

  const checks = [
    { label: copy.check.nodesCheck, ok: roots.length === 0 },
    { label: copy.check.balanceCheck, ok: sheet.difference === 0 },
    { label: copy.check.dreCheck, ok: true },
  ]

  return (
    <div className="bl-checks">
      <section aria-label={copy.check.title}>
        <h4 className="dm-h">{copy.check.title}</h4>
        {roots.length === 0 ? (
          <EmptyState title={copy.check.none} text={copy.check.noneText} />
        ) : (
          <ul className="bl-issues">
            {roots.map((node) => {
              const leaves = leavesUnder(node.code)
              const value = leaves.reduce((sum, leaf) => sum + ledger[leaf.code][month], 0)
              return (
                <li key={node.code} className="dm-card">
                  <Chip tone="red">{copy.check.fail}</Chip>
                  <span>
                    {copy.check.unmappedItem(
                      node.code,
                      copy.accounts[node.code],
                      leaves.length,
                      number(value),
                    )}
                  </span>
                  <button type="button" className="dm-btn" onClick={() => onMap(node.code)}>
                    {copy.check.goMap}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <section aria-label={copy.check.checksTitle}>
        <h4 className="dm-h">{copy.check.checksTitle}</h4>
        <ul className="bl-issues">
          {checks.map((check) => (
            <li key={check.label} className="dm-card">
              <Chip tone={check.ok ? 'green' : 'red'}>
                {check.ok ? copy.check.ok : copy.check.fail}
              </Chip>
              <span>{check.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
