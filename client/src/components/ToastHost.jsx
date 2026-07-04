import { useEffect, useState } from 'react';
import { subscribeToasts } from '../toast';

const ICON = { info: 'ℹ️', error: '⚠️', success: '✅' };

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration);
    });
  }, []);

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)}>
          <span className="toast-icon">{ICON[t.type] || ICON.info}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
