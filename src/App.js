import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
// import styles from './App.module.css';
import Cookies from 'js-cookie';
import Register from './register';
import FullChat from './fullchat';
import EditUserInfo from './edituserinfo';
import Landing from './landing';
import logo from './logo.png';
import { designTokens, loginStyles } from './styleStrings';

/* ---------------- Animated Sentences ---------------- */
const sentences = ['בנה מנגנון תמיכה ללקוחות שלך בפחות מדקה', 'תן ללקוחות שלך לדבר עם עוזר וירטואלי 24/7'];

/* ---------------- Login Component ---------------- */
function Login() {
  // const [theme, setTheme] = useState('light');
  const theme = 'light'; // Force light theme
  const [currentText, setCurrentText] = useState('');
  const [currentSentence, setCurrentSentence] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Typing effect
  useEffect(() => {
    const run = setInterval(() => {
      const s = sentences[currentSentence];
      if (charIndex < s.length) {
        setCurrentText((t) => t + s[charIndex]);
        setCharIndex((i) => i + 1);
      } else {
        clearInterval(run);
        const pause = setTimeout(() => {
          setCurrentText('');
          setCharIndex(0);
          setCurrentSentence((n) => (n + 1) % sentences.length);
        }, 1500);
        return () => clearTimeout(pause);
      }
    }, 45);
    return () => clearInterval(run);
  }, [charIndex, currentSentence]);

  const handleLogin = async () => {
    setError('');
    if (!usernameInput.trim()) {
      setError('Please enter a username.');
      return;
    }
    try {
      Cookies.set('username', usernameInput, { expires: 1, path: '/', sameSite: 'Lax' });

      // ✅ Backend call using environment variable
      const authRes = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5137'}/auth?username=${encodeURIComponent(usernameInput)}&password=${encodeURIComponent(passwordInput)}`
      );
      if (!authRes.ok) {
        setError('Incorrect username or password.');
        return;
      }

      const tokenRes = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5137'}/get-token?username=${encodeURIComponent(usernameInput)}`
      );
      if (!tokenRes.ok) throw new Error('Failed to fetch token');
      const data = await tokenRes.json();
      if (data.token) {
        Cookies.set('testtoken', data.token, { expires: 1, path: '/', sameSite: 'Lax' });
      }
      navigate('/', { replace: true });
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleRegister = () => navigate('/register');
  const handleBackToLanding = () => navigate('/');

  return (
    <div className={`login-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <style>{designTokens + loginStyles}</style>
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-header">
          <p></p>
          <div className="login-brand" onClick={handleBackToLanding} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Logo" style={{ height: '38px' }} />
          </div>
          {/* <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button> */}
        </div>

        <div className="login-title">ברוכים השבים :)</div>
        <div className="login-sub">{currentText}</div>

        <div className="login-form" onKeyDown={(e) => e.key === 'Enter' && handleLogin()}>
          <div className="input-wrap">
            <label htmlFor="username" className="input-label">שם משתמש</label>
            <input
              id="username"
              type="text"
              className="input"
              placeholder="לדוגמא: נינט טייב"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="input-wrap">
            <label htmlFor="password" className="input-label">סיסמה</label>
            <input
              id="password"
              type="password"
              className="input"
              // placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="actions">
            <button className="btn btn--primary" type="button" onClick={handleLogin}>
              כניסה
            </button>
            <button className="btn btn--muted" type="button" onClick={handleRegister}>
              הרשמה
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button className="btn btn--muted" type="button" onClick={handleBackToLanding} style={{ fontSize: '12px', padding: '6px 12px' }}>
              חזרה לדף הבית
            </button>
          </div>

          {error && <div className="alert">{error}</div>}

          <div className="login-foot">
            שירות לקוחות (טלפון+וואצאפ): 054-5779917
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- App with Routing ---------------- */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/fullchat" element={<FullChat />} />
        <Route path="/edituserinfo" element={<EditUserInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
