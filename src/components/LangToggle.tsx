import { useT } from '../i18n/useT'

export function LangToggle() {
  const { lang, t, toggleLang } = useT()
  const on = 'text-accent font-bold'
  const off = 'text-muted'

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t.nav.switchLang}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 font-mono text-sm transition-colors hover:bg-surface-2"
    >
      <span className={lang === 'pt' ? on : off}>PT</span>
      <span className="mx-1.5 text-line" aria-hidden="true">
        |
      </span>
      <span className={lang === 'en' ? on : off}>EN</span>
    </button>
  )
}
