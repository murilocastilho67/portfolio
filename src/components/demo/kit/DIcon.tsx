import type { ReactNode } from 'react'

const paths = {
  bot: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 3v4M9 12.5v1M15 12.5v1M9.5 16.5h5" />
    </>
  ),
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  route: (
    <>
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M8 18h6.5a3 3 0 0 0 0-6h-5a3 3 0 0 1 0-6H16" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7" />
      <circle cx="7" cy="17.5" r="2" />
      <circle cx="17" cy="17.5" r="2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c0-3.2 2.7-5.2 6-5.2s6 2 6 5.2M16 5.2a3 3 0 0 1 0 5.6M18 14.2c1.8.6 3 2.2 3 4.8" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  bell: <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5h4" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
  chevronR: <path d="m9 5 7 7-7 7" />,
  chevronD: <path d="m5 9 7 7 7-7" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  file: (
    <>
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M9 12.5h6M9 16h6" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  kanban: <path d="M4 4h4.5v16H4zM9.8 4h4.5v10H9.8zM15.5 4H20v13h-4.5z" />,
  chart: <path d="M4 20V4M4 20h16M8 16v-4M12.5 16V8M17 16v-6" />,
  inbox: <path d="M4 13.5 6.5 5h11L20 13.5V19H4zM4 13.5h4.5l1 2.5h5l1-2.5H20" />,
  tree: (
    <>
      <rect x="9" y="3.5" width="6" height="4" rx="1" />
      <rect x="3" y="16.5" width="6" height="4" rx="1" />
      <rect x="15" y="16.5" width="6" height="4" rx="1" />
      <path d="M12 7.5v4.5M6 16.5V12h12v4.5" />
    </>
  ),
  scale: <path d="M12 4v16M6 20h12M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z" />,
  panel: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9.5 4.5v15" />
    </>
  ),
  alert: <path d="M12 4 2.8 19.5h18.4zM12 10v4.5M12 17.2v.01" />,
  send: <path d="m4 12 16-8-5.5 16-2.8-6.2z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  grip: <path d="M9 6v.01M9 12v.01M9 18v.01M15 6v.01M15 12v.01M15 18v.01" />,
  bank: <path d="M3.5 9 12 4l8.5 5zM6 10.5v7M10 10.5v7M14 10.5v7M18 10.5v7M4 20h16" />,
} satisfies Record<string, ReactNode>

export type DIconName = keyof typeof paths

/** Ícone de traço da interface da demo; herda a cor por currentColor. */
export function DIcon({
  name,
  className = 'dm-icon',
  filled = false,
}: {
  name: DIconName
  className?: string
  filled?: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  )
}
