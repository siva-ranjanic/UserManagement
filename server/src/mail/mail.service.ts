import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMTPEmailer } from './smtp-emailer';
import { CommonEmailSendEntity } from './entity/CommonEmailSendEntity';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  private getEmailConfig() {
    return {
      host_name: this.configService.get('SMTP_HOST'),
      host_port: parseInt(this.configService.get('SMTP_PORT') || '587', 10),
      client_id: this.configService.get('SMTP_USER'),
      client_secret: this.configService.get('SMTP_PASS'),
      from: this.configService.get('SMTP_FROM') || 'noreply@example.com',
    };
  }

  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `http://localhost:5173/verify-email?token=${token}`;
    
    const emailData: CommonEmailSendEntity = {
      email_config: this.getEmailConfig(),
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #f8fafc; border-radius: 16px;">
          <h1 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Secure Your Account</h1>
          <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
            Thank you for joining our platform. To activate your profile, please click the verification button below.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Verify Identity</a>
        </div>
      `,
    };

    try {
      await SMTPEmailer.Instance.sendEmail(emailData);
      console.log(`[MAIL] Verification email sent to ${email}`);
    } catch (error) {
      console.error(`[MAIL ERROR] Failed to send verification email to ${email}:`, error.message);
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    
    const emailData: CommonEmailSendEntity = {
      email_config: this.getEmailConfig(),
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="color: #333;">Password Reset</h1>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Reset Password</a>
        </div>
      `,
    };

    try {
      await SMTPEmailer.Instance.sendEmail(emailData);
      console.log(`[MAIL] Password reset email sent to ${email}`);
    } catch (error) {
       console.error(`[MAIL ERROR] Failed to send password reset email to ${email}:`, error.message);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const emailData: CommonEmailSendEntity = {
      email_config: this.getEmailConfig(),
      to: email,
      subject: 'Welcome to our platform!',
      html: `<h1>Welcome, ${firstName}!</h1><p>Your account has been successfully created.</p>`,
    };

    try {
      await SMTPEmailer.Instance.sendEmail(emailData);
    } catch (error) {
      console.error(`[MAIL ERROR] Welcome email failed:`, error.message);
    }
  }

  async sendInvitationEmail(email: string, token: string, firstName: string) {
    const inviteUrl = `http://localhost:5173/accept-invitation?token=${token}`;
    
    // Check if SMTP is configured
    const config = this.getEmailConfig();
    const isSmtpConfigured = config.host_name && config.client_id && config.client_secret;

    if (!isSmtpConfigured) {
      console.warn(`[MAIL MOCK] SMTP not fully configured. Invitation for ${email} logged to console:`);
      console.log(`[INVITE LINK]: ${inviteUrl}`);
      return;
    }

    const emailData: CommonEmailSendEntity = {
      email_config: config,
      to: email,
      subject: 'You have been invited!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h1 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Welcome to the Team, ${firstName}!</h1>
          <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
            You have been invited to join our platform. Please click the button below to set your password and activate your account.
          </p>
          <div style="text-align: center;">
            <a href="${inviteUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Accept Invitation</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you did not expect this invitation, please ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await SMTPEmailer.Instance.sendEmail(emailData);
      console.log(`[MAIL] Invitation email sent to ${email}`);
    } catch (error) {
      console.error(`[MAIL ERROR] Failed to send invitation email to ${email}. Falling back to console log.`);
      console.log(`[INVITE LINK]: ${inviteUrl}`);
    }
  }
}
