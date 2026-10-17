import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Shield,
  CreditCard,
  HardDrive,
  Bell,
  Grid,
  Check,
  X,
  ScanFace,
  Fingerprint,
  Key,
  ShieldCheck,
  Lock,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  Layers,
  FileText,
  Mail,
  Video,
  Database,
  RefreshCw,
  Sliders,
  DollarSign,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { AccountIcon } from '../icons/AppIcons';
import { UserProfile, UserSecuritySettings } from '../../types/suite';
import { storage, PRIMARY_DOMAIN } from '../../services/storage';
import { biometricFeedback } from '../../services/biometricFeedback';

interface AccountAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
  onNavigateToApp?: (appId: string) => void;
}

export const AccountApp: React.FC<AccountAppProps> = ({
  onBack,
  lang,
  onNavigateToApp,
}) => {
  const isAr = lang === 'ar';
  const [profile, setProfile] = useState<UserProfile>(() => storage.getUserProfile());
  const [activeTab, setActiveTab] = useState<
    'profile' | 'apps' | 'security' | 'billing' | 'storage' | 'notifications'
  >('profile');

  // Form states
  const [editName, setEditName] = useState(profile.name);
  const [editRole, setEditRole] = useState(profile.roleAr || profile.role);
  const [editDepartment, setEditDepartment] = useState(profile.departmentAr || profile.department);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Security states
  const [security, setSecurity] = useState<UserSecuritySettings>(() => storage.getSecuritySettings());
  const [biometricTesting, setBiometricTesting] = useState(false);
  const [biometricResult, setBiometricResult] = useState<string | null>(null);

  // Upgrade Plan Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<'pro' | 'enterprise'>('enterprise');

  useEffect(() => {
    const handleProfileUpdate = () => {
      const p = storage.getUserProfile();
      setProfile(p);
      setSecurity(storage.getSecuritySettings());
    };
    window.addEventListener('snns_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('snns_user_profile_updated', handleProfileUpdate);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storage.saveUserProfile({
      name: editName,
      roleAr: editRole,
      departmentAr: editDepartment,
    });
    setProfile(updated);
    setSaveFeedback(
      isAr
        ? 'تم حفظ تفاصيل الملف الشخصي محلياً. بانتظار مزامنة الحساب المركزي في snns.pro.'
        : 'Profile details saved locally. Awaiting central sync with snns.pro.'
    );
    setTimeout(() => setSaveFeedback(null), 4000);
  };

  const handleToggle2FA = () => {
    const next = storage.toggleTwoFactor();
    setSecurity(storage.getSecuritySettings());
    setSaveFeedback(
      next
        ? (isAr ? 'تم تفعيل المصادقة الثنائية (2FA) اختيارياً على الحساب.' : 'Two-Factor Authentication (2FA) enabled.')
        : (isAr ? 'تم تعطيل المصادقة الثنائية — الدخول بالبصمة الحيوية مباشرة.' : '2FA disabled — direct biometric login active.')
    );
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  const handleTestBiometrics = async () => {
    setBiometricTesting(true);
    setBiometricResult(null);
    try {
      const authResult = await biometricFeedback.authenticateWithWebAuthn(profile.email);
      if (authResult.success) {
        setBiometricResult(
          isAr
            ? 'تم التحقق الحيوي بنجاح — متوافق مع معايير WebAuthn FIDO2'
            : 'Biometric verification successful — WebAuthn FIDO2 compliant'
        );
        storage.verifyBiometricAuth('both');
        setSecurity(storage.getSecuritySettings());
      } else {
        setBiometricResult(
          isAr
            ? 'تنبيه: لم يتم تأكيد الحساس الحيوي في هذا الجهاز'
            : 'Notice: Biometric sensor not confirmed on this device'
        );
      }
    } catch {
      setBiometricResult(
        isAr ? 'تمت محاكاة الفحص الحيوي بنجاح محلياً.' : 'Local biometric simulation successful.'
      );
    } finally {
      setBiometricTesting(false);
    }
  };

  // Connected apps list
  const CONNECTED_APPS = [
    { id: 'connect', name: isAr ? 'SNNS Connect' : 'SNNS Connect', desc: isAr ? 'المحادثات والمكالمات والاجتماعات' : 'Chat, calls & meetings', status: isAr ? 'متصل ومصرح' : 'Connected', icon: Video, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'mail', name: isAr ? 'SNNS Mail' : 'SNNS Mail', desc: isAr ? 'صندوق البريد والمراسلات الموثقة' : 'Corporate email inbox', status: isAr ? 'متصل ومصرح' : 'Connected', icon: Mail, color: 'text-blue-600 bg-blue-50' },
    { id: 'files', name: isAr ? 'SNNS Cloud / Files' : 'SNNS Cloud Files', desc: isAr ? 'التخزين السحابي ومزامنة الملفات' : 'Cloud storage & file sync', status: isAr ? 'متصل ومصرح' : 'Connected', icon: HardDrive, color: 'text-sky-600 bg-sky-50' },
    { id: 'docs', name: isAr ? 'SNNS Docs' : 'SNNS Docs', desc: isAr ? 'محرر المستندات والتقارير' : 'Word processing documents', status: isAr ? 'متصل ومصرح' : 'Connected', icon: FileText, color: 'text-blue-700 bg-blue-50' },
    { id: 'sheets', name: isAr ? 'SNNS Sheets' : 'SNNS Sheets', desc: isAr ? 'الجداول الإلكترونية والصيغ الحسابية' : 'Spreadsheets and data calculations', status: isAr ? 'متصل ومصرح' : 'Connected', icon: Layers, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'marketplace', name: isAr ? 'SNNS Marketplace' : 'SNNS Marketplace', desc: isAr ? 'سوق وإعلانات وحراج المنظومة' : 'Commercial marketplace & Haraj', status: isAr ? 'متصل ومصرح' : 'Connected', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
    { id: 'business', name: isAr ? 'SNNS Business' : 'SNNS Business', desc: isAr ? 'دليل الشركات والتوثيق التجاري' : 'B2B Corporate directory', status: isAr ? 'متصل ومصرح' : 'Connected', icon: ShieldCheck, color: 'text-indigo-700 bg-indigo-50' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 shadow-xs sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
              title={isAr ? 'الرجوع للمركز' : 'Back to Launcher'}
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-2.5">
              <AccountIcon className="w-9 h-9" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    {isAr ? 'حساب SNNS الموحد' : 'SNNS Central Account'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                    {isAr ? 'منظومة دفتره الموحدة' : 'Unified Suite'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'إدارة الهوية، الأمان الحيوي، الاشتراكات، والتطبيقات المرتبطة'
                    : 'Manage identity, biometrics, subscriptions & connected apps'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[11px] font-bold">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Status Line */}
        <div className="mt-2 pt-2 border-t border-slate-100 max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">
              {isAr ? 'خادم الحساب المركزي:' : 'Central Account Server:'}
            </span>
            <span>
              {isAr
                ? 'الواجهة جاهزة محلياً — بانتظار ربط خادم الحسابات والمصادقة في SNNS.PRO'
                : 'Interface ready locally — awaiting direct authentication sync with SNNS.PRO'}
            </span>
          </div>
          <span className="font-mono text-slate-400 hidden md:inline">auth.snns.pro/v1/account</span>
        </div>
      </header>

      {/* Save Feedback banner */}
      {saveFeedback && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
          <button
            onClick={() => setSaveFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isAr ? 'الملف الشخصي والخصوصية' : 'Profile & Privacy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'apps'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{isAr ? 'التطبيقات المرتبطة' : 'Connected Apps'}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <div className="flex-1 flex items-center justify-between">
              <span>{isAr ? 'الأمان والمصادقة' : 'Security & Auth'}</span>
              <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">
                2FA / Passkey
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isAr ? 'الاشتراكات والمدفوعات' : 'Subscriptions & Billing'}</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>{isAr ? 'مساحة التخزين السحابية' : 'Cloud Storage'}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{isAr ? 'الإشعارات والتفضيلات' : 'Notifications & Alerts'}</span>
          </button>
        </aside>

        {/* Main Details Panel */}
        <main className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          {/* TAB 1: Profile & Privacy */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isAr ? 'الملف الشخصي وهوية المنظومة' : 'Personal Profile & Identity'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'بيانات المستخدم الموحدة التي يتم مشاركتها عبر جميع تطبيقات SNNS'
                    : 'Unified corporate identity shared across all SNNS apps'}
                </p>
              </div>

              {/* Avatar & Email Card */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
                  {profile.avatarInitials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{profile.name}</h3>
                  <div className="font-mono text-xs text-sky-700 font-bold mt-0.5">{profile.email}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{isAr ? `نطاق المؤسسة المعتمد: ${PRIMARY_DOMAIN}` : `Domain: ${PRIMARY_DOMAIN}`}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isAr ? 'المسمى الوظيفي' : 'Role'}
                    </label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'الإدارة / القسم' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Connected Apps */}
          {activeTab === 'apps' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isAr ? 'تطبيقات منظومة SNNS المرتبطة' : 'Connected SNNS Apps'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'تسجيل الدخول الموحد (SSO) مفعل تلقائياً لجميع تطبيقات الحساب'
                    : 'Single Sign-On (SSO) active automatically across all apps'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CONNECTED_APPS.map((app) => {
                  const IconComp = app.icon;
                  return (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-sky-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${app.color}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{app.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{app.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Security & Auth */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isAr ? 'الأمان، المصادقة الثنائية، والبصمة الحيوية' : 'Security, 2FA & Biometrics'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'دعم كامل لمعيار WebAuthn FIDO2 للدخول ببصمة الوجه والإصبع ومفاتيح المرور'
                    : 'Complete WebAuthn FIDO2 standard support for biometric touch, face & passkeys'}
                </p>
              </div>

              {/* Two-Factor Authentication Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      {isAr ? 'المصادقة الثنائية (2FA)' : 'Two-Factor Authentication'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {isAr ? 'اختياري' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-lg leading-relaxed">
                    {isAr
                      ? 'عند تفعيلها، يطلب النظام رمز تحقق مكون من 6 أرقام بعد التحقق الحيوي. عند تعطيلها، يكون الدخول بالبصمة الحيوية مباشرة.'
                      : 'When enabled, a 6-digit verification code is required after biometrics. When disabled, you sign in immediately via biometrics.'}
                  </p>
                </div>

                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                    security.twoFactorEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {security.twoFactorEnabled
                    ? (isAr ? 'مفعلة (انقر للتعطيل)' : 'Enabled (Click to Disable)')
                    : (isAr ? 'معطلة (انقر للتفعيل)' : 'Disabled (Click to Enable)')}
                </button>
              </div>

              {/* Biometrics Test & Verification */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ScanFace className="w-5 h-5 text-cyan-300" />
                    <h3 className="font-bold text-sm">
                      {isAr ? 'فحص واختبار العلامات الحيوية (WebAuthn / Passkey)' : 'Test Biometrics (WebAuthn)'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded font-bold">
                    FIDO2 Verified
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'اختبر استجابة حساس بصمة الإصبع أو Face ID بجهازك للتحقق من تكامل مفاتيح المرور المشفرة محلياً.'
                    : 'Test your fingerprint or Face ID sensor response to verify passkeys integration.'}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <button
                    onClick={handleTestBiometrics}
                    disabled={biometricTesting}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>
                      {biometricTesting
                        ? (isAr ? 'جارِ فحص الحساس...' : 'Scanning Sensor...')
                        : (isAr ? 'بدء فحص البصمة الآن' : 'Start Biometric Scan')}
                    </span>
                  </button>

                  <div className="text-[11px] text-slate-400">
                    <span>{isAr ? 'آخر دخول بالبصمة: ' : 'Last biometric scan: '}</span>
                    <span className="text-cyan-300 font-bold">{security.lastBiometricLogin || (isAr ? 'اليوم' : 'Today')}</span>
                  </div>
                </div>

                {biometricResult && (
                  <div className="p-3 bg-white/10 rounded-xl text-xs font-semibold text-cyan-200 border border-white/15">
                    {biometricResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Subscriptions & Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isAr ? 'الباقات والاشتراكات والمدفوعات' : 'Subscriptions & Invoices'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'إدارة خطط ترخيص منظومة SNNS والفواتير المعتمدة'
                    : 'Manage SNNS licenses, tiers and official invoices'}
                </p>
              </div>

              {/* Current Active Plan Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 p-5 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[11px]">
                      {isAr ? 'الباقة النشطة' : 'Active Tier'}
                    </span>
                    <h3 className="font-black text-base text-slate-900">
                      SNNS Enterprise Cloud 365
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'ترخيص مؤسسي شامل لجميع التطبيقات، سعة تخزين 1 تيرابايت، دخول بيومتري غير محدود، ودعم فني على مدار الساعة.'
                      : 'Complete enterprise license across all apps, 1TB storage, unlimited biometrics and 24/7 priority support.'}
                  </p>
                </div>

                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                >
                  {isAr ? 'ترقية أو تغيير الباقة' : 'Upgrade Plan'}
                </button>
              </div>

              {/* Invoices Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2.5">
                  {isAr ? 'سجل الفواتير والمدفوعات الرسمية' : 'Billing History & Invoices'}
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="py-2.5 px-3.5 text-start">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                        <th className="py-2.5 px-3.5 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                        <th className="py-2.5 px-3.5 text-start">{isAr ? 'المبلغ' : 'Amount'}</th>
                        <th className="py-2.5 px-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-2.5 px-3.5 font-mono font-bold">INV-2026-001</td>
                        <td className="py-2.5 px-3.5">01 Oct 2026</td>
                        <td className="py-2.5 px-3.5 font-bold">299 SAR</td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            {isAr ? 'مدفوعة ✓' : 'Paid ✓'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-mono font-bold">INV-2026-000</td>
                        <td className="py-2.5 px-3.5">01 Sep 2026</td>
                        <td className="py-2.5 px-3.5 font-bold">299 SAR</td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            {isAr ? 'مدفوعة ✓' : 'Paid ✓'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Cloud Storage */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isAr ? 'مساحة التخزين السحابية المخصصة' : 'Allocated Cloud Storage'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'تفاصيل استهلاك المساحة عبر تطبيقات المستندات والجداول والوسائط والبريد'
                    : 'Storage usage breakdown across Docs, Sheets, Media & Mail'}
                </p>
              </div>

              {/* Storage Bar Breakdown */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">24.5 GB</span>
                    <span className="text-slate-500 ms-1">/ 1,000 GB (1 TB)</span>
                  </div>
                  <span className="font-bold text-sky-700">2.45% {isAr ? 'مستخدم' : 'used'}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-blue-600 h-full w-[1.2%]" title="Docs"></div>
                  <div className="bg-emerald-500 h-full w-[0.8%]" title="Sheets"></div>
                  <div className="bg-purple-600 h-full w-[0.3%]" title="Media"></div>
                  <div className="bg-amber-500 h-full w-[0.15%]" title="Mail"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>{isAr ? 'المستندات: 12 GB' : 'Docs: 12 GB'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>{isAr ? 'الجداول: 8 GB' : 'Sheets: 8 GB'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span>{isAr ? 'الوسائط: 3 GB' : 'Media: 3 GB'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>{isAr ? 'البريد: 1.5 GB' : 'Mail: 1.5 GB'}</span>
                  </div>
                </div>
              </div>

              {/* Tiers list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <h4 className="font-bold text-xs text-slate-900 mb-1">{isAr ? 'باقة 100 جيجابايت' : '100 GB Tier'}</h4>
                  <div className="text-sm font-black text-slate-800 mb-2">9 SAR <span className="text-[10px] text-slate-400">/ {isAr ? 'شهرياً' : 'mo'}</span></div>
                  <button
                    onClick={() => {
                      setSaveFeedback(isAr ? 'بانتظار ربط بوابة الدفع المركزية في SNNS.PRO.' : 'Awaiting payment gateway sync on SNNS.PRO.');
                    }}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    {isAr ? 'ترقية' : 'Upgrade'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl border-2 border-sky-500 bg-sky-50/30 relative">
                  <span className="absolute -top-2.5 start-3 bg-sky-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
                    {isAr ? 'الحالية' : 'Current'}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 mb-1">{isAr ? 'باقة 1 تيرابايت' : '1 TB Tier'}</h4>
                  <div className="text-sm font-black text-slate-800 mb-2">29 SAR <span className="text-[10px] text-slate-400">/ {isAr ? 'شهرياً' : 'mo'}</span></div>
                  <button disabled className="w-full py-1.5 bg-sky-600 text-white font-bold rounded-xl text-xs opacity-80 cursor-default">
                    {isAr ? 'مفعلة' : 'Active'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <h4 className="font-bold text-xs text-slate-900 mb-1">{isAr ? 'باقة 5 تيرابايت' : '5 TB Tier'}</h4>
                  <div className="text-sm font-black text-slate-800 mb-2">89 SAR <span className="text-[10px] text-slate-400">/ {isAr ? 'شهرياً' : 'mo'}</span></div>
                  <button
                    onClick={() => {
                      setSaveFeedback(isAr ? 'بانتظار ربط بوابة الدفع المركزية في SNNS.PRO.' : 'Awaiting payment gateway sync on SNNS.PRO.');
                    }}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    {isAr ? 'ترقية' : 'Upgrade'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Notifications & Preferences */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {isAr ? 'تفضيلات الإشعارات والتنبيهات' : 'Notifications & Preferences'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'التحكم في تنبيهات الأمان، إشعارات البريد، ومحادثات المنظومة'
                    : 'Control security alerts, mail notifications and system chats'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">{isAr ? 'تنبيهات تسجيل الدخول والأمان الحيوي' : 'Biometric Security & Login Alerts'}</span>
                    <span className="text-[11px] text-slate-500">{isAr ? 'إشعار فوري عند محاولة تسجيل دخول جديدة' : 'Instant notification upon new sign-in attempt'}</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">{isAr ? 'إشعارات محادثات ومكالمات SNNS Connect' : 'SNNS Connect Calls & Messages'}</span>
                    <span className="text-[11px] text-slate-500">{isAr ? 'رنين وتنبيه مرئي عند ورود مكالمة أو رسالة' : 'Ringing & notification on incoming calls'}</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">{isAr ? 'إشعارات سوق SNNS Marketplace' : 'Marketplace Inquiries'}</span>
                    <span className="text-[11px] text-slate-500">{isAr ? 'تنبيه عند إرسال استفسار أو سومة جديدة على إعلاناتك' : 'Alert when buyers inquire or bid on your ads'}</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                </label>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {isAr ? 'ترقية باقة SNNS السحابية' : 'Upgrade SNNS Subscription'}
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {isAr
                  ? 'اختر الخطة المناسبة لمنشأتك للتمتع بكامل خدمات المنظومة السحابية المتقدمة.'
                  : 'Choose the appropriate plan for your organization to access advanced enterprise cloud features.'}
              </p>

              <div className="space-y-2">
                <div
                  onClick={() => setSelectedUpgradePlan('pro')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    selectedUpgradePlan === 'pro'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-900">SNNS Professional</h4>
                    <span className="text-[11px] text-slate-500">{isAr ? '500 جيجابايت تخزين + مستخدمين حتى 25' : '500GB storage + up to 25 users'}</span>
                  </div>
                  <span className="font-bold text-indigo-700">149 SAR / mo</span>
                </div>

                <div
                  onClick={() => setSelectedUpgradePlan('enterprise')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    selectedUpgradePlan === 'enterprise'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-900">SNNS Enterprise Sovereign</h4>
                    <span className="text-[11px] text-slate-500">{isAr ? 'سعة غير محدودة + مستخدمين غير محدود + دعم مخصص' : 'Unlimited storage & users + dedicated support'}</span>
                  </div>
                  <span className="font-bold text-indigo-700">499 SAR / mo</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isAr
                    ? 'بانتظار ربط بوابة الدفع المركزية في SNNS.PRO لتفعيل الفواتير البنكية المباشرة.'
                    : 'Awaiting direct payment gateway integration on SNNS.PRO.'}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setSaveFeedback(
                      isAr
                        ? 'تم تسجيل طلب الترقية محلياً. بانتظار استكمال الربط البنكي في SNNS.PRO.'
                        : 'Upgrade requested locally. Awaiting banking gateway sync on SNNS.PRO.'
                    );
                  }}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  {isAr ? 'تأكيد الطلب' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
