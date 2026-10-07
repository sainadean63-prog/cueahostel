import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters').regex(/^[A-Za-z][A-Za-z\s'-]*$/, 'Use letters only'),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').regex(/^[A-Za-z][A-Za-z\s'-]*$/, 'Use letters only'),
    email: z.string().email('Invalid email address'),
    studentId: z.string().regex(/^\d{4,20}$/, 'Student ID must contain 4 to 20 digits'),
    phone: z
      .string()
      .regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan phone number'),
    course: z.string().min(2, 'Course is required'),
    programType: z.enum(['DIPLOMA', 'DEGREE'], { message: 'Select a programme type' }),
    yearOfStudy: z.coerce.number().int().min(1).max(4),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.yearOfStudy <= (d.programType === 'DIPLOMA' ? 2 : 4), {
    message: 'Select a year available for this programme',
    path: ['yearOfStudy'],
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
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
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type MpesaPayInput = z.infer<typeof mpesaPaySchema>
export type HostelInput = z.infer<typeof hostelSchema>
export type BedInput = z.infer<typeof bedSchema>
