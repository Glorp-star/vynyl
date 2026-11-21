$ErrorActionPreference = 'Stop'

$spotifyProcess = Get-Process -Name Spotify -ErrorAction SilentlyContinue
if ($spotifyProcess) {
    throw 'Close Spotify completely, then run the uninstaller again.'
}

function Expand-ZipArchiveSafely {
    param([string]$SourcePath, [string]$DestinationPath)

    $destinationRoot = [System.IO.Path]::GetFullPath($DestinationPath)
    [System.IO.Directory]::CreateDirectory($destinationRoot) | Out-Null
    $destinationPrefix = $destinationRoot
    if (-not $destinationPrefix.EndsWith([string][System.IO.Path]::DirectorySeparatorChar) -and
        -not $destinationPrefix.EndsWith([string][System.IO.Path]::AltDirectorySeparatorChar)) {
        $destinationPrefix += [System.IO.Path]::DirectorySeparatorChar
    }

    $archive = [System.IO.Compression.ZipFile]::OpenRead($SourcePath)
    $seenFiles = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
    try {
        foreach ($entry in $archive.Entries) {
            $relativePath = $entry.FullName.Replace('/', '\')
            if ($relativePath -match '^[\\/]+$') {
                continue
            }
            if ([System.IO.Path]::IsPathRooted($relativePath)) {
                throw "Spotify archive contains a rooted path: $($entry.FullName)"
            }

            $targetPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($destinationRoot, $relativePath))
            if ($targetPath -eq $destinationRoot) {
                continue
            }
            if (-not $targetPath.StartsWith($destinationPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                throw "Spotify archive contains a path outside its UI directory: $($entry.FullName)"
            }

            if ($entry.Name -eq '' -or $relativePath.EndsWith('\')) {
                [System.IO.Directory]::CreateDirectory($targetPath) | Out-Null
                continue
            }
            if (-not $seenFiles.Add($targetPath)) {
                throw "Spotify archive contains a duplicate path: $($entry.FullName)"
            }

            [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($targetPath)) | Out-Null
            $entryStream = $entry.Open()
            $fileStream = [System.IO.File]::Open($targetPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
            try {
                $entryStream.CopyTo($fileStream)
            } finally {
                $fileStream.Dispose()
                $entryStream.Dispose()
            }
        }
    } finally {
        $archive.Dispose()
    }
}

function Compress-ZipDirectory {
    param([string]$SourceDirectory, [string]$DestinationPath)

    $sourceRoot = [System.IO.Path]::GetFullPath($SourceDirectory)
    $sourcePrefix = $sourceRoot
    if (-not $sourcePrefix.EndsWith([string][System.IO.Path]::DirectorySeparatorChar) -and
        -not $sourcePrefix.EndsWith([string][System.IO.Path]::AltDirectorySeparatorChar)) {
        $sourcePrefix += [System.IO.Path]::DirectorySeparatorChar
    }

    $outputStream = [System.IO.File]::Open($DestinationPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    $archive = $null
    try {
        $archive = [System.IO.Compression.ZipArchive]::new($outputStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
        $archive.CreateEntry('/') | Out-Null
        foreach ($directory in Get-ChildItem -LiteralPath $sourceRoot -Directory -Force -Recurse) {
            $entryName = $directory.FullName.Substring($sourcePrefix.Length).Replace('\', '/') + '/'
            $archive.CreateEntry($entryName) | Out-Null
        }
        foreach ($file in Get-ChildItem -LiteralPath $sourceRoot -File -Force -Recurse) {
            $entryName = $file.FullName.Substring($sourcePrefix.Length).Replace('\', '/')
            $entry = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
            $inputStream = [System.IO.File]::OpenRead($file.FullName)
            $entryStream = $entry.Open()
            try {
                $inputStream.CopyTo($entryStream)
            } finally {
                $entryStream.Dispose()
                $inputStream.Dispose()
            }
        }
    } finally {
        if ($archive) {
            $archive.Dispose()
        }
        $outputStream.Dispose()
    }
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
        Expand-ZipArchiveSafely -SourcePath $archivePath -DestinationPath $uiDir
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
        Compress-ZipDirectory -SourceDirectory $uiDir -DestinationPath $repackedPath
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
