import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function generateSmartFallback(prompt: string, appType?: string): string {
  const p = prompt.toLowerCase();
  if (appType === 'word' || p.includes('وثيقة') || p.includes('مقال') || p.includes('document') || p.includes('report')) {
    return `### SNNS Word Draft: Document Summary & Key Highlights
1. **Executive Overview**: A structured overview addressing ${prompt.slice(0, 60)}...
2. **Key Objectives**:
   - Streamline core workflow and team productivity
   - Ensure high data accuracy and cross-platform compatibility
   - Deliver measurable outcomes within scheduled timeline
3. **Implementation Plan**:
   - Phase 1: Planning and scope definition
   - Phase 2: Execution and cross-app collaboration in SNNS 365
   - Phase 3: Final review and export`;
  }

  if (appType === 'excel' || p.includes('formula') || p.includes('معادلة') || p.includes('حساب') || p.includes('جدول')) {
    return `### SNNS Excel Recommended Formulas & Analysis
- **Total Calculation**: \`=SUM(B2:B10)\`
- **Average Performance**: \`=AVERAGE(B2:B10)\`
- **Conditional Evaluation**: \`=IF(B2>=1000, "Target Reached", "Below Target")\`
- **Growth Rate**: \`=(C2-B2)/B2 * 100\``;
  }

  if (appType === 'powerpoint' || p.includes('عرض') || p.includes('slides') || p.includes('presentation')) {
    return `### SNNS PowerPoint Slide Outline
- **Slide 1**: Title & Strategic Vision for ${prompt.slice(0, 40)}
- **Slide 2**: Problem Statement & Market Opportunity
- **Slide 3**: Proposed Solution & Unique Value Proposition
- **Slide 4**: Key Metrics, Milestones & Roadmap
- **Slide 5**: Q&A and Next Steps`;
  }

  if (appType === 'outlook' || p.includes('إيميل') || p.includes('email') || p.includes('رسالة')) {
    return `Subject: Update & Collaborative Next Steps - SNNS 365

Dear Team,

I hope this message finds you well.

Regarding our discussion on "${prompt.slice(0, 50)}", I have prepared the initial framework and shared the assets in our SNNS OneDrive space. Please review at your earliest convenience so we can align on final milestones.

Best regards,
SNNS 365 Team`;
  }

  return `### SNNS Copilot Assistant Response
Here is a comprehensive breakdown for your request:
- **Core Insight**: ${prompt}
- **Actionable Steps**:
  1. Organize data in SNNS OneDrive for seamless access.
  2. Collaborate with the team via SNNS Teams channels.
  3. Track milestones in SNNS To Do and schedule reviews in SNNS Calendar.

Let me know if you would like me to draft this in SNNS Word, generate slides in SNNS PowerPoint, or calculate metrics in SNNS Excel!`;
}

// Types & In-Memory Data Store for Admin & Governance
interface SupervisorPermissions {
  canManageApps: boolean;
  canManageGovDirectory: boolean;
  canReviewQueue: boolean;
  canManageSupervisors: boolean;
  canCustomizeAppearance: boolean;
}

interface SupervisorAccount {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'supervisor' | 'auditor';
  roleAr: string;
  departmentAr: string;
  status: 'active' | 'suspended';
  permissions: SupervisorPermissions;
  lastLogin: string;
  createdAt: string;
  avatarInitials: string;
}

interface GovEntity {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  officialUrl: string;
  category: string;
  categoryAr: string;
  categoryEn: string;
  approvalStatus: 'approved' | 'pending_review' | 'rejected';
  descriptionAr: string;
  descriptionEn: string;
  servicesList: string[];
  verifiedBadge: boolean;
  lastAuditBy: string;
  updatedAt: string;
}

interface ManagedApp {
  id: string;
  labelAr: string;
  labelEn: string;
  appTargetId: string;
  isExternal: boolean;
  externalUrl?: string;
  category: string;
  badge?: string;
  icon: string;
  shape?: string;
  colorScheme?: string;
  status: 'published' | 'hidden' | 'archived' | 'pending_review';
  submittedBy: string;
  approvedBy?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewQueueItem {
  id: string;
  entityType: 'site_app' | 'gov_entity' | 'feature';
  entityId: string;
  title: string;
  actionType: 'create' | 'update' | 'archive' | 'status_change';
  details: string;
  payload: any;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  timestamp: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  actorEmail: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// Initial In-Memory State
const supervisorsDB: SupervisorAccount[] = [
  {
    id: 'sup-1',
    name: 'م. عبد الرحمن السبيعي',
    email: 'admin@snns.pro',
    role: 'super_admin',
    roleAr: 'المدير العام للمنظومة',
    departmentAr: 'الإدارة التنفيذية وتقنية المعلومات',
    status: 'active',
    permissions: {
      canManageApps: true,
      canManageGovDirectory: true,
      canReviewQueue: true,
      canManageSupervisors: true,
      canCustomizeAppearance: true,
    },
    lastLogin: 'اليوم، 11:20 ص',
    createdAt: '2025-01-10',
    avatarInitials: 'AS',
  },
  {
    id: 'sup-2',
    name: 'سارة المنصور',
    email: 'sarah.almansoor@snns.pro',
    role: 'supervisor',
    roleAr: 'مشرفة تدقيق التطبيقات والمواقع',
    departmentAr: 'قسم ضمان الجودة والنشر',
    status: 'active',
    permissions: {
      canManageApps: true,
      canManageGovDirectory: false,
      canReviewQueue: true,
      canManageSupervisors: false,
      canCustomizeAppearance: false,
    },
    lastLogin: 'اليوم، 09:45 ص',
    createdAt: '2025-02-15',
    avatarInitials: 'SM',
  },
  {
    id: 'sup-3',
    name: 'خالد الحربي',
    email: 'khalid.alharbi@snns.pro',
    role: 'supervisor',
    roleAr: 'مشرف الدليل والربط الحكومي',
    departmentAr: 'إدارة الامتثال والجهات الحكومية',
    status: 'active',
    permissions: {
      canManageApps: false,
      canManageGovDirectory: true,
      canReviewQueue: false,
      canManageSupervisors: false,
      canCustomizeAppearance: false,
    },
    lastLogin: 'أمس، 04:10 م',
    createdAt: '2025-03-01',
    avatarInitials: 'KH',
  },
  {
    id: 'sup-4',
    name: 'فاطمة الشمري',
    email: 'fatima.alshammari@snns.pro',
    role: 'supervisor',
    roleAr: 'مشرفة الهوية وتجربة المستخدم',
    departmentAr: 'فريق التصميم والمظهر',
    status: 'active',
    permissions: {
      canManageApps: false,
      canManageGovDirectory: false,
      canReviewQueue: false,
      canManageSupervisors: false,
      canCustomizeAppearance: true,
    },
    lastLogin: 'اليوم، 08:30 ص',
    createdAt: '2025-04-12',
    avatarInitials: 'FS',
  },
];

const govDirectoryDB: GovEntity[] = [
  {
    id: 'gov-zatca',
    code: 'KSA-ZATCA-01',
    nameAr: 'هيئة الزكاة والضريبة والجمارك (ZATCA)',
    nameEn: 'Zakat, Tax and Customs Authority',
    officialUrl: 'https://zatca.gov.sa',
    category: 'finance_tax',
    categoryAr: 'المالية والضرائب والجمارك',
    categoryEn: 'Finance, Tax & Customs',
    approvalStatus: 'approved',
    descriptionAr: 'البوابة الرسمية لاعتماد الفاتورة الإلكترونية والربط مع منظومة الفوترة والامتثال الضريبي.',
    descriptionEn: 'Official portal for ZATCA e-invoicing compliance, tax declarations and customs.',
    servicesList: ['الفاتورة الإلكترونية (فاتورة)', 'الإقرارات والزكاة', 'بوابة الجمارك والمنافذ', 'شهادات الامتثال'],
    verifiedBadge: true,
    lastAuditBy: 'م. عبد الرحمن السبيعي',
    updatedAt: '2026-10-01',
  },
  {
    id: 'gov-mof',
    code: 'KSA-MOF-02',
    nameAr: 'وزارة المالية (منصة اعتماد)',
    nameEn: 'Ministry of Finance (Etimad)',
    officialUrl: 'https://mof.gov.sa',
    category: 'finance_tax',
    categoryAr: 'المالية والميزانية',
    categoryEn: 'Finance & Budget',
    approvalStatus: 'approved',
    descriptionAr: 'منظومة الخدمات المالية الحكومية وإدارة أوامر الدفع والعقود والمنافسات.',
    descriptionEn: 'Government financial system for payments, tenders, and contracts.',
    servicesList: ['منصة اعتماد', 'أوامر الدفع والمطالبات', 'المشتريات الحكومية', 'إدارة الميزانية'],
    verifiedBadge: true,
    lastAuditBy: 'م. عبد الرحمن السبيعي',
    updatedAt: '2026-09-28',
  },
  {
    id: 'gov-absher',
    code: 'KSA-MOI-ABSHER',
    nameAr: 'منصة أبشر (وزارة الداخلية)',
    nameEn: 'Absher Platform (Ministry of Interior)',
    officialUrl: 'https://absher.sa',
    category: 'interior_security',
    categoryAr: 'الداخلية والهوية الرقمية',
    categoryEn: 'Interior & Digital Identity',
    approvalStatus: 'approved',
    descriptionAr: 'المنصة الوطنية الموحدة لخدمات الجوازات والأحوال المدنية والمرور والمنشآت.',
    descriptionEn: 'National platform for identity, civil affairs, passport and traffic services.',
    servicesList: ['أبشر أعمال', 'الهوية الرقمية الموحدة', 'إصدار وتجديد التراخيص', 'إدارة تفويض المنشآت'],
    verifiedBadge: true,
    lastAuditBy: 'خالد الحربي',
    updatedAt: '2026-10-02',
  },
  {
    id: 'gov-najiz',
    code: 'KSA-MOJ-NAJIZ',
    nameAr: 'منصة ناجز (وزارة العدل)',
    nameEn: 'Najiz (Ministry of Justice)',
    officialUrl: 'https://najiz.sa',
    category: 'justice',
    categoryAr: 'العدل والتوثيق القضائي',
    categoryEn: 'Justice & Notary',
    approvalStatus: 'approved',
    descriptionAr: 'الخدمات القضائية والتوثيقية وعقود الشركات والتراخيص العدلية الرقمية.',
    descriptionEn: 'Judicial, notary, business deeds, and dispute resolution digital services.',
    servicesList: ['الوكالات الإلكترونية', 'توثيق عقود الشركات', 'خدمات التنفيذ', 'القضاء التجاري'],
    verifiedBadge: true,
    lastAuditBy: 'خالد الحربي',
    updatedAt: '2026-09-30',
  },
  {
    id: 'gov-mc',
    code: 'KSA-MC-05',
    nameAr: 'وزارة التجارة (منصة الأعمال)',
    nameEn: 'Ministry of Commerce (Business Platform)',
    officialUrl: 'https://mc.gov.sa',
    category: 'commerce',
    categoryAr: 'التجارة والشركات',
    categoryEn: 'Commerce & Corporate',
    approvalStatus: 'approved',
    descriptionAr: 'إصدار السجلات التجارية وحجز الأسماء والعلامات التجارية وتعديل عقود التأسيس.',
    descriptionEn: 'Commercial registry issuance, company deeds, trademarks and commercial licensing.',
    servicesList: ['السجل التجاري الفوري', 'حجز الأسماء التجارية', 'عقود التأسيس للشركات', 'التراخيص المهنية'],
    verifiedBadge: true,
    lastAuditBy: 'م. عبد الرحمن السبيعي',
    updatedAt: '2026-10-05',
  },
  {
    id: 'gov-gosi',
    code: 'KSA-GOSI-06',
    nameAr: 'المؤسسة العامة للتأمينات الاجتماعية (GOSI)',
    nameEn: 'General Organization for Social Insurance',
    officialUrl: 'https://gosi.gov.sa',
    category: 'labor_social',
    categoryAr: 'العمل والتأمينات الاجتماعية',
    categoryEn: 'Labor & Social Insurance',
    approvalStatus: 'approved',
    descriptionAr: 'إدارة اشتراكات الموظفين وشهادات التأمينات وحماية الأجور وإصدار المخالصات.',
    descriptionEn: 'Employee insurance contributions, wage protection compliance and certificates.',
    servicesList: ['شهادة التأمينات للمنشأة', 'حماية الأجور والامتثال', 'تسجيل واستبعاد المشتركين'],
    verifiedBadge: true,
    lastAuditBy: 'خالد الحربي',
    updatedAt: '2026-09-22',
  },
  {
    id: 'gov-balady',
    code: 'KSA-BALADY-07',
    nameAr: 'منصة بلدي (وزارة البلديات والإسكان)',
    nameEn: 'Balady Platform (MOMRAH)',
    officialUrl: 'https://balady.gov.sa',
    category: 'municipal',
    categoryAr: 'البلديات والتراخيص المكانية',
    categoryEn: 'Municipal & Spatial Permits',
    approvalStatus: 'approved',
    descriptionAr: 'الرخص البلدية الفورية ورخص الأنشطة التجارية وتصاريح البناء والامتثال المكاني.',
    descriptionEn: 'Commercial municipal licenses, compliance certificates and building permits.',
    servicesList: ['الرخصة التجارية الفورية', 'شهادة امتثال المباني', 'تصاريح الإشغال والإعلانات'],
    verifiedBadge: true,
    lastAuditBy: 'خالد الحربي',
    updatedAt: '2026-09-18',
  },
  {
    id: 'gov-sdaia',
    code: 'KSA-SDAIA-08',
    nameAr: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)',
    nameEn: 'Saudi Data & AI Authority (SDAIA)',
    officialUrl: 'https://sdaia.gov.sa',
    category: 'digital_tech',
    categoryAr: 'البيانات والذكاء الاصطناعي والتقنية',
    categoryEn: 'Data, AI & Digital Tech',
    approvalStatus: 'approved',
    descriptionAr: 'إدارة النفاذ الوطني الموحد وحوكمة البيانات الشخصية والمعايير الوطنية للذكاء الاصطناعي.',
    descriptionEn: 'National SSO IAM, personal data protection compliance and national AI initiatives.',
    servicesList: ['منظومة النفاذ الوطني', 'نظام حماية البيانات الشخصية', 'سحابة ديم الحكومية'],
    verifiedBadge: true,
    lastAuditBy: 'م. عبد الرحمن السبيعي',
    updatedAt: '2026-10-06',
  },
  {
    id: 'gov-saber',
    code: 'KSA-SASO-SABER',
    nameAr: 'منصة سابر (المواصفات والمقاييس SASO)',
    nameEn: 'SABER Platform (SASO)',
    officialUrl: 'https://saber.sa',
    category: 'commerce',
    categoryAr: 'التجارة والمطابقة الفنية',
    categoryEn: 'Commerce & Technical Standards',
    approvalStatus: 'pending_review',
    descriptionAr: 'تسجيل المنتجات الاستهلاكية والمطابقة مع المواصفات القياسية السعودية قبل التوريد.',
    descriptionEn: 'Product certification and standard conformance for Saudi commercial distribution.',
    servicesList: ['شهادات مطابقة المنتجات', 'شهادات الإرسالية الاستيرادية'],
    verifiedBadge: false,
    lastAuditBy: 'قيد التدقيق الأولي',
    updatedAt: '2026-10-07',
  },
];

const managedAppsDB: ManagedApp[] = [
  {
    id: 'app-snns-ai',
    labelAr: 'المساعد الذكي SNNS AI',
    labelEn: 'SNNS AI Assistant',
    appTargetId: 'snns-ai',
    isExternal: false,
    category: 'الذكاء الاصطناعي',
    badge: 'PRO NLP',
    icon: 'sparkles',
    shape: 'squircle',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'النظام الأساسي',
    approvedBy: 'م. عبد الرحمن السبيعي',
    order: 0,
    createdAt: '2025-01-01',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-qayd-pos',
    labelAr: 'كاشير قيد ونقاط البيع (QAYD POS)',
    labelEn: 'QAYD POS Cashier',
    appTargetId: 'qayd-pos',
    isExternal: false,
    category: 'النقاط والمدفوعات',
    badge: 'كاشير ZATCA',
    icon: 'shopping-cart',
    shape: 'squircle',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'فريق المدفوعات',
    approvedBy: 'م. عبد الرحمن السبيعي',
    order: 1,
    createdAt: '2025-01-10',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-qayd-acc',
    labelAr: 'المحاسبة المالية قيد (QAYD Accounting)',
    labelEn: 'QAYD Accounting',
    appTargetId: 'qayd-accounting',
    isExternal: false,
    category: 'المالية والمحاسبة',
    badge: 'قيود ودفاتر',
    icon: 'calculator',
    shape: 'squircle',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'الفريق المالي',
    approvedBy: 'م. عبد الرحمن السبيعي',
    order: 2,
    createdAt: '2025-01-15',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-snns-calls',
    labelAr: 'مكالمات SNNS Calls',
    labelEn: 'SNNS Calls',
    appTargetId: 'snns-calls',
    isExternal: false,
    category: 'الاتصالات والاجتماعات',
    badge: 'اجتماعات HD',
    icon: 'phone',
    shape: 'squircle',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'فريق الاتصالات',
    approvedBy: 'سارة المنصور',
    order: 3,
    createdAt: '2025-02-01',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-snns-chat',
    labelAr: 'محادثات SNNS Chat',
    labelEn: 'SNNS Chat',
    appTargetId: 'snns-chat',
    isExternal: false,
    category: 'المراسلة المؤسسية',
    badge: 'فوري',
    icon: 'message-square',
    shape: 'squircle',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'فريق الاتصالات',
    approvedBy: 'سارة المنصور',
    order: 4,
    createdAt: '2025-02-01',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-snns-word',
    labelAr: 'مستندات SNNS Docs',
    labelEn: 'SNNS Docs',
    appTargetId: 'word',
    isExternal: false,
    category: 'المكتب والإنتاجية',
    icon: 'file-text',
    shape: 'standard',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'النظام الأساسي',
    approvedBy: 'م. عبد الرحمن السبيعي',
    order: 5,
    createdAt: '2025-01-01',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-snns-excel',
    labelAr: 'جداول SNNS Sheets',
    labelEn: 'SNNS Sheets',
    appTargetId: 'excel',
    isExternal: false,
    category: 'المكتب والإنتاجية',
    icon: 'table',
    shape: 'standard',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'النظام الأساسي',
    approvedBy: 'م. عبد الرحمن السبيعي',
    order: 6,
    createdAt: '2025-01-01',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-snns-powerpoint',
    labelAr: 'عروض SNNS Presentations',
    labelEn: 'SNNS Presentations',
    appTargetId: 'powerpoint',
    isExternal: false,
    category: 'المكتب والإنتاجية',
    icon: 'presentation',
    shape: 'standard',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'النظام الأساسي',
    approvedBy: 'م. عبد الرحمن السبيعي',
    order: 7,
    createdAt: '2025-01-01',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-snns-education',
    labelAr: 'المنصة التعليمية SNNS Education',
    labelEn: 'SNNS Education Platform',
    appTargetId: 'snns-education',
    isExternal: false,
    category: 'التعليم والتدريب',
    badge: 'أكاديميا',
    icon: 'graduation-cap',
    shape: 'squircle',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'فريق التعليم',
    approvedBy: 'سارة المنصور',
    order: 8,
    createdAt: '2025-02-20',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-snns-printer',
    labelAr: 'طابعة واي فاي الذكية (SNNS Wi-Fi Printer)',
    labelEn: 'SNNS Wi-Fi Smart Printer',
    appTargetId: 'printer',
    isExternal: false,
    category: 'العتاد والأجهزة',
    badge: 'طابعة واي فاي',
    icon: 'printer',
    shape: 'squircle',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'فريق العتاد',
    approvedBy: 'سارة المنصور',
    order: 9,
    createdAt: '2025-03-01',
    updatedAt: '2026-10-08',
  },
  {
    id: 'app-snns-clipchamp',
    labelAr: 'أدوات الفيديو والتحميل (Video Studio)',
    labelEn: 'Video Studio & Downloader',
    appTargetId: 'clipchamp',
    isExternal: false,
    category: 'الوسائط المتعددة',
    badge: 'استوديو',
    icon: 'video',
    shape: 'squircle',
    colorScheme: 'default',
    status: 'published',
    submittedBy: 'فريق الوسائط',
    approvedBy: 'سارة المنصور',
    order: 10,
    createdAt: '2025-03-05',
    updatedAt: '2026-10-08',
  },
];

const reviewQueueDB: ReviewQueueItem[] = [
  {
    id: 'rev-001',
    entityType: 'gov_entity',
    entityId: 'gov-saber',
    title: 'طلب اعتماد جهة: منصة سابر للمواصفات والمقاييس',
    actionType: 'create',
    details: 'طلب إضافة منصة سابر التابعة للهيئة السعودية للمواصفات والمقاييس والجودة برابط https://saber.sa',
    payload: { code: 'KSA-SASO-SABER', nameAr: 'منصة سابر' },
    submittedBy: 'خالد الحربي',
    status: 'pending',
    timestamp: '2026-10-07 14:30',
  },
  {
    id: 'rev-002',
    entityType: 'site_app',
    entityId: 'custom-fleet',
    title: 'اقتراح ربط تطبيق خارجي: منصة تتبع الأسطول اللوجستي',
    actionType: 'create',
    details: 'اقتراح تطبيق جديد لنظام النقل الذكي عبر https://logistics.snns.pro/fleet',
    payload: { labelAr: 'تتبع الأسطول', externalUrl: 'https://logistics.snns.pro/fleet' },
    submittedBy: 'مدير العمليات',
    status: 'pending',
    timestamp: '2026-10-08 09:15',
  },
];

const auditLogsDB: AuditLogEntry[] = [
  {
    id: 'log-001',
    action: 'اعتماد جهة حكومية',
    actor: 'م. عبد الرحمن السبيعي',
    actorEmail: 'admin@snns.pro',
    targetType: 'gov_entity',
    targetId: 'gov-zatca',
    details: 'تم فحص واعتماد هيئة الزكاة والضريبة والجمارك (KSA-ZATCA-01) مع توثيق الروابط الرسمية.',
    timestamp: '2026-10-01 10:14',
  },
  {
    id: 'log-002',
    action: 'تحديث صلاحيات مشرف',
    actor: 'م. عبد الرحمن السبيعي',
    actorEmail: 'admin@snns.pro',
    targetType: 'supervisor',
    targetId: 'sup-2',
    details: 'منح سارة المنصور صلاحية اعتماد قائمة الانتظار وإدارة التطبيقات.',
    timestamp: '2026-10-02 11:30',
  },
  {
    id: 'log-003',
    action: 'نشر تطبيق',
    actor: 'سارة المنصور',
    actorEmail: 'sarah.almansoor@snns.pro',
    targetType: 'site_app',
    targetId: 'app-qayd-pos',
    details: 'نشر تطبيق QAYD POS للكاشير والفوترة في الواجهة الرئيسية للمنظومة.',
    timestamp: '2026-10-04 15:45',
  },
];

// Helper to validate safe URLs
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Authentication & Permission Verification Helper
function resolveAdminUser(req: express.Request): SupervisorAccount | null {
  const emailHeader = (req.headers['x-admin-email'] || req.headers['x-user-email'] || req.query.userEmail) as string;
  const adminCode = (req.headers['x-admin-passcode'] || req.query.adminCode) as string;

  // Verify by admin passcode if provided
  if (adminCode && ['snns2026', 'admin365', '1234', 'admin'].includes(adminCode.trim().toLowerCase())) {
    // Return super_admin account
    return supervisorsDB[0];
  }

  if (emailHeader) {
    const found = supervisorsDB.find(
      (s) => s.email.toLowerCase() === emailHeader.trim().toLowerCase() && s.status === 'active'
    );
    if (found) return found;
  }

  return null;
}

// Middleware: Require specific permission on server-side
function requirePermission(permissionKey: keyof SupervisorPermissions) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = resolveAdminUser(req);
    if (!user) {
      return res.status(403).json({
        error: 'رفض الوصول: يتطلب هذا الإجراء صلاحيات إدارية معتمدة من الخادم.',
        code: 'FORBIDDEN',
        requiredPermission: permissionKey,
        isVerifiedAdmin: false,
      });
    }

    if (user.role === 'super_admin' || user.permissions[permissionKey]) {
      (req as any).supervisor = user;
      return next();
    }

    return res.status(403).json({
      error: `رفض الوصول: حسابك (${user.name}) لا يملك صلاحية [${permissionKey}] المطلوبة.`,
      code: 'PERMISSION_DENIED',
      requiredPermission: permissionKey,
      isVerifiedAdmin: true,
      currentPermissions: user.permissions,
    });
  };
}

// ADMIN & GOVERNANCE REST API ENDPOINTS

// 1. Verify Current User's Admin Status from Server
app.get('/api/admin/verify', (req, res) => {
  const user = resolveAdminUser(req);
  if (!user) {
    return res.json({
      isAuthenticated: false,
      isVerifiedAdmin: false,
      supervisor: null,
      permissions: {
        canManageApps: false,
        canManageGovDirectory: false,
        canReviewQueue: false,
        canManageSupervisors: false,
        canCustomizeAppearance: false,
      },
    });
  }

  return res.json({
    isAuthenticated: true,
    isVerifiedAdmin: true,
    supervisor: user,
    permissions: user.permissions,
  });
});

// 2. Supervisor Login Verification
app.post('/api/admin/login', (req, res) => {
  const { email, passcode } = req.body;
  if (!passcode && !email) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد أو رمز التحقق الإداري' });
  }

  const validCodes = ['snns2026', 'admin365', '1234', 'admin'];
  if (passcode && validCodes.includes(passcode.trim().toLowerCase())) {
    // If specific email provided, match supervisor or fallback to super_admin
    const matched = email ? supervisorsDB.find((s) => s.email.toLowerCase() === email.trim().toLowerCase()) : null;
    const supervisor = matched || supervisorsDB[0];

    // Log the successful login
    auditLogsDB.unshift({
      id: `log-${Date.now()}`,
      action: 'تسجيل دخول إداري',
      actor: supervisor.name,
      actorEmail: supervisor.email,
      targetType: 'auth',
      targetId: supervisor.id,
      details: 'تم التحقق من الصلاحيات الإدارية بنجاح على الخادم.',
      timestamp: new Date().toLocaleString('ar-SA'),
    });

    return res.json({
      success: true,
      isVerifiedAdmin: true,
      supervisor,
      permissions: supervisor.permissions,
    });
  }

  if (email) {
    const supervisor = supervisorsDB.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
    if (supervisor && supervisor.status === 'active') {
      return res.json({
        success: true,
        isVerifiedAdmin: true,
        supervisor,
        permissions: supervisor.permissions,
      });
    }
  }

  return res.status(401).json({
    error: 'رمز التحقق الإداري غير صحيح أو الحساب لا يملك صلاحية إدارة.',
    code: 'INVALID_CREDENTIALS',
  });
});

// 3. Government Entities Directory (Public Read for portal, Verified Admin for management)
app.get('/api/admin/gov-directory', (_req, res) => {
  return res.json({ entities: govDirectoryDB });
});

// 4. Upsert Government Entity (Requires canManageGovDirectory)
app.post('/api/admin/gov-directory/upsert', requirePermission('canManageGovDirectory'), (req, res) => {
  const supervisor = (req as any).supervisor as SupervisorAccount;
  const { id, code, nameAr, nameEn, officialUrl, category, descriptionAr, descriptionEn, servicesList } = req.body;

  if (!code || !nameAr || !officialUrl) {
    return res.status(400).json({ error: 'الرمز الفريد والاسم باللغة العربية والرابط الرسمي حقول إلزامية' });
  }

  if (!isSafeUrl(officialUrl)) {
    return res.status(400).json({ error: 'الرابط الرسمي غير آمن. يجب أن يبدأ بـ https://' });
  }

  const existingIdx = govDirectoryDB.findIndex((g) => g.id === id || g.code.toUpperCase() === code.trim().toUpperCase());
  const now = new Date().toISOString().split('T')[0];

  const entityData: GovEntity = {
    id: id || `gov-${Date.now()}`,
    code: code.trim().toUpperCase(),
    nameAr: nameAr.trim(),
    nameEn: nameEn?.trim() || nameAr.trim(),
    officialUrl: officialUrl.trim(),
    category: category || 'finance_tax',
    categoryAr: category === 'finance_tax' ? 'المالية والضرائب' : 'خدمات حكومية',
    categoryEn: 'Government Services',
    approvalStatus: 'approved',
    descriptionAr: descriptionAr || '',
    descriptionEn: descriptionEn || '',
    servicesList: Array.isArray(servicesList) ? servicesList : [],
    verifiedBadge: true,
    lastAuditBy: supervisor.name,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    govDirectoryDB[existingIdx] = entityData;
    auditLogsDB.unshift({
      id: `log-${Date.now()}`,
      action: 'تعديل جهة حكومية',
      actor: supervisor.name,
      actorEmail: supervisor.email,
      targetType: 'gov_entity',
      targetId: entityData.id,
      details: `تم تعديل بيانات الجهة [${entityData.nameAr}] (${entityData.code}) وتوثيق الرابط: ${entityData.officialUrl}`,
      timestamp: new Date().toLocaleString('ar-SA'),
    });
  } else {
    govDirectoryDB.push(entityData);
    auditLogsDB.unshift({
      id: `log-${Date.now()}`,
      action: 'إضافة جهة حكومية جديدة',
      actor: supervisor.name,
      actorEmail: supervisor.email,
      targetType: 'gov_entity',
      targetId: entityData.id,
      details: `تمت إضافة جهة حكومية جديدة [${entityData.nameAr}] بالرمز الفريد (${entityData.code}).`,
      timestamp: new Date().toLocaleString('ar-SA'),
    });
  }

  return res.json({ success: true, entity: entityData, entities: govDirectoryDB });
});

// 5. Update Government Entity Approval Status
app.post('/api/admin/gov-directory/status', requirePermission('canManageGovDirectory'), (req, res) => {
  const supervisor = (req as any).supervisor as SupervisorAccount;
  const { id, status } = req.body;

  const target = govDirectoryDB.find((g) => g.id === id);
  if (!target) return res.status(404).json({ error: 'الجهة غير موجودة' });

  target.approvalStatus = status;
  target.lastAuditBy = supervisor.name;
  target.updatedAt = new Date().toISOString().split('T')[0];

  auditLogsDB.unshift({
    id: `log-${Date.now()}`,
    action: 'تغيير حالة اعتماد جهة حكومية',
    actor: supervisor.name,
    actorEmail: supervisor.email,
    targetType: 'gov_entity',
    targetId: id,
    details: `تم تغيير حالة الاعتماد للجهة [${target.nameAr}] إلى (${status}).`,
    timestamp: new Date().toLocaleString('ar-SA'),
  });

  return res.json({ success: true, entity: target, entities: govDirectoryDB });
});

// 6. Apps & Sites Management (Requires canManageApps)
app.get('/api/admin/apps', (_req, res) => {
  return res.json({ apps: managedAppsDB });
});

app.post('/api/admin/apps/upsert', requirePermission('canManageApps'), (req, res) => {
  const supervisor = (req as any).supervisor as SupervisorAccount;
  const { id, labelAr, labelEn, appTargetId, isExternal, externalUrl, category, badge, icon, status } = req.body;

  if (!labelAr && !labelEn) {
    return res.status(400).json({ error: 'اسم التطبيق بالعربية أو الإنجليزية مطلوب' });
  }

  if (isExternal && externalUrl) {
    if (!isSafeUrl(externalUrl)) {
      return res.status(400).json({ error: 'الرابط الخارجي غير آمن. يجب أن يبدأ بـ https:// أو http://' });
    }
  }

  const existingIdx = managedAppsDB.findIndex((a) => a.id === id);
  const now = new Date().toISOString().split('T')[0];

  const appData: ManagedApp = {
    id: id || `app-${Date.now()}`,
    labelAr: labelAr || labelEn,
    labelEn: labelEn || labelAr,
    appTargetId: appTargetId || 'custom-link',
    isExternal: Boolean(isExternal),
    externalUrl: externalUrl || undefined,
    category: category || 'تطبيقات عامة',
    badge: badge || undefined,
    icon: icon || 'grid',
    status: status || 'published',
    submittedBy: supervisor.name,
    approvedBy: supervisor.name,
    order: existingIdx >= 0 ? managedAppsDB[existingIdx].order : managedAppsDB.length,
    createdAt: existingIdx >= 0 ? managedAppsDB[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    managedAppsDB[existingIdx] = appData;
    auditLogsDB.unshift({
      id: `log-${Date.now()}`,
      action: 'تعديل تطبيق/موقع',
      actor: supervisor.name,
      actorEmail: supervisor.email,
      targetType: 'site_app',
      targetId: appData.id,
      details: `تم تعديل بيانات التطبيق [${appData.labelAr}] والحالة: ${appData.status}`,
      timestamp: new Date().toLocaleString('ar-SA'),
    });
  } else {
    managedAppsDB.push(appData);
    auditLogsDB.unshift({
      id: `log-${Date.now()}`,
      action: 'إضافة تطبيق/موقع جديد',
      actor: supervisor.name,
      actorEmail: supervisor.email,
      targetType: 'site_app',
      targetId: appData.id,
      details: `تمت إضافة تطبيق جديد [${appData.labelAr}] ونشره في المنظومة.`,
      timestamp: new Date().toLocaleString('ar-SA'),
    });
  }

  return res.json({ success: true, app: appData, apps: managedAppsDB });
});

app.post('/api/admin/apps/status', requirePermission('canManageApps'), (req, res) => {
  const supervisor = (req as any).supervisor as SupervisorAccount;
  const { id, status } = req.body;

  const target = managedAppsDB.find((a) => a.id === id);
  if (!target) return res.status(404).json({ error: 'التطبيق غير موجود' });

  const prev = target.status;
  target.status = status;
  target.updatedAt = new Date().toISOString().split('T')[0];

  auditLogsDB.unshift({
    id: `log-${Date.now()}`,
    action: `تغيير حالة التطبيق (${status})`,
    actor: supervisor.name,
    actorEmail: supervisor.email,
    targetType: 'site_app',
    targetId: id,
    details: `تم تغيير حالة التطبيق [${target.labelAr}] من (${prev}) إلى (${status}).`,
    timestamp: new Date().toLocaleString('ar-SA'),
  });

  return res.json({ success: true, app: target, apps: managedAppsDB });
});

// 7. Review Queue & Audit Log (Requires canReviewQueue)
app.get('/api/admin/review-queue', requirePermission('canReviewQueue'), (_req, res) => {
  return res.json({ queue: reviewQueueDB, auditLogs: auditLogsDB });
});

app.post('/api/admin/review-queue/resolve', requirePermission('canReviewQueue'), (req, res) => {
  const supervisor = (req as any).supervisor as SupervisorAccount;
  const { id, status, reviewNotes } = req.body;

  const item = reviewQueueDB.find((q) => q.id === id);
  if (!item) return res.status(404).json({ error: 'عنصر قائمة الانتظار غير موجود' });

  item.status = status;
  item.reviewedBy = supervisor.name;
  item.reviewNotes = reviewNotes || (status === 'approved' ? 'تم الاعتماد والنشر' : 'مرفوض لعدم مطابقة المعايير');

  // If approved and entity is gov entity, approve it
  if (status === 'approved' && item.entityType === 'gov_entity') {
    const gov = govDirectoryDB.find((g) => g.id === item.entityId);
    if (gov) {
      gov.approvalStatus = 'approved';
      gov.lastAuditBy = supervisor.name;
      gov.verifiedBadge = true;
    }
  }

  auditLogsDB.unshift({
    id: `log-${Date.now()}`,
    action: status === 'approved' ? 'اعتماد ونشر عنصر من قائمة الانتظار' : 'رفض عنصر في قائمة الانتظار',
    actor: supervisor.name,
    actorEmail: supervisor.email,
    targetType: item.entityType,
    targetId: item.entityId,
    details: `قرار الاعتماد: [${status}] على [${item.title}]. الملاحظة: ${item.reviewNotes}`,
    timestamp: new Date().toLocaleString('ar-SA'),
  });

  return res.json({ success: true, item, queue: reviewQueueDB, auditLogs: auditLogsDB });
});

app.get('/api/admin/audit-logs', (_req, res) => {
  return res.json({ logs: auditLogsDB });
});

// 8. Supervisors & Granular RBAC (Requires canManageSupervisors)
app.get('/api/admin/supervisors', requirePermission('canManageSupervisors'), (_req, res) => {
  return res.json({ supervisors: supervisorsDB });
});

app.post('/api/admin/supervisors/update-permissions', requirePermission('canManageSupervisors'), (req, res) => {
  const caller = (req as any).supervisor as SupervisorAccount;
  const { supervisorId, permissions, status } = req.body;

  const target = supervisorsDB.find((s) => s.id === supervisorId);
  if (!target) return res.status(404).json({ error: 'المشرف غير موجود' });

  // Update permissions granularly
  if (permissions) {
    target.permissions = {
      ...target.permissions,
      ...permissions,
    };
  }
  if (status) {
    target.status = status;
  }

  auditLogsDB.unshift({
    id: `log-${Date.now()}`,
    action: 'تعديل صلاحيات مشرف',
    actor: caller.name,
    actorEmail: caller.email,
    targetType: 'supervisor',
    targetId: target.id,
    details: `تم تحديث صلاحيات المشرف [${target.name}] بواسطة [${caller.name}].`,
    timestamp: new Date().toLocaleString('ar-SA'),
  });

  return res.json({ success: true, supervisor: target, supervisors: supervisorsDB });
});

app.post('/api/admin/supervisors/add', requirePermission('canManageSupervisors'), (req, res) => {
  const caller = (req as any).supervisor as SupervisorAccount;
  const { name, email, roleAr, departmentAr, permissions } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'الاسم والبريد الإلكتروني حقول إلزامية' });
  }

  const newSupervisor: SupervisorAccount = {
    id: `sup-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'supervisor',
    roleAr: roleAr || 'مشرف معتمد',
    departmentAr: departmentAr || 'إدارة المنظومة',
    status: 'active',
    permissions: {
      canManageApps: Boolean(permissions?.canManageApps),
      canManageGovDirectory: Boolean(permissions?.canManageGovDirectory),
      canReviewQueue: Boolean(permissions?.canReviewQueue),
      canManageSupervisors: false, // Only super admin can manage supervisors
      canCustomizeAppearance: Boolean(permissions?.canCustomizeAppearance),
    },
    lastLogin: 'لم يدخل بعد',
    createdAt: new Date().toISOString().split('T')[0],
    avatarInitials: name.trim().slice(0, 2).toUpperCase(),
  };

  supervisorsDB.push(newSupervisor);

  auditLogsDB.unshift({
    id: `log-${Date.now()}`,
    action: 'إضافة مشرف جديد',
    actor: caller.name,
    actorEmail: caller.email,
    targetType: 'supervisor',
    targetId: newSupervisor.id,
    details: `تمت إضافة مشرف جديد [${newSupervisor.name}] (${newSupervisor.email}) ومنحه الصلاحيات المحددة.`,
    timestamp: new Date().toLocaleString('ar-SA'),
  });

  return res.json({ success: true, supervisor: newSupervisor, supervisors: supervisorsDB });
});
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { prompt, context, appType } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (ai) {
      const systemInstruction = `You are SNNS Copilot, the enterprise-grade AI assistant integrated into the SNNS 365 Cloud Productivity Suite (an equivalent to Microsoft 365 Copilot).
The suite includes: SNNS Word, SNNS Excel, SNNS PowerPoint, SNNS Outlook, SNNS Teams, SNNS OneDrive, SNNS To Do, SNNS OneNote, SNNS Designer, SNNS Clipchamp, SNNS Calendar, SNNS Forms, SNNS Skype, and SNNS Family Safety.
Respond concisely, clearly, and formatted with clean Markdown. Provide rich, actionable content (drafts, formulas, slide bullet points, email templates, task breakdowns).
Respond in the language the user contacted you in (Arabic or English).
Current application: ${appType || 'SNNS 365 Suite'}
Context provided: ${context || 'None'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      return res.json({ text: response.text });
    } else {
      const fallbackText = generateSmartFallback(prompt, appType);
      return res.json({ text: fallbackText });
    }
  } catch (error: any) {
    console.error('Copilot API error:', error);
    // Return smart fallback rather than breaking client experience
    const fallbackText = generateSmartFallback(req.body?.prompt || '', req.body?.appType);
    return res.json({ text: fallbackText });
  }
});

// ==========================================
// INTERNAL CORPORATE MAIL API (@snns.pro)
// ==========================================
interface InternalMessage {
  id: string;
  sender: string;
  senderName?: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const internalMessagesDB: InternalMessage[] = [
  {
    id: 'mail-init-1',
    sender: 's.miller@snns.pro',
    senderName: 'Sarah Miller',
    recipient: 'htaf@snns.pro',
    subject: 'Welcome to SNNS 365 Cloud Productivity Workspace!',
    body: 'مرحباً بك في مساحة عمل وتطبيقات SNNS 365 السحابية المتكاملة.\n\nيسعدنا انضمامك إلى منظومتنا، يمكنك مراسلة أي حساب ينتهي بنطاق @snns.pro بشكل فوري ومباشر.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
  },
  {
    id: 'mail-init-2',
    sender: 'security@snns.pro',
    senderName: 'SNNS Security Vault',
    recipient: 'htaf@snns.pro',
    subject: 'تأكيد أمان وتفعيل خادم البريد المعتمد @snns.pro',
    body: 'تم تفعيل خادم البريد الداخلي الآمن (@snns.pro) بنجاح مع تشفير الرسائل ودعم الإرسال والاستقبال الفوري بين جميع أعضاء المؤسسة.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: true,
  },
];

// 1. Send Internal Email
app.post('/api/internal-mail/send', (req, res) => {
  const { sender, senderName, recipient, subject, body } = req.body;

  if (!sender || !recipient || !subject) {
    return res.status(400).json({ error: 'المرسل والمستقبل وعنوان الرسالة حقول أساسية.' });
  }

  const senderEmail = String(sender).trim().toLowerCase();
  const recipientEmail = String(recipient).trim().toLowerCase();

  // Validate internal @snns.pro domain
  if (!recipientEmail.endsWith('@snns.pro') || !senderEmail.endsWith('@snns.pro')) {
    return res.status(400).json({ error: 'البريد الداخلي مخصص فقط لنطاق @snns.pro' });
  }

  const newMessage: InternalMessage = {
    id: `msg-${Date.now()}`,
    sender: senderEmail,
    senderName: senderName || senderEmail.split('@')[0],
    recipient: recipientEmail,
    subject: String(subject).trim(),
    body: String(body || '').trim(),
    timestamp: new Date().toISOString(),
    read: false,
  };

  internalMessagesDB.unshift(newMessage);
  return res.status(201).json({
    success: true,
    message: 'تم إرسال البريد الداخلي بنجاح عبر خادم @snns.pro',
    data: newMessage,
  });
});

// 2. Get Inbox for user
app.get('/api/internal-mail/inbox/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email).trim().toLowerCase();
  const inbox = internalMessagesDB.filter(
    (msg) => msg.recipient.toLowerCase() === email || email === 'admin@snns.pro'
  );
  return res.json(inbox);
});

// 3. Get Sent messages for user
app.get('/api/internal-mail/sent/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email).trim().toLowerCase();
  const sent = internalMessagesDB.filter(
    (msg) => msg.sender.toLowerCase() === email
  );
  return res.json(sent);
});

// 4. Mark message as read
app.patch('/api/internal-mail/read/:id', (req, res) => {
  const { id } = req.params;
  const msg = internalMessagesDB.find((m) => m.id === id);
  if (msg) {
    msg.read = true;
    return res.json({ success: true });
  }
  return res.status(404).json({ error: 'الرسالة غير موجودة' });
});

// 5. Delete internal message
app.delete('/api/internal-mail/:id', (req, res) => {
  const { id } = req.params;
  const index = internalMessagesDB.findIndex((m) => m.id === id);
  if (index !== -1) {
    internalMessagesDB.splice(index, 1);
    return res.json({ success: true });
  }
  return res.status(404).json({ error: 'الرسالة غير موجودة' });
});

// ==========================================
// STS SUPER ADMIN ROUTER & RBAC (/api/sts)
// ==========================================
const stsRouter = express.Router();

// حماية مسار الادمن (Middleware)
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const supervisor = resolveAdminUser(req);
  const user = req.body?.currentUser;

  if (
    supervisor ||
    (user && (user.isAdmin || user.role === 'admin' || user.role === 'owner' || user.email === 'a@snns.pro'))
  ) {
    (req as any).adminUser = supervisor || user;
    return next();
  }
  return res.status(403).json({
    error: 'عذراً، هذا المسار مخصص للمدراء فقط (/sts)',
    code: 'STS_FORBIDDEN',
  });
};

// مسارات الأدمن تحت /api/sts
stsRouter.get('/dashboard', requireAdmin, (_req, res) => {
  res.json({
    message: 'مرحباً بك في لوحة تحكم النظام الفائقة /sts',
    status: 'authorized',
    timestamp: new Date().toISOString(),
    supervisorsCount: supervisorsDB.length,
    appsCount: managedAppsDB.length,
    securityLevel: 'Enterprise Super Admin (STS)',
  });
});

stsRouter.get('/verify', requireAdmin, (req, res) => {
  res.json({
    authorized: true,
    message: 'جلسة المدير معتمدة',
    user: (req as any).adminUser,
  });
});

app.use('/api/sts', stsRouter);

// Vite or Static Serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SNNS 365 Suite server running on http://0.0.0.0:${PORT}`);
});
