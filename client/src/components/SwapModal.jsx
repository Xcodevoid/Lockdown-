import { t } from '../i18n';
import { CLASS_ICON } from '../constants';

export default function SwapModal({ lang, myChoice, eligible, onSwap }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>🔄 {t(lang, 'game.swapTitle')}</h2>
        <p>{t(lang, 'game.swapDesc')}</p>
        <p className="current-choice">
          {t(lang, 'game.youChose')}: <span className="class-icon">{CLASS_ICON[myChoice]}</span> {t(lang, `classes.${myChoice}`)}
        </p>
        <div className="unit-buttons">
          {eligible.filter((c) => c !== myChoice).map((cls) => (
            <button key={cls} className="unit-button" onClick={() => onSwap(cls)}>
              <span className="class-icon big">{CLASS_ICON[cls]}</span>
              <span>{t(lang, `classes.${cls}`)}</span>
            </button>
          ))}
        </div>
        <button className="primary-button" onClick={() => onSwap(null)}>{t(lang, 'game.swapKeep')}</button>
      </div>
    </div>
  );
}
