import { useState } from 'react';
import { t } from '../i18n';
import { CLASS_ICON, PRISONER_CLASSES } from '../constants';

export default function UnitPicker({ lang, side, eligible, disguiseTokens, onSubmit, submitLabel }) {
  const [disguiseAs, setDisguiseAs] = useState('');

  return (
    <div className="unit-picker">
      <div className="unit-buttons">
        {eligible.map((cls) => (
          <button key={cls} className="unit-button" onClick={() => onSubmit(cls, disguiseAs || null)}>
            <span className="class-icon big">{CLASS_ICON[cls]}</span>
            <span>{t(lang, `classes.${cls}`)}</span>
          </button>
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
