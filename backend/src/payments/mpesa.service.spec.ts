import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { MpesaService } from './mpesa.service';

describe('MpesaService', () => {
  const settings: Record<string, string> = {
    NODE_ENV: 'production',
    MPESA_ENVIRONMENT: 'production',
    MPESA_CONSUMER_KEY: 'consumer-key',
    MPESA_CONSUMER_SECRET: 'consumer-secret',
    MPESA_SHORTCODE: '123456',
    MPESA_PASSKEY: 'pass-key',
    MPESA_CALLBACK_URL: 'https://hostels.example.com/api/v1/payments/mpesa/callback',
  };
  const productionSettings = { ...settings };
  let service: MpesaService;

  beforeEach(async () => {
    jest.restoreAllMocks();
    Object.assign(settings, productionSettings);
    const module = await Test.createTestingModule({
      providers: [
        MpesaService,
        { provide: ConfigService, useValue: { get: (key: string) => settings[key] } },
      ],
    }).compile();
    service = module.get(MpesaService);
  });

  it('requests a live STK prompt with the normalized phone and server-calculated amount', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: { access_token: 'access-token', expires_in: '3599' },
    });
    const post = jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        ResponseCode: '0',
        CheckoutRequestID: 'ws_CO_123',
        CustomerMessage: 'Success. Request accepted for processing',
      },
    });

    const result = await service.stkPush({
      phone: '0712345678',
      amount: 1500.2,
      bookingId: 'booking-123',
      accountRef: 'booking-ref',
    });

    expect(result.CheckoutRequestID).toBe('ws_CO_123');
    expect(post).toHaveBeenCalledWith(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      expect.objectContaining({
        BusinessShortCode: '123456',
        Amount: 1501,
        PartyA: '254712345678',
        PhoneNumber: '254712345678',
        CallBackURL: settings.MPESA_CALLBACK_URL,
      }),
      expect.objectContaining({
        headers: { Authorization: 'Bearer access-token' },
        timeout: 20000,
      }),
    );
  });

  it('does not send an STK request when production credentials are missing', async () => {
    delete settings.MPESA_CONSUMER_KEY;
    const get = jest.spyOn(axios, 'get');

    await expect(service.stkPush({
      phone: '0712345678',
      amount: 1500,
      bookingId: 'booking-123',
      accountRef: 'booking-ref',
    })).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(get).not.toHaveBeenCalled();
    Object.assign(settings, productionSettings);
  });
});
