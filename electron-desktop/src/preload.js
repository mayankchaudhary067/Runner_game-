const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appBridge', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showMessage: (title, message, type = 'info') => ipcRenderer.invoke('show-message', { title, message, type }),
  log: (message) => ipcRenderer.invoke('log', message),
});
