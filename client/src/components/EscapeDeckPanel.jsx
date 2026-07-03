import { t } from '../i18n';
import { CARD_ICON } from '../constants';

export default function EscapeDeckPanel({ lang, gameState }) {
  const { escapeDeckCount, collectedKeys, escapeDiscard, pending } = gameState;
  return (
    <div className="escape-panel">
      <h3>🔑 {t(lang, 'game.escapeDeck')}</h3>
      <div className="key-progress">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`key-slot ${i < collectedKeys ? 'filled' : ''}`}>🔑</span>
        ))}
      </div>
      <p className="deck-count">{escapeDeckCount} {t(lang, 'game.cardsLeft')}</p>

      <div className="pending-effects">
        {pending.barricadeActive && <span className="effect-badge">🚧 {t(lang, 'game.barricadeActive')}</span>}
        {pending.disguiseTokens > 0 && <span className="effect-badge">🎭 {t(lang, 'game.disguiseTokens')}: {pending.disguiseTokens}</span>}
        {pending.shiftRotation && <span className="effect-badge">🔄 {t(lang, 'game.shiftRotationPending')}</span>}
        {pending.revealModifiers.includes('lockdown') && <span className="effect-badge">🚨 {t(lang, 'game.lockdownPending')}</span>}
        {pending.revealModifiers.includes('smuggled_tools') && <span className="effect-badge">🪜 {t(lang, 'game.smuggledPending')}</span>}
      </div>

      {escapeDiscard.length > 0 && (
        <details className="discard-details">
          <summary>{t(lang, 'game.discardPile')} ({escapeDiscard.length})</summary>
          <div className="discard-list">
            {escapeDiscard.map((type, i) => (
              <span key={i} className="discard-chip" title={t(lang, `cards.${type}.name`)}>{CARD_ICON[type]}</span>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
