const MEDIA = { volup: 'volup', voldown: 'voldown', mute: 'volmute', play: 'playpause', next: 'next', prev: 'prev' };
// Meeting shortcuts are the apps' own defaults; the meeting window must be in front (or Zoom's global hotkeys enabled).
const MEET = {
  zoom: { mute: 'alt+a', video: 'alt+v', leave: 'alt+q' },
  teams: { mute: 'ctrl+shift+m', video: 'ctrl+shift+o', leave: 'ctrl+shift+h' },
  meet: { mute: 'ctrl+d', video: 'ctrl+e' },
};
exports.name = 'media';
exports.handle = (m, { keys }) => { const k = m.app ? MEET[m.app]?.[m.a] : MEDIA[m.a]; if (k) keys.press(k); };
