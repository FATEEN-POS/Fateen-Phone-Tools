const A = { next: 'right', prev: 'left', start: 'f5', end: 'esc', black: 'b', white: 'w' };
exports.name = 'presenter';
exports.handle = (m, { keys }) => {
  if (A[m.a]) keys.press(A[m.a]);
  if (m.a === 'goto' && /^\d{1,3}$/.test(String(m.n))) { for (const d of String(m.n)) keys.press(d); keys.press('enter'); }
};
