import { api } from './client.js';

export const gameApi = {
  getState: () => api.get('/game/state'),
  saveState: (game) => api.put('/game/state', game),
  reset: () => api.post('/game/reset', {}),
};

export const leaderboardApi = {
  top: (limit = 20) => api.get(`/leaderboard?limit=${limit}`, { auth: false }),
};

export const roomApi = {
  create: (cat, maxPlayers) => api.post('/rooms', { cat, maxPlayers }),
  join: (code) => api.post(`/rooms/${code}/join`, {}),
  get: (code) => api.get(`/rooms/${code}`),
};
