// Phone Tools core: HTTPS + WebSocket + PIN + module loader + safe port picking.
const https = require('https'), fs = require('fs'), os = require('os'), net = require('net');
const path = require('path'), crypto = require('crypto');
const { WebSocketServer } = require('ws');
const selfsigned = require('selfsigned');
const keys = require('./keys');

const ROOT = __dirname, CFG = path.join(ROOT, 'config.json');
const defaults = {
  port: 47100, // uncommon on purpose: avoids 3000/5173/8080 and friends
  pin: String(crypto.randomInt(100000, 1000000)),
  shares: [path.join(os.homedir(), 'Downloads'), path.join(os.homedir(), 'Documents')], // folders the phone may browse
  macros: [
    { id: 'm1', label: 'Google', icon: '🌐', url: 'https://google.com' },
    { id: 'm2', label: 'Desktop', icon: '🖥️', key: 'win+d' },
    { id: 'm3', label: 'Lock PC', icon: '🔒', key: 'win+l' },
    { id: 'm4', label: 'Notepad', icon: '📝', run: 'notepad' },
    { id: 'm5', label: 'Work mode', icon: '🚀', steps: [{ url: 'https://google.com' }, { run: 'notepad' }] },
  ],
};
const disk = fs.existsSync(CFG) ? JSON.parse(fs.readFileSync(CFG, 'utf8')) : null;
const cfg = { ...defaults, ...(disk || {}) };
let dirty = !disk || !disk.pin || !disk.shares; // write config.json only when there is something new to save
let warned = false;
const save = () => {
  try { fs.writeFileSync(CFG, JSON.stringify(cfg, null, 2)); }
  catch (e) { if (!warned) { warned = true; console.log(`⚠️  Cannot write ${CFG} (${e.code}). Settings and the PIN will not be remembered. Fix: clear Read-only on the file, move the folder to C:\\Users\\<you>\\phone-tools, or allow node.exe in Windows Security > Controlled folder access.`); } }
};

const lanIPs = () => Object.values(os.networkInterfaces()).flat().filter((i) => i.family === 'IPv4' && !i.internal).map((i) => i.address);
const isFree = (p) => new Promise((r) => { const s = net.createServer().once('error', () => r(false)).once('listening', () => s.close(() => r(true))).listen(p, '0.0.0.0'); });
async function pickPort(p, tries = 20) { for (let i = p; i < p + tries; i++) if (await isFree(i)) return i; throw new Error('No free port near ' + p); }

function tls() {
  const d = path.join(ROOT, 'certs'), k = path.join(d, 'key.pem'), c = path.join(d, 'cert.pem');
  if (!fs.existsSync(c)) {
    const p = selfsigned.generate([{ name: 'commonName', value: 'phone-tools' }], { days: 3650, keySize: 2048,
      extensions: [{ name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }, ...lanIPs().map((ip) => ({ type: 7, ip }))] }] });
    try { fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(k, p.private); fs.writeFileSync(c, p.cert); }
    catch (e) { console.log(`⚠️  Cannot save the certificate (${e.code}); using a temporary one for this run.`); return { key: p.private, cert: p.cert }; }
  }
  return { key: fs.readFileSync(k), cert: fs.readFileSync(c) };
}

// PIN check with lockout after 5 wrong tries (1 minute)
const fails = new Map();
const locked = (ip) => (fails.get(ip)?.until || 0) > Date.now();
const fail = (ip) => { const f = fails.get(ip) || { n: 0 }; if (++f.n >= 5) { f.until = Date.now() + 60000; f.n = 0; } fails.set(ip, f); };
const okPin = (p) => { const a = Buffer.from(String(p || '')), b = Buffer.from(cfg.pin); return a.length === b.length && crypto.timingSafeEqual(a, b); };

// Modules: every file in /modules exports { name, handle(msg, api, ws) }. One failing module never stops the rest.
const api = { keys, cfg, ROOT }, mods = {};
for (const f of fs.readdirSync(path.join(ROOT, 'modules')).filter((f) => f.endsWith('.js'))) {
  try { const m = require('./modules/' + f); mods[m.name] = m; } catch (e) { console.log(`⚠️  module ${f} skipped: ${e.message}`); }
}

// "Local" = this computer itself, whether it reached the server via localhost or via its own LAN IP
const isLocal = (r) => { const a = String(r.socket.remoteAddress).replace('::ffff:', ''); return a === '::1' || a === '127.0.0.1' || lanIPs().includes(a); };
const srv = https.createServer(tls(), (req, res) => {
  const ip = req.socket.remoteAddress, u = new URL(req.url, 'https://x');
  if (u.pathname === '/api/upload' && req.method === 'POST') {
    if (locked(ip) || !okPin(req.headers['x-pin'])) { fail(ip); res.writeHead(401); return res.end(); }
    const dir = path.join(ROOT, 'inbox', 'files'); fs.mkdirSync(dir, { recursive: true });
    const name = Date.now() + '-' + path.basename(u.searchParams.get('name') || 'file').replace(/[^\w.\-\u0600-\u06FF ]/g, '_');
    const out = fs.createWriteStream(path.join(dir, name)); let n = 0;
    req.on('data', (c) => { if ((n += c.length) > 200e6) { req.destroy(); out.destroy(); } });
    req.pipe(out); out.on('finish', () => { res.writeHead(200); res.end('ok'); });
    return;
  }
  if (u.pathname === '/play' || u.pathname === '/linkpad') { res.writeHead(302, { Location: u.pathname === '/play' ? '/linkpad/play.html' : '/linkpad/' }); return res.end(); }
  if (u.pathname.startsWith('/linkpad/')) {
    const base = path.join(ROOT, 'public', 'linkpad'), f = path.join(base, u.pathname.slice(9) || 'index.html');
    if (!f.startsWith(base + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    return fs.createReadStream(f).pipe(res);
  }
  if (u.pathname === '/vendor/zxing.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    return fs.createReadStream(path.join(ROOT, 'public', 'vendor', 'zxing.min.js')).pipe(res);
  }
  if (u.pathname === '/api/dl') {
    if (locked(ip) || !okPin(u.searchParams.get('pin'))) { fail(ip); res.writeHead(401); return res.end(); }
    const f = mods.files && mods.files.safe(cfg, Number(u.searchParams.get('s')), u.searchParams.get('p'));
    if (!f || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(path.basename(f)) });
    return fs.createReadStream(f).pipe(res);
  }
  if (u.pathname === '/api/push' && req.method === 'POST') {
    if (!isLocal(req) || req.headers['x-pts'] !== '1') { res.writeHead(403); return res.end(); }
    let b = ''; req.on('data', (c) => { if (b.length < 1e4) b += c; });
    req.on('end', () => {
      try { const p = JSON.parse(b); api.broadcast({ push: { kind: String(p.kind || 'text'), text: String(p.text || '').slice(0, 2000) } }); res.writeHead(200); } catch { res.writeHead(400); }
      res.end();
    });
    return;
  }
  const page = u.pathname === '/pc' || u.pathname === '/cam' ? (isLocal(req) ? u.pathname.slice(1) + '.html' : null) : 'index.html';
  if (!page) { res.writeHead(403); return res.end('Open this page on the PC itself: https://localhost'); }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(path.join(ROOT, 'public', page)).pipe(res);
});

const wss = new WebSocketServer({ noServer: true }), pcWss = new WebSocketServer({ noServer: true }), dispWss = new WebSocketServer({ noServer: true });
srv.on('upgrade', (req, sock, head) => {
  const p = new URL(req.url, 'https://x').pathname;
  if (p === '/ws') wss.handleUpgrade(req, sock, head, (ws) => wss.emit('connection', ws, req));
  else if (p === '/ws-pc' && isLocal(req)) pcWss.handleUpgrade(req, sock, head, (ws) => pcWss.emit('connection', ws, req));
  else if (p === '/ws-display' && isLocal(req)) dispWss.handleUpgrade(req, sock, head, (ws) => dispWss.emit('connection', ws, req));
  else sock.destroy();
});
// Game display screens (the /play page on this computer)
api.toDisplays = (o) => dispWss.clients.forEach((c) => c.readyState === 1 && c.send(JSON.stringify(o)));
dispWss.on('connection', (ws) => { if (mods.linkpad && mods.linkpad.display) mods.linkpad.display(ws); });
// WebRTC signaling between phone (/ws) and the PC viewer page (/ws-pc, this computer only)
let rtcBuf = [];
api.toPc = (o) => {
  const t = o.rtc.type; if (t === 'offer' || t === 'bye') rtcBuf = []; if (t !== 'bye') rtcBuf.push(o);
  pcWss.clients.forEach((c) => c.readyState === 1 && c.send(JSON.stringify(o)));
};
pcWss.on('connection', (ws) => {
  rtcBuf.forEach((o) => ws.send(JSON.stringify(o)));
  ws.on('message', (d) => { let m; try { m = JSON.parse(d); } catch { return; } api.broadcast({ rtc: m }); });
});
api.broadcast = (o) => wss.clients.forEach((c) => c.authed && c.readyState === 1 && c.send(JSON.stringify(o)));
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress, pin = new URL(req.url, 'https://x').searchParams.get('pin');
  if (locked(ip) || !okPin(pin)) { fail(ip); return ws.close(4001, 'bad pin'); }
  ws.authed = true;
  ws.send(JSON.stringify({ hello: { modules: Object.keys(mods), macros: cfg.macros.map(({ id, label, icon }) => ({ id, label, icon })) } }));
  ws.on('message', (d) => {
    let m; try { m = JSON.parse(d); } catch { return; }
    try { mods[m.m || (m.type && 'linkpad')]?.handle(m, api, ws); } catch (e) { console.log('module error:', e.message); }
  });
});

(async () => {
  const port = await pickPort(cfg.port);
  if (port !== cfg.port) { console.log(`ℹ️  Port ${cfg.port} is busy, using ${port} instead`); cfg.port = port; dirty = true; }
  if (dirty) save();
  srv.listen(port, '0.0.0.0', () => {
    const urls = lanIPs().map((ip) => `https://${ip}:${port}`);
    const g = (t) => `\x1b[38;2;255;79;31m${t}\x1b[0m`;
    console.log('\n' + g('  ╭──────────────────────────────╮'));
    console.log(g('  │  F·  FATEEN · Phone Tools    │'));
    console.log(g('  │  فطين. شغل بيكمّل.  fateen1.me │'));
    console.log(g('  ╰──────────────────────────────╯') + '\n');
    console.log('📱 Phone Tools is running\n');
    urls.forEach((u) => console.log('   ' + u));
    console.log(`\n   PIN: ${cfg.pin}   (change it in config.json)\n`);
    console.log('   From the PC (send to phone): https://localhost:' + port + '/pc');
    console.log('   From the PC (phone camera view):  https://localhost:' + port + '/cam');
    console.log('   From the PC (Link Pad games screen): https://localhost:' + port + '/play');
    if (urls[0]) require('qrcode-terminal').generate(urls[0], { small: true });
    console.log('\nOn the phone: open the link, accept the certificate warning once, enter the PIN.');
  });
})();
