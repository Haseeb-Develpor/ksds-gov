const router = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, Otp } = require('../models');
const { sign, auth } = require('../middleware/auth');
const { isConnected } = require('../config/db');
const { sendOtpEmail } = require('../services/mail');
const { normalizePhone, generateOtp, isMongoId } = require('../utils/phone');
const localUsers = require('../store/localUsers');
const idTypes = require('../data/idTypes');
const { saveIdImage } = require('../utils/saveImage');
const localRecords = require('../store/localRecords');

const memoryOtps = new Map();
const sendHits = new Map();

let localReady = false;
async function ensureLocalUsers() {
  if (!localReady) {
    await localUsers.ensureDefaults();
    localReady = true;
  }
}

async function findUserByEmail(email, { withPassword = false } = {}) {
  const e = String(email || '').toLowerCase().trim();
  if (!e) return null;
  if (isConnected()) {
    const q = User.findOne({ email: e });
    const mongoUser = withPassword ? await q.select('+password') : await q;
    if (mongoUser) return mongoUser;
  }
  await ensureLocalUsers();
  return localUsers.findByEmail(e);
}

async function findUserById(id) {
  if (isConnected() && isMongoId(id)) {
    const mongoUser = await User.findById(id);
    if (mongoUser) return mongoUser;
  }
  await ensureLocalUsers();
  return localUsers.findById(id);
}

const publicUser = (u) => ({
  _id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  phone: u.phone,
  role: u.role,
  kycStatus: u.kycStatus,
  idDocumentType: u.idDocumentType || '',
  idDocumentLabel: u.idDocumentLabel || '',
  idDocumentCountry: u.idDocumentCountry || '',
  idDocumentUrl: u.idDocumentUrl || '',
  idDocumentSource: u.idDocumentSource || '',
});

function maskEmail(email) {
  const e = String(email || '');
  const [user, domain] = e.split('@');
  if (!user || !domain) return '****';
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}***@${domain}`;
}

function hashOtp(code) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
}

function canSend(key) {
  const now = Date.now();
  const list = (sendHits.get(key) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 5) {
    sendHits.set(key, list);
    return false;
  }
  list.push(now);
  sendHits.set(key, list);
  return true;
}

function resolveIdType(value) {
  return idTypes.find((t) => t.value === value) || null;
}

/** OTP key is always the registered email (lowercase) */
async function saveOtp({ email, code, purpose, payload }) {
  const key = String(email).toLowerCase().trim();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const codeHash = hashOtp(code);
  if (isConnected()) {
    await Otp.deleteMany({ phone: key, purpose });
    await Otp.create({ phone: key, code: codeHash, purpose, payload, expiresAt, attempts: 0 });
  } else {
    memoryOtps.set(`${key}:${purpose}`, {
      codeHash,
      purpose,
      payload,
      expiresAt: expiresAt.getTime(),
      attempts: 0,
    });
  }
  if (process.env.OTP_SERVER_LOG === 'true') {
    console.log(`[OTP SERVER LOG] ${purpose} ${key} => ${code}`);
  }
  return expiresAt;
}

async function findOtpRecord(email, purpose) {
  const key = String(email).toLowerCase().trim();
  if (isConnected()) {
    return Otp.findOne({ phone: key, purpose }).sort({ createdAt: -1 });
  }
  return memoryOtps.get(`${key}:${purpose}`) || null;
}

async function bumpAttempts(email, purpose, record) {
  const key = String(email).toLowerCase().trim();
  const attempts = (record.attempts || 0) + 1;
  if (isConnected() && record.save) {
    record.attempts = attempts;
    await record.save();
  } else {
    record.attempts = attempts;
    memoryOtps.set(`${key}:${purpose}`, record);
  }
  return attempts;
}

async function consumeOtp(email, purpose) {
  const key = String(email).toLowerCase().trim();
  if (isConnected()) await Otp.deleteMany({ phone: key, purpose });
  else memoryOtps.delete(`${key}:${purpose}`);
}

function otpResponse(email, purpose, message) {
  return {
    success: true,
    message,
    channel: 'email',
    emailMasked: maskEmail(email),
    purpose,
  };
}

router.get('/id-types', (_req, res) => {
  res.json({ items: idTypes });
});

/** Send OTP to registered email — login or forgot-password only */
router.post('/otp/send', async (req, res) => {
  try {
    const purpose = req.body.purpose === 'reset' ? 'reset' : 'login';
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid registered email is required' });
    }

    if (!canSend(email)) {
      return res.status(429).json({ message: 'Too many OTP requests. Please wait a few minutes.' });
    }

    const existing = await findUserByEmail(email);
    if (!existing) {
      return res.status(404).json({
        message: 'No account found for this email. Use the same email you registered with.',
      });
    }
    if (existing.role === 'admin') {
      return res.status(403).json({
        message: 'Admin accounts cannot use OTP. Please use email and password.',
      });
    }

    const destEmail = String(existing.email || email).toLowerCase().trim();
    const code = generateOtp();
    await saveOtp({ email: destEmail, code, purpose, payload: null });

    const result = await sendOtpEmail(destEmail, code, purpose);
    if (!result.sent) {
      await consumeOtp(destEmail, purpose);
      return res.status(503).json({
        message: result.error
          ? `Could not send OTP email: ${result.error}`
          : 'Could not send OTP email. SMTP is not configured.',
        channel: 'email',
      });
    }

    const msg =
      purpose === 'reset'
        ? 'OTP sent to your registered email. Enter the code below to set a new password.'
        : 'OTP sent to your registered email. Enter the 6-digit code to open your dashboard.';
    res.json(otpResponse(destEmail, purpose, msg));
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ message: err.message || 'Failed to send OTP' });
  }
});

/** Verify email OTP — login or password reset */
router.post('/otp/verify', async (req, res) => {
  try {
    const purpose = req.body.purpose === 'reset' ? 'reset' : 'login';
    const email = String(req.body.email || '').toLowerCase().trim();
    const code = String(req.body.code || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!email || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Email and 6-digit OTP are required' });
    }

    if (purpose === 'reset' && newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const record = await findOtpRecord(email, purpose);
    const expired = !record || (record.expiresAt instanceof Date
      ? record.expiresAt < new Date()
      : record.expiresAt < Date.now());

    if (!record || expired) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    if ((record.attempts || 0) >= 5) {
      await consumeOtp(email, purpose);
      return res.status(429).json({ message: 'Too many wrong attempts. Request a new OTP.' });
    }

    const expectedHash = record.codeHash || record.code;
    if (hashOtp(code) !== expectedHash) {
      const attempts = await bumpAttempts(email, purpose, record);
      return res.status(400).json({
        message: 'Invalid OTP code',
        attemptsLeft: Math.max(0, 5 - attempts),
      });
    }

    const user = await findUserByEmail(email);
    if (!user || user.role === 'admin') {
      await consumeOtp(email, purpose);
      return res.status(404).json({
        message: 'No client account found for this email.',
      });
    }

    if (purpose === 'reset') {
      const hash = await bcrypt.hash(newPassword, 10);
      if (isConnected()) {
        await User.updateOne({ _id: user._id }, { password: hash });
      } else {
        await ensureLocalUsers();
        localUsers.updatePassword(user._id, hash);
      }
      await consumeOtp(email, purpose);
      return res.json({
        success: true,
        message: 'Password updated. You can login with email/password or email OTP.',
      });
    }

    await consumeOtp(email, purpose);
    res.json({ success: true, user: publicUser(user), token: sign(user) });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ message: err.message || 'OTP verification failed' });
  }
});

/** Register — create account immediately (NO OTP). OTP only for login / forgot password. */
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone: rawPhone,
      password,
      idDocumentType,
      idImageBase64,
      idDocumentSource,
    } = req.body;

    if (!firstName || !email || !password || !rawPhone) {
      return res.status(400).json({ message: 'Name, email, mobile number and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const idMeta = resolveIdType(idDocumentType);
    if (!idMeta) {
      return res.status(400).json({ message: 'Please select a valid ID document type' });
    }
    if (!idImageBase64) {
      return res.status(400).json({ message: 'Please upload or capture your ID card photo' });
    }

    let idDocumentUrl;
    try {
      idDocumentUrl = saveIdImage(idImageBase64, String(email).split('@')[0]);
    } catch (e) {
      return res.status(400).json({ message: e.message || 'Invalid ID photo' });
    }

    const phone = normalizePhone(rawPhone);
    if (!phone) return res.status(400).json({ message: 'Valid mobile number is required' });

    if (isConnected()) {
      const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
      if (exists) {
        if (exists.role === 'admin') {
          return res.status(403).json({ message: 'This number/email cannot be used for client registration.' });
        }
        return res.status(409).json({ message: 'Email or mobile number already registered' });
      }
    } else {
      await ensureLocalUsers();
      const exists = localUsers.findByPhone(phone) || localUsers.findByEmail(email);
      if (exists) {
        if (exists.role === 'admin') {
          return res.status(403).json({ message: 'This number/email cannot be used for client registration.' });
        }
        return res.status(409).json({ message: 'Email or mobile number already registered' });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    const userFields = {
      firstName,
      lastName: lastName || '',
      email: String(email).toLowerCase().trim(),
      phone,
      password: hash,
      role: 'user',
      kycStatus: 'submitted',
      idDocumentType: idMeta.value,
      idDocumentLabel: idMeta.label,
      idDocumentCountry: idMeta.country,
      idDocumentUrl,
      idDocumentSource: idDocumentSource === 'camera' ? 'camera' : 'upload',
    };

    const user = isConnected()
      ? await User.create(userFields)
      : localUsers.createUser(userFields);

    const waitingMsg =
      'Your account is under review. Saudi authorities will examine your submitted identity data and approve or reject your registration. You will receive a notification once a decision is made.';

    const appPayload = {
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      email: user.email,
      phone: user.phone,
      service: 'Account Registration / Identity Review',
      message: waitingMsg,
      status: 'pending',
      type: 'kyc_registration',
      idDocumentUrl: user.idDocumentUrl,
      idDocumentLabel: user.idDocumentLabel,
    };

    if (isConnected()) {
      const { Application, Notification } = require('../models');
      await Application.create({
        user: user._id,
        ...appPayload,
      });
      await Notification.create({
        user: user._id,
        title: 'Registration received — waiting for approval',
        body: waitingMsg,
      });
    } else {
      localRecords.addApplication(user._id, appPayload);
      localRecords.addNotification(user._id, {
        title: 'Registration received — waiting for approval',
        body: waitingMsg,
      });
    }

    res.status(201).json({
      success: true,
      message: waitingMsg,
      waitingApproval: true,
      user: publicUser(user),
      token: sign(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

/** Email/password login — each account uses only its own email */
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await findUserByEmail(email, { withPassword: true });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ user: publicUser(user), token: sign(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Login failed' });
  }
});

router.get('/me', auth(), async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: publicUser(user) });
});

/** Upload / replace ID document for the logged-in client only */
router.post('/kyc', auth(), async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts do not use client KYC upload' });
    }
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idMeta = resolveIdType(req.body.idDocumentType);
    if (!idMeta) return res.status(400).json({ message: 'Please select a valid ID document type' });
    if (!req.body.idImageBase64) {
      return res.status(400).json({ message: 'Please upload or capture your ID card photo' });
    }

    let idDocumentUrl;
    try {
      idDocumentUrl = saveIdImage(req.body.idImageBase64, String(user.email || 'user').split('@')[0]);
    } catch (e) {
      return res.status(400).json({ message: e.message || 'Invalid ID photo' });
    }

    const patch = {
      idDocumentType: idMeta.value,
      idDocumentLabel: idMeta.label,
      idDocumentCountry: idMeta.country,
      idDocumentUrl,
      idDocumentSource: req.body.idDocumentSource === 'camera' ? 'camera' : 'upload',
      kycStatus: 'submitted',
    };

    let updated;
    if (isConnected()) {
      updated = await User.findByIdAndUpdate(user._id, patch, { new: true });
      const { Application, Notification } = require('../models');
      await Application.create({
        user: user._id,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phone,
        service: 'Identity document update',
        message: 'Updated ID submitted for Saudi authority review.',
        status: 'pending',
        idDocumentUrl,
      });
      await Notification.create({
        user: user._id,
        title: 'Documents submitted — waiting for approval',
        body: 'Your updated identity documents are under review. You will be notified after approval or rejection.',
      });
    } else {
      updated = localUsers.updateUser(user._id, patch);
      localRecords.addApplication(user._id, {
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phone,
        service: 'Identity document update',
        message: 'Updated ID submitted for Saudi authority review.',
        status: 'pending',
        type: 'kyc_registration',
        idDocumentUrl,
        idDocumentLabel: idMeta.label,
      });
      localRecords.addNotification(user._id, {
        title: 'Documents submitted — waiting for approval',
        body: 'Your updated identity documents are under review. You will be notified after approval or rejection.',
      });
    }
    res.json({
      success: true,
      user: publicUser(updated),
      waitingApproval: true,
      message: 'Documents submitted. Waiting for Saudi authority approval.',
    });
  } catch (err) {
    console.error('KYC upload error:', err);
    res.status(500).json({ message: err.message || 'KYC upload failed' });
  }
});

module.exports = router;
