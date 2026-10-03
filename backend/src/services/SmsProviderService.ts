import fs from 'fs';
import path from 'path';
import logger from '../config/logger';

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<SmsResult>;
}

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `+91 ******${digits.slice(-4)}`;
  }
  return '******';
}

export class Fast2SmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    const apiKey = process.env.FAST2SMS_API_KEY?.trim();

    if (!apiKey) {
      logger.error('[SMS_PROVIDER] FAST2SMS_API_KEY missing in environment');
      return { success: false, error: 'SMS Gateway Configuration Error' };
    }

    const normalizedPhone = normalizeIndianPhone(phone);
    if (normalizedPhone.length !== 10 || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return { success: false, error: 'Invalid recipient phone number' };
    }

    try {
      const message = `Your OTP for CakePopRush is ${otp}. Valid for 10 minutes. Please do not share this code.`;
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: apiKey,
        },
        body: JSON.stringify({
          route: 'q',
          message,
          numbers: normalizedPhone,
        }),
        signal: AbortSignal.timeout(10000),
      });

      const data = (await response.json()) as any;
      if (response.ok && data?.return === true) {
        logger.info(`[SMS_PROVIDER] OTP successfully sent to ${maskPhone(phone)}`);
        return { success: true, messageId: String(data?.request_id || 'fast2sms') };
      }

      const errMsg = data?.message || `HTTP ${response.status}`;
      logger.error(`[SMS_PROVIDER] Fast2SMS dispatch failed: ${errMsg}`);
      return { success: false, error: errMsg };
    } catch (err: any) {
      logger.error(`[SMS_PROVIDER] Fast2SMS error: ${err.message}`);
      return { success: false, error: 'SMS gateway communication failure' };
    }
  }
}

export class MockSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    try {
      const logPath = path.resolve(process.cwd(), '.dev-otp-log');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] To: ${phone} | OTP: ${otp}\n`;

      fs.appendFileSync(logPath, logEntry, 'utf8');
      logger.info(`[DEV OTP] Dispatched OTP to ${phone}: ${otp}`);
      return { success: true, messageId: `mock-${Date.now()}` };
    } catch (_error) {
      return { success: false, error: 'Mock SMS Provider Error' };
    }
  }
}

export function getSmsProvider(): SmsProvider {
  const configuredProvider = (process.env.SMS_PROVIDER || '').trim().toLowerCase();

  if (configuredProvider === 'fast2sms' && process.env.FAST2SMS_API_KEY) {
    return new Fast2SmsProvider();
  }

  return new MockSmsProvider();
}
