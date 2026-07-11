import { useEffect } from 'react';
import { useStore, getRank } from '../store/useStore.js';

const LANGS = [
  { n: 'Python', k: 'python', c: 'var(--green)' },
  { n: 'Java', k: 'java', c: 'var(--blue)' },
  { n: 'C++', k: 'cpp', c: 'var(--purple)' },
  { n: 'C', k: 'c', c: 'var(--amber)' },
  { n: 'SQL', k: 'sql', c: 'var(--red)' },
  { n: 'Aptitude', k: 'apt', c: '#ff9500' },
  { n: 'English', k: 'eng', c: 'var(--blue)' },
];

export default function Dashboard() {
  const user = useStore((s) => s.user);
  const game = useStore((s) => s.game);
  const goto = useStore((s) => s.goto);
  const logout = useStore((s) => s.logout);
  const leaderboard = useStore((s) => s.leaderboard);
  const fetchLeaderboard = useStore((s) => s.fetchLeaderboard);
  const syncGameNow = useStore((s) => s.syncGameNow);

  useEffect(() => { fetchLeaderboard(); syncGameNow(); }, []); // eslint-disable-line

  if (!user) { goto('landing'); return null; }

  const acc = game.att > 0 ? Math.round((game.corr / game.att) * 100) : 0;
  const lStats = { ...game.lStats, apt: game.quizAptDone.filter(Boolean).length, eng: game.quizEngDone.filter(Boolean).length };
  const maxStat = Math.max(...LANGS.map((l) => lStats[l.k] || 0), 1);

  const rankClass = (r) => (r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : '');

  return (
    <div className="dash-wrap">
      <div className="dash-hdr">
        <div className="dash-av">{user.avatar}</div>
        <div>
          <div className="dash-name">{user.displayName || user.username}</div>
          <div className="dash-handle">@{user.username}</div>
          <div className="dash-contact">
            {user.email && <span>📧 {user.email}</span>}
            {user.phone && <span>📱 {user.phone}</span>}
            {user.joinedAt && <span>📅 Joined {user.joinedAt}</span>}
            {user.verified && <span style={{ color: 'var(--green)' }}>✓ Verified</span>}
          </div>
          <div className="dash-badges">
            {(user.langs || []).map((l) => <span className="dbdg lang" key={l}>{l.toUpperCase()}</span>)}
            <span className="dbdg rnk">{getRank(game.score)}</span>
            {user.exp && <span className="dbdg exp">{user.exp.toUpperCase()}</span>}
          </div>
        </div>
        <div className="dash-back-col">
          <button className="hud-btn" onClick={() => goto('game')}>← BACK TO ROOM</button>
          <button className="hud-btn" onClick={() => goto('home')}>HOME</button>
          <button className="hud-btn" style={{ color: 'var(--red)', borderColor: 'var(--red-dim)' }} onClick={logout}>LOGOUT</button>
        </div>
      </div>

      <div className="dgrid-3">
        <div className="dcard"><div className="dcard-title">PROBLEMS SOLVED</div><div className="dcard-big">{game.solved}</div><div className="dcard-sub">coding + quiz</div></div>
        <div className="dcard"><div className="dcard-title">ACCURACY RATE</div><div className="dcard-big" style={{ color: 'var(--amber)' }}>{acc}%</div><div className="dcard-sub">correct / total attempts</div></div>
        <div className="dcard"><div className="dcard-title">TOTAL SCORE</div><div className="dcard-big" style={{ color: 'var(--blue)' }}>{game.score}</div><div className="dcard-sub">{getRank(game.score)}</div></div>
      </div>

      <div className="dgrid">
        <div className="dcard">
          <div className="dcard-title">TIME PLAYED</div>
          <div className="dcard-big" style={{ color: 'var(--purple)' }}>{Math.floor(game.tPlayed / 60)}m</div>
          <div className="dcard-sub">total in-game time</div>
        </div>
        <div className="dcard">
          <div className="dcard-title">QUIZ PERFORMANCE</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.3rem', color: 'var(--amber)' }}>{game.aptScore || 0}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--f-mono)' }}>APTITUDE</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.3rem', color: 'var(--purple)' }}>{game.engScore || 0}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--f-mono)' }}>ENGLISH</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dgrid">
        <div className="dcard">
          <div className="dcard-title">BY LANGUAGE</div>
          {LANGS.map((l) => (
            <div className="bar-row" key={l.k}>
              <div className="bar-label">{l.n}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(((lStats[l.k] || 0) / maxStat) * 100)}%`, background: l.c }} /></div>
              <div className="bar-count">{lStats[l.k] || 0}</div>
            </div>
          ))}
        </div>
        <div className="dcard">
          <div className="dcard-title">CHALLENGE HISTORY</div>
          <div className="history-grid">
            {Array.from({ length: 18 }, (_, i) => {
              const lvl = Math.floor(i / 3), ob = ['door', 'terminal', 'vault'][i % 3];
              const dn = game.objDone[`${lvl}-${ob}`];
              return <div className={`history-cell${dn ? ' done' : ''}`} key={i}>{dn ? '✓' : i + 1}</div>;
            })}
          </div>
        </div>
      </div>

      <div className="dcard" style={{ marginBottom: '1.5rem' }}>
        <div className="dcard-title">GLOBAL LEADERBOARD</div>
        {leaderboard.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--text3)', padding: '8px 0' }}>No scores yet — be the first to solve a challenge!</div>}
        {leaderboard.map((e) => (
          <div className="lb-row" key={e.username}>
            <div className={`lb-rank ${rankClass(e.rank)}`}>{e.rank <= 3 ? ['⬡', '○', '△'][e.rank - 1] : e.rank}</div>
            <div className="lb-name">{e.username === user.username ? <b style={{ color: 'var(--green)' }}>{e.avatar} {e.username}</b> : `${e.avatar} ${e.username}`}</div>
            <div className="lb-score">{e.score.toLocaleString()}</div>
            <div className={`lb-badge ${e.badge}`}>{e.badge.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
