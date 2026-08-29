const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', '..', 'data');
const filePath = path.join(dataDir, 'mail.json');
const MAILBOX = process.env.MAIL_FROM || 'info@ksds-gov.com';

function ensure() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ messages: [] }, null, 2), 'utf8');
  }
}

function read() {
  ensure();
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(data.messages)) data.messages = [];
    return data;
  } catch {
    return { messages: [] };
  }
}

function write(data) {
  ensure();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function addMessage(msg) {
  const db = read();
  const row = {
    _id: 'mail-' + crypto.randomBytes(5).toString('hex'),
    folder: msg.folder || 'inbox', // inbox | sent | drafts | trash
    from: msg.from || '',
    to: msg.to || '',
    cc: msg.cc || '',
    bcc: msg.bcc || '',
    subject: msg.subject || '(no subject)',
    body: msg.body || '',
    threadId: msg.threadId || crypto.randomBytes(6).toString('hex'),
    inReplyTo: msg.inReplyTo || null,
    read: msg.folder === 'sent' || msg.folder === 'drafts' ? true : !!msg.read,
    starred: !!msg.starred,
    attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
    source: msg.source || 'app',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.messages.unshift(row);
  write(db);
  return row;
}

function listFolder(folder, { q } = {}) {
  let items = read().messages.filter((m) => m.folder === folder);
  if (q) {
    const s = String(q).toLowerCase();
    items = items.filter((m) =>
      [m.from, m.to, m.cc, m.subject, m.body].some((x) => String(x || '').toLowerCase().includes(s))
    );
  }
  return items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function listStarred({ q } = {}) {
  let items = read().messages.filter((m) => m.starred && m.folder !== 'trash');
  if (q) {
    const s = String(q).toLowerCase();
    items = items.filter((m) =>
      [m.from, m.to, m.subject, m.body].some((x) => String(x || '').toLowerCase().includes(s))
    );
  }
  return items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function getById(id) {
  return read().messages.find((m) => String(m._id) === String(id)) || null;
}

function updateMessage(id, patch) {
  const db = read();
  const idx = db.messages.findIndex((m) => String(m._id) === String(id));
  if (idx < 0) return null;
  db.messages[idx] = {
    ...db.messages[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  write(db);
  return db.messages[idx];
}

function removeMessage(id, { permanent } = {}) {
  const db = read();
  const idx = db.messages.findIndex((m) => String(m._id) === String(id));
  if (idx < 0) return false;
  if (!permanent && db.messages[idx].folder !== 'trash') {
    db.messages[idx].folder = 'trash';
    db.messages[idx].updatedAt = new Date().toISOString();
  } else {
    db.messages.splice(idx, 1);
  }
  write(db);
  return true;
}

function unreadCount() {
  return read().messages.filter((m) => m.folder === 'inbox' && !m.read).length;
}

function counts() {
  const msgs = read().messages;
  return {
    inbox: msgs.filter((m) => m.folder === 'inbox').length,
    unread: msgs.filter((m) => m.folder === 'inbox' && !m.read).length,
    sent: msgs.filter((m) => m.folder === 'sent').length,
    drafts: msgs.filter((m) => m.folder === 'drafts').length,
    starred: msgs.filter((m) => m.starred && m.folder !== 'trash').length,
    trash: msgs.filter((m) => m.folder === 'trash').length,
  };
}

function thread(threadId) {
  return read().messages
    .filter((m) => m.threadId === threadId && m.folder !== 'trash')
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}

module.exports = {
  MAILBOX,
  addMessage,
  listFolder,
  listStarred,
  getById,
  updateMessage,
  removeMessage,
  unreadCount,
  counts,
  thread,
};
