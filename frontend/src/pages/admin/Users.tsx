import { Users as UsersIcon } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adminService } from '@/services/admin.service'
import { getInitials } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export default function AdminUsers() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getUsers(),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.toggleUserStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User status updated')
    },
    onError: () => toast.error('Failed to update user'),
  })

  const users = data?.data ?? []

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">User Management</h2>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UsersIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-cuea-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'} className="ml-2 text-[10px]">
                        {user.role}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {user.studentId && <p className="text-xs text-muted-foreground">{user.studentId}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={user.isActive ? 'success' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {user.role !== 'ADMIN' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate({ id: user.id, isActive: !user.isActive })}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
