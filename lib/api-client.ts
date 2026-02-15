const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface AuthResponse {
  accessToken: string
}

export interface BookingStatus {
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface Booking {
  _id: string
  salonId: string
  serviceName: string
  customerName: string
  customerPhone: string
  bookingDate: string
  bookingTime: string
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

export interface CreateBookingData {
  serviceName: string
  customerName: string
  customerPhone: string
  bookingDate: string
  bookingTime: string
  notes?: string
}

export interface UpdateBookingData {
  serviceName?: string
  customerName?: string
  customerPhone?: string
  bookingDate?: string
  bookingTime?: string
  notes?: string
  status?: 'pending' | 'confirmed' | 'cancelled'
}

export interface DeleteResponse {
  message: string
}

// ─── Customer / Loyalty ────────────────────────────────────
export type LoyaltyTier = 'new' | 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Customer {
  _id: string
  salonId: string
  customerName: string
  customerPhone: string
  totalVisits: number
  loyaltyPoints: number
  loyaltyTier: LoyaltyTier
  firstVisitDate: string | null
  lastVisitDate: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CustomerStats {
  total: number
  tiers: Record<LoyaltyTier, number>
}

export interface UpdateCustomerData {
  customerName?: string
  notes?: string
}

export interface ErrorResponse {
  message: string | string[]
  error: string
  statusCode: number
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    const token = this.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ErrorResponse = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
        error: 'Unknown error',
        statusCode: response.status,
      }))

      if (response.status === 401) {
        this.clearToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      throw error
    }
    return response.json() as Promise<T>
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    })
    return this.handleResponse<AuthResponse>(response)
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ChangePasswordResponse> {
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return this.handleResponse<ChangePasswordResponse>(response)
  }

  async createBooking(booking: CreateBookingData): Promise<Booking> {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(booking),
    })
    return this.handleResponse<Booking>(response)
  }

  async getAllBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return this.handleResponse<Booking[]>(response)
  }

  async getWeeklyBookings(weekStart: string, weekEnd: string): Promise<Booking[]> {
    const params = new URLSearchParams({ weekStart, weekEnd })
    const response = await fetch(`${API_BASE}/bookings?${params.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    const all = await this.handleResponse<Booking[]>(response)

    // Client-side filter – backend may ignore weekStart/weekEnd params
    return all.filter((b) => b.bookingDate >= weekStart && b.bookingDate <= weekEnd)
  }

  async getMonthlyBookings(monthStart: string, monthEnd: string): Promise<Booking[]> {
    const params = new URLSearchParams({ monthStart, monthEnd })
    const response = await fetch(`${API_BASE}/bookings?${params.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    const all = await this.handleResponse<Booking[]>(response)

    // Client-side filter – backend may ignore monthStart/monthEnd params
    return all.filter((b) => b.bookingDate >= monthStart && b.bookingDate <= monthEnd)
  }

  async getTodayBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE}/bookings/today`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return this.handleResponse<Booking[]>(response)
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus['status']): Promise<Booking> {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    })
    return this.handleResponse<Booking>(response)
  }

  async updateBooking(bookingId: string, data: UpdateBookingData): Promise<Booking> {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Booking>(response)
  }

  async deleteBooking(bookingId: string): Promise<DeleteResponse> {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    return this.handleResponse<DeleteResponse>(response)
  }

  // ─── Customer / Loyalty APIs ────────────────────────────────

  async getCustomers(search?: string, tier?: string): Promise<Customer[]> {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (tier) params.set('tier', tier)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/customers${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return this.handleResponse<Customer[]>(response)
  }

  async getCustomerStats(): Promise<CustomerStats> {
    const response = await fetch(`${API_BASE}/customers/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return this.handleResponse<CustomerStats>(response)
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await fetch(`${API_BASE}/customers/${customerId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return this.handleResponse<Customer>(response)
  }

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    const response = await fetch(`${API_BASE}/customers/phone/${encodeURIComponent(phone)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return this.handleResponse<Customer | null>(response)
  }

  async updateCustomer(customerId: string, data: UpdateCustomerData): Promise<Customer> {
    const response = await fetch(`${API_BASE}/customers/${customerId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<Customer>(response)
  }
}

export const apiClient = new ApiClient()
