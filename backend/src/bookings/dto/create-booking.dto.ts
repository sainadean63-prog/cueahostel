import { IsString, IsUUID, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @IsUUID() bedId: string;
  @IsString() semester: string;
  @IsDateString() checkIn: string;
  @IsDateString() checkOut: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus) status: 'CONFIRMED' | 'REJECTED';
}
