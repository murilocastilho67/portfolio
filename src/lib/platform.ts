const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)

/** Atalho da paleta de comandos, no formato usual de cada plataforma. */
export const paletteShortcut = isApple ? '⌘K' : 'Ctrl K'
