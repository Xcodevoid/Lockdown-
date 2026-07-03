import { t } from '../i18n';
import { CLASS_ICON } from '../constants';

export default function ClassStatePanel({ lang, title, classes, classOrder, isPrisonerSide, highlight, currentRound }) {
  return (
    <div className={`class-panel ${isPrisonerSide ? 'prisoners' : 'guards'}`}>
      <h3>{title}</h3>
      <div className="class-chip-row">
        {classOrder.map((cls) => {
          const c = classes[cls];
          const eliminated = isPrisonerSide && c.remaining <= 0;
          const riotRoundsLeft = !isPrisonerSide && c.forcedFatiguedUntilRound >= currentRound
            ? c.forcedFatiguedUntilRound - currentRound + 1
            : 0;
          return (
            <div
              key={cls}
              className={`class-chip ${c.fatigued || riotRoundsLeft > 0 ? 'fatigued' : ''} ${eliminated ? 'eliminated' : ''} ${highlight === cls ? 'highlight' : ''}`}
            >
              <span className="class-icon">{CLASS_ICON[cls]}</span>
              <span className="class-name">{t(lang, `classes.${cls}`)}</span>
              {isPrisonerSide && <span className="class-count">{c.remaining}/4</span>}
              {riotRoundsLeft > 0 ? (
                <span className="class-tag riot-tag">✊ {riotRoundsLeft}</span>
              ) : (
                c.fatigued && <span className="class-tag">{t(lang, 'game.fatigued')}</span>
              )}
              {eliminated && <span className="class-tag eliminated-tag">{t(lang, 'game.eliminated')}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
