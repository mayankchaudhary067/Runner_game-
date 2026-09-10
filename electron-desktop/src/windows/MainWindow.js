const { BrowserWindow } = require('electron');
const path = require('path');

class MainWindow {
  constructor(appPath, settings) {
    this.appPath = appPath;
    this.settings = settings;
    this.window = null;
  }

  create() {
    const width = this.settings.windowBounds?.width || 980;
    const height = this.settings.windowBounds?.height || 640;

    this.window = new BrowserWindow({
      width,
      height,
      minWidth: 820,
      minHeight: 540,
      backgroundColor: '#eaf4ff',
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 18, y: 16 },
      show: false,
      icon: path.join(this.appPath, 'assets', 'icon.ico'),
      webPreferences: {
        preload: path.join(this.appPath, 'src', 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        enableRemoteModule: false,
      },
    });

    this.window.loadFile(path.join(this.appPath, 'index.html'));
    this.window.once('ready-to-show', () => this.window.show());
    return this.window;
  }
}

module.exports = MainWindow;
