'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

// Weekly
import { WeekSelector } from '@/components/week-selector'
import { WeekSummary } from '@/components/week-summary'
import { WeeklyBookingsTable } from '@/components/weekly-bookings-table'
import { getCurrentWeekRange, type WeekRange } from '@/lib/week-helpers'

// Monthly
import { MonthSelector } from '@/components/month-selector'
import { MonthCalendar } from '@/components/month-calendar'
import { MonthlyBookingsTable } from '@/components/monthly-bookings-table'
import { getCurrentMonthRange, type MonthRange } from '@/lib/month-helpers'

import { apiClient, type Booking, type ErrorResponse } from '@/lib/api-client'
import { AlertCircle, CalendarDays, CheckCircle, Clock } from 'lucide-react'

type ViewMode = 'weekly' | 'monthly'

export default function DashboardPage() {
  // ── View mode ─────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('weekly')

  // ── Week state ────────────────────────────────────────────
  const [weekRange, setWeekRange] = useState<WeekRange>(getCurrentWeekRange)
  const [weekSelectedDay, setWeekSelectedDay] = useState<string | null>(null)

  // ── Month state ───────────────────────────────────────────
  const [monthRange, setMonthRange] = useState<MonthRange>(getCurrentMonthRange)
  const [monthSelectedDay, setMonthSelectedDay] = useState<string | null>(null)

  // ── Shared data state ─────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorResponse | null>(null)

  // ── Fetch: weekly ─────────────────────────────────────────
  const fetchWeeklyBookings = useCallback(async (range: WeekRange) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.getWeeklyBookings(range.weekStart, range.weekEnd)
      setBookings(data)
    } catch (err) {
      setError(err as ErrorResponse)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Fetch: monthly ────────────────────────────────────────
  const fetchMonthlyBookings = useCallback(async (range: MonthRange) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.getMonthlyBookings(range.monthStart, range.monthEnd)
      setBookings(data)
    } catch (err) {
      setError(err as ErrorResponse)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Effect: fetch on range or view change ─────────────────
  useEffect(() => {
    if (viewMode === 'weekly') {
      fetchWeeklyBookings(weekRange)
    } else {
      fetchMonthlyBookings(monthRange)
    }
  }, [viewMode, weekRange, monthRange, fetchWeeklyBookings, fetchMonthlyBookings])

  // ── Handlers ──────────────────────────────────────────────
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode)
    setWeekSelectedDay(null)
    setMonthSelectedDay(null)
  }

  const handleWeekChange = (range: WeekRange) => {
    setWeekSelectedDay(null)
    setWeekRange(range)
  }

  const handleMonthChange = (range: MonthRange) => {
    setMonthSelectedDay(null)
    setMonthRange(range)
  }

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await apiClient.updateBookingStatus(bookingId, status)
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      )
    } catch (err) {
      setError(err as ErrorResponse)
    }
  }

  // ── Derived stats ─────────────────────────────────────────
  const totalBookings = bookings.length
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const periodLabel = viewMode === 'weekly' ? 'This Week' : 'This Month'

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">

          {/* ── Header row ────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {viewMode === 'weekly' ? 'Weekly' : 'Monthly'} booking overview
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => handleViewChange('weekly')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === 'weekly'
                      ? 'bg-[#E8CFCF] text-foreground'
                      : 'bg-white text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => handleViewChange('monthly')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                    viewMode === 'monthly'
                      ? 'bg-[#E8CFCF] text-foreground'
                      : 'bg-white text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {/* Period selector */}
              {viewMode === 'weekly' ? (
                <WeekSelector
                  weekStart={weekRange.weekStart}
                  weekEnd={weekRange.weekEnd}
                  onWeekChange={handleWeekChange}
                />
              ) : (
                <MonthSelector
                  monthStart={monthRange.monthStart}
                  onMonthChange={handleMonthChange}
                />
              )}
            </div>
          </div>

          {/* ── Summary Stats ─────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Total {periodLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{totalBookings}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* ── Error Alert ───────────────────────────────── */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {typeof error.message === 'string' ? error.message : 'Failed to load bookings'}
              </AlertDescription>
            </Alert>
          )}

          {/* ── WEEKLY VIEW ───────────────────────────────── */}
          {viewMode === 'weekly' && (
            <>
              {!isLoading && (
                <WeekSummary
                  weekStart={weekRange.weekStart}
                  bookings={bookings}
                  selectedDay={weekSelectedDay}
                  onDaySelect={setWeekSelectedDay}
                />
              )}
              <WeeklyBookingsTable
                bookings={bookings}
                selectedDay={weekSelectedDay}
                isLoading={isLoading}
                onStatusUpdate={handleStatusUpdate}
              />
            </>
          )}

          {/* ── MONTHLY VIEW ──────────────────────────────── */}
          {viewMode === 'monthly' && (
            <>
              {!isLoading && (
                <MonthCalendar
                  monthStart={monthRange.monthStart}
                  bookings={bookings}
                  selectedDay={monthSelectedDay}
                  onDaySelect={setMonthSelectedDay}
                />
              )}
              <MonthlyBookingsTable
                bookings={bookings}
                selectedDay={monthSelectedDay}
                isLoading={isLoading}
                onStatusUpdate={handleStatusUpdate}
              />
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
