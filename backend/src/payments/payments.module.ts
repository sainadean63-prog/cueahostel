import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma.service';
import { MpesaService } from './mpesa.service';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [HttpModule],
  providers: [PaymentsService, MpesaService, PrismaService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
