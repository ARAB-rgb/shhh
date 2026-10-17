import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Building2,
  ShieldCheck,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  Plus,
  FileCheck,
  Check,
  X,
  ExternalLink,
  Briefcase,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { BusinessIcon } from '../icons/AppIcons';
import { BusinessCompany } from '../../types/suite';

interface BusinessAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

const INDUSTRIES = [
  { id: 'all', nameAr: 'جميع القطاعات', nameEn: 'All Industries' },
  { id: 'tech', nameAr: 'تقنية المعلومات والذكاء الاصطناعي', nameEn: 'Technology & AI' },
  { id: 'consulting', nameAr: 'الاستشارات الإدارية والمالية', nameEn: 'Consulting & Advisory' },
  { id: 'construction', nameAr: 'المقاولات والتطوير العقاري', nameEn: 'Construction & Real Estate' },
  { id: 'trade', nameAr: 'التجارة والتوريدات العامة', nameEn: 'General Trading' },
  { id: 'finance', nameAr: 'الخدمات المالية والاستثمار', nameEn: 'Finance & Investment' },
  { id: 'logistics', nameAr: 'النقل والخدمات اللوجستية', nameEn: 'Logistics & Supply Chain' },
];

const INITIAL_COMPANIES: BusinessCompany[] = [
  {
    id: 'biz-1',
    name: 'مجموعة SNNS السحابية للحلول الرقمية',
    nameEn: 'SNNS Cloud Digital Solutions Group',
    industry: 'tech',
    industryAr: 'تقنية المعلومات والذكاء الاصطناعي',
    industryEn: 'Technology & AI',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
    city: 'الرياض',
    cityEn: 'Riyadh',
    commercialId: '1010884920',
    verifiedBadge: 'gold',
    description: 'الجهة الرائدة في تطوير منظومات الحوسبة السحابية والمصادقة البيومترية المتقدمة وحلول المؤسسات المتكاملة في المملكة والشرق الأوسط.',
    services: [
      'تطوير منظومات العمل السحابية المخصصة',
      'بوابات الدخول الحيوي والتوثيق المعتمد',
      'استشارات التحول الرقمي وأمن البيانات',
      'ربط منصات الدفع وحلول الفوترة الإلكترونية',
    ],
    employeesCount: '150 - 500 موظف',
    contactEmail: 'contact@snns.pro',
    contactPhone: '+966114002000',
    website: 'https://snns.pro',
    establishedYear: 2018,
  },
  {
    id: 'biz-2',
    name: 'شركة روافد نجد للاستشارات الإدارية',
    nameEn: 'Rawafed Najd Management Consulting',
    industry: 'consulting',
    industryAr: 'الاستشارات الإدارية والمالية',
    industryEn: 'Consulting & Advisory',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
    city: 'الرياض',
    cityEn: 'Riyadh',
    commercialId: '1010672190',
    verifiedBadge: 'blue',
    description: 'بيت خبرة معتمد يقدم دراسات الجدوى الاقتصادية، الحوكمة المؤسسية، واستراتيجيات التوسع التجاري للمنشآت والمؤسسات الحكومية والخاصة.',
    services: [
      'حوكمة الشركات وإعادة الهيكلة',
      'دراسات الجدوى المالية والاقتصادية',
      'تخطيط الميزانيات التقديرية وضبط التكاليف',
    ],
    employeesCount: '50 - 100 موظف',
    contactEmail: 'info@rawafed-najd.sa',
    contactPhone: '+966112345678',
    website: 'https://rawafed-najd.sa',
    establishedYear: 2015,
  },
  {
    id: 'biz-3',
    name: 'مجموعة الأفق المتطورة للمقاولات والتطوير',
    nameEn: 'Al Ofoq Advanced Contracting & Development',
    industry: 'construction',
    industryAr: 'المقاولات والتطوير العقاري',
    industryEn: 'Construction & Real Estate',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=300&q=80',
    city: 'جدة',
    cityEn: 'Jeddah',
    commercialId: '4030551122',
    verifiedBadge: 'gold',
    description: 'تنفيذ المشاريع الإنشائية الكبرى والمجمعات التجارية والأبراج السكنية وفق أعلى معايير الجودة والاستدامة البيئية العالمية.',
    services: [
      'تنفيذ المشروعات السكنية والتجارية المتكاملة',
      'التطوير العقاري وإدارة المشروعات الهندسية',
      'أعمال البنية التحتية والتشطيبات الفاخرة',
    ],
    employeesCount: '500+ موظف',
    contactEmail: 'projects@alofoq-group.com',
    contactPhone: '+966126543210',
    website: 'https://alofoq-group.com',
    establishedYear: 2011,
  },
  {
    id: 'biz-4',
    name: 'سند العالمية للخدمات اللوجستية والنقل',
    nameEn: 'Sanad Global Logistics & Supply Chain',
    industry: 'logistics',
    industryAr: 'النقل والخدمات اللوجستية',
    industryEn: 'Logistics & Supply Chain',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
    city: 'الدمام',
    cityEn: 'Dammam',
    commercialId: '2050993411',
    verifiedBadge: 'blue',
    description: 'شبكة شحن بري وجوي وبحري متكاملة مع مستودعات تخزين مبردة وجافة مدعومة بتتبع إلكتروني متقدم في كافة موانئ ومطارات المنطقة.',
    services: [
      'إدارة سلاسل الإمداد والتوريد السريع',
      'التخليص الجمركي والتخزين اللوجستي الذكي',
      'الشحن الدولي متعدد الوسائط',
    ],
    employeesCount: '250 - 500 موظف',
    contactEmail: 'operations@sanadlogistics.com',
    contactPhone: '+966138901234',
    website: 'https://sanadlogistics.com',
    establishedYear: 2019,
  },
];

export const BusinessApp: React.FC<BusinessAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [companies, setCompanies] = useState<BusinessCompany[]>(() => {
    try {
      const saved = localStorage.getItem('snns_business_companies');
      return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });

  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCompany, setActiveCompany] = useState<BusinessCompany | null>(null);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // New Company Form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    nameEn: '',
    industry: 'tech',
    city: 'الرياض',
    commercialId: '',
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    employeesCount: '10 - 50 موظف',
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.commercialId) return;

    const indObj = INDUSTRIES.find((i) => i.id === registerForm.industry);

    const newCompany: BusinessCompany = {
      id: `biz-${Date.now()}`,
      name: registerForm.name,
      nameEn: registerForm.nameEn || registerForm.name,
      industry: registerForm.industry as any,
      industryAr: indObj?.nameAr || 'عام',
      industryEn: indObj?.nameEn || 'General',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
      city: registerForm.city,
      cityEn: registerForm.city,
      commercialId: registerForm.commercialId,
      verifiedBadge: 'standard',
      description: registerForm.description || 'شركة وطنية مسجلة في دليل أعمال ومنظومة SNNS Business.',
      services: ['حلول الأعمال والتجارة المعتمدة'],
      employeesCount: registerForm.employeesCount,
      contactEmail: registerForm.contactEmail || 'info@company.sa',
      contactPhone: registerForm.contactPhone || '+966500000000',
      website: registerForm.website || 'https://snns.site',
      establishedYear: new Date().getFullYear(),
    };

    const updated = [newCompany, ...companies];
    setCompanies(updated);
    localStorage.setItem('snns_business_companies', JSON.stringify(updated));
    setShowRegisterModal(false);
    setStatusNotice(isAr ? 'تم تسجيل المنشأة محلياً في الدليل. بانتظار اكتمال التحقق من السجل التجاري عبر منصة SNNS.PRO.' : 'Company registered locally. Awaiting commercial registry verification on SNNS.PRO.');
  };

  const handleVerifyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setShowVerifyModal(false);
    setStatusNotice(isAr ? 'تم استلام طلب التوثيق التجاري. حالة الطلب: قيد المراجعة الرسمية لدى مركز توثيق أعمال SNNS.' : 'Verification request received. Status: In official review by SNNS Verification Center.');
  };

  const filteredCompanies = companies.filter((c) => {
    if (selectedIndustry !== 'all' && c.industry !== selectedIndustry) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchCr = c.commercialId.includes(q);
      if (!matchName && !matchDesc && !matchCr) return false;
    }
    return true;
  });

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
              <BusinessIcon className="w-9 h-9" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    {isAr ? 'دليل أعمال وشركات SNNS' : 'SNNS Business Directory'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {isAr ? 'توثيق رسمي' : 'Verified B2B'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'دليل المنشآت والمجموعات التجارية الموثقة بالسجل التجاري'
                    : 'Commercial Directory of verified corporate groups & enterprises'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'طلب توثيق شركة' : 'Request Verification'}</span>
            </button>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'تسجيل منشأة جديدة' : 'Register Company'}</span>
            </button>
          </div>
        </div>

        {/* Status Line */}
        <div className="mt-2 pt-2 border-t border-slate-100 max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">
              {isAr ? 'حالة الربط:' : 'Integration Status:'}
            </span>
            <span>
              {isAr
                ? 'الواجهة جاهزة ومحدثة محلياً — بانتظار ربط السجلات التجارية المركزية في SNNS.PRO'
                : 'Interface active locally — awaiting official registry sync with SNNS.PRO'}
            </span>
          </div>
          <span className="font-mono text-slate-400 hidden md:inline">directory.snns.pro/api/b2b</span>
        </div>
      </header>

      {/* Alert banner if action taken */}
      {statusNotice && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2.5 text-xs text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button
            onClick={() => setStatusNotice(null)}
            className="text-indigo-700 hover:text-indigo-900 font-bold p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <section className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث باسم الشركة، السجل التجاري، أو الخدمات المقدمة في دليل SNNS...'
                  : 'Search by company name, CR number, or services...'
              }
              className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Industry tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snns-scroll-touch">
            {INDUSTRIES.map((ind) => {
              const isSelected = selectedIndustry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? ind.nameAr : ind.nameEn}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Companies List Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6">
        <div className="text-xs font-bold text-slate-500 mb-4">
          {isAr
            ? `عرض ${filteredCompanies.length} منشأة معتمدة`
            : `Showing ${filteredCompanies.length} verified companies`}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCompanies.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveCompany(c)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.logo}
                      alt={c.name}
                      className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-700 transition">
                          {c.name}
                        </h3>
                        {c.verifiedBadge === 'gold' && (
                          <span title={isAr ? 'توثيق ذهبي' : 'Gold Verified'}>
                            <Award className="w-4 h-4 text-amber-500 fill-amber-100 shrink-0" />
                          </span>
                        )}
                        {c.verifiedBadge === 'blue' && (
                          <span title={isAr ? 'توثيق رسمي' : 'Verified'}>
                            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700">
                        {isAr ? c.industryAr : c.industryEn}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {c.description}
                </p>

                {/* Services list snippet */}
                <div className="space-y-1 mb-4">
                  {c.services.slice(0, 2).map((srv, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                      <span className="truncate">{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom metadata */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{isAr ? c.city : c.cityEn}</span>
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-600">
                    CR: {c.commercialId}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                  <span>{isAr ? 'ملف الشركة' : 'Profile'}</span>
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Company Detail Modal */}
      {activeCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 text-white relative">
              <button
                onClick={() => setActiveCompany(null)}
                className="absolute top-4 end-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={activeCompany.logo}
                  alt={activeCompany.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shrink-0 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black">
                      {activeCompany.name}
                    </h2>
                    {activeCompany.verifiedBadge === 'gold' && (
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>{isAr ? 'توثيق ذهبي' : 'Gold Verified'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-200 mt-1">
                    {isAr ? activeCompany.industryAr : activeCompany.industryEn}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs sm:text-sm">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {isAr ? 'نبذة عن المنشأة' : 'About Company'}
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {activeCompany.description}
                </p>
              </div>

              {/* Company Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'السجل التجاري' : 'CR Number'}</span>
                  <span className="font-mono font-bold text-slate-800">{activeCompany.commercialId}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'المدينة' : 'Location'}</span>
                  <span className="font-bold text-slate-800">{isAr ? activeCompany.city : activeCompany.cityEn}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'سنة التأسيس' : 'Founded'}</span>
                  <span className="font-bold text-slate-800">{activeCompany.establishedYear}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'حجم الفريق' : 'Team Size'}</span>
                  <span className="font-bold text-slate-800">{activeCompany.employeesCount}</span>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {isAr ? 'الخدمات والحلول المعتمدة' : 'Services & Solutions'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCompany.services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-slate-800 text-xs font-semibold flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs">
                  <a
                    href={`mailto:${activeCompany.contactEmail}`}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeCompany.contactEmail}</span>
                  </a>
                  <a
                    href={`tel:${activeCompany.contactPhone}`}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeCompany.contactPhone}</span>
                  </a>
                </div>

                <a
                  href={activeCompany.website}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{isAr ? 'زيارة الموقع الإلكتروني' : 'Visit Website'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Company Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
            <div className="bg-indigo-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  {isAr ? 'تسجيل منشأة في دليل أعمال SNNS' : 'Register New Company'}
                </h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'اسم المنشأة بالعربية *' : 'Company Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder={isAr ? 'مثال: شركة التطوير المتقدم' : 'e.g. Advanced Tech Co.'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'القطاع *' : 'Industry *'}
                  </label>
                  <select
                    value={registerForm.industry}
                    onChange={(e) => setRegisterForm({ ...registerForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {INDUSTRIES.filter((i) => i.id !== 'all').map((i) => (
                      <option key={i.id} value={i.id}>
                        {isAr ? i.nameAr : i.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'رقم السجل التجاري *' : 'Commercial Registry (CR) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.commercialId}
                    onChange={(e) => setRegisterForm({ ...registerForm, commercialId: e.target.value })}
                    placeholder="1010XXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'المدينة والفرع الرئيسي *' : 'City *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                    placeholder={isAr ? 'الرياض' : 'Riyadh'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'البريد الإلكتروني الرسمي *' : 'Official Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.contactEmail}
                    onChange={(e) => setRegisterForm({ ...registerForm, contactEmail: e.target.value })}
                    placeholder="info@company.sa"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'نبذة عن أنشطة المنشأة' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={registerForm.description}
                  onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                  placeholder={isAr ? 'اكتب نبذة مختصرة عن نشاطات الشركة وخدماتها...' : 'Company profile summary...'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'تسجيل المنشأة' : 'Register'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Company Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
            <div className="bg-indigo-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-base">
                  {isAr ? 'طلب توثيق شركة معتمد' : 'Request Official Verification'}
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyRequest} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {isAr
                  ? 'يمنحك التوثيق التجاري شارة الموثوقية الرسمية (الذهبية أو الزرقاء) في منظومة SNNS Business وسوق SNNS Marketplace.'
                  : 'Verification grants your company an official verified trust badge across SNNS Business and Marketplace.'}
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'رقم السجل التجاري / الترخيص *' : 'Commercial Registry / License *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="1010XXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'اسم المفوض التجاري *' : 'Authorized Representative Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'الاسم الثلاثي للمفوض' : 'Representative Name'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'مرفق صورة السجل التجاري (PDF أو صورة)' : 'Attach CR Document'}
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                  <FileCheck className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500 block">
                    {isAr ? 'انقر لاختيار الملف أو الإفلات هنا' : 'Click to select file or drop here'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'إرسال طلب التوثيق' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
