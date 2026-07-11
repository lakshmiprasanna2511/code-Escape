import { useState } from 'react';
import { useStore, getRank, CODING_LEVELS } from '../store/useStore.js';
import { APT_LEVELS, ENG_LEVELS } from '../data/quizData.js';
import RoomModal from '../components/RoomModal.jsx';

export default function Home() {
  const user = useStore((s) => s.user);
  const game = useStore((s) => s.game);
  const goto = useStore((s) => s.goto);
  const toast = useStore((s) => s.toast);
  const setGame = useStore((s) => s.setGame);
  const logout = useStore((s) => s.logout);

  const [tab, setTab] = useState(game.curTab || 'code');
  const [roomOpen, setRoomOpen] = useState(false);

  if (!user) { goto('landing'); return null; }

  function selectCodeLevel(idx) {
    if (idx > 0 && !game.lvDone[idx - 1]) { toast('Complete Level ' + idx + ' first!'); return; }
    setGame({ lvl: idx, curTab: 'code' });
    goto('game');
  }
  function selectQuizLevel(cat, idx) {
    setGame({ lvl: idx, curTab: cat, quizCat: cat, quizLvlIdx: idx, quizStart: true });
    goto('game');
  }
  function enterFacility() {
    if (tab === 'code') { setGame({ curTab: 'code' }); goto('game'); }
    else selectQuizLevel(tab, 0);
  }

  const solvedLevels = game.lvDone.filter(Boolean).length;
  const acc = game.att > 0 ? Math.round((game.corr / game.att) * 100) : 0;

  return (
    <div className="home-wrap">
      <div className="home-content">
        <div className="user-pill" onClick={() => goto('dashboard')}>
          <div className="pill-av">{user.avatar}</div>
          <div className="pill-name">{user.username.toUpperCase()}</div>
          <div className="pill-rank">{getRank(game.score)}</div>
          <button className="pill-logout" onClick={(e) => { e.stopPropagation(); logout(); }}>LOGOUT</button>
        </div>

        <div className="top-badge"><span className="dot" /> ESCAPE ROOM PROTOCOL v3.0 <span className="dot" /></div>
        <div className="home-title pixel">CODE<span>ESCAPE</span></div>
        <div className="home-sub">SOLVE CODE. BREAK FREE. LEVEL UP.</div>

        <div className="home-tabs">
          <button className={`htab${tab === 'code' ? ' active' : ''}`} onClick={() => setTab('code')}>💻 CODING</button>
          <button className={`htab${tab === 'apt' ? ' active' : ''}`} onClick={() => setTab('apt')}>🧠 APTITUDE</button>
          <button className={`htab${tab === 'eng' ? ' active' : ''}`} onClick={() => setTab('eng')}>📖 ENGLISH</button>
        </div>

        <div className="lv-grid">
          {tab === 'code' && CODING_LEVELS.map((l) => {
            const unl = l.id === 1 || game.lvDone[l.id - 2];
            const dn = game.lvDone[l.id - 1];
            return (
              <div key={l.id} className={`lv-card cat-code${!unl ? ' locked' : ''}${dn ? ' done' : ''}`} onClick={() => selectCodeLevel(l.id - 1)}>
                <span className="cat-tag code">CODING</span>
                {!unl ? <div className="lv-icon">🔒</div> : dn ? <div className="lv-icon">✓</div> : null}
                <div className="lv-num">{String(l.id).padStart(2, '0')}</div>
                <div className="lv-name">{l.name}</div>
                <div className="lv-lang">{l.lang.toUpperCase()}</div>
                <div className={`lv-diff diff-${l.diff}`}>{l.diff.toUpperCase()}</div>
              </div>
            );
          })}
          {tab === 'apt' && APT_LEVELS.map((l, i) => {
            const dn = game.quizAptDone[i];
            return (
              <div key={l.id} className={`lv-card cat-apt${dn ? ' done' : ''}`} onClick={() => selectQuizLevel('apt', i)}>
                <span className="cat-tag apt">APTITUDE</span>
                {dn && <div className="lv-icon">✓</div>}
                <div className="lv-num" style={{ fontSize: '1.2rem' }}>{l.id}</div>
                <div className="lv-name">{l.name}</div>
                <div className="lv-lang" style={{ background: 'rgba(255,204,0,.1)', borderColor: 'rgba(255,204,0,.3)', color: 'var(--amber)' }}>5 QUESTIONS</div>
                <div className={`lv-diff diff-${l.diff}`}>{l.diff.toUpperCase()}</div>
              </div>
            );
          })}
          {tab === 'eng' && ENG_LEVELS.map((l, i) => {
            const dn = game.quizEngDone[i];
            return (
              <div key={l.id} className={`lv-card cat-eng${dn ? ' done' : ''}`} onClick={() => selectQuizLevel('eng', i)}>
                <span className="cat-tag eng">ENGLISH</span>
                {dn && <div className="lv-icon">✓</div>}
                <div className="lv-num" style={{ fontSize: '1.2rem' }}>{l.id}</div>
                <div className="lv-name">{l.name}</div>
                <div className="lv-lang" style={{ background: 'rgba(185,103,255,.1)', borderColor: 'rgba(185,103,255,.3)', color: 'var(--purple)' }}>5 QUESTIONS</div>
                <div className={`lv-diff diff-${l.diff}`}>{l.diff.toUpperCase()}</div>
              </div>
            );
          })}
        </div>

        <div className="home-actions">
          <button className="btn-start" onClick={enterFacility}>[ ENTER FACILITY ]</button>
          <button className="btn-room" onClick={() => setRoomOpen(true)}>👥 PLAY WITH FRIENDS</button>
        </div>

        <div className="stat-bar">
          <div>LEVELS<b>{solvedLevels}/6</b></div>
          <div>SCORE<b>{game.score}</b></div>
          <div>ACCURACY<b>{acc}%</b></div>
          <div>ROOM<b>{game.room ? game.room.code : '—'}</b></div>
        </div>
      </div>

      {roomOpen && <RoomModal onClose={() => setRoomOpen(false)} />}
    </div>
  );
}
