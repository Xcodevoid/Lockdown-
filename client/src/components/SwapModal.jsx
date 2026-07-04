import { t } from '../i18n';
import TradingCard from './TradingCard';

export default function SwapModal({ lang, myChoice, eligible, onSwap }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>🔄 {t(lang, 'game.swapTitle')}</h2>
        <p>{t(lang, 'game.swapDesc')}</p>
        <p className="current-choice">{t(lang, 'game.youChose')}:</p>
        <div className="unit-buttons">
          <TradingCard classKey={myChoice} label={t(lang, `classes.${myChoice}`)} interactive={false} size="sm" />
        </div>
        <p className="current-choice">↓</p>
        <div className="unit-buttons">
          {eligible.filter((c) => c !== myChoice).map((cls) => (
            <TradingCard key={cls} classKey={cls} label={t(lang, `classes.${cls}`)} onClick={() => onSwap(cls)} />
          ))}
        </div>
        <button className="primary-button" onClick={() => onSwap(null)}>{t(lang, 'game.swapKeep')}</button>
      </div>
    </div>
  );
}
