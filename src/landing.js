import React, { useState, useEffect } from 'react';
// Updated: Added fullname and phone support - $(date)
import { useNavigate } from 'react-router-dom';
import styles from './App.module.css';
import Cookies from 'js-cookie';
import logoLight from './logo-light.png';

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
  background: rgba(10, 19, 40, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  color: white;
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
  direction: rtl !important;
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
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 28px;
  border: 1px solid #eeeeee;
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

  .chat-examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-top: 60px;
    max-width: 1000px;
    margin: 60px auto 0;
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

/* Mobile-First Responsive Design */
@media (max-width: 1200px) {
  .landing-nav {
    padding: 0 20px;
  }
  
  .landing-hero {
    padding: 120px 20px 80px;
  }
  
  .features-grid,
  .steps-grid,
  .pricing-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
}

/* User name font styling */
.user-name {
  font-family: Arial, sans-serif !important;
}

/* Mobile-specific enhancements */
@media (max-width: 768px) {
  .landing-root {
    overflow-x: hidden;
  }
  
  .landing-bg {
    background:
      radial-gradient(300px 200px at 10% 10%, rgba(142,125,255,0.15), transparent 60%),
      radial-gradient(400px 300px at 90% 80%, rgba(110,168,254,0.12), transparent 60%);
  }
  
  /* Add subtle animation to hero title */
  .landing-hero__title {
    animation: fadeInUp 0.8s ease-out;
  }
  
  .landing-hero__subtitle {
    animation: fadeInUp 0.8s ease-out 0.2s both;
  }
  
  .landing-hero__cta {
    animation: fadeInUp 0.8s ease-out 0.4s both;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Desktop Layout - Keep original and unchanged */
@media (min-width: 769px) {
  .landing-header {
    padding: 20px 0;
  }
  
  .landing-nav {
    padding: 0 20px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .landing-logo {
    font-size: 28px;
  }
  
  .desktop-nav {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  
  .mobile-menu-toggle {
    display: none;
  }
  
  .mobile-menu {
    display: none;
  }
}

@media (max-width: 768px) {
  .landing-header {
    padding: 12px 0;
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(20px);
    background: rgba(10, 19, 40, 0.95);
  }
  
  .landing-nav {
    padding: 0 16px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }
  
  .landing-logo {
    font-size: 24px;
    order: 1;
  }
  
  /* Hide desktop nav on mobile */
  .desktop-nav {
    display: none;
  }
  
  /* Show mobile menu toggle */
  .mobile-menu-toggle {
    display: block;
    background: none;
    border: none;
    color: var(--text);
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    order: 2;
    z-index: 1001;
  }
  
  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(10, 19, 40, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 0 0 16px 16px;
    padding: 20px;
    display: none;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    z-index: 1000;
  }
  
  .mobile-menu.open {
    display: flex;
  }
  
  .mobile-menu .btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 16px;
    min-height: 48px;
    border-radius: 12px;
    text-align: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .mobile-menu .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  .mobile-menu .btn--primary {
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(110, 168, 254, 0.3);
  }
  
  .mobile-menu .btn--primary:hover {
    box-shadow: 0 6px 20px rgba(110, 168, 254, 0.4);
  }
  
  
  .btn {
    padding: 12px 24px;
    font-size: 14px;
    white-space: nowrap;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .btn--primary {
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(110, 168, 254, 0.3);
  }
  
  .btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(110, 168, 254, 0.4);
  }
  
  .landing-hero {
    padding: 40px 16px 60px;
    text-align: center;
  }
  
  .landing-hero__title {
    font-size: clamp(2.2rem, 8vw, 3.5rem);
    line-height: 1.1;
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .landing-hero__subtitle {
    font-size: clamp(1rem, 4vw, 1.2rem);
    margin-bottom: 40px;
    line-height: 1.5;
    color: var(--text-dim);
    max-width: 90%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .landing-hero__cta {
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 40px;
  }
  
  .landing-hero__cta .btn {
    width: 100%;
    max-width: 280px;
    padding: 16px 32px;
    font-size: 16px;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .landing-hero__cta .btn--primary {
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    color: white;
    border: none;
    box-shadow: 0 6px 25px rgba(110, 168, 254, 0.4);
  }
  
  .landing-hero__cta .btn:not(.btn--primary) {
    background: transparent;
    color: var(--text);
    border: 2px solid var(--border);
    backdrop-filter: blur(10px);
  }
  
  .landing-hero__cta .btn:not(.btn--primary):hover {
    background: var(--panel);
    border-color: var(--brand);
    transform: translateY(-2px);
  }
  
  /* Add subtle animation to hero title */
  .landing-hero__title {
    animation: fadeInUp 0.8s ease-out;
  }
  
  .landing-hero__subtitle {
    animation: fadeInUp 0.8s ease-out 0.2s both;
  }
  
  .landing-hero__cta {
    animation: fadeInUp 0.8s ease-out 0.4s both;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .features-grid,
  .steps-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card,
  .step-card,
  .pricing-card {
    padding: 24px 20px;
  }
  
  .landing-features,
  .landing-how,
  .landing-pricing {
    padding: 60px 16px;
  }
  
  .landing-section__title {
    font-size: 2rem;
  }
  
  .landing-section__subtitle {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }
  
  .landing-footer {
    padding: 40px 16px 30px;
  }
  
  .chat-examples-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 40px;
  }
  
  /* Final CTA section tablet styles */
  .final-cta-buttons {
    flex-wrap: wrap !important;
    gap: 12px !important;
  }
  
  .final-cta-buttons .btn {
    flex: 1 !important;
    min-width: 200px !important;
    max-width: 250px !important;
    padding: 14px 20px !important;
    font-size: 15px !important;
    min-height: 48px !important;
  }
}

@media (max-width: 480px) {
  .landing-header {
    padding: 10px 0;
  }
  
  .landing-nav {
    padding: 0 12px;
  }
  
  .landing-logo {
    font-size: 20px;
  }
  
  .mobile-menu-toggle {
    font-size: 20px;
    padding: 6px;
  }
  
  .mobile-menu {
    padding: 16px;
    gap: 10px;
  }
  
  .mobile-menu .btn {
    padding: 12px 16px;
    font-size: 15px;
    min-height: 44px;
  }
  
  
  .landing-hero {
    padding: 30px 12px 40px;
  }
  
  .landing-hero__title {
    font-size: clamp(1.8rem, 10vw, 2.8rem);
    margin-bottom: 16px;
  }
  
  .landing-hero__subtitle {
    font-size: 0.95rem;
    margin-bottom: 32px;
    max-width: 95%;
  }
  
  .landing-hero__cta {
    gap: 12px;
    margin-bottom: 32px;
  }
  
  .landing-hero__cta .btn {
    max-width: 260px;
    padding: 14px 28px;
    font-size: 15px;
    min-height: 48px;
    border-radius: 25px;
  }
  
  .feature-card,
  .step-card,
  .pricing-card {
    padding: 20px 16px;
  }
  
  .landing-features,
  .landing-how,
  .landing-pricing {
    padding: 40px 12px;
  }
  
  .landing-section__title {
    font-size: 1.8rem;
  }
  
  .landing-section__subtitle {
    font-size: 1rem;
  }
  
  .landing-footer {
    padding: 30px 12px 20px;
  }
  
  /* Final CTA section mobile styles */
  .final-cta-buttons {
    flex-direction: row !important;
    gap: 12px !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
  }
  
  .final-cta-buttons .btn {
    flex: 1 !important;
    min-width: 140px !important;
    max-width: 200px !important;
    padding: 14px 20px !important;
    font-size: 15px !important;
    min-height: 48px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    white-space: nowrap !important;
  }
}
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.landing-nav')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);


  return (
    <div className={`landing-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <style>{designTokens + landingStyles}</style>
      <div className="landing-bg" />

      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">

          {/* Desktop Navigation */}
          <div className="landing-actions desktop-nav">
            {isLoggedIn ?
              (
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
              )
              :
              (
                <>
                  <button className="btn" onClick={handleLogin}>התחבר</button>
                  <button className="btn btn--primary" onClick={handleGetStarted}>התחל עכשיו</button>
                </>
              )}

            {/* <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button> */}
          </div>

          <div className="landing-logo"><img src={logoLight} alt="Logo" style={{ height: '38px' }} /></div>



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
                <button className="btn" onClick={() => { handleLogin(); closeMobileMenu(); }}>
                  התחבר
                </button>
                <button className="btn btn--primary" onClick={() => { handleGetStarted(); closeMobileMenu(); }}>
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
            <h1 className="landing-hero__title rubik-font" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              {isLoggedIn ? `ברוך השב, ${fullname}!` : 'צור בוט תוך 40 שניות!'}
            </h1>
            <p className="landing-hero__subtitle">
              {isLoggedIn
                ? 'נהל את הבוטים שלך או צור חדשים בלוח המחוונים הפשוט שלנו.'
                : 'תן לנו את כתובת האתר שלך, ואנחנו נבנה אוטומטית צ\'אט-בוט חכם שיודע הכל על העסק שלך. מינימום הגדרות, תוצאות מיידיות.'
              }
            </p>

            {/* Statistics */}
            {!isLoggedIn && (
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
            )}

            <div className="landing-hero__cta">
              {isLoggedIn ? (
                <>
                  <button className="btn btn--primary" onClick={() => setActiveSection('bots')}>
                    ניהול הבוטים שלך
                  </button>
                  <button className="btn" onClick={() => navigate('/fullchat')}>
                    לעבור לצ'אט
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn--primary" onClick={handleGetStarted}>
                    התחל עכשיו
                  </button>
                  <button className="btn" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                    איך זה עובד
                  </button>
                </>
              )}
            </div>
          </section>


          <section className="landing-footer">
            <p>שירות לקוחות (טלפון / וואצאפ): 054-5779917</p>
          </section>

          {/* Features Section */}
          <section className="landing-features">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <h2 className="landing-section__title">הכח של FlowChat</h2>
              <p className="landing-section__subtitle">
                הדרך המהירה ביותר ליצור צ'אט-בוטים אינטליגנטיים ומודעים להקשר
              </p>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3 className="feature-title">התקנה במהירות האור</h3>
                  <p className="feature-desc">
                    מהזנת כתובת לצ׳אט עובר תוך פחות מדקה. אין צורך בקידוד או בהגדרות מסובכות.
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
                    הבוט עונה על סמך תוכן האתר שלך, מה שמפחית הזיות ומבטיח עקביות במותג.
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
                <div className="feature-icon">💬</div>
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

          {/* Comparison Table */}
          {/* <section className="landing-features" style={{ background: 'var(--panel)', margin: '80px 0' }}>
            <h2 className="landing-section__title">FlowChat vs. Competitors</h2>
            <p className="landing-section__subtitle">
              See why thousands choose FlowChat over traditional chatbot solutions
            </p>

            <div style={{ maxWidth: '100%', margin: '0 auto', overflowX: 'auto', textAlign: 'center', width: '100%' }}>
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
                  <tr style={{ background: 'var(--gradient)' }}>
                    <th style={{ padding: '20px', textAlign: 'left', color: 'white', fontWeight: '700' }}>Feature</th>
                    <th style={{ padding: '20px', textAlign: 'center', color: 'white', fontWeight: '700' }}>FlowChat</th>
                    <th style={{ padding: '20px', textAlign: 'center', color: 'white', fontWeight: '700' }}>Traditional Bots</th>
                    <th style={{ padding: '20px', textAlign: 'center', color: 'white', fontWeight: '700' }}>Manual Setup</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>Setup Time</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--ok)' }}>40 seconds</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>2-4 weeks</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>1-3 months</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>Data Upload Required</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--ok)' }}>❌ None</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>✅ Manual</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>✅ Extensive</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>AI Training</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--ok)' }}>❌ Automatic</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>✅ Manual</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>✅ Complex</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>API Integration</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--ok)' }}>✅ Instant</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>✅ Available</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>❌ Custom Dev</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>Multi-Platform Support</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--ok)' }}>✅ All Platforms</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>⚠️ Limited</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>❌ Platform-Specific</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>Cost</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--ok)' }}>from $0</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>$200-500/month</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>$5,000-50,000</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>Maintenance</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--ok)' }}>❌ Zero</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>✅ Ongoing</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--warn)' }}>✅ Constant</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section> */}

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
                  <h3 className="pricing-title">ללא התחייבות</h3>
                  <div className="pricing-price">התנסות חינם</div>
                  {/* <p className="pricing-period">forever</p> */}
                  <ul className="pricing-features">
                    <li>בוט אחד</li>
                    <li>מערכת ניהול בוטים</li>
                    <li>גישה מלאה ל-API</li>
                    {/* <li>Basic Analytics</li> */}
                    {/* <li>Custom Branding</li> */}
                    <li>אין צורך בכרטיס אשראי</li>
                  </ul>
                  <button className="btn btn--primary" onClick={() => handleSelectPlan('free')}>
                    התחל חינם עכשיו
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
                    <strong>מצוין עבור:</strong> עסקים קטנים ובינוניים, או כל מי שרוצה לנסות צ'אט-בוטים מבוססי AI
                  </div>
                </div>
              </div>
              {/* 
              <div style={{
                padding: '40px',
                background: 'var(--panel)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
                  צריך יותר? שדרג לתוכניות Pro או Enterprise
                </h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '32px', lineHeight: '1.6' }}>
                  כאשר העסק שלך מתפתח, תוכל בקלות לשדרג לתוכניות Pro או Enterprise שלנו עבור יותר בוטים, דומיינים ותכונות מתקדמות.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--brand)', marginBottom: '8px' }}>Pro Plan</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>$99/month</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>5 bots • 10K queries • Advanced features</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--brand)', marginBottom: '8px' }}>Enterprise</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>Custom</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Unlimited • 24/7 support • SLA</div>
                  </div>
                </div>
                <button className="btn" onClick={() => handleSelectPlan('contact')}>
                  Contact Sales for Pro/Enterprise
                </button>
              </div> */}
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
            ⚡ הגדרה תוך 40 שניות • 🚀 אין צורך בכרטיס אשראי • 💬 שירות תמיכה
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
