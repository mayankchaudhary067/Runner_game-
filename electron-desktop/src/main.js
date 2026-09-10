const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { createLogger } = require('./logger');
const { ensureSettingsFile, loadSettings, saveSettings } = require('./settings');
const { configureAutoUpdate } = require('./update');
const MainWindow = require('./windows/MainWindow');
const SplashWindow = require('./windows/SplashWindow');

const appDir = app.getAppPath();
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');
const logger = createLogger(userDataPath);

let mainWindow;
let tray = null;
let splashWindow = null;

function bootstrapSplash() {
  if (fs.existsSync(path.join(appDir, 'assets', 'splash.html'))) {
    splashWindow = new SplashWindow(appDir).create();
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
    }, 1500);
  }
}

function createMainWindow() {
  const settings = loadSettings(settingsPath);
  const windowManager = new MainWindow(appDir, settings);
  mainWindow = windowManager.create();

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      return;
    }

    const bounds = mainWindow.getBounds();
    const currentSettings = loadSettings(settingsPath);
    saveSettings(settingsPath, {
      ...currentSettings,
      windowBounds: { width: bounds.width, height: bounds.height },
    });
  });

  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds();
    const currentSettings = loadSettings(settingsPath);
    saveSettings(settingsPath, {
      ...currentSettings,
      windowBounds: { width: bounds.width, height: bounds.height },
    });
  });

  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    logger.error(`page load failed: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.webContents.on('render-process-gone', (_, details) => {
    logger.error(`render process crashed: ${JSON.stringify(details)}`);
  });

  if (!tray) {
    tray = new Tray(path.join(appDir, 'assets', 'icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open', click: () => mainWindow.show() },
      { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } },
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Simple Runner');
    tray.on('click', () => mainWindow.show());
  }
}

app.whenReady().then(() => {
  ensureSettingsFile(settingsPath);
  bootstrapSplash();
  createMainWindow();
  configureAutoUpdate();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

ipcMain.handle('get-settings', () => loadSettings(settingsPath));

ipcMain.handle('save-settings', (_, settings) => {
  const cur = loadSettings(settingsPath);
  const merged = { ...cur, ...settings };
  saveSettings(settingsPath, merged);
  return merged;
});

ipcMain.handle('open-external', async (_, url) => {
  try {
    await shell.openExternal(url);
    return true;
  } catch (error) {
    logger.error(`external open failed: ${error.message}`);
    return false;
  }
});

ipcMain.handle('show-message', async (_, { title, message, type }) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, {
      type,
      title,
      message,
      buttons: ['OK'],
    });
    return result.response;
  } catch (error) {
    logger.error(`dialog failed: ${error.message}`);
    return 0;
  }
});

ipcMain.handle('log', (_, message) => {
  logger.log(message);
  return true;
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  logger.error(error.stack || error.message);
  dialog.showErrorBox('Unexpected Error', error.message || 'An unexpected error occurred.');
});
