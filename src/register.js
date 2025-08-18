import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

// 🔗 Backend base URL (EC2 behind Nginx/Certbot)
const API_BASE = 'https://xchatback123.xyz';

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
html, body, #root { height: 100%; overflow: hidden; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
`;

const pageStyles = `
.reg-root {
  height: 100dvh; display: grid; place-items: center; color: var(--text);
  background: radial-gradient(1200px 900px at -10% -20%, #1b2232 0%, var(--bg) 50%), var(--bg);
  overflow: hidden; position: relative;
}
.reg-bg { position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(500px 300px at 10% 10%, rgba(142,125,255,0.12), transparent 60%),
    radial-gradient(600px 400px at 90% 80%, rgba(110,168,254,0.10), transparent 60%);
  filter: blur(2px);
}
.reg-card {
  position: relative; width: min(96vw, 980px); min-height: 68vh;
  border: 1px solid var(--border); border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  box-shadow: var(--shadow); backdrop-filter: blur(10px);
  display: grid; grid-template-rows: auto auto 1fr;
}
.reg-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--border); }
.reg-brand { display: flex; align-items: center; gap: 10px; font-weight: 900; letter-spacing: .3px; }
.reg-dot { width: 12px; height: 12px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), var(--brand-2)); box-shadow: 0 0 14px var(--brand);
}
.theme-toggle { background: var(--panel); color: var(--text);
  border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; cursor: pointer;
}
.theme-toggle:hover { border-color: var(--brand); }
.reg-steps { padding: 10px 18px; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.step {
  display: grid; grid-template-columns: 36px 1fr; align-items: center; gap: 10px;
  padding: 10px; border-radius: 12px; border: 1px dashed var(--border); color: var(--text-dim);
  background: var(--panel);
}
.step.active { border: 1px solid var(--brand); color: var(--text); background: var(--panel-strong); }
.step-num {
  width: 36px; height: 36px; border-radius: 10px; display:flex; align-items:center; justify-content:center;
  background: var(--panel-strong); font-weight: 800;
}
.step-title { font-weight: 700; }
.reg-content { padding: 18px; overflow: auto; min-height: 0; }
.section { display: grid; gap: 14px; max-width: 760px; margin: 0 auto; }
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

/* Disabled & loading */
.btn[disabled] { opacity: .6; cursor: not-allowed; transform: none; }
.spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.35); border-top-color: var(--brand);
  animation: spin .8s linear infinite; display: inline-block; vertical-align: -2px;
}
@keyframes spin { to { transform: rotate(360deg); } }

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
.reg-footer { padding: 12px 18px; border-top: 1px solid var(--border); display:flex; align-items:center; justify-content: flex-end; gap: 10px; }
`;

function Register() {
  const [theme, setTheme] = useState('dark');
  const [currentStage, setCurrentStage] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [botDefinition, setBotDefinition] = useState('');
  const [googleCalendarToken, setGoogleCalendarToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  // NEW: loading state for the Define action
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get('username')) Cookies.set('username', '', { expires: 1, path: '/', sameSite: 'Lax' });
    if (!Cookies.get('password')) Cookies.set('password', '', { expires: 1, path: '/', sameSite: 'Lax' });
    if (!Cookies.get('usertoken')) Cookies.set('usertoken', '', { expires: 1, path: '/', sameSite: 'Lax' });
  }, []);

  const handleStage1Next = () => {
    if (!username || !password) {
      setErrorMessage('Username and password must not be empty.');
      setSuccessMessage('');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    Cookies.set('username', username, { expires: 1, path: '/', sameSite: 'Lax' });
    Cookies.set('password', password, { expires: 1, path: '/', sameSite: 'Lax' });
    setSuccessMessage('Saved!');
    setTimeout(() => { setSuccessMessage(''); setCurrentStage(2); }, 900);
  };

  // UPDATED: async + spinner while waiting for response
  const handleDefine = async () => {
    if (!websiteUrl) {
      setErrorMessage('Please enter your website URL before defining your bot.');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: websiteUrl }),
      });
      const data = await r.json();
      if (data.reply) {
        setBotDefinition(data.reply);
        setSuccessMessage('Bot definition received.');
      } else {
        setErrorMessage(data.error || 'Failed to get bot definition.');
      }
    } catch (e) {
      setErrorMessage('Error sending request to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleStage2Next = () => {
    if (!botDefinition) {
      setErrorMessage('Bot definition is empty. Please define your bot first.');
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    const payload = { username, password, botDefinition, googleCalendarToken };
    fetch(`${API_BASE}/savedata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          Cookies.set('usertoken', data.token, { expires: 1, path: '/', sameSite: 'Lax' });
          Cookies.set('testtoken', data.token, { expires: 1, path: '/', sameSite: 'Lax' });
          setSuccessMessage('Data saved successfully.');
          setTimeout(() => { setSuccessMessage(''); setCurrentStage(3); }, 900);
        } else {
          setErrorMessage(data.error || 'Failed to save data.');
        }
      })
      .catch(() => setErrorMessage('Error sending data to server.'));
  };

  const handleStage2Back = () => setCurrentStage(1);

  const userToken = Cookies.get('usertoken') || 'Token not available';

  const pythonExample = `import requests

url = "https://xchatback123.xyz/flow"
payload = {
    "question": "Your question here",
    "usertoken": "${userToken}"
}
response = requests.post(url, json=payload)
print(response.json())`;

  const jsExample = `fetch("https://xchatback123.xyz/flow", {
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
          <h2>Stage 1 · Account Info</h2>
          {!!errorMessage && <div className="alert">{errorMessage}</div>}
          {!!successMessage && <div className="success">{successMessage}</div>}

          <div>
            <div className="label">Username</div>
            <input
              className="input"
              type="text"
              placeholder="e.g. chay"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <div className="label">Confirm Password</div>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="actions">
            <button className="btn btn--primary btn--wide" onClick={handleStage1Next}>Next</button>
          </div>
        </div>
      );
    }

    if (currentStage === 2) {
      return (
        <div className="section">
          <h2>Stage 2 · Define Your Bot</h2>
          {!!errorMessage && <div className="alert">{errorMessage}</div>}
          {!!successMessage && <div className="success">{successMessage}</div>}

          <div>
            <div className="label">Website URL (AI will crawl/define)</div>
            <input
              className="input"
              type="text"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div>
            <div className="label">Google Calendar API Token (optional)</div>
            <input
              className="input"
              type="text"
              placeholder="Paste your token (if any)"
              value={googleCalendarToken}
              onChange={(e) => setGoogleCalendarToken(e.target.value)}
            />
          </div>

          <div>
            <div className="label">Manual Definition / Edit</div>
            <textarea
              className="textarea"
              placeholder="Enter manual bot definition here..."
              value={botDefinition}
              onChange={(e) => setBotDefinition(e.target.value)}
            />
          </div>

          <div className="actions">
            <button className="btn" onClick={handleStage2Back} disabled={loading}>Back</button>
            <button className="btn" onClick={handleDefine} disabled={loading}>
              {loading ? (<><span className="spinner" />&nbsp;Defining…</>) : 'Define'}
            </button>
            <button className="btn btn--primary" onClick={handleStage2Next} disabled={loading}>Next</button>
          </div>
        </div>
      );
    }

    // Stage 3
    return (
      <div className="section">
        <h2>Stage 3 · API Usage & Overview</h2>
        {!!errorMessage && <div className="alert">{errorMessage}</div>}
        {!!successMessage && <div className="success">{successMessage}</div>}

        <div>
          <div className="label">Your usertoken</div>
          <div className="codebox" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <code style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 10 }}>
              {userToken}
            </code>
            <button className="copy" onClick={() => copy(userToken)}>Copy</button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div className="label">Language</div>
          <select className="select" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        <div>
          <div className="codehead">
            <div>Example request</div>
            <button
              className="copy"
              onClick={() => copy(selectedLanguage === 'python' ? pythonExample : jsExample)}
            >
              Copy
            </button>
          </div>
          <pre className="codebox">
            {selectedLanguage === 'python' ? pythonExample : jsExample}
          </pre>
        </div>

        <div className="label">
          Send a <code>POST</code> to <code>https://xchatback123.xyz/flow</code> with <code>question</code> and <code>usertoken</code>.
          Optionally include <code>convtoken</code> to continue a conversation.
        </div>

        <div className="actions">
          <button className="btn btn--primary btn--wide" onClick={() => navigate('/')}>Finish</button>
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
            <div>FlowChat · Onboarding</div>
          </div>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="reg-steps">
          <div className={`step ${currentStage === 1 ? 'active' : ''}`}>
            <div className="step-num">1</div>
            <div>
              <div className="step-title">Account</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Username & password</div>
            </div>
          </div>
          <div className={`step ${currentStage === 2 ? 'active' : ''}`}>
            <div className="step-num">2</div>
            <div>
              <div className="step-title">Bot Setup</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Website, calendar, definition</div>
            </div>
          </div>
          <div className={`step ${currentStage === 3 ? 'active' : ''}`}>
            <div className="step-num">3</div>
            <div>
              <div className="step-title">API</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Token & examples</div>
            </div>
          </div>
        </div>

        <div className="reg-content">{renderStageContent()}</div>

        <div className="reg-footer">
          {currentStage > 1 && (
            <button className="btn" onClick={() => setCurrentStage((s) => Math.max(1, s - 1))} disabled={loading}>
              ← Back
            </button>
          )}
          {currentStage < 3 && (
            <button className="btn btn--primary" onClick={() => setCurrentStage((s) => Math.min(3, s + 1))} title="Skip ahead" disabled={loading}>
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
