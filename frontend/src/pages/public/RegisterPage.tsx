import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterInput, type RegisterFormInput } from '@/lib/schemas'

export default function RegisterPage() {
  const { register: registerUser, registerPending } = useAuth()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormInput, unknown, RegisterInput>({
    resolver: zodResolver(registerSchema),
  })
  const selectedYear = watch('yearOfStudy')
  const programType = watch('programType')
  const availableYears = programType === 'DIPLOMA' ? [1, 2] : programType === 'DEGREE' ? [1, 2, 3, 4] : []

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md p-1">
            <img src="/cuea-crest.png" alt="CUEA Crest" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Register to book a hostel at CUEA Gaba Campus</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-cuea-primary" /> Student Registration
            </CardTitle>
            <CardDescription>All fields are required unless stated</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => registerUser(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name</Label>
                  <Input placeholder="John" {...register('firstName')} />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" {...register('lastName')} />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Student ID</Label>
                <Input placeholder="Numbers only" inputMode="numeric" {...register('studentId')} />
                {errors.studentId && <p className="text-xs text-destructive">{errors.studentId.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Email Address</Label>
                <Input type="email" placeholder="student@cuea.edu" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Phone Number</Label>
                <Input placeholder="0712345678" {...register('phone')} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Course</Label>
                <Input placeholder="e.g. Computer Science" {...register('course')} />
                {errors.course && <p className="text-xs text-destructive">{errors.course.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Programme Type</Label>
                  <Select
                    value={programType}
                    onValueChange={(value: 'DIPLOMA' | 'DEGREE') => {
                      setValue('programType', value, { shouldValidate: true, shouldDirty: true })
                      const maxYear = value === 'DIPLOMA' ? 2 : 4
                      if (typeof selectedYear === 'number' && selectedYear > maxYear) {
                        setValue('yearOfStudy', maxYear, { shouldValidate: true, shouldDirty: true })
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select programme" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIPLOMA">Diploma (2 years)</SelectItem>
                      <SelectItem value="DEGREE">Degree (4 years)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.programType && <p className="text-xs text-destructive">{errors.programType.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Year of Study</Label>
                  <Select
                    value={selectedYear !== undefined ? String(selectedYear) : undefined}
                    disabled={!programType}
                    onValueChange={(value) => setValue('yearOfStudy', Number(value), { shouldValidate: true, shouldDirty: true })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={String(year)}>Year {year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.yearOfStudy && <p className="text-xs text-destructive">{errors.yearOfStudy.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Min 8 characters" {...register('password')} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Confirm Password</Label>
                  <Input type="password" placeholder="Repeat password" {...register('confirmPassword')} />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={registerPending}>
                {registerPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Account
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-cuea-primary font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
