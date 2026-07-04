import { t } from '../i18n';
import { CardIcon } from '../icons';
import { useFlashOnChange } from '../useFlashOnChange';

export default function EscapeDeckPanel({ lang, gameState }) {
  const { escapeDeckCount, collectedKeys, escapeDiscard, pending } = gameState;
  const deckFlash = useFlashOnChange(escapeDeckCount);
  return (
    <div className="escape-panel">
      <h3><CardIcon name="key_fragment" /> {t(lang, 'game.escapeDeck')}</h3>
      <div className="deck-stack" aria-hidden="true">
        <span className="deck-card deck-card-3" />
        <span className="deck-card deck-card-2" />
        <span className="deck-card deck-card-1"><CardIcon name="lockdown" /></span>
      </div>
      <div className="key-progress">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`key-slot ${i < collectedKeys ? 'filled' : ''}`}><CardIcon name="key_fragment" /></span>
        ))}
      </div>
      <p className={`deck-count ${deckFlash ? 'value-flash' : ''}`}>{escapeDeckCount} {t(lang, 'game.cardsLeft')}</p>

      <div className="pending-effects">
        {pending.barricadeActive && <span className="effect-badge"><CardIcon name="barricade" /> {t(lang, 'game.barricadeActive')}</span>}
        {pending.disguiseTokens > 0 && <span className="effect-badge"><CardIcon name="disguise" /> {t(lang, 'game.disguiseTokens')}: {pending.disguiseTokens}</span>}
        {pending.shiftRotation && <span className="effect-badge"><CardIcon name="shift_rotation" /> {t(lang, 'game.shiftRotationPending')}</span>}
        {pending.revealModifiers.includes('lockdown') && <span className="effect-badge"><CardIcon name="lockdown" /> {t(lang, 'game.lockdownPending')}</span>}
        {pending.revealModifiers.includes('smuggled_tools') && <span className="effect-badge"><CardIcon name="smuggled_tools" /> {t(lang, 'game.smuggledPending')}</span>}
      </div>

      {escapeDiscard.length > 0 && (
        <details className="discard-details">
          <summary>{t(lang, 'game.discardPile')} ({escapeDiscard.length})</summary>
          <div className="discard-list">
            {escapeDiscard.map((type, i) => (
              <span key={i} className="discard-chip" title={t(lang, `cards.${type}.name`)}><CardIcon name={type} /></span>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
