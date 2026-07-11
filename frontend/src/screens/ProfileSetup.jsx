import { useState } from 'react';
import { useStore, AVATARS } from '../store/useStore.js';

const LANGS = [
  { key: 'python', name: 'Python' }, { key: 'java', name: 'Java' }, { key: 'cpp', name: 'C++' },
  { key: 'c', name: 'C' }, { key: 'sql', name: 'SQL' }, { key: 'js', name: 'JavaScript' },
];
const unameRe = /^[a-zA-Z0-9_]{3,20}$/;

export default function ProfileSetup() {
  const goto = useStore((s) => s.goto);
  const toast = useStore((s) => s.toast);
  const completeProfile = useStore((s) => s.completeProfile);

  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [langs, setLangs] = useState([]);
  const [exp, setExp] = useState('');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);

  const unameOk = unameRe.test(username);

  function toggleLang(key) {
    if (langs.includes(key)) setLangs(langs.filter((l) => l !== key));
    else {
      if (langs.length >= 3) { toast('Max 3 languages'); return; }
      setLangs([...langs, key]);
    }
  }

  async function finish() {
    if (!unameOk) { toast('Enter a valid username (3–20 chars)'); return; }
    setBusy(true);
    try {
      await completeProfile({ username, displayName: displayName.trim() || username, avatar, langs, exp: exp || 'beginner', bio: bio.trim() });
      goto('home');
    } catch (err) {
      toast(err.message || 'Profile setup failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="brand">CODE<span>ESCAPE</span></div>
        <div className="brand-tag">BUILD YOUR IDENTITY</div>
        <div className="steps"><div className="step done" /><div className="step done" /><div className="step on" /></div>
        <div className="section-title">SETUP PROFILE</div>

        <div className="field-label" style={{ marginBottom: 8 }}>CHOOSE AVATAR</div>
        <div className="avatar-grid">
          {AVATARS.map((av) => (
            <div key={av} className={`avatar-opt${avatar === av ? ' sel' : ''}`} onClick={() => setAvatar(av)}>{av}</div>
          ))}
        </div>

        <div className="field-group">
          <div className="field-label">USERNAME <span className="field-badge">PUBLIC</span></div>
          <input className={`field-input${username ? (unameOk ? ' ok' : ' er') : ''}`} maxLength={20} placeholder="e.g. x0r_agent"
            value={username} onChange={(e) => setUsername(e.target.value)} />
          <div className={`field-err${username && !unameOk ? ' show' : ''}`}>3–20 chars, letters/numbers/_ only</div>
          <div className={`field-ok${unameOk ? ' show' : ''}`}>✓ Username available</div>
        </div>

        <div className="field-group">
          <div className="field-label">DISPLAY NAME</div>
          <input className="field-input" maxLength={30} placeholder="Your real or alias name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div className="field-group">
          <div className="field-label">PREFERRED LANGUAGES <span className="field-badge">PICK UP TO 3</span></div>
          <div className="chip-row">
            {LANGS.map((l) => (
              <div key={l.key} className={`chip${langs.includes(l.key) ? ' sel' : ''}`} onClick={() => toggleLang(l.key)}>{l.name}</div>
            ))}
          </div>
        </div>

        <div className="field-group">
          <div className="field-label">EXPERIENCE LEVEL</div>
          <select className="field-input" style={{ color: 'var(--text2)' }} value={exp} onChange={(e) => setExp(e.target.value)}>
            <option value="">Select your level...</option>
            <option value="beginner">🟢 Beginner — New to coding</option>
            <option value="intermediate">🟡 Intermediate — 1–2 years</option>
            <option value="advanced">🔴 Advanced — 3+ years</option>
            <option value="expert">💀 Expert — I eat segfaults for breakfast</option>
          </select>
        </div>

        <div className="field-group">
          <div className="field-label">BIO <span className="field-badge">OPTIONAL</span></div>
          <textarea className="field-input" rows={2} maxLength={120} placeholder="Tell other agents about yourself..."
            style={{ height: 60, resize: 'none' }} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <button className="btn-primary" onClick={finish} disabled={busy}>{busy ? 'LAUNCHING…' : 'LAUNCH CODEESCAPE 🚀'}</button>
      </div>
    </div>
  );
}
