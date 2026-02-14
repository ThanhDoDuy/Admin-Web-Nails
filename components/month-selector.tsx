'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatMonthDisplay,
  isCurrentMonth,
  shiftMonth,
  getCurrentMonthRange,
  type MonthRange,
} from '@/lib/month-helpers'

interface MonthSelectorProps {
  monthStart: string
  onMonthChange: (range: MonthRange) => void
}

export function MonthSelector({ monthStart, onMonthChange }: MonthSelectorProps) {
  const isCurrent = isCurrentMonth(monthStart)

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-border"
        onClick={() => onMonthChange(shiftMonth(monthStart, 'prev'))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm font-medium text-foreground min-w-[150px] text-center">
        {formatMonthDisplay(monthStart)}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-border"
        onClick={() => onMonthChange(shiftMonth(monthStart, 'next'))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-border text-muted-foreground hover:bg-[#E8CFCF] hover:text-foreground hover:border-[#DDBBBB]"
          onClick={() => onMonthChange(getCurrentMonthRange())}
        >
          This Month
        </Button>
      )}
    </div>
  )
}
