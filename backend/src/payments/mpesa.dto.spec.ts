import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MpesaCallbackDto } from './dto/mpesa.dto';

describe('MpesaCallbackDto', () => {
  it('accepts and transforms the nested Safaricom success callback', async () => {
    const callback = plainToInstance(MpesaCallbackDto, {
      Body: {
        stkCallback: {
          MerchantRequestID: 'merchant-request',
          CheckoutRequestID: 'checkout-request',
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 1500 },
              { Name: 'MpesaReceiptNumber', Value: 'QGH1234567' },
              { Name: 'PhoneNumber', Value: 254712345678 },
            ],
          },
        },
      },
    });

    await expect(validate(callback, { whitelist: true, forbidNonWhitelisted: true })).resolves.toHaveLength(0);
  });
});
