const router = require('express').Router();
const { User, Application, Contact, Newsletter, News, Notification, AuditLog } = require('../models');
const { auth, admin } = require('../middleware/auth');
const { isConnected } = require('../config/db');
const localUsers = require('../store/localUsers');
const localRecords = require('../store/localRecords');

router.use(auth(), admin);

router.get('/stats', async (req, res) => {
  if (!isConnected()) {
    await localUsers.ensureDefaults();
    const clients = localUsers.listClients();
    const apps = localRecords.listAllApplications();
    return res.json({
      users: clients.length,
      applications: apps.length,
      pendingApprovals: apps.filter((a) => a.status === 'pending' || a.status === 'in_review').length,
      approved: apps.filter((a) => a.status === 'approved').length,
      rejected: apps.filter((a) => a.status === 'rejected').length,
      contacts: 0,
      subscribers: 0,
      recent: apps.slice(0, 8).map((a) => ({
        user: a.name || a.email,
        action: `${a.service} — ${a.status}`,
        time: a.createdAt,
        status: a.status,
      })),
    });
  }
  const [users, applications, contacts, subscribers, pendingApprovals] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Application.countDocuments(),
    Contact.countDocuments(),
    Newsletter.countDocuments(),
    Application.countDocuments({ status: { $in: ['pending', 'in_review'] } }),
  ]);
  const recentApps = await Application.find().sort({ createdAt: -1 }).limit(8);
  res.json({
    users,
    applications,
    pendingApprovals,
    approved: await Application.countDocuments({ status: 'approved' }),
    rejected: await Application.countDocuments({ status: 'rejected' }),
    contacts,
    subscribers,
    recent: recentApps.map((a) => ({
      user: a.name || a.email,
      action: `${a.service || 'Application'} — ${a.status}`,
      time: a.createdAt,
      status: a.status,
    })),
  });
});

router.get('/users', async (req, res) => {
  if (!isConnected()) {
    await localUsers.ensureDefaults();
    return res.json(localUsers.listClients());
  }
  const users = await User.find({ role: 'user' })
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(users);
});

router.get('/applications', async (req, res) => {
  if (!isConnected()) {
    return res.json(localRecords.listAllApplications());
  }
  res.json(await Application.find().sort({ createdAt: -1 }).limit(200));
});

async function decideApplication(req, res, decision) {
  const id = req.params.id;
  const status = decision; // approved | rejected
  const note =
    status === 'approved'
      ? 'Your account has been approved after review. You may continue using KSA Skilled Development services.'
      : 'Your account registration was not approved after review. Please contact support or update your documents.';

  if (!isConnected()) {
    const app = localRecords.getApplication(id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    const updated = localRecords.updateApplication(id, { status });
    if (app.userId) {
      localUsers.updateUser(app.userId, { kycStatus: status });
      localRecords.addNotification(app.userId, {
        title: status === 'approved' ? 'Account approved' : 'Account not approved',
        body:
          status === 'approved'
            ? 'Saudi authority review is complete. Your account has been approved. You can now use all client services.'
            : 'After reviewing your submitted data, your account was not approved. Please update your ID documents or contact support.',
      });
    }
    return res.json({ success: true, application: updated, message: note });
  }

  const app = await Application.findById(id);
  if (!app) return res.status(404).json({ message: 'Application not found' });
  app.status = status;
  await app.save();
  if (app.user) {
    await User.findByIdAndUpdate(app.user, { kycStatus: status });
    await Notification.create({
      user: app.user,
      title: status === 'approved' ? 'Account approved' : 'Account not approved',
      body:
        status === 'approved'
          ? 'Saudi authority review is complete. Your account has been approved. You can now use all client services.'
          : 'After reviewing your submitted data, your account was not approved. Please update your ID documents or contact support.',
    });
  }
  await AuditLog.create({ actor: req.user.id, action: `application_${status}`, meta: { id } });
  res.json({ success: true, application: app, message: note });
}

router.post('/applications/:id/approve', (req, res) => decideApplication(req, res, 'approved'));
router.post('/applications/:id/reject', (req, res) => decideApplication(req, res, 'rejected'));

router.post('/news', async (req, res) => {
  if (!isConnected()) return res.json({ ok: true, mock: true });
  res.json(await News.create(req.body));
});

router.post('/broadcast', async (req, res) => {
  if (isConnected()) {
    const users = await User.find().select('_id');
    await Notification.insertMany(users.map((u) => ({ user: u._id, title: req.body.title, body: req.body.body })));
    await AuditLog.create({ actor: req.user.id, action: 'broadcast', meta: req.body });
  }
  res.json({ message: 'Broadcast sent', ok: true });
});

module.exports = router;
