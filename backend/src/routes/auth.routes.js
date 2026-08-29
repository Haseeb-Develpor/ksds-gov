const router = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, Otp } = require('../models');
const { sign, auth } = require('../middleware/auth');
const { isConnected } = require('../config/db');
const { normalizePhone, generateOtp, sendWhatsAppOtp } = require('../services/whatsapp');
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

async function findUserByPhone(phone) {
  if (isConnected()) return User.findOne({ phone });
  await ensureLocalUsers();
  return localUsers.findByPhone(phone);
}

async function findUserById(id) {
  if (isConnected()) return User.findById(id);
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

function maskPhone(phone) {
  const p = String(phone || '');
  if (p.length < 6) return '****';
  return `${p.slice(0, 5)}****${p.slice(-3)}`;
}

function hashOtp(code) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
}

function canSend(phone) {
  const now = Date.now();
  const list = (sendHits.get(phone) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 5) {
    sendHits.set(phone, list);
    return false;
  }
  list.push(now);
  sendHits.set(phone, list);
  return true;
}

function resolveIdType(value) {
  return idTypes.find((t) => t.value === value) || null;
}

async function saveOtp({ phone, code, purpose, payload }) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const codeHash = hashOtp(code);
  if (isConnected()) {
    await Otp.deleteMany({ phone, purpose });
    await Otp.create({ phone, code: codeHash, purpose, payload, expiresAt, attempts: 0 });
  } else {
    memoryOtps.set(`${phone}:${purpose}`, {
      codeHash,
      purpose,
      payload,
      expiresAt: expiresAt.getTime(),
      attempts: 0,
    });
  }
  if (process.env.OTP_SERVER_LOG === 'true') {
    console.log(`[OTP SERVER LOG] ${purpose} ${phone} => ${code}`);
  }
  return expiresAt;
}

async function findOtpRecord(phone, purpose) {
  if (isConnected()) {
    return Otp.findOne({ phone, purpose }).sort({ createdAt: -1 });
  }
  return memoryOtps.get(`${phone}:${purpose}`) || null;
}

async function bumpAttempts(phone, purpose, record) {
  const attempts = (record.attempts || 0) + 1;
  if (isConnected() && record.save) {
    record.attempts = attempts;
    await record.save();
  } else {
    record.attempts = attempts;
    memoryOtps.set(`${phone}:${purpose}`, record);
  }
  return attempts;
}

async function consumeOtp(phone, purpose) {
  if (isConnected()) await Otp.deleteMany({ phone, purpose });
  else memoryOtps.delete(`${phone}:${purpose}`);
}

function otpResponse(phone, purpose, message, code, provider) {
  const showCode =
    provider === 'dev-console' ||
    process.env.OTP_SHOW_ON_CLIENT === 'true';
  return {
    success: true,
    message,
    channel: provider === 'dev-console' ? 'on_screen' : 'whatsapp',
    phoneMasked: maskPhone(phone),
    purpose,
    ...(showCode && code ? { otpCode: code } : {}),
  };
}

router.get('/id-types', (_req, res) => {
  res.json({ items: idTypes });
});

/** Send OTP — only for login or forgot-password (never on register) */
router.post('/otp/send', async (req, res) => {
  try {
    const purpose = req.body.purpose === 'reset' ? 'reset' : 'login';
    const phone = normalizePhone(req.body.phone);
    if (!phone) return res.status(400).json({ message: 'Valid WhatsApp number is required' });

    if (!canSend(phone)) {
      return res.status(429).json({ message: 'Too many OTP requests. Please wait a few minutes.' });
    }

    const existing = await findUserByPhone(phone);
    if (!existing) {
      return res.status(404).json({
        message: 'No account found for this number. Use the same WhatsApp number you registered with.',
      });
    }
    if (existing.role === 'admin') {
      return res.status(403).json({
        message: 'Admin accounts cannot use OTP. Please use email and password.',
      });
    }

    const code = generateOtp();
    await saveOtp({ phone, code, purpose, payload: null });

    const result = await sendWhatsAppOtp(phone, code);
    if (!result.sent) {
      await consumeOtp(phone, purpose);
      return res.status(503).json({
        message: 'Could not send OTP. Please try again.',
        channel: 'whatsapp',
      });
    }

    const msg =
      result.provider === 'dev-console'
        ? purpose === 'reset'
          ? 'OTP generated. Enter the code below to set a new password.'
          : 'OTP generated for your registered number. Enter the code below to open your dashboard.'
        : purpose === 'reset'
          ? 'OTP sent to your WhatsApp. Enter it to reset your password.'
          : 'OTP sent to your WhatsApp. Enter the 6-digit code below.';
    res.json(otpResponse(phone, purpose, msg, code, result.provider));
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ message: err.message || 'Failed to send OTP' });
  }
});

/** Verify OTP — login opens dashboard; reset updates password (never used for register) */
router.post('/otp/verify', async (req, res) => {
  try {
    const purpose = req.body.purpose === 'reset' ? 'reset' : 'login';
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!phone || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Phone and 6-digit OTP are required' });
    }

    if (purpose === 'reset' && newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const record = await findOtpRecord(phone, purpose);
    const expired = !record || (record.expiresAt instanceof Date
      ? record.expiresAt < new Date()
      : record.expiresAt < Date.now());

    if (!record || expired) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    if ((record.attempts || 0) >= 5) {
      await consumeOtp(phone, purpose);
      return res.status(429).json({ message: 'Too many wrong attempts. Request a new OTP.' });
    }

    const expectedHash = record.codeHash || record.code;
    if (hashOtp(code) !== expectedHash) {
      const attempts = await bumpAttempts(phone, purpose, record);
      return res.status(400).json({
        message: 'Invalid OTP code',
        attemptsLeft: Math.max(0, 5 - attempts),
      });
    }

    const user = await findUserByPhone(phone);
    if (!user || user.role === 'admin') {
      await consumeOtp(phone, purpose);
      return res.status(404).json({
        message: 'No client account found for this number.',
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
      await consumeOtp(phone, purpose);
      return res.json({
        success: true,
        message: 'Password updated. You can login with email/password or OTP.',
      });
    }

    await consumeOtp(phone, purpose);
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
      return res.status(400).json({ message: 'Name, email, WhatsApp number and password are required' });
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
    if (!phone) return res.status(400).json({ message: 'Valid WhatsApp mobile number is required' });

    if (isConnected()) {
      const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
      if (exists) {
        if (exists.role === 'admin') {
          return res.status(403).json({ message: 'This number/email cannot be used for client registration.' });
        }
        return res.status(409).json({ message: 'Email or WhatsApp number already registered' });
      }
    } else {
      await ensureLocalUsers();
      const exists = localUsers.findByPhone(phone) || localUsers.findByEmail(email);
      if (exists) {
        if (exists.role === 'admin') {
          return res.status(403).json({ message: 'This number/email cannot be used for client registration.' });
        }
        return res.status(409).json({ message: 'Email or WhatsApp number already registered' });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    const userFields = {
      firstName,
      lastName: lastName || '',
      email: String(email).toLowerCase(),
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

/** Email/password login — admin + clients by their own email only */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  if (!isConnected()) {
    await ensureLocalUsers();
    const local = localUsers.findByEmail(email);
    if (local) {
      const ok = await bcrypt.compare(password, local.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      return res.json({ user: publicUser(local), token: sign(local) });
    }
    if (email === 'admin@ksaskilled.sa' && password === 'Admin@123456') {
      const mock = {
        _id: 'mock-admin',
        firstName: 'System',
        lastName: 'Administrator',
        email,
        role: 'admin',
        kycStatus: 'approved',
      };
      return res.json({ user: publicUser(mock), token: sign(mock) });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ user: publicUser(user), token: sign(user) });
});

router.get('/me', auth(), async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    if (req.user.role === 'admin') {
      return res.json({
        user: publicUser({
          _id: req.user.id,
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@ksaskilled.sa',
          role: 'admin',
          kycStatus: 'approved',
        }),
      });
    }
    return res.status(404).json({ message: 'User not found' });
  }
  // Only return that user's own profile (never another account)
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
