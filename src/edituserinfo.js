// EditUserInfo.jsx — matches FullChat design language
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://xchatback123.xyz';

export default function EditUserInfo() {
  const [calendarToken, setCalendarToken] = useState('');
  const [password, setPassword] = useState('');
  const [botDefinition, setBotDefinition] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = Cookies.get('testtoken');
      if (!token) {
        setErrorMessage('User token not found.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/get-user-info?usertoken=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error('Failed to fetch user info');
        const data = await res.json();
        const user = Array.isArray(data) ? data[0] : data;

        // NOTE: backend returns "calendartoken"
        setCalendarToken(user?.calendartoken || '');
        setPassword(user?.password || '');
        setBotDefinition(user?.botDefinition || '');
      } catch (e) {
        setErrorMessage('Failed to fetch user information.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    const token = Cookies.get('testtoken');
    if (!token) {
      setErrorMessage('User token not found.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');

    const payload = { calendartoken: calendarToken, password, botDefinition };
    try {
      const res = await fetch(`${API_BASE}/edit?usertoken=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      setSuccessMessage('User info updated successfully.');
    } catch (e) {
      setErrorMessage('Failed to update user info.');
    }
  };

  return (
    <div className={`fc-root fc-edit ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <style>{styles}</style>

      {/* (Optional) Slim header matches FullChat tone */}
      <header className="fc-header">
        <div className="fc-header__left">
          <div className="fc-avatar fc-avatar--lg">U</div>
          <div>
            <div className="fc-title">Profile & Bot Settings</div>
            <div className="fc-subtitle">Manage calendar, password, and bot definition</div>
          </div>
        </div>
        <div className="fc-header__right">
          <button className="fc-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button className="fc-btn" onClick={() => navigate('/fullchat')}>← Back to Chat</button>
        </div>
      </header>

      <main className="fc-edit__main">
        <div className="fc-card">
          {loading ? (
            <div className="fc-skel">Loading…</div>
          ) : (
            <>
              {errorMessage && <div className="fc-banner fc-banner--error">{errorMessage}</div>}
              {successMessage && <div className="fc-banner fc-banner--ok">{successMessage}</div>}

              <div className="fc-form">
                <div className="fc-field">
                  <label className="fc-label">Google Calendar Token</label>
                  <input
                    className="fc-input"
                    type="text"
                    placeholder="Paste your OAuth access token"
                    value={calendarToken}
                    onChange={(e) => setCalendarToken(e.target.value)}
                    spellCheck={false}
                  />
                  <div className="fc-help">Used for reading availability & adding meetings.</div>
                </div>

                <div className="fc-field">
                  <label className="fc-label">Password</label>
                  <input
                    className="fc-input"
                    type="password"
                    placeholder="Update your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <div className="fc-field">
                  <label className="fc-label">Bot Definition</label>
                  <textarea
                    className="fc-textarea"
                    placeholder="Paste the system prompt / bot definition here…"
                    value={botDefinition}
                    onChange={(e) => setBotDefinition(e.target.value)}
                  />
                  <div className="fc-help">
                    This definition is used for ALL chat modes (text + voice).
                  </div>
                </div>

                <div className="fc-actions">
                  <button className="fc-btn fc-btn--primary" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="fc-btn fc-btn--secondary" onClick={() => navigate('/fullchat')}>
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = `
:root{--bg:#0f1420;--panel:rgba(255,255,255,0.06);--panel-strong:rgba(255,255,255,0.12);--text:#e8ecf3;--text-dim:#aab3c5;--brand:#6ea8fe;--brand-2:#8a7dff;--ok:#22c55e;--warn:#ef4444;--border:rgba(255,255,255,0.12);--shadow:0 8px 30px rgba(0,0,0,0.25)}
.theme-light{--bg:#f3f6fb;--panel:#fff;--panel-strong:#fff;--text:#0f1420;--text-dim:#5b667a;--brand:#316bff;--brand-2:#6b5cff;--ok:#16a34a;--warn:#dc2626;--border:rgba(15,20,32,0.12);--shadow:0 10px 25px rgba(15,20,32,0.08)}
*{box-sizing:border-box}html,body,#root{height:100%;overflow:hidden}body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial}
.fc-root.fc-edit{display:grid;grid-template-rows:auto 1fr;min-height:100dvh;overflow:hidden;background:radial-gradient(1200px 900px at -10% -20%,#1b2232 0%,var(--bg) 50%),var(--bg);color:var(--text)}
.fc-header{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0)),transparent;backdrop-filter:blur(8px)}
.fc-header__left{display:flex;align-items:center;gap:12px}.fc-avatar--lg{width:44px;height:44px;border-radius:12px;background:linear-gradient(180deg,#316bff55,#6b5cff44);display:flex;align-items:center;justify-content:center;font-weight:800}
.fc-title{font-size:16px;font-weight:700}.fc-subtitle{font-size:12px;color:var(--text-dim)}
.fc-header__right{display:flex;gap:8px}
.fc-btn{padding:8px 12px;border:1px solid var(--border);border-radius:10px;cursor:pointer;color:var(--text);background:var(--panel);transition:transform .05s ease,background .2s ease,border-color .2s ease}
.fc-btn:hover{background:var(--panel-strong);border-color:var(--brand);transform:translateY(-1px)}
.fc-btn--primary{border-color:var(--brand)}
.fc-btn--secondary{border-color:var(--text-dim)}
.fc-edit__main{display:grid;place-items:center;padding:24px;overflow:auto}
.fc-card{width:min(960px,92vw);background:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03));border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);padding:20px 18px}
.fc-skel{color:var(--text-dim);padding:24px;text-align:center}
.fc-banner{padding:10px 12px;border-radius:10px;margin-bottom:10px;border:1px solid transparent}
.fc-banner--ok{background:rgba(34,197,94,0.12);border-color:rgba(34,197,94,0.35);color:#a7f3d0}
.fc-banner--error{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);color:#fecaca}
.fc-form{display:grid;gap:14px}
.fc-field{display:grid;gap:8px}
.fc-label{font-size:13px;font-weight:700;color:var(--text)}
.fc-input,.fc-textarea{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--panel);color:var(--text);outline:none}
.fc-textarea{min-height:180px;resize:vertical}
.fc-input::placeholder,.fc-textarea::placeholder{color:var(--text-dim)}
.fc-help{font-size:12px;color:var(--text-dim)}
.fc-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px}
@media (max-width:860px){.fc-card{padding:16px 14px}}
`;
