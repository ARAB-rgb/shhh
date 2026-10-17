import React, { useState } from 'react';
import {
  Globe,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  ShieldCheck,
  TrendingUp,
  Tag,
  Clock,
  Edit3,
  Target,
  X,
  RotateCcw,
} from 'lucide-react';
import { GroundedResult, RankedIndexedSite, SearchCategory, IndexedSite } from '../types';
import { incrementSiteClick } from '../firebase/firestore';

interface SearchResultsProps {
  query: string;
  category: SearchCategory;
  setCategory: (cat: SearchCategory) => void;
  groundedResults: GroundedResult[];
  cloudResults: RankedIndexedSite[];
  searchTimeSeconds: number;
  isArabic: boolean;
  bookmarkedUrls: Set<string>;
  onToggleBookmark: (url: string, title: string, domain: string, favicon?: string) => void;
  onEditInCms?: (site: IndexedSite) => void;
  onClearSearch?: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  category,
  setCategory,
  groundedResults,
  cloudResults,
  searchTimeSeconds,
  isArabic,
  bookmarkedUrls,
  onToggleBookmark,
  onEditInCms,
  onClearSearch,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleLinkClick = (siteId?: string) => {
    if (siteId) {
      incrementSiteClick(siteId);
    }
  };

  // Filter items based on active category
  let displayedCloud = cloudResults;
  if (category === 'news') {
    displayedCloud = cloudResults.filter((s) => s.category === 'news');
  } else if (category === 'academic') {
    displayedCloud = cloudResults.filter((s) => s.category === 'education' || s.category === 'academic');
  }

  const totalResultsCount =
    (category === 'cloud' ? 0 : groundedResults.length) + displayedCloud.length;

  return (
    <div className="w-full space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Category Tabs & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 dark:border-emerald-950 pb-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === 'all'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700'
            }`}
          >
            {isArabic ? '🌐 الكل' : '🌐 All'}
          </button>

          <button
            onClick={() => setCategory('cloud')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              category === 'cloud'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700'
            }`}
          >
            <span>⚡ {isArabic ? 'الفهرس السحابي' : 'Cloud Index'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                category === 'cloud' ? 'bg-emerald-900 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {cloudResults.length}
            </span>
          </button>

          <button
            onClick={() => setCategory('news')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === 'news'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700'
            }`}
          >
            {isArabic ? '📰 أخبار' : '📰 News'}
          </button>

          <button
            onClick={() => setCategory('images')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === 'images'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700'
            }`}
          >
            {isArabic ? '🖼️ صور ومصادر' : '🖼️ Images'}
          </button>

          <button
            onClick={() => setCategory('academic')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === 'academic'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700'
            }`}
          >
            {isArabic ? '🎓 أبحاث وأكاديمي' : '🎓 Academic'}
          </button>
        </div>

        {/* Search Stats & Clear Search Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="hidden sm:inline">
            {isArabic
              ? `حوالي ${(totalResultsCount * 1420 + 380).toLocaleString()} نتيجة (${searchTimeSeconds} ثانية)`
              : `About ${(totalResultsCount * 1420 + 380).toLocaleString()} results (${searchTimeSeconds}s)`}
          </span>

          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/60 transition-all cursor-pointer shadow-2xs"
              title={isArabic ? 'مسح البحث والعودة للصفحة الرئيسية' : 'Clear search and go to home'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isArabic ? 'مسح البحث' : 'Clear Search'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cloud Database Matches Banner if available */}
      {displayedCloud.length > 0 && category === 'all' && (
        <div className="p-3 bg-gradient-to-r from-emerald-50 via-green-50/50 to-white dark:from-emerald-950/40 dark:to-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold">
              {isArabic
                ? `عُثر على ${displayedCloud.length} موقع مرتب بالذكاء الاصطناعي (NLP) في قاعدة البيانات السحابية:`
                : `Found ${displayedCloud.length} NLP-ranked verified sites in Cloud Database:`}
            </span>
          </div>
          <button
            onClick={() => setCategory('cloud')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {isArabic ? 'عرض كل المواقع السحابية' : 'View all'}
          </button>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-6 pt-1">
        {/* Render Cloud Database Results First if any */}
        {(category === 'all' || category === 'cloud') &&
          displayedCloud.map((site) => {
            const isSaved = bookmarkedUrls.has(site.url);
            let domain = '';
            try {
              domain = new URL(site.url).hostname.replace(/^www\./, '');
            } catch {
              domain = site.url;
            }

            return (
              <article
                key={site.id}
                className="group p-4 -mx-3 rounded-2xl bg-white dark:bg-zinc-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all border border-emerald-100/70 dark:border-zinc-800/80 hover:border-emerald-300 dark:hover:border-emerald-800 shadow-2xs hover:shadow-sm"
              >
                {/* Domain & Favicon & Badges */}
                <div className="flex items-center justify-between mb-1 gap-2">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(site.id)}
                    className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:underline truncate max-w-lg"
                  >
                    {site.favicon ? (
                      <img
                        src={site.favicon}
                        alt=""
                        className="w-4 h-4 rounded-sm shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="font-medium text-zinc-800 dark:text-zinc-300" dir="ltr">
                      {domain}
                    </span>
                    <span className="text-zinc-400">›</span>
                    <span className="text-[11px] text-zinc-500 truncate" dir="ltr">
                      {site.url.replace(/^https?:\/\//, '')}
                    </span>
                  </a>

                  {/* Badges: Relevance Score & Cloud Verified */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {site.relevanceScore !== undefined && (
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-600" />
                        <span>{site.relevanceScore}% {isArabic ? 'تطابق دلالي' : 'Relevance'}</span>
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      <span>{isArabic ? 'سحابي موثق' : 'Cloud Verified'}</span>
                    </span>
                  </div>
                </div>

                {/* Clickable Title */}
                <h3 className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-400 group-hover:underline cursor-pointer mb-1 leading-snug">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(site.id)}
                  >
                    {site.title}
                  </a>
                </h3>

                {/* Snippet */}
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                  {site.description}
                </p>

                {/* Tags and Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-zinc-400">
                  <div className="flex flex-wrap items-center gap-2">
                    {site.tags && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        <span>{site.tags}</span>
                      </div>
                    )}
                    {site.clicks !== undefined && (
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>
                          {site.clicks} {isArabic ? 'زيارة' : 'clicks'}
                        </span>
                      </span>
                    )}
                    {site.matchedConcepts && site.matchedConcepts.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/60">
                        <span>{isArabic ? 'مفاهيم مطابقة:' : 'Matched:'}</span>
                        <span>{site.matchedConcepts.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1">
                    {onEditInCms && (
                      <button
                        onClick={() => onEditInCms(site)}
                        className="px-2 py-1 rounded-lg hover:bg-emerald-100/70 dark:hover:bg-zinc-800 text-zinc-500 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        title={isArabic ? 'تعديل هذا الرابط في CMS' : 'Edit in CMS'}
                      >
                        <Edit3 className="w-3 h-3 text-emerald-600" />
                        <span>{isArabic ? 'تعديل في CMS' : 'Edit'}</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        onToggleBookmark(site.url, site.title, domain, site.favicon)
                      }
                      className={`p-1.5 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors ${
                        isSaved ? 'text-amber-500 font-bold' : 'text-zinc-400'
                      }`}
                      title={isArabic ? 'حفظ في المفضلة' : 'Save Bookmark'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyLink(site.url)}
                      className="p-1.5 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      title={isArabic ? 'نسخ الرابط' : 'Copy Link'}
                    >
                      {copiedUrl === site.url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

        {/* Live Grounded Web Results */}
        {category !== 'cloud' &&
          groundedResults.map((item, idx) => {
            const isSaved = bookmarkedUrls.has(item.url);

            return (
              <article
                key={idx}
                className="group p-4 -mx-3 rounded-2xl bg-white dark:bg-zinc-900/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all border border-zinc-200/60 dark:border-zinc-800/80 hover:border-emerald-300 dark:hover:border-emerald-800 shadow-2xs"
              >
                {/* Domain & Favicon */}
                <div className="flex items-center justify-between mb-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:underline truncate max-w-lg"
                  >
                    <img
                      src={item.favicon}
                      alt=""
                      className="w-4 h-4 rounded-sm shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="font-medium text-zinc-800 dark:text-zinc-300" dir="ltr">
                      {item.domain}
                    </span>
                    <span className="text-zinc-400">›</span>
                    <span className="text-[11px] text-zinc-500 truncate" dir="ltr">
                      {item.url.replace(/^https?:\/\//, '')}
                    </span>
                  </a>

                  <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0">
                    {isArabic ? 'ويب مباشر' : 'Live Web'}
                  </span>
                </div>

                {/* Clickable Title */}
                <h3 className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-400 group-hover:underline cursor-pointer mb-1 leading-snug">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>

                {/* Snippet */}
                {item.snippet && (
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                    {item.snippet}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{isArabic ? 'محدث في الوقت الفعلي' : 'Real-time updated'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onToggleBookmark(item.url, item.title, item.domain, item.favicon)
                      }
                      className={`p-1.5 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors ${
                        isSaved ? 'text-amber-500 font-bold' : 'text-zinc-400'
                      }`}
                      title={isArabic ? 'حفظ في المفضلة' : 'Save Bookmark'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyLink(item.url)}
                      className="p-1.5 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      title={isArabic ? 'نسخ الرابط' : 'Copy Link'}
                    >
                      {copiedUrl === item.url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

        {/* Empty State */}
        {totalResultsCount === 0 && (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-emerald-100 dark:border-zinc-800">
            <Globe className="w-12 h-12 text-emerald-300 dark:text-emerald-700 mx-auto mb-3" />
            <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              {isArabic ? `لم يتم العثور على نتائج لـ "${query}"` : `No results found for "${query}"`}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-4">
              {isArabic
                ? 'تأكد من كتابة الكلمات بشكل صحيح، أو جرب مصطلحات أكثر عمومية، أو أضف هذا الرابط مباشرة إلى فهرس SNNS.PRO السحابي!'
                : 'Check spelling, try broader keywords, or index this website directly into the SNNS.PRO cloud database!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
