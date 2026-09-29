import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTyping } from '../hooks/useTyping'
import { useT } from '../i18n/useT'
import { ask, AskError, type AskErrorCode, type AskSource } from '../lib/ask'
import { emitAppEvent } from '../lib/appEvents'
import { track } from '../lib/analytics'
import { parseCommand, type OutputId } from '../lib/commands'
import { outputLines, type DynamicId, type TermLine } from '../lib/extras'
import { scrollToSection } from '../lib/scroll'
import { setTheme } from '../lib/theme'

interface AskState {
  status: 'searching' | 'streaming' | 'done' | 'error'
  count: number
  sources: AskSource[]
  answer: string
  error: AskErrorCode | null
}

type HistoryEntry =
  | { id: number; kind: 'output'; command: string; output: OutputId | DynamicId }
  | { id: number; kind: 'ask'; command: string; ask: AskState }

function lineTone(line: string): string {
  if (line.startsWith('✓')) return 'text-ok'
  if (line.startsWith('✗')) return 'text-accent'
  if (line.startsWith('↳')) return 'text-muted'
  return 'text-text/90'
}

function OutputLines({ lines }: { lines: readonly TermLine[] }) {
  return lines.map((line, i) =>
    typeof line === 'string' ? (
      <p key={i} className={`break-words whitespace-pre-wrap ${lineTone(line)}`}>
        {line}
      </p>
    ) : (
      <p key={i} className="break-words whitespace-pre-wrap text-text/90">
        <span className="text-accent">{line.accent}</span>
        {line.text}
      </p>
    ),
  )
}

const Cursor = () => (
  <span className="animate-blink text-accent" aria-hidden="true">
    ▌
  </span>
)

/** Resposta do assistente: linhas de progresso, texto em stream e fontes clicáveis. */
function AskOutput({ state }: { state: AskState }) {
  const { t } = useT()
  const labels = t.terminal.ask
  const working = state.status === 'searching' || state.status === 'streaming'
  const progress = [labels.searching]
  if (state.sources.length > 0) {
    progress.push(
      state.count === 1 ? labels.foundOne : labels.foundMany.replace('{n}', String(state.count)),
    )
  }

  return (
    <>
      <OutputLines lines={progress} />
      {(state.answer || working) && (
        <p className="break-words whitespace-pre-wrap text-text/90">
          {state.answer}
          {working && <Cursor />}
        </p>
      )}
      {state.error && <OutputLines lines={[labels.errors[state.error]]} />}
      {state.status === 'done' && state.sources.length > 0 && (
        <p className="break-words">
          <span className="text-muted">{labels.sources}</span>{' '}
          {state.sources.map((source, i) => (
            <Fragment key={source.label}>
              {i > 0 && <span className="text-muted">, </span>}
              <button
                type="button"
                onClick={() => scrollToSection(source.id)}
                aria-label={`${labels.sourceLabel}: ${source.label}`}
                className="cursor-pointer rounded-sm text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
              >
                {source.label}
              </button>
            </Fragment>
          ))}
        </p>
      )}
    </>
  )
}

const Prompt = () => (
  <span className="text-accent" aria-hidden="true">
    ${' '}
  </span>
)

export function Terminal() {
  const { t, lang, setLang } = useT()
  const reduced = useReducedMotion()
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const restoreFocus = useRef(false)
  const nextId = useRef(0)
  const [revealed, setRevealed] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [cleared, setCleared] = useState(false)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const demoPhrases = useMemo(() => [t.terminal.demoCommand], [t.terminal.demoCommand])
  const typing = useTyping(demoPhrases, { animate: !reduced })
  const demoLines = t.terminal.demoLines
  const shown = reduced ? demoLines.length : revealed
  const ready = typing.done && shown >= demoLines.length

  // Após digitar o comando da demo, revela as linhas de resposta uma a uma.
  useEffect(() => {
    if (reduced || !typing.done || revealed >= demoLines.length) return
    const timer = window.setTimeout(() => setRevealed((n) => n + 1), revealed === 0 ? 500 : 800)
    return () => window.clearTimeout(timer)
  }, [reduced, typing.done, revealed, demoLines.length])

  useEffect(() => {
    const body = bodyRef.current
    if (body) body.scrollTop = body.scrollHeight
  }, [history, shown, cleared])

  // Sai da tela com pergunta em andamento: cancela a requisição.
  useEffect(() => {
    const pending = abortRef
    return () => pending.current?.abort()
  }, [])

  // O input desabilitado perde o foco; ao terminar a resposta de uma pergunta digitada, ele volta.
  useEffect(() => {
    if (!busy && restoreFocus.current) {
      restoreFocus.current = false
      inputRef.current?.focus()
    }
  }, [busy])

  function runAsk(command: string, question: string, source: 'terminal' | 'chip') {
    track('ask_question', { source })
    const controller = new AbortController()
    abortRef.current = controller
    const id = nextId.current++
    const patch = (update: (state: AskState) => AskState) =>
      setHistory((prev) =>
        prev.map((entry) =>
          entry.id === id && entry.kind === 'ask' ? { ...entry, ask: update(entry.ask) } : entry,
        ),
      )

    setBusy(true)
    setHistory((prev) => [
      ...prev,
      {
        id,
        kind: 'ask',
        command,
        ask: { status: 'searching', count: 0, sources: [], answer: '', error: null },
      },
    ])

    ask(question, lang, controller.signal, {
      onSources: (count, sources) => patch((s) => ({ ...s, status: 'streaming', count, sources })),
      onDelta: (text) => patch((s) => ({ ...s, answer: s.answer + text })),
    })
      .then(() => patch((s) => ({ ...s, status: 'done' })))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const code = error instanceof AskError ? error.code : 'network'
        patch((s) => ({ ...s, status: 'error', error: code }))
      })
      .finally(() => {
        if (abortRef.current !== controller) return
        abortRef.current = null
        setBusy(false)
      })
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    const result = parseCommand(value)
    setValue('')
    if (!result) return

    if (result.type === 'clear') {
      abortRef.current?.abort()
      abortRef.current = null
      setBusy(false)
      setCleared(true)
      setHistory([])
      return
    }
    if (result.type === 'ask') {
      restoreFocus.current = true
      runAsk(value.trim(), result.question, 'terminal')
      return
    }
    if (result.lang) setLang(result.lang)
    if (result.theme) setTheme(result.theme)
    if (result.effect) emitAppEvent(result.effect)
    if (result.section) scrollToSection(result.section)
    setHistory((prev) => [
      ...prev,
      { id: nextId.current++, kind: 'output', command: value.trim(), output: result.output },
    ])
  }

  return (
    <div className="card theme-dark-island overflow-hidden shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9),0_0_60px_-20px_rgb(242_169_59/0.25)]">
      <div className="flex h-10 items-center gap-2 border-b border-line bg-surface-2 px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto pr-10 font-mono text-xs text-muted">ask.py</span>
      </div>

      {/* tabIndex: região rolável precisa ser alcançável por teclado (WCAG 2.1.1). */}
      <div
        ref={bodyRef}
        role="region"
        aria-label={t.terminal.bodyLabel}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        data-lenis-prevent
        className="h-[21rem] overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
      >
        {!cleared && (
          <p className="break-words">
            <Prompt />
            <span className="text-text">ask</span>{' '}
            <span className="text-text/90">
              &quot;{typing.text}
              {typing.done ? '"' : <span className="animate-blink text-accent">▌</span>}
            </span>
          </p>
        )}

        {/* aria-busy: o leitor de tela espera o fim do stream e lê a resposta uma vez só. */}
        <div aria-live="polite" aria-busy={busy}>
          {!cleared && <OutputLines lines={demoLines.slice(0, shown)} />}
          {history.map((entry) => (
            <div key={entry.id} className="mt-2">
              <p className="break-words">
                <Prompt />
                <span className="text-text">{entry.command}</span>
              </p>
              {entry.kind === 'ask' ? (
                <AskOutput state={entry.ask} />
              ) : (
                <OutputLines lines={outputLines(t, entry.output)} />
              )}
            </div>
          ))}
        </div>

        {ready && (
          <form
            onSubmit={onSubmit}
            className="mt-2 flex items-center gap-2 rounded-sm outline-offset-4 outline-accent has-[input:focus-visible]:outline-2"
          >
            <Prompt />
            <label htmlFor="terminal-input" className="sr-only">
              {t.terminal.inputLabel}
            </label>
            <input
              ref={inputRef}
              id="terminal-input"
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={busy}
              placeholder={t.terminal.placeholder}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              className="min-h-8 min-w-0 flex-1 bg-transparent text-base text-text caret-accent placeholder:text-muted focus-visible:outline-none disabled:cursor-progress sm:text-[13px]"
            />
          </form>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line p-3">
        <span className="sr-only">{t.terminal.chipsLabel}</span>
        {t.terminal.chips.map((question) => (
          <button
            key={question}
            type="button"
            disabled={!ready || busy}
            onClick={() => runAsk(`ask "${question}"`, question, 'chip')}
            className="min-h-11 cursor-pointer rounded-md border border-line bg-surface px-3 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-text disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-9"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
