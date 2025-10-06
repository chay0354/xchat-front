export const designTokens = `
:root {
  --bg: #200f15ff;
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
  --brand-2: #5cff9dff;
  --ok: #16a34a;
  --warn: #dc2626;
  --border: rgba(15,20,32,0.12);
  --shadow: 0 10px 25px rgba(15,20,32,0.08);
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
`

export const loginStyles = `
html, body, #root { overflow: hidden; }

.login-root {
  height: 100dvh;
  display: grid;
  place-items: center;
  color: var(--text);
  background: radial-gradient(1200px 900px at -10% -20%, #1b2232 0%, var(--bg) 50%), var(--bg);
  overflow: hidden;
}

.login-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(500px 300px at 10% 10%, rgba(142,125,255,0.12), transparent 60%),
    radial-gradient(600px 400px at 90% 80%, rgba(110,168,254,0.10), transparent 60%);
  filter: blur(2px);
}

.login-card {
  position: relative;
  width: min(92vw, 420px);
  padding: 28px 24px 20px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.login-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}

.login-brand {
  display: flex; align-items: center; gap: 10px; font-weight: 800; letter-spacing: .3px;
}
.login-dot { width: 12px; height: 12px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), var(--brand-2)); box-shadow: 0 0 14px var(--brand);
}

.theme-toggle {
  background: var(--panel); color: var(--text);
  border: 1px solid var(--border); border-radius: 10px;
  padding: 8px 10px; cursor: pointer;
}
.theme-toggle:hover { border-color: var(--brand); }

.login-title { font-size: 22px; font-weight: 800; margin: 6px 0 4px; }
.login-sub { color: var(--text-dim); min-height: 22px; }

.login-form { display: grid; gap: 12px; margin-top: 18px; }

.input-wrap { display: grid; gap: 6px; }
.input-label { font-size: 12px; color: var(--text-dim); }

.input {
  width: 100%;
  padding: 12px 14px;
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  outline: none;
}
.input::placeholder { color: var(--text-dim); }

.actions {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;
}
.btn {
  padding: 12px 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  transition: transform .05s ease, background .2s ease, border-color .2s ease;
  font-weight: 600;
}
.btn:hover { background: var(--panel-strong); border-color: var(--brand); transform: translateY(-1px); }
.btn--primary { border-color: var(--brand); }
.btn--muted { border-style: dashed; }

.login-foot {
  margin-top: 14px;
  font-size: 12px; color: var(--text-dim);
  display: flex; align-items: center; gap: 8px; justify-content: center;
}

.alert {
  margin-top: 10px;
  color: #fff;
  background: linear-gradient(180deg, rgba(239,68,68,0.30), rgba(239,68,68,0.15));
  border: 1px solid rgba(239,68,68,0.45);
  padding: 8px 10px; border-radius: 10px;
}
`;