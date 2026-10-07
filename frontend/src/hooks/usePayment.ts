import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { paymentService } from '@/services/payment.service'

export function useMpesaPay(bookingId: string) {
  const qc = useQueryClient()
  const [polling, setPolling] = useState(false)
  const [paid, setPaid] = useState(false)

  const mutation = useMutation({
    mutationFn: (phone: string) => paymentService.initiateStkPush(bookingId, phone),
    onSuccess: async ({ checkoutRequestId }) => {
      toast.success('Check your phone for the M-PESA prompt')
      setPolling(true)
      // Safaricom callbacks can take longer than one minute on live networks.
      for (let attempts = 0; attempts < 60; attempts++) {
        await new Promise((resolve) => window.setTimeout(resolve, 5000))
        try {
          const payment = await paymentService.pollPaymentStatus(checkoutRequestId)
          if (payment.status === 'SUCCESS') {
            setPolling(false)
            setPaid(true)
            qc.invalidateQueries({ queryKey: ['bookings'] })
            toast.success('Payment confirmed!')
            return
          } else if (payment.status === 'FAILED') {
            setPolling(false)
            toast.error('Payment failed. Please try again.')
            return
          }
        } catch {
          // keep polling
        }
      }
      setPolling(false)
      toast.error('No confirmation received yet. Check your booking status before trying again.')
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error.response?.data?.message ?? 'Failed to start M-PESA payment'),
  })

  return { pay: mutation.mutate, pending: mutation.isPending, polling, paid }
}
