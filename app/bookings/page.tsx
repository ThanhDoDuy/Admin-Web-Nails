'use client'

import { useState, useEffect, Fragment } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookingFormDialog } from '@/components/booking-form-dialog'
import { DeleteBookingDialog } from '@/components/delete-booking-dialog'
import { LoyaltyBadge } from '@/components/loyalty-badge'
import { apiClient, type Booking, type Customer, type CreateBookingData, type ErrorResponse } from '@/lib/api-client'
import { format } from 'date-fns'
import { ViewBookingDialog } from '@/components/view-booking-dialog'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Search, AlertCircle, ChevronUp, ChevronDown, Plus, Eye, Pencil, Trash2 } from 'lucide-react'

const PAGE_SIZE = 10

type SortField = 'date' | 'name' | 'status'
type SortOrder = 'asc' | 'desc'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('') // YYYY-MM
  const [filterDate, setFilterDate] = useState<string>('') // YYYY-MM-DD
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(1)

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null)

  // Customer loyalty data
  const [customerMap, setCustomerMap] = useState<Map<string, Customer>>(new Map())

  useEffect(() => {
    fetchAllBookings()
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterAndSortBookings()
  }, [bookings, searchTerm, statusFilter, filterMonth, filterDate, sortField, sortOrder])

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter, filterMonth, filterDate, sortField, sortOrder])

  const fetchAllBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.getAllBookings()
      setBookings(data)
    } catch (err) {
      setError(err as ErrorResponse)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const customers = await apiClient.getCustomers()
      const map = new Map<string, Customer>()
      for (const c of customers) {
        map.set(c.customerPhone, c)
      }
      setCustomerMap(map)
    } catch {
      // non-critical
    }
  }

  const filterAndSortBookings = () => {
    let filtered = bookings

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(b =>
        b.customerName.toLowerCase().includes(term) ||
        b.customerPhone.includes(term) ||
        b.serviceName.toLowerCase().includes(term)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    // Filter by date (exact day takes precedence)
    if (filterDate) {
      filtered = filtered.filter(b => b.bookingDate === filterDate)
    } else if (filterMonth) {
      filtered = filtered.filter(b => b.bookingDate.startsWith(filterMonth))
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number, bVal: string | number

      if (sortField === 'date') {
        aVal = new Date(`${a.bookingDate}T${a.bookingTime}`).getTime()
        bVal = new Date(`${b.bookingDate}T${b.bookingTime}`).getTime()
      } else if (sortField === 'name') {
        aVal = a.customerName.toLowerCase()
        bVal = b.customerName.toLowerCase()
      } else {
        aVal = a.status
        bVal = b.status
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await apiClient.updateBookingStatus(bookingId, status)
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status } : b))
    } catch (err) {
      setError(err as ErrorResponse)
    }
  }

  // ── Create booking ──────────────────────────────────────
  const handleCreateBooking = async (data: CreateBookingData) => {
    const created = await apiClient.createBooking(data)
    setBookings((prev) => [created, ...prev])
  }

  // ── Edit booking ────────────────────────────────────────
  const handleEditBooking = async (data: CreateBookingData) => {
    if (!editingBooking) return
    const updated = await apiClient.updateBooking(editingBooking._id, data)
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b))
    )
  }

  const openEditDialog = (booking: Booking) => {
    setEditingBooking(booking)
    setFormDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingBooking(null)
    setFormDialogOpen(true)
  }

  // ── Delete booking ──────────────────────────────────────
  const handleDeleteBooking = async (bookingId: string) => {
    await apiClient.deleteBooking(bookingId)
    setBookings((prev) => prev.filter((b) => b._id !== bookingId))
  }

  const openDeleteDialog = (booking: Booking) => {
    setDeletingBooking(booking)
    setDeleteDialogOpen(true)
  }

  const openViewDialog = (booking: Booking) => {
    setViewingBooking(booking)
    setViewDialogOpen(true)
  }

  const totalFiltered = filteredBookings.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const end = Math.min(start + PAGE_SIZE, totalFiltered)
  const paginatedBookings = filteredBookings.slice(start, end)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (sortField === field) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
          setSortField(field)
          setSortOrder('asc')
        }
      }}
      className="gap-1 text-xs"
    >
      {label}
      {sortField === field && (
        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      )}
    </Button>
  )

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">All Bookings</h1>
              <p className="text-muted-foreground mt-1">
                {filteredBookings.length} of {bookings.length} bookings
              </p>
            </div>
            <Button
              onClick={openCreateDialog}
              className="bg-foreground hover:bg-foreground/85 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {typeof error.message === 'string' ? error.message : 'Failed to load bookings'}
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, or service..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-border focus-visible:ring-[#E8CFCF]"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={
                        statusFilter === status
                          ? 'bg-[#E8CFCF] text-foreground border-[#DDBBBB] hover:bg-[#DDBBBB]'
                          : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Month
                  </span>
                  <Select
                    value={filterMonth ? filterMonth.slice(0, 7) : 'all'}
                    onValueChange={(val) => setFilterMonth(val === 'all' ? '' : val)}
                  >
                    <SelectTrigger className="w-[140px] border-border focus:ring-[#E8CFCF]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {(() => {
                        const now = new Date()
                        const items: { value: string; label: string }[] = []
                        for (let i = -6; i <= 6; i++) {
                          const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
                          const y = d.getFullYear()
                          const m = String(d.getMonth() + 1).padStart(2, '0')
                          items.push({
                            value: `${y}-${m}`,
                            label: format(d, 'MMM yyyy'),
                          })
                        }
                        return items.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="filter-date" className="text-sm text-muted-foreground whitespace-nowrap">
                    Date
                  </label>
                  <Input
                    id="filter-date"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-[150px] border-border focus-visible:ring-[#E8CFCF]"
                  />
                </div>
                {(filterMonth || filterDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterMonth('')
                      setFilterDate('')
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear date filter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bookings List</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? 'Loading...'
                      : `Showing ${totalFiltered === 0 ? 0 : start + 1}–${end} of ${totalFiltered} bookings`}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={fetchAllBookings}
                  variant="outline"
                  className="border-border"
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-[#E8CFCF] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredBookings.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No bookings found</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            <SortButton field="name" label="Customer" />
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Service</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            <SortButton field="date" label="Date & Time" />
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            <SortButton field="status" label="Status" />
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBookings.map(booking => (
                        <tr
                          key={booking._id}
                          className="border-b border-border/50 hover:bg-secondary/30 transition"
                        >
                          <td className="py-3 px-4 text-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                              {booking.customerName}
                              {customerMap.get(booking.customerPhone) && (
                                <LoyaltyBadge
                                  tier={customerMap.get(booking.customerPhone)!.loyaltyTier}
                                  showIcon={false}
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{booking.serviceName}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {format(new Date(`${booking.bookingDate}T${booking.bookingTime}`), 'MMM dd, yyyy • HH:mm')}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">{booking.customerPhone}</td>
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
                                  onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                  className="text-xs bg-foreground hover:bg-foreground/85 text-white"
                                >
                                  Confirm
                                </Button>
                              )}
                              {booking.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                  variant="outline"
                                  className="text-xs border-border text-muted-foreground hover:text-red-500 hover:border-red-200"
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openViewDialog(booking)}
                                className="text-xs text-muted-foreground hover:text-blue-600"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(booking)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openDeleteDialog(booking)}
                                className="text-xs text-muted-foreground hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
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
                              className={
                                page <= 1
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
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
                                page >= totalPages
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
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
        </div>

        {/* Create / Edit Dialog */}
        <BookingFormDialog
          open={formDialogOpen}
          onOpenChange={(open) => {
            setFormDialogOpen(open)
            if (!open) setEditingBooking(null)
          }}
          booking={editingBooking}
          onSubmit={editingBooking ? handleEditBooking : handleCreateBooking}
        />

        {/* Delete Dialog */}
        <DeleteBookingDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open)
            if (!open) setDeletingBooking(null)
          }}
          booking={deletingBooking}
          onConfirm={handleDeleteBooking}
        />

        {/* View Dialog */}
        <ViewBookingDialog
          open={viewDialogOpen}
          onOpenChange={(open) => {
            setViewDialogOpen(open)
            if (!open) setViewingBooking(null)
          }}
          booking={viewingBooking}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
