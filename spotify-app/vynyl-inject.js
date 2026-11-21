(() => {
  if (window.__vynylStarted) return;

  const palette = (main, sidebar, player, card, text, subtext, accent) => ({
    "--vynyl-main": main,
    "--vynyl-sidebar": sidebar,
    "--vynyl-player": player,
    "--vynyl-card": card,
    "--vynyl-text": text,
    "--vynyl-subtext": subtext,
    "--vynyl-accent": accent,
    "--background-base": main,
    "--background-highlight": player,
    "--background-press": "#000000",
    "--background-elevated-base": sidebar,
    "--background-elevated-highlight": card,
    "--background-elevated-press": player,
    "--background-tinted-base": card,
    "--background-tinted-highlight": card,
    "--background-tinted-press": sidebar,
    "--text-base": text,
    "--text-subdued": subtext,
    "--text-bright-accent": accent,
    "--text-positive": accent,
    "--essential-base": accent,
    "--essential-subdued": subtext,
    "--essential-bright-accent": accent,
    "--decorative-base": accent,
    "--decorative-subdued": subtext,
    "--decorative-bright-accent": accent
  });

  const themes = [
    { id: "peach", name: "Peach Static", note: "Analog warmth with a bright edge", texture: "vinyl", colors: palette("#191519", "#282027", "#241d24", "#352a33", "#fff4ed", "#cbb9b4", "#ff9d83") },
    { id: "verdant", name: "Verdant", note: "Deep green, soft chartreuse", colors: palette("#101713", "#19251e", "#1a251e", "#26372b", "#f1f7e8", "#aebdad", "#c1ed77") },
    { id: "ultramarine", name: "Ultramarine", note: "Cobalt light over midnight", texture: "prism", colors: palette("#101326", "#1a1e35", "#1c203a", "#2a2e4a", "#f3f5ff", "#adb4ca", "#8ba6ff") },
    { id: "paper", name: "Paper Stereo", note: "Warm paper and signal red", texture: "grain", colors: palette("#f1ede4", "#e6e0d5", "#ddd6c9", "#faf7ef", "#211e1a", "#68635d", "#d95146") },
    { id: "violet", name: "Velvet Signal", note: "Plum shadows and electric lilac", colors: palette("#17131f", "#211b2c", "#211c2c", "#30283e", "#f7f2ff", "#c2b7d0", "#b8a3ff") },
    { id: "afterglow", name: "Afterglow", note: "Rose lights after midnight", colors: palette("#1c141b", "#2b1d29", "#281c27", "#3b2837", "#fff0f5", "#ccb4c2", "#ff8dbc") },
    { id: "glacier", name: "Cold Bloom", note: "Ice blue with a mint pulse", colors: palette("#10191f", "#19272e", "#1a2930", "#263b44", "#eff9ff", "#aec3ce", "#83e1d3") },
    { id: "citrus", name: "Citrus Tape", note: "Olive shadow, citrus signal", colors: palette("#17180f", "#252516", "#252417", "#36371f", "#f8f8e9", "#c2c29f", "#e0e46a") },
    { id: "ember", name: "Cinder Room", note: "Low light and warm metal", colors: palette("#1a1413", "#2a1e1b", "#291e1a", "#3b2b26", "#fff3eb", "#ceb7aa", "#f58e69") },
    { id: "mono", name: "Mono Chrome", note: "Silver detail, no noise", texture: "grain", colors: palette("#17181b", "#222327", "#24252a", "#32343a", "#f3f3f5", "#b3b4ba", "#e3d9c9") },
    { id: "aurora", name: "Aurora Drift", note: "Slow northern light motion", motion: "aurora", colors: palette("#111925", "#1a2636", "#192637", "#27384b", "#f1f7ff", "#afbed1", "#9bd7d1") },
    { id: "orbit", name: "Orbit", note: "A moving light in deep space", motion: "orbit", colors: palette("#151322", "#201d31", "#201d30", "#302b43", "#f8f4ff", "#bdb5ce", "#c1a5ff") },
    { id: "liquid", name: "Liquid Glass", note: "Blurred surfaces and cool light", glass: true, colors: palette("#151920", "#1d242d", "#1c232b", "#29313c", "#f4f7ff", "#b3bdcc", "#9bcaff") },
    { id: "midnight", name: "Midnight FM", note: "Indigo ink and a radio-blue glow", colors: palette("#10131e", "#171e2d", "#18202e", "#232e41", "#eef4ff", "#a9b5c9", "#73c7e8") },
    { id: "rose", name: "Cherry Chrome", note: "Black cherry with polished rose", colors: palette("#1c1118", "#291923", "#2b1b26", "#3b2734", "#fff0f6", "#d1b6c3", "#ff7fae") },
    { id: "juniper", name: "Juniper Club", note: "Forest shade and pale jade", colors: palette("#111916", "#19241f", "#192720", "#26362e", "#edf8f1", "#aebeb5", "#8de0bb") },
    { id: "sunset", name: "Sunset Circuit", note: "Blue hour meets warm neon", texture: "prism", colors: palette("#191522", "#241d31", "#282035", "#392941", "#fbf1ff", "#c5b7d1", "#ff966f") },
    { id: "poolside", name: "Poolside", note: "A clean turquoise afternoon", colors: palette("#101b20", "#18292e", "#1b2d31", "#284046", "#effcfa", "#b3c9c7", "#78e1d1") },
    { id: "lavender", name: "Lavender Haze", note: "Soft lilac, deep violet", colors: palette("#171421", "#211d30", "#221f31", "#302c43", "#f6f1ff", "#c0b9d1", "#bea5f5") },
    { id: "golden", name: "Golden Hour", note: "Amber light on dark walnut", texture: "vinyl", colors: palette("#1c1711", "#2a2117", "#2d2418", "#3b3020", "#fff6e8", "#c9bba5", "#f3bd68") }
  ];

  const extensions = [
    { id: "ad-shield", name: "Ad Shield", note: "Hide sponsored cards and promo panels. Audio ads are unchanged.", category: "Listening", icon: "⛨" },
    { id: "track-toast", name: "Now playing", note: "See a small toast when the track changes.", category: "Listening", icon: "♫" },
    { id: "shortcuts", name: "Playback keys", note: "Alt + Shift + P / N / B for playback.", category: "Controls", icon: "⌘" },
    { id: "quick-commands", name: "Quick commands", note: "Press Ctrl + K to search Spotify destinations and playback actions.", category: "Controls", icon: "⌕" },
    { id: "focus", name: "Focus mode", note: "Hide the sidebar footer and right panel.", category: "Layout", icon: "◫" },
    { id: "duplicate-finder", name: "Duplicate finder", note: "Highlight repeated copies among visible tracks.", category: "Library", icon: "⧉" },
    { id: "ambient", name: "Artwork glow", note: "Let the current cover tint the player.", category: "Visuals", icon: "◉" }
  ];

  const snippets = [
    { id: "round-art", name: "Round album art", note: "Give covers a softer silhouette.", category: "Artwork", icon: "◯" },
    { id: "pill-progress", name: "Pill-shaped progress", note: "Round off the seek bar and volume.", category: "Player", icon: "━" },
    { id: "hide-podcast", name: "Hide podcast shelves", note: "Quiet the home page and focus on music.", category: "Home", icon: "⌂" },
    { id: "soft-cards", name: "Soft playlist cards", note: "Add a little depth to playlist tiles.", category: "Home", icon: "▦" }
  ];

  const destinations = [
    { id: "home", name: "Home", note: "Your mixes, recents and recommendations.", icon: "⌂" },
    { id: "liked", name: "Liked Songs", note: "Jump to the tracks you saved.", icon: "♥" },
    { id: "queue", name: "Queue", note: "See what plays next.", icon: "≡" },
    { id: "search", name: "Search", note: "Find a track, artist or playlist.", icon: "⌕" }
  ];

  const root = document.documentElement;
  const themeProperties = Object.keys(themes[0].colors);
  const originalThemeStyles = new Map(themeProperties.map((name) => [name, root.style.getPropertyValue(name)]));
  const readList = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem("vynyl:" + key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      console.warn(`Vynyl could not read saved ${key}; resetting it.`);
      localStorage.removeItem("vynyl:" + key);
      return [];
    }
  };
  const writeList = (key, items) => localStorage.setItem("vynyl:" + key, JSON.stringify(items));
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const applyTheme = (theme) => {
    Object.entries(theme.colors).forEach(([name, value]) => root.style.setProperty(name, value));
    localStorage.setItem("vynyl:theme", theme.id);
    root.dataset.vynylMotion = theme.motion || "none";
    root.dataset.vynylGlass = String(Boolean(theme.glass));
    const customAccent = localStorage.getItem("vynyl:custom-color") || "";
    if (/^#[0-9a-f]{6}$/i.test(customAccent)) applyAccent(customAccent);
  };

  const applyAccent = (color) => {
    for (const name of ["--vynyl-accent", "--text-bright-accent", "--text-positive", "--essential-base", "--essential-bright-accent", "--decorative-base", "--decorative-bright-accent"]) {
      root.style.setProperty(name, color);
    }
  };

  const restoreTheme = () => {
    for (const [name, value] of originalThemeStyles) {
      if (value) root.style.setProperty(name, value);
      else root.style.removeProperty(name);
    }
    localStorage.removeItem("vynyl:theme");
    localStorage.removeItem("vynyl:custom-color");
    delete root.dataset.vynylMotion;
    delete root.dataset.vynylGlass;
  };

  const showToast = (message) => {
    let toast = document.querySelector(".vynyl-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "vynyl-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  };

  const refreshEffects = () => {
    const activeExtensions = readList("extensions");
    const activeSnippets = readList("snippets");
    const adShieldEnabled = activeExtensions.includes("ad-shield");
    const adShieldWasEnabled = root.classList.contains("vynyl-ad-shield");
    const duplicateFinderEnabled = activeExtensions.includes("duplicate-finder");
    const duplicateFinderWasEnabled = root.classList.contains("vynyl-duplicate-finder");
    root.classList.toggle("vynyl-ad-shield", adShieldEnabled);
    root.classList.toggle("vynyl-focus", activeExtensions.includes("focus"));
    root.classList.toggle("vynyl-duplicate-finder", duplicateFinderEnabled);
    root.classList.toggle("vynyl-ambient", activeExtensions.includes("ambient"));
    root.classList.toggle("vynyl-round-art", activeSnippets.includes("round-art"));
    root.classList.toggle("vynyl-pill-progress", activeSnippets.includes("pill-progress"));
    root.classList.toggle("vynyl-hide-podcast", activeSnippets.includes("hide-podcast"));
    root.classList.toggle("vynyl-soft-cards", activeSnippets.includes("soft-cards"));
    if (adShieldEnabled) markSponsoredContent();
    else if (adShieldWasEnabled) document.querySelectorAll("[data-vynyl-promo-hidden]").forEach((node) => node.removeAttribute("data-vynyl-promo-hidden"));
    if (duplicateFinderEnabled) markDuplicateTracks();
    else if (duplicateFinderWasEnabled) clearDuplicateMarkers();
    applyWallpaper();
  };

  const markSponsoredContent = () => {
    if (!root.classList.contains("vynyl-ad-shield")) return;

    const selectors = [
      "#advertiser-info",
      '[data-testid*="sponsor" i]',
      '[data-testid*="ad-" i]',
      '[aria-label="Advertisement" i]',
      '[aria-label^="Sponsored" i]',
      '[data-testid="PanelHeader_AdContextMenuButton"]'
    ];
    const candidates = new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]));
    for (const heading of document.querySelectorAll("h1, h2, h3")) {
      if (/^(sponsored playlists?|sponsored content|advertisement)$/i.test(heading.textContent.trim())) candidates.add(heading);
    }

    for (const node of candidates) {
      if (node.closest(".vynyl-panel")) continue;
      let container = node.closest("article, section, [data-testid*='sponsor' i], [data-testid*='ad-' i]");
      if (!container && node.id === "advertiser-info") container = node;
      if (!container && /^(sponsored playlists?|sponsored content)$/i.test(node.textContent.trim())) {
        container = node.closest("section") || node.parentElement?.parentElement;
      }
      if (container && !container.closest(".vynyl-panel")) container.setAttribute("data-vynyl-promo-hidden", "true");
    }
  };

  const clearDuplicateMarkers = () => {
    document.querySelectorAll("[data-vynyl-duplicate]").forEach((row) => row.removeAttribute("data-vynyl-duplicate"));
  };

  const markDuplicateTracks = () => {
    if (!root.classList.contains("vynyl-duplicate-finder")) return;
    clearDuplicateMarkers();
    const rows = [...document.querySelectorAll('[data-testid="tracklist-row"], .main-trackList-trackListRow')]
      .filter((row) => !row.closest(".vynyl-panel"));
    const tracks = rows.map((row) => {
      const href = row.querySelector('a[href*="/track/"]')?.getAttribute("href") || "";
      const key = href.match(/\/track\/([^/?#]+)/i)?.[1] || "";
      return { row, key };
    }).filter((track) => track.key);
    const counts = new Map();
    tracks.forEach(({ key }) => counts.set(key, (counts.get(key) || 0) + 1));
    tracks.forEach(({ row, key }) => {
      if (counts.get(key) > 1) row.setAttribute("data-vynyl-duplicate", "true");
    });
  };

  const applyWallpaper = () => {
    const value = localStorage.getItem("vynyl:wallpaper") || "";
    const backdrop = document.querySelector(".vynyl-ambient-backdrop");
    root.dataset.vynylWallpaper = String(Boolean(value));
    if (!backdrop) return;
    if (!value) {
      backdrop.style.removeProperty("--vynyl-wallpaper");
      return;
    }
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "https:") {
        backdrop.style.setProperty("--vynyl-wallpaper", `url("${parsed.href.replace(/["\\\n\r]/g, "")}")`);
      }
    } catch {
      localStorage.removeItem("vynyl:wallpaper");
      showToast("Saved background link was invalid and has been cleared.");
    }
  };

  const updateArtwork = () => {
    if (!root.classList.contains("vynyl-ambient")) return;
    const image = document.querySelector('[data-testid="now-playing-widget"] img, .main-nowPlayingWidget-coverArt img');
    const source = image?.currentSrc || image?.src || "";
    const backdrop = document.querySelector(".vynyl-ambient-backdrop");
    if (source.startsWith("https://") && backdrop) {
      backdrop.style.setProperty("--vynyl-artwork", `url("${source.replace(/["\\\n\r]/g, "")}")`);
    }
  };

  const app = document.createElement("div");
  app.className = "vynyl-ambient-backdrop";
  document.body.prepend(app);

  let activeTab = "Themes";
  let search = "";
  let panel;
  let commandBar;
  let commandBarReturnFocus;
  let commandSearch = "";
  let commandSelection = 0;
  let panelReturnFocus;

  const renderTheme = (theme, selected) => `
    <button class="vynyl-theme-card${selected ? " is-selected" : ""}" data-theme="${theme.id}" aria-pressed="${selected}">
      <span class="vynyl-theme-art${theme.motion ? " is-" + theme.motion : ""}${theme.glass ? " is-glass" : ""}${theme.texture ? " is-" + theme.texture : ""}" style="--vynyl-swatch-main:${theme.colors["--vynyl-main"]};--vynyl-swatch-side:${theme.colors["--vynyl-sidebar"]};--vynyl-swatch-accent:${theme.colors["--vynyl-accent"]}">
        <span class="vynyl-theme-side"></span><span class="vynyl-theme-accent"></span><span class="vynyl-theme-lines"></span>
        ${theme.motion ? '<span class="vynyl-motion-tag">Motion</span>' : ""}
        ${theme.glass ? '<span class="vynyl-motion-tag">Glass</span>' : ""}
      </span>
      <span class="vynyl-theme-info"><span><strong>${theme.name}</strong><small>${theme.note}</small></span>${selected ? '<span class="vynyl-selected-mark">✓</span>' : ""}</span>
    </button>`;

  const renderFeature = (item, kind, active) => `
    <article class="vynyl-feature-card">
      <span class="vynyl-feature-icon">${item.icon}</span>
      <span class="vynyl-feature-copy"><small>${item.category}</small><strong>${item.name}</strong><span>${item.note}</span></span>
      <button class="vynyl-toggle${active ? " is-on" : ""}" data-toggle="${kind}" data-id="${item.id}" role="switch" aria-checked="${active}" aria-label="${active ? "Disable " : "Enable "}${item.name}"><span></span></button>
    </article>`;

  const renderContent = () => {
    if (!panel) return;
    const content = panel.querySelector(".vynyl-content");
    const activeExtensions = readList("extensions");
    const activeSnippets = readList("snippets");
    const matches = (item) => [item.name, item.note, item.category].join(" ").toLowerCase().includes(search.toLowerCase());
    const emptyState = '<div class="vynyl-empty"><strong>No matches</strong><span>Try another search or clear the search field.</span></div>';
    if (activeTab === "Themes") {
      const current = localStorage.getItem("vynyl:theme") || "";
      const filteredThemes = themes.filter(matches);
      const savedColor = localStorage.getItem("vynyl:custom-color") || "#b8a2ff";
      content.innerHTML = `
        <div class="vynyl-section-head"><div><small>20 palettes, built for long listening</small><h2>Set the room tone.</h2></div><span>${filteredThemes.length} themes</span></div>
        ${filteredThemes.length ? `<div class="vynyl-theme-grid">${filteredThemes.map((theme) => renderTheme(theme, theme.id === current)).join("")}</div>` : emptyState}
        <div class="vynyl-theme-actions"><span>${current ? `Using ${themes.find((theme) => theme.id === current)?.name || "a custom look"}` : "Using Spotify's original look"}</span><button class="vynyl-small-button vynyl-restore-theme" data-action="restore-theme">Restore Spotify look</button></div>
        <section class="vynyl-customizer">
          <div><small>Personal touches</small><h2>Accent and background</h2><p>Use your own accent color or an HTTPS image you have permission to use.</p></div>
          <div class="vynyl-customizer-controls">
            <label class="vynyl-color-control">Accent <input class="vynyl-color" type="color" value="${escapeHtml(savedColor)}" aria-label="Choose a custom accent"></label>
            <div class="vynyl-wallpaper"><input class="vynyl-wallpaper-url" type="url" placeholder="https://… image URL" value="${escapeHtml(localStorage.getItem("vynyl:wallpaper") || "")}"><button class="vynyl-small-button" data-action="wallpaper">Apply</button></div>
          </div>
        </section>`;
    } else if (activeTab === "Extensions") {
      const filteredExtensions = extensions.filter(matches);
      content.innerHTML = `<div class="vynyl-section-head"><div><small>Playback, layout, and listening controls</small><h2>Extensions</h2></div><span>${activeExtensions.length} enabled</span></div>${filteredExtensions.length ? `<div class="vynyl-feature-grid">${filteredExtensions.map((item) => renderFeature(item, "extensions", activeExtensions.includes(item.id))).join("")}</div>` : emptyState}<p class="vynyl-catalog-note">Ad Shield hides sponsored cards and promo panels only. It does not skip audio ads or block network requests.</p>`;
    } else if (activeTab === "Snippets") {
      const filteredSnippets = snippets.filter(matches);
      content.innerHTML = `<div class="vynyl-section-head"><div><small>Small changes to the surfaces you use</small><h2>Snippets</h2></div><span>${activeSnippets.length} enabled</span></div>${filteredSnippets.length ? `<div class="vynyl-feature-grid">${filteredSnippets.map((item) => renderFeature(item, "snippets", activeSnippets.includes(item.id))).join("")}</div>` : emptyState}`;
    } else if (activeTab === "Apps") {
      const filteredDestinations = destinations.filter(matches);
      content.innerHTML = `<div class="vynyl-section-head"><div><small>Jump straight to a Spotify destination</small><h2>Quick links</h2></div></div>${filteredDestinations.length ? `<div class="vynyl-feature-grid">${filteredDestinations.map((item) => `<article class="vynyl-feature-card"><span class="vynyl-feature-icon">${item.icon}</span><span class="vynyl-feature-copy"><small>Spotify destination</small><strong>${item.name}</strong><span>${item.note}</span></span><button class="vynyl-small-button" data-destination="${item.id}">Open</button></article>`).join("")}</div>` : emptyState}`;
    } else {
      const current = themes.find((theme) => theme.id === localStorage.getItem("vynyl:theme"));
      const enabledExtensions = extensions.filter((item) => activeExtensions.includes(item.id));
      const enabledSnippets = snippets.filter((item) => activeSnippets.includes(item.id));
      const items = [...enabledExtensions.map((item) => renderFeature(item, "extensions", true)), ...enabledSnippets.map((item) => renderFeature(item, "snippets", true))];
      content.innerHTML = `<div class="vynyl-section-head"><div><small>Your current Vynyl setup</small><h2>Installed</h2></div></div><div class="vynyl-current-theme"><small>Active theme</small><strong>${current?.name || "Spotify original"}</strong><span>${current ? "Applied in Spotify" : "No Vynyl theme is overriding Spotify"}</span></div>${items.length ? `<div class="vynyl-feature-grid">${items.join("")}</div>` : '<div class="vynyl-empty"><strong>Nothing switched on</strong><span>Pick a theme or enable an extension to shape your player.</span></div>'}`;
    }
  };

  const openPanel = () => {
    if (panel) return;
    panel = document.createElement("section");
    panel.className = "vynyl-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Vynyl customization");
    panel.innerHTML = `
      <div class="vynyl-panel-shell">
        <header class="vynyl-header">
          <div class="vynyl-heading"><span class="vynyl-mark"><span>V</span></span><div><small>Your Spotify, remixed</small><h1>Set your frequency.</h1></div></div>
          <div class="vynyl-header-actions"><label class="vynyl-search"><span>⌕</span><input type="search" placeholder="Find a look or feature" aria-label="Search Vynyl"></label><button class="vynyl-close" aria-label="Close Vynyl">×</button></div>
        </header>
        <nav class="vynyl-tabs" aria-label="Vynyl categories"></nav>
        <main class="vynyl-content"></main>
      </div>`;
    document.body.appendChild(panel);
    const nav = panel.querySelector(".vynyl-tabs");
    ["Extensions", "Themes", "Snippets", "Apps", "Installed"].forEach((tab) => {
      const button = document.createElement("button");
      button.textContent = tab;
      button.dataset.tab = tab;
      button.className = tab === activeTab ? "is-active" : "";
      nav.appendChild(button);
    });
    panel.addEventListener("click", handlePanelClick);
    panel.querySelector(".vynyl-search input").addEventListener("input", (event) => {
      search = event.target.value;
      renderContent();
    });
    panel.querySelector(".vynyl-content").addEventListener("input", (event) => {
      if (!event.target.matches(".vynyl-color")) return;
      const color = event.target.value;
      localStorage.setItem("vynyl:custom-color", color);
      applyAccent(color);
    });
    renderContent();
    panelReturnFocus = document.activeElement;
    panel.querySelector(".vynyl-search input").focus();
  };

  const closePanel = () => {
    const returnFocus = panelReturnFocus;
    panel?.remove();
    panel = null;
    panelReturnFocus = null;
    returnFocus?.focus();
  };

  const goToDestination = (id) => {
    const selectors = {
      home: 'a[href="/"], a[aria-label="Home"]',
      liked: 'a[href="/collection/tracks"], a[aria-label*="Liked Songs"]',
      queue: '[data-testid="control-button-queue"]',
      search: 'a[href="/search"], a[aria-label="Search"]'
    };
    const target = document.querySelector(selectors[id]);
    if (target) {
      closePanel();
      target.click();
    } else {
      showToast("That Spotify destination is not available in this layout.");
    }
  };

  const commandActions = [
    { id: "open-vynyl", label: "Open Vynyl", detail: "Browse themes, extensions, and snippets", keywords: "studio settings" },
    { id: "open-themes", label: "Browse themes", detail: "Choose a new Spotify look", keywords: "colors glass motion" },
    { id: "open-extensions", label: "Manage extensions", detail: "Turn Vynyl features on or off", keywords: "addons tools" },
    { id: "home", label: "Go to Home", detail: "Open your Spotify home page", keywords: "navigate" },
    { id: "search", label: "Go to Search", detail: "Find music in Spotify", keywords: "navigate" },
    { id: "liked", label: "Open Liked Songs", detail: "Go to your saved tracks", keywords: "navigate library" },
    { id: "queue", label: "Open Queue", detail: "See what plays next", keywords: "navigate" },
    { id: "play-pause", label: "Play or pause", detail: "Toggle playback", keywords: "player" },
    { id: "next", label: "Play next track", detail: "Skip forward", keywords: "player skip" },
    { id: "previous", label: "Play previous track", detail: "Skip back", keywords: "player skip" },
    { id: "ad-shield", label: "Toggle Ad Shield", detail: "Hide or show sponsored panels", keywords: "extension ads" },
    { id: "focus", label: "Toggle Focus mode", detail: "Hide or show the sidebar footer and right panel", keywords: "extension layout" }
  ];

  const matchingCommands = () => {
    const query = commandSearch.trim().toLowerCase();
    return commandActions.filter((item) => `${item.label} ${item.detail} ${item.keywords}`.toLowerCase().includes(query));
  };

  const renderCommandResults = () => {
    if (!commandBar) return;
    const results = matchingCommands();
    commandSelection = Math.min(commandSelection, Math.max(0, results.length - 1));
    const list = commandBar.querySelector(".vynyl-command-results");
    list.innerHTML = results.length
      ? results.map((item, index) => `<button id="vynyl-command-option-${item.id}" class="vynyl-command-option${index === commandSelection ? " is-selected" : ""}" data-command="${item.id}" role="option" aria-selected="${index === commandSelection}"><span><strong>${item.label}</strong><small>${item.detail}</small></span><kbd>Enter</kbd></button>`).join("")
      : '<div class="vynyl-command-empty">No matching commands</div>';
    const input = commandBar.querySelector(".vynyl-command-search input");
    if (results.length) input.setAttribute("aria-activedescendant", `vynyl-command-option-${results[commandSelection].id}`);
    else input.removeAttribute("aria-activedescendant");
  };

  const closeCommandBar = () => {
    const returnFocus = commandBarReturnFocus;
    commandBar?.remove();
    commandBar = null;
    commandBarReturnFocus = null;
    returnFocus?.focus();
  };

  const openCommandBar = () => {
    if (commandBar || panel) return;
    commandSearch = "";
    commandSelection = 0;
    commandBar = document.createElement("section");
    commandBar.className = "vynyl-command-overlay";
    commandBar.setAttribute("role", "dialog");
    commandBar.setAttribute("aria-modal", "true");
    commandBar.setAttribute("aria-label", "Quick commands");
    commandBar.innerHTML = `
      <div class="vynyl-command-box">
        <label class="vynyl-command-search"><span>⌕</span><input type="search" aria-label="Search commands" aria-controls="vynyl-command-results" placeholder="Search destinations and actions"><kbd>Esc</kbd></label>
        <div class="vynyl-command-results" id="vynyl-command-results" role="listbox" aria-label="Commands"></div>
        <footer class="vynyl-command-hint"><span><kbd>↑</kbd><kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to run</span></footer>
      </div>`;
    commandBarReturnFocus = document.activeElement;
    commandBar.addEventListener("click", (event) => {
      event.stopPropagation();
      const option = event.target.closest("[data-command]");
      if (option) runCommand(option.dataset.command);
      else if (event.target === commandBar) closeCommandBar();
    });
    commandBar.querySelector(".vynyl-command-search input").addEventListener("input", (event) => {
      commandSearch = event.target.value;
      commandSelection = 0;
      renderCommandResults();
    });
    document.body.appendChild(commandBar);
    renderCommandResults();
    commandBar.querySelector(".vynyl-command-search input").focus();
  };

  const runCommand = (id) => {
    closeCommandBar();
    if (id === "open-vynyl" || id === "open-themes" || id === "open-extensions") {
      activeTab = id === "open-themes" ? "Themes" : id === "open-extensions" ? "Extensions" : activeTab;
      search = "";
      openPanel();
      return;
    }
    if (["home", "search", "liked", "queue"].includes(id)) {
      goToDestination(id);
      return;
    }
    const playbackSelectors = {
      "play-pause": '[data-testid="control-button-playpause"]',
      next: '[data-testid="control-button-skip-forward"]',
      previous: '[data-testid="control-button-skip-back"]'
    };
    if (playbackSelectors[id]) {
      const control = document.querySelector(playbackSelectors[id]);
      if (control) control.click();
      else showToast("That playback control is not available in this layout.");
      return;
    }
    const extensionNames = { "ad-shield": "Ad Shield", focus: "Focus mode" };
    if (extensionNames[id]) {
      const enabled = !readList("extensions").includes(id);
      const current = readList("extensions");
      writeList("extensions", enabled ? current.concat(id) : current.filter((value) => value !== id));
      refreshEffects();
      showToast(`${extensionNames[id]} ${enabled ? "enabled" : "disabled"}`);
    }
  };

  const handlePanelClick = (event) => {
    const tabButton = event.target.closest("[data-tab]");
    if (tabButton) {
      activeTab = tabButton.dataset.tab;
      panel.querySelectorAll(".vynyl-tabs button").forEach((button) => button.classList.toggle("is-active", button === tabButton));
      renderContent();
      return;
    }
    if (event.target.closest(".vynyl-close")) {
      closePanel();
      return;
    }
    if (event.target.closest("[data-action='restore-theme']")) {
      restoreTheme();
      refreshEffects();
      renderContent();
      showToast("Spotify's original look restored");
      return;
    }
    const themeButton = event.target.closest("[data-theme]");
    if (themeButton) {
      const theme = themes.find((item) => item.id === themeButton.dataset.theme);
      if (theme) {
        applyTheme(theme);
        renderContent();
      }
      return;
    }
    const toggle = event.target.closest("[data-toggle]");
    if (toggle) {
      const key = toggle.dataset.toggle;
      const id = toggle.dataset.id;
      const current = readList(key);
      writeList(key, current.includes(id) ? current.filter((value) => value !== id) : current.concat(id));
      refreshEffects();
      renderContent();
      return;
    }
    const destination = event.target.closest("[data-destination]");
    if (destination) {
      goToDestination(destination.dataset.destination);
      return;
    }
    if (event.target.closest("[data-action='wallpaper']")) {
      const input = panel.querySelector(".vynyl-wallpaper-url");
      const value = input.value.trim();
      if (!value) {
        localStorage.removeItem("vynyl:wallpaper");
        applyWallpaper();
        showToast("Custom background cleared");
        return;
      }
      try {
        const url = new URL(value);
        if (url.protocol !== "https:") throw new Error("Use an HTTPS image link.");
        localStorage.setItem("vynyl:wallpaper", url.href);
        applyWallpaper();
        showToast("Background saved");
      } catch (error) {
        showToast(error.message || "Enter a valid HTTPS image link.");
      }
    }
  };

  const addSidebarButton = () => {
    if (document.querySelector(".vynyl-sidebar-button")) return true;
    const footer = document.querySelector('[data-testid="left-sidebar-footer"]');
    const legalLinks = document.querySelector('[data-testid="left-sidebar-legal-links"]');
    const sidebar = document.querySelector('[data-testid="left-sidebar"] nav, .Root__nav-bar, nav[aria-label="Main"], [data-testid="left-sidebar"]')
      || footer?.parentElement
      || legalLinks?.parentElement?.parentElement;
    if (!sidebar) return false;
    const button = document.createElement("button");
    button.className = "vynyl-sidebar-button";
    button.type = "button";
    button.setAttribute("aria-label", "Open Vynyl");
    button.innerHTML = '<span class="vynyl-sidebar-icon">V</span><span>Vynyl</span>';
    button.addEventListener("click", openPanel);
    if (footer?.parentElement === sidebar) sidebar.insertBefore(button, footer);
    else sidebar.appendChild(button);
    return true;
  };

  document.addEventListener("keydown", (event) => {
    if (commandBar) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeCommandBar();
      } else if (event.code === "ArrowDown" || event.code === "ArrowUp") {
        const count = matchingCommands().length;
        if (count) commandSelection = (commandSelection + (event.code === "ArrowDown" ? 1 : count - 1)) % count;
        renderCommandResults();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.code === "Enter") {
        const selected = matchingCommands()[commandSelection];
        if (selected) {
          event.preventDefault();
          event.stopPropagation();
          runCommand(selected.id);
        }
      }
      return;
    }
    if (event.key === "Escape" && panel) {
      closePanel();
      return;
    }
    if (event.code === "KeyK" && event.ctrlKey && !event.altKey && !event.metaKey && !panel
      && !(event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']"))
      && readList("extensions").includes("quick-commands")) {
      event.preventDefault();
      event.stopPropagation();
      openCommandBar();
      return;
    }
    if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey || panel) return;
    if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
    if (!readList("extensions").includes("shortcuts")) return;
    const selector = {
      KeyP: '[data-testid="control-button-playpause"]',
      KeyN: '[data-testid="control-button-skip-forward"]',
      KeyB: '[data-testid="control-button-skip-back"]'
    }[event.code];
    const control = selector && document.querySelector(selector);
    if (!control) return;
    control.click();
    event.preventDefault();
    event.stopPropagation();
  }, true);

  let lastTrack = "";
  setInterval(() => {
    if (readList("extensions").includes("track-toast")) {
      const title = document.querySelector('[data-testid="context-item-info-title"], .main-trackInfo-name')?.textContent?.trim() || "";
      const artist = document.querySelector('[data-testid="context-item-info-artist"], .main-trackInfo-artists')?.textContent?.trim() || "";
      const key = title + artist;
      if (title && key !== lastTrack) {
        if (lastTrack) showToast(artist ? `${title} · ${artist}` : title);
        lastTrack = key;
      }
    }
    if (root.classList.contains("vynyl-ambient")) updateArtwork();
  }, 1800);

  let enhancementTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(enhancementTimer);
    enhancementTimer = setTimeout(() => {
      addSidebarButton();
      if (root.classList.contains("vynyl-ad-shield")) markSponsoredContent();
      if (root.classList.contains("vynyl-duplicate-finder")) markDuplicateTracks();
    }, 160);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  addSidebarButton();
  markSponsoredContent();
  markDuplicateTracks();

  const selectedTheme = themes.find((theme) => theme.id === localStorage.getItem("vynyl:theme"));
  if (selectedTheme) applyTheme(selectedTheme);
  else {
    localStorage.removeItem("vynyl:theme");
    delete root.dataset.vynylMotion;
    delete root.dataset.vynylGlass;
  }
  refreshEffects();
  window.__vynylStarted = true;
})();
