import { useCallback, useMemo, useState } from 'react'
import { AppFrame } from '../kit/AppFrame'
import { DataTable, type Column } from '../kit/DataTable'
import type { DemoAppProps } from '../kit/context'
import { useCopy, useFormat, useToast } from '../kit/lib'
import { Chip, Kpi, type Tone } from '../kit/primitives'
import './payments.css'
import { AccountsPage } from './payments/AccountsPage'
import { PaymentSheet } from './payments/PaymentSheet'
import { paymentsCopy } from './payments.copy'
import {
  initialAccounts,
  netAmount,
  suppliers,
  titles,
  type BankAccount,
  type Title,
  type TitleStatus,
} from './payments.data'

type Screen = 'titles' | 'accounts'

const statusTone: Record<TitleStatus, Tone> = { open: 'blue', advance: 'amber', cancelled: 'red' }
const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id

export default function PaymentsDemo({ onReset }: DemoAppProps) {
  const copy = useCopy(paymentsCopy)
  const { money, date } = useFormat()
  const [screen, setScreen] = useState<Screen>('titles')
  const [accounts, setAccounts] = useState<readonly BankAccount[]>(initialAccounts)
  const [showCancelled, setShowCancelled] = useState(false)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [sheet, setSheet] = useState<Title[] | null>(null)
  const [toast, showToast] = useToast()

  const visible = useMemo(
    () => titles.filter((title) => showCancelled || title.status !== 'cancelled'),
    [showCancelled],
  )
  const active = titles.filter((title) => title.status !== 'cancelled')
  const chosen = titles.filter((title) => selected.has(title.id))
  const advances = active.filter((title) => title.advance)

  const toggle = (id: string) =>
    setSelected((set) => {
      const next = new Set(set)
      if (!next.delete(id)) next.add(id)
      return next
    })
  const toggleAll = (ids: string[], on: boolean) =>
    setSelected((set) => {
      const next = new Set(set)
      for (const id of ids) {
        if (on) next.add(id)
        else next.delete(id)
      }
      return next
    })

  function setPrincipal(account: BankAccount) {
    setAccounts((all) =>
      all.map((a) =>
        a.supplierId === account.supplierId ? { ...a, principal: a.id === account.id } : a,
      ),
    )
    showToast(copy.accounts.toast(supplierName(account.supplierId)))
  }

  const onSent = useCallback(
    (count: number) => showToast(copy.sheet.finished(count)),
    [showToast, copy.sheet],
  )

  const columns: Column<Title>[] = [
    {
      key: 'supplier',
      header: copy.columns.supplier,
      sort: (a, b) => supplierName(a.supplierId).localeCompare(supplierName(b.supplierId)),
      cell: (title) => (
        <>
          <span className={title.status === 'cancelled' ? 'dm-strike' : 'dm-strong'}>
            {supplierName(title.supplierId)}
          </span>
          <span className="pg-sub pg-sub--sm">
            {title.doc} · {title.installment} · {date(title.due)}
          </span>
        </>
      ),
    },
    {
      key: 'doc',
      header: copy.columns.doc,
      hideSm: true,
      cell: (title) => (
        <span className="dm-mono">
          {title.doc} <span className="dm-muted">· {title.installment}</span>
        </span>
      ),
    },
    {
      key: 'due',
      header: copy.columns.due,
      hideSm: true,
      sort: (a, b) => a.due.localeCompare(b.due),
      cell: (title) => date(title.due),
    },
    {
      key: 'amount',
      header: copy.columns.amount,
      align: 'right',
      sort: (a, b) => netAmount(a) - netAmount(b),
      cell: (title) => (
        <>
          <span className={title.status === 'cancelled' ? 'dm-strike' : 'dm-strong'}>
            {money(netAmount(title))}
          </span>
          {title.advance && (
            <span className="pg-sub">{copy.advanceNote(money(title.advance))}</span>
          )}
        </>
      ),
    },
    {
      key: 'status',
      header: copy.columns.status,
      cell: (title) => <Chip tone={statusTone[title.status]}>{copy.status[title.status]}</Chip>,
    },
  ]

  return (
    <AppFrame
      brand={{ name: copy.brand, mark: 'P' }}
      nav={[
        { id: 'titles', label: copy.nav.titles, icon: 'file' },
        { id: 'accounts', label: copy.nav.accounts, icon: 'bank' },
      ]}
      active={screen}
      onNav={(id) => setScreen(id as Screen)}
      title={screen === 'titles' ? copy.nav.titles : copy.nav.accounts}
      userLabel={copy.user}
      onReset={onReset}
      toast={toast}
      drawer={
        sheet && (
          <PaymentSheet
            titles={sheet}
            accounts={accounts}
            onClose={() => setSheet(null)}
            onSent={onSent}
          />
        )
      }
    >
      {screen === 'titles' ? (
        <>
          <div className="dm-kpis">
            <Kpi
              label={copy.kpi.open}
              value={money(active.reduce((sum, t) => sum + netAmount(t), 0))}
              hint={copy.kpi.openHint(active.length)}
            />
            <Kpi
              label={copy.kpi.advances}
              value={money(advances.reduce((sum, t) => sum + (t.advance ?? 0), 0))}
              hint={copy.kpi.advancesHint(advances.length)}
              tone="amber"
            />
            <Kpi
              label={copy.kpi.suppliers}
              value={new Set(active.map((t) => t.supplierId)).size}
              hint={copy.kpi.suppliersHint}
            />
          </div>
          <div className="dm-toolbar">
            <label className="pg-check">
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={(event) => setShowCancelled(event.target.checked)}
              />
              {copy.showCancelled}
            </label>
          </div>
          <DataTable
            caption={copy.table}
            rows={visible}
            columns={columns}
            rowKey={(title) => title.id}
            initialSort={{ key: 'due', dir: 'asc' }}
            selection={{
              selected,
              onToggle: toggle,
              onToggleAll: toggleAll,
              isDisabled: (id) => titles.find((t) => t.id === id)?.status === 'cancelled',
            }}
          />
          <div className="pg-bar" data-active={chosen.length > 0 || undefined}>
            <span className="dm-strong">
              {chosen.length > 0
                ? copy.summary(
                    chosen.length,
                    money(chosen.reduce((sum, t) => sum + netAmount(t), 0)),
                  )
                : copy.none}
            </span>
            {chosen.length > 0 && (
              <button type="button" className="dm-btn" onClick={() => setSelected(new Set())}>
                {copy.clear}
              </button>
            )}
            <button
              type="button"
              className="dm-btn dm-btn--primary"
              disabled={chosen.length === 0}
              onClick={() => setSheet(chosen)}
            >
              {copy.generate}
            </button>
          </div>
        </>
      ) : (
        <AccountsPage accounts={accounts} onSetPrincipal={setPrincipal} />
      )}
    </AppFrame>
  )
}
