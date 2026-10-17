import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  User,
  Search,
  MessageSquare,
  Hash,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Square,
  Send,
  Monitor,
  Check,
  CheckCheck,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  UserPlus,
  Settings,
  Smile,
  Paperclip,
  Share2,
} from 'lucide-react';
import { SkypeIcon } from '../icons/AppIcons';

interface SkypeAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

interface SkypeContact {
  id: string;
  name: string;
  phone: string;
  status: 'Online' | 'Away' | 'Offline';
  avatar: string;
  color: string;
  lastSeen?: string;
}

interface CallLogItem {
  id: string;
  contactName: string;
  number: string;
  type: 'incoming' | 'outgoing' | 'missed';
  time: string;
  duration?: string;
}

interface ChatMsg {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

const INITIAL_CONTACTS: SkypeContact[] = [
  { id: 'c-1', name: 'Sarah Miller', phone: '+1 555-0192', status: 'Online', avatar: 'SM', color: 'bg-purple-600', lastSeen: 'Active now' },
  { id: 'c-2', name: 'Omar Farooq', phone: '+966 50-123-4567', status: 'Online', avatar: 'OF', color: 'bg-emerald-600', lastSeen: 'Active now' },
  { id: 'c-3', name: 'Layla Chen', phone: '+44 20-7946-0958', status: 'Away', avatar: 'LC', color: 'bg-pink-600', lastSeen: 'Away 15m' },
  { id: 'c-4', name: 'David Ross', phone: '+1 555-0143', status: 'Offline', avatar: 'DR', color: 'bg-blue-600', lastSeen: 'Yesterday' },
  { id: 'c-echo', name: 'SNNS Echo / Sound Test Service', phone: '+1 800-TEST', status: 'Online', avatar: '🎧', color: 'bg-sky-700', lastSeen: '24/7 Service' },
];

// Dual-Tone Multi-Frequency (DTMF) standard telephone frequencies
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

export const SkypeApp: React.FC<SkypeAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';

  // Navigation mode
  const [activeTab, setActiveTab] = useState<'dialpad' | 'calls' | 'chat' | 'echo'>('dialpad');

  // Contacts & selection
  const [contacts, setContacts] = useState<SkypeContact[]>(INITIAL_CONTACTS);
  const [searchContact, setSearchContact] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<SkypeContact>(INITIAL_CONTACTS[0]);

  // Dialpad state
  const [dialedNumber, setDialedNumber] = useState<string>('');

  // Call state
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const [activeCallTarget, setActiveCallTarget] = useState<string>('');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [cameraOff, setCameraOff] = useState<boolean>(false);
  const [screenSharing, setScreenSharing] = useState<boolean>(false);

  // Live media streams
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio Context for DTMF tones
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Call History Logs
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([
    { id: 'l-1', contactName: 'Omar Farooq', number: '+966 50-123-4567', type: 'incoming', time: '10:30 AM', duration: '04:12' },
    { id: 'l-2', contactName: 'Sarah Miller', number: '+1 555-0192', type: 'outgoing', time: 'Yesterday', duration: '12:45' },
    { id: 'l-3', contactName: 'Layla Chen', number: '+44 20-7946-0958', type: 'missed', time: '2 days ago' },
  ]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMsg[]>>({
    'c-1': [
      { id: 'm-1', sender: 'them', text: isAr ? 'مرحباً! هل أنت متاح لمكالمة سريعة حول التحديثات؟' : 'Hi! Are you free for a quick call regarding the deployment?', time: '09:40 AM' },
      { id: 'm-2', sender: 'me', text: isAr ? 'أهلاً سارة، بكل سرور! سأتصل بك الآن.' : 'Hi Sarah, sure! Calling you right now.', time: '09:42 AM' },
    ],
    'c-2': [
      { id: 'm-3', sender: 'them', text: isAr ? 'تم اختبار جودة الصوت HD عبر خوادم snns.pro، الأداء ممتاز!' : 'HD Voice testing through snns.pro gateway completed. Crystal clear!', time: 'Yesterday' },
    ],
  });
  const [chatInput, setChatInput] = useState<string>('');

  // Echo Sound Test Service State
  const [isRecordingEcho, setIsRecordingEcho] = useState<boolean>(false);
  const [isPlayingEcho, setIsPlayingEcho] = useState<boolean>(false);
  const [echoAudioUrl, setEchoAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCalling]);

  // Cleanup media on unmount
  useEffect(() => {
    return () => {
      stopLocalStream();
    };
  }, []);

  const stopLocalStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playDtmfTone = (char: string) => {
    try {
      const freqs = DTMF_FREQS[char];
      if (!freqs) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const [f1, f2] = freqs;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f2, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.16);
      osc2.stop(now + 0.16);
    } catch {
      // Audio autoplay restrictions
    }
  };

  const handleDialClick = (char: string) => {
    setDialedNumber((prev) => prev + char);
    playDtmfTone(char);
  };

  // Start Call (Audio or Video)
  const startCall = async (target: string, video: boolean = false) => {
    const finalTarget = target || dialedNumber || '+1 800 SNNS-HQ';
    setActiveCallTarget(finalTarget);
    setIsVideoCall(video);
    setIsCalling(true);
    setCameraOff(false);
    setMicMuted(false);

    // If video call requested, try opening user webcam
    if (video) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch {
        // Camera permissions denied or unavailable in sandbox
      }
    }

    // Add to Call Logs
    const newLog: CallLogItem = {
      id: `l-${Date.now()}`,
      contactName: finalTarget,
      number: dialedNumber || '+1 555-SNNS',
      type: 'outgoing',
      time: 'Just now',
    };
    setCallLogs((prev) => [newLog, ...prev]);
  };

  const endCall = () => {
    stopLocalStream();
    setIsCalling(false);
    setActiveCallTarget('');
    setIsVideoCall(false);
    setScreenSharing(false);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = micMuted;
      });
    }
    setMicMuted(!micMuted);
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = cameraOff;
      });
    }
    setCameraOff(!cameraOff);
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = displayStream;
          }
          displayStream.getVideoTracks()[0].onended = () => {
            setScreenSharing(false);
            if (streamRef.current && localVideoRef.current) {
              localVideoRef.current.srcObject = streamRef.current;
            }
          };
          setScreenSharing(true);
        }
      } catch {
        // Dismissed or unsupported
      }
    } else {
      setScreenSharing(false);
      if (streamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
    }
  };

  // Echo / Sound Test Service Handlers
  const startEchoRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordedChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setEchoAudioUrl(url);
          stream.getTracks().forEach((t) => t.stop());
        };

        mediaRecorder.start();
        setIsRecordingEcho(true);

        // Auto-stop after 8 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            stopEchoRecording();
          }
        }, 8000);
      }
    } catch {
      alert(isAr ? 'تعذر الوصول إلى الميكروفون لاختبار الصوت.' : 'Microphone access denied or unavailable.');
    }
  };

  const stopEchoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingEcho(false);
  };

  const playEchoPlayback = () => {
    if (!echoAudioUrl) return;
    const audio = new Audio(echoAudioUrl);
    setIsPlayingEcho(true);
    audio.play();
    audio.onended = () => setIsPlayingEcho(false);
  };

  // Chat message send
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const contactId = selectedContact.id;
    const newMsg: ChatMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg],
    }));
    setChatInput('');

    // Responsive colleague reply
    setTimeout(() => {
      const replies = [
        isAr ? 'وصلتني رسالتك! سأقوم بمراجعتها فوراً.' : 'Got your message! Reviewing it right now.',
        isAr ? 'ممتاز، جاهز للمكالمة في أي وقت.' : 'Perfect, ready for call anytime.',
        isAr ? 'تم استلام الملفات والبيانات بنجاح.' : 'Files and data received successfully.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const botMsg: ChatMsg = {
        id: `msg-${Date.now()}`,
        sender: 'them',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), botMsg],
      }));
    }, 1200);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) || c.phone.includes(searchContact)
  );

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-xs z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <SkypeIcon className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-gray-900">{isAr ? 'مكالمات SNNS Skype المتطورة' : 'SNNS Skype HD Telephony'}</h1>
              <span className="text-[10px] bg-sky-100 text-[#0078D4] font-bold px-2 py-0.5 rounded-full">
                HD Voice & Video
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {isAr ? 'اتصالات حقيقية، اختبار الصدى، كاميرا فيديو، ودردشة فورية' : 'Real video/audio calls, echo test, dialer & messaging'}
            </p>
          </div>
        </div>

        {/* Tab switchers in header */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('dialpad')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dialpad' ? 'bg-white text-[#0078D4] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>{isAr ? 'لوحة الاتصال' : 'Dialpad'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calls' ? 'bg-white text-[#0078D4] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجل المكالمات' : 'Call History'}</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'bg-white text-[#0078D4] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isAr ? 'الدردشة' : 'Chat'}</span>
          </button>

          <button
            onClick={() => setActiveTab('echo')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'echo' ? 'bg-white text-[#0078D4] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAr ? 'فحص الصوت (Echo Test)' : 'Echo Test'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Contacts Sidebar */}
        <aside className="w-72 bg-white border-e border-gray-200 flex flex-col text-xs select-none">
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800 text-sm">
                {isAr ? 'جهات الاتصال' : 'Contacts'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {contacts.length} {isAr ? 'أعضاء' : 'contacts'}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم أو الرقم...' : 'Search name or phone...'}
                className="w-full ps-8 pe-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>

          <div className="space-y-1 p-2 flex-1 overflow-y-auto">
            {filteredContacts.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedContact(c);
                  if (activeTab === 'echo' && c.id !== 'c-echo') {
                    setActiveTab('chat');
                  }
                }}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                  selectedContact.id === c.id
                    ? 'bg-sky-50 border-sky-300'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-full ${c.color} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs relative`}>
                    {c.avatar}
                    <span
                      className={`absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        c.status === 'Online'
                          ? 'bg-emerald-500'
                          : c.status === 'Away'
                          ? 'bg-amber-400'
                          : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{c.name}</h4>
                    <p className="text-[11px] text-gray-400 font-mono truncate">{c.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startCall(c.name, false);
                    }}
                    title={isAr ? 'مكالمة صوتية' : 'Voice Call'}
                    className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-full transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startCall(c.name, true);
                    }}
                    title={isAr ? 'مكالمة فيديو' : 'Video Call'}
                    className="p-1.5 hover:bg-sky-100 text-[#0078D4] rounded-full transition cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Content: Mode Dependent */}
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
          {/* ========================================================================= */}
          {/* ACTIVE CALL OVERLAY (AUDIO OR VIDEO CALL)                                */}
          {/* ========================================================================= */}
          {isCalling ? (
            <div className="flex-1 bg-slate-950 text-white flex flex-col items-center justify-between p-6 sm:p-10 relative overflow-hidden">
              {/* Top Call Info */}
              <div className="z-10 text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isAr ? 'متصل بجودة HD Voice المشفرة' : 'Connected via HD Voice Encrypted'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-2">{activeCallTarget}</h2>
                <div className="text-sm font-mono text-cyan-300 font-bold">{formatTimer(callDuration)}</div>
              </div>

              {/* Video or Center Avatar Stage */}
              <div className="relative z-10 w-full max-w-lg aspect-video flex items-center justify-center my-4">
                {isVideoCall ? (
                  <div className="w-full h-full bg-slate-900 rounded-3xl border border-white/20 overflow-hidden relative shadow-2xl flex items-center justify-center">
                    {/* Live Camera Stream */}
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${cameraOff ? 'hidden' : 'block'}`}
                    />

                    {cameraOff && (
                      <div className="text-center space-y-2">
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto text-3xl font-bold">
                          {activeCallTarget[0]}
                        </div>
                        <p className="text-xs text-gray-400">
                          {isAr ? 'الكاميرا مغلقة حالياً' : 'Camera is turned off'}
                        </p>
                      </div>
                    )}

                    {/* Participant PiP box */}
                    <div className="absolute bottom-3 end-3 w-32 h-24 bg-slate-800 rounded-2xl border border-white/25 shadow-lg overflow-hidden flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-8 h-8 rounded-full bg-[#0078D4] flex items-center justify-center text-xs font-bold text-white mb-1">
                        YOU
                      </div>
                      <span className="text-[10px] text-cyan-200 truncate">Htaf Online</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black shadow-2xl animate-pulse mx-auto border-4 border-white/20">
                      {activeCallTarget[0]}
                    </div>
                    <div className="text-xs text-sky-200">
                      {isAr ? 'مكالمة صوتية عالية النقاء عبر snns.pro' : 'Crystal-clear audio call over snns.pro'}
                    </div>
                  </div>
                )}
              </div>

              {/* In-Call Controls Bar */}
              <div className="z-10 flex items-center gap-4 sm:gap-6 bg-slate-900/80 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/15 shadow-2xl">
                <button
                  onClick={toggleMic}
                  className={`p-3.5 rounded-full transition cursor-pointer ${
                    micMuted ? 'bg-red-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                  title={isAr ? (micMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت') : (micMuted ? 'Unmute' : 'Mute')}
                >
                  {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {isVideoCall && (
                  <button
                    onClick={toggleCamera}
                    className={`p-3.5 rounded-full transition cursor-pointer ${
                      cameraOff ? 'bg-red-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                    title={isAr ? (cameraOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا') : (cameraOff ? 'Turn on camera' : 'Turn off camera')}
                  >
                    {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                )}

                {isVideoCall && (
                  <button
                    onClick={toggleScreenShare}
                    className={`p-3.5 rounded-full transition cursor-pointer ${
                      screenSharing ? 'bg-emerald-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                    title={isAr ? 'مشاركة الشاشة' : 'Share Screen'}
                  >
                    <Monitor className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={endCall}
                  className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition cursor-pointer transform hover:scale-105"
                  title={isAr ? 'إنهاء المكالمة' : 'End Call'}
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : activeTab === 'dialpad' ? (
            /* ========================================================================= */
            /* TAB 1: DIALPAD INTERFACE                                                  */
            /* ========================================================================= */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-sm border border-gray-200/90 space-y-6">
                {/* Dialed Input Display */}
                <div className="text-center">
                  <span className="text-[11px] font-bold text-gray-400 block mb-1">
                    {isAr ? 'الرقم المستهدف' : 'Target Number'}
                  </span>
                  <input
                    type="text"
                    value={dialedNumber}
                    readOnly
                    placeholder={isAr ? 'أدخل الرقم للاتصال...' : 'Dial number...'}
                    className="w-full text-2xl font-bold text-center font-mono text-gray-900 focus:outline-none"
                  />
                </div>

                {/* Number Keypad Grid */}
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((char) => (
                    <button
                      key={char}
                      onClick={() => handleDialClick(char)}
                      className="w-16 h-16 rounded-2xl bg-gray-50 hover:bg-sky-50 border border-gray-200 hover:border-sky-300 text-lg font-bold text-gray-800 transition flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                    >
                      {char}
                    </button>
                  ))}
                </div>

                {/* Call Action Triggers */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => startCall(dialedNumber, false)}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{isAr ? 'اتصال صوتي' : 'Call'}</span>
                  </button>

                  <button
                    onClick={() => startCall(dialedNumber, true)}
                    className="p-3 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-2xl font-bold shadow-md transition cursor-pointer"
                    title={isAr ? 'مكالمة فيديو' : 'Video Call'}
                  >
                    <Video className="w-5 h-5" />
                  </button>

                  {dialedNumber && (
                    <button
                      onClick={() => setDialedNumber('')}
                      className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-medium transition cursor-pointer text-xs"
                      title={isAr ? 'مسح' : 'Clear'}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'calls' ? (
            /* ========================================================================= */
            /* TAB 2: CALL HISTORY LOGS                                                  */
            /* ========================================================================= */
            <div className="flex-1 p-6 overflow-y-auto max-w-2xl w-full mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0078D4]" />
                  <span>{isAr ? 'سجل المكالمات الأخير' : 'Recent Call History'}</span>
                </h3>
                <span className="text-xs text-gray-400">
                  {callLogs.length} {isAr ? 'مكالمات مسجلة' : 'records'}
                </span>
              </div>

              <div className="space-y-2">
                {callLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-sky-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          log.type === 'incoming'
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.type === 'outgoing'
                            ? 'bg-sky-100 text-[#0078D4]'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {log.type === 'incoming' && <PhoneIncoming className="w-5 h-5" />}
                        {log.type === 'outgoing' && <PhoneCall className="w-5 h-5" />}
                        {log.type === 'missed' && <PhoneMissed className="w-5 h-5" />}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{log.contactName}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                          <span>{log.number}</span>
                          <span>•</span>
                          <span>{log.time}</span>
                          {log.duration && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">{log.duration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startCall(log.contactName, false)}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition cursor-pointer"
                        title={isAr ? 'معاودة الاتصال' : 'Call back'}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startCall(log.contactName, true)}
                        className="p-2 hover:bg-sky-50 text-[#0078D4] rounded-xl transition cursor-pointer"
                        title={isAr ? 'مكالمة فيديو' : 'Video call'}
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'chat' ? (
            /* ========================================================================= */
            /* TAB 3: INSTANT CHAT INTERFACE                                            */
            /* ========================================================================= */
            <div className="flex-1 flex flex-col bg-white">
              {/* Chat Contact Header */}
              <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${selectedContact.color} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                    {selectedContact.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{selectedContact.name}</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold">● {selectedContact.lastSeen}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startCall(selectedContact.name, false)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">{isAr ? 'اتصال' : 'Call'}</span>
                  </button>
                  <button
                    onClick={() => startCall(selectedContact.name, true)}
                    className="p-2 bg-sky-50 hover:bg-sky-100 text-[#0078D4] rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Video className="w-4 h-4" />
                    <span className="hidden sm:inline">{isAr ? 'فيديو' : 'Video'}</span>
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9FAFB]">
                {(chatMessages[selectedContact.id] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl p-3 shadow-xs text-xs ${
                        msg.sender === 'me'
                          ? 'bg-[#0078D4] text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className={`text-[10px] block mt-1 ${msg.sender === 'me' ? 'text-sky-200 text-end' : 'text-gray-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Send Input */}
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isAr ? `اكتب رسالة إلى ${selectedContact.name}...` : `Type a message to ${selectedContact.name}...`}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2.5 bg-[#0078D4] hover:bg-[#106EBE] disabled:bg-gray-200 text-white rounded-xl transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* TAB 4: ECHO SOUND TEST SERVICE                                            */
            /* ========================================================================= */
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-3xl shadow-xl">
                🎧
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {isAr ? 'خدمة فحص الصوت الحقيقي (SNNS Echo Test)' : 'SNNS Echo & Sound Test Service'}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
                  {isAr
                    ? 'اضغط على زر التسجيل وتحدث في الميكروفون لبضع ثوان، ثم استمع إلى صوتك للتأكد من إعدادات الميكروفون والسماعات.'
                    : 'Click record and speak into your microphone for a few seconds, then listen back to your recording to test your audio equipment.'}
                </p>
              </div>

              {/* Recorder Controls */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm w-full space-y-4">
                <div className="flex justify-center gap-4">
                  {!isRecordingEcho ? (
                    <button
                      onClick={startEchoRecording}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Mic className="w-5 h-5" />
                      <span>{isAr ? 'بدء تسجيل فحص الصوت' : 'Start Audio Test Recording'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopEchoRecording}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-md animate-pulse flex items-center gap-2 cursor-pointer"
                    >
                      <Square className="w-5 h-5" />
                      <span>{isAr ? 'إيقاف التسجيل' : 'Stop Recording'}</span>
                    </button>
                  )}

                  {echoAudioUrl && (
                    <button
                      onClick={playEchoPlayback}
                      disabled={isPlayingEcho}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-bold rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-5 h-5" />
                      <span>
                        {isPlayingEcho
                          ? (isAr ? 'جاري التشغيل...' : 'Playing...')
                          : (isAr ? 'تشغيل التسجيل والاستماع' : 'Play Back Recording')}
                      </span>
                    </button>
                  )}
                </div>

                {isRecordingEcho && (
                  <div className="text-xs text-rose-600 font-bold flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span>{isAr ? 'جاري الاستماع لصوتك عبر الميكروفون... (تحدث الآن)' : 'Recording from your microphone... Speak now!'}</span>
                  </div>
                )}

                {echoAudioUrl && !isRecordingEcho && (
                  <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    {isAr ? '✓ تم تسجيل عينة الصوت بنجاح! اضغط تشغيل لسماع جودة الميكروفون.' : '✓ Audio sample captured! Click play to verify microphone quality.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
