import {
  Injectable, NotFoundException, BadRequestException, ConflictException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MpesaService } from './mpesa.service';
import { StkPushDto, MpesaCallbackDto } from './dto/mpesa.dto';
import { User } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

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
    if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
      throw new BadRequestException('Cannot pay for a cancelled or rejected booking');
    }
    if (Number(booking.totalAmount) < 1) {
      throw new BadRequestException('Booking amount must be at least KES 1');
    }

    // Check for already paid
    const paid = await this.prisma.payment.findFirst({
      where: { bookingId: dto.bookingId, status: 'SUCCESS' },
    });
    if (paid) throw new BadRequestException('Booking already paid');
    const pending = await this.prisma.payment.findFirst({
      where: { bookingId: dto.bookingId, status: 'PENDING' },
    });
    if (pending) throw new ConflictException('An M-PESA request is already pending for this booking');

    const result = await this.mpesa.stkPush({
      phone: dto.phone,
      amount: Number(booking.totalAmount),
      bookingId: booking.id,
      accountRef: booking.id.slice(0, 12),
    });

    // Store pending payment record
    let payment;
    try {
      payment = await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          phoneNumber: dto.phone,
          mpesaCheckoutId: result.CheckoutRequestID,
          status: 'PENDING',
        },
      });
    } catch (error) {
      this.logger.error(
        `M-PESA accepted checkout ${result.CheckoutRequestID} for booking ${booking.id}, but saving the payment record failed`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }

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
    if (payment.status === 'SUCCESS') return { received: true };

    if (cb.ResultCode === 0) {
      const items = cb.CallbackMetadata?.Item ?? [];
      const receipt = items.find((i) => i.Name === 'MpesaReceiptNumber')?.Value;
      const amount = items.find((i) => i.Name === 'Amount')?.Value;
      const phone = items.find((i) => i.Name === 'PhoneNumber')?.Value;
      if (typeof receipt !== 'string' || !receipt || Number(amount) !== Number(payment.amount)) {
        this.logger.error(`M-PESA callback verification failed for checkout ${cb.CheckoutRequestID}`);
        return { received: true };
      }
      if (phone !== undefined && this.normalizePhone(String(phone)) !== this.normalizePhone(payment.phoneNumber)) {
        this.logger.error(`M-PESA callback phone did not match checkout ${cb.CheckoutRequestID}`);
        return { received: true };
      }

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

  async pollStatus(user: User, checkoutRequestId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { mpesaCheckoutId: checkoutRequestId },
      include: { booking: { select: { userId: true } } },
    });
    if (!payment || payment.booking.userId !== user.id) throw new NotFoundException('Payment not found');
    const { booking, ...safePayment } = payment;
    return safePayment;
  }

  async getPaymentsByBooking(user: User, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true },
    });
    if (!booking || booking.userId !== user.id) throw new NotFoundException('Booking not found');
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private normalizePhone(phone: string) {
    return phone.replace(/^\+/, '').replace(/^0/, '254');
  }
}
