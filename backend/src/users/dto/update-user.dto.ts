import { IsString, IsOptional, IsBoolean, Matches, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString() @IsOptional() @MinLength(2) firstName?: string;
  @IsString() @IsOptional() @MinLength(2) lastName?: string;
  @IsString() @IsOptional() @Matches(/^(\+254|0)[17]\d{8}$/) phone?: string;
  @IsString() @IsOptional() course?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
