// Only closes windows the PC itself listed (graceful close, never /F) and runs a fixed set of power actions.
const { execFile } = require('child_process');
let listed = new Set();
const POWER = {
  sleep: ['rundll32.exe', ['powrprof.dll,SetSuspendState', '0', '1', '0']],
  shutdown: ['shutdown', ['/s', '/t', '30']],
  restart: ['shutdown', ['/r', '/t', '30']],
  cancel: ['shutdown', ['/a']],
};
exports.name = 'pcctl';
exports.handle = (m, api, ws) => {
  if (m.a === 'list') {
    execFile('powershell', ['-NoProfile', '-Command', 'Get-Process | ? {$_.MainWindowTitle} | % { "$($_.Id)|$($_.ProcessName)|$($_.MainWindowTitle)" }'], (e, out) => {
      if (e) return;
      const l = out.split(/\r?\n/).filter(Boolean).map((x) => { const [i, n, ...t] = x.split('|'); return { pid: Number(i), name: n, title: t.join('|') }; });
      listed = new Set(l.map((x) => x.pid));
      ws.send(JSON.stringify({ procs: l }));
    });
  } else if (m.a === 'kill' && listed.has(m.pid)) execFile('taskkill', ['/PID', String(m.pid)]);
  else if (POWER[m.a]) execFile(...POWER[m.a]);
};
