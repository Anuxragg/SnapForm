import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  devCode?: string;
}

export interface DarkEmailTemplateOptions {
  title: string;
  descriptionHtml: string;
  code?: string;
  ctaText?: string;
  ctaLink?: string;
  footerNote?: string;
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
 * Generates an ultra-clean, minimalist dark-mode email template (Resend style)
 * with squircle logo, bold heading, muted description, OTP display, and white pill CTA button.
 */
export function generateDarkEmailHtml(options: DarkEmailTemplateOptions): string {
  const {
    title,
    descriptionHtml,
    code,
    ctaText,
    ctaLink,
    footerNote = "If you didn't make this request, you can safely ignore this email.",
  } = options;

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${title}</title>
    <style type="text/css">
      :root {
        color-scheme: dark;
        supported-color-schemes: dark;
      }
      body {
        margin: 0;
        padding: 0;
        width: 100% !important;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        background-color: #000000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      a {
        color: #38bdf8;
        text-decoration: underline;
      }
      @media only screen and (max-width: 600px) {
        .container-table {
          width: 100% !important;
          padding: 32px 20px !important;
        }
        .main-heading {
          font-size: 24px !important;
        }
        .code-box {
          font-size: 28px !important;
          letter-spacing: 6px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; color: #ffffff;">
    <!-- Outer Full-Width Container -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; min-height: 100vh; table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 56px 16px;">
          <!-- Centered Email Wrapper -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" class="container-table" style="max-width: 480px; text-align: center; margin: 0 auto;">
            
            <!-- Top Logo Squircle using icon.svg -->
            <tr>
              <td align="center" style="padding-bottom: 32px;">
                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td align="center" style="padding: 0; margin: 0;">
                      <img
                        src="cid:snapform-logo"
                        width="48"
                        height="48"
                        alt="SnapForm"
                        style="display: block; width: 48px; height: 48px; border: 0; outline: none; margin: 0 auto; border-radius: 10px;"
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Heading -->
            <tr>
              <td align="center" style="padding-bottom: 14px;">
                <h1 class="main-heading" style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.6px; line-height: 1.25;">
                  ${title}
                </h1>
              </td>
            </tr>

            <!-- Description / Subtitle -->
            <tr>
              <td align="center" style="padding-bottom: 28px;">
                <div style="font-size: 14px; line-height: 1.6; color: #8e8e93; max-width: 420px; margin: 0 auto;">
                  ${descriptionHtml}
                </div>
              </td>
            </tr>

            <!-- Optional 6-Digit OTP Code Badge -->
            ${
              code
                ? `
            <tr>
              <td align="center" style="padding-bottom: 28px;">
                <div class="code-box" style="display: inline-block; background-color: #0c0c0e; border: 1px solid #27272a; border-radius: 12px; padding: 14px 28px; color: #ffffff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; user-select: all;">
                  ${code}
                </div>
              </td>
            </tr>
            `
                : ''
            }

            <!-- Optional Pill CTA Button (Matching White Pill Button) -->
            ${
              ctaText && ctaLink
                ? `
            <tr>
              <td align="center" style="padding-bottom: 32px;">
                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td align="center" style="border-radius: 9999px; background-color: #ffffff;">
                      <a href="${ctaLink}" target="_blank" style="display: inline-block; padding: 12px 36px; font-size: 14px; font-weight: 600; color: #000000; text-decoration: none; border-radius: 9999px; background-color: #ffffff; border: 1px solid #ffffff;">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            `
                : ''
            }

            <!-- Footer Security & Expiry Note -->
            ${
              footerNote
                ? `
            <tr>
              <td align="center" style="padding-bottom: 28px;">
                <p style="margin: 0; font-size: 12px; color: #52525b; line-height: 1.5; max-width: 380px;">
                  ${footerNote}
                </p>
              </td>
            </tr>
            `
                : ''
            }

            <!-- Brand Footer -->
            <tr>
              <td align="center" style="border-top: 1px solid #18181b; padding-top: 24px;">
                <p style="margin: 0; font-size: 12px; color: #3f3f46; letter-spacing: -0.2px;">
                  &copy; ${new Date().getFullYear()} SnapForm. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

/**
 * Sends a 6-digit verification OTP email using Nodemailer with the minimalist dark design.
 */
export async function sendVerificationOtpEmail(
  email: string,
  code: string,
  userName?: string
): Promise<SendOtpResult> {
  const recipientName = userName || 'there';
  const transporter = getNodemailerTransporter();

  const descriptionHtml = `Hi ${recipientName}, enter the 6-digit verification code below to verify your email <a href="mailto:${email}" style="color: #38bdf8; text-decoration: underline;">${email}</a> and complete your SnapForm account registration.`;

  const htmlContent = generateDarkEmailHtml({
    title: 'Verify your email address',
    descriptionHtml,
    code,
    footerNote: 'This code is valid for <strong>15 minutes</strong>. If you did not request this verification, you can safely ignore this email.',
  });

  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || `SnapForm <${process.env.SMTP_USER}>`;
      const iconPath = path.join(process.cwd(), 'public', 'icon.svg');
      const iconSvgContent = fs.existsSync(iconPath) ? fs.readFileSync(iconPath) : null;

      const info = await transporter.sendMail({
        from,
        to: email,
        subject: `[SnapForm] Your Verification Code: ${code}`,
        text: `Your SnapForm verification code is: ${code}. It expires in 15 minutes.`,
        html: htmlContent,
        attachments: iconSvgContent
          ? [
              {
                filename: 'icon.svg',
                content: iconSvgContent,
                cid: 'snapform-logo',
                contentType: 'image/svg+xml',
                contentDisposition: 'inline',
              },
            ]
          : [],
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



