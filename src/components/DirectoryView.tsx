import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  Layers,
  Search,
  Plus,
  TrendingUp,
  Tag,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  Sparkles,
  Database,
} from 'lucide-react';
import { IndexedSite } from '../types';
import { incrementSiteClick } from '../firebase/firestore';

interface DirectoryViewProps {
  sites: IndexedSite[];
  isArabic: boolean;
  onOpenAddModal: () => void;
  onSelectSiteQuery: (query: string) => void;
  onOpenCms?: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  sites,
  isArabic,
  onOpenAddModal,
  onSelectSiteQuery,
  onOpenCms,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'clicks' | 'newest' | 'alpha'>('clicks');

  // Filter
  const filteredSites = sites
    .filter((site) => {
      const matchCat = selectedCategory === 'all' || site.category === selectedCategory;
      const matchSearch =
        !searchTerm ||
        site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (site.tags && site.tags.toLowerCase().includes(searchTerm.toLowerCase())) ||
        site.url.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'clicks') {
        return (b.clicks || 0) - (a.clicks || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const categories = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: '🌐' },
    { id: 'tech', labelAr: 'تقنية وبرمجة', labelEn: 'Tech & Code', icon: '💻' },
    { id: 'news', labelAr: 'أخبار وإعلام', labelEn: 'News & Media', icon: '📰' },
    { id: 'tools', labelAr: 'أدوات وخدمات', labelEn: 'Tools & Utilities', icon: '🛠️' },
    { id: 'education', labelAr: 'تعليم وأبحاث', labelEn: 'Education', icon: '🎓' },
    { id: 'media', labelAr: 'وسائط وميديا', labelEn: 'Media & Art', icon: '🎬' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 mb-8 relative overflow-hidden border border-emerald-700/60">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
              <img
                src="/src/assets/images/saudi_flag_1790155732774.jpg"
                alt="علم المملكة العربية السعودية"
                referrerPolicy="no-referrer"
                className="w-5 h-3.5 object-cover rounded-xs"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isArabic ? 'دليل الويب السحابي الموثق • المملكة العربية السعودية' : 'Verified Cloud Web Directory • Saudi Arabia'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              {isArabic ? 'فهرس مواقع SNNS.PRO السحابي' : 'SNNS.PRO Cloud Directory'}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              {isArabic
                ? 'استكشف المواقع والروابط المفهرسة في قاعدة البيانات السحابية فائقة السرعة، أو أضف موقعك الخاص ليصبح متاحاً للبحث الفوري.'
                : 'Explore sites indexed in the ultra-fast cloud database, or submit your own link to become discoverable instantly.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            {onOpenCms && (
              <button
                onClick={onOpenCms}
                className="px-4 py-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-950 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 border border-emerald-600/40"
              >
                <Database className="w-4 h-4 text-emerald-300" />
                <span>{isArabic ? 'إدارة في CMS' : 'Manage in CMS'}</span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>{isArabic ? 'أضف موقعاً جديداً' : 'Index New Site'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Search inside directory */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 right-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isArabic ? 'تصفية المواقع المفهرسة...' : 'Filter indexed sites...'}
            className="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        {/* Sort select */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <ArrowUpDown className="w-4 h-4 text-zinc-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="clicks">{isArabic ? 'الأكثر زيارة' : 'Most Popular'}</option>
            <option value="newest">{isArabic ? 'الأحدث إضافة' : 'Newest'}</option>
            <option value="alpha">{isArabic ? 'أبجدياً' : 'Alphabetical'}</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-105'
                : 'bg-white dark:bg-zinc-900 border border-emerald-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-emerald-400'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{isArabic ? cat.labelAr : cat.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Grid of Indexed Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSites.map((site) => {
          let domain = '';
          try {
            domain = new URL(site.url).hostname.replace(/^www\./, '');
          } catch {
            domain = site.url;
          }

          return (
            <div
              key={site.id}
              className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-zinc-800 rounded-2xl p-5 hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Icon & Category */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    {site.favicon ? (
                      <img
                        src={site.favicon}
                        alt=""
                        className="w-7 h-7 rounded-lg p-0.5 bg-emerald-50 dark:bg-zinc-800 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                        <Globe className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-zinc-500 truncate" dir="ltr">
                      {domain}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                    {site.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-1.5 line-clamp-1">
                  {site.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3 mb-4">
                  {site.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-emerald-50 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {site.clicks || 0} {isArabic ? 'زيارة' : 'clicks'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectSiteQuery(site.title)}
                    className="text-[11px] font-medium text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  >
                    {isArabic ? 'بحث عنه' : 'Search'}
                  </button>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => incrementSiteClick(site.id)}
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                    title={isArabic ? 'زيارة الموقع مباشرة' : 'Visit Site'}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-zinc-800">
          <Globe className="w-12 h-12 text-emerald-300 dark:text-emerald-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            {isArabic ? 'لم يتم العثور على مواقع مطابقة' : 'No matching sites found'}
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            {isArabic
              ? 'جرّب تصنيفاً مختلفاً أو أضف هذا الرابط الآن إلى فهرس SNNS.PRO السحابي!'
              : 'Try a different category or add this site to the SNNS.PRO cloud index!'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إضافة هذا الموقع الآن' : 'Index this site now'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
