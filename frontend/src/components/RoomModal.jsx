import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore.js';
import { roomApi } from '../api/game.js';
import { getSocket } from '../api/socket.js';

export default function RoomModal({ onClose }) {
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const game = useStore((s) => s.game);
  const toast = useStore((s) => s.toast);
  const setRoom = useStore((s) => s.setRoom);
  const goto = useStore((s) => s.goto);
  const setGame = useStore((s) => s.setGame);

  const [rtab, setRtab] = useState('create');
  const [cat, setCat] = useState('apt');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [busy, setBusy] = useState(false);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket(token);
    socketRef.current = socket;

    const onState = (room) => {
      setRoom(room);
      setJoined(true);
    };
    const onChat = (entry) => setChat((c) => [...c, entry]);
    const onToast = ({ message }) => toast(message);
    const onError = ({ message }) => toast(message);
    const onStarted = ({ cat: startedCat }) => {
      onClose();
      setGame({ curTab: startedCat, quizCat: startedCat, quizLvlIdx: 0, quizStart: true });
      toast('🚀 Room game started!');
      goto('game');
    };

    socket.on('room:state', onState);
    socket.on('room:chat', onChat);
    socket.on('room:toast', onToast);
    socket.on('room:error', onError);
    socket.on('room:started', onStarted);

    return () => {
      socket.off('room:state', onState);
      socket.off('room:chat', onChat);
      socket.off('room:toast', onToast);
      socket.off('room:error', onError);
      socket.off('room:started', onStarted);
    };
  }, []); // eslint-disable-line

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  async function handleCreate() {
    setBusy(true);
    try {
      const { room } = await roomApi.create(cat, maxPlayers);
      setRoom(room);
      setChat(room.messages || []);
      socketRef.current.emit('room:join', { code: room.code });
      toast('Room created: ' + room.code);
      setJoined(true);
    } catch (err) {
      toast(err.message || 'Could not create room');
    } finally {
      setBusy(false);
    }
  }

  function handleJoin() {
    if (joinCode.trim().length < 4) { toast('Enter a valid room code'); return; }
    socketRef.current.emit('room:join', { code: joinCode.trim().toUpperCase() });
  }

  function sendChat() {
    const msg = chatInput.trim();
    if (!msg || !game.room) return;
    socketRef.current.emit('room:chat', { code: game.room.code, msg });
    setChatInput('');
  }

  function copyCode() {
    const code = game.room?.code || '';
    navigator.clipboard?.writeText(code).then(() => toast('Room code copied!')).catch(() => toast('Code: ' + code));
  }

  function startRoomGame() {
    if (!game.room) { toast('No room found!'); return; }
    socketRef.current.emit('room:start', { code: game.room.code });
  }

  const members = game.room?.members || [];
  const isHost = members.find((m) => m.username === user?.username)?.status === 'host';

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div className="modal-hdr">
          <div className="modal-ico">👥</div>
          <div className="modal-title" style={{ color: 'var(--blue)' }}>PLAY WITH FRIENDS</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!joined && (
            <div className="room-tabs">
              <button className={`rtab${rtab === 'create' ? ' active' : ''}`} onClick={() => setRtab('create')}>➕ CREATE ROOM</button>
              <button className={`rtab${rtab === 'join' ? ' active' : ''}`} onClick={() => setRtab('join')}>🔗 JOIN ROOM</button>
            </div>
          )}

          {rtab === 'create' && !joined && (
            <>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Select quiz category for your room:</div>
              <div className="cat-select-grid">
                <div className={`cat-opt${cat === 'code' ? ' selected' : ''}`} onClick={() => setCat('code')}>
                  <div className="cat-opt-ico">💻</div><div className="cat-opt-name">CODING</div>
                </div>
                <div className={`cat-opt${cat === 'apt' ? ' selected' : ''}`} onClick={() => setCat('apt')}>
                  <div className="cat-opt-ico">🧠</div><div className="cat-opt-name">APTITUDE</div>
                </div>
                <div className={`cat-opt${cat === 'eng' ? ' selected' : ''}`} onClick={() => setCat('eng')}>
                  <div className="cat-opt-ico">📖</div><div className="cat-opt-name">ENGLISH</div>
                </div>
              </div>
              <div className="field-group" style={{ marginTop: 10 }}>
                <div className="field-label">MAX PLAYERS</div>
                <select className="field-input" style={{ color: 'var(--text2)' }} value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))}>
                  <option value={2}>2 Players</option>
                  <option value={4}>4 Players</option>
                  <option value={6}>6 Players</option>
                </select>
              </div>
              <button className="btn-blue" onClick={handleCreate} disabled={busy}>{busy ? 'CREATING…' : 'CREATE ROOM'}</button>
            </>
          )}

          {rtab === 'join' && !joined && (
            <>
              <div className="field-group">
                <div className="field-label">ENTER ROOM CODE</div>
                <input className="field-input" placeholder="e.g. XRAY42" maxLength={8}
                  style={{ textTransform: 'uppercase', letterSpacing: 4, fontSize: '1.1rem', fontFamily: 'var(--f-display)' }}
                  value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
              </div>
              <button className="btn-blue" onClick={handleJoin}>JOIN ROOM</button>
            </>
          )}

          {joined && game.room && (
            <div style={{ marginTop: 4 }}>
              <div className="room-code-display">
                <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 6 }}>ROOM CODE</div>
                <div className="room-code-big">{game.room.code}</div>
                <div className="room-code-sub">Share this code with your friends</div>
                <button className="copy-btn" onClick={copyCode}>📋 COPY CODE</button>
              </div>
              <div className="room-members">
                <div className="rm-title">MEMBERS ({members.length}/{game.room.maxPlayers})</div>
                <div className="rm-list">
                  {members.map((m) => (
                    <div className="rm-member" key={m.username}>
                      <span>{m.avatar}</span>
                      <span className="rm-name">{m.username}{m.username === user?.username ? ' (you)' : ''}</span>
                      <span className={`rm-status ${m.status}`}>{m.status.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="room-chat-log">
                {chat.map((m, i) => m.sys
                  ? <div className="chat-msg sys" key={i}>💬 {m.msg}</div>
                  : <div className="chat-msg" key={i}><b>{m.username}:</b> {m.msg}</div>)}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-row">
                <input className="chat-in" placeholder="Send a message..." value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} />
                <button className="chat-send" onClick={sendChat}>SEND</button>
              </div>
              {isHost && <button className="btn-primary" onClick={startRoomGame} style={{ marginTop: 12 }}>▶ START GAME</button>}
              {!isHost && <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text3)', marginTop: 12 }}>Waiting for the host to start the game…</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
