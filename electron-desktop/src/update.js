const { app, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

function configureAutoUpdate() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available.');
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto-update error:', error);
    dialog.showErrorBox('Update Error', error.message || 'Could not update the application.');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log('Download progress:', progressObj.percent);
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  if (!app.isPackaged) {
    console.log('Skipping auto-update in development mode.');
    return;
  }

  autoUpdater.checkForUpdatesAndNotify();
}

module.exports = { configureAutoUpdate };
