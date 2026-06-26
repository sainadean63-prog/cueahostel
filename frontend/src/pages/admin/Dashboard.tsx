import { useQuery } from '@tanstack/react-query'
import { Building2, BedDouble, TrendingUp, Clock, CheckCircle2, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminService } from '@/services/admin.service'
import { formatCurrency } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

const mockOccupancyData = [
  { name: 'St. Mary', total: 40, occupied: 32 },
  { name: 'Aquinas', total: 60, occupied: 45 },
  { name: 'Fatima', total: 30, occupied: 28 },
  { name: 'Xavier', total: 50, occupied: 20 },
]

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminService.getDashboardStats,
  })

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>
  }

  const s = stats ?? {
    totalHostels: 0, totalBeds: 0, occupiedBeds: 0, occupancyRate: 0,
    totalBookings: 0, pendingBookings: 0, totalRevenue: 0, monthlyRevenue: 0,
  }

  const kpis = [
    { label: 'Total Hostels', value: s.totalHostels, icon: Building2, color: 'bg-blue-500' },
    { label: 'Total Beds', value: s.totalBeds, icon: BedDouble, color: 'bg-cuea-primary' },
    { label: 'Occupancy Rate', value: `${s.occupancyRate}%`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Pending Bookings', value: s.pendingBookings, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Total Bookings', value: s.totalBookings, icon: CheckCircle2, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: formatCurrency(s.totalRevenue), icon: DollarSign, color: 'bg-cuea-gold' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Overview</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Occupancy chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Occupancy by Hostel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mockOccupancyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#e5e7eb" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="occupied" fill="#A0002A" name="Occupied" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
