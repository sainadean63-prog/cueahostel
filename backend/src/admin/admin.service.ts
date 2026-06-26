import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalHostels,
      totalBeds,
      occupiedBeds,
      totalBookings,
      pendingBookings,
      revenueResult,
    ] = await this.prisma.$transaction([
      this.prisma.hostel.count({ where: { isActive: true } }),
      this.prisma.bed.count(),
      this.prisma.bed.count({ where: { isAvailable: false } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.amount ?? 0);

    // Monthly revenue (current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyResult = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', paidAt: { gte: monthStart } },
    });
    const monthlyRevenue = Number(monthlyResult._sum.amount ?? 0);

    return {
      totalHostels,
      totalBeds,
      occupiedBeds,
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      totalBookings,
      pendingBookings,
      totalRevenue,
      monthlyRevenue,
    };
  }

  async exportBookingsCsv(): Promise<string> {
    const bookings = await this.prisma.booking.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, studentId: true } },
        bed: { include: { room: { include: { hostel: { select: { name: true } } } } } },
        payments: { where: { status: 'SUCCESS' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'ID,Student,Student ID,Email,Hostel,Room,Bed,Semester,Status,Amount,M-PESA Receipt,Date\n';
    const rows = bookings.map((b) => {
      const receipt = b.payments[0]?.mpesaReceiptNo ?? '';
      return [
        b.id,
        `${b.user.firstName} ${b.user.lastName}`,
        b.user.studentId ?? '',
        b.user.email,
        b.bed.room.hostel.name,
        b.bed.room.roomNumber,
        b.bed.bedNumber,
        b.semester,
        b.status,
        Number(b.totalAmount),
        receipt,
        b.createdAt.toISOString(),
      ].join(',');
    });

    return header + rows.join('\n');
  }
}
