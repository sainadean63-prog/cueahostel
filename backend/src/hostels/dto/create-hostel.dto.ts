import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { HostelGender } from '@prisma/client';

export class CreateHostelDto {
  @IsString() @MinLength(2) name: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @MinLength(5) address: string;
  @IsEnum(HostelGender) gender: HostelGender;
  @IsString() @IsOptional() imageUrl?: string;
}

export class UpdateHostelDto {
  @IsString() @IsOptional() @MinLength(2) name?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() @MinLength(5) address?: string;
  @IsEnum(HostelGender) @IsOptional() gender?: HostelGender;
  @IsString() @IsOptional() imageUrl?: string;
}
