import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ArrowLeft,
  Check,
  Disc,
  Headphones,
  Settings,
  Scissors,
  Music,
  Plus,
  Square,
  HelpCircle,
  Film,
} from 'lucide-react';

interface RodeCasterConsoleProps {
  lang: 'en' | 'ar';
  videoUrl?: string;
  videoTitle?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  videoVolume?: number;
  onChangeVideoVolume?: (vol: number) => void;
  onAddAudioTrack?: (name: string, duration: number, soundType: string) => void;
  onBackToEditor?: () => void;
}

interface ChannelState {
  id: string;
  nameAr: string;
  nameEn: string;
  type: string;
  color: string;
  level: number; // 0 to 100 (fader position)
  isMuted: boolean;
  isSolo: boolean;
  vuLeft: number; // 0 to 100
  vuRight: number; // 0 to 100
}

interface SoundPad {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  soundType: string;
  color: string;
  activeColor: string;
  duration: number; // seconds
}

export const RodeCasterConsole: React.FC<RodeCasterConsoleProps> = ({
  lang,
  videoUrl,
  videoTitle = 'SNNS Video Project',
  isPlaying = false,
  onTogglePlay,
  videoVolume = 85,
  onChangeVideoVolume,
  onAddAudioTrack,
  onBackToEditor,
}) => {
  const isAr = lang === 'ar';

  // Master Volume Knob (0 to 100)
  const [masterVolume, setMasterVolume] = useState<number>(88);
  // Headphone levels (HP1 to HP4)
  const [hp1, setHp1] = useState<number>(75);
  const [hp2, setHp2] = useState<number>(70);
  const [hp3, setHp3] = useState<number>(65);
  const [hp4, setHp4] = useState<number>(60);

  // Recording State (Big Red Button)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recTimer, setRecTimer] = useState<number>(15 * 60 + 3); // 00:15:03 default like in photo
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedAudioChunks = useRef<Blob[]>([]);

  // Sound Pad Banks: 'A' (SFX) or 'B' (Voice FX & Jingles)
  const [padBank, setPadBank] = useState<'A' | 'B'>('A');
  const [activePadId, setActivePadId] = useState<string | null>(null);

  // FX Processing Toggles on Touchscreen
  const [activeFx, setActiveFx] = useState<{
    reverb: boolean;
    echo: boolean;
    pitch: boolean;
    robot: boolean;
    megaphone: boolean;
    censor: boolean;
  }>({
    reverb: false,
    echo: false,
    pitch: false,
    robot: false,
    megaphone: false,
    censor: false,
  });

  // 6 Physical Faders State
  const [channels, setChannels] = useState<ChannelState[]>([
    {
      id: 'ch1',
      nameAr: 'مايك 1 (المقدم)',
      nameEn: 'Mic 1 (Host)',
      type: 'mic',
      color: '#FF2E93', // Hot Magenta
      level: 82,
      isMuted: false,
      isSolo: false,
      vuLeft: 65,
      vuRight: 62,
    },
    {
      id: 'ch2',
      nameAr: 'مايك 2 (الضيف)',
      nameEn: 'Mic 2 (Guest)',
      type: 'mic',
      color: '#22C55E', // Green
      level: 78,
      isMuted: false,
      isSolo: false,
      vuLeft: 45,
      vuRight: 48,
    },
    {
      id: 'ch3',
      nameAr: 'صوت الفيديو',
      nameEn: 'Video Audio',
      type: 'video',
      color: '#06B6D4', // Cyan
      level: videoVolume,
      isMuted: false,
      isSolo: false,
      vuLeft: isPlaying ? 75 : 0,
      vuRight: isPlaying ? 78 : 0,
    },
    {
      id: 'ch4',
      nameAr: 'بلوتوث / هاتف',
      nameEn: 'Bluetooth / Phone',
      type: 'bluetooth',
      color: '#F59E0B', // Amber
      level: 60,
      isMuted: false,
      isSolo: false,
      vuLeft: 30,
      vuRight: 32,
    },
    {
      id: 'ch5',
      nameAr: 'نظام USB وسائط',
      nameEn: 'USB System',
      type: 'usb',
      color: '#3B82F6', // Blue
      level: 70,
      isMuted: false,
      isSolo: false,
      vuLeft: 50,
      vuRight: 52,
    },
    {
      id: 'ch6',
      nameAr: 'المؤثرات والبادز',
      nameEn: 'Sound Pads',
      type: 'pads',
      color: '#EF4444', // Red
      level: 85,
      isMuted: false,
      isSolo: false,
      vuLeft: 20,
      vuRight: 20,
    },
  ]);

  // Sync Video Audio Fader with videoVolume prop
  useEffect(() => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === 'ch3' ? { ...ch, level: videoVolume } : ch))
    );
  }, [videoVolume]);

  // Toast feedback
  const [toastText, setToastText] = useState<string | null>(null);
  const showConsoleToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  // Real Web Audio Synthesizer
  const playSoundEffect = (soundType: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (soundType === 'bleep') {
        // 1000 Hz Censor Bleep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
      } else if (soundType === 'horn') {
        // Triple Brass Air Horn Fanfare
        [440, 554, 659, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(freq * 1.03, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.03);
          osc.stop(ctx.currentTime + 0.75);
        });
      } else if (soundType === 'drum') {
        // Drum Roll & Cymbal Crash
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
      } else if (soundType === 'impact') {
        // Dramatic Cinematic Boom & Whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(95, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.95);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.95);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.95);
      } else if (soundType === 'applause') {
        // Applause Noise Burst Simulation
        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250 + Math.random() * 500, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.4);
        }
      } else if (soundType === 'laugh') {
        // Laughter Staccato Modulation
        [320, 390, 440, 380, 410, 350].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.1);
        });
      } else if (soundType === 'ding') {
        // Chime Bell Bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.9);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.9);
      } else if (soundType === 'robot') {
        // Robot Ring Modulation
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }

      // Briefly bump Pad channel VU meter
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === 'ch6'
            ? { ...ch, vuLeft: 88, vuRight: 84 }
            : ch
        )
      );
      setTimeout(() => {
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === 'ch6'
              ? { ...ch, vuLeft: 20, vuRight: 20 }
              : ch
          )
        );
      }, 700);
    } catch (e) {
      console.error('Audio synth error:', e);
    }
  };

  // 8 SMART Sound Pads Definition (Bank A & Bank B)
  const soundPadsBankA: SoundPad[] = [
    {
      id: 'pad-1',
      nameAr: 'تصفيق وتشجيع',
      nameEn: 'Applause & Cheers',
      icon: '👏',
      soundType: 'applause',
      color: '#FF6B8B', // Soft Rose Pink
      activeColor: '#FF2E63',
      duration: 3,
    },
    {
      id: 'pad-2',
      nameAr: 'ضحك جمهور',
      nameEn: 'Laugh Track',
      icon: '😂',
      soundType: 'laugh',
      color: '#FFA366', // Peach Amber
      activeColor: '#FF7700',
      duration: 3,
    },
    {
      id: 'pad-3',
      nameAr: 'بوق الحماس',
      nameEn: 'Air Horn Fanfare',
      icon: '🎺',
      soundType: 'horn',
      color: '#FFDF59', // Electric Yellow
      activeColor: '#FFC800',
      duration: 2,
    },
    {
      id: 'pad-4',
      nameAr: 'قرع طبول',
      nameEn: 'Drum Roll & Crash',
      icon: '🥁',
      soundType: 'drum',
      color: '#5EEAD4', // Mint Cyan
      activeColor: '#14B8A6',
      duration: 3,
    },
    {
      id: 'pad-5',
      nameAr: 'صدمة درامية',
      nameEn: 'Dramatic Whoosh',
      icon: '⚡',
      soundType: 'impact',
      color: '#60A5FA', // Sky Blue
      activeColor: '#2563EB',
      duration: 3,
    },
    {
      id: 'pad-6',
      nameAr: 'صفارة الرقابة',
      nameEn: 'Censor Bleep 1kHz',
      icon: '🤫',
      soundType: 'bleep',
      color: '#A78BFA', // Soft Purple
      activeColor: '#7C3AED',
      duration: 2,
    },
    {
      id: 'pad-7',
      nameAr: 'رنين النجاح',
      nameEn: 'Success Ding',
      icon: '🔔',
      soundType: 'ding',
      color: '#818CF8', // Indigo Lavender
      activeColor: '#4F46E5',
      duration: 2,
    },
    {
      id: 'pad-8',
      nameAr: 'صوت روبوت',
      nameEn: 'Robot Voice FX',
      icon: '🤖',
      soundType: 'robot',
      color: '#F472B6', // Hot Magenta
      activeColor: '#DB2777',
      duration: 2,
    },
  ];

  const soundPadsBankB: SoundPad[] = [
    {
      id: 'pad-b1',
      nameAr: 'جرس البث المباشر',
      nameEn: 'Broadcast Bell',
      icon: '🛎️',
      soundType: 'ding',
      color: '#F87171',
      activeColor: '#DC2626',
      duration: 2,
    },
    {
      id: 'pad-b2',
      nameAr: 'صوت صدمة',
      nameEn: 'Bass Drop',
      icon: '💣',
      soundType: 'impact',
      color: '#FB923C',
      activeColor: '#EA580C',
      duration: 3,
    },
    {
      id: 'pad-b3',
      nameAr: 'صفارة حكم',
      nameEn: 'Whistle',
      icon: '📯',
      soundType: 'horn',
      color: '#FACC15',
      activeColor: '#CA8A04',
      duration: 2,
    },
    {
      id: 'pad-b4',
      nameAr: 'سحر ولمعان',
      nameEn: 'Magic Shimmer',
      icon: '✨',
      soundType: 'ding',
      color: '#4ADE80',
      activeColor: '#16A34A',
      duration: 3,
    },
    {
      id: 'pad-b5',
      nameAr: 'تصفيق هادئ',
      nameEn: 'Light Applause',
      icon: '👏',
      soundType: 'applause',
      color: '#38BDF8',
      activeColor: '#0284C7',
      duration: 2,
    },
    {
      id: 'pad-b6',
      nameAr: 'تشويش إذاعي',
      nameEn: 'Radio Static',
      icon: '📻',
      soundType: 'robot',
      color: '#C084FC',
      activeColor: '#9333EA',
      duration: 2,
    },
    {
      id: 'pad-b7',
      nameAr: 'ضحكة خفيفة',
      nameEn: 'Chuckles',
      icon: '😄',
      soundType: 'laugh',
      color: '#E879F9',
      activeColor: '#C026D3',
      duration: 2,
    },
    {
      id: 'pad-b8',
      nameAr: 'إنذار وتنبيه',
      nameEn: 'Alert Tone',
      icon: '🚨',
      soundType: 'bleep',
      color: '#FB7185',
      activeColor: '#E11D48',
      duration: 2,
    },
  ];

  const currentPads = padBank === 'A' ? soundPadsBankA : soundPadsBankB;

  // Handle Triggering a Sound Pad
  const handleTriggerPad = (pad: SoundPad) => {
    setActivePadId(pad.id);
    playSoundEffect(pad.soundType);

    showConsoleToast(
      isAr
        ? `🎛️ تم تشغيل مؤثر "${pad.nameAr}" عبر كونسول RØDECaster`
        : `Triggered "${pad.nameEn}" on RØDECaster`
    );

    setTimeout(() => {
      setActivePadId((prev) => (prev === pad.id ? null : prev));
    }, 450);
  };

  // Add Pad to Video Timeline
  const handleAddPadToTimeline = (pad: SoundPad, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddAudioTrack) {
      onAddAudioTrack(pad.nameAr, pad.duration, pad.soundType);
      showConsoleToast(
        isAr
          ? `تم إدراج مؤثّر "${pad.nameAr}" في المسار الصوتي للفيديو 🎬`
          : `Added "${pad.nameEn}" to timeline track!`
      );
    }
  };

  // Handle Channel Fader Level Change
  const handleFaderChange = (channelId: string, newLevel: number) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, level: newLevel } : ch))
    );
    if (channelId === 'ch3' && onChangeVideoVolume) {
      onChangeVideoVolume(newLevel);
    }
  };

  // Handle Mute Channel
  const handleToggleMute = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === channelId) {
          const updatedMuted = !ch.isMuted;
          if (channelId === 'ch3' && onChangeVideoVolume) {
            onChangeVideoVolume(updatedMuted ? 0 : ch.level);
          }
          return { ...ch, isMuted: updatedMuted };
        }
        return ch;
      })
    );
  };

  // Handle Solo Channel
  const handleToggleSolo = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, isSolo: !ch.isSolo } : ch))
    );
  };

  // Dynamic Animated VU Level Meters
  useEffect(() => {
    const interval = setInterval(() => {
      setChannels((prev) =>
        prev.map((ch) => {
          if (ch.isMuted) {
            return { ...ch, vuLeft: 0, vuRight: 0 };
          }
          if (ch.id === 'ch3' && !isPlaying) {
            return { ...ch, vuLeft: 0, vuRight: 0 };
          }
          // Dynamic jitter around channel level
          const base = (ch.level / 100) * 80;
          const jitter1 = Math.sin(Date.now() / 200 + ch.level) * 12 + Math.random() * 8;
          const jitter2 = Math.cos(Date.now() / 200 + ch.level) * 12 + Math.random() * 8;
          const left = Math.min(98, Math.max(0, Math.round(base + jitter1)));
          const right = Math.min(98, Math.max(0, Math.round(base + jitter2)));
          return { ...ch, vuLeft: left, vuRight: right };
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Big Red Record Button Handler (Real Mic Recording)
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      showConsoleToast(
        isAr ? 'تم إيقاف التسجيل الصوتي وحفظ التراك!' : 'Voice recording saved!'
      );
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        recordedAudioChunks.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedAudioChunks.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(recordedAudioChunks.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          if (onAddAudioTrack) {
            onAddAudioTrack(
              isAr ? 'تسجيل مايك RØDECaster' : 'RØDECaster Live Mic',
              15,
              'voice'
            );
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        showConsoleToast(
          isAr
            ? '🔴 جاري التسجيل الحي عبر المايك في كونسول RØDECaster...'
            : '🔴 Recording live mic on RØDECaster...'
        );
      } catch (err) {
        // Fallback simulated record
        setIsRecording(true);
        showConsoleToast(
          isAr
            ? '🔴 بدأ تسجيل الاستوديو المباشر (وضع المحاكاة المباشرة)'
            : '🔴 Live Broadcast Recording active'
        );
      }
    }
  };

  // Timer tick for recording
  useEffect(() => {
    let t: any = null;
    if (isRecording) {
      t = setInterval(() => {
        setRecTimer((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex-1 bg-[#0B0C0E] text-slate-100 flex flex-col overflow-y-auto p-3 sm:p-6 select-none font-sans"
    >
      {/* Top Header Navigation & Integration Bar */}
      <div className="max-w-6xl w-full mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#16181D] px-4 sm:px-6 py-3 rounded-2xl border border-zinc-800 shadow-md">
        <div className="flex items-center gap-3">
          {onBackToEditor && (
            <button
              onClick={onBackToEditor}
              className="p-2 hover:bg-white/10 rounded-xl text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              <span>{isAr ? 'العودة لمحرر الفيديو' : 'Back to Editor'}</span>
            </button>
          )}

          <div className="w-px h-5 bg-zinc-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-sm tracking-wider font-mono">
              RØDE
            </span>
            <span className="text-white font-black text-sm">
              {isAr ? 'كونسول RØDECaster Pro II الصوتي' : 'RØDECaster Pro II Studio'}
            </span>
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              APHEX® REVOLUTION
            </span>
          </div>
        </div>

        {/* Video Sync Player Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[180px] font-medium text-zinc-200">{videoTitle}</span>
          </div>

          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-black'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? (isAr ? 'إيقاف الفيديو' : 'Pause Video') : isAr ? 'تشغيل الفيديو' : 'Play Video'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>48kHz / 24-bit</span>
          </div>
        </div>
      </div>

      {/* Floating Action Notice Toast */}
      {toastText && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-[#16181D] text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-amber-400/50 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastText}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* THE PHYSICAL RØDECASTER PRO II CONSOLE REPRODUCTION */}
      {/* ======================================================== */}
      <div className="max-w-6xl w-full mx-auto bg-gradient-to-b from-[#1C1E24] via-[#141519] to-[#0E0F12] rounded-[32px] p-5 sm:p-7 border border-[#2D3039] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden">
        {/* Subtle Metallic Corner Highlights */}
        <div className="absolute top-0 start-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 end-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* ---------------------------------------------------- */}
        {/* UPPER CONSOLE: Big REC Button | Touchscreen | Knobs */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center mb-6">
          {/* 1. Left: Branding & Big Tactile REC Button (Col 1-2) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 rounded-2xl bg-[#16181E] border border-zinc-800/80 shadow-inner space-y-3">
            <div className="text-center">
              <span className="text-white font-black text-xl tracking-wider font-mono">
                RØDE
              </span>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                Microphones
              </div>
            </div>

            {/* Big Round Tactile REC Button */}
            <button
              onClick={handleToggleRecord}
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition shadow-2xl relative group cursor-pointer ${
                isRecording
                  ? 'bg-red-600 ring-4 ring-red-400/50 shadow-[0_0_35px_rgba(239,68,68,0.8)] scale-95'
                  : 'bg-gradient-to-b from-[#2A1010] to-[#160808] border-2 border-red-700/60 hover:border-red-500 shadow-md'
              }`}
            >
              {/* Outer Illuminated Ring */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center transition ${
                  isRecording
                    ? 'bg-red-500 animate-pulse text-white'
                    : 'bg-gradient-to-b from-[#B91C1C] to-[#7F1D1D] text-red-200 group-hover:scale-105'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white mb-1 ${isRecording ? 'animate-ping' : ''}`} />
                <span className="text-[10px] font-black tracking-widest uppercase">REC</span>
              </div>
            </button>
            <span className="text-[10px] font-bold text-zinc-400">
              {isRecording ? (isAr ? 'جاري التسجيل...' : 'Recording Live') : isAr ? 'تسجيل مايك' : 'Master REC'}
            </span>
          </div>

          {/* 2. Center: Large Touchscreen Display with Live VU Meters & FX (Col 3-9) */}
          <div className="lg:col-span-7 bg-[#0A0B0E] rounded-2xl p-4 border-2 border-zinc-800 shadow-[inset_0_3px_10px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col justify-between min-h-[190px]">
            {/* Screen Top Status Bar */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-3 text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-red-600'}`} />
                  <span>REC {formatTimer(recTimer)}</span>
                </span>
                <span className="text-zinc-500 hidden sm:inline">•</span>
                <span className="text-zinc-400 hidden sm:inline">128 GB MicroSD</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">● ONLINE</span>
                <Settings className="w-3.5 h-3.5 text-zinc-500 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Live Segmented VU Level Meters (6 Channels) */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {channels.map((ch, idx) => (
                <div key={ch.id} className="flex flex-col items-center">
                  <div className="w-full bg-[#12141A] rounded-lg p-1.5 border border-zinc-800/80 flex justify-center gap-1 h-20 items-end relative overflow-hidden">
                    {/* Left Channel Bar */}
                    <div className="w-2 bg-zinc-900 rounded-xs h-full flex flex-col justify-end overflow-hidden">
                      <div
                        style={{ height: `${ch.vuLeft}%` }}
                        className={`w-full transition-all duration-75 rounded-xs ${
                          ch.vuLeft > 88
                            ? 'bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500'
                            : ch.vuLeft > 70
                            ? 'bg-gradient-to-t from-emerald-500 to-amber-400'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    {/* Right Channel Bar */}
                    <div className="w-2 bg-zinc-900 rounded-xs h-full flex flex-col justify-end overflow-hidden">
                      <div
                        style={{ height: `${ch.vuRight}%` }}
                        className={`w-full transition-all duration-75 rounded-xs ${
                          ch.vuRight > 88
                            ? 'bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500'
                            : ch.vuRight > 70
                            ? 'bg-gradient-to-t from-emerald-500 to-amber-400'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Channel Label with Matching Color Tag */}
                  <span
                    style={{ color: ch.color }}
                    className="text-[10px] font-black font-mono mt-1"
                  >
                    {idx === 0
                      ? '1'
                      : idx === 1
                      ? '2'
                      : idx === 2
                      ? 'VID'
                      : idx === 3
                      ? 'BT'
                      : idx === 4
                      ? 'USB'
                      : 'PAD'}
                  </span>
                </div>
              ))}
            </div>

            {/* Screen Bottom: Touchscreen Audio Effects Shortcuts */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1 overflow-x-auto">
              {[
                { key: 'reverb', labelAr: 'Reverb (صدى)', labelEn: 'Reverb' },
                { key: 'echo', labelAr: 'Echo (تكرار)', labelEn: 'Echo' },
                { key: 'pitch', labelAr: 'Pitch (طبقة)', labelEn: 'Pitch' },
                { key: 'robot', labelAr: 'Robot (روبوت)', labelEn: 'Robot' },
                { key: 'megaphone', labelAr: 'Megaphone', labelEn: 'Megaphone' },
                { key: 'censor', labelAr: 'Censor (حجب)', labelEn: 'Censor' },
              ].map((fx) => {
                const isActive = (activeFx as any)[fx.key];
                return (
                  <button
                    key={fx.key}
                    onClick={() => {
                      setActiveFx((prev) => ({
                        ...prev,
                        [fx.key]: !(prev as any)[fx.key],
                      }));
                      if (fx.key === 'censor') playSoundEffect('bleep');
                      if (fx.key === 'robot') playSoundEffect('robot');
                      showConsoleToast(
                        isAr
                          ? `تم ${!isActive ? 'تفعيل' : 'تعطيل'} مؤثر ${fx.labelAr}`
                          : `${!isActive ? 'Enabled' : 'Disabled'} ${fx.labelEn}`
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-black shadow-xs'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span>{isAr ? fx.labelAr : fx.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Right: Headphone Knobs & Master Rotary Encoder (Col 10-12) */}
          <div className="lg:col-span-3 bg-[#16181E] rounded-2xl p-4 border border-zinc-800/80 flex flex-col justify-between space-y-4">
            {/* 4 Headphone Output Dials with colored rings */}
            <div>
              <div className="text-[10px] font-black uppercase text-zinc-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Headphones className="w-3 h-3 text-cyan-400" />
                  <span>{isAr ? 'مخارج السماعات (HP)' : 'Headphones'}</span>
                </span>
                <span className="font-mono text-[9px] text-zinc-500">4 CHANNELS</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {/* HP 1 (Host - Magenta) */}
                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hp1}
                    onChange={(e) => setHp1(Number(e.target.value))}
                    className="w-8 h-8 rounded-full accent-[#FF2E93] cursor-pointer"
                    title={`HP 1: ${hp1}%`}
                  />
                  <span className="text-[9px] font-black font-mono text-[#FF2E93] mt-1">1</span>
                </div>

                {/* HP 2 (Guest - Cyan) */}
                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hp2}
                    onChange={(e) => setHp2(Number(e.target.value))}
                    className="w-8 h-8 rounded-full accent-[#06B6D4] cursor-pointer"
                    title={`HP 2: ${hp2}%`}
                  />
                  <span className="text-[9px] font-black font-mono text-[#06B6D4] mt-1">2</span>
                </div>

                {/* HP 3 (Monitor - Green) */}
                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hp3}
                    onChange={(e) => setHp3(Number(e.target.value))}
                    className="w-8 h-8 rounded-full accent-[#22C55E] cursor-pointer"
                    title={`HP 3: ${hp3}%`}
                  />
                  <span className="text-[9px] font-black font-mono text-[#22C55E] mt-1">3</span>
                </div>

                {/* HP 4 (Aux - Orange) */}
                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hp4}
                    onChange={(e) => setHp4(Number(e.target.value))}
                    className="w-8 h-8 rounded-full accent-[#F59E0B] cursor-pointer"
                    title={`HP 4: ${hp4}%`}
                  />
                  <span className="text-[9px] font-black font-mono text-[#F59E0B] mt-1">4</span>
                </div>
              </div>
            </div>

            {/* Large Master Rotary Encoder Dial */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-white block">
                  {isAr ? 'التحكم العام (Master)' : 'Master Output'}
                </span>
                <span className="text-[9px] text-zinc-400 font-mono">
                  Level: {masterVolume}% (+{Math.round((masterVolume / 100) * 6)} dB)
                </span>
              </div>

              {/* Rotary Dial Visual Knob */}
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="w-12 h-12 rounded-full accent-amber-400 cursor-pointer"
                  title={`Master: ${masterVolume}%`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* LOWER CONSOLE: 6 Precision Faders (Left) & 8 SMART Sound Pads (Right) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ============================================== */}
          {/* LEFT: 6 Physical Faders (Cols 1 to 8)           */}
          {/* ============================================== */}
          <div className="lg:col-span-8 bg-[#15171D] rounded-3xl p-5 border border-zinc-800/90 shadow-inner">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800 text-xs text-zinc-400">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'أزرار وقواطع الخلط الستة (Physical Faders)' : '6 Physical Channel Faders'}</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-500">MOTORIZED TOUCH-SENSITIVE</span>
            </div>

            {/* 6 Fader Strips Grid */}
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {channels.map((ch, idx) => {
                return (
                  <div
                    key={ch.id}
                    className="flex flex-col items-center bg-[#0F1014] rounded-2xl p-2 sm:p-2.5 border border-zinc-800/80 shadow-md relative"
                  >
                    {/* Channel Colored Header Button (Top) */}
                    <button
                      style={{ backgroundColor: ch.color }}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow-md mb-2 transition hover:brightness-110 cursor-pointer"
                    >
                      {idx + 1}
                    </button>

                    <div className="text-[10px] sm:text-[11px] font-bold text-zinc-300 text-center truncate w-full mb-2">
                      {isAr ? ch.nameAr.split(' ')[0] : ch.nameEn.split(' ')[0]}
                    </div>

                    {/* Fader Track with dB Scale Markings & Vertical Slider */}
                    <div className="relative h-44 sm:h-52 w-full flex items-center justify-center py-2">
                      {/* dB Scale Marks (Background) */}
                      <div className="absolute inset-y-2 start-1 flex flex-col justify-between text-[8px] font-mono text-zinc-600 select-none pointer-events-none">
                        <span>+6</span>
                        <span>0</span>
                        <span>-10</span>
                        <span>-20</span>
                        <span>-40</span>
                        <span>-∞</span>
                      </div>

                      {/* Vertical Metallic Slot */}
                      <div className="w-2 h-full bg-[#050608] rounded-full border border-zinc-800 shadow-inner relative flex flex-col justify-end">
                        {/* Level bar */}
                        <div
                          style={{ height: `${ch.level}%`, backgroundColor: ch.color }}
                          className="w-full rounded-full opacity-40 transition-all"
                        />
                      </div>

                      {/* Vertical HTML Input Range Slider Styled as Fader Knob */}
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={ch.level}
                        onChange={(e) => handleFaderChange(ch.id, Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                        style={{ WebkitAppearance: 'slider-vertical' as any }}
                      />

                      {/* Tactile White Fader Knob Representation */}
                      <div
                        style={{
                          bottom: `calc(${ch.level}% - 14px)`,
                        }}
                        className="absolute w-7 sm:w-9 h-7 bg-gradient-to-b from-[#FFFFFF] via-[#E4E6EB] to-[#B0B3B8] rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-zinc-400 pointer-events-none transition-all flex items-center justify-center"
                      >
                        {/* Tactile Grip Groove Center Line */}
                        <div className="w-full h-0.5 bg-black/60" />
                      </div>
                    </div>

                    {/* Numeric dB Readout */}
                    <span className="text-[10px] font-mono font-bold text-zinc-400 my-2">
                      {ch.level > 0 ? `${Math.round((ch.level / 100) * 10 - 4)} dB` : '-∞'}
                    </span>

                    {/* Bottom Action Buttons: Solo (Green) & Mute (Red) */}
                    <div className="flex flex-col gap-1.5 w-full pt-1 border-t border-zinc-800">
                      {/* Solo / Listen Button (Green) */}
                      <button
                        onClick={() => handleToggleSolo(ch.id)}
                        className={`w-full py-1 rounded-md text-[9px] font-bold flex items-center justify-center gap-0.5 transition cursor-pointer ${
                          ch.isSolo
                            ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.6)] font-black'
                            : 'bg-[#1A1D24] text-emerald-400/70 hover:text-emerald-300 hover:bg-[#222630]'
                        }`}
                        title="Solo / Listen"
                      >
                        <Headphones className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">SOLO</span>
                      </button>

                      {/* Mute Button (Red) */}
                      <button
                        onClick={() => handleToggleMute(ch.id)}
                        className={`w-full py-1 rounded-md text-[9px] font-bold flex items-center justify-center gap-0.5 transition cursor-pointer ${
                          ch.isMuted
                            ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.7)] font-black'
                            : 'bg-[#1A1D24] text-red-400/70 hover:text-red-300 hover:bg-[#222630]'
                        }`}
                        title="Mute Channel"
                      >
                        <VolumeX className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">MUTE</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================== */}
          {/* RIGHT: 8 SMART Sound Pads Grid (Cols 9 to 12)  */}
          {/* ============================================== */}
          <div className="lg:col-span-4 bg-[#15171D] rounded-3xl p-5 border border-zinc-800/90 shadow-inner flex flex-col justify-between">
            {/* Header: Bank Switcher */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="font-bold text-xs text-white">
                  {isAr ? 'وسائد المؤثرات الصوتية SMART' : '8 SMART Sound Pads'}
                </span>
              </div>

              {/* Bank Pill */}
              <div className="flex items-center gap-1 bg-[#0A0B0E] p-1 rounded-xl border border-zinc-800 text-[10px] font-mono">
                <button
                  onClick={() => setPadBank('A')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                    padBank === 'A' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  BANK A
                </button>
                <button
                  onClick={() => setPadBank('B')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                    padBank === 'B' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  BANK B
                </button>
              </div>
            </div>

            {/* 8 SMART Pads in 4 Rows × 2 Columns (Identical to RØDECaster Layout in photo) */}
            <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
              {currentPads.map((pad) => {
                const isPadActive = activePadId === pad.id;
                return (
                  <div
                    key={pad.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleTriggerPad(pad)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTriggerPad(pad);
                      }
                    }}
                    style={{
                      backgroundColor: isPadActive ? pad.activeColor : pad.color,
                      boxShadow: isPadActive
                        ? `0 0 25px ${pad.activeColor}`
                        : '0 6px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
                    }}
                    className={`h-16 sm:h-18 rounded-2xl p-2 flex flex-col justify-between text-black transition-all transform active:scale-95 cursor-pointer relative group overflow-hidden border border-black/20 select-none ${
                      isPadActive ? 'scale-95' : 'hover:brightness-105'
                    }`}
                  >
                    {/* Top Row: Icon + Add to Timeline Button */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base sm:text-lg">{pad.icon}</span>
                      <button
                        type="button"
                        onClick={(e) => handleAddPadToTimeline(pad, e)}
                        className="px-1.5 py-0.5 bg-black/40 hover:bg-black/80 text-white rounded-md text-[9px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                        title={isAr ? 'إدراج في مسار الفيديو' : 'Add to Video Track'}
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{isAr ? 'تراك' : 'Track'}</span>
                      </button>
                    </div>

                    {/* Bottom Row: Name */}
                    <div className="font-black text-[10px] sm:text-xs text-black/90 truncate text-start">
                      {isAr ? pad.nameAr : pad.nameEn}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Pad Bank Arrows Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 gap-2">
              <button
                onClick={() => setPadBank('A')}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  padBank === 'A'
                    ? 'bg-zinc-800 text-white border-zinc-700'
                    : 'bg-[#0E0F14] text-zinc-500 border-zinc-850 hover:text-white'
                }`}
              >
                <span>&lt;</span>
                <span>BANK A</span>
              </button>

              <button
                onClick={() => setPadBank('B')}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  padBank === 'B'
                    ? 'bg-zinc-800 text-white border-zinc-700'
                    : 'bg-[#0E0F14] text-zinc-500 border-zinc-850 hover:text-white'
                }`}
              >
                <span>BANK B</span>
                <span>&gt;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
