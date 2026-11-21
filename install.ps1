$ErrorActionPreference = 'Stop'

$repository = 'Glorp-star/vynyl'
$branch = 'main'
$spotifyProcess = Get-Process -Name Spotify -ErrorAction SilentlyContinue
if ($spotifyProcess) {
    throw 'Close Spotify completely, then run the installer again.'
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
    throw 'Spotify desktop files were not found. Open Spotify once, close it, then try again.'
}

$tempRoot = Join-Path $env:TEMP ('vynyl-' + [guid]::NewGuid().ToString('N'))
$repackedPath = Join-Path $env:TEMP ('vynyl-' + [guid]::NewGuid().ToString('N') + '.spa')
try {
    if ($archivePath) {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $uiDir = Join-Path $tempRoot 'xpui'
        New-Item -ItemType Directory -Path $uiDir -Force | Out-Null
        [System.IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $uiDir)
    }

    $assetDir = Join-Path $uiDir 'vynyl'
    New-Item -ItemType Directory -Path $assetDir -Force | Out-Null
    foreach ($file in @('vynyl-inject.js', 'vynyl.css')) {
        $url = "https://raw.githubusercontent.com/$repository/$branch/spotify-app/$file"
        Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile (Join-Path $assetDir $file)
    }

    $indexPath = Join-Path $uiDir 'index.html'
    $html = [System.IO.File]::ReadAllText($indexPath)
    $html = [regex]::Replace($html, '<link\b(?=[^>]*vynyl-style)[^>]*>\s*', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $html = [regex]::Replace($html, '<script\b(?=[^>]*vynyl-loader)[^>]*>\s*</script>\s*', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $insertAt = $html.LastIndexOf('</body>', [System.StringComparison]::OrdinalIgnoreCase)
    if ($insertAt -lt 0) {
        throw 'Spotify UI entry file has no closing body tag.'
    }
    $tags = '<link id="vynyl-style" rel="stylesheet" href="/vynyl/vynyl.css"><script id="vynyl-loader" src="/vynyl/vynyl-inject.js"></script>'
    $html = $html.Insert($insertAt, $tags)
    [System.IO.File]::WriteAllText($indexPath, $html, (New-Object System.Text.UTF8Encoding($false)))

    if ($archivePath) {
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
        Set-Content -LiteralPath (Join-Path $appsDir '.vynyl-installed') -Value 'Vynyl' -NoNewline
    }
} finally {
    if (Test-Path $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
    if (Test-Path $repackedPath) {
        Remove-Item -LiteralPath $repackedPath -Force
    }
}

Write-Host 'Vynyl is installed. Restart Spotify to see its sidebar button.'
