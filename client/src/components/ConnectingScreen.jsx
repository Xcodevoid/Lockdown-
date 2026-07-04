import { useEffect, useState } from 'react';
import { t } from '../i18n';

export default function ConnectingScreen({ lang }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="connecting-screen">
      <div className="connecting-spinner" aria-hidden="true">
        <span className="spinner-ring" />
        <span className="spinner-icon">🔒</span>
      </div>
      <h2>{t(lang, 'app.connecting')}</h2>
      {slow && <p className="muted connecting-slow-note">{t(lang, 'app.connectingSlow')}</p>}
    </div>
  );
}
