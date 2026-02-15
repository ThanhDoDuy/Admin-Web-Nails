'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoyaltyBadge, TIER_REQUIREMENTS } from '@/components/loyalty-badge'
import { CustomerDetailDialog } from '@/components/customer-detail-dialog'
import {
  apiClient,
  type Customer,
  type CustomerStats,
  type LoyaltyTier,
  type ErrorResponse,
} from '@/lib/api-client'
import { format, parseISO } from 'date-fns'
import {
  Search,
  AlertCircle,
  Users,
  Crown,
  Star,
  Award,
  Medal,
  ArrowRight,
  Info,
} from 'lucide-react'

const TIER_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'new', label: 'New' },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')

  // Dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm, tierFilter])

  const fetchCustomers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.getCustomers(
        searchTerm || undefined,
        tierFilter !== 'all' ? tierFilter : undefined,
      )
      setCustomers(data)
    } catch (err) {
      setError(err as ErrorResponse)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.getCustomerStats()
      setStats(data)
    } catch {
      // stats are optional, don't block
    }
  }

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDetailOpen(true)
  }

  const handleUpdateNotes = async (customerId: string, notes: string) => {
    const updated = await apiClient.updateCustomer(customerId, { notes })
    setCustomers((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c)),
    )
    setSelectedCustomer(updated)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Loyal Customers</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your loyal customer base
            </p>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {typeof error.message === 'string' ? error.message : 'Failed to load customers'}
              </AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <Card className="border-border">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Platinum</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{stats.tiers.platinum}</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Gold</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{stats.tiers.gold}</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Silver</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-600">{stats.tiers.silver}</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Medal className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Bronze</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{stats.tiers.bronze}</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">New</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-500">{stats.tiers.new}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tier Roadmap */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm">Loyalty Tier Conditions</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Customers level up based on the number of confirmed visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-0">
                {TIER_REQUIREMENTS.map((req, idx) => {
                  const Icon = req.icon
                  return (
                    <div key={req.tier} className="flex items-center">
                      <div className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg ${req.bgColor} min-w-[100px]`}>
                        <Icon className={`w-4 h-4 ${req.color}`} />
                        <span className={`text-xs font-semibold ${req.color}`}>{req.label}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {req.maxVisits === null
                            ? `${req.minVisits}+ visits`
                            : req.minVisits === 0
                              ? `0–${req.maxVisits} visits`
                              : `${req.minVisits}–${req.maxVisits} visits`}
                        </span>
                      </div>
                      {idx < TIER_REQUIREMENTS.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 mx-1 shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-border focus-visible:ring-[#E8CFCF]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {TIER_FILTERS.map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={tierFilter === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTierFilter(value)}
                      className={
                        tierFilter === value
                          ? 'bg-[#E8CFCF] text-foreground border-[#DDBBBB] hover:bg-[#DDBBBB]'
                          : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Table */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer List</CardTitle>
                  <CardDescription>
                    {isLoading ? 'Loading...' : `${customers.length} customers`}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => { fetchCustomers(); fetchStats() }}
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
                  <div className="inline-block w-8 h-8 border-4 border-[#E8CFCF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : customers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No customers found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Tier</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Visits</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Points</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Last Visit</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr
                          key={customer._id}
                          className="border-b border-border/50 hover:bg-secondary/30 transition cursor-pointer"
                          onClick={() => openDetail(customer)}
                        >
                          <td className="py-3 px-4 text-foreground font-medium">
                            {customer.customerName}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {customer.customerPhone}
                          </td>
                          <td className="py-3 px-4">
                            <LoyaltyBadge tier={customer.loyaltyTier} />
                          </td>
                          <td className="py-3 px-4 text-center text-foreground font-medium">
                            {customer.totalVisits}
                          </td>
                          <td className="py-3 px-4 text-center text-muted-foreground">
                            {customer.loyaltyPoints}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {customer.lastVisitDate
                              ? format(parseISO(customer.lastVisitDate), 'MMM d, yyyy')
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDetail(customer)
                              }}
                              className="text-xs border-border text-muted-foreground hover:text-foreground"
                            >
                              View
                            </Button>
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

        {/* Detail Dialog */}
        <CustomerDetailDialog
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open)
            if (!open) setSelectedCustomer(null)
          }}
          customer={selectedCustomer}
          onUpdateNotes={handleUpdateNotes}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
