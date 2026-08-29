const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'ids');

function ensureDir() {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

function parseImage(base64OrDataUrl) {
  if (!base64OrDataUrl || typeof base64OrDataUrl !== 'string') {
    throw new Error('ID photo is required');
  }

  let mime = 'image/jpeg';
  let raw = base64OrDataUrl;
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(base64OrDataUrl);
  if (m) {
    mime = m[1];
    raw = m[2];
  }

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(mime)) throw new Error('ID photo must be JPG, PNG or WEBP');

  const buf = Buffer.from(raw, 'base64');
  if (buf.length < 800) throw new Error('ID photo is too small');
  if (buf.length > 6 * 1024 * 1024) throw new Error('ID photo must be under 6MB');

  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  return { buf, ext };
}

function validateIdImage(base64OrDataUrl) {
  parseImage(base64OrDataUrl);
  return true;
}

/** Save a data-URL or raw base64 image. Returns public URL path `/uploads/ids/...` */
function saveIdImage(base64OrDataUrl, userKey = 'user') {
  const { buf, ext } = parseImage(base64OrDataUrl);
  const name = `${String(userKey).replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'user'}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
  ensureDir();
  fs.writeFileSync(path.join(uploadsDir, name), buf);
  return `/uploads/ids/${name}`;
}

module.exports = { saveIdImage, validateIdImage, uploadsDir };
