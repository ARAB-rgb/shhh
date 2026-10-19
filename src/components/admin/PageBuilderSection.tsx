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
  Layout,
  Sliders,
  Type,
  Megaphone,
  History,
  Save,
  RotateCcw,
  Eye,
  Shield,
} from 'lucide-react';

interface PageBuilderSectionProps {
  lang?: 'en' | 'ar';
}

export const PageBuilderSection: React.FC<PageBuilderSectionProps> = ({ lang = 'ar' }) => {
  const isAr = lang === 'ar';
  const [currentBg, setCurrentBg] = useState<string>(() => storage.getHeroBackground());
  const [bgMode, setBgMode] = useState<'panorama' | 'dark'>(() => storage.getBackgroundMode());
  const [customUrl, setCustomUrl] = useState<string>('');
  const [cmsSettings, setCmsSettings] = useState(() => storage.getCmsSettings());
  const [activeCmsTab, setActiveCmsTab] = useState<'bg' | 'text' | 'announcement' | 'history'>('bg');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [historyLog, setHistoryLog] = useState<Array<{ timestamp: string; action: string }>>([
    { timestamp: new Date().toLocaleTimeString(), action: isAr ? 'تحميل إعدادات CMS الأولية' : 'Initial CMS Settings Loaded' },
  ]);

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
    triggerSaveNotification(isAr ? 'تم تحديث خلفية الواجهة البانورامية' : 'Updated panoramic background');
  };

  const handleModeToggle = (mode: 'panorama' | 'dark') => {
    setBgMode(mode);
    storage.saveBackgroundMode(mode);
    triggerSaveNotification(isAr ? `تم التبديل إلى نمط: ${mode}` : `Switched mode: ${mode}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleApplyBg(result);
        if (bgMode === 'dark') handleModeToggle('panorama');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCmsChange = (field: string, value: any) => {
    const updated = { ...cmsSettings, [field]: value };
    setCmsSettings(updated);
  };

  const handleSaveAllCms = () => {
    storage.saveCmsSettings(cmsSettings);
    triggerSaveNotification(isAr ? 'تم حفظ كافة إعدادات ونصوص CMS بنجاح في قاعدة البيانات المحلية والمرجعية' : 'Saved all CMS settings successfully');
  };

  const triggerSaveNotification = (actionName: string) => {
    setSavedNotice(true);
    setHistoryLog((prev) => [{ timestamp: new Date().toLocaleTimeString(), action: actionName }, ...prev]);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>No-Code CMS & Visual Page Builder (/sts)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {isAr ? 'مركز التحكم الشامل ومُصمّم الصفحات (No-Code Admin CMS)' : 'No-Code Admin CMS & Page Builder'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? 'إدارة الخلفيات البانورامية، النصوص التفاعلية، الإعلانات، وترتيب الواجهة بدقة دون الحاجة لأي تعديل برمجي.'
              : 'Manage panoramic backgrounds, interactive texts, announcements, and layout order without code edits.'}
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xl animate-in fade-in zoom-in">
            <Check className="w-4 h-4" />
            <span>{isAr ? 'تم الحفظ والتطبيق الفوري بنجاح!' : 'Saved & Applied Successfully!'}</span>
          </div>
        )}
      </div>

      {/* Sub-tabs for CMS */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
        {[
          { id: 'bg', labelAr: 'مُصمّم الخلفيات والبانوراما', icon: ImageIcon },
          { id: 'text', labelAr: 'مُحرّر النصوص والعناصر المرئية', icon: Type },
          { id: 'announcement', labelAr: 'إدارة الإعلانات والباقات', icon: Megaphone },
          { id: 'history', labelAr: 'سجل الإصدارات والتراجع', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCmsTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCmsTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.labelAr}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BACKGROUND & THEME DESIGNER */}
      {activeCmsTab === 'bg' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Mode Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-5 h-5" />
              <span>{isAr ? 'نمط عرض الخلفية الرئيسية' : 'Homepage Background Display Mode'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => handleModeToggle('panorama')}
                className={`cursor-pointer rounded-2xl border-2 p-5 flex items-center justify-between transition ${
                  bgMode === 'panorama'
                    ? 'border-emerald-400 bg-emerald-950/30 shadow-lg'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgMode === 'panorama' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{isAr ? 'الخلفية البانورامية المخصصة' : 'Custom Panoramic Background'}</h4>
                    <p className="text-xs text-slate-400">{isAr ? 'عرض صور الدرعية والتراث أو صور مرفوعة' : 'Display heritage & uploaded images'}</p>
                  </div>
                </div>
                {bgMode === 'panorama' && <Check className="w-5 h-5 text-emerald-400" />}
              </div>

              <div
                onClick={() => handleModeToggle('dark')}
                className={`cursor-pointer rounded-2xl border-2 p-5 flex items-center justify-between transition ${
                  bgMode === 'dark'
                    ? 'border-amber-400 bg-amber-950/30 shadow-lg'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgMode === 'dark' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{isAr ? 'النمط الداكن المظلم (Dark Mode)' : 'Pure Dark Mode'}</h4>
                    <p className="text-xs text-slate-400">{isAr ? 'واجهة داكنة خالصة بدون خلفيات صور' : 'Sleek dark mode without images'}</p>
                  </div>
                </div>
                {bgMode === 'dark' && <Check className="w-5 h-5 text-amber-400" />}
              </div>
            </div>
          </div>

          {/* Upload & Positioning Controls */}
          {bgMode === 'panorama' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'رفع صورة خلفية جديدة' : 'Upload New Background Image'}</span>
                </h3>
                <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl cursor-pointer bg-slate-950 transition text-xs font-bold text-slate-300">
                  <Upload className="w-6 h-6 text-emerald-400" />
                  <span>{isAr ? 'اختر ملف صورة من جهازك' : 'Choose image file'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'ضبط الشفافية والموضع' : 'Opacity & Position Control'}</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{isAr ? 'شفافية التعتيم الداكن فوق الخلفية (%):' : 'Background Dark Overlay Opacity (%):'}</label>
                    <input
                      type="range"
                      min="30"
                      max="95"
                      value={cmsSettings.bgOpacity}
                      onChange={(e) => handleCmsChange('bgOpacity', Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-emerald-400">{cmsSettings.bgOpacity}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Presets */}
          {bgMode === 'panorama' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'قوالب الخلفيات البانورامية الجاهزة' : 'Preset Backgrounds'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {presets.map((p) => {
                  const isSel = currentBg === p.url;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleApplyBg(p.url)}
                      className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer p-4 h-24 bg-cover bg-center flex items-end shadow-md transition ${
                        isSel ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-slate-800 hover:border-slate-600'
                      }`}
                      style={{ backgroundImage: `url('${p.url}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="relative z-10 flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white">{isAr ? p.titleAr : p.titleEn}</span>
                        {isSel && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VISUAL PAGE TEXTS & ELEMENTS EDITOR */}
      {activeCmsTab === 'text' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white">{isAr ? 'مُحرّر النصوص والعناصر المرئية (Visual Page Editor)' : 'Visual Page Text & Element Editor'}</h3>
              <p className="text-xs text-slate-400">{isAr ? 'تعديل العناوين، الأوصاف، ونصوص البحث في الصفحة الرئيسية فورياً' : 'Edit headings, subtitles, and search placeholder instantly'}</p>
            </div>
            <button
              onClick={handleSaveAllCms}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ كافة التعديلات' : 'Save All Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'عنوان البطل الرئيسي (Hero Title):' : 'Main Hero Title:'}</label>
              <input
                type="text"
                value={cmsSettings.heroTitle}
                onChange={(e) => handleCmsChange('heroTitle', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'العنوان الفرعي (Hero Subtitle):' : 'Hero Subtitle:'}</label>
              <input
                type="text"
                value={cmsSettings.heroSubtitle}
                onChange={(e) => handleCmsChange('heroSubtitle', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'نص شريط البحث الافتراضي (Search Placeholder):' : 'Search Input Placeholder:'}</label>
              <input
                type="text"
                value={cmsSettings.searchPlaceholder}
                onChange={(e) => handleCmsChange('searchPlaceholder', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENTS & CONTENT CMS */}
      {activeCmsTab === 'announcement' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white">{isAr ? 'إدارة الإعلانات والباقات والرسائل الرسمية' : 'Announcements & Banners CMS'}</h3>
              <p className="text-xs text-slate-400">{isAr ? 'التحكم في شريط الإعلانات العلوي والرسائل الترويجية للمستخدمين' : 'Control top announcement banner and promotional messages'}</p>
            </div>
            <button
              onClick={handleSaveAllCms}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ الإعلانات' : 'Save Announcements'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <div>
                <h4 className="text-xs font-bold text-white">{isAr ? 'إظهار شريط الإعلانات العلوي' : 'Show Top Announcement Banner'}</h4>
                <p className="text-[11px] text-slate-400">{isAr ? 'عرض الإعلان الممرر في أعلى الواجهة الرئيسية' : 'Display banner on top of homepage'}</p>
              </div>
              <input
                type="checkbox"
                checked={cmsSettings.showAnnouncement}
                onChange={(e) => handleCmsChange('showAnnouncement', e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'نص الإعلان الرسمي:' : 'Official Announcement Text:'}</label>
              <textarea
                rows={3}
                value={cmsSettings.announcementBanner}
                onChange={(e) => handleCmsChange('announcementBanner', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERSION HISTORY & AUDIT LOGS */}
      {activeCmsTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-black text-white">{isAr ? 'سجل الإصدارات والتغييرات (Version History & Audit)' : 'Version History & CMS Logs'}</h3>
            <p className="text-xs text-slate-400">{isAr ? 'متابعة التحديثات التي تم إجراؤها على الواجهة والمحتوى' : 'Audit trail of updates made to interface and content'}</p>
          </div>

          <div className="space-y-2">
            {historyLog.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-mono">{log.timestamp}</span>
                <span className="text-slate-200 font-medium">{log.action}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBuilderSection;
