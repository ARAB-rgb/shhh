import React, { useState } from 'react';
import { AppId } from '../../types/suite';
import {
  WordIcon,
  TeamsIcon,
  OneDriveIcon,
  OutlookIcon,
  CopilotIcon,
  FamilySafetyIcon,
  ToDoIcon,
  OneNoteIcon,
  PowerPointIcon,
  ExcelIcon,
  SkypeIcon,
  DesignerIcon,
  ClipchampIcon,
  CalendarIcon,
  FormsSurveyIcon,
  SnnsAiIcon,
  PrinterAppIcon,
  MarketplaceIcon,
  BusinessIcon,
  AccountIcon,
} from '../icons/AppIcons';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';

interface MoreAppsModalProps {
  onBack: () => void;
  onSelectApp: (app: AppId) => void;
  lang: 'en' | 'ar';
}

export const MoreAppsModal: React.FC<MoreAppsModalProps> = ({ onBack, onSelectApp, lang }) => {
  const isAr = lang === 'ar';
  const [filter, setFilter] = useState('');

  const catalog = [
    {
      id: 'snns-ai' as AppId,
      name: 'SNNS AI Suite',
      descEn: 'All-in-one AI suite: Chat assistant, writing studio, Excel formula wizard, slide deck architect, and voice synthesis.',
      descAr: 'منظومة الذكاء الاصطناعي الشاملة: محادثة ذكية، استوديو كتابة وتلخيص، توليد دوال إكسل، عروض تقديمية، وتوليد شعارات ونطق صوتي.',
      icon: <SnnsAiIcon className="w-10 h-10" />,
      category: 'Productivity',
    },
    {
      id: 'word' as AppId,
      name: 'SNNS Docs',
      descEn: 'Word processing, rich reports, documents, and AI drafting.',
      descAr: 'معالجة النصوص وصياغة المستندات الاحترافية بدعم الذكاء الاصطناعي.',
      icon: <WordIcon className="w-10 h-10" />,
      category: 'Productivity',
    },
    {
      id: 'excel' as AppId,
      name: 'SNNS Sheets',
      descEn: 'Spreadsheets, live calculations, SUM/AVG formulas, and charts.',
      descAr: 'جداول البيانات الإلكترونية والمعادلات الحسابية والرسوم البيانية.',
      icon: <ExcelIcon className="w-10 h-10" />,
      category: 'Productivity',
    },
    {
      id: 'powerpoint' as AppId,
      name: 'SNNS Presentations',
      descEn: 'Presentation design, themes, and full-screen slideshow mode.',
      descAr: 'تصميم العروض التقديمية والشرائح التفاعلية مع وضع العرض الحي.',
      icon: <PowerPointIcon className="w-10 h-10" />,
      category: 'Productivity',
    },
    {
      id: 'marketplace' as AppId,
      name: isAr ? 'سوق وإعلانات SNNS' : 'SNNS Marketplace',
      descEn: 'Commercial exchange, verified seller ads, auto & real estate trade.',
      descAr: 'سوق إعلانات تجارية وحراج للسيارات والعقارات والأجهزة والخدمات.',
      icon: <MarketplaceIcon className="w-10 h-10" />,
      category: 'Commerce',
    },
    {
      id: 'business' as AppId,
      name: isAr ? 'دليل شركات SNNS Business' : 'SNNS Business Directory',
      descEn: 'Corporate directory, verified enterprise profiles, CR licenses & B2B networking.',
      descAr: 'دليل المنشآت والشركات الموثقة بالسجل التجاري والتشبيك المؤسسي.',
      icon: <BusinessIcon className="w-10 h-10" />,
      category: 'Business',
    },
    {
      id: 'account' as AppId,
      name: isAr ? 'حساب SNNS الموحد' : 'SNNS Central Account',
      descEn: 'Unified identity, privacy, biometrics, 2FA, cloud storage and billing.',
      descAr: 'إدارة الهوية والأمان الحيوي والاشتراكات والمساحة السحابية الموحدة.',
      icon: <AccountIcon className="w-10 h-10" />,
      category: 'Security',
    },
    {
      id: 'teams' as AppId,
      name: 'SNNS Connect',
      descEn: 'Team chat channels, direct messages, and HD video meeting rooms.',
      descAr: 'محادثات الفرق والقنوات وغرف الاجتماعات والمكالمات المرئية والصوتية.',
      icon: <TeamsIcon className="w-10 h-10" />,
      category: 'Communication',
    },
    {
      id: 'outlook' as AppId,
      name: 'SNNS Mail',
      descEn: 'Unified corporate email, inbox management, and compose assistant.',
      descAr: 'إدارة البريد الإلكتروني والمراسلات ومساعد الصياغة الذكي.',
      icon: <OutlookIcon className="w-10 h-10" />,
      category: 'Communication',
    },
    {
      id: 'onedrive' as AppId,
      name: 'SNNS Cloud / Files',
      descEn: 'Secure cloud file storage, uploads, and cross-suite sharing.',
      descAr: 'التخزين السحابي الآمن ورفع الملفات ومشاركتها عبر المنظومة.',
      icon: <OneDriveIcon className="w-10 h-10" />,
      category: 'Storage',
    },
    {
      id: 'todo' as AppId,
      name: 'SNNS Tasks',
      descEn: 'Task management, My Day planner, reminders, and priorities.',
      descAr: 'تنظيم المهام اليومية وقوائم الإنجاز والمواعيد الهامة.',
      icon: <ToDoIcon className="w-10 h-10" />,
      category: 'Organization',
    },
    {
      id: 'onenote' as AppId,
      name: 'SNNS Notes',
      descEn: 'Digital notebooks, section tabs, and rich brainstorming canvas.',
      descAr: 'دفتر الملاحظات الرقمي وتقسيم الأقسام والتدوين السريع.',
      icon: <OneNoteIcon className="w-10 h-10" />,
      category: 'Organization',
    },
    {
      id: 'calendar' as AppId,
      name: 'SNNS Calendar',
      descEn: 'Event scheduling, month/day planners, and agenda tracking.',
      descAr: 'جدولة المواعيد وإدارة التقويم والمناسبات والاجتماعات.',
      icon: <CalendarIcon className="w-10 h-10" />,
      category: 'Organization',
    },
    {
      id: 'forms' as AppId,
      name: 'SNNS Forms / Survey',
      descEn: 'Surveys, quizzes, question designer, and live responses analytics.',
      descAr: 'تصميم الاستبيانات وجمع الردود وتحليل النتائج البيانية.',
      icon: <FormsSurveyIcon className="w-10 h-10" />,
      category: 'Productivity',
    },
    {
      id: 'designer' as AppId,
      name: 'SNNS Designer',
      descEn: 'Graphic canvas studio, social media posts, shapes, and exports.',
      descAr: 'تصميم الرسوم الجرافيكية ومنشورات التواصل وتصدير الصور.',
      icon: <DesignerIcon className="w-10 h-10" />,
      category: 'Creativity',
    },
    {
      id: 'clipchamp' as AppId,
      name: isAr ? 'أدوات تعديل وتحميل الفيديو' : 'Video Studio & Downloader',
      descEn: 'Video editing studio, URL video downloader, multi-track timeline, and captions.',
      descAr: 'أداة تحميل وتنزيل الفيديوهات من الروابط، واستوديو تحرير ومونتاج وقص الفيديو والترجمة والتصدير.',
      icon: <ClipchampIcon className="w-10 h-10" />,
      category: 'Creativity',
    },
    {
      id: 'skype' as AppId,
      name: 'SNNS Skype',
      descEn: 'HD phone calls, contacts directory, and interactive dialpad.',
      descAr: 'إجراء المكالمات الصوتية والمرئية ولوحة الاتصال التفاعلية.',
      icon: <SkypeIcon className="w-10 h-10" />,
      category: 'Communication',
    },
    {
      id: 'family-safety' as AppId,
      name: 'SNNS Family Safety',
      descEn: 'Parental controls, screen time limits, and web content filter.',
      descAr: 'حماية العائلة وتحديد وقت الشاشة وتصفية المحتوى الرقمي.',
      icon: <FamilySafetyIcon className="w-10 h-10" />,
      category: 'Security',
    },
  ];

  const filtered = filter
    ? catalog.filter(
        (app) =>
          app.name.toLowerCase().includes(filter.toLowerCase()) ||
          app.descEn.toLowerCase().includes(filter.toLowerCase()) ||
          app.descAr.toLowerCase().includes(filter.toLowerCase())
      )
    : catalog;

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-base text-gray-900">
              {isAr ? 'دليل جميع تطبيقات SNNS 365' : 'All SNNS 365 Applications'}
            </h1>
            <p className="text-xs text-gray-500">
              {isAr ? 'منظومة سحابية متكاملة غير وهمية' : 'Comprehensive Real Cloud Productivity Suite'}
            </p>
          </div>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={isAr ? 'تصفية التطبيقات...' : 'Filter applications...'}
            className="w-full bg-gray-100 rounded-md py-1.5 pl-8 pr-3 text-xs focus:outline-none"
          />
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {app.icon}
                  <span className="text-[10px] font-semibold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-full">
                    {app.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition">
                  {app.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {isAr ? app.descAr : app.descEn}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-blue-600">
                <span>{isAr ? 'تشغيل التطبيق' : 'Launch App'}</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
