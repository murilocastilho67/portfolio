import { useEffect, useState } from 'react'
import { useT } from '../i18n/useT'

const TIMEZONE = 'America/Sao_Paulo'
const TICK_MS = 30_000

const formatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Hora local de Santa Catarina (Brasília), atualizada a cada 30 s. */
export function LocalClock() {
  const { t } = useT()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), TICK_MS)
    return () => window.clearInterval(timer)
  }, [])

  const { place, reply } = t.footer.clock
  return (
    <p>
      {place} · <time dateTime={now.toISOString()}>{formatter.format(now)}</time> · {reply}
    </p>
  )
}
