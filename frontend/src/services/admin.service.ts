import api from './api'
import type { DashboardStats, User, PaginatedResponse } from '@/types'

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/admin/dashboard')
    return res.data
  },

  async getUsers(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const res = await api.get<PaginatedResponse<User>>('/users', { params })
    return res.data
  },

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    const res = await api.patch<User>(`/users/${userId}`, { isActive })
    return res.data
  },

  async exportBookingsCsv(): Promise<Blob> {
    const res = await api.get('/admin/reports', { responseType: 'blob' })
    return res.data
  },
}
