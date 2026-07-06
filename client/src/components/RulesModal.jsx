import { t } from '../i18n';
import { CardIcon } from '../icons';

const CARD_ORDER = [
  'key_fragment',
  'lockdown',
  'poison',
  'secret_tunnel',
  'smuggled_tools',
  'barricade',
  'blackout',
  'disguise',
  'shift_rotation',
  'riot',
  'reinforcements',
];

export default function RulesModal({ lang, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal rules-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t(lang, 'rules.title')}</h2>
          <button className="icon-button" onClick={onClose} aria-label={t(lang, 'rules.close')}>✕</button>
        </div>

        <section>
          <h3>{t(lang, 'rules.objective')}</h3>
          <p>{t(lang, 'rules.objectivePrisoners')}</p>
          <p>{t(lang, 'rules.objectiveGuards')}</p>
        </section>

        <section>
          <h3>{t(lang, 'rules.setup')}</h3>
          <p>{t(lang, 'rules.setupPrisoners')}</p>
          <p>{t(lang, 'rules.setupGuards')}</p>
          <p className="rules-note">{t(lang, 'rules.setupNote')}</p>
          <p>{t(lang, 'rules.setupDeck')}</p>
        </section>

        <section>
          <h3>{t(lang, 'rules.round')}</h3>
          <ol>
            {t(lang, 'rules.roundSteps').map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>

        <section>
          <h3>{t(lang, 'rules.stancesTitle')}</h3>
          <p>{t(lang, 'rules.stancesIntro')}</p>
          <ul>
            {t(lang, 'rules.stancesList').map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </section>

        <section>
          <h3>{t(lang, 'rules.permanent')}</h3>
          <ul>
            {t(lang, 'rules.permanentList').map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </section>

        <section>
          <h3>{t(lang, 'rules.combat')}</h3>
          <table className="rules-table">
            <thead><tr><th>{t(lang, 'rules.combatPrisonerHeader')}</th><th></th></tr></thead>
            <tbody>
              {t(lang, 'rules.combatRows').map(([a, b], i) => (
                <tr key={i}><td>{a}</td><td>{b}</td></tr>
              ))}
            </tbody>
          </table>
          <table className="rules-table">
            <thead><tr><th>{t(lang, 'rules.combatGuardHeader')}</th><th></th></tr></thead>
            <tbody>
              {t(lang, 'rules.combatGuardRows').map(([a, b], i) => (
                <tr key={i}><td>{a}</td><td>{b}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="rules-note">{t(lang, 'rules.combatNote')}</p>
        </section>

        <section>
          <h3>{t(lang, 'rules.escapeDeckTitle')}</h3>
          <ul className="card-list">
            {CARD_ORDER.map((type) => (
              <li key={type}>
                <span className="card-icon"><CardIcon name={type} /></span>
                <strong>{t(lang, `cards.${type}.name`)}</strong> — {t(lang, `cards.${type}.desc`)}
              </li>
            ))}
          </ul>
        </section>

        <button className="primary-button" onClick={onClose}>{t(lang, 'rules.close')}</button>
      </div>
    </div>
  );
}
