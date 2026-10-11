import { config } from '../config';

const ZEPTOMAIL_URL = 'https://api.zeptomail.com/v1.1/email';

async function sendZeptoMail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  const token = config.zeptomailToken;
  if (!token) {
    console.log(`[DEV] Email to ${to}: ${subject}`);
    console.log(`[DEV] HTML: ${htmlBody.slice(0, 200)}...`);
    return true;
  }

  try {
    const res = await fetch(ZEPTOMAIL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-enczapikey ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { address: 'noreply@quickbroker.duckdns.org', name: 'Quick-Broker' },
        to: [{ email_address: { address: to } }],
        subject,
        htmlbody: htmlBody,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('ZeptoMail send failed:', e);
    return false;
  }
}

export function buildMagicLink(token: string): string {
  const base = process.env.APP_BASE_URL || 'http://localhost:5173';
  return `${base}/auth/verify?token=${token}`;
}

export async function sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
  const link = buildMagicLink(token);
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#B07D4F;margin:0 0 8px;">Quick-Broker Login</h2>
      <p style="color:#555;margin:0 0 24px;">Click the button below to log in to Quick-Broker. No password needed.</p>
      <a href="${link}" style="display:inline-block;background:#B07D4F;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;">Log in to Quick-Broker</a>
      <p style="color:#888;font-size:13px;margin-top:24px;">This link expires in 10 minutes and can only be used once.</p>
      <p style="color:#aaa;font-size:12px;margin-top:8px;">If you didn't request this, you can ignore this email.</p>
    </div>
  `;
  return sendZeptoMail(email, 'Your Quick-Broker Login Link', html);
}

export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#B07D4F;margin:0 0 8px;">Quick-Broker Verification Code</h2>
      <p style="color:#555;margin:0 0 16px;">Your one-time verification code:</p>
      <div style="background:#f5f5f5;padding:20px;border-radius:12px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#333;margin-bottom:16px;">${code}</div>
      <p style="color:#888;font-size:13px;">This code expires in 10 minutes.</p>
    </div>
  `;
  return sendZeptoMail(email, 'Quick-Broker Verification Code', html);
}
