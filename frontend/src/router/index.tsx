import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

import PublicLayout from '@/components/layout/PublicLayout'
import StudentLayout from '@/components/layout/StudentLayout'
import AdminLayout from '@/components/layout/AdminLayout'

import LandingPage from '@/pages/public/LandingPage'
import HostelsPage from '@/pages/public/HostelsPage'
import HostelDetailPage from '@/pages/public/HostelDetailPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'

import StudentDashboard from '@/pages/student/Dashboard'
import StudentBookings from '@/pages/student/Bookings'
import BookingDetailPage from '@/pages/student/BookingDetail'
import StudentProfile from '@/pages/student/Profile'

import AdminDashboard from '@/pages/admin/Dashboard'
import AdminHostels from '@/pages/admin/Hostels'
import AdminHostelDetail from '@/pages/admin/HostelDetail'
import AdminBookings from '@/pages/admin/Bookings'
import AdminUsers from '@/pages/admin/Users'
import AdminReports from '@/pages/admin/Reports'

function RequireAuth({ role }: { role?: 'STUDENT' | 'ADMIN' }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />
  }
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/hostels', element: <HostelsPage /> },
      { path: '/hostels/:id', element: <HostelDetailPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth role="STUDENT" />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          { path: '/student/dashboard', element: <StudentDashboard /> },
          { path: '/student/bookings', element: <StudentBookings /> },
          { path: '/student/bookings/:id', element: <BookingDetailPage /> },
          { path: '/student/profile', element: <StudentProfile /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth role="ADMIN" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/hostels', element: <AdminHostels /> },
          { path: '/admin/hostels/:id', element: <AdminHostelDetail /> },
          { path: '/admin/bookings', element: <AdminBookings /> },
          { path: '/admin/users', element: <AdminUsers /> },
          { path: '/admin/reports', element: <AdminReports /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
