/**
 * Normalize to E.164.
 * Saudi: 05xxxxxxxx → +9665xxxxxxxx
 * Pakistan: 03xxxxxxxxx → +923xxxxxxxxx
 */
function normalizePhone(raw) {
  if (!raw) return '';
  let p = String(raw).trim().replace(/[\s\-()]/g, '');
  if (p.startsWith('00')) p = `+${p.slice(2)}`;
  if (/^03\d{9}$/.test(p)) p = `+92${p.slice(1)}`;
  else if (/^3\d{9}$/.test(p)) p = `+92${p}`;
  else if (p.startsWith('92') && !p.startsWith('+') && p.length >= 12) p = `+${p}`;
  else if (p.startsWith('05') && p.length === 10) p = `+966${p.slice(1)}`;
  else if (p.startsWith('5') && p.length === 9) p = `+966${p}`;
  else if (p.startsWith('966') && !p.startsWith('+')) p = `+${p}`;
  else if (!p.startsWith('+')) p = `+${p.replace(/^\+/, '')}`;
  return p;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isMongoId(id) {
  return /^[a-fA-F0-9]{24}$/.test(String(id || ''));
}

module.exports = { normalizePhone, generateOtp, isMongoId };
