const statusEl = document.getElementById('status');
let ws;
let reconnectTimer;

// أي جزء تاني في الكود يقدر يضيف نفسه هنا عشان يستقبل رسائل جايه من السيرفر
const messageHandlers = [];
function onServerMessage(handler) {
  messageHandlers.push(handler);
}

function connect() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${protocol}://${location.host}/ws?pin=${encodeURIComponent(localStorage.getItem('pts_pin') || '')}`);

  ws.onopen = () => {
    statusEl.textContent = '✅ متصل بالكمبيوتر';
    statusEl.className = 'status connected';
    clearTimeout(reconnectTimer);
  };

  ws.onclose = (e) => {
    if (e.code === 4001) { location.href = '/'; return; } // no/wrong PIN: go back to the suite to log in
    statusEl.textContent = '❌ الاتصال انقطع... جاري إعادة المحاولة';
    statusEl.className = 'status disconnected';
    reconnectTimer = setTimeout(connect, 1500);
  };

  ws.onerror = () => ws.close();

  ws.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      return;
    }
    messageHandlers.forEach((h) => h(data));
  };
}
connect();

function send(obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

// ==================================================
// الإعدادات (Settings) — بتتحفظ في المتصفح نفسه
// ==================================================
const SETTINGS_KEY = 'link-pad-settings';
const DEFAULT_SETTINGS = {
  gyroMouseSensitivity: 0.6, // حساسية جيروسكوب الماوس
  gyroTiltAngle: 35,         // أقصى زاوية ميل = أقصى انحراف للعصا (كل ما قلت، زادت الحساسية)
  touchpadHeightVh: 55,      // نسبة ارتفاع التاتش باد من الشاشة
  touchpadSensitivity: 1.0,  // حساسية التاتش باد نفسه (حركة اللمس -> حركة الماوس)
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

const settings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // لو الحفظ فشل (مثلاً وضع تصفح خاص)، نكمل عادي من غير حفظ
  }
}

function applySettings() {
  document.documentElement.style.setProperty('--touchpad-height', `${settings.touchpadHeightVh}vh`);
}
applySettings();

// ---------- ربط لوحة الإعدادات بالواجهة ----------
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsCloseBtn = document.getElementById('settings-close-btn');

const sliderGyroMouse = document.getElementById('slider-gyro-mouse');
const sliderGyroTilt = document.getElementById('slider-gyro-tilt');
const sliderTouchpadSize = document.getElementById('slider-touchpad-size');
const sliderTouchSensitivity = document.getElementById('slider-touch-sensitivity');
const valGyroMouse = document.getElementById('val-gyro-mouse');
const valGyroTilt = document.getElementById('val-gyro-tilt');
const valTouchpadSize = document.getElementById('val-touchpad-size');
const valTouchSensitivity = document.getElementById('val-touch-sensitivity');

function refreshSettingsUI() {
  sliderGyroMouse.value = settings.gyroMouseSensitivity;
  valGyroMouse.textContent = settings.gyroMouseSensitivity;
  sliderGyroTilt.value = settings.gyroTiltAngle;
  valGyroTilt.textContent = `${settings.gyroTiltAngle}°`;
  sliderTouchpadSize.value = settings.touchpadHeightVh;
  valTouchpadSize.textContent = `${settings.touchpadHeightVh}%`;
  sliderTouchSensitivity.value = settings.touchpadSensitivity;
  valTouchSensitivity.textContent = settings.touchpadSensitivity.toFixed(1);
}
refreshSettingsUI();

settingsBtn.addEventListener('click', () => {
  refreshSettingsUI();
  settingsOverlay.classList.add('open');
});
settingsCloseBtn.addEventListener('click', () => {
  settingsOverlay.classList.remove('open');
});
settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) settingsOverlay.classList.remove('open');
});

sliderGyroMouse.addEventListener('input', () => {
  settings.gyroMouseSensitivity = parseFloat(sliderGyroMouse.value);
  valGyroMouse.textContent = settings.gyroMouseSensitivity;
  saveSettings();
});
sliderGyroTilt.addEventListener('input', () => {
  settings.gyroTiltAngle = parseInt(sliderGyroTilt.value, 10);
  valGyroTilt.textContent = `${settings.gyroTiltAngle}°`;
  saveSettings();
});
sliderTouchpadSize.addEventListener('input', () => {
  settings.touchpadHeightVh = parseInt(sliderTouchpadSize.value, 10);
  valTouchpadSize.textContent = `${settings.touchpadHeightVh}%`;
  applySettings();
  saveSettings();
});
sliderTouchSensitivity.addEventListener('input', () => {
  settings.touchpadSensitivity = parseFloat(sliderTouchSensitivity.value);
  valTouchSensitivity.textContent = settings.touchpadSensitivity.toFixed(1);
  saveSettings();
});

// ---------- التبويبات ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ---------- التاتش باد (الماوس) ----------
const touchpad = document.getElementById('touchpad-area');
let lastTouch = null;
let touchStartTime = 0;
let moved = false;

touchpad.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchStartTime = Date.now();
    moved = false;
  }
}, { passive: true });

touchpad.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (e.touches.length === 2) {
    // Scroll بإصبعين
    const y = e.touches[0].clientY;
    if (lastTouch && lastTouch.scrollY !== undefined) {
      const dy = y - lastTouch.scrollY;
      send({ type: 'scroll', dy: dy * 0.3 });
    }
    lastTouch = { scrollY: y };
    return;
  }

  if (lastTouch && e.touches.length === 1) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const dx = x - lastTouch.x;
    const dy = y - lastTouch.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) moved = true;
    send({
      type: 'mouse-move',
      dx: dx * settings.touchpadSensitivity,
      dy: dy * settings.touchpadSensitivity,
    });
    lastTouch = { x, y };
  }
}, { passive: false });

touchpad.addEventListener('touchend', () => {
  const duration = Date.now() - touchStartTime;
  // تاب سريع من غير حركة = كليك شمال
  if (!moved && duration < 250) {
    send({ type: 'mouse-click', button: 'left' });
  }
  lastTouch = null;
}, { passive: true });

// ---------- أزرار الماوس ----------
document.getElementById('btn-left-click').addEventListener('click', () => {
  send({ type: 'mouse-click', button: 'left' });
});
document.getElementById('btn-right-click').addEventListener('click', () => {
  send({ type: 'mouse-click', button: 'right' });
});

// ---------- أزرار الكيبورد / WASD ----------
document.querySelectorAll('.key-btn').forEach((btn) => {
  const key = btn.dataset.key;

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    send({ type: 'key-down', key });
  }, { passive: false });

  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    send({ type: 'key-up', key });
  }, { passive: false });

  // دعم الفأرة (للتجربة من متصفح كمبيوتر عادي)
  btn.addEventListener('mousedown', () => send({ type: 'key-down', key }));
  btn.addEventListener('mouseup', () => send({ type: 'key-up', key }));
});

// ---------- الجويستيك الحقيقي (ViGEm) ----------
const gamepadStatusBar = document.getElementById('gamepad-status-bar');
const gamepadStatusText = document.getElementById('gamepad-status-text');
const gamepadConnectBtn = document.getElementById('gamepad-connect-btn');
let gamepadConnected = false;

// نسمع لأي رسالة راجعة من السيرفر (حالة الجويستيك)
onServerMessage((data) => {
  if (data.type === 'gamepad-status') {
    gamepadConnected = data.connected;
    if (gamepadConnected) {
      gamepadStatusBar.className = 'gamepad-status-bar connected';
      gamepadStatusText.textContent = '🎮 الجويستيك متوصل وشغال';
      gamepadConnectBtn.textContent = 'فصل الجويستيك';
    } else {
      gamepadStatusBar.className = 'gamepad-status-bar disconnected';
      gamepadStatusText.textContent = data.error
        ? `❌ خطأ: ${data.error}`
        : 'الجويستيك مش متوصل';
      gamepadConnectBtn.textContent = 'وصّل الجويستيك 🎮';
    }
  }
});

gamepadConnectBtn.addEventListener('click', () => {
  if (gamepadConnected) {
    send({ type: 'gamepad-disconnect' });
  } else {
    send({ type: 'gamepad-connect' });
  }
});

// ---------- العصايتين التناظريتين (Analog Sticks) ----------
function setupJoystick(baseId, handleId, axisX, axisY) {
  const base = document.getElementById(baseId);
  const handle = document.getElementById(handleId);
  const radius = 32; // أقصى مسافة يتحرك بيها الهاندل من المنتصف (بالبكسل)
  let touchId = null;

  function reset() {
    handle.style.top = '32px';
    handle.style.left = '32px';
    send({ type: 'gamepad-axis', axis: axisX, value: 0 });
    send({ type: 'gamepad-axis', axis: axisY, value: 0 });
  }

  function handleMove(clientX, clientY) {
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }
    handle.style.left = `${32 + dx}px`;
    handle.style.top = `${32 + dy}px`;

    // تطبيع القيمة لمدى -1 إلى 1، مع عكس المحور Y (لأن الشاشة لأسفل = موجب)
    const normX = dx / radius;
    const normY = -dy / radius;
    send({ type: 'gamepad-axis', axis: axisX, value: normX });
    send({ type: 'gamepad-axis', axis: axisY, value: normY });
  }

  base.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchId = e.changedTouches[0].identifier;
    handleMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }, { passive: false });

  base.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === touchId) {
        handleMove(t.clientX, t.clientY);
      }
    }
  }, { passive: false });

  base.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchId = null;
    reset();
  }, { passive: false });
}

setupJoystick('stick-left', 'stick-left-handle', 'left-x', 'left-y');
setupJoystick('stick-right', 'stick-right-handle', 'right-x', 'right-y');

// ---------- أزرار ABXY + Shoulders + Start/Back ----------
document.querySelectorAll('[data-btn]').forEach((btn) => {
  const name = btn.dataset.btn;
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    send({ type: 'gamepad-button', button: name, pressed: true });
  }, { passive: false });
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    send({ type: 'gamepad-button', button: name, pressed: false });
  }, { passive: false });
});

// ---------- التريجرز (LT / RT) ----------
document.querySelectorAll('[data-axis]').forEach((btn) => {
  const axis = btn.dataset.axis;
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    send({ type: 'gamepad-axis', axis, value: 1 });
  }, { passive: false });
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    send({ type: 'gamepad-axis', axis, value: 0 });
  }, { passive: false });
});

// ---------- D-Pad ----------
let dpadX = 0, dpadY = 0;
function sendDpad() {
  send({ type: 'gamepad-axis', axis: 'dpad-x', value: dpadX });
  send({ type: 'gamepad-axis', axis: 'dpad-y', value: dpadY });
}
document.querySelectorAll('[data-dpad]').forEach((btn) => {
  const dir = btn.dataset.dpad;
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (dir === 'left') dpadX = -1;
    if (dir === 'right') dpadX = 1;
    if (dir === 'up') dpadY = 1;
    if (dir === 'down') dpadY = -1;
    sendDpad();
  }, { passive: false });
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (dir === 'left' || dir === 'right') dpadX = 0;
    if (dir === 'up' || dir === 'down') dpadY = 0;
    sendDpad();
  }, { passive: false });
});

// ---------- إرسال نص ----------
document.getElementById('send-text-btn').addEventListener('click', () => {
  const input = document.getElementById('text-input');
  if (input.value) {
    send({ type: 'type-text', text: input.value });
    input.value = '';
  }
});

// ==================================================
// الجيروسكوب (Gyroscope / DeviceOrientation)
// ==================================================
// ملحوظة: المتصفح مايسمحش بالوصول لحساسات الجهاز إلا على اتصال آمن (HTTPS)
// وده اللي بنستخدمه في السيرفر. وعلى الآيفون (iOS 13+) لازم نطلب إذن صريح
// من المستخدم بضغطة زرار (user gesture) قبل ما نقدر نسمع لأحداث الحركة.

let latestBeta = 0;  // الميل للأمام/الخلف
let latestGamma = 0; // الميل لليمين/الشمال
let orientationListenerAttached = false;

function ensureOrientationListener() {
  function attachListener() {
    if (orientationListenerAttached) return;
    window.addEventListener('deviceorientation', (e) => {
      if (e.beta !== null) latestBeta = e.beta;
      if (e.gamma !== null) latestGamma = e.gamma;
    });
    orientationListenerAttached = true;
  }

  if (typeof DeviceOrientationEvent === 'undefined') {
    alert('المتصفح أو الجهاز ده مش بيدعم حساس الجيروسكوب');
    return Promise.resolve(false);
  }

  // آيفون (iOS 13+) بيحتاج طلب إذن صريح جوه ضغطة المستخدم مباشرة
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    return DeviceOrientationEvent.requestPermission()
      .then((state) => {
        if (state === 'granted') {
          attachListener();
          return true;
        }
        alert('لازم توافق على إذن استخدام حساسات الحركة عشان الفيتشر ده يشتغل');
        return false;
      })
      .catch(() => {
        alert('حصل خطأ أثناء طلب إذن الجيروسكوب. جرب من صفحة إعدادات المتصفح.');
        return false;
      });
  }

  attachListener();
  return Promise.resolve(true);
}

// ---------- وضع 1: الجيروسكوب كماوس (تحريك بالسرعة/الميل) ----------
const gyroMouseBtn = document.getElementById('gyro-mouse-toggle');
let gyroMouseActive = false;
let gyroMouseCenter = { beta: 0, gamma: 0 };
let gyroMouseInterval = null;
const GYRO_MOUSE_DEADZONE = 1.5; // درجات، عشان الماوس ميهتزش لوحده

function startGyroMouse() {
  gyroMouseCenter = { beta: latestBeta, gamma: latestGamma }; // معايرة تلقائية عند التفعيل
  gyroMouseInterval = setInterval(() => {
    let dBeta = latestBeta - gyroMouseCenter.beta;
    let dGamma = latestGamma - gyroMouseCenter.gamma;
    if (Math.abs(dBeta) < GYRO_MOUSE_DEADZONE) dBeta = 0;
    if (Math.abs(dGamma) < GYRO_MOUSE_DEADZONE) dGamma = 0;
    if (dBeta === 0 && dGamma === 0) return;
    send({
      type: 'mouse-move',
      dx: dGamma * settings.gyroMouseSensitivity,
      dy: dBeta * settings.gyroMouseSensitivity,
    });
  }, 33); // حوالي 30 مرة في الثانية
}

function stopGyroMouse() {
  if (gyroMouseInterval) clearInterval(gyroMouseInterval);
  gyroMouseInterval = null;
}

gyroMouseBtn.addEventListener('click', async () => {
  if (!gyroMouseActive) {
    const ok = await ensureOrientationListener();
    if (!ok) return;
    gyroMouseActive = true;
    gyroMouseBtn.textContent = '🎯 إيقاف التحكم بالجيروسكوب';
    gyroMouseBtn.classList.add('active');
    startGyroMouse();
  } else {
    gyroMouseActive = false;
    gyroMouseBtn.textContent = '🎯 تفعيل التحكم بالجيروسكوب';
    gyroMouseBtn.classList.remove('active');
    stopGyroMouse();
  }
});

// ---------- وضع 2: الجيروسكوب كتحكم بالحركة للألعاب (Tilt Steering) ----------
const gyroGamepadBtn = document.getElementById('gyro-gamepad-toggle');
const gyroStickSelect = document.getElementById('gyro-stick-select');
let gyroGamepadActive = false;
let gyroGamepadCenter = { beta: 0, gamma: 0 };
let gyroGamepadInterval = null;

function startGyroGamepad() {
  gyroGamepadCenter = { beta: latestBeta, gamma: latestGamma };
  gyroGamepadInterval = setInterval(() => {
    const stickPrefix = gyroStickSelect.value; // 'left' أو 'right'
    const dGamma = latestGamma - gyroGamepadCenter.gamma;
    const dBeta = latestBeta - gyroGamepadCenter.beta;
    const maxAngle = settings.gyroTiltAngle;
    const x = Math.max(-1, Math.min(1, dGamma / maxAngle));
    const y = Math.max(-1, Math.min(1, -dBeta / maxAngle));
    send({ type: 'gamepad-axis', axis: `${stickPrefix}-x`, value: x });
    send({ type: 'gamepad-axis', axis: `${stickPrefix}-y`, value: y });
  }, 33);
}

function stopGyroGamepad() {
  if (gyroGamepadInterval) clearInterval(gyroGamepadInterval);
  gyroGamepadInterval = null;
  // نرجع العصا لوضعها الطبيعي عند الإيقاف
  const stickPrefix = gyroStickSelect.value;
  send({ type: 'gamepad-axis', axis: `${stickPrefix}-x`, value: 0 });
  send({ type: 'gamepad-axis', axis: `${stickPrefix}-y`, value: 0 });
}

gyroGamepadBtn.addEventListener('click', async () => {
  if (!gyroGamepadActive) {
    const ok = await ensureOrientationListener();
    if (!ok) return;
    gyroGamepadActive = true;
    gyroGamepadBtn.textContent = '📱 إيقاف التحكم بالحركة';
    gyroGamepadBtn.classList.add('active');
    startGyroGamepad();
  } else {
    gyroGamepadActive = false;
    gyroGamepadBtn.textContent = '📱 تفعيل التحكم بالحركة (Tilt)';
    gyroGamepadBtn.classList.remove('active');
    stopGyroGamepad();
  }
});

// ==================================================
// تبويب الألعاب (Phase 5)
// ==================================================

// ---------- رابط شاشة اللعبة ----------
const gameLinkInput = document.getElementById('game-link-input');
gameLinkInput.value = `${location.origin}/play`;

document.getElementById('copy-link-btn').addEventListener('click', () => {
  gameLinkInput.select();
  gameLinkInput.setSelectionRange(0, 99999);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(gameLinkInput.value).catch(() => {
      document.execCommand('copy');
    });
  } else {
    document.execCommand('copy');
  }
});

// ---------- اختيار اللعبة ----------
const gamePickBtns = document.querySelectorAll('.game-pick-btn');
const gameControlPanels = {
  runner: document.getElementById('controls-runner'),
  maze: document.getElementById('controls-maze'),
};
let currentSelectedGame = null;

function selectGameUI(name) {
  currentSelectedGame = name;
  gamePickBtns.forEach((b) => b.classList.toggle('active', b.dataset.game === name));
  Object.entries(gameControlPanels).forEach(([key, panel]) => {
    panel.classList.toggle('hidden', key !== name);
  });
  send({ type: 'game-select', game: name });

  // نوقف أي تحكم جيروسكوب شغال من لعبة تانية عشان مايتلخبطش
  stopJumpGyro();
  stopMazeGyro();
}

gamePickBtns.forEach((btn) => {
  btn.addEventListener('click', () => selectGameUI(btn.dataset.game));
});

// ---------- تحكم لعبة الجري (زرار قفز مباشر) ----------
const jumpBtn = document.getElementById('jump-btn');
jumpBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  send({ type: 'game-input', action: 'jump' });
}, { passive: false });
jumpBtn.addEventListener('mousedown', () => {
  send({ type: 'game-input', action: 'jump' });
});

// ---------- تحكم لعبة الجري (قفز بميل الموبايل للأمام) ----------
const jumpGyroBtn = document.getElementById('jump-gyro-toggle');
let jumpGyroActive = false;
let jumpGyroCenter = 0;
let jumpGyroInterval = null;
let jumpGyroTriggered = false;
const JUMP_TILT_THRESHOLD = 18; // درجات الميل للأمام عشان تعتبر قفزة
const JUMP_TILT_RESET = 8; // لازم يرجع تحت الرقم ده عشان يقبل قفزة جديدة

function startJumpGyro() {
  jumpGyroCenter = latestBeta;
  jumpGyroTriggered = false;
  jumpGyroInterval = setInterval(() => {
    const dBeta = latestBeta - jumpGyroCenter;
    if (!jumpGyroTriggered && dBeta > JUMP_TILT_THRESHOLD) {
      send({ type: 'game-input', action: 'jump' });
      jumpGyroTriggered = true;
    } else if (jumpGyroTriggered && dBeta < JUMP_TILT_RESET) {
      jumpGyroTriggered = false;
    }
  }, 33);
}

function stopJumpGyro() {
  if (jumpGyroInterval) clearInterval(jumpGyroInterval);
  jumpGyroInterval = null;
  if (jumpGyroActive) {
    jumpGyroActive = false;
    jumpGyroBtn.textContent = '📱 قفز بالميل للأمام';
    jumpGyroBtn.classList.remove('active');
  }
}

jumpGyroBtn.addEventListener('click', async () => {
  if (!jumpGyroActive) {
    const ok = await ensureOrientationListener();
    if (!ok) return;
    jumpGyroActive = true;
    jumpGyroBtn.textContent = '📱 إيقاف القفز بالميل';
    jumpGyroBtn.classList.add('active');
    startJumpGyro();
  } else {
    stopJumpGyro();
  }
});

// ---------- تحكم لعبة المتاهة (بالجيروسكوب) ----------
const mazeGyroBtn = document.getElementById('maze-gyro-toggle');
let mazeGyroActive = false;
let mazeGyroCenter = { beta: 0, gamma: 0 };
let mazeGyroInterval = null;
const MAZE_TILT_MAX_ANGLE = 25;

function startMazeGyro() {
  mazeGyroCenter = { beta: latestBeta, gamma: latestGamma };
  mazeGyroInterval = setInterval(() => {
    const dGamma = latestGamma - mazeGyroCenter.gamma;
    const dBeta = latestBeta - mazeGyroCenter.beta;
    const x = Math.max(-1, Math.min(1, dGamma / MAZE_TILT_MAX_ANGLE));
    const y = Math.max(-1, Math.min(1, -dBeta / MAZE_TILT_MAX_ANGLE));
    send({ type: 'game-input', axis: 'tilt-x', value: x });
    send({ type: 'game-input', axis: 'tilt-y', value: y });
  }, 33);
}

function stopMazeGyro() {
  if (mazeGyroInterval) clearInterval(mazeGyroInterval);
  mazeGyroInterval = null;
  if (mazeGyroActive) {
    mazeGyroActive = false;
    mazeGyroBtn.textContent = '📱 تفعيل التحكم بالميل (موصى بيه)';
    mazeGyroBtn.classList.remove('active');
  }
  send({ type: 'game-input', axis: 'tilt-x', value: 0 });
  send({ type: 'game-input', axis: 'tilt-y', value: 0 });
}

mazeGyroBtn.addEventListener('click', async () => {
  if (!mazeGyroActive) {
    const ok = await ensureOrientationListener();
    if (!ok) return;
    mazeGyroActive = true;
    mazeGyroBtn.textContent = '📱 إيقاف التحكم بالميل';
    mazeGyroBtn.classList.add('active');
    startMazeGyro();
  } else {
    stopMazeGyro();
  }
});

// ---------- تحكم لعبة المتاهة (أزرار بديلة من غير جيروسكوب) ----------
document.querySelectorAll('#controls-maze [data-move]').forEach((btn) => {
  const dir = btn.dataset.move;
  const axis = dir === 'left' || dir === 'right' ? 'tilt-x' : 'tilt-y';
  const value = dir === 'left' ? -1 : dir === 'right' ? 1 : dir === 'up' ? 1 : -1;

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    send({ type: 'game-input', axis, value });
  }, { passive: false });

  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    send({ type: 'game-input', axis, value: 0 });
  }, { passive: false });
});
