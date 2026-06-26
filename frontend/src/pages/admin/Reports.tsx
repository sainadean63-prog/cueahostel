import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { adminService } from '@/services/admin.service'
import { Spinner } from '@/components/ui/spinner'

const mockMonthlyRevenue = [
  { month: 'Jan', revenue: 120000 },
  { month: 'Feb', revenue: 185000 },
  { month: 'Mar', revenue: 210000 },
  { month: 'Apr', revenue: 95000 },
  { month: 'May', revenue: 240000 },
  { month: 'Jun', revenue: 310000 },
]

export default function AdminReports() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminService.getDashboardStats,
  })

  function handleExport() {
    adminService.exportBookingsCsv().then((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cuea-bookings-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <Button onClick={handleExport} className="gap-2" variant="outline">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Date filter */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label>From Date</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>To Date</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <Button>Apply Filter</Button>
        </CardContent>
      </Card>

      {/* Revenue chart */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <BarChart2 className="h-5 w-5 text-cuea-primary" />
          <CardTitle className="text-base">Monthly Revenue (KES)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mockMonthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#A0002A" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: stats.totalBookings },
            { label: 'Confirmed', value: stats.totalBookings - stats.pendingBookings },
            { label: 'Pending', value: stats.pendingBookings },
            { label: 'Occupancy', value: `${stats.occupancyRate}%` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
