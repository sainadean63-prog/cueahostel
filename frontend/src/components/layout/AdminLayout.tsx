import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, BedDouble, Users, BarChart2, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { getInitials, cn } from '@/lib/utils'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/hostels', label: 'Hostels', icon: Building2 },
  { to: '/admin/bookings', label: 'Bookings', icon: BedDouble },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
]

export default function AdminLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white p-0.5 shrink-0">
              <img src="/cuea-crest.png" alt="CUEA" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">CUEA Gaba</p>
              <p className="text-white/40 text-xs">Admin Portal</p>
            </div>
          </div>
        </div>
        {user && (
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-cuea-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-white/40 text-xs">Administrator</p>
            </div>
          </div>
        )}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-cuea-primary text-white font-medium'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-gray-800 font-semibold text-lg">Admin Dashboard</h1>
          <span className="text-xs text-muted-foreground bg-cuea-primary/10 text-cuea-primary px-2 py-1 rounded-full font-medium">
            Administrator
          </span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
