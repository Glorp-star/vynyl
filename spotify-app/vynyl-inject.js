(() => {
  if (window.__vynylStarted) return;
  window.__vynylStarted = true;

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
    { id: "peach", name: "Peach Static", note: "Warm low-light tones", colors: palette("#171512", "#241f1b", "#211e19", "#2d2924", "#fff8ef", "#c9bfb4", "#ffb38a") },
    { id: "verdant", name: "Verdant", note: "Quiet botanical green", colors: palette("#101713", "#17231d", "#18241e", "#22332a", "#f1f7e8", "#aebdad", "#b6ef73") },
    { id: "ultramarine", name: "Ultramarine", note: "Deep cobalt midnight", colors: palette("#0d1020", "#171a29", "#161a2a", "#252a40", "#f3f5ff", "#adb4ca", "#82aaff") },
    { id: "paper", name: "Paper Cut", note: "Editorial warm paper", colors: palette("#f4efe4", "#e9e3d7", "#ded6c6", "#fbf8f0", "#1c1b18", "#656158", "#df4d43") },
    { id: "violet", name: "Violet Hour", note: "Soft plum and lilac", colors: palette("#17121c", "#211927", "#211a28", "#30263a", "#f7efff", "#c2b4ca", "#d0a6ff") },
    { id: "afterglow", name: "Afterglow", note: "Rose at blue hour", colors: palette("#1b1319", "#281b23", "#241921", "#38252f", "#fff0f4", "#cbb3bf", "#ff87ad") },
    { id: "glacier", name: "Glacier", note: "Cool air, clear blue", colors: palette("#11191e", "#19242b", "#19252c", "#253640", "#eff9ff", "#aec3ce", "#7edcff") },
    { id: "citrus", name: "Citrus Club", note: "Electric lime and ink", colors: palette("#15180e", "#202515", "#1d2214", "#303921", "#f7ffe9", "#bac6a3", "#d3f66b") },
    { id: "ember", name: "Ember Room", note: "Burnt orange, soft black", colors: palette("#1b1411", "#2a1d17", "#261b16", "#3b2820", "#fff4ea", "#d0b8a8", "#ff8c54") },
    { id: "mono", name: "Monochrome", note: "A quieter kind of contrast", colors: palette("#151515", "#202020", "#1e1e1e", "#2c2c2c", "#f5f5f5", "#b0b0b0", "#e5e5e5") },
    { id: "aurora", name: "Aurora Drift", note: "Slow-moving northern lights", motion: "aurora", colors: palette("#101722", "#182333", "#17212f", "#243244", "#f1f7ff", "#afbed1", "#9bd7d1") },
    { id: "orbit", name: "Orbit", note: "A little motion in the dark", motion: "orbit", colors: palette("#141321", "#1d1b2c", "#1c1a29", "#2b283c", "#f8f4ff", "#bdb5ce", "#b9a2ff") },
    { id: "liquid", name: "Liquid Glass", note: "Translucent, blurred surfaces", glass: true, colors: palette("#151920", "#1c222b", "#1b2028", "#242a34", "#f4f7ff", "#b3bdcc", "#a4c7ff") }
  ];

  const extensions = [
    { id: "track-toast", name: "Now playing toast", note: "A quiet toast when the track changes.", category: "Listening", icon: "♫" },
    { id: "shortcuts", name: "Quick keys", note: "Alt + Shift + P / N / B for playback.", category: "Controls", icon: "⌘" },
    { id: "focus", name: "Focus mode", note: "Hide Spotify side panels while you listen.", category: "Layout", icon: "◫" },
    { id: "ambient", name: "Artwork glow", note: "Let the current album color wash the player.", category: "Visuals", icon: "◉" }
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
    root.classList.toggle("vynyl-focus", activeExtensions.includes("focus"));
    root.classList.toggle("vynyl-ambient", activeExtensions.includes("ambient"));
    root.classList.toggle("vynyl-round-art", activeSnippets.includes("round-art"));
    root.classList.toggle("vynyl-pill-progress", activeSnippets.includes("pill-progress"));
    root.classList.toggle("vynyl-hide-podcast", activeSnippets.includes("hide-podcast"));
    root.classList.toggle("vynyl-soft-cards", activeSnippets.includes("soft-cards"));
    applyWallpaper();
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

  const renderTheme = (theme, selected) => `
    <button class="vynyl-theme-card${selected ? " is-selected" : ""}" data-theme="${theme.id}" aria-pressed="${selected}">
      <span class="vynyl-theme-art${theme.motion ? " is-" + theme.motion : ""}${theme.glass ? " is-glass" : ""}" style="--vynyl-swatch-main:${theme.colors["--vynyl-main"]};--vynyl-swatch-side:${theme.colors["--vynyl-sidebar"]};--vynyl-swatch-accent:${theme.colors["--vynyl-accent"]}">
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
    const matches = (item) => (item.name + " " + item.note).toLowerCase().includes(search.toLowerCase());
    if (activeTab === "Themes") {
      const current = localStorage.getItem("vynyl:theme") || "peach";
      content.innerHTML = `
        <div class="vynyl-section-head"><div><small>Curated for your player</small><h2>Pick a new atmosphere</h2></div><span>${themes.filter(matches).length} looks</span></div>
        <div class="vynyl-theme-grid">${themes.filter(matches).map((theme) => renderTheme(theme, theme.id === current)).join("")}</div>
        <section class="vynyl-customizer">
          <div><small>Make it yours</small><h2>Your own background</h2><p>Choose an accent or use an HTTPS image link you have permission to use.</p></div>
          <div class="vynyl-customizer-controls">
            <label class="vynyl-color-control">Accent <input class="vynyl-color" type="color" value="${localStorage.getItem("vynyl:custom-color") || "#b8a2ff"}" aria-label="Choose a custom accent"></label>
            <div class="vynyl-wallpaper"><input class="vynyl-wallpaper-url" type="url" placeholder="https://… image URL" value="${escapeHtml(localStorage.getItem("vynyl:wallpaper") || "")}"><button class="vynyl-small-button" data-action="wallpaper">Apply</button></div>
          </div>
        </section>`;
    } else if (activeTab === "Extensions") {
      content.innerHTML = `<div class="vynyl-section-head"><div><small>Small upgrades, big difference</small><h2>Extensions</h2></div></div><div class="vynyl-feature-grid">${extensions.filter(matches).map((item) => renderFeature(item, "extensions", activeExtensions.includes(item.id))).join("")}</div>`;
    } else if (activeTab === "Snippets") {
      content.innerHTML = `<div class="vynyl-section-head"><div><small>Details make the vibe</small><h2>Snippets</h2></div></div><div class="vynyl-feature-grid">${snippets.filter(matches).map((item) => renderFeature(item, "snippets", activeSnippets.includes(item.id))).join("")}</div>`;
    } else if (activeTab === "Apps") {
      content.innerHTML = `<div class="vynyl-section-head"><div><small>Your Spotify shortcuts</small><h2>Apps</h2></div></div><div class="vynyl-feature-grid">${destinations.filter(matches).map((item) => `<article class="vynyl-feature-card"><span class="vynyl-feature-icon">${item.icon}</span><span class="vynyl-feature-copy"><small>Spotify destination</small><strong>${item.name}</strong><span>${item.note}</span></span><button class="vynyl-small-button" data-destination="${item.id}">Open</button></article>`).join("")}</div>`;
    } else {
      const current = themes.find((theme) => theme.id === localStorage.getItem("vynyl:theme")) || themes[0];
      const enabledExtensions = extensions.filter((item) => activeExtensions.includes(item.id));
      const enabledSnippets = snippets.filter((item) => activeSnippets.includes(item.id));
      const items = [...enabledExtensions.map((item) => renderFeature(item, "extensions", true)), ...enabledSnippets.map((item) => renderFeature(item, "snippets", true))];
      content.innerHTML = `<div class="vynyl-section-head"><div><small>Your setup</small><h2>Installed</h2></div></div><div class="vynyl-current-theme"><small>Active theme</small><strong>${current.name}</strong><span>Applied in Spotify</span></div>${items.length ? `<div class="vynyl-feature-grid">${items.join("")}</div>` : '<div class="vynyl-empty"><strong>A fresh start</strong><span>Enable an extension or snippet and it will appear here.</span></div>'}`;
    }
  };

  const openPanel = () => {
    if (panel) return;
    panel = document.createElement("section");
    panel.className = "vynyl-panel";
    panel.setAttribute("aria-label", "Vynyl customization");
    panel.innerHTML = `
      <div class="vynyl-panel-shell">
        <header class="vynyl-header">
          <div class="vynyl-heading"><span class="vynyl-mark">V</span><div><small>Your Spotify, remixed</small><h1>Make it yours.</h1></div></div>
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
      root.style.setProperty("--vynyl-accent", color);
      root.style.setProperty("--text-bright-accent", color);
      root.style.setProperty("--text-positive", color);
      root.style.setProperty("--essential-base", color);
      root.style.setProperty("--essential-bright-accent", color);
      root.style.setProperty("--decorative-base", color);
      root.style.setProperty("--decorative-bright-accent", color);
    });
    renderContent();
  };

  const closePanel = () => {
    panel?.remove();
    panel = null;
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
        if (url.protocol !== "https:") throw new Error();
        localStorage.setItem("vynyl:wallpaper", url.href);
        applyWallpaper();
        showToast("Background saved");
      } catch {
        showToast("Enter a valid HTTPS image link.");
      }
    }
  };

  const addSidebarButton = () => {
    const sidebar = document.querySelector('[data-testid="left-sidebar"] nav, .Root__nav-bar, nav[aria-label="Main"], [data-testid="left-sidebar"]');
    if (!sidebar || sidebar.querySelector(".vynyl-sidebar-button")) return;
    const button = document.createElement("button");
    button.className = "vynyl-sidebar-button";
    button.type = "button";
    button.innerHTML = '<span class="vynyl-sidebar-icon">V</span><span>Vynyl</span>';
    button.addEventListener("click", openPanel);
    sidebar.appendChild(button);
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest(".vynyl-sidebar-button")) openPanel();
  });

  document.addEventListener("keydown", (event) => {
    if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey || panel) return;
    if (event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
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
    addSidebarButton();
  }, 1800);

  const observer = new MutationObserver(addSidebarButton);
  observer.observe(document.body, { childList: true, subtree: true });

  const selectedTheme = themes.find((theme) => theme.id === localStorage.getItem("vynyl:theme")) || themes[0];
  applyTheme(selectedTheme);
  refreshEffects();
})();
