import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
// Point frontend → EC2 backend (HTTPS behind Nginx/Certbot)
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
.edit-root {
  min-height: 100dvh; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: var(--text);
  background: radial-gradient(1200px 900px at -10% -20%, #1b2232 0%, var(--bg) 50%), var(--bg);
  padding: 20px; 
  position: relative;
}

.edit-bg { 
  position: absolute; 
  inset: 0; 
  pointer-events: none;
  background:
    radial-gradient(500px 300px at 10% 10%, rgba(142,125,255,0.12), transparent 60%),
    radial-gradient(600px 400px at 90% 80%, rgba(110,168,254,0.10), transparent 60%);
  filter: blur(2px);
}

.edit-card {
  position: relative; 
  width: min(96vw, 600px); 
  max-height: 90vh;
  border: 1px solid var(--border); 
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  box-shadow: var(--shadow); 
  backdrop-filter: blur(10px);
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
}

.edit-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 20px 24px; 
  border-bottom: 1px solid var(--border); 
}

.edit-brand { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  font-weight: 900; 
  letter-spacing: .3px; 
}

.edit-dot { 
  width: 12px; 
  height: 12px; 
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), var(--brand-2)); 
  box-shadow: 0 0 14px var(--brand);
}

.theme-toggle { 
  background: var(--panel); 
  color: var(--text);
  border: 1px solid var(--border); 
  border-radius: 10px; 
  padding: 8px 10px; 
  cursor: pointer;
}

.theme-toggle:hover { 
  border-color: var(--brand); 
}

.edit-content { 
  padding: 24px; 
  overflow-y: auto; 
  flex: 1; 
  min-height: 0; 
}

.edit-section { 
  display: grid; 
  gap: 16px; 
  max-width: 100%; 
  margin: 0 auto; 
}

.edit-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: var(--text);
}

.edit-subtitle {
  font-size: 14px;
  color: var(--text-dim);
  margin: 0 0 24px 0;
}

.label { 
  font-size: 12px; 
  color: var(--text-dim); 
  font-weight: 600;
  margin-bottom: 6px;
}

.input, .textarea { 
  width: 100%; 
  padding: 12px 14px; 
  border-radius: 12px; 
  border: 1px solid var(--border);
  background: var(--panel); 
  color: var(--text); 
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.input:focus, .textarea:focus {
  border-color: var(--brand);
}

.input::placeholder, .textarea::placeholder { 
  color: var(--text-dim); 
}

.textarea { 
  resize: vertical; 
  min-height: 120px; 
  font-family: inherit;
}

.actions { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 12px; 
  margin-top: 24px;
}

.btn {
  padding: 12px 16px; 
  border-radius: 12px; 
  border: 1px solid var(--border);
  background: var(--panel); 
  color: var(--text); 
  cursor: pointer; 
  font-weight: 600;
  font-size: 14px;
  transition: transform .05s ease, background .2s ease, border-color .2s ease;
}

.btn:hover { 
  background: var(--panel-strong); 
  border-color: var(--brand); 
  transform: translateY(-1px); 
}

.btn--primary { 
  border-color: var(--brand); 
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  color: white;
}

.btn--primary:hover {
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
}

.btn--secondary {
  border-style: dashed;
}

.alert {
  color: #fff; 
  border-radius: 10px; 
  padding: 10px 12px;
  border: 1px solid rgba(239,68,68,0.45);
  background: linear-gradient(180deg, rgba(239,68,68,0.30), rgba(239,68,68,0.15));
  margin-bottom: 16px;
}

.success {
  color: #0e1; 
  border: 1px solid rgba(34,197,94,0.45);
  background: linear-gradient(180deg, rgba(34,197,94,0.25), rgba(34,197,94,0.12));
  margin-bottom: 16px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  font-size: 16px;
  color: var(--text-dim);
}

@media (max-width: 768px) {
  .edit-root { 
    padding: 10px; 
    min-height: 100vh;
  }
  
  .edit-card { 
    width: 100%; 
    max-height: 95vh; 
    border-radius: 16px;
  }
  
  .edit-content { 
    padding: 20px; 
  }
  
  .edit-section { 
    gap: 12px; 
  }
  
  .actions { 
    grid-template-columns: 1fr; 
    gap: 10px;
  }
  
  .edit-title {
    font-size: 20px;
  }
  
  .edit-subtitle {
    font-size: 13px;
  }
  
  .input, .textarea {
    padding: 14px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .btn {
    padding: 14px 16px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .edit-root { 
    padding: 8px; 
  }
  
  .edit-card { 
    border-radius: 12px;
  }
  
  .edit-content { 
    padding: 16px; 
  }
  
  .edit-section { 
    gap: 10px; 
  }
  
  .edit-title {
    font-size: 18px;
  }
  
  .edit-subtitle {
    font-size: 12px;
  }
  
  .input, .textarea {
    padding: 12px 14px;
    font-size: 16px;
  }
  
  .btn {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .edit-header {
    padding: 16px 20px;
  }
  
  .edit-brand {
    font-size: 14px;
  }
}
`;

function EditUserInfo() {
  const [theme, setTheme] = useState('light');
  const [calendarToken, setCalendarToken] = useState('');
  const [password, setPassword] = useState('');
  const [botDefinition, setBotDefinition] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fetch user info on mount using the token from cookie "testtoken"
  useEffect(() => {
    const fetchUserInfo = async () => {
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
        const userData = Array.isArray(data) ? data[0] : data;

        setCalendarToken(userData?.calendertoken || '');
        setPassword(userData?.password || '');
        setBotDefinition(userData?.botDefinition || '');
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to fetch user information.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSave = async () => {
    const token = Cookies.get('testtoken');
    if (!token) {
      setErrorMessage('User token not found.');
      return;
    }

    const payload = { calendartoken: calendarToken, password, botDefinition };

    try {
      const res = await fetch(`${API_BASE}/edit?usertoken=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMessage('User info updated successfully.');
        setErrorMessage('');
      } else {
        setSuccessMessage('');
        setErrorMessage('Failed to update user info.');
      }
    } catch (err) {
      console.error(err);
      setSuccessMessage('');
      setErrorMessage('Error updating user info.');
    }
  };

  const handleBack = () => {
    navigate('/fullchat');
  };

  if (loading) {
    return (
      <div className={`edit-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
        <style>{designTokens + pageStyles}</style>
        <div className="edit-bg" />
        <div className="edit-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`edit-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <style>{designTokens + pageStyles}</style>
      <div className="edit-bg" />
      
      <div className="edit-card">
        <div className="edit-header">
          <div className="edit-brand">
            <div className="edit-dot" />
            <div>ערוך את הפרופיל שלך</div>
          </div>
          <button 
            className="theme-toggle" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="edit-content">
          <div className="edit-section">
            <h1 className="edit-title">ערוך את הפרופיל שלך</h1>
            <p className="edit-subtitle">עדכן את פרטי החשבון שלך והגדרות הבוט</p>

            {errorMessage && <div className="alert">{errorMessage}</div>}
            {successMessage && <div className="success">{successMessage}</div>}

            <div>
              <label className="label">Calendar Token</label>
              <input
                type="text"
                className="input"
                placeholder="Enter your calendar token..."
                value={calendarToken}
                onChange={(e) => setCalendarToken(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter new password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="label">הגדרות לבוט</label>
              <textarea
                className="textarea"
                placeholder="הכנס הגדרות לבוט כאן..."
                value={botDefinition}
                onChange={(e) => setBotDefinition(e.target.value)}
              />
            </div>

            {/* API Usage & Overview */}
            <div style={{
              marginTop: '32px',
              padding: '24px',
              background: 'var(--panel)',
              borderRadius: '16px',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                background: 'var(--gradient)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Stage 4 · API Usage & Overview
              </div>

              {/* Your usertoken */}
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  הטוקן שלך:
                </label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <input
                    type="text"
                    value={Cookies.get('testtoken') || ''}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '14px',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(Cookies.get('testtoken') || '');
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'var(--brand)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    העתק
                  </button>
                </div>
              </div>

              {/* Language */}
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  שפת פיתוח:
                </label>
                <select
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    minWidth: '120px'
                  }}
                >
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              {/* Example request */}
              <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    קוד להטמעה:
                  </label>
                  <button
                    onClick={() => {
                      const code = `import requests

url = "${API_BASE}/fullchat"
payload = {
    "question": "Your question here",
    "usertoken": "${Cookies.get('testtoken') || 'YOUR_USER_TOKEN'}"
}
response = requests.post(url, json=payload)
print(response.json())`;
                      navigator.clipboard.writeText(code);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--brand)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div style={{
                  background: 'var(--bg)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '13px',
                  overflowX: 'auto'
                }}>
                  <pre style={{margin: 0, color: 'var(--text)'}}>{`import requests

url = "${API_BASE}/fullchat"
payload = {
    "question": "Your question here",
    "usertoken": "${Cookies.get('testtoken') || 'YOUR_USER_TOKEN'}"
}
response = requests.post(url, json=payload)
print(response.json())`}</pre>
                </div>
              </div>

              {/* Instructions */}
              <div style={{
                fontSize: '14px',
                color: 'var(--text-dim)',
                lineHeight: '1.5'
              }}>
                Send a POST to {API_BASE}/fullchat with question and usertoken. Optionally include convtoken to continue a conversation.
              </div>
            </div>

            <div className="actions">
              <button className="btn btn--secondary" onClick={handleBack}>
                חזרה לצ'אט
              </button>
              <button className="btn btn--primary" onClick={handleSave}>
                שמור שינויים
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUserInfo;
