import { t } from '../i18n';
import { ClassIcon, CardIcon } from '../icons';

export default function BattleLog({ lang, log }) {
  return (
    <div className="battle-log">
      <h3>📜 {t(lang, 'game.battleLog')}</h3>
      {log.length === 0 && <p className="muted">{t(lang, 'game.logEmpty')}</p>}
      <ul>
        {log.slice().reverse().map((entry, i) => (
          <li key={log.length - i} className={`log-entry ${entry.winner}`}>
            <span className="log-round">#{entry.round}</span>
            <span className="log-matchup">
              <span className="class-icon"><ClassIcon name={entry.prisonerClass} /></span> {t(lang, `classes.${entry.prisonerClass}`)}
              {entry.disguiseAs && <em> ({t(lang, 'game.disguiseLabel')} {t(lang, `classes.${entry.disguiseAs}`)})</em>}
              {' '}vs{' '}
              <span className="class-icon"><ClassIcon name={entry.guardClass} /></span> {t(lang, `classes.${entry.guardClass}`)}
            </span>
            <span className="log-winner">
              {entry.winner === 'prisoners' ? '🟢' : '🔴'} {entry.winner === 'prisoners' ? t(lang, 'game.resultPrisonersWin') : t(lang, 'game.resultGuardsWin')}
            </span>
            {entry.escapeCardsRevealed?.length > 0 && (
              <span className="log-events">
                {t(lang, 'game.eventRevealed')}:{' '}
                {entry.escapeCardsRevealed.map((type, idx) => (
                  <span key={idx} title={t(lang, `cards.${type}.name`)}><CardIcon name={type} /> </span>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
