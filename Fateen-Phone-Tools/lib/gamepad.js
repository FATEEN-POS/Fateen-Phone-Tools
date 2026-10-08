// gamepad.js
// Module responsible for creating a virtual Xbox 360 controller using ViGEmBus.
// Note: the library (vigemclient) only works on Windows and requires the ViGEmBus driver.
// It is loaded lazily (only when needed) so the server doesn't crash if the driver
// isn't installed yet, or if the server is running on another OS during development/testing.

let ViGEmClient = null;
let client = null;
let controller = null;

function loadLibrary() {
  if (!ViGEmClient) {
    try {
      ViGEmClient = require('vigemclient');
    } catch (e) {
      throw new Error(
        'The gamepad library (vigemclient) is not installed on your machine. This usually happens when the ' +
        'Visual Studio C++ build tools needed to compile it are missing. See the "Enabling the real gamepad" ' +
        'section in README.md to learn how to install it.'
      );
    }
  }
}

function isConnected() {
  return controller !== null;
}

function connectController() {
  if (controller) return controller; // already connected

  loadLibrary();

  client = new ViGEmClient();
  const connectErr = client.connect();
  if (connectErr) {
    throw new Error(
      'Could not connect to ViGEmBus. Make sure the driver is installed from: https://github.com/ViGEm/ViGEmBus/releases — ' +
      connectErr.message
    );
  }

  controller = client.createX360Controller();
  const plugErr = controller.connect();
  if (plugErr) {
    controller = null;
    client = null;
    throw new Error('Could not plug in the virtual gamepad: ' + plugErr.message);
  }

  return controller;
}

function disconnectController() {
  if (controller) {
    try {
      controller.disconnect();
    } catch (e) {
      // Ignore any error while disconnecting
    }
  }
  controller = null;
  client = null;
}

// Maps button names coming from the mobile UI to ViGEm library button names
const BUTTON_MAP = {
  a: 'A',
  b: 'B',
  x: 'X',
  y: 'Y',
  lb: 'LEFT_SHOULDER',
  rb: 'RIGHT_SHOULDER',
  start: 'START',
  back: 'BACK',
  lstick: 'LEFT_THUMB',
  rstick: 'RIGHT_THUMB',
};

// Maps axes (analog sticks + triggers + D-Pad)
const AXIS_MAP = {
  'left-x': 'leftX',
  'left-y': 'leftY',
  'right-x': 'rightX',
  'right-y': 'rightY',
  lt: 'leftTrigger',
  rt: 'rightTrigger',
  'dpad-x': 'dpadHorz',
  'dpad-y': 'dpadVert',
};

function setButton(name, pressed) {
  if (!controller) return;
  const key = BUTTON_MAP[name];
  if (!key) return;
  controller.button[key].setValue(!!pressed);
}

function setAxis(name, value) {
  if (!controller) return;
  const key = AXIS_MAP[name];
  if (!key) return;
  // Make sure the value is between -1 and 1 (or 0 and 1 for triggers)
  const clamped = Math.max(-1, Math.min(1, value));
  controller.axis[key].setValue(clamped);
}

function resetAll() {
  if (controller) controller.resetInputs();
}

module.exports = {
  connectController,
  disconnectController,
  isConnected,
  setButton,
  setAxis,
  resetAll,
};
