import type { ReactNode } from 'react'

export type IconName =
  | 'database'
  | 'bolt'
  | 'code'
  | 'rocket'
  | 'bus'
  | 'truck'
  | 'cap'
  | 'arrow'
  | 'external'
  | 'copy'
  | 'check'
  | 'menu'
  | 'close'
  | 'search'
  | 'pause'
  | 'play'
  | 'linkedin'
  | 'github'
  | 'sun'
  | 'moon'

const paths: Record<IconName, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v6.5c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V5.5" />
      <path d="M4.5 12v6.5c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V12" />
    </>
  ),
  bolt: <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z" />,
  code: (
    <>
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
      <path d="m13.5 4-3 16" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 15 9 12c0-5 3.5-9 10-9 0 6.5-4 10-9 10z" />
      <path d="M9 12H5l-2 2 4 1M12 15v4l-2 2-1-4" />
      <circle cx="15" cy="9" r="1.2" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="3.5" width="16" height="14" rx="2.5" />
      <path d="M4 11h16M8 21v-3.5M16 21v-3.5" />
      <circle cx="8" cy="14.2" r=".6" />
      <circle cx="16" cy="14.2" r=".6" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7" />
      <circle cx="7" cy="17.5" r="2" />
      <circle cx="17" cy="17.5" r="2" />
    </>
  ),
  cap: (
    <>
      <path d="m12 4 10 5-10 5L2 9z" />
      <path d="M6 11.5v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v6" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  external: <path d="M7 17 17 7m0 0H8m9 0v9" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  pause: <path d="M8 5v14M16 5v14" />,
  play: <path d="M7 4.5v15l12-7.5z" />,
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5V16M8 7.8v.01M12 16v-5.5m0 2.2c0-1.4 1-2.2 2.2-2.2s1.8.9 1.8 2.3V16" />
    </>
  ),
  github: (
    <path d="M9 19c-4 1.3-4-2-5.5-2.5M14.5 21v-3a2.6 2.6 0 0 0-.7-2c2.7-.3 5.2-1.3 5.2-5.8a4.5 4.5 0 0 0-1.2-3.1 4.2 4.2 0 0 0-.1-3.1s-1-.3-3.3 1.2a11.400 11.400 0 0 0-6 0C6.100 3.700 5.100 4 5.100 4a4.200 4.200 0 0 0-.1 3.100A4.500 4.500 0 0 0 3.800 10.200c0 4.500 2.500 5.500 5.200 5.800a2.600 2.600 0 0 0-.7 2v3" />
  ),
}

interface IconProps {
  name: IconName
  className?: string
}

/** Ícone decorativo (aria-hidden) desenhado em traço, herda a cor via currentColor. */
export function Icon({ name, className = 'size-5' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
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
