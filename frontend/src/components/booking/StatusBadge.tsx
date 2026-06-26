import { Badge } from '@/components/ui/badge'
import type { BookingStatus, PaymentStatus } from '@/types'

const bookingVariants: Record<BookingStatus, 'default' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'outline',
  REJECTED: 'destructive',
}

const paymentVariants: Record<PaymentStatus, 'success' | 'warning' | 'destructive'> = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={bookingVariants[status]}>{status}</Badge>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariants[status]}>{status}</Badge>
}
