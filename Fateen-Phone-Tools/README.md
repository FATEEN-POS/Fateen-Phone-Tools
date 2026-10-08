<div align="center">

<img src="docs/brand/wordmark-on-light.svg" alt="FATEEN" width="160">

# Phone Tools
**حوّل موبايلك لريموت كامل للكمبيوتر · Turn your phone into a full remote for your PC**

فطين. شغل بيكمّل.

presenter · mouse & keyboard · gamepad · screen mirror · files · camera · Arabic typing

[fateen1.me](https://fateen1.me) · WhatsApp 01273929303

</div>

---

## 🇪🇬 بالعربي

سيرفر واحد على الكمبيوتر + لينك واحد على الموبايل. من غير تطبيقات ومن غير حساب، كله على شبكة الواي فاي بتاعتك.

### المميزات
- **Presenter:** التالي/السابق/ابدأ العرض/مؤقت.
- **Link Pad:** ماوس وكيبورد وجيروسكوب وجويستيك، وجيمباد Xbox 360 وهمي للألعاب.
- **كتابة عربي** من الموبايل مباشرة على الكمبيوتر.
- **شاشة الكمبيوتر على الموبايل** (لقطة أو بث مباشر).
- **ملفات:** تصفح وتنزيل من فولدرات انت محددها بس.
- **كاميرا/مايك الموبايل** للكمبيوتر (WebRTC + OBS).
- **ماكروز** و**تذكيرات** و**ملاحظات سريعة** و**إرسال نص/لينك من الكمبيوتر للموبايل**.

### التشغيل (Windows)
1. نزّل Node.js 18 أو أحدث.
2. انسخ `config.example.json` إلى `config.json` (أو سيبه والسيرفر هيعمله لوحده) وغيّر الـ PIN.
3. دوس دبل كليك على `start.bat` (أول مرة بيثبت الحزم).
4. على الموبايل (نفس الواي فاي): امسح الـ QR أو افتح اللينك، اقبل تحذير الشهادة مرة واحدة، واكتب الـ PIN.

### الأمان
- كل شيء على الشبكة المحلية، بـ HTTPS وشهادة self-signed بتتولد أول تشغيل (مش جزء من الريبو).
- PIN مع قفل دقيقة بعد 5 محاولات غلط.
- الماكروز بتتعرّف في `config.json` بس، الموبايل مش بيقدر يبعت أوامر حرة.
- الملفات محصورة في الفولدرات الموجودة في `shares`.

---

## 🇬🇧 English

One server on your PC, one link on your phone. No app, no account, everything stays on your local Wi-Fi.

### Features
Presenter remote, Link Pad (mouse, keyboard, gyro, virtual Xbox 360 gamepad), Arabic typing into the PC, screen screenshot/mirror, file browser (restricted to `shares`), phone camera/mic to the PC, macros, reminders, quick notes, and PC-to-phone push.

### Quick start (Windows)
1. Install Node.js 18+.
2. Copy `config.example.json` to `config.json` and change the PIN (or let the server create it).
3. Double-click `start.bat` (installs packages on first run).
4. On the phone (same Wi-Fi): scan the QR or open the link, accept the certificate warning once, enter the PIN.

Or from a terminal: `npm install && npm start`.

### Pages
| URL | Where | Purpose |
|---|---|---|
| `https://<pc-ip>:47100/` | phone | Main suite |
| `/linkpad/` | phone | Link Pad (mouse/keyboard/gamepad) |
| `/pc` | the PC itself | Send text/links to the phone |
| `/cam` | the PC itself | View the phone camera |
| `/play` | the PC itself | Link Pad games screen |

### Enabling the real gamepad
The virtual Xbox 360 pad needs two optional pieces (Windows only):
1. Install the **ViGEmBus** driver: <https://github.com/nefarius/ViGEmBus/releases>
2. Install `vigemclient` (needs Visual Studio C++ build tools to compile): `npm install vigemclient`

Without them everything else still works. Mouse and keyboard need `@nut-tree-fork/nut-js` (`npm install @nut-tree-fork/nut-js`).

### Notes
- Default port is 47100; if busy, the next free one is used and saved to `config.json`.
- `config.json` holds your PIN and macros and is git-ignored. Never commit it.
- Received notes and files land in `inbox/`.
- Screen capture, mirroring and reminders use PowerShell, so they are Windows-only.

### Add a module
Create `modules/name.js` exporting `{ name, handle(msg, api, ws) }`, then add buttons in `public/index.html` with `data-m="name" data-a="action"`.

## License
MIT © Fateen Digital Solutions

## Brand
UI follows Fateen identity v1.4: ink `#0E0E0E`, cream `#F2EFE8`, signal orange `#FF4F1F`; IBM Plex Sans Arabic + IBM Plex Sans (loaded from Google Fonts). Logo files and tokens are in `docs/brand/`.
