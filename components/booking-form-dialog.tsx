'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { Booking, CreateBookingData, ErrorResponse } from '@/lib/api-client'

const DEFAULT_SERVICES = [
  'Classic Manicure',
  'Gel Manicure',
  'Classic Pedicure',
  'Gel Pedicure',
  'Acrylic Full Set',
  'Acrylic Fill',
  'Dipping Powder',
  'Nail Art',
  'Manicure & Pedicure Combo',
]

const OTHER_VALUE = '__other__'

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

interface BookingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: Booking | null
  onSubmit: (data: CreateBookingData) => Promise<void>
}

const emptyForm: CreateBookingData = {
  serviceName: '',
  customerName: '',
  customerPhone: '',
  bookingDate: '',
  bookingTime: '',
  notes: '',
}

export function BookingFormDialog({
  open,
  onOpenChange,
  booking,
  onSubmit,
}: BookingFormDialogProps) {
  const isEdit = !!booking
  const [form, setForm] = useState<CreateBookingData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serviceSelect, setServiceSelect] = useState<string>('')
  const [customService, setCustomService] = useState('')
  const [hour, setHour] = useState<string>('')
  const [minute, setMinute] = useState<string>('')

  const isOther = serviceSelect === OTHER_VALUE

  // Reset form when dialog opens/closes or booking changes
  useEffect(() => {
    if (open) {
      setError(null)
      if (booking) {
        const isDefault = DEFAULT_SERVICES.includes(booking.serviceName)
        setServiceSelect(isDefault ? booking.serviceName : OTHER_VALUE)
        setCustomService(isDefault ? '' : booking.serviceName)
        const [h, m] = (booking.bookingTime || '').split(':')
        setHour(h || '')
        setMinute(m || '')
        setForm({
          serviceName: booking.serviceName,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          notes: booking.notes || '',
        })
      } else {
        setServiceSelect('')
        setCustomService('')
        setHour('')
        setMinute('')
        setForm(emptyForm)
      }
    }
  }, [open, booking])

  // Sync hour + minute → bookingTime
  useEffect(() => {
    if (hour && minute) {
      handleChange('bookingTime', `${hour}:${minute}`)
    }
  }, [hour, minute])

  const handleChange = (field: keyof CreateBookingData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = (): string | null => {
    if (!form.customerName.trim()) return 'Customer name is required'
    if (!form.customerPhone.trim()) return 'Phone number is required'
    if (!form.serviceName.trim()) return 'Service name is required'
    if (!form.bookingDate) return 'Booking date is required'
    if (!form.bookingTime) return 'Booking time is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(form)
      onOpenChange(false)
    } catch (err) {
      const apiError = err as ErrorResponse
      setError(
        typeof apiError.message === 'string'
          ? apiError.message
          : Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : 'Something went wrong'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Booking' : 'New Booking'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the booking details below.'
              : 'Fill in the details to create a new booking.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={form.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="John Doe"
                className="border-border focus-visible:ring-[#E8CFCF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone *</Label>
              <Input
                id="customerPhone"
                value={form.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                placeholder="(555) 123-4567"
                className="border-border focus-visible:ring-[#E8CFCF]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Service *</Label>
            <Select
              value={serviceSelect}
              onValueChange={(val) => {
                setServiceSelect(val)
                if (val === OTHER_VALUE) {
                  setCustomService('')
                  handleChange('serviceName', '')
                } else {
                  setCustomService('')
                  handleChange('serviceName', val)
                }
              }}
            >
              <SelectTrigger className="border-border focus:ring-[#E8CFCF]">
                <SelectValue placeholder="Select a service..." />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_SERVICES.map((svc) => (
                  <SelectItem key={svc} value={svc}>
                    {svc}
                  </SelectItem>
                ))}
                <SelectItem value={OTHER_VALUE}>Other...</SelectItem>
              </SelectContent>
            </Select>
            {isOther && (
              <Input
                value={customService}
                onChange={(e) => {
                  setCustomService(e.target.value)
                  handleChange('serviceName', e.target.value)
                }}
                placeholder="Enter custom service name..."
                className="border-border focus-visible:ring-[#E8CFCF]"
                autoFocus
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingDate">Date *</Label>
              <Input
                id="bookingDate"
                type="date"
                value={form.bookingDate}
                onChange={(e) => handleChange('bookingDate', e.target.value)}
                className="border-border focus-visible:ring-[#E8CFCF]"
              />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <div className="flex gap-2">
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger className="border-border focus:ring-[#E8CFCF]">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex items-center text-muted-foreground font-medium">:</span>
                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger className="border-border focus:ring-[#E8CFCF]">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any special requests or notes..."
              rows={3}
              className="border-border focus-visible:ring-[#E8CFCF] resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-foreground hover:bg-foreground/85 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
