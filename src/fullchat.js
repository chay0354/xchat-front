// FullChat.jsx — Realtime voice like ChatGPT + existing /flow text chat
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://xchatback123.xyz';

function FullChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [voiceChatMode, setVoiceChatMode] = useState(false);
  const [voicePhase, setVoicePhase] = useState('idle'); // 'idle' | 'connecting' | 'live' | 'error'
  const [theme, setTheme] = useState('dark');
  const [chatFilter, setChatFilter] = useState('');

  const navigate = useNavigate();

  // ---- WebRTC Refs (Realtime voice)
  const pcRef = useRef(null);
  const micStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const dcRef = useRef(null); // optional data channel (for future transcripts)

  // ---- Helpers
  const username = Cookies.get('username') || '';

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

  // ======================================================
  // =============== INITIAL CHATS (sidebar) ==============
  // ======================================================
  useEffect(() => {
    if (!username) {
      setError('No username found in cookies.');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/fullchat?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (data.chats && data.chats.length > 0) {
          const sorted = data.chats.sort((a, b) => {
            if (a.convtoken?.toLowerCase() === 'testchat') return -1;
            if (b.convtoken?.toLowerCase() === 'testchat') return 1;
            return a.convtoken.localeCompare(b.convtoken);
          });
          setChats(sorted);
          setSelectedChat(sorted[0]);
        }
      } catch (e) {
        console.error(e);
        setError('Error fetching chat data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  // ======================================================
  // ================= MESSAGES (center) ==================
  // ======================================================
  const buildMessages = useCallback(() => {
    if (!selectedChat) return [];
    const conv = selectedChat.conversation || {};
    const msgs = [];
    let i = 1;
    while (conv['question' + i] || conv['answer' + i]) {
      if (conv['question' + i]) msgs.push({ text: conv['question' + i], isUser: true });
      if (conv['answer' + i]) msgs.push({ text: conv['answer' + i], isUser: false });
      i++;
    }
    return msgs;
  }, [selectedChat]);

  const messages = buildMessages();

  // ===== keep scrolled to bottom
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, voiceChatMode, messages.length]);

  const filteredChats = chats.filter((c) =>
    c.convtoken.toLowerCase().includes(chatFilter.trim().toLowerCase())
  );
  const isTestChat = selectedChat && selectedChat.convtoken.toLowerCase() === 'testchat';

  // ======================================================
  // ================== TEXT CHAT (/flow) =================
  // ======================================================
  const pushConversation = useCallback(
    (newConversation) => {
      if (!selectedChat) return;
      const updated = { ...selectedChat, conversation: newConversation };
      setSelectedChat(updated);
      setChats((prev) => prev.map((c) => (c.convtoken === updated.convtoken ? updated : c)));
    },
    [selectedChat]
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const usertoken = Cookies.get('testtoken');
    if (!usertoken) {
      setError('Missing testtoken cookie.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newMessage, convtoken: 'testchat', usertoken }),
      });
      if (!r.ok) throw new Error('Server error');
      const data = await r.json();
      pushConversation(data.conversation || {});
      setNewMessage('');
    } catch (e) {
      console.error(e);
      setError('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = async () => {
    const usertoken = Cookies.get('testtoken');
    if (!usertoken) {
      setError('No user token found in cookies.');
      return;
    }
    try {
      const r = await fetch(
        `${API_BASE}/del-conv?usertoken=${encodeURIComponent(usertoken)}&convtoken=testchat`,
        { method: 'DELETE' }
      );
      if (!r.ok) throw new Error('Failed to clear conversation');
      if (selectedChat) {
        const updated = { ...selectedChat, conversation: {} };
        setSelectedChat(updated);
        setChats((prev) => prev.map((c) => (c.convtoken === selectedChat.convtoken ? updated : c)));
      }
    } catch (e) {
      console.error(e);
      setError('Error clearing conversation');
    }
  };

  // ======================================================
  // =============== REALTIME VOICE (WebRTC) ==============
  // ======================================================
  const startVoiceSession = useCallback(async () => {
    if (pcRef.current) return; // guard double-start
    setError('');
    setVoicePhase('connecting');

    try {
      // 1) Ask backend to mint an ephemeral session (valid ~1 min)
      const mint = await fetch(`${API_BASE}/realtime/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: 'verse' }), // pick any supported voice
      });
      if (!mint.ok) throw new Error('Failed to mint ephemeral token');
      const { ephemeral_key, model } = await mint.json();
      if (!ephemeral_key) throw new Error('No ephemeral key returned');

      // 2) Get microphone
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micStreamRef.current = mic;

      // 3) Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;

      // 4) Remote audio playback
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          const p = remoteAudioRef.current.play();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {
              // Some browsers require a direct user gesture; button click typically suffices.
            });
          }
        }
      };

      pc.onconnectionstatechange = () => {
        const st = pc.connectionState;
        if (st === 'connected') setVoicePhase('live');
        if (st === 'failed' || st === 'disconnected' || st === 'closed') {
          setVoicePhase('idle');
        }
      };

      // 5) Add mic track; request downlink audio
      mic.getTracks().forEach((t) => pc.addTrack(t, mic));
      pc.addTransceiver('audio', { direction: 'recvonly' });

      // 6) Optional: data channel for future transcripts / events
      try {
        dcRef.current = pc.createDataChannel('oai-events');
      } catch {
        /* safe ignore */
      }
      pc.ondatachannel = (e) => {
        const ch = e.channel;
        ch.onmessage = (ev) => {
          // Future: parse JSON events to display live transcripts in the thread
          // Keep it resilient:
          try {
            const msg = JSON.parse(ev.data);
            // Example (not guaranteed): if msg.type === 'response.completed' ...
            // console.log('Realtime event', msg);
          } catch {
            // console.log('Non-JSON realtime message', ev.data);
          }
        };
      };

      // 7) SDP offer/answer with OpenAI Realtime
      const offer = await pc.createOffer({ offerToReceiveAudio: true, voiceActivityDetection: true });
      await pc.setLocalDescription(offer);

      const resp = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ephemeral_key}`,
          'Content-Type': 'application/sdp',
          'OpenAI-Beta': 'realtime=v1',
        },
        body: offer.sdp,
      });
      if (!resp.ok) throw new Error(`Realtime SDP failed: ${resp.status}`);
      const answerSdp = await resp.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      setVoicePhase('live');
    } catch (e) {
      console.error(e);
      setError('Voice connection failed. Check HTTPS + mic permissions.');
      setVoicePhase('error');
      // best-effort cleanup
      try {
        if (pcRef.current) pcRef.current.close();
      } catch {}
      pcRef.current = null;
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    }
  }, []);

  const stopVoiceSession = useCallback(async () => {
    try {
      if (dcRef.current) {
        try { dcRef.current.close(); } catch {}
        dcRef.current = null;
      }
      if (pcRef.current) {
        try { pcRef.current.close(); } catch {}
        pcRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
    } finally {
      setVoicePhase('idle');
    }
  }, []);

  // toggle button (top-right)
  const handleVoiceToggle = async () => {
    if (!isTestChat) return;
    if (!voiceChatMode) {
      setVoiceChatMode(true);
      await startVoiceSession();
    } else {
      setVoiceChatMode(false);
      await stopVoiceSession();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, [stopVoiceSession]);

  // ======================================================
  // ======================= RENDER =======================
  // ======================================================
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
                onClick={() => setSelectedChat(chat)}
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

      {/* Main */}
      <main className="fc-main">
        <header className="fc-header">
          <div className="fc-header__left">
            <div className="fc-avatar fc-avatar--lg">
              {selectedChat ? selectedChat.convtoken.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <div className="fc-title">{selectedChat ? selectedChat.convtoken : 'No conversation'}</div>
              <div className="fc-subtitle">{isTestChat ? 'Test chat' : 'Select a chat to get started'}</div>
            </div>
          </div>
          <div className="fc-header__right">
            {isTestChat && (
              <>
                <button className="fc-btn fc-btn--danger" onClick={handleClearConversation}>🗑 Clear</button>
                <button
                  className={`fc-btn ${voiceChatMode ? 'fc-btn--secondary' : 'fc-btn--primary'}`}
                  onClick={handleVoiceToggle}
                  title="Toggle voice mode"
                >
                  {voiceChatMode
                    ? (voicePhase === 'connecting' ? '🔄 Connecting…'
                      : voicePhase === 'live' ? '🔊 Voice ON'
                      : voicePhase === 'error' ? '⚠️ Voice Error'
                      : '🎧 Voice')
                    : '🎤 Voice OFF'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Messages / Voice */}
        <section className="fc-messages" ref={scrollRef}>
          {voiceChatMode ? (
            <div className="fc-voice">
              <div className={`fc-voice__circle ${voicePhase === 'live' ? 'vibrate' : 'pulse'}`} />
              <div className="fc-voice__hint">
                {voicePhase === 'connecting' && 'Connecting…'}
                {voicePhase === 'live' && 'Talk naturally — like a phone call.'}
                {voicePhase === 'error' && 'Voice error. Toggle again or check mic permissions.'}
                {voicePhase === 'idle' && 'Voice ready'}
              </div>
              {/* Hidden audio element for remote assistant voice */}
              <audio ref={remoteAudioRef} autoPlay playsInline />
            </div>
          ) : messages.length === 0 ? (
            <div className="fc-placeholder">No messages yet. Say hi 👋</div>
          ) : (
            <div className="fc-thread">
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  isUser={m.isUser}
                  isHebrew={isHebrew(m.text)}
                  html={renderFormattedText(m.text)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Composer (text chat stays) */}
        {isTestChat && (
          <footer className="fc-composer">
            <div className="fc-composer__inner">
              <input
                className="fc-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message… Use **bold** to emphasize"
                dir="auto"
              />
              <button className="fc-iconbtn" onClick={handleSendMessage} disabled={loading || !newMessage.trim()} title="Send">
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
.fc-composer__inner { display: grid; grid-template-columns: 1fr 42px; gap: 10px; align-items: center; }
.fc-input { width: 100%; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--border); background: var(--panel); color: var(--text); outline: none; }
.fc-input::placeholder { color: var(--text-dim); }
.fc-iconbtn { height: 42px; border-radius: 12px; border: 1px solid var(--border); background: var(--panel); color: var(--text); cursor: pointer; display:flex; align-items:center; justify-content:center; transition: background .2s ease, transform .05s ease, border-color .2s ease; }
.fc-iconbtn:hover { background: var(--panel-strong); border-color: var(--brand); transform: translateY(-1px); }
.fc-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fc-voice { position: relative; display:flex; flex-direction: column; align-items:center; justify-content:center; height: 65vh; gap: 18px; }
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
