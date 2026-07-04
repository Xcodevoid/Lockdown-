import { useState } from 'react';
import { t } from '../i18n';
import { CLASS_ICON, CARD_ICON } from '../constants';
import WaitingDots from './WaitingDots';

function ClassChooser({ lang, title, desc, options, onChoose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{desc}</p>
        <div className="unit-buttons">
          {options.map((cls) => (
            <button key={cls} className="unit-button" onClick={() => onChoose(cls)}>
              <span className="class-icon big">{CLASS_ICON[cls]}</span>
              <span>{t(lang, `classes.${cls}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecretTunnelOrderer({ lang, cards, onConfirm }) {
  const [order, setOrder] = useState(cards.map((c) => c.type));

  function move(index, dir) {
    const next = order.slice();
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{t(lang, 'game.secretTunnelTitle')}</h2>
        <p>{t(lang, 'game.secretTunnelDescPrisoner')}</p>
        <ol className="tunnel-order-list">
          {order.map((type, i) => (
            <li key={i} className="tunnel-card">
              <span className="card-icon">{CARD_ICON[type]}</span>
              <span>{t(lang, `cards.${type}.name`)}</span>
              <span className="tunnel-move-buttons">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={t(lang, 'game.moveUp')}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label={t(lang, 'game.moveDown')}>▼</button>
              </span>
            </li>
          ))}
        </ol>
        <button className="primary-button" onClick={() => onConfirm(order)}>{t(lang, 'game.confirmOrder')}</button>
      </div>
    </div>
  );
}

function WaitingOnOpponent({ title, desc }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p><WaitingDots label={desc} /></p>
      </div>
    </div>
  );
}

const EVENT_TEXT_KEYS = {
  poison: { title: 'game.poisonTitle', chooserDesc: 'game.poisonDescGuard', waitingDesc: 'game.poisonDescWaiting' },
  riot: { title: 'game.riotTitle', chooserDesc: 'game.riotDesc', waitingDesc: 'game.riotDescWaiting' },
  reinforcements: { title: 'game.reinforcementsTitle', chooserDesc: 'game.reinforcementsDesc', waitingDesc: 'game.reinforcementsDescWaiting' },
};

export default function EventModal({ lang, side, pendingEventInput, onPoisonChoice, onSecretTunnelOrder, onRiotChoice, onReinforcementsChoice }) {
  if (!pendingEventInput) return null;
  const isChooser = pendingEventInput.chooser === side;
  const { type } = pendingEventInput;

  if (type === 'secret_tunnel') {
    if (isChooser) return <SecretTunnelOrderer lang={lang} cards={pendingEventInput.cards} onConfirm={onSecretTunnelOrder} />;
    return <WaitingOnOpponent title={t(lang, 'game.secretTunnelTitle')} desc={t(lang, 'game.secretTunnelDescWaiting')} />;
  }

  const keys = EVENT_TEXT_KEYS[type];
  if (!keys) return null;

  if (!isChooser) return <WaitingOnOpponent title={t(lang, keys.title)} desc={t(lang, keys.waitingDesc)} />;

  const onChoose = type === 'poison' ? onPoisonChoice : type === 'riot' ? onRiotChoice : onReinforcementsChoice;

  return (
    <ClassChooser
      lang={lang}
      title={t(lang, keys.title)}
      desc={t(lang, keys.chooserDesc)}
      options={pendingEventInput.options}
      onChoose={onChoose}
    />
  );
}
