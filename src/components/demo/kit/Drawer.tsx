import { useEffect, useId, useRef, type ReactNode } from 'react'
import { DIcon } from './DIcon'
import { useEscape } from './context'
import { useKit } from './lib'

/**
 * Painel lateral dentro da janela (vira "bottom sheet" no celular). Quem renderiza é o AppFrame,
 * fora da área inerte. Esc fecha só o painel; o foco vai para ele e volta ao acionador.
 */
export function Drawer({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'md',
}: {
  title: string
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}) {
  const kit = useKit()
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEscape(true, onClose)

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return (
    <div className="dm-drawer-layer">
      <div role="presentation" className="dm-scrim" onMouseDown={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`dm-drawer dm-drawer--${size}`}
      >
        <header className="dm-drawer-head">
          <div className="min-w-0">
            <h3 id={titleId} className="dm-drawer-title">
              {title}
            </h3>
            {subtitle && <div className="dm-drawer-sub">{subtitle}</div>}
          </div>
          <button
            ref={closeRef}
            type="button"
            className="dm-iconbtn"
            aria-label={kit.closePanel}
            onClick={onClose}
          >
            <DIcon name="x" />
          </button>
        </header>
        <div className="dm-drawer-body" data-lenis-prevent>
          {children}
        </div>
        {footer && <footer className="dm-drawer-foot">{footer}</footer>}
      </aside>
    </div>
  )
}
