# Vynyl

Vynyl is a Spicetify Custom App for changing Spotify's colors and enabling small
in-client enhancements. It includes animated colorways, a liquid-glass look,
custom HTTPS image backgrounds, player shortcuts, track-change toasts, and
small CSS snippets.

## Install from PowerShell

With Spicetify CLI already installed, run:

```powershell
iwr -useb https://raw.githubusercontent.com/Glorp-star/vynyl/main/install.ps1 | iex
```

Restart Spotify after the installer finishes. Open **Vynyl** from Spotify's
sidebar. Extension and snippet switches take effect immediately; theme and
background choices are saved on this device.

## Run the desktop installer in development

```powershell
npm install
npm run dev
```

The desktop installer copies the app into `%appdata%\spicetify\CustomApps\vynyl`,
enables it with the Spicetify CLI, and applies the configuration.

## Build

```powershell
npm run build
npm run dist
```

Vynyl's feature scripts are included with the app and do not download or execute
third-party extension code.
