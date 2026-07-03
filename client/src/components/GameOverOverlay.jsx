import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { t } from '../i18n';

function fireConfetti() {
  const colors = ['#e0a34d', '#33c17e', '#f2d49b', '#ffffff'];
  const end = Date.now() + 1600;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 65, startVelocity: 45, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 65, startVelocity: 45, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 130, spread: 100, startVelocity: 55, origin: { y: 0.45 }, colors });
}

export default function GameOverOverlay({ lang, winner, onRematch }) {
  const fired = useRef(false);
  const prisoners = winner === 'prisoners';

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (prisoners) fireConfetti();
  }, [prisoners]);

  return (
    <div className={`gameover-overlay ${prisoners ? 'prisoners' : 'guards'}`}>
      <div className="gameover-stamp">{prisoners ? '🔑' : '🔒'}</div>
      <h1 className="gameover-title">
        {prisoners ? t(lang, 'game.gameOverPrisoners') : t(lang, 'game.gameOverGuards')}
      </h1>
      <button className="primary-button rematch-button" onClick={onRematch}>
        🔁 {t(lang, 'game.rematch')}
      </button>
    </div>
  );
}
