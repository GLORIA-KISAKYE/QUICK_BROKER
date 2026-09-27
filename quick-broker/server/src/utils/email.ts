import { config } from '../config';

interface ZeptoMailResponse {
  data: Array<{
    code: string;
    message: string;
  }>;
}

export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  if (!config.zeptomailToken) {
    console.log(`[DEV] OTP for ${email}: ${code}`);
    return true;
  }

  try {
    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${config.zeptomailToken}`
      },
      body: JSON.stringify({
        from: { address: 'noreply@quickbroker.duckdns.org', name: 'Quick-Broker' },
        to: [{ email_address: { address: email } }],
        subject: 'Your Quick-Broker Login Code',
        htmlbody: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;">
          <h2 style="color:#495057;">Quick-Broker Login</h2>
          <p>Your login code is:</p>
          <div style="background:#f1f3f5;padding:20px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#495057;border-radius:12px;margin:20px 0;">${code}</div>
          <p style="color:#6c757d;font-size:12px;">This code expires in 10 minutes.</p>
        </div>`
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
