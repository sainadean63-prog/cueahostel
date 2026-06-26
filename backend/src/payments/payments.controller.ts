import {
  Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { StkPushDto, MpesaCallbackDto } from './dto/mpesa.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('mpesa/stkpush')
  @UseGuards(JwtAuthGuard)
  initiatePay(@CurrentUser() user: User, @Body() dto: StkPushDto) {
    return this.payments.initiateStkPush(user, dto);
  }

  @Post('mpesa/callback')
  @HttpCode(HttpStatus.OK)
  handleCallback(@Body() dto: MpesaCallbackDto) {
    return this.payments.handleCallback(dto);
  }

  @Get('status/:checkoutRequestId')
  @UseGuards(JwtAuthGuard)
  pollStatus(@Param('checkoutRequestId') id: string) {
    return this.payments.pollStatus(id);
  }

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  getByBooking(@Param('bookingId') bookingId: string) {
    return this.payments.getPaymentsByBooking(bookingId);
  }
}
