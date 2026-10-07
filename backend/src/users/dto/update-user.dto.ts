import { IsString, IsOptional, IsBoolean, Matches, MinLength, IsIn, IsInt, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsString() @IsOptional() @MinLength(2) @Matches(/^[A-Za-z][A-Za-z\s'-]*$/) firstName?: string;
  @IsString() @IsOptional() @MinLength(2) @Matches(/^[A-Za-z][A-Za-z\s'-]*$/) lastName?: string;
  @IsString() @IsOptional() @Matches(/^(\+254|0)[17]\d{8}$/) phone?: string;
  @IsString() @IsOptional() course?: string;
  @IsIn(['DIPLOMA', 'DEGREE']) @IsOptional() programType?: 'DIPLOMA' | 'DEGREE';
  @IsInt() @Min(1) @Max(4) @IsOptional() yearOfStudy?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
