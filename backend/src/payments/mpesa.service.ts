import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
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
    if (!key || !secret) {
      throw new ServiceUnavailableException('M-PESA credentials are not configured');
    }
    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');

    try {
      const { data } = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${credentials}` },
          timeout: 15000,
        },
      );
      if (typeof data.access_token !== 'string' || !data.access_token) {
        throw new Error('M-PESA returned no access token');
      }
      this.tokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + Math.max(Number(data.expires_in) - 60, 1) * 1000,
      };
      return data.access_token;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? `HTTP ${err.response?.status ?? 'network error'}: ${err.response?.data?.errorMessage ?? err.message}`
        : err instanceof Error ? err.message : String(err);
      this.logger.error(`M-PESA token fetch failed: ${message}`);
      throw new ServiceUnavailableException('M-PESA service unavailable');
    }
  }

  async stkPush(params: {
    phone: string;
    amount: number;
    bookingId: string;
    accountRef: string;
  }): Promise<{ CheckoutRequestID: string; CustomerMessage: string }> {
    const shortCode = this.config.get<string>('MPESA_SHORTCODE');
    const passkey = this.config.get<string>('MPESA_PASSKEY');
    const callbackUrl = this.config.get<string>('MPESA_CALLBACK_URL');
    if (!shortCode || !passkey || !callbackUrl) {
      throw new ServiceUnavailableException('M-PESA payment settings are incomplete');
    }
    let parsedCallbackUrl: URL;
    try {
      parsedCallbackUrl = new URL(callbackUrl);
    } catch {
      throw new InternalServerErrorException('M-PESA callback URL is invalid');
    }
    if (
      parsedCallbackUrl.protocol !== 'https:' &&
      this.config.get<string>('NODE_ENV') === 'production'
    ) {
      throw new InternalServerErrorException('M-PESA callback URL must use HTTPS in production');
    }
    const token = await this.getAccessToken();
    const timestamp = format(new Date(), 'yyyyMMddHHmmss');
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
    const phone = params.phone.replace(/^\+/, '').replace(/^0/, '254');

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
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000,
        },
      );
      if (
        typeof data.CheckoutRequestID !== 'string' ||
        !data.CheckoutRequestID ||
        Number(data.ResponseCode) !== 0
      ) {
        const message = data.CustomerMessage || data.ResponseDescription;
        this.logger.warn(`STK Push was not accepted: ${message ?? 'invalid response'}`);
        throw new ServiceUnavailableException(
          message || 'M-PESA did not accept the payment request',
        );
      }
      return data;
    } catch (err: unknown) {
      if (err instanceof ServiceUnavailableException) throw err;
      const msg = axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : String(err);
      this.logger.error('STK Push failed', msg);
      throw new ServiceUnavailableException(
        axios.isAxiosError(err)
          ? err.response?.data?.errorMessage ?? 'M-PESA STK Push failed; please try again'
          : 'M-PESA STK Push failed; please try again',
      );
    }
  }
}
