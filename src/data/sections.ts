export const sectionIds = ['sobre', 'stack', 'projetos', 'carreira', 'processo', 'contato'] as const
export type SectionId = (typeof sectionIds)[number]

/** Seções que aparecem como link na barra de navegação. */
export const navSectionIds = ['sobre', 'stack', 'projetos', 'carreira', 'contato'] as const
export type NavSectionId = (typeof navSectionIds)[number]

export function sectionNumber(id: SectionId): string {
  return String(sectionIds.indexOf(id) + 1).padStart(2, '0')
}
