// Link Pad as a module: mouse/keyboard (nut.js), virtual Xbox gamepad (ViGEm) and the two built-in games.
// Its phone UI lives in public/linkpad and still speaks Link Pad's own {type: ...} messages.
const gamepad = require('../lib/gamepad');
let nut = null;
try { nut = require('@nut-tree-fork/nut-js'); nut.mouse.config.mouseSpeed = 3000; }
catch { console.log('ℹ️  Link Pad mouse/keyboard need @nut-tree-fork/nut-js (run npm install). Gamepad and games still work.'); }

let currentGame = null;
const K = nut && nut.Key;
const KEYS = K && { enter: K.Enter, esc: K.Escape, space: K.Space, backspace: K.Backspace, tab: K.Tab, up: K.Up, down: K.Down, left: K.Left, right: K.Right, w: K.W, a: K.A, s: K.S, d: K.D };
const btn = (n) => ({ left: nut.Button.LEFT, right: nut.Button.RIGHT, middle: nut.Button.MIDDLE }[n] || nut.Button.LEFT);

async function run(d, api, ws) {
  const t = d.type, reply = (o) => ws.send(JSON.stringify(o));
  if (nut) {
    const { mouse, keyboard, Point } = nut;
    if (t === 'mouse-move') { const c = await mouse.getPosition(), f = d.factor || 1.5; return mouse.setPosition(new Point(c.x + d.dx * f, c.y + d.dy * f)); }
    if (t === 'mouse-click') return mouse.click(btn(d.button));
    if (t === 'mouse-down') return mouse.pressButton(btn(d.button));
    if (t === 'mouse-up') return mouse.releaseButton(btn(d.button));
    if (t === 'scroll') return d.dy > 0 ? mouse.scrollDown(Math.abs(d.dy)) : mouse.scrollUp(Math.abs(d.dy));
    if (t === 'key-press') { const k = KEYS[d.key]; if (k !== undefined) { await keyboard.pressKey(k); await keyboard.releaseKey(k); } return; }
    if (t === 'key-down') { const k = KEYS[d.key]; if (k !== undefined) await keyboard.pressKey(k); return; }
    if (t === 'key-up') { const k = KEYS[d.key]; if (k !== undefined) await keyboard.releaseKey(k); return; }
    if (t === 'type-text' && typeof d.text === 'string') return keyboard.type(d.text);
  }
  if (t === 'gamepad-connect') {
    try {
      gamepad.connectController();
      ws.once('close', () => gamepad.disconnectController()); // never leave a stuck virtual pad
      reply({ type: 'gamepad-status', connected: true });
    } catch (e) { reply({ type: 'gamepad-status', connected: false, error: e.message }); }
  } else if (t === 'gamepad-disconnect') { gamepad.disconnectController(); reply({ type: 'gamepad-status', connected: false }); }
  else if (t === 'gamepad-axis') gamepad.setAxis(d.axis, d.value);
  else if (t === 'gamepad-button') gamepad.setButton(d.button, d.pressed);
  else if (t === 'game-select') { currentGame = d.game; api.toDisplays({ type: 'game-select', game: d.game }); }
  else if (t === 'game-input') api.toDisplays({ ...d, type: 'game-input' });
}

exports.name = 'linkpad';
exports.display = (ws) => { if (currentGame) ws.send(JSON.stringify({ type: 'game-select', game: currentGame })); };
exports.handle = (d, api, ws) => { run(d, api, ws).catch((e) => console.log('linkpad:', e.message)); };
