<div align="center">

<img src="docs/brand/wordmark-on-light.svg" alt="FATEEN" width="160">

# Phone Tools
**حوّل موبايلك لريموت كامل للكمبيوتر · Turn your phone into a full remote for your PC**

فطين. شغل بيكمّل.

![License](https://img.shields.io/badge/license-MIT-FF4F1F?style=flat-square)
![Node](https://img.shields.io/badge/node-%E2%89%A518-0E0E0E?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Windows-0E0E0E?style=flat-square)
![Network](https://img.shields.io/badge/network-local%20Wi--Fi%20only-FF4F1F?style=flat-square)

presenter · mouse & keyboard · gamepad · screen mirror · files · camera · Arabic typing

[fateen1.me](https://fateen1.me) · [WhatsApp 01273929303](https://wa.me/201273929303) · [Security](SECURITY.md)

</div>

---

**Jump to:** [🇪🇬 بالعربي](#-بالعربي) · [🇬🇧 English](#-english)

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

### المتطلبات

- Windows
- Node.js 18 أو أحدث
- الكمبيوتر والموبايل على نفس شبكة الواي فاي

### التشغيل (Windows)

1. نزّل Node.js 18 أو أحدث.
2. انسخ `config.example.json` إلى `config.json` (أو سيبه والسيرفر هيعمله لوحده) وغيّر الـ PIN.
3. دوس دبل كليك على `start.bat` (أول مرة بيثبت الحزم).
4. على الموبايل (نفس الواي فاي): امسح الـ QR أو افتح اللينك، اقبل تحذير الشهادة مرة واحدة، واكتب الـ PIN.

أو من التيرمنال: `npm install && npm start`

### الأمان

- كل شيء على الشبكة المحلية، بـ HTTPS وشهادة self-signed بتتولد أول تشغيل (مش جزء من الريبو).
- PIN مع قفل دقيقة بعد 5 محاولات غلط.
- الماكروز بتتعرّف في `config.json` بس، الموبايل مش بيقدر يبعت أوامر حرة.
- الملفات محصورة في الفولدرات الموجودة في `shares`.

> ⚠️ **ماتفتحش البورت على الإنترنت.** المشروع متصمم للشبكة المحلية بس. التفاصيل الكاملة وطريقة الإبلاغ عن ثغرة في [SECURITY.md](SECURITY.md).

### عن فطين

**فطين للحلول الرقمية** شركة في أسوان بتعمل أنظمة كاشير ومخازن بتشتغل بدون إنترنت، ومنيو رقمي، ومواقع للشركات في أسوان والصعيد. Phone Tools أداة مفتوحة المصدر من فطين، وتقدر تعرف أكتر على [fateen1.me](https://fateen1.me).

للتواصل: [واتساب 01273929303](https://wa.me/201273929303) (كل يوم من 10 ص إلى 6 م).

---

## 🇬🇧 English

One server on your PC, one link on your phone. No app, no account, everything stays on your local Wi-Fi.

### Features

- **Presenter remote:** next/previous, start show, timer.
- **Link Pad:** mouse, keyboard, gyro, joystick, and a virtual Xbox 360 gamepad for games.
- **Arabic typing** from the phone straight into the PC.
- **Screen screenshot / live mirror** of the PC on the phone.
- **File browser**, restricted to the folders you list in `shares`.
- **Phone camera and mic** to the PC (WebRTC + OBS).
- **Macros, reminders, quick notes,** and **PC-to-phone push** for text and links.

### Requirements

- Windows
- Node.js 18+
- PC and phone on the same Wi-Fi network

### Quick start (Windows)

1. Install Node.js 18+.
2. Copy `config.example.json` to `config.json` and change the PIN (or let the server create it).
3. Double-click `start.bat` (installs packages on first run).
4. On the phone (same Wi-Fi): scan the QR or open the link, accept the certificate warning once, enter the PIN.

Or from a terminal: `npm install && npm start`

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

### Configuration

`config.json` is created from `config.example.json` and is git-ignored.

| Key | What it does |
|---|---|
| PIN | Required on the phone before anything works. Change it from the default. |
| `shares` | The only folders the file browser can reach. |
| macros | Commands the phone can trigger. Defined here only, never sent from the phone. |
| port | Defaults to `47100`; if busy, the next free port is used and saved here. |

### Security

- Local network only, over HTTPS with a self-signed certificate generated on first run (not part of the repo).
- PIN with a one-minute lockout after 5 wrong attempts.
- Macros are defined in `config.json` only. The phone cannot send free-form commands.
- File access is limited to the folders listed in `shares`.

> ⚠️ **Do not expose the port to the internet** (no port forwarding, no public tunnels). Full details and how to report a vulnerability are in [SECURITY.md](SECURITY.md).

### Notes

- Received notes and files land in `inbox/`.
- `config.json` holds your PIN and macros and is git-ignored. Never commit it.
- Screen capture, mirroring and reminders use PowerShell, so they are Windows-only.

### Add a module

Create `modules/name.js` exporting `{ name, handle(msg, api, ws) }`, then add buttons in `public/index.html` with `data-m="name" data-a="action"`.

### About Fateen

**Fateen Digital Solutions** (فطين للحلول الرقمية) is based in Aswan, Egypt. We build offline-first POS and inventory systems, digital menus, and business websites for restaurants, cafés, and shops across Aswan and Upper Egypt. Phone Tools is an open-source utility from the team.

[fateen1.me](https://fateen1.me) · [WhatsApp 01273929303](https://wa.me/201273929303) (daily, 10 AM – 6 PM Cairo time)

---

## Brand

UI follows Fateen identity v1.4: ink `#0E0E0E`, cream `#F2EFE8`, signal orange `#FF4F1F`; IBM Plex Sans Arabic + IBM Plex Sans (loaded from Google Fonts). Logo files and tokens are in `docs/brand/`.

## Security policy

See [SECURITY.md](SECURITY.md) for supported versions and how to report a vulnerability privately.

## License

MIT © Fateen Digital Solutions
