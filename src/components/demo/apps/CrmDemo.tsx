import { useId, useMemo, useState, type FormEvent } from 'react'
import { AppFrame } from '../kit/AppFrame'
import { BarChart } from '../kit/BarChart'
import { DataTable, type Column } from '../kit/DataTable'
import { Drawer } from '../kit/Drawer'
import type { DemoAppProps } from '../kit/context'
import { useCopy, useFormat, useKit, useToast } from '../kit/lib'
import { Chip, EmptyState, Tabs, type Tone } from '../kit/primitives'
import './crm.css'
import { crmCopy } from './crm.copy'
import {
  initialQuotes,
  reasons,
  units,
  type Quote,
  type QuoteStatus,
  type ReasonId,
  type Unit,
} from './crm.data'

type Screen = 'queue' | 'analysis'
type Tab = 'pending' | 'handled'

const statusTone: Record<QuoteStatus, Tone> = {
  COTADO: 'blue',
  CANCELADA: 'red',
  CONTRATADA: 'green',
}

function TreatmentDrawer({
  quote,
  onClose,
  onSave,
}: {
  quote: Quote
  onClose: () => void
  onSave: (reason: ReasonId, note: string) => void
}) {
  const copy = useCopy(crmCopy)
  const { money } = useFormat()
  const formId = useId()
  const [reason, setReason] = useState<ReasonId | ''>('')
  const [note, setNote] = useState('')
  const [error, setError] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!reason) {
      setError(true)
      return
    }
    onSave(reason, note.trim())
  }

  return (
    <Drawer
      title={`${copy.drawer.title} · ${quote.id}`}
      subtitle={`${quote.client} · ${quote.from} → ${quote.to} · ${money(quote.value)}`}
      onClose={onClose}
      footer={
        <button type="submit" form={formId} className="dm-btn dm-btn--primary">
          {copy.drawer.save}
        </button>
      }
    >
      <form id={formId} onSubmit={submit} className="cr-form" noValidate>
        <p>
          <Chip tone={statusTone[quote.status]}>{copy.status[quote.status]}</Chip>{' '}
          <span className="dm-muted">
            {copy.columns.idle}: {copy.idle(quote.idle)}
          </span>
        </p>
        <label className="dm-field">
          <span>{copy.drawer.reason}</span>
          <select
            value={reason}
            aria-invalid={error && !reason}
            onChange={(event) => {
              setReason(event.target.value as ReasonId | '')
              setError(false)
            }}
          >
            <option value="">{copy.drawer.choose}</option>
            {reasons.map((id) => (
              <option key={id} value={id}>
                {copy.reasons[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="dm-field">
          <span>{copy.drawer.note}</span>
          <textarea
            value={note}
            maxLength={240}
            placeholder={copy.drawer.notePlaceholder}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        {error && !reason && (
          <p role="alert" className="dm-error">
            {copy.drawer.errorReason}
          </p>
        )}
      </form>
    </Drawer>
  )
}

const count = <T extends string>(list: readonly Quote[], key: (q: Quote) => T, ids: readonly T[]) =>
  ids.map((id) => ({ id, value: list.filter((q) => key(q) === id).length }))

export default function CrmDemo({ onReset }: DemoAppProps) {
  const copy = useCopy(crmCopy)
  const kit = useKit()
  const { money } = useFormat()
  const [quotes, setQuotes] = useState<readonly Quote[]>(initialQuotes)
  const [screen, setScreen] = useState<Screen>('queue')
  const [tab, setTab] = useState<Tab>('pending')
  const [openId, setOpenId] = useState<string | null>(null)
  const [selReason, setSelReason] = useState<string | null>(null)
  const [selUnit, setSelUnit] = useState<string | null>(null)
  const [toast, showToast] = useToast()

  const pending = quotes.filter((q) => !q.reason)
  const handled = quotes.filter((q) => q.reason)
  const open = pending.find((q) => q.id === openId)

  const analysis = useMemo(() => {
    const byUnit = handled.filter((q) => !selUnit || q.unit === selUnit)
    const byReason = handled.filter((q) => !selReason || q.reason === selReason)
    return {
      reasonBars: count(byUnit, (q) => q.reason as ReasonId, reasons).map((b) => ({
        id: b.id,
        label: copy.reasons[b.id],
        value: b.value,
      })),
      unitBars: count(byReason, (q) => q.unit, units).map((b) => ({
        id: b.id,
        label: b.id,
        value: b.value,
      })),
      detail: handled.filter(
        (q) => (!selReason || q.reason === selReason) && (!selUnit || q.unit === selUnit),
      ),
    }
  }, [handled, selReason, selUnit, copy])

  const base: Column<Quote>[] = [
    {
      key: 'id',
      header: copy.columns.id,
      primary: true,
      sort: (a, b) => a.id.localeCompare(b.id),
      cell: (q) => q.id,
    },
    { key: 'client', header: copy.columns.client, cell: (q) => q.client },
    {
      key: 'path',
      header: copy.columns.path,
      hideSm: true,
      cell: (q) => (
        <span className="dm-mono">
          {q.from} → {q.to}
        </span>
      ),
    },
    {
      key: 'value',
      header: copy.columns.value,
      align: 'right',
      sort: (a, b) => a.value - b.value,
      cell: (q) => money(q.value),
    },
  ]
  const pendingColumns: Column<Quote>[] = [
    ...base,
    {
      key: 'status',
      header: copy.columns.status,
      hideSm: true,
      cell: (q) => <Chip tone={statusTone[q.status]}>{copy.status[q.status]}</Chip>,
    },
    {
      key: 'idle',
      header: copy.columns.idle,
      align: 'right',
      sort: (a, b) => a.idle - b.idle,
      cell: (q) => copy.idle(q.idle),
    },
  ]
  const handledColumns = (primary: boolean): Column<Quote>[] => [
    { ...base[0], primary },
    base[1],
    base[3],
    { key: 'unit', header: copy.columns.unit, hideSm: true, cell: (q) => q.unit },
    {
      key: 'reason',
      header: copy.columns.reason,
      cell: (q) => (q.reason ? copy.reasons[q.reason] : ''),
    },
  ]

  function save(quote: Quote, reason: ReasonId, note: string) {
    setQuotes((all) => all.map((q) => (q.id === quote.id ? { ...q, reason, note } : q)))
    setOpenId(null)
    showToast(copy.toastSaved(quote.id))
  }

  const filters = [
    selReason && {
      key: 'r',
      text: copy.analysis.filterReason(copy.reasons[selReason as ReasonId]),
      clear: () => setSelReason(null),
    },
    selUnit && {
      key: 'u',
      text: copy.analysis.filterUnit(selUnit as Unit),
      clear: () => setSelUnit(null),
    },
  ].filter((f) => !!f)

  return (
    <AppFrame
      brand={{ name: copy.brand, mark: 'Q' }}
      nav={[
        { id: 'queue', label: copy.nav.queue, icon: 'inbox', badge: pending.length },
        { id: 'analysis', label: copy.nav.analysis, icon: 'chart' },
      ]}
      active={screen}
      onNav={(id) => setScreen(id as Screen)}
      title={screen === 'queue' ? copy.nav.queue : copy.nav.analysis}
      userLabel={copy.user}
      onReset={onReset}
      toast={toast}
      drawer={
        open && (
          <TreatmentDrawer
            quote={open}
            onClose={() => setOpenId(null)}
            onSave={(r, n) => save(open, r, n)}
          />
        )
      }
    >
      {screen === 'queue' ? (
        <Tabs
          label={copy.tabs.label}
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'pending', label: copy.tabs.pending, count: pending.length },
            { id: 'handled', label: copy.tabs.handled, count: handled.length },
          ]}
        >
          {tab === 'pending' ? (
            <DataTable
              caption={copy.queueTable}
              rows={pending}
              columns={pendingColumns}
              rowKey={(q) => q.id}
              activeKey={openId}
              onRowClick={(q) => setOpenId(q.id)}
              initialSort={{ key: 'idle', dir: 'desc' }}
              empty={<EmptyState title={copy.emptyQueue} text={copy.emptyQueueText} />}
            />
          ) : (
            <DataTable
              caption={copy.handledTable}
              rows={handled}
              columns={handledColumns(false)}
              rowKey={(q) => q.id}
              empty={<EmptyState title={copy.emptyHandled} />}
            />
          )}
        </Tabs>
      ) : (
        <>
          <p className="dm-muted" style={{ marginBottom: 8 }}>
            {copy.analysis.hint}
          </p>
          <div className="dm-toolbar" aria-live="polite">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                className="dm-fchip"
                aria-pressed="true"
                onClick={f.clear}
              >
                {f.text} · {kit.clearFilter} ✕
              </button>
            ))}
          </div>
          <div className="cr-charts">
            <section className="dm-card dm-card-pad">
              <h4 className="dm-h">{copy.analysis.reasonsChart}</h4>
              <BarChart
                title={copy.analysis.reasonsChart}
                data={analysis.reasonBars}
                selected={selReason}
                onSelect={setSelReason}
              />
            </section>
            <section className="dm-card dm-card-pad">
              <h4 className="dm-h">{copy.analysis.unitsChart}</h4>
              <BarChart
                title={copy.analysis.unitsChart}
                data={analysis.unitBars}
                selected={selUnit}
                onSelect={setSelUnit}
              />
            </section>
          </div>
          <h4 className="dm-h" style={{ margin: '14px 0 8px' }}>
            {copy.analysis.detail(analysis.detail.length)} ·{' '}
            {copy.analysis.total(money(analysis.detail.reduce((s, q) => s + q.value, 0)))}
          </h4>
          <DataTable
            caption={copy.handledTable}
            rows={analysis.detail}
            columns={handledColumns(false)}
            rowKey={(q) => q.id}
          />
        </>
      )}
    </AppFrame>
  )
}
