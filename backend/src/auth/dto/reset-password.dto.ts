import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/, { message: 'Invalid or expired password reset link' })
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
