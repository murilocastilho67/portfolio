import type { Tone } from '../../kit/primitives'
import type { RouteStatus } from '../routes.data'

export const statusTone: Record<RouteStatus, Tone> = {
  active: 'green',
  pending: 'amber',
  suspended: 'red',
}
