import React, { useState } from 'react';
import { storage } from '../../services/storage';
import {
  Image as ImageIcon,
  Upload,
  Check,
  Sparkles,
  Layers,
  Globe,
  FileUp,
  Moon,
  Sun,
} from 'lucide-react';

interface PageBuilderSectionProps {
  lang?: 'en' | 'ar';
}

export const PageBuilderSection: React.FC<PageBuilderSectionProps> = ({ lang = 'ar' }) => {
  const isAr = lang === 'ar';
  const [currentBg, setCurrentBg] = useState<string>(() => storage.getHeroBackground());
  const [bgMode, setBgMode] = useState<'panorama' | 'dark'>(() => storage.getBackgroundMode());
  const [customUrl, setCustomUrl] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const presets = [
    {
      id: 'diriyah-1',
      titleAr: 'حي الطريف والدرعية التاريخية (بانوراما ليلية دافئة)',
      titleEn: 'Al-Turaif & Diriyah Heritage (Warm Night Panorama)',
      url: 'https://images.unsplash.com/photo-1578895101408-1a3af889d2b7?q=80&w=2000&auto=format&fit=crop',
    },
    {
      id: 'diriyah-2',
      titleAr: 'قصر نجد التاريخي وإضاءة التراث',
      titleEn: 'Najd Heritage Palace & Warm Illumination',
      url: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=2000&auto=format&fit=crop',
    },
    {
      id: 'riyadh-modern',
      titleAr: 'أفق الرياض المعاصر وشاشة المستقبل الشفافة',
      titleEn: 'Modern Riyadh Skyline & Transparent Future Screen',
      url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=2000&auto=format&fit=crop',
    },
    {
      id: 'emerald-luxury',
      titleAr: 'نمط الزمرد الفاخر والذهب الوطني',
      titleEn: 'Luxurious Emerald & National Gold Pattern',
      url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000&auto=format&fit=crop',
    },
  ];

  const handleApplyBg = (url: string) => {
    setCurrentBg(url);
    storage.saveHeroBackground(url);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleModeToggle = (mode: 'panorama' | 'dark') => {
    setBgMode(mode);
    storage.saveBackgroundMode(mode);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleApplyBg(result);
        if (bgMode === 'dark') {
          handleModeToggle('panorama');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      handleApplyBg(customUrl.trim());
      setCustomUrl('');
      if (bgMode === 'dark') {
        handleModeToggle('panorama');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>/sts/page-builder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isAr ? 'مُصمّم الخلفيات وأنماط الواجهة الرئيسية' : 'Homepage Background & Theme Designer'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? 'التبديل بين الخلفية البانورامية المخصصة أو رفع صور جديدة، أو تفعيل النمط الداكن المظلم (Dark Mode) الفاخر.'
              : 'Toggle between custom panoramic background / image uploads and pure luxurious Dark Mode theme.'}
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg animate-in fade-in zoom-in">
            <Check className="w-4 h-4" />
            <span>{isAr ? 'تم حفظ التحديثات بنجاح!' : 'Settings Saved Successfully!'}</span>
          </div>
        )}
      </div>

      {/* Background Mode Selector Switch (Panorama vs Dark Mode) */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Moon className="w-5 h-5" />
          <span>{isAr ? 'اختر نمط خلفية الواجهة الرئيسية' : 'Select Homepage Background Mode'}</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Custom Panoramic Background */}
          <div
            onClick={() => handleModeToggle('panorama')}
            className={`cursor-pointer rounded-2xl border-2 p-5 flex items-center justify-between transition ${
              bgMode === 'panorama'
                ? 'border-emerald-400 bg-emerald-950/30 shadow-lg ring-2 ring-emerald-500/30'
                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgMode === 'panorama' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{isAr ? 'الخلفية البانورامية المخصصة' : 'Custom Panoramic Background'}</h4>
                <p className="text-xs text-slate-400">{isAr ? 'عرض صور الدرعية وحي الطريف أو الصور المرفوعة' : 'Display Al-Turaif heritage & uploaded images'}</p>
              </div>
            </div>
            {bgMode === 'panorama' && <Check className="w-5 h-5 text-emerald-400" />}
          </div>

          {/* Option 2: Pure Dark Mode */}
          <div
            onClick={() => handleModeToggle('dark')}
            className={`cursor-pointer rounded-2xl border-2 p-5 flex items-center justify-between transition ${
              bgMode === 'dark'
                ? 'border-amber-400 bg-amber-950/30 shadow-lg ring-2 ring-amber-500/30'
                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgMode === 'dark' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{isAr ? 'النمط الداكن المظلم (Dark Mode)' : 'Pure Dark Mode Theme'}</h4>
                <p className="text-xs text-slate-400">{isAr ? 'واجهة داكنة خالصة بدون صور خلفية' : 'Sleek dark mode without image background'}</p>
              </div>
            </div>
            {bgMode === 'dark' && <Check className="w-5 h-5 text-amber-400" />}
          </div>
        </div>
      </div>

      {/* Primary Upload Section (Only active / relevant when in panorama mode) */}
      {bgMode === 'panorama' && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6 bg-gradient-to-b from-slate-900 to-emerald-950/25 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2.5">
              <FileUp className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'رفع ملف صورة الخلفية البانورامية من جهازك' : 'Upload Panoramic Background File'}</span>
            </h3>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              {isAr ? 'الطريقة الأساسية والموصى بها' : 'Recommended Method'}
            </span>
          </div>

          <label className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 rounded-3xl cursor-pointer bg-slate-950/80 hover:bg-emerald-950/30 transition text-sm font-bold text-slate-200 shadow-xl group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition duration-300">
              <Upload className="w-8 h-8" />
            </div>
            <span className="text-white text-base">
              {isAr ? 'اضغط هنا لرفع صورة الخلفية من جهازك' : 'Click here to upload background from device'}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {isAr ? 'يدعم صور JPG, PNG, WEBP (عالية الدقة)' : 'Supports JPG, PNG, WEBP high-res images'}
            </span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>{isAr ? 'معاينة الخلفية الحالية على الواجهة الرئيسية' : 'Current Background Live Preview'}</span>
        </h3>

        <div
          className="w-full h-48 sm:h-64 rounded-2xl bg-cover bg-center border border-emerald-500/40 relative flex items-center justify-center p-4 shadow-inner overflow-hidden"
          style={{
            backgroundImage: bgMode === 'panorama'
              ? `linear-gradient(to bottom, rgba(3, 7, 18, 0.65), rgba(3, 7, 18, 0.85)), url('${currentBg}')`
              : 'none',
            backgroundColor: bgMode === 'dark' ? '#030712' : undefined,
          }}
        >
          <div className="absolute inset-0 border border-amber-400/30 rounded-2xl pointer-events-none" />
          <div className="text-center relative z-10">
            <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-md">
              PRO<span className="text-amber-400">.</span>SNNS
            </span>
            <p className="text-xs text-emerald-300 font-bold mt-1">
              {isAr ? 'دليل المواقع والخدمات السحابية المعتمدة' : 'Verified Cloud Services Directory'}
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-slate-900/80 text-amber-400 rounded-full text-[10px] font-bold border border-amber-500/30">
              {bgMode === 'panorama' ? (isAr ? 'الوضع: بانوراما مخصصة' : 'Mode: Panorama') : (isAr ? 'الوضع: النمط الداكن المظلم' : 'Mode: Pure Dark')}
            </span>
          </div>
        </div>
      </div>

      {/* Presets & Optional URL (Active in panorama mode) */}
      {bgMode === 'panorama' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          {/* Presets Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'قوالب بانورامية جاهزة' : 'Preset Panoramic Backgrounds'}</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {presets.map((preset) => {
                const isSelected = currentBg === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyBg(preset.url)}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition p-3 flex items-center justify-between h-20 bg-cover bg-center shadow-md ${
                      isSelected ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-slate-800 hover:border-slate-600'
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(3, 7, 18, 0.95), rgba(3, 7, 18, 0.6)), url('${preset.url}')`,
                    }}
                  >
                    <div className="relative z-10 max-w-[80%]">
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition truncate">
                        {isAr ? preset.titleAr : preset.titleEn}
                      </h4>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md relative z-10">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct URL Fallback */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'أو لصق رابط صورة مباشر (اختياري)' : 'Or Direct Image URL (Optional)'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'يمكنك أيضاً استخدام رابط صورة خارجي مباشر بصيغة HTTPS.'
                  : 'You can also provide a direct HTTPS image URL.'}
              </p>

              <form onSubmit={handleCustomUrlSubmit} className="space-y-3">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/panorama.jpg"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition border border-emerald-500/30 cursor-pointer"
                >
                  {isAr ? 'تطبيق الرابط' : 'Apply URL'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBuilderSection;
