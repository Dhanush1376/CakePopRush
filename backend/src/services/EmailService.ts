import nodemailer from 'nodemailer';
import logger from '../config/logger';

let mailTransporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (mailTransporter) return mailTransporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return mailTransporter;
};

export class EmailService {
  static async sendAdminInviteEmail(params: {
    toEmail: string;
    role: string;
    acceptUrl: string;
    inviterName?: string;
  }): Promise<void> {
    const { toEmail, role, acceptUrl, inviterName } = params;
    const transporter = getTransporter();

    const formattedRole =
      role === 'super_admin'
        ? 'Super Admin'
        : role === 'admin'
        ? 'Administrator'
        : role.charAt(0).toUpperCase() + role.slice(1);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #FFE4E1; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #FF69B4; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">CakePopRush</h1>
          <p style="color: #8B4513; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">Artisan Bakery & Treats</p>
        </div>
        
        <div style="background-color: #FFF0F5; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center; border: 1px dashed #FFB6C1;">
          <h2 style="color: #381E10; font-size: 20px; margin: 0 0 10px 0;">You're Invited to Join the Team!</h2>
          <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">
            ${inviterName ? `<strong>${inviterName}</strong> has invited you` : 'You have been invited'} to join the CakePopRush administrative workspace as a designated <strong style="color: #FF1493;">${formattedRole}</strong>.
          </p>
        </div>

        <div style="margin-bottom: 28px; text-align: center;">
          <p style="color: #666666; font-size: 14px; margin-bottom: 20px;">
            Click the button below to accept your invitation and activate your administrative access. This invitation link will expire in 7 days.
          </p>
          <a href="${acceptUrl}" style="display: inline-block; background-color: #FF69B4; color: #ffffff; padding: 14px 32px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 105, 180, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
            Accept Invitation
          </a>
        </div>

        <div style="border-top: 1px solid #F0E68C; padding-top: 20px; text-align: center;">
          <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
            If you did not expect this invitation or believe it was sent in error, you can safely ignore this email.
          </p>
          <p style="color: #CCCCCC; font-size: 11px; word-break: break-all; margin: 0;">
            Direct link: <a href="${acceptUrl}" style="color: #FF69B4;">${acceptUrl}</a>
          </p>
        </div>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || 'CakePopRush <hello@cakepoprush.com>',
          to: toEmail,
          subject: `Invitation to join CakePopRush as ${formattedRole}`,
          html: htmlContent,
        });
        logger.info(`[INVITE EMAIL] Successfully sent invitation email to ${toEmail}`);
      } catch (err: any) {
        logger.error(`[INVITE EMAIL ERROR] Failed to send email to ${toEmail}: ${err.message}`);
      }
    } else {
      logger.info(`[DEV INVITE EMAIL] Dispatched invite link to ${toEmail}: ${acceptUrl}`);
    }
  }

  static async sendDeliveryOtpEmail(params: {
    toEmail: string;
    customerName: string;
    orderNumber: string;
    otp: string;
  }): Promise<void> {
    const { toEmail, customerName, orderNumber, otp } = params;
    const transporter = getTransporter();

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #fff; border: 1px solid #FFE4E1; border-radius: 16px;">
        <h2 style="color: #FF1493; text-align: center; margin: 0 0 16px 0;">CakePopRush Delivery</h2>
        <p style="color: #444; font-size: 15px;">Hello ${customerName},</p>
        <p style="color: #444; font-size: 14px;">Your order <strong>${orderNumber}</strong> has arrived! Please provide the following Delivery Verification OTP to your delivery agent upon receiving your order:</p>
        <div style="background: #FFF0F5; border: 2px dashed #FF69B4; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #FF1493;">${otp}</span>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #888;">Valid for 15 minutes · One-time use</p>
        </div>
        <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">Do NOT share this code until you have received your package.</p>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || 'CakePopRush <orders@cakepoprush.com>',
          to: toEmail,
          subject: `Your Delivery Verification OTP for ${orderNumber}: ${otp}`,
          html: htmlContent,
        });
        logger.info(`[DELIVERY EMAIL] Successfully sent delivery OTP email to ${toEmail}`);
      } catch (err: any) {
        logger.error(`[DELIVERY EMAIL ERROR] Failed to send email to ${toEmail}: ${err.message}`);
      }
    } else {
      logger.info(`[DEV DELIVERY OTP EMAIL] Dispatched OTP to ${toEmail} for order ${orderNumber}: ${otp}`);
    }
  }
}

export default EmailService;
