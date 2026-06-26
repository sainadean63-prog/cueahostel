import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, BedDouble, ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import BedGrid from '@/components/hostel/BedGrid'
import { useHostel, useAvailability } from '@/hooks/useHostels'
import { useCreateBooking } from '@/hooks/useBookings'
import { useAuthStore } from '@/store/auth.store'
import { bookingSchema, type BookingInput } from '@/lib/schemas'
import { formatCurrency } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import type { Bed } from '@/types'

const SEMESTERS = ['Semester 1 2026', 'Semester 2 2026', 'Semester 1 2027']

export default function HostelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0])
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)

  const { data: hostel, isLoading: hostelLoading } = useHostel(id!)
  const { data: availableBeds, isLoading: bedsLoading } = useAvailability(id!, selectedSemester)
  const createBooking = useCreateBooking((bookingId) => navigate(`/student/bookings/${bookingId}`))

  const { setValue } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
  })

  function handleBedSelect(bed: Bed) {
    setSelectedBed(bed)
    setValue('bedId', bed.id)
  }

  function handleBook() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!selectedBed) return
    createBooking.mutate({
      bedId: selectedBed.id,
      semester: selectedSemester,
      checkIn: new Date().toISOString(),
      checkOut: new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  if (hostelLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner className="text-cuea-primary h-8 w-8" />
      </div>
    )
  }

  if (!hostel) return <p className="text-center py-20 text-muted-foreground">Hostel not found.</p>

  // Group available beds by room
  const bedsByRoom = (availableBeds ?? []).reduce<Record<string, Bed[]>>((acc, bed) => {
    const roomId = bed.roomId
    if (!acc[roomId]) acc[roomId] = []
    acc[roomId].push(bed)
    return acc
  }, {})

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/hostels" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cuea-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Hostels
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: hostel info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-cuea-primary to-cuea-primary-dark">
            {hostel.imageUrl ? (
              <img src={hostel.imageUrl} alt={hostel.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BedDouble className="h-20 w-20 text-white/20" />
              </div>
            )}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary">{hostel.gender}</Badge>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{hostel.name}</h1>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
              <MapPin className="h-4 w-4" /> {hostel.address}
            </div>
            {hostel.description && <p className="text-muted-foreground text-sm">{hostel.description}</p>}
          </div>

          {/* Semester selector */}
          <div className="space-y-1">
            <Label>Select Semester</Label>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Bed grid per room */}
          {bedsLoading ? (
            <div className="flex justify-center py-8"><Spinner className="text-cuea-primary" /></div>
          ) : Object.keys(bedsByRoom).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No available beds for this semester.</p>
          ) : (
            Object.entries(bedsByRoom).map(([roomId, beds]) => (
              <Card key={roomId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Room {beds[0]?.room?.roomNumber ?? roomId.slice(0, 8)}
                    <span className="text-muted-foreground font-normal text-xs ml-2">
                      Floor {beds[0]?.room?.floor}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BedGrid
                    beds={beds}
                    selectedBedId={selectedBed?.id}
                    onSelect={handleBedSelect}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right: booking card */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Book a Bed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedBed ? (
                <>
                  <div className="bg-cuea-primary/5 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected bed</span>
                      <span className="font-medium">Bed {selectedBed.bedNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize">{selectedBed.type.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Semester</span>
                      <span>{selectedSemester}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-cuea-primary">{formatCurrency(selectedBed.pricePerSemester)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleBook}
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isAuthenticated ? 'Confirm Booking' : 'Login to Book'}
                  </Button>
                  <button
                    className="text-xs text-muted-foreground hover:text-cuea-primary w-full text-center"
                    onClick={() => setSelectedBed(null)}
                  >
                    Clear selection
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select an available bed from the grid on the left.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
