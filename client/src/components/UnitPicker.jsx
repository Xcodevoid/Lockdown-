import { useState } from 'react';
import { t } from '../i18n';
import { PRISONER_CLASSES } from '../constants';
import TradingCard from './TradingCard';

export default function UnitPicker({ lang, side, eligible, disguiseTokens, classCounts, onSubmit }) {
  const [disguiseAs, setDisguiseAs] = useState('');

  return (
    <div className="unit-picker">
      <div className="unit-buttons">
        {eligible.map((cls) => (
          <TradingCard
            key={cls}
            classKey={cls}
            label={t(lang, `classes.${cls}`)}
            counter={classCounts?.[cls]?.remaining}
            onClick={() => onSubmit(cls, disguiseAs || null)}
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
    </div>
  );
}
