import { stats } from '../data/stats'
import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useT } from '../i18n/useT'

interface StatProps {
  value: number
  suffix: string
  unit: string
  label: string
  run: boolean
  animate: boolean
}

function Stat({ value, suffix, unit, label, run, animate }: StatProps) {
  const current = useCountUp(value, run, animate)
  return (
    <li className="py-6 sm:px-8 sm:first:pl-0 sm:last:pr-0">
      <p className="font-mono text-5xl font-bold tracking-tight">
        <span aria-hidden="true">
          {current}
          {suffix}
        </span>
        <span className="sr-only">
          {value}
          {suffix}
        </span>
        {unit && <span className="ml-2 text-xl font-medium text-accent">{unit}</span>}
      </p>
      <p className="mt-2 max-w-[16rem] text-muted">{label}</p>
    </li>
  )
}

export function Stats() {
  const { t } = useT()
  const reduced = useReducedMotion()
  const [ref, inView] = useInView<HTMLUListElement>({ threshold: 0.4 })

  return (
    <section aria-label={t.stats.label} className="wrap pb-16">
      <ul
        ref={ref}
        className="grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {stats.map(({ id, value, suffix }) => (
          <Stat
            key={id}
            value={value}
            suffix={suffix}
            unit={t.stats.items[id].unit}
            label={t.stats.items[id].label}
            run={inView}
            animate={!reduced}
          />
        ))}
      </ul>
    </section>
  )
}
