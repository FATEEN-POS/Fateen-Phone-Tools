// Sends real key presses on Windows through one persistent PowerShell (no native modules to compile).
const { spawn } = require('child_process');
const VK = { ctrl: 0x11, shift: 0x10, alt: 0x12, win: 0x5B, enter: 0x0D, esc: 0x1B, space: 0x20, tab: 0x09,
  left: 0x25, up: 0x26, right: 0x27, down: 0x28, pgup: 0x21, pgdn: 0x22, end: 0x23, home: 0x24,
  volmute: 0xAD, voldown: 0xAE, volup: 0xAF, next: 0xB0, prev: 0xB1, playpause: 0xB3 };
const EXT = new Set([0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28]);
let ps = null;

function start() {
  if (process.platform !== 'win32') return;
  ps = spawn('powershell', ['-NoProfile', '-NoLogo', '-Command', '-'], { stdio: ['pipe', 'ignore', 'ignore'] });
  ps.on('exit', () => { ps = null; });
  ps.stdin.write("Add-Type -Namespace W -Name K -MemberDefinition '[DllImport(\"user32.dll\")] public static extern void keybd_event(byte b,byte s,uint f,UIntPtr e);'\n");
}
function vk(n) {
  n = n.toLowerCase();
  if (VK[n]) return VK[n];
  if (/^f([1-9]|1[0-2])$/.test(n)) return 0x6F + Number(n.slice(1));
  if (/^[a-z0-9]$/.test(n)) return n.toUpperCase().charCodeAt(0);
}
exports.press = (combo) => {
  if (!ps) start();
  if (!ps) return console.log('keys: only supported on Windows for now');
  const k = String(combo).split('+').map(vk);
  if (k.some((x) => x == null)) return;
  const ev = (c, up) => `[W.K]::keybd_event(${c},0,${(EXT.has(c) ? 1 : 0) | (up ? 2 : 0)},[UIntPtr]::Zero)`;
  ps.stdin.write([...k.map((c) => ev(c)), ...[...k].reverse().map((c) => ev(c, 1))].join(';') + '\n');
};
exports.raw = (line) => { if (!ps) start(); if (ps) ps.stdin.write(line + '\n'); };
