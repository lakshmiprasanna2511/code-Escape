import { useState } from 'react';
import { useStore } from '../store/useStore.js';

export default function Login() {
  const goto = useStore((s) => s.goto);
  const toast = useStore((s) => s.toast);
  const login = useStore((s) => s.login);
  const guestLogin = useStore((s) => s.guestLogin);

  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phonePfx, setPhonePfx] = useState('+91');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  async function doLogin() {
    if (!pw) { toast('Enter your password'); return; }
    setBusy(true);
    try {
      await login({ method, email, phone: phonePfx + phone, password: pw });
      toast('Welcome back!');
      goto('home');
    } catch (err) {
      toast(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }
  async function guest() {
    setBusy(true);
    try {
      await guestLogin();
      toast('Continuing as guest...');
      goto('home');
    } catch (err) {
      toast(err.message || 'Guest login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">CODE<span>ESCAPE</span></div>
        <div className="brand-tag">AGENT AUTHENTICATION</div>
        <div className="section-title" style={{ marginBottom: '.5rem' }}>SIGN IN</div>
        <div className="mtoggle" style={{ marginTop: '1rem' }}>
          <button className={`mbtn${method === 'email' ? ' on' : ''}`} onClick={() => setMethod('email')}>📧 EMAIL</button>
          <button className={`mbtn${method === 'phone' ? ' on' : ''}`} onClick={() => setMethod('phone')}>📱 PHONE</button>
        </div>

        {method === 'email' ? (
          <div className="field-group">
            <div className="field-label">EMAIL</div>
            <input className="field-input" type="email" placeholder="agent@codeescape.io" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        ) : (
          <div className="field-group">
            <div className="field-label">PHONE</div>
            <div className="phone-row">
              <input className="field-input phone-prefix" value={phonePfx} onChange={(e) => setPhonePfx(e.target.value)} />
              <input className="field-input" type="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>
        )}

        <div className="field-group">
          <div className="field-label">PASSWORD</div>
          <input className="field-input" type="password" placeholder="Enter password" value={pw}
            onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doLogin()} />
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, marginTop: -6, marginBottom: '1rem' }}>
          <a style={{ color: 'var(--text3)', cursor: 'pointer' }} onClick={() => toast('Password reset link sent to your email!')}>Forgot password?</a>
        </div>
        <button className="btn-primary" onClick={doLogin} disabled={busy}>{busy ? 'SIGNING IN…' : 'SIGN IN'}</button>
        <div className="divider">OR</div>
        <button className="btn-outline" onClick={guest} disabled={busy}>CONTINUE AS GUEST</button>
        <div className="auth-footer">New agent? <a onClick={() => goto('signup')}>Create account</a></div>
      </div>
    </div>
  );
}
