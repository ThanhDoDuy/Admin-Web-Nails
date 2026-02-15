'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { LoyaltyBadge, getNextTierInfo } from '@/components/loyalty-badge'
import { Progress } from '@/components/ui/progress'
import { Phone, User, CalendarDays, Star, Trophy, FileText, Loader2, TrendingUp } from 'lucide-react'
import type { Customer } from '@/lib/api-client'
import { format, parseISO } from 'date-fns'

interface CustomerDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onUpdateNotes?: (customerId: string, notes: string) => Promise<void>
}

export function CustomerDetailDialog({
  open,
  onOpenChange,
  customer,
  onUpdateNotes,
}: CustomerDetailDialogProps) {
  const [notes, setNotes] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!customer) return null

  const handleEditNotes = () => {
    setNotes(customer.notes || '')
    setIsEditing(true)
  }

  const handleSaveNotes = async () => {
    if (!onUpdateNotes) return
    setIsSaving(true)
    try {
      await onUpdateNotes(customer._id, notes)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o)
      if (!o) setIsEditing(false)
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Customer Details</DialogTitle>
            <LoyaltyBadge tier={customer.loyaltyTier} size="md" />
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-foreground">{customer.customerName}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-foreground">{customer.customerPhone}</p>
            </div>
          </div>

          <Separator />

          {/* Loyalty Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Trophy className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{customer.totalVisits}</p>
              <p className="text-[10px] text-muted-foreground">Total Visits</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Star className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{customer.loyaltyPoints}</p>
              <p className="text-[10px] text-muted-foreground">Points</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <CalendarDays className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">
                {customer.lastVisitDate
                  ? format(parseISO(customer.lastVisitDate), 'MM/dd')
                  : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground">Last Visit</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {(() => {
            const { currentTier, nextTier, visitsToNext, progress } = getNextTierInfo(customer.totalVisits)
            return (
              <div className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-muted-foreground">Loyalty Progress</p>
                  {nextTier ? (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <LoyaltyBadge tier={currentTier.tier} size="sm" />
                        </div>
                        <span className="text-muted-foreground">
                          {visitsToNext} more visit{visitsToNext !== 1 ? 's' : ''} to
                        </span>
                        <div className="flex items-center gap-1">
                          <LoyaltyBadge tier={nextTier.tier} size="sm" />
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-[10px] text-muted-foreground text-center">
                        {customer.totalVisits} / {nextTier.minVisits} visits
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-1">
                      <p className="text-xs font-medium text-purple-700">
                        Highest tier reached!
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {customer.totalVisits} total visits — Platinum member
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Visit Dates */}
          <div className="flex items-start gap-3">
            <CalendarDays className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                First visit:{' '}
                {customer.firstVisitDate
                  ? format(parseISO(customer.firstVisitDate), 'MMM d, yyyy')
                  : 'Not yet'}
              </p>
              <p className="text-xs text-muted-foreground">
                Customer since:{' '}
                {format(parseISO(customer.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Notes</p>
                {!isEditing && onUpdateNotes && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditNotes}
                    className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </Button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this customer..."
                    className="border-border focus-visible:ring-[#E8CFCF] resize-none text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="text-xs h-7 border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="text-xs h-7 bg-foreground hover:bg-foreground/85 text-white"
                    >
                      {isSaving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {customer.notes || 'No notes'}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
