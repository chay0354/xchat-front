import React, { useState, useEffect, useRef } from 'react';
// Updated: Added fullname and phone support - $(date)
import { useNavigate } from 'react-router-dom';
// import styles from './App.module.css';
import Cookies from 'js-cookie';
import logoLight from './logo-light.png';
import clientsImage from './logos.png';
import './landingStyles.css';
import { FaWhatsapp } from "react-icons/fa";
import botIcon from './bot icon.png';
import group5Image from './Group 5.png';
import menuIcon from './menu.png';

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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
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

  // Handle header visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If at the top of the page, always show header
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      }
      // If scrolling down, hide header
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      }
      // If scrolling up, show header
      else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className={`landing-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'} bg`}>
      <style>{designTokens}</style>
      <div className="background-wrapper">
        <div className="landing-bg" />
        <div className="landing-ellipse-1" />
        <div className="landing-ellipse-2" />
      </div>
      {/* Header */}
      <header className={`landing-header ${!isHeaderVisible ? 'header-hidden' : ''}`}>
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
            {mobileMenuOpen ? '✕' : <img style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} src={menuIcon} alt="Menu" />}
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
          </div>
        </nav>
      </header>

      {/* Main Content */}
      {activeSection === 'home' && (
        <>
          {/* Hero Section */}
          <section className="landing-hero " >
            {/* <h1 className="landing-hero__title rubik-font"> */}
            <h1 className="landing-hero-title ">
              <strong>
                צור בוט תוך{' '}
                <br className="mobile-br" />

                40  שניות, </strong>
              <br />
              חסוך שעות עבודה וייצר יותר
              <br />
              שיחות נכנסות
            </h1>
            <h2 className="landing-hero-subtitle">
              הדרך הכי פשוטה להפוך שיחות למכירות.
              <br />
              חברו את המערכת, הגדירו אוטומציות — ותנו ל-FlowChat ל
              <br className="mobile-br" />
              עבוד בשבילכם 24/7.</h2>
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



            {/* Clients Logos */}
            <div className="clients-container">
              <img src={clientsImage} alt="Clients" className="clients-image" />
            </div>


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





          <section className="landing-robot" style={{ zIndex: 12 }}>
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
                <div className="robot-image-wrapper">
                  {/* Top right Bubble */}
                  <div className="robot-bubble bubble-top-left">
                    <div className="bubble-bg-top-left">
                      {/* Desktop SVG */}
                      <svg className="desktop-only" width="100%" height="100%" viewBox="0 0 263 140" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                      {/* Mobile SVG */}
                      <svg className="mobile-only" width="218" height="158" viewBox="0 0 218 178" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g filter="url(#filter0_d_253_672)">
                          <path d="M187 16C200.255 16.0002 211 26.7453 211 40V97.2246C211 110.479 200.255 121.224 187 121.225H182.133C180.684 121.225 179.307 121.853 178.357 122.947L153.368 151.729C150.152 155.432 143.864 152.755 144.123 147.857C144.461 141.481 144.613 134.339 144.126 128.732C144.032 127.647 143.905 126.524 143.752 125.378C143.43 122.969 141.334 121.225 138.905 121.225H44C30.7452 121.225 20 110.479 20 97.2246V40C20 26.7452 30.7452 16 44 16H187Z" fill="white" fillOpacity="0.9" shapeRendering="crispEdges" />
                        </g>
                        <defs>
                          <filter id="filter0_d_253_672" x="0" y="0" width="231" height="177.461" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                            <feOffset dy="4" />
                            <feGaussianBlur stdDeviation="10" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_253_672" />
                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_253_672" result="shape" />
                          </filter>
                        </defs>
                      </svg>
                    </div>
                    <div className="bubble-text">
                      מחובר. מוכן.
                      <br className='mobile-only' />
                      אוטומטי.<br />
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


            </div>
          </section>

          {/* Features Section */}
          <section className="landing-features">
            <div className="features-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="16.6667" stroke="white" strokeWidth="2" />
                      <path d="M14.1667 20.8333L17.5 24.1667L25.8334 15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="feature-title">התקנה במהירות האור</h3>
                  <p className="feature-description">
                    מהזנת כתובת - לצ׳אט עובד תוך פחות מדקה.
                    <br />
                    אין צורך בקידוד או בהגדרות מסובכות.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="16.6667" stroke="white" strokeWidth="2" />
                      <path d="M14.1667 20.8333L17.5 24.1667L25.8334 15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="feature-title">תוכן מונע AI</h3>
                  <p className="feature-description">
                    מודלים מתקדמים של שפה מבינים הקשר
                    <br />
                    ומספקים תגובות מדויקות ומועילות בהתבסס על
                    <br />
                    התוכן שלך.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="16.6667" stroke="white" strokeWidth="2" />
                      <path d="M14.1667 20.8333L17.5 24.1667L25.8334 15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="feature-title">מתחבר להכל</h3>
                  <p className="feature-description">
                    websites, WhatsApp, Slack, mobile apps,
                    <br />
                    CRM systems. One API, infinite
                    <br />
                    possibilities.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="16.6667" stroke="white" strokeWidth="2" />
                      <path d="M14.1667 20.8333L17.5 24.1667L25.8334 15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="feature-title">הקשר מודע</h3>
                  <p className="feature-description">
                    הבוט עונה על סמך תוכן האתר שלך, מה
                    <br />
                    שמפחית ״הזיות״ ומבטיח עקביות במותג.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="16.6667" stroke="white" strokeWidth="2" />
                      <path d="M14.1667 20.8333L17.5 24.1667L25.8334 15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="feature-title">תשתית ניתנת להרחבה</h3>
                  <p className="feature-description">
                    נהל אלפי שאילתות בדקה עם התשתית החזקה
                    <br />
                    שלנו, מבוססת הענן, שנבנתה להתרחבות.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="16.6667" stroke="white" strokeWidth="2" />
                      <path d="M14.1667 20.8333L17.5 24.1667L25.8334 15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="feature-title">בטוח ואמין</h3>
                  <p className="feature-description">
                    אבטחת מידע ברמה גבוהה עם אימות מבוסס
                    <br />
                    טוקן והבטחת זמינות של 99.9%.
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* How it works Section */}

          <section id="how-it-works" className="landing-how-it-works">
            <div className="how-it-works-container">


              <div className="how-it-works-content">
                <h2 className="how-it-works-title">
                  איך זה עובד:<br />
                  שלושה צעדים פשוטים לצ'אטבוט<br />
                  החכם שלך
                </h2>

                <div className="steps-container">
                  {/* Step 1 */}
                  <div className="step-item">
                    <div className="step-line">
                      <svg width="6" height="71" viewBox="0 0 6 71" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="3" y1="3" x2="3" y2="69" stroke="#BA42BA" strokeWidth="6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="step-text">
                      <h3 className="step-title">שלב 1 – הכנס את כתובת האתר שלך</h3>
                      <p className="step-description">
                        פשוט הכנס את כתובת האתר שלך. המערכת שלנו תסרוק את האתר שלך ותבנה בסיס ידע.
                      </p>
                    </div>

                  </div>

                  {/* Step 2 */}
                  <div className="step-item">
                    <div className="step-line">
                      <svg width="6" height="71" viewBox="0 0 6 71" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="3" y1="3" x2="3" y2="69" stroke="#BA42BA" strokeWidth="6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="step-text">
                      <h3 className="step-title">שלב 2 – עיבוד AI</h3>
                      <p className="step-description">
                        אנו שולפים, מנקים ומעבדים את התוכן שלך לבסיס ידע באמצעות הטמעות וקטוריות מתקדמות.
                      </p>
                    </div>

                  </div>

                  {/* Step 3 */}
                  <div className="step-item">
                    <div className="step-line">
                      <svg width="6" height="71" viewBox="0 0 6 71" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="3" y1="3" x2="3" y2="69" stroke="#BA42BA" strokeWidth="6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="step-text">
                      <h3 className="step-title">שלב 3 – קבל את ה-API שלך</h3>
                      <p className="step-description">
                        קבל נקודת קצה API מוכנה לשימוש שמניעה את הצ'אטבוט שלך בכל פלטפורמה או אינטגרציה.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="how-it-works-image-container">
                <div className="how-it-works-ellipse-1" />
                <div className="how-it-works-ellipse-2" />
                <img src={group5Image} alt="How it works" className="how-it-works-image" />
              </div>
            </div>
          </section>


          {/* Integration Showcase */}
          <section className="smart-start-section">
            <div className="smart-start-container">
              <div className="smart-start-content">
                <h2 className="smart-start-title">
                  הדרך החכמה להתחיל:<br />
                  גרסה חינמית, ללא התחייבות.
                </h2>
                <p className="smart-start-description">
                  בנו בוט ראשון, הפעילו אותו, ותראו בעצמכם איך כמות השיחות והלידים שלכם עולה.
                  <br />
                  תוכלו לשדרג ולפתוח את כל הכוח של המערכת כשתרצו!
                </p>
              </div>

              <div className="smart-start-visuals">
                <div className="smart-start-blob blob-1" />
                <div className="smart-start-blob blob-2" />
                <div className="smart-start-blob blob-3" />

                <div className="smart-cards-wrapper">
                  <div className="smart-card card-1">גישה מלאה ל-API</div>
                  <div className="smart-card card-2">אין צורך בכרטיס אשראי</div>
                  <div className="smart-card card-3">מערכת ניהול בוטים</div>
                </div>

                <button className="btn btn--primary smart-start-btn" onClick={handleGetStarted}>
                  התחל עכשיו
                </button>
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
          {/* FAQ Section */}
          <section className="faq-section">
            <div className="faq-container">
              <h2 className="faq-title">שאלות נפוצות</h2>

              <div className="faq-item">
                <h3 className="faq-question">
                  כמה זמן לוקח להקים בוט?
                </h3>
                <p className="faq-answer">
                  בדרך כלל 40-60 שניות. פשוט ספק את כתובת האתר שלך, וה-AI שלנו סורק, מעבד ומייצר את הבוט שלך באופן אוטומטי. אין צורך בהכשרה ידנית.
                </p>
                <div className="faq-separator"></div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  איזה סוגי אתרים עובדים הכי טוב?
                </h3>
                <p className="faq-answer">
                  כל אתר עם תוכן טקסטואלי עובד מצוין! אתרי מסחר אלקטרוני, פלטפורמות SaaS, ספקי שירותי בריאות, מוסדות חינוך ועסקי שירותים רואים כולם תוצאות מצוינות.
                </p>
                <div className="faq-separator"></div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  האם אני יכול להתאים אישית את התגובות של הבוט?
                </h3>
                <p className="faq-answer">
                  כן! אתה יכול להתאים אישית את האישיות של הבוט, להוסיף הוראות ספציפיות ואפילו לספק נתוני הכשרה נוספים כדי לשפר את התגובות למקרה השימוש הספציפי שלך.
                </p>
                <div className="faq-separator"></div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  האם הנתונים שלי מאובטחים?
                </h3>
                <p className="faq-answer">
                  בהחלט. אנו משתמשים בהצפנה ברמה ארגונית, לעולם לא משתפים את הנתונים שלך עם צדדים שלישיים, ועומדים בדרישות GDPR, CCPA ורגולציות פרטיות אחרות.
                </p>
                <div className="faq-separator"></div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  מה קורה אם הבוט לא יודע את התשובה?
                </h3>
                <p className="faq-answer">
                  הבוט יגיד בנימוס שאין לו את המידע הזה ויכול להעלות את זה לתמיכה אנושית או לבקש הבהרה. אתה יכול גם להגדיר תגובות חלופיות.
                </p>
                <div className="faq-separator"></div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  האם אני יכול לשלב עם הכלים הקיימים שלי?
                </h3>
                <p className="faq-answer">
                  כן! אנו מספקים APIs, webhooks, ואינטגרציות מוכנות לפלטפורמות פופולריות כמו Slack, WhatsApp, Salesforce ועוד. אינטגרציות מותאמות אישית נתמכות גם הן.
                </p>
                <div className="faq-separator"></div>
              </div>
            </div>
          </section>


          {/* Any question Section */}
          {/* Contact Section */}
          <section className="contact-section">
            <div className="contact-ellipse" />
            <div className="contact-container">
              <div className="contact-robot-wrapper">
                <img src={botIcon} alt="Contact Robot" className="contact-robot-image" />
              </div>

              <div className="contact-content">
                <h2 className="contact-title">
                  יש לכם שאלה? צריכים עזרה?<br />
                  אנחנו כאן בשבילכם.
                </h2>
                <p className="contact-subtitle">
                  השאירו פרטים ונחזור אליכם במהירות עם כל המידע, ההכוונה או הדמו<br />
                  שאתם צריכים כדי לצאת לדרך.
                </p>

                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="contact-inputs-row">
                    <input type="text" placeholder="שם מלא" className="contact-input" />
                    <input type="tel" placeholder="טלפון" className="contact-input" />
                    <input type="email" placeholder="אימייל" className="contact-input" />
                    <button type="submit" className="contact-btn">
                      <span>שלח</span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </section>
        </>
      )}



      {/* Final CTA Section */}

      {/* Footer */}
      {/* Footer Section */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logoLight} alt="FlowChat Logo" style={{ width: '156px', height: '77px' }} />
          </div>
          <p className="footer-description">
            מערכת אוטומציה חכמה לבניית בוטים ושיחות מכירה, שמאפשרת לכל עסק לעבוד בצורה מהירה, יעילה ועם מינימום התעסקות ידנית.
          </p>
        </div>
        <div className="footer-copyright">
          © כל הזכויות שמורות FlowChat 2025
        </div>
      </footer>
    </div>
  );
}

export default Landing;
