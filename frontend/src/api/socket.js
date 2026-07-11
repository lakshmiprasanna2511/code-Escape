import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

let socket = null;

export function getSocket(token) {
  if (socket && socket.connected && socket.auth?.token === token) return socket;
  if (socket) { socket.disconnect(); socket = null; }
  socket = io(SOCKET_URL, { auth: { token }, autoConnect: true, transports: ['websocket', 'polling'] });
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
