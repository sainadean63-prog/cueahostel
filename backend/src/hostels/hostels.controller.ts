import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { HostelsService } from './hostels.service';
import { CreateHostelDto, UpdateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateBedDto, UpdateBedDto } from './dto/create-bed.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class HostelsController {
  constructor(private hostels: HostelsService) {}

  // ── Public ────────────────────────────────────────────────
  @Get('hostels')
  findAll() {
    return this.hostels.findAll();
  }

  @Get('hostels/:id')
  findOne(@Param('id') id: string) {
    return this.hostels.findOne(id);
  }

  @Get('hostels/:id/availability')
  availability(@Param('id') id: string, @Query('semester') semester: string) {
    return this.hostels.getAvailability(id, semester);
  }

  // ── Admin ─────────────────────────────────────────────────
  @Post('hostels')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateHostelDto) {
    return this.hostels.create(dto);
  }

  @Patch('hostels/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateHostelDto) {
    return this.hostels.update(id, dto);
  }

  @Delete('hostels/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.hostels.remove(id);
  }

  @Post('hostels/:id/rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  addRoom(@Param('id') hostelId: string, @Body() dto: CreateRoomDto) {
    return this.hostels.addRoom(hostelId, dto);
  }

  @Post('rooms/:roomId/beds')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  addBed(@Param('roomId') roomId: string, @Body() dto: CreateBedDto) {
    return this.hostels.addBed(roomId, dto);
  }

  @Patch('beds/:bedId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateBed(@Param('bedId') bedId: string, @Body() dto: UpdateBedDto) {
    return this.hostels.updateBed(bedId, dto);
  }
}
