import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Hash,
  User,
  Send,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Smile,
  Paperclip,
  Share2,
  Users,
  MessageSquare,
  Sparkles,
  Phone,
  PhoneCall,
  Clock,
  Search,
  Check,
  X,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Calendar,
  Info,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { TeamsIcon } from '../icons/AppIcons';

interface TeamsAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

interface ChatMessage {
  id: string;
  sender: string;
  avatarBg: string;
  text: string;
  time: string;
  reactions: Record<string, number>;
  attachment?: { name: string; size: string; type: 'file' | 'image' };
}

const CHANNELS = [
  { id: 'general', nameAr: 'العام - المنظومة السحابية', nameEn: 'General Suite' },
  { id: 'dev-team', nameAr: 'فريق التطوير والتقنية', nameEn: 'Engineering Team' },
  { id: 'business-market', nameAr: 'فريق الأعمال وسوق SNNS', nameEn: 'Marketplace & B2B' },
  { id: 'announcements', nameAr: 'الإعلانات والتعميمات', nameEn: 'Announcements' },
];

const CONTACTS_LIST = [
  { id: 'u-1', name: 'سارة أحمد (Sarah Miller)', role: 'VP Product Innovation', status: 'online', statusAr: 'متصل ومتاح', color: 'bg-purple-600', avatar: 'SM' },
  { id: 'u-2', name: 'عمر فاروق (Omar Farooq)', role: 'Chief Financial Officer', status: 'online', statusAr: 'متصل ومتاح', color: 'bg-emerald-600', avatar: 'OF' },
  { id: 'u-3', name: 'م. طارق المنصور', role: 'Lead Solutions Architect', status: 'busy', statusAr: 'مشغول في اجتماع', color: 'bg-amber-600', avatar: 'TM' },
  { id: 'u-4', name: 'خالد العتيبي', role: 'Head of IT & Networks', status: 'away', statusAr: 'بالخارج مؤقتاً', color: 'bg-blue-600', avatar: 'KO' },
  { id: 'u-5', name: 'فريق الدعم وأمان SNNS', role: 'Security Operations', status: 'online', statusAr: 'دعم فني فوري', color: 'bg-rose-600', avatar: 'SC' },
];

const CALL_HISTORY = [
  { id: 'c-1', name: 'سارة أحمد', type: 'video', direction: 'incoming', duration: '14:20 دقيقة', time: 'اليوم 10:15 ص' },
  { id: 'c-2', name: 'م. طارق المنصور', type: 'audio', direction: 'outgoing', duration: '05:40 دقيقة', time: 'الأمس 03:30 م' },
  { id: 'c-3', name: 'عمر فاروق', type: 'video', direction: 'missed', duration: 'مكالمة فائتة', time: 'الأحد 11:00 ص' },
];

export const TeamsApp: React.FC<TeamsAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [activeView, setActiveView] = useState<'chats' | 'calls' | 'contacts' | 'meetings'>('chats');
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [activeDm, setActiveDm] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState<string>('');

  // Live Call / WebRTC State
  const [inMeeting, setInMeeting] = useState<boolean>(false);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [videoOff, setVideoOff] = useState<boolean>(false);
  const [screenSharing, setScreenSharing] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File Attachment State
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: 'file' | 'image' } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    if (inMeeting && !videoOff) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [inMeeting, videoOff]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch {
      // Camera permission or iframe restrictions
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          stream.getVideoTracks()[0].onended = () => {
            setScreenSharing(false);
            if (!videoOff) startCamera();
          };
          setScreenSharing(true);
        }
      } catch {
        // Dismissed
      }
    } else {
      setScreenSharing(false);
      if (!videoOff) startCamera();
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'سارة أحمد',
      avatarBg: 'bg-purple-600',
      text: isAr
        ? 'أهلاً بكم في مساحة SNNS Connect الموحدة! تم ربط غرف الاجتماعات المشفرة وتحديثات المستندات.'
        : 'Welcome to the SNNS Connect unified workspace! Encrypted meeting rooms and live collaboration are ready.',
      time: '10:00 ص',
      reactions: { '👍': 4, '🚀': 2 },
    },
    {
      id: 'm-2',
      sender: 'عمر فاروق',
      avatarBg: 'bg-emerald-600',
      text: isAr
        ? 'تم تجهيز مسودة ميزانية الربع الرابع في جداول SNNS Sheets. يمكننا مراجعتها في مكالمة الفيديو القادمة.'
        : 'Q4 Budget forecast prepared in SNNS Sheets. We can review together in our next video session.',
      time: '10:05 ص',
      reactions: { '👏': 3 },
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() && !attachedFile) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: isAr ? 'أنت (هتاف أونلاين)' : 'You (Htaf Online)',
      avatarBg: 'bg-[#5059C9]',
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      attachment: attachedFile || undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');
    setAttachedFile(null);

    // Auto teammate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-reply-${Date.now()}`,
          sender: 'سارة أحمد',
          avatarBg: 'bg-purple-600',
          text: isAr
            ? 'تم استلام الرسالة والمرفق في مساحة SNNS Connect بنجاح.'
            : 'Message and attachment received successfully in SNNS Connect workspace.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: { '👍': 1 },
        },
      ]);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen text-slate-800">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6 shadow-xs sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
              title={isAr ? 'الرجوع للمركز' : 'Back to Launcher'}
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-2.5">
              <TeamsIcon className="w-9 h-9" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    {isAr ? 'تواصل واجتماعات SNNS Connect' : 'SNNS Connect Suite'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {isAr ? 'محادثات ومكالمات HD' : 'Calls & Rooms'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {activeDm ? activeDm : `#${activeChannel}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!inMeeting ? (
              <button
                onClick={() => setInMeeting(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 text-xs cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>{isAr ? 'بدء اجتماع مرئي فوري' : 'Start Video Meeting'}</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse border border-emerald-300">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'اجتماع مرئي مباشر نشط' : 'Live Meeting in Progress'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Status Line */}
        <div className="mt-2 pt-2 border-t border-slate-100 max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">
              {isAr ? 'خادم الاتصال والمكالمات:' : 'Connect & Calling Gateway:'}
            </span>
            <span>
              {isAr
                ? 'الواجهة جاهزة محلياً مع دعم WebRTC — بانتظار ربط خوادم الاتصال في SNNS.PRO'
                : 'Interface ready with local WebRTC — awaiting live call signaling on SNNS.PRO'}
            </span>
          </div>
          <span className="font-mono text-slate-400 hidden md:inline">connect.snns.pro/webrtc</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Navigation / Sub-tabs */}
        <aside className="w-60 sm:w-72 bg-white border-e border-slate-200 flex flex-col p-3 select-none shrink-0 overflow-y-auto">
          {/* Main Module Selector */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-4">
            <button
              onClick={() => setActiveView('chats')}
              className={`p-2 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                activeView === 'chats' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title={isAr ? 'المحادثات' : 'Chats'}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px]">{isAr ? 'محادثات' : 'Chats'}</span>
            </button>
            <button
              onClick={() => setActiveView('calls')}
              className={`p-2 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                activeView === 'calls' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title={isAr ? 'المكالمات' : 'Calls'}
            >
              <Phone className="w-4 h-4" />
              <span className="text-[10px]">{isAr ? 'مكالمات' : 'Calls'}</span>
            </button>
            <button
              onClick={() => setActiveView('contacts')}
              className={`p-2 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                activeView === 'contacts' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title={isAr ? 'جهات الاتصال' : 'Contacts'}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px]">{isAr ? 'جهات' : 'Contacts'}</span>
            </button>
            <button
              onClick={() => setActiveView('meetings')}
              className={`p-2 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                activeView === 'meetings' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title={isAr ? 'الاجتماعات' : 'Meetings'}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-[10px]">{isAr ? 'اجتماعات' : 'Rooms'}</span>
            </button>
          </div>

          {/* CHATS SUBVIEW: Channels & DMs */}
          {activeView === 'chats' && (
            <>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                {isAr ? 'قنوات فرق العمل' : 'Channels'}
              </div>
              <div className="space-y-0.5 mb-5 text-xs">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannel(ch.id);
                      setActiveDm(null);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition text-start cursor-pointer ${
                      activeChannel === ch.id && !activeDm
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{isAr ? ch.nameAr : ch.nameEn}</span>
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                {isAr ? 'الرسائل الفردية المباشرة' : 'Direct Messages'}
              </div>
              <div className="space-y-1 text-xs">
                {CONTACTS_LIST.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setActiveDm(user.name);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-start cursor-pointer ${
                      activeDm === user.name
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative">
                        <div className={`w-7 h-7 rounded-xl ${user.color} text-white font-bold text-[10px] flex items-center justify-center`}>
                          {user.avatar}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -end-0.5 w-2 h-2 rounded-full ring-2 ring-white ${
                            user.status === 'online'
                              ? 'bg-emerald-500'
                              : user.status === 'busy'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <span className="truncate font-medium">{user.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* CALLS SUBVIEW */}
          {activeView === 'calls' && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {isAr ? 'سجل المكالمات الأخير' : 'Call Log'}
              </div>
              <div className="space-y-2 text-xs">
                {CALL_HISTORY.map((call) => (
                  <div key={call.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{call.name}</span>
                      <span className="text-[10px] text-slate-400">{call.time}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{call.duration}</span>
                      <button
                        onClick={() => setInMeeting(true)}
                        className="px-2 py-0.5 bg-indigo-600 text-white rounded-lg font-bold text-[10px] hover:bg-indigo-700"
                      >
                        {isAr ? 'إعادة الاتصال' : 'Call'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTACTS SUBVIEW */}
          {activeView === 'contacts' && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {isAr ? 'دليل الزملاء وحالة الاتصال' : 'Teammate Status'}
              </div>
              <div className="space-y-2 text-xs">
                {CONTACTS_LIST.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-lg ${c.color} text-white font-bold text-[10px] flex items-center justify-center`}>
                        {c.avatar}
                      </div>
                      <span className="font-bold text-slate-800 truncate">{c.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{c.role}</span>
                      <span className="text-emerald-700 font-bold">{isAr ? c.statusAr : c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEETINGS SUBVIEW */}
          {activeView === 'meetings' && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {isAr ? 'الاجتماعات المجدولة' : 'Upcoming Meetings'}
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs space-y-1.5">
                <span className="font-bold text-indigo-900 block">{isAr ? 'مزامنة التخطيط الاستراتيجي' : 'Sprint Planning'}</span>
                <span className="text-[11px] text-slate-600 block">{isAr ? 'اليوم: 02:00 م - 03:00 م' : 'Today: 2:00 PM - 3:00 PM'}</span>
                <button
                  onClick={() => setInMeeting(true)}
                  className="w-full py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold text-xs transition"
                >
                  {isAr ? 'الانضمام للاجتماع الآن' : 'Join Room'}
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Conversation & Meeting Stage */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Active Meeting Room Overlay */}
          {inMeeting && (
            <div className="bg-slate-950 p-4 border-b border-slate-800 text-white flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-bold text-sm">
                    {isAr ? 'غرفة اجتماع SNNS Connect المشفرة' : 'Encrypted SNNS Connect Room'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMicMuted(!micMuted)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      micMuted ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={micMuted ? 'Unmute' : 'Mute'}
                  >
                    {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setVideoOff(!videoOff)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      videoOff ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={videoOff ? 'Start Video' : 'Stop Video'}
                  >
                    {videoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleScreenShare}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      screenSharing ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Share Screen"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setInMeeting(false);
                      stopCamera();
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>{isAr ? 'مغادرة' : 'Leave'}</span>
                  </button>
                </div>
              </div>

              {/* Video Grid Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-52">
                {/* Local Video Tile */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
                  {!videoOff ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <VideoOff className="w-8 h-8" />
                      <span className="text-xs">{isAr ? 'الكاميرا معطلة' : 'Camera Off'}</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 start-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold">
                    {isAr ? 'أنت (محلي)' : 'You (Local)'}
                  </div>
                </div>

                {/* Remote Participant Simulation */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-lg">
                    SM
                  </div>
                  <div className="absolute bottom-2 start-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold">
                    سارة أحمد (Sarah Miller)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 group">
                <div className={`w-9 h-9 rounded-xl ${msg.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                  {msg.sender.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900">{msg.sender}</span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl rounded-ss-xs border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed max-w-2xl">
                    {msg.text}

                    {msg.attachment && (
                      <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-slate-800">{msg.attachment.name}</span>
                          <span className="text-[10px] text-slate-400">({msg.attachment.size})</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {isAr ? 'مرفق' : 'Attachment'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input & Attachments Composer */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            {attachedFile && (
              <div className="mb-2 p-2 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-indigo-900">{attachedFile.name}</span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition cursor-pointer"
                  title={isAr ? 'إرفاق ملف أو صورة' : 'Attach file'}
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-full mb-2 start-0 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 text-xs w-48 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFile({ name: 'مستند_استراتيجية_SNNS.docx', size: '142 KB', type: 'file' });
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-start px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isAr ? 'إرفاق مستند SNNS' : 'SNNS Doc'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFile({ name: 'لقطة_شاشة_المنظومة.png', size: '1.2 MB', type: 'image' });
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-start px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'إرفاق صورة أو رسمة' : 'Attach Image'}</span>
                    </button>
                  </div>
                )}
              </div>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  isAr
                    ? `أرسل رسالة إلى ${activeDm || `#${activeChannel}`}...`
                    : `Type a message to ${activeDm || `#${activeChannel}`}...`
                }
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />

              <button
                type="submit"
                disabled={!inputVal.trim() && !attachedFile}
                className="p-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
