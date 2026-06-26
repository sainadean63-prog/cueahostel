import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Smartphone, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useMpesaPay } from '@/hooks/usePayment'
import { mpesaPaySchema, type MpesaPayInput } from '@/lib/schemas'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  bookingId: string
  amount: number
}

export default function MpesaPayButton({ bookingId, amount }: Props) {
  const { user } = useAuthStore()
  const { pay, pending, polling, paid } = useMpesaPay(bookingId)
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<MpesaPayInput>({
    resolver: zodResolver(mpesaPaySchema),
    defaultValues: { phone: user?.phone ?? '' },
  })

  function onSubmit(data: MpesaPayInput) {
    pay(data.phone)
  }

  if (paid) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <CheckCircle2 className="h-5 w-5" />
        Payment Confirmed
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Smartphone className="h-4 w-4" />
          Pay via M-PESA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            M-PESA Payment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(amount)}</p>
          </div>

          {polling ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
              <p className="text-sm text-muted-foreground text-center">
                Waiting for M-PESA confirmation...<br />
                Check your phone and enter your PIN.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>M-PESA Phone Number</Label>
                <Input placeholder="e.g. 0712345678" {...register('phone')} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                You will receive an M-PESA prompt on your phone. Enter your PIN to complete payment.
              </p>
              <Button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700">
                {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Payment Request
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
