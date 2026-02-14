'use client'

import type { WeekDay } from '@/lib/week-helpers'

interface WeekDayCardProps {
  day: WeekDay
  count: number
  isSelected: boolean
  onClick: () => void
}

export function WeekDayCard({ day, count, isSelected, onClick }: WeekDayCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center rounded-lg border p-3 transition-all cursor-pointer
        ${isSelected
          ? 'border-[#DDBBBB] bg-[#E8CFCF]/30 ring-1 ring-[#DDBBBB]'
          : 'border-border bg-white hover:border-[#E8CFCF] hover:bg-[#E8CFCF]/10'
        }
        ${day.isToday && !isSelected ? 'border-foreground/20' : ''}
      `}
    >
      {/* Day label */}
      <span className={`text-xs font-medium uppercase tracking-wider ${
        day.isToday ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        {day.dayShort}
      </span>

      {/* Day of month */}
      <span className={`text-[10px] mt-0.5 ${
        day.isToday
          ? 'text-white bg-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold'
          : 'text-muted-foreground'
      }`}>
        {day.dayOfMonth}
      </span>

      {/* Booking count */}
      <span className="text-xl font-bold text-foreground mt-1.5 leading-none">
        {count}
      </span>
      <span className="text-[10px] text-muted-foreground mt-0.5">
        {count === 1 ? 'booking' : 'bookings'}
      </span>
    </button>
  )
}
