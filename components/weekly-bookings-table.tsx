'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/lib/api-client'
import { format, parseISO } from 'date-fns'

interface WeeklyBookingsTableProps {
  bookings: Booking[]
  selectedDay: string | null
  isLoading: boolean
  onStatusUpdate: (bookingId: string, status: 'confirmed' | 'cancelled') => void
}

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  }
}

export function WeeklyBookingsTable({
  bookings,
  selectedDay,
  isLoading,
  onStatusUpdate,
}: WeeklyBookingsTableProps) {
  // Filter by selected day, then sort by date + time
  const filtered = useMemo(() => {
    let result = selectedDay
      ? bookings.filter((b) => b.bookingDate === selectedDay)
      : bookings

    result = [...result].sort((a, b) => {
      const dateA = `${a.bookingDate}T${a.bookingTime}`
      const dateB = `${b.bookingDate}T${b.bookingTime}`
      return dateA.localeCompare(dateB)
    })

    return result
  }, [bookings, selectedDay])

  const subtitle = selectedDay
    ? `${filtered.length} booking${filtered.length !== 1 ? 's' : ''} on ${format(parseISO(selectedDay), 'EEEE, MMM d')}`
    : `${filtered.length} booking${filtered.length !== 1 ? 's' : ''} this week`

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Weekly Bookings</CardTitle>
        <CardDescription>
          {isLoading ? 'Loading...' : subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-[#E8CFCF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No bookings {selectedDay ? 'for this day' : 'this week'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Service</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      {booking.customerName}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {booking.serviceName}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {format(
                        parseISO(`${booking.bookingDate}T${booking.bookingTime}`),
                        'EEE, MMM d · HH:mm'
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {booking.customerPhone}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {booking.status !== 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => onStatusUpdate(booking._id, 'confirmed')}
                            className="text-xs bg-foreground hover:bg-foreground/85 text-white"
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStatusUpdate(booking._id, 'cancelled')}
                            className="text-xs border-border text-muted-foreground hover:text-red-500 hover:border-red-200"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
