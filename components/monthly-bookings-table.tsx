'use client'

import { useMemo, useState, useEffect, Fragment } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { LoyaltyBadge } from '@/components/loyalty-badge'
import type { Booking, Customer } from '@/lib/api-client'
import { format, parseISO } from 'date-fns'

const PAGE_SIZE = 10

interface MonthlyBookingsTableProps {
  bookings: Booking[]
  selectedDay: string | null
  isLoading: boolean
  customerMap?: Map<string, Customer>
  onStatusUpdate: (bookingId: string, status: 'confirmed' | 'cancelled') => void
  onView?: (booking: Booking) => void
  onEdit?: (booking: Booking) => void
  onDelete?: (booking: Booking) => void
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

export function MonthlyBookingsTable({
  bookings,
  selectedDay,
  isLoading,
  onStatusUpdate,
  customerMap,
  onView,
  onEdit,
  onDelete,
}: MonthlyBookingsTableProps) {
  const filtered = useMemo(() => {
    let result = selectedDay
      ? bookings.filter((b) => b.bookingDate === selectedDay)
      : bookings

    return [...result].sort((a, b) => {
      const dateA = `${a.bookingDate}T${a.bookingTime}`
      const dateB = `${b.bookingDate}T${b.bookingTime}`
      return dateA.localeCompare(dateB)
    })
  }, [bookings, selectedDay])

  const [page, setPage] = useState(1)
  useEffect(() => {
    setPage(1)
  }, [selectedDay, filtered.length])

  const totalFiltered = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const end = Math.min(start + PAGE_SIZE, totalFiltered)
  const paginatedBookings = filtered.slice(start, end)

  const subtitle = selectedDay
    ? `${filtered.length} booking${filtered.length !== 1 ? 's' : ''} on ${format(parseISO(selectedDay), 'EEEE, MMM d')}`
    : `${filtered.length} booking${filtered.length !== 1 ? 's' : ''} this month`

  const descriptionText = isLoading
    ? 'Loading...'
    : totalFiltered === 0
      ? subtitle
      : `Showing ${start + 1}–${end} of ${totalFiltered} · ${subtitle}`

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Monthly Bookings</CardTitle>
        <CardDescription>
          {descriptionText}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-[#E8CFCF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No bookings {selectedDay ? 'for this day' : 'this month'}
          </p>
        ) : (
          <>
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
                  {paginatedBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        {booking.customerName}
                        {customerMap?.get(booking.customerPhone) && (
                          <LoyaltyBadge
                            tier={customerMap.get(booking.customerPhone)!.loyaltyTier}
                            showIcon={false}
                          />
                        )}
                      </div>
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
                      <div className="flex gap-1 justify-end">
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
                        {onView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onView(booking)}
                            className="text-xs text-muted-foreground hover:text-blue-600"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(booking)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(booking)}
                            className="text-xs text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  Page {page} of {totalPages}
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setPage((p) => Math.max(1, p - 1))
                        }}
                        className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((n) => {
                        if (totalPages <= 7) return true
                        if (n === 1 || n === totalPages) return true
                        if (Math.abs(n - page) <= 1) return true
                        return false
                      })
                      .map((n, idx, arr) => (
                        <Fragment key={n}>
                          {idx > 0 && arr[idx - 1] !== n - 1 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPage(n)
                              }}
                              isActive={page === n}
                              className="cursor-pointer"
                            >
                              {n}
                            </PaginationLink>
                          </PaginationItem>
                        </Fragment>
                      ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setPage((p) => Math.min(totalPages, p + 1))
                        }}
                        className={
                          page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
