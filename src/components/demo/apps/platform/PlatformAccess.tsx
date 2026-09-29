import { useState } from 'react'
import { DataTable, type Column } from '../../kit/DataTable'
import { useCopy } from '../../kit/lib'
import { Switch } from '../../kit/primitives'
import { platformCopy } from '../platform.copy'
import { tools, users, type Role, type ToolId, type UserRow } from '../platform.data'

/** Matriz perfil × ferramenta com interruptores; só a Diretoria pode editar. */
export function PlatformAccess({
  role,
  onToast,
}: {
  role: Role
  onToast: (message: string) => void
}) {
  const copy = useCopy(platformCopy)
  const [grants, setGrants] = useState<Record<string, readonly ToolId[]>>(() =>
    Object.fromEntries(users.map((user) => [user.id, user.access])),
  )
  const editable = role === 'director'

  function toggle(userId: string, tool: ToolId, on: boolean) {
    setGrants((all) => ({
      ...all,
      [userId]: on ? [...all[userId], tool] : all[userId].filter((t) => t !== tool),
    }))
    const label = copy.tools[tool]
    onToast((on ? copy.access.granted : copy.access.revoked)(label, copy.users[userId]))
  }

  const columns: Column<UserRow>[] = [
    {
      key: 'user',
      header: copy.access.user,
      cell: (user) => <span className="dm-strong">{copy.users[user.id]}</span>,
    },
    ...tools.map<Column<UserRow>>((tool) => ({
      key: tool,
      header: copy.toolsShort[tool],
      align: 'center',
      cell: (user) => (
        <Switch
          checked={grants[user.id].includes(tool)}
          disabled={!editable}
          label={copy.access.toggle(copy.tools[tool], copy.users[user.id])}
          onChange={(on) => toggle(user.id, tool, on)}
        />
      ),
    })),
  ]

  return (
    <>
      <p className="dm-muted" style={{ marginBottom: 10 }}>
        {copy.access.lede} {!editable && <strong>{copy.access.readOnly}</strong>}
      </p>
      <DataTable caption={copy.access.title} rows={users} columns={columns} rowKey={(u) => u.id} />
    </>
  )
}
