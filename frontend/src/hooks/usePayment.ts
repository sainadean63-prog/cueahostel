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
      // Poll every 5 s for up to 60 s
      let attempts = 0
      const interval = setInterval(async () => {
        attempts++
        try {
          const payment = await paymentService.pollPaymentStatus(checkoutRequestId)
          if (payment.status === 'SUCCESS') {
            clearInterval(interval)
            setPolling(false)
            setPaid(true)
            qc.invalidateQueries({ queryKey: ['bookings'] })
            toast.success('Payment confirmed!')
          } else if (payment.status === 'FAILED') {
            clearInterval(interval)
            setPolling(false)
            toast.error('Payment failed. Please try again.')
          }
        } catch {
          // keep polling
        }
        if (attempts >= 12) {
          clearInterval(interval)
          setPolling(false)
          toast.error('Payment timed out. Check your booking status.')
        }
      }, 5000)
    },
    onError: () => toast.error('Failed to initiate payment'),
  })

  return { pay: mutation.mutate, pending: mutation.isPending, polling, paid }
}
