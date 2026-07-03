import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export const socket = io(URL, { autoConnect: false });

export function emitAsync(event, payload) {
  return new Promise((resolve) => {
    socket.emit(event, payload, resolve);
  });
}

export function getOrCreateToken() {
  let token = localStorage.getItem('lockdown.token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('lockdown.token', token);
  }
  return token;
}
