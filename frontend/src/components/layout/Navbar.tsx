import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { getInitials } from '@/lib/utils'

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-cuea-primary shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
            <img src="/cuea-crest.png" alt="CUEA Crest" className="h-full w-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-bold text-sm leading-tight">CUEA Gaba</p>
            <p className="text-white/70 text-xs">Hostel Management</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/hostels" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
            Hostels
          </Link>
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-cuea-primary">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-cuea-gold hover:bg-cuea-gold-dark text-white">
                  Register
                </Button>
              </Link>
            </>
          )}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3">
              <Link
                to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cuea-gold text-white text-xs font-bold">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <span className="text-white text-sm">{user.firstName}</span>
              </Link>
              <button onClick={handleLogout} className="text-white/70 hover:text-white transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cuea-primary-dark px-4 py-4 flex flex-col gap-3">
          <Link to="/hostels" className="text-white text-sm" onClick={() => setMenuOpen(false)}>Hostels</Link>
          {!isAuthenticated && (
            <>
              <Link to="/login" className="text-white text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-cuea-gold text-sm font-medium" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link
                to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                className="text-white text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-white/70 text-sm text-left">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
