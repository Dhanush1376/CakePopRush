import { canonicalizeEmail } from '../utils/email/emailHelper';
import User from '../models/User';
import logger from './logger';

export const getSuperAdminEmail = (): string | undefined => {
  const email = (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
  return email ? canonicalizeEmail(email) : undefined;
};

export const getAdminEmails = (): string[] => {
  const emails = [
    (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase(),
  ];
  return emails.filter(Boolean).map(canonicalizeEmail);
};

export const isProtectedSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const protectedEmail = getSuperAdminEmail();
  if (!protectedEmail) return false;
  return canonicalizeEmail(email) === protectedEmail;
};

export const ADMIN_ROLES = ['owner', 'super_admin', 'main_admin', 'admin', 'editor', 'viewer'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const STAFF_ROLES = [
  'owner',
  'super_admin',
  'main_admin',
  'admin',
  'editor',
  'viewer',
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const isAdministrativeRole = (role?: string): boolean => {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  if (normalized === 'delivery_agent') return false;
  return (
    (STAFF_ROLES as readonly string[]).includes(role as any) ||
    (normalized !== 'customer' && normalized !== 'user' && normalized !== 'delivery_agent')
  );
};

export const DELIVERY_AGENT_ROLES = ['delivery_agent', 'DELIVERY_AGENT', 'delivery', 'DELIVERY'] as const;
export type DeliveryAgentRole = (typeof DELIVERY_AGENT_ROLES)[number];

export const isDeliveryAgentRole = (role?: string): boolean => {
  if (!role) return false;
  return (DELIVERY_AGENT_ROLES as readonly string[]).includes(role.toLowerCase());
};

export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 100,
  super_admin: 90,
  main_admin: 85,
  admin: 80,
  editor: 60,
  viewer: 40,
  delivery_agent: 20,
  DELIVERY_AGENT: 20,
  customer: 0,
  user: 0,
};

export const canActorManageTarget = (actorRole: string, targetRole: string): boolean => {
  const actorWeight = ROLE_HIERARCHY[actorRole] ?? 0;
  const targetWeight = ROLE_HIERARCHY[targetRole] ?? 0;

  if (actorWeight < 80) return false;
  if (actorRole === 'owner') return true;

  return actorWeight > targetWeight;
};

export const canActorAssignRole = (actorRole: string, roleToAssign: string): boolean => {
  const actorWeight = ROLE_HIERARCHY[actorRole] ?? 0;
  const targetWeight = ROLE_HIERARCHY[roleToAssign] ?? 0;

  if (actorWeight < 80) return false;
  if (actorRole === 'owner') return true;
  if (actorRole === 'super_admin' && roleToAssign !== 'owner') return true;

  return actorWeight > targetWeight;
};

/**
 * Ensures that if a user matching SUPER_ADMIN_EMAIL exists in the database,
 * they are guaranteed the super_admin role.
 */
export const bootstrapSuperAdmin = async (): Promise<void> => {
  try {
    const superEmail = getSuperAdminEmail();
    let superAdminUser: any = null;

    if (superEmail) {
      superAdminUser = await User.findOne({ email: superEmail });
      if (!superAdminUser && (process.env.SUPER_ADMIN_BOOTSTRAP_ENABLED === 'true' || process.env.NODE_ENV === 'development')) {
        superAdminUser = await User.create({
          email: superEmail,
          name: superEmail.split('@')[0],
          role: 'super_admin',
          emailVerified: true,
          isVerified: true,
          isLocked: false,
          lastLogin: new Date(),
        });
        logger.info(`[BOOTSTRAP] Created super_admin user ${superEmail} via SUPER_ADMIN_EMAIL env config`);
      } else if (superAdminUser) {
        let changed = false;
        if (superAdminUser.role !== 'super_admin') {
          const oldRole = superAdminUser.role;
          superAdminUser.role = 'super_admin';
          changed = true;
          logger.info(`[BOOTSTRAP] Upgraded existing user ${superEmail} from ${oldRole} to super_admin via SUPER_ADMIN_EMAIL env config`);
        }
        if (!superAdminUser.lastLogin) {
          superAdminUser.lastLogin = new Date();
          changed = true;
        }
        if (!superAdminUser.isVerified || !superAdminUser.emailVerified) {
          superAdminUser.isVerified = true;
          superAdminUser.emailVerified = true;
          changed = true;
        }
        if (changed) {
          await superAdminUser.save();
        }
      }
    }
  } catch (err: any) {
    logger.error(`[BOOTSTRAP ERROR] Failed to bootstrap super admin: ${err.message}`);
  }
};

