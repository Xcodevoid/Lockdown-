let listeners = [];
let idCounter = 0;

export function showToast(message, type = 'info', duration = 3200) {
  const id = ++idCounter;
  const toast = { id, message, type, duration };
  listeners.forEach((l) => l(toast));
  return id;
}

export function subscribeToasts(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
