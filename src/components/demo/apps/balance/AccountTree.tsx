import { useState, type FormEvent } from 'react'
import { DIcon } from '../../kit/DIcon'
import { useCopy } from '../../kit/lib'
import { Chip } from '../../kit/primitives'
import { balanceCopy } from '../balance.copy'
import { groupsByRoot, type Account, type GroupId } from '../balance.data'
import { childrenOf, resolveGroup, rootOf, type Mapping } from './balance.logic'

interface AccountTreeProps {
  mapping: Mapping
  expanded: ReadonlySet<string>
  onToggle: (code: string) => void
  /** Nó com o formulário de mapeamento aberto. */
  mappingCode: string | null
  onOpenMap: (code: string | null) => void
  onApply: (code: string, group: GroupId) => void
  /** Último nó mapeado e quantas contas herdaram. */
  lastMapped: { code: string; count: number } | null
}

function MapForm({
  account,
  onApply,
  onCancel,
}: {
  account: Account
  onApply: (group: GroupId) => void
  onCancel: () => void
}) {
  const copy = useCopy(balanceCopy)
  const [group, setGroup] = useState<GroupId | ''>('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (group) onApply(group)
  }

  return (
    <form className="bl-mapform" onSubmit={submit}>
      <label className="dm-field">
        <span>{copy.tree.mapTo}</span>
        <select value={group} onChange={(event) => setGroup(event.target.value as GroupId | '')}>
          <option value="">{copy.tree.choose}</option>
          {groupsByRoot[rootOf(account.code)].map((id) => (
            <option key={id} value={id}>
              {copy.groups[id]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="dm-btn dm-btn--primary" disabled={!group}>
        {copy.tree.apply}
      </button>
      <button type="button" className="dm-btn" onClick={onCancel}>
        {copy.tree.cancel}
      </button>
    </form>
  )
}

function Node({ account, depth, ...tree }: AccountTreeProps & { account: Account; depth: number }) {
  const copy = useCopy(balanceCopy)
  const children = childrenOf(account.code)
  const isOpen = tree.expanded.has(account.code)
  const name = copy.accounts[account.code]
  const group = resolveGroup(account.code, tree.mapping)
  const own = tree.mapping[account.code] !== undefined
  const canMap = account.kind === 'S' && account.parent !== null && !group

  return (
    <li>
      <div className="bl-row" style={{ paddingLeft: depth * 14 }}>
        {children.length > 0 ? (
          <button
            type="button"
            className="bl-toggle"
            aria-expanded={isOpen}
            aria-label={isOpen ? copy.tree.collapse(name) : copy.tree.expand(name)}
            onClick={() => tree.onToggle(account.code)}
          >
            <DIcon
              name="chevronR"
              className={`dm-icon bl-caret${isOpen ? 'bl-caret--open' : ''}`}
            />
          </button>
        ) : (
          <span className="bl-spacer" />
        )}
        <span
          className="bl-kind"
          title={account.kind === 'S' ? copy.tree.synthetic : copy.tree.analytic}
        >
          <DIcon name={account.kind === 'S' ? 'tree' : 'file'} className="dm-icon dm-icon--xs" />
          <span className="sr-only">
            {account.kind === 'S' ? copy.tree.synthetic : copy.tree.analytic}
          </span>
        </span>
        <span className="dm-mono bl-code">{account.code}</span>
        <span className="bl-name">{name}</span>
        {group ? (
          <Chip tone={own ? 'blue' : 'gray'}>
            {!own && (
              <>
                <span aria-hidden="true">↳ </span>
                <span className="sr-only">{copy.tree.inherited}: </span>
              </>
            )}
            {copy.groups[group]}
          </Chip>
        ) : (
          account.parent !== null && <Chip tone="red">{copy.tree.unmapped}</Chip>
        )}
        {canMap && (
          <button
            type="button"
            className="dm-btn bl-mapbtn"
            aria-expanded={tree.mappingCode === account.code}
            onClick={() => tree.onOpenMap(tree.mappingCode === account.code ? null : account.code)}
          >
            {copy.tree.map}
          </button>
        )}
        {tree.lastMapped?.code === account.code && (
          <Chip tone="green">✓ {copy.tree.inherit(tree.lastMapped.count)}</Chip>
        )}
      </div>
      {tree.mappingCode === account.code && canMap && (
        <MapForm
          account={account}
          onApply={(g) => tree.onApply(account.code, g)}
          onCancel={() => tree.onOpenMap(null)}
        />
      )}
      {isOpen && children.length > 0 && (
        <ul>
          {children.map((child) => (
            <Node key={child.code} account={child} depth={depth + 1} {...tree} />
          ))}
        </ul>
      )}
    </li>
  )
}

/** Árvore do plano de contas: expandir/recolher, sintética x analítica e o grupo de cada nó. */
export function AccountTree(props: AccountTreeProps) {
  const copy = useCopy(balanceCopy)
  const roots = childrenOf(null)
  return (
    <section className="dm-card bl-tree" aria-label={copy.tree.title}>
      <h4 className="dm-h bl-tree-head">
        {copy.tree.title}
        <span className="bl-legend" aria-hidden="true">
          <DIcon name="tree" className="dm-icon dm-icon--xs" /> {copy.tree.synthetic}
          <DIcon name="file" className="dm-icon dm-icon--xs" /> {copy.tree.analytic}
        </span>
      </h4>
      <ul className="bl-list">
        {roots.map((root) => (
          <Node key={root.code} account={root} depth={0} {...props} />
        ))}
      </ul>
    </section>
  )
}
