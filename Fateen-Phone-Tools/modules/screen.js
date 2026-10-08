const { execFile } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
exports.name = 'screen';
exports.handle = (m, api, ws) => {
  if (m.a !== 'shot') return;
  const f = path.join(os.tmpdir(), 'pts-shot.jpg');
  const ps = `Add-Type -TypeDefinition 'using System.Runtime.InteropServices;public class D{[DllImport("user32.dll")]public static extern bool SetProcessDPIAware();}';[void][D]::SetProcessDPIAware();Add-Type -AssemblyName System.Windows.Forms,System.Drawing;$v=[Windows.Forms.SystemInformation]::VirtualScreen;$b=New-Object Drawing.Bitmap($v.Width,$v.Height);$g=[Drawing.Graphics]::FromImage($b);$g.CopyFromScreen($v.Location,[Drawing.Point]::Empty,$v.Size);$w=1400;$h=[int]($v.Height*$w/$v.Width);$s=New-Object Drawing.Bitmap($b,$w,$h);$s.Save('${f}',[Drawing.Imaging.ImageFormat]::Jpeg)`;
  execFile('powershell', ['-NoProfile', '-EncodedCommand', Buffer.from(ps, 'utf16le').toString('base64')], (err) => {
    if (!err && ws.readyState === 1) ws.send(JSON.stringify({ shot: 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64') }));
  });
};
