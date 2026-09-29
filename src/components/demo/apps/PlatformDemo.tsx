import { useState } from 'react'
import './platform.css'
import { AppFrame, type NavItem } from '../kit/AppFrame'
import { DIcon } from '../kit/DIcon'
import type { DemoAppProps } from '../kit/context'
import { useCopy, useToast } from '../kit/lib'
import { Chip } from '../kit/primitives'
import { PlatformAccess } from './platform/PlatformAccess'
import { PlatformChat } from './platform/PlatformChat'
import { panels, roles, tools, type Role, type ToolId } from './platform.data'
import { platformCopy } from './platform.copy'

const icons: Record<ToolId, NavItem['icon']> = {
  assistant: 'bot',
  panels: 'grid',
  regions: 'route',
  vehicles: 'truck',
  access: 'lock',
}
/** Só estas ferramentas têm tela na demonstração. */
const implemented: readonly ToolId[] = ['panels', 'assistant', 'access']

export default function PlatformDemo({ onReset }: DemoAppProps) {
  const copy = useCopy(platformCopy)
  const [role, setRole] = useState<Role>('director')
  const [screen, setScreen] = useState<ToolId>('panels')
  const [toast, showToast] = useToast()

  const visible = panels.filter((panel) => panel.roles.includes(role))
  const scope = role === 'south' ? copy.panels.scopeSouth : copy.panels.scopeAll

  return (
    <AppFrame
      brand={{ name: copy.brand, mark: 'P' }}
      nav={tools.map((id) => ({
        id,
        label: copy.tools[id],
        icon: icons[id],
        disabled: !implemented.includes(id),
      }))}
      active={screen}
      onNav={(id) => setScreen(id as ToolId)}
      title={copy.tools[screen]}
      roles={{
        options: roles.map((id) => ({ id, label: copy.roles[id] })),
        value: role,
        onChange: (id) => setRole(id as Role),
      }}
      onReset={onReset}
      toast={toast}
    >
      {screen === 'panels' && (
        <>
          <p className="dm-muted" style={{ marginBottom: 10 }}>
            {copy.panels.lede}
          </p>
          <div className="dm-toolbar">
            <Chip tone="green">{copy.panels.granted(visible.length)}</Chip>
            <Chip tone="gray">
              <DIcon name="lock" className="dm-icon dm-icon--xs" />
              {copy.panels.locked(panels.length - visible.length)}
            </Chip>
            <span className="dm-muted">
              {copy.panels.scope}: <strong>{scope}</strong>
            </span>
          </div>
          <ul className="pl-grid">
            {panels.map((panel) => {
              const name = copy.panelNames[panel.id]
              const allowed = panel.roles.includes(role)
              return (
                <li key={panel.id}>
                  {allowed ? (
                    <button
                      type="button"
                      className="dm-card pl-panel"
                      onClick={() => showToast(copy.panels.open(name))}
                    >
                      <span className="dm-strong">{name}</span>
                      <span className="pl-bars" aria-hidden="true">
                        {panel.trend.map((h, i) => (
                          <i key={i} style={{ height: `${h * 0.4}px` }} />
                        ))}
                      </span>
                      <span className="dm-muted">{copy.panels.updated}</span>
                    </button>
                  ) : (
                    <div className="dm-card pl-panel pl-panel--locked">
                      <span className="dm-strong">{name}</span>
                      <span className="pl-lockrow">
                        <DIcon name="lock" />
                        {copy.panels.noAccess}
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
      {screen === 'assistant' && <PlatformChat key={role} role={role} />}
      {screen === 'access' && <PlatformAccess role={role} onToast={showToast} />}
    </AppFrame>
  )
}
