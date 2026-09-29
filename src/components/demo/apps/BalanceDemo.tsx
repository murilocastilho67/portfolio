import { useState } from 'react'
import { AppFrame } from '../kit/AppFrame'
import type { DemoAppProps } from '../kit/context'
import { useCopy, useMediaQuery, useToast } from '../kit/lib'
import { Tabs } from '../kit/primitives'
import './balance.css'
import { AccountTree } from './balance/AccountTree'
import { BalanceReport, CheckReport, DreReport } from './balance/Statements'
import {
  MONTHS,
  initialMapping,
  leavesUnder,
  unmappedRoots,
  type Mapping,
} from './balance/balance.logic'
import { balanceCopy } from './balance.copy'
import type { GroupId } from './balance.data'

type Tab = 'plan' | 'balance' | 'dre' | 'check'

/** Nós abertos de início: as raízes, o 2º nível e o trecho sem grupo. */
const initialExpanded = () => new Set(['1', '2', '3', '4', '1.3'])

export default function BalanceDemo({ onReset }: DemoAppProps) {
  const copy = useCopy(balanceCopy)
  const narrow = useMediaQuery('(max-width: 900px)')
  const [mapping, setMapping] = useState<Mapping>(initialMapping)
  const [expanded, setExpanded] = useState(initialExpanded)
  const [mappingCode, setMappingCode] = useState<string | null>(null)
  const [lastMapped, setLastMapped] = useState<{ code: string; count: number } | null>(null)
  const [month, setMonth] = useState(MONTHS - 1)
  const [tab, setTab] = useState<Tab>('balance')
  const [toast, showToast] = useToast()

  const divergences = unmappedRoots(mapping).length

  function toggle(code: string) {
    setExpanded((set) => {
      const next = new Set(set)
      if (!next.delete(code)) next.add(code)
      return next
    })
  }

  function apply(code: string, group: GroupId) {
    const count = leavesUnder(code).length
    setMapping((current) => ({ ...current, [code]: group }))
    setMappingCode(null)
    setLastMapped({ code, count })
    showToast(copy.tree.toast(code, copy.groups[group], count))
  }

  /** Da Conferência ao formulário de mapeamento do nó (abre o plano no celular). */
  function goMap(code: string) {
    setExpanded((set) => new Set(set).add(code).add(code.split('.')[0]))
    setMappingCode(code)
    if (narrow) setTab('plan')
  }

  const tabs = [
    ...(narrow ? [{ id: 'plan' as const, label: copy.tabs.plan }] : []),
    { id: 'balance' as const, label: copy.tabs.balance },
    { id: 'dre' as const, label: copy.tabs.dre },
    { id: 'check' as const, label: copy.tabs.check, count: divergences },
  ]
  const activeTab = tabs.some((t) => t.id === tab) ? tab : 'balance'

  const tree = (
    <AccountTree
      mapping={mapping}
      expanded={expanded}
      onToggle={toggle}
      mappingCode={mappingCode}
      onOpenMap={setMappingCode}
      onApply={apply}
      lastMapped={lastMapped}
    />
  )

  return (
    <AppFrame
      brand={{ name: copy.brand, mark: 'C' }}
      nav={[
        { id: 'statements', label: copy.nav.statements, icon: 'scale' },
        { id: 'closing', label: copy.nav.closing, icon: 'clock', disabled: true },
        { id: 'settings', label: copy.nav.settings, icon: 'file', disabled: true },
      ]}
      active="statements"
      onNav={() => {}}
      title={copy.nav.statements}
      userLabel={copy.user}
      onReset={onReset}
      toast={toast}
    >
      <div className="dm-toolbar">
        <label className="dm-field bl-month">
          <span>{copy.monthLabel}</span>
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {copy.months.map((name, i) => (
              <option key={name} value={i}>
                {copy.monthFull(name)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="bl-layout">
        {!narrow && tree}
        <div className="bl-main">
          <Tabs label={copy.tabs.label} tabs={tabs} value={activeTab} onChange={setTab}>
            {activeTab === 'plan' && tree}
            {activeTab === 'balance' && <BalanceReport month={month} mapping={mapping} />}
            {activeTab === 'dre' && <DreReport month={month} mapping={mapping} />}
            {activeTab === 'check' && <CheckReport month={month} mapping={mapping} onMap={goMap} />}
          </Tabs>
        </div>
      </div>
    </AppFrame>
  )
}
