// Macros come only from config.json on the PC, so the phone can trigger them but never define commands.
const { spawn } = require('child_process');
const go = (cmd, args) => spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
function run(x, keys) {
  if (x.key) keys.press(x.key);
  if (x.url && /^https?:\/\//.test(x.url)) go('explorer', [x.url]);
  if (x.run) go('cmd', ['/c', 'start', '', x.run]);
  (x.steps || []).forEach((s, i) => setTimeout(() => run(s, keys), (i + 1) * 800));
}
exports.name = 'macros';
exports.handle = (m, { keys, cfg }) => { const x = cfg.macros.find((z) => z.id === m.id); if (x) run(x, keys); };
