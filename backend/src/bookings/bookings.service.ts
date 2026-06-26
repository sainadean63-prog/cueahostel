import {
  Injectable, NotFoundException, ConflictException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/create-booking.dto';
import { User } from '@prisma/client';

const BOOKING_INCLUDE = {
  bed: {
    include: {
      room: {
        include: { hostel: true },
      },
    },
  },
  payments: { orderBy: { createdAt: 'desc' as const } },
  user: {
    select: {
      id: true, firstName: true, lastName: true,
      email: true, studentId: true, phone: true,
    },
  },
};

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, dto: CreateBookingDto) {
    const bed = await this.prisma.bed.findUnique({ where: { id: dto.bedId } });
    if (!bed || !bed.isAvailable) throw new NotFoundException('Bed not available');

    // Prevent double-booking for same semester
    const conflict = await this.prisma.booking.findFirst({
      where: {
        bedId: dto.bedId,
        semester: dto.semester,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    if (conflict) throw new ConflictException('Bed already booked for this semester');

    // One active booking per student per semester
    const studentConflict = await this.prisma.booking.findFirst({
      where: {
        userId: user.id,
        semester: dto.semester,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    if (studentConflict) {
      throw new ConflictException('You already have an active booking for this semester');
    }

    return this.prisma.booking.create({
      data: {
        userId: user.id,
        bedId: dto.bedId,
        semester: dto.semester,
        checkIn: new Date(dto.checkIn),
        checkOut: new Date(dto.checkOut),
        totalAmount: bed.pricePerSemester,
        status: 'PENDING',
      },
      include: BOOKING_INCLUDE,
    });
  }

  async findMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: BOOKING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string, isAdmin = false) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!isAdmin && booking.userId !== userId) throw new ForbiddenException();
    return booking;
  }

  async findAll(params: { status?: string; hostelId?: string; page?: number; limit?: number }) {
    const { status, hostelId, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (hostelId) where.bed = { room: { hostelId } };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        include: BOOKING_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async cancel(id: string, userId: string) {
    const booking = await this.findOne(id, userId);
    if (!['PENDING'].includes(booking.status)) {
      throw new BadRequestException('Only pending bookings can be cancelled');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: BOOKING_INCLUDE,
    });
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
      include: BOOKING_INCLUDE,
    });

    // Mark bed unavailable when confirmed
    if (dto.status === 'CONFIRMED') {
      await this.prisma.bed.update({
        where: { id: booking.bedId },
        data: { isAvailable: false },
      });
    }

    return updated;
  }
}
