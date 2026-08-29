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
async function sendMail({ to, cc, bcc, subject, body, replyTo, inReplyTo, references, attachments }) {
  const fromAddr = FROM();
  const transport = createTransport();
  if (!transport) {
    return {
      sent: false,
      provider: 'local',
      message: 'SMTP not configured — message saved in Admin Mail only.',
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
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      replyTo: replyTo || fromAddr,
      subject,
      text: body,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5;white-space:pre-wrap">${escapeHtml(body)}</div>`,
      inReplyTo: inReplyTo || undefined,
      references: references || undefined,
      attachments: mailAttachments.length ? mailAttachments : undefined,
    });
    return { sent: true, provider: 'smtp', id: info.messageId };
  } catch (err) {
    console.error('[Mail SMTP]', err.message);
    return { sent: false, provider: 'smtp', error: err.message };
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendMail, smtpConfigured, FROM, FROM_NAME };
