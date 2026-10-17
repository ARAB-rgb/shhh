import React, { useState, useEffect } from 'react';
import { Sparkles, Crown, Image as ImageIcon, Upload, Check, Edit3, X, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

interface RoyalLeadershipBannerProps {
  lang?: 'en' | 'ar';
  className?: string;
}

interface BannerSlot {
  id: 'right' | 'center' | 'left';
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  defaultSrc: string;
  badge?: string;
}

// Built-in presets matching the uploaded user imagery
const PRESETS = [
  {
    id: 'leadership-duo',
    nameAr: 'خادم الحرمين الشريفين وسمو ولي العهد',
    nameEn: 'King Salman & Crown Prince Mohammed bin Salman',
    src: '/assets/images/saudi_leadership.jpg',
    category: 'leadership',
  },
  {
    id: 'saudi-map-flag',
    nameAr: 'خريطة المملكة بالعلم والسيف (راية التوحيد)',
    nameEn: 'Saudi Map with Flag & Sword',
    src: '/assets/images/saudi_map_flag.svg',
    category: 'flag',
  },
  {
    id: 'saudi-flag-waving',
    nameAr: 'العلم السعودي الخفاق شامخاً',
    nameEn: 'Waving Saudi National Flag',
    src: '/assets/images/saudi_flag.jpg',
    category: 'flag',
  },
  {
    id: 'crown-prince-bisht',
    nameAr: 'صاحب السمو الملكي الأمير محمد بن سلمان',
    nameEn: 'HRH Crown Prince Mohammed bin Salman',
    src: '/assets/images/saudi_leadership.jpg',
    category: 'leadership',
  },
];

// Fallback Royal Crown & Emblem SVG
export const RoyalCrownEmblemSvg: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="35%" stopColor="#F59E0B" />
        <stop offset="70%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <radialGradient id="velvetBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#064E3B" />
        <stop offset="60%" stopColor="#022C22" />
        <stop offset="100%" stopColor="#0B132B" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="56" fill="url(#velvetBg)" stroke="url(#goldGrad)" strokeWidth="2.5" />
    <circle cx="60" cy="60" r="51" fill="none" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
    
    {/* Crown */}
    <path
      d="M38 46 L46 36 L60 48 L74 36 L82 46 L78 60 L42 60 Z"
      fill="url(#goldGrad)"
      stroke="#FDE68A"
      strokeWidth="1.2"
    />
    <circle cx="46" cy="36" r="2.5" fill="#FEF08A" />
    <circle cx="60" cy="48" r="2.5" fill="#FEF08A" />
    <circle cx="74" cy="36" r="2.5" fill="#FEF08A" />
    <circle cx="38" cy="46" r="2" fill="#FEF08A" />
    <circle cx="82" cy="46" r="2" fill="#FEF08A" />

    {/* Palm and Crossed Swords */}
    <path d="M58 74 C58 68 62 68 62 74 L60 88 Z" fill="url(#goldGrad)" />
    <path d="M60 67 C53 64 47 68 44 72 C48 70 54 69 60 70 Z" fill="url(#goldGrad)" />
    <path d="M60 67 C67 64 73 68 76 72 C72 70 66 69 60 70 Z" fill="url(#goldGrad)" />
    <path d="M45 88 Q60 82 75 76" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M75 88 Q60 82 45 76" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M43 89 L47 87" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" />
    <path d="M77 89 L73 87" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Fallback Saudi Flag SVG
export const SaudiFlagSvg: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="120" height="120" rx="60" fill="#006C35" />
    <circle cx="60" cy="60" r="58" stroke="#10B981" strokeWidth="2" fill="none" />
    <g fill="#FFFFFF" transform="translate(18, 38) scale(0.7)">
      <text x="60" y="24" font-family="'Amiri', 'Traditional Arabic', serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#FFFFFF">
        لا إله إلا الله
      </text>
      <text x="60" y="44" font-family="'Amiri', 'Traditional Arabic', serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#FFFFFF">
        محمد رسول الله
      </text>
      <path d="M 15,62 L 105,62 Q 112,62 115,60 Q 112,65 102,65 L 15,65 Z" fill="#FFFFFF" />
      <rect x="18" y="56" width="3" height="14" rx="1.5" fill="#FFFFFF" />
      <circle cx="10" cy="63.5" r="2.5" fill="#FFFFFF" />
    </g>
  </svg>
);

export const RoyalLeadershipBanner: React.FC<RoyalLeadershipBannerProps> = ({
  lang = 'ar',
  className = '',
}) => {
  const isAr = lang === 'ar';

  // State for the 3 slots:
  // Right: King Salman & Crown Prince
  // Center: Saudi Flag (العلم السعودي في المنتصف)
  // Left: Crown Prince Mohammed bin Salman
  const [images, setImages] = useState<{ right: string; center: string; left: string }>(() => {
    try {
      return {
        right: localStorage.getItem('snns_royal_frame_right') || '/assets/images/saudi_leadership.jpg',
        center: localStorage.getItem('snns_royal_frame_center') || '/assets/images/saudi_map_flag.svg',
        left: localStorage.getItem('snns_royal_frame_left') || '/assets/images/saudi_leadership.jpg',
      };
    } catch {
      return {
        right: '/assets/images/saudi_leadership.jpg',
        center: '/assets/images/saudi_map_flag.svg',
        left: '/assets/images/saudi_leadership.jpg',
      };
    }
  });

  const [errorStates, setErrorStates] = useState<{ right: boolean; center: boolean; left: boolean }>({
    right: false,
    center: false,
    left: false,
  });

  // Modal State for Changing Any Slot
  const [activeEditingSlot, setActiveEditingSlot] = useState<'right' | 'center' | 'left' | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const slotsConfig: BannerSlot[] = [
    {
      id: 'right',
      titleAr: 'خادم الحرمين الشريفين',
      titleEn: 'King Salman bin Abdulaziz',
      subtitleAr: 'الملك سلمان بن عبدالعزيز آل سعود',
      subtitleEn: 'Custodian of the Two Holy Mosques',
      defaultSrc: '/assets/images/saudi_leadership.jpg',
      badge: isAr ? 'رعاه الله' : 'May Allah protect him',
    },
    {
      id: 'center',
      titleAr: 'العلم السعودي المجيد',
      titleEn: 'Saudi National Flag & Map',
      subtitleAr: 'راية التوحيد وسيف العدالة والحق',
      subtitleEn: 'Banner of Monotheism & Homeland',
      defaultSrc: '/assets/images/saudi_map_flag.svg',
      badge: isAr ? 'العلم السعودي' : 'KSA Flag',
    },
    {
      id: 'left',
      titleAr: 'سمو ولي العهد رئيس الوزراء',
      titleEn: 'Crown Prince Mohammed bin Salman',
      subtitleAr: 'الأمير محمد بن سلمان بن عبدالعزيز',
      subtitleEn: 'Prime Minister & Vision Leader',
      defaultSrc: '/assets/images/saudi_leadership.jpg',
      badge: isAr ? 'حفظه الله' : 'Visionary Leader',
    },
  ];

  const handleApplyImage = (slotId: 'right' | 'center' | 'left', newSrc: string) => {
    setImages((prev) => {
      const next = { ...prev, [slotId]: newSrc };
      try {
        localStorage.setItem(`snns_royal_frame_${slotId}`, newSrc);
      } catch {}
      return next;
    });
    setErrorStates((prev) => ({ ...prev, [slotId]: false }));
    setActiveEditingSlot(null);
    setUrlInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slotId: 'right' | 'center' | 'left') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleApplyImage(slotId, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetSlot = (slotId: 'right' | 'center' | 'left') => {
    const defaultSrc = slotId === 'center' ? '/assets/images/saudi_map_flag.svg' : '/assets/images/saudi_leadership.jpg';
    handleApplyImage(slotId, defaultSrc);
  };

  const handleResetAll = () => {
    setImages({
      right: '/assets/images/saudi_leadership.jpg',
      center: '/assets/images/saudi_map_flag.svg',
      left: '/assets/images/saudi_leadership.jpg',
    });
    setErrorStates({ right: false, center: false, left: false });
    try {
      localStorage.removeItem('snns_royal_frame_right');
      localStorage.removeItem('snns_royal_frame_center');
      localStorage.removeItem('snns_royal_frame_left');
    } catch {}
    setActiveEditingSlot(null);
  };

  return (
    <div className={`flex justify-center items-center my-4 w-full px-2 ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Outer Luxury Card Container */}
      <div className="relative w-full max-w-4xl min-h-36 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-center overflow-hidden group">
        
        {/* Subtle Ambient Golden and Emerald Glow */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-3/4 h-20 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-1/2 -translate-x-1/2 w-1/2 h-16 bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        {/* Top Header Tag */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-black text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <span>{isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</span>
              <span className="text-[10px] text-amber-400 font-mono">★ KSA 2030 ★</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isAr ? 'انقر على أي صورة لتعديلها أو استبدالها' : 'Click any frame to change photo'}
            </span>
            <button
              onClick={handleResetAll}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition text-[11px] flex items-center gap-1 cursor-pointer"
              title={isAr ? 'استعادة الصور الافتراضية' : 'Reset All'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isAr ? 'استعادة الافتراضي' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Three Frames Row: Right (Leadership) - Center (Saudi Flag) - Left (Crown Prince) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center justify-items-center relative z-10 py-1">
          {slotsConfig.map((slot) => {
            const currentSrc = images[slot.id];
            const isCenter = slot.id === 'center';
            const hasError = errorStates[slot.id];

            return (
              <div
                key={slot.id}
                className={`flex flex-col items-center text-center group/frame transition-all duration-300 w-full max-w-[220px] ${
                  isCenter ? 'order-first sm:order-none scale-105' : ''
                }`}
              >
                {/* Circular Golden Frame Container */}
                <div className="relative">
                  {/* Subtle golden halo on hover */}
                  <div
                    className={`absolute -inset-1.5 rounded-full transition-all duration-300 ${
                      isCenter
                        ? 'bg-gradient-to-tr from-emerald-500 via-amber-300 to-emerald-400 opacity-75 blur-xs group-hover/frame:opacity-100 group-hover/frame:blur-sm'
                        : 'bg-gradient-to-tr from-amber-500 to-amber-300 opacity-40 blur-xs group-hover/frame:opacity-90'
                    }`}
                  />

                  {/* إطار الصورة الدائري الفاخر (Exact requested styling) */}
                  <div
                    className={`relative rounded-full border-2 p-1 shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-transform duration-300 group-hover/frame:scale-105 ${
                      isCenter
                        ? 'w-24 h-24 sm:w-28 sm:h-28 border-emerald-400 bg-slate-950 ring-2 ring-amber-400/50'
                        : 'w-22 h-22 sm:w-24 sm:h-24 border-amber-400 bg-slate-800'
                    }`}
                    onClick={() => setActiveEditingSlot(slot.id)}
                    title={isAr ? `انقر لتغيير ${slot.titleAr}` : `Click to change ${slot.titleEn}`}
                  >
                    {!hasError ? (
                      <img
                        src={currentSrc}
                        alt={slot.titleAr}
                        className={`w-full h-full rounded-full transition-transform duration-500 group-hover/frame:scale-110 ${
                          isCenter && currentSrc.endsWith('.svg')
                            ? 'object-contain p-1 bg-[#006C35]'
                            : 'object-cover'
                        }`}
                        referrerPolicy="no-referrer"
                        onError={() => setErrorStates((prev) => ({ ...prev, [slot.id]: true }))}
                      />
                    ) : isCenter ? (
                      <SaudiFlagSvg className="w-full h-full" />
                    ) : (
                      <RoyalCrownEmblemSvg className="w-full h-full" />
                    )}

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/frame:opacity-100 rounded-full flex flex-col items-center justify-center text-white transition-opacity duration-200">
                      <Edit3 className="w-4 h-4 text-amber-400 mb-0.5" />
                      <span className="text-[9px] font-bold text-amber-300">{isAr ? 'تغيير' : 'Change'}</span>
                    </div>
                  </div>

                  {/* Edit Floating Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEditingSlot(slot.id);
                    }}
                    className={`absolute -bottom-1 -end-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-lg transition cursor-pointer ${
                      isCenter
                        ? 'bg-emerald-600 border-amber-300 text-amber-300 hover:bg-emerald-500'
                        : 'bg-slate-900 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-950'
                    }`}
                    title={isAr ? 'تغيير الصورة' : 'Change Image'}
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* Slot Title and Subtitle */}
                <div className="mt-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {isCenter && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    <h4
                      className={`text-xs font-black truncate max-w-[200px] ${
                        isCenter ? 'text-amber-300' : 'text-white'
                      }`}
                    >
                      {isAr ? slot.titleAr : slot.titleEn}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5 font-medium">
                    {isAr ? slot.subtitleAr : slot.subtitleEn}
                  </p>
                  {slot.badge && (
                    <span
                      className={`inline-block mt-1 px-2 py-0.2 rounded-full text-[9px] font-bold ${
                        isCenter
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {slot.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Inspirational Quote */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-center relative z-10 flex items-center justify-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isAr
                ? '«طموحنا عنان السماء، ورايتنا خفاقة بالعز والمجد في ظل قيادتنا الرشيدة»'
                : '“Our ambition embraces the sky, and our banner waves with glory and pride.”'}
            </span>
          </span>
        </div>

      </div>

      {/* MODAL: Change Image for Chosen Slot */}
      {activeEditingSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl text-white text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">
                    {isAr
                      ? `تغيير صورة: ${
                          slotsConfig.find((s) => s.id === activeEditingSlot)?.titleAr
                        }`
                      : `Change Photo: ${
                          slotsConfig.find((s) => s.id === activeEditingSlot)?.titleEn
                        }`}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'اختر من المعرض الملكي، ارفع صورة من جهازك، أو أدخل رابطاً مباشراً'
                      : 'Choose from presets, upload from device, or enter image URL'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveEditingSlot(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Frame Preview */}
            <div className="flex flex-col items-center justify-center my-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="w-24 h-24 rounded-full border-2 border-amber-400 p-1 bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center mb-2">
                <img
                  src={images[activeEditingSlot]}
                  alt="Current Preview"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[11px] text-amber-300 font-bold">
                {isAr ? 'المعاينة الحالية للإطار' : 'Active Frame Preview'}
              </span>
            </div>

            {/* Section 1: Presets from Royal Gallery */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-300 mb-2">
                {isAr ? '١. الاختيار السريع من الصور الملكية المعتمدة:' : '1. Choose from royal presets:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyImage(activeEditingSlot, p.src)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-400 text-start transition flex items-center gap-2.5 cursor-pointer group/item"
                  >
                    <div className="w-10 h-10 rounded-full border border-amber-400/50 p-0.5 bg-slate-900 shrink-0 overflow-hidden">
                      <img
                        src={p.src}
                        alt={p.nameAr}
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white group-hover/item:text-amber-300 truncate">
                        {isAr ? p.nameAr : p.nameEn}
                      </p>
                      <span className="text-[9px] text-slate-400">
                        {p.category === 'flag' ? (isAr ? 'راية الوطن' : 'Flag') : (isAr ? 'القيادة' : 'Leadership')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Upload from Local Device */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                {isAr ? '٢. رفع صورة مخصصة من جهازك (بما فيها الصور المرفوعة):' : '2. Upload image file from your device:'}
              </label>
              <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 border border-dashed border-amber-400/60 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-amber-300 font-bold transition">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'استعراض واختيار صورة من جهازك' : 'Browse & select photo from device'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, activeEditingSlot)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Section 3: Direct URL */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? '٣. أو إدخال رابط صورة خارجي مباشر (URL):' : '3. Or enter direct image URL:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/leadership.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInput.trim()) {
                        handleApplyImage(activeEditingSlot, urlInput.trim());
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition cursor-pointer"
                  >
                    {isAr ? 'تطبيق' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Reset this slot to default */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleResetSlot(activeEditingSlot)}
                  className="text-slate-400 hover:text-amber-400 transition cursor-pointer"
                >
                  {isAr ? 'استعادة الصورة الافتراضية لهذا الإطار' : 'Reset this frame to default'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditingSlot(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoyalLeadershipBanner;
