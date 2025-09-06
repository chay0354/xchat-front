import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import config from './config';

// 🔗 Backend base URL (EC2 behind Nginx/Certbot)
const API_BASE = config.apiUrl;

function FullChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const [voiceChatMode, setVoiceChatMode] = useState(false);
  const [circleAnimation, setCircleAnimation] = useState('vibrate');
  const [lastPlayedAudioIndex, setLastPlayedAudioIndex] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [chatFilter, setChatFilter] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const scrollRef = useRef(null);

  const username = Cookies.get('username') || '';
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

  const base64ToBlob = (base64, mime) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  };

  // Function to load full conversation for a specific chat
  const loadFullConversation = useCallback(async (convtoken) => {
    console.log('Loading full conversation for:', convtoken);
    try {
      const response = await fetch(
        `${API_BASE}/conversation?username=${encodeURIComponent(username)}&convtoken=${encodeURIComponent(convtoken)}`
      );
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Full conversation data:', data);
        if (data && data.conversation) {
          console.log('Conversation loaded:', data.conversation);
          // Update the selected chat with full conversation
          setSelectedChat(prev => ({
            ...prev,
            conversation: data.conversation
          }));
          // Update the chat in the chats list
          setChats(prev => prev.map(chat => 
            chat.convtoken === convtoken 
              ? { ...chat, conversation: data.conversation }
              : chat
          ));
        } else {
          console.log('No conversation data found');
        }
      } else {
        console.log('Response not ok:', response.status);
      }
    } catch (err) {
      console.error('Error loading full conversation:', err);
    }
  }, [username]);

  // Fetch chats and load full conversation for the first chat
  useEffect(() => {
    if (!username) {
      setError('No username found in cookies.');
      setLoading(false);
      return;
    }
    console.log('Fetching chats for username:', username);
    setLoading(true);
    fetch(`${API_BASE}/fullchat?username=${encodeURIComponent(username)}`)
      .then((res) => {
        console.log('Initial fetch response status:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('Initial fetch data:', data);
        if (data.chats && data.chats.length > 0) {
          const sortedChats = data.chats.sort((a, b) => {
            if (a.convtoken.toLowerCase() === 'testchat') return -1;
            if (b.convtoken.toLowerCase() === 'testchat') return 1;
            return a.convtoken.localeCompare(b.convtoken);
          });
          console.log('Sorted chats:', sortedChats);
          setChats(sortedChats);
          setSelectedChat(sortedChats[0]);
          
          // Load full conversation for the first chat
          if (sortedChats[0] && sortedChats[0].convtoken) {
            console.log('Loading conversation for first chat:', sortedChats[0].convtoken);
            loadFullConversation(sortedChats[0].convtoken);
          }
        } else {
          console.log('No chats found in data');
        }
      })
      .catch((err) => {
        console.error('Error fetching chats:', err);
        setError('Error fetching chat data.');
      })
      .finally(() => setLoading(false));
  }, [username, loadFullConversation]);

  // Auto-play audio for new answers
  useEffect(() => {
    if (selectedChat && selectedChat.conversation) {
      let maxIndex = 0;
      Object.keys(selectedChat.conversation).forEach((key) => {
        if (key.startsWith('question')) {
          const num = parseInt(key.replace('question', ''));
          if (num > maxIndex) maxIndex = num;
        }
      });
      if (maxIndex > lastPlayedAudioIndex) {
        const audioKey = 'audio' + maxIndex;
        const audioData = selectedChat.conversation[audioKey];
        if (audioData) {
          const blob = base64ToBlob(audioData, 'audio/mpeg');
          const url = URL.createObjectURL(blob);
          const audioElement = new Audio(url);
          audioElement.play().catch((err) => console.error('Error playing audio:', err));
          setLastPlayedAudioIndex(maxIndex);
          setCircleAnimation('vibrate');
        }
      }
    }
  }, [selectedChat, lastPlayedAudioIndex]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, voiceChatMode]);

  // Send text
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);
    const usertoken = Cookies.get('testtoken');
    const requestData = { question: newMessage, convtoken: 'testchat', usertoken };

    try {
      const response = await fetch(`${API_BASE}/flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) throw new Error('Error sending message to server');
      const data = await response.json();
      const updatedChat = { ...selectedChat, conversation: data.conversation };
      setSelectedChat(updatedChat);
      setChats(chats.map((c) => (c.convtoken === 'testchat' ? updatedChat : c)));
      setNewMessage('');
    } catch (err) {
      console.error('Error in sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send recorded audio
  const sendAudioBlob = async (blob) => {
    setLoading(true);
    const usertoken = Cookies.get('testtoken');
    const formData = new FormData();
    const file = new File([blob], 'audio.webm', { type: blob.type });
    formData.append('audio', file);
    formData.append('convtoken', 'testchat');
    formData.append('usertoken', usertoken);
    try {
      const response = await fetch(`${API_BASE}/flow`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Error sending audio to server');
      const data = await response.json();
      const updatedChat = { ...selectedChat, conversation: data.conversation };
      setSelectedChat(updatedChat);
      setChats(chats.map((c) => (c.convtoken === 'testchat' ? updatedChat : c)));
    } catch (err) {
      console.error('Error in sending audio:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mic toggle
  const handleMicButton = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const options = { mimeType: 'audio/webm' };
        const mediaRecorder = new MediaRecorder(stream, options);
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
          sendAudioBlob(audioBlob);
        };
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
        setVoiceChatMode(true);
        setCircleAnimation('vibrate');
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
        setCircleAnimation('loading');
      }
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

  return (
    <div className={`fc-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <style>{globalStyles}</style>

      {/* Sidebar */}
      <aside className="fc-sidebar">
        <div className="fc-sidebar__top">
          <div className="fc-logo">
            <div className="fc-logo__dot" />
            <span>FlowChat</span>
          </div>
          <div className="fc-search">
            <input
              type="text"
              placeholder="Search chats…"
              value={chatFilter}
              onChange={(e) => setChatFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="fc-chatlist">
          {error && <div className="fc-error">{error}</div>}
          {loading && <div className="fc-skel">Loading chats…</div>}
          {!loading && filteredChats.length === 0 && <div className="fc-empty">No chats</div>}

          {filteredChats.map((chat) => {
            const active = selectedChat && selectedChat.convtoken === chat.convtoken;
            return (
              <button
                key={chat.convtoken}
                className={`fc-chatitem ${active ? 'active' : ''}`}
                onClick={() => {
                  setSelectedChat(chat);
                  // Load full conversation when clicking on a chat
                  if (chat.convtoken) {
                    loadFullConversation(chat.convtoken);
                  }
                }}
                title={chat.convtoken}
              >
                <div className="fc-avatar">{chat.convtoken.charAt(0).toUpperCase()}</div>
                <div className="fc-chatmeta">
                  <div className="fc-chatmeta__name">{chat.convtoken}</div>
                  <div className="fc-chatmeta__sub">
                    {chat.convtoken.toLowerCase() === 'testchat' ? 'Test session' : 'Conversation'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="fc-sidebar__bottom">
          <button className="fc-ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button className="fc-ghost" onClick={() => navigate('/edituserinfo')}>Edit Profile</button>
          <button className="fc-ghost" onClick={() => navigate('/')}>Log Out</button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="fc-main">
        {/* Header */}
        <header className="fc-header">
          <div className="fc-header__left">
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
            {isTestChat && (
              <>
                <button className="fc-btn fc-btn--danger" onClick={handleClearConversation} title="Clear chat">
                  🗑 Clear
                </button>
                <button
                  className={`fc-btn ${voiceChatMode ? 'fc-btn--secondary' : 'fc-btn--primary'}`}
                  onClick={() => setVoiceChatMode(!voiceChatMode)}
                  title="Toggle voice mode"
                >
                  {voiceChatMode ? '🎧 Voice ON' : '🎤 Voice OFF'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Messages */}
        <section className="fc-messages" ref={scrollRef}>
          {voiceChatMode ? (
            <VoiceOverlay onExit={() => setVoiceChatMode(false)} circleAnimation={circleAnimation} />
          ) : messages.length === 0 ? (
            <div className="fc-placeholder">No messages yet. Say hi 👋</div>
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
              <button
                className="fc-iconbtn"
                onClick={handleMicButton}
                disabled={loading}
                title={recording ? 'Stop recording' : 'Record voice'}
              >
                {recording ? '⏹' : '🎙'}
              </button>

              <input
                className="fc-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message… Use **bold** to emphasize"
                dir="auto"
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
    <div
      className={`fc-bubble ${isUser ? 'fc-bubble--user' : 'fc-bubble--bot'}`}
      style={{ direction: isHebrew ? 'rtl' : 'ltr', unicodeBidi: isHebrew ? 'embed' : 'normal' }}
    >
      <div className="fc-bubble__content" dangerouslySetInnerHTML={html} />
    </div>
  );
}

function VoiceOverlay({ onExit, circleAnimation }) {
  return (
    <div className="fc-voice">
      <button className="fc-voice__exit" onClick={onExit} title="Close">✕</button>
      <div className={`fc-voice__circle ${circleAnimation === 'vibrate' ? 'vibrate' : 'pulse'}`} />
      <div className="fc-voice__hint">Listening… speak now</div>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const globalStyles = `/* (unchanged CSS from your file) */ 
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
.fc-root { display: grid; grid-template-columns: 320px 1fr; height: 100dvh; overflow: hidden; position: relative; background: radial-gradient(1200px 900px at -10% -20%, #1b2232 0%, var(--bg) 50%), var(--bg); color: var(--text); }
.fc-sidebar { display: flex; flex-direction: column; border-right: 1px solid var(--border); backdrop-filter: blur(10px); background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)); min-height: 0; overflow: hidden; }
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
.fc-header { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); background: linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0)) , transparent; backdrop-filter: blur(8px); contain: paint; }
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
.fc-composer { position: sticky; bottom: 0; padding: 12px 16px; border-top: 1px solid var(--border); background: linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0)) , transparent; backdrop-filter: blur(8px); contain: paint; }
.fc-composer__inner { display: grid; grid-template-columns: 42px 1fr 42px; gap: 10px; align-items: center; }
.fc-input { width: 100%; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--border); background: var(--panel); color: var(--text); outline: none; }
.fc-input::placeholder { color: var(--text-dim); }
.fc-iconbtn { height: 42px; border-radius: 12px; border: 1px solid var(--border); background: var(--panel); color: var(--text); cursor: pointer; display:flex; align-items:center; justify-content:center; transition: background .2s ease, transform .05s ease, border-color .2s ease; }
.fc-iconbtn:hover { background: var(--panel-strong); border-color: var(--brand); transform: translateY(-1px); }
.fc-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fc-voice { position: relative; display:flex; flex-direction: column; align-items:center; justify-content:center; height: 65vh; gap: 18px; }
.fc-voice__exit { position: absolute; top: 0; right: 0; border: 1px solid var(--border); background: var(--panel); color: var(--text); border-radius: 10px; padding: 6px 10px; cursor: pointer; }
.fc-voice__circle { width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(80px 80px at 50% 50%, var(--brand), var(--brand-2)); filter: drop-shadow(0 12px 30px rgba(0,0,0,0.25)); }
.fc-voice__circle.pulse { animation: pulse 1.5s ease-in-out infinite; }
.fc-voice__circle.vibrate { animation: vibrate 1s infinite; }
@keyframes pulse { 0%{ transform: scale(1);} 50%{ transform: scale(1.08);} 100%{ transform: scale(1);} }
@keyframes vibrate { 0% { transform: translate(0,0); } 25% { transform: translate(2px, -2px); } 50% { transform: translate(-2px, 1px); } 75% { transform: translate(2px, 1px); } 100% { transform: translate(0,0); } }
.fc-voice__hint { color: var(--text-dim); }
@media (max-width: 980px) {
  .fc-root { grid-template-columns: 1fr; }
  .fc-sidebar { display: none; }
  .fc-main { grid-template-rows: auto 1fr auto; }
}
`;

export default FullChat;
