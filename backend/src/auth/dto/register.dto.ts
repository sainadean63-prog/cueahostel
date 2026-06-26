import {
  IsEmail, IsString, MinLength, IsOptional,
  IsInt, Min, Max, Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) firstName: string;
  @IsString() @MinLength(2) lastName: string;
  @IsEmail() email: string;
  @IsString() @MinLength(4) studentId: string;
  @IsString() @Matches(/^(\+254|0)[17]\d{8}$/, { message: 'Invalid Kenyan phone number' }) phone: string;
  @IsString() @IsOptional() course?: string;
  @IsInt() @Min(1) @Max(6) @IsOptional() yearOfStudy?: number;
  @IsString() @MinLength(8) password: string;
}
