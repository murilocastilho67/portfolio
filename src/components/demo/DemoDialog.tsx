import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import { createPortal } from 'react-dom'
import type { ProjectId } from '../../data/projects'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useT } from '../../i18n/useT'
import { MORPH_CARD, MORPH_TAG } from '../../lib/morph'
import { DIcon } from './kit/DIcon'
import { apps } from './registry'
import { DemoContext, type DemoAppProps } from './kit/context'
import { useKit } from './kit/lib'
import './demo.css'

interface DemoDialogProps {
  project: ProjectId
  /** App já carregado (ver `loadApp`). */
  App: ComponentType<DemoAppProps>
  /** Retângulo do botão de onde a janela "cresce" quando não há morph do card; null = sem essa animação. */
  origin: DOMRect | null
  /** Durante a View Transition a janela e a barra de endereço levam os nomes do elemento compartilhado. */
  morphing: boolean
  onClose: () => void
}

/** Janela modal em tela grande com o app fictício dentro (tela cheia no celular). */
export default function DemoDialog({ project, App, origin, morphing, onClose }: DemoDialogProps) {
  const { t } = useT()
  const kit = useKit()
  const reduced = useReducedMotion()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const escapes = useRef<(() => void)[]>([])
  const [run, setRun] = useState(0)
  const { path } = apps[project]

  const onEscape = useCallback(() => {
    const top = escapes.current.at(-1)
    if (top) top()
    else onClose()
  }, [onClose])

  const context = useMemo(
    () => ({
      pushEscape: (handler: () => void) => {
        escapes.current.push(handler)
        return () => {
          escapes.current = escapes.current.filter((h) => h !== handler)
        }
      },
    }),
    [],
  )

  useFocusTrap(panelRef, true, onEscape)
  useScrollLock(true)

  // Sem morph do card, a janela cresce a partir do botão; sem animação com redução de movimento.
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (reduced || !origin || !panel) return
    const box = panel.getBoundingClientRect()
    const dx = origin.left + origin.width / 2 - (box.left + box.width / 2)
    const dy = origin.top + origin.height / 2 - (box.top + box.height / 2)
    panel.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 460, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    )
    // Só na abertura.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [])

  return createPortal(
    // data-lenis-prevent: com o Lenis pausado (scroll lock), ele cancela todo gesto de rolagem fora
    // de áreas marcadas; sem isso, toque e roda não rolam nada dentro da demo.
    <div
      role="presentation"
      data-lenis-prevent
      className="dm-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <DemoContext.Provider value={context}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="dm-window demo-app"
          style={morphing ? { viewTransitionName: MORPH_CARD } : undefined}
        >
          <h2 id={titleId} className="sr-only">
            {t.projects.items[project].title}
          </h2>
          <div className="dm-chrome">
            <span className="dm-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span
              className="dm-address"
              style={morphing ? { viewTransitionName: MORPH_TAG } : undefined}
            >
              <DIcon name="lock" />
              <span>sistema.demo/{path}</span>
            </span>
            <button
              type="button"
              className="dm-iconbtn"
              aria-label={kit.closeDemo}
              onClick={onClose}
            >
              <DIcon name="x" />
            </button>
          </div>
          <p className="dm-banner">{kit.banner}</p>
          <div className="dm-stage">
            <App key={run} onReset={() => setRun((n) => n + 1)} />
          </div>
        </div>
      </DemoContext.Provider>
    </div>,
    document.body,
  )
}
