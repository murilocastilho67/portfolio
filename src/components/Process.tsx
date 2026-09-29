import { useT } from '../i18n/useT'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

export function Process() {
  const { t } = useT()

  return (
    <section id="processo" aria-labelledby="processo-title" className="wrap py-16 sm:py-24">
      <SectionHeader id="processo" headingId="processo-title" />

      <div className="relative">
        <span
          className="absolute top-[19px] right-[12%] left-[12%] hidden h-px bg-line md:block"
          aria-hidden="true"
        />
        <span
          className="absolute top-2 bottom-2 left-[19px] w-px bg-line md:hidden"
          aria-hidden="true"
        />
        <ol className="grid gap-8 md:grid-cols-4 md:gap-6">
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="relative pl-14 md:pl-0">
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 z-10 inline-flex size-10 items-center justify-center rounded-md border border-accent/50 bg-bg font-mono text-sm font-bold text-accent md:static md:mb-5"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <Reveal delay={i * 90}>
                <h3 className="mb-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="text-muted">{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      <Reveal className="mt-14">
        <p className="card border-l-2 border-l-accent p-6 text-lg leading-relaxed text-text/85">
          {t.process.closing}
        </p>
      </Reveal>
    </section>
  )
}
