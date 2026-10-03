import { z } from 'zod';

export const requestOtpSchema = z.object({
  identifier: z
    .string({ required_error: 'Mobile phone or email is required' })
    .min(3, 'Identifier must be at least 3 characters'),
});

export const verifyOtpSchema = z.object({
  challengeId: z.string({ required_error: 'challengeId is required' }).min(1),
  otp: z.string({ required_error: 'OTP is required' }).min(4, 'OTP must be at least 4 digits'),
});

export const googleAuthSchema = z.object({
  credential: z.string({ required_error: 'Google credential token is required' }).min(1),
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().optional(),
});

export const adminInviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z
    .string()
    .transform((val) => {
      const v = val.toLowerCase().trim();
      if (v === 'superadmin' || v === 'super admin') return 'super_admin';
      if (v === 'administrator') return 'admin';
      if (v === 'delivery agent' || v === 'deliveryagent' || v === 'delivery-agent') return 'delivery_agent';
      return v;
    })
    .pipe(
      z.enum(['owner', 'super_admin', 'main_admin', 'admin', 'editor', 'viewer', 'delivery_agent', 'DELIVERY_AGENT'], {
        errorMap: () => ({ message: 'Please select a valid role' }),
      })
    ),
  permissionsSummary: z.string().optional(),
});

export const adminInviteResponseSchema = z.object({
  inviteId: z.string().optional(),
  token: z.string().optional(),
  action: z.enum(['accept', 'reject', 'declined']).optional(),
});

export const acceptAdminInviteSchema = z.object({
  token: z.string({ required_error: 'Token is required' }).min(1),
});
