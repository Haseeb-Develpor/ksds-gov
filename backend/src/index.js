require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
const fs = require('fs');

const { connectDB } = require('./config/db');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 600 }));

// Serve uploaded ID photos
const uploadsRoot = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
app.use('/uploads', express.static(uploadsRoot));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/me', require('./routes/client.routes'));
app.use('/api', require('./routes/content.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/admin/mail', require('./routes/mail.routes'));

// Basic API index (Swagger-style summary)
app.get('/api', (req, res) => res.json({
  name: 'KSA Skilled Development API',
  version: '1.0.0',
  endpoints: ['/api/auth', '/api/news', '/api/contact', '/api/newsletter', '/api/applications', '/api/admin'],
}));

// Serve built frontend (single-origin preview) + SPA fallback
const distDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(distDir, 'index.html')));
  console.log('✓ Serving frontend from', distDir);
}

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io live chat (optional — loads if installed)
try {
  const { Server } = require('socket.io');
  const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || '*' } });
  io.on('connection', (socket) => {
    socket.on('chat:message', (msg) => io.emit('chat:message', msg));
  });
  console.log('✓ Socket.io chat enabled');
} catch {
  console.log('· Socket.io not installed — live chat uses client-only fallback');
}

connectDB().finally(async () => {
  try {
    const { isConnected } = require('./config/db');
    if (!isConnected()) {
      await require('./store/localUsers').ensureDefaults();
      console.log('✓ Local user store ready (OTP login works without MongoDB)');
    }
  } catch (err) {
    console.warn('· Local user store init:', err.message);
  }
  server.listen(PORT, () => {
    console.log(`✓ API running on http://localhost:${PORT}/api`);
  });
});
