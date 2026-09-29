export type CareerIcon = 'bus' | 'truck'
export type CareerId = 'bi' | 'junior' | 'traffic' | 'admin'
export type EducationId = 'ads' | 'se'

export interface CareerItem {
  id: CareerId
  start: string
  /** `null` indica cargo atual. */
  end: string | null
  unit: 'passengers' | 'cargo'
  icon: CareerIcon
}

export const careerItems: readonly CareerItem[] = [
  { id: 'bi', start: '2024', end: null, unit: 'passengers', icon: 'bus' },
  { id: 'junior', start: '2023', end: '2024', unit: 'passengers', icon: 'bus' },
  { id: 'traffic', start: '2022', end: '2023', unit: 'passengers', icon: 'bus' },
  { id: 'admin', start: '2019', end: '2022', unit: 'cargo', icon: 'truck' },
]

export const educationItems: readonly { id: EducationId; start: string; end: string }[] = [
  { id: 'ads', start: '2023', end: '2025' },
  { id: 'se', start: '2022', end: '2023' },
]
