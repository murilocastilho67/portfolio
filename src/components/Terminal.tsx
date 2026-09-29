import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTyping } from '../hooks/useTyping'
import { useT } from '../i18n/useT'
import { parseCommand, type OutputId } from '../lib/commands'
import { scrollToSection } from '../lib/scroll'

interface HistoryEntry {
  id: number
  command: string
  output: OutputId
}

function lineTone(line: string): string {
  if (line.startsWith('✓')) return 'text-ok'
  if (line.startsWith('↳')) return 'text-muted'
  return 'text-text/90'
}

function OutputLines({ lines }: { lines: readonly string[] }) {
  return lines.map((line, i) => (
    <p key={i} className={`break-words whitespace-pre-wrap ${lineTone(line)}`}>
      {line}
    </p>
  ))
}

const Prompt = () => (
  <span className="text-accent" aria-hidden="true">
    ${' '}
  </span>
)

export function Terminal() {
  const { t, setLang } = useT()
  const reduced = useReducedMotion()
  const bodyRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)
  const [revealed, setRevealed] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [cleared, setCleared] = useState(false)
  const [value, setValue] = useState('')

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
  }, [history.length, shown, cleared])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const result = parseCommand(value)
    setValue('')
    if (!result) return

    if (result.type === 'clear') {
      setCleared(true)
      setHistory([])
      return
    }
    if (result.lang) setLang(result.lang)
    if (result.section) scrollToSection(result.section)
    setHistory((prev) => [
      ...prev,
      { id: nextId.current++, command: value.trim(), output: result.output },
    ])
  }

  return (
    <div className="card overflow-hidden shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)]">
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

        <div aria-live="polite">
          {!cleared && <OutputLines lines={demoLines.slice(0, shown)} />}
          {history.map((entry) => (
            <div key={entry.id} className="mt-2">
              <p className="break-words">
                <Prompt />
                <span className="text-text">{entry.command}</span>
              </p>
              <OutputLines lines={t.terminal.out[entry.output]} />
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
              id="terminal-input"
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={t.terminal.placeholder}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              className="min-h-8 min-w-0 flex-1 bg-transparent text-base text-text caret-accent placeholder:text-muted focus-visible:outline-none sm:text-[13px]"
            />
          </form>
        )}
      </div>
    </div>
  )
}
