import nodemailer from 'nodemailer';

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  devCode?: string;
}

/**
 * Creates and returns a Nodemailer transporter instance based on environment variables.
 * Automatically configures Gmail SMTP if a gmail.com user is provided.
 */
function getNodemailerTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || (user?.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

/**
 * Sends a 6-digit verification OTP email using Nodemailer.
 */
export async function sendVerificationOtpEmail(
  email: string,
  code: string,
  userName?: string
): Promise<SendOtpResult> {
  const recipientName = userName || 'Developer';
  const transporter = getNodemailerTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070709; color: #ffffff; padding: 20px; }
          .card { max-width: 480px; margin: 0 auto; background-color: #121217; border: 1px solid #26262e; border-radius: 16px; padding: 32px; text-align: center; }
          .logo { font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 24px; letter-spacing: -0.5px; }
          .logo span { color: #ff4f19; }
          .code-box { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ff4f19; background-color: #1c1c24; border: 1px solid #333340; border-radius: 12px; padding: 16px 24px; margin: 24px 0; font-family: monospace; }
          .desc { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 8px; }
          .footer { font-size: 11px; color: #71717a; margin-top: 32px; border-top: 1px solid #26262e; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Snap<span>Form</span></div>
          <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800;">Verify your email address</h2>
          <p class="desc">Hi ${recipientName}, enter the 6-digit verification code below to confirm your email and set up your SnapForm account:</p>
          <div class="code-box">${code}</div>
          <p class="desc" style="font-size: 12px;">This code is valid for <strong>15 minutes</strong>. If you didn't request this verification, you can safely ignore this message.</p>
          <div class="footer">© ${new Date().getFullYear()} SnapForm. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || `SnapForm <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from,
        to: email,
        subject: `[SnapForm] Your Verification Code: ${code}`,
        text: `Your SnapForm verification code is: ${code}. It expires in 15 minutes.`,
        html: htmlContent,
      });

      console.log(`[SnapForm Nodemailer] Successfully sent verification email to ${email} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[SnapForm Nodemailer Error]:', err);
      return { success: false, error: err.message };
    }
  }

  // Development Fallback (when SMTP credentials are not yet set in .env.local)
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`[SnapForm DEV CODE] Verification Code for ${email}: [ ${code} ]`);
  console.log('═══════════════════════════════════════════════════════════════');

  return {
    success: true,
    devCode: code,
  };
}
