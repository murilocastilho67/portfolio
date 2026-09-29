import { useState, type FormEvent } from 'react'
import { useCopy } from '../../kit/lib'
import { routesCopy } from '../routes.copy'
import { nodeIds, type Change, type NodeId, type Route } from '../routes.data'

interface RequestFormProps {
  id: string
  route: Route
  onSubmit: (changes: Change[], note: string) => void
}

/** Formulário do pedido de alteração: horário de uma parada, novo dia e/ou nova parada. */
export function RequestForm({ id, route, onSubmit }: RequestFormProps) {
  const copy = useCopy(routesCopy)
  const { form } = copy
  const [stop, setStop] = useState(0)
  const [time, setTime] = useState(route.stops[0].time)
  const [day, setDay] = useState('')
  const [node, setNode] = useState('')
  const [after, setAfter] = useState(0)
  const [nodeTime, setNodeTime] = useState('12:00')
  const [note, setNote] = useState('')
  const [error, setError] = useState(false)

  const offDays = route.days.flatMap((on, i) => (on ? [] : [i]))
  const freeNodes = nodeIds.filter((n) => !route.stops.some((s) => s.code === n))

  function submit(event: FormEvent) {
    event.preventDefault()
    const changes: Change[] = []
    const current = route.stops[stop]
    if (time && time !== current.time) {
      changes.push({ kind: 'time', stop, code: current.code, from: current.time, to: time })
    }
    if (day !== '') changes.push({ kind: 'day', day: Number(day) })
    if (node && nodeTime)
      changes.push({ kind: 'stop', code: node as NodeId, after, time: nodeTime })
    if (changes.length === 0) {
      setError(true)
      return
    }
    onSubmit(changes, note.trim())
  }

  return (
    <form id={id} onSubmit={submit} className="rt-form" noValidate>
      <p className="dm-muted">{form.intro}</p>

      <fieldset className="rt-fieldset">
        <legend>{form.timeSection}</legend>
        <label className="dm-field">
          <span>{form.stop}</span>
          <select
            value={stop}
            onChange={(event) => {
              const next = Number(event.target.value)
              setStop(next)
              setTime(route.stops[next].time)
            }}
          >
            {route.stops.map((s, i) => (
              <option key={i} value={i}>
                {copy.drawer.stopN(i + 1)} · {s.code} · {s.time}
              </option>
            ))}
          </select>
        </label>
        <label className="dm-field">
          <span>{form.newTime}</span>
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
      </fieldset>

      <fieldset className="rt-fieldset">
        <legend>{form.daySection}</legend>
        {offDays.length === 0 ? (
          <p className="dm-muted">{form.fullWeek}</p>
        ) : (
          <label className="dm-field">
            <span>{form.addDay}</span>
            <select value={day} onChange={(event) => setDay(event.target.value)}>
              <option value="">{form.none}</option>
              {offDays.map((i) => (
                <option key={i} value={i}>
                  {copy.days.long[i]}
                </option>
              ))}
            </select>
          </label>
        )}
      </fieldset>

      <fieldset className="rt-fieldset">
        <legend>{form.stopSection}</legend>
        <label className="dm-field">
          <span>{form.node}</span>
          <select value={node} onChange={(event) => setNode(event.target.value)}>
            <option value="">{form.none}</option>
            {freeNodes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {node && (
          <div className="rt-row2">
            <label className="dm-field">
              <span>{form.after}</span>
              <select value={after} onChange={(event) => setAfter(Number(event.target.value))}>
                {route.stops.slice(0, -1).map((s, i) => (
                  <option key={i} value={i}>
                    {copy.drawer.stopN(i + 1)} · {s.code}
                  </option>
                ))}
              </select>
            </label>
            <label className="dm-field">
              <span>{form.stopTime}</span>
              <input
                type="time"
                value={nodeTime}
                onChange={(event) => setNodeTime(event.target.value)}
              />
            </label>
          </div>
        )}
      </fieldset>

      <label className="dm-field">
        <span>{form.note}</span>
        <textarea
          value={note}
          maxLength={200}
          placeholder={form.notePlaceholder}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="dm-error">
          {form.errorEmpty}
        </p>
      )}
    </form>
  )
}
