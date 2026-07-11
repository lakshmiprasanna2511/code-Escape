import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CODING_LEVELS } from '../data/codingLevels.js';
import { authApi } from '../api/auth.js';
import { gameApi, leaderboardApi } from '../api/game.js';
import { setAuthToken } from '../api/client.js';

export const AVATARS = ['🤖', '👾', '🕵️', '💀', '🦾', '🧬', '🔮', '⚡', '🛸', '🎭'];
export const RANKS = [[0, 'RECRUIT'], [500, 'CADET'], [1200, 'AGENT'], [2500, 'SPECIALIST'], [5000, 'HACKER'], [10000, 'GHOST']];

export function getRank(score) {
  let r = RANKS[0][1];
  for (const [m, n] of RANKS) if (score >= m) r = n;
  return r;
}

const initialGame = {
  score: 0, solved: 0, att: 0, corr: 0,
  lvl: 0, tPlayed: 0,
  lStats: { python: 0, java: 0, cpp: 0, c: 0, sql: 0, js: 0 },
  lvDone: Array(6).fill(false),
  objDone: {},
  curTab: 'code',
  aptScore: 0, engScore: 0,
  quizAptDone: Array(3).fill(false),
  quizEngDone: Array(3).fill(false),
  room: null,
  isMultiplayer: false,
};

let syncTimer = null;

export const useStore = create(
  persist(
    (set, get) => ({
      // ── navigation
      screen: 'landing',
      goto: (screen) => set({ screen }),

      // ── boot / hydration status
      booted: false,
      backendOnline: null, // null=unknown, true/false once checked

      // ── toast
      toasts: [],
      toast: (msg) => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { id, msg }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 2600);
      },

      // ── auth temp state (signup wizard)
      tmp: {},
      setTmp: (patch) => set((s) => ({ tmp: { ...s.tmp, ...patch } })),
      clearTmp: () => set({ tmp: {} }),

      // ── auth
      token: null,
      user: null,
      setUser: (user) => set({ user }),

      init: async () => {
        const { token } = get();
        if (token) setAuthToken(token);
        if (!token) { set({ booted: true }); return; }
        try {
          const data = await authApi.me();
          set({ user: data.user, game: { ...initialGame, ...normalizeGame(data.game) }, booted: true, backendOnline: true, screen: 'home' });
        } catch (err) {
          // token invalid/expired or backend unreachable — fall back to landing
          setAuthToken(null);
          set({ token: null, user: null, booted: true, backendOnline: false });
        }
      },

      signup: async ({ method, email, phone, password }) => {
        const data = await authApi.signup({ method, email, phone, password });
        set((s) => ({ tmp: { ...s.tmp, pendingId: data.pendingId, contact: data.contact, otp: data.otp, method, email, phone, password } }));
        return data;
      },
      resendOtp: async () => {
        const { tmp } = get();
        const data = await authApi.resendOtp(tmp.pendingId);
        set((s) => ({ tmp: { ...s.tmp, otp: data.otp } }));
        return data;
      },
      verifyOtp: async (code) => {
        const { tmp } = get();
        const data = await authApi.verifyOtp(tmp.pendingId, code);
        set((s) => ({ tmp: { ...s.tmp, setupToken: data.setupToken, verified: true } }));
        return data;
      },
      completeProfile: async ({ username, displayName, avatar, langs, exp, bio }) => {
        const { tmp } = get();
        const data = await authApi.profileSetup({ setupToken: tmp.setupToken, username, displayName, avatar, langs, exp, bio });
        setAuthToken(data.token);
        set({ token: data.token, user: data.user, game: { ...initialGame, ...normalizeGame(data.game) }, tmp: {} });
        return data;
      },
      login: async ({ method, email, phone, password }) => {
        const data = await authApi.login({ method, email, phone, password });
        setAuthToken(data.token);
        set({ token: data.token, user: data.user, game: { ...initialGame, ...normalizeGame(data.game) } });
        return data;
      },
      guestLogin: async () => {
        const data = await authApi.guest();
        setAuthToken(data.token);
        set({ token: data.token, user: data.user, game: { ...initialGame, ...normalizeGame(data.game) } });
        return data;
      },
      logout: () => {
        setAuthToken(null);
        set({ user: null, token: null, game: initialGame, tmp: {}, screen: 'landing' });
      },

      // ── game state
      game: initialGame,
      setGame: (patch) => { set((s) => ({ game: { ...s.game, ...patch } })); get().queueSync(); },
      addScore: (delta) => { set((s) => ({ game: { ...s.game, score: Math.max(0, s.game.score + delta) } })); get().queueSync(); },

      markObjDone: (lvl, obj) => {
        set((s) => {
          const key = `${lvl}-${obj}`;
          const objDone = { ...s.game.objDone, [key]: true };
          const lvDone = [...s.game.lvDone];
          if (['door', 'terminal', 'vault'].every((o) => objDone[`${lvl}-${o}`])) lvDone[lvl] = true;
          return { game: { ...s.game, objDone, lvDone, solved: s.game.solved + 1 } };
        });
        get().queueSync();
      },

      incLangStat: (lang) => {
        set((s) => ({ game: { ...s.game, lStats: { ...s.game.lStats, [lang]: (s.game.lStats[lang] || 0) + 1 } } }));
        get().queueSync();
      },

      recordAttempt: (correct) => {
        set((s) => ({ game: { ...s.game, att: s.game.att + 1, corr: s.game.corr + (correct ? 1 : 0) } }));
        get().queueSync();
      },

      markQuizDone: (cat, idx) => {
        set((s) => {
          if (cat === 'apt') {
            const arr = [...s.game.quizAptDone]; arr[idx] = true;
            return { game: { ...s.game, quizAptDone: arr } };
          }
          const arr = [...s.game.quizEngDone]; arr[idx] = true;
          return { game: { ...s.game, quizEngDone: arr } };
        });
        get().queueSync();
      },

      // debounced persistence to backend
      queueSync: () => {
        if (!get().token) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => { get().syncGameNow(); }, 900);
      },
      syncGameNow: async () => {
        const { token, game } = get();
        if (!token) return;
        try {
          const { score, solved, att, corr, tPlayed, lStats, lvDone, objDone, aptScore, engScore, quizAptDone, quizEngDone } = game;
          await gameApi.saveState({ score, solved, att, corr, tPlayed, lStats, lvDone, objDone, aptScore, engScore, quizAptDone, quizEngDone });
          set({ backendOnline: true });
        } catch (err) {
          set({ backendOnline: false });
        }
      },

      // ── leaderboard
      leaderboard: [],
      fetchLeaderboard: async () => {
        try {
          const data = await leaderboardApi.top(20);
          set({ leaderboard: data.leaderboard || [] });
        } catch (err) {
          // leave last-known leaderboard in place
        }
      },

      // ── room / multiplayer (REST create, socket.io drives realtime state — see RoomModal)
      setRoom: (room) => set((s) => ({ game: { ...s.game, room, isMultiplayer: !!room } })),
      leaveRoom: () => set((s) => ({ game: { ...s.game, room: null, isMultiplayer: false } })),
    }),
    {
      name: 'codeescape-react-store',
      partialize: (s) => ({ token: s.token, user: s.user, game: s.game }),
    }
  )
);

function normalizeGame(g) {
  if (!g) return {};
  return {
    ...g,
    objDone: g.objDone || {},
    lStats: g.lStats || { python: 0, java: 0, cpp: 0, c: 0, sql: 0, js: 0 },
    lvDone: g.lvDone && g.lvDone.length ? g.lvDone : Array(6).fill(false),
    quizAptDone: g.quizAptDone && g.quizAptDone.length ? g.quizAptDone : Array(3).fill(false),
    quizEngDone: g.quizEngDone && g.quizEngDone.length ? g.quizEngDone : Array(3).fill(false),
  };
}

export { CODING_LEVELS };
