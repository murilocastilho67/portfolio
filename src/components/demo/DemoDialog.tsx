import {
  Suspense,
  lazy,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from 'react'
import { createPortal } from 'react-dom'
import type { ProjectId } from '../../data/projects'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useT } from '../../i18n/useT'
import { DIcon } from './kit/DIcon'
import { DemoContext, type DemoAppProps } from './kit/context'
import { useKit } from './kit/lib'
import './demo.css'

interface DemoApp {
  /** Trecho do endereço fictício exibido na barra do "navegador". */
  path: string
  Component: LazyExoticComponent<ComponentType<DemoAppProps>>
}

const apps: Record<ProjectId, DemoApp> = {
  platform: { path: 'portal', Component: lazy(() => import('./apps/PlatformDemo')) },
  routes: { path: 'rotas', Component: lazy(() => import('./apps/RoutesDemo')) },
  balance: { path: 'contabil', Component: lazy(() => import('./apps/BalanceDemo')) },
  payments: { path: 'pagamentos', Component: lazy(() => import('./apps/PaymentsDemo')) },
  planner: { path: 'planner', Component: lazy(() => import('./apps/PlannerDemo')) },
  crm: { path: 'cotacoes', Component: lazy(() => import('./apps/CrmDemo')) },
}

/** Esqueleto enquanto o chunk do app carrega. */
function Skeleton() {
  const kit = useKit()
  return (
    <div className="dm-skeleton" role="status" aria-label={kit.loading}>
      <div className="dm-sk-side" />
      <div className="dm-sk-main">
        <span className="dm-sk-bar" style={{ width: '38%' }} />
        <span className="dm-sk-bar" />
        <span className="dm-sk-bar" style={{ width: '82%' }} />
        <span className="dm-sk-bar" style={{ width: '64%' }} />
      </div>
    </div>
  )
}

interface DemoDialogProps {
  project: ProjectId
  /** Retângulo do botão que abriu, de onde a janela "cresce". */
  origin: DOMRect | null
  onClose: () => void
}

/** Janela modal em tela grande com o app fictício dentro (tela cheia no celular). */
export default function DemoDialog({ project, origin, onClose }: DemoDialogProps) {
  const { t } = useT()
  const kit = useKit()
  const reduced = useReducedMotion()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const escapes = useRef<(() => void)[]>([])
  const [run, setRun] = useState(0)
  const { path, Component } = apps[project]

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

  // A janela cresce a partir do botão do card; sem animação com redução de movimento.
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
    <div
      role="presentation"
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
            <span className="dm-address">
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
            <Suspense fallback={<Skeleton />}>
              <Component key={run} onReset={() => setRun((n) => n + 1)} />
            </Suspense>
          </div>
        </div>
      </DemoContext.Provider>
    </div>,
    document.body,
  )
}
