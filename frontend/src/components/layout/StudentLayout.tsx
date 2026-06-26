import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BedDouble, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/bookings', label: 'My Bookings', icon: BedDouble },
  { to: '/student/profile', label: 'Profile', icon: User },
]

export default function StudentLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-cuea-primary flex flex-col shrink-0">
        <div className="p-4 border-b border-white/20 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white p-0.5 shrink-0">
            <img src="/cuea-crest.png" alt="CUEA" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">CUEA Gaba</p>
            <p className="text-white/60 text-xs">Student Portal</p>
          </div>
        </div>
        {user && (
          <div className="p-4 border-b border-white/20 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-cuea-gold flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-white/60 text-xs truncate">{user.studentId}</p>
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
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-cuea-primary font-semibold text-lg">CUEA Gaba Hostel Portal</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
