# Security Policy · سياسة الأمان

**Jump to:** [🇪🇬 بالعربي](#-بالعربي) · [🇬🇧 English](#-english)

---

## 🇪🇬 بالعربي

### الإصدارات المدعومة

بنصلّح الثغرات في آخر نسخة على فرع `main` بس. لو بتستخدم نسخة قديمة، حدّث الأول وبعدين أبلغ لو المشكلة لسه موجودة.

### إزاي تبلّغ عن ثغرة

**ماتفتحش Issue عام للثغرات الأمنية.**

1. **الطريقة المفضلة:** من تاب **Security** في الريبو دوس على **Report a vulnerability** (Private vulnerability reporting على GitHub).
2. **بديل:** كلمنا على واتساب [01273929303](https://wa.me/201273929303) وقول إن عندك بلاغ أمني، **من غير ما تكتب التفاصيل التقنية في الرسالة الأولى**، وهنوصلك بقناة خاصة. بنرد كل يوم من 10 ص إلى 6 م بتوقيت القاهرة.

ياريت البلاغ يحتوي على:

- وصف الثغرة وتأثيرها.
- خطوات إعادة الإنتاج (أو إثبات المفهوم).
- النسخة أو الـ commit، ونسخة Windows وNode.js.
- أي اقتراح للإصلاح لو عندك.

### بنعمل إيه بعد البلاغ

- هنأكد استلام البلاغ ونفحصه.
- هنبلغك بحالة الإصلاح ونطلب منك التحقق منه لو محتاجين.
- بنفضّل نتفق معاك على موعد النشر العلني بعد ما الإصلاح يتنزل، وبنذكرك في الشكر لو حبيت.

### نموذج الأمان (إيه المفروض يحصل)

Phone Tools بيدي الموبايل تحكم في الكمبيوتر، فمهم نفهم الحدود:

- **شبكة محلية بس:** السيرفر متصمم للواي فاي بتاعك، مش للإنترنت.
- **HTTPS:** بشهادة self-signed بتتولد أول تشغيل ومش جزء من الريبو.
- **PIN:** مطلوب قبل أي حاجة، مع قفل دقيقة بعد 5 محاولات غلط.
- **الماكروز:** بتتعرّف في `config.json` بس، والموبايل مش بيقدر يبعت أوامر حرة.
- **الملفات:** محصورة في الفولدرات الموجودة في `shares`.

### داخل النطاق

- تخطي الـ PIN أو الالتفاف على القفل بعد المحاولات الغلط.
- الخروج برا الفولدرات الموجودة في `shares` (path traversal وما شابه).
- تنفيذ أوامر على الكمبيوتر من غير ماكرو معرّف في `config.json`.
- تسريب أو تعديل `config.json` أو الشهادة أو بيانات الـ PIN من خلال السيرفر.
- أي وصول لكاميرا/مايك/شاشة الموبايل أو الكمبيوتر من غير مصادقة.

### خارج النطاق

- أي هجوم محتاج وصول فعلي للكمبيوتر أو للموبايل وهو مفتوح.
- شخص على نفس الشبكة بيعرف الـ PIN الصح (ده هو المفروض يدخل).
- تحذير الشهادة الـ self-signed (ده سلوك متوقع).
- تعريض البورت للإنترنت (port forwarding أو tunnel عام)، ده استخدام غير مدعوم.
- ثغرات في الحزم الخارجية (`vigemclient`، `@nut-tree-fork/nut-js`، ViGEmBus). أبلغ المشروع الأصلي، ولو في طريقة نستخدمها بشكل غير آمن قولنا.
- هجمات DoS أو brute force على الشبكة المحلية خارج حماية الـ PIN المذكورة.

### نصايح للمستخدم

- **غيّر الـ PIN** من القيمة الافتراضية واستخدم رقم صعب التخمين.
- **ماتعملش port forwarding** ولا تستخدم tunnel عام للسيرفر.
- **استخدم شبكة تثق فيها.** مش على واي فاي عام أو مشترك مع ناس مش تعرفهم.
- **حدد `shares` بدقة** وماتحطش فولدر المستخدم كله أو الدرايف كله.
- **راجع الماكروز** في `config.json`، لأن كل ماكرو هو أمر هيتنفذ على جهازك.
- **ماترفعش `config.json`** على GitHub أبدًا (هو في `.gitignore`).
- **قفل السيرفر** لما مش بتستخدمه.
- شغّله بحساب Windows عادي مش Administrator لو ممكن.
- حدّث Node.js والحزم (`npm audit`) بشكل دوري.

---

## 🇬🇧 English

### Supported versions

Security fixes are applied to the latest version on the `main` branch only. If you are on an older version, please update first and report if the issue still reproduces.

### Reporting a vulnerability

**Please do not open a public issue for security problems.**

1. **Preferred:** go to the **Security** tab of this repository and click **Report a vulnerability** (GitHub private vulnerability reporting).
2. **Alternative:** message us on WhatsApp at [01273929303](https://wa.me/201273929303) saying you have a security report, **without putting technical details in the first message**, and we will move to a private channel. We reply daily, 10 AM to 6 PM Cairo time.

Please include:

- A description of the issue and its impact.
- Steps to reproduce (or a proof of concept).
- The version or commit, plus your Windows and Node.js versions.
- A suggested fix, if you have one.

### What happens next

- We will acknowledge and investigate your report.
- We will keep you updated on the fix and may ask you to verify it.
- We prefer to agree on a public disclosure date with you once a fix is released, and we are happy to credit you if you want.

### Security model (what is meant to happen)

Phone Tools lets a phone control a PC, so the boundaries matter:

- **Local network only:** the server is designed for your own Wi-Fi, not the internet.
- **HTTPS:** with a self-signed certificate generated on first run and kept out of the repository.
- **PIN:** required before anything works, with a one-minute lockout after 5 wrong attempts.
- **Macros:** defined in `config.json` only; the phone cannot send free-form commands.
- **Files:** restricted to the folders listed in `shares`.

### In scope

- Bypassing the PIN or the lockout after failed attempts.
- Reaching files outside the folders in `shares` (path traversal and similar).
- Running commands on the PC without a macro defined in `config.json`.
- Leaking or modifying `config.json`, the certificate, or PIN data through the server.
- Any unauthenticated access to the phone or PC camera, mic, or screen features.

### Out of scope

- Attacks that require physical access to an unlocked PC or phone.
- A person on the same network who knows the correct PIN (that is the intended way in).
- The self-signed certificate warning (expected behavior).
- Exposing the port to the internet (port forwarding or a public tunnel); this is unsupported usage.
- Vulnerabilities in third-party packages (`vigemclient`, `@nut-tree-fork/nut-js`, ViGEmBus). Report those upstream; if we are using one unsafely, tell us.
- Denial-of-service or brute-force attacks on the local network beyond the PIN protections described above.

### Hardening tips for users

- **Change the PIN** from the default and pick something hard to guess.
- **Never port-forward** or put the server behind a public tunnel.
- **Use a network you trust,** not public or shared Wi-Fi.
- **Keep `shares` narrow.** Do not share your whole user folder or a whole drive.
- **Review your macros** in `config.json`; each one is a command that runs on your machine.
- **Never commit `config.json`** (it is git-ignored).
- **Stop the server** when you are not using it.
- Run it under a normal Windows account rather than Administrator where possible.
- Keep Node.js and dependencies up to date (`npm audit`).

---

© Fateen Digital Solutions · [fateen1.me](https://fateen1.me)
