import { stackGroups } from '../data/stack'
import { useT } from '../i18n/useT'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

export function Stack() {
  const { t } = useT()

  return (
    <section id="stack" aria-labelledby="stack-title" className="wrap py-16 sm:py-24">
      <SectionHeader id="stack" headingId="stack-title" />
      <div className="grid gap-4 lg:grid-cols-2">
        {stackGroups.map((group, i) => (
          <Reveal key={group.id} delay={i * 60} className="card p-6">
            <h3 className="eyebrow mb-4">{t.stack.groups[group.id]}</h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item} className="pill">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
        <Reveal
          delay={stackGroups.length * 60}
          className="card border-accent/40 bg-accent-soft p-6"
        >
          <h3 className="eyebrow mb-4 text-accent">{t.stack.building.title}</h3>
          <ul className="flex flex-wrap gap-2">
            {t.stack.building.items.map((item) => (
              <li key={item} className="pill pill-accent">
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
