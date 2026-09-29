import { DIcon } from '../../kit/DIcon'
import { useCopy } from '../../kit/lib'
import { Chip } from '../../kit/primitives'
import { paymentsCopy } from '../payments.copy'
import { suppliers, type BankAccount } from '../payments.data'

/** Contas por fornecedor: N contas, uma delas marcada com a estrela de "principal". */
export function AccountsPage({
  accounts,
  onSetPrincipal,
}: {
  accounts: readonly BankAccount[]
  onSetPrincipal: (account: BankAccount) => void
}) {
  const copy = useCopy(paymentsCopy)

  return (
    <>
      <p className="dm-muted" style={{ marginBottom: 12 }}>
        {copy.accounts.lede}
      </p>
      <ul className="pg-suppliers">
        {suppliers.map((supplier) => {
          const own = accounts.filter((account) => account.supplierId === supplier.id)
          return (
            <li key={supplier.id} className="dm-card pg-supplier">
              <header>
                <span className="dm-strong">{supplier.name}</span>
                <Chip tone="gray">{copy.accounts.count(own.length)}</Chip>
              </header>
              <ul>
                {own.map((account) => (
                  <li key={account.id} data-principal={account.principal || undefined}>
                    <button
                      type="button"
                      className="pg-star"
                      aria-pressed={account.principal}
                      aria-label={
                        account.principal
                          ? copy.accounts.isPrincipal(account.bank)
                          : copy.accounts.setPrincipal(account.bank)
                      }
                      onClick={() => onSetPrincipal(account)}
                    >
                      <DIcon name="star" filled={account.principal} />
                    </button>
                    <span className="dm-strong">{account.bank}</span>
                    <span className="dm-mono">
                      {account.agency} · {account.account}
                    </span>
                    {account.principal && <Chip tone="amber">{copy.accounts.principal}</Chip>}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </>
  )
}
