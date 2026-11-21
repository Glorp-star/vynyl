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

function createArchiveExtractionCommand(archivePath, destinationPath) {
  return String.raw`
Add-Type -AssemblyName System.IO.Compression.FileSystem
$destinationRoot = ${quotePowerShell(destinationPath)}
$destinationRoot = [System.IO.Path]::GetFullPath($destinationRoot)
[System.IO.Directory]::CreateDirectory($destinationRoot) | Out-Null
$destinationPrefix = $destinationRoot
if (-not $destinationPrefix.EndsWith([string][System.IO.Path]::DirectorySeparatorChar) -and -not $destinationPrefix.EndsWith([string][System.IO.Path]::AltDirectorySeparatorChar)) {
  $destinationPrefix += [System.IO.Path]::DirectorySeparatorChar
}
$archive = [System.IO.Compression.ZipFile]::OpenRead(${quotePowerShell(archivePath)})
$seenFiles = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
try {
  foreach ($entry in $archive.Entries) {
    $relativePath = $entry.FullName.Replace('/', '\')
    if ($relativePath -match '^[\\/]+$') { continue }
    if ([System.IO.Path]::IsPathRooted($relativePath)) { throw "Spotify archive contains a rooted path: $($entry.FullName)" }
    $targetPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destinationRoot, $relativePath))
    if ($targetPath -eq $destinationRoot) { continue }
    if (-not $targetPath.StartsWith($destinationPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "Spotify archive contains a path outside its UI directory: $($entry.FullName)"
    }
    if ($entry.Name -eq '' -or $relativePath.EndsWith('\')) {
      [System.IO.Directory]::CreateDirectory($targetPath) | Out-Null
      continue
    }
    if (-not $seenFiles.Add($targetPath)) { throw "Spotify archive contains a duplicate path: $($entry.FullName)" }
    [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($targetPath)) | Out-Null
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::Open($targetPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
    try { $entryStream.CopyTo($fileStream) } finally { $fileStream.Dispose(); $entryStream.Dispose() }
  }
} finally {
  $archive.Dispose()
}`;
}

function createArchiveCompressionCommand(sourcePath, archivePath) {
  return String.raw`
Add-Type -AssemblyName System.IO.Compression
$sourceRoot = [System.IO.Path]::GetFullPath(${quotePowerShell(sourcePath)})
$sourcePrefix = $sourceRoot
if (-not $sourcePrefix.EndsWith([string][System.IO.Path]::DirectorySeparatorChar) -and -not $sourcePrefix.EndsWith([string][System.IO.Path]::AltDirectorySeparatorChar)) {
  $sourcePrefix += [System.IO.Path]::DirectorySeparatorChar
}
$outputStream = [System.IO.File]::Open(${quotePowerShell(archivePath)}, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
$zip = $null
try {
  $zip = [System.IO.Compression.ZipArchive]::new($outputStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
  $zip.CreateEntry('/') | Out-Null
  foreach ($directory in Get-ChildItem -LiteralPath $sourceRoot -Directory -Force -Recurse) {
    $entryName = $directory.FullName.Substring($sourcePrefix.Length).Replace('\', '/') + '/'
    $zip.CreateEntry($entryName) | Out-Null
  }
  foreach ($file in Get-ChildItem -LiteralPath $sourceRoot -File -Force -Recurse) {
    $entryName = $file.FullName.Substring($sourcePrefix.Length).Replace('\', '/')
    $entry = $zip.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $inputStream = [System.IO.File]::OpenRead($file.FullName)
    $entryStream = $entry.Open()
    try { $inputStream.CopyTo($entryStream) } finally { $entryStream.Dispose(); $inputStream.Dispose() }
  }
} finally {
  if ($zip) { $zip.Dispose() }
  $outputStream.Dispose()
}`;
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
    runArchiveCommand(createArchiveExtractionCommand(archivePath, tempRoot));
    const changed = updateExpandedUi(tempRoot, install);
    if (!changed && !install) return false;

    runArchiveCommand(createArchiveCompressionCommand(tempRoot, outputPath));

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
