import { useTheme } from '../hooks/useTheme'
import { useT } from '../i18n/useT'
import { setTheme } from '../lib/theme'
import { Icon } from './Icon'

/** Botão sol/lua. O rótulo descreve a ação (o tema para o qual vai trocar), não o estado. */
export function ThemeToggle() {
  const { t } = useT()
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        setTheme(next, { x: box.left + box.width / 2, y: box.top + box.height / 2 })
      }}
      aria-label={next === 'light' ? t.nav.themeToLight : t.nav.themeToDark}
      className="soft inline-flex size-11 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-text"
    >
      <Icon name={next === 'light' ? 'sun' : 'moon'} className="size-5" />
    </button>
  )
}
