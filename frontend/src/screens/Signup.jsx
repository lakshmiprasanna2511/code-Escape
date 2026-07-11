import { useState } from 'react';
import { useStore } from '../store/useStore.js';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\d{10}$/;

function pwScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const PW_COLORS = ['#ff2d55', '#ff9500', '#ffcc00', '#00ff9c'];
const PW_LABELS = ['WEAK', 'FAIR', 'GOOD', 'STRONG'];

export default function Signup() {
  const goto = useStore((s) => s.goto);
  const toast = useStore((s) => s.toast);
  const signup = useStore((s) => s.signup);

  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phonePfx, setPhonePfx] = useState('+91');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);

  const emailOk = emailRe.test(email);
  const phoneOk = phoneRe.test(phone.replace(/\s/g, ''));
  const score = pwScore(pw);
  const matches = pw2 && pw === pw2;

  async function submit() {
    if (pw.length < 8) { toast('Password must be at least 8 characters'); return; }
    if (pw !== pw2) { toast('Passwords do not match'); return; }
    if (method === 'email' && !emailOk) { toast('Enter a valid email'); return; }
    if (method === 'phone' && !phoneOk) { toast('Enter a valid 10-digit number'); return; }

    setBusy(true);
    try {
      await signup({ method, email, phone: phonePfx + phone, password: pw });
      goto('otp');
    } catch (err) {
      toast(err.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">CODE<span>ESCAPE</span></div>
        <div className="brand-tag">JOIN THE FACILITY</div>
        <div className="steps"><div className="step on" /><div className="step" /><div className="step" /></div>
        <div className="section-title">CREATE ACCOUNT</div>

        <div className="mtoggle">
          <button className={`mbtn${method === 'email' ? ' on' : ''}`} onClick={() => setMethod('email')}>📧 EMAIL</button>
          <button className={`mbtn${method === 'phone' ? ' on' : ''}`} onClick={() => setMethod('phone')}>📱 PHONE</button>
        </div>

        {method === 'email' ? (
          <div className="field-group">
            <div className="field-label">EMAIL ADDRESS</div>
            <input className={`field-input${email ? (emailOk ? ' ok' : ' er') : ''}`} type="email" placeholder="agent@codeescape.io"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className={`field-err${email && !emailOk ? ' show' : ''}`}>Invalid email address</div>
            <div className={`field-ok${emailOk ? ' show' : ''}`}>✓ Looks good</div>
          </div>
        ) : (
          <div className="field-group">
            <div className="field-label">PHONE NUMBER</div>
            <div className="phone-row">
              <input className="field-input phone-prefix" value={phonePfx} onChange={(e) => setPhonePfx(e.target.value)} />
              <input className={`field-input${phone ? (phoneOk ? ' ok' : ' er') : ''}`} type="tel" placeholder="98765 43210"
                value={phone} onChange={(e) => setPhone(e.target.value)} style={{ flex: 1 }} />
            </div>
            <div className={`field-err${phone && !phoneOk ? ' show' : ''}`}>Enter a valid 10-digit number</div>
            <div className={`field-ok${phoneOk ? ' show' : ''}`}>✓ Looks good</div>
          </div>
        )}

        <div className="field-group">
          <div className="field-label">PASSWORD</div>
          <input className="field-input" type="password" placeholder="Min 8 characters" value={pw} onChange={(e) => setPw(e.target.value)} />
          {pw && (
            <div className="pw-strength">
              <div className="pw-bar"><div className="pw-fill" style={{ width: `${score * 25}%`, background: PW_COLORS[score - 1] || '#ff2d55' }} /></div>
              <div className="pw-label">{PW_LABELS[score - 1] || 'TOO SHORT'}</div>
            </div>
          )}
        </div>

        <div className="field-group">
          <div className="field-label">CONFIRM PASSWORD</div>
          <input className={`field-input${pw2 ? (matches ? ' ok' : ' er') : ''}`} type="password" placeholder="Re-enter password"
            value={pw2} onChange={(e) => setPw2(e.target.value)} />
          <div className={`field-err${pw2 && !matches ? ' show' : ''}`}>Passwords do not match</div>
        </div>

        <button className="btn-primary" onClick={submit} disabled={busy}>{busy ? 'SENDING…' : 'SEND VERIFICATION CODE'}</button>
        <div className="auth-footer">Already have an account? <a onClick={() => goto('login')}>Sign in</a></div>
      </div>
    </div>
  );
}
