import api from './api'
import type { Payment } from '@/types'

export const paymentService = {
  async initiateStkPush(bookingId: string, phone: string): Promise<{ checkoutRequestId: string; message: string }> {
    const res = await api.post('/payments/mpesa/stkpush', { bookingId, phone })
    return res.data
  },

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    const res = await api.get<Payment[]>(`/payments/booking/${bookingId}`)
    return res.data
  },

  async pollPaymentStatus(checkoutRequestId: string): Promise<Payment> {
    const res = await api.get<Payment>(`/payments/status/${checkoutRequestId}`)
    return res.data
  },
}
