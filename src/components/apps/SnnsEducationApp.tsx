import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  BookOpen,
  GraduationCap,
  Video,
  FileCheck,
  Calendar,
  Award,
  Download,
  Clock,
  User,
  Users,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Smartphone,
  Play,
  FileText,
  Bookmark,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { EducationIcon } from '../icons/AppIcons';
import { EducationCourse, EducationAssignment } from '../../types/suite';

interface SnnsEducationAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
  onOpenPwaModal?: () => void;
}

const INITIAL_COURSES: EducationCourse[] = [
  {
    id: 'crs-1',
    code: 'CS-401',
    titleAr: 'الحوسبة السحابية وهندسة المنظومات الموزعة',
    titleEn: 'Cloud Computing & Distributed Systems',
    instructorAr: 'د. خالد بن سلطان آل سعود',
    departmentAr: 'كلية علوم الحاسب والمعلومات',
    credits: 3,
    enrolledStudents: 142,
    progressPercentage: 68,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    nextLectureTime: 'اليوم • 04:00 مساءً (قاعة افتراضية 3)',
    status: 'active',
  },
  {
    id: 'crs-2',
    code: 'AI-502',
    titleAr: 'معالجة اللغة الطبيعية والذكاء الاصطناعي التوليدي',
    titleEn: 'Natural Language Processing & Generative AI',
    instructorAr: 'د. سارة المنصور',
    departmentAr: 'قسم الذكاء الاصطناعي وعلوم البيانات',
    credits: 4,
    enrolledStudents: 198,
    progressPercentage: 45,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    nextLectureTime: 'غداً • 10:00 صباحاً (قاعة افتراضية 1)',
    status: 'active',
  },
  {
    id: 'crs-3',
    code: 'FIN-310',
    titleAr: 'المحاسبة المالية المتقدمة وأنظمة الفوترة الإلكترونية',
    titleEn: 'Financial Accounting & E-Invoicing Systems',
    instructorAr: 'أ.د. عبدالله التميمي',
    departmentAr: 'كلية إدارة الأعمال والمالية',
    credits: 3,
    enrolledStudents: 110,
    progressPercentage: 82,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    nextLectureTime: 'الخميس • 01:30 ظهراً (قاعة افتراضية 2)',
    status: 'active',
  },
];

const INITIAL_ASSIGNMENTS: EducationAssignment[] = [
  {
    id: 'asg-1',
    courseId: 'crs-1',
    courseTitle: 'الحوسبة السحابية',
    titleAr: 'مشروع بناء معمارية Microservices عبر حاويات Docker',
    titleEn: 'Microservices Architecture Project',
    dueDate: '2026-10-15',
    maxScore: 20,
    status: 'pending',
  },
  {
    id: 'asg-2',
    courseId: 'crs-2',
    courseTitle: 'الذكاء الاصطناعي',
    titleAr: 'تدريب نموذج لغوي عربي مصغر لفرز المقالات',
    titleEn: 'Arabic NLP Classifier Training',
    dueDate: '2026-10-18',
    maxScore: 25,
    status: 'submitted',
  },
  {
    id: 'asg-3',
    courseId: 'crs-3',
    courseTitle: 'المحاسبة المالية',
    titleAr: 'إعداد ميزان المراجعة وقيد تسوية ضريبة القيمة المضافة',
    titleEn: 'Trial Balance & VAT Adjustment Journal',
    dueDate: '2026-10-05',
    maxScore: 15,
    status: 'graded',
    grade: 15,
  },
];

export const SnnsEducationApp: React.FC<SnnsEducationAppProps> = ({ onBack, lang, onOpenPwaModal }) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'courses' | 'lectures' | 'assignments' | 'library' | 'certificates'>('courses');
  const [courses] = useState<EducationCourse[]>(INITIAL_COURSES);
  const [assignments] = useState<EducationAssignment[]>(INITIAL_ASSIGNMENTS);

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 min-h-screen">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title={isAr ? 'العودة لمركز التطبيقات' : 'Back to Launcher'}
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          <div className="flex items-center gap-2.5">
            <EducationIcon className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>SNNS Education</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {isAr ? 'المنصة الأكاديمية والتعليمية' : 'Digital University Suite'}
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'إدارة المقررات، القاعات الافتراضية، الواجبات، والمكتبة الرقمية' : 'Courses, Virtual Halls, Assignments & Certificates'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenPwaModal && (
            <button
              onClick={onOpenPwaModal}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer border border-emerald-400/20"
              title={isAr ? 'تثبيت منصة التعليم كتطبيق مستقل PWA' : 'Install Standalone Education App'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'تثبيت PWA مستقل' : 'Install App'}</span>
            </button>
          )}

          <div className="text-end hidden sm:block">
            <span className="text-[10px] text-slate-400 block font-mono">طالب جامعي مسجل</span>
            <span className="text-xs font-bold text-emerald-400">عبدالرحمن العتيبي</span>
          </div>
        </div>
      </header>

      {/* Integration Notice */}
      <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-300">{isAr ? 'حالة الربط الأكاديمي:' : 'Academic Sync Status:'}</span>
          <span>
            {isAr
              ? 'الواجهة جاهزة محلياً للمقررات والقاعات — بانتظار ربط نظام إدارة التعلم المركزي للجامعات (LMS) في SNNS.PRO'
              : 'Local student portal active. Awaiting central LMS university integration on SNNS.PRO'}
          </span>
        </div>
        <span className="font-mono text-slate-500 hidden md:inline">edu.snns.pro/v1/lms</span>
      </div>

      {/* Sub Tabs */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none snns-scroll-touch text-xs shrink-0">
        {[
          { id: 'courses', nameAr: 'المقررات الدراسية', icon: BookOpen },
          { id: 'lectures', nameAr: 'القاعات والمحاضرات الافتراضية', icon: Video },
          { id: 'assignments', nameAr: 'الواجبات والاختبارات', icon: FileCheck },
          { id: 'library', nameAr: 'المكتبة والمصادر الرقمية', icon: Bookmark },
          { id: 'certificates', nameAr: 'الشهادات المعتمدة', icon: Award },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.nameAr}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.map((crs) => (
                <div
                  key={crs.id}
                  className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-4 flex flex-col justify-between transition shadow-sm group"
                >
                  <div>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden mb-3 bg-slate-900 relative">
                      <img src={crs.coverImage} alt={crs.titleAr} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <span className="absolute top-2 start-2 bg-black/70 backdrop-blur-xs text-[10px] text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                        {crs.code}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition mb-1">
                      {isAr ? crs.titleAr : crs.titleEn}
                    </h3>
                    <span className="text-xs text-slate-400 block mb-2">{crs.instructorAr}</span>

                    {crs.nextLectureTime && (
                      <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2 mb-3">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{crs.nextLectureTime}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>نسبة الإنجاز</span>
                      <span className="font-mono font-bold text-white">{crs.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${crs.progressPercentage}%` }} />
                    </div>

                    <button className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                      <Play className="w-3.5 h-3.5" />
                      <span>دخول الفصل الدراسي</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
            <h3 className="font-bold text-sm text-white mb-4">الواجبات والمهام الأكاديمية المسندة</h3>
            <div className="space-y-3">
              {assignments.map((asg) => (
                <div key={asg.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">{asg.courseTitle}</span>
                    <h4 className="font-bold text-white text-sm">{asg.titleAr}</h4>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      آخر موعد للتسليم: {asg.dueDate} • الدرجة القصوى: {asg.maxScore}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {asg.status === 'pending' && (
                      <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] font-bold">
                        بانتظار التسليم
                      </span>
                    )}
                    {asg.status === 'submitted' && (
                      <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-[11px] font-bold">
                        تم التسليم (قيد التصحيح)
                      </span>
                    )}
                    {asg.status === 'graded' && (
                      <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold">
                        تم التقييم: {asg.grade}/{asg.maxScore} ممتاز ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'lectures' || activeTab === 'library' || activeTab === 'certificates') && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center py-16">
            <GraduationCap className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">الخدمات الأكاديمية المعتمدة</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              الواجهة مهيأة للربط المباشر مع غرف الاجتماعات المشفرة في SNNS Calls لإقامة المحاضرات الافتراضية واستخراج شهادات الحضور الموثقة.
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>متاح مجاناً لجميع طلاب ومنسوبي المنظومة</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
