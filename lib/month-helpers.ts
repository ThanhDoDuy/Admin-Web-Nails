import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  format,
  parseISO,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns'

export interface MonthRange {
  monthStart: string // YYYY-MM-DD  (first day of month)
  monthEnd: string   // YYYY-MM-DD  (last day of month)
}

export interface CalendarDay {
  date: Date
  dateStr: string        // YYYY-MM-DD
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
}

const WEEK_OPTIONS = { weekStartsOn: 1 as const } // Monday start

/**
 * Get the month range for the given date.
 */
export function getMonthRange(date: Date = new Date()): MonthRange {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return {
    monthStart: format(start, 'yyyy-MM-dd'),
    monthEnd: format(end, 'yyyy-MM-dd'),
  }
}

/**
 * Get the current month range.
 */
export function getCurrentMonthRange(): MonthRange {
  return getMonthRange(new Date())
}

/**
 * Shift a month range forward or backward.
 */
export function shiftMonth(currentStart: string, direction: 'next' | 'prev'): MonthRange {
  const base = parseISO(currentStart)
  const shifted = direction === 'next' ? addMonths(base, 1) : subMonths(base, 1)
  return getMonthRange(shifted)
}

/**
 * Format month for display: "February 2026"
 */
export function formatMonthDisplay(monthStart: string): string {
  return format(parseISO(monthStart), 'MMMM yyyy')
}

/**
 * Check if a month range is the current month.
 */
export function isCurrentMonth(monthStart: string): boolean {
  const current = getCurrentMonthRange()
  return current.monthStart === monthStart
}

/**
 * Build a full calendar grid (6 rows × 7 cols) for the given month.
 * Includes leading/trailing days from adjacent months to fill the grid.
 */
export function getCalendarDays(monthStart: string): CalendarDay[] {
  const monthDate = parseISO(monthStart)
  const gridStart = startOfWeek(startOfMonth(monthDate), WEEK_OPTIONS)
  const gridEnd = endOfWeek(endOfMonth(monthDate), WEEK_OPTIONS)

  const days: CalendarDay[] = []
  let current = gridStart

  while (current <= gridEnd) {
    days.push({
      date: current,
      dateStr: format(current, 'yyyy-MM-dd'),
      dayOfMonth: current.getDate(),
      isCurrentMonth: isSameMonth(current, monthDate),
      isToday: isToday(current),
    })
    current = addDays(current, 1)
  }

  return days
}

/**
 * Group bookings by date, returning a count map.
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
