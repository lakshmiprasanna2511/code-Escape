import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore.js';

export default function OtpVerify() {
  const goto = useStore((s) => s.goto);
  const toast = useStore((s) => s.toast);
  const tmp = useStore((s) => s.tmp);
  const verifyOtp = useStore((s) => s.verifyOtp);
  const resendOtp = useStore((s) => s.resendOtp);

  const [digits, setDigits] = useState(Array(6).fill(''));
  const [status, setStatus] = useState(''); // '', 'correct', 'wrong'
  const [seconds, setSeconds] = useState(30);
  const [busy, setBusy] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  function setDigit(i, val) {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits]; next[i] = v; setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    const full = next.join('');
    if (full.length === 6) setTimeout(() => verify(full), 150);
  }
  function onKeyDown(e, i) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }
  async function verify(code) {
    const entered = code || digits.join('');
    if (entered.length < 6) { toast('Enter all 6 digits'); return; }
    setBusy(true);
    try {
      await verifyOtp(entered);
      setStatus('correct');
      setTimeout(() => { goto('psetup'); }, 450);
    } catch (err) {
      setStatus('wrong');
      toast(err.message || 'Incorrect OTP. Try again.');
      setTimeout(() => { setDigits(Array(6).fill('')); setStatus(''); refs.current[0]?.focus(); }, 600);
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    try {
      await resendOtp();
      setSeconds(30);
      setDigits(Array(6).fill(''));
      setStatus('');
      toast('New OTP sent!');
      refs.current[0]?.focus();
    } catch (err) {
      toast(err.message || 'Could not resend OTP');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">CODE<span>ESCAPE</span></div>
        <div className="brand-tag">IDENTITY VERIFICATION</div>
        <div className="steps"><div className="step done" /><div className="step on" /><div className="step" /></div>
        <div className="section-title">VERIFY OTP</div>
        <div className="otp-info">A 6-digit code was sent to<br /><b>{tmp.contact || '—'}</b></div>
        <div className="demo-box">DEMO MODE — Your OTP is: <b>{tmp.otp || '——'}</b></div>
        <div className="otp-row">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              className={`otp-digit${d ? ' filled' : ''}${status === 'correct' ? ' correct' : ''}${status === 'wrong' ? ' wrong' : ''}`}
              maxLength={1}
              value={d}
              disabled={busy}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
            />
          ))}
        </div>
        <button className="btn-primary" onClick={() => verify()} disabled={busy}>{busy ? 'VERIFYING…' : 'VERIFY & CONTINUE'}</button>
        <div className="resend-row">
          Didn't receive it?{' '}
          {seconds > 0 ? <span className="disabled">Resend in {seconds}s</span> : <a onClick={resend}>Resend OTP</a>}
        </div>
        <button className="btn-outline" onClick={() => goto('signup')}>← BACK</button>
      </div>
    </div>
  );
}
