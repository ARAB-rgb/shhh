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

export const RoyalLeadershipBanner: React.FC<RoyalLeadershipBannerProps> = ({
  lang = 'ar',
  className = '',
}) => {
  const isAr = lang === 'ar';

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

  const [activeEditingSlot, setActiveEditingSlot] = useState<'right' | 'center' | 'left' | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const slotsConfig: BannerSlot[] = [
    {
      id: 'right',
      titleAr: 'خادم الحرمين الشريفين',
      titleEn: 'King Salman bin Abdulaziz',
      subtitleAr: 'الملك سلمان بن عبدالعزيز',
      subtitleEn: 'King Salman',
      defaultSrc: '/assets/images/saudi_leadership.jpg',
      badge: isAr ? 'رعاه الله' : 'Protected',
    },
    {
      id: 'center',
      titleAr: 'العلم السعودي المجيد',
      titleEn: 'Saudi National Flag',
      subtitleAr: 'راية التوحيد وسيف العدالة',
      subtitleEn: 'National Flag',
      defaultSrc: '/assets/images/saudi_map_flag.svg',
      badge: isAr ? 'العلم السعودي' : 'KSA Flag',
    },
    {
      id: 'left',
      titleAr: 'سمو ولي العهد رئيس الوزراء',
      titleEn: 'Crown Prince Mohammed bin Salman',
      subtitleAr: 'الأمير محمد بن سلمان',
      subtitleEn: 'Crown Prince',
      defaultSrc: '/assets/images/saudi_leadership.jpg',
      badge: isAr ? 'حفظه الله' : 'Visionary',
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
    <div className={`flex justify-center items-center my-1 w-full px-2 ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Compact Luxury Ribbon Container */}
      <div className="relative w-full max-w-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xl flex items-center justify-between gap-3 group">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-1/2 h-10 bg-emerald-500/10 blur-xl pointer-events-none" />

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white text-[11px] tracking-tight">
            {isAr ? 'المملكة العربية السعودية • KSA 2030' : 'Kingdom of Saudi Arabia • KSA 2030'}
          </span>
        </div>

        {/* Three Royal Frames Row: Right (King Salman) - Center (Saudi Flag) - Left (Crown Prince) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center justify-items-center">
          {slotsConfig.map((slot) => {
            const currentSrc = images[slot.id];
            const isCenter = slot.id === 'center';
            const hasError = errorStates[slot.id];

            return (
              <div
                key={slot.id}
                className="flex items-center gap-2 text-start cursor-pointer group/item relative"
                onClick={() => setActiveEditingSlot(slot.id)}
                title={isAr ? `انقر لتغيير ${slot.titleAr}` : `Click to change ${slot.titleEn}`}
              >
                <div className="relative">
                  <div className={`absolute -inset-1 rounded-full ${isCenter ? 'bg-emerald-400/60' : 'bg-amber-400/60'} blur-[2px] opacity-70 group-hover/item:opacity-100 transition animate-pulse`} />
                  <div className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 ${isCenter ? 'border-emerald-400 p-0.5' : 'border-amber-400 p-0.5'} bg-slate-900 overflow-hidden flex items-center justify-center shadow-lg transition-transform group-hover/item:scale-105`}>
                    {!hasError ? (
                      <img
                        src={currentSrc}
                        alt={slot.titleAr}
                        className="w-full h-full object-cover rounded-full"
                        onError={() => setErrorStates((prev) => ({ ...prev, [slot.id]: true }))}
                      />
                    ) : (
                      <RoyalCrownEmblemSvg className="w-8 h-8" />
                    )}
                  </div>
                  {/* Edit Badge overlay */}
                  <div className="absolute -bottom-1 -end-1 bg-slate-900/90 border border-amber-400/80 rounded-full p-0.5 opacity-0 group-hover/item:opacity-100 transition shadow">
                    <Edit3 className="w-2.5 h-2.5 text-amber-300" />
                  </div>
                </div>

                <div className="hidden md:block">
                  <p className="text-[11px] font-bold text-white leading-tight truncate max-w-[110px]">{slot.titleAr}</p>
                  <p className={`text-[9px] ${isCenter ? 'text-emerald-400 font-bold' : 'text-amber-400 font-medium'} leading-tight`}>{slot.badge}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleResetAll}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition text-[10px] shrink-0"
          title={isAr ? 'استعادة الصور الافتراضية' : 'Reset to default images'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Edit Modal */}
      {activeEditingSlot && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 text-white text-start shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>
                  {isAr
                    ? `تخصيص: ${slotsConfig.find((s) => s.id === activeEditingSlot)?.titleAr}`
                    : `Customize: ${slotsConfig.find((s) => s.id === activeEditingSlot)?.titleEn}`}
                </span>
              </h3>
              <button
                onClick={() => setActiveEditingSlot(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Presets */}
              <div>
                <label className="font-semibold block mb-2 text-slate-300">
                  {isAr ? '1. اختر من الصور الوطنية المعتمدة:' : '1. Choose from official presets:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyImage(activeEditingSlot, '/assets/images/saudi_leadership.jpg')}
                    className="p-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 hover:border-amber-400 rounded-xl text-center flex flex-col items-center gap-1.5 transition"
                  >
                    <div className="w-10 h-10 rounded-full border border-amber-400 overflow-hidden shadow">
                      <img src="/assets/images/saudi_leadership.jpg" alt="القيادة" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200">{isAr ? 'صورة القيادة' : 'Leadership'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyImage(activeEditingSlot, '/assets/images/saudi_map_flag.svg')}
                    className="p-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 hover:border-emerald-400 rounded-xl text-center flex flex-col items-center gap-1.5 transition"
                  >
                    <div className="w-10 h-10 rounded-full border border-emerald-400 overflow-hidden shadow bg-emerald-950/60">
                      <img src="/assets/images/saudi_map_flag.svg" alt="خريطة العلم" className="w-full h-full object-cover p-1" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200">{isAr ? 'خريطة العلم' : 'Flag Map'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyImage(activeEditingSlot, '/assets/images/saudi_flag.jpg')}
                    className="p-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 hover:border-emerald-400 rounded-xl text-center flex flex-col items-center gap-1.5 transition"
                  >
                    <div className="w-10 h-10 rounded-full border border-emerald-400 overflow-hidden shadow">
                      <img src="/assets/images/saudi_flag.jpg" alt="العلم الخفاق" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200">{isAr ? 'العلم الخفاق' : 'Saudi Flag'}</span>
                  </button>
                </div>
              </div>

              {/* Upload from Device */}
              <div>
                <label className="font-semibold block mb-2 text-slate-300">
                  {isAr ? '2. أو ارفع صورة مباشرة من جهازك:' : '2. Or upload an image from your device:'}
                </label>
                <label className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-dashed border-slate-700 hover:border-amber-400 rounded-xl cursor-pointer hover:bg-slate-900/60 transition group">
                  <Upload className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                  <span className="text-xs text-slate-300 group-hover:text-white font-medium">
                    {isAr ? 'اختر ملف صورة (JPG, PNG, WebP)' : 'Select image file (JPG, PNG, WebP)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          if (result && activeEditingSlot) {
                            handleApplyImage(activeEditingSlot, result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Direct URL */}
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  {isAr ? '3. أو أدخل رابط صورة مباشر (URL):' : '3. Or enter direct image URL:'}
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none transition"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveEditingSlot(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) handleApplyImage(activeEditingSlot, urlInput.trim());
                  }}
                  disabled={!urlInput.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold rounded-xl shadow transition cursor-pointer"
                >
                  {isAr ? 'تطبيق الرابط' : 'Apply URL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
