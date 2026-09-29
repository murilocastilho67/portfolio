import { useT } from '../i18n/useT'
import { Icon, type IconName } from './Icon'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

const icons: readonly IconName[] = ['database', 'bolt', 'code', 'rocket']

export function About() {
  const { t } = useT()

  return (
    <section id="sobre" aria-labelledby="sobre-title" className="wrap py-16 sm:py-24">
      <SectionHeader id="sobre" headingId="sobre-title" />
      <Reveal>
        <p className="mb-10 max-w-2xl text-lg text-text/80">{t.about.lede}</p>
      </Reveal>
      <ul className="grid gap-4 sm:grid-cols-2">
        {t.about.cards.map((card, i) => (
          <li key={card.title}>
            <Reveal
              delay={i * 70}
              className="card h-full p-6 transition-colors hover:border-accent/50"
            >
              <span className="mb-5 inline-flex size-11 items-center justify-center rounded-md bg-accent-soft text-accent">
                <Icon name={icons[i] ?? 'code'} className="size-6" />
              </span>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">{card.title}</h3>
              <p className="text-muted">{card.text}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
