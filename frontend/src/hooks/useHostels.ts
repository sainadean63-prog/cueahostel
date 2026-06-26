import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { hostelService } from '@/services/hostel.service'
import type { HostelInput, BedInput } from '@/lib/schemas'

export function useHostels() {
  return useQuery({
    queryKey: ['hostels'],
    queryFn: hostelService.getAll,
    staleTime: 2 * 60 * 1000,
  })
}

export function useHostel(id: string) {
  return useQuery({
    queryKey: ['hostels', id],
    queryFn: () => hostelService.getById(id),
    enabled: !!id,
  })
}

export function useAvailability(hostelId: string, semester: string) {
  return useQuery({
    queryKey: ['availability', hostelId, semester],
    queryFn: () => hostelService.getAvailability(hostelId, semester),
    enabled: !!hostelId && !!semester,
  })
}

export function useCreateHostel(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: HostelInput) => hostelService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostels'] })
      toast.success('Hostel created successfully')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to create hostel'),
  })
}

export function useUpdateHostel(id: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<HostelInput>) => hostelService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostels'] })
      toast.success('Hostel updated')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to update hostel'),
  })
}

export function useDeleteHostel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hostelService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostels'] })
      toast.success('Hostel deactivated')
    },
    onError: () => toast.error('Failed to deactivate hostel'),
  })
}

export function useAddRoom(hostelId: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { roomNumber: string; floor: number }) =>
      hostelService.addRoom(hostelId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostels', hostelId] })
      toast.success('Room added')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to add room'),
  })
}

export function useAddBed(roomId: string, hostelId: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BedInput) => hostelService.addBed(roomId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostels', hostelId] })
      toast.success('Bed added')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to add bed'),
  })
}
