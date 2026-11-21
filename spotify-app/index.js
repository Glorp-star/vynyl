const vynylPalette = (main, sidebar, player, card, text, subtext, accent) => ({
  "--spice-main": main,
  "--spice-sidebar": sidebar,
  "--spice-player": player,
  "--spice-card": card,
  "--spice-shadow": "#09090b",
  "--spice-text": text,
  "--spice-subtext": subtext,
  "--spice-selected-row": accent,
  "--spice-button": accent,
  "--spice-button-active": accent,
  "--spice-button-disabled": subtext,
  "--spice-tab-active": accent,
  "--spice-misc": subtext
});

const vynylThemes = [
  { id: "peach", name: "Peach Static", note: "Warm low-light tones", colors: vynylPalette("#171512", "#241f1b", "#211e19", "#2d2924", "#fff8ef", "#c9bfb4", "#ffb38a") },
  { id: "verdant", name: "Verdant", note: "Quiet botanical green", colors: vynylPalette("#101713", "#17231d", "#18241e", "#22332a", "#f1f7e8", "#aebdad", "#b6ef73") },
  { id: "ultramarine", name: "Ultramarine", note: "Deep cobalt midnight", colors: vynylPalette("#0d1020", "#171a29", "#161a2a", "#252a40", "#f3f5ff", "#adb4ca", "#82aaff") },
  { id: "paper", name: "Paper Cut", note: "Editorial warm paper", colors: vynylPalette("#f4efe4", "#e9e3d7", "#ded6c6", "#fbf8f0", "#1c1b18", "#656158", "#df4d43") },
  { id: "violet", name: "Violet Hour", note: "Soft plum and lilac", colors: vynylPalette("#17121c", "#211927", "#211a28", "#30263a", "#f7efff", "#c2b4ca", "#d0a6ff") },
  { id: "afterglow", name: "Afterglow", note: "Rose at blue hour", colors: vynylPalette("#1b1319", "#281b23", "#241921", "#38252f", "#fff0f4", "#cbb3bf", "#ff87ad") },
  { id: "glacier", name: "Glacier", note: "Cool air, clear blue", colors: vynylPalette("#11191e", "#19242b", "#19252c", "#253640", "#eff9ff", "#aec3ce", "#7edcff") },
  { id: "citrus", name: "Citrus Club", note: "Electric lime and ink", colors: vynylPalette("#15180e", "#202515", "#1d2214", "#303921", "#f7ffe9", "#bac6a3", "#d3f66b") },
  { id: "ember", name: "Ember Room", note: "Burnt orange, soft black", colors: vynylPalette("#1b1411", "#2a1d17", "#261b16", "#3b2820", "#fff4ea", "#d0b8a8", "#ff8c54") },
  { id: "mono", name: "Monochrome", note: "A quieter kind of contrast", colors: vynylPalette("#151515", "#202020", "#1e1e1e", "#2c2c2c", "#f5f5f5", "#b0b0b0", "#e5e5e5") },
  { id: "aurora", name: "Aurora Drift", note: "Slow-moving northern lights", motion: "aurora", colors: vynylPalette("#101722", "#182333", "#17212f", "#243244", "#f1f7ff", "#afbed1", "#9bd7d1") },
  { id: "orbit", name: "Orbit", note: "A little motion in the dark", motion: "orbit", colors: vynylPalette("#141321", "#1d1b2c", "#1c1a29", "#2b283c", "#f8f4ff", "#bdb5ce", "#b9a2ff") },
  { id: "liquid", name: "Liquid Glass", note: "Translucent, blurred surfaces", glass: true, colors: vynylPalette("#151920", "#1c222b", "#1b2028", "#242a34", "#f4f7ff", "#b3bdcc", "#a4c7ff") }
];

const vynylExtensions = [
  { id: "track-toast", name: "Now playing toast", note: "A quiet toast when the track changes.", category: "Listening", icon: "♫" },
  { id: "shortcuts", name: "Quick keys", note: "Alt + Shift + P / N / B for playback.", category: "Controls", icon: "⌘" },
  { id: "focus", name: "Focus mode", note: "Hide Spotify side panels while you listen.", category: "Layout", icon: "◫" },
  { id: "ambient", name: "Artwork glow", note: "Let the current album color wash the player.", category: "Visuals", icon: "◉" }
];

const vynylSnippets = [
  { id: "round-art", name: "Round album art", note: "Give covers a softer silhouette.", cssClass: "vynyl-round-art" },
  { id: "pill-progress", name: "Pill-shaped progress", note: "Round off the seek bar and volume.", cssClass: "vynyl-pill-progress" },
  { id: "hide-podcast", name: "Hide podcast shelves", note: "Quiet the home page and focus on music.", cssClass: "vynyl-hide-podcast" },
  { id: "soft-cards", name: "Soft playlist cards", note: "Add a little depth to playlist tiles.", cssClass: "vynyl-soft-cards" }
];

const vynylBuiltInApps = [
  { id: "lyrics-plus", name: "Lyrics Plus", note: "A full lyrics app with synced lyrics and providers.", source: "Spicetify built-in" },
  { id: "new-releases", name: "New Releases", note: "A home for new music from artists you follow.", source: "Spicetify built-in" },
  { id: "reddit", name: "Reddit", note: "Music communities, right in Spotify.", source: "Spicetify built-in" }
];

const vynylLoadList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const vynylSignalRuntime = () => {
  window.dispatchEvent(new Event("vynyl:settings-changed"));
};

const vynylApplyTheme = (theme) => {
  Object.entries(theme.colors).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });
  localStorage.setItem("vynyl:theme", theme.id);
  localStorage.setItem("vynyl:motion", theme.motion || "none");
  localStorage.setItem("vynyl:glass", theme.glass ? "true" : "false");
  vynylSignalRuntime();
};

function VynylToggle(props) {
  return Spicetify.React.createElement(
    "button",
    {
      className: "vynyl-toggle" + (props.enabled ? " is-on" : ""),
      onClick: props.onClick,
      role: "switch",
      "aria-checked": props.enabled,
      "aria-label": props.label
    },
    Spicetify.React.createElement("span")
  );
}

function VynylCard(props) {
  return Spicetify.React.createElement(
    "article",
    { className: "vynyl-card" + (props.featured ? " is-featured" : "") },
    props.cover
      ? Spicetify.React.createElement("div", { className: "vynyl-card-cover " + (props.coverClass || ""), style: props.coverStyle || {} },
          Spicetify.React.createElement("span", { className: "vynyl-card-glyph" }, props.glyph || "◌"),
          props.badge ? Spicetify.React.createElement("span", { className: "vynyl-card-badge" }, props.badge) : null)
      : null,
    Spicetify.React.createElement(
      "div",
      { className: "vynyl-card-copy" },
      Spicetify.React.createElement("span", { className: "vynyl-card-category" }, props.category || "Vynyl"),
      Spicetify.React.createElement("h3", null, props.title),
      Spicetify.React.createElement("p", null, props.note)
    ),
    props.action
      ? Spicetify.React.createElement("div", { className: "vynyl-card-action" }, props.action)
      : null
  );
}

function VynylPage() {
  const [tab, setTab] = Spicetify.React.useState("Themes");
  const [selected, setSelected] = Spicetify.React.useState(localStorage.getItem("vynyl:theme") || "peach");
  const [query, setQuery] = Spicetify.React.useState("");
  const [extensions, setExtensions] = Spicetify.React.useState(() => vynylLoadList("vynyl:extensions"));
  const [snippets, setSnippets] = Spicetify.React.useState(() => vynylLoadList("vynyl:snippets"));
  const [wallpaper, setWallpaper] = Spicetify.React.useState(localStorage.getItem("vynyl:wallpaper") || "");
  const [wallpaperDraft, setWallpaperDraft] = Spicetify.React.useState(localStorage.getItem("vynyl:wallpaper") || "");
  const [customColor, setCustomColor] = Spicetify.React.useState(localStorage.getItem("vynyl:custom-color") || "#b8a2ff");
  const [notice, setNotice] = Spicetify.React.useState("");

  Spicetify.React.useEffect(() => {
    const theme = vynylThemes.find((item) => item.id === selected);
    if (theme) {
      vynylApplyTheme(theme);
    } else if (selected === "custom") {
      vynylApplyTheme({
        id: "custom",
        colors: vynylPalette("#17151e", "#211e2a", "#211e29", "#302b3b", "#f8f4ff", "#c1b8cf", localStorage.getItem("vynyl:custom-color") || "#b8a2ff")
      });
    }
  }, [selected]);

  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const toggleItem = (type, id) => {
    const setter = type === "extensions" ? setExtensions : setSnippets;
    const current = type === "extensions" ? extensions : snippets;
    const next = current.includes(id) ? current.filter((value) => value !== id) : current.concat(id);
    setter(next);
    localStorage.setItem("vynyl:" + type, JSON.stringify(next));
    vynylSignalRuntime();
  };

  const applyCustomColor = (value) => {
    setCustomColor(value);
    localStorage.setItem("vynyl:custom-color", value);
    const custom = {
      id: "custom",
      colors: vynylPalette("#17151e", "#211e2a", "#211e29", "#302b3b", "#f8f4ff", "#c1b8cf", value)
    };
    vynylApplyTheme(custom);
    setSelected("custom");
  };

  const saveWallpaper = () => {
    const value = wallpaperDraft.trim();
    if (!value) {
      setWallpaper("");
      localStorage.removeItem("vynyl:wallpaper");
      vynylSignalRuntime();
      notify("Custom background cleared");
      return;
    }
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:") throw new Error("Use an HTTPS image link.");
      setWallpaper(parsed.href);
      localStorage.setItem("vynyl:wallpaper", parsed.href);
      vynylSignalRuntime();
      notify("Background saved");
    } catch (error) {
      notify(error.message === "Use an HTTPS image link." ? error.message : "Enter a valid HTTPS image link.");
    }
  };

  const activeItems = tab === "Extensions" ? vynylExtensions
    : tab === "Snippets" ? vynylSnippets
      : tab === "Themes" ? vynylThemes
        : [];
  const filteredItems = activeItems.filter((item) =>
    (item.name + " " + item.note).toLowerCase().includes(query.toLowerCase())
  );

  const themeCard = (theme) => Spicetify.React.createElement(
    "button",
    {
      key: theme.id,
      className: "vynyl-theme-card" + (selected === theme.id ? " is-selected" : ""),
      onClick: () => { setSelected(theme.id); vynylApplyTheme(theme); },
      "aria-pressed": selected === theme.id
    },
    Spicetify.React.createElement("span", { className: "vynyl-theme-art " + (theme.motion ? "is-" + theme.motion : "") + (theme.glass ? " is-glass" : ""), style: { backgroundColor: theme.colors["--spice-main"] } },
      Spicetify.React.createElement("span", { className: "vynyl-theme-side", style: { backgroundColor: theme.colors["--spice-sidebar"] } }),
      Spicetify.React.createElement("span", { className: "vynyl-theme-accent", style: { backgroundColor: theme.colors["--spice-button"] } }),
      Spicetify.React.createElement("span", { className: "vynyl-theme-lines" }),
      theme.motion ? Spicetify.React.createElement("span", { className: "vynyl-motion-tag" }, "Motion") : null,
      theme.glass ? Spicetify.React.createElement("span", { className: "vynyl-motion-tag" }, "Glass") : null
    ),
    Spicetify.React.createElement("span", { className: "vynyl-theme-info" },
      Spicetify.React.createElement("span", null,
        Spicetify.React.createElement("strong", null, theme.name),
        Spicetify.React.createElement("small", null, theme.note)
      ),
      selected === theme.id ? Spicetify.React.createElement("span", { className: "vynyl-selected-mark" }, "✓") : null
    )
  );

  const featureCard = (item, type, enabled) => Spicetify.React.createElement(
    VynylCard,
    {
      key: item.id,
      title: item.name,
      note: item.note,
      category: item.category || (type === "extensions" ? "Extension" : "Snippet"),
      glyph: item.icon || "✳",
      cover: true,
      action: Spicetify.React.createElement(VynylToggle, {
        enabled,
        label: (enabled ? "Disable " : "Enable ") + item.name,
        onClick: () => toggleItem(type, item.id)
      })
    }
  );

  let content;
  if (tab === "Themes") {
    content = Spicetify.React.createElement(
      Spicetify.React.Fragment,
      null,
      Spicetify.React.createElement("div", { className: "vynyl-market-grid" }, filteredItems.map(themeCard)),
      Spicetify.React.createElement("section", { className: "vynyl-customizer" },
        Spicetify.React.createElement("div", { className: "vynyl-customizer-copy" },
          Spicetify.React.createElement("span", { className: "vynyl-card-category" }, "Make it yours"),
          Spicetify.React.createElement("h2", null, "Your own background"),
          Spicetify.React.createElement("p", null, "Use a color or paste a direct link to an image you have permission to use.")
        ),
        Spicetify.React.createElement("div", { className: "vynyl-customizer-controls" },
          Spicetify.React.createElement("label", { className: "vynyl-color-control" },
            Spicetify.React.createElement("span", null, "Accent"),
            Spicetify.React.createElement("input", { type: "color", value: customColor, onChange: (event) => applyCustomColor(event.target.value), "aria-label": "Choose a custom accent color" })
          ),
          Spicetify.React.createElement("div", { className: "vynyl-wallpaper-control" },
            Spicetify.React.createElement("input", { type: "url", value: wallpaperDraft, onChange: (event) => setWallpaperDraft(event.target.value), placeholder: "https://… image URL", "aria-label": "Background image URL" }),
            Spicetify.React.createElement("button", { className: "vynyl-small-button", onClick: saveWallpaper }, wallpaper ? "Update" : "Apply")
          )
        )
      )
    );
  } else if (tab === "Extensions") {
    content = Spicetify.React.createElement("div", { className: "vynyl-feature-grid" },
      filteredItems.map((item) => featureCard(item, "extensions", extensions.includes(item.id)))
    );
  } else if (tab === "Snippets") {
    content = Spicetify.React.createElement("div", { className: "vynyl-feature-grid" },
      filteredItems.map((item) => featureCard(item, "snippets", snippets.includes(item.id)))
    );
  } else if (tab === "Apps") {
    content = Spicetify.React.createElement(
      Spicetify.React.Fragment,
      null,
      Spicetify.React.createElement(VynylCard, {
        featured: true,
        title: "Vynyl",
        note: "Your in-Spotify theme and customization studio.",
        category: "Installed here",
        glyph: "◉",
        cover: true,
        coverClass: "vynyl-cover-featured",
        action: Spicetify.React.createElement("span", { className: "vynyl-installed-label" }, "Open")
      }),
      Spicetify.React.createElement("div", { className: "vynyl-app-recommendations" },
        Spicetify.React.createElement("div", { className: "vynyl-section-heading" },
          Spicetify.React.createElement("div", null,
            Spicetify.React.createElement("span", { className: "vynyl-card-category" }, "Spicetify built-ins"),
            Spicetify.React.createElement("h2", null, "More apps for Spotify")
          )
        ),
        Spicetify.React.createElement("div", { className: "vynyl-feature-grid" },
          vynylBuiltInApps.map((item) => Spicetify.React.createElement(VynylCard, {
            key: item.id,
            title: item.name,
            note: item.note,
            category: item.source,
            glyph: "↗",
            cover: true,
            action: Spicetify.React.createElement("span", { className: "vynyl-installed-label is-available" }, "In Spicetify")
          }))
        )
      ),
      Spicetify.React.createElement("p", { className: "vynyl-apps-note" }, "The listed apps ship with Spicetify. Enable them with the Spicetify CLI or its official Marketplace.")
    );
  } else {
    const installedCards = [
      ...vynylExtensions.filter((item) => extensions.includes(item.id)).map((item) => ({ item, type: "extensions", enabled: true })),
      ...vynylSnippets.filter((item) => snippets.includes(item.id)).map((item) => ({ item, type: "snippets", enabled: true }))
    ];
    const activeTheme = vynylThemes.find((item) => item.id === selected);
    content = installedCards.length || activeTheme || selected === "custom"
      ? Spicetify.React.createElement(Spicetify.React.Fragment, null,
          Spicetify.React.createElement("div", { className: "vynyl-installed-theme" },
            Spicetify.React.createElement("span", { className: "vynyl-card-category" }, "Active theme"),
            Spicetify.React.createElement("strong", null, activeTheme ? activeTheme.name : "Your custom color"),
            Spicetify.React.createElement("small", null, "Applied in Spotify")
          ),
          installedCards.length
            ? Spicetify.React.createElement("div", { className: "vynyl-feature-grid" },
                installedCards.map(({ item, type, enabled }) => featureCard(item, type, enabled))
              )
            : null
        )
      : Spicetify.React.createElement("div", { className: "vynyl-empty" },
          Spicetify.React.createElement("span", { className: "vynyl-empty-mark" }, "✳"),
          Spicetify.React.createElement("h2", null, "A fresh start"),
          Spicetify.React.createElement("p", null, "Anything you enable in Extensions or Snippets will show up here.")
        );
  }

  return Spicetify.React.createElement(
    "main",
    { className: "vynyl-page" },
    Spicetify.React.createElement(
      "header",
      { className: "vynyl-header" },
      Spicetify.React.createElement("div", null,
        Spicetify.React.createElement("p", { className: "vynyl-kicker" }, "Your Spotify, remixed"),
        Spicetify.React.createElement("h1", null, "Make it yours.")
      ),
      Spicetify.React.createElement("label", { className: "vynyl-search" },
        Spicetify.React.createElement("span", { "aria-hidden": true }, "⌕"),
        Spicetify.React.createElement("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Find a look or feature", "aria-label": "Search the catalog" })
      )
    ),
    Spicetify.React.createElement(
      "nav",
      { className: "vynyl-tabs", "aria-label": "Marketplace categories" },
      ["Extensions", "Themes", "Snippets", "Apps", "Installed"].map((item) =>
        Spicetify.React.createElement("button", {
          key: item,
          className: tab === item ? "is-active" : "",
          onClick: () => setTab(item),
          "aria-current": tab === item ? "page" : undefined
        }, item, item === "Installed" && (extensions.length + snippets.length > 0)
          ? Spicetify.React.createElement("span", { className: "vynyl-count" }, extensions.length + snippets.length)
          : null)
      )
    ),
    Spicetify.React.createElement(
      "section",
      { className: "vynyl-content" },
      Spicetify.React.createElement("div", { className: "vynyl-section-heading" },
        Spicetify.React.createElement("div", null,
          Spicetify.React.createElement("span", { className: "vynyl-card-category" }, tab === "Installed" ? "Your setup" : "Curated for your player"),
          Spicetify.React.createElement("h2", null, tab === "Themes" ? "Pick a new atmosphere" : tab === "Extensions" ? "Small upgrades, big difference" : tab === "Snippets" ? "Details make the vibe" : tab === "Apps" ? "More in your sidebar" : "Your installed customizations")
        ),
        tab === "Themes" ? Spicetify.React.createElement("span", { className: "vynyl-result-count" }, filteredItems.length + " looks") : null
      ),
      content
    ),
    notice ? Spicetify.React.createElement("div", { className: "vynyl-toast", role: "status" }, notice) : null
  );
}

function render() {
  return Spicetify.React.createElement(VynylPage);
}
