import {
  Allow,
  IsArray,
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StkPushDto {
  @IsUUID()
  bookingId: string;

  @IsString()
  @Matches(/^(\+254|0)[17]\d{8}$/, { message: 'Invalid M-PESA phone number' })
  phone: string;
}

export class MpesaCallbackItemDto {
  @IsString()
  Name: string;

  @Allow()
  @IsDefined()
  Value: string | number;
}

export class MpesaCallbackMetadataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MpesaCallbackItemDto)
  Item: MpesaCallbackItemDto[];
}

export class MpesaStkCallbackDto {
  @IsString()
  MerchantRequestID: string;

  @IsString()
  CheckoutRequestID: string;

  @IsInt()
  ResultCode: number;

  @IsString()
  ResultDesc: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MpesaCallbackMetadataDto)
  CallbackMetadata?: MpesaCallbackMetadataDto;
}

export class MpesaCallbackBodyDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => MpesaStkCallbackDto)
  stkCallback: MpesaStkCallbackDto;
}

export class MpesaCallbackDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => MpesaCallbackBodyDto)
  Body: MpesaCallbackBodyDto;
}
