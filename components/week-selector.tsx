'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatWeekRangeDisplay,
  isCurrentWeek,
  shiftWeek,
  getCurrentWeekRange,
  type WeekRange,
} from '@/lib/week-helpers'

interface WeekSelectorProps {
  weekStart: string
  weekEnd: string
  onWeekChange: (range: WeekRange) => void
}

export function WeekSelector({ weekStart, weekEnd, onWeekChange }: WeekSelectorProps) {
  const isCurrent = isCurrentWeek(weekStart)

  return (
    <div className="flex items-center gap-3">
      {/* Previous week */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-border"
        onClick={() => onWeekChange(shiftWeek(weekStart, 'prev'))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Date range display */}
      <span className="text-sm font-medium text-foreground min-w-[140px] text-center">
        {formatWeekRangeDisplay(weekStart, weekEnd)}
      </span>

      {/* Next week */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-border"
        onClick={() => onWeekChange(shiftWeek(weekStart, 'next'))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* This week shortcut */}
      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-border text-muted-foreground hover:bg-[#E8CFCF] hover:text-foreground hover:border-[#DDBBBB]"
          onClick={() => onWeekChange(getCurrentWeekRange())}
        >
          This Week
        </Button>
      )}
    </div>
  )
}
