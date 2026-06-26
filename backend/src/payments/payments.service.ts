import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MpesaService } from './mpesa.service';
import { StkPushDto, MpesaCallbackDto } from './dto/mpesa.dto';
import { User } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private mpesa: MpesaService,
  ) {}

  async initiateStkPush(user: User, dto: StkPushDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.id) throw new BadRequestException('Not your booking');

    // Check for already paid
    const paid = await this.prisma.payment.findFirst({
      where: { bookingId: dto.bookingId, status: 'SUCCESS' },
    });
    if (paid) throw new BadRequestException('Booking already paid');

    const result = await this.mpesa.stkPush({
      phone: dto.phone,
      amount: Number(booking.totalAmount),
      bookingId: booking.id,
      accountRef: booking.id.slice(0, 12),
    });

    // Store pending payment record
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        phoneNumber: dto.phone,
        mpesaCheckoutId: result.CheckoutRequestID,
        status: 'PENDING',
      },
    });

    return {
      checkoutRequestId: result.CheckoutRequestID,
      paymentId: payment.id,
      message: result.CustomerMessage,
    };
  }

  async handleCallback(dto: MpesaCallbackDto) {
    const cb = dto.Body.stkCallback;
    const payment = await this.prisma.payment.findUnique({
      where: { mpesaCheckoutId: cb.CheckoutRequestID },
    });
    if (!payment) return { received: true };

    if (cb.ResultCode === 0) {
      const items = cb.CallbackMetadata?.Item ?? [];
      const receipt = items.find((i) => i.Name === 'MpesaReceiptNumber')?.Value as string;

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', mpesaReceiptNo: receipt, paidAt: new Date() },
        }),
        this.prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        }),
      ]);
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }

    return { received: true };
  }

  async pollStatus(checkoutRequestId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { mpesaCheckoutId: checkoutRequestId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getPaymentsByBooking(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
