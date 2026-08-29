const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', '..', 'data');
const filePath = path.join(dataDir, 'records.json');

function ensure() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ applications: [], documents: [], notifications: [] }, null, 2)
    );
  }
}

function read() {
  ensure();
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(data.applications)) data.applications = [];
    if (!Array.isArray(data.documents)) data.documents = [];
    if (!Array.isArray(data.notifications)) data.notifications = [];
    return data;
  } catch {
    return { applications: [], documents: [], notifications: [] };
  }
}

function write(data) {
  ensure();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function listApplications(userId) {
  return read().applications
    .filter((a) => String(a.userId) === String(userId))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function listAllApplications() {
  return read().applications
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function getApplication(id) {
  return read().applications.find((a) => String(a._id) === String(id)) || null;
}

function listDocuments(userId) {
  return read().documents
    .filter((d) => String(d.userId) === String(userId))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function addApplication(userId, data) {
  const db = read();
  const row = {
    _id: 'app-' + crypto.randomBytes(4).toString('hex'),
    userId: String(userId),
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    service: data.service || 'Account Registration',
    message: data.message || '',
    status: data.status || 'pending',
    type: data.type || 'kyc_registration',
    idDocumentUrl: data.idDocumentUrl || '',
    idDocumentLabel: data.idDocumentLabel || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.applications.push(row);
  write(db);
  return row;
}

function updateApplication(id, patch) {
  const db = read();
  const idx = db.applications.findIndex((a) => String(a._id) === String(id));
  if (idx < 0) return null;
  db.applications[idx] = {
    ...db.applications[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  write(db);
  return db.applications[idx];
}

function addDocument(userId, data) {
  const db = read();
  const row = {
    _id: 'doc-' + crypto.randomBytes(4).toString('hex'),
    userId: String(userId),
    title: data.title || 'Document',
    type: data.type || 'file',
    url: data.url || '',
    createdAt: new Date().toISOString(),
  };
  db.documents.push(row);
  write(db);
  return row;
}

function addNotification(userId, { title, body }) {
  const db = read();
  const row = {
    _id: 'ntf-' + crypto.randomBytes(4).toString('hex'),
    userId: String(userId),
    title: title || 'Notification',
    body: body || '',
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(row);
  write(db);
  return row;
}

function listNotifications(userId) {
  return read().notifications
    .filter((n) => String(n.userId) === String(userId))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function markNotificationRead(userId, id) {
  const db = read();
  const idx = db.notifications.findIndex(
    (n) => String(n._id) === String(id) && String(n.userId) === String(userId)
  );
  if (idx < 0) return null;
  db.notifications[idx].read = true;
  write(db);
  return db.notifications[idx];
}

function unreadCount(userId) {
  return listNotifications(userId).filter((n) => !n.read).length;
}

module.exports = {
  listApplications,
  listAllApplications,
  getApplication,
  listDocuments,
  addApplication,
  updateApplication,
  addDocument,
  addNotification,
  listNotifications,
  markNotificationRead,
  unreadCount,
};
