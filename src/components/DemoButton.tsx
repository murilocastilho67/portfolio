import { Suspense, lazy, useRef, useState } from 'react'
import type { ProjectId } from '../data/projects'
import { useT } from '../i18n/useT'
import { track } from '../lib/analytics'
import { Icon } from './Icon'

const loadDialog = () => import('./demo/DemoDialog')
const DemoDialog = lazy(loadDialog)

/** Botão do card que abre a demonstração interativa; o diálogo e os apps carregam sob demanda. */
export function DemoButton({ project, title }: { project: ProjectId; title: string }) {
  const { t } = useT()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [origin, setOrigin] = useState<DOMRect | null>(null)
  const [open, setOpen] = useState(false)

  function openDemo() {
    setOrigin(buttonRef.current?.getBoundingClientRect() ?? null)
    setOpen(true)
    track('open_demo', { project })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-secondary mb-5 self-start"
        aria-haspopup="dialog"
        aria-label={`${t.projects.demoOpen}: ${title}`}
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        onClick={openDemo}
      >
        {t.projects.demoOpen}
        <Icon name="arrow" className="btn-arrow size-4" />
      </button>
      {open && (
        <Suspense fallback={null}>
          <DemoDialog project={project} origin={origin} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
