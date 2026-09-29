import { useEffect, useMemo, useState } from 'react'
import { Drawer } from '../../kit/Drawer'
import { DEMO_TODAY, useCopy, useFormat } from '../../kit/lib'
import { Chip, ProgressBar } from '../../kit/primitives'
import { paymentsCopy } from '../payments.copy'
import { netAmount, suppliers, type BankAccount, type Title } from '../payments.data'

interface PaymentSheetProps {
  titles: readonly Title[]
  accounts: readonly BankAccount[]
  onClose: () => void
  onSent: (count: number) => void
}

const SEND_MS = 550

/** Folha "Dados para depósito" (prévia do PDF) e o envio por e-mail em lote, um fornecedor por vez. */
export function PaymentSheet({ titles, accounts, onClose, onSent }: PaymentSheetProps) {
  const copy = useCopy(paymentsCopy)
  const { money, date } = useFormat()
  const [phase, setPhase] = useState<'preview' | 'sending'>('preview')
  const [sent, setSent] = useState(0)

  const rows = useMemo(
    () =>
      suppliers.flatMap((supplier) => {
        const own = titles.filter((title) => title.supplierId === supplier.id)
        if (own.length === 0) return []
        return [
          {
            supplier,
            count: own.length,
            total: own.reduce((sum, title) => sum + netAmount(title), 0),
            account: accounts.find((a) => a.supplierId === supplier.id && a.principal),
          },
        ]
      }),
    [titles, accounts],
  )
  const grand = rows.reduce((sum, row) => sum + row.total, 0)

  const finished = phase === 'sending' && sent >= rows.length

  useEffect(() => {
    if (phase !== 'sending' || finished) return
    const timer = window.setTimeout(() => setSent((n) => n + 1), SEND_MS)
    return () => window.clearTimeout(timer)
  }, [phase, sent, finished])

  useEffect(() => {
    if (finished) onSent(rows.length)
  }, [finished, rows.length, onSent])

  const footer =
    phase === 'preview' ? (
      <button type="button" className="dm-btn dm-btn--primary" onClick={() => setPhase('sending')}>
        {copy.sheet.sendMail}
      </button>
    ) : (
      <div className="pg-progress">
        <p className="dm-strong">
          {finished ? copy.sheet.finished(rows.length) : copy.sheet.sending(sent, rows.length)}
        </p>
        <ProgressBar
          value={sent}
          max={rows.length}
          label={copy.sheet.progress}
          tone={finished ? 'green' : 'crimson'}
        />
        {finished && (
          <button type="button" className="dm-btn" onClick={onClose}>
            {copy.sheet.close}
          </button>
        )}
      </div>
    )

  return (
    <Drawer
      size="lg"
      title={copy.sheet.title}
      subtitle={copy.sheet.note}
      onClose={onClose}
      footer={footer}
    >
      <article className="pg-paper" aria-label={copy.sheet.title}>
        <header className="pg-paper-head">
          <h4>{copy.sheet.doc}</h4>
          <p>{copy.sheet.issued(date(DEMO_TODAY))}</p>
        </header>
        <table className="pg-paper-table">
          <thead>
            <tr>
              <th scope="col">{copy.sheet.supplier}</th>
              <th scope="col" className="pg-col-bank">
                {copy.sheet.bank} / {copy.sheet.agency} / {copy.sheet.account}
              </th>
              <th scope="col" className="dm-right">
                {copy.sheet.total}
              </th>
              <th scope="col" className="dm-center">
                <span className="sr-only">{copy.sheet.progress}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.supplier.id}>
                <td>
                  <span className="dm-strong">{row.supplier.name}</span>
                  <span className="pg-sub">
                    {copy.sheet.titles}: {row.count}
                  </span>
                </td>
                <td className="dm-mono pg-col-bank">
                  {row.account
                    ? `${row.account.bank} · ${row.account.agency} · ${row.account.account}`
                    : '—'}
                </td>
                <td className="dm-right dm-strong">{money(row.total)}</td>
                <td className="dm-center">
                  {phase !== 'preview' &&
                    (i < sent ? (
                      <Chip tone="green">✓ {copy.sheet.sent}</Chip>
                    ) : i === sent && phase === 'sending' ? (
                      <Chip tone="amber">…</Chip>
                    ) : (
                      <Chip tone="gray">{copy.sheet.pending}</Chip>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>{copy.sheet.grand}</td>
              <td className="dm-right" colSpan={2}>
                {money(grand)}
              </td>
            </tr>
          </tfoot>
        </table>
      </article>
    </Drawer>
  )
}
