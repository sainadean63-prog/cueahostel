export type Role = 'STUDENT' | 'ADMIN'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'
export type BedType = 'SINGLE' | 'DOUBLE'
export type HostelGender = 'MALE' | 'FEMALE' | 'MIXED'

export interface User {
  id: string
  email: string
  role: Role
  firstName: string
  lastName: string
  studentId?: string
  phone: string
  course?: string
  yearOfStudy?: number
  isVerified: boolean
  isActive: boolean
  createdAt: string
}

export interface Hostel {
  id: string
  name: string
  description?: string
  address: string
  gender: HostelGender
  imageUrl?: string
  isActive: boolean
  createdAt: string
  rooms?: Room[]
  _count?: { rooms: number }
  availableBeds?: number
  totalBeds?: number
}

export interface Room {
  id: string
  hostelId: string
  roomNumber: string
  floor: number
  isActive: boolean
  beds?: Bed[]
}

export interface Bed {
  id: string
  roomId: string
  bedNumber: string
  type: BedType
  pricePerSemester: number
  isAvailable: boolean
  room?: Room
}

export interface Booking {
  id: string
  userId: string
  bedId: string
  checkIn: string
  checkOut: string
  semester: string
  status: BookingStatus
  totalAmount: number
  createdAt: string
  user?: User
  bed?: Bed & { room?: Room & { hostel?: Hostel } }
  payments?: Payment[]
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  mpesaCheckoutId?: string
  mpesaReceiptNo?: string
  phoneNumber: string
  status: PaymentStatus
  paidAt?: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface DashboardStats {
  totalHostels: number
  totalBeds: number
  occupiedBeds: number
  occupancyRate: number
  totalBookings: number
  pendingBookings: number
  totalRevenue: number
  monthlyRevenue: number
}
