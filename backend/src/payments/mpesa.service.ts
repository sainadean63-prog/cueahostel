import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { format } from 'date-fns';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(private config: ConfigService) {}

  private get isSandbox() {
    return this.config.get('MPESA_ENVIRONMENT') !== 'production';
  }

  private get baseUrl() {
    return this.isSandbox
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';
  }

  async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const key = this.config.get<string>('MPESA_CONSUMER_KEY');
    const secret = this.config.get<string>('MPESA_CONSUMER_SECRET');
    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');

    try {
      const { data } = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${credentials}` } },
      );
      this.tokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
      };
      return data.access_token;
    } catch (err) {
      this.logger.error('M-PESA token fetch failed', err);
      throw new InternalServerErrorException('M-PESA service unavailable');
    }
  }

  async stkPush(params: {
    phone: string;
    amount: number;
    bookingId: string;
    accountRef: string;
  }): Promise<{ CheckoutRequestID: string; CustomerMessage: string }> {
    const token = await this.getAccessToken();
    const shortCode = this.config.get<string>('MPESA_SHORTCODE')!;
    const passkey = this.config.get<string>('MPESA_PASSKEY')!;
    const callbackUrl = this.config.get<string>('MPESA_CALLBACK_URL')!;

    const timestamp = format(new Date(), 'yyyyMMddHHmmss');
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // Normalise phone to 2547XXXXXXXX
    const phone = params.phone.replace(/^0/, '254');

    const body = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(params.amount),
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: params.accountRef.slice(0, 12),
      TransactionDesc: 'CUEA Gaba Hostel Booking',
    };

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        body,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : String(err);
      this.logger.error('STK Push failed', msg);
      throw new InternalServerErrorException('M-PESA STK Push failed');
    }
  }
}
