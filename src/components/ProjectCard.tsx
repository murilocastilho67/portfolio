import type { Project } from '../data/projects'
import { useT } from '../i18n/useT'
import { Diagram } from './Diagram'
import { Reveal } from './Reveal'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t } = useT()
  const copy = t.projects.items[project.id]
  const diagramLabel = `${t.projects.diagramPrefix}: ${copy.steps.map((s) => s.replace('|', ' ')).join(' → ')}`

  return (
    <Reveal delay={(index % 2) * 80} className="h-full">
      <article className="card card-lift flex h-full flex-col p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-2 font-mono text-xs">
          <span className="tracking-wider text-accent uppercase">
            {String(index + 1).padStart(2, '0')} · {project.stack.join(' · ')}
          </span>
          <div className="flex min-h-6 items-center gap-3">
            {project.production && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-ok/40 bg-ok/10 px-2 py-0.5 text-ok">
                <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" />
                {t.projects.production}
              </span>
            )}
            <span className="ml-auto text-muted">#{copy.domain}</span>
          </div>
        </div>

        <h3 className="mb-3 text-2xl leading-tight font-semibold tracking-tight">{copy.title}</h3>
        <p className="mb-5 text-[15px] leading-relaxed text-muted">{copy.text}</p>

        <ul className="mb-6 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li key={tag} className="pill">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto rounded-md border border-line bg-bg/60 p-2 sm:p-3">
          <Diagram steps={copy.steps} label={diagramLabel} />
        </div>
      </article>
    </Reveal>
  )
}
