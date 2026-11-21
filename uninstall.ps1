$ErrorActionPreference = 'Stop'

$spotifyProcess = Get-Process -Name Spotify -ErrorAction SilentlyContinue
if ($spotifyProcess) {
    throw 'Close Spotify completely, then run the uninstaller again.'
}

$roaming = $env:APPDATA
$local = $env:LOCALAPPDATA
$appsCandidates = @(
    (Join-Path $roaming 'Spotify\Apps'),
    (Join-Path $local 'Spotify\Apps'),
    (Join-Path $local 'Packages\SpotifyAB.SpotifyMusic_zpdnekdrzrea0\LocalCache\Roaming\Spotify\Apps')
)
$appsDir = $null
$uiDir = $null
$archivePath = $null
foreach ($candidate in $appsCandidates) {
    if (Test-Path (Join-Path $candidate 'xpui\index.html')) {
        $appsDir = $candidate
        $uiDir = Join-Path $candidate 'xpui'
        break
    }
    if (Test-Path (Join-Path $candidate 'xpui.spa')) {
        $appsDir = $candidate
        $archivePath = Join-Path $candidate 'xpui.spa'
        break
    }
}
if (-not $appsDir) {
    throw 'Spotify desktop files were not found.'
}

$tempRoot = Join-Path $env:TEMP ('vynyl-remove-' + [guid]::NewGuid().ToString('N'))
$repackedPath = Join-Path $env:TEMP ('vynyl-remove-' + [guid]::NewGuid().ToString('N') + '.spa')
try {
    if ($archivePath) {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $uiDir = Join-Path $tempRoot 'xpui'
        New-Item -ItemType Directory -Path $uiDir -Force | Out-Null
        [System.IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $uiDir)
    }

    $indexPath = Join-Path $uiDir 'index.html'
    $html = [System.IO.File]::ReadAllText($indexPath)
    $updated = [regex]::Replace($html, '<link\b(?=[^>]*vynyl-style)[^>]*>\s*', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $updated = [regex]::Replace($updated, '<script\b(?=[^>]*vynyl-loader)[^>]*>\s*</script>\s*', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($updated -ne $html) {
        [System.IO.File]::WriteAllText($indexPath, $updated, (New-Object System.Text.UTF8Encoding($false)))
    }

    $assetDir = Join-Path $uiDir 'vynyl'
    $assetsChanged = $false
    foreach ($file in @('vynyl-inject.js', 'vynyl.css')) {
        $filePath = Join-Path $assetDir $file
        if (Test-Path $filePath) {
            Remove-Item -LiteralPath $filePath -Force
            $assetsChanged = $true
        }
    }
    if ((Test-Path $assetDir) -and @(Get-ChildItem -LiteralPath $assetDir -Force).Count -eq 0) {
        Remove-Item -LiteralPath $assetDir -Force
    }

    if ($archivePath -and ($updated -ne $html -or $assetsChanged -or (Test-Path (Join-Path $appsDir '.vynyl-installed')))) {
        [System.IO.Compression.ZipFile]::CreateFromDirectory($uiDir, $repackedPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)
        $temporaryBackup = $archivePath + '.vynyl-tmp-backup'
        Copy-Item -LiteralPath $archivePath -Destination $temporaryBackup -Force
        try {
            Move-Item -LiteralPath $repackedPath -Destination $archivePath -Force
        } catch {
            Copy-Item -LiteralPath $temporaryBackup -Destination $archivePath -Force
            throw
        } finally {
            Remove-Item -LiteralPath $temporaryBackup -Force -ErrorAction SilentlyContinue
        }
    }

    $marker = Join-Path $appsDir '.vynyl-installed'
    if (Test-Path $marker) {
        Remove-Item -LiteralPath $marker -Force
    }
} finally {
    if (Test-Path $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
    if (Test-Path $repackedPath) {
        Remove-Item -LiteralPath $repackedPath -Force
    }
}

Write-Host 'Vynyl has been removed. Spotify itself and any other customizations were left in place.'
