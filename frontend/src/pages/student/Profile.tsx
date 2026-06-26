import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth.store'
import api from '@/services/api'
import { getInitials } from '@/lib/utils'

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid phone number'),
  course: z.string().optional(),
})

type ProfileInput = z.infer<typeof profileSchema>

export default function StudentProfile() {
  const { user, setAuth, accessToken } = useAuthStore()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      course: user?.course ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ProfileInput) => api.patch('/users/me', data).then((r) => r.data),
    onSuccess: (updatedUser) => {
      setAuth(updatedUser, accessToken!)
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900">My Profile</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-cuea-primary flex items-center justify-center text-white font-bold">
              {user ? getInitials(user.firstName, user.lastName) : <User className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-base">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Course</Label>
              <Input {...register('course')} />
            </div>
            <div className="space-y-1">
              <Label>Student ID</Label>
              <Input value={user?.studentId ?? ''} disabled className="bg-gray-50" />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
