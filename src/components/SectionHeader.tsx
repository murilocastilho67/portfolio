import { sectionNumber, type SectionId } from '../data/sections'
import { useT } from '../i18n/useT'
import { Reveal } from './Reveal'

export function SectionHeader({ id, headingId }: { id: SectionId; headingId: string }) {
  const { t } = useT()
  const copy = t.sections[id]

  return (
    <Reveal className="mb-10 sm:mb-14">
      <p className="eyebrow mb-4">
        <span aria-hidden="true">[ </span>
        {sectionNumber(id)}
        <span aria-hidden="true"> ]</span> <span className="text-accent">{copy.eyebrow}</span>
      </p>
      <h2
        id={headingId}
        className="text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] font-bold tracking-tight"
      >
        <span className="block">{copy.line1}</span>
        <span className="block text-accent">{copy.line2}</span>
      </h2>
    </Reveal>
  )
}
