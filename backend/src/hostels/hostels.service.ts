import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateHostelDto, UpdateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateBedDto, UpdateBedDto } from './dto/create-bed.dto';

@Injectable()
export class HostelsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const hostels = await this.prisma.hostel.findMany({
      where: { isActive: true },
      include: {
        rooms: {
          where: { isActive: true },
          include: { beds: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return hostels.map((h) => {
      const allBeds = h.rooms.flatMap((r) => r.beds);
      return {
        ...h,
        totalBeds: allBeds.length,
        availableBeds: allBeds.filter((b) => b.isAvailable).length,
      };
    });
  }

  async findOne(id: string) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id },
      include: {
        rooms: {
          where: { isActive: true },
          include: { beds: true },
          orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        },
      },
    });
    if (!hostel) throw new NotFoundException('Hostel not found');
    return hostel;
  }

  async getAvailability(hostelId: string, semester: string) {
    await this.findOne(hostelId);

    // find beds not booked for this semester in PENDING or CONFIRMED state
    const bookedBedIds = await this.prisma.booking.findMany({
      where: {
        bed: { room: { hostelId } },
        semester,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { bedId: true },
    });

    const occupied = new Set(bookedBedIds.map((b) => b.bedId));

    const beds = await this.prisma.bed.findMany({
      where: {
        room: { hostelId, isActive: true },
        isAvailable: true,
      },
      include: { room: true },
    });

    return beds.map((b) => ({ ...b, isAvailable: !occupied.has(b.id) }));
  }

  async create(dto: CreateHostelDto) {
    return this.prisma.hostel.create({ data: dto });
  }

  async update(id: string, dto: UpdateHostelDto) {
    await this.findOne(id);
    return this.prisma.hostel.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hostel.update({ where: { id }, data: { isActive: false } });
  }

  async addRoom(hostelId: string, dto: CreateRoomDto) {
    await this.findOne(hostelId);
    const exists = await this.prisma.room.findUnique({
      where: { hostelId_roomNumber: { hostelId, roomNumber: dto.roomNumber } },
    });
    if (exists) throw new ConflictException('Room number already exists in this hostel');
    return this.prisma.room.create({ data: { ...dto, hostelId } });
  }

  async addBed(roomId: string, dto: CreateBedDto) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    const exists = await this.prisma.bed.findUnique({
      where: { roomId_bedNumber: { roomId, bedNumber: dto.bedNumber } },
    });
    if (exists) throw new ConflictException('Bed number already exists in this room');
    return this.prisma.bed.create({ data: { ...dto, roomId } });
  }

  async updateBed(bedId: string, dto: UpdateBedDto) {
    const bed = await this.prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed) throw new NotFoundException('Bed not found');
    return this.prisma.bed.update({ where: { id: bedId }, data: dto });
  }
}
