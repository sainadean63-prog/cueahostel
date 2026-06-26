import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

@Module({
  providers: [BookingsService, PrismaService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
