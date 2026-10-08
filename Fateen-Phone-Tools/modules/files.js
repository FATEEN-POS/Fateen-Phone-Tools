// Browse, search and download files, but only inside the folders listed in config.json ("shares").
const fs = require('fs'), path = require('path');
const roots = (cfg) => cfg.shares.map((p) => path.resolve(p));
function safe(cfg, i, rel) {
  const r = roots(cfg)[i]; if (!r) return null;
  try {
    const rr = fs.realpathSync(r), p = fs.realpathSync(path.resolve(r, rel || '.'));
    return p === rr || p.startsWith(rr + path.sep) ? p : null;
  } catch { return null; }
}
exports.name = 'files';
exports.safe = safe;
exports.handle = (m, { cfg }, ws) => {
  const out = (o) => ws.send(JSON.stringify(o));
  if (m.a === 'shares') return out({ shares: roots(cfg).map((p) => path.basename(p) || p) });
  if (m.a === 'ls') {
    const s = Number(m.s), p = String(m.p || ''), d = safe(cfg, s, p); if (!d) return;
    try {
      const items = fs.readdirSync(d, { withFileTypes: true }).filter((e) => !e.name.startsWith('.')).map((e) => {
        let size = 0; if (e.isFile()) try { size = fs.statSync(path.join(d, e.name)).size; } catch {}
        return { n: e.name, d: e.isDirectory(), size };
      }).sort((a, b) => b.d - a.d || a.n.localeCompare(b.n));
      out({ files: { s, p, items: items.slice(0, 300) } });
    } catch {}
  }
  if (m.a === 'find') {
    const q = String(m.q || '').toLowerCase().trim(); if (q.length < 2) return;
    const found = [], end = Date.now() + 3000;
    roots(cfg).forEach((r, s) => {
      const queue = [['', 0]];
      while (queue.length && found.length < 60 && Date.now() < end) {
        const [rel, dep] = queue.shift(); let es = [];
        try { es = fs.readdirSync(path.join(r, rel), { withFileTypes: true }); } catch { continue; }
        for (const e of es) {
          if (e.name.startsWith('.') || e.name === 'node_modules') continue;
          const rp = rel ? rel + '/' + e.name : e.name;
          if (e.name.toLowerCase().includes(q)) found.push({ s, p: rp, n: e.name, d: e.isDirectory() });
          if (e.isDirectory() && dep < 5) queue.push([rp, dep + 1]);
        }
      }
    });
    out({ found: found.slice(0, 60) });
  }
};
