import { IsString, IsEnum, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { BedType } from '@prisma/client';

export class CreateBedDto {
  @IsString() bedNumber: string;
  @IsEnum(BedType) type: BedType;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() pricePerSemester: number;
}

export class UpdateBedDto {
  @IsString() @IsOptional() bedNumber?: string;
  @IsEnum(BedType) @IsOptional() type?: BedType;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() @IsOptional() pricePerSemester?: number;
}
