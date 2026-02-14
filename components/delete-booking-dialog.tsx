'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import type { Booking, ErrorResponse } from '@/lib/api-client'

interface DeleteBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
  onConfirm: (bookingId: string) => Promise<void>
}

export function DeleteBookingDialog({
  open,
  onOpenChange,
  booking,
  onConfirm,
}: DeleteBookingDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!booking) return
    setIsDeleting(true)
    setError(null)
    try {
      await onConfirm(booking._id)
      onOpenChange(false)
    } catch (err) {
      const apiError = err as ErrorResponse
      setError(
        typeof apiError.message === 'string'
          ? apiError.message
          : 'Failed to delete booking'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Booking</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the booking for{' '}
            <span className="font-semibold text-foreground">
              {booking?.customerName}
            </span>
            {booking?.bookingDate && (
              <>
                {' '}on{' '}
                <span className="font-semibold text-foreground">
                  {booking.bookingDate}
                </span>{' '}
                at{' '}
                <span className="font-semibold text-foreground">
                  {booking.bookingTime}
                </span>
              </>
            )}
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm text-destructive px-1">{error}</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
