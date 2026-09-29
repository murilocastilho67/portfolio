import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { EMAIL, GITHUB_PROJECTS_URL, LINKEDIN_URL } from '../data/links'
import { sectionIds } from '../data/sections'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useScrollLock } from '../hooks/useScrollLock'
import { useT } from '../i18n/useT'
import { copyText } from '../lib/clipboard'
import { scrollToSection } from '../lib/scroll'
import { Icon } from './Icon'

interface Command {
  id: string
  kind: 'section' | 'action'
  label: string
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNotify: (message: string) => void
}

/** Remove acentos e caixa para uma busca tolerante ("acao" encontra "ação"). */
const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function Dialog({ onClose, onNotify }: Omit<CommandPaletteProps, 'open'>) {
  const { t, toggleLang } = useT()
  const panelRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  useFocusTrap(panelRef, true, onClose)
  useScrollLock(true)

  const commands = useMemo<Command[]>(
    () => [
      ...sectionIds.map((id) => ({
        id: `section-${id}`,
        kind: 'section' as const,
        label: t.palette.sections[id],
        // Espera o diálogo fechar (e o scroll destravar) antes de rolar.
        run: () => requestAnimationFrame(() => scrollToSection(id)),
      })),
      {
        id: 'copy-email',
        kind: 'action',
        label: t.palette.actions.copyEmail,
        run: () => {
          void copyText(EMAIL).then((ok) => ok && onNotify(t.toast.emailCopied))
        },
      },
      {
        id: 'github',
        kind: 'action',
        label: t.palette.actions.github,
        run: () => openExternal(GITHUB_PROJECTS_URL),
      },
      {
        id: 'linkedin',
        kind: 'action',
        label: t.palette.actions.linkedin,
        run: () => openExternal(LINKEDIN_URL),
      },
      { id: 'lang', kind: 'action', label: t.palette.actions.switchLang, run: toggleLang },
    ],
    [t, onNotify, toggleLang],
  )

  const results = useMemo(() => {
    const needle = normalize(query.trim())
    return commands.filter((command) => normalize(command.label).includes(needle))
  }, [commands, query])

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0))
  const optionId = (index: number) => `${listId}-${index}`

  useEffect(() => {
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [listId, activeIndex])

  function execute(command: Command | undefined) {
    if (!command) return
    onClose()
    command.run()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const count = results.length
    if (event.key === 'ArrowDown' && count) {
      event.preventDefault()
      setActive((activeIndex + 1) % count)
    } else if (event.key === 'ArrowUp' && count) {
      event.preventDefault()
      setActive((activeIndex - 1 + count) % count)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      execute(results[activeIndex])
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm sm:pt-[14vh]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.palette.title}
        className="card w-full max-w-xl overflow-hidden bg-surface shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="size-5 shrink-0 text-accent" />
          <label htmlFor={`${listId}-input`} className="sr-only">
            {t.palette.inputLabel}
          </label>
          <input
            id={`${listId}-input`}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length ? optionId(activeIndex) : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder={t.palette.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-text placeholder:text-muted focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.palette.close}
            className="inline-flex min-h-11 items-center rounded-md px-2 font-mono text-xs text-muted hover:text-text"
          >
            <kbd className="rounded-sm border border-line px-1.5 py-0.5">esc</kbd>
          </button>
        </div>

        <ul
          id={listId}
          role="listbox"
          aria-label={t.palette.title}
          className="max-h-[min(20rem,50vh)] overflow-y-auto p-2"
        >
          {results.map((command, i) => (
            // Opções não recebem foco: o teclado é tratado no input (aria-activedescendant).
            // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              key={command.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === activeIndex}
              onMouseMove={() => setActive(i)}
              onClick={() => execute(command)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border-l-2 px-3 py-2 ${
                i === activeIndex
                  ? 'border-accent bg-accent-soft text-text'
                  : 'border-transparent text-text/85'
              }`}
            >
              <span>{command.label}</span>
              <span className="font-mono text-xs text-muted">
                {command.kind === 'section' ? t.palette.kindSection : t.palette.kindAction}
              </span>
            </li>
          ))}
        </ul>
        {results.length === 0 && (
          <p className="px-5 pb-6 text-center text-muted">{t.palette.empty}</p>
        )}

        <p role="status" className="sr-only">
          {results.length} {t.palette.results}
        </p>

        <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-xs text-muted sm:flex">
          <span>
            <kbd>↑↓</kbd> {t.palette.hintNavigate}
          </span>
          <span>
            <kbd>↵</kbd> {t.palette.hintSelect}
          </span>
          <span>
            <kbd>esc</kbd> {t.palette.hintClose}
          </span>
        </div>
      </div>
    </div>
  )
}

export function CommandPalette({ open, ...rest }: CommandPaletteProps) {
  return open ? <Dialog {...rest} /> : null
}
