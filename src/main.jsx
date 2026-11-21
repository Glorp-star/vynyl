import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Check, ChevronRight, CircleHelp, Disc3, Minus, Play, Search, Square, X
} from 'lucide-react';
import './styles.css';

const themes = [
  {
    id: 'peach',
    name: 'Peach Static',
    accent: '#ffb38a',
    panel: '#241f1b',
    bg: '#171512',
    description: 'Warm low-light tones',
  },
  {
    id: 'verdant',
    name: 'Verdant',
    accent: '#b6ef73',
    panel: '#17231d',
    bg: '#101713',
    description: 'Quiet botanical green',
  },
  {
    id: 'ultramarine',
    name: 'Ultramarine',
    accent: '#82aaff',
    panel: '#171a29',
    bg: '#0d1020',
    description: 'Deep cobalt midnight',
  },
  {
    id: 'paper',
    name: 'Paper Cut',
    accent: '#df4d43',
    panel: '#e9e3d7',
    bg: '#f4efE4',
    description: 'Editorial warm paper',
  }
];

const albums = [
  { title: 'Dream Logic', artist: 'Pachanga', color: '#e6a477', mark: 'DL' },
  { title: 'Slow Current', artist: 'Mora', color: '#728c78', mark: 'SC' },
  { title: 'Night Signal', artist: 'Kaito FM', color: '#6f79a8', mark: 'NS' }
];

function App() {
  const [selectedId, setSelectedId] = useState('peach');
  const [status, setStatus] = useState('Checking for Spotify...');
  const [spotify, setSpotify] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const selected = useMemo(() => themes.find((theme) => theme.id === selectedId) || themes[0], [selectedId]);

  useEffect(() => {
    if (!window.vynyl) {
      setSpotify({ found: false, installed: false });
      setStatus('Open the Vynyl desktop app to install');
      return;
    }
    window.vynyl.detectSpotify().then((result) => {
      setSpotify(result);
      setStatus(result.found
        ? (result.installed ? 'Vynyl is installed' : 'Spotify is ready')
        : 'Spotify desktop not found');
    });
  }, []);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const install = async () => {
    setInstalling(true);
    setStatus('Adding Vynyl to Spotify...');
    const result = await window.vynyl?.installToSpotify();
    setInstalling(false);
    if (result?.ok) {
      setSpotify((current) => ({ ...current, installed: true }));
      setStatus('Added — restart Spotify to see it');
      notify('Vynyl added. Restart Spotify to open it from the sidebar.');
    } else {
      setStatus(result?.error || 'Could not add Vynyl');
      notify(result?.error || 'Could not add Vynyl');
    }
  };

  const uninstall = async () => {
    setInstalling(true);
    setStatus('Removing Vynyl from Spotify...');
    const result = await window.vynyl?.uninstallFromSpotify();
    setInstalling(false);
    if (result?.ok) {
      setSpotify((current) => ({ ...current, installed: false }));
      setStatus('Removed — restart Spotify to finish');
      notify('Vynyl removed from Spotify. Restart to finish.');
    } else {
      setStatus(result?.error || 'Could not remove Vynyl');
      notify(result?.error || 'Could not remove Vynyl');
    }
  };

  const filtered = themes.filter((theme) =>
    `${theme.name} ${theme.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="app">
      <aside className="rail">
        <button className="brand" aria-label="Vynyl home">
          <span className="brand-mark"><Disc3 size={20} /></span>
          <span>Vynyl</span>
        </button>
        <nav>
          <button className="active" aria-current="page"><Disc3 size={18} /><span>Spotify setup</span></button>
        </nav>
        <div className="rail-footer">
          <button aria-label="Help"><CircleHelp size={18} /></button>
        </div>
      </aside>

      <section className="workspace">
        <header className="titlebar">
          <div className="search">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search themes" />
          </div>
          <div className="window-actions">
            <button onClick={() => window.vynyl?.minimize()} aria-label="Minimize"><Minus size={15} /></button>
            <button onClick={() => window.vynyl?.maximize()} aria-label="Maximize"><Square size={13} /></button>
            <button onClick={() => window.vynyl?.close()} aria-label="Close"><X size={15} /></button>
          </div>
        </header>

        <div className="content">
          <div className="gallery">
            <div className="section-heading">
              <div>
                <p className="eyebrow">A Spotify sidebar app</p>
                <h1>Your Spotify, your way.</h1>
                <p className="intro-copy">Add a custom Vynyl section to Spotify. No extra customization framework needed.</p>
              </div>
              <span className="product-tag"><Disc3 size={15} />Spotify desktop</span>
            </div>

            <div className="theme-grid">
              {filtered.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-card ${selectedId === theme.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(theme.id)}
                >
                  <div className="theme-preview" style={{ background: theme.bg }}>
                    <div className="preview-sidebar" style={{ background: theme.panel }}>
                      <span className="preview-dot" style={{ background: theme.accent }} />
                      <span /><span /><span />
                    </div>
                    <div className="preview-main">
                      <div className="preview-title" style={{ background: theme.accent }} />
                      <div className="preview-row"><span /><span /><span /></div>
                      <div className="preview-row"><span /><span /><span /></div>
                    </div>
                  </div>
                  <div className="theme-meta">
                    <div>
                      <strong>{theme.name}</strong>
                      <p>{theme.description}</p>
                    </div>
                    {selectedId === theme.id ? <span className="check"><Check size={14} /></span> : <ChevronRight size={16} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="inspector">
            <div className="inspector-head">
              <span className="live-dot" />
              <span>Inside Spotify</span>
            </div>
            <div className="spotify-preview" style={{ '--preview-bg': selected.bg, '--preview-panel': selected.panel, '--preview-accent': selected.accent }}>
              <div className="mini-sidebar">
                <span className="mini-logo">O</span>
                <span /><span /><span />
                <div className="mini-library">Your library</div>
              </div>
              <div className="mini-content">
                <div className="mini-topbar"><span /><span /><button><Play size={10} fill="currentColor" /></button></div>
                <h3>Good afternoon</h3>
                <div className="mini-albums">
                  {albums.map((album) => (
                    <div className="mini-album" key={album.title}>
                      <div className="album-art" style={{ background: album.color }}>
                        <span>{album.mark}</span>
                      </div>
                      <div><strong>{album.title}</strong><small>{album.artist}</small></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mini-player">
                <span className="now-art" />
                <div><strong>Dream Logic</strong><small>Pachanga</small></div>
                <div className="progress"><span /></div>
              </div>
            </div>

            <div className="apply-panel">
              <div>
                <p>After setup</p>
                <strong>Vynyl in your sidebar</strong>
              </div>
              <div className="setup-actions">
                <button className="apply" onClick={install} disabled={installing || !spotify?.found}>
                  {installing ? 'Working…' : spotify?.installed ? 'Update Vynyl' : 'Add to Spotify'}
                </button>
                {spotify?.installed && <button className="remove-vynyl" onClick={uninstall} disabled={installing}>Remove</button>}
              </div>
            </div>
            <div className={`connection ${spotify?.found ? 'connected' : ''}`}>
              <span />
              <p>{status}</p>
            </div>
            {status === 'Spotify desktop not found' && (
              <p className="install-hint">
                Install Spotify desktop, close it, then reopen Vynyl.
              </p>
            )}
          </aside>
        </div>
      </section>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
