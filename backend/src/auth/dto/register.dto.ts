import {
  IsEmail, IsString, MinLength,
  IsInt, Min, Max, Matches, IsIn,
} from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) @Matches(/^[A-Za-z][A-Za-z\s'-]*$/) firstName: string;
  @IsString() @MinLength(2) @Matches(/^[A-Za-z][A-Za-z\s'-]*$/) lastName: string;
  @IsEmail() email: string;
  @IsString() @Matches(/^\d{4,20}$/, { message: 'Student ID must contain 4 to 20 digits' }) studentId: string;
  @IsString() @Matches(/^(\+254|0)[17]\d{8}$/, { message: 'Invalid Kenyan phone number' }) phone: string;
  @IsString() @MinLength(2) course: string;
  @IsIn(['DIPLOMA', 'DEGREE']) programType: 'DIPLOMA' | 'DEGREE';
  @IsInt() @Min(1) @Max(4) yearOfStudy: number;
  @IsString() @MinLength(8) password: string;
}
