import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
// import styles from './App.module.css';
import Cookies from 'js-cookie';
import Register from './register';
import FullChat from './fullchat';
import EditUserInfo from './edituserinfo';
import Landing from './landing';
import Admin from './admin';
import logoLight from './logo-light.png';
// Using environment variable directly
const API_BASE = process.env.REACT_APP_API_URL || 'https://xchatback123.xyz';
if (!process.env.REACT_APP_API_URL) {
  console.warn('REACT_APP_API_URL is not set! Using fallback: https://xchatback123.xyz');
  console.warn('Please check your .env file and restart the React app.');
}

/* ---------------- Shared Design Tokens ---------------- */
const designTokens = `
@font-face {
  font-family: 'Tel Aviv Brutalist';
  src: url('./fonts/TelAviv-BrutalistBold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: 'Tel Aviv Brutalist';
  src: url('./fonts/TelAviv-BrutalistRegular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Assistant';
  src: url('./fonts/Assistant-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

:root {
  --primary-purple: #BA42BA;
  --primary-purple-hover: #a035a0;
  --gradient-start: #2D0A46;
  --gradient-end: #6F19AC;
  --text-dark: #002169;
  --text-gray: #3C3C3C;
  --bg-light: #F8F7FD;
  --bg-white: #FFFFFF;
  --border-light: #E2DEF7;
  --ok: #22c55e;
  --warn: #dc2626;
  --shadow: 0 20px 60px rgba(45, 10, 70, 0.15);
  --shadow-card: 0 8px 32px rgba(45, 10, 70, 0.12);
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body { 
  margin: 0; 
  font-family: 'Assistant', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
  direction: rtl;
}
`;

/* ---------------- Login Page Styles ---------------- */
const loginStyles = `
.login-root {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-light) 0%, #F3F0FA 50%, #EDE8F5 100%);
  position: relative;
  overflow-y: auto;
  padding: 24px 16px 32px;
}

/* Animated background blobs */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.login-bg::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(186, 66, 186, 0.15) 0%, transparent 70%);
  top: -200px;
  right: -100px;
  animation: float-blob 8s ease-in-out infinite;
}

.login-bg::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(111, 25, 172, 0.12) 0%, transparent 70%);
  bottom: -150px;
  left: -100px;
  animation: float-blob 10s ease-in-out infinite reverse;
}

@keyframes float-blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

.login-card {
  position: relative;
  width: min(92vw, 440px);
  padding: 40px 36px 32px;
  border-radius: 24px;
  border: 1px solid var(--border-light);
  background: var(--bg-white);
  box-shadow: var(--shadow-card);
  z-index: 10;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 14px;
  background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end), var(--primary-purple));
  border-radius: 24px 24px 0 0;
}

@media (max-width: 768px) {
  .login-root {
    align-items: center;
    padding: 16px 16px 24px;
  }

  .login-card {
    width: 95vw;
    min-height: auto;
    padding: 32px 24px 24px;
    margin: 0 auto;
  }
  
  .login-title {
    font-size: 26px !important;
  }
  
  .login-sub {
    font-size: 15px !important;
    min-height: 24px;
  }
  
  .input {
    padding: 16px 18px !important;
    font-size: 16px !important;
  }
  
  .btn {
    padding: 16px 14px !important;
    font-size: 16px !important;
  }
  
  .actions {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  
  .login-foot {
    font-size: 13px !important;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .login-card {
    width: 95vw;
    padding: 28px 20px 20px;
    margin: 16px auto;
    border-radius: 20px;
  }
  
  .login-title {
    font-size: 24px !important;
  }
  
  .login-sub {
    font-size: 14px !important;
  }
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.login-brand:hover {
  transform: scale(1.02);
}

.login-logo-container {
  width: 164px;
  height: 74px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(111, 25, 172, 0.3);
}

.login-logo-container img {
  height: 44px;
  width: auto;
  filter: brightness(0) invert(1);
}

.login-title {
  font-family: 'Tel Aviv Brutalist', sans-serif;
  font-size: 30px;
  font-weight: 400;
  color: var(--text-dark);
  margin: 0 0 8px;
  text-align: center;
}

.login-sub {
  font-family: 'Assistant', sans-serif;
  color: var(--text-gray);
  font-size: 16px;
  min-height: 26px;
  text-align: center;
  line-height: 1.5;
}

.login-form {
  display: grid;
  gap: 18px;
  margin-top: 8px;
}

.input-wrap {
  display: grid;
  gap: 8px;
}

.input-label {
  font-family: 'Assistant', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.input {
  width: 100%;
  padding: 14px 18px;
  background: var(--bg-light);
  color: var(--text-dark);
  border: 2px solid transparent;
  border-radius: 12px;
  outline: none;
  font-family: 'Assistant', sans-serif;
  font-size: 15px;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: var(--primary-purple);
  background: var(--bg-white);
  box-shadow: 0 0 0 4px rgba(186, 66, 186, 0.1);
}

.input::placeholder {
  color: #999;
}

.actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 10px;
  justify-items: center;
  align-items: center;
  margin-top: 20px;
  width: 100%;
}

.actions > * {
  width: min(360px, 100%);
}

.btn {
  padding: 14px 12px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  background: var(--bg-white);
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Assistant', sans-serif;
  font-weight: 600;
  font-size: 15px;
  
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%; 
}
.btn:hover {
  border-color: var(--primary-purple);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(186, 66, 186, 0.15);
}

.btn--primary {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(111, 25, 172, 0.3);

}

.btn--primary:hover {
  background: linear-gradient(135deg, var(--gradient-end), var(--primary-purple));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(111, 25, 172, 0.4);
}

.btn--secondary {
  background: var(--bg-light);
  border: 2px solid var(--border-light);
  color: var(--text-dark);
}

.btn--secondary:hover {
  background: var(--bg-white);
  border-color: var(--primary-purple);
}

.btn--muted {
  background: transparent;
  border: 2px dashed var(--border-light);
  color: var(--text-gray);
}

.btn--muted:hover {
  border-color: var(--primary-purple);
  color: var(--primary-purple);
}

.btn--back {
  background: transparent;
  border: none;
  color: var(--text-gray);
  font-size: 13px;
  padding: 8px 16px;
}

.btn--back:hover {
  color: var(--primary-purple);
  background: rgba(186, 66, 186, 0.05);
  transform: none;
  box-shadow: none;
}

.login-foot {
  padding-top: 15px;
  border-top: 1px solid var(--border-light);
  font-size: 14px;
  color: var(--text-gray);
  display: flex;
  
  gap: 8px;
  justify-content: center;
  font-family: 'Assistant', sans-serif;
}

.login-foot a {
  color: var(--primary-purple);
  text-decoration: none;
  font-weight: 600;
}

.login-foot a:hover {
  text-decoration: underline;
}

.alert {
  margin-top: 12px;
  color: var(--warn);
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.2);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 8px 0;
  color: var(--text-gray);
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-light);
}
`;

/* ---------------- Animated Sentences ---------------- */
const sentences = [
  'בנה מנגנון תמיכה ללקוחות שלך בפחות מדקה',
  'תן ללקוחות שלך לדבר עם עוזר וירטואלי 24/7',
];

/* ---------------- Login Component ---------------- */
function Login() {
  // const [theme, setTheme] = useState('light');
  const theme = 'light'; // Force light theme
  const [currentText, setCurrentText] = useState('');
  const [currentSentence, setCurrentSentence] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [emailInput, setEmailInput] = useState('');
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
    if (!emailInput.trim()) {
      setError('Please enter an email.');
      return;
    }
    try {
      Cookies.set('email', emailInput, { expires: 1, path: '/', sameSite: 'Lax' });

      // ✅ Backend call using environment variable
      const authRes = await fetch(
        `${API_BASE}/auth?username=${encodeURIComponent(emailInput)}&password=${encodeURIComponent(passwordInput)}`
      );
      if (!authRes.ok) {
        setError('Incorrect email or password.');
        return;
      }

      const tokenRes = await fetch(
        `${API_BASE}/get-token?username=${encodeURIComponent(emailInput)}`
      );
      if (!tokenRes.ok) throw new Error('Failed to fetch token');
      const data = await tokenRes.json();
      if (data.token) {
        Cookies.set('testtoken', data.token, { expires: 1, path: '/', sameSite: 'Lax' });
      }
      
      // All users go to home page, admin can access admin panel via button
      navigate('/', { replace: true });
    } catch (e) {
      console.error(e);
      setError('לא הצלחנו להתחבר. אנא ודא שכתובת האימייל והסיסמה נכונים ונסה שוב.');
    }
  };

  const handleRegister = () => navigate('/register');
  const handleBackToLanding = () => navigate('/');

  return (
    <div className="login-root">
      <style>{designTokens + loginStyles}</style>
      <div className="login-bg" />
      <div className="login-card ">
        <div className="login-header">
          <div className="login-brand" onClick={handleBackToLanding}>
            <div className="login-logo-container">
              <img src={logoLight} alt="Logo" />
            </div>
          </div>
        </div>

        <div className="login-title">ברוכים השבים! 👋</div>
        <div className="login-sub">{currentText || 'התחברו כדי להמשיך לנהל את הבוטים שלכם'}</div>

        <div className="login-form" onKeyDown={(e) => e.key === 'Enter' && handleLogin()}>
          <div className="input-wrap">
            <label htmlFor="email" className="input-label">כתובת אימייל</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="your@email.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="input-wrap">
            <label htmlFor="password" className="input-label">סיסמה</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="הזינו את הסיסמה שלכם"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="alert">{error}</div>}

          <div className="actions ">
            <button className="btn btn--primary " type="button" onClick={handleLogin}>
              התחברות
            </button>
            <div className="divider">או</div>

            <button className="btn btn--secondary" type="button" onClick={handleRegister}>
              יצירת חשבון
            </button>
          </div>


   

          <div className="login-foot">
            צריכים עזרה? <a href="https://wa.me/972545779917">054-5779917</a>
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
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
