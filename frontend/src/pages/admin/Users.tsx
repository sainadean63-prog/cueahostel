import { Users as UsersIcon } from 'lucide-react'
import { useState } from 'react'
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
  const [page, setPage] = useState(1)
  const limit = 20
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => adminService.getUsers({ page, limit }),
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
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / limit))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <p className="text-sm text-muted-foreground">{data?.total ?? 0} registered users</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="text-cuea-primary h-8 w-8" /></div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-sm text-destructive">Could not load users. Check the connection and try again.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
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
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      {user.studentId && <p>Student ID: {user.studentId}</p>}
                      {user.phone && <p>Phone: {user.phone}</p>}
                      <p>Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                      {(user.course || user.programType || user.yearOfStudy) && (
                        <p>
                          Programme: {user.course ?? 'Not provided'}
                          {user.programType ? ` (${user.programType.toLowerCase()})` : ''}
                          {user.yearOfStudy ? `, Year ${user.yearOfStudy}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={user.isVerified ? 'success' : 'warning'}>
                    {user.isVerified ? 'Email verified' : 'Email not verified'}
                  </Badge>
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
      {!isLoading && !isError && data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
