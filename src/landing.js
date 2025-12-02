import React, { useState, useEffect } from 'react';
// Updated: Added fullname and phone support - $(date)
import { useNavigate } from 'react-router-dom';
// import styles from './App.module.css';
import Cookies from 'js-cookie';
import logoLight from './logo-light.png';
import clientsImage from './clients.png';
import './landingStyles.css';
import { FaWhatsapp } from "react-icons/fa";
import botIcon from './bot icon.png';

const designTokens = `
* { box-sizing: border-box; }
html, body, #root { min-height: 100%; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
`;

function Landing() {
  const [theme, setTheme] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const token = Cookies.get('testtoken');
    const user = Cookies.get('email');
    const name = Cookies.get('fullname');
    if (token && user) {
      setIsLoggedIn(true);
      setEmail(user);
      setFullname(name || user); // fallback to email if no fullname
      loadBots();
      loadUserInfo(); // Load full user info from database
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

  const loadUserInfo = async () => {
    const token = Cookies.get('testtoken');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5137'}/get-user-info?usertoken=${encodeURIComponent(token)}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const userInfo = data[0];
          if (userInfo.fullname) {
            setFullname(userInfo.fullname);
            // Update cookie with the full name from database
            Cookies.set('fullname', userInfo.fullname);
          }
        }
      }
    } catch (err) {
      console.error('Error loading user info:', err);
    }
  };

  const handleGetStarted = () => { navigate('/register') };
  const handleLogin = () => { navigate('/login') };
  const handleSelectPlan = (planName) => { navigate('/register', { state: { selectedPlan: planName } }) };
  const handleCreateBot = () => { navigate('/register', { state: { selectedPlan: 'test', skipToBot: true } }) };

  const handleLogout = () => {
    Cookies.remove('testtoken');
    Cookies.remove('usertoken');
    Cookies.remove('email');
    Cookies.remove('fullname');
    setIsLoggedIn(false);
    setEmail('');
    setFullname('');
    setBots([]);
    setActiveSection('home');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => { setMobileMenuOpen(!mobileMenuOpen) };
  const closeMobileMenu = () => { setMobileMenuOpen(false) };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.landing-nav')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside) };
  }, [mobileMenuOpen]);


  return (
    <div className={`landing-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'} bg`}>
      <style>{designTokens}</style>
      <div className="landing-bg" />
      <div className="landing-ellipse-1" />
      <div className="landing-ellipse-2" />

      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">

          {/* Desktop Navigation */}
          <div className="landing-actions desktop-nav">
            {isLoggedIn ?

              <>
                <button className={`btn ${activeSection === 'home' ? 'btn--primary' : ''}`} onClick={() => setActiveSection('home')}>בית</button>
                {email === 'flowchat.admin@gmail.com' && (
                  <button className="btn" onClick={() => navigate('/admin')}>ניהול</button>
                )}
                <button className={`btn ${activeSection === 'bots' ? 'btn--primary' : ''}`} onClick={() => setActiveSection('bots')}>הבוטים שלך</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#eee', fontFamily: 'Arial, sans-serif' }}>הי, {fullname}</span>
                  <button className="btn" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '12px' }}>התנתק</button>
                </div>
              </>
              :
              <>
                <button className="btn btn--primary btn-signup" onClick={handleGetStarted}>התחל עכשיו</button>

                <button className="btn btn-login" onClick={handleLogin}>התחברות</button>
              </>
            }

            {/* <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{theme === 'dark' ? '☀️' : '🌙'}</button> */}

          </div>

          <div className="landing-logo"><img src={logoLight} alt="Logo" style={{ height: '3rem' }} /></div>



          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Mobile Menu Dropdown */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            {isLoggedIn ? (
              <>
                <button className={`btn ${activeSection === 'home' ? 'btn--primary' : ''}`} onClick={() => { setActiveSection('home'); closeMobileMenu(); }}>
                  בית
                </button>
                {email === 'flowchat.admin@gmail.com' && (
                  <button className="btn" onClick={() => { navigate('/admin'); closeMobileMenu(); }}>
                    ניהול
                  </button>
                )}
                <button className={`btn ${activeSection === 'bots' ? 'btn--primary' : ''}`} onClick={() => { setActiveSection('bots'); closeMobileMenu(); }}>
                  הבוטים שלך
                </button>
                <div style={{ padding: '8px 0', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
                    הי, {fullname}
                  </div>
                  <button className="btn" onClick={handleLogout}>
                    התנתק
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="btn btn-login" onClick={() => { handleLogin(); closeMobileMenu(); }}>
                  התחברות
                </button>
                <button className="btn btn--primary btn-signup" onClick={() => { handleGetStarted(); closeMobileMenu(); }}>
                  התחל עכשיו
                </button>
              </>
            )}
            <button
              className="btn"
              onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); closeMobileMenu(); }}
              style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      {activeSection === 'home' && (
        <>
          {/* Hero Section */}
          <section className="landing-hero">
            {/* <h1 className="landing-hero__title rubik-font"> */}
            <h1 className="landing-hero-title">
              צור בוט תוך 40 שניות,
              <br />
              חסוך שעות עבודה וייצר יותר
              <br />
              שיחות נכנסות
            </h1>
            <h2 className="landing-hero-subtitle">
              הדרך הכי פשוטה להפוך שיחות למכירות.
              <br />
              חברו את המערכת, הגדירו אוטומציות — ותנו ל-FlowChat לעבוד בשבילכם 24/7.</h2>
            <br />

            <div className="landing-hero__cta">
              <>
                <button className="btn-start-now" onClick={handleGetStarted}>
                  התחל עכשיו
                </button>
                <button className="btn-how-it-works" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                  צפה איך זה עובד
                </button>
              </>
            </div>

            <h2 className="landing-hero-our-clients">
              בין לקוחותינו
            </h2>
            <img src={clientsImage} alt="Clients" style={{ maxWidth: '100%', marginTop: '24px' }} />

            {/* Statistics */}
            {/* {!isLoggedIn && (
              <div className={styles['statistics-grid']}>
                <div style={{ textAlign: 'center' }}>
                  <div className={styles.statNumbers}>40s</div>
                  <div className={styles['stat-text']}>זמן הקמת הבוט</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className={styles.statNumbers}>99.9%</div>
                  <div className={styles['stat-text']}>זמינות</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className={styles.statNumbers}>10K+</div>
                  <div className={styles['stat-text']}>שאילתות/חודש</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className={styles.statNumbers}>24/7</div>
                  <div className={styles['stat-text']}>תמיכה</div>
                </div>
              </div>
            )} */}

          </section>





          <section className="landing-robot">
            <div className="robot-container">
              <div className="robot-text-content">
                <h2 className="robot-title">יותר שיחות. יותר מכירות.<br />אפס עבודה ידנית.</h2>
                <p className="robot-description">
                  FlowChat הופכת את כל תהליך פתיחת השיחה למכירה - לאוטומטי לחלוטין.<br />
                  המערכת מאתרת לידים, פותחת שיחות, עוקבת אחרי תגובות ודוחפת את הלקוח עד לסגירה.<br />
                  אתם נשארים רק עם החלק הכיף: לסגור עסקאות.
                </p>
              </div>
              <div className="robot-visuals">
                {/* Top right Bubble */}
                <div className="robot-bubble bubble-top-left">
                  <div className="bubble-bg-top-left">
                    <svg width="100%" height="100%" viewBox="0 0 263 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g filter="url(#filter0_d_181_1922)">
                        <path d="M195.051 16C208.305 16.0002 219.051 26.7453 219.051 40V57.2434C219.051 59.266 220.269 61.0895 222.138 61.8632L239.245 68.9455C243.806 70.8334 243.219 77.7669 238.506 79.2309C236.455 79.8678 234.483 80.55 232.788 81.2539C229.069 82.7985 224.803 85.2309 221.368 87.3452C219.916 88.2388 219.051 89.8313 219.051 91.5363V92C219.051 105.255 208.305 116 195.051 116H44C30.7452 116 20 105.255 20 92V40C20 26.7452 30.7452 16 44 16H195.051Z" fill="white" fillOpacity="0.9" shapeRendering="crispEdges" />
                      </g>
                      <defs>
                        <filter id="filter0_d_181_1922" x="0" y="0" width="262.371" height="140" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                          <feOffset dy="4" />
                          <feGaussianBlur stdDeviation="10" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
                          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_181_1922" />
                          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_181_1922" result="shape" />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                  <div className="bubble-text">
                    מחובר. מוכן. אוטומטי.<br />
                    בוא נביא תוצאות!
                  </div>
                </div>

                <img src={botIcon} alt="Robot" className="robot-image" />

                {/* Bottom Right Bubble */}
                <div className="robot-bubble bubble-bottom-right">
                  <div className="bubble-bg-bottom-right">
                    <svg width="100%" height="100%" viewBox="0 0 231 165" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g filter="url(#filter0_d_181_1686)">
                        <path d="M54.6594 19.0711C56.5827 14.5773 63.4198 15.1751 64.9411 19.8203C65.5086 21.5532 66.1108 23.2117 66.7305 24.6548C67.8276 27.2097 69.3899 30.0408 70.9516 32.6362C71.8358 34.1056 73.4382 34.98 75.1531 34.98H187C200.255 34.9802 211 45.7253 211 58.98V116.205C211 129.459 200.255 140.204 187 140.205H44C30.7452 140.205 20 129.459 20 116.205V58.98C20 45.7252 30.7452 34.98 44 34.98H44.5518C46.5529 34.98 48.3612 33.7869 49.1485 31.9473L54.6594 19.0711Z" fill="white" fillOpacity="0.9" shapeRendering="crispEdges" />
                      </g>
                      <defs>
                        <filter id="filter0_d_181_1686" x="0" y="0" width="231" height="164.205" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                          <feOffset dy="4" />
                          <feGaussianBlur stdDeviation="10" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
                          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_181_1686" />
                          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_181_1686" result="shape" />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                  <div className="bubble-text">
                    תן לי 40 שניות…<br />
                    ואני כבר מתחיל לעבוד בשבילך
                  </div>
                </div>
              </div>


            </div>
          </section>

          {/* Features Section */}
          <section className="landing-features">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <h2 className="landing-section__title">הכח של Flowchat</h2>
              <p className="landing-section__subtitle">
                הדרך המהירה ביותר ליצור צ'אט-בוטים אינטליגנטיים ומודעים להקשר
              </p>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3 className="feature-title">התקנה במהירות האור</h3>
                  <p className="feature-desc">
                    מהזנת כתובת - לצ׳אט עובד תוך פחות מדקה. אין צורך בקידוד או בהגדרות מסובכות.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🧠</div>
                  <h3 className="feature-title">תוכן מונע AI</h3>
                  <p className="feature-desc">
                    מודלים מתקדמים של שפה מבינים הקשר ומספקים תגובות מדויקות ומועילות בהתבסס על התוכן שלך.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🔗</div>
                  <h3 className="feature-title">מתחבר להכל</h3>
                  <p className="feature-desc">
                    websites, WhatsApp, Slack, mobile apps, CRM systems. One API, infinite possibilities.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🎯</div>
                  <h3 className="feature-title">הקשר מודע</h3>
                  <p className="feature-desc">
                    הבוט עונה על סמך תוכן האתר שלך, מה שמפחית ״הזיות״ ומבטיח עקביות במותג.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">📈</div>
                  <h3 className="feature-title">תשתית ניתנת להרחבה</h3>
                  <p className="feature-desc">
                    נהל אלפי שאילתות בדקה עם התשתית החזקה שלנו, מבוססת הענן, שנבנתה להתרחבות.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🛡️</div>
                  <h3 className="feature-title">בטוח ואמין</h3>
                  <p className="feature-desc">
                    אבטחת מידע ברמה גבוהה עם אימות מבוסס טוקן והבטחת זמינות של 99.9%.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chat Examples Section */}
          <section style={{ background: 'var(--panel)', padding: '100px 0', margin: '100px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <h2 className="landing-section__title">ככה זה נראה</h2>
              <p className="landing-section__subtitle">
                כך נראה הצ׳אט אחרי שהוטמע באתרי לקוחות
              </p>

              <div className="chat-examples-grid">
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
                    יורו-קום מחשבים
                  </div>
                  <div style={{ padding: '20px', height: '300px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '16px' }}>
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
                        הי, אני צריכה מחשב לצרכי לימודים. על מה אתם ממליצים?
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px' }}>
                        Customer • 2:34 PM
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
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
                        עבור לימודים אנחנו בדרך כלל ממליצים על
                        MacBook Pro M2 או Dell XPS 15.
                        שניהם מציעים ביצועים מעולים, חיי סוללה ארוכים, ומסכים איכותיים. האם יש לך תקציב או דרישות ספציפיות?
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        יורו-קום • 2:34 PM
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
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
                        סביב $1500-2000. אני צריכה משהו שיכול להתחבר לכמה מסכים.
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px' }}>
                        Customer • 2:35 PM
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
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
                        מעולה! ה-MacBook Pro M2 14" ($1,999) תומך עד 2 מסכים חיצוניים. יש לנו גם את ה-Dell XPS 15 ($1,799) עם יכולות דומות. שניהם מגיעים עם 16GB RAM ו-512GB SSD. תרצי לראות את המפרטים המלאים?
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        יורו-קום • 2:35 PM
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
                    מרכז רפואי נווה-אמירים
                  </div>
                  <div style={{ padding: '20px', height: '300px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '16px' }}>
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
                        אני צריכה לקבוע תור עם ד"ר גבני. מה השעות הפנויות?
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px' }}>
                        מטופל • 1:45 PM
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
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
                        ד״ר גבני פנוי בשעות האלה:
                        <br /><br />
                        יום שני 14:30
                        • יום שלישי 14:30
                        • יום רביעי 10:00
                        • יום חמישי 15:15
                        • יום שישי 09:30
                        <br /><br />
                        מה סוג התור שאת צריכה?
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        מרכז רפואי נווה-אמירים • 1:45 PM
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
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
                        זה בדיקה שגרתית. יום שלישי בשעה 14:30 מתאים לי.
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px' }}>
                        מטופל • 1:46 PM
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
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
                        מעולה! קבעתי לך תור ביום שלישי בשעה 14:30 עם ד"ר גבני לבדיקה השגרתית שלך. תקבלי אישור במייל בקרוב.
                        <br /><br />
                        אנא הגיעי 15 דקות לפני הזמן ואל תשכחי להביא את כרטיס הביטוח שלך ואת תעודת הזהות. יש לך שאלות לגבי התור?
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        מרכז רפואי נווה-אמירים • 1:46 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Integration Showcase */}
          <section className="landing-features">
            <h2 className="landing-section__title">מתחבר להכל</h2>
            <p className="landing-section__subtitle">
              API אחד, אפשרויות אינסופיות. חבר את הצ׳אט למערכות שלך
            </p>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"><FaWhatsapp color="#25D366" /></div>
                <h3 className="feature-title">וואצאפ</h3>
                <p className="feature-desc">
                  הגיעו ללקוחות היכן שהם נמצאים. שלחו תגובות אוטומטיות להודעות וואצאפ באמצעות ההטמעה הפשוטה שלנו.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💼</div>
                <h3 className="feature-title">צאט פנים ארגוני</h3>
                <p className="feature-desc">
                  בוטים פנימיים לצוות שלך. ענו על שאלות לגבי מדיניות החברה, נהלים ודוקומנטציה מיידית.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🌐</div>
                <h3 className="feature-title">וידג׳ט צ׳אט</h3>
                <p className="feature-desc">
                  ווידג׳ט צ׳אט יפהפה שניתן להתאמה אישית שמתאים למותג שלך. הטמעה קלה בשורת JavaScript אחת.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3 className="feature-title">אפליקציות מובייל</h3>
                <p className="feature-desc">
                  תמיכה ב-iOS ואנדרואיד. השתמשו ב-REST API שלנו כדי להפעיל תכונות צ'אט בתוך האפליקציה ותמיכה בלקוחות.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔗</div>
                <h3 className="feature-title">שילוב עם CRM</h3>
                <p className="feature-desc">
                  התחברו עם Salesforce, HubSpot, או כל CRM אחר. רשמו שיחות אוטומטית ועדכנו רישומי לקוחות.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">פתרונות מותאמים אישית</h3>
                <p className="feature-desc">
                  גישה מלאה ל-API עבור אינטגרציות מותאמות אישית. Webhooks, SDKs, ותיעוד מקיף למפתחים.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="landing-how" id="how-it-works">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <h2 className="landing-section__title">איך זה עובד</h2>
              <p className="landing-section__subtitle">
                שלושה צעדים פשוטים לצ'אטבוט החכם שלך
              </p>

              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <h3 className="step-title">הכנס את כתובת האתר שלך</h3>
                  <p className="step-desc">
                    פשוט הכנס את כתובת האתר שלך. המערכת שלנו תסרוק את האתר שלך ותבנה בסיס ידע.
                  </p>
                </div>

                <div className="step-card">
                  <div className="step-number">2</div>
                  <h3 className="step-title">עיבוד AI</h3>
                  <p className="step-desc">
                    אנו שולפים, מנקים ומעבדים את התוכן שלך לבסיס ידע באמצעות הטמעות וקטוריות מתקדמות.
                  </p>
                </div>

                <div className="step-card">
                  <div className="step-number">3</div>
                  <h3 className="step-title">קבל את ה-API שלך</h3>
                  <p className="step-desc">
                    קבל נקודת קצה API מוכנה לשימוש שמניעה את הצ'אטבוט שלך בכל פלטפורמה או אינטגרציה.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          {/* <section className="landing-features" style={{ background: 'var(--panel)', margin: '80px 0' }}>
            <h2 className="landing-section__title">What Our Customers Say</h2>
            <p className="landing-section__subtitle">
              Join thousands of businesses already using FlowChat
            </p>

            <div className="features-grid">
              <div className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
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
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>Sarah Chen</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>CTO, TechStart Inc.</div>
                  </div>
                </div>
                <p className="feature-desc" style={{ fontStyle: 'italic' }}>
                  "FlowChat reduced our support tickets by 75% in just one week. The setup was incredibly simple - just gave them our website URL and we had a working bot in minutes."
                </p>
              </div>

              <div className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
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
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>Marcus Rodriguez</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Founder, E-commerce Plus</div>
                  </div>
                </div>
                <p className="feature-desc" style={{ fontStyle: 'italic' }}>
                  "Our customers love the instant responses. The bot knows our entire product catalog and can answer complex questions about shipping, returns, and product compatibility."
                </p>
              </div>

              <div className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
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
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>Dr. Emily Watson</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Director, University Health</div>
                  </div>
                </div>
                <p className="feature-desc" style={{ fontStyle: 'italic' }}>
                  "We use FlowChat for our patient portal. It handles appointment scheduling, insurance questions, and general inquiries 24/7. Our staff can focus on patient care."
                </p>
              </div>
            </div>
          </section> */}

          {/* FAQ Section */}
          <section className="landing-features">
            <h2 className="landing-section__title">שאלות נפוצות</h2>
            <p className="landing-section__subtitle">
              כל מה שצריך לדעת על flowchat
            </p>

            <div style={{ maxWidth: '100%', margin: '0 auto', textAlign: 'right', width: '100%', padding: '0 20px' }} dir="rtl">
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                  כמה זמן לוקח להקים בוט?
                </h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6' }}>
                  בדרך כלל 40-60 שניות. פשוט ספק את כתובת האתר שלך, וה-AI שלנו סורק, מעבד ומייצר את הבוט שלך באופן אוטומטי. אין צורך בהכשרה ידנית.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                  איזה סוגי אתרים עובדים הכי טוב?
                </h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6' }}>
                  כל אתר עם תוכן טקסטואלי עובד מצוין! אתרי מסחר אלקטרוני, פלטפורמות SaaS, ספקי שירותי בריאות, מוסדות חינוך ועסקי שירותים רואים כולם תוצאות מצוינות.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                  האם אני יכול להתאים אישית את התגובות של הבוט?
                </h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6' }}>
                  כן! אתה יכול להתאים אישית את האישיות של הבוט, להוסיף הוראות ספציפיות ואפילו לספק נתוני הכשרה נוספים כדי לשפר את התגובות למקרה השימוש הספציפי שלך.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                  האם הנתונים שלי מאובטחים?
                </h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6' }}>
                  בהחלט. אנו משתמשים בהצפנה ברמה ארגונית, לעולם לא משתפים את הנתונים שלך עם צדדים שלישיים, ועומדים בדרישות GDPR, CCPA ורגולציות פרטיות אחרות.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                  מה קורה אם הבוט לא יודע את התשובה?
                </h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6' }}>
                  הבוט יגיד בנימוס שאין לו את המידע הזה ויכול להעלות את זה לתמיכה אנושית או לבקש הבהרה. אתה יכול גם להגדיר תגובות חלופיות.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                  האם אני יכול לשלב עם הכלים הקיימים שלי?
                </h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6' }}>
                  כן! אנו מספקים APIs, webhooks, ואינטגרציות מוכנות לפלטפורמות פופולריות כמו Slack, WhatsApp, Salesforce ועוד. אינטגרציות מותאמות אישית נתמכות גם הן.
                </p>
              </div>
            </div>
          </section>


          {/* Pricing Section */}
          <section className="landing-pricing">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <h2 className="landing-section__title">תמחור פשוט</h2>
              <p className="landing-section__subtitle">
                התחל בחינם, אין צורך בכרטיס אשראי.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                <div className="pricing-card featured" style={{ maxWidth: '500px', width: '100%' }}>
                  <div className="pricing-badge">חינם ל-14 יום</div>
                  <h3 className="pricing-title" style={{ color: '#2d0a46' }}>ללא התחייבות</h3>
                  <div className="pricing-price">התנסות חינם</div>
                  <ul className="pricing-features">
                    <li>בוט אחד</li>
                    <li>מערכת ניהול בוטים</li>
                    <li>גישה מלאה ל-API</li>
                    <li>אין צורך בכרטיס אשראי</li>
                  </ul>
                  <div className="flex-space-around">
                    <button className="btn btn--primary" onClick={() => handleSelectPlan('free')}>
                      התחל חינם עכשיו
                    </button>
                  </div>
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: '#fbeefaff',
                    borderRadius: '8px',
                    border: '1px solid #8120742f',
                    fontSize: '0.9rem',
                    color: '#000000'
                  }}>
                    <strong>מצוין עבור:</strong> עסקים קטנים ובינוניים, או כל מי שרוצה לנסות צ'אט-בוטים מבוססי AI
                  </div>
                </div>
              </div>

            </div>
          </section>
        </>
      )}

      {/* Bots Section */}
      {activeSection === 'bots' && isLoggedIn && (
        <section className="landing-features" style={{ paddingTop: '120px' }}>
          <h2 className="landing-section__title">הבוטים שלך</h2>
          <p className="landing-section__subtitle">
            נהל את הבוטים
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
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
              <strong>חינם ל-14 יום:</strong> יצירה של עד בוט אחד
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
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
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>No bots yet</h3>
              <p style={{ color: 'var(--text-dim)', margin: '0 0 24px 0' }}>
                Create your first AI bot to get started with automated customer support. Free plan allows 1 bot.
                צור את הבוט האינטליגנטי הראשון שלך!
              </p>
              <button className="btn btn--primary" onClick={handleCreateBot}>
                Create Your First Bot
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="feature-card" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="feature-icon">🤖</div>
                <h3 className="feature-title" style={{ fontFamily: 'Arial, sans-serif' }}>הבוט של {fullname}</h3>
                <p className="feature-desc">
                  {bots.length} conversation{bots.length !== 1 ? 's' : ''} • Active
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn--primary"
                    onClick={() => navigate('/fullchat')}
                    style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                  >
                    נהל את הבוט
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 16px 0' }}>
            מוכן לשדרג את התמיכה בלקוחות שלך?
          </h2>
          <p style={{ fontSize: '1.2rem', margin: '0 0 40px 0', opacity: '0.9' }}>
            אוטומציה בשירות לקוחות זו רמה אחרת לגמרי. אין סיבה שלך לא יהיה!
          </p>
          <div className="final-cta-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
              התחל בחינם
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
              למידע נוסף
            </button>
          </div>
          <div style={{ marginTop: '40px', fontSize: '0.9rem', opacity: '0.8' }}>
            הגדרה תוך 40 שניות • אין צורך בכרטיס אשראי • 💬 שירות ותמיכה
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__logo">
          <div className="landing-logo__dot" />
          <span>flowchat</span>
        </div>
        <p className="landing-footer__text">
          flowchat מבית stealthCode | המלאכה 16 ראש-העין | שירות לקוחות: 054-5779917
        </p>
      </footer>
    </div>
  );
}

export default Landing;
