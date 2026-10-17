import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppId, RecentDocument, DynamicAppTile, PageLayoutConfig } from '../../types/suite';
import { DynamicIconRenderer } from '../admin/DynamicIconRenderer';
import { storage } from '../../services/storage';
import { SaudiSearchHero } from './SaudiSearchHero';
import {
  WordIcon,
  ExcelIcon,
  PowerPointIcon,
  FormsSurveyIcon,
  SnnsAiIcon,
  PrinterAppIcon,
  ClipchampIcon,
  MarketplaceIcon,
  AccountIcon,
  QaydPosIcon,
  QaydAccountingIcon,
  CallsIcon,
  ChatIcon,
  EducationIcon,
} from '../icons/AppIcons';
import {
  Plus,
  Clock,
  ExternalLink,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sliders,
  EyeOff,
  Scale,
  Bot,
  Printer,
  Video,
  X,
  Check,
  Settings,
  Star,
  Smartphone,
  Layers,
  Compass,
  LayoutGrid,
} from 'lucide-react';

interface LauncherHubProps {
  onSelectApp: (app: AppId) => void;
  lang: 'en' | 'ar';
  searchFilter?: string;
  recentDocs: RecentDocument[];
  onOpenRecentDoc: (doc: RecentDocument) => void;
  tiles: DynamicAppTile[];
  pageLayout: PageLayoutConfig;
  isAdminMode: boolean;
  onOpenAdminPanel: (tileId?: string) => void;
  onOpenAddAppModal: () => void;
  onMoveTile?: (index: number, direction: 'up' | 'down') => void;
  onSaveTiles?: (tiles: DynamicAppTile[]) => void;
  onOpenPwaModal?: (appId?: AppId) => void;
  isDarkMode?: boolean;
}

const APP_CATEGORY_MAP: Record<string, string> = {
  'qayd-pos': 'pos_finance',
  'qayd-accounting': 'pos_finance',
  'snns-calls': 'communications',
  'skype': 'communications',
  'snns-chat': 'communications',
  'teams': 'communications',
  'outlook': 'communications',
  'business': 'business',
  'marketplace': 'business',
  'account': 'business',
  'word': 'productivity',
  'excel': 'productivity',
  'powerpoint': 'productivity',
  'onedrive': 'productivity',
  'calendar': 'productivity',
  'forms': 'productivity',
  'todo': 'productivity',
  'onenote': 'productivity',
  'printer': 'productivity',
  'snns-ai': 'ai_education',
  'snns-education': 'ai_education',
  'copilot': 'ai_education',
  'designer': 'ai_education',
  'clipchamp': 'ai_education',
};

export const LauncherHub: React.FC<LauncherHubProps> = ({
  onSelectApp,
  lang,
  searchFilter = '',
  recentDocs,
  onOpenRecentDoc,
  tiles,
  pageLayout,
  isAdminMode,
  onOpenAdminPanel,
  onOpenAddAppModal,
  onMoveTile,
  onSaveTiles,
  onOpenPwaModal,
  isDarkMode = true,
}) => {
  const isAr = lang === 'ar';

  // Hero Mode: 'saudi-search' (Inspiration reference) | 'workspace-banner' (Classic Suite)
  const [heroMode, setHeroMode] = useState<'saudi-search' | 'workspace-banner'>('saudi-search');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(() => storage.getFavorites());

  // Quick Rename Modal State for direct tile name editing
  const [quickRenameTile, setQuickRenameTile] = useState<DynamicAppTile | null>(null);
  const [quickLabelAr, setQuickLabelAr] = useState<string>('');
  const [quickLabelEn, setQuickLabelEn] = useState<string>('');
  const [quickBadge, setQuickBadge] = useState<string>('');
  const [quickToast, setQuickToast] = useState<string | null>(null);

  useEffect(() => {
    const handleFavUpdate = () => {
      setFavorites(storage.getFavorites());
    };
    window.addEventListener('snns_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('snns_favorites_updated', handleFavUpdate);
  }, []);

  const handleToggleFavorite = (appTargetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storage.toggleFavorite(appTargetId);
    setFavorites(updated);
  };

  // Category horizontal scroll state & controls
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = useState<boolean>(false);
  const [canScrollEnd, setCanScrollEnd] = useState<boolean>(false);
  const [isCatDragging, setIsCatDragging] = useState<boolean>(false);
  const [catDragStartX, setCatDragStartX] = useState<number>(0);
  const [catDragScrollLeft, setCatDragScrollLeft] = useState<number>(0);

  const checkCategoryScroll = useCallback(() => {
    const el = catScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 4) {
      setCanScrollStart(false);
      setCanScrollEnd(false);
      return;
    }

    const current = el.scrollLeft;
    if (isAr) {
      // In RTL Chromium & Firefox, current scrollLeft is 0 at the start (rightmost),
      // and negative as we scroll leftward towards the end.
      const absVal = Math.abs(current);
      setCanScrollStart(absVal > 4);
      setCanScrollEnd(absVal < maxScroll - 4);
    } else {
      // In LTR, current scrollLeft is 0 at the start (leftmost), positive towards end.
      setCanScrollStart(current > 4);
      setCanScrollEnd(current < maxScroll - 4);
    }
  }, [isAr]);

  useEffect(() => {
    checkCategoryScroll();
    const handleResize = () => checkCategoryScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkCategoryScroll, selectedCategory, favorites.length]);

  const handleScrollCategories = (direction: 'prev' | 'next') => {
    const el = catScrollRef.current;
    if (!el) return;
    const step = 260;

    if (isAr) {
      // In RTL:
      // 'next' reveals items further to the left (negative scroll)
      // 'prev' returns items to the right towards start (positive scroll)
      const sign = direction === 'next' ? -1 : 1;
      el.scrollBy({ left: sign * step, behavior: 'smooth' });
    } else {
      // In LTR:
      // 'next' reveals items to the right (positive scroll)
      // 'prev' returns items to the left (negative scroll)
      const sign = direction === 'next' ? 1 : -1;
      el.scrollBy({ left: sign * step, behavior: 'smooth' });
    }

    setTimeout(checkCategoryScroll, 320);
  };

  const handleCatMouseDown = (e: React.MouseEvent) => {
    const el = catScrollRef.current;
    if (!el) return;
    setIsCatDragging(true);
    setCatDragStartX(e.pageX - el.offsetLeft);
    setCatDragScrollLeft(el.scrollLeft);
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    const el = catScrollRef.current;
    if (!isCatDragging || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - catDragStartX) * 1.5;
    el.scrollLeft = catDragScrollLeft - walk;
    checkCategoryScroll();
  };

  const handleCatMouseUpOrLeave = () => {
    setIsCatDragging(false);
    checkCategoryScroll();
  };

  const handleSaveQuickRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRenameTile) return;

    const updatedTiles = tiles.map((t) =>
      t.id === quickRenameTile.id
        ? {
            ...t,
            labelAr: quickLabelAr.trim() || t.labelAr,
            labelEn: quickLabelEn.trim() || t.labelEn,
            badge: quickBadge.trim() || undefined,
          }
        : t
    );

    if (onSaveTiles) {
      onSaveTiles(updatedTiles);
    } else {
      storage.saveLauncherTiles(updatedTiles);
    }

    setQuickToast(isAr ? 'تم حفظ وتعديل اسم التطبيق بنجاح! ✓' : 'App renamed successfully! ✓');
    setTimeout(() => {
      setQuickToast(null);
      setQuickRenameTile(null);
    }, 1200);
  };

  const handleTileClick = (tile: DynamicAppTile) => {
    if (tile.externalUrl) {
      window.open(tile.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (tile.appTargetId && tile.appTargetId !== 'custom-link') {
      onSelectApp(tile.appTargetId as AppId);
    }
  };

  const visibleTiles = tiles.filter((t) => (isAdminMode ? true : t.visible));

  const categoryFiltered = visibleTiles.filter((tile) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'favorites') {
      return favorites.includes(tile.appTargetId) || favorites.includes(tile.id);
    }
    const cat = APP_CATEGORY_MAP[tile.appTargetId] || APP_CATEGORY_MAP[tile.id] || 'productivity';
    return cat === selectedCategory;
  });

  const filteredApps = searchFilter
    ? categoryFiltered.filter(
        (a) =>
          a.labelEn.toLowerCase().includes(searchFilter.toLowerCase()) ||
          a.labelAr.toLowerCase().includes(searchFilter.toLowerCase()) ||
          a.id.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : categoryFiltered;

  const containerWidthClass =
    pageLayout.cardWidth === 'wide'
      ? 'max-w-[960px]'
      : pageLayout.cardWidth === 'compact'
      ? 'max-w-[680px]'
      : 'max-w-[840px]';

  const gridColsClass =
    pageLayout.gridColumns === 4
      ? 'grid-cols-4'
      : pageLayout.gridColumns === 6
      ? 'grid-cols-6'
      : 'grid-cols-5';

  return (
    <div className={`w-full ${containerWidthClass} mx-auto py-5 sm:py-7 px-3 sm:px-6 flex flex-col items-center transition-all duration-300`}>
      {/* Admin Mode Floating Control Banner */}
      {isAdminMode && (
        <div className="w-full mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs shrink-0">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                <span>{isAr ? 'لوحة تحكم وتوازن الصفحة مفعّلة' : 'Admin & Layout Balance Active'}</span>
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono">
                  {pageLayout.gridColumns} cols • {pageLayout.cardWidth}
                </span>
              </div>
              <p className="text-[11px] text-amber-100">
                {isAr
                  ? 'يمكنك تعديل أسماء الأيقونات، الأشكال، إضافة لوقو مخصص، ربط التطبيقات، وموازنة الشبكة.'
                  : 'Customize icon names, shapes, custom logos, app links, and balance grid layout.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAdminPanel()}
              className="px-3.5 py-1.5 bg-white text-amber-950 font-black text-xs rounded-xl shadow-xs hover:bg-amber-50 transition flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تخصيص المشغل' : 'Customize'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Mode Segmented Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/60 border border-slate-800 rounded-2xl mb-4 backdrop-blur-md self-center">
        <button
          onClick={() => setHeroMode('saudi-search')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            heroMode === 'saudi-search'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{isAr ? 'واجهة الهوية والبحث السعودي' : 'Saudi Search & Vision'}</span>
        </button>

        <button
          onClick={() => setHeroMode('workspace-banner')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            heroMode === 'workspace-banner'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>{isAr ? 'مساحة العمل السحابية' : 'Cloud Workspace'}</span>
        </button>
      </div>

      {/* Render Selected Hero */}
      {heroMode === 'saudi-search' ? (
        <SaudiSearchHero
          onSearchQuery={(q) => onSelectApp('snns-ai')}
          onSelectApp={onSelectApp}
          lang={lang}
          isDarkMode={isDarkMode}
          onOpenPwaModal={() => onOpenPwaModal && onOpenPwaModal()}
        />
      ) : pageLayout.showHeroBanner ? (
        <div className="w-full bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 rounded-3xl p-5 sm:p-7 mb-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-start flex-1">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAr ? 'منظومة تطبيقات SNNS.PRO السعودية' : 'Official SNNS.PRO Ecosystem'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isAr ? 'مساحة العمل السحابية والتجارية الموحدة' : 'SNNS Unified Workspace & Commerce'}
              </h1>
              <p className="text-emerald-100 text-[11px] sm:text-xs mt-1.5 leading-relaxed max-w-xl">
                {isAr
                  ? 'منظومة سحابية شاملة: كاشير قيد POS، محاسبة قيد Accounting، مكالمات Calls، محادثات Chat، بريد Mail، وسحابة Cloud.'
                  : 'Comprehensive ecosystem: QAYD POS, QAYD Accounting, Calls, Chat, Mail, and Cloud storage.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={() => onSelectApp('qayd-pos')}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-300/30"
              >
                <QaydPosIcon className="w-4 h-4" />
                <span>{isAr ? 'كاشير قيد POS' : 'QAYD POS'}</span>
              </button>

              <button
                onClick={() => onSelectApp('qayd-accounting')}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
              >
                <QaydAccountingIcon className="w-4 h-4" />
                <span>{isAr ? 'محاسبة قيد' : 'QAYD Ledger'}</span>
              </button>

              <button
                onClick={() => onSelectApp('snns-calls')}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CallsIcon className="w-4 h-4 text-sky-300" />
                <span>{isAr ? 'مكالمات Calls' : 'SNNS Calls'}</span>
              </button>
            </div>
          </div>
          <div className="absolute end-0 bottom-0 translate-x-12 translate-y-12 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      ) : null}

      {/* Categories & Filter Tabs Bar with Luxury Smooth Horizontal Navigation */}
      <div className="w-full flex items-center justify-between gap-2.5 mb-3 px-1 text-xs select-none">
        {/* Scroll Container Wrapper with Navigation Arrows */}
        <div className="flex-1 relative flex items-center min-w-0">
          {/* Previous / Start Navigation Arrow */}
          <button
            type="button"
            onClick={() => handleScrollCategories('prev')}
            disabled={!canScrollStart}
            aria-hidden={!canScrollStart}
            tabIndex={canScrollStart ? 0 : -1}
            className={`p-1.5 rounded-xl border transition-all duration-300 shrink-0 cursor-pointer flex items-center justify-center z-10 me-1.5 ${
              canScrollStart
                ? isDarkMode
                  ? 'bg-slate-900/95 hover:bg-slate-800 text-emerald-400 border-emerald-500/30 hover:border-emerald-400/70 shadow-lg scale-100 opacity-100 hover:shadow-emerald-950/40'
                  : 'bg-white hover:bg-slate-100 text-emerald-600 border-slate-300 hover:border-emerald-500 shadow-md scale-100 opacity-100'
                : 'opacity-0 pointer-events-none scale-75 w-0 p-0 border-transparent overflow-hidden'
            }`}
            title={isAr ? 'التصنيفات السابقة' : 'Previous categories'}
            aria-label={isAr ? 'التصنيفات السابقة' : 'Previous categories'}
          >
            {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Fade gradient mask at start */}
          {canScrollStart && (
            <div
              className={`absolute start-0 top-0 bottom-0 w-8 pointer-events-none z-5 transition-opacity duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-e from-[#0A0D0C] to-transparent'
                  : 'bg-gradient-to-e from-[#F3F2F1] to-transparent'
              }`}
            />
          )}

          {/* Scrollable Categories List without gray scrollbar */}
          <div
            ref={catScrollRef}
            onScroll={checkCategoryScroll}
            onMouseDown={handleCatMouseDown}
            onMouseMove={handleCatMouseMove}
            onMouseUp={handleCatMouseUpOrLeave}
            onMouseLeave={handleCatMouseUpOrLeave}
            className={`flex items-center gap-1.5 overflow-x-auto scrollbar-none snns-scroll-touch py-1 px-0.5 scroll-smooth ${
              isCatDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
          >
            {[
              { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Layers },
              { id: 'favorites', labelAr: `المفضلة (${favorites.length})`, labelEn: `Favorites (${favorites.length})`, icon: Star },
              { id: 'pos_finance', labelAr: 'كاشير ومحاسبة قيد', labelEn: 'QAYD POS & Ledger', icon: QaydPosIcon },
              { id: 'communications', labelAr: 'الاتصالات والمحادثات', labelEn: 'Calls & Chat', icon: CallsIcon },
              { id: 'business', labelAr: 'الأعمال والتجارة', labelEn: 'Business & Trade', icon: MarketplaceIcon },
              { id: 'productivity', labelAr: 'المستندات والإنتاجية', labelEn: 'Docs & Office', icon: WordIcon },
              { id: 'ai_education', labelAr: 'الذكاء الاصطناعي والتعليم', labelEn: 'AI & Education', icon: SnnsAiIcon },
            ].map((cat) => {
              const isCatActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    isCatActive
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                      : isDarkMode
                      ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-slate-700'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs'
                  }`}
                >
                  {cat.id === 'favorites' ? (
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isCatActive ? 'fill-white text-white' : 'text-amber-400 fill-amber-400'
                      }`}
                    />
                  ) : (
                    <cat.icon className="w-3.5 h-3.5" />
                  )}
                  <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Fade gradient mask at end */}
          {canScrollEnd && (
            <div
              className={`absolute end-0 top-0 bottom-0 w-8 pointer-events-none z-5 transition-opacity duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-s from-[#0A0D0C] to-transparent'
                  : 'bg-gradient-to-s from-[#F3F2F1] to-transparent'
              }`}
            />
          )}

          {/* Next / End Navigation Arrow */}
          <button
            type="button"
            onClick={() => handleScrollCategories('next')}
            disabled={!canScrollEnd}
            aria-hidden={!canScrollEnd}
            tabIndex={canScrollEnd ? 0 : -1}
            className={`p-1.5 rounded-xl border transition-all duration-300 shrink-0 cursor-pointer flex items-center justify-center z-10 ms-1.5 ${
              canScrollEnd
                ? isDarkMode
                  ? 'bg-slate-900/95 hover:bg-slate-800 text-emerald-400 border-emerald-500/30 hover:border-emerald-400/70 shadow-lg scale-100 opacity-100 hover:shadow-emerald-950/40'
                  : 'bg-white hover:bg-slate-100 text-emerald-600 border-slate-300 hover:border-emerald-500 shadow-md scale-100 opacity-100'
                : 'opacity-0 pointer-events-none scale-75 w-0 p-0 border-transparent overflow-hidden'
            }`}
            title={isAr ? 'التصنيفات التالية' : 'Next categories'}
            aria-label={isAr ? 'التصنيفات التالية' : 'Next categories'}
          >
            {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Standalone PWA Button on the End Side */}
        {onOpenPwaModal && (
          <button
            onClick={() => onOpenPwaModal()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs transition shadow-sm hover:from-emerald-500 hover:to-teal-600 shrink-0 cursor-pointer"
            title={isAr ? 'تثبيت تطبيقات المنظومة بشكل مستقل PWA' : 'Install Standalone Apps PWA'}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isAr ? 'تثبيت PWA مستقل' : 'Install Apps PWA'}</span>
          </button>
        )}
      </div>

      {/* Main Apps Grid Card - Symmetrically Balanced Grid */}
      <div className={`w-full ${isDarkMode ? 'bg-slate-950/90 border-slate-850' : 'bg-white border-gray-200/90'} rounded-3xl shadow-sm border p-5 sm:p-7 mb-6 transition-colors`}>
        {pageLayout.centerIncompleteRows ? (
          /* Symmetrical Centered Flex Grid (Guarantees Perfect Balance for any app count) */
          <div className="flex flex-wrap justify-center gap-y-6 gap-x-2 sm:gap-x-4">
            {filteredApps.map((app, index) => {
              const isFav = favorites.includes(app.appTargetId) || favorites.includes(app.id);
              return (
                <div key={app.id} className="relative group w-20 sm:w-24 flex flex-col items-center">
                  {/* Favorite Quick Toggle */}
                  <button
                    onClick={(e) => handleToggleFavorite(app.appTargetId || app.id, e)}
                    className={`absolute top-0.5 start-0.5 p-1 rounded-full transition z-10 cursor-pointer ${
                      isFav
                        ? 'opacity-100 text-amber-400'
                        : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400'
                    }`}
                    title={isFav ? (isAr ? 'إزالة من المفضلة' : 'Remove Favorite') : (isAr ? 'إضافة إلى المفضلة' : 'Add to Favorites')}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>

                  {/* Tile Button */}
                  <button
                    onClick={() => handleTileClick(app)}
                    className={`w-full flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl transition cursor-pointer ${
                      !app.visible && isAdminMode
                        ? 'opacity-50 border border-dashed border-gray-300'
                        : isDarkMode
                        ? 'hover:bg-slate-900/90'
                        : 'hover:bg-gray-50/90'
                    }`}
                  >
                    {/* Badge if present */}
                    {app.badge && (
                      <span className="absolute top-1 end-1 text-[9px] font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-1.5 py-0.2 rounded-full shadow-xs z-10">
                        {app.badge}
                      </span>
                    )}

                    {/* Hidden indicator for admin */}
                    {!app.visible && isAdminMode && (
                      <span className="absolute top-1 start-1 text-[8px] bg-gray-600 text-white px-1 rounded z-10 flex items-center gap-0.5">
                        <EyeOff className="w-2.5 h-2.5" />
                        <span>{isAr ? 'مخفي' : 'Hidden'}</span>
                      </span>
                    )}

                    {/* Fixed Icon container for perfect row alignment */}
                    <div className="h-12 sm:h-14 flex items-center justify-center mb-1.5 transition-transform duration-150 group-hover:scale-105">
                      <DynamicIconRenderer tile={app} size={46} />
                    </div>

                    {/* Fixed label height so 1-line and 2-line labels never cause vertical misalignment */}
                    <div className="h-8 flex items-start justify-center w-full">
                      <span className={`text-[11px] sm:text-xs font-semibold ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-950'} transition text-center leading-tight line-clamp-2`}>
                        {isAr ? app.labelAr : app.labelEn}
                      </span>
                    </div>
                  </button>

                  {/* Standalone PWA install button on hover */}
                  {onOpenPwaModal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPwaModal(app.appTargetId as AppId);
                      }}
                      className="absolute bottom-0 end-0 opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-emerald-400 z-10"
                      title={isAr ? `تثبيت ${app.labelAr} كتطبيق PWA منفرد` : `Install ${app.labelEn} as standalone PWA`}
                    >
                      <Smartphone className="w-3 h-3" />
                    </button>
                  )}

                  {/* Admin Quick Overlay Controls on Hover */}
                  {isAdminMode && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-white rounded-lg p-0.5 flex items-center gap-0.5 shadow-lg z-20">
                      {onMoveTile && index > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveTile(index, 'up');
                          }}
                          className="p-1 hover:bg-white/20 rounded"
                          title={isAr ? 'تحريك للأمام' : 'Move left'}
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickRenameTile(app);
                          setQuickLabelAr(app.labelAr || '');
                          setQuickLabelEn(app.labelEn || '');
                          setQuickBadge(app.badge || '');
                          setQuickToast(null);
                        }}
                        className="p-1 hover:bg-white/20 rounded text-amber-300"
                        title={isAr ? 'تعديل اسم وبيانات التطبيق' : 'Quick Rename App'}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {onMoveTile && index < filteredApps.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveTile(index, 'down');
                          }}
                          className="p-1 hover:bg-white/20 rounded"
                          title={isAr ? 'تحريك للخلف' : 'Move right'}
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Standard CSS Grid */
          <div className={`grid ${gridColsClass} gap-y-6 gap-x-2 sm:gap-x-4 justify-items-center`}>
            {filteredApps.map((app, index) => {
              const isFav = favorites.includes(app.appTargetId) || favorites.includes(app.id);
              return (
                <div key={app.id} className="relative group w-20 sm:w-24 flex flex-col items-center">
                  <button
                    onClick={(e) => handleToggleFavorite(app.appTargetId || app.id, e)}
                    className={`absolute top-0.5 start-0.5 p-1 rounded-full transition z-10 cursor-pointer ${
                      isFav
                        ? 'opacity-100 text-amber-400'
                        : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400'
                    }`}
                    title={isFav ? (isAr ? 'إزالة من المفضلة' : 'Remove Favorite') : (isAr ? 'إضافة إلى المفضلة' : 'Add to Favorites')}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleTileClick(app)}
                    className={`w-full flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl transition cursor-pointer ${
                      !app.visible && isAdminMode
                        ? 'opacity-50 border border-dashed border-gray-300'
                        : isDarkMode
                        ? 'hover:bg-slate-900/90'
                        : 'hover:bg-gray-50/90'
                    }`}
                  >
                    {app.badge && (
                      <span className="absolute top-1 end-1 text-[9px] font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-1.5 py-0.2 rounded-full shadow-xs z-10">
                        {app.badge}
                      </span>
                    )}

                    {!app.visible && isAdminMode && (
                      <span className="absolute top-1 start-1 text-[8px] bg-gray-600 text-white px-1 rounded z-10 flex items-center gap-0.5">
                        <EyeOff className="w-2.5 h-2.5" />
                        <span>{isAr ? 'مخفي' : 'Hidden'}</span>
                      </span>
                    )}

                    <div className="h-12 sm:h-14 flex items-center justify-center mb-1.5 transition-transform duration-150 group-hover:scale-105">
                      <DynamicIconRenderer tile={app} size={46} />
                    </div>

                    <div className="h-8 flex items-start justify-center w-full">
                      <span className={`text-[11px] sm:text-xs font-semibold ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-950'} transition text-center leading-tight line-clamp-2`}>
                        {isAr ? app.labelAr : app.labelEn}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Separator Line */}
        {pageLayout.showCreateMore && <hr className="my-6 border-t border-gray-200/90" />}

        {/* Bottom Section: Create More (Symmetrically Balanced with Main Grid) */}
        {pageLayout.showCreateMore && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 items-center">
            {/* Create more button */}
            <button
              onClick={onOpenAddAppModal}
              className="group flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl hover:bg-gray-50 transition w-20 sm:w-24 cursor-pointer"
              title={isAr ? 'إضافة تطبيق أو اختصار جديد إلى المشغّل (لوقو، اسم، رابط)' : 'Add new app or shortcut (logo, name, link)'}
            >
              <div className="w-11 h-11 rounded-full border-2 border-dashed border-gray-400 group-hover:border-blue-500 group-hover:bg-blue-50 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition mb-1.5">
                <Plus className="w-5 h-5" />
              </div>
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-gray-950 leading-tight">
                  {isAr ? 'إنشاء المزيد' : 'Create more'}
                </span>
              </div>
            </button>

            {/* SNNS AI Hub shortcut */}
            <button
              onClick={() => onSelectApp('snns-ai')}
              className="group flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl hover:bg-gray-50 transition w-20 sm:w-24 cursor-pointer"
            >
              <div className="h-11 flex items-center justify-center mb-1.5">
                <SnnsAiIcon className="w-10 h-10 transition-transform group-hover:scale-105" />
              </div>
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-gray-950 leading-tight">
                  {isAr ? 'خدمات AI' : 'AI Services'}
                </span>
              </div>
            </button>

            {/* Survey / Forms */}
            <button
              onClick={() => onSelectApp('forms')}
              className="group flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl hover:bg-gray-50 transition w-20 sm:w-24 cursor-pointer"
            >
              <div className="h-11 flex items-center justify-center mb-1.5">
                <FormsSurveyIcon className="w-10 h-10 transition-transform group-hover:scale-105" />
              </div>
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-gray-950 leading-tight">
                  {isAr ? 'استبيان' : 'Survey'}
                </span>
              </div>
            </button>

            {/* Presentation / PowerPoint */}
            <button
              onClick={() => onSelectApp('powerpoint')}
              className="group flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl hover:bg-gray-50 transition w-20 sm:w-24 cursor-pointer"
            >
              <div className="h-11 flex items-center justify-center mb-1.5">
                <PowerPointIcon className="w-10 h-10 transition-transform group-hover:scale-105" />
              </div>
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-gray-950 leading-tight">
                  {isAr ? 'عرض تقديمي' : 'Presentation'}
                </span>
              </div>
            </button>

            {/* Workbook / Excel */}
            <button
              onClick={() => onSelectApp('excel')}
              className="group flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl hover:bg-gray-50 transition w-20 sm:w-24 cursor-pointer"
            >
              <div className="h-11 flex items-center justify-center mb-1.5">
                <ExcelIcon className="w-10 h-10 transition-transform group-hover:scale-105" />
              </div>
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-gray-950 leading-tight">
                  {isAr ? 'مصنف عمل' : 'Workbook'}
                </span>
              </div>
            </button>

            {/* Document / Word */}
            <button
              onClick={() => onSelectApp('word')}
              className="group flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl hover:bg-gray-50 transition w-20 sm:w-24 cursor-pointer"
            >
              <div className="h-11 flex items-center justify-center mb-1.5">
                <WordIcon className="w-10 h-10 transition-transform group-hover:scale-105" />
              </div>
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-gray-950 leading-tight">
                  {isAr ? 'مستند نصي' : 'Document'}
                </span>
              </div>
            </button>

            {/* Smart Printer */}
            <button
              onClick={() => onSelectApp('printer')}
              className="group flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl hover:bg-gray-50 transition w-20 sm:w-24 cursor-pointer"
            >
              <div className="h-11 flex items-center justify-center mb-1.5">
                <PrinterAppIcon className="w-10 h-10 transition-transform group-hover:scale-105" />
              </div>
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-gray-950 leading-tight">
                  {isAr ? 'طابعة واي فاي' : 'Wi-Fi Printer'}
                </span>
              </div>
            </button>

            {/* Video Studio & Downloader */}
            <button
              onClick={() => onSelectApp('clipchamp')}
              className="group flex flex-col items-center justify-start text-center p-1.5 sm:p-2 rounded-2xl hover:bg-purple-50 transition w-20 sm:w-24 cursor-pointer"
            >
              <div className="h-11 flex items-center justify-center mb-1.5">
                <ClipchampIcon className="w-10 h-10 transition-transform group-hover:scale-105" />
              </div>
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-purple-900 leading-tight">
                  {isAr ? 'تعديل وتحميل الفيديو' : 'Video Studio'}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Symmetrically Balanced Recent Files Section */}
      {pageLayout.showRecentFiles && (
        <div className="w-full bg-white rounded-3xl shadow-xs border border-gray-200/90 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <h2 className="text-xs sm:text-sm font-bold text-gray-800">
                {isAr ? 'الملفات والمشاريع الحديثة في SNNS 365' : 'Recent Files & Workspaces in SNNS 365'}
              </h2>
            </div>
            <button
              onClick={() => onSelectApp('onedrive')}
              className="text-xs text-[#0078D4] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>{isAr ? 'استعراض كل الملفات' : 'View all files'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenRecentDoc(doc)}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-gray-50 rounded-xl cursor-pointer transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {doc.appId === 'snns-ai' && <SnnsAiIcon className="w-7 h-7" />}
                    {doc.appId === 'word' && <WordIcon className="w-7 h-7" />}
                    {doc.appId === 'excel' && <ExcelIcon className="w-7 h-7" />}
                    {doc.appId === 'powerpoint' && <PowerPointIcon className="w-7 h-7" />}
                    {doc.appId === 'forms' && <FormsSurveyIcon className="w-7 h-7" />}
                    {!['snns-ai', 'word', 'excel', 'powerpoint', 'forms'].includes(doc.appId) && (
                      <div className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center text-gray-600">
                        <FolderOpen className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition truncate">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 flex items-center gap-2">
                      <span>{doc.updatedAt}</span>
                      {doc.size && <span>• {doc.size}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                  <span className="text-[11px] text-gray-400">{isAr ? 'فتح' : 'Open'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Quick Direct Rename & Edit Modal */}
      {quickRenameTile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setQuickRenameTile(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 text-xs"
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-900">
                    {isAr ? 'تعديل اسم التطبيق والأيقونة' : 'Edit App Tile Name'}
                  </h3>
                  <p className="text-[10px] text-gray-500">ID: {quickRenameTile.id}</p>
                </div>
              </div>
              <button
                onClick={() => setQuickRenameTile(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickToast && (
              <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-center font-bold text-[11px] animate-pulse">
                {quickToast}
              </div>
            )}

            <form onSubmit={handleSaveQuickRename} className="space-y-3">
              <div className="flex items-center justify-center py-2 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                <DynamicIconRenderer tile={quickRenameTile} size={48} />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isAr ? 'الاسم بالعربية:' : 'Arabic Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={quickLabelAr}
                  onChange={(e) => setQuickLabelAr(e.target.value)}
                  placeholder="مثال: الاستبيانات والنماذج"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isAr ? 'الاسم بالإنجليزية:' : 'English Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={quickLabelEn}
                  onChange={(e) => setQuickLabelEn(e.target.value)}
                  placeholder="e.g. Forms"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isAr ? 'شارة مميزة على الأيقونة (اختياري):' : 'Badge Tag (Optional):'}
                </label>
                <input
                  type="text"
                  value={quickBadge}
                  onChange={(e) => setQuickBadge(e.target.value)}
                  placeholder="مثال: NEW, PRO, AI"
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const id = quickRenameTile.id;
                    setQuickRenameTile(null);
                    onOpenAdminPanel(id);
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تخصيص اللوقو والروابط' : 'Advanced'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickRenameTile(null)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl font-bold flex items-center gap-1 shadow-md transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حفظ' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
