import { Suspense, lazy, useState } from 'react';
import { t } from '../i18n';
import { PRISONER_CLASSES } from '../constants';

// Lazy-loaded so Three.js only ever gets fetched once a player actually reaches an active
// game's choosing phase - the Home page and lobby never need to pay for this bundle weight.
const PrisonYard = lazy(() => import('../three/PrisonYard.jsx'));

const SIDE_COLOR = { prisoners: '#f2b84f', guards: '#85a6db' };

export default function UnitPicker({ lang, side, eligible, disguiseTokens, classCounts, onSubmit }) {
  const [disguiseAs, setDisguiseAs] = useState('');

  const options = eligible.map((cls) => ({ cls, label: t(lang, `classes.${cls}`) }));

  return (
    <div className="unit-picker">
      <p className="muted yard-hint">{t(lang, 'game.walkToChoose')}</p>
      <div className="prison-yard-frame">
        <Suspense fallback={<div className="yard-loading"><span className="inline-spinner" /></div>}>
          <PrisonYard
            key={eligible.join(',')}
            options={options}
            side={side}
            color={SIDE_COLOR[side]}
            onCommit={(cls) => onSubmit(cls, disguiseAs || null)}
          />
        </Suspense>
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
