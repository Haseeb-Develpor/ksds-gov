const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { normalizePhone } = require('../utils/phone');

const dataDir = path.join(__dirname, '..', '..', 'data');
const filePath = path.join(dataDir, 'users.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
}

function readAll() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeAll(users) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
}

async function ensureDefaults() {
  let users = readAll();
  let changed = false;

  // Remove old demo client so real phone numbers are not hijacked
  const cleaned = users.filter((u) => u.email !== 'client03134320062@ksaskilled.sa');
  if (cleaned.length !== users.length) {
    users = cleaned;
    changed = true;
  }

  if (!users.some((u) => u.email === 'admin@ksaskilled.sa')) {
    users.push({
      _id: 'admin-local',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@ksaskilled.sa',
      phone: '+966500000000',
      role: 'admin',
      password: await bcrypt.hash('Admin@123456', 10),
      kycStatus: 'approved',
    });
    changed = true;
  }

  if (changed) writeAll(users);
  return users;
}

function findByPhone(phone) {
  const p = normalizePhone(phone);
  return readAll().find((u) => u.phone === p) || null;
}

function findByEmail(email) {
  const e = String(email || '').toLowerCase().trim();
  return readAll().find((u) => String(u.email || '').toLowerCase().trim() === e) || null;
}

function findById(id) {
  return readAll().find((u) => String(u._id) === String(id)) || null;
}

function createUser(data) {
  const users = readAll();
  const user = {
    _id: 'user-' + crypto.randomBytes(6).toString('hex'),
    firstName: data.firstName,
    lastName: data.lastName || '',
    email: String(data.email).toLowerCase(),
    phone: normalizePhone(data.phone),
    role: 'user',
    password: data.password,
    kycStatus: data.kycStatus || 'pending',
    idDocumentType: data.idDocumentType || '',
    idDocumentLabel: data.idDocumentLabel || '',
    idDocumentCountry: data.idDocumentCountry || '',
    idDocumentUrl: data.idDocumentUrl || '',
    idDocumentSource: data.idDocumentSource || '',
  };
  users.push(user);
  writeAll(users);
  return user;
}

function listClients() {
  return readAll()
    .filter((u) => u.role !== 'admin')
    .map(({ password, ...rest }) => rest)
    .sort((a, b) => String(b._id).localeCompare(String(a._id)));
}

function updatePassword(id, passwordHash) {
  const users = readAll();
  const idx = users.findIndex((u) => String(u._id) === String(id));
  if (idx < 0) return null;
  users[idx].password = passwordHash;
  writeAll(users);
  return users[idx];
}

function updateUser(id, patch) {
  const users = readAll();
  const idx = users.findIndex((u) => String(u._id) === String(id));
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...patch };
  writeAll(users);
  return users[idx];
}

module.exports = {
  ensureDefaults,
  findByPhone,
  findByEmail,
  findById,
  createUser,
  readAll,
  listClients,
  updatePassword,
  updateUser,
};
