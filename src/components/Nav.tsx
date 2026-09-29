import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { navSectionIds, sectionIds, type NavSectionId } from '../data/sections'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { useT } from '../i18n/useT'
import { paletteShortcut } from '../lib/platform'
import { Icon } from './Icon'
import { LangToggle } from './LangToggle'
import { MobileMenu } from './MobileMenu'
import { ThemeToggle } from './ThemeToggle'

const isNavSection = (id: string | null): id is NavSectionId =>
  navSectionIds.some((navId) => navId === id)

type Box = { x: number; w: number }

/** Posição e largura de cada link dentro da lista, remedidas quando o layout muda (resize, idioma). */
function useLinkBoxes() {
  const listRef = useRef<HTMLUListElement>(null)
  const links = useRef(new Map<NavSectionId, HTMLAnchorElement>())
  const [boxes, setBoxes] = useState<Partial<Record<NavSectionId, Box>>>({})

  const measure = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const origin = list.getBoundingClientRect().left
    const next: Partial<Record<NavSectionId, Box>> = {}
    for (const [id, el] of links.current) {
      const box = el.getBoundingClientRect()
      next[id] = { x: box.left - origin, w: box.width }
    }
    setBoxes(next)
  }, [])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [measure])

  const linkRef = useCallback(
    (id: NavSectionId) => (el: HTMLAnchorElement | null) => {
      if (el) links.current.set(id, el)
      else links.current.delete(id)
    },
    [],
  )

  return { listRef, linkRef, boxes }
}

export function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { t } = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<NavSectionId | null>(null)
  const menuId = useId()
  const spy = useScrollSpy(sectionIds)
  const active = isNavSection(spy) ? spy : null
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const { listRef, linkRef, boxes } = useLinkBoxes()

  // O indicador guarda a última posição ao sumir, para esmaecer no lugar em vez de pular.
  const [lastActive, setLastActive] = useState(active)
  if (active && active !== lastActive) setLastActive(active)
  const [lastHovered, setLastHovered] = useState(hovered)
  if (hovered && hovered !== lastHovered) setLastHovered(hovered)
  const activeBox = lastActive ? boxes[lastActive] : undefined
  const hoverBox = lastHovered ? boxes[lastHovered] : undefined

  // Fecha o menu ao ampliar a janela para o layout desktop.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mql.matches) setMenuOpen(false)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // No topo o cabeçalho é transparente; ao rolar, o vidro e a borda aparecem aos poucos.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        data-scrolled={scrolled}
        className="nav-shell sticky top-0 z-40 border-b border-transparent data-[scrolled=true]:border-line/60 data-[scrolled=true]:bg-bg/70 data-[scrolled=true]:backdrop-blur-md"
      >
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <a
            href="#inicio"
            aria-label={t.nav.brandLabel}
            className="group inline-flex min-h-11 items-center font-mono font-bold tracking-tight"
          >
            murilo
            <span className="brand-dot text-accent">.</span>
            dev
          </a>

          <nav aria-label={t.nav.label} className="hidden md:block">
            <ul ref={listRef} className="relative flex items-center">
              <span
                aria-hidden="true"
                className="nav-hover pointer-events-none absolute inset-y-1.5 left-0 rounded-md bg-surface-2/90"
                style={{
                  width: hoverBox?.w ?? 0,
                  transform: `translateX(${hoverBox?.x ?? 0}px)`,
                  opacity: hovered ? 1 : 0,
                }}
              />
              <span
                aria-hidden="true"
                className="nav-bar pointer-events-none absolute bottom-1 left-0 h-0.5 rounded-full bg-accent"
                style={{
                  width: activeBox ? activeBox.w - 24 : 0,
                  transform: `translateX(${(activeBox?.x ?? 0) + 12}px)`,
                  opacity: active ? 1 : 0,
                }}
              />
              {navSectionIds.map((id) => (
                <li key={id} className="relative">
                  <a
                    ref={linkRef(id)}
                    href={`#${id}`}
                    aria-current={active === id ? 'true' : undefined}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(id)}
                    onBlur={() => setHovered(null)}
                    className={`nav-link relative inline-flex min-h-11 items-center px-3 font-mono text-sm ${
                      active === id ? 'text-accent' : 'text-muted hover:text-text'
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
              className="soft hidden min-h-11 items-center gap-2 rounded-md border border-line bg-surface/70 px-3 font-mono text-xs text-muted hover:border-accent/60 hover:text-text md:inline-flex"
            >
              <Icon name="search" className="size-4" />
              <kbd className="font-mono">{paletteShortcut}</kbd>
            </button>
            <ThemeToggle />
            <LangToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              className="soft inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-2 md:hidden"
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
