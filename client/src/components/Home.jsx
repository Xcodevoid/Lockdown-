import { useState } from 'react';
import { t } from '../i18n';
import { emitAsync, getOrCreateToken } from '../socket';
import { showToast } from '../toast';
import RulesModal from './RulesModal';

function errorMessage(lang, reason) {
  const key = `home.error_${reason}`;
  const translated = t(lang, key);
  return translated !== key ? translated : t(lang, 'home.error_generic');
}

export default function Home({ lang, onJoined }) {
  const [name, setName] = useState('');
  const [side, setSide] = useState('prisoners');
  const [roomCode, setRoomCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [showRules, setShowRules] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    const token = getOrCreateToken();
    const res = await emitAsync('room:create', { name, side, token });
    setBusy(false);
    if (res.ok) onJoined(res.roomId, res.side, name);
    else showToast(errorMessage(lang, res.reason), 'error');
  }

  async function handleJoin(e) {
    e.preventDefault();
    setBusy(true);
    const token = getOrCreateToken();
    const res = await emitAsync('room:join', { roomId: roomCode.trim().toUpperCase(), name, token });
    setBusy(false);
    if (res.ok) onJoined(res.roomId, res.side, name);
    else showToast(errorMessage(lang, res.reason), 'error');
  }

  return (
    <div className="home">
      <h1 className="app-title">🔒 {t(lang, 'app.title')}</h1>
      <p className="app-subtitle">{t(lang, 'app.subtitle')}</p>

      <div className="home-columns">
        <form className="card" onSubmit={handleCreate}>
          <h2>{t(lang, 'home.createRoom')}</h2>
          <label>
            {t(lang, 'home.yourName')}
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, 'home.namePlaceholder')} maxLength={20} required />
          </label>
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
          <button className="primary-button" type="submit" disabled={busy}>
            {busy && <span className="btn-spinner" />}
            {t(lang, 'home.createButton')}
          </button>
        </form>

        <div className="divider">{t(lang, 'home.orDivider')}</div>

        <form className="card" onSubmit={handleJoin}>
          <h2>{t(lang, 'home.joinRoom')}</h2>
          <label>
            {t(lang, 'home.yourName')}
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, 'home.namePlaceholder')} maxLength={20} required />
          </label>
          <label>
            {t(lang, 'home.roomCode')}
            <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} placeholder={t(lang, 'home.roomCodePlaceholder')} maxLength={5} required style={{ textTransform: 'uppercase' }} />
          </label>
          <button className="primary-button" type="submit" disabled={busy}>
            {busy && <span className="btn-spinner" />}
            {t(lang, 'home.joinButton')}
          </button>
        </form>
      </div>

      <button className="link-button how-to-play-button" onClick={() => setShowRules(true)}>📖 {t(lang, 'home.howToPlay')}</button>
      {showRules && <RulesModal lang={lang} onClose={() => setShowRules(false)} />}
    </div>
  );
}
