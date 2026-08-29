const router = require('express').Router();
const { News, Blog, Contact, Newsletter, Application } = require('../models');
const { isConnected } = require('../config/db');

const sampleNews = [
  { _id: '1', slug: 'new-training-program', title: { en: 'KSA Skilled Development Launches New Training Program' }, excerpt: { en: 'A comprehensive initiative to empower the Saudi workforce.' }, content: { en: 'KSA Skilled Development announces a landmark training program aligned with Vision 2030, delivering world-class certification across every major sector.' }, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=70', category: 'Training', createdAt: '2026-06-20' },
  { _id: '2', slug: 'partnership-announcement', title: { en: 'Strategic Partnership Strengthens Workforce Pipeline' }, excerpt: { en: 'New agreements expand our reach across key sectors.' }, content: { en: 'A new set of strategic partnerships strengthens our recruitment and deployment pipeline across construction, healthcare, and logistics.' }, image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=70', category: 'Corporate', createdAt: '2026-06-12' },
  { _id: '3', slug: 'hajj-season-success', title: { en: 'Record Hajj Season Operations Completed' }, excerpt: { en: 'Our Hajj division served thousands of pilgrims.' }, content: { en: 'This Hajj season marked a record in premium, fully managed services for pilgrims across the Kingdom.' }, image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=70', category: 'Hajj', createdAt: '2026-06-01' },
];

router.get('/news', async (req, res) => {
  if (!isConnected()) return res.json(sampleNews);
  const items = await News.find().sort({ createdAt: -1 }).limit(50);
  res.json(items.length ? items : sampleNews);
});

router.get('/news/:slug', async (req, res) => {
  if (!isConnected()) return res.json(sampleNews.find((n) => n.slug === req.params.slug) || sampleNews[0]);
  const item = await News.findOne({ slug: req.params.slug });
  res.json(item || sampleNews[0]);
});

router.get('/blogs', async (req, res) => {
  if (!isConnected()) return res.json([]);
  res.json(await Blog.find().sort({ createdAt: -1 }).limit(50));
});

router.post('/contact', async (req, res) => {
  const { name, email, subject, message, phone } = req.body || {};
  if (isConnected()) await Contact.create(req.body);

  // Also land in Admin Mail inbox (info@ksds-gov.com)
  try {
    const localMail = require('../store/localMail');
    const from = String(email || 'unknown@visitor').trim();
    localMail.addMessage({
      folder: 'inbox',
      from,
      to: localMail.MAILBOX || 'info@ksds-gov.com',
      subject: subject || `Website contact from ${name || from}`,
      body: [
        name ? `Name: ${name}` : null,
        phone ? `Phone: ${phone}` : null,
        email ? `Email: ${email}` : null,
        '',
        String(message || ''),
      ].filter((x) => x !== null).join('\n'),
      source: 'contact',
      read: false,
    });
  } catch (err) {
    console.warn('Contact → mail inbox:', err.message);
  }

  res.json({ message: 'Message received', ok: true });
});

router.post('/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  if (isConnected()) await Newsletter.updateOne({ email }, { email }, { upsert: true });
  res.json({ message: 'Subscribed', ok: true });
});

router.post('/applications', async (req, res) => {
  if (isConnected()) await Application.create(req.body);
  res.json({ message: 'Application submitted', ok: true });
});

module.exports = router;
