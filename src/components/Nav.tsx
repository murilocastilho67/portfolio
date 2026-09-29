import { useCallback, useEffect, useId, useState } from 'react'
import { navSectionIds, sectionIds, type NavSectionId } from '../data/sections'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { useT } from '../i18n/useT'
import { paletteShortcut } from '../lib/platform'
import { Icon } from './Icon'
import { LangToggle } from './LangToggle'
import { MobileMenu } from './MobileMenu'

const isNavSection = (id: string | null): id is NavSectionId =>
  navSectionIds.some((navId) => navId === id)

export function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { t } = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const spy = useScrollSpy(sectionIds)
  const active = isNavSection(spy) ? spy : null
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Fecha o menu ao ampliar a janela para o layout desktop.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mql.matches) setMenuOpen(false)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/75 backdrop-blur-md">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <a
            href="#inicio"
            aria-label={t.nav.brandLabel}
            className="inline-flex min-h-11 items-center font-mono font-bold tracking-tight"
          >
            murilo<span className="text-accent">.</span>dev
          </a>

          <nav aria-label={t.nav.label} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navSectionIds.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active === id ? 'true' : undefined}
                    className={`relative inline-flex min-h-11 items-center px-3 font-mono text-sm transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:origin-left after:bg-accent after:transition-transform ${
                      active === id
                        ? 'text-accent after:scale-x-100'
                        : 'text-muted after:scale-x-0 hover:text-text'
                    }`}
                  >
                    {t.nav.links[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenPalette}
              aria-label={t.nav.openPalette}
              aria-haspopup="dialog"
              className="hidden min-h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-text md:inline-flex"
            >
              <Icon name="search" className="size-4" />
              <kbd className="font-mono">{paletteShortcut}</kbd>
            </button>
            <LangToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              className="inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-2 md:hidden"
            >
              <Icon name="menu" className="size-6" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu id={menuId} open={menuOpen} active={active} onClose={closeMenu} />
    </>
  )
}
