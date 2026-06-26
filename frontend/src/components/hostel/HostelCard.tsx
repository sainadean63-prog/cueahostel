import { Link } from 'react-router-dom'
import { MapPin, BedDouble, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { Hostel } from '@/types'

const genderColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  MALE: 'default',
  FEMALE: 'secondary',
  MIXED: 'outline',
}

interface Props {
  hostel: Hostel
}

export default function HostelCard({ hostel }: Props) {
  const available = hostel.availableBeds ?? 0
  const total = hostel.totalBeds ?? 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 bg-gradient-to-br from-cuea-primary to-cuea-primary-dark overflow-hidden">
        {hostel.imageUrl ? (
          <img
            src={hostel.imageUrl}
            alt={hostel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BedDouble className="h-16 w-16 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={genderColors[hostel.gender] ?? 'outline'}>{hostel.gender}</Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              available > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {available > 0 ? `${available} beds available` : 'Fully booked'}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-base">{hostel.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{hostel.address}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {total} beds total
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="h-3 w-3" /> {available} free
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-cuea-primary font-bold text-sm">
            From {formatCurrency(0)}<span className="text-muted-foreground font-normal text-xs">/semester</span>
          </p>
          <Link to={`/hostels/${hostel.id}`}>
            <Button size="sm" disabled={available === 0}>
              {available > 0 ? 'Book Now' : 'No Availability'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
