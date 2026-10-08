# 📱 مشروع أدوات الموبايل (على غرار Link Pad)

الفكرة: **الموبايل هو الجهاز الطرفي (peripheral) والكمبيوتر هو الأساس**، عن طريق المتصفح بس (من غير تطبيق) وعلى الشبكة المحلية. أداة واحدة مقسمة لموديولات، كل موديول له تاب.

---

## 1) الأدوات النهائية المختارة (11 أداة + Phone Control + Link Pad)

| # | الأداة | الوصف | اندمج فيها |
|---|---|---|---|
| 1 | **Presenter Remote** | قلب السلايدات، مؤقت، ملاحظات المتحدث، مؤشر ليزر بالجيروسكوب، Blackout، القفز لسلايد برقمه | – |
| 2 | **Macro Pad** | أزرار مخصصة (زي Stream Deck) لتشغيل برامج واختصارات ومواقع | Workflow Scenes (زرار يشغّل خطوات متتالية)، Script Runner (سكريبتات بتأكيد قبل التنفيذ) |
| 3 | **Media & Meeting Remote** | تحكم في الصوت والفيديو، كتم المايك، إيقاف الكاميرا، مغادرة الاجتماع (Zoom / Meet / Teams) | Media Remote، Meeting Remote |
| 4 | **Voice** | كتابة صوتية بالعربي + أوامر صوتية (مثل "افتح كروم") | Voice Typing، Voice Commands |
| 5 | **Files** | إرسال واستقبال ملفات وصور (زي AirDrop)، تصفح ملفات الكمبيوتر، بحث سريع عن أي ملف | Drop، File Browser، Universal Search |
| 6 | **Camera Scanner** | وضع باركود (يتكتب في الكمبيوتر كأنه كيبورد) + وضع مستندات (تصوير، قص، تحويل PDF) | Phone Scanner، Doc Scanner |
| 7 | **Webcam & Mic** | الموبايل يشتغل كاميرا وميكروفون للكمبيوتر | Phone as Webcam، PC Mic |
| 8 | **Screen** | لقطة شاشة، تسجيل شاشة (Start/Stop)، عرض شاشة الكمبيوتر على الموبايل | Screenshot Sender، Screen Recorder Remote، Screen Mirror |
| 9 | **PC Control** | Task Manager عن بعد + تشغيل الكمبيوتر بـ Wake-on-LAN | Task Manager Remote، Wake-on-LAN |
| 10 | **Notifications & Reminders** | إشعارات الكمبيوتر على الموبايل + تذكيرات من الموبايل تظهر على شاشة الكمبيوتر | Notification Mirror، PC Reminders |
| 11 | **Quick Capture** | تسجيل فكرة أو مهمة بالكتابة أو الصوت، تنزل في قائمة أو ملف Markdown على الكمبيوتر | – |
| 12 | **Phone Control** | تحكم وإرسال من الكمبيوتر للموبايل: نصوص ولينكات وملفات، Find My Phone، رسائل على شاشة الموبايل، قراءة نص بصوت (TTS)، تصوير بكاميرا الموبايل. على أندرويد ممكن إضافة ADB / scrcpy. على الآيفون محدود بالمتصفح | – |
| 13 | **Link Pad** (3 موديولات) | remote (تاتش باد / جيروسكوب / كيبورد)، gamepad (ViGEm)، games (Run & Jump / Ball Maze) | مشروع Link Pad الحالي |

---

## 2) هل نعملهم أداة واحدة؟ (القرار المقترح: أيوه، بموديولات)

**المميزات:**
- سيرفر واحد وشهادة HTTPS واحدة ولينك/QR واحد.
- PIN واحد يحمي كل حاجة.
- اتصال WebSocket واحد يخدم كل الأدوات.
- تتثبت على الموبايل كـ PWA بأيقونة واحدة.
- تعديل واحد يظهر في كل الأدوات.

**الهيكل المقترح:**

```
server/
  core/          (سيرفر، PIN، WebSocket، تحميل الموديولات)
  modules/
    presenter/   (server.js + ui.html)
    macros/
    files/
    ...
```

- لو موديول وقع أو مكتبته فشلت في التثبيت (زي vigemclient في Link Pad)، الباقي يكمل شغال.
- الموديولات التقيلة (Webcam / Screen Mirror) تشتغل بس لما تفتح التاب.
- أي موديول يتقفل من الإعدادات.
- لو عايز تبيع جزء للعملاء (مثلًا Camera Scanner لـ Fateen POS)، الموديول مستقل وينفصل بعدين.

---

## 3) الأمان (أول حاجة تتعمل قبل أي أداة)

بعض الأدوات بتتحكم في الجهاز فعليًا (Macro Pad، PC Control، Voice Commands، Script Runner)، وأي حد على نفس الشبكة يفتح اللينك يقدر يتحكم لو مفيش حماية:

- **PIN** أو توكن للدخول.
- **صلاحيات لكل موبايل / موديول** (مثلًا موبايل يستخدم Presenter بس).
- **قائمة أوامر مسموحة (whitelist)** بدل تشغيل أي أمر.
- **تأكيد قبل الأوامر الخطرة** (قفل برنامج، إيقاف تشغيل، سكريبت).
- PIN أو تأكيد إضافي للموديولات الخطيرة.

---

## 4) ترتيب البناء المقترح

| المرحلة | المحتوى | ليه |
|---|---|---|
| **0** | core + PIN + WebSocket + نظام الموديولات | الأساس والأمان |
| **1** | Presenter، Macro Pad، Media & Meeting | كلهم بيبعتوا مفاتيح كيبورد، الأسهل والأسرع |
| **2** | Files، Camera Scanner، Quick Capture، Notifications & Reminders | نقل بيانات |
| **3** | Voice، PC Control، Screen (لقطة وتسجيل) | نظام وصوت |
| **4** | Webcam & Mic، Screen Mirror الحي | الأصعب: streaming وdrivers |

---

## 5) كل الأفكار اللي اتقالت (بما فيها اللي لسه ماختارتهاش)

### القايمة الأولى
1. Phone Scanner ✅ (اتدمج في Camera Scanner)
2. Macro Pad ✅
3. Voice Typing عربي ✅ (اتدمج في Voice)
4. Drop (زي AirDrop) ✅ (اتدمج في Files)
5. Phone as Webcam ✅ (اتدمج في Webcam & Mic)
6. PC Monitor & Power (CPU / RAM / الحرارة + Sleep / Shutdown / Lock)
7. Doc Scanner ✅ (اتدمج في Camera Scanner)
8. Second Screen (الموبايل شاشة إضافية)
9. Presenter Remote ✅

### القايمة التانية
1. Clipboard Sync
2. Phone Scanner (باركود) ✅
3. PC Mic ✅ (اتدمج في Webcam & Mic)
4. Notification Mirror ✅ (اتدمج في Notifications & Reminders)
5. OCR عربي
6. Media Remote ✅ (اتدمج في Media & Meeting)
7. File Browser ✅ (اتدمج في Files)
8. Screen Mirror ✅ (اتدمج في Screen)
9. Quick Sign (توقيع على PDF)
10. POS Remote / Customer Display
11. Smart Timer / Pomodoro
12. Wake-on-LAN ✅ (اتدمج في PC Control)

### القايمة التالتة
1. Snippets (نصوص جاهزة)
2. Password Fill
3. Meeting Remote ✅ (اتدمج في Media & Meeting)
4. Whiteboard
5. Live Captions
6. QR Sender
7. Customer Display للـ POS
8. Kitchen Display
9. Inventory Scanner
10. Sales Rep Check-in (زيارة + GPS + صورة في فطين CRM)
11. Smart Home Panel
12. Presentation Clicker بالبلوتوث (HID)
13. Find My PC
14. Auto-Lock بالقرب

### القايمة الرابعة
1. Numpad
2. Photo Import
3. Screenshot Sender ✅ (اتدمج في Screen)
4. Voice Commands ✅ (اتدمج في Voice)
5. Document Camera
6. Print from Phone
7. Task Manager Remote ✅ (اتدمج في PC Control)
8. Keep-Awake
9. Audience Q&A / Poll
10. Signature Pad
11. InstaPay QR (شاشة العميل)
12. Attendance QR (حضور الموظفين بـ QR + GPS)

### القايمة الخامسة (إنتاجية)
1. Workflow Scenes ✅ (اتدمج في Macro Pad)
2. Window Switcher
3. Universal Search ✅ (اتدمج في Files)
4. Script Runner ✅ (اتدمج في Macro Pad)
5. Screen Recorder Remote ✅ (اتدمج في Screen)
6. Quick Capture ✅
7. Voice Memo إلى نص
8. Link Sender
9. Clipboard History
10. PC Reminders ✅ (اتدمج في Notifications & Reminders)
11. Time Tracker
12. Daily KPI Panel (مبيعات اليوم من فطين POS / CRM)

---

## 6) أفكار مرتبطة بشغل Fateen (ممكن تتحول لمزايا تتباع)

- Customer Display + InstaPay QR للـ POS
- Kitchen Display للمطاعم والكافيهات
- Inventory Scanner لجرد المخزن
- Sales Rep Check-in داخل فطين CRM
- Attendance QR
- Signature Pad للتسليم والعقود
- Daily KPI Panel

---

## 7) دمج مشروع Link Pad

| موديول | المحتوى |
|---|---|
| `remote` | التاتش باد، الجيروسكوب كماوس، الكيبورد |
| `gamepad` | Xbox 360 Virtual Controller عن طريق vigemclient (اختياري أصلًا) |
| `games` | Run & Jump وBall Maze وصفحة `/play` (تتنقل لمسار تابع للموديول) |

- الشهادة والـ PIN وإعدادات الحساسية تنتقل للـ core وتخدم كل الموديولات.
- التاتش باد والكيبورد فيهم تداخل مع Presenter Remote، فنشارك كود إرسال المفاتيح.
- نسخة Link Pad الأصلية تفضل زي ما هي لحد ما الدمج يخلص.
- المطلوب للدمج: `server.js` و`package.json` ومجلد `public/`.

---

## 8) عدم التعارض مع السيرفرات المحلية

- **بورت افتراضي غير شائع** في نطاق `47100–47199`. الأفضل الابتعاد عن 3000 و3001 و4200 و5000 و5173 و8000 و8080 و8888، وعن 49152 وما فوق (ويندوز بيستخدمه للاتصالات الصادرة).
- **Fallback تلقائي:** لو البورت مشغول يجرب اللي بعده ويعرض الرابط والـ QR الفعلي.
- **يفتكر آخر بورت اشتغل** عشان لينك الموبايل والـ PWA ما يتكسروش، والبورت يتغير من `config.json`.
- **الكوكيز مش معزولة بالبورت:** استخدم prefix مميز (`pts_session`) أو توكن في localStorage (معزول لكل بورت).
- **بورت واحد لكل الموديولات:** أي قناة جديدة (Webcam، Screen) تعدي على نفس السيرفر بمسارات مختلفة.
- **ADB (أندرويد):** بورت 5037، لو فيه adb شغال من Android Studio أو غيره نتصل بيه بدل ما نشغل واحد جديد.
- **Firewall:** بورت ثابت معناه رسالة ويندوز مرة واحدة أو قاعدة `netsh` في سكريبت التشغيل.
- **Single-instance:** لو الأداة اتفتحت مرتين، النسخة التانية تكتشف الأولى وتفتح لينكها.

```js
import net from 'node:net';

function isFree(port) {
  return new Promise(res => {
    const s = net.createServer()
      .once('error', () => res(false))
      .once('listening', () => s.close(() => res(true)))
      .listen(port, '0.0.0.0');
  });
}

async function pickPort(preferred, tries = 20) {
  for (let p = preferred; p < preferred + tries; p++) {
    if (await isFree(p)) return p;
  }
  throw new Error('No free port in range');
}
```

---

## 9) الآيفون: اللي ينفع واللي ما ينفعش

| الميزة | الوضع على iPhone |
|---|---|
| ADB / scrcpy (تحكم كامل من الكمبيوتر) | ❌ أندرويد بس |
| إرسال نص / لينك / ملف من الكمبيوتر للموبايل | ✅ والصفحة مفتوحة |
| رسالة أو صوت (TTS) على الموبايل | ✅ بعد أول لمسة من المستخدم |
| تصوير بكاميرا الموبايل من الكمبيوتر | ✅ والصفحة مفتوحة |
| Webcam & Mic (getUserMedia + WebRTC) | ✅ |
| إبقاء الشاشة شغالة (Wake Lock) | ✅ من iOS 16.4 |
| الجيروسكوب | ✅ بعد إذن الحساسات |
| اهتزاز الموبايل (Vibration API) | ❌ غير مدعوم، فـ Rumble feedback مش ممكن |
| التقاط أزرار الصوت (Presenter) | ❌ غير متاح للصفحات |
| قراءة الباركود بـ BarcodeDetector | ❌ نستخدم مكتبة JS زي ZXing |
| Battery API | ❌ غير مدعوم |
| Web Speech API بالعربي | ⚠️ غير ثابت، البدائل: إملاء الكيبورد أو Whisper على الكمبيوتر |
| إشعارات والصفحة مقفولة | ⚠️ Web Push بس لو الأداة متثبتة PWA وبإنترنت |
| PWA و Service Worker | ⚠️ محتاج شهادة موثوقة على الآيفون |
| Find My Phone والصفحة مقفولة | ❌ استخدم Find My بتاعة آبل |

**بدائل للتحكم الحقيقي في الآيفون (خارج الأداة):**
- Phone Link من مايكروسوفت: مكالمات ورسائل وإشعارات عبر البلوتوث.
- Pushcut: تطبيق مدفوع بيشغّل Shortcuts على الآيفون من API.
- AirPlay receiver على ويندوز (UxPlay أو AirServer): عرض شاشة الآيفون على الكمبيوتر، مشاهدة بس من غير تحكم.

**شهادة موثوقة:** الأفضل ننشئ CA محلية (زي mkcert) ونثبت ملفها على الآيفون ونفعّل الثقة فيه، عشان الـ PWA والـ Service Worker والإشعارات تشتغل من غير تحذير.

---

## 10) نقاط مفتوحة للنقاش لاحقًا

- [ ] اسم المشروع
- [ ] التقنية: Node.js + WebSocket (زي Link Pad) ولا حاجة تانية؟
- [ ] هل يشتغل على ويندوز بس ولا ماك ولينكس كمان؟
- [ ] شهادة موثوقة للآيفون (mkcert) ولا نكمل بـ self-signed؟
- [ ] Whisper على الكمبيوتر للعربي ولا إملاء الآيفون؟
- [ ] إضافات جديدة هنضيفها لاحقًا
