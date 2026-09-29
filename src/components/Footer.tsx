import { useT } from '../i18n/useT'
import { LocalClock } from './LocalClock'

export function Footer() {
  const { t } = useT()

  return (
    <footer className="border-t border-line">
      <div className="wrap flex flex-col gap-3 py-8 font-mono text-[13px] text-muted md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-8">
        <p>{t.footer.copyright}</p>
        <p>{t.footer.built}</p>
        <LocalClock />
        <p>
          {t.footer.hint}{' '}
          <kbd className="rounded-sm border border-line bg-surface px-1.5 py-0.5">⌘K</kbd> /{' '}
          <kbd className="rounded-sm border border-line bg-surface px-1.5 py-0.5">Ctrl K</kbd>
        </p>
      </div>
    </footer>
  )
}
