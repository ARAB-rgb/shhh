import React, { useState, useEffect } from 'react';
import {
  Search,
  Mic,
  Sparkles,
  PlusCircle,
  Database,
  Globe,
  X,
  Building2,
  Scale,
  GraduationCap,
  CreditCard,
} from 'lucide-react';
import { AppId } from '../../types/suite';
import { storage } from '../../services/storage';
import { RoyalLeadershipBanner } from './RoyalLeadershipBanner';

interface SaudiSearchHeroProps {
  onSearchQuery: (query: string) => void;
  onSelectApp: (appId: AppId) => void;
  lang: 'en' | 'ar';
  isDarkMode?: boolean;
  onOpenPwaModal?: () => void;
}

export const SaudiSearchHero: React.FC<SaudiSearchHeroProps> = ({
  onSearchQuery,
  onSelectApp,
  lang,
  isDarkMode = true,
  onOpenPwaModal,
}) => {
  const isAr = lang === 'ar';
  const [searchVal, setSearchVal] = useState('');
  const [heroBg, setHeroBg] = useState<string>(() => storage.getHeroBackground());
  const [bgMode, setBgMode] = useState<'panorama' | 'dark'>(() => storage.getBackgroundMode());
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteTitle, setNewSiteTitle] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [addNotice, setAddNotice] = useState<string | null>(null);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [isSubmittingSite, setIsSubmittingSite] = useState(false);

  useEffect(() => {
    const handleBgUpdate = (e: any) => {
      if (e.detail) setHeroBg(e.detail);
      else setHeroBg(storage.getHeroBackground());
    };
    const handleModeUpdate = (e: any) => {
      if (e.detail) setBgMode(e.detail);
      else setBgMode(storage.getBackgroundMode());
    };
    window.addEventListener('snns_hero_bg_updated', handleBgUpdate);
    window.addEventListener('snns_bg_mode_updated', handleModeUpdate);
    return () => {
      window.removeEventListener('snns_hero_bg_updated', handleBgUpdate);
      window.removeEventListener('snns_bg_mode_updated', handleModeUpdate);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchQuery(searchVal.trim());
  };

  const handleLuckyStrike = () => {
    const popularApps: AppId[] = ['qayd-pos', 'snns-calls', 'snns-ai', 'qayd-accounting', 'marketplace'];
    const randomApp = popularApps[Math.floor(Math.random() * popularApps.length)];
    onSelectApp(randomApp);
  };

  const handleAddSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteTitle.trim() || !newSiteUrl.trim()) return;

    setIsSubmittingSite(true);
    setSiteError(null);
    setAddNotice(null);

    try {
      const res = await fetch('/api/directory/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSiteTitle.trim(),
          requestedUrl: newSiteUrl.trim(),
          category: isAr ? 'دوائر وخدمات سحابية' : 'Cloud Services & Portals',
          notes: 'طلب فهرسة تم تقديمه من الواجهة الرئيسية لـ SNNS.PRO',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isAr ? 'تعذر إرسال الطلب إلى الخادم' : 'Failed to submit request to server'));
      }

      // Only display success after actual server confirmation
      setAddNotice(
        data.message ||
          (isAr
            ? `تم تأكيد استلام الخادم للطلب وإدراجه بقائمة التدقيق: ${newSiteTitle}`
            : `Request successfully confirmed by server: ${newSiteTitle}`)
      );

      setTimeout(() => {
        setAddNotice(null);
        setShowAddSiteModal(false);
        setNewSiteTitle('');
        setNewSiteUrl('');
      }, 2500);
    } catch (err: any) {
      setSiteError(err.message || (isAr ? 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً' : 'Network error with server'));
    } finally {
      setIsSubmittingSite(false);
    }
  };

  return (
    <div
      className="w-full min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden rounded-3xl border border-amber-500/35 p-4 sm:p-8 shadow-2xl select-none bg-cover bg-center transition-all duration-500"
      style={{
        backgroundImage: bgMode === 'panorama'
          ? `linear-gradient(to bottom, rgba(3, 7, 18, 0.78), rgba(3, 7, 18, 0.92)), url('${heroBg}')`
          : 'none',
        backgroundColor: bgMode === 'dark' ? '#030712' : undefined,
      }}
    >
      {/* Curved Screen Border Effect */}
      <div className="absolute inset-2 sm:inset-4 rounded-[2.5rem] border border-amber-400/40 pointer-events-none shadow-[inset_0_0_60px_rgba(245,158,11,0.2)] z-20" />
      
      {/* Background Heritage Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/20 via-emerald-950/50 to-slate-950 pointer-events-none" />

      <div className="relative z-30 w-full max-w-4xl flex flex-col items-center text-center">
        {/* 1. Compact National Leadership Ribbon Banner */}
        <RoyalLeadershipBanner lang={lang} />

        {/* 2. PRO . SNNS Signature Glowing Brand Identity */}
        <div className="my-2">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight flex items-center justify-center gap-2 select-text">
            <span className="text-emerald-400 drop-shadow-[0_2px_24px_rgba(16,185,129,0.6)]">PRO</span>
            <span className="text-amber-400 text-4xl sm:text-6xl font-black drop-shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-pulse">
              .
            </span>
            <span className="text-emerald-400 drop-shadow-[0_2px_24px_rgba(16,185,129,0.6)]">SNNS</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/95 font-bold mt-2 tracking-wide flex items-center justify-center gap-2">
            <span>{isAr ? 'دليل المواقع والخدمات السحابية المعتمدة' : 'Verified Cloud Services & Sites Directory'}</span>
          </p>
        </div>

        {/* 3. Unified Search Bar (Google Style Center Stage) */}
        <div className="w-full max-w-2xl mt-3 mb-4">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="relative flex items-center bg-slate-950/95 hover:bg-slate-950 border-2 border-emerald-500/50 hover:border-emerald-500 focus-within:border-emerald-400 rounded-full shadow-2xl transition duration-200 p-1.5">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={isAr ? 'ابحث في الخدمات والمواقع المعتمَدة...' : 'Search verified services & sites...'}
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm py-3.5 ps-6 pe-20 focus:outline-none"
              />

              <div className="absolute end-4 flex items-center gap-2 text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal(isAr ? 'كاشير قيد' : 'Qayd POS');
                    onSearchQuery(isAr ? 'كاشير قيد' : 'Qayd POS');
                  }}
                  className="p-1.5 hover:text-emerald-400 transition"
                  title={isAr ? 'أمر صوتي أو بحث ذكي' : 'Smart Voice / NLP'}
                >
                  <Mic className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition shadow-lg cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Search Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={() => onSearchQuery(searchVal.trim())}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Search className="w-3.5 h-3.5 text-white" />
              <span>{isAr ? 'بحث في الدليل' : 'Search Directory'}</span>
            </button>

            <button
              onClick={() => setShowAddSiteModal(true)}
              className="px-6 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 hover:text-emerald-200 border border-emerald-500/35 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'إضافة خدمة جديدة' : 'Add New Service'}</span>
            </button>
          </div>
        </div>

        {/* 4. Quick Categories Index (التصنيفات السريعة) */}
        <div className="w-full max-w-3xl mt-2 flex flex-wrap items-center justify-center gap-2.5">
          {[
            { labelAr: '🏛️ الوزارات والهيئات', query: 'وزارات وهيئات' },
            { labelAr: '⚖️ الخدمات العدلية والقضائية (ناجز، نافذ)', query: 'خدمات قضائية' },
            { labelAr: '🎓 التعليم والجامعات', query: 'تعليم' },
            { labelAr: '💳 الخدمات المالية والبنوك', query: 'مالية' },
          ].map((cat, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchVal(cat.query);
                onSearchQuery(cat.query);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-emerald-300 border border-slate-700/80 text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5 backdrop-blur-md"
            >
              <span>{cat.labelAr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white text-start shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'إضافة موقع أو خدمة لفهرس SNNS.PRO' : 'Index New Site to SNNS.PRO'}</span>
              </h3>
              <button onClick={() => setShowAddSiteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addNotice ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold text-center">
                {addNotice}
              </div>
            ) : (
              <form onSubmit={handleAddSiteSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    {isAr ? 'اسم الموقع أو المنصة:' : 'Site / Platform Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newSiteTitle}
                    onChange={(e) => setNewSiteTitle(e.target.value)}
                    placeholder="مثال: منصة تجارية أو خدمية"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    {isAr ? 'رابط الموقع الرسمي (URL):' : 'Official URL:'}
                  </label>
                  <input
                    type="url"
                    required
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    placeholder="https://example.sa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {siteError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl text-xs font-semibold">
                    {siteError}
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSubmittingSite}
                    onClick={() => setShowAddSiteModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-medium transition cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSite}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmittingSite ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isAr ? 'جاري الإرسال...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <span>{isAr ? 'إرسال للفهرسة' : 'Submit for Indexing'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
