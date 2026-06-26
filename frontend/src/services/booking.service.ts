import api from './api'
import type { Booking, PaginatedResponse } from '@/types'
import type { BookingInput } from '@/lib/schemas'

export const bookingService = {
  async create(data: BookingInput): Promise<Booking> {
    const res = await api.post<Booking>('/bookings', data)
    return res.data
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await api.get<Booking[]>('/bookings/my')
    return res.data
  },

  async getById(id: string): Promise<Booking> {
    const res = await api.get<Booking>(`/bookings/${id}`)
    return res.data
  },

  async cancel(id: string): Promise<Booking> {
    const res = await api.delete<Booking>(`/bookings/${id}`)
    return res.data
  },

  async getAll(params?: {
    status?: string
    hostelId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Booking>> {
    const res = await api.get<PaginatedResponse<Booking>>('/bookings', { params })
    return res.data
  },

  async updateStatus(id: string, status: 'CONFIRMED' | 'REJECTED'): Promise<Booking> {
    const res = await api.patch<Booking>(`/bookings/${id}/status`, { status })
    return res.data
  },
}
