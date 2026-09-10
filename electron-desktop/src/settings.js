const fs = require('fs');
const path = require('path');

function ensureSettingsFile(settingsPath) {
  try {
    if (!fs.existsSync(settingsPath)) {
      const defaultSettings = {
        theme: 'light',
        soundEnabled: true,
        bestScore: 0,
        windowBounds: { width: 980, height: 640 },
        lastOpened: null,
      };
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
    }
  } catch (error) {
    console.error('settings init failed:', error);
  }
}

function loadSettings(settingsPath) {
  try {
    ensureSettingsFile(settingsPath);
    const raw = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('settings load failed:', error);
    return {};
  }
}

function saveSettings(settingsPath, settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('settings save failed:', error);
    return false;
  }
}

module.exports = {
  ensureSettingsFile,
  loadSettings,
  saveSettings,
};
