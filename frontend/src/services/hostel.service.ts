import api from './api'
import type { Hostel, Room, Bed } from '@/types'
import type { HostelInput, BedInput } from '@/lib/schemas'

export const hostelService = {
  async getAll(): Promise<Hostel[]> {
    const res = await api.get<Hostel[]>('/hostels')
    return res.data
  },

  async getById(id: string): Promise<Hostel> {
    const res = await api.get<Hostel>(`/hostels/${id}`)
    return res.data
  },

  async getAvailability(id: string, semester: string): Promise<Bed[]> {
    const res = await api.get<Bed[]>(`/hostels/${id}/availability`, {
      params: { semester },
    })
    return res.data
  },

  async create(data: HostelInput): Promise<Hostel> {
    const res = await api.post<Hostel>('/hostels', data)
    return res.data
  },

  async update(id: string, data: Partial<HostelInput>): Promise<Hostel> {
    const res = await api.patch<Hostel>(`/hostels/${id}`, data)
    return res.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/hostels/${id}`)
  },

  async addRoom(hostelId: string, data: { roomNumber: string; floor: number }): Promise<Room> {
    const res = await api.post<Room>(`/hostels/${hostelId}/rooms`, data)
    return res.data
  },

  async addBed(roomId: string, data: BedInput): Promise<Bed> {
    const res = await api.post<Bed>(`/rooms/${roomId}/beds`, data)
    return res.data
  },

  async updateBed(bedId: string, data: Partial<BedInput>): Promise<Bed> {
    const res = await api.patch<Bed>(`/beds/${bedId}`, data)
    return res.data
  },
}
