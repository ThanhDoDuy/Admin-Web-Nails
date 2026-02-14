'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient, Booking, ErrorResponse } from '@/lib/api-client'
import { format } from 'date-fns'
import { Search, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'

type SortField = 'date' | 'name' | 'status'
type SortOrder = 'asc' | 'desc'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  useEffect(() => {
    fetchAllBookings()
  }, [])

  useEffect(() => {
    filterAndSortBookings()
  }, [bookings, searchTerm, statusFilter, sortField, sortOrder])

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
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Bookings</h1>
            <p className="text-muted-foreground mt-1">
              {filteredBookings.length} of {bookings.length} bookings
            </p>
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
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bookings List</CardTitle>
                  <CardDescription>
                    {isLoading ? 'Loading...' : `${filteredBookings.length} bookings`}
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
                      {filteredBookings.map(booking => (
                        <tr
                          key={booking._id}
                          className="border-b border-border/50 hover:bg-secondary/30 transition"
                        >
                          <td className="py-3 px-4 text-foreground font-medium">{booking.customerName}</td>
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
                            <div className="flex gap-2 justify-end">
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
