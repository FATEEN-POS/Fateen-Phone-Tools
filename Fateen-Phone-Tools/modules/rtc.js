// Phone camera/mic to PC: relays WebRTC signaling between the phone and the /cam page on the PC.
exports.name = 'rtc';
exports.handle = (m, api) => { if (m.data && typeof m.data.type === 'string') api.toPc({ rtc: m.data }); };
