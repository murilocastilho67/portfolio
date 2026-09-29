import { useEffect, useState } from 'react'
import { EMAIL, GITHUB_PERSONAL_URL, GITHUB_PROJECTS_URL, LINKEDIN_URL } from '../data/links'
import { useMagnetic } from '../hooks/useMagnetic'
import { useT } from '../i18n/useT'
import { copyText } from '../lib/clipboard'
import { ExternalLink } from './ExternalLink'
import { Icon } from './Icon'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

function CopyButton() {
  const { t } = useT()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy() {
    if (await copyText(EMAIL)) setCopied(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={t.contact.copyAria}
        className={`btn min-w-32 ${copied ? 'border-ok/50 bg-ok/10 text-ok' : 'btn-secondary'}`}
      >
        <Icon name={copied ? 'check' : 'copy'} className="size-4" />
        {copied ? t.contact.copied : t.contact.copy}
      </button>
      <span role="status" className="sr-only">
        {copied ? t.contact.copiedStatus : ''}
      </span>
    </>
  )
}

const links = [
  { key: 'linkedin', href: LINKEDIN_URL },
  { key: 'githubProjects', href: GITHUB_PROJECTS_URL },
  { key: 'githubPersonal', href: GITHUB_PERSONAL_URL },
] as const

export function Contact() {
  const { t } = useT()
  const copyRef = useMagnetic<HTMLDivElement>()

  return (
    <section id="contato" aria-labelledby="contato-title" className="wrap py-16 sm:py-24">
      <SectionHeader id="contato" headingId="contato-title" />

      <Reveal>
        <p className="mb-8 max-w-2xl text-lg text-text/80">{t.contact.lede}</p>

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href={`mailto:${EMAIL}`}
            className="font-mono text-[clamp(1.05rem,4.6vw,2rem)] font-bold tracking-tight break-all text-text underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent"
          >
            {EMAIL}
          </a>
          <div ref={copyRef}>
            <CopyButton />
          </div>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {links.map(({ key, href }) => (
            <li key={key}>
              <ExternalLink
                href={href}
                className="row-link group flex min-h-16 items-center justify-between gap-4 py-4 text-xl font-semibold tracking-tight sm:text-2xl"
              >
                <span className="row-link-label">{t.contact.links[key]}</span>
                <Icon name="arrow" className="row-link-arrow size-6 shrink-0 text-accent" />
              </ExternalLink>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
