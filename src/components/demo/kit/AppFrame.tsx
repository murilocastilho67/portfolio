import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DIcon, type DIconName } from './DIcon'
import { useEscape } from './context'
import { useKit } from './lib'

export interface NavItem {
  id: string
  label: string
  icon: DIconName
  badge?: number
  /** Item ilustrativo, fora do escopo da demonstração. */
  disabled?: boolean
}

interface RoleSwitch {
  options: readonly { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}

interface AppFrameProps {
  brand: { name: string; mark: string }
  nav: readonly NavItem[]
  active: string
  onNav: (id: string) => void
  /** Título da página atual. */
  title: string
  /** Troca de perfil (chip do usuário); sem ele, `userLabel` aparece fixo. */
  roles?: RoleSwitch
  userLabel?: string
  notifications?: readonly string[]
  onReset: () => void
  drawer?: ReactNode
  toast?: string | null
  children: ReactNode
}

function Sidebar({
  brand,
  nav,
  active,
  onNav,
}: Pick<AppFrameProps, 'brand' | 'nav' | 'active' | 'onNav'>) {
  const kit = useKit()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className="dm-side" data-collapsed={collapsed || undefined}>
      <div className="dm-brand">
        <span className="dm-mark" aria-hidden="true">
          {brand.mark}
        </span>
        <span className="dm-brand-name">{brand.name}</span>
      </div>
      <nav aria-label={kit.navLabel} className="dm-nav">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            className="dm-navitem"
            aria-current={item.id === active ? 'page' : undefined}
            disabled={item.disabled}
            title={item.disabled ? kit.soon : collapsed ? item.label : undefined}
            onClick={() => onNav(item.id)}
          >
            <DIcon name={item.icon} />
            <span className="dm-navlabel">{item.label}</span>
            {item.badge ? <span className="dm-badge">{item.badge}</span> : null}
          </button>
        ))}
      </nav>
      <button
        type="button"
        className="dm-collapse"
        aria-label={collapsed ? kit.expand : kit.collapse}
        aria-pressed={collapsed}
        onClick={() => setCollapsed((c) => !c)}
      >
        <DIcon name="panel" />
        <span className="dm-navlabel">{collapsed ? kit.expand : kit.collapse}</span>
      </button>
    </aside>
  )
}

function Bell({ items }: { items: readonly string[] }) {
  const kit = useKit()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEscape(open, () => setOpen(false))
  useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <div ref={rootRef} className="dm-bell">
      <button
        type="button"
        className="dm-iconbtn"
        aria-label={`${kit.notifications}: ${items.length}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <DIcon name="bell" />
        {items.length > 0 && (
          <span className="dm-badge dm-badge--float" aria-hidden="true">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="dm-popover" data-lenis-prevent>
          <p className="dm-popover-title">{kit.notifications}</p>
          {items.length === 0 ? (
            <p className="dm-popover-empty">{kit.noNotifications}</p>
          ) : (
            <ul>
              {[...items].reverse().map((item, i) => (
                <li key={`${i}-${item}`}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function TopBar({
  title,
  roles,
  userLabel,
  notifications = [],
  onReset,
}: Pick<AppFrameProps, 'title' | 'roles' | 'userLabel' | 'notifications' | 'onReset'>) {
  const kit = useKit()
  const current =
    roles?.options.find((option) => option.id === roles.value)?.label ?? userLabel ?? ''

  return (
    <header className="dm-top">
      <h3 className="dm-page-title">{title}</h3>
      <div className="dm-fakesearch" aria-hidden="true">
        <DIcon name="search" />
        <span>{kit.search}</span>
      </div>
      <button type="button" className="dm-linkbtn" onClick={onReset}>
        {kit.reset}
      </button>
      <Bell items={notifications} />
      <label className="dm-user">
        <span className="dm-avatar" aria-hidden="true">
          {current.slice(0, 1)}
        </span>
        {roles ? (
          <>
            <span className="sr-only">{kit.role}</span>
            <select value={roles.value} onChange={(event) => roles.onChange(event.target.value)}>
              {roles.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <DIcon name="chevronD" className="dm-icon dm-user-caret" />
          </>
        ) : (
          <span className="dm-user-fixed">{current}</span>
        )}
      </label>
    </header>
  )
}

/** Estrutura comum dos apps: barra lateral, barra superior, conteúdo rolável, gaveta e aviso. */
export function AppFrame({
  brand,
  nav,
  active,
  onNav,
  title,
  roles,
  userLabel,
  notifications,
  onReset,
  drawer,
  toast,
  children,
}: AppFrameProps) {
  const inert = drawer ? true : undefined

  return (
    <div className="dm-app">
      <div className="dm-app-inert" inert={inert}>
        <Sidebar brand={brand} nav={nav} active={active} onNav={onNav} />
        <TopBar
          title={title}
          roles={roles}
          userLabel={userLabel}
          notifications={notifications}
          onReset={onReset}
        />
        <div className="dm-main" data-lenis-prevent>
          {children}
        </div>
      </div>
      {drawer}
      <div role="status" aria-live="polite" className="dm-toast-slot">
        {toast && <p className="dm-toast">{toast}</p>}
      </div>
    </div>
  )
}
