import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight, Check, Disc3, ExternalLink, Layers3, Minus, RotateCw,
  ShieldCheck, Sparkles, Square, X, Zap
} from 'lucide-react';
import './styles.css';

const highlights = [
  { icon: Sparkles, title: 'A real theme library', detail: 'Hand-tuned color, motion, and glass looks.' },
  { icon: Layers3, title: 'Small useful add-ons', detail: 'Playback helpers, focus mode, and more.' },
  { icon: ShieldCheck, title: 'Your player stays yours', detail: 'Settings stay in Spotify and can be undone.' }
];

function App() {
  const [spotify, setSpotify] = useState(null);
  const [checking, setChecking] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const checkSpotify = async () => {
    if (!window.vynyl) {
      setSpotify({ found: false, installed: false });
      setChecking(false);
      return;
    }
    setChecking(true);
    setError('');
    try {
      setSpotify(await window.vynyl.detectSpotify());
    } catch (reason) {
      setError(reason?.message || 'Could not check Spotify installation.');
      setSpotify({ found: false, installed: false });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSpotify();
  }, []);

  const install = async () => {
    if (!window.vynyl) {
      setError('Run Vynyl as a desktop app to install it into Spotify.');
      return;
    }
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const result = await window.vynyl.installToSpotify();
      if (!result?.ok) throw new Error(result?.error || 'Vynyl could not be installed.');
      setSpotify((current) => ({ ...current, found: true, installed: true }));
      setNotice('Vynyl is ready. Restart Spotify to see it in the sidebar.');
    } catch (reason) {
      setError(reason?.message || 'Vynyl could not be installed.');
    } finally {
      setWorking(false);
    }
  };

  const uninstall = async () => {
    if (!window.vynyl) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const result = await window.vynyl.uninstallFromSpotify();
      if (!result?.ok) throw new Error(result?.error || 'Vynyl could not be removed.');
      setSpotify((current) => ({ ...current, installed: false }));
      setNotice('Vynyl was removed. Restart Spotify to finish.');
    } catch (reason) {
      setError(reason?.message || 'Vynyl could not be removed.');
    } finally {
      setWorking(false);
    }
  };

  const status = checking
    ? { label: 'Checking Spotify', tone: 'checking' }
    : spotify?.installed
      ? { label: 'Vynyl installed', tone: 'ready' }
      : spotify?.found
        ? { label: 'Spotify detected', tone: 'ready' }
        : { label: 'Spotify not found', tone: 'missing' };

  return (
    <main className="app">
      <aside className="rail">
        <div className="brand">
          <span className="brand-mark"><Disc3 size={20} strokeWidth={2.2} /></span>
          <span className="brand-name">vynyl</span>
          <span className="brand-edition">STUDIO</span>
        </div>

        <div className="rail-group">
          <span className="rail-label">Workspace</span>
          <div className="rail-item is-current"><Disc3 size={17} /><span>Overview</span></div>
        </div>

        <div className="rail-note">
          <span className="rail-note-icon"><Zap size={15} /></span>
          <p>Made for the music you keep coming back to.</p>
        </div>

        <span className="rail-version">Vynyl desktop · 0.1.0</span>
      </aside>

      <section className="workspace">
        <header className="titlebar">
          <div className="breadcrumbs"><span>Vynyl</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="window-actions">
            <button onClick={() => window.vynyl?.minimize()} aria-label="Minimize"><Minus size={15} /></button>
            <button onClick={() => window.vynyl?.maximize()} aria-label="Maximize"><Square size={13} /></button>
            <button onClick={() => window.vynyl?.close()} aria-label="Close"><X size={15} /></button>
          </div>
        </header>

        <div className="studio">
          <section className="welcome">
            <div className="welcome-copy">
              <span className="eyebrow"><span className="eyebrow-mark" /> Your listening, remixed</span>
              <h1>Give your player<br />a little <em>character.</em></h1>
              <p>Vynyl brings themes, motion, and practical extras into Spotify. Set it up here, then tune the details from Spotify’s sidebar.</p>
            </div>
            <div className="record-stage" aria-hidden="true">
              <div className="record-glow" />
              <div className="record">
                <span className="record-groove groove-one" />
                <span className="record-groove groove-two" />
                <span className="record-groove groove-three" />
                <span className="record-label"><Disc3 size={32} strokeWidth={1.6} /></span>
              </div>
              <span className="record-orbit orbit-one" />
              <span className="record-orbit orbit-two" />
            </div>
          </section>

          <section className="setup-layout" aria-label="Spotify setup">
            <div className="feature-board">
              <div className="board-heading">
                <div>
                  <span className="section-kicker">Inside Spotify</span>
                  <h2>Your new listening space.</h2>
                </div>
                <span className="board-badge"><span /> Opens from the sidebar</span>
              </div>

              <div className="player-mockup" aria-hidden="true">
                <div className="mock-sidebar">
                  <div className="mock-brand"><Disc3 size={16} /><span>vynyl</span></div>
                  <span className="mock-nav is-lit"><span className="mock-nav-dot" />Discover</span>
                  <span className="mock-nav"><span className="mock-nav-dot" />Themes</span>
                  <span className="mock-nav"><span className="mock-nav-dot" />Extensions</span>
                  <div className="mock-sidebar-rule" />
                  <span className="mock-nav"><span className="mock-nav-dot" />Installed</span>
                </div>
                <div className="mock-library">
                  <div className="mock-topline"><span>YOUR PLAYER, YOUR RULES</span><span className="mock-tiny-disc">V</span></div>
                  <div className="mock-title">Find your<br /><i>frequency.</i></div>
                  <div className="mock-swatch-row">
                    <span className="swatch swatch-violet"><i /></span>
                    <span className="swatch swatch-coral"><i /></span>
                    <span className="swatch swatch-mint"><i /></span>
                    <span className="swatch swatch-blue"><i /></span>
                    <span className="swatch swatch-paper"><i /></span>
                  </div>
                  <div className="mock-track">
                    <span className="mock-cover"><Disc3 size={18} /></span>
                    <span className="mock-track-lines"><i /><i /></span>
                    <span className="mock-equalizer"><i /><i /><i /><i /><i /></span>
                  </div>
                </div>
              </div>

              <div className="highlight-row">
                {highlights.map(({ icon: Icon, title, detail }) => (
                  <div className="highlight" key={title}>
                    <Icon size={16} />
                    <div><strong>{title}</strong><span>{detail}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="setup-card">
              <div className="setup-card-top">
                <span className={`status-pill ${status.tone}`}><i />{status.label}</span>
                <button className="refresh" onClick={checkSpotify} disabled={checking || working} aria-label="Check Spotify again">
                  <RotateCw size={15} className={checking ? 'is-spinning' : ''} />
                </button>
              </div>

              <h2>{spotify?.installed ? 'Keep your setup fresh.' : 'Make room for Vynyl.'}</h2>
              <p className="setup-description">
                {spotify?.installed
                  ? 'Repair or update the Spotify sidebar install. Your themes and extension settings stay in Spotify.'
                  : 'Add Vynyl to Spotify’s desktop sidebar. Your existing Spotify setup stays in place.'}
              </p>

              <button className="install-button" onClick={install} disabled={working || checking || !spotify?.found}>
                {working
                  ? <><span className="button-spinner" />Working on it</>
                  : <>{spotify?.installed ? 'Repair or update' : 'Install Vynyl'}<ArrowUpRight size={17} /></>}
              </button>

              {spotify?.installed && (
                <button className="uninstall-button" onClick={uninstall} disabled={working}>
                  Remove Vynyl from Spotify
                </button>
              )}

              {error && <p className="message error-message" role="alert">{error}</p>}
              {notice && <p className="message success-message" role="status">{notice}</p>}
              {!spotify?.found && !checking && !error && (
                <p className="message helper-message">Install Spotify desktop, close it, then check again.</p>
              )}

              <div className="setup-divider" />
              <span className="section-kicker">Quick setup</span>
              <ol className="setup-steps">
                <li><span>1</span><p><strong>Quit Spotify</strong><small>Close it from the system tray too.</small></p><Check size={14} /></li>
                <li><span>2</span><p><strong>Install or repair</strong><small>Vynyl adds only its own files.</small></p><Check size={14} /></li>
                <li><span>3</span><p><strong>Open Spotify</strong><small>Choose Vynyl from the sidebar.</small></p><ArrowUpRight size={14} /></li>
              </ol>
              <button className="setup-footnote" onClick={() => window.vynyl?.openRepository()}>
                How Vynyl works <ExternalLink size={12} />
              </button>
            </aside>
          </section>

          <footer className="studio-footer">
            <span>Designed for your listening room.</span>
            <span><span className="footer-signal" /> Spotify desktop · Windows</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
