import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { MpesaService } from './mpesa.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  const payment = {
    id: 'payment-1',
    bookingId: 'booking-1',
    status: 'PENDING',
    amount: 1500,
    phoneNumber: '0712345678',
  };
  const prisma = {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    booking: { update: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MpesaService, useValue: {} },
      ],
    }).compile();
    service = module.get(PaymentsService);
  });

  it('confirms a pending payment only when callback amount and receipt match', async () => {
    prisma.payment.findUnique.mockResolvedValue(payment);
    prisma.payment.update.mockResolvedValue({});
    prisma.booking.update.mockResolvedValue({});
    prisma.$transaction.mockResolvedValue([]);

    const result = await service.handleCallback({
      Body: {
        stkCallback: {
          MerchantRequestID: 'merchant-1',
          CheckoutRequestID: 'checkout-1',
          ResultCode: 0,
          ResultDesc: 'Success',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 1500 },
              { Name: 'MpesaReceiptNumber', Value: 'QGH1234567' },
              { Name: 'PhoneNumber', Value: 254712345678 },
            ],
          },
        },
      },
    });

    expect(result).toEqual({ received: true });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.payment.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'SUCCESS', mpesaReceiptNo: 'QGH1234567' }),
    }));
    expect(prisma.booking.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { status: 'CONFIRMED' },
    }));
  });

  it('does not confirm an amount that differs from the booking payment', async () => {
    prisma.payment.findUnique.mockResolvedValue(payment);

    await service.handleCallback({
      Body: {
        stkCallback: {
          MerchantRequestID: 'merchant-1',
          CheckoutRequestID: 'checkout-1',
          ResultCode: 0,
          ResultDesc: 'Success',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 1 },
              { Name: 'MpesaReceiptNumber', Value: 'QGH1234567' },
            ],
          },
        },
      },
    });

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.payment.update).not.toHaveBeenCalled();
  });

  it('does not expose checkout status to another student', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      ...payment,
      booking: { userId: 'different-student' },
    });

    await expect(service.pollStatus(
      { id: 'student-1' } as User,
      'checkout-1',
    )).rejects.toBeInstanceOf(NotFoundException);
  });
});
