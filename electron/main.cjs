const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 860,
    minHeight: 620,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#11120f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) mainWindow.loadURL(devUrl);
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle('window:close', () => mainWindow?.close());

function findSpicetify() {
  const result = spawnSync('where.exe', ['spicetify'], { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0 || !result.stdout.trim()) return null;
  return result.stdout.trim().split(/\r?\n/)[0];
}

ipcMain.handle('spicetify:detect', async () => {
  const executable = findSpicetify();
  const customApp = path.join(app.getPath('appData'), 'spicetify', 'CustomApps', 'vynyl');
  return { found: Boolean(executable), installed: fs.existsSync(path.join(customApp, 'manifest.json')) };
});

ipcMain.handle('spicetify:install', async () => {
  const executable = findSpicetify();
  if (!executable) {
    return { ok: false, error: 'Spicetify was not found. Install Spicetify CLI, then try again.' };
  }

  const sourceDir = path.join(app.getAppPath(), 'spotify-app');
  const targetDir = path.join(app.getPath('appData'), 'spicetify', 'CustomApps', 'vynyl');
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    for (const file of ['manifest.json', 'index.js', 'style.css', 'vynyl-runtime.js']) {
      fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
    }

    const config = spawnSync(executable, ['config', 'custom_apps', 'vynyl'], { encoding: 'utf8', windowsHide: true });
    if (config.status !== 0) {
      return { ok: false, error: (config.stderr || config.stdout || 'Spicetify could not enable Vynyl.').trim() };
    }
    const apply = spawnSync(executable, ['apply'], { encoding: 'utf8', windowsHide: true });
    if (apply.status !== 0) {
      return { ok: false, error: (apply.stderr || apply.stdout || 'Spicetify could not apply the custom app.').trim() };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('app:open-spicetify-docs', () => shell.openExternal('https://spicetify.app/docs/getting-started'));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
