import { useState } from 'react'
import { Check, X, BedDouble } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookingStatusBadge } from '@/components/booking/StatusBadge'
import { useAllBookings, useUpdateBookingStatus } from '@/hooks/useBookings'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const { data, isLoading } = useAllBookings(
    statusFilter !== 'ALL' ? { status: statusFilter } : undefined
  )
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus()

  const bookings = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BedDouble className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">No bookings found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">
                      {booking.user?.firstName} {booking.user?.lastName}
                      <span className="text-xs text-muted-foreground ml-2">{booking.user?.studentId}</span>
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {booking.bed?.room?.hostel?.name} — Room {booking.bed?.room?.roomNumber}, Bed {booking.bed?.bedNumber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {booking.semester} · Booked {formatDate(booking.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-bold text-cuea-primary">{formatCurrency(booking.totalAmount)}</p>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
                {booking.status === 'PENDING' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={isPending}
                      onClick={() => updateStatus({ id: booking.id, status: 'CONFIRMED' })}
                    >
                      <Check className="h-3.5 w-3.5" /> Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-red-300 text-red-600 hover:bg-red-50"
                      disabled={isPending}
                      onClick={() => updateStatus({ id: booking.id, status: 'REJECTED' })}
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
