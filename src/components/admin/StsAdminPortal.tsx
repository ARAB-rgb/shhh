import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  ArrowLeft,
  Sliders,
  Server,
  Layers,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Database,
  Globe,
} from 'lucide-react';
import { DynamicAppTile, PageLayoutConfig, UserProfile } from '../../types/suite';
import { AdminControlPanel } from './AdminControlPanel';
import { VerifiedDirectoryAdminSection } from './VerifiedDirectoryAdminSection';
import { PageBuilderSection } from './PageBuilderSection';
import { adminService } from '../../services/adminService';
import { storage } from '../../services/storage';

interface StsAdminPortalProps {
  tiles: DynamicAppTile[];
  onSaveTiles: (tiles: DynamicAppTile[]) => void;
  onResetTiles: () => void;
  pageLayout: PageLayoutConfig;
  onSavePageLayout: (layout: PageLayoutConfig) => void;
  onExitSts: () => void;
  lang?: 'en' | 'ar';
}

export const StsAdminPortal: React.FC<StsAdminPortalProps> = ({
  tiles,
  onSaveTiles,
  onResetTiles,
  pageLayout,
  onSavePageLayout,
  onExitSts,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getUserProfile());
  const [isVerified, setIsVerified] = useState<boolean>(() => adminService.isVerifiedAdmin());
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'control' | 'directory' | 'health' | 'page-builder'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/directory')) return 'directory';
      if (path.includes('/page-builder') || path.includes('/appearance')) return 'page-builder';
    }
    return 'control';
  });
  const [stsStats, setStsStats] = useState<{
    supervisorsCount: number;
    appsCount: number;
    securityLevel: string;
    timestamp: string;
  } | null>(null);

  // Check admin verification on mount
  useEffect(() => {
    const verify = async () => {
      const isRoleAdmin =
        currentUser.role === 'admin' ||
        currentUser.role === 'owner' ||
        currentUser.email === 'a@snns.pro';

      if (isRoleAdmin) {
        setIsVerified(true);
      } else {
        const res = await adminService.verifyAdminStatus();
        setIsVerified(res.isVerifiedAdmin);
      }

      // Fetch /api/sts/dashboard
      try {
        const stsRes = await fetch('/api/sts/dashboard');
        if (stsRes.ok) {
          const data = await stsRes.json();
          setStsStats(data);
        }
      } catch {}
    };

    verify();
  }, [currentUser]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await adminService.loginAdmin(passcode.trim(), currentUser.email);
    if (res.success) {
      setIsVerified(true);
      storage.setAdminMode(true);
      setPasscode('');
    } else {
      setErrorMsg(res.error || (isAr ? 'رمز الإدارة غير صحيح' : 'Invalid admin passcode'));
    }
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    adminService.logoutAdmin();
    storage.setAdminMode(false);
    setIsVerified(false);
    onExitSts();
  };

  // IF NOT AUTHORIZED: Render Secure STS Lock Screen
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 select-none relative font-sans" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Ambient Dark/Red/Amber Security Glow */}
        <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-[10px] font-mono font-bold mb-3">
            <Terminal className="w-3 h-3" />
            <span>PROTECTED GATE: /sts</span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white mb-2">
            {isAr ? 'بوابة الإدارة المركزية الفائقة (STS)' : 'STS Super Admin Portal'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {isAr
              ? 'هذه المساحة مخصصة حصراً للمشرفين العامين وإدارة النظام المعتمدة (a@snns.pro). الواجهة العامة للمستخدمين معزولة تماماً ولا تتضمن أدوات تحكم.'
              : 'Restricted area for authorized system administrators. Public interface remains clean and free of administrative controls.'}
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 text-start">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 text-start">
                {isAr ? 'رمز المرور الإداري المعتمد (Admin Passcode):' : 'Enter Admin Passcode:'}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl ps-9 pe-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  required
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 px-1">
                <span>{isAr ? 'الرمز الافتراضي: snns2026' : 'Default key: snns2026'}</span>
                <span>RBAC Enforced</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? (isAr ? 'جارِ التحقق...' : 'Verifying...') : (isAr ? 'تسجيل الدخول لبوابة STS' : 'Authenticate to STS')}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onExitSts}
              className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isAr ? 'العودة لواجهة المستخدم العامة' : 'Return to Public App'}</span>
            </button>

            <span className="text-[10px] text-slate-600 font-mono">v3.5.0-STS</span>
          </div>
        </div>
      </div>
    );
  }

  // IF AUTHORIZED: Full STS Super Admin Interface
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top STS Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-sm shadow">
            STS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm text-white">
                {isAr ? 'لوحة تحكم المشرف العام الفائقة (STS Control Center)' : 'STS Super Admin Control Portal'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                /sts
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'نظام الحوكمة وإدارة التطبيقات والاشتراكات المركزي' : 'Enterprise App Management & RBAC Governance'}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Active Supervisor Info */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">{currentUser.name}</span>
            <span className="text-amber-400 font-mono text-[10px]">({currentUser.email})</span>
          </div>

          {/* Return to Public User App */}
          <button
            onClick={onExitSts}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title={isAr ? 'العودة للواجهة العامة للمستخدمين' : 'Exit to Public Workspace'}
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 text-emerald-400" />
            <span className="hidden sm:inline">{isAr ? 'واجهة المستخدم' : 'Public App'}</span>
          </button>

          {/* Logout Admin Session */}
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl transition cursor-pointer"
            title={isAr ? 'قفل جلسة الإدارة وتسجيل الخروج' : 'Logout Admin'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Quick Security Health Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-slate-200">{isAr ? 'الحماية:' : 'Security:'}</strong>
            <span>{isAr ? 'واجهة المستخدمين محمية من الأدوات الإدارية' : 'User UI is protected & decluttered'}</span>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <strong className="text-slate-200">{isAr ? 'مسار الخادم:' : 'API Route:'}</strong>
            <span className="font-mono text-emerald-400">/api/sts/dashboard</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('control')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'control'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'لوحة التحكم المركزية' : 'Admin Hub'}
          </button>
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'directory'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'دليل الروابط (/sts/directory)' : 'Verified Directory'}
          </button>
          <button
            onClick={() => setActiveSubTab('page-builder')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'page-builder'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'مُصمّم الصفحة (/sts/page-builder)' : 'Page Builder'}
          </button>
          <button
            onClick={() => setActiveSubTab('health')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'health'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'حالة النظام وRBAC' : 'System & RBAC'}
          </button>
        </div>
      </div>

      {/* Main STS Body */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeSubTab === 'control' ? (
          <div className="max-w-6xl mx-auto">
            <AdminControlPanel
              tiles={tiles}
              onSaveTiles={onSaveTiles}
              onResetTiles={onResetTiles}
              pageLayout={pageLayout}
              onSavePageLayout={onSavePageLayout}
              onClose={onExitSts}
              onLockAdmin={handleLogout}
              isStandaloneSts
            />
          </div>
        ) : activeSubTab === 'directory' ? (
          <div className="max-w-6xl mx-auto">
            <VerifiedDirectoryAdminSection lang={lang} />
          </div>
        ) : activeSubTab === 'page-builder' ? (
          <div className="max-w-6xl mx-auto">
            <PageBuilderSection lang={lang} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{isAr ? 'معايير الأمان وعزل واجهة المستخدمين (RBAC Architecture)' : 'RBAC Security Architecture'}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {isAr
                  ? 'تم تطبيق نموذج عزل كامل لواجهات النظام: واجهة الزوار والمستخدمين العاديين على (/) تكون خالية تماماً من أزرار التعديل أو التخصيص أو لوحات التحكم. مسار (/sts) هو المقر الحصري والمحمي لجميع العمليات الإدارية.'
                  : 'Complete interface segregation: Public users at (/) have zero administrative controls. The (/sts) extension is the exclusive secured portal for administrative operations.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <Globe className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-white mb-1">
                    {isAr ? 'واجهة المستخدمين (/)' : 'Public User UI (/)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'منظمة وبسيطة، خالية من أدوات الإدارة' : 'Clean, uncluttered, no admin tools'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-center shadow-lg shadow-amber-950/20">
                  <Terminal className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-amber-300 mb-1">
                    {isAr ? 'مسار المشرف (/sts)' : 'Admin Portal (/sts)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'محمي بالكامل بنظام التحقق والصلاحيات' : 'Protected by server authentication'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <Database className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-white mb-1">
                    {isAr ? 'خدمات الخادم (/api/sts)' : 'Backend API (/api/sts)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'وسيط requireAdmin يتحقق من الهوية' : 'requireAdmin middleware enforcement'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StsAdminPortal;
