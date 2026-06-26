import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BedDouble, Calendar, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/booking/StatusBadge'
import MpesaPayButton from '@/components/booking/MpesaPayButton'
import { useBooking, useCancelBooking } from '@/hooks/useBookings'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: booking, isLoading } = useBooking(id!)
  const cancelBooking = useCancelBooking()

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>
  }
  if (!booking) return <p className="text-center py-20 text-muted-foreground">Booking not found.</p>

  const hostel = booking.bed?.room?.hostel
  const room = booking.bed?.room
  const lastPayment = booking.payments?.[booking.payments.length - 1]
  const canPay = booking.status === 'PENDING' || booking.status === 'CONFIRMED'
  const alreadyPaid = lastPayment?.status === 'SUCCESS'
  const canCancel = booking.status === 'PENDING'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/student/bookings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cuea-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Booking Details</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">#{booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hostel info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-12 w-12 rounded-lg bg-cuea-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-cuea-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{hostel?.name ?? 'Hostel'}</p>
              <p className="text-sm text-muted-foreground">{hostel?.address}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <BedDouble className="inline h-3 w-3 mr-1" />
                Room {room?.roomNumber}, Floor {room?.floor} — Bed {booking.bed?.bedNumber} ({booking.bed?.type})
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Check-in</p>
                <p className="font-medium">{formatDate(booking.checkIn)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Check-out</p>
                <p className="font-medium">{formatDate(booking.checkOut)}</p>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div className="border rounded-lg divide-y">
            <div className="flex justify-between p-3 text-sm">
              <span className="text-muted-foreground">Semester</span>
              <span>{booking.semester}</span>
            </div>
            <div className="flex justify-between p-3 text-sm">
              <span className="text-muted-foreground">Booked on</span>
              <span>{formatDate(booking.createdAt)}</span>
            </div>
            <div className="flex justify-between p-3 font-bold">
              <span>Total Amount</span>
              <span className="text-cuea-primary">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>

          {/* Payment status */}
          {lastPayment && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-muted-foreground">Payment status</span>
              <div className="flex items-center gap-2">
                {lastPayment.mpesaReceiptNo && (
                  <span className="text-xs font-mono text-muted-foreground">{lastPayment.mpesaReceiptNo}</span>
                )}
                <PaymentStatusBadge status={lastPayment.status} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {canPay && !alreadyPaid && (
              <MpesaPayButton bookingId={booking.id} amount={booking.totalAmount} />
            )}
            {canCancel && (
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                disabled={cancelBooking.isPending}
                onClick={() => cancelBooking.mutate(booking.id)}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
