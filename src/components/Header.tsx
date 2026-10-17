import React from 'react';
import {
  Globe,
  PlusCircle,
  Bookmark,
  Sun,
  Moon,
  Languages,
  Database,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  isArabic: boolean;
  setIsArabic: (val: boolean) => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onOpenAddModal: () => void;
  onOpenBookmarks: () => void;
  onOpenDirectory: () => void;
  onOpenCms: () => void;
  onHomeClick: () => void;
  isSearching: boolean;
  indexedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isArabic,
  setIsArabic,
  isDark,
  setIsDark,
  onOpenAddModal,
  onOpenBookmarks,
  onOpenDirectory,
  onOpenCms,
  onHomeClick,
  isSearching,
  indexedCount,
}) => {
  return (
    <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between border-b border-emerald-100 dark:border-emerald-950/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Left side / Brand when searching */}
      <div className="flex items-center gap-3">
        {isSearching ? (
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            {/* Saudi Flag Badge */}
            <img
              src="/src/assets/images/saudi_flag_1790155732774.jpg"
              alt="علم المملكة العربية السعودية"
              referrerPolicy="no-referrer"
              className="w-7 h-5 object-cover rounded shadow-xs border border-emerald-300 dark:border-emerald-800"
            />
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <span className="font-black text-sm tracking-tighter">SP</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black tracking-tight text-emerald-950 dark:text-white font-mono flex items-center gap-1">
                SNNS<span className="text-emerald-600">.</span>PRO
              </span>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            {/* Saudi Flag Emblem */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
              <img
                src="/src/assets/images/saudi_flag_1790155732774.jpg"
                alt="علم المملكة العربية السعودية"
                referrerPolicy="no-referrer"
                className="w-5 h-3.5 object-cover rounded-xs shadow-2xs"
              />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {isArabic ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {isArabic
                  ? `قاعدة البيانات السحابية نشطة (${indexedCount} موقع مفهرس)`
                  : `Cloud DB Active (${indexedCount} Indexed Sites)`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right side navigation buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* CMS Dashboard / نظام إدارة المحتوى */}
        <button
          onClick={onOpenCms}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 dark:bg-emerald-900 dark:hover:bg-emerald-800 transition-all shadow-sm cursor-pointer border border-emerald-700"
          title={isArabic ? 'نظام إدارة المحتوى السحابي (CMS)' : 'Cloud CMS Dashboard'}
        >
          <Database className="w-3.5 h-3.5 text-emerald-300" />
          <span>{isArabic ? 'إدارة المحتوى (CMS)' : 'CMS'}</span>
        </button>

        {/* Directory / دليل المواقع */}
        <button
          onClick={onOpenDirectory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 transition-colors"
          title={isArabic ? 'تصفح دليل المواقع السحابية' : 'Browse Cloud Directory'}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span className="hidden md:inline">{isArabic ? 'دليل المواقع' : 'Directory'}</span>
        </button>

        {/* Add Link / إضافة رابط */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
          title={isArabic ? 'إضافة رابط جديد للفهرس' : 'Add New Link'}
        >
          <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isArabic ? 'أضف موقعاً' : 'Add Site'}</span>
        </button>

        {/* Bookmarks */}
        <button
          onClick={onOpenBookmarks}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 transition-colors"
          title={isArabic ? 'المواقع المحفوظة' : 'Bookmarks'}
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setIsArabic(!isArabic)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 transition-colors"
          title={isArabic ? 'Switch to English' : 'التحويل للعربية'}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{isArabic ? 'EN' : 'عربي'}</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 transition-colors"
          title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
        </button>
      </div>
    </header>
  );
};
