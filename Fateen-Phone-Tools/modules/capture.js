const fs = require('fs'), path = require('path');
exports.name = 'capture';
exports.handle = (m, { ROOT }) => {
  const t = String(m.text || '').trim().slice(0, 2000);
  if (!t) return;
  const dir = path.join(ROOT, 'inbox'); fs.mkdirSync(dir, { recursive: true });
  const at = new Date().toISOString().slice(0, 16).replace('T', ' ');
  fs.appendFileSync(path.join(dir, 'notes.md'), `- [ ] ${at} — ${t.replace(/\n/g, ' ')}\n`);
};
