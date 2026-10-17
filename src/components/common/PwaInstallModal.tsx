import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Check,
  ExternalLink,
  Laptop,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  Share,
  PlusSquare,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import {
  QaydPosIcon,
  QaydAccountingIcon,
  CallsIcon,
  ChatIcon,
  SnnsAiIcon,
} from '../icons/AppIcons';
import { appRegistry, APP_REGISTRY } from '../../services/appRegistry';
import { AppId, AppRegistryItem } from '../../types/suite';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  initialAppId?: AppId | null;
  onLaunchStandaloneApp?: (appId: AppId) => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialAppId,
  onLaunchStandaloneApp,
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const [selectedAppId, setSelectedAppId] = useState<AppId | 'full-platform'>(
    initialAppId || 'full-platform'
  );
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [hasPrompt, setHasPrompt] = useState<boolean>(!!appRegistry.getDeferredPrompt());

  useEffect(() => {
    const handlePrompt = () => setHasPrompt(true);
    window.addEventListener('snns_pwa_installable', handlePrompt);
    return () => window.removeEventListener('snns_pwa_installable', handlePrompt);
  }, []);

  const standaloneApps: { id: AppId; nameAr: string; nameEn: string; icon: any; descAr: string; manifestUrl: string }[] = [
    {
      id: 'qayd-pos',
      nameAr: 'QAYD POS — كاشير ونقاط البيع',
      nameEn: 'QAYD POS Cashier Terminal',
      icon: QaydPosIcon,
      descAr: 'تطبيق كاشير مستقل وسريع لشاشات اللمس والباركود والبيع المباشر',
      manifestUrl: '/manifest-qayd-pos.json',
    },
    {
      id: 'qayd-accounting',
      nameAr: 'QAYD Accounting — المحاسبة المالية',
      nameEn: 'QAYD Financial Accounting',
      icon: QaydAccountingIcon,
      descAr: 'لوحة القيود اليومية وشجرة الحسابات والتقارير المالية للشركات',
      manifestUrl: '/manifest-qayd-accounting.json',
    },
    {
      id: 'snns-calls',
      nameAr: 'SNNS Calls — المكالمات والاجتماعات',
      nameEn: 'SNNS Calls & Meetings',
      icon: CallsIcon,
      descAr: 'غرف الاجتماعات المشفرة ومكالمات الصوت والفيديو بدقة فائقة',
      manifestUrl: '/manifest-calls.json',
    },
    {
      id: 'snns-chat',
      nameAr: 'SNNS Chat — المحادثات الفورية',
      nameEn: 'SNNS Chat & Channels',
      icon: ChatIcon,
      descAr: 'قنوات التواصل المؤسسية الفورية ومراسلة فرق العمل',
      manifestUrl: '/manifest-chat.json',
    },
    {
      id: 'snns-ai',
      nameAr: 'SNNS AI — المساعد الذكي',
      nameEn: 'SNNS AI Smart Assistant',
      icon: SnnsAiIcon,
      descAr: 'نماذج الذكاء الاصطناعي ومعالجة اللغة والمحادثة السريعة',
      manifestUrl: '/manifest-ai.json',
    },
  ];

  const handleNativeInstall = async () => {
    setInstallStatus(isAr ? 'جاري فتح شاشة التثبيت...' : 'Opening install prompt...');
    const result = await appRegistry.triggerPwaInstall();
    if (result === 'accepted') {
      setInstallStatus(isAr ? 'تم قبول التثبيت بنجاح! ستظهر الأيقونة في جهازك.' : 'App installed successfully!');
    } else if (result === 'dismissed') {
      setInstallStatus(isAr ? 'تم إلغاء التثبيت من قبل المستخدم.' : 'Installation was dismissed.');
    } else {
      setInstallStatus(
        isAr
          ? 'المتصفح الحالي يتطلب التثبيت اليدوي من قائمة الخيارات (تثبيت التطبيق أو إضافة للشاشة الرئيسية).'
          : 'Please use the browser menu (Install App or Add to Home Screen).'
      );
    }
  };

  const handleDownloadManifest = (app: typeof standaloneApps[0]) => {
    const registryItem = APP_REGISTRY.find((a) => a.id === app.id);
    if (!registryItem) return;

    const url = appRegistry.generateStandaloneManifestBlobUrl(registryItem);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manifest-${app.id}.json`;
    link.click();
    setInstallStatus(isAr ? `تم تنزيل ملف Manifest لتطبيق ${app.nameAr} بنجاح` : 'Manifest downloaded successfully');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-white shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                {isAr ? 'مركز تثبيت تطبيقات SNNS.PRO المستقلة (PWA)' : 'SNNS.PRO Standalone PWA Installer'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'تثبيت المنظومة بالكامل أو تثبيت كل تطبيق منفرداً بأيقونة مستقلة وشاشة تشغيل مباشرة'
                  : 'Install full platform or standalone apps independently on your device'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Installation Mode Cards */}
        <div className="space-y-4 mb-6">
          {/* Option 1: Full SNNS.PRO Suite */}
          <div
            onClick={() => setSelectedAppId('full-platform')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              selectedAppId === 'full-platform'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-sm">
                PRO
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{isAr ? 'تثبيت منصة SNNS.PRO كاملة' : 'Install Full SNNS.PRO Platform'}</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    مستحسن
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? 'المنظومة السحابية الشاملة بجميع أدواتها (كاشير، محاسبة، مكالمات، بريد، سحابة، وذكاء اصطناعي)'
                    : 'All apps combined into one unified desktop/mobile application'}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNativeInstall();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تثبيت الآن' : 'Install'}</span>
            </button>
          </div>

          {/* Option 2: Individual Standalone Apps */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAr ? 'أو ثبّت تطبيقاً محدداً منفرداً بأيقونة مستقلة:' : 'Or Install Specific Standalone Apps:'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {standaloneApps.map((app) => {
                const IconComp = app.icon;
                const isSelected = selectedAppId === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="shrink-0 scale-90">
                        <IconComp className="w-9 h-9" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-white truncate">{isAr ? app.nameAr : app.nameEn}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{app.descAr}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onLaunchStandaloneApp) {
                            onLaunchStandaloneApp(app.id);
                            onClose();
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        title={isAr ? 'تشغيل التطبيق' : 'Launch'}
                      >
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadManifest(app);
                        }}
                        className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition"
                        title={isAr ? 'تحميل Manifest المستقل' : 'Download Manifest'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operating System Install Guides */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Info className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'تعليمات التثبيت حسب جهازك ونظام التشغيل:' : 'Device Installation Instructions:'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
              <span className="font-bold text-white block mb-1">Android (Chrome / Edge)</span>
              <span>اضغط على زر «تثبيت الآن» أعلاه أو من قائمة المتصفح اختر «تثبيت التطبيق على الشاشة الرئيسية».</span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-855">
              <span className="font-bold text-white block mb-1">iPhone / iPad (Safari)</span>
              <span>اضغط على زر المشاركة (Share) في أسفل الشاشة، ثم اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
              <span className="font-bold text-white block mb-1">Windows & Mac (Desktop)</span>
              <span>ستظهر أيقونة التثبيت بجوار شريط العنوان في المتصفح، أو انقر «تثبيت التطبيق» للتشغيل كنافذة مستقلة.</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-850">
            {isAr
              ? '* ملاحظة معمارية: تعتمد إمكانية التثبيت المستقل لكل تطبيق على دعم المتصفح والنظام لمواصفات Web App Manifest و Service Worker Scopes.'
              : '* Note: Standalone installability depends on browser and OS support for separate scope manifests.'}
          </p>
        </div>

        {/* Status Toast */}
        {installStatus && (
          <div className="mt-4 p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{installStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};
