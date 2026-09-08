const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const FROM = () => process.env.MAIL_FROM || 'info@ksds-gov.com';
const FROM_NAME = () => process.env.MAIL_FROM_NAME || 'KSA Skilled Development';

function smtpConfigured() {
  return !!(process.env.MAIL_SMTP_HOST && process.env.MAIL_SMTP_USER && process.env.MAIL_SMTP_PASS);
}

function createTransport() {
  if (!smtpConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST,
    port: Number(process.env.MAIL_SMTP_PORT || 465),
    secure: String(process.env.MAIL_SMTP_SECURE || 'true') !== 'false',
    auth: {
      user: process.env.MAIL_SMTP_USER,
      pass: process.env.MAIL_SMTP_PASS,
    },
  });
}

/**
 * attachments: [{ filename, path, contentType? }]
 */
async function sendMail({ to, cc, bcc, subject, body, html, replyTo, inReplyTo, references, attachments }) {
  const fromAddr = FROM();
  const recipient = String(to || '').trim();
  if (!recipient || !recipient.includes('@')) {
    return { sent: false, provider: 'smtp', error: 'Recipient email is missing' };
  }

  const transport = createTransport();
  if (!transport) {
    return {
      sent: false,
      provider: 'local',
      message: 'SMTP not configured — cannot deliver email.',
    };
  }

  const mailAttachments = (attachments || [])
    .filter((a) => a && a.path && fs.existsSync(a.path))
    .map((a) => ({
      filename: a.filename || path.basename(a.path),
      path: a.path,
      contentType: a.contentType || undefined,
    }));

  try {
    const info = await transport.sendMail({
      from: `"${FROM_NAME()}" <${fromAddr}>`,
      to: recipient,
      cc: cc || undefined,
      bcc: bcc || undefined,
      replyTo: replyTo || fromAddr,
      subject,
      text: body,
      html: html || `<div style="font-family:Arial,sans-serif;line-height:1.5;white-space:pre-wrap">${escapeHtml(body)}</div>`,
      inReplyTo: inReplyTo || undefined,
      references: references || undefined,
      attachments: mailAttachments.length ? mailAttachments : undefined,
    });
    return { sent: true, provider: 'smtp', id: info.messageId, to: recipient };
  } catch (err) {
    console.error('[Mail SMTP]', err.message);
    return { sent: false, provider: 'smtp', error: err.message };
  }
}

async function sendOtpEmail(to, code, purpose = 'login') {
  const recipient = String(to || '').trim().toLowerCase();
  const subject =
    purpose === 'reset'
      ? 'Password reset code — KSA Skilled Development'
      : 'Your login OTP — KSA Skilled Development';
  const body = [
    'Assalam o Alaikum,',
    '',
    `Your verification code is: ${code}`,
    '',
    'This code is valid for 5 minutes. Do not share it with anyone.',
    '',
    'If you did not request this, you can ignore this email.',
    '',
    '— KSA Skilled Development',
  ].join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <p>Assalam o Alaikum,</p>
      <p>Your verification code is:</p>
      <p style="font-size:28px;letter-spacing:8px;font-weight:700;color:#0f4c81">${escapeHtml(code)}</p>
      <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>— KSA Skilled Development</p>
    </div>
  `;

  return sendMail({ to: recipient, subject, body, html });
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendMail, sendOtpEmail, smtpConfigured, FROM, FROM_NAME };
