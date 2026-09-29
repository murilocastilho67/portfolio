import { useRef, useState, type ComponentType } from 'react'
import { flushSync } from 'react-dom'
import type { ProjectId } from '../data/projects'
import { useT } from '../i18n/useT'
import { track } from '../lib/analytics'
import { canMorph, morph, nameCard } from '../lib/morph'
import { Icon } from './Icon'
import { loadApp } from './demo/registry'
import type { DemoAppProps } from './demo/kit/context'

const loadDialog = () => import('./demo/DemoDialog')

/** Carrega o diálogo e o app do projeto (dois chunks) de uma vez. */
async function loadDemo(project: ProjectId) {
  const dialog = await loadDialog()
  return { Dialog: dialog.default, App: await loadApp(project) }
}

interface Loaded {
  Dialog: Awaited<ReturnType<typeof loadDemo>>['Dialog']
  App: ComponentType<DemoAppProps>
}

/**
 * Botão do card que abre a demonstração interativa. Os chunks carregam ANTES de abrir (ao passar o
 * mouse/foco, e o clique espera o que faltar), assim o snapshot novo da transição já tem o app pronto.
 * Com View Transitions o próprio card vira a janela e volta a ser o card ao fechar.
 */
export function DemoButton({ project, title }: { project: ProjectId; title: string }) {
  const { t } = useT()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const busy = useRef(false)
  const [demo, setDemo] = useState<Loaded | null>(null)
  const [origin, setOrigin] = useState<DOMRect | null>(null)
  /** A janela carrega o nome da transição só enquanto ela roda. */
  const [named, setNamed] = useState(false)

  const card = () => buttonRef.current?.closest('article') ?? null

  async function openDemo() {
    if (busy.current) return
    busy.current = true
    track('open_demo', { project })
    try {
      const loaded = await loadDemo(project)
      const source = card()
      if (canMorph(source)) {
        nameCard(source, true)
        await morph(() => {
          nameCard(source, false)
          flushSync(() => {
            setOrigin(null)
            setNamed(true)
            setDemo(loaded)
          })
        }, false)
        setNamed(false)
      } else {
        // Sem morph: a janela cresce a partir do botão (a própria janela cuida da redução de movimento).
        setOrigin(buttonRef.current?.getBoundingClientRect() ?? null)
        setDemo(loaded)
      }
    } catch {
      // chunk que falhou ao carregar: o botão segue livre para tentar de novo
    } finally {
      busy.current = false
    }
  }

  async function closeDemo() {
    if (busy.current) return
    busy.current = true
    const target = card()
    if (canMorph(target)) {
      flushSync(() => setNamed(true))
      await morph(() => {
        flushSync(() => {
          setNamed(false)
          setDemo(null)
        })
        nameCard(target, true)
      }, true)
      nameCard(target, false)
    } else {
      setDemo(null)
    }
    busy.current = false
  }

  const preload = () => void loadDemo(project).catch(() => undefined)

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-secondary mb-5 self-start"
        aria-haspopup="dialog"
        aria-label={`${t.projects.demoOpen}: ${title}`}
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => void openDemo()}
      >
        {t.projects.demoOpen}
        <Icon name="arrow" className="btn-arrow size-4" />
      </button>
      {demo && (
        <demo.Dialog
          project={project}
          App={demo.App}
          origin={origin}
          morphing={named}
          onClose={() => void closeDemo()}
        />
      )}
    </>
  )
}
