import { Link } from 'react-router-dom'
import { BedDouble, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/booking/StatusBadge'
import { useMyBookings } from '@/hooks/useBookings'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const { data: bookings, isLoading } = useMyBookings()

  const confirmed = bookings?.filter((b) => b.status === 'CONFIRMED').length ?? 0
  const pending = bookings?.filter((b) => b.status === 'PENDING').length ?? 0
  const cancelled = bookings?.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED').length ?? 0
  const recent = (bookings ?? []).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-cuea-gradient rounded-xl p-6 text-white">
        <p className="text-white/70 text-sm">Welcome back,</p>
        <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
        <p className="text-white/70 text-sm mt-1">{user?.studentId} · {user?.course}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Confirmed', value: confirmed, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-600' },
          { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Icon className={`h-6 w-6 mb-1 ${color}`} />
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Bookings</CardTitle>
          <Link to="/student/bookings">
            <Button variant="ghost" size="sm" className="text-cuea-primary gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6"><Spinner className="text-cuea-primary" /></div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <BedDouble className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No bookings yet.</p>
              <Link to="/hostels">
                <Button size="sm">Browse Hostels</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {recent.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/student/bookings/${booking.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.bed?.room?.hostel?.name ?? 'Hostel'}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.semester} · {formatDate(booking.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-cuea-primary">{formatCurrency(booking.totalAmount)}</span>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
