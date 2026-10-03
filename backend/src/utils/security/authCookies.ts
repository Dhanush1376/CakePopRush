import { Response } from 'express';

export const CUSTOMER_REFRESH_COOKIE = 'cpr_refresh_token';
export const ADMIN_REFRESH_COOKIE = 'cpr_admin_refresh_token';

const getCookieOptions = (maxAgeDays: number = 3650) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
};

export const setCustomerRefreshCookie = (res: Response, token: string): void => {
  res.cookie(CUSTOMER_REFRESH_COOKIE, token, getCookieOptions(3650));
};

export const clearCustomerRefreshCookie = (res: Response): void => {
  const options = getCookieOptions(0);
  res.clearCookie(CUSTOMER_REFRESH_COOKIE, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
    domain: options.domain,
  });
};

export const setAdminRefreshCookie = (res: Response, token: string): void => {
  res.cookie(ADMIN_REFRESH_COOKIE, token, getCookieOptions(3650));
};

export const clearAdminRefreshCookie = (res: Response): void => {
  const options = getCookieOptions(0);
  res.clearCookie(ADMIN_REFRESH_COOKIE, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
    domain: options.domain,
  });
};
