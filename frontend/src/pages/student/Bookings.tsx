import { Link } from 'react-router-dom'
import { BedDouble } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/booking/StatusBadge'
import { useMyBookings } from '@/hooks/useBookings'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export default function StudentBookings() {
  const { data: bookings, isLoading } = useMyBookings()

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
        <Link to="/hostels">
          <Button size="sm">Book New Bed</Button>
        </Link>
      </div>

      {(bookings ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BedDouble className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">You have no bookings yet.</p>
            <Link to="/hostels" className="mt-4 inline-block">
              <Button size="sm">Browse Hostels</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings!.map((booking) => (
            <Link key={booking.id} to={`/student/bookings/${booking.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-cuea-primary/10 flex items-center justify-center">
                      <BedDouble className="h-5 w-5 text-cuea-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.bed?.room?.hostel?.name ?? 'Hostel'} — Bed {booking.bed?.bedNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.semester} · Booked {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p className="font-bold text-cuea-primary">{formatCurrency(booking.totalAmount)}</p>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
