import { useRef } from 'react'
import { navSectionIds, sectionNumber, type NavSectionId } from '../data/sections'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useScrollLock } from '../hooks/useScrollLock'
import { useT } from '../i18n/useT'
import { Icon } from './Icon'

interface MobileMenuProps {
  id: string
  open: boolean
  active: NavSectionId | null
  onClose: () => void
}

export function MobileMenu({ id, open, active, onClose }: MobileMenuProps) {
  const { t } = useT()
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)
  useScrollLock(open)

  if (!open) return null

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.menuLabel}
      data-lenis-prevent
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg md:hidden"
    >
      <div className="wrap flex h-16 shrink-0 items-center justify-between">
        <span className="font-mono font-bold">
          murilo<span className="text-accent">.</span>dev
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.nav.closeMenu}
          className="inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-2"
        >
          <Icon name="close" className="size-6" />
        </button>
      </div>

      <nav aria-label={t.nav.menuLabel} className="wrap flex flex-1 flex-col justify-center pb-16">
        <ul className="divide-y divide-line border-y border-line">
          {navSectionIds.map((sectionId) => (
            <li key={sectionId}>
              <a
                href={`#${sectionId}`}
                onClick={onClose}
                aria-current={active === sectionId ? 'true' : undefined}
                className={`flex min-h-16 items-baseline gap-4 py-4 text-3xl font-bold tracking-tight ${
                  active === sectionId ? 'text-accent' : 'text-text'
                }`}
              >
                <span className="font-mono text-sm font-normal text-muted" aria-hidden="true">
                  {sectionNumber(sectionId)}
                </span>
                {t.nav.links[sectionId]}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
