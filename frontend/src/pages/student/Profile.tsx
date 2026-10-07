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
  firstName: z.string().trim().min(2).regex(/^[A-Za-z][A-Za-z\s'-]*$/, 'Use letters only'),
  lastName: z.string().trim().min(2).regex(/^[A-Za-z][A-Za-z\s'-]*$/, 'Use letters only'),
  phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid phone number'),
  course: z.string().optional(),
  programType: z.enum(['DIPLOMA', 'DEGREE']).optional(),
  yearOfStudy: z.number().int().min(1).max(4).optional(),
}).refine((data) => !data.programType || !data.yearOfStudy || data.yearOfStudy <= (data.programType === 'DIPLOMA' ? 2 : 4), {
  message: 'Select a year available for this programme',
  path: ['yearOfStudy'],
})

type ProfileInput = z.infer<typeof profileSchema>

export default function StudentProfile() {
  const { user, setAuth, accessToken } = useAuthStore()
  const qc = useQueryClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      course: user?.course ?? '',
      programType: user?.programType,
      yearOfStudy: user?.yearOfStudy,
    },
  })
  const programType = watch('programType')

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
              <Label>Course name</Label>
              <Input {...register('course')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Programme Type</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={programType ?? ''}
                  onChange={(event) => {
                    const value = event.target.value as 'DIPLOMA' | 'DEGREE' | ''
                    setValue('programType', value || undefined, { shouldValidate: true, shouldDirty: true })
                    const maxYear = value === 'DIPLOMA' ? 2 : 4
                    const currentYear = watch('yearOfStudy')
                    if (currentYear && currentYear > maxYear) {
                      setValue('yearOfStudy', maxYear, { shouldValidate: true, shouldDirty: true })
                    }
                  }}
                >
                  <option value="">Select programme</option>
                  <option value="DIPLOMA">Diploma (2 years)</option>
                  <option value="DEGREE">Degree (4 years)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Year of Study</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                  value={watch('yearOfStudy') ?? ''}
                  disabled={!programType}
                  onChange={(event) => setValue('yearOfStudy', Number(event.target.value), { shouldValidate: true, shouldDirty: true })}
                >
                  <option value="">Select year</option>
                  {(programType === 'DIPLOMA' ? [1, 2] : programType === 'DEGREE' ? [1, 2, 3, 4] : []).map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
                {errors.yearOfStudy && <p className="text-xs text-destructive">{errors.yearOfStudy.message}</p>}
              </div>
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
