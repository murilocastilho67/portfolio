import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useReducedMotion } from '../../../../hooks/useReducedMotion'
import { DIcon } from '../../kit/DIcon'
import { useCopy } from '../../kit/lib'
import { Chip } from '../../kit/primitives'
import { platformCopy } from '../platform.copy'
import { sources, type PanelId, type QuestionId, type Role } from '../platform.data'

interface Message {
  id: number
  question: string
  words: readonly string[]
  /** Quantas palavras já apareceram (efeito de digitação). */
  shown: number
  sources: readonly PanelId[]
}

const WORD_MS = 32
const questionIds: readonly QuestionId[] = ['q1', 'q2', 'q3']

/** Chat com respostas prontas que "digitam" e citam os painéis liberados para o perfil. */
export function PlatformChat({ role }: { role: Role }) {
  const copy = useCopy(platformCopy)
  const reduced = useReducedMotion()
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  const last = messages.at(-1)
  const streaming = last !== undefined && last.shown < last.words.length

  useEffect(() => {
    if (!streaming) return
    const timer = window.setInterval(() => {
      setMessages((all) =>
        all.map((m, i) => (i === all.length - 1 ? { ...m, shown: m.shown + 1 } : m)),
      )
    }, WORD_MS)
    return () => window.clearInterval(timer)
  }, [streaming])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages])

  function ask(question: string, answer: string, cited: readonly PanelId[]) {
    if (streaming) return
    const words = answer.split(' ')
    setMessages((all) => [
      ...all,
      { id: nextId.current++, question, words, shown: reduced ? words.length : 0, sources: cited },
    ])
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    ask(text, copy.chat.demoOnly, [])
  }

  return (
    <div className="pl-chat">
      <div className="pl-log" data-lenis-prevent>
        <div className="pl-bubble pl-bubble--bot">
          <DIcon name="bot" />
          <p>{copy.chat.hello}</p>
        </div>
        {messages.map((message, index) => {
          const done = message.shown >= message.words.length
          const isLast = index === messages.length - 1
          return (
            <div key={message.id} className="pl-exchange">
              <p className="pl-bubble pl-bubble--me">
                <span className="sr-only">{copy.chat.you}: </span>
                {message.question}
              </p>
              <div className="pl-bubble pl-bubble--bot" aria-busy={isLast && !done}>
                <DIcon name="bot" />
                <div>
                  <span className="sr-only">{copy.chat.assistant}: </span>
                  <p>
                    {message.words.slice(0, message.shown).join(' ')}
                    {!done && <span className="pl-caret" aria-hidden="true" />}
                  </p>
                  {done && (
                    <p className="pl-sources">
                      <span className="dm-muted">{copy.chat.sources}:</span>
                      {message.sources.length === 0 ? (
                        <span className="dm-muted">{copy.chat.noSources}</span>
                      ) : (
                        message.sources.map((id) => (
                          <Chip key={id} tone="blue">
                            {copy.panelNames[id]}
                          </Chip>
                        ))
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <p role="status" className="sr-only">
          {last && !streaming ? copy.chat.done : ''}
        </p>
        <div ref={endRef} />
      </div>
      <div className="pl-compose">
        <div role="group" aria-label={copy.chat.suggested} className="dm-filters">
          {questionIds.map((id) => (
            <button
              key={id}
              type="button"
              className="dm-fchip"
              aria-pressed={false}
              disabled={streaming}
              onClick={() =>
                ask(copy.chat.questions[id], copy.chat.answers[id][role], sources[id][role])
              }
            >
              {copy.chat.questions[id]}
            </button>
          ))}
        </div>
        <form className="pl-form" onSubmit={submit}>
          <label className="dm-field pl-input">
            <span className="sr-only">{copy.chat.inputLabel}</span>
            <input
              type="text"
              value={draft}
              maxLength={200}
              placeholder={copy.chat.inputPlaceholder}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="dm-btn dm-btn--primary"
            disabled={streaming || !draft.trim()}
          >
            <DIcon name="send" />
            {copy.chat.send}
          </button>
        </form>
      </div>
    </div>
  )
}
