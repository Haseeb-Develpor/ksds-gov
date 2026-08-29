const router = require('express').Router();
const { Application, Document } = require('../models');
const { auth } = require('../middleware/auth');
const { isConnected } = require('../config/db');
const localUsers = require('../store/localUsers');
const localRecords = require('../store/localRecords');

router.use(auth());

/** Block admin from client-only endpoints */
router.use((req, res, next) => {
  if (req.user?.role === 'admin') {
    return res.status(403).json({ message: 'Use admin panel for admin data' });
  }
  next();
});

router.get('/applications', async (req, res) => {
  const userId = req.user.id;
  if (isConnected()) {
    const rows = await Application.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
    return res.json({ items: rows });
  }
  res.json({ items: localRecords.listApplications(userId) });
});

router.get('/documents', async (req, res) => {
  const userId = req.user.id;
  if (isConnected()) {
    const rows = await Document.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
    return res.json({ items: rows });
  }
  // Local: ID card from user profile + any shared docs for this user only
  await localUsers.ensureDefaults();
  const me = localUsers.findById(userId);
  const items = localRecords.listDocuments(userId);
  if (me?.idDocumentUrl) {
    items.unshift({
      _id: 'id-card',
      userId,
      title: me.idDocumentLabel || 'National ID / Identity card',
      type: 'identity_card',
      url: me.idDocumentUrl,
      createdAt: me.updatedAt || me.createdAt || new Date().toISOString(),
      isIdentityCard: true,
    });
  }
  res.json({ items });
});

router.get('/overview', async (req, res) => {
  const userId = req.user.id;
  let apps = [];
  let docs = [];
  let unread = 0;
  if (isConnected()) {
    apps = await Application.find({ user: userId }).select('status').lean();
    docs = await Document.find({ user: userId }).select('_id').lean();
    const { Notification } = require('../models');
    unread = await Notification.countDocuments({ user: userId, read: false });
  } else {
    apps = localRecords.listApplications(userId);
    docs = localRecords.listDocuments(userId);
    const me = localUsers.findById(userId);
    if (me?.idDocumentUrl) docs = [{ _id: 'id-card' }, ...docs];
    unread = localRecords.unreadCount(userId);
  }
  res.json({
    applications: apps.length,
    documents: docs.length,
    pending: apps.filter((a) => String(a.status || '').toLowerCase().includes('pending')).length,
    unreadNotifications: unread,
  });
});

router.get('/notifications', async (req, res) => {
  const userId = req.user.id;
  if (isConnected()) {
    const { Notification } = require('../models');
    const items = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
    return res.json({ items });
  }
  res.json({ items: localRecords.listNotifications(userId) });
});

router.post('/notifications/:id/read', async (req, res) => {
  const userId = req.user.id;
  if (isConnected()) {
    const { Notification } = require('../models');
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    return res.json({ item: n });
  }
  const item = localRecords.markNotificationRead(userId, req.params.id);
  if (!item) return res.status(404).json({ message: 'Notification not found' });
  res.json({ item });
});

module.exports = router;
