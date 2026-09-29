import { useCopy } from '../../kit/lib'
import { routesCopy } from '../routes.copy'
import type { Change } from '../routes.data'

/** Texto curto de uma alteração (linha do tempo de vigências). */
export function useDescribeChange() {
  const copy = useCopy(routesCopy)
  return (change: Change): string => {
    if (change.kind === 'time') {
      return `${copy.changes.time(change.stop + 1, change.code)}: ${change.from} → ${change.to}`
    }
    if (change.kind === 'day') return copy.changes.day(copy.days.long[change.day])
    return copy.changes.stop(change.code, change.time)
  }
}
