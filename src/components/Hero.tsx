import { useMagnetic } from '../hooks/useMagnetic'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTyping } from '../hooks/useTyping'
import { GITHUB_PROJECTS_URL } from '../data/links'
import { useT } from '../i18n/useT'
import { track } from '../lib/analytics'
import { ExternalLink } from './ExternalLink'
import { KineticText } from './KineticText'
import { Terminal } from './Terminal'

/** `booting`: a abertura em tela cheia está por cima; o título só decodifica depois dela. */
export function Hero({ booting }: { booting: boolean }) {
  const { t } = useT()
  const reduced = useReducedMotion()
  const role = useTyping(t.hero.roles, { loop: true, animate: !reduced })
  const ctaRef = useMagnetic<HTMLDivElement>()

  return (
    <section id="inicio" className="wrap pt-12 pb-16 sm:pt-16 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div>
          <p className="mb-6 inline-flex max-w-full items-center rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-[13px]">
            <span className="truncate">
              <span className="text-ok">murilo@castilho</span>
              <span className="text-muted">:~$</span> {t.hero.whoami}
            </span>
            <span className="ml-1 animate-blink text-accent" aria-hidden="true">
              ▌
            </span>
          </p>

          {/* O nome responde ao "whoami" acima; o destaque grande é o que ele faz. */}
          <h1>
            <span className="mb-4 flex items-center gap-3 text-xl font-semibold tracking-tight text-text/90 sm:text-2xl">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              {t.hero.name}
            </span>
            <span className="block text-[clamp(2.25rem,5.4vw,3.3rem)] leading-[1.02] font-bold tracking-tighter">
              <KineticText text={t.hero.headline1} className="block" hold={booting} />
              <KineticText text={t.hero.headline2} className="block text-accent" hold={booting} />
            </span>
          </h1>

          <p className="mt-6 min-h-8 font-mono text-base text-accent sm:text-xl">
            <span aria-hidden="true">
              {'> '}
              {role.text}
              <span className="animate-blink">_</span>
            </span>
            <span className="sr-only">
              {t.hero.rolesLabel}: {t.hero.roles.join(', ')}
            </span>
          </p>

          <p className="mt-5 max-w-xl text-lg text-text/80">{t.hero.lede}</p>

          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[13px]">
            <span className="size-2.5 animate-pulse-ring rounded-full bg-ok" aria-hidden="true" />
            {t.hero.status}
          </p>

          <div ref={ctaRef} className="mt-8 flex flex-wrap gap-3">
            <a href="#projetos" className="btn btn-primary">
              {t.hero.ctaProjects}
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </a>
            <ExternalLink
              href={GITHUB_PROJECTS_URL}
              className="btn btn-secondary"
              onClick={() => track('open_github')}
            >
              {t.hero.ctaGithub}
              <span className="btn-arrow btn-arrow-up" aria-hidden="true">
                ↗
              </span>
            </ExternalLink>
            <a href="#contato" className="btn btn-ghost">
              {t.hero.ctaContact}
            </a>
          </div>
        </div>

        <Terminal />
      </div>
    </section>
  )
}
