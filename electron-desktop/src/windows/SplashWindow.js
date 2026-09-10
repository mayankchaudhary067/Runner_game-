const { BrowserWindow } = require('electron');
const path = require('path');

class SplashWindow {
  constructor(appPath) {
    this.appPath = appPath;
    this.window = null;
  }

  create() {
    this.window = new BrowserWindow({
      width: 640,
      height: 360,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      show: false,
      resizable: false,
      movable: false,
      skipTaskbar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.window.loadFile(path.join(this.appPath, 'assets', 'splash.html'));
    this.window.once('ready-to-show', () => this.window.show());

    return this.window;
  }
}

module.exports = SplashWindow;
