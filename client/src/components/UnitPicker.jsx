import { useState } from 'react';
import { t } from '../i18n';
import { PRISONER_CLASSES } from '../constants';
import { StanceIcon } from '../icons';
import TradingCard from './TradingCard';

const STANCES = ['standard', 'aggressive', 'cautious'];

export default function UnitPicker({ lang, side, eligible, disguiseTokens, classCounts, onSubmit }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [stance, setStance] = useState('standard');
  const [disguiseAs, setDisguiseAs] = useState('');

  const stanceDescKey = side === 'prisoners' ? 'descPrisoners' : 'descGuards';
  const stanceDesc = (st) => t(lang, `stances.${st}.${st === 'standard' ? 'desc' : stanceDescKey}`);

  return (
    <div className="unit-picker">
      <div className="unit-buttons">
        {eligible.map((cls) => (
          <TradingCard
            key={cls}
            classKey={cls}
            label={t(lang, `classes.${cls}`)}
            counter={classCounts?.[cls]?.remaining}
            selected={selectedClass === cls}
            onClick={() => setSelectedClass(cls)}
          />
        ))}
      </div>

      {side === 'prisoners' && disguiseTokens > 0 && (
        <label className="disguise-select">
          {t(lang, 'game.disguiseLabel')}:
          <select value={disguiseAs} onChange={(e) => setDisguiseAs(e.target.value)}>
            <option value="">{t(lang, 'game.disguiseNone')}</option>
            {PRISONER_CLASSES.map((cls) => (
              <option key={cls} value={cls}>{t(lang, `classes.${cls}`)}</option>
            ))}
          </select>
        </label>
      )}

      {selectedClass && (
        <div className="stance-picker">
          <p className="stance-picker-label">{t(lang, 'stances.chooseStance')}</p>
          <div className="stance-buttons">
            {STANCES.map((st) => (
              <button
                key={st}
                type="button"
                className={`stance-option ${stance === st ? 'selected' : ''}`}
                onClick={() => setStance(st)}
              >
                <span className="stance-option-icon"><StanceIcon name={st} /></span>
                <span className="stance-option-name">{t(lang, `stances.${st}.name`)}</span>
              </button>
            ))}
          </div>
          <p className="stance-picker-desc">{stanceDesc(stance)}</p>

          <button
            type="button"
            className="primary-button lock-in-button"
            onClick={() => onSubmit(selectedClass, disguiseAs || null, stance)}
          >
            {t(lang, 'stances.lockIn')}
          </button>
        </div>
      )}
    </div>
  );
}
