import { useState } from 'react'
import { marqueeItems } from '../data/stack'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useT } from '../i18n/useT'
import { Icon } from './Icon'

function Items({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-x-10 pr-10 font-mono text-lg text-muted"
    >
      {marqueeItems.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          {item}
          <span className="text-accent" aria-hidden="true">
            ·
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Marquee() {
  const { t } = useT()
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)

  if (reduced) {
    return (
      <section aria-label={t.marquee.label} className="wrap pb-20">
        <ul className="flex flex-wrap gap-2">
          {marqueeItems.map((item) => (
            <li key={item} className="pill">
              {item}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section aria-label={t.marquee.label} className="marquee pb-20" data-paused={paused}>
      <div className="wrap mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? t.marquee.playLabel : t.marquee.pauseLabel}
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-mono text-xs text-muted transition-colors hover:text-text"
        >
          <Icon name={paused ? 'play' : 'pause'} className="size-4" />
          {paused ? t.marquee.play : t.marquee.pause}
        </button>
      </div>
      <div className="overflow-hidden border-y border-line bg-surface/50 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] py-5">
        <div className="marquee-track flex w-max">
          <Items />
          <Items hidden />
        </div>
      </div>
    </section>
  )
}
