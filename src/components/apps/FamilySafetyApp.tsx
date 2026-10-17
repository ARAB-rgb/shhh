import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  Lock,
  Smartphone,
  Eye,
  Check,
  AlertTriangle,
  MapPin,
  Sliders,
  Sparkles,
  Download,
  Filter,
  Globe,
  Bell,
  Moon,
  Sun,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  Laptop,
  Tablet,
  Calendar,
} from 'lucide-react';
import { FamilySafetyIcon } from '../icons/AppIcons';

interface FamilySafetyAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age: number;
  avatar: string;
  color: string;
  dailyBudgetHours: number;
  usedHours: number;
  bedtimeHour: string;
  status: 'safe' | 'alert' | 'curfew';
  currentPlace: string;
}

export const FamilySafetyApp: React.FC<FamilySafetyAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';

  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: 'm-1',
      name: 'Alex (الابن - 11 سنة)',
      role: 'Child Profile',
      age: 11,
      avatar: 'AL',
      color: 'bg-teal-600',
      dailyBudgetHours: 3.0,
      usedHours: 1.75,
      bedtimeHour: '20:30',
      status: 'safe',
      currentPlace: isAr ? 'المدرسة المركزية' : 'Central School',
    },
    {
      id: 'm-2',
      name: 'Emma (الابنة - 14 سنة)',
      role: 'Teen Profile',
      age: 14,
      avatar: 'EM',
      color: 'bg-purple-600',
      dailyBudgetHours: 4.5,
      usedHours: 3.2,
      bedtimeHour: '22:00',
      status: 'safe',
      currentPlace: isAr ? 'نادي الروبوتيك' : 'Robotics Club',
    },
    {
      id: 'm-3',
      name: 'Lucas (الابن الأصغر - 6 سنوات)',
      role: 'Junior Kids',
      age: 6,
      avatar: 'LU',
      color: 'bg-amber-600',
      dailyBudgetHours: 1.5,
      usedHours: 0.8,
      bedtimeHour: '19:30',
      status: 'safe',
      currentPlace: isAr ? 'المنزل' : 'Home',
    },
  ]);

  const [activeMemberId, setActiveMemberId] = useState<string>('m-1');
  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<'screen-time' | 'web-filter' | 'geofence' | 'devices'>('screen-time');

  // Filter Categories Toggles
  const [filters, setFilters] = useState<{
    adultContent: boolean;
    gamingWebsites: boolean;
    socialMedia: boolean;
    gamblingViolence: boolean;
    safeSearch: boolean;
    youtubeRestricted: boolean;
  }>({
    adultContent: true,
    gamingWebsites: false,
    socialMedia: false,
    gamblingViolence: true,
    safeSearch: true,
    youtubeRestricted: true,
  });

  // URL Test Simulator
  const [testUrl, setTestUrl] = useState<string>('https://wikipedia.org');
  const [testResult, setTestResult] = useState<{ allowed: boolean; reason: string } | null>(null);

  // Geofence Safe Places
  const [safePlaces, setSafePlaces] = useState([
    { id: 'p-1', name: isAr ? 'المنزل (Safe Home)' : 'Home Zone', radius: '300m', alerts: true, active: true },
    { id: 'p-2', name: isAr ? 'المدرسة (School Zone)' : 'School Zone', radius: '500m', alerts: true, active: true },
    { id: 'p-3', name: isAr ? 'المكتبة العامة' : 'Public Library', radius: '200m', alerts: false, active: true },
  ]);

  const handleUpdateBudget = (hours: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === activeMember.id ? { ...m, dailyBudgetHours: hours } : m))
    );
  };

  const handleTestUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = testUrl.toLowerCase();
    let isBlocked = false;
    let reasonText = '';

    if (filters.adultContent && (url.includes('adult') || url.includes('xxx') || url.includes('nsfw'))) {
      isBlocked = true;
      reasonText = isAr ? 'تم حظر الرابط: محتوى غير ملائم للأطفال.' : 'Blocked: Inappropriate Content Filter.';
    } else if (filters.gamingWebsites && (url.includes('game') || url.includes('roblox') || url.includes('steam'))) {
      isBlocked = true;
      reasonText = isAr ? 'تم حظر الرابط: تم تفعيل تقييد ألعاب الفيديو.' : 'Blocked: Gaming Website Filter Active.';
    } else if (filters.socialMedia && (url.includes('tiktok') || url.includes('instagram') || url.includes('snapchat'))) {
      isBlocked = true;
      reasonText = isAr ? 'تم حظر الرابط: شبكات التواصل مقيدة أثناء وقت الدراسة.' : 'Blocked: Social Media restricted during study hours.';
    } else if (filters.gamblingViolence && (url.includes('bet') || url.includes('casino') || url.includes('poker'))) {
      isBlocked = true;
      reasonText = isAr ? 'تم حظر الرابط: مواقع المراهنات محظورة قطعياً.' : 'Blocked: Gambling restriction.';
    } else {
      isBlocked = false;
      reasonText = isAr ? 'الرابط مسموح وآمن وفق معايير الأمان المحددة.' : 'URL is safe and approved by family filters.';
    }

    setTestResult({ allowed: !isBlocked, reason: reasonText });
  };

  const exportSafetyReport = () => {
    const reportData = {
      title: 'SNNS Family Safety Wellbeing Report',
      generatedAt: new Date().toISOString(),
      member: activeMember.name,
      screenTime: `${activeMember.usedHours}h / ${activeMember.dailyBudgetHours}h`,
      bedtimeCurfew: activeMember.bedtimeHour,
      filters,
      location: activeMember.currentPlace,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FamilySafety-${activeMember.avatar}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <FamilySafetyIcon className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-gray-900">
                {isAr ? 'أمان العائلة SNNS Family Safety' : 'SNNS Family Safety'}
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Active Protection
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {isAr ? 'حماية متكاملة لوقت الشاشة، التصفح الآمن، والمواقع الجغرافية' : 'Digital wellbeing, safe web filtering & geofence tracking'}
            </p>
          </div>
        </div>

        <button
          onClick={exportSafetyReport}
          className="px-3 py-1.5 bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isAr ? 'تصدير تقرير الأمان' : 'Export Report'}</span>
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
        {/* Family Member Profiles Switcher */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMemberId(m.id);
                  setTestResult(null);
                }}
                className={`p-3 rounded-2xl border transition flex items-center gap-3 shrink-0 cursor-pointer ${
                  activeMember.id === m.id
                    ? 'bg-teal-50/70 border-teal-400 shadow-xs ring-1 ring-teal-400'
                    : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${m.color} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                  {m.avatar}
                </div>
                <div className="text-start">
                  <h3 className="font-bold text-gray-900 text-xs">{m.name}</h3>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{m.currentPlace}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-end shrink-0 bg-teal-50 px-4 py-2.5 rounded-2xl border border-teal-200">
            <span className="text-[11px] text-teal-800 font-semibold block">
              {isAr ? 'استهلاك وقت الشاشة اليوم:' : "Today's Screen Time:"}
            </span>
            <div className="font-black text-lg text-teal-950">
              {activeMember.usedHours}h / {activeMember.dailyBudgetHours}h
            </div>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex bg-gray-200/70 p-1.5 rounded-2xl gap-1 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('screen-time')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'screen-time' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 text-teal-600" />
            <span>{isAr ? 'وقت الشاشة والحدود' : 'Screen Time & Limits'}</span>
          </button>

          <button
            onClick={() => setActiveTab('web-filter')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'web-filter' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4 text-teal-600" />
            <span>{isAr ? 'تصفية الويب والمحتوى' : 'Web & Content Filter'}</span>
          </button>

          <button
            onClick={() => setActiveTab('geofence')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'geofence' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>{isAr ? 'المواقع الجغرافية الآمنة' : 'Geofence Safe Zones'}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SCREEN TIME CONTROLS & SCHEDULE                                    */}
        {/* ========================================================================= */}
        {activeTab === 'screen-time' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-150">
            {/* Limit Slider Card */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-gray-200 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{isAr ? 'تحديد الحد اليومي المسموح' : 'Daily Screen Time Allowance'}</h3>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {isAr ? `تعديل الميزانية اليومية لـ ${activeMember.name}` : `Adjust daily budget for ${activeMember.name}`}
                  </p>
                </div>
                <span className="text-base font-black text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                  {activeMember.dailyBudgetHours} {isAr ? 'ساعات' : 'Hours'}
                </span>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={activeMember.dailyBudgetHours}
                  onChange={(e) => handleUpdateBudget(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>30 mins</span>
                  <span>2 hours</span>
                  <span>4 hours</span>
                  <span>6 hours</span>
                  <span>8 hours</span>
                </div>
              </div>

              {/* Bedtime Curfew Setting */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'حظر وقت النوم (Bedtime Curfew)' : 'Bedtime Curfew'}</h4>
                    <p className="text-[11px] text-gray-500">{isAr ? 'يتم قفل الأجهزة تلقائياً بعد هذا التوقيت' : 'Devices automatically lock after bedtime'}</p>
                  </div>
                </div>
                <input
                  type="time"
                  value={activeMember.bedtimeHour}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    setMembers((prev) =>
                      prev.map((m) => (m.id === activeMember.id ? { ...m, bedtimeHour: newTime } : m))
                    );
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-bold font-mono text-xs focus:ring-1 focus:ring-teal-400"
                />
              </div>

              {/* Application Usage Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'توزيع الاستخدام حسب التطبيق' : 'App Usage Breakdown'}</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-700 font-semibold mb-1">
                      <span>SNNS Word & Learning Hub</span>
                      <span>55 mins (52%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '52%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-700 font-semibold mb-1">
                      <span>SNNS Clipchamp & Creative Video</span>
                      <span>35 mins (33%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '33%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-700 font-semibold mb-1">
                      <span>Approved Educational Browsing</span>
                      <span>15 mins (15%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status & Wellbeing Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{isAr ? 'حالة الحماية الحالية' : 'Current Safety Status'}</h3>
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ● {isAr ? 'ضمن الحدود الآمنة والمصرح بها' : 'Within Approved Healthy Limits'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {isAr
                    ? 'يتم فرض التصفية السحابية المعتمدة عبر بوابة snns.pro لضمان بيئة آمنة وملهمة للأطفال.'
                    : 'Cloud security filtering enforced via snns.pro gateway to ensure an enriching digital environment.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">{isAr ? 'الموقع النشط:' : 'Active Location:'}</span>
                  <span className="font-bold text-teal-900">{activeMember.currentPlace}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">{isAr ? 'وقت النوم المجدول:' : 'Scheduled Bedtime:'}</span>
                  <span className="font-bold text-teal-900 font-mono">{activeMember.bedtimeHour}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WEB FILTERING & LIVE URL TESTER                                    */}
        {/* ========================================================================= */}
        {activeTab === 'web-filter' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Filter Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'حظر المحتوى غير اللائق' : 'Inappropriate Content'}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{isAr ? 'حظر مواقع البالغين والمواد العنيفة' : 'Block adult and violent web content'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={filters.adultContent}
                  onChange={(e) => setFilters({ ...filters, adultContent: e.target.checked })}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'تقييد مواقع الألعاب' : 'Online Gaming Sites'}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{isAr ? 'تقييد الألعاب أثناء ساعات الدراسة' : 'Restrict games during homework hours'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={filters.gamingWebsites}
                  onChange={(e) => setFilters({ ...filters, gamingWebsites: e.target.checked })}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'تقييد شبكات التواصل' : 'Social Media Networks'}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{isAr ? 'تيك توك، انستقرام وسناب شات' : 'TikTok, Instagram, Snapchat'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={filters.socialMedia}
                  onChange={(e) => setFilters({ ...filters, socialMedia: e.target.checked })}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'حظر المراهنات والعنف' : 'Gambling & High-Risk'}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{isAr ? 'حظر فوري ومطلق لكافة الروابط المشبوهة' : 'Zero tolerance blocking on risky sites'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={filters.gamblingViolence}
                  onChange={(e) => setFilters({ ...filters, gamblingViolence: e.target.checked })}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'محرك البحث الآمن (SafeSearch)' : 'Bing / Google SafeSearch'}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{isAr ? 'إلزام محركات البحث بالفلترة الصارمة' : 'Force strict image and text filtering'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={filters.safeSearch}
                  onChange={(e) => setFilters({ ...filters, safeSearch: e.target.checked })}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'وضع يوتيوب المقيد (YouTube Safe)' : 'YouTube Restricted Mode'}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{isAr ? 'إخفاء الفيديوهات والتعليقات غير اللائقة' : 'Hide mature videos and public comments'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={filters.youtubeRestricted}
                  onChange={(e) => setFilters({ ...filters, youtubeRestricted: e.target.checked })}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Live Interactive URL Tester Simulator */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>{isAr ? 'فحص رابط فوري (Live URL Safety Tester)' : 'Live URL Safety Tester'}</span>
                </h3>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {isAr ? 'أدخل أي رابط ويب لاختبار سلوك الفلترة والتأكد من حظره أو السماح به فوراً.' : 'Enter any URL to test how the family security engine handles it in real time.'}
                </p>
              </div>

              <form onSubmit={handleTestUrl} className="flex gap-2">
                <input
                  type="url"
                  required
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-xs transition cursor-pointer"
                >
                  {isAr ? 'فحص الرابط' : 'Test URL'}
                </button>
              </form>

              {testResult && (
                <div
                  className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in duration-100 ${
                    testResult.allowed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {testResult.allowed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {testResult.allowed
                        ? (isAr ? '✓ الرابط مسموح وآمن للاستخدام' : '✓ URL Approved & Allowed')
                        : (isAr ? '⛔ الرابط محظور بنجاح بواسطة المنظومة' : '⛔ URL Blocked by Security Rule')}
                    </span>
                    <span className="text-[11px] opacity-90">{testResult.reason}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GEOFENCE SAFE PLACES MAP SIMULATOR                                 */}
        {/* ========================================================================= */}
        {activeTab === 'geofence' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>{isAr ? 'المناطق الجغرافية الآمنة والتنبيهات (Geofence)' : 'Safe Geofence Zones & Arrival Alerts'}</span>
                </h3>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {isAr ? 'إشعارات تلقائية عند وصول أو مغادرة أفراد العائلة للمناطق الآمنة.' : 'Automatic arrival & departure alerts when family members enter safe zones.'}
                </p>
              </div>

              <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                GPS Live Tracking Enabled
              </span>
            </div>

            {/* Simulated Live Radar / Map Container */}
            <div className="w-full h-56 bg-slate-900 rounded-3xl relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
              {/* Radar Circles */}
              <div className="absolute w-80 h-80 rounded-full border border-teal-500/20" />
              <div className="absolute w-52 h-52 rounded-full border border-teal-500/30" />
              <div className="absolute w-24 h-24 rounded-full border border-teal-500/40" />

              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

              {/* Safe Places Pins */}
              <div className="absolute top-12 left-20 flex flex-col items-center">
                <span className="p-2 bg-emerald-500 text-white rounded-full shadow-lg ring-4 ring-emerald-500/30 animate-bounce">
                  <MapPin className="w-4 h-4" />
                </span>
                <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-full mt-1">
                  {isAr ? 'المدرسة (School Zone)' : 'School Zone'}
                </span>
              </div>

              <div className="absolute bottom-12 right-24 flex flex-col items-center">
                <span className="p-2 bg-teal-500 text-white rounded-full shadow-lg ring-4 ring-teal-500/30">
                  <MapPin className="w-4 h-4" />
                </span>
                <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-full mt-1">
                  {isAr ? 'المنزل (Home Zone)' : 'Home Zone'}
                </span>
              </div>

              {/* Center status badge */}
              <div className="z-10 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-teal-400/30 text-center">
                <span className="text-teal-300 font-bold text-xs block">
                  {activeMember.name}
                </span>
                <span className="text-[10px] text-gray-300 font-mono">
                  {isAr ? `الموقع المؤكد: ${activeMember.currentPlace}` : `Verified Location: ${activeMember.currentPlace}`}
                </span>
              </div>
            </div>

            {/* Safe Places List */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-xs">{isAr ? 'المناطق المسجلة في النظام:' : 'Registered Safe Zones:'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {safePlaces.map((p) => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-gray-900 text-xs">{p.name}</h5>
                      <span className="text-[10px] text-gray-400 font-mono">Radius: {p.radius}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Alert
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
