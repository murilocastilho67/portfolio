import { useCallback, useEffect, useState } from 'react'
import { About } from './components/About'
import { Backdrop } from './components/Backdrop'
import { Boot } from './components/Boot'
import { Career } from './components/Career'
import { CommandPalette } from './components/CommandPalette'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { MatrixRain } from './components/MatrixRain'
import { Nav } from './components/Nav'
import { Process } from './components/Process'
import { Projects } from './components/Projects'
import { Stack } from './components/Stack'
import { Stats } from './components/Stats'
import { Toast } from './components/Toast'
import { useConsoleBanner } from './hooks/useConsoleBanner'
import { useKonami } from './hooks/useKonami'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useT } from './i18n/useT'
import { track } from './lib/analytics'
import { onAppEvent } from './lib/appEvents'
import { shouldBoot } from './lib/boot'
import { isTypingTarget } from './lib/dom'
import { startSmoothScroll } from './lib/scroll'
import { followSystemTheme } from './lib/theme'

export default function App() {
  const { t } = useT()
  const reduced = useReducedMotion()
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Rolagem com inércia só para quem não pediu redução de movimento.
  useEffect(() => (reduced ? undefined : startSmoothScroll()), [reduced])
  const [toast, setToast] = useState<string | null>(null)
  // Abertura: só na primeira visita (ou ?boot); a chave muda a cada replay (comando reboot).
  const [bootRun, setBootRun] = useState<number | null>(() => (!reduced && shouldBoot() ? 0 : null))
  // Chuva âmbar: a chave muda a cada disparo; null = desligada.
  const [rainRun, setRainRun] = useState<number | null>(null)

  useConsoleBanner()
  useEffect(followSystemTheme, [])

  const openPalette = useCallback(() => {
    track('open_palette')
    setPaletteOpen(true)
  }, [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])
  const notify = useCallback((message: string) => setToast(message), [])
  const endBoot = useCallback(() => setBootRun(null), [])
  const endRain = useCallback(() => setRainRun(null), [])

  /** "Modo turbo": chuva âmbar (só o aviso com redução de movimento). */
  const startTurbo = useCallback(() => {
    setToast(t.toast.turbo)
    if (!reduced) setRainRun((run) => (run ?? 0) + 1)
  }, [t.toast.turbo, reduced])

  useKonami(() => {
    track('konami')
    startTurbo()
  })
  useEffect(() => onAppEvent('turbo', startTurbo), [startTurbo])
  useEffect(
    () =>
      onAppEvent('boot', () => {
        if (!reduced) setBootRun((run) => (run ?? 0) + 1)
      }),
    [reduced],
  )

  // Ctrl/Cmd+K abre de qualquer lugar; "/" só quando o foco não está num campo de texto.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
      const isSlash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey
      if (isShortcut || (isSlash && !isTypingTarget(event.target))) {
        event.preventDefault()
        openPalette()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [openPalette])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <>
      <Backdrop />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-md focus:bg-accent-fill focus:px-4 focus:py-2.5 focus:font-mono focus:text-sm focus:font-semibold focus:text-on-accent"
      >
        {t.a11y.skip}
      </a>
      <Nav onOpenPalette={openPalette} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero booting={bootRun !== null} />
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
      {rainRun !== null && <MatrixRain key={rainRun} onDone={endRain} />}
      {bootRun !== null && <Boot key={bootRun} onDone={endBoot} />}
    </>
  )
}
