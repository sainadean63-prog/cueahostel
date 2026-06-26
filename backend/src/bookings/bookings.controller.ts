import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookings: BookingsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookings.create(user, dto);
  }

  @Get('my')
  getMyBookings(@CurrentUser() user: User) {
    return this.bookings.findMyBookings(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll(
    @Query('status') status?: string,
    @Query('hostelId') hostelId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookings.findAll({
      status,
      hostelId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookings.findOne(id, user.id, user.role === Role.ADMIN);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookings.cancel(id, user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.bookings.updateStatus(id, dto);
  }
}
