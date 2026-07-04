import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { PRISONER_CLASSES, GUARD_CLASSES } from '../constants';
import { emitAsync } from '../socket';
import { showToast } from '../toast';
import ClassStatePanel from './ClassStatePanel';
import EscapeDeckPanel from './EscapeDeckPanel';
import UnitPicker from './UnitPicker';
import SwapModal from './SwapModal';
import EventModal from './EventModal';
import BattleLog from './BattleLog';
import RulesModal from './RulesModal';
import RevealOverlay from './RevealOverlay';
import GameOverOverlay from './GameOverOverlay';
import WaitingDots from './WaitingDots';

export default function GameBoard({ lang, session, gameState, onLeave }) {
  const [showRules, setShowRules] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);

  const logLength = gameState?.log?.length ?? 0;

  // Keep the local reveal cursor in sync with the server: rewind on rematch (log shrinks),
  // and auto-catch-up if this player must act on an event the reveal would otherwise block.
  useEffect(() => {
    if (!gameState) return;
    if (logLength < revealIndex) {
      setRevealIndex(logLength);
      return;
    }
    const iAmBlockingChooser = gameState.status === 'awaiting_event_input' && gameState.pendingEventInput?.chooser === session.side;
    if (iAmBlockingChooser && revealIndex < logLength) {
      setRevealIndex(logLength);
    }
  }, [logLength, gameState?.status, gameState?.pendingEventInput?.chooser, session.side]);

  if (!gameState) {
    return (
      <div className="loading-screen">
        <span className="inline-spinner" />
      </div>
    );
  }

  const { side } = session;
  const isPrisoner = side === 'prisoners';

  function copyCode() {
    navigator.clipboard?.writeText(session.roomId).then(() => {
      showToast(t(lang, 'app.roomCodeCopied'), 'success', 1800);
    });
  }

  async function actOrToastError(event, payload) {
    const res = await emitAsync(event, payload);
    if (!res.ok) showToast(res.reason || t(lang, 'home.error_generic'), 'error');
    return res;
  }

  const chooseUnit = (unitClass, disguiseAs) => actOrToastError('game:chooseUnit', { unitClass, disguiseAs });
  const swap = (unitClass) => actOrToastError('game:swap', { unitClass });
  const poisonChoice = (chosenClass) => actOrToastError('game:poisonChoice', { chosenClass });
  const secretTunnelOrder = (order) => actOrToastError('game:secretTunnelOrder', { order });
  const riotChoice = (guardClass) => actOrToastError('game:riotChoice', { guardClass });
  const reinforcementsChoice = (prisonerClass) => actOrToastError('game:reinforcementsChoice', { prisonerClass });
  async function rematch() {
    setRevealIndex(0);
    await actOrToastError('game:rematch', {});
  }

  const opponentSide = isPrisoner ? 'guards' : 'prisoners';
  const opponentConnected = gameState.players[opponentSide]?.connected;
  const pendingReveal = logLength > revealIndex ? gameState.log[revealIndex] : null;
  const showGameOver = gameState.status === 'finished' && !pendingReveal;

  return (
    <div className="game-board">
      <header className="game-header">
        <button className="room-code-badge" onClick={copyCode} title="Copy room code">
          {session.roomId} <span className="copy-icon">📋</span>
        </button>
        <div className="header-spacer" />
        <div className={`my-side-badge ${isPrisoner ? 'prisoners' : 'guards'}`}>
          {isPrisoner ? '🧍' : '💂'} {t(lang, isPrisoner ? 'game.prisonersLabel' : 'game.guardsLabel')}
        </div>
        <button className="link-button" onClick={() => setShowRules(true)}>📖 {t(lang, 'game.rulesButton')}</button>
        <button className="link-button" onClick={onLeave}>🚪 {t(lang, 'lobby.leaveRoom')}</button>
      </header>

      {gameState.status === 'waiting_for_players' ? (
        <div className="lobby-screen">
          <span className="lobby-radar" aria-hidden="true" />
          <p><WaitingDots label={t(lang, 'lobby.waiting')} /></p>
          <p>{t(lang, 'lobby.shareCode')}</p>
          <div className="room-code-big">{session.roomId}</div>
        </div>
      ) : (
        <>
          {!opponentConnected && gameState.status !== 'finished' && (
            <div className="banner warning">
              <span className="inline-spinner small" /> {t(lang, 'game.opponentDisconnected')}
            </div>
          )}

          <div className="round-indicator">{t(lang, 'game.round')} {gameState.round}</div>

          <div className="panels-row">
            <ClassStatePanel lang={lang} title={`🧍 ${t(lang, 'game.prisonersLabel')}`} classes={gameState.prisonerClasses} classOrder={PRISONER_CLASSES} isPrisonerSide />
            <EscapeDeckPanel lang={lang} gameState={gameState} />
            <ClassStatePanel lang={lang} title={`💂 ${t(lang, 'game.guardsLabel')}`} classes={gameState.guardClasses} classOrder={GUARD_CLASSES} currentRound={gameState.round} />
          </div>

          <div className="action-area">
            {gameState.status === 'choosing' && !gameState.myChoiceSubmitted && (
              <>
                <h3>{t(lang, 'game.chooseYourUnit')}</h3>
                {gameState.eligibleFallbackLevel !== 'none' && <p className="muted">{t(lang, 'game.fatigueWaived')}</p>}
                <UnitPicker
                  lang={lang}
                  side={side}
                  eligible={gameState.eligibleClasses}
                  disguiseTokens={gameState.pending.disguiseTokens}
                  onSubmit={chooseUnit}
                />
              </>
            )}
            {gameState.status === 'choosing' && gameState.myChoiceSubmitted && (
              <p className="muted"><WaitingDots label={t(lang, 'game.waitingForOpponent')} /></p>
            )}
            {gameState.status === 'swap_window' && !gameState.mySwapSubmitted && (
              <SwapModal lang={lang} myChoice={gameState.myChoice} eligible={gameState.eligibleClasses} onSwap={swap} />
            )}
            {gameState.status === 'swap_window' && gameState.mySwapSubmitted && (
              <p className="muted"><WaitingDots label={t(lang, 'game.waitingForOpponentSwap')} /></p>
            )}
            {gameState.status === 'awaiting_event_input' && (
              <EventModal
                lang={lang}
                side={side}
                pendingEventInput={gameState.pendingEventInput}
                onPoisonChoice={poisonChoice}
                onSecretTunnelOrder={secretTunnelOrder}
                onRiotChoice={riotChoice}
                onReinforcementsChoice={reinforcementsChoice}
              />
            )}
          </div>

          <BattleLog lang={lang} log={gameState.log} />
        </>
      )}

      {pendingReveal && (
        <RevealOverlay lang={lang} entry={pendingReveal} onContinue={() => setRevealIndex((i) => i + 1)} />
      )}
      {showGameOver && <GameOverOverlay lang={lang} winner={gameState.winner} onRematch={rematch} />}
      {showRules && <RulesModal lang={lang} onClose={() => setShowRules(false)} />}
    </div>
  );
}
