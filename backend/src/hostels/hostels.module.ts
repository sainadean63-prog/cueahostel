import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HostelsService } from './hostels.service';
import { HostelsController } from './hostels.controller';

@Module({
  providers: [HostelsService, PrismaService],
  controllers: [HostelsController],
  exports: [HostelsService],
})
export class HostelsModule {}
