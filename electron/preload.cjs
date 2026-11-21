const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vynyl', {
  detectSpicetify: () => ipcRenderer.invoke('spicetify:detect'),
  installCustomApp: () => ipcRenderer.invoke('spicetify:install'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  openSpicetifyDocs: () => ipcRenderer.invoke('app:open-spicetify-docs')
});
