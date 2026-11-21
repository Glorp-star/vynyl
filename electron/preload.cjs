const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vynyl', {
  detectSpotify: () => ipcRenderer.invoke('spotify:detect'),
  installToSpotify: () => ipcRenderer.invoke('spotify:install'),
  uninstallFromSpotify: () => ipcRenderer.invoke('spotify:uninstall'),
  detectSpicetify: () => ipcRenderer.invoke('spicetify:detect'),
  setupSpicetify: () => ipcRenderer.invoke('spicetify:setup'),
  installVynylSpicetify: () => ipcRenderer.invoke('spicetify:install-vynyl'),
  uninstallVynylSpicetify: () => ipcRenderer.invoke('spicetify:uninstall-vynyl'),
  openRepository: () => ipcRenderer.invoke('external:open-repository'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
});
