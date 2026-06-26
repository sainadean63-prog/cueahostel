import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateRoomDto {
  @IsString() roomNumber: string;
  @IsInt() @Min(1) @Max(20) floor: number;
}
