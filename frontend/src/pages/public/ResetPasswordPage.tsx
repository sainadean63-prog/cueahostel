import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authService } from '@/services/auth.service'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })
  const mutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => authService.resetPassword(token, data),
    onSuccess: ({ message }) => toast.success(message),
    onError: () => toast.error('This reset link is invalid or has expired'),
  })

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <p className="text-sm text-destructive">This reset link is missing its token. Request a new one.</p>
          ) : (
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
              <div className="space-y-1">
                <Label>New Password</Label>
                <Input type="password" autoComplete="new-password" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending || mutation.isSuccess}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update password
              </Button>
              {mutation.isSuccess && (
                <p className="text-sm text-center">
                  <Link to="/login" className="text-cuea-primary hover:underline">Sign in with your new password</Link>
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
