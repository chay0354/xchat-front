import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
// 🔗 Backend base URL from environment variable
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5137';

const designTokens = `
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
  --bg: #f3f6fb;
  --panel: #ffffff;
  --panel-strong: #ffffff;
  --text: #0f1420;
  --text-dim: #5b667a;
  --brand: #316bff;
  --brand-2: #6b5cff;
  --ok: #16a34a;
  --warn: #dc2626;
  --border: rgba(15,20,32,0.12);
  --shadow: 0 10px 25px rgba(15,20,32,0.08);
}
* { box-sizing: border-box; }
html, body, #root { min-height: 100%; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
`;

const pageStyles = `
.reg-root {
  min-height: 100dvh; display: flex; align-items: center; justify-content: center; color: var(--text);
  background: radial-gradient(1200px 900px at -10% -20%, #1b2232 0%, var(--bg) 50%), var(--bg);
  padding: 20px; position: relative;
}
.reg-bg { position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(500px 300px at 10% 10%, rgba(142,125,255,0.12), transparent 60%),
    radial-gradient(600px 400px at 90% 80%, rgba(110,168,254,0.10), transparent 60%);
  filter: blur(2px);
}
.reg-card {
  position: relative; width: min(96vw, 980px); max-height: 90vh;
  border: 1px solid var(--border); border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  box-shadow: var(--shadow); backdrop-filter: blur(10px);
  display: flex; flex-direction: column; overflow: hidden;
}
.reg-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid var(--border); }
.reg-brand { display: flex; align-items: center; gap: 10px; font-weight: 900; letter-spacing: .3px; }
.reg-dot { width: 12px; height: 12px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), var(--brand-2)); box-shadow: 0 0 14px var(--brand);
}
.theme-toggle { background: var(--panel); color: var(--text);
  border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; cursor: pointer;
}
.theme-toggle:hover { border-color: var(--brand); }
.reg-steps { padding: 8px 18px; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.step {
  display: grid; grid-template-columns: 36px 1fr; align-items: center; gap: 8px;
  padding: 8px; border-radius: 12px; border: 1px dashed var(--border); color: var(--text-dim);
  background: var(--panel);
}
.step.active { border: 1px solid var(--brand); color: var(--text); background: var(--panel-strong); }
.step-num {
  width: 36px; height: 36px; border-radius: 10px; display:flex; align-items:center; justify-content:center;
  background: var(--panel-strong); font-weight: 800;
}
.step-title { font-weight: 700; }
.reg-content { padding: 12px; overflow-y: auto; flex: 1; min-height: 0; }
.section { display: grid; gap: 10px; max-width: 760px; margin: 0 auto; }
.label { font-size: 12px; color: var(--text-dim); }
.input, .textarea, .select {
  width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border);
  background: var(--panel); color: var(--text); outline: none;
}
.textarea { resize: vertical; min-height: 120px; }
.actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.btn {
  padding: 12px 10px; border-radius: 12px; border: 1px solid var(--border);
  background: var(--panel); color: var(--text); cursor: pointer; font-weight: 700;
  transition: transform .05s ease, background .2s ease, border-color .2s ease;
}
.btn:hover { background: var(--panel-strong); border-color: var(--brand); transform: translateY(-1px); }
.btn--primary { border-color: var(--brand); }
.btn--danger  { border-color: var(--warn); }
.btn--wide { grid-column: 1 / -1; }
.alert {
  color: #fff; border-radius: 10px; padding: 10px 12px;
  border: 1px solid rgba(239,68,68,0.45);
  background: linear-gradient(180deg, rgba(239,68,68,0.30), rgba(239,68,68,0.15));
}
.success {
  color: #0e1; border: 1px solid rgba(34,197,94,0.45);
  background: linear-gradient(180deg, rgba(34,197,94,0.25), rgba(34,197,94,0.12));
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
    padding: 10px; 
    min-height: 100vh;
  }
  
  .reg-card { 
    width: 100%; 
    max-height: 95vh; 
    border-radius: 16px;
  }
  
  .reg-content { 
    padding: 16px; 
  }
  
  .section { 
    gap: 12px; 
    max-width: 100%;
  }
  
  .reg-steps {
    padding: 6px 12px;
    gap: 6px;
  }
  
  .step {
    padding: 6px;
    font-size: 13px;
  }
  
  .step-num {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .step-title {
    font-size: 12px;
  }
  
  .input, .textarea, .select {
    padding: 14px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .btn {
    padding: 14px 12px;
    font-size: 16px;
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
    padding: 4px 8px;
    gap: 4px;
  }
  
  .step {
    padding: 4px;
    font-size: 12px;
  }
  
  .step-num {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .step-title {
    font-size: 11px;
  }
  
  .input, .textarea, .select {
    padding: 12px 14px;
    font-size: 16px;
  }
  
  .btn {
    padding: 12px 10px;
    font-size: 15px;
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
      setErrorMessage('Passwords do not match.');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    Cookies.set('email', email, { expires: 1, path: '/', sameSite: 'Lax' });
    Cookies.set('password', password, { expires: 1, path: '/', sameSite: 'Lax' });
    Cookies.set('fullname', fullname, { expires: 1, path: '/', sameSite: 'Lax' });
    Cookies.set('phone', phone, { expires: 1, path: '/', sameSite: 'Lax' });
    setSuccessMessage('Saved!');
    setTimeout(() => { setSuccessMessage(''); setCurrentStage(2); }, 900);
  };

  const handleStage2Next = () => {
    if (!selectedPlan) {
      setErrorMessage('Please select a plan to continue.');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('Plan selected!');
    setTimeout(() => { setSuccessMessage(''); setCurrentStage(3); }, 900);
  };

  const handleStage2Back = () => setCurrentStage(1);
  const handleStage3Back = () => setCurrentStage(2);

  const handleDefine = () => {
    if (!websiteUrl) {
      setErrorMessage('Please enter your website URL before defining your bot.');
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
      .catch(() => setErrorMessage('Error sending request to server.'))
      .finally(() => setIsDefining(false));
  };

  const handleStage3Next = () => {
    if (!botDefinition) {
      setErrorMessage('צריך קודם ללחוץ על "הגדר" כדי לקבל הגדרות לבוט');
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
      .catch(() => setErrorMessage('Error sending data to server.'));
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

          <div>
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

          <div>
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

          <div>
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

          <div>
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

          <div>
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

          <div className="actions">
            <button className="btn btn--primary btn--wide" onClick={handleStage1Next}>המשך</button>
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
              <div style={{fontSize: '2rem', fontWeight: '900', color: 'var(--brand)', margin: '0 0 8px 0'}}>חינם ל-14 יום, אח״כ רק 15₪ לחודש</div>
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
            <button className="btn btn--primary" onClick={handleStage2Next}>הבא</button>
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
            <button className="btn" onClick={handleDefine} disabled={isDefining}>
              {isDefining ? (
                <>
                  <span className="spinner" style={{marginRight: '8px'}}></span>
                  מגדיר...
                </>
              ) : (
                'הגדר'
              )}
            </button>
            <button className="btn btn--primary" onClick={handleStage3Next}>הבא</button>
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
          <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="reg-steps">
          <div className={`step ${currentStage === 1 ? 'active' : ''}`}>
            <div className="step-num">1</div>
            <div>
              <div className="step-title">חשבון</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>פרטים אישיים</div>
            </div>
          </div>
          <div className={`step ${currentStage === 2 ? 'active' : ''}`}>
            <div className="step-num">2</div>
            <div>
              <div className="step-title">תכנית</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>בחר את התוכנית שלך</div>
            </div>
          </div>
          <div className={`step ${currentStage === 3 ? 'active' : ''}`}>
            <div className="step-num">3</div>
            <div>
              <div className="step-title">הגדר את הבוט שלך</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>אתר, לוח שנה, הגדרות</div>
            </div>
          </div>
          <div className={`step ${currentStage === 4 ? 'active' : ''}`}>
            <div className="step-num">4</div>
            <div>
              <div className="step-title">API</div>
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
