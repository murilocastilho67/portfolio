import { useCallback, useEffect, useState } from 'react'
import { About } from './components/About'
import { Career } from './components/Career'
import { CommandPalette } from './components/CommandPalette'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Nav } from './components/Nav'
import { Process } from './components/Process'
import { Projects } from './components/Projects'
import { Stack } from './components/Stack'
import { Stats } from './components/Stats'
import { Toast } from './components/Toast'
import { useT } from './i18n/useT'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export default function App() {
  const { t } = useT()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])
  const notify = useCallback((message: string) => setToast(message), [])

  // Ctrl/Cmd+K abre de qualquer lugar; "/" só quando o foco não está num campo de texto.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
      const isSlash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey
      if (isShortcut || (isSlash && !isTypingTarget(event.target))) {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2.5 focus:font-mono focus:text-sm focus:font-semibold focus:text-bg"
      >
        {t.a11y.skip}
      </a>
      <Nav onOpenPalette={openPalette} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        <Stats />
        <Marquee />
        <About />
        <Stack />
        <Projects />
        <Career />
        <Process />
        <Contact />
      </main>
      <Footer />
      <CommandPalette open={paletteOpen} onClose={closePalette} onNotify={notify} />
      <Toast message={toast} />
    </>
  )
}
