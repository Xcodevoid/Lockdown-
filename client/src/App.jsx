import { useEffect, useState } from 'react';
import Home from './components/Home';
import GameBoard from './components/GameBoard';
import LanguageToggle from './components/LanguageToggle';
import ConnectingScreen from './components/ConnectingScreen';
import ToastHost from './components/ToastHost';
import { socket, emitAsync, getOrCreateToken } from './socket';
import { showToast } from './toast';
import { t } from './i18n';

const SESSION_KEY = 'lockdown.session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lockdown.lang') || 'en');
  const [session, setSession] = useState(loadSession);
  const [gameState, setGameState] = useState(null);
  const [hasConnectedOnce, setHasConnectedOnce] = useState(socket.connected);

  useEffect(() => {
    localStorage.setItem('lockdown.lang', lang);
  }, [lang]);

  useEffect(() => {
    socket.connect();
    socket.on('state:update', setGameState);

    function handleConnect() {
      setHasConnectedOnce((was) => {
        if (was) showToast(t(lang, 'app.reconnected'), 'success');
        return true;
      });
    }
    function handleDisconnect() {
      setHasConnectedOnce((was) => {
        if (was) showToast(t(lang, 'app.disconnected'), 'error', 5000);
        return was;
      });
    }
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('state:update', setGameState);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [lang]);

  useEffect(() => {
    if (!session) return undefined;
    const token = getOrCreateToken();

    async function tryRejoin() {
      const res = await emitAsync('room:join', {
        roomId: session.roomId,
        name: session.name,
        token,
        preferredSide: session.side,
      });
      if (!res.ok) {
        setSession(null);
        localStorage.removeItem(SESSION_KEY);
      }
    }

    if (socket.connected) tryRejoin();
    socket.on('connect', tryRejoin);
    return () => socket.off('connect', tryRejoin);
  }, [session?.roomId, session?.name, session?.side]);

  function handleJoined(roomId, side, name) {
    const s = { roomId, side, name };
    setSession(s);
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }

  function handleLeave() {
    setSession(null);
    setGameState(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <div className="app">
      <LanguageToggle lang={lang} setLang={setLang} />
      <ToastHost />
      {!hasConnectedOnce ? (
        <ConnectingScreen lang={lang} />
      ) : !session ? (
        <Home lang={lang} onJoined={handleJoined} />
      ) : (
        <GameBoard lang={lang} session={session} gameState={gameState} onLeave={handleLeave} />
      )}
    </div>
  );
}
