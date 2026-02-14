import {
  startOfWeek,
  endOfWeek,
  format,
  addWeeks,
  subWeeks,
  addDays,
  parseISO,
  isToday,
} from 'date-fns'

export interface WeekRange {
  weekStart: string // YYYY-MM-DD
  weekEnd: string   // YYYY-MM-DD
}

export interface WeekDay {
  date: Date
  dateStr: string   // YYYY-MM-DD
  dayShort: string  // Mon, Tue, ...
  dayFull: string   // Monday, Tuesday, ...
  dayOfMonth: number
  isToday: boolean
}

const WEEK_OPTIONS = { weekStartsOn: 1 as const } // Monday start

/**
 * Get the week range (Mon-Sun) that contains the given date.
 */
export function getWeekRange(date: Date = new Date()): WeekRange {
  const start = startOfWeek(date, WEEK_OPTIONS)
  const end = endOfWeek(date, WEEK_OPTIONS)
  return {
    weekStart: format(start, 'yyyy-MM-dd'),
    weekEnd: format(end, 'yyyy-MM-dd'),
  }
}

/**
 * Get the current week range.
 */
export function getCurrentWeekRange(): WeekRange {
  return getWeekRange(new Date())
}

/**
 * Shift a week range forward or backward.
 */
export function shiftWeek(currentStart: string, direction: 'next' | 'prev'): WeekRange {
  const base = parseISO(currentStart)
  const shifted = direction === 'next' ? addWeeks(base, 1) : subWeeks(base, 1)
  return getWeekRange(shifted)
}

/**
 * Get all 7 days (Mon-Sun) for a given week start date.
 */
export function getWeekDays(weekStart: string): WeekDay[] {
  const start = parseISO(weekStart)
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      dayShort: format(date, 'EEE'),   // Mon, Tue, ...
      dayFull: format(date, 'EEEE'),   // Monday, ...
      dayOfMonth: date.getDate(),
      isToday: isToday(date),
    }
  })
}

/**
 * Format a week range for display: "Feb 17 – Feb 23"
 */
export function formatWeekRangeDisplay(weekStart: string, weekEnd: string): string {
  const start = parseISO(weekStart)
  const end = parseISO(weekEnd)
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
}

/**
 * Check if a week range is the current week.
 */
export function isCurrentWeek(weekStart: string): boolean {
  const current = getCurrentWeekRange()
  return current.weekStart === weekStart
}

/**
 * Group bookings by date string, returning a count map.
 */
export function countBookingsByDate(
  bookings: { bookingDate: string }[]
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const b of bookings) {
    counts[b.bookingDate] = (counts[b.bookingDate] || 0) + 1
  }
  return counts
}
