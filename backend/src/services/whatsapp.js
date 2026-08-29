const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Normalize to E.164.
 * Saudi: 05xxxxxxxx → +9665xxxxxxxx
 * Pakistan: 03xxxxxxxxx → +923xxxxxxxxx
 */
function normalizePhone(raw) {
  if (!raw) return '';
  let p = String(raw).trim().replace(/[\s\-()]/g, '');
  if (p.startsWith('00')) p = `+${p.slice(2)}`;
  // Pakistan mobile: 03xxxxxxxxx (11 digits)
  if (/^03\d{9}$/.test(p)) p = `+92${p.slice(1)}`;
  else if (/^3\d{9}$/.test(p)) p = `+92${p}`;
  else if (p.startsWith('92') && !p.startsWith('+') && p.length >= 12) p = `+${p}`;
  // Saudi mobile: 05xxxxxxxx
  else if (p.startsWith('05') && p.length === 10) p = `+966${p.slice(1)}`;
  else if (p.startsWith('5') && p.length === 9) p = `+966${p}`;
  else if (p.startsWith('966') && !p.startsWith('+')) p = `+${p}`;
  else if (!p.startsWith('+')) p = `+${p.replace(/^\+/, '')}`;
  return p;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function requestJson(urlString, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const lib = url.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const req = lib.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method,
        headers: {
          ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = null;
          try { json = raw ? JSON.parse(raw) : null; } catch { json = { raw }; }
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(json?.error?.message || json?.message || `HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function sendViaMetaWhatsApp(to, code) {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return null;

  const toDigits = to.replace(/\D/g, '');
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const language = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US';

  let body;
  if (template) {
    body = {
      messaging_product: 'whatsapp',
      to: toDigits,
      type: 'template',
      template: {
        name: template,
        language: { code: language },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: code }],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: code }],
          },
        ],
      },
    };
  } else {
    body = {
      messaging_product: 'whatsapp',
      to: toDigits,
      type: 'text',
      text: {
        preview_url: false,
        body: `KSA Skilled Development\n\nYour verification code is: *${code}*\n\nValid for 5 minutes. Do not share this code.`,
      },
    };
  }

  await requestJson(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  return { provider: 'meta' };
}

async function sendViaTwilioWhatsApp(to, code) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_PHONE;
  if (!sid || !token || !from) return null;

  const fromWa = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
  const toWa = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const text = `KSA Skilled Development\n\nYour verification code is: ${code}\n\nValid for 5 minutes. Do not share this code.`;

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({ From: fromWa, To: toWa, Body: text });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${sid}/Messages.json`,
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(params.toString()),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve({ provider: 'twilio' });
          else reject(new Error(`Twilio WhatsApp error: ${raw.slice(0, 300)}`));
        });
      }
    );
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

/**
 * Send OTP via WhatsApp (Meta Cloud API or Twilio WhatsApp).
 * Returns { sent, provider, channel, message }
 */
async function sendWhatsAppOtp(phone, code) {
  const to = normalizePhone(phone);
  if (!to || to.length < 10) throw new Error('Invalid phone number');

  // Prefer Meta WhatsApp Cloud API, then Twilio WhatsApp
  try {
    const meta = await sendViaMetaWhatsApp(to, code);
    if (meta) {
      console.log(`[WhatsApp/Meta] OTP sent to ${to}`);
      return { sent: true, provider: 'meta', channel: 'whatsapp', phone: to };
    }
  } catch (err) {
    console.error('[WhatsApp/Meta] failed:', err.message);
    // fall through to Twilio
  }

  try {
    const twilio = await sendViaTwilioWhatsApp(to, code);
    if (twilio) {
      console.log(`[WhatsApp/Twilio] OTP sent to ${to}`);
      return { sent: true, provider: 'twilio', channel: 'whatsapp', phone: to };
    }
  } catch (err) {
    console.error('[WhatsApp/Twilio] failed:', err.message);
    throw new Error(`WhatsApp OTP failed: ${err.message}`);
  }

  // No Meta/Twilio credentials — optional local console delivery (never returned in API)
  if (process.env.OTP_DEV_CONSOLE === 'true') {
    console.log(`[OTP DEV CONSOLE] WhatsApp API not configured. Code for ${to}: ${code}`);
    return {
      sent: true,
      provider: 'dev-console',
      channel: 'console',
      phone: to,
      message: 'WhatsApp API missing — OTP printed on server console only (not shown in browser).',
    };
  }

  console.log(`[WhatsApp MOCK] OTP blocked for ${to} — configure WHATSAPP_TOKEN or Twilio.`);
  return {
    sent: false,
    provider: 'mock',
    channel: 'whatsapp',
    phone: to,
    message: 'WhatsApp credentials not configured.',
  };
}

module.exports = { normalizePhone, generateOtp, sendWhatsAppOtp };
