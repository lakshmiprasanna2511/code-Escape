import { useStore } from '../store/useStore.js';

export default function Landing() {
  const goto = useStore((s) => s.goto);
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="brand" style={{ fontSize: '1.3rem' }}>CODE<span>ESCAPE</span></div>
        <div className="brand-tag">SOLVE CODE &bull; BREAK FREE &bull; LEVEL UP</div>
        <div style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.9, margin: '1.6rem 0 2rem', fontFamily: 'var(--f-mono)' }}>
          A gamified escape room where coding challenges, aptitude puzzles &amp; English riddles are your keys.
          <br /><br />Solve to unlock doors, terminals &amp; vaults. Play solo or with friends.
        </div>
        <button className="btn-primary" onClick={() => goto('signup')}>CREATE ACCOUNT</button>
        <button className="btn-outline" onClick={() => goto('login')}>SIGN IN</button>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.6rem', fontSize: 10, color: 'var(--text3)', flexWrap: 'wrap', fontFamily: 'var(--f-mono)' }}>
          <span>🎮 6+ LEVELS</span><span>🧠 3 CATEGORIES</span><span>👥 MULTIPLAYER</span><span>🏆 LEADERBOARD</span>
        </div>
      </div>
    </div>
  );
}
