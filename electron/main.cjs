const { app, BrowserWindow, ipcMain } = require('electron');
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

function spotifyAppsFolders() {
  const roaming = process.env.APPDATA || app.getPath('appData');
  const local = process.env.LOCALAPPDATA || path.dirname(roaming);
  return [
    path.join(roaming, 'Spotify', 'Apps'),
    path.join(local, 'Spotify', 'Apps'),
    path.join(local, 'Packages', 'SpotifyAB.SpotifyMusic_zpdnekdrzrea0', 'LocalCache', 'Roaming', 'Spotify', 'Apps')
  ];
}

function findSpotifyUi() {
  for (const appsDir of spotifyAppsFolders()) {
    const expandedDir = path.join(appsDir, 'xpui');
    const archivePath = path.join(appsDir, 'xpui.spa');
    if (fs.existsSync(path.join(expandedDir, 'index.html'))) {
      return { kind: 'directory', appsDir, uiDir: expandedDir };
    }
    if (fs.existsSync(archivePath)) {
      return { kind: 'archive', appsDir, archivePath };
    }
  }
  return null;
}

function spotifyIsRunning() {
  const result = spawnSync('tasklist.exe', ['/FI', 'IMAGENAME eq Spotify.exe', '/NH'], {
    encoding: 'utf8',
    windowsHide: true
  });
  return result.status === 0 && /Spotify\.exe/i.test(result.stdout);
}

function quotePowerShell(value) {
  return "'" + value.replace(/'/g, "''") + "'";
}

function runArchiveCommand(command) {
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'Could not update Spotify UI archive.').trim());
  }
}

function copyVynylAssets(uiDir) {
  const sourceDir = path.join(app.getAppPath(), 'spotify-app');
  const targetDir = path.join(uiDir, 'vynyl');
  fs.mkdirSync(targetDir, { recursive: true });
  for (const file of ['vynyl-inject.js', 'vynyl.css']) {
    fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
  }
}

function updateEntryPoint(uiDir, install) {
  const entryPath = path.join(uiDir, 'index.html');
  let html = fs.readFileSync(entryPath, 'utf8');
  const before = html;
  html = html
    .replace(/<link\b(?=[^>]*\bid=["']vynyl-style["'])[^>]*>\s*/gi, '')
    .replace(/<script\b(?=[^>]*\bid=["']vynyl-loader["'])[^>]*>\s*<\/script>\s*/gi, '');

  if (install) {
    const tags = '<link id="vynyl-style" rel="stylesheet" href="/vynyl/vynyl.css"><script id="vynyl-loader" src="/vynyl/vynyl-inject.js"></script>';
    if (!/<\/body>/i.test(html)) throw new Error('Spotify UI entry file has no closing body tag.');
    html = html.replace(/<\/body>/i, tags + '</body>');
  }

  if (html !== before) fs.writeFileSync(entryPath, html, 'utf8');
  return html !== before;
}

function removeVynylAssets(uiDir) {
  const targetDir = path.join(uiDir, 'vynyl');
  let changed = false;
  for (const file of ['vynyl-inject.js', 'vynyl.css']) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      changed = true;
    }
  }
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length === 0) fs.rmdirSync(targetDir);
  return changed;
}

function updateExpandedUi(uiDir, install) {
  if (!install) {
    const entryChanged = updateEntryPoint(uiDir, false);
    const assetsChanged = removeVynylAssets(uiDir);
    return entryChanged || assetsChanged;
  }
  try {
    copyVynylAssets(uiDir);
    return updateEntryPoint(uiDir, true);
  } catch (error) {
    removeVynylAssets(uiDir);
    throw error;
  }
}

function updateArchivedUi(archivePath, install) {
  const tempRoot = fs.mkdtempSync(path.join(app.getPath('temp'), 'vynyl-'));
  const outputPath = path.join(app.getPath('temp'), 'vynyl-' + Date.now() + '.spa');
  const backupPath = archivePath + '.vynyl-tmp-backup';
  try {
    const expand = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory(${quotePowerShell(archivePath)}, ${quotePowerShell(tempRoot)})`;
    runArchiveCommand(expand);
    const changed = updateExpandedUi(tempRoot, install);
    if (!changed && !install) return false;

    const compress = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory(${quotePowerShell(tempRoot)}, ${quotePowerShell(outputPath)}, [System.IO.Compression.CompressionLevel]::Optimal, $false)`;
    runArchiveCommand(compress);

    fs.copyFileSync(archivePath, backupPath);
    try {
      fs.copyFileSync(outputPath, archivePath);
    } catch (error) {
      fs.copyFileSync(backupPath, archivePath);
      throw error;
    } finally {
      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
    }
    return changed;
  } finally {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function updateSpotify(install) {
  if (spotifyIsRunning()) {
    return { ok: false, error: 'Close Spotify completely, then try again.' };
  }
  const ui = findSpotifyUi();
  if (!ui) {
    return { ok: false, error: 'Spotify desktop files were not found. Open Spotify once, close it, then try again.' };
  }

  try {
    const changed = ui.kind === 'directory'
      ? updateExpandedUi(ui.uiDir, install)
      : updateArchivedUi(ui.archivePath, install);
    const markerPath = path.join(ui.appsDir, '.vynyl-installed');
    if (ui.kind === 'archive') {
      if (install) fs.writeFileSync(markerPath, 'Vynyl\n', 'utf8');
      else if (fs.existsSync(markerPath)) fs.unlinkSync(markerPath);
    }
    return { ok: true, changed, location: ui.appsDir };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

ipcMain.handle('spotify:detect', async () => {
  const ui = findSpotifyUi();
  if (!ui) return { found: false, installed: false };
  const entryPath = path.join(ui.uiDir || ui.appsDir, 'index.html');
  const installed = ui.kind === 'directory'
    ? fs.readFileSync(entryPath, 'utf8').includes('id="vynyl-loader"')
    : fs.existsSync(path.join(ui.appsDir, '.vynyl-installed'));
  return { found: true, installed };
});
ipcMain.handle('spotify:install', async () => updateSpotify(true));
ipcMain.handle('spotify:uninstall', async () => updateSpotify(false));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
