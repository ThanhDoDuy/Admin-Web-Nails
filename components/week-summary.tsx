'use client'

import { WeekDayCard } from '@/components/week-day-card'
import { getWeekDays, countBookingsByDate, type WeekDay } from '@/lib/week-helpers'
import type { Booking } from '@/lib/api-client'

interface WeekSummaryProps {
  weekStart: string
  bookings: Booking[]
  selectedDay: string | null   // YYYY-MM-DD or null for "all"
  onDaySelect: (dateStr: string | null) => void
}

export function WeekSummary({
  weekStart,
  bookings,
  selectedDay,
  onDaySelect,
}: WeekSummaryProps) {
  const days = getWeekDays(weekStart)
  const countsByDate = countBookingsByDate(bookings)

  const handleCardClick = (day: WeekDay) => {
    // Toggle: click same day again → deselect (show all)
    if (selectedDay === day.dateStr) {
      onDaySelect(null)
    } else {
      onDaySelect(day.dateStr)
    }
  }

  return (
    <div className="space-y-2">
      {/* "All" toggle when a day is selected */}
      {selectedDay && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDaySelect(null)}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Show all days
          </button>
        </div>
      )}

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <WeekDayCard
            key={day.dateStr}
            day={day}
            count={countsByDate[day.dateStr] || 0}
            isSelected={selectedDay === day.dateStr}
            onClick={() => handleCardClick(day)}
          />
        ))}
      </div>
    </div>
  )
}
