// Live view of the PC screen: one PowerShell process captures JPEG frames while at least one phone is watching.
const { spawn } = require('child_process');
const SCRIPT = [
  `Add-Type -TypeDefinition 'using System.Runtime.InteropServices;public class D{[DllImport("user32.dll")]public static extern bool SetProcessDPIAware();}'`,
  '[void][D]::SetProcessDPIAware()',
  'Add-Type -AssemblyName System.Windows.Forms,System.Drawing',
  '$v=[Windows.Forms.SystemInformation]::VirtualScreen;$w=1100;$h=[int]($v.Height*$w/$v.Width)',
  '$b=New-Object Drawing.Bitmap($v.Width,$v.Height);$g=[Drawing.Graphics]::FromImage($b)',
  '$s=New-Object Drawing.Bitmap($w,$h);$t=[Drawing.Graphics]::FromImage($s)',
  "$c=[Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|?{$_.MimeType -eq 'image/jpeg'}",
  '$p=New-Object Drawing.Imaging.EncoderParameters(1);$p.Param[0]=New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality,[long]45)',
  '$m=New-Object IO.MemoryStream',
  'while($true){$g.CopyFromScreen($v.Location,[Drawing.Point]::Empty,$v.Size);$t.DrawImage($b,0,0,$w,$h);$m.SetLength(0);$s.Save($m,$c,$p);[Console]::Out.WriteLine([Convert]::ToBase64String($m.ToArray()));[Console]::Out.Flush();Start-Sleep -Milliseconds 80}',
].join('\n');

let ps = null, buf = '';
const subs = new Set();
function stop() { if (ps) { ps.kill(); ps = null; buf = ''; } }
function drop(ws) { subs.delete(ws); if (!subs.size) stop(); }
function begin() {
  const p = spawn('powershell', ['-NoProfile', '-EncodedCommand', Buffer.from(SCRIPT, 'utf16le').toString('base64')], { stdio: ['ignore', 'pipe', 'ignore'] });
  ps = p;
  p.on('error', () => { if (ps === p) ps = null; });
  p.on('exit', () => { if (ps === p) ps = null; });
  p.stdout.on('data', (d) => {
    buf += d; let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (line) for (const w of subs) if (w.readyState === 1 && w.bufferedAmount < 400000) w.send(JSON.stringify({ frame: line }));
    }
  });
}
exports.name = 'mirror';
exports.handle = (m, api, ws) => {
  if (m.a === 'start') { subs.add(ws); ws.once('close', () => drop(ws)); if (!ps) begin(); }
  if (m.a === 'stop') drop(ws);
};
