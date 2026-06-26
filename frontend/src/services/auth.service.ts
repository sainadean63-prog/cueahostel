import api from './api'
import type { AuthResponse, User } from '@/types'
import type { LoginInput, RegisterInput } from '@/lib/schemas'

export const authService = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  async register(data: RegisterInput): Promise<{ message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _, ...payload } = data
    const res = await api.post('/auth/register', payload)
    return res.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/users/me')
    return res.data
  },
}
