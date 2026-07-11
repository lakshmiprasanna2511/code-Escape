import { useEffect, useRef, useState } from 'react';
import { useStore, CODING_LEVELS } from '../store/useStore.js';
import { APT_LEVELS, ENG_LEVELS } from '../data/quizData.js';
import CodePanel from '../components/CodePanel.jsx';
import QuizPanel from '../components/QuizPanel.jsx';
import PuzzleModal from '../components/PuzzleModal.jsx';
import SuccessOverlay from '../components/SuccessOverlay.jsx';
import PuzzleObject3D from '../components/PuzzleObject3D.jsx';
import { getSocket } from '../api/socket.js';

export default function Game() {
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const game = useStore((s) => s.game);
  const goto = useStore((s) => s.goto);
  const toast = useStore((s) => s.toast);
  const setGame = useStore((s) => s.setGame);
  const addScore = useStore((s) => s.addScore);
  const markObjDone = useStore((s) => s.markObjDone);
  const markQuizDone = useStore((s) => s.markQuizDone);
  const setRoom = useStore((s) => s.setRoom);

  const isQuiz = game.curTab === 'apt' || game.curTab === 'eng';
  const quizLevels = game.curTab === 'apt' ? APT_LEVELS : ENG_LEVELS;

  const [lang, setLang] = useState(CODING_LEVELS[game.lvl]?.lang || 'python');
  const [curObj, setCurObj] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(null); // { title, sub, xp }
  const [tLeft, setTLeft] = useState(isQuiz ? 180 : 300 + game.lvl * 60);
  const [hintsUsed, setHintsUsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) { goto('landing'); return; }
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTLeft((t) => {
        if (t <= 1) {
          addScore(-100);
          toast('⏰ Time up! -100 pts.');
          return isQuiz ? 180 : 300 + game.lvl * 60;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line

  // keep the live room scoreboard in sync while inside the game
  useEffect(() => {
    if (!game.isMultiplayer) return undefined;
    const socket = getSocket(token);
    const onState = (room) => setRoom(room);
    const onToast = ({ message }) => toast(message);
    socket.on('room:state', onState);
    socket.on('room:toast', onToast);
    return () => {
      socket.off('room:state', onState);
      socket.off('room:toast', onToast);
    };
  }, [game.isMultiplayer, token]); // eslint-disable-line

  function broadcastScore(nextScore) {
    if (!game.isMultiplayer || !game.room) return;
    getSocket(token).emit('room:score', { code: game.room.code, score: nextScore });
  }

  const lv = !isQuiz ? CODING_LEVELS[game.lvl] : null;

  function openObject(objKey) {
    if (game.objDone[`${game.lvl}-${objKey}`]) { toast('✓ Already solved!'); return; }
    setCurObj(objKey);
    setModalOpen(true);
  }

  function handleCodeSolved(objKey, xp) {
    markObjDone(game.lvl, objKey);
    broadcastScore(game.score + xp);
    const o = lv.objs[objKey];
    setSuccess({ title: objKey === 'door' ? 'DOOR UNLOCKED' : 'ACCESS GRANTED', sub: `${o.ttl} — SOLVED, ${user.username.toUpperCase()}`, xp: o.xp });
    setModalOpen(false);
  }

  function useHint() {
    if (!curObj) { toast('Select a puzzle first!'); return; }
    if (hintsUsed >= 3) { toast('No more hints!'); return; }
    setHintsUsed((h) => h + 1);
  }

  function closeSuccess() { setSuccess(null); }
  function nextLevel() {
    closeSuccess();
    const n = game.lvl + 1;
    if (n < CODING_LEVELS.length) {
      setGame({ lvl: n });
      setCurObj(null);
      setTLeft(300 + n * 60);
      setHintsUsed(0);
    } else {
      toast('🎉 ALL LEVELS COMPLETE!');
      goto('home');
    }
  }

  function finishQuiz(correct, total) {
    markQuizDone(game.curTab, game.lvl);
    broadcastScore(game.score + correct * 100);
    toast('🎉 Quiz complete! Score: ' + Math.round((correct / total) * 100) + '%');
  }

  function exit() { goto('home'); }

  const mm = String(Math.floor(Math.max(0, tLeft) / 60)).padStart(2, '0');
  const ss = String(Math.max(0, tLeft) % 60).padStart(2, '0');

  const sectionLabel = isQuiz ? quizLevels[game.lvl].name : lv.name;
  const sectorLabel = isQuiz ? quizLevels[game.lvl].id : lv.sec;

  return (
    <div className="game-screen">
      <div className="hud">
        <div className="hud-logo">■ CODEESCAPE</div>
        <div className="hud-item">LVL<b>{isQuiz ? quizLevels[game.lvl].id : String(lv.id).padStart(2, '0')}</b></div>
        <div className="hud-item">SCORE<b>{game.score}</b></div>
        <div className="hud-sep" />
        <span className={`hud-mode ${game.isMultiplayer ? 'multi' : 'solo'}`}>{game.isMultiplayer ? 'MULTIPLAYER' : 'SOLO'}</span>
        <div className="hud-av">{user?.avatar}</div>
        <div className="hud-item" style={{ color: 'var(--green)' }}>{user?.username}</div>
        <div className="hud-item">⏱ <span className={`hud-timer${tLeft <= 30 ? ' danger' : ''}`}>{mm}:{ss}</span></div>
        <button className="hud-btn" onClick={() => goto('dashboard')}>▤ PROFILE</button>
        <button className="hud-btn" onClick={exit}>← EXIT</button>
      </div>

      <div className="game-area">
        <div className="room-view">
          <div className="room-title">SECTOR <span>{sectorLabel}</span> — {sectionLabel.toUpperCase()}</div>

          {!isQuiz && (
            <div className="room-hints">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`hint-orb${hintsUsed > i ? ' used' : ''}`} onClick={useHint} title="Hint -50pts">◆</div>
              ))}
            </div>
          )}

          {!isQuiz && (
            <>
              <div className="pobj pobj-door" onClick={() => openObject('door')}>
                <PuzzleObject3D type="door" solved={!!game.objDone[`${game.lvl}-door`]} />
                <div className="plbl">[ LOCKED DOOR ]</div>
              </div>
              <div className="pobj pobj-terminal" onClick={() => openObject('terminal')}>
                <PuzzleObject3D type="terminal" solved={!!game.objDone[`${game.lvl}-terminal`]} />
                <div className="plbl">[ TERMINAL ]</div>
              </div>
              <div className="pobj pobj-vault" onClick={() => openObject('vault')}>
                <PuzzleObject3D type="vault" solved={!!game.objDone[`${game.lvl}-vault`]} />
                <div className="plbl">[ DATA VAULT ]</div>
              </div>
            </>
          )}

          {isQuiz && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PuzzleObject3D type="terminal" solved={false} />
            </div>
          )}

          {game.isMultiplayer && game.room && (
            <div className="mp-scoreboard">
              <div className="mp-sb-title">🏆 ROOM SCORES</div>
              {[...game.room.members]
                .map((m) => (m.username === user?.username ? { ...m, score: game.score } : m))
                .sort((a, b) => b.score - a.score)
                .map((m) => (
                  <div className="mp-sb-row" key={m.username}>
                    <span>{m.avatar}</span>
                    <span className="mp-sb-name">{m.username.slice(0, 10)}</span>
                    {m.username === user?.username && <span className="mp-sb-you">YOU</span>}
                    <span className="mp-sb-score">{m.score}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="cpanel">
          {!isQuiz ? (
            <CodePanel lvlIdx={game.lvl} objKey={curObj} lang={lang} setLang={setLang} onSolved={handleCodeSolved} />
          ) : (
            <QuizPanel key={game.curTab + game.lvl} cat={game.curTab} lvlIdx={game.lvl} levels={quizLevels} onFinish={finishQuiz} />
          )}
        </div>
      </div>

      {modalOpen && curObj && (
        <PuzzleModal
          lvlIdx={game.lvl}
          objKey={curObj}
          lang={lang}
          onClose={() => setModalOpen(false)}
          onSolved={(xp) => handleCodeSolved(curObj, xp)}
        />
      )}

      {success && (
        <SuccessOverlay
          title={success.title}
          sub={success.sub}
          xp={success.xp}
          onNext={nextLevel}
          onStay={closeSuccess}
          onStats={() => { closeSuccess(); goto('dashboard'); }}
        />
      )}
    </div>
  );
}
