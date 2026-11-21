const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile, spawn, spawnSync } = require('child_process');
const { promisify } = require('util');

let mainWindow;
const execFileAsync = promisify(execFile);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 860,
    minHeight: 620,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#121119',
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
ipcMain.handle('external:open-repository', () => shell.openExternal('https://github.com/Glorp-star/vynyl'));

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

function findSpicetifyCli() {
  const candidates = [
    path.join(process.env.LOCALAPPDATA || '', 'spicetify', 'spicetify.exe'),
    path.join(app.getPath('home'), 'spicetify-cli', 'spicetify.exe'),
    ...(process.env.PATH || '').split(path.delimiter).map((directory) => path.join(directory, 'spicetify.exe'))
  ];
  const candidate = candidates.find((filePath) => filePath && fs.existsSync(filePath));
  if (candidate) return candidate;

  const result = spawnSync('where.exe', ['spicetify.exe'], {
    encoding: 'utf8',
    windowsHide: true
  });
  if (result.status === 0) {
    const fromPath = result.stdout.split(/\r?\n/).map((line) => line.trim()).find((line) => line && fs.existsSync(line));
    if (fromPath) return fromPath;
  }
  return null;
}

async function runSpicetify(cliPath, args) {
  try {
    const result = await execFileAsync(cliPath, args, {
      windowsHide: true,
      timeout: 60000,
      maxBuffer: 8 * 1024 * 1024
    });
    return (result.stdout || '').trim();
  } catch (error) {
    throw new Error((error.stderr || error.stdout || error.message || `Spicetify ${args[0]} failed.`).trim());
  }
}

async function getSpicetifyUserDataPath(cliPath) {
  const output = await runSpicetify(cliPath, ['path', 'userdata']);
  const dataPath = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).pop();
  if (!dataPath || !path.isAbsolute(dataPath)) {
    throw new Error('Spicetify did not return a valid user data folder.');
  }
  return dataPath;
}

async function getSpicetifyState() {
  const cliPath = findSpicetifyCli();
  if (!cliPath) return { installed: false, configured: false, marketplaceInstalled: false, vynylInstalled: false };

  let userDataPath;
  try {
    userDataPath = await getSpicetifyUserDataPath(cliPath);
  } catch (error) {
    return {
      installed: true,
      configured: false,
      marketplaceInstalled: false,
      vynylInstalled: false,
      error: error.message
    };
  }

  const marketplaceInstalled = fs.existsSync(path.join(userDataPath, 'CustomApps', 'marketplace', 'manifest.json'));
  let vynylInstalled = false;
  try {
    const extensions = await runSpicetify(cliPath, ['config', 'extensions']);
    vynylInstalled = /\bvynyl\.js\b/i.test(extensions)
      && fs.existsSync(path.join(userDataPath, 'Extensions', 'vynyl.js'));
  } catch {
    return { installed: true, configured: false, marketplaceInstalled, vynylInstalled: false };
  }
  return { installed: true, configured: true, marketplaceInstalled, vynylInstalled };
}

function openSpicetifySetup() {
  if (spotifyIsRunning()) {
    return Promise.reject(new Error('Close Spotify completely before setting up Spicetify.'));
  }

  const setupUrl = 'https://raw.githubusercontent.com/spicetify/marketplace/main/resources/install.ps1';
  const command = `$ErrorActionPreference = 'Stop'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri '${setupUrl}' | Invoke-Expression`;
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-NoExit',
      '-Command', command
    ], { stdio: 'ignore', windowsHide: false });
    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve({ ok: true });
    });
  });
}

async function installVynylSpicetifyExtension() {
  if (spotifyIsRunning()) throw new Error('Close Spotify completely before enabling Vynyl in Spicetify.');
  const cliPath = findSpicetifyCli();
  if (!cliPath) throw new Error('Spicetify CLI is not installed. Use the Spicetify setup option first.');

  const userDataPath = await getSpicetifyUserDataPath(cliPath);
  const sourcePath = path.join(app.getAppPath(), 'dist', 'vynyl-spicetify.js');
  if (!fs.existsSync(sourcePath)) throw new Error('The Vynyl Spicetify extension is missing. Rebuild Vynyl and try again.');

  const extensionsDir = path.join(userDataPath, 'Extensions');
  const extensionPath = path.join(extensionsDir, 'vynyl.js');
  const extensionSource = fs.readFileSync(sourcePath, 'utf8');
  const originalExtension = fs.existsSync(extensionPath) ? fs.readFileSync(extensionPath) : null;
  if (originalExtension && !originalExtension.toString('utf8').startsWith('// Vynyl-managed Spicetify extension')) {
    throw new Error('A different vynyl.js already exists in Spicetify. It was left untouched.');
  }

  let wasEnabled = false;
  try {
    wasEnabled = /\bvynyl\.js\b/i.test(await runSpicetify(cliPath, ['config', 'extensions']));
  } catch (error) {
    throw new Error(`Spicetify is installed but not ready yet: ${error.message}`);
  }

  fs.mkdirSync(extensionsDir, { recursive: true });
  let addedToConfig = false;
  try {
    fs.writeFileSync(extensionPath, extensionSource, 'utf8');
    if (!wasEnabled) {
      await runSpicetify(cliPath, ['config', 'extensions', 'vynyl.js']);
      addedToConfig = true;
    }
    await runSpicetify(cliPath, ['apply']);
    return { ok: true };
  } catch (error) {
    const rollbackErrors = [];
    let canRemoveExtension = true;
    if (addedToConfig) {
      try {
        await runSpicetify(cliPath, ['config', 'extensions', 'vynyl.js-']);
        await runSpicetify(cliPath, ['apply']);
      } catch (rollbackError) {
        canRemoveExtension = false;
        rollbackErrors.push(rollbackError.message);
      }
    }
    if (originalExtension) fs.writeFileSync(extensionPath, originalExtension);
    else if (canRemoveExtension && fs.existsSync(extensionPath)) fs.unlinkSync(extensionPath);
    if (wasEnabled) {
      try {
        await runSpicetify(cliPath, ['apply']);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError.message);
      }
    }
    if (rollbackErrors.length) {
      throw new Error(`${error.message} Rollback also reported: ${rollbackErrors.join('; ')}`);
    }
    throw error;
  }
}

async function uninstallVynylSpicetifyExtension() {
  if (spotifyIsRunning()) throw new Error('Close Spotify completely before removing Vynyl from Spicetify.');
  const cliPath = findSpicetifyCli();
  if (!cliPath) throw new Error('Spicetify CLI is not installed.');

  const userDataPath = await getSpicetifyUserDataPath(cliPath);
  const extensionPath = path.join(userDataPath, 'Extensions', 'vynyl.js');
  if (fs.existsSync(extensionPath)
    && !fs.readFileSync(extensionPath, 'utf8').startsWith('// Vynyl-managed Spicetify extension')) {
    throw new Error('A different vynyl.js exists in Spicetify. It was left untouched.');
  }

  const extensions = await runSpicetify(cliPath, ['config', 'extensions']);
  if (/\bvynyl\.js\b/i.test(extensions)) {
    await runSpicetify(cliPath, ['config', 'extensions', 'vynyl.js-']);
    try {
      await runSpicetify(cliPath, ['apply']);
    } catch (error) {
      try {
        await runSpicetify(cliPath, ['config', 'extensions', 'vynyl.js']);
        await runSpicetify(cliPath, ['apply']);
      } catch (rollbackError) {
        throw new Error(`${error.message} Could not restore the previous Spicetify extension setting: ${rollbackError.message}`);
      }
      throw error;
    }
  }
  if (fs.existsSync(extensionPath)) fs.unlinkSync(extensionPath);
  return { ok: true };
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
ipcMain.handle('spicetify:detect', async () => getSpicetifyState());
ipcMain.handle('spicetify:setup', async () => openSpicetifySetup());
ipcMain.handle('spicetify:install-vynyl', async () => installVynylSpicetifyExtension());
ipcMain.handle('spicetify:uninstall-vynyl', async () => uninstallVynylSpicetifyExtension());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
