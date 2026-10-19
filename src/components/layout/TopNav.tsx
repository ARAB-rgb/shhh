import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Search,
  Plus,
  Bell,
  Settings,
  Sparkles,
  Check,
  Globe,
  X,
  FileText,
  Table,
  Presentation,
  CheckSquare,
  Mail,
  ChevronDown,
  Sliders,
  Lock,
  ShieldCheck,
  Printer,
  Video,
  UserCheck,
  Edit3,
  User,
  ScanFace,
  Fingerprint,
  Shield,
  Moon,
  Sun,
  Smartphone,
  LogOut,
} from 'lucide-react';
import { AppId, UserProfile } from '../../types/suite';
import { storage, PRIMARY_DOMAIN, generateSnnsEmail } from '../../services/storage';
import { adminService } from '../../services/adminService';
import { UserLoginModal } from '../common/UserLoginModal';
import { MultiTenantSwitcher } from '../common/MultiTenantSwitcher';
import { AppsDropdownMenu } from './AppsDropdownMenu';
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
  SaudiFlagIcon,
} from '../icons/AppIcons';

interface TopNavProps {
  currentApp: AppId | null;
  onSelectApp: (app: AppId | null) => void;
  lang: 'en' | 'ar';
  onToggleLang: () => void;
  onSearchQuery?: (q: string) => void;
  isAdminMode: boolean;
  onOpenAdminPanel: () => void;
  onRequestAdminLogin: () => void;
  onLockAdmin: () => void;
  onTriggerPrint?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenPwaModal?: () => void;
  onOpenInternalMail?: () => void;
  onNavigateToSts?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentApp,
  onSelectApp,
  lang,
  onToggleLang,
  onSearchQuery,
  isAdminMode,
  onOpenAdminPanel,
  onRequestAdminLogin,
  onLockAdmin,
  onTriggerPrint,
  isDarkMode = true,
  onToggleDarkMode,
  onOpenPwaModal,
  onOpenInternalMail,
  onNavigateToSts,
}) => {
  const [showWaffle, setShowWaffle] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [unreadMailCount, setUnreadMailCount] = useState<number>(0);

  // User Profile with official @snns.pro email
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storage.getUserProfile());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'biometrics' | 'signin' | 'directory' | 'security'>('biometrics');
  const [isEditingProfileName, setIsEditingProfileName] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [isServerAdminVerified, setIsServerAdminVerified] = useState<boolean>(() => adminService.isVerifiedAdmin());

  // Live polling for unread internal mail count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const safeEmail = (userProfile.email || 'user@snns.pro').toLowerCase();
        const res = await fetch(`/api/internal-mail/inbox/${encodeURIComponent(safeEmail)}`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            setUnreadMailCount(list.filter((m: any) => !m.read).length);
          }
        }
      } catch {}
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 7000);
    return () => clearInterval(timer);
  }, [userProfile.email]);

  // Check admin verification on mount and on auth change events
  useEffect(() => {
    const checkAdmin = async () => {
      const res = await adminService.verifyAdminStatus();
      setIsServerAdminVerified(res.isVerifiedAdmin);
    };
    checkAdmin();

    const handleAuthChange = (e: any) => {
      setIsServerAdminVerified(Boolean(e.detail?.isVerifiedAdmin));
    };
    window.addEventListener('snns_admin_auth_changed', handleAuthChange);
    return () => window.removeEventListener('snns_admin_auth_changed', handleAuthChange);
  }, []);

  // Sync profile when updated anywhere in the system
  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserProfile(storage.getUserProfile());
    };
    window.addEventListener('snns_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('snns_user_profile_updated', handleProfileUpdate);
  }, []);

  const handleSaveProfileName = () => {
    if (!profileNameInput.trim()) return;
    const updated = storage.setUserByName(profileNameInput.trim());
    setUserProfile(updated);
    setIsEditingProfileName(false);
    setProfileNameInput('');
  };

  const isAr = lang === 'ar';
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside and handle Ctrl+P / Cmd+P
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
        setShowNotifications(false);
        setShowProfile(false);
        setShowWaffle(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (onTriggerPrint) onTriggerPrint();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTriggerPrint]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchQuery) onSearchQuery(e.target.value);
  };

  const closeAllMenus = () => {
    setShowCreateMenu(false);
    setShowNotifications(false);
    setShowProfile(false);
    setShowWaffle(false);
  };

  return (
    <header
      ref={navRef}
      style={{
        backgroundColor: 'var(--snns-top-nav-bg, #090D0C)',
        color: 'var(--snns-top-nav-text, #ffffff)',
        borderColor: 'var(--snns-top-nav-border, #1F2926)',
      }}
      className="border-b h-13 flex items-center justify-between px-3 select-none relative z-50 shadow-md transition-colors duration-200"
    >
      {/* Start section: Waffle, Indexed count badge & Brand Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            const next = !showWaffle;
            closeAllMenus();
            setShowWaffle(next);
          }}
          className="p-2 hover:bg-white/10 rounded-xl transition flex items-center justify-center text-white cursor-pointer"
          title={isAr ? 'مشغّل تطبيقات SNNS' : 'SNNS App Launcher'}
        >
          <Grid className="w-5 h-5 text-emerald-400" />
        </button>

        {/* Index badge from image */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>15 تطبيقاً</span>
        </div>

        {/* Brand Logo with exact styling from user screenshot */}
        <button
          onClick={() => {
            closeAllMenus();
            onSelectApp(null);
          }}
          className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-xl transition text-left group cursor-pointer"
        >
          {/* SP Circular Badge */}
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
            SP
          </div>

          <div className="flex items-center gap-1">
            <span className="font-black text-base tracking-wide text-white flex items-center">
              <span>SNNS</span>
              <span className="text-amber-400 mx-0.5 font-black">.</span>
              <span className="text-emerald-400">PRO</span>
            </span>
          </div>

          <div className="hidden md:block scale-75 origin-start">
            <SaudiFlagIcon className="w-6 h-5 rounded" />
          </div>

          {currentApp && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold capitalize">
              {currentApp.replace('-', ' ')}
            </span>
          )}
        </button>

        {/* Server-Verified Admin Control Button on Top-Right */}
        {isServerAdminVerified && (
          <button
            onClick={() => {
              closeAllMenus();
              if (onNavigateToSts) {
                onNavigateToSts();
              } else {
                onOpenAdminPanel();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-md transition cursor-pointer shrink-0 animate-in fade-in"
            title={isAr ? 'لوحة تحكم المشرف العام الفائقة (/sts)' : 'STS Admin Portal (/sts)'}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">{isAr ? 'بوابة الإدارة /sts' : 'STS Portal /sts'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
          </button>
        )}
      </div>

      {/* Center: Search Bar with balanced logical margins & padding */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder={
              isAr
                ? 'ابحث في تطبيقات وخدمات ومستندات SNNS.PRO...'
                : 'Search apps, documents & services...'
            }
            className={`w-full ${
              isDarkMode
                ? 'bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:ring-emerald-500'
                : 'bg-white/95 border border-emerald-300 text-slate-900 placeholder-slate-500 focus:ring-emerald-400'
            } rounded-full py-1.5 ps-9 pe-8 text-xs focus:outline-none focus:ring-2 shadow-inner`}
          />
          {searchVal && (
            <button
              onClick={() => {
                setSearchVal('');
                if (onSearchQuery) onSearchQuery('');
              }}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Backend Controlled Search Dropdown */}
          {searchVal.trim() && (
            <div className="absolute top-full mt-2 start-0 w-96 max-w-[95vw] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 p-3 text-gray-800 dark:text-white text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800 mb-2 font-bold text-gray-500 text-[11px]">
                <span>{isAr ? 'نتائج البحث المعتمد في الدليل الداخلي' : 'Verified Directory Search'}</span>
                <span>{storage.searchVerifiedLinks(searchVal).length} {isAr ? 'نتائج' : 'results'}</span>
              </div>

              {storage.searchVerifiedLinks(searchVal).length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {storage.searchVerifiedLinks(searchVal).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSearchVal('')}
                      className="block p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-100 dark:border-slate-800 transition"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-blue-700 dark:text-blue-300 truncate">{link.title}</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          <Check className="w-2.5 h-2.5" />
                          <span>{isAr ? 'رابط رسمي معتمد' : 'Verified Official'}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1 mb-1">{link.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <span>{link.category} {link.subCategory ? `› ${link.subCategory}` : ''}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-slate-400 space-y-2">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {isAr ? 'عذراً، هذه الخدمة غير مفهرسة في الدليل المعتمد.' : 'Sorry, this service is not indexed in the verified directory.'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isAr ? 'يمكنك رفع طلب إضافتها للإدارة.' : 'You can request its addition through administration.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* End controls: Decluttered, Elegant & Professional */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Multi-Tenant Entity Switcher (Desktop) */}
        <div className="hidden xl:block">
          <MultiTenantSwitcher lang={lang} />
        </div>

        {/* Dark / Light Mode Switcher */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="p-2 hover:bg-white/10 rounded-xl transition text-amber-300 hover:text-amber-200 cursor-pointer"
            title={isDarkMode ? (isAr ? 'التحويل للوضع الفاتح' : 'Switch to Light Mode') : (isAr ? 'التحويل للوضع الداكن' : 'Switch to Dark Mode')}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Language switch */}
        <button
          onClick={onToggleLang}
          className="px-2.5 py-1 hover:bg-white/10 rounded-xl transition text-xs font-bold text-white cursor-pointer border border-white/15"
          title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          {isAr ? 'EN' : 'عربي'}
        </button>

        {/* Internal Mail shortcut with unread badge */}
        <button
          onClick={() => {
            closeAllMenus();
            if (onOpenInternalMail) {
              onOpenInternalMail();
            } else {
              onSelectApp('outlook');
            }
          }}
          className="p-2 hover:bg-white/10 rounded-xl transition relative text-white cursor-pointer"
          title={isAr ? 'بريد SNNS الداخلي (@snns.pro)' : 'SNNS Internal Mailbox'}
        >
          <Mail className="w-4 h-4 text-emerald-300 hover:text-emerald-200" />
          {unreadMailCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse shadow-sm">
              {unreadMailCount}
            </span>
          )}
        </button>

        {/* Unified Dynamic User Avatar & Account Button */}
        <div className="relative ms-1">
          {userProfile.isAuthenticated ? (
            <button
              onClick={() => {
                const next = !showProfile;
                closeAllMenus();
                setShowProfile(next);
              }}
              className="flex items-center gap-2 ps-1.5 pe-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-full font-bold text-xs transition cursor-pointer shadow-xs border border-white/30 group"
              title={`${userProfile.name} (${userProfile.email})`}
            >
              <div className={`w-7 h-7 rounded-full ${userProfile.avatarColor || 'bg-[#0078D4]'} text-white font-black text-xs flex items-center justify-center border border-white/60 shadow-xs ring-1 ring-white/40 group-hover:scale-105 transition-transform`}>
                {userProfile.avatarInitials || 'SN'}
              </div>
              <span className="truncate max-w-[110px] text-white">
                {userProfile.name.split(' ')[0]}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40" title={isAr ? 'متصل' : 'Online'} />
            </button>
          ) : (
            <button
              onClick={() => {
                closeAllMenus();
                setLoginModalTab('signin');
                setShowLoginModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-bold text-xs transition cursor-pointer shadow-sm border border-blue-400/40"
              title={isAr ? 'إنشاء حساب جديد أو تسجيل الدخول' : 'Sign In or Create Account'}
            >
              <User className="w-3.5 h-3.5 text-blue-100" />
              <span>{isAr ? 'دخول / حساب جديد' : 'Sign In / Up'}</span>
            </button>
          )}

          {showProfile && (
            <div className="absolute top-full mt-2 end-0 w-80 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 text-gray-800 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-11 h-11 rounded-2xl bg-[#0078D4] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {userProfile.avatarInitials || 'SN'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 truncate">
                    {userProfile.name}
                  </div>
                  <div className="font-mono text-[#0078D4] text-[11px] font-bold truncate mt-0.5">
                    {userProfile.email}
                  </div>
                  <div className="text-emerald-700 text-[10px] font-semibold mt-1 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{isAr ? 'الدومين المعتمد: snns.pro' : 'Verified Domain: snns.pro'}</span>
                  </div>
                  <div className="text-gray-500 text-[10px] truncate mt-1">
                    {userProfile.roleAr || userProfile.role}
                  </div>
                </div>
              </div>

              {/* Login Actions: Biometrics & Password */}
              <div className="pt-2.5 pb-2 space-y-1.5 border-b border-gray-100">
                <button
                  onClick={() => {
                    setLoginModalTab('biometrics');
                    setShowProfile(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full py-2 px-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-white rounded-xl font-bold flex items-center justify-between shadow-xs transition cursor-pointer border border-sky-400/20"
                >
                  <div className="flex items-center gap-2">
                    <ScanFace className="w-4 h-4 text-cyan-300" />
                    <span>{isAr ? 'الدخول بالعلامات الحيوية (Face ID / بصمة)' : 'Biometric Login (Face / Touch)'}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-400/20 text-cyan-200 px-1.5 py-0.5 rounded font-bold">
                    WebAuthn
                  </span>
                </button>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setLoginModalTab('signin');
                      setShowProfile(false);
                      setShowLoginModal(true);
                    }}
                    className="flex-1 py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#0078D4] rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-[11px] cursor-pointer border border-blue-200"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تسجيل بالاسم' : 'Sign In Name'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = storage.toggleTwoFactor();
                      setUserProfile(storage.getUserProfile());
                    }}
                    className={`py-1.5 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      userProfile.security?.twoFactorEnabled
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                    title={isAr ? 'المصادقة الثنائية (اختياري) - اضغط للتبديل' : 'Toggle 2FA (Optional)'}
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {userProfile.security?.twoFactorEnabled
                        ? (isAr ? '2FA مفعلة ✓' : '2FA On ✓')
                        : (isAr ? '2FA معطلة (اختياري)' : '2FA Off')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Directory Users Switcher */}
              <div className="py-2 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {isAr ? 'تبديل سريع في المؤسسة:' : 'Quick Corporate Switch:'}
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none snns-scroll-touch pb-1">
                  {storage.getDirectoryUsers().slice(0, 5).map((dirUser) => {
                    const isSelected =
                      dirUser.email.toLowerCase() === userProfile.email.toLowerCase();
                    return (
                      <button
                        key={dirUser.id}
                        onClick={() => {
                          const updated = storage.switchUser(dirUser);
                          setUserProfile(updated);
                          setShowProfile(false);
                        }}
                        title={`${dirUser.name} (${dirUser.email})`}
                        className={`w-7 h-7 rounded-xl text-white font-bold text-[10px] flex items-center justify-center shrink-0 transition cursor-pointer ${
                          dirUser.avatarColor
                        } ${
                          isSelected
                            ? 'ring-2 ring-[#0078D4] scale-110 shadow-sm'
                            : 'opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        {dirUser.avatarInitials}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      setShowLoginModal(true);
                    }}
                    className="w-7 h-7 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center text-xs font-bold shrink-0 transition"
                    title={isAr ? 'دخول بحساب جديد' : 'Sign in as new user'}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-1">
                {isAdminMode ? (
                  <button
                    onClick={() => {
                      onOpenAdminPanel();
                      setShowProfile(false);
                    }}
                    className="w-full text-start px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{isAr ? 'لوحة تحكم المدير (تخصيص الصفحة)' : 'Admin Control Panel'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onRequestAdminLogin();
                      setShowProfile(false);
                    }}
                    className="w-full text-start px-2 py-1.5 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{isAr ? 'تفعيل وضع المدير (Admin Login)' : 'Unlock Admin Mode'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onSelectApp('account');
                    setShowProfile(false);
                  }}
                  className="w-full text-start px-2.5 py-2 bg-sky-50 hover:bg-sky-100 rounded-xl text-sky-900 font-bold flex items-center justify-between cursor-pointer border border-sky-200 mb-1.5"
                >
                  <div className="flex items-center gap-2">
                    <AccountIcon className="w-4 h-4 shrink-0" />
                    <span>{isAr ? 'حسابي الموحد (SNNS Account)' : 'SNNS Central Account'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 rtl:rotate-90 -rotate-90 text-sky-600" />
                </button>

                <button
                  onClick={() => {
                    onSelectApp('onedrive');
                    setShowProfile(false);
                  }}
                  className="w-full text-start px-2 py-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
                >
                  {isAr ? 'مساحة تخزين SNNS Cloud (24.5 GB / 1000 GB)' : 'SNNS Cloud Storage (24.5 GB / 1 TB)'}
                </button>
                <button
                  onClick={() => {
                    onSelectApp('family-safety');
                    setShowProfile(false);
                  }}
                  className="w-full text-start px-2 py-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
                >
                  {isAr ? 'إعدادات العائلة والأمان' : 'Family & Safety Profile'}
                </button>

                <div className="pt-2 mt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      storage.setAdminMode(false);
                      const guest = storage.logoutUser();
                      setUserProfile(guest);
                      setShowProfile(false);
                    }}
                    className="w-full text-start px-2.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition border border-red-200"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{isAr ? 'تسجيل خروج (Sign Out)' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 9-Squares Apps Dropdown Menu (Categorized, Searchable, Responsive, Escape & Outside-click) */}
      <AppsDropdownMenu
        isOpen={showWaffle}
        onClose={() => setShowWaffle(false)}
        onSelectApp={onSelectApp}
        lang={lang}
        currentApp={currentApp}
        onOpenPwaModal={onOpenPwaModal}
        onOpenInternalMail={onOpenInternalMail}
        onNavigateToSts={onNavigateToSts}
        isServerAdminVerified={isServerAdminVerified}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-gray-900">
                {isAr ? 'إعدادات منظومة SNNS 365' : 'SNNS 365 Settings'}
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-gray-700">
                  {isAr ? 'لغة الواجهة (Interface Language)' : 'Interface Language'}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (lang !== 'ar') onToggleLang();
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg border text-center font-medium ${
                      lang === 'ar'
                        ? 'border-[#0078D4] bg-blue-50 text-[#0078D4]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    العربية (Arabic)
                  </button>
                  <button
                    onClick={() => {
                      if (lang !== 'en') onToggleLang();
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg border text-center font-medium ${
                      lang === 'en'
                        ? 'border-[#0078D4] bg-blue-50 text-[#0078D4]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-gray-700">
                  {isAr ? 'محرك الذكاء الاصطناعي (SNNS Copilot)' : 'AI Intelligence (SNNS Copilot)'}
                </label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between font-medium text-gray-800">
                    <span>Gemini 3.8 Flash Engine</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {isAr
                      ? 'مدمج عبر الخادم لدعم صياغة النصوص، معادلات إكسل، وعروض الشرائح.'
                      : 'Integrated server-side for text drafting, spreadsheet formulas, and slide generation.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-gray-700">
                  {isAr ? 'مساحة التخزين السحابية (SNNS OneDrive)' : 'Cloud Storage (SNNS OneDrive)'}
                </label>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#0078D4] h-2.5 rounded-full" style={{ width: '24.5%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                  <span>24.5 GB Used</span>
                  <span>100 GB Total</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-[#0078D4] text-white rounded-lg font-medium text-xs hover:bg-[#106EBE] transition"
              >
                {isAr ? 'إغلاق وحفظ' : 'Done & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Corporate User Login Modal (@snns.pro) */}
      <UserLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        lang={lang}
        initialTab={loginModalTab}
        onLoginSuccess={(updated) => {
          setUserProfile(updated);
        }}
      />
    </header>
  );
};
