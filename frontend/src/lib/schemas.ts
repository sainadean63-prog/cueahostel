import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    studentId: z.string().min(4, 'Student ID is required'),
    phone: z
      .string()
      .regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan phone number'),
    course: z.string().min(2, 'Course is required'),
    yearOfStudy: z.coerce.number().min(1).max(6),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const bookingSchema = z.object({
  bedId: z.string().uuid('Please select a bed'),
  semester: z.string().min(1, 'Semester is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
})

export const mpesaPaySchema = z.object({
  phone: z
    .string()
    .regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid M-PESA phone number'),
})

export const hostelSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  gender: z.enum(['MALE', 'FEMALE', 'MIXED']),
})

export const bedSchema = z.object({
  bedNumber: z.string().min(1, 'Bed number is required'),
  type: z.enum(['SINGLE', 'DOUBLE']),
  pricePerSemester: z.coerce.number().min(1, 'Price is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type RegisterFormInput = z.input<typeof registerSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type MpesaPayInput = z.infer<typeof mpesaPaySchema>
export type HostelInput = z.infer<typeof hostelSchema>
export type BedInput = z.infer<typeof bedSchema>
