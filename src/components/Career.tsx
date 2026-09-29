import { careerItems, educationItems } from '../data/career'
import { useT } from '../i18n/useT'
import { Icon, type IconName } from './Icon'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

function IconTile({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <span
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-accent ${className}`}
    >
      <Icon name={name} className="size-6" />
    </span>
  )
}

export function Career() {
  const { t } = useT()

  return (
    <section id="carreira" aria-labelledby="carreira-title" className="wrap py-16 sm:py-24">
      <SectionHeader id="carreira" headingId="carreira-title" />
      <Reveal>
        <p className="mb-12 max-w-2xl text-lg text-text/80">{t.career.lede}</p>
      </Reveal>

      <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div className="relative">
          <span className="absolute top-2 bottom-2 left-[21px] w-px bg-line" aria-hidden="true" />
          <ol>
            {careerItems.map((item) => {
              const copy = t.career.items[item.id]
              return (
                <li key={item.id} className="relative pb-10 pl-16 last:pb-0">
                  <IconTile name={item.icon} className="absolute top-0 left-0" />
                  <Reveal>
                    <p className="font-mono text-sm text-accent">
                      {item.start} — {item.end ?? t.career.present}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{copy.role}</h3>
                    <p className="text-muted">{t.career.org[item.unit]}</p>
                    {copy.bullets.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {copy.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2.5 text-text/85">
                            <span
                              className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent"
                              aria-hidden="true"
                            />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Reveal>
                </li>
              )
            })}
          </ol>
        </div>

        <Reveal>
          <h3 className="eyebrow mb-6 text-accent">{t.career.educationTitle}</h3>
          <ul className="space-y-6">
            {educationItems.map((item) => {
              const copy = t.career.education[item.id]
              return (
                <li key={item.id} className="flex gap-4">
                  <IconTile name="cap" />
                  <div>
                    <p className="font-mono text-sm text-accent">
                      {item.start} — {item.end}
                    </p>
                    <p className="mt-1 font-semibold">{copy.course}</p>
                    <p className="text-muted">{copy.school}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
