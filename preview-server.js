/**
 * Minimal preview API — Node.js built-ins only (no express).
 */
const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'preview-jwt-secret';

const mockUser = {
  _id: 'preview-admin-id',
  firstName: 'System',
  lastName: 'Administrator',
  email: 'admin@ksaskilled.sa',
  phone: '+966500000000',
  role: 'admin',
  kycStatus: 'approved',
};

const mockNews = [
  {
    _id: '1',
    title: { en: 'KSA Skilled Development Launches New Training Program', ar: 'إطلاق برنامج تدريبي جديد' },
    slug: 'new-training-program-launch',
    excerpt: { en: 'A comprehensive initiative to empower Saudi workforce with world-class skills.', ar: 'مبادرة شاملة' },
    content: { en: 'KSA Skilled Development announces a landmark training program aligned with Vision 2030.', ar: 'تعلن كيه إس إيه عن برنامج تدريبي رائد.' },
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200',
    category: 'Training',
    author: 'KSA Editorial',
    published: true,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: { en: 'Partnership with Leading Engineering Firms', ar: 'شراكة مع شركات هندسية' },
    slug: 'engineering-partnership',
    excerpt: { en: 'Strategic partnerships to create thousands of skilled job opportunities.', ar: 'شراكات استراتيجية' },
    content: { en: 'We are proud to announce new partnerships with leading engineering firms.', ar: 'نفخر بالإعلان عن شراكات جديدة.' },
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200',
    category: 'Partnerships',
    author: 'KSA Editorial',
    published: true,
    publishedAt: new Date().toISOString(),
  },
];

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
    });
  });
}

function makeToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ id: mockUser._id, exp: Math.floor(Date.now() / 1000) + 604800 })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const body = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ? await parseBody(req) : {};

  if (path === '/api/health') return json(res, 200, { success: true, status: 'healthy', mode: 'preview' });
  if (path === '/api/news') return json(res, 200, { success: true, news: mockNews });
  if (path.startsWith('/api/news/')) {
    const slug = path.split('/api/news/')[1];
    const item = mockNews.find((n) => n.slug === slug);
    return item ? json(res, 200, { success: true, news: item }) : json(res, 404, { success: false });
  }
  if (path === '/api/blogs') return json(res, 200, { success: true, blogs: [] });
  if (path === '/api/contact' || path === '/api/newsletter') return json(res, 201, { success: true, message: 'OK' });
  if (path === '/api/auth/login') {
    if (body.email === 'admin@ksaskilled.sa' && body.password === 'Admin@123456') {
      return json(res, 200, { success: true, token: makeToken(), user: mockUser });
    }
    return json(res, 401, { success: false, message: 'Invalid credentials' });
  }
  if (path === '/api/auth/register' || path === '/api/auth/otp/send' || path === '/api/auth/forgot-password') {
    return json(res, 200, { success: true, message: 'OTP sent' });
  }
  if (path === '/api/auth/otp/verify' || path === '/api/auth/reset-password') {
    return json(res, 200, { success: true, token: makeToken(), user: { ...mockUser, role: 'user' } });
  }
  if (path === '/api/auth/me') {
    const auth = req.headers.authorization?.split(' ')[1];
    return auth ? json(res, 200, { success: true, user: mockUser }) : json(res, 401, { success: false });
  }
  if (path === '/api/auth/profile') return json(res, 200, { success: true, user: { ...mockUser, ...body } });
  if (path === '/api/auth/logout') return json(res, 200, { success: true });
  if (path === '/api/applications' && req.method === 'GET') return json(res, 200, { success: true, applications: [] });
  if (path === '/api/applications' && req.method === 'POST') {
    return json(res, 201, { success: true, application: { trackingNumber: `KSA-${Date.now()}`, status: 'submitted' } });
  }
  if (path === '/api/documents') return json(res, 200, { success: true, documents: [] });
  if (path === '/api/notifications') return json(res, 200, { success: true, notifications: [] });
  if (path.startsWith('/api/notifications/')) return json(res, 200, { success: true });
  if (path === '/api/admin/stats') return json(res, 200, { success: true, stats: { users: 1284, applications: 356, contacts: 12, notifications: 45 } });
  if (path === '/api/admin/users') return json(res, 200, { success: true, users: [mockUser] });
  if (path === '/api/admin/applications') return json(res, 200, { success: true, applications: [] });
  if (path.startsWith('/api/admin/applications/')) return json(res, 200, { success: true, application: { status: body.status } });
  if (path === '/api/admin/documents/share' || path === '/api/admin/broadcast') return json(res, 200, { success: true });

  json(res, 404, { success: false, message: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Preview API: http://localhost:${PORT}`);
  console.log('Admin: admin@ksaskilled.sa / Admin@123456');
});
