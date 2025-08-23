// FullChat.jsx — text chat + press-to-talk (/flow) + realtime phone-call mode (WebRTC via /realtime/session)
// Audio playback is ONLY allowed when voiceChatMode === true.
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
  const [voiceChatMode, setVoiceChatMode] = useState(false);          // Realtime "phone call" mode
  const [voicePhase, setVoicePhase] = useState('idle');               // 'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking'
  const [theme, setTheme] = useState('dark');
  const [chatFilter, setChatFilter] = useState('');
  const [circleAnimation, setCircleAnimation] = useState('pulse');

  // VAD (/flow) press-to-talk
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const rafRef = useRef(null);
  const startTalkingAtRef = useRef(0);
  const lastSpeechMsRef = useRef(0);
  const vadActiveRef = useRef(false);
  const loopActiveRef = useRef(false);
  const audioPlayerRef = useRef(null);         // local MP3 playback (from /flow TTS)
  const lastPlayedIndexRef = useRef(0);

  // Realtime (WebRTC)
  const pcRef = useRef(null);
  const rtcMicRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const username = Cookies.get('username') || '';
  const navigate = useNavigate();

  const isHebrew = (t) => /[\u0590-\u05FF]/.test(t);

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

  // ------- initial chats
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
          setSelectedChat(sorted[0] || null);
        } else {
          setChats([]);
          setSelectedChat(null);
        }
      } catch {
        setError('Error fetching chat data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  // scroll bottom
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, voiceChatMode]);

  // build thread from selectedChat.conversation
  const buildMessages = useCallback(() => {
    if (!selectedChat) return [];
    const conv = selectedChat.conversation || {};
    const msgs = [];
    let i = 1;
    while (conv['question' + i] || conv['answer' + i]) {
      if (conv['question' + i]) msgs.push({ text: conv['question' + i], isUser: true });
      if (conv['answer' + i]) msgs.push({ text: conv['answer' + i], isUser: false, idx: i });
      i++;
    }
    return msgs;
  }, [selectedChat]);

  const messages = buildMessages();
  const filteredChats = chats.filter((c) => c.convtoken.toLowerCase().includes(chatFilter.trim().toLowerCase()));
  const isTestChat = selectedChat && selectedChat.convtoken.toLowerCase() === 'testchat';

  // Replace selected chat's conversation safely and mirror into list (prevents UI desync)
  const pushConversation = useCallback((newConversation) => {
    setSelectedChat((prevSel) => {
      if (!prevSel) return prevSel;
      const updated = { ...prevSel, conversation: newConversation || {} };
      setChats((prev) =>
        prev.map((c) => (c.convtoken === updated.convtoken ? updated : c))
      );
      return updated;
    });
  }, []);

  // ----- text send via /flow
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const usertoken = Cookies.get('testtoken');
    if (!usertoken) { setError('Missing testtoken cookie.'); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newMessage, convtoken: 'testchat', usertoken })
      });
      if (!r.ok) throw new Error('Server error');
      const data = await r.json();
      pushConversation(data.conversation || {});
      // 🔇 Only read aloud if in conversation mode
      if (voiceChatMode) {
        if (data.audio_b64) {
          await playAssistantAudioB64(data.audio_b64);
        } else {
          autoPlayLatestFromConversation(data.conversation);
        }
      }
      setNewMessage('');
    } catch {
      setError('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  // ----- send recorded audio to /flow
  const sendAudioBlob = async (blob) => {
    const usertoken = Cookies.get('testtoken');
    if (!usertoken) { setError('Missing testtoken cookie.'); return null; }
    const form = new FormData();
    form.append('audio', new File([blob], 'audio.webm', { type: blob.type }));
    form.append('convtoken', 'testchat');
    form.append('usertoken', usertoken);
    const r = await fetch(`${API_BASE}/flow`, { method: 'POST', body: form });
    if (!r.ok) throw new Error('Voice send failed');
    const data = await r.json();
    pushConversation(data.conversation || {});
    return data;
  };

  // ----- play audio (mp3 b64) — guarded by voiceChatMode
  const playAssistantAudioB64 = async (b64) => {
    if (!voiceChatMode) return; // 🔒 no playback if not in conversation mode
    try {
      const blob = base64ToBlob(b64, 'audio/mpeg');
      const url = URL.createObjectURL(blob);
      if (!audioPlayerRef.current) audioPlayerRef.current = new Audio();
      const a = audioPlayerRef.current;
      a.src = url;
      setVoicePhase('speaking');
      setCircleAnimation('vibrate');
      await a.play();
      await new Promise((res) => {
        a.onended = () => { URL.revokeObjectURL(url); res(); };
        a.onerror = () => { URL.revokeObjectURL(url); res(); };
      });
    } catch {
      // ignore
    } finally {
      setCircleAnimation('pulse');
      setVoicePhase('idle');
    }
  };

  const autoPlayLatestFromConversation = (conversationObj) => {
    if (!voiceChatMode) return; // 🔒 guard
    if (!conversationObj) return;
    let maxN = 0;
    for (const k of Object.keys(conversationObj)) {
      if (k.startsWith('audio')) {
        const n = parseInt(k.replace('audio', ''), 10);
        if (n > maxN) maxN = n;
      }
    }
    if (maxN && maxN > lastPlayedIndexRef.current) {
      const b64 = conversationObj['audio' + maxN];
      lastPlayedIndexRef.current = maxN;
      if (b64) playAssistantAudioB64(b64);
    }
  };

  // ======================================================
  // =============== VAD LISTENING LOOP (/flow) ===========
  // ======================================================
  const SILENCE_HANG_MS = 800;
  const MIN_TALK_MS = 600;
  const ENERGY_THRESHOLD = 15;
  const CHUNK_MS = 200;

  const stopAudioGraph = () => {
    try {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      vadActiveRef.current = false;
      if (sourceNodeRef.current) { sourceNodeRef.current.disconnect(); sourceNodeRef.current = null; }
      if (analyserRef.current) { analyserRef.current.disconnect(); analyserRef.current = null; }
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    } catch {}
  };

  const stopListening = useCallback(async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    } catch {}
    try {
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    } catch {}
    stopAudioGraph();
    setCircleAnimation('pulse');
  }, []);

  const startListening = useCallback(async () => {
    if (mediaRecorderRef.current || micStreamRef.current || vadActiveRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      micStreamRef.current = stream;

      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      sourceNodeRef.current = audioCtxRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      sourceNodeRef.current.connect(analyserRef.current);

      const options = { mimeType: 'audio/webm' };
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const now = performance.now();
        const talkDur = now - startTalkingAtRef.current;
        stopAudioGraph();

        if (talkDur >= MIN_TALK_MS && audioChunksRef.current.length) {
          setVoicePhase('thinking');
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
            const data = await sendAudioBlob(audioBlob);
            // 🔇 Only read aloud if in conversation mode
            if (voiceChatMode) {
              if (data?.audio_b64) {
                await playAssistantAudioB64(data.audio_b64);
              } else {
                autoPlayLatestFromConversation(data?.conversation);
              }
            }
          } catch {
            setError('Voice send failed.');
          }
        }

        if (loopActiveRef.current) {
          setTimeout(() => { startListening(); }, 150);
        } else {
          setVoicePhase('idle');
        }
      };

      mr.start(CHUNK_MS);
      setVoicePhase('listening');
      setCircleAnimation('vibrate');

      vadActiveRef.current = true;
      startTalkingAtRef.current = performance.now();
      lastSpeechMsRef.current = performance.now();

      const pcm = new Uint8Array(analyserRef.current.fftSize);
      const tick = () => {
        if (!vadActiveRef.current || !analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(pcm);
        let sum = 0;
        for (let i = 0; i < pcm.length; i++) {
          const v = pcm[i] - 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / pcm.length);
        const energy = rms;

        const now = performance.now();
        if (energy > ENERGY_THRESHOLD) {
          lastSpeechMsRef.current = now;
          if (voicePhase !== 'listening') setVoicePhase('listening');
        }

        const silentFor = now - lastSpeechMsRef.current;
        const hasRecordedFor = now - startTalkingAtRef.current;

        if (hasRecordedFor > MIN_TALK_MS && silentFor > SILENCE_HANG_MS) {
          try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
            vadActiveRef.current = false;
            return;
          } catch {}
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError('Microphone access failed. Check permissions & HTTPS.');
      await stopListening();
      setVoicePhase('idle');
    }
  }, [voicePhase, stopListening, voiceChatMode]);

  // Manual mic (press) for /flow
  const handleMicButton = async () => {
    if (!isTestChat) return;
    if (!voiceChatMode) {
      await startListening();           // one-shot in non-realtime mode
      return;
    }
    // In realtime mode, mic button is not used; the call is continuous
  };

  // Clear conversation
  const handleClearConversation = async () => {
    const usertoken = Cookies.get('testtoken');
    if (!usertoken) { setError('No user token found in cookies.'); return; }
    try {
      const r = await fetch(`${API_BASE}/del-conv?usertoken=${encodeURIComponent(usertoken)}&convtoken=testchat`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Failed to clear conversation');
      if (selectedChat) {
        const updated = { ...selectedChat, conversation: {} };
        setSelectedChat(updated);
        setChats((prev) => prev.map((c) => (c.convtoken === selectedChat.convtoken ? updated : c)));
      }
      lastPlayedIndexRef.current = 0;
    } catch {
      setError('Error clearing conversation');
    }
  };

  // =======================
  // Realtime (WebRTC) helpers
  // =======================
  async function startRealtimeCall() {
    const mint = await fetch(`${API_BASE}/realtime/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice: 'verse' }),
    });
    if (!mint.ok) {
      const txt = await mint.text().catch(()=> '');
      throw new Error(`Mint failed ${mint.status}: ${txt || 'no body'}`);
    }
    const { ephemeral_key, model } = await mint.json();

    const mic = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    rtcMicRef.current = mic;

    const pc = new RTCPeerConnection({ iceServers: [] });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      if (!remoteAudioRef.current) {
        const el = document.getElementById('realtime-audio');
        if (el) {
          el.autoplay = true;
          remoteAudioRef.current = el;
        } else {
          const fallback = new Audio();
          fallback.autoplay = true;
          remoteAudioRef.current = fallback;
        }
      }
      remoteAudioRef.current.srcObject = e.streams[0];
    };

    mic.getTracks().forEach(t => pc.addTrack(t, mic));

    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
    await pc.setLocalDescription(offer);

    const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ephemeral_key}`,
        'Content-Type': 'application/sdp'
      },
      body: offer.sdp
    });
    if (!sdpResponse.ok) {
      const txt = await sdpResponse.text().catch(()=> '');
      throw new Error(`Realtime SDP failed ${sdpResponse.status}: ${txt || 'no body'}`);
    }
    const answerSdp = await sdpResponse.text();
    await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === 'connected') {
        setVoicePhase('listening');
        setCircleAnimation('vibrate');
      } else if (st === 'disconnected' || st === 'failed' || st === 'closed') {
        setVoicePhase('idle');
        setCircleAnimation('pulse');
      }
    };
  }

  async function stopRealtimeCall() {
    try { if (pcRef.current) pcRef.current.close(); } catch {}
    pcRef.current = null;
    if (rtcMicRef.current) {
      rtcMicRef.current.getTracks().forEach(t => t.stop());
      rtcMicRef.current = null;
    }
    if (remoteAudioRef.current) {
      try { remoteAudioRef.current.pause(); } catch {}
      remoteAudioRef.current.srcObject = null;
    }
    // Also stop any local MP3 playback from /flow
    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.pause(); } catch {}
      audioPlayerRef.current.src = '';
    }
  }

  const handleVoiceToggle = async () => {
    if (!isTestChat) return;
    if (!voiceChatMode) {
      try {
        setVoiceChatMode(true);
        setVoicePhase('connecting');
        setCircleAnimation('pulse');
        await startRealtimeCall();
      } catch (e) {
        setError(String(e.message || e));
        setVoiceChatMode(false);
        setVoicePhase('idle');
        setCircleAnimation('pulse');
        await stopRealtimeCall();
      }
    } else {
      setVoiceChatMode(false);
      setVoicePhase('idle');
      setCircleAnimation('pulse');
      await stopRealtimeCall();
    }
  };

  return (
    <div className={`fc-root ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <style>{globalStyles}</style>

      {/* Hidden <audio> element for realtime stream */}
      <audio id="realtime-audio" style={{ display: 'none' }} />

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
                  lastPlayedIndexRef.current = 0; // reset audio index for this thread
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
                >
                  {voiceChatMode
                    ? (voicePhase === 'connecting' ? '🔌 Connecting…'
                      : voicePhase === 'listening' ? '🎧 Voice ON'
                      : voicePhase === 'speaking' ? '🔊 Speaking'
                      : voicePhase === 'thinking' ? '💭 Thinking'
                      : '🎧 Voice ON')
                    : '🎤 Voice OFF'}
                </button>
              </>
            )}
          </div>
        </header>

        <section className="fc-messages" ref={scrollRef}>
          {voiceChatMode ? (
            <VoiceOverlay onExit={handleVoiceToggle} circleAnimation={circleAnimation} phase={voicePhase} />
          ) : messages.length === 0 ? (
            <div className="fc-placeholder">No messages yet. Say hi 👋</div>
          ) : (
            <div className="fc-thread">
              {messages.map((m, i) => (
                <MessageBubble key={i} isUser={m.isUser} isHebrew={isHebrew(m.text)} html={renderFormattedText(m.text)} />
              ))}
            </div>
          )}
        </section>

        {isTestChat && (
          <footer className="fc-composer">
            <div className="fc-composer__inner">
              <button className="fc-iconbtn" onClick={handleMicButton}
                title={voicePhase === 'listening' ? 'Stop recording' : 'Record voice'}>
                {voicePhase === 'listening' ? '⏹' : '🎙'}
              </button>
              <input
                className="fc-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message… Use **bold** to emphasize"
                dir="auto"
              />
              <button className="fc-iconbtn" onClick={handleSendMessage} disabled={loading || !newMessage.trim()}>
                {loading ? <span className="fc-spinner" /> : '➤'}
              </button>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

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

function VoiceOverlay({ onExit, circleAnimation, phase }) {
  return (
    <div className="fc-voice">
      <button className="fc-voice__exit" onClick={onExit} title="Close">✕</button>
      <div className={`fc-voice__circle ${circleAnimation === 'vibrate' ? 'vibrate' : 'pulse'}`} />
      <div className="fc-voice__hint">
        {phase === 'connecting' && 'Connecting…'}
        {phase === 'listening' && 'Live: talk to the AI'}
        {phase === 'thinking' && 'Thinking…'}
        {phase === 'speaking' && 'Speaking…'}
        {phase === 'idle' && 'Voice ready'}
      </div>
    </div>
  );
}

const globalStyles = `
:root{--bg:#0f1420;--panel:rgba(255,255,255,0.06);--panel-strong:rgba(255,255,255,0.12);--text:#e8ecf3;--text-dim:#aab3c5;--brand:#6ea8fe;--brand-2:#8a7dff;--ok:#22c55e;--warn:#ef4444;--border:rgba(255,255,255,0.12);--shadow:0 8px 30px rgba(0,0,0,0.25);--bubble-user:linear-gradient(180deg,#4f9cff 0%,#6ea8fe 100%);--bubble-bot:#1b2232}
.theme-light{--bg:#f3f6fb;--panel:#fff;--panel-strong:#fff;--text:#0f1420;--text-dim:#5b667a;--brand:#316bff;--brand-2:#6b5cff;--ok:#16a34a;--warn:#dc2626;--border:rgba(15,20,32,0.12);--shadow:0 10px 25px rgba(15,20,32,0.08);--bubble-user:linear-gradient(180deg,#316bff 0%,#6b5cff 100%);--bubble-bot:#e8ecf9}
*{box-sizing:border-box}html,body,#root{height:100%;overflow:hidden}body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial}
.fc-root{display:grid;grid-template-columns:320px 1fr;height:100dvh;overflow:hidden;position:relative;background:radial-gradient(1200px 900px at -10% -20%,#1b2232 0%,var(--bg) 50%),var(--bg);color:var(--text)}
.fc-sidebar{display:flex;flex-direction:column;border-right:1px solid var(--border);backdrop-filter:blur(10px);background:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03));min-height:0;overflow:hidden}
.fc-sidebar__top{padding:18px 16px 8px}.fc-logo{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:.2px}.fc-logo__dot{width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,var(--brand),var(--brand-2));box-shadow:0 0 12px var(--brand)}
.fc-search{margin-top:12px}.fc-search input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--panel);color:var(--text);outline:none}
.fc-chatlist{padding:8px;overflow-y:auto;flex:1}.fc-error{color:var(--warn);padding:10px 12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:10px;margin:6px}
.fc-skel,.fc-empty{color:var(--text-dim);padding:16px;text-align:center}
.fc-chatitem{width:100%;display:flex;gap:12px;align-items:center;padding:10px;margin:6px 0;background:transparent;border:1px solid transparent;border-radius:12px;cursor:pointer;text-align:left;color:var(--text);transition:transform .05s ease,background .2s ease,border-color .2s ease}
.fc-chatitem:hover{background:var(--panel);border-color:var(--border)}.fc-chatitem.active{background:var(--panel-strong);border-color:var(--border);transform:translateY(-1px)}
.fc-avatar{width:36px;height:36px;border-radius:10px;background:var(--bubble-bot);display:flex;align-items:center;justify-content:center;font-weight:700}
.fc-chatmeta{overflow:hidden}.fc-chatmeta__name{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fc-chatmeta__sub{font-size:12px;color:var(--text-dim)}
.fc-sidebar__bottom{padding:12px 10px;display:grid;gap:6px;border-top:1px solid var(--border)}.fc-ghost{background:transparent;color:var(--text);border:1px dashed var(--border);border-radius:10px;padding:10px 12px;cursor:pointer;transition:background .2s ease,border-color .2s ease}.fc-ghost:hover{background:var(--panel);border-color:var(--brand)}
.fc-main{display:grid;grid-template-rows:auto 1fr auto;min-height:0}.fc-header{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0)),transparent;backdrop-filter:blur(8px);contain:paint}
.fc-header__left{display:flex;align-items:center;gap:12px}.fc-avatar--lg{width:44px;height:44px;border-radius:12px;background:var(--bubble-bot);display:flex;align-items:center;justify-content:center;font-weight:800}
.fc-title{font-size:16px;font-weight:700}.fc-subtitle{font-size:12px;color:var(--text-dim)}.fc-header__right{display:flex;gap:8px}
.fc-btn{padding:8px 12px;border:1px solid var(--border);border-radius:10px;cursor:pointer;color:var(--text);background:var(--panel);transition:transform .05s ease,background .2s ease,border-color .2s ease}.fc-btn:hover{background:var(--panel-strong);border-color:var(--brand);transform:translateY(-1px)}
.fc-btn--primary{border-color:var(--brand)}.fc-btn--secondary{border-color:var(--text-dim)}.fc-btn--danger{border-color:var(--warn);color:#fff;background:linear-gradient(180deg,rgba(239,68,68,0.3),rgba(239,68,68,0.15))}
.fc-messages{padding:16px 18px;overflow-y:auto;min-height:0;-webkit-overflow-scrolling:touch}.fc-placeholder{color:var(--text-dim);text-align:center;margin-top:18vh}.fc-thread{display:grid;gap:10px}
.fc-bubble{max-width:min(72ch,80%);padding:12px 14px;border-radius:16px;line-height:1.45;box-shadow:var(--shadow);word-wrap:break-word}.fc-bubble--user{margin-left:auto;background:var(--bubble-user);color:#fff;border-top-right-radius:8px}.fc-bubble--bot{margin-right:auto;background:var(--bubble-bot);border-top-left-radius:8px;color:var(--text)}.fc-bubble__content strong{font-weight:800}
.fc-composer{position:sticky;bottom:0;padding:12px 16px;border-top:1px solid var(--border);background:linear-gradient(0deg,rgba(0,0,0,0.12),rgba(0,0,0,0)),transparent;backdrop-filter:blur(8px);contain:paint}.fc-composer__inner{display:grid;grid-template-columns:42px 1fr 42px;gap:10px;align-items:center}
.fc-input{width:100%;padding:12px 14px;border-radius:14px;border:1px solid var(--border);background:var(--panel);color:var(--text);outline:none}.fc-input::placeholder{color:var(--text-dim)}
.fc-iconbtn{height:42px;border-radius:12px;border:1px solid var(--border);background:var(--panel);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease,transform .05s ease,border-color .2s ease}.fc-iconbtn:hover{background:var(--panel-strong);border-color:var(--brand);transform:translateY(-1px)}
.fc-spinner{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,0.35);border-top-color:#fff;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.fc-voice{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;height:65vh;gap:18px}.fc-voice__exit{position:absolute;top:0;right:0;border:1px solid var(--border);background:var(--panel);color:var(--text);border-radius:10px;padding:6px 10px;cursor:pointer}
.fc-voice__circle{width:180px;height:180px;border-radius:50%;background:radial-gradient(80px 80px at 50% 50%,var(--brand),var(--brand-2));filter:drop-shadow(0 12px 30px rgba(0,0,0,0.25))}
.fc-voice__circle.pulse{animation:pulse 1.5s ease-in-out infinite}.fc-voice__circle.vibrate{animation:vibrate 1s infinite}
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}@keyframes vibrate{0%{transform:translate(0,0)}25%{transform:translate(2px,-2px)}50%{transform:translate(-2px,1px)}75%{transform:translate(2px,1px)}100%{transform:translate(0,0)}}
.fc-voice__hint{color:var(--text-dim)}
@media (max-width:980px){.fc-root{grid-template-columns:1fr}.fc-sidebar{display:none}.fc-main{grid-template-rows:auto 1fr auto}}
`;

export default FullChat;
