import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
// 🔗 Backend base URL from environment variable
const API_BASE = process.env.REACT_APP_API_URL;

const designTokens = `
:root {
  --primary-purple: #BA42BA;
}

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
  --bg: #0f1420;
  --panel: rgba(255,255,255,0.06);
  --panel-strong: rgba(255,255,255,0.12);
  --text: #e8ecf3;
  --text-dim: #aab3c5;
  --brand: #6ea8fe;
  --brand-2: #8a7dff;
  --ok: #22c55e;
  --warn: #ef4444;
  --border: rgba(255,255,255,0.12);
  --shadow: 0 8px 30px rgba(0,0,0,0.25);
}
.theme-light {
  --bg: #F8F7FD;
  --panel: #FFFFFF;
  --panel-strong: #FFFFFF;
  --text: #002169;
  --text-dim: #3C3C3C;
  --brand: #2D0A46;
  --brand-2: #6F19AC;
  --ok: #16a34a;
  --warn: #dc2626;
  --border: #E2DEF7;
  --shadow: 0 20px 60px rgba(45, 10, 70, 0.15);
}
* { box-sizing: border-box; }
html, body, #root { min-height: 100%; }
body { margin: 0; font-family: 'Assistant', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
`;

const pageStyles = `
.reg-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  background: linear-gradient(135deg, var(--bg) 0%, #F3F0FA 50%, #EDE8F5 100%);
  padding: 24px 16px 32px;
  position: relative;
}
.reg-bg { 
  position: absolute; 
  inset: 0; 
  pointer-events: none;
}
.reg-card {
  position: relative;
  width: min(96vw, 980px);
  max-height: 90vh;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: #FFFFFF;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.reg-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 14px;
  background: linear-gradient(90deg, var(--brand), var(--brand-2), #BA42BA);
  border-radius: 24px 24px 0 0;
}
.reg-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 18px 24px 10px; 
  border-bottom: 1px solid var(--border); 
  background: #FFFFFF;
}
.reg-brand { display: flex; align-items: center; gap: 10px; font-weight: 900; letter-spacing: .3px; }
.reg-dot { width: 12px; height: 12px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), var(--brand-2)); box-shadow: 0 0 14px var(--brand);
}
.theme-toggle { background: var(--panel); color: var(--text);
  border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; cursor: pointer;
}
.theme-toggle:hover { border-color: var(--brand); }
.reg-steps { 
  padding: 12px 16px; 
  margin: 0 12px 12px;
  background: #FFFFFF;
  border: 1px solid var(--border); 
  border-radius: 18px;
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); 
  gap: 12px; 
  box-shadow: 0 12px 30px rgba(45, 10, 70, 0.08);
}
.step {
  display: grid; grid-template-columns: 42px 1fr; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px; border: 1px solid #E8E3F5; color: var(--text-dim);
  background: #F8F7FD;
  box-shadow: 0 8px 22px rgba(45, 10, 70, 0.06);
  transition: all 0.2s ease;
}
.step:hover {
  border-color: var(--brand);
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(45, 10, 70, 0.1);
}
.step.active { 
  border: 1px solid var(--brand); 
  color: var(--text); 
  background: linear-gradient(135deg, rgba(45,10,70,0.05), rgba(111,25,172,0.08)); 
  box-shadow: 0 12px 32px rgba(45, 10, 70, 0.14);
}
.step-num {
  width: 42px; height: 42px; border-radius: 12px; display:flex; align-items:center; justify-content:center;
  background: linear-gradient(135deg, var(--brand), var(--brand-2)); 
  color: #FFFFFF;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(111, 25, 172, 0.25);
}
.step-title { 
  font-weight: 700; 
  font-size: 15px;
  color: var(--text);
}
.reg-content { padding: 12px; overflow-y: auto; flex: 1; min-height: 0; }
.section { display: grid; gap: 14px; padding: 8px 4px; }
.section h2 {
  margin: 0;
  font-family: 'Tel Aviv Brutalist', sans-serif;
  font-weight: 400;
  font-size: 28px;
  color: var(--text);
  letter-spacing: -0.02em;
}
.label { 
  font-size: 13px; 
  color: var(--text-dim); 
  font-weight: 700;
  letter-spacing: 0.01em;
}
.form-row {
  display: grid;
  gap: 14px 20px;
  width: 100%;
}
.form-row.two {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
.form-row.single {
  grid-template-columns: 1fr;
}
.field {
  display: grid;
  gap: 6px;
}
.field.span-all {
  grid-column: 1 / -1;
}
.input, .textarea, .select {
  width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border);
  background: #F8F7FD; color: var(--text); outline: none;
  font-family: 'Assistant', sans-serif;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.input:focus, .textarea:focus, .select:focus {
  border-color: var(--brand);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(186, 66, 186, 0.08);
}
.input::placeholder, .textarea::placeholder {
  color: #9ca3af;
}
.textarea { resize: vertical; min-height: 120px; }
.actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.btn {
  padding: 12px 10px; border-radius: 12px; border: 1px solid var(--border);
  background: #FFFFFF; color: var(--text); cursor: pointer; font-weight: 700;
  transition: transform .05s ease, background .2s ease, border-color .2s ease;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.btn:hover { background: var(--panel-strong); border-color: var(--brand); transform: translateY(-1px); }
.btn--primary { border-color: var(--brand); }
.btn--danger  { border-color: var(--warn); }
.btn--wide { grid-column: 1 / -1; }
.alert {
  color: #C53030;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #FBC4C4;
  background: #FFF6F6;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(197, 48, 48, 0.08);
}
.success {
  color: #166534;
  border: 1px solid #BBF7D0;
  background: #F0FFF4;
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(22, 101, 52, 0.08);
}
.codebox {
  border-radius: 12px; border: 1px solid var(--border);
  background: #0c111b; color: #e8ecf3; padding: 12px 14px; overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 13px; line-height: 1.45;
}
.codehead { display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; color: var(--text-dim); }
.copy { border: 1px solid var(--border); background: var(--panel); color: var(--text); padding: 6px 10px; border-radius: 8px; cursor: pointer; }
.copy:hover { border-color: var(--brand); background: var(--panel-strong); }
.spinner { 
  width: 16px; height: 16px; border-radius: 50%; 
  border: 2px solid rgba(255,255,255,0.35); 
  border-top-color: #fff; 
  animation: spin 0.8s linear infinite; 
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .reg-root { 
    padding: 16px; 
    min-height: 100vh;
    align-items: center;
    justify-content: center;
  }
  
  .reg-card { 
    width: 100%;
    max-height: none;
    border-radius: 16px;
  }
  
  .reg-content { 
    padding: 16px; 
  }
  
  .section { 
    gap: 12px; 
    max-width: 100%;
  }
  
  /* Mobile Timeline Steps */
  .reg-steps {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 12px;
    margin: 0 8px 12px;
    background: #FFFFFF;
    border-radius: 16px;
    gap: 4px;
    position: relative;
    box-shadow: 0 8px 24px rgba(45, 10, 70, 0.08);
  }
  
  /* Timeline connecting line */
  .reg-steps::before {
    content: '';
    position: absolute;
    top: 32px;
    left: 24px;
    right: 24px;
    height: 3px;
    background: #E8E3F5;
    z-index: 0;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    position: relative;
    z-index: 1;
    flex: 1;
    max-width: 80px;
  }
  
  .step:hover {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  
  .step.active {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  
  .step-num {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 800;
    background: #E8E3F5;
    color: #9CA3AF;
    box-shadow: none;
    transition: all 0.3s ease;
  }
  
  .step.active .step-num {
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(111, 25, 172, 0.35);
    transform: scale(1.1);
  }
  
  /* Completed steps (before active) */
  .step.completed .step-num {
    background: var(--ok);
    color: #FFFFFF;
  }
  
  .step-title {
    font-size: 11px;
    font-weight: 600;
    color: #9CA3AF;
    text-align: center;
    line-height: 1.2;
    transition: color 0.3s ease;
  }
  
  .step.active .step-title {
    color: var(--brand);
    font-weight: 700;
  }
  
  .step.completed .step-title {
    color: var(--ok);
  }
  
  /* Hide step description on mobile */
  .step > div > div:last-child {
    display: none;
  }
  
  .input, .textarea, .select {
    padding: 14px 16px;
    font-size: 16px;
  }
  
  .btn {
    padding: 14px 12px;
    font-size: 16px;
  }

  .btn--solid-primary {
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    color: #ffffff;
    border-color: transparent;
    text-align: center;
    justify-content: center;
  }
    .btn--solid-primary2 {
    background: linear-gradient(135deg, rgb(187, 0, 255), rgb(158, 95, 179));
    color: #ffffff;
    border-color: transparent;
    text-align: center;
    justify-content: center;
  }
      .btn--solid-primary2:hover {
    background: linear-gradient(135deg, rgb(158, 95, 179), rgb(187, 0, 255));
    transform: translateY(-2px);
  }
  
  .btn--solid-primary:hover {
    background: linear-gradient(135deg, var(--brand-2), var(--brand));
    transform: translateY(-2px);
  }
  
  .actions {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .codebox {
    font-size: 12px;
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .reg-root { 
    padding: 8px; 
  }
  
  .reg-card { 
    border-radius: 12px;
  }
  
  .reg-content { 
    padding: 12px; 
  }
  
  .section { 
    gap: 10px; 
  }
  
  .reg-steps {
    padding: 14px 8px;
    margin: 0 4px 10px;
  }
  
  .reg-steps::before {
    left: 20px;
    right: 20px;
  }
  
  .step-num {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }
  
  .step-title {
    font-size: 10px;
  }
  
  .input, .textarea, .select {
    padding: 12px 14px;
    font-size: 16px;
  }
  
  .btn {
    padding: 12px 10px;
    font-size: 15px;
  }

  .btn--solid-primary {
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    color: #ffffff;
    border-color: transparent;
    text-align: center;
    justify-content: center;
  }
  
  .codebox {
    font-size: 11px;
    padding: 8px 10px;
  }
}
`;

function Register() {
  const [theme, setTheme] = useState('light');
  const [currentStage, setCurrentStage] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('test');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [botDefinition, setBotDefinition] = useState('');
  const [googleCalendarToken, setGoogleCalendarToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [isDefining, setIsDefining] = useState(false);

  const navigate = useNavigate();

  // Get selected plan from navigation state
  useEffect(() => {
    const state = navigate.location?.state;
    if (state?.selectedPlan) {
      setSelectedPlan(state.selectedPlan);
    }
  }, [navigate.location?.state]);

  useEffect(() => {
    if (!Cookies.get('email')) Cookies.set('email', '', { expires: 1, path: '/', sameSite: 'Lax' });
    if (!Cookies.get('password')) Cookies.set('password', '', { expires: 1, path: '/', sameSite: 'Lax' });
    if (!Cookies.get('usertoken')) Cookies.set('usertoken', '', { expires: 1, path: '/', sameSite: 'Lax' });
  }, []);

  const handleStage1Next = () => {
    if (!email || !password || !fullname || !phone) {
      setErrorMessage('All fields are required.');
      setSuccessMessage('');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('הסיסמאות אינם תואמות');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    Cookies.set('email', email, { expires: 1, path: '/', sameSite: 'Lax' });
    Cookies.set('password', password, { expires: 1, path: '/', sameSite: 'Lax' });
    Cookies.set('fullname', fullname, { expires: 1, path: '/', sameSite: 'Lax' });
    Cookies.set('phone', phone, { expires: 1, path: '/', sameSite: 'Lax' });
    setSuccessMessage('נשמרו פרטים בהצלחה!');
    setTimeout(() => { setSuccessMessage(''); setCurrentStage(2); }, 900);
  };

  const handleStage2Next = () => {
    if (!selectedPlan) {
      setErrorMessage('יש לבחור תוכנית כדי להמשיך.');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('התוכנית נבחרה בהצלחה!');
    setTimeout(() => { setSuccessMessage(''); setCurrentStage(3); }, 900);
  };

  const handleStage2Back = () => setCurrentStage(1);
  const handleStage3Back = () => setCurrentStage(2);

  const handleDefine = () => {
    if (!websiteUrl) {
      setErrorMessage('יש להזין את כתובת האתר שלך לפני שתוכל להגדיר את הבוט.');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    setIsDefining(true);
    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: websiteUrl }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.reply) {
          setBotDefinition(data.reply);
          setSuccessMessage('Bot definition received.');
        } else {
          setErrorMessage(data.error || 'Failed to get bot definition.');
        }
      })
      .catch(() => setErrorMessage('לא ניתן לסרוק את האתר שלך בשל שגיאה בשרת.'))
      .finally(() => setIsDefining(false));
  };

  const handleStage3Next = () => {
    if (!botDefinition) {
      setErrorMessage('צריך קודם ללחוץ על "סרוק את האתר שלי" כדי לקבל הגדרות לבוט');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    const payload = { email, password, botDefinition, googleCalendarToken, plan: selectedPlan, fullname, phone };
    fetch(`${API_BASE}/savedata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          // set BOTH names so the rest of the app finds it
          Cookies.set('usertoken', data.token, { expires: 1, path: '/', sameSite: 'Lax' });
          Cookies.set('testtoken', data.token, { expires: 1, path: '/', sameSite: 'Lax' });
          setSuccessMessage('Data saved successfully.');
          setTimeout(() => { setSuccessMessage(''); setCurrentStage(4); }, 900);
        } else {
          setErrorMessage(data.error || 'Failed to save data.');
        }
      })
      .catch(() => setErrorMessage('לא ניתן לשמור את המידע בשל שגיאה בשרת.'));
  };

  const userToken = Cookies.get('usertoken') || 'Token not available';

  const pythonExample = `import requests

url = "${API_BASE}/flow"
payload = {
    "question": "Your question here",
    "usertoken": "${userToken}"
}
response = requests.post(url, json=payload)
print(response.json())`;

  const jsExample = `fetch("${API_BASE}/flow", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: "Your question here",
    usertoken: "${userToken}"
  })
})
  .then(r => r.json())
  .then(data => console.log(data));`;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('Copied!');
      setTimeout(() => setSuccessMessage(''), 800);
    } catch {
      setErrorMessage('Copy failed');
      setTimeout(() => setErrorMessage(''), 900);
    }
  };

  const renderStageContent = () => {
    if (currentStage === 1) {
      return (
        <div className="section">
          <h2>שלב 1 · פרטי חשבון</h2>
          {!!errorMessage && <div className="alert">{errorMessage}</div>}
          {!!successMessage && <div className="success">{successMessage}</div>}

          <div className="form-row two">
            <div className="field">
              <div className="label">שם מלא</div>
              <input
                className="input"
                type="text"
                placeholder="e.g. יוסי כהן"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="field">
              <div className="label">טלפון</div>
              <input
                className="input"
                type="tel"
                placeholder="e.g. 050-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="form-row two">
            <div className="field">

                            <div className="label">וודא סיסמה</div>
              <input
                className="input"
                type="password"
                placeholder=""
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <div className="label">סיסמה</div>
              <input
                className="input"
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-row two">            
            <div className="field span-all">
              <div className="label">אימייל</div>
              <input
                className="input"
                type="email"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn btn--solid-primary btn--wide" onClick={handleStage1Next}>המשך</button>
          </div>
        </div>
      );
    }

    if (currentStage === 2) {
      return (
        <div className="section">
          <h2>שלב 2 · בחר את התוכנית שלך</h2>
          {!!errorMessage && <div className="alert">{errorMessage}</div>}
          {!!successMessage && <div className="success">{successMessage}</div>}

          <div style={{display: 'grid', gap: '20px', marginBottom: '20px'}}>
            <div 
              className={`pricing-card ${selectedPlan === 'test' ? 'featured' : ''}`}
              style={{
                border: selectedPlan === 'test' ? '2px solid var(--brand)' : '1px solid var(--border)',
                cursor: 'pointer',
                padding: '24px',
                borderRadius: '16px',
                background: selectedPlan === 'test' ? 'rgba(110,168,254,0.1)' : 'var(--panel)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedPlan('test')}
            >
              <h3 style={{margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: '700'}}>חינם ל-14 יום</h3>
              <div style={{fontSize: '2rem', fontWeight: '900', color: 'var(--brand)', margin: '0 0 8px 0'}}>חינם ל-14 יום, אח״כ רק 23₪ לחודש</div>
              <p style={{color: 'var(--text-dim)', margin: '0 0 20px 0'}}>אין צורך בכרטיס אשראי</p>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, textAlign: 'left'}}>
                <li style={{padding: '4px 0', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{color: 'var(--ok)', fontWeight: '800'}}>✓</span>
                  בוט אחד
                </li>
                <li style={{padding: '4px 0', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{color: 'var(--ok)', fontWeight: '800'}}>✓</span>
                  מערכת ניהול הגדרות בוט
                </li>
                <li style={{padding: '4px 0', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{color: 'var(--ok)', fontWeight: '800'}}>✓</span>
                  100 שאילתות בחודש
                </li>
                <li style={{padding: '4px 0', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{color: 'var(--ok)', fontWeight: '800'}}>✓</span>
                  גישה ל-API
                </li>
              </ul>
            </div>
          </div>

          <div className="actions">
            <button className="btn" onClick={handleStage2Back}>חזור</button>
            <button className="btn btn--solid-primary" onClick={handleStage2Next}>המשך</button>
          </div>
        </div>
      );
    }

    if (currentStage === 3) {
      return (
        <div className="section">
          <h2>שלב 3 · הגדר את הבוט שלך</h2>
          {!!errorMessage && <div className="alert">{errorMessage}</div>}
          {!!successMessage && <div className="success">{successMessage}</div>}

          <div>
            <div className="label">כתובת האתר שלך (הבוט יחלץ/יגדיר)</div>
            <input
              className="input"
              type="text"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div>
            <div className="label">API של Google Calendar (אופציונלי)</div>
            <input
              className="input"
              type="text"
              // placeholder=""
              value={googleCalendarToken}
              onChange={(e) => setGoogleCalendarToken(e.target.value)}
            />
          </div>

          <div>
            <div className="label">הגדרות ידניות</div>
            <textarea
              className="textarea"
              placeholder="כאן אפשר להוסיף הנחיות נוספות לבוט. אפשר לשנות את זה אחר-כך"
              value={botDefinition}
              onChange={(e) => setBotDefinition(e.target.value)}
            />
          </div>

          <div className="actions">
            <button className="btn" onClick={handleStage3Back}>חזור</button>
            <button className="btn btn--solid-primary2" onClick={handleDefine} disabled={isDefining}>
              {isDefining ? (
                <>
                  <span className="spinner" style={{marginRight: '8px'}}></span>
                  סורק...
                </>
              ) : (
                'סרוק את האתר שלי'
              )}
            </button>
            <button className="btn btn--solid-primary" onClick={handleStage3Next}>המשך</button>
          </div>
        </div>
      );
    }

    // Stage 4
    return (
      <div className="section">
        <h2>Stage 4 · API Usage & Overview</h2>
        {!!errorMessage && <div className="alert">{errorMessage}</div>}
        {!!successMessage && <div className="success">{successMessage}</div>}

        <div>
          <div className="label">הטוקן שלך</div>
          <div className="codebox" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <code style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 10 }}>
              {userToken}
            </code>
            <button className="copy" onClick={() => copy(userToken)}>העתק</button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div className="label">שפת פיתוח</div>
          <select className="select" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        <div>
          <div className="codehead">
            <div>קוד להטמעה</div>
            <button
              className="copy"
              onClick={() => copy(selectedLanguage === 'python' ? pythonExample : jsExample)}
            >
              העתק
            </button>
          </div>
          <pre className="codebox">
            {selectedLanguage === 'python' ? pythonExample : jsExample}
          </pre>
        </div>

        <div className="label">
          Send a <code>POST</code> to <code>{API_BASE}/flow</code> with <code>question</code> and <code>usertoken</code>.
          Optionally include <code>convtoken</code> to continue a conversation.
        </div>

        <div className="actions">
          <button className="btn btn--primary btn--wide" onClick={() => navigate('/', { replace: true })}>סיום</button>
        </div>
      </div>
    );
  };

  return (
    <div className={`reg-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <style>{designTokens + pageStyles}</style>
      <div className="reg-bg" />

      <div className="reg-card">
        <div className="reg-header">
          <div className="reg-brand">
            <div className="reg-dot" />
            <div>בוא נתחיל...</div>
          </div>

        </div>

        <div className="reg-steps">
          <div className={`step ${currentStage === 1 ? 'active' : ''} ${currentStage > 1 ? 'completed' : ''}`}>
            <div className="step-num">{currentStage > 1 ? '✓' : '1'}</div>
            <div>
              <div className="step-title">חשבון</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>פרטים אישיים</div>
            </div>
          </div>
          <div className={`step ${currentStage === 2 ? 'active' : ''} ${currentStage > 2 ? 'completed' : ''}`}>
            <div className="step-num">{currentStage > 2 ? '✓' : '2'}</div>
            <div>
              <div className="step-title">תכנית</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>בחר את התוכנית שלך</div>
            </div>
          </div>
          <div className={`step ${currentStage === 3 ? 'active' : ''} ${currentStage > 3 ? 'completed' : ''}`}>
            <div className="step-num">{currentStage > 3 ? '✓' : '3'}</div>
            <div>
              <div className="step-title">בוט</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>אתר, לוח שנה, הגדרות</div>
            </div>
          </div>
          <div className={`step ${currentStage === 4 ? 'active' : ''}`}>
            <div className="step-num">4</div>
            <div>
              <div className="step-title">סיום</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>טוקן ודוגמאות</div>
            </div>
          </div>
        </div>

        <div className="reg-content">{renderStageContent()}</div>
      </div>
    </div>
  );
}

export default Register;
