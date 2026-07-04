import { t } from '../i18n';
import { STARTING_COUNT } from '../constants';
import { ClassIcon, CardIcon } from '../icons';
import { useFlashOnChange } from '../useFlashOnChange';

function ClassChip({ lang, cls, c, isPrisonerSide, currentRound, highlightClasses }) {
  const eliminated = isPrisonerSide && c.remaining <= 0;
  const riotRoundsLeft = !isPrisonerSide && c.forcedFatiguedUntilRound >= currentRound
    ? c.forcedFatiguedUntilRound - currentRound + 1
    : 0;
  const fatigueKnown = c.fatigued !== null;
  const isFatigued = c.fatigued === true || riotRoundsLeft > 0;
  const countFlash = useFlashOnChange(c.remaining);
  const isHighlighted = highlightClasses?.includes(cls);

  return (
    <div
      className={`class-chip ${isFatigued ? 'fatigued' : ''} ${!fatigueKnown ? 'fatigue-unknown' : ''} ${eliminated ? 'eliminated' : ''} ${isHighlighted ? 'highlight' : ''}`}
    >
      <span className="class-icon"><ClassIcon name={cls} /></span>
      <span className="class-name">{t(lang, `classes.${cls}`)}</span>
      {isPrisonerSide && (
        <span className={`class-count ${countFlash ? 'value-flash' : ''}`}>{c.remaining}/{STARTING_COUNT}</span>
      )}
      {riotRoundsLeft > 0 ? (
        <span className="class-tag riot-tag"><CardIcon name="riot" /> {riotRoundsLeft}</span>
      ) : !fatigueKnown ? (
        <span className="class-tag unknown-tag" title={t(lang, 'game.fatigueHiddenTooltip')}>?</span>
      ) : (
        c.fatigued && <span className="class-tag">{t(lang, 'game.fatigued')}</span>
      )}
      {eliminated && <span className="class-tag eliminated-tag">{t(lang, 'game.eliminated')}</span>}
    </div>
  );
}

export default function ClassStatePanel({ lang, title, classes, classOrder, isPrisonerSide, highlightClasses, currentRound }) {
  const isOpponentView = classOrder.some((cls) => classes[cls].fatigued === null);

  return (
    <div className={`class-panel ${isPrisonerSide ? 'prisoners' : 'guards'}`}>
      <h3>{title}</h3>
      {isOpponentView && <p className="fatigue-hidden-note">{t(lang, 'game.fatigueHiddenNote')}</p>}
      <div className="class-chip-row">
        {classOrder.map((cls) => (
          <ClassChip
            key={cls}
            lang={lang}
            cls={cls}
            c={classes[cls]}
            isPrisonerSide={isPrisonerSide}
            currentRound={currentRound}
            highlightClasses={highlightClasses}
          />
        ))}
      </div>
    </div>
  );
}
