import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  ExternalLink,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Grid,
  ChevronRight,
  Layers,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { AppId, UserRoleType } from '../../types/suite';
import { APP_REGISTRY, APP_CATEGORIES, appRegistry } from '../../services/appRegistry';
import {
  WordIcon,
  ExcelIcon,
  PowerPointIcon,
  FormsSurveyIcon,
  CopilotIcon,
  TeamsIcon,
  OutlookIcon,
  SnnsAiIcon,
  PrinterAppIcon,
  ClipchampIcon,
  MarketplaceIcon,
  BusinessIcon,
  AccountIcon,
  OneDriveIcon,
  QaydPosIcon,
  QaydAccountingIcon,
  CallsIcon,
  ChatIcon,
  EducationIcon,
  OneNoteIcon,
  ToDoIcon,
  CalendarIcon,
  DesignerIcon,
  SkypeIcon,
  FamilySafetyIcon,
} from '../icons/AppIcons';

interface AppsDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (app: AppId | null) => void;
  lang: 'en' | 'ar';
  currentApp: AppId | null;
  onOpenPwaModal?: () => void;
  onOpenInternalMail?: () => void;
  onNavigateToSts?: () => void;
  isServerAdminVerified?: boolean;
}

export const AppsDropdownMenu: React.FC<AppsDropdownMenuProps> = ({
  isOpen,
  onClose,
  onSelectApp,
  lang,
  currentApp,
  onOpenPwaModal,
  onOpenInternalMail,
  onNavigateToSts,
  isServerAdminVerified = false,
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Handle Escape key & Click Outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Icon Map
  const renderAppIcon = (iconName: string, className = 'w-9 h-9') => {
    switch (iconName) {
      case 'word':
        return <WordIcon className={className} />;
      case 'excel':
        return <ExcelIcon className={className} />;
      case 'powerpoint':
        return <PowerPointIcon className={className} />;
      case 'outlook':
        return <OutlookIcon className={className} />;
      case 'teams':
        return <TeamsIcon className={className} />;
      case 'onedrive':
        return <OneDriveIcon className={className} />;
      case 'copilot':
        return <CopilotIcon className={className} />;
      case 'todo':
        return <ToDoIcon className={className} />;
      case 'onenote':
        return <OneNoteIcon className={className} />;
      case 'calendar':
        return <CalendarIcon className={className} />;
      case 'forms':
        return <FormsSurveyIcon className={className} />;
      case 'designer':
        return <DesignerIcon className={className} />;
      case 'clipchamp':
        return <ClipchampIcon className={className} />;
      case 'skype':
        return <SkypeIcon className={className} />;
      case 'family-safety':
        return <FamilySafetyIcon className={className} />;
      case 'marketplace':
        return <MarketplaceIcon className={className} />;
      case 'business':
        return <BusinessIcon className={className} />;
      case 'account':
        return <AccountIcon className={className} />;
      case 'snns-ai':
        return <SnnsAiIcon className={className} />;
      case 'qayd-pos':
        return <QaydPosIcon className={className} />;
      case 'qayd-accounting':
        return <QaydAccountingIcon className={className} />;
      case 'calls':
      case 'snns-calls':
        return <CallsIcon className={className} />;
      case 'chat':
      case 'snns-chat':
        return <ChatIcon className={className} />;
      case 'education':
      case 'snns-education':
        return <EducationIcon className={className} />;
      case 'printer':
        return <PrinterAppIcon className={className} />;
      default:
        return <Sparkles className={`${className} text-emerald-400`} />;
    }
  };

  // Current user role from appRegistry
  const currentRole = useMemo(() => appRegistry.getCurrentRole(), [isOpen]);

  // Filtered Apps based on search query, category, and RBAC permissions
  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return APP_REGISTRY.filter((app) => {
      // 1. RBAC check: Hide administrative or restricted apps from unauthorized users
      const access = appRegistry.canUserAccessApp(app.id, currentRole);
      if (!access.allowed) {
        return false;
      }

      // If app is strictly admin and server verification failed, hide it
      if (app.requiredRole?.includes('admin') && !isServerAdminVerified) {
        return false;
      }

      // Hide secondary engines (like snns-calls) unified under SNNS Connect
      if (app.status === 'ready_for_connection' || app.hiddenFromLauncher) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && app.category !== selectedCategory) {
        return false;
      }

      // 3. Search filter
      if (!q) return true;
      return (
        app.nameAr.toLowerCase().includes(q) ||
        app.nameEn.toLowerCase().includes(q) ||
        app.taglineAr.toLowerCase().includes(q) ||
        app.taglineEn.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory, currentRole, isServerAdminVerified]);

  // Group filtered apps by category
  const groupedApps = useMemo(() => {
    const map: Record<string, typeof APP_REGISTRY> = {};
    filteredApps.forEach((app) => {
      const cat = app.category || 'productivity';
      if (!map[cat]) map[cat] = [];
      map[cat].push(app);
    });
    return map;
  }, [filteredApps]);

  const getCategoryTitle = (catId: string) => {
    const cat = APP_CATEGORIES.find((c) => c.id === catId);
    if (!cat) return isAr ? 'أدوات أخرى' : 'Other Tools';
    return isAr ? cat.nameAr : cat.nameEn;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-start p-2 sm:p-4 animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Dropdown Container */}
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-slate-950/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] mt-12 sm:mt-14 sm:ms-2 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Grid className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{isAr ? 'شبكة تطبيقات وخدمات SNNS.PRO' : 'SNNS.PRO App Launcher & Suite'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {APP_REGISTRY.length} {isAr ? 'تطبيق' : 'Apps'}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'منظومة التطبيقات السحابية المعتمدة لقطاع الأعمال والتجارة والاتصالات'
                    : 'Unified cloud applications suite for commerce, communications, and productivity'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title={isAr ? 'إغلاق (Esc)' : 'Close (Esc)'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث بالاسم أو الوظيفة (كاشير، مكالمات، مستندات، ذكاء اصطناعي...)'
                  : 'Search by app name or task (POS, Calls, Docs, AI...)'
              }
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 rounded-2xl py-2.5 ps-10 pe-10 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {APP_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                    active
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                  }`}
                >
                  {isAr ? cat.nameAr : cat.nameEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apps Content Area with Category Grouping */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {filteredApps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Grid className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
              <p className="text-xs font-bold text-slate-300">
                {isAr ? 'لم يتم العثور على تطبيق يطابق بحثك' : 'No apps match your search'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-emerald-400 hover:underline text-xs"
              >
                {isAr ? 'إعادة ضبط التصفية والبحث' : 'Reset search & filters'}
              </button>
            </div>
          ) : (
            Object.entries(groupedApps).map(([categoryKey, apps]) => (
              <div key={categoryKey} className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{getCategoryTitle(categoryKey)}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {apps.length} {isAr ? 'تطبيقات' : 'apps'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {apps.map((app) => {
                    const isCurrent = currentApp === app.id;
                    const isCalls = app.id === 'snns-calls';

                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          if (isCalls) {
                            window.open('https://snns.site', '_blank', 'noopener,noreferrer');
                            onClose();
                          } else {
                            onSelectApp(app.id);
                            onClose();
                          }
                        }}
                        className={`p-2.5 rounded-2xl flex items-center gap-3 text-start transition duration-200 cursor-pointer border group relative ${
                          isCurrent
                            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md ring-1 ring-emerald-400/30'
                            : 'bg-slate-900/60 hover:bg-slate-800/90 border-slate-800/80 hover:border-slate-700'
                        }`}
                        title={
                          isCalls
                            ? (isAr ? 'فتح منصة المكالمات والاجتماعات (https://snns.site)' : 'Launch SNNS Calls (https://snns.site)')
                            : (isAr ? `تشغيل ${app.nameAr}` : `Launch ${app.nameEn}`)
                        }
                      >
                        <div className="shrink-0 transition-transform group-hover:scale-105">
                          {renderAppIcon(app.iconName, 'w-10 h-10')}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition truncate flex items-center gap-1.5">
                              <span>{isAr ? app.nameAr : app.nameEn}</span>
                              {isCalls && (
                                <ExternalLink className="w-3 h-3 text-sky-400 shrink-0 opacity-80 group-hover:opacity-100" />
                              )}
                            </span>
                            {app.badge && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                  app.badgeColor || 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {app.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5">
                            {isCalls
                              ? (isAr ? 'منصة اتصالات WebRTC المباشرة عبر https://snns.site' : 'Direct WebRTC Video on https://snns.site')
                              : (isAr ? app.taglineAr : app.taglineEn)}
                          </p>
                        </div>

                        {/* Optional in-app launcher for calls */}
                        {isCalls && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectApp('snns-calls');
                              onClose();
                            }}
                            className="p-1 hover:bg-sky-500/20 text-sky-300 rounded-lg text-[9px] font-mono border border-sky-500/30 shrink-0"
                            title={isAr ? 'فتح داخل المنظومة المدمجة' : 'Open in-app'}
                          >
                            {isAr ? 'داخلي' : 'In-App'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Utility Bar (Shortcuts to PWA, Mail, STS) */}
        <div className="p-3 sm:p-4 bg-slate-900/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {onOpenPwaModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPwaModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition text-[11px] font-semibold cursor-pointer border border-slate-700"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isAr ? 'تثبيت المنظومة كـ PWA' : 'Install Standalone PWA'}</span>
              </button>
            )}

            {isServerAdminVerified && onNavigateToSts && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToSts();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl transition text-[11px] font-bold cursor-pointer border border-amber-500/30"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'بوابة الإدارة /sts' : 'STS Admin Portal'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onSelectApp(null);
              onClose();
            }}
            className="text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
          >
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};
