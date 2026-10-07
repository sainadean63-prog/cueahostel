import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authService } from '@/services/auth.service'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error')

  useEffect(() => {
    if (!token) return
    let active = true
    authService.verifyEmail(token)
      .then(() => { if (active) setState('success') })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [token])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
          <CardDescription>
            {state === 'loading' ? 'Verifying your email address…' : state === 'success' ? 'Your email address is verified.' : 'This verification link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {state === 'loading' && <Loader2 className="h-6 w-6 animate-spin mx-auto text-cuea-primary" />}
          {state === 'success' && <Link to="/login" className="text-cuea-primary font-medium hover:underline">Continue to sign in</Link>}
          {state === 'error' && <Link to="/register" className="text-cuea-primary font-medium hover:underline">Register again</Link>}
        </CardContent>
      </Card>
    </div>
  )
}
