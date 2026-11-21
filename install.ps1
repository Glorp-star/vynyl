$ErrorActionPreference = 'Stop'

$repository = 'Glorp-star/vynyl'
$branch = 'main'
$spicetify = Get-Command spicetify -ErrorAction SilentlyContinue

if (-not $spicetify) {
    throw 'Spicetify CLI is required. Install it from https://spicetify.app/docs/getting-started, then run this installer again.'
}
if (-not $env:APPDATA) {
    throw 'The Windows APPDATA directory could not be found.'
}

$target = Join-Path $env:APPDATA 'spicetify\CustomApps\vynyl'
$files = @('manifest.json', 'index.js', 'style.css', 'vynyl-runtime.js')
New-Item -ItemType Directory -Path $target -Force | Out-Null

foreach ($file in $files) {
    $uri = "https://raw.githubusercontent.com/$repository/$branch/spotify-app/$file"
    Invoke-WebRequest -UseBasicParsing -Uri $uri -OutFile (Join-Path $target $file)
}

& $spicetify.Source config custom_apps vynyl
if ($LASTEXITCODE -ne 0) {
    throw 'Spicetify could not enable Vynyl. Check the CLI output above and try again.'
}

& $spicetify.Source apply
if ($LASTEXITCODE -ne 0) {
    throw 'Spicetify could not apply Vynyl. Check the CLI output above and try again.'
}

Write-Host 'Vynyl is installed. Restart Spotify, then open Vynyl from the sidebar.'
