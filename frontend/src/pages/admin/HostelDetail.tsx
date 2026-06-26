import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import BedGrid from '@/components/hostel/BedGrid'
import { useHostel, useAddRoom, useAddBed } from '@/hooks/useHostels'
import { bedSchema, type BedInput } from '@/lib/schemas'
import { Spinner } from '@/components/ui/spinner'
import type { Room } from '@/types'

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number required'),
  floor: z.coerce.number().min(1).max(20),
})
type RoomInput = z.infer<typeof roomSchema>

function AddRoomDialog({ hostelId }: { hostelId: string }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: { floor: 1 },
  })
  const { mutate, isPending } = useAddRoom(hostelId, () => { setOpen(false); reset() })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Room</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
          <div className="space-y-1">
            <Label>Room Number</Label>
            <Input placeholder="e.g. A101" {...register('roomNumber')} />
            {errors.roomNumber && <p className="text-xs text-destructive">{errors.roomNumber.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Floor</Label>
            <Input type="number" min={1} {...register('floor')} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Add Room
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddBedDialog({ roomId, hostelId }: { roomId: string; hostelId: string }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<BedInput>({
    resolver: zodResolver(bedSchema),
  })
  const { mutate, isPending } = useAddBed(roomId, hostelId, () => { setOpen(false); reset() })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1 text-cuea-primary">
          <Plus className="h-3 w-3" /> Add Bed
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add Bed</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
          <div className="space-y-1">
            <Label>Bed Number</Label>
            <Input placeholder="e.g. 1A" {...register('bedNumber')} />
            {errors.bedNumber && <p className="text-xs text-destructive">{errors.bedNumber.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select onValueChange={(v) => setValue('type', v as 'SINGLE' | 'DOUBLE')}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE">Single</SelectItem>
                <SelectItem value="DOUBLE">Double</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Price per Semester (KES)</Label>
            <Input type="number" placeholder="e.g. 35000" {...register('pricePerSemester')} />
            {errors.pricePerSemester && <p className="text-xs text-destructive">{errors.pricePerSemester.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Add Bed
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminHostelDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: hostel, isLoading } = useHostel(id!)

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>
  if (!hostel) return <p className="text-center py-20">Hostel not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/hostels">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{hostel.name}</h2>
            <p className="text-sm text-muted-foreground">{hostel.address}</p>
          </div>
        </div>
        <AddRoomDialog hostelId={hostel.id} />
      </div>

      {(hostel.rooms ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No rooms yet. Add a room to start adding beds.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {hostel.rooms!.map((room: Room) => (
            <Card key={room.id}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Room {room.roomNumber}
                  <span className="text-muted-foreground font-normal text-xs ml-2">Floor {room.floor}</span>
                </CardTitle>
                <AddBedDialog roomId={room.id} hostelId={hostel.id} />
              </CardHeader>
              <CardContent>
                <BedGrid beds={room.beds ?? []} readonly />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
