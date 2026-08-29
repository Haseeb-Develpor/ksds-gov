const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = require('express').Router();
const { auth, admin } = require('../middleware/auth');
const localMail = require('../store/localMail');
const { sendMail, smtpConfigured, FROM } = require('../services/mail');

router.use(auth(), admin);

const mailUploadDir = path.join(__dirname, '..', '..', 'uploads', 'mail');
if (!fs.existsSync(mailUploadDir)) fs.mkdirSync(mailUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, mailUploadDir),
  filename: (_req, file, cb) => {
    const safe = String(file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024, files: 8 },
});

function mapFiles(files) {
  return (files || []).map((f) => ({
    filename: f.originalname,
    storedName: f.filename,
    url: `/uploads/mail/${f.filename}`,
    path: f.path,
    size: f.size,
    contentType: f.mimetype,
  }));
}

function publicAttachments(list) {
  return (list || []).map((a) => ({
    filename: a.filename,
    url: a.url,
    size: a.size,
    contentType: a.contentType,
  }));
}

router.get('/status', (_req, res) => {
  res.json({
    mailbox: FROM(),
    smtpConfigured: smtpConfigured(),
    counts: localMail.counts(),
    unread: localMail.unreadCount(),
  });
});

router.get('/folder/:folder', (req, res) => {
  const folder = req.params.folder;
  const q = req.query.q;
  if (folder === 'starred') {
    return res.json({ items: localMail.listStarred({ q }), counts: localMail.counts() });
  }
  if (!['inbox', 'sent', 'drafts', 'trash'].includes(folder)) {
    return res.status(400).json({ message: 'Invalid folder' });
  }
  res.json({ items: localMail.listFolder(folder, { q }), counts: localMail.counts() });
});

router.get('/message/:id', (req, res) => {
  const msg = localMail.getById(req.params.id);
  if (!msg) return res.status(404).json({ message: 'Message not found' });
  if (msg.folder === 'inbox' && !msg.read) {
    localMail.updateMessage(msg._id, { read: true });
    msg.read = true;
  }
  const thread = localMail.thread(msg.threadId);
  res.json({
    message: { ...msg, attachments: publicAttachments(msg.attachments) },
    thread: thread.map((t) => ({ ...t, attachments: publicAttachments(t.attachments) })),
  });
});

router.post('/compose', upload.array('attachments', 8), async (req, res) => {
  try {
    const to = String(req.body.to || '').trim();
    const cc = String(req.body.cc || '').trim();
    const bcc = String(req.body.bcc || '').trim();
    const subject = String(req.body.subject || '').trim();
    const body = String(req.body.body || '').trim();
    const asDraft = String(req.body.draft || '') === 'true';

    if (asDraft) {
      const saved = localMail.addMessage({
        folder: 'drafts',
        from: FROM(),
        to,
        cc,
        bcc,
        subject: subject || '(draft)',
        body,
        attachments: mapFiles(req.files),
        source: 'app',
      });
      return res.json({ success: true, message: { ...saved, attachments: publicAttachments(saved.attachments) }, deliveryNote: 'Draft saved' });
    }

    if (!to || !body) {
      return res.status(400).json({ message: 'To and message body are required' });
    }

    const attachments = mapFiles(req.files);
    const from = FROM();
    const delivery = await sendMail({
      to,
      cc,
      bcc,
      subject: subject || '(no subject)',
      body,
      attachments,
    });

    if (delivery.provider === 'smtp' && delivery.sent === false && delivery.error) {
      return res.status(502).json({ message: `Could not send via SMTP: ${delivery.error}` });
    }

    const saved = localMail.addMessage({
      folder: 'sent',
      from,
      to,
      cc,
      bcc,
      subject: subject || '(no subject)',
      body,
      attachments,
      threadId: req.body.threadId || undefined,
      inReplyTo: req.body.inReplyTo || null,
      source: delivery.sent ? 'smtp' : 'app',
      read: true,
    });

    res.json({
      success: true,
      message: { ...saved, attachments: publicAttachments(saved.attachments) },
      delivered: !!delivery.sent,
      deliveryNote: delivery.sent
        ? `Email sent from ${from}${attachments.length ? ` with ${attachments.length} attachment(s)` : ''}`
        : delivery.message || 'Saved in My Mail',
    });
  } catch (err) {
    console.error('Compose error:', err);
    res.status(500).json({ message: err.message || 'Compose failed' });
  }
});

router.post('/reply/:id', upload.array('attachments', 8), async (req, res) => {
  try {
    const original = localMail.getById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Original message not found' });

    const body = String(req.body.body || '').trim();
    if (!body) return res.status(400).json({ message: 'Reply body is required' });

    const to = original.folder === 'inbox' || original.folder === 'trash'
      ? original.from
      : original.to;
    const subject = original.subject?.startsWith('Re:')
      ? original.subject
      : `Re: ${original.subject || ''}`;
    const attachments = mapFiles(req.files);
    const from = FROM();

    const delivery = await sendMail({
      to,
      cc: String(req.body.cc || '').trim() || undefined,
      subject,
      body,
      attachments,
      inReplyTo: original._id,
    });

    if (delivery.provider === 'smtp' && delivery.sent === false && delivery.error) {
      return res.status(502).json({ message: `Could not send reply: ${delivery.error}` });
    }

    const saved = localMail.addMessage({
      folder: 'sent',
      from,
      to,
      cc: String(req.body.cc || '').trim(),
      subject,
      body,
      attachments,
      threadId: original.threadId,
      inReplyTo: original._id,
      source: delivery.sent ? 'smtp' : 'app',
      read: true,
    });

    res.json({
      success: true,
      message: { ...saved, attachments: publicAttachments(saved.attachments) },
      delivered: !!delivery.sent,
      deliveryNote: delivery.sent
        ? `Reply sent from ${from}`
        : delivery.message || 'Reply saved in My Mail',
    });
  } catch (err) {
    console.error('Reply error:', err);
    res.status(500).json({ message: err.message || 'Reply failed' });
  }
});

router.post('/forward/:id', upload.array('attachments', 8), async (req, res) => {
  try {
    const original = localMail.getById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Message not found' });

    const to = String(req.body.to || '').trim();
    const extra = String(req.body.body || '').trim();
    if (!to) return res.status(400).json({ message: 'To is required for forward' });

    const subject = original.subject?.startsWith('Fwd:')
      ? original.subject
      : `Fwd: ${original.subject || ''}`;
    const body = [
      extra,
      '',
      '---------- Forwarded message ----------',
      `From: ${original.from}`,
      `Date: ${original.createdAt}`,
      `Subject: ${original.subject}`,
      `To: ${original.to}`,
      '',
      original.body,
    ].filter(Boolean).join('\n');

    const newFiles = mapFiles(req.files);
    const oldFiles = (original.attachments || []).map((a) => ({
      ...a,
      path: a.path || path.join(mailUploadDir, a.storedName || ''),
    }));
    const attachments = [...oldFiles.filter((a) => a.path && fs.existsSync(a.path)), ...newFiles];

    const delivery = await sendMail({ to, subject, body, attachments });
    if (delivery.provider === 'smtp' && delivery.sent === false && delivery.error) {
      return res.status(502).json({ message: `Forward failed: ${delivery.error}` });
    }

    const saved = localMail.addMessage({
      folder: 'sent',
      from: FROM(),
      to,
      subject,
      body,
      attachments: attachments.map((a) => ({
        filename: a.filename,
        storedName: a.storedName,
        url: a.url || `/uploads/mail/${a.storedName}`,
        path: a.path,
        size: a.size,
        contentType: a.contentType,
      })),
      threadId: original.threadId,
      source: delivery.sent ? 'smtp' : 'app',
      read: true,
    });

    res.json({
      success: true,
      message: { ...saved, attachments: publicAttachments(saved.attachments) },
      delivered: !!delivery.sent,
      deliveryNote: delivery.sent ? 'Forwarded successfully' : 'Forward saved in My Mail',
    });
  } catch (err) {
    console.error('Forward error:', err);
    res.status(500).json({ message: err.message || 'Forward failed' });
  }
});

router.post('/message/:id/star', (req, res) => {
  const msg = localMail.getById(req.params.id);
  if (!msg) return res.status(404).json({ message: 'Not found' });
  const updated = localMail.updateMessage(msg._id, { starred: !msg.starred });
  res.json({ message: updated });
});

router.post('/message/:id/unread', (req, res) => {
  const msg = localMail.updateMessage(req.params.id, { read: false });
  if (!msg) return res.status(404).json({ message: 'Not found' });
  res.json({ message: msg });
});

router.post('/message/:id/read', (req, res) => {
  const msg = localMail.updateMessage(req.params.id, { read: true });
  if (!msg) return res.status(404).json({ message: 'Not found' });
  res.json({ message: msg });
});

router.delete('/message/:id', (req, res) => {
  const permanent = String(req.query.permanent || '') === 'true';
  const ok = localMail.removeMessage(req.params.id, { permanent });
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
