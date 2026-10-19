import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Video,
  Mic,
  Users,
  Copy,
  Check,
  Plus,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Globe,
  Radio,
  Clock,
  ExternalLink,
  Lock,
  Headphones,
  UserPlus,
} from 'lucide-react';
import { SnnsCallRoom } from './SnnsCallRoom';
import { storage } from '../../services/storage';

interface SnnsCallsAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

const FREQUENT_CONTACTS = [
  { name: 'الإدارة العامة', email: 'admin@snns.pro', role: 'HQ Support' },
  { name: 'م. عبد الرحمن السبيعي', email: 'a@snns.pro', role: 'Super Admin' },
  { name: 'هتاف أونلاين', email: 'htaf@snns.pro', role: 'Productivity' },
  { name: 'سارة المنصور', email: 'sarah.almansoor@snns.pro', role: 'Education Lead' },
];

export const SnnsCallsApp: React.FC<SnnsCallsAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const currentUser = storage.getUserProfile();

  // Active Call State
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState('');
  const [createdRoomInfo, setCreatedRoomInfo] = useState<{
    roomName: string;
    callUrl: string;
    snnsSiteUrl: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<any>(null);

  // Fetch Calls Subsystem Status
  useEffect(() => {
    fetch('/api/calls/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setServerStatus(data);
      })
      .catch(() => {});
  }, []);

  // 1. Create Instant Call Room
  const handleStartInstantCall = async (customName?: string) => {
    setIsCreating(true);
    setErrorMsg(null);

    const nameToUse = customName || customRoomInput.trim() || `snns-meeting-${Date.now().toString().slice(-4)}`;

    try {
      const res = await fetch('/api/calls/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: nameToUse,
          expiryMinutes: 120, // 2 hours validity
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedRoomInfo({
          roomName: data.roomName,
          callUrl: data.callUrl,
          snnsSiteUrl: data.snnsSiteUrl || `https://snns.site/call/${data.roomName}`,
        });
        setActiveRoomName(data.roomName);
      } else {
        setErrorMsg(data.error || (isAr ? 'فشل إنشاء الغرفة' : 'Failed to create room'));
      }
    } catch {
      // Offline / Resilient fallback
      const fallbackName = nameToUse;
      setCreatedRoomInfo({
        roomName: fallbackName,
        callUrl: `https://snns.daily.co/${fallbackName}`,
        snnsSiteUrl: `https://snns.site/call/${fallbackName}`,
      });
      setActiveRoomName(fallbackName);
    } finally {
      setIsCreating(false);
    }
  };

  const copyInvite = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // If in active call, render full screen call room
  if (activeRoomName) {
    return (
      <SnnsCallRoom
        roomName={activeRoomName}
        userDisplayName={currentUser.name || 'مستخدم SNNS'}
        onLeave={() => setActiveRoomName(null)}
        lang={lang}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
            title={isAr ? 'العودة' : 'Back'}
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <PhoneCall className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-white">
                {isAr ? 'اتصال بأحبابك (SNNS Calls & Meetings)' : 'SNNS Calls & Meetings'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                SNNS.SITE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr ? 'منصة اتصالات ومكالمات WebRTC مشفرة وعالية الدقة' : 'Secure WebRTC HD Video & Voice Conferencing'}
            </p>
          </div>
        </div>

        {/* Server & Domain Routing Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-emerald-300">snns.site</span>
            <span>(WebRTC Live)</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Hero Quick Launch Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 end-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'مكالمات مرئية وصوتية ومشاركة شاشة بدقة HD' : 'Instant HD Video, Voice & Screen Share'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {isAr ? 'تواصل فورياً وبأعلى خصوصية عبر مسار snns.site' : 'Connect instantly with high privacy via snns.site'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'أنشئ غرفة اتصال آمنة بنقرة واحدة، وشارك الرابط مع أي شخص من فريقك أو عائلتك لينضم عبر أي متصفح دون الحاجة لتحميل تطبيقات إضافية.'
                : 'Start a secure meeting with one click. Share the room link for instant browser-based connection.'}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleStartInstantCall()}
                disabled={isCreating}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                <span>{isCreating ? (isAr ? 'جارِ تهيئة الغرفة...' : 'Creating room...') : (isAr ? 'بدء مكالمة فورية الآن' : 'Start Instant Call')}</span>
              </button>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isAr ? 'اسم الغرفة أو الكود...' : 'Room name or code...'}
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 min-w-[160px] sm:min-w-[190px]"
                />
                <button
                  onClick={() => handleStartInstantCall()}
                  disabled={isCreating}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  {isAr ? 'انضمام' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid: Communication & Routing Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-white mb-1">
              {isAr ? 'تكامل النطاقات (DNS Routing)' : 'DNS & Routing'}
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'النطاق SNNS.PRO يدير الهوية والبريد، والنطاق SNNS.SITE مخصص لخوادم WebRTC والبث المباشر.'
                : 'SNNS.PRO hosts identity & mail, while SNNS.SITE routes WebRTC video meetings.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-white mb-1">
              {isAr ? 'تشفير وميزات كاملة' : 'Encrypted & Feature Rich'}
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'دعم مشاركة الشاشة، كتم وتشغيل المايك والكاميرا، شات فوري داخل المكالمة وبدون حد زمني مزعج.'
                : 'Screen sharing, audio/video toggle, in-call chat, and reliable WebRTC uptime.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Copy className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-white mb-1">
              {isAr ? 'رابط دعوة سريع ومباشر' : 'Instant Invite Link'}
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'يولد النظام رابطاً منسقاً snns.site/call/:roomName لنسخه ومشاركته عبر واتساب أو البريد.'
                : 'Generates clean shareable URL https://snns.site/call/:name for teammates.'}
            </p>
          </div>
        </div>

        {/* Quick Call Direct Contacts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs text-white">
                {isAr ? 'اتصال سريع بجهات الاتصال المعتمدة (@snns.pro)' : 'Quick Call Verified Teammates'}
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">WebRTC Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FREQUENT_CONTACTS.map((c) => (
              <div
                key={c.email}
                className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-2 hover:border-emerald-500/50 transition group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{c.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono truncate">{c.email}</p>
                  <span className="text-[9px] text-slate-500">{c.role}</span>
                </div>

                <button
                  onClick={() => handleStartInstantCall(`call-with-${c.email.split('@')[0]}`)}
                  className="p-2 bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-400 group-hover:text-slate-950 rounded-xl transition cursor-pointer shrink-0"
                  title={isAr ? `اتصال بـ ${c.name}` : `Call ${c.name}`}
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SnnsCallsApp;
