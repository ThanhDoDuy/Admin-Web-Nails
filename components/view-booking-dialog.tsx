'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Phone, User, Scissors, FileText, CalendarClock } from 'lucide-react'
import type { Booking } from '@/lib/api-client'
import { format, parseISO } from 'date-fns'

interface ViewBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
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

export function ViewBookingDialog({ open, onOpenChange, booking }: ViewBookingDialogProps) {
  if (!booking) return null

  const dateTime = parseISO(`${booking.bookingDate}T${booking.bookingTime}`)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Booking Details</DialogTitle>
            <Badge variant="outline" className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-2">
          {/* Customer */}
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="text-sm font-medium text-foreground">{booking.customerName}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-foreground">{booking.customerPhone}</p>
            </div>
          </div>

          {/* Service */}
          <div className="flex items-start gap-3">
            <Scissors className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Service</p>
              <p className="text-sm font-medium text-foreground">{booking.serviceName}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium text-foreground">
                {format(dateTime, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm font-medium text-foreground">
                {format(dateTime, 'HH:mm')}
              </p>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{booking.notes}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="flex items-start gap-3">
            <CalendarClock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Created: {format(parseISO(booking.createdAt), 'MMM d, yyyy · HH:mm')}
              </p>
              <p className="text-xs text-muted-foreground">
                Updated: {format(parseISO(booking.updatedAt), 'MMM d, yyyy · HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
