import { useEffect } from 'react';
import { useStore } from './store/useStore.js';
import Scene3D from './components/Scene3D.jsx';
import Toast from './components/Toast.jsx';

import Landing from './screens/Landing.jsx';
import Signup from './screens/Signup.jsx';
import OtpVerify from './screens/OtpVerify.jsx';
import ProfileSetup from './screens/ProfileSetup.jsx';
import Login from './screens/Login.jsx';
import Home from './screens/Home.jsx';
import Game from './screens/Game.jsx';
import Dashboard from './screens/Dashboard.jsx';

export default function App() {
  const screen = useStore((s) => s.screen);
  const booted = useStore((s) => s.booted);
  const init = useStore((s) => s.init);
  const backendOnline = useStore((s) => s.backendOnline);

  useEffect(() => { init(); }, []); // eslint-disable-line

  const variant = screen === 'game' ? 'game' : 'ambient';

  if (!booted) {
    return (
      <div className="app-shell">
        <Scene3D variant="ambient" />
        <div className="crt-overlay" />
        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: 14, fontWeight: 600 }}>
          Connecting to CodeEscape…
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Scene3D variant={variant} />
      <div className="crt-overlay" />
      {backendOnline === false && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, textAlign: 'center', padding: '8px 12px', background: 'rgba(255,61,99,.14)', borderBottom: '1px solid rgba(255,61,99,.3)', color: '#ffb3c0', fontSize: 12, fontWeight: 600 }}>
          ⚠ Can't reach the CodeEscape API — check that the backend is running and VITE_API_URL is set correctly.
        </div>
      )}
      <div className="screen-layer">
        {screen === 'landing' && <Landing />}
        {screen === 'signup' && <Signup />}
        {screen === 'otp' && <OtpVerify />}
        {screen === 'psetup' && <ProfileSetup />}
        {screen === 'login' && <Login />}
        {screen === 'home' && <Home />}
        {screen === 'game' && <Game />}
        {screen === 'dashboard' && <Dashboard />}
      </div>
      <Toast />
    </div>
  );
}
