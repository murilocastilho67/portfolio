import { alsoBuilt, projects } from '../data/projects'
import { useT } from '../i18n/useT'
import { ProjectCard } from './ProjectCard'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

export function Projects() {
  const { t } = useT()

  return (
    <section id="projetos" aria-labelledby="projetos-title" className="wrap py-16 sm:py-24">
      <SectionHeader id="projetos" headingId="projetos-title" />
      <Reveal>
        <p className="mb-10 max-w-3xl text-lg text-text/80">{t.projects.lede}</p>
      </Reveal>

      <ul className="grid gap-5 md:grid-cols-2">
        {projects.map((project, i) => (
          <li key={project.id}>
            <ProjectCard project={project} index={i} />
          </li>
        ))}
      </ul>

      <Reveal className="mt-16">
        <h3 className="eyebrow mb-4 text-accent">{t.projects.alsoTitle}</h3>
        <ul className="divide-y divide-line border-y border-line">
          {alsoBuilt.map(({ id, stack }) => {
            const item = t.projects.also[id]
            return (
              <li
                key={id}
                className="grid gap-x-6 gap-y-1 py-3.5 md:grid-cols-[1fr_auto] md:items-baseline"
              >
                <p>
                  <strong className="font-semibold">{item.name}</strong>
                  <span className="text-muted"> — {item.text}</span>
                </p>
                <p className="font-mono text-[13px] text-muted md:text-right">{stack}</p>
              </li>
            )
          })}
        </ul>
      </Reveal>
    </section>
  )
}
