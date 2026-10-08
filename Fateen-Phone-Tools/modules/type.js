// Types text (Arabic included) into whatever window is active on the PC, via clipboard paste. Overwrites the PC clipboard.
exports.name = 'type';
exports.handle = (m, { keys }) => {
  const t = String(m.text || '').slice(0, 5000);
  if (!t) return;
  keys.raw(`Set-Clipboard -Value ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${Buffer.from(t, 'utf8').toString('base64')}')))`);
  setTimeout(() => { keys.press('ctrl+v'); if (m.enter) setTimeout(() => keys.press('enter'), 150); }, 300);
};
