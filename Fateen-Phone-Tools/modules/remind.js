const { execFile } = require('child_process');
exports.name = 'remind';
exports.handle = (m, api) => {
  const mins = Math.min(Math.max(Number(m.mins) || 1, 1), 1440), text = String(m.text || 'تذكير').slice(0, 200);
  setTimeout(() => {
    api.broadcast({ push: { kind: 'remind', text } });
    const b64 = Buffer.from(text, 'utf8').toString('base64');
    execFile('powershell', ['-NoProfile', '-Command', `Add-Type -AssemblyName PresentationFramework;[void][Windows.MessageBox]::Show([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${b64}')),'Phone Tools','OK','Information')`]);
  }, mins * 60000);
};
