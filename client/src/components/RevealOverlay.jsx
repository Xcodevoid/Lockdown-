import { t } from '../i18n';
import { CARD_ICON } from '../constants';
import TradingCard from './TradingCard';

export default function RevealOverlay({ lang, entry, onContinue }) {
  const prisonersWon = entry.winner === 'prisoners';

  return (
    <div className="reveal-overlay">
      <div className={`reveal-flash ${prisonersWon ? 'prisoners' : 'guards'}`} />
      <div className="reveal-content">
        <div className="reveal-round-tag">{t(lang, 'game.round')} {entry.round}</div>

        <div className="reveal-vs-row">
          <div className="reveal-vs-col">
            <TradingCard
              classKey={entry.prisonerClass}
              label={t(lang, `classes.${entry.prisonerClass}`)}
              interactive={false}
              size="lg"
              className="reveal-card-flip"
            />
            {entry.disguiseAs && (
              <span className="reveal-disguise">🎭 → {t(lang, `classes.${entry.disguiseAs}`)}</span>
            )}
          </div>

          <div className="reveal-vs-badge">VS</div>

          <div className="reveal-vs-col">
            <TradingCard
              classKey={entry.guardClass}
              label={t(lang, `classes.${entry.guardClass}`)}
              interactive={false}
              size="lg"
              className="reveal-card-flip"
            />
          </div>
        </div>

        <div className={`reveal-outcome ${prisonersWon ? 'prisoners' : 'guards'}`}>
          {prisonersWon ? '🟢 ' + t(lang, 'game.resultPrisonersWin') : '🔴 ' + t(lang, 'game.resultGuardsWin')}
        </div>

        {entry.prisonerDiscarded && (
          <div className="reveal-note">
            {t(lang, `classes.${entry.prisonerDiscarded}`)} — {t(lang, 'game.eliminated')}
          </div>
        )}

        {entry.escapeCardsRevealed?.length > 0 && (
          <div className="reveal-cards-row">
            {entry.escapeCardsRevealed.map((type, i) => (
              <div key={i} className="reveal-escape-card" style={{ animationDelay: `${0.5 + i * 0.25}s` }}>
                <span className="reveal-escape-icon">{CARD_ICON[type]}</span>
                <span className="reveal-escape-name">{t(lang, `cards.${type}.name`)}</span>
              </div>
            ))}
          </div>
        )}

        <button className="primary-button reveal-continue" onClick={onContinue}>
          {t(lang, 'game.continueButton')}
        </button>
      </div>
    </div>
  );
}
