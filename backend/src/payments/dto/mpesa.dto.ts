import { IsString, IsUUID, Matches } from 'class-validator';

export class StkPushDto {
  @IsUUID() bookingId: string;
  @IsString() @Matches(/^(\+254|0)[17]\d{8}$/, { message: 'Invalid M-PESA phone number' })
  phone: string;
}

export class MpesaCallbackDto {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: { Name: string; Value: string | number }[];
      };
    };
  };
}
