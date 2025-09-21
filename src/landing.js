import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

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
  --gradient: linear-gradient(135deg, var(--brand), var(--brand-2));
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
  --gradient: linear-gradient(135deg, var(--brand), var(--brand-2));
}

* { box-sizing: border-box; }
html, body, #root { min-height: 100%; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
`;

const landingStyles = `
.landing-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  position: relative;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.landing-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(ellipse at top left, rgba(110,168,254,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(138,125,255,0.15) 0%, transparent 50%);
}

/* Header */
.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 0;
  background: rgba(15,20,32,0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.landing-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.landing-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -0.5px;
}

.landing-logo__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gradient);
}

.landing-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn:hover {
  background: var(--panel-strong);
  border-color: var(--brand);
  transform: translateY(-1px);
}

.btn--primary {
  background: var(--gradient);
  border-color: transparent;
  color: white;
  font-weight: 600;
}

.btn--primary:hover {
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(110,168,254,0.3);
}

.theme-toggle {
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  margin-left: 8px;
}

.theme-toggle:hover {
  border-color: var(--brand);
}

/* Hero Section */
.landing-hero {
  padding: 140px 24px 100px;
  text-align: center;
  max-width: 1000px;
  margin: 0 auto;
}

.landing-hero__title {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 32px 0;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.landing-hero__subtitle {
  font-size: clamp(1.2rem, 2.5vw, 1.5rem);
  color: var(--text-dim);
  margin: 0 0 48px 0;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.landing-hero__cta {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 80px;
}

.landing-hero__cta .btn {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
}

/* Features Section */
.landing-features {
  padding: 80px 24px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  width: 100%;
}

.landing-section__title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin: 0 0 16px 0;
}

.landing-section__subtitle {
  font-size: 1.2rem;
  color: var(--text-dim);
  text-align: center;
  margin: 0 0 60px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
  max-width: 100%;
  width: 100%;
}

.feature-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 28px;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.feature-desc {
  color: var(--text-dim);
  line-height: 1.6;
  margin: 0;
}

/* How It Works */
.landing-how {
  padding: 80px 24px;
  background: var(--panel);
  margin: 80px 0;
  text-align: center;
  width: 100%;
}

.landing-how .landing-section__title,
.landing-how .landing-section__subtitle {
  color: var(--text);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
}

.step-card {
  text-align: center;
  position: relative;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  margin: 0 auto 20px;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.step-desc {
  color: var(--text-dim);
  line-height: 1.6;
  margin: 0;
}

/* Pricing Section */
.landing-pricing {
  padding: 80px 24px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  width: 100%;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
}

.pricing-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.pricing-card.featured {
  border-color: var(--brand);
  background: linear-gradient(180deg, rgba(110,168,254,0.1), var(--panel));
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gradient);
  color: white;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.pricing-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 8px 0;
}

.pricing-price {
  font-size: 3rem;
  font-weight: 900;
  margin: 0 0 8px 0;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pricing-period {
  color: var(--text-dim);
  margin: 0 0 32px 0;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  text-align: left;
}

.pricing-features li {
  padding: 8px 0;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 12px;
}

.pricing-features li::before {
  content: "✓";
  color: var(--ok);
  font-weight: 800;
  width: 20px;
  text-align: center;
}

/* Footer */
.landing-footer {
  padding: 60px 24px 40px;
  background: var(--panel);
  text-align: center;
  border-top: 1px solid var(--border);
}

.landing-footer__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 20px;
}

.landing-footer__logo .landing-logo__dot {
  width: 10px;
  height: 10px;
}

.landing-footer__text {
  color: var(--text-dim);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .landing-hero {
    padding: 100px 16px 60px;
  }
  
  .landing-hero__cta {
    flex-direction: column;
    align-items: center;
  }
  
  .landing-hero__cta .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .features-grid,
  .steps-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .landing-nav {
    padding: 0 16px;
  }
  
  .landing-actions {
    gap: 8px;
  }
  
  .btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}
`;

function Landing() {
  const [theme, setTheme] = useState('dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const token = Cookies.get('testtoken');
    const user = Cookies.get('username');
    if (token && user) {
      setIsLoggedIn(true);
      setUsername(user);
      loadBots();
    }
  }, []);

  const loadBots = async () => {
    const token = Cookies.get('testtoken');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5137'}/fullchat?usertoken=${encodeURIComponent(token)}`);
      if (response.ok) {
        const data = await response.json();
        setBots(data.chats || []);
      }
    } catch (err) {
      console.error('Error loading bots:', err);
      setError('Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    Cookies.remove('testtoken');
    Cookies.remove('usertoken');
    Cookies.remove('username');
    setIsLoggedIn(false);
    setUsername('');
    setBots([]);
    setActiveSection('home');
  };

  const handleSelectPlan = (planName) => {
    navigate('/register', { state: { selectedPlan: planName } });
  };

  const handleCreateBot = () => {
    navigate('/register', { state: { selectedPlan: 'test', skipToBot: true } });
  };

  return (
    <div className={`landing-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <style>{designTokens + landingStyles}</style>
      <div className="landing-bg" />

      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="landing-logo">
            <div className="landing-logo__dot" />
            <span>FlowChat</span>
          </div>
          <div className="landing-actions">
            {isLoggedIn ? (
              <>
                <button 
                  className={`btn ${activeSection === 'home' ? 'btn--primary' : ''}`}
                  onClick={() => setActiveSection('home')}
                >
                  Home
                </button>
                <button 
                  className={`btn ${activeSection === 'bots' ? 'btn--primary' : ''}`}
                  onClick={() => setActiveSection('bots')}
                >
                  Bots
                </button>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px'}}>
                  <span style={{fontSize: '14px', color: 'var(--text-dim)'}}>Hi, {username}</span>
                  <button className="btn" onClick={handleLogout} style={{padding: '6px 12px', fontSize: '12px'}}>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="btn" onClick={handleLogin}>
                  Login
                </button>
                <button className="btn btn--primary" onClick={handleGetStarted}>
                  Get Started
                </button>
              </>
            )}
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      {activeSection === 'home' && (
        <>
          {/* Hero Section */}
          <section className="landing-hero">
            <h1 className="landing-hero__title">
              {isLoggedIn ? `Welcome back, ${username}!` : 'Create AI Bots in 40 Seconds'}
            </h1>
            <p className="landing-hero__subtitle">
              {isLoggedIn 
                ? 'Manage your AI bots and create new ones to automate your customer support.'
                : 'Give us your website URL, and we\'ll automatically build a smart chatbot that knows everything about your business. Zero setup, instant results.'
              }
            </p>
            
            {/* Statistics */}
            {!isLoggedIn && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '32px',
                margin: '48px 0',
                maxWidth: '600px',
                margin: '48px auto'
              }}>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2.5rem', fontWeight: '800', color: 'var(--brand)', marginBottom: '8px'}}>40s</div>
                  <div style={{color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500'}}>Setup Time</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2.5rem', fontWeight: '800', color: 'var(--brand)', marginBottom: '8px'}}>99.9%</div>
                  <div style={{color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500'}}>Uptime</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2.5rem', fontWeight: '800', color: 'var(--brand)', marginBottom: '8px'}}>10K+</div>
                  <div style={{color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500'}}>Queries/Month</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2.5rem', fontWeight: '800', color: 'var(--brand)', marginBottom: '8px'}}>24/7</div>
                  <div style={{color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500'}}>Support</div>
                </div>
              </div>
            )}

            <div className="landing-hero__cta">
              {isLoggedIn ? (
                <>
                  <button className="btn btn--primary" onClick={() => setActiveSection('bots')}>
                    Manage Bots
                  </button>
                  <button className="btn" onClick={() => navigate('/fullchat')}>
                    Go to Chat
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn--primary" onClick={handleGetStarted}>
                    Start Building Bots
                  </button>
                  <button className="btn" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                    See How It Works
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="landing-features">
            <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 24px'}}>
              <h2 className="landing-section__title">Why Choose FlowChat?</h2>
              <p className="landing-section__subtitle">
                The fastest way to create intelligent, context-aware chatbots
              </p>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3 className="feature-title">Lightning Fast Setup</h3>
                  <p className="feature-desc">
                    From website URL to working chatbot in under 60 seconds. No manual training or data uploads required.
                  </p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">🧠</div>
                  <h3 className="feature-title">AI-Powered Intelligence</h3>
                  <p className="feature-desc">
                    Advanced language models understand context and provide accurate, helpful responses based on your content.
                  </p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">🔗</div>
                  <h3 className="feature-title">Universal Integration</h3>
                  <p className="feature-desc">
                    Works everywhere: websites, WhatsApp, Slack, mobile apps, CRM systems. One API, infinite possibilities.
                  </p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">🎯</div>
                  <h3 className="feature-title">Context-Aware</h3>
                  <p className="feature-desc">
                    Bots only answer based on your website content, reducing hallucinations and ensuring brand consistency.
                  </p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">📈</div>
                  <h3 className="feature-title">Scalable Infrastructure</h3>
                  <p className="feature-desc">
                    Handle thousands of queries per minute with our robust, cloud-based infrastructure built for scale.
                  </p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">🛡️</div>
                  <h3 className="feature-title">Secure & Reliable</h3>
                  <p className="feature-desc">
                    Enterprise-grade security with token-based authentication and 99.9% uptime guarantee.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chat Examples Section */}
          <section style={{background: 'var(--panel)', padding: '100px 0', margin: '100px 0'}}>
            <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 24px'}}>
              <h2 className="landing-section__title">See FlowChat in Action</h2>
              <p className="landing-section__subtitle">
                Real conversations from businesses using FlowChat to automate their customer support
              </p>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px', marginTop: '60px', maxWidth: '1000px', margin: '60px auto 0'}}>
                {/* E-commerce Chat Example */}
                <div style={{
                  background: 'var(--panel-strong)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'var(--gradient)',
                    padding: '16px 20px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    🛒 E-commerce Store - TechGear.com
                  </div>
                  <div style={{padding: '20px', height: '300px', overflowY: 'auto'}}>
                    <div style={{marginBottom: '16px'}}>
                      <div style={{
                        background: 'var(--brand)',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 4px 18px',
                        maxWidth: '80%',
                        marginLeft: 'auto',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        Hi! I'm looking to buy a laptop for programming. What would you recommend?
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px'}}>
                        Customer • 2:34 PM
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                      <div style={{
                        background: 'var(--panel)',
                        color: 'var(--text)',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 18px 4px',
                        maxWidth: '85%',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        border: '1px solid var(--border)'
                      }}>
                        Great choice! For programming, I'd recommend our MacBook Pro M2 or Dell XPS 15. Both have excellent performance for coding. What's your budget range?
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px'}}>
                        AI Assistant • 2:34 PM
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                      <div style={{
                        background: 'var(--brand)',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 4px 18px',
                        maxWidth: '80%',
                        marginLeft: 'auto',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        Around $1500-2000. I need something that can handle multiple monitors.
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px'}}>
                        Customer • 2:35 PM
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                      <div style={{
                        background: 'var(--panel)',
                        color: 'var(--text)',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 18px 4px',
                        maxWidth: '85%',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        border: '1px solid var(--border)'
                      }}>
                        Perfect! The MacBook Pro M2 14" ($1,999) supports up to 2 external displays. We also have the Dell XPS 15 ($1,799) with similar capabilities. Both come with 16GB RAM and 512GB SSD. Would you like to see the detailed specs?
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px'}}>
                        AI Assistant • 2:35 PM
                      </div>
                    </div>
                  </div>
                </div>


                {/* Healthcare Chat Example */}
                <div style={{
                  background: 'var(--panel-strong)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'var(--gradient)',
                    padding: '16px 20px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    🏥 Healthcare - MedCenter
                  </div>
                  <div style={{padding: '20px', height: '300px', overflowY: 'auto'}}>
                    <div style={{marginBottom: '16px'}}>
                      <div style={{
                        background: 'var(--brand)',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 4px 18px',
                        maxWidth: '80%',
                        marginLeft: 'auto',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        I need to schedule an appointment with Dr. Smith. What are the available times?
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px'}}>
                        Patient • 1:45 PM
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                      <div style={{
                        background: 'var(--panel)',
                        color: 'var(--text)',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 18px 4px',
                        maxWidth: '85%',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        border: '1px solid var(--border)'
                      }}>
                        Dr. Smith has the following available appointments this week:
                        <br/><br/>
                        • Tuesday 2:30 PM
                        • Wednesday 10:00 AM
                        • Thursday 3:15 PM
                        • Friday 9:30 AM
                        <br/><br/>
                        What type of appointment do you need?
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px'}}>
                        AI Assistant • 1:45 PM
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                      <div style={{
                        background: 'var(--brand)',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 4px 18px',
                        maxWidth: '80%',
                        marginLeft: 'auto',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        It's for a routine checkup. Tuesday at 2:30 PM works for me.
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px'}}>
                        Patient • 1:46 PM
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                      <div style={{
                        background: 'var(--panel)',
                        color: 'var(--text)',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 18px 4px',
                        maxWidth: '85%',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        border: '1px solid var(--border)'
                      }}>
                        Perfect! I've reserved Tuesday 2:30 PM with Dr. Smith for your routine checkup. You'll receive a confirmation email shortly.
                        <br/><br/>
                        Please arrive 15 minutes early and bring your insurance card and ID. Any questions about the appointment?
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px'}}>
                        AI Assistant • 1:46 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


      {/* Integration Showcase */}
      <section className="landing-features">
        <h2 className="landing-section__title">Works Everywhere</h2>
        <p className="landing-section__subtitle">
          One API, infinite possibilities. Integrate with your favorite platforms
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">WhatsApp Business</h3>
            <p className="feature-desc">
              Reach customers where they are. Send automated responses to WhatsApp messages using our simple webhook integration.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3 className="feature-title">Slack & Teams</h3>
            <p className="feature-desc">
              Internal knowledge bots for your team. Answer questions about company policies, procedures, and documentation instantly.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3 className="feature-title">Website Widget</h3>
            <p className="feature-desc">
              Beautiful, customizable chat widget that matches your brand. Easy one-line JavaScript integration.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Mobile Apps</h3>
            <p className="feature-desc">
              Native iOS and Android support. Use our REST API to power in-app chat features and customer support.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3 className="feature-title">CRM Integration</h3>
            <p className="feature-desc">
              Connect with Salesforce, HubSpot, or any CRM. Automatically log conversations and update customer records.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Custom Solutions</h3>
            <p className="feature-desc">
              Full API access for custom integrations. Webhooks, SDKs, and comprehensive documentation for developers.
            </p>
          </div>
        </div>
      </section>

          {/* How It Works Section */}
          <section className="landing-how" id="how-it-works">
            <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 24px'}}>
              <h2 className="landing-section__title">How It Works</h2>
              <p className="landing-section__subtitle">
                Three simple steps to your intelligent chatbot
              </p>
              
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <h3 className="step-title">Provide Your Website</h3>
                  <p className="step-desc">
                    Simply enter your website URL. Our AI will automatically crawl and analyze your content.
                  </p>
                </div>
                
                <div className="step-card">
                  <div className="step-number">2</div>
                  <h3 className="step-title">AI Processing</h3>
                  <p className="step-desc">
                    We extract, clean, and transform your content into a knowledge base using advanced vector embeddings.
                  </p>
                </div>
                
                <div className="step-card">
                  <div className="step-number">3</div>
                  <h3 className="step-title">Get Your API</h3>
                  <p className="step-desc">
                    Receive a ready-to-use API endpoint that powers your chatbot across any platform or integration.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="landing-features" style={{background: 'var(--panel)', margin: '80px 0'}}>
            <h2 className="landing-section__title">What Our Customers Say</h2>
            <p className="landing-section__subtitle">
              Join thousands of businesses already using FlowChat
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '16px'}}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '20px'
                  }}>👨‍💼</div>
                  <div>
                    <div style={{fontWeight: '700', fontSize: '1rem'}}>Sarah Chen</div>
                    <div style={{color: 'var(--text-dim)', fontSize: '0.9rem'}}>CTO, TechStart Inc.</div>
                  </div>
                </div>
                <p className="feature-desc" style={{fontStyle: 'italic'}}>
                  "FlowChat reduced our support tickets by 75% in just one week. The setup was incredibly simple - just gave them our website URL and we had a working bot in minutes."
                </p>
              </div>
              
              <div className="feature-card">
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '16px'}}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '20px'
                  }}>👩‍💻</div>
                  <div>
                    <div style={{fontWeight: '700', fontSize: '1rem'}}>Marcus Rodriguez</div>
                    <div style={{color: 'var(--text-dim)', fontSize: '0.9rem'}}>Founder, E-commerce Plus</div>
                  </div>
                </div>
                <p className="feature-desc" style={{fontStyle: 'italic'}}>
                  "Our customers love the instant responses. The bot knows our entire product catalog and can answer complex questions about shipping, returns, and product compatibility."
                </p>
              </div>
              
              <div className="feature-card">
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '16px'}}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '20px'
                  }}>👨‍🏫</div>
                  <div>
                    <div style={{fontWeight: '700', fontSize: '1rem'}}>Dr. Emily Watson</div>
                    <div style={{color: 'var(--text-dim)', fontSize: '0.9rem'}}>Director, University Health</div>
                  </div>
                </div>
                <p className="feature-desc" style={{fontStyle: 'italic'}}>
                  "We use FlowChat for our patient portal. It handles appointment scheduling, insurance questions, and general inquiries 24/7. Our staff can focus on patient care."
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="landing-features">
            <h2 className="landing-section__title">Frequently Asked Questions</h2>
            <p className="landing-section__subtitle">
              Everything you need to know about FlowChat
            </p>
            
            <div style={{maxWidth: '100%', margin: '0 auto', textAlign: 'left', width: '100%', padding: '0 20px'}}>
              <div style={{marginBottom: '24px'}}>
                <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)'}}>
                  How long does it take to set up a bot?
                </h3>
                <p style={{color: 'var(--text-dim)', lineHeight: '1.6'}}>
                  Typically 40-60 seconds. Just provide your website URL, and our AI automatically crawls, processes, and creates your bot. No manual training required.
                </p>
              </div>
              
              <div style={{marginBottom: '24px'}}>
                <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)'}}>
                  What types of websites work best?
                </h3>
                <p style={{color: 'var(--text-dim)', lineHeight: '1.6'}}>
                  Any website with text content works great! E-commerce sites, SaaS platforms, healthcare providers, educational institutions, and service businesses all see excellent results.
                </p>
              </div>
              
              <div style={{marginBottom: '24px'}}>
                <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)'}}>
                  Can I customize the bot's responses?
                </h3>
                <p style={{color: 'var(--text-dim)', lineHeight: '1.6'}}>
                  Yes! You can customize the bot's personality, add specific instructions, and even provide additional training data to improve responses for your specific use case.
                </p>
              </div>
              
              <div style={{marginBottom: '24px'}}>
                <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)'}}>
                  Is my data secure?
                </h3>
                <p style={{color: 'var(--text-dim)', lineHeight: '1.6'}}>
                  Absolutely. We use enterprise-grade encryption, never share your data with third parties, and comply with GDPR, CCPA, and other privacy regulations.
                </p>
              </div>
              
              <div style={{marginBottom: '24px'}}>
                <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)'}}>
                  What if the bot doesn't know an answer?
                </h3>
                <p style={{color: 'var(--text-dim)', lineHeight: '1.6'}}>
                  The bot will politely say it doesn't have that information and can either escalate to human support or ask for clarification. You can also set up fallback responses.
                </p>
              </div>
              
              <div style={{marginBottom: '24px'}}>
                <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)'}}>
                  Can I integrate with my existing tools?
                </h3>
                <p style={{color: 'var(--text-dim)', lineHeight: '1.6'}}>
                  Yes! We provide APIs, webhooks, and pre-built integrations for popular platforms like Slack, WhatsApp, Salesforce, and more. Custom integrations are also supported.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="landing-features" style={{background: 'var(--panel)', margin: '80px 0'}}>
            <h2 className="landing-section__title">FlowChat vs. Competitors</h2>
            <p className="landing-section__subtitle">
              See why thousands choose FlowChat over traditional chatbot solutions
            </p>
            
            <div style={{maxWidth: '100%', margin: '0 auto', overflowX: 'auto', textAlign: 'center', width: '100%'}}>
              <table style={{
                width: '100%',
                maxWidth: '1200px',
                borderCollapse: 'collapse',
                background: 'var(--panel-strong)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                margin: '0 auto'
              }}>
                <thead>
                  <tr style={{background: 'var(--gradient)'}}>
                    <th style={{padding: '20px', textAlign: 'left', color: 'white', fontWeight: '700'}}>Feature</th>
                    <th style={{padding: '20px', textAlign: 'center', color: 'white', fontWeight: '700'}}>FlowChat</th>
                    <th style={{padding: '20px', textAlign: 'center', color: 'white', fontWeight: '700'}}>Traditional Bots</th>
                    <th style={{padding: '20px', textAlign: 'center', color: 'white', fontWeight: '700'}}>Manual Setup</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '16px 20px', fontWeight: '600'}}>Setup Time</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--ok)'}}>40 seconds</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)'}}>2-4 weeks</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)'}}>1-3 months</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '16px 20px', fontWeight: '600'}}>Data Upload Required</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--ok)'}}>❌ None</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>✅ Manual</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>✅ Extensive</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '16px 20px', fontWeight: '600'}}>AI Training</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--ok)'}}>❌ Automatic</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>✅ Manual</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>✅ Complex</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '16px 20px', fontWeight: '600'}}>API Integration</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--ok)'}}>✅ Instant</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)'}}>✅ Available</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>❌ Custom Dev</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '16px 20px', fontWeight: '600'}}>Multi-Platform Support</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--ok)'}}>✅ All Platforms</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)'}}>⚠️ Limited</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>❌ Platform-Specific</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '16px 20px', fontWeight: '600'}}>Cost</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--ok)'}}>from $0</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)'}}>$200-500/month</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>$5,000-50,000</td>
                  </tr>
                  <tr>
                    <td style={{padding: '16px 20px', fontWeight: '600'}}>Maintenance</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--ok)'}}>❌ Zero</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>✅ Ongoing</td>
                    <td style={{padding: '16px 20px', textAlign: 'center', color: 'var(--warn)'}}>✅ Constant</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="landing-pricing">
            <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 24px'}}>
              <h2 className="landing-section__title">Simple, Transparent Pricing</h2>
              <p className="landing-section__subtitle">
                Start free, scale as you grow
              </p>
              
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: '60px'}}>
                <div className="pricing-card featured" style={{maxWidth: '500px', width: '100%'}}>
                  <div className="pricing-badge">Free Forever</div>
                  <h3 className="pricing-title">Free Plan</h3>
                  <div className="pricing-price">$0</div>
                  <p className="pricing-period">forever</p>
                  <ul className="pricing-features">
                    <li>1 AI Bot</li>
                    <li>1 Website Domain</li>
                    <li>Full API Access</li>
                    <li>Basic Analytics</li>
                    <li>Custom Branding</li>
                    <li>No Credit Card Required</li>
                  </ul>
                  <button className="btn btn--primary" onClick={() => handleSelectPlan('free')}>
                    Start Free Now
                  </button>
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    fontSize: '0.9rem',
                    color: 'var(--ok)'
                  }}>
                    <strong>Perfect for:</strong> Small businesses, startups, and anyone wanting to try AI chatbots
                  </div>
                </div>
              </div>
              
              <div style={{
                padding: '40px',
                background: 'var(--panel)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text)'}}>
                  Need More? We've Got You Covered
                </h3>
                <p style={{color: 'var(--text-dim)', marginBottom: '32px', lineHeight: '1.6'}}>
                  As your business grows, easily upgrade to our Pro or Enterprise plans for more bots, domains, and advanced features.
                </p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginBottom: '32px'}}>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: '800', color: 'var(--brand)', marginBottom: '8px'}}>Pro Plan</div>
                    <div style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px'}}>$99/month</div>
                    <div style={{color: 'var(--text-dim)', fontSize: '0.9rem'}}>5 bots • 10K queries • Advanced features</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: '800', color: 'var(--brand)', marginBottom: '8px'}}>Enterprise</div>
                    <div style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px'}}>Custom</div>
                    <div style={{color: 'var(--text-dim)', fontSize: '0.9rem'}}>Unlimited • 24/7 support • SLA</div>
                  </div>
                </div>
                <button className="btn" onClick={() => handleSelectPlan('contact')}>
                  Contact Sales for Pro/Enterprise
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Bots Section */}
      {activeSection === 'bots' && isLoggedIn && (
        <section className="landing-features" style={{paddingTop: '120px'}}>
          <h2 className="landing-section__title">Your AI Bots</h2>
          <p className="landing-section__subtitle">
            Manage and create intelligent chatbots for your business
          </p>
          
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px',
              padding: '16px',
              margin: '20px 0',
              color: 'var(--warn)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {bots.length < 1 && (
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '40px'}}>
              <button className="btn btn--primary" onClick={handleCreateBot}>
                + Create New Bot
              </button>
            </div>
          )}

          {bots.length >= 1 && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(110,168,254,0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(110,168,254,0.3)',
              marginBottom: '40px',
              color: 'var(--brand)'
            }}>
              <strong>Free Plan Limit:</strong> You can create 1 bot. Upgrade to create more bots.
            </div>
          )}

          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-dim)'}}>
              Loading your bots...
            </div>
          ) : bots.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--panel)',
              borderRadius: '16px',
              border: '1px solid var(--border)'
            }}>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>🤖</div>
              <h3 style={{margin: '0 0 12px 0', fontSize: '1.5rem'}}>No bots yet</h3>
              <p style={{color: 'var(--text-dim)', margin: '0 0 24px 0'}}>
                Create your first AI bot to get started with automated customer support. Free plan allows 1 bot.
              </p>
              <button className="btn btn--primary" onClick={handleCreateBot}>
                Create Your First Bot
              </button>
            </div>
          ) : (
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <div className="feature-card" style={{maxWidth: '400px', width: '100%'}}>
                <div className="feature-icon">🤖</div>
                <h3 className="feature-title">{username}'s AI Bot</h3>
                <p className="feature-desc">
                  {bots.length} conversation{bots.length !== 1 ? 's' : ''} • Active
                </p>
                <div style={{marginTop: '20px', display: 'flex', gap: '8px'}}>
                  <button 
                    className="btn btn--primary" 
                    onClick={() => navigate('/fullchat')}
                    style={{flex: 1}}
                  >
                    Manage Conversations
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Final CTA Section */}
      {!isLoggedIn && (
        <section className="landing-features" style={{
          background: 'linear-gradient(135deg, var(--brand), var(--brand-2))',
          color: 'white',
          margin: '80px 0 0 0',
          textAlign: 'center'
        }}>
          <h2 style={{fontSize: '2.5rem', fontWeight: '800', margin: '0 0 16px 0'}}>
            Ready to Transform Your Customer Support?
          </h2>
          <p style={{fontSize: '1.2rem', margin: '0 0 40px 0', opacity: '0.9'}}>
            Join thousands of businesses already using FlowChat to automate support and boost efficiency
          </p>
          <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button 
              className="btn" 
              onClick={handleGetStarted}
              style={{
                background: 'white',
                color: 'var(--brand)',
                border: 'none',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              Start Building Your Bot
            </button>
            <button 
              className="btn" 
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              Learn More
            </button>
          </div>
          <div style={{marginTop: '40px', fontSize: '0.9rem', opacity: '0.8'}}>
            ⚡ Setup in 40 seconds • 🚀 No credit card required • 💬 24/7 support
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__logo">
          <div className="landing-logo__dot" />
          <span>FlowChat</span>
        </div>
        <p className="landing-footer__text">
          © 2024 FlowChat. The future of AI-powered customer support.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
