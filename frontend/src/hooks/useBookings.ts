import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookingService } from '@/services/booking.service'
import type { BookingInput } from '@/lib/schemas'

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: bookingService.getMyBookings,
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  })
}

export function useAllBookings(params?: { status?: string; hostelId?: string; page?: number }) {
  return useQuery({
    queryKey: ['bookings', 'all', params],
    queryFn: () => bookingService.getAll(params),
  })
}

export function useCreateBooking(onSuccess?: (id: string) => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookingInput) => bookingService.create(data),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking created! Proceed to pay.')
      onSuccess?.(booking.id)
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Booking failed'),
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking cancelled')
    },
    onError: () => toast.error('Failed to cancel booking'),
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'CONFIRMED' | 'REJECTED' }) =>
      bookingService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking status updated')
    },
    onError: () => toast.error('Failed to update booking'),
  })
}
