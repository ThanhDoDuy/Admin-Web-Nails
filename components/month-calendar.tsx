'use client'

import { getCalendarDays, countBookingsByDate } from '@/lib/month-helpers'
import type { Booking } from '@/lib/api-client'

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface MonthCalendarProps {
  monthStart: string
  bookings: Booking[]
  selectedDay: string | null
  onDaySelect: (dateStr: string | null) => void
}

export function MonthCalendar({
  monthStart,
  bookings,
  selectedDay,
  onDaySelect,
}: MonthCalendarProps) {
  const days = getCalendarDays(monthStart)
  const countsByDate = countBookingsByDate(bookings)

  const handleClick = (dateStr: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    onDaySelect(selectedDay === dateStr ? null : dateStr)
  }

  return (
    <div className="space-y-2">
      {selectedDay && (
        <button
          onClick={() => onDaySelect(null)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Show all days
        </button>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-7 bg-secondary/50">
          {DAY_HEADERS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const count = countsByDate[day.dateStr] || 0
            const isSelected = selectedDay === day.dateStr
            const isClickable = day.isCurrentMonth

            return (
              <button
                key={day.dateStr}
                disabled={!isClickable}
                onClick={() => handleClick(day.dateStr, day.isCurrentMonth)}
                className={`
                  relative flex flex-col items-center py-2.5 border-t border-r border-border/50
                  transition-colors min-h-[60px] justify-center
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  ${!day.isCurrentMonth ? 'bg-secondary/20' : 'bg-white'}
                  ${isSelected ? 'bg-[#E8CFCF]/30 ring-1 ring-inset ring-[#DDBBBB]' : ''}
                  ${isClickable && !isSelected ? 'hover:bg-[#E8CFCF]/10' : ''}
                `}
              >
                {/* Day number */}
                <span
                  className={`text-xs leading-none
                    ${!day.isCurrentMonth ? 'text-muted-foreground/40' : ''}
                    ${day.isToday
                      ? 'text-white bg-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold'
                      : day.isCurrentMonth
                        ? 'text-foreground'
                        : ''
                    }
                  `}
                >
                  {day.dayOfMonth}
                </span>

                {/* Booking count */}
                {day.isCurrentMonth && count > 0 && (
                  <span className="text-sm font-bold text-foreground mt-1 leading-none">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
