import { useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import { emitAsync, getOrCreateToken } from '../socket';
import { showToast } from '../toast';
import RulesModal from './RulesModal';

function errorMessage(lang, reason) {
  const key = `home.error_${reason}`;
  const translated = t(lang, key);
  return translated !== key ? translated : t(lang, 'home.error_generic');
}

const LOBBY_POLL_MS = 4000;

export default function Home({ lang, onJoined }) {
  const [tab, setTab] = useState('create');
  const [name, setName] = useState('');
  const [side, setSide] = useState('prisoners');
  const [visibility, setVisibility] = useState('public');
  const [roomCode, setRoomCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [lobbies, setLobbies] = useState(null);
  const [lobbiesLoading, setLobbiesLoading] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (tab !== 'browse') {
      clearInterval(pollRef.current);
      return undefined;
    }
    refreshLobbies();
    pollRef.current = setInterval(refreshLobbies, LOBBY_POLL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function refreshLobbies() {
    setLobbiesLoading(true);
    const res = await emitAsync('lobby:list', {});
    setLobbiesLoading(false);
    if (res.ok) setLobbies(res.rooms);
  }

  function requireName() {
    if (name.trim()) return true;
    showToast(t(lang, 'home.error_name_required'), 'error');
    return false;
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!requireName()) return;
    setBusy(true);
    const token = getOrCreateToken();
    const res = await emitAsync('room:create', { name, side, token, visibility });
    setBusy(false);
    if (res.ok) onJoined(res.roomId, res.side, name);
    else showToast(errorMessage(lang, res.reason), 'error');
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!requireName()) return;
    setBusy(true);
    const token = getOrCreateToken();
    const res = await emitAsync('room:join', { roomId: roomCode.trim().toUpperCase(), name, token });
    setBusy(false);
    if (res.ok) onJoined(res.roomId, res.side, name);
    else showToast(errorMessage(lang, res.reason), 'error');
  }

  async function handleJoinLobby(roomId) {
    if (!requireName()) return;
    setBusy(true);
    const token = getOrCreateToken();
    const res = await emitAsync('room:join', { roomId, name, token });
    setBusy(false);
    if (res.ok) onJoined(res.roomId, res.side, name);
    else showToast(errorMessage(lang, res.reason), 'error');
  }

  return (
    <div className="home">
      <h1 className="app-title">🔒 {t(lang, 'app.title')}</h1>
      <p className="app-subtitle">{t(lang, 'app.subtitle')}</p>

      <div className="home-shared-name">
        <label>
          {t(lang, 'home.yourName')}
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, 'home.namePlaceholder')} maxLength={20} />
        </label>
      </div>

      <div className="home-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'create'} className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}>
          🛠️ {t(lang, 'home.tabCreate')}
        </button>
        <button role="tab" aria-selected={tab === 'browse'} className={tab === 'browse' ? 'active' : ''} onClick={() => setTab('browse')}>
          🔍 {t(lang, 'home.tabBrowse')}
        </button>
        <button role="tab" aria-selected={tab === 'join'} className={tab === 'join' ? 'active' : ''} onClick={() => setTab('join')}>
          🔑 {t(lang, 'home.tabJoin')}
        </button>
      </div>

      <div className="home-panel">
        {tab === 'create' && (
          <form className="card wide" onSubmit={handleCreate}>
            <fieldset className="side-picker">
              <legend>{t(lang, 'home.chooseSide')}</legend>
              <label className={`side-option ${side === 'prisoners' ? 'selected' : ''}`}>
                <input type="radio" name="side" value="prisoners" checked={side === 'prisoners'} onChange={() => setSide('prisoners')} />
                <span>🧍 {t(lang, 'home.prisoners')}</span>
                <small>{t(lang, 'home.prisonersDesc')}</small>
              </label>
              <label className={`side-option ${side === 'guards' ? 'selected' : ''}`}>
                <input type="radio" name="side" value="guards" checked={side === 'guards'} onChange={() => setSide('guards')} />
                <span>💂 {t(lang, 'home.guards')}</span>
                <small>{t(lang, 'home.guardsDesc')}</small>
              </label>
            </fieldset>

            <fieldset className="side-picker">
              <legend>{t(lang, 'home.visibility')}</legend>
              <label className={`side-option ${visibility === 'public' ? 'selected' : ''}`}>
                <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} />
                <span>🌐 {t(lang, 'home.visibilityPublic')}</span>
                <small>{t(lang, 'home.visibilityPublicDesc')}</small>
              </label>
              <label className={`side-option ${visibility === 'private' ? 'selected' : ''}`}>
                <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} />
                <span>🔒 {t(lang, 'home.visibilityPrivate')}</span>
                <small>{t(lang, 'home.visibilityPrivateDesc')}</small>
              </label>
            </fieldset>

            <button className="primary-button" type="submit" disabled={busy}>
              {busy && <span className="btn-spinner" />}
              {t(lang, 'home.createButton')}
            </button>
          </form>
        )}

        {tab === 'join' && (
          <form className="card wide" onSubmit={handleJoin}>
            <label>
              {t(lang, 'home.roomCode')}
              <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} placeholder={t(lang, 'home.roomCodePlaceholder')} maxLength={5} required style={{ textTransform: 'uppercase' }} />
            </label>
            <button className="primary-button" type="submit" disabled={busy}>
              {busy && <span className="btn-spinner" />}
              {t(lang, 'home.joinButton')}
            </button>
          </form>
        )}

        {tab === 'browse' && (
          <div className="card wide lobby-browser">
            <div className="lobby-browser-header">
              <h2>{t(lang, 'home.browseTitle')}</h2>
              <button type="button" className="icon-button" onClick={refreshLobbies} title={t(lang, 'home.browseRefresh')}>
                {lobbiesLoading ? <span className="inline-spinner small" /> : '🔄'}
              </button>
            </div>

            {lobbies === null && <p className="muted">{t(lang, 'home.browseLoading')}</p>}
            {lobbies?.length === 0 && <p className="muted">{t(lang, 'home.browseEmpty')}</p>}

            {lobbies?.length > 0 && (
              <ul className="lobby-list">
                {lobbies.map((room) => (
                  <li key={room.roomId} className="lobby-row">
                    <span className="lobby-host">
                      <span className="class-icon">{room.hostSide === 'prisoners' ? '🧍' : '💂'}</span>
                      {t(lang, 'home.browseHostedBy', { name: room.hostName })}
                    </span>
                    <span className="lobby-open-side muted">
                      {t(lang, 'home.browseYouWillBe', { side: t(lang, room.openSide === 'prisoners' ? 'home.prisoners' : 'home.guards') })}
                    </span>
                    <button className="primary-button lobby-join-button" onClick={() => handleJoinLobby(room.roomId)} disabled={busy}>
                      {t(lang, 'home.browseJoinButton')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <button className="link-button how-to-play-button" onClick={() => setShowRules(true)}>📖 {t(lang, 'home.howToPlay')}</button>
      {showRules && <RulesModal lang={lang} onClose={() => setShowRules(false)} />}
    </div>
  );
}
