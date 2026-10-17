import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

export interface SendOtpEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a 6-digit OTP verification email via Gmail SMTP using Nodemailer
 */
export async function sendOtpEmail(
  toEmail: string,
  otp: string
): Promise<SendOtpEmailResult> {
  const currentUser = process.env.GMAIL_USER;
  const currentPass = process.env.GMAIL_APP_PASSWORD;

  if (!currentUser || !currentPass) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD environment variable is not configured');
    return {
      success: false,
      error: 'Could not send OTP, try again',
    };
  }

  try {
    const fromAddress = `YogyaSetu <${currentUser}>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>YogyaSetu Verification Code</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F5F6F8;
            margin: 0;
            padding: 24px;
            color: #1E293B;
          }
          .card {
            max-width: 520px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 20px;
            border: 1px solid #E2E8F0;
            padding: 36px 32px;
            box-shadow: 0 4px 16px rgba(11, 61, 145, 0.06);
            overflow: hidden;
          }
          .tricolor-stripe {
            height: 5px;
            background: linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #0B3D91 33.3%, #0B3D91 66.6%, #138808 66.6%, #138808 100%);
            margin: -36px -32px 28px -32px;
          }
          .brand {
            text-align: center;
            margin-bottom: 24px;
          }
          .brand-title {
            font-size: 26px;
            font-weight: 900;
            color: #0B3D91;
            letter-spacing: -0.5px;
          }
          .brand-saffron {
            color: #FF9933;
          }
          .brand-sub {
            display: inline-block;
            background-color: #F0F4FA;
            color: #0B3D91;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 12px;
            border-radius: 9999px;
            margin-top: 6px;
            border: 1px solid #BCD0EC;
          }
          h2 {
            font-size: 20px;
            font-weight: 800;
            color: #0B3D91;
            margin: 0 0 10px 0;
            text-align: center;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 16px 0;
            text-align: center;
          }
          .otp-container {
            background: #F8FAFC;
            border: 2px dashed #0B3D91;
            border-radius: 16px;
            padding: 24px 20px;
            text-align: center;
            margin: 24px 0;
          }
          .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 40px;
            font-weight: 900;
            letter-spacing: 10px;
            color: #0B3D91;
            margin: 0;
          }
          .expiry {
            font-size: 13px;
            font-weight: 700;
            color: #138808;
            margin-top: 10px;
          }
          .security-box {
            background: #FFF9F2;
            border-left: 4px solid #FF9933;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            color: #944400;
            margin-top: 24px;
            text-align: left;
          }
          .footer {
            font-size: 11px;
            color: #94A3B8;
            text-align: center;
            margin-top: 24px;
            border-top: 1px solid #F1F5F9;
            padding-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="tricolor-stripe"></div>
          <div class="brand">
            <div class="brand-title">Yogya<span class="brand-saffron">Setu</span></div>
            <div class="brand-sub">Government Welfare Schemes & Scholarships Portal</div>
          </div>
          <h2>Your One-Time Password (OTP)</h2>
          <p>Use the following 6-digit verification code to sign in to your YogyaSetu account. This code is confidential and valid for 10 minutes.</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="expiry">⏱️ Valid for 10 minutes</div>
          </div>

          <p style="font-size: 13px; color: #64748B;">If you did not request this OTP, please disregard this email. Never share your OTP with anyone.</p>

          <div class="security-box">
            <strong>Security Notice:</strong> YogyaSetu officials will never ask for your password, OTP, or banking PIN over phone calls or SMS.
          </div>

          <div class="footer">
            Government Scheme Information Aggregator | <a href="https://india.gov.in" style="color: #0B3D91; text-decoration: none;">india.gov.in</a>
            <br>&copy; 2026 YogyaSetu. Built for Citizens of India.
          </div>
        </div>
      </body>
      </html>
    `;

    // Create transport dynamically if credentials were provided at runtime
    const mailer = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: currentUser,
        pass: currentPass,
      },
    });

    const info = await mailer.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `[YogyaSetu] ${otp} is your verification code`,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('Nodemailer error sending OTP email:', err);
    return {
      success: false,
      error: 'Could not send OTP, try again',
    };
  }
}

/**
 * Sends a deadline reminder email for bookmarked schemes
 */
export async function sendDeadlineReminderEmail(
  toEmail: string,
  userName: string,
  schemeTitle: string,
  department: string,
  daysLeft: number,
  closeDateFormatted: string,
  officialLink: string,
  schemeId: string
): Promise<{ success: boolean; error?: string }> {
  const currentUser = process.env.GMAIL_USER;
  const currentPass = process.env.GMAIL_APP_PASSWORD;

  if (!currentUser || !currentPass) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD not configured for deadline reminders');
    return { success: false, error: 'Could not send reminder email' };
  }

  try {
    const fromAddress = `YogyaSetu <${currentUser}>`;
    const urgencyColor = daysLeft <= 1 ? '#DC2626' : daysLeft <= 3 ? '#EA580C' : '#D97706';
    const urgencyText = daysLeft <= 1 ? '⚠️ Final Day Reminder' : daysLeft <= 3 ? '⏳ Only 3 Days Left' : '📅 7 Days Remaining';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Scheme Deadline Reminder</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; margin: 0; padding: 24px; color: #1E293B; }
          .card { max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 36px 32px; box-shadow: 0 4px 16px rgba(11, 61, 145, 0.06); overflow: hidden; }
          .tricolor-stripe { height: 5px; background: linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #0B3D91 33.3%, #0B3D91 66.6%, #138808 66.6%, #138808 100%); margin: -36px -32px 28px -32px; }
          .brand { text-align: center; margin-bottom: 20px; }
          .brand-title { font-size: 22px; font-weight: 900; color: #0B3D91; letter-spacing: -0.5px; }
          .brand-saffron { color: #FF9933; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; color: #FFFFFF; background-color: ${urgencyColor}; margin-bottom: 16px; }
          h2 { font-size: 20px; font-weight: 800; color: #0B3D91; margin: 0 0 12px 0; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0; }
          .scheme-box { background: #F8FAFC; border-left: 4px solid #0B3D91; border-radius: 12px; padding: 16px 20px; margin: 20px 0; border: 1px solid #E2E8F0; border-left-width: 4px; }
          .scheme-title { font-size: 16px; font-weight: 800; color: #0B3D91; margin-bottom: 6px; }
          .scheme-dept { font-size: 12px; color: #64748B; margin-bottom: 10px; }
          .btn { display: inline-block; background-color: #0B3D91; color: #FFFFFF !important; font-weight: 800; font-size: 14px; padding: 13px 26px; border-radius: 12px; text-decoration: none; text-align: center; margin-top: 8px; box-shadow: 0 2px 8px rgba(11, 61, 145, 0.2); }
          .verify-notice { font-size: 12px; color: #64748B; font-weight: 600; text-align: center; margin-top: 20px; padding: 10px 14px; background: #F1F5F9; border-radius: 10px; }
          .footer { font-size: 11px; color: #94A3B8; text-align: center; margin-top: 28px; border-top: 1px solid #F1F5F9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="tricolor-stripe"></div>
          <div class="brand">
            <span class="brand-title">Yogya<span class="brand-saffron">Setu</span></span>
          </div>

          <div style="text-align: center; margin-bottom: 12px;">
            <div class="badge">${urgencyText}</div>
          </div>
          <h2>Hello ${userName || 'Citizen'},</h2>
          <p>This is a reminder that the application deadline for your saved government scheme is approaching:</p>
          
          <div class="scheme-box">
            <div class="scheme-title">${schemeTitle}</div>
            <div class="scheme-dept">🏛️ ${department || 'Government of India'}</div>
            <p style="margin: 0; font-size: 14px; font-weight: 800; color: ${urgencyColor};">
              Closing Date: ${closeDateFormatted} (${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left)
            </p>
          </div>

          <p>Please make sure you submit your application and upload the necessary documents before the official portal closes.</p>

          <div style="text-align: center; margin: 24px 0 16px 0;">
            <a href="${officialLink}" class="btn" target="_blank" rel="noopener noreferrer">Apply on Official Portal &rarr;</a>
          </div>

          <div class="verify-notice">
            ℹ️ Verify the deadline on the official website.
          </div>

          <div class="footer">
            YogyaSetu Citizen Portal | Scheme Deadline Monitoring Service
            <br>&copy; 2026 YogyaSetu. Built for Citizens of India.
          </div>
        </div>
      </body>
      </html>
    `;

    const mailer = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: currentUser,
        pass: currentPass,
      },
    });

    await mailer.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `[Deadline Reminder] ${daysLeft} days left for ${schemeTitle}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error sending deadline reminder email:', err);
    return { success: false, error: err?.message };
  }
}
