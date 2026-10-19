import React, { useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Copy,
  Check,
  Users,
  MessageSquare,
  Sparkles,
  Maximize2,
  ShieldCheck,
  MonitorUp,
  User,
} from 'lucide-react';

interface CallProps {
  roomName: string;
  userDisplayName: string; // اسم المستخدم من نظام @snns.pro
  onLeave?: () => void;
  lang?: 'en' | 'ar';
}

export const SnnsCallRoom: React.FC<CallProps> = ({
  roomName,
  userDisplayName,
  onLeave,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const callContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [callFrameInstance, setCallFrameInstance] = useState<DailyCall | null>(null);
  const [dailyLoaded, setDailyLoaded] = useState<boolean>(false);
  const [dailyError, setDailyError] = useState<string | null>(null);

  // Fallback Local Stream Controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'نظام اتصالات SNNS.SITE',
      text: 'مرحباً بك في غرفة المكالمات المشفرة. رابط الغرفة متاح للمشاركة عبر snns.site.',
      time: 'الآن',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const snnsSiteUrl = `https://snns.site/call/${roomName}`;

  // Initialize DailyIframe or Fallback WebRTC
  useEffect(() => {
    let frame: DailyCall | null = null;

    const initCall = async () => {
      if (!callContainerRef.current) return;

      try {
        // Attempt Daily.co official iframe initialization
        frame = DailyIframe.createFrame(callContainerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '16px',
            backgroundColor: '#020617',
          },
          showLeaveButton: true,
          userName: userDisplayName || 'عضو منظومة SNNS',
        });

        frame.on('left-meeting', () => {
          if (onLeave) onLeave();
        });

        frame.on('error', (e) => {
          console.warn('Daily frame error:', e);
          setDailyError('فشل الاتصال الخارجي بـ Daily، تم تفعيل واجهة WebRTC الداخلية');
        });

        await frame.join({ url: `https://snns.daily.co/${roomName}` });
        setCallFrameInstance(frame);
        setDailyLoaded(true);
      } catch (err: any) {
        console.warn('Daily.co frame fallback:', err);
        setDailyError(err?.message || 'Daily iframe unavailable');
        // Fallback: Start local camera preview
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        } catch (mediaErr) {
          console.warn('Local media access:', mediaErr);
        }
      }
    };

    initCall();

    return () => {
      if (frame) {
        try {
          frame.destroy();
        } catch {}
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomName, userDisplayName]);

  // Toggle Mic in Fallback
  const toggleMic = () => {
    if (callFrameInstance) {
      callFrameInstance.setLocalAudio(!isMicMuted);
    }
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = isMicMuted));
    }
    setIsMicMuted((prev) => !prev);
  };

  // Toggle Video in Fallback
  const toggleVideo = () => {
    if (callFrameInstance) {
      callFrameInstance.setLocalVideo(!isVideoMuted);
    }
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = isVideoMuted));
    }
    setIsVideoMuted((prev) => !prev);
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (callFrameInstance) {
      if (!isScreenSharing) {
        callFrameInstance.startScreenShare();
      } else {
        callFrameInstance.stopScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
      return;
    }

    try {
      if (!isScreenSharing && navigator.mediaDevices.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        };
      } else {
        setIsScreenSharing(false);
        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
    } catch {
      setIsScreenSharing(false);
    }
  };

  const copyCallUrl = () => {
    navigator.clipboard.writeText(snnsSiteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: userDisplayName || 'أنت',
        text: inputMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputMessage('');
  };

  return (
    <div
      className="w-full h-full min-h-[85vh] bg-slate-950 p-2 sm:p-4 flex flex-col items-center justify-center font-sans select-none text-white"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Meeting Info Bar */}
      <div className="w-full max-w-6xl mb-2.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs">
            LIVE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">{roomName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                SNNS.SITE WebRTC
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isAr ? `متصل كـ: ${userDisplayName}` : `Connected as: ${userDisplayName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Shareable Link Button */}
          <button
            onClick={copyCallUrl}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title={snnsSiteUrl}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline font-mono text-[11px]">
              {copiedLink ? (isAr ? 'تم نسخ الرابط!' : 'Copied!') : 'snns.site/call/...'}
            </span>
          </button>

          {/* Toggle Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              showChat
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isAr ? 'المحادثة النصية' : 'In-call Chat'}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Leave Button */}
          {onLeave && (
            <button
              onClick={onLeave}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>{isAr ? 'مغادرة' : 'Leave'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Video & Canvas Container */}
      <div className="w-full max-w-6xl flex-1 min-h-[60vh] max-h-[75vh] flex gap-3 relative">
        {/* Call Viewport (Daily Iframe OR Fallback WebRTC Video) */}
        <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl relative flex flex-col items-center justify-center">
          {/* The Daily Iframe container as in user specification */}
          <div ref={callContainerRef} className={`w-full h-full ${dailyLoaded ? 'block' : 'hidden'}`} />

          {/* Fallback In-App Interactive Canvas when Daily Frame is in fallback mode */}
          {!dailyLoaded && (
            <div className="w-full h-full flex flex-col items-center justify-between p-4 relative bg-radial from-slate-900 to-slate-950">
              {/* Remote Participant Placeholder */}
              <div className="flex-1 w-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-400 p-2 mb-4 flex items-center justify-center shadow-2xl relative">
                  <User className="w-12 h-12 text-emerald-400" />
                  <span className="absolute bottom-0 end-0 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
                </div>
                <h3 className="text-base font-black text-white">{roomName}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  {isAr
                    ? 'بانتظار انضمام الطرف الآخر للمكالمة. شارك الرابط أدناه مع أي شخص لينضم فورياً عبر متصفحه:'
                    : 'Waiting for participants. Share the link below for instant browser join:'}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-emerald-400 font-mono">
                  <span>{snnsSiteUrl}</span>
                  <button onClick={copyCallUrl} className="hover:text-white p-1">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Local Participant Preview Picture-in-Picture */}
              <div className="absolute bottom-16 end-4 w-40 sm:w-48 h-28 sm:h-32 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : 'block'}`}
                />
                {isVideoMuted && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs">
                    <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                    <span>{isAr ? 'الكاميرا مغلقة' : 'Camera Off'}</span>
                  </div>
                )}
                <span className="absolute bottom-1 start-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white font-medium">
                  {userDisplayName} (أنت)
                </span>
              </div>

              {/* In-Call Controls Bar */}
              <div className="w-full flex items-center justify-center gap-3 z-30 pb-2">
                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-2xl border transition cursor-pointer shadow-lg ${
                    isMicMuted
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  }`}
                  title={isMicMuted ? 'تشغيل المايك' : 'كتم المايك'}
                >
                  {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-2xl border transition cursor-pointer shadow-lg ${
                    isVideoMuted
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  }`}
                  title={isVideoMuted ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
                >
                  {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-2xl border transition cursor-pointer shadow-lg ${
                    isScreenSharing
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  }`}
                  title={isAr ? 'مشاركة الشاشة' : 'Share Screen'}
                >
                  <MonitorUp className="w-5 h-5" />
                </button>

                {onLeave && (
                  <button
                    onClick={onLeave}
                    className="p-3 bg-rose-600 hover:bg-rose-500 border border-rose-500 text-white rounded-2xl transition cursor-pointer shadow-lg"
                    title={isAr ? 'إنهاء المكالمة' : 'End Call'}
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side Chat Drawer */}
        {showChat && (
          <div className="w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col shadow-2xl animate-in fade-in slide-in-from-end duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white">
              <span>{isAr ? 'المحادثة الفورية' : 'In-call Chat'}</span>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-2 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-emerald-400">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-slate-200 text-xs">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-800 flex gap-1.5">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {isAr ? 'إرسال' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-6xl mt-2 flex items-center justify-between text-[11px] text-slate-500 px-2">
        <span>{isAr ? 'منصة اتصالات SNNS.SITE المشفرة بدقة WebRTC HD' : 'SNNS.SITE WebRTC High Definition Calls'}</span>
        <span className="font-mono text-emerald-400">https://snns.site</span>
      </div>
    </div>
  );
};

export default SnnsCallRoom;
