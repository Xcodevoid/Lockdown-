import { useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import { STARTING_COUNT } from '../constants';
import { ClassIcon, CardIcon } from '../icons';
import { useFlashOnChange } from '../useFlashOnChange';

// Guards' copy count was never mechanically used (they're never discarded) and was kept at the
// original "4" as flavor text only in the Rules modal - matching that here for consistency.
const GUARD_FLAVOR_COUNT = 4;

// Individual copies rendered as a lineup of small tokens instead of just a number - so a
// defeat reads as "one of your troops just went down" rather than a digit decrementing.
// Guards never deplete (remaining is always full for them), so their roster only ever
// toggles the resting/fatigued look, never loses a token - a visible reminder of the
// permanent-rules asymmetry between the two sides.
function TroopTokens({ classKey, total, remaining, isFatigued, fatigueKnown }) {
  const prevRemaining = useRef(remaining);
  const [fallenIndex, setFallenIndex] = useState(null);

  useEffect(() => {
    if (remaining < prevRemaining.current) {
      setFallenIndex(remaining);
      const timer = setTimeout(() => setFallenIndex(null), 700);
      prevRemaining.current = remaining;
      return () => clearTimeout(timer);
    }
    prevRemaining.current = remaining;
    return undefined;
  }, [remaining]);

  return (
    <div className="troop-tokens">
      {Array.from({ length: total }, (_, i) => {
        const alive = i < remaining;
        return (
          <span
            key={i}
            className={[
              'troop-token',
              alive ? 'alive' : 'fallen',
              alive && isFatigued ? 'resting' : '',
              alive && !fatigueKnown ? 'unknown' : '',
              i === fallenIndex ? 'just-fell' : '',
            ].filter(Boolean).join(' ')}
          >
            <ClassIcon name={classKey} />
          </span>
        );
      })}
    </div>
  );
}

function ClassChip({ lang, cls, c, isPrisonerSide, currentRound, highlightClasses }) {
  const eliminated = isPrisonerSide && c.remaining <= 0;
  // This "until round N" lock now has two possible causes on either side - Riot (Guards only,
  // opponent-imposed) or the Aggressive stance (either side, self-imposed) - so the tag itself
  // stays cause-agnostic and just reports the lock, same as it already did for Riot.
  const lockedRoundsLeft = c.forcedFatiguedUntilRound >= currentRound
    ? c.forcedFatiguedUntilRound - currentRound + 1
    : 0;
  const fatigueKnown = c.fatigued !== null;
  const isFatigued = c.fatigued === true || lockedRoundsLeft > 0;
  const countFlash = useFlashOnChange(c.remaining);
  const isHighlighted = highlightClasses?.includes(cls);
  const rosterTotal = isPrisonerSide ? STARTING_COUNT : GUARD_FLAVOR_COUNT;
  const rosterRemaining = isPrisonerSide ? c.remaining : GUARD_FLAVOR_COUNT;

  return (
    <div
      className={`class-chip ${isFatigued ? 'fatigued' : ''} ${!fatigueKnown ? 'fatigue-unknown' : ''} ${eliminated ? 'eliminated' : ''} ${isHighlighted ? 'highlight' : ''}`}
    >
      <div className="class-chip-top">
        <span className="class-icon"><ClassIcon name={cls} /></span>
        <span className="class-name">{t(lang, `classes.${cls}`)}</span>
        {isPrisonerSide && (
          <span className={`class-count ${countFlash ? 'value-flash' : ''}`}>{c.remaining}/{STARTING_COUNT}</span>
        )}
        {lockedRoundsLeft > 0 ? (
          <span className="class-tag riot-tag"><CardIcon name="lockdown" /> {lockedRoundsLeft}</span>
        ) : !fatigueKnown ? (
          <span className="class-tag unknown-tag" title={t(lang, 'game.fatigueHiddenTooltip')}>?</span>
        ) : (
          c.fatigued && <span className="class-tag">{t(lang, 'game.fatigued')}</span>
        )}
        {eliminated && <span className="class-tag eliminated-tag">{t(lang, 'game.eliminated')}</span>}
      </div>
      <TroopTokens classKey={cls} total={rosterTotal} remaining={rosterRemaining} isFatigued={isFatigued} fatigueKnown={fatigueKnown} />
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
