# Vynyl

Vynyl is an independent Spotify desktop customization app. It adds a Vynyl
button to Spotify's sidebar and opens a built-in catalog for themes, animated
backgrounds, snippets, playback helpers, and Spotify shortcuts.

Vynyl patches only Spotify's local UI entry point and adds its own two assets.
It does not require or run another customization tool. Spotify updates can
replace those local changes; rerun the installer if that happens.

## Install from PowerShell

Close Spotify, then run:

```powershell
iwr -useb https://raw.githubusercontent.com/Glorp-star/vynyl/main/install.ps1 | iex
```

Restart Spotify and click **Vynyl** in the sidebar.

## Uninstall

Close Spotify, then run:

```powershell
iwr -useb https://raw.githubusercontent.com/Glorp-star/vynyl/main/uninstall.ps1 | iex
```

The uninstaller removes only Vynyl's entry-point tags and files. It leaves
Spotify and other customizations in place.

## Run in development

```powershell
npm install
npm run dev
```

The desktop installer can also add or remove Vynyl from Spotify without
downloading another customization framework.

## Build

```powershell
npm run build
npm run dist
```
