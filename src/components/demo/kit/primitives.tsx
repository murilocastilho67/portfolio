import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { DIcon } from './DIcon'
import { useKit } from './lib'

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'crimson'

export function Chip({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`dm-chip dm-chip--${tone}`}>{children}</span>
}

interface FilterOption<T extends string> {
  id: T
  label: string
  count?: number
}

/** Filtros em chips: um ativo por vez, cada chip é um botão com aria-pressed. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly FilterOption<T>[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="dm-filters">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="dm-fchip"
          aria-pressed={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.count !== undefined && <span className="dm-fchip-count">{option.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: Tone
}) {
  return (
    <div className="dm-kpi">
      <p className="dm-kpi-label">{label}</p>
      <p className={`dm-kpi-value${tone ? ` dm-tone-${tone}` : ''}`}>{value}</p>
      {hint && <p className="dm-kpi-hint">{hint}</p>}
    </div>
  )
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="dm-empty">
      <DIcon name="inbox" className="dm-icon dm-empty-icon" />
      <p className="dm-empty-title">{title}</p>
      {text && <p className="dm-empty-text">{text}</p>}
      {action}
    </div>
  )
}

export function ProgressBar({
  value,
  max,
  label,
  tone = 'crimson',
}: {
  value: number
  max: number
  label: string
  tone?: 'crimson' | 'green'
}) {
  return (
    <div
      className="dm-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span
        className={`dm-progress-fill dm-progress-fill--${tone}`}
        style={{ width: `${max ? (value / max) * 100 : 0}%` }}
      />
    </div>
  )
}

/** Interruptor acessível (role="switch"). */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className="dm-switch"
      onClick={() => onChange(!checked)}
    />
  )
}

interface TabItem<T extends string> {
  id: T
  label: string
  count?: number
}

/** Abas com setas/Home/End; o painel ativo vai em `children`. */
export function Tabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  children,
}: {
  label: string
  tabs: readonly TabItem<T>[]
  value: T
  onChange: (id: T) => void
  children: ReactNode
}) {
  const uid = useId()
  const listRef = useRef<HTMLDivElement>(null)

  function onKeyDown(event: KeyboardEvent) {
    const index = tabs.findIndex((tab) => tab.id === value)
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    onChange(tabs[next].id)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <>
      <div ref={listRef} role="tablist" aria-label={label} className="dm-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${uid}-t-${tab.id}`}
            aria-selected={tab.id === value}
            aria-controls={`${uid}-p`}
            tabIndex={tab.id === value ? 0 : -1}
            className="dm-tab"
            onClick={() => onChange(tab.id)}
            onKeyDown={onKeyDown}
          >
            {tab.label}
            {tab.count !== undefined && <span className="dm-fchip-count">{tab.count}</span>}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-p`}
        aria-labelledby={`${uid}-t-${value}`}
        className="dm-tabpanel"
      >
        {children}
      </div>
    </>
  )
}

/** Campo de busca de tabela (busca real, ao contrário da busca decorativa da barra superior). */
export function SearchField({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (next: string) => void
  label: string
}) {
  const kit = useKit()
  return (
    <label className="dm-search">
      <DIcon name="search" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        placeholder={kit.search}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
