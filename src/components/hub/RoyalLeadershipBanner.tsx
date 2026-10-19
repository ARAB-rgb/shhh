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

        {/* Three Compact Frames Row: Right (King Salman) - Center (Flag) - Left (Crown Prince) */}
        <div className="grid grid-cols-3 gap-3 items-center justify-items-center">
          {slotsConfig.map((slot) => {
            const currentSrc = images[slot.id];
            const isCenter = slot.id === 'center';
            const hasError = errorStates[slot.id];

            return (
              <div
                key={slot.id}
                className="flex items-center gap-1.5 text-start cursor-pointer group/item"
                onClick={() => setActiveEditingSlot(slot.id)}
                title={isAr ? `انقر لتغيير ${slot.titleAr}` : `Click to change ${slot.titleEn}`}
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-amber-400/50 blur-[1px] opacity-60 group-hover/item:opacity-100 transition" />
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-400/80 bg-slate-900 overflow-hidden flex items-center justify-center shadow">
                    {!hasError ? (
                      <img
                        src={currentSrc}
                        alt={slot.titleAr}
                        className="w-full h-full object-cover"
                        onError={() => setErrorStates((prev) => ({ ...prev, [slot.id]: true }))}
                      />
                    ) : (
                      <RoyalCrownEmblemSvg className="w-6 h-6" />
                    )}
                  </div>
                </div>

                <div className="hidden sm:block">
                  <p className="text-[10px] font-bold text-white leading-tight truncate max-w-[90px]">{slot.titleAr}</p>
                  <p className="text-[9px] text-amber-400 font-medium leading-tight">{slot.badge}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleResetAll}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition text-[10px]"
          title={isAr ? 'استعادة الافتراضي' : 'Reset'}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Edit Modal */}
      {activeEditingSlot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 text-white text-start shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-xs flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'تخصيص الشعار الوطني' : 'Customize National Emblem'}</span>
              </h3>
              <button onClick={() => setActiveEditingSlot(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">{isAr ? 'اختر نموذج جاهز:' : 'Select Preset:'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApplyImage(activeEditingSlot, '/assets/images/saudi_leadership.jpg')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-[10px] font-bold"
                  >
                    {isAr ? 'صورة القيادة' : 'Leadership Duo'}
                  </button>
                  <button
                    onClick={() => handleApplyImage(activeEditingSlot, '/assets/images/saudi_map_flag.svg')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-[10px] font-bold"
                  >
                    {isAr ? 'علم المملكة' : 'Saudi Flag'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">{isAr ? 'أو أدخل رابط صورة مباشر (URL):' : 'Or Image URL:'}</label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEditingSlot(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) handleApplyImage(activeEditingSlot, urlInput.trim());
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  {isAr ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
