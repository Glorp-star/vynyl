(() => {
  const style = document.createElement("style");
  style.id = "vynyl-runtime-styles";
  style.textContent = `
    #vynyl-background {
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
      opacity: .7;
      background: radial-gradient(ellipse at 18% 0%, color-mix(in srgb, var(--spice-button) 22%, transparent), transparent 48%);
    }
    #vynyl-background::before,
    #vynyl-background::after {
      content: "";
      position: absolute;
      inset: -35%;
      opacity: 0;
      transition: opacity 450ms ease;
      background-size: cover;
      background-position: center;
    }
    #vynyl-background::before {
      background:
        radial-gradient(ellipse at 22% 30%, color-mix(in srgb, var(--spice-button) 32%, transparent), transparent 38%),
        radial-gradient(ellipse at 75% 65%, rgba(86, 167, 193, .25), transparent 42%),
        radial-gradient(ellipse at 65% 12%, rgba(176, 127, 207, .2), transparent 34%);
      filter: blur(40px);
      animation: vynyl-aurora 28s ease-in-out infinite alternate;
    }
    #vynyl-background::after {
      background-image: var(--vynyl-artwork);
      filter: blur(72px) saturate(1.25);
      transform: scale(1.2);
      opacity: .28;
    }
    html[data-vynyl-motion="aurora"] #vynyl-background::before,
    html[data-vynyl-motion="orbit"] #vynyl-background::before { opacity: .84; }
    html[data-vynyl-ambient="true"] #vynyl-background::after { opacity: .54; }
    html[data-vynyl-wallpaper="true"] #vynyl-background::after {
      inset: 0;
      opacity: .48;
      filter: blur(1px) saturate(.9);
      transform: none;
      background-image: linear-gradient(180deg, rgba(10, 12, 16, .28), rgba(10, 12, 16, .76)), var(--vynyl-wallpaper);
    }
    html[data-vynyl-motion="orbit"] #vynyl-background::before {
      background:
        radial-gradient(ellipse at 25% 35%, color-mix(in srgb, var(--spice-button) 40%, transparent), transparent 32%),
        radial-gradient(ellipse at 80% 70%, rgba(96, 123, 236, .28), transparent 38%);
      animation-duration: 40s;
    }
    @keyframes vynyl-aurora {
      from { transform: translate3d(-2%, -1%, 0) rotate(-4deg) scale(.96); }
      to { transform: translate3d(3%, 2%, 0) rotate(5deg) scale(1.08); }
    }
    html[data-vynyl-glass="true"] .main-view-container,
    html[data-vynyl-glass="true"] .Root__right-sidebar,
    html[data-vynyl-glass="true"] .Root__now-playing-bar,
    html[data-vynyl-glass="true"] .main-view-container__scroll-node {
      background-color: color-mix(in srgb, var(--spice-card) 64%, transparent) !important;
      backdrop-filter: blur(22px) saturate(1.25);
      -webkit-backdrop-filter: blur(22px) saturate(1.25);
    }
    html[data-vynyl-motion="aurora"] .main-view-container,
    html[data-vynyl-motion="orbit"] .main-view-container,
    html[data-vynyl-wallpaper="true"] .main-view-container {
      background-color: color-mix(in srgb, var(--spice-main) 70%, transparent) !important;
    }
    html[data-vynyl-motion="aurora"] .Root__main-view,
    html[data-vynyl-motion="orbit"] .Root__main-view,
    html[data-vynyl-wallpaper="true"] .Root__main-view {
      background-color: color-mix(in srgb, var(--spice-main) 72%, transparent) !important;
    }
    html.vynyl-focus .Root__left-sidebar,
    html.vynyl-focus .Root__right-sidebar { display: none !important; }
    html.vynyl-focus .Root__main-view { grid-column: 1 / -1 !important; }
    html.vynyl-round-art [data-testid="cover-art-image"],
    html.vynyl-round-art .cover-art-image img { border-radius: 50% !important; }
    html.vynyl-pill-progress [role="progressbar"],
    html.vynyl-pill-progress progress { border-radius: 999px !important; }
    html.vynyl-pill-progress [role="progressbar"] > *,
    html.vynyl-pill-progress progress::-webkit-progress-value { border-radius: 999px !important; }
    html.vynyl-hide-podcast [data-testid*="podcast"],
    html.vynyl-hide-podcast section[aria-label*="podcast" i] { display: none !important; }
    html.vynyl-soft-cards [data-testid="card"],
    html.vynyl-soft-cards .main-card-card { box-shadow: 0 10px 28px rgba(0, 0, 0, .18); }
    #vynyl-toast {
      position: fixed;
      z-index: 99999;
      left: 50%;
      bottom: 98px;
      transform: translateX(-50%);
      max-width: min(460px, calc(100vw - 32px));
      padding: 11px 16px;
      border: 1px solid rgba(255,255,255,.13);
      border-radius: 999px;
      background: rgba(26, 27, 31, .82);
      color: #fff;
      box-shadow: 0 12px 40px rgba(0,0,0,.24);
      backdrop-filter: blur(18px);
      font: 500 13px/1.3 sans-serif;
      pointer-events: none;
      opacity: 0;
      transition: opacity 180ms ease, transform 180ms ease;
    }
    #vynyl-toast.is-visible { opacity: 1; transform: translate(-50%, -5px); }
    @media (prefers-reduced-motion: reduce) {
      #vynyl-background::before { animation: none !important; }
      #vynyl-toast { transition: none; }
    }
  `;
  document.head.appendChild(style);

  const background = document.createElement("div");
  background.id = "vynyl-background";
  document.body.prepend(background);

  const toast = document.createElement("div");
  toast.id = "vynyl-toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  let toastTimeout;

  const notify = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  const readList = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const refresh = () => {
    const root = document.documentElement;
    const extensions = readList("vynyl:extensions");
    const snippets = readList("vynyl:snippets");
    const motion = localStorage.getItem("vynyl:motion") || "none";
    const glass = localStorage.getItem("vynyl:glass") === "true";
    const wallpaper = localStorage.getItem("vynyl:wallpaper") || "";
    root.dataset.vynylMotion = motion;
    root.dataset.vynylGlass = String(glass);
    root.dataset.vynylAmbient = String(extensions.includes("ambient"));
    root.dataset.vynylWallpaper = String(Boolean(wallpaper));
    root.classList.toggle("vynyl-focus", extensions.includes("focus"));
    root.classList.toggle("vynyl-round-art", snippets.includes("round-art"));
    root.classList.toggle("vynyl-pill-progress", snippets.includes("pill-progress"));
    root.classList.toggle("vynyl-hide-podcast", snippets.includes("hide-podcast"));
    root.classList.toggle("vynyl-soft-cards", snippets.includes("soft-cards"));

    if (wallpaper) {
      try {
        const parsed = new URL(wallpaper);
        if (parsed.protocol === "https:") {
          background.style.setProperty("--vynyl-wallpaper", `url("${parsed.href.replace(/["\\\n\r]/g, "")}")`);
        } else {
          background.style.removeProperty("--vynyl-wallpaper");
        }
      } catch {
        background.style.removeProperty("--vynyl-wallpaper");
      }
    } else {
      background.style.removeProperty("--vynyl-wallpaper");
    }
    updateAlbumArtwork();
  };

  const updateAlbumArtwork = () => {
    if (document.documentElement.dataset.vynylAmbient !== "true") return;
    const image = document.querySelector('[data-testid="now-playing-widget"] img, .main-nowPlayingWidget-coverArt img');
    const source = image?.currentSrc || image?.src || "";
    if (source.startsWith("https://")) {
      background.style.setProperty("--vynyl-artwork", `url("${source.replace(/["\\\n\r]/g, "")}")`);
    }
  };

  window.addEventListener("vynyl:settings-changed", refresh);
  refresh();

  if (Spicetify.Player?.addEventListener) {
    Spicetify.Player.addEventListener("songchange", () => {
      if (!readList("vynyl:extensions").includes("track-toast")) return;
      const current = Spicetify.Player.data?.item?.metadata;
      const title = current?.title;
      const artist = current?.artist_name;
      if (title) notify(artist ? `${title} · ${artist}` : title);
      updateAlbumArtwork();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
    if (!readList("vynyl:extensions").includes("shortcuts")) return;
    if (event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const player = Spicetify.Player;
    if (event.code === "KeyP") player?.togglePlay?.();
    else if (event.code === "KeyN") player?.next?.();
    else if (event.code === "KeyB") player?.back?.();
    else return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  if (Spicetify.Player?.addEventListener) {
    Spicetify.Player.addEventListener("songchange", updateAlbumArtwork);
  }
})();
