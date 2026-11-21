# Vynyl

Vynyl is an independent Spotify desktop customization app. Its desktop
manager detects Spotify and can install, repair, or remove Vynyl. In Spotify,
the Vynyl sidebar button opens a built-in catalog with 20 themes, custom
accents and image backgrounds, animated and liquid-glass looks, extensions,
snippets, and quick links.

Extensions include playback shortcuts, focus mode, artwork glow, and a
cosmetic Ad Shield that hides sponsored cards and promo panels. Ad Shield
does not skip audio ads or block network requests.

Quick commands (`Ctrl+K`) and the read-only Duplicate Finder bring Vynyl
versions of ideas found in the Marketplace's [Power Bar](https://github.com/jeroentvb/spicetify-power-bar)
and [Sort-Play](https://github.com/hoeci/sort-play). They are implemented
natively for Vynyl; no Spicetify extension code or runtime is loaded. The
duplicate finder only highlights repeated track links among the currently
visible playlist rows; it does not edit or remove tracks.

Vynyl patches only Spotify's local UI entry point and adds its own two assets.
It does not require or run another customization tool. Spotify updates can
replace those local changes; use **Repair** in the desktop manager or rerun
the installer if that happens.

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
