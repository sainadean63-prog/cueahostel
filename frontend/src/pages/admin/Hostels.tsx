import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building2, Settings, Trash2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHostels, useCreateHostel, useDeleteHostel } from '@/hooks/useHostels'
import { hostelSchema, type HostelInput } from '@/lib/schemas'
import { Spinner } from '@/components/ui/spinner'

function CreateHostelDialog() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<HostelInput>({
    resolver: zodResolver(hostelSchema),
  })
  const { mutate, isPending } = useCreateHostel(() => { setOpen(false); reset() })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Hostel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Hostel</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
          <div className="space-y-1">
            <Label>Hostel Name</Label>
            <Input placeholder="e.g. St. Mary Hostel" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Input placeholder="e.g. Gaba Road, Block A" {...register('address')} />
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Gender</Label>
            <Select onValueChange={(v) => setValue('gender', v as 'MALE' | 'FEMALE' | 'MIXED')}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="MIXED">Mixed</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Description (optional)</Label>
            <Input placeholder="Brief description..." {...register('description')} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Hostel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminHostels() {
  const { data: hostels, isLoading } = useHostels()
  const { mutate: deleteHostel, isPending: deleting } = useDeleteHostel()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Hostels</h2>
        <CreateHostelDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>
      ) : (hostels ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">No hostels yet. Add one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostels!.map((hostel) => (
            <Card key={hostel.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cuea-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-cuea-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{hostel.name}</p>
                      <p className="text-xs text-muted-foreground">{hostel.address}</p>
                    </div>
                  </div>
                  <Badge variant={hostel.gender === 'MALE' ? 'default' : hostel.gender === 'FEMALE' ? 'secondary' : 'outline'}>
                    {hostel.gender}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Link to={`/admin/hostels/${hostel.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Settings className="h-3.5 w-3.5" /> Manage Rooms & Beds
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    disabled={deleting}
                    onClick={() => deleteHostel(hostel.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
