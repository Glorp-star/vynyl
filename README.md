# Vynyl

Vynyl is an independent Spotify desktop customization app. Its desktop
manager detects Spotify and can install, repair, or remove Vynyl. In Spotify,
the Vynyl sidebar button opens a built-in catalog with 20 themes, custom
accents and image backgrounds, animated and liquid-glass looks, extensions,
snippets, and quick links.

The extension catalog includes playback shortcuts, focus mode, artwork glow,
a time-based Sleep Timer, playlist filtering, visible-track duration
estimates, current-track copying, and a cosmetic Ad Shield that hides
sponsored cards and promo panels. The Sleep Timer pauses Spotify at the
selected time while the Spotify client remains open. Playlist filtering and
duration estimates only use visible rows. Ad Shield does not skip audio ads or
block network requests.

Quick commands (`Ctrl+K`) and the read-only Duplicate Finder bring Vynyl
versions of ideas found in the Marketplace's [Power Bar](https://github.com/jeroentvb/spicetify-power-bar)
and [Sort-Play](https://github.com/hoeci/sort-play). They are implemented
natively for Vynyl; no Spicetify extension code or runtime is loaded. The
duplicate finder only highlights repeated track links among the currently
visible playlist rows; it does not edit or remove tracks.

These features are implemented natively for Vynyl. The desktop app also offers
an opt-in Spicetify setup that opens the official CLI and Marketplace installer,
then can register Vynyl as a Spicetify extension. This lets users run the
official extension ecosystem without copying Spicetify-dependent scripts into
Vynyl. The setup does not remove existing Spicetify extensions; remove Vynyl
from the app to unregister only its own extension. The Sleep Timer's feature
idea comes from [Theblockbuster1's Marketplace extension](https://github.com/Theblockbuster1/spicetify-extensions/tree/main/SleepTimer).

Vynyl can run standalone by patching Spotify's local UI entry point, or as a
Spicetify-managed extension when you choose that setup in the desktop app.
Spotify updates can replace local changes; use **Repair** in the desktop
manager or rerun the installer if that happens.

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
