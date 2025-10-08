import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
// Using environment variable directly
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5137';

function FullChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [theme, setTheme] = useState('light');
  const [chatFilter, setChatFilter] = useState('');

  const scrollRef = useRef(null);

  // const email = Cookies.get('email') || '';
  const navigate = useNavigate();

  const isHebrew = (text) => /[\u0590-\u05FF]/.test(text);

  const escapeHtml = (unsafe) =>
    (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const renderFormattedText = (text) => {
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br/>');
    return { __html: html };
  };


  // Load full conversation for a specific chat
  const loadFullConversation = useCallback(async (chat) => {
    if (!chat) return;
    
    try {
      const usertoken = Cookies.get('testtoken');
      if (!usertoken) {
        setError('No user token found in cookies.');
        return;
      }

      const response = await fetch(
        `${API_BASE}/conversation?usertoken=${encodeURIComponent(usertoken)}&convtoken=${encodeURIComponent(chat.convtoken)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const updatedChat = { ...chat, conversation: data.conversation };
      setSelectedChat(updatedChat);
      setChats(prevChats => 
        prevChats.map(c => c.convtoken === chat.convtoken ? updatedChat : c)
      );
    } catch (error) {
      console.error('Error loading conversation:', error);
      setError('Failed to load conversation');
    }
  }, []);

  // Load chats on component mount
  useEffect(() => {
    const loadChats = async () => {
      const usertoken = Cookies.get('testtoken');
      if (!usertoken) {
        setError('No user token found in cookies.');
        return;
      }

      console.log('Loading chats with token:', usertoken.substring(0, 8) + '***');

      try {
        // Try with usertoken first (new version)
        let response = await fetch(`${API_BASE}/fullchat?usertoken=${encodeURIComponent(usertoken)}`);
        
        // If that fails with "No email provided", try with email parameter (old version)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error === 'No email provided') {
            console.log('Trying with email parameter for compatibility...');
            // Get email from token by calling get-user-info first
            const userInfoResponse = await fetch(`${API_BASE}/get-user-info?usertoken=${encodeURIComponent(usertoken)}`);
            if (userInfoResponse.ok) {
              const userData = await userInfoResponse.json();
              const email = userData[0]?.email;
              if (email) {
                response = await fetch(`${API_BASE}/fullchat?email=${encodeURIComponent(email)}`);
              }
            }
          }
        }
        
        if (!response.ok) {
          console.error('Fullchat response error:', response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          throw new Error(`Failed to load chats: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setChats(data.chats || []);
        
        // Auto-select test chat if available
        const testChat = data.chats?.find(chat => chat.convtoken === 'testchat');
        if (testChat) {
          setSelectedChat(testChat);
          loadFullConversation(testChat);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        setError('Failed to load chats');
      }
    };

    loadChats();
  }, [loadFullConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat]);

  // Send text message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    const usertoken = Cookies.get('testtoken');
    const requestData = { 
      question: newMessage, 
      convtoken: 'testchat', 
      usertoken
    };

    try {
      const response = await fetch(`${API_BASE}/flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        // const errorData = await response.json().catch(() => ({}));
        if (response.status === 402) {
          setError('Plan limit reached. Please upgrade your plan to continue.');
        } else {
          throw new Error('Error sending message to server');
        }
        return;
      }
      
      const data = await response.json();
      const updatedChat = { ...selectedChat, conversation: data.conversation };
      setSelectedChat(updatedChat);
      setChats(chats.map((c) => (c.convtoken === 'testchat' ? updatedChat : c)));
      setNewMessage('');
    } catch (err) {
      console.error('Error in sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };


  // Clear conversation
  const handleClearConversation = async () => {
    const usertoken = Cookies.get('testtoken');
    if (!usertoken) {
      setError('No user token found in cookies.');
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE}/del-conv?usertoken=${encodeURIComponent(usertoken)}&convtoken=testchat`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Failed to clear conversation');

      if (selectedChat) {
        const updatedChat = { ...selectedChat, conversation: {} };
        setSelectedChat(updatedChat);
        setChats(chats.map((c) => (c.convtoken === selectedChat.convtoken ? updatedChat : c)));
      }
    } catch (error) {
      console.error('Error clearing conversation:', error);
      setError('Error clearing conversation');
    }
  };


  // Build messages from conversation
  const buildMessages = () => {
    if (!selectedChat) return [];
    const conv = selectedChat.conversation || {};
    const messages = [];
    let i = 1;
    while (conv['question' + i] || conv['answer' + i]) {
      if (conv['question' + i]) messages.push({ text: conv['question' + i], isUser: true });
      if (conv['answer' + i]) messages.push({ text: conv['answer' + i], isUser: false });
      i++;
    }
    return messages;
  };

  const messages = buildMessages();
  const filteredChats = chats.filter((c) =>
    c.convtoken.toLowerCase().includes(chatFilter.trim().toLowerCase())
  );
  const isTestChat = selectedChat && selectedChat.convtoken.toLowerCase() === 'testchat';

  // Mobile detection for mobile-only features
  const [isMobile, setIsMobile] = useState(false);
  const [showChatSelection, setShowChatSelection] = useState(false);
  const shouldShowMobileSelection = isMobile && showChatSelection;

  // Detect mobile/desktop on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 980;
      setIsMobile(mobile);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Handle mobile chat selection state
  useEffect(() => {
    if (isMobile && !selectedChat) {
      setShowChatSelection(true);
    } else if (!isMobile) {
      setShowChatSelection(false);
    }
  }, [isMobile, selectedChat]);

  // Handle chat selection for mobile
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    loadFullConversation(chat);
    if (isMobile) {
      setShowChatSelection(false); // Hide chat selection screen on mobile
    }
  };

  // Show chat selection screen on mobile
  const showChatSelectionScreen = () => {
    if (isMobile) {
      setShowChatSelection(true);
    }
  };

  return (
    <div className={`fc-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${shouldShowMobileSelection ? 'fc-mobile-chat-selection' : ''}`}>
      <style>{globalStyles}</style>

      {/* Desktop Sidebar / Mobile Chat Selection */}
      <aside className="fc-sidebar">
        <div className="fc-sidebar__top">
          <div className="fc-logo">
            <div className="fc-logo__dot" />
            <span>flowchat</span>
          </div>
          <div className="fc-search">
            <input
              type="text"
              placeholder="Search chats..."
              value={chatFilter}
              onChange={(e) => setChatFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="fc-chatlist">
          {error && <div className="fc-error">{error}</div>}
          {filteredChats.length === 0 ? (
            <div className="fc-empty">No chats found</div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.convtoken}
                className={`fc-chatitem ${selectedChat?.convtoken === chat.convtoken ? 'active' : ''}`}
                onClick={() => {
                  handleChatSelect(chat);
                }}
              >
                <div className="fc-avatar">{chat.convtoken.charAt(0).toUpperCase()}</div>
                <div className="fc-chatmeta">
                  <div className="fc-chatmeta__name">{chat.convtoken}</div>
                  <div className="fc-chatmeta__sub">
                    {Object.keys(chat.conversation || {}).length} messages
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="fc-sidebar__bottom">
          <button className="fc-ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button className="fc-ghost" onClick={() => navigate('/')}>לעמוד הבית</button>
          <button className="fc-ghost" onClick={() => navigate('/edituserinfo')}>ערוך פרופיל</button>
          <button className="fc-ghost" onClick={() => navigate('/')}>התנתק</button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="fc-main">
        {/* Header */}
        <header className="fc-header">
          <div className="fc-header__left">
            {/* Mobile Clear button - positioned at top left */}
            {isTestChat && (
              <button className="fc-btn fc-btn--danger fc-mobile-clear" onClick={handleClearConversation} title="Clear chat">
                🗑 נקה
              </button>
            )}
            <div className="fc-avatar fc-avatar--lg">
              {selectedChat ? selectedChat.convtoken.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <div className="fc-title">{selectedChat ? selectedChat.convtoken : 'No conversation'}</div>
              <div className="fc-subtitle">
                {isTestChat ? 'Test chat' : 'Select a chat to get started'}
              </div>
            </div>
          </div>
          <div className="fc-header__right">
            {/* Desktop clear button */}
            {isTestChat && !isMobile && (
              <button className="fc-btn fc-btn--danger fc-desktop-clear" onClick={handleClearConversation} title="Clear chat">
                🗑 נקה
              </button>
            )}
            
            {/* Mobile back button - MOBILE ONLY */}
            {selectedChat && isMobile && (
              <button 
                className="fc-mobile-back" 
                onClick={showChatSelectionScreen}
                title="Back to chat selection"
              >
                ←
              </button>
            )}
            
          </div>
        </header>

        {/* Messages */}
        <section className="fc-messages" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="fc-placeholder">
              אין הודעות עדיין. התחל לשאול משהו בצ'אט הבדיקה!<br/>
            </div>
          ) : (
            <div className="fc-thread">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  isUser={msg.isUser}
                  isHebrew={isHebrew(msg.text)}
                  html={renderFormattedText(msg.text)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Composer */}
        {isTestChat && (
          <footer className="fc-composer">
            <div className="fc-composer__inner">
              <input
                className="fc-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message… Use **bold** to emphasize | כתוב הודעה... השתמש ב**מודגש** להדגשה"
                dir={isHebrew(newMessage) ? 'rtl' : 'ltr'}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <button
                className="fc-iconbtn"
                onClick={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                title="Send"
              >
                {loading ? <span className="fc-spinner" /> : '➤'}
              </button>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

/* ---------------- Components ---------------- */

function MessageBubble({ isUser, isHebrew, html }) {
  return (
    <div className={`fc-bubble ${isUser ? 'fc-bubble--user' : 'fc-bubble--bot'}`}>
      <div 
        className="fc-bubble__content" 
        dir={isHebrew ? 'rtl' : 'ltr'}
        dangerouslySetInnerHTML={html} 
      />
    </div>
  );
}

/* ---------------- Styles ---------------- */

const globalStyles = `
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
  --bubble-user: linear-gradient(180deg, #4f9cff 0%, #6ea8fe 100%);
  --bubble-bot: #1b2232;
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
  --bubble-user: linear-gradient(180deg, #316bff 0%, #6b5cff 100%);
  --bubble-bot: #e8ecf9;
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; overflow: hidden; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }

.fc-root { 
  display: grid; 
  grid-template-columns: 320px 1fr; 
  height: 100dvh; 
  overflow: hidden; 
  position: relative; 
  background: radial-gradient(1200px 900px at -10% -20%, #1b2232 0%, var(--bg) 50%), var(--bg); 
  color: var(--text); 
}

.fc-sidebar { 
  display: flex; 
  flex-direction: column; 
  border-right: 1px solid var(--border); 
  backdrop-filter: blur(10px); 
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)); 
  min-height: 0; 
  overflow: hidden; 
}

.fc-sidebar__top { padding: 18px 16px 8px; }
.fc-logo { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: 0.2px; }
.fc-logo__dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, var(--brand), var(--brand-2)); box-shadow: 0 0 12px var(--brand); }
.fc-search { margin-top: 12px; }
.fc-search input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--panel); color: var(--text); outline: none; }
.fc-chatlist { padding: 8px; overflow-y: auto; flex: 1; }
.fc-error { color: var(--warn); padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; margin: 6px; }
.fc-skel, .fc-empty { color: var(--text-dim); padding: 16px; text-align: center; }
.fc-chatitem { width: 100%; display: flex; gap: 12px; align-items: center; padding: 10px; margin: 6px 0; background: transparent; border: 1px solid transparent; border-radius: 12px; cursor: pointer; text-align: left; color: var(--text); transition: transform .05s ease, background .2s ease, border-color .2s ease; }
.fc-chatitem:hover { background: var(--panel); border-color: var(--border); }
.fc-chatitem.active { background: var(--panel-strong); border-color: var(--border); transform: translateY(-1px); }
.fc-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--bubble-bot); display:flex; align-items:center; justify-content:center; font-weight:700; }
.fc-chatmeta { overflow: hidden; }
.fc-chatmeta__name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fc-chatmeta__sub { font-size: 12px; color: var(--text-dim); }
.fc-sidebar__bottom { padding: 12px 10px; display: grid; gap: 6px; border-top: 1px solid var(--border); }
.fc-ghost { background: transparent; color: var(--text); border: 1px dashed var(--border); border-radius: 10px; padding: 10px 12px; cursor: pointer; transition: background .2s ease, border-color .2s ease; }
.fc-ghost:hover { background: var(--panel); border-color: var(--brand); }

.fc-main { display: grid; grid-template-rows: auto 1fr auto; min-height: 0; }
.fc-header { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); background: linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0)) , transparent; backdrop-filter: blur(8px); contain: paint }
.fc-header__left { display: flex; align-items: center; gap: 12px; }
.fc-avatar--lg { width: 44px; height: 44px; border-radius: 12px; background: var(--bubble-bot); display:flex; align-items:center; justify-content:center; font-weight:800; }
.fc-title { font-size: 16px; font-weight: 700; }
.fc-subtitle { font-size: 12px; color: var(--text-dim); }
.fc-header__right { display: flex; gap: 8px; }
.fc-btn { padding: 8px 12px; border: 1px solid var(--border); border-radius: 10px; cursor: pointer; color: var(--text); background: var(--panel); transition: transform .05s ease, background .2s ease, border-color .2s ease; }
.fc-btn:hover { background: var(--panel-strong); border-color: var(--brand); transform: translateY(-1px); }
.fc-btn--primary { border-color: var(--brand); }
.fc-btn--secondary { border-color: var(--text-dim); }
.fc-btn--danger { border-color: var(--warn); color: #fff; background: linear-gradient(180deg, rgba(239,68,68,0.3), rgba(239,68,68,0.15)); }

.fc-messages { padding: 16px 18px; overflow-y: auto; min-height: 0; -webkit-overflow-scrolling: touch; }
.fc-placeholder { color: var(--text-dim); text-align: center; margin-top: 18vh; }
.fc-thread { display: grid; gap: 10px; }
.fc-bubble { max-width: min(72ch, 80%); padding: 12px 14px; border-radius: 16px; line-height: 1.45; box-shadow: var(--shadow); word-wrap: break-word; }
.fc-bubble--user { margin-left: auto; background: var(--bubble-user); color: #fff; border-top-right-radius: 8px; }
.fc-bubble--bot { margin-right: auto; background: var(--bubble-bot); border-top-left-radius: 8px; color: var(--text); }
.fc-bubble__content strong { font-weight: 800; }
.fc-bubble__content[dir="rtl"] { text-align: right; }
.fc-bubble__content[dir="ltr"] { text-align: left; }

.fc-composer { position: sticky; bottom: 0; padding: 12px 16px; border-top: 1px solid var(--border); background: linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0)) , transparent; backdrop-filter: blur(8px); contain: paint; }
.fc-composer__inner { display: grid; grid-template-columns: 1fr 60px; gap: 10px; align-items: center; }
.fc-input { width: 100%; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--border); background: var(--panel); color: var(--text); outline: none; text-align: start; }
.fc-input::placeholder { color: var(--text-dim); }
.fc-iconbtn { height: 50px; width: 60px; border-radius: 12px; border: 1px solid var(--border); background: var(--panel); color: var(--text); cursor: pointer; display:flex; align-items:center; justify-content:center; transition: background .2s ease, transform .05s ease, border-color .2s ease; }
.fc-iconbtn:hover { background: var(--panel-strong); border-color: var(--brand); transform: translateY(-1px); }
.fc-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 980px) {
  .fc-root { 
    grid-template-columns: 1fr; 
    height: 100vh;
    overflow: hidden;
  }
  
  .fc-sidebar { 
    display: none; 
  }
  
  .fc-main { 
    grid-template-rows: auto 1fr auto; 
    height: 100vh;
  }
  
  /* Mobile chat selection screen */
  .fc-mobile-chat-selection {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg);
  }
  
  .fc-mobile-chat-selection .fc-sidebar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    border-right: none;
    background: var(--bg);
    backdrop-filter: blur(20px);
  }
  
  .fc-mobile-chat-selection .fc-main {
    display: none;
  }
  
  /* Hide chat selection when chat is selected */
  .fc-root:not(.fc-mobile-chat-selection) .fc-mobile-chat-selection {
    display: none;
  }
  
  .fc-root:not(.fc-mobile-chat-selection) .fc-main {
    display: grid;
  }
  
  /* Desktop - force normal layout, hide all mobile elements */
  @media (min-width: 981px) {
    .fc-root {
      grid-template-columns: 300px 1fr !important;
      height: 100vh !important;
    }
    
    .fc-sidebar { 
      display: flex !important; 
    }
    
    .fc-main { 
      display: grid !important; 
    }
    
    .fc-mobile-chat-selection {
      display: none !important;
    }
    
    
    .fc-mobile-clear {
      display: none !important;
    }
    
    .fc-mobile-back {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    
    /* Extra strong rules to hide back button on desktop */
    .fc-header__right .fc-mobile-back,
    .fc-header .fc-mobile-back,
    button.fc-mobile-back {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    
    /* Force desktop layout regardless of any classes */
    .fc-root.fc-mobile-chat-selection {
      grid-template-columns: 300px 1fr !important;
    }
    
    .fc-root.fc-mobile-chat-selection .fc-sidebar {
      display: flex !important;
    }
    
    .fc-root.fc-mobile-chat-selection .fc-main {
      display: grid !important;
    }
    
    /* Ensure desktop clear button is visible */
    .fc-desktop-clear {
      display: flex !important;
    }
  }
  
  /* Mobile chat selection specific styles */
  .fc-mobile-chat-selection .fc-chatitem {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
    background: var(--panel);
    border: 1px solid var(--border);
  }
  
  .fc-mobile-chat-selection .fc-chatitem:hover {
    background: var(--panel-strong);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .fc-mobile-chat-selection .fc-chatitem.active {
    background: var(--brand);
    color: white;
    border-color: var(--brand);
  }
  
  .fc-header {
    padding: 12px 16px;
    background: #ffffff;
  }
  
  .fc-messages {
    padding: 12px 16px;
  }
  
  .fc-composer {
    padding: 10px 16px;
  }
  
  .fc-bubble {
    max-width: min(85ch, 90%);
    padding: 10px 12px;
  }
  
  .fc-input {
    padding: 14px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .fc-iconbtn {
    height: 48px;
    width: 56px;
  }
}

@media (max-width: 768px) {
  .fc-header {
    padding: 10px 12px;
    flex-wrap: wrap;
    gap: 8px;
    position: relative;
    background: #ffffff;
  }
  
  .fc-header__left {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .fc-header__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  
  /* Desktop header layout - restore original */
  @media (min-width: 981px) {
    .fc-header__left {
      margin-left: 0;
    }
    
    .fc-header__right {
      gap: 16px;
    }
  }
  
  
  .fc-mobile-clear {
    flex-shrink: 0;
    min-width: 44px;
    min-height: 44px;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    margin-right: 8px;
  }
  
  .fc-mobile-back {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--panel);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    padding: 10px;
    border-radius: 10px;
    transition: all 0.2s ease;
    min-width: 44px;
    min-height: 44px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    flex-shrink: 0;
  }
  
  .fc-mobile-back:hover {
    background: var(--panel-strong);
    border-color: var(--brand);
    transform: translateY(-1px);
  }
  
  .fc-mobile-back:active {
    transform: translateY(0);
  }
  
  .fc-desktop-clear {
    display: none; /* Hidden by default, shown on desktop via media query */
  }
  
  /* Hide mobile buttons on desktop */
  @media (min-width: 981px) {
    .fc-mobile-back {
      display: none;
    }
    
    .fc-mobile-clear {
      display: none;
    }
  }
  
  .fc-title {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .fc-subtitle {
    font-size: 11px;
  }
  
  .fc-messages {
    padding: 10px 12px;
  }
  
  .fc-bubble {
    max-width: min(80ch, 95%);
    padding: 8px 10px;
    font-size: 14px;
  }
  
  .fc-composer {
    padding: 8px 12px;
  }
  
  .fc-input {
    padding: 12px 14px;
    font-size: 16px;
  }
  
  .fc-iconbtn {
    height: 44px;
    width: 52px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .fc-header {
    padding: 8px 10px;
    flex-wrap: wrap;
    gap: 6px;
    background: #ffffff;
  }
  
  .fc-header__left {
    gap: 8px;
  }
  
  .fc-mobile-back {
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
    font-size: 16px;
  }
  
  .fc-mobile-clear {
    min-width: 40px;
    min-height: 40px;
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .fc-header__right {
    gap: 6px;
  }
  
  .fc-avatar--lg { 
    width: 36px; 
    height: 36px; 
    font-size: 14px; 
  }
  
  .fc-title { 
    font-size: 13px; 
  }
  
  .fc-subtitle { 
    font-size: 10px; 
  }
  
  .fc-messages {
    padding: 8px 10px;
  }
  
  .fc-bubble {
    max-width: 95%;
    padding: 6px 8px;
    font-size: 13px;
  }
  
  .fc-composer {
    padding: 6px 10px;
  }
  
  .fc-input {
    padding: 10px 12px;
    font-size: 16px;
  }
  
  .fc-iconbtn {
    height: 40px;
    width: 48px;
    font-size: 12px;
  }
}
`;

export default FullChat;