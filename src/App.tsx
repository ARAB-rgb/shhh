import React, { useState, useEffect } from 'react';
import { AppId, RecentDocument, DynamicAppTile, PageLayoutConfig } from './types/suite';
import { storage } from './services/storage';
import { TopNav } from './components/layout/TopNav';
import { LauncherHub } from './components/hub/LauncherHub';
import { AdminControlPanel } from './components/admin/AdminControlPanel';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AddAppModal } from './components/hub/AddAppModal';

// Apps
import { SnnsAiApp } from './components/apps/SnnsAiApp';
import { WordApp } from './components/apps/WordApp';
import { ExcelApp } from './components/apps/ExcelApp';
import { PowerPointApp } from './components/apps/PowerPointApp';
import { PrinterApp } from './components/apps/PrinterApp';
import { OutlookApp } from './components/apps/OutlookApp';
import { TeamsApp } from './components/apps/TeamsApp';
import { OneDriveApp } from './components/apps/OneDriveApp';
import { CopilotApp } from './components/apps/CopilotApp';
import { ToDoApp } from './components/apps/ToDoApp';
import { OneNoteApp } from './components/apps/OneNoteApp';
import { CalendarApp } from './components/apps/CalendarApp';
import { FormsSurveyApp } from './components/apps/FormsSurveyApp';
import { DesignerApp } from './components/apps/DesignerApp';
import { ClipchampApp } from './components/apps/ClipchampApp';
import { SkypeApp } from './components/apps/SkypeApp';
import { FamilySafetyApp } from './components/apps/FamilySafetyApp';
import { MarketplaceApp } from './components/apps/MarketplaceApp';
import { BusinessApp } from './components/apps/BusinessApp';
import { AccountApp } from './components/apps/AccountApp';
import { MoreAppsModal } from './components/apps/MoreAppsModal';
import { PrintDialogModal } from './components/common/PrintDialogModal';

// Standalone Apps & PWA Infrastructure
import { QaydPosApp } from './components/apps/QaydPosApp';
import { QaydAccountingApp } from './components/apps/QaydAccountingApp';
import { SnnsEducationApp } from './components/apps/SnnsEducationApp';
import { PwaInstallModal } from './components/common/PwaInstallModal';
import { appRegistry } from './services/appRegistry';
import { themeService } from './services/themeService';
import { InternalMailBox } from './components/common/InternalMailBox';
import { StsAdminPortal } from './components/admin/StsAdminPortal';
import { ShieldAlert, UserCheck, RefreshCw, ArrowLeft } from 'lucide-react';

export default function App() {
  const getInitialApp = (): AppId | null => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get('app') as AppId | null;
      if (appParam) return appParam;
    }
    return null;
  };

  const [currentApp, setCurrentApp] = useState<AppId | null>(getInitialApp);
  const [isStsRoute, setIsStsRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/sts');
    }
    return false;
  });
  const [lang, setLang] = useState<'en' | 'ar'>(storage.getLanguage());
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const [showInternalMailModal, setShowInternalMailModal] = useState<boolean>(false);
  const [pwaModalInitialApp, setPwaModalInitialApp] = useState<AppId | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => storage.isDarkMode());
  const [activeRole, setActiveRole] = useState(() => appRegistry.getCurrentRole());
  const [themeTokens, setThemeTokens] = useState(() => themeService.getEffectiveTheme(getInitialApp()));

  // Sync theme tokens on app navigation or theme changes
  useEffect(() => {
    const tokens = themeService.getEffectiveTheme(currentApp);
    setThemeTokens(tokens);
    themeService.applyToDOM(tokens);

    const unsubscribe = themeService.subscribe((_updated) => {
      const active = themeService.getEffectiveTheme(currentApp);
      setThemeTokens(active);
      themeService.applyToDOM(active);
    });
    return unsubscribe;
  }, [currentApp]);

  // Listen for browser navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        setIsStsRoute(window.location.pathname.startsWith('/sts'));
        const params = new URLSearchParams(window.location.search);
        const appParam = params.get('app') as AppId | null;
        setCurrentApp(appParam);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync role updates
  useEffect(() => {
    const handleRole = () => setActiveRole(appRegistry.getCurrentRole());
    window.addEventListener('snns_role_updated', handleRole);
    return () => window.removeEventListener('snns_role_updated', handleRole);
  }, []);

  // Sync dynamic manifest for standalone PWA installation per app
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const manifestTag = document.getElementById('manifest-link') as HTMLLinkElement | null;
      if (manifestTag) {
        if (currentApp === 'qayd-pos') manifestTag.href = '/manifest-qayd-pos.json';
        else if (currentApp === 'qayd-accounting') manifestTag.href = '/manifest-qayd-accounting.json';
        else if (currentApp === 'snns-calls') manifestTag.href = '/manifest-calls.json';
        else if (currentApp === 'snns-chat') manifestTag.href = '/manifest-chat.json';
        else if (currentApp === 'snns-education') manifestTag.href = '/manifest-education.json';
        else if (currentApp === 'snns-ai') manifestTag.href = '/manifest-ai.json';
        else manifestTag.href = '/manifest.json';
      }
    }
  }, [currentApp]);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSelectApp = (app: AppId | null) => {
    if (app) {
      window.history.pushState({}, '', `/?app=${app}`);
    } else {
      window.history.pushState({}, '', '/');
    }
    setCurrentApp(app);
  };

  const handleToggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    storage.setDarkMode(next);
  };

  const handleNavigateToSts = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/sts');
      setIsStsRoute(true);
    }
  };

  const handleExitSts = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      setIsStsRoute(false);
    }
  };

  // Dynamic Launcher Configuration (Editable by Admin)
  const [launcherTiles, setLauncherTiles] = useState<DynamicAppTile[]>(storage.getLauncherTiles());
  const [pageLayout, setPageLayout] = useState<PageLayoutConfig>(storage.getPageLayout());
  const [isAdminMode, setIsAdminMode] = useState<boolean>(storage.isAdminMode());
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [adminSelectedTileId, setAdminSelectedTileId] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [showAddAppModal, setShowAddAppModal] = useState<boolean>(false);

  // Global Printer State
  const [globalPrintModal, setGlobalPrintModal] = useState<boolean>(false);
  const [globalPrintPayload, setGlobalPrintPayload] = useState<{
    title: string;
    subtitle?: string;
    contentHtml: string;
  }>({
    title: 'SNNS 365 Cloud Suite',
    contentHtml: '',
  });

  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([
    {
      id: 'doc-ai-1',
      title: 'SNNS AI Strategic Intelligence Analysis & Action Plan',
      appId: 'snns-ai',
      updatedAt: 'Just now',
      size: '25 KB',
    },
    {
      id: 'doc-1',
      title: 'SNNS Project Strategy & Roadmap.docx',
      appId: 'word',
      updatedAt: '12 mins ago',
      size: '142 KB',
    },
    {
      id: 'sheet-1',
      title: 'Q4 Financial Forecast - SNNS Corp.xlsx',
      appId: 'excel',
      updatedAt: '1 hour ago',
      size: '88 KB',
    },
    {
      id: 'ppt-1',
      title: 'SNNS Executive Vision 2026.pptx',
      appId: 'powerpoint',
      updatedAt: '2 hours ago',
      size: '3.4 MB',
    },
    {
      id: 'form-1',
      title: 'SNNS 365 User Satisfaction & Feedback Survey',
      appId: 'forms',
      updatedAt: 'Today',
      size: '3 questions',
    },
  ]);

  useEffect(() => {
    storage.setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleOpenRecentDoc = (doc: RecentDocument) => {
    setCurrentApp(doc.appId);
  };

  // Admin Actions
  const handleSaveTiles = (newTiles: DynamicAppTile[]) => {
    setLauncherTiles(newTiles);
    storage.saveLauncherTiles(newTiles);
  };

  const handleSavePageLayout = (newLayout: PageLayoutConfig) => {
    setPageLayout(newLayout);
    storage.savePageLayout(newLayout);
  };

  const handleResetTiles = () => {
    const defaultTiles = storage.resetLauncherTiles();
    const defaultLayout = storage.getPageLayout();
    setLauncherTiles(defaultTiles);
    setPageLayout(defaultLayout);
  };

  const handleLockAdmin = () => {
    setIsAdminMode(false);
    storage.setAdminMode(false);
    setShowAdminPanel(false);
  };

  const handleUnlockAdmin = () => {
    setIsAdminMode(true);
    storage.setAdminMode(true);
    setShowAdminLogin(false);
    setShowAdminPanel(true);
  };

  const handleMoveTile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= launcherTiles.length) return;

    const newArr = [...launcherTiles];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    const updated = newArr.map((item, idx) => ({ ...item, order: idx }));
    setLauncherTiles(updated);
    storage.saveLauncherTiles(updated);
  };

  const handleAddCustomApp = (newTile: DynamicAppTile) => {
    const updated = [...launcherTiles, newTile];
    setLauncherTiles(updated);
    storage.saveLauncherTiles(updated);
  };

  const handleTriggerGlobalPrint = () => {
    const isAr = lang === 'ar';
    if (currentApp === 'word') {
      const docs: Record<string, any> = storage.getWordDocs();
      const firstDoc = Object.values(docs)[0] as any;
      setGlobalPrintPayload({
        title: firstDoc?.title || 'SNNS Word Document',
        subtitle: isAr ? 'مستند تحرير نصوص احترافي' : 'Word Processing Document',
        contentHtml: firstDoc?.content || '<p>مستند فارغ</p>',
      });
    } else if (currentApp === 'excel') {
      const sheets: Record<string, any> = storage.getExcelSheets();
      const firstSheet = Object.values(sheets)[0] as any;
      const cells = firstSheet?.cells || {};
      let rowsHtml = '';
      for (let r = 1; r <= 15; r++) {
        let cellsInRow = '';
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((c) => {
          cellsInRow += `<td style="border:1px solid #d1d5db;padding:6px 10px;">${cells[`${c}${r}`] || ''}</td>`;
        });
        rowsHtml += `<tr><td style="border:1px solid #d1d5db;background:#f3f4f6;font-weight:bold;text-align:center;">${r}</td>${cellsInRow}</tr>`;
      }
      setGlobalPrintPayload({
        title: firstSheet?.title || 'SNNS Excel Sheet',
        subtitle: isAr ? 'جدول حسابات ومصنف إلكتروني' : 'Spreadsheet Calculations',
        contentHtml: `<table style="width:100%;border-collapse:collapse;font-size:10pt;">${rowsHtml}</table>`,
      });
    } else if (currentApp === 'powerpoint') {
      const ppts: Record<string, any> = storage.getPPTs();
      const firstDeck = Object.values(ppts)[0] as any;
      let slidesHtml = '';
      (firstDeck?.slides || []).forEach((s: any, idx: number) => {
        const bulletsList = (s.bullets || []).map((b: string) => `<li style="margin-bottom:4px;">${b}</li>`).join('');
        slidesHtml += `
          <div style="border:1px solid #d1d5db;padding:16px;margin-bottom:16px;border-radius:6px;background:#fdfdfd;">
            <div style="font-size:9pt;color:#0078D4;font-weight:bold;">الشريحة ${idx + 1}</div>
            <h3 style="margin:4px 0 8px 0;">${s.title}</h3>
            ${s.subtitle ? `<p style="color:#666;">${s.subtitle}</p>` : ''}
            <ul>${bulletsList}</ul>
          </div>
        `;
      });
      setGlobalPrintPayload({
        title: firstDeck?.title || 'SNNS Presentation',
        subtitle: isAr ? 'شرائح عرض تقديمي' : 'Presentation Slides',
        contentHtml: slidesHtml,
      });
    } else {
      // Default / Launcher Hub Print View
      let appsListHtml = '';
      launcherTiles.filter((t) => t.visible).forEach((tile) => {
        appsListHtml += `<li style="margin-bottom:6px;"><strong>${tile.labelAr}</strong> (${tile.labelEn}) - ${tile.badge || 'نشط'}</li>`;
      });
      let docsListHtml = '';
      recentDocs.forEach((d) => {
        docsListHtml += `<tr><td style="border:1px solid #d1d5db;padding:6px;">${d.title}</td><td style="border:1px solid #d1d5db;padding:6px;">${d.appId}</td><td style="border:1px solid #d1d5db;padding:6px;">${d.updatedAt}</td></tr>`;
      });

      setGlobalPrintPayload({
        title: isAr ? 'تقرير منظومة SNNS 365 الشامل' : 'SNNS 365 Cloud Ecosystem Summary',
        subtitle: isAr ? 'تقرير رسمي بجميع التطبيقات والمشاريع والمستندات' : 'Official Workspace & Applications Overview',
        contentHtml: `
          <div style="margin-bottom:20px;">
            <h3>${isAr ? 'التطبيقات المفعلة في المنظومة:' : 'Active Applications:'}</h3>
            <ul style="line-height:1.8;">${appsListHtml}</ul>
          </div>
          <div>
            <h3>${isAr ? 'الملفات والمشاريع السحابية الأخيرة:' : 'Recent Files & Workspaces:'}</h3>
            <table style="width:100%;border-collapse:collapse;font-size:10pt;">
              <thead><tr style="background:#f3f4f6;"><th style="border:1px solid #d1d5db;padding:6px;">${isAr ? 'اسم الملف' : 'Title'}</th><th style="border:1px solid #d1d5db;padding:6px;">${isAr ? 'التطبيق' : 'App'}</th><th style="border:1px solid #d1d5db;padding:6px;">${isAr ? 'تاريخ التعديل' : 'Date'}</th></tr></thead>
              <tbody>${docsListHtml}</tbody>
            </table>
          </div>
        `,
      });
    }
    setGlobalPrintModal(true);
  };

  const appAccess = currentApp ? appRegistry.canUserAccessApp(currentApp) : { allowed: true };

  if (isStsRoute) {
    return (
      <StsAdminPortal
        tiles={launcherTiles}
        onSaveTiles={handleSaveTiles}
        onResetTiles={handleResetTiles}
        pageLayout={pageLayout}
        onSavePageLayout={handleSavePageLayout}
        onExitSts={handleExitSts}
        lang={lang}
      />
    );
  }

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: themeTokens.bgColor,
        backgroundImage:
          themeTokens.bgType === 'gradient'
            ? themeTokens.bgGradient
            : themeTokens.bgType === 'image' && themeTokens.bgImage
            ? `url(${themeTokens.bgImage})`
            : undefined,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        color: themeTokens.textMain,
      }}
      className="min-h-screen font-sans flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300 transition-colors duration-200"
    >
      {/* Top SNNS.PRO Navigation Bar */}
      <TopNav
        currentApp={currentApp}
        onSelectApp={(app) => handleSelectApp(app)}
        lang={lang}
        onToggleLang={handleToggleLang}
        onSearchQuery={(q) => setSearchFilter(q)}
        isAdminMode={isAdminMode}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
        onRequestAdminLogin={() => setShowAdminLogin(true)}
        onLockAdmin={handleLockAdmin}
        onTriggerPrint={handleTriggerGlobalPrint}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenPwaModal={() => {
          setPwaModalInitialApp(currentApp);
          setShowPwaModal(true);
        }}
        onOpenInternalMail={() => setShowInternalMailModal(true)}
        onNavigateToSts={handleNavigateToSts}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {/* RBAC Permission Barrier Check */}
        {currentApp && !appAccess.allowed ? (
          <div className="flex-1 flex items-center justify-center p-4 min-h-[70vh]">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-black tracking-tight mb-2">
                {lang === 'ar' ? 'صلاحية غير كافية (نظام RBAC المركزي)' : 'Permission Required (RBAC)'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {appAccess.reason ||
                  (lang === 'ar'
                    ? 'هذا التطبيق مخصص لأدوار إدارية معينة لحماية البيانات المالية للمنشأة.'
                    : 'Access restricted by entity role-based permissions.')}
              </p>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-6 text-xs text-start">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">{lang === 'ar' ? 'الدور النشط:' : 'Active Role:'}</span>
                  <span className="font-bold text-amber-400">{activeRole}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{lang === 'ar' ? 'التطبيق المطلوب:' : 'Target App:'}</span>
                  <span className="font-mono text-emerald-400">{currentApp}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      appRegistry.setCurrentRole('finance_manager');
                      setActiveRole('finance_manager');
                    }}
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'التحويل لمدير مالي' : 'Switch to Finance Mgr'}</span>
                  </button>
                  <button
                    onClick={() => {
                      appRegistry.setCurrentRole('owner');
                      setActiveRole('owner');
                    }}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'التحويل لمالك' : 'Switch to Owner'}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleSelectApp(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{lang === 'ar' ? 'العودة لمركز التطبيقات' : 'Back to Launcher'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!currentApp && (
              <LauncherHub
                onSelectApp={(app) => handleSelectApp(app)}
                lang={lang}
                searchFilter={searchFilter}
                recentDocs={recentDocs}
                onOpenRecentDoc={handleOpenRecentDoc}
                tiles={launcherTiles}
                pageLayout={pageLayout}
                isAdminMode={isAdminMode}
                onOpenAdminPanel={(tileId) => {
                  setAdminSelectedTileId(tileId || null);
                  setShowAdminPanel(true);
                }}
                onOpenAddAppModal={() => setShowAddAppModal(true)}
                onMoveTile={handleMoveTile}
                onSaveTiles={handleSaveTiles}
                onOpenPwaModal={(appId) => {
                  setPwaModalInitialApp(appId || null);
                  setShowPwaModal(true);
                }}
                isDarkMode={isDarkMode}
              />
            )}

            {currentApp === 'qayd-pos' && (
              <QaydPosApp
                onBack={() => handleSelectApp(null)}
                lang={lang}
                onOpenPwaModal={() => {
                  setPwaModalInitialApp('qayd-pos');
                  setShowPwaModal(true);
                }}
              />
            )}

            {currentApp === 'qayd-accounting' && (
              <QaydAccountingApp
                onBack={() => handleSelectApp(null)}
                lang={lang}
                onOpenPwaModal={() => {
                  setPwaModalInitialApp('qayd-accounting');
                  setShowPwaModal(true);
                }}
              />
            )}

            {currentApp === 'snns-education' && (
              <SnnsEducationApp
                onBack={() => handleSelectApp(null)}
                lang={lang}
                onOpenPwaModal={() => {
                  setPwaModalInitialApp('snns-education');
                  setShowPwaModal(true);
                }}
              />
            )}

            {(currentApp === 'snns-calls' || currentApp === 'skype') && (
              <SkypeApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {(currentApp === 'snns-chat' || currentApp === 'teams') && (
              <TeamsApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'snns-ai' && (
              <SnnsAiApp
                onBack={() => handleSelectApp(null)}
                lang={lang}
                onNavigateToApp={(app) => handleSelectApp(app as AppId)}
              />
            )}

            {currentApp === 'word' && (
              <WordApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'excel' && (
              <ExcelApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'powerpoint' && (
              <PowerPointApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'printer' && (
              <PrinterApp
                onBack={() => handleSelectApp(null)}
                lang={lang}
                onOpenApp={(app) => handleSelectApp(app)}
              />
            )}

            {currentApp === 'outlook' && (
              <OutlookApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'onedrive' && (
              <OneDriveApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'copilot' && (
              <CopilotApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'todo' && (
              <ToDoApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'onenote' && (
              <OneNoteApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'calendar' && (
              <CalendarApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'forms' && (
              <FormsSurveyApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'designer' && (
              <DesignerApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'clipchamp' && (
              <ClipchampApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'family-safety' && (
              <FamilySafetyApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'marketplace' && (
              <MarketplaceApp
                onBack={() => handleSelectApp(null)}
                lang={lang}
                onOpenConnectChat={() => handleSelectApp('snns-chat')}
              />
            )}

            {currentApp === 'business' && (
              <BusinessApp onBack={() => handleSelectApp(null)} lang={lang} />
            )}

            {currentApp === 'account' && (
              <AccountApp
                onBack={() => handleSelectApp(null)}
                lang={lang}
                onNavigateToApp={(app) => handleSelectApp(app as AppId)}
              />
            )}

            {currentApp === 'more-apps' && (
              <MoreAppsModal
                onBack={() => handleSelectApp(null)}
                onSelectApp={(app) => handleSelectApp(app)}
                lang={lang}
              />
            )}
          </>
        )}
      </main>

      {/* Admin Modals */}
      {showAdminPanel && (
        <AdminControlPanel
          tiles={launcherTiles}
          onSaveTiles={handleSaveTiles}
          onResetTiles={handleResetTiles}
          pageLayout={pageLayout}
          onSavePageLayout={handleSavePageLayout}
          onClose={() => setShowAdminPanel(false)}
          onLockAdmin={handleLockAdmin}
          lang={lang}
          initialTileId={adminSelectedTileId}
        />
      )}

      {showAdminLogin && (
        <AdminLoginModal
          onSuccess={handleUnlockAdmin}
          onClose={() => setShowAdminLogin(false)}
          lang={lang}
        />
      )}

      {showAddAppModal && (
        <AddAppModal
          onAddTile={handleAddCustomApp}
          onClose={() => setShowAddAppModal(false)}
          lang={lang}
        />
      )}

      {/* Global Print Modal */}
      <PrintDialogModal
        isOpen={globalPrintModal}
        onClose={() => setGlobalPrintModal(false)}
        title={globalPrintPayload.title}
        subtitle={globalPrintPayload.subtitle}
        contentHtml={globalPrintPayload.contentHtml}
        lang={lang}
      />

      {/* Standalone PWA Installation Modal */}
      <PwaInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
        lang={lang}
        initialAppId={pwaModalInitialApp}
        onLaunchStandaloneApp={(appId) => {
          setShowPwaModal(false);
          handleSelectApp(appId);
        }}
      />

      {/* Internal SNNS.PRO Mailbox Modal */}
      {showInternalMailModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-in fade-in">
          <div className="max-w-4xl w-full">
            <InternalMailBox
              isModal
              currentUserEmail={storage.getUserProfile().email}
              currentUserName={storage.getUserProfile().name}
              lang={lang}
              onClose={() => setShowInternalMailModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
