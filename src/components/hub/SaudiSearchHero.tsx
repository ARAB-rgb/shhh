import React, { useState } from 'react';
import {
  Search,
  Mic,
  Sparkles,
  PlusCircle,
  ExternalLink,
  Layers,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  Check,
  X,
  Smartphone,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { SaudiFlagIcon } from '../icons/AppIcons';
import { AppId } from '../../types/suite';
import { APP_REGISTRY } from '../../services/appRegistry';

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
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'apps' | 'finance' | 'business'>('all');
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteTitle, setNewSiteTitle] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [addNotice, setAddNotice] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchQuery(searchVal.trim());
  };

  const handleLuckyStrike = () => {
    const popularApps: AppId[] = ['qayd-pos', 'snns-calls', 'snns-ai', 'qayd-accounting', 'marketplace'];
    const randomApp = popularApps[Math.floor(Math.random() * popularApps.length)];
    onSelectApp(randomApp);
  };

  const handleAddSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteTitle.trim() || !newSiteUrl.trim()) return;
    setAddNotice(
      isAr
        ? `تم إرسال الموقع "${newSiteTitle}" بنجاح إلى قائمة المراجعة لفهرس SNNS.PRO المركزي.`
        : 'Site submitted for index verification.'
    );
    setTimeout(() => {
      setAddNotice(null);
      setShowAddSiteModal(false);
      setNewSiteTitle('');
      setNewSiteUrl('');
    }, 2500);
  };

  return (
    <div className="w-full flex flex-col items-center pt-2 pb-6 px-3 sm:px-4 text-center select-none">
      {/* 1. Database Badge as in image: قاعدة بيانات سحابية متكاملة */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4 backdrop-blur-xs">
        <Database className="w-3.5 h-3.5 text-emerald-400" />
        <span>{isAr ? 'قاعدة بيانات سحابية متكاملة (15 تطبيقاً مفهرساً)' : 'Integrated Cloud Database (15 Apps Indexed)'}</span>
      </div>

      {/* 2. Royal Saudi Leadership Tribute Card (exact composition from user screenshot) */}
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-4 sm:p-5 mb-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle decorative emerald glow */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-96 h-12 bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          {/* Saudi Flag & Vision 2030 Tile */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-[#006C35] flex flex-col items-center justify-center p-1.5 shadow-md border border-emerald-400/30 overflow-hidden relative group">
              <SaudiFlagIcon className="w-12 h-9" />
              <span className="text-[8px] font-black text-white/90 font-mono tracking-wider">KSA 2030</span>
            </div>
            <div className="text-start">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-1">
                {isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                {isAr ? 'طموح يعانق عنان السماء' : 'Ambition Embraces the Sky'}
              </h4>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                {isAr ? 'رؤية المملكة 2030 المباركة' : 'Saudi Vision 2030'}
              </span>
            </div>
          </div>

          {/* Leadership Tribute Text */}
          <div className="text-center sm:text-end border-t sm:border-t-0 sm:border-s border-slate-800/80 pt-3 sm:pt-0 sm:ps-4 flex-1">
            <p className="text-[11px] sm:text-xs font-bold text-slate-200 leading-relaxed">
              {isAr ? (
                <>
                  <span className="text-emerald-400">خادم الحرمين الشريفين</span> الملك سلمان بن عبدالعزيز
                  <br />
                  و<span className="text-emerald-400">ولي العهد رئيس مجلس الوزراء</span> صاحب السمو الملكي الأمير محمد بن سلمان
                </>
              ) : (
                <>
                  Custodian of the Two Holy Mosques King Salman bin Abdulaziz
                  <br />& HRH Crown Prince Prime Minister Mohammed bin Salman
                </>
              )}
            </p>
            <span className="text-[10px] text-amber-400/90 font-semibold mt-1 inline-flex items-center gap-1">
              <span>★</span>
              <span>{isAr ? 'القيادة الرشيدة ومسيرة التحول الرقمي الوطني' : 'Wise Leadership & Digital Transformation'}</span>
              <span>★</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. PRO . SNNS Signature Glowing Brand Identity */}
      <div className="mb-2">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight flex items-center justify-center gap-2 select-text">
          <span className="text-emerald-500 drop-shadow-[0_2px_16px_rgba(16,185,129,0.35)]">PRO</span>
          <span className="text-amber-400 text-3xl sm:text-5xl font-black drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse">
            .
          </span>
          <span className="text-emerald-400 drop-shadow-[0_2px_16px_rgba(16,185,129,0.35)]">SNNS</span>
        </h1>
        <p className="text-xs sm:text-sm text-emerald-400/90 font-medium mt-2 flex items-center justify-center gap-2">
          <span>{isAr ? 'محرك البحث السحابي المتقدم' : 'Advanced Cloud Search Engine'}</span>
          <span>•</span>
          <span>{isAr ? 'معالجة اللغة الطبيعية (NLP) وفهرسة الويب' : 'NLP & Web Indexing'}</span>
        </p>
      </div>

      {/* 4. Unified Search Bar */}
      <div className="w-full max-w-2xl mt-4 mb-4">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="relative flex items-center bg-slate-950/90 hover:bg-slate-950 border-2 border-slate-800 hover:border-emerald-500/60 focus-within:border-emerald-500 rounded-full shadow-2xl transition duration-200">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={isAr ? 'ابحث في الويب وفهرس المواقع السحابية SNNS.PRO...' : 'Search cloud web & indexed apps...'}
              className="w-full bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm py-3.5 ps-6 pe-20 focus:outline-none"
            />

            <div className="absolute end-3 flex items-center gap-1.5 text-slate-400">
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
                className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition shadow-md cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* 5. Search Action Buttons from screenshot */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          <button
            onClick={() => onSearchQuery(searchVal.trim())}
            className="px-5 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'بحث في SNNS.PRO' : 'Search SNNS.PRO'}</span>
          </button>

          <button
            onClick={handleLuckyStrike}
            className="px-5 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'ضربة حظ' : "I'm Feeling Lucky"}</span>
          </button>

          <button
            onClick={() => setShowAddSiteModal(true)}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white border border-emerald-500/30 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isAr ? 'أضف موقعاً جديداً للفهرس' : 'Add Site to Index'}</span>
          </button>
        </div>

        {/* 6. Trending Topics Pills from screenshot */}
        <div className="w-full mt-5 p-3 rounded-2xl bg-slate-950/50 border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'المواضيع الشائعة والبحث السريع:' : 'Trending & Quick Topics:'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { labelAr: 'رؤية السعودية 2030', query: 'رؤية السعودية 2030', appId: 'snns-ai' as AppId },
              { labelAr: 'اتصال بأحبابك (SNNS Calls)', query: 'مكالمات', appId: 'snns-calls' as AppId },
              { labelAr: 'كاشير قيد (QAYD POS)', query: 'كاشير', appId: 'qayd-pos' as AppId },
              { labelAr: 'محاسبة مالية (QAYD)', query: 'محاسبة', appId: 'qayd-accounting' as AppId },
            ].map((pill, idx) => (
              <button
                key={idx}
                onClick={() => onSelectApp(pill.appId)}
                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-slate-500" />
                <span>{pill.labelAr}</span>
              </button>
            ))}
          </div>
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
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{addNotice}</span>
              </div>
            ) : (
              <form onSubmit={handleAddSiteSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">اسم الموقع أو الخدمة:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: متجر الرياض للتقنية..."
                    value={newSiteTitle}
                    onChange={(e) => setNewSiteTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">الرابط السحابي (URL):</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com"
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSiteModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                  >
                    إرسال للفهرسة
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
