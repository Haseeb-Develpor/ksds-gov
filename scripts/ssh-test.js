/**
 * SSH connectivity test — credentials via env only (never hardcode secrets).
 * Usage:
 *   set SSH_HOST=147.93.80.83
 *   set SSH_PORT=65002
 *   set SSH_USER=u344641664
 *   set SSH_PASS=...
 *   node scripts/ssh-test.js
 */
const { Client } = require('ssh2');

const host = process.env.SSH_HOST || '147.93.80.83';
const port = Number(process.env.SSH_PORT || 65002);
const username = process.env.SSH_USER || 'u344641664';
const password = process.env.SSH_PASS;

if (!password) {
  console.error('Set SSH_PASS env var before running this script.');
  process.exit(1);
}

const conn = new Client();
conn
  .on('ready', () => {
    console.log('SSH_CONNECTED_OK');
    conn.exec('whoami; hostname; pwd; uname -a; ls -la ~ | head -30', (err, stream) => {
      if (err) {
        console.error('EXEC_ERROR', err.message);
        conn.end();
        process.exit(1);
      }
      let out = '';
      let errOut = '';
      stream.on('close', (code) => {
        console.log(out);
        if (errOut) console.error(errOut);
        console.log('EXIT_CODE', code);
        conn.end();
      });
      stream.on('data', (d) => (out += d.toString()));
      stream.stderr.on('data', (d) => (errOut += d.toString()));
    });
  })
  .on('error', (err) => {
    console.error('SSH_ERROR', err.message);
    process.exit(1);
  })
  .connect({
    host,
    port,
    username,
    password,
    readyTimeout: 30000,
    algorithms: {
      serverHostKey: ['ssh-ed25519', 'ecdsa-sha2-nistp256', 'rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa'],
    },
  });
