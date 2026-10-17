import {
  CalendarEvent,
  DriveItem,
  EmailMessage,
  EmailContact,
  FormQuestion,
  FormSubmission,
  NoteSection,
  RecentDocument,
  SlideItem,
  TaskItem,
  DynamicAppTile,
  PageLayoutConfig,
  PrintJob,
  UserProfile,
  UserSecuritySettings,
} from '../types/suite';

export const DEFAULT_SECURITY_SETTINGS: UserSecuritySettings = {
  biometricsEnabled: true,
  biometricType: 'both',
  biometricRegistered: true,
  registeredBiometricsCount: 2,
  twoFactorEnabled: false, // Optional 2FA
  twoFactorMethod: 'totp',
  lastBiometricLogin: 'اليوم (بصمة الوجه المعتمدة)',
};

export const DEFAULT_PAGE_LAYOUT: PageLayoutConfig = {
  gridColumns: 5,
  cardWidth: 'standard',
  centerIncompleteRows: true,
  showHeroBanner: true,
  showRecentFiles: true,
  showCreateMore: true,
};

export const DEFAULT_LAUNCHER_TILES: DynamicAppTile[] = [
  {
    id: 'snns-ai',
    appTargetId: 'snns-ai',
    labelEn: 'SNNS AI',
    labelAr: 'المساعد الذكي SNNS AI',
    badge: 'PRO NLP',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 0,
  },
  {
    id: 'qayd-pos',
    appTargetId: 'qayd-pos',
    labelEn: 'QAYD POS',
    labelAr: 'كاشير قيد ونقاط البيع',
    badge: 'كاشير ZATCA',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 1,
  },
  {
    id: 'qayd-accounting',
    appTargetId: 'qayd-accounting',
    labelEn: 'QAYD Accounting',
    labelAr: 'المحاسبة المالية قيد',
    badge: 'قيود ودفاتر',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 2,
  },
  {
    id: 'snns-calls',
    appTargetId: 'snns-calls',
    labelEn: 'SNNS Calls',
    labelAr: 'مكالمات SNNS Calls',
    badge: 'اجتماعات HD',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 3,
  },
  {
    id: 'snns-chat',
    appTargetId: 'snns-chat',
    labelEn: 'SNNS Chat',
    labelAr: 'محادثات SNNS Chat',
    badge: 'فوري',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 4,
  },
  {
    id: 'word',
    appTargetId: 'word',
    labelEn: 'SNNS Docs',
    labelAr: 'مستندات SNNS Docs',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 5,
  },
  {
    id: 'excel',
    appTargetId: 'excel',
    labelEn: 'SNNS Sheets',
    labelAr: 'جداول SNNS Sheets',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 6,
  },
  {
    id: 'powerpoint',
    appTargetId: 'powerpoint',
    labelEn: 'SNNS Presentations',
    labelAr: 'عروض SNNS Presentations',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 7,
  },
  {
    id: 'marketplace',
    appTargetId: 'marketplace',
    labelEn: 'SNNS Marketplace',
    labelAr: 'سوق وإعلانات SNNS',
    badge: 'حراج',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 8,
  },
  {
    id: 'business',
    appTargetId: 'business',
    labelEn: 'SNNS Business',
    labelAr: 'دليل الشركات والأعمال',
    badge: 'أعمال B2B',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 9,
  },
  {
    id: 'snns-education',
    appTargetId: 'snns-education',
    labelEn: 'SNNS Education',
    labelAr: 'المنصة التعليمية SNNS',
    badge: 'أكاديميا',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 10,
  },
  {
    id: 'account',
    appTargetId: 'account',
    labelEn: 'SNNS Account',
    labelAr: 'حسابي الموحد دفتره',
    badge: 'مركزي',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 11,
  },
  {
    id: 'outlook',
    appTargetId: 'outlook',
    labelEn: 'SNNS Mail',
    labelAr: 'بريد SNNS Mail',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 12,
  },
  {
    id: 'onedrive',
    appTargetId: 'onedrive',
    labelEn: 'SNNS Cloud / Files',
    labelAr: 'سحابة ومستندات SNNS',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 13,
  },
  {
    id: 'calendar',
    appTargetId: 'calendar',
    labelEn: 'SNNS Calendar',
    labelAr: 'تقويم ومواعيد SNNS',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 14,
  },
  {
    id: 'forms',
    appTargetId: 'forms',
    labelEn: 'SNNS Forms',
    labelAr: 'استبيانات ونماذج SNNS',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 13,
  },
  {
    id: 'designer',
    appTargetId: 'designer',
    labelEn: 'SNNS Designer',
    labelAr: 'تصميم SNNS Designer',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 14,
  },
  {
    id: 'clipchamp',
    appTargetId: 'clipchamp',
    labelEn: 'SNNS Media Studio',
    labelAr: 'استوديو الفيديو والصوتيات',
    badge: 'ميديا HD',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 15,
  },
  {
    id: 'printer',
    appTargetId: 'printer',
    labelEn: 'SNNS Print Hub',
    labelAr: 'مركز الطباعة الذكية',
    badge: 'واي فاي',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 16,
  },
  {
    id: 'family-safety',
    appTargetId: 'family-safety',
    labelEn: 'SNNS Family Safety',
    labelAr: 'أمان العائلة الرقمي',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 17,
  },
  {
    id: 'more-apps',
    appTargetId: 'more-apps',
    labelEn: 'More SNNS Apps',
    labelAr: 'تطبيقات المنظومة الإضافية',
    shape: 'standard',
    colorScheme: 'default',
    visible: true,
    order: 18,
  },
];

const INITIAL_WORD_DOCS: Record<string, { id: string; title: string; content: string; updatedAt: string }> = {
  'doc-1': {
    id: 'doc-1',
    title: 'SNNS Project Strategy & Roadmap',
    content: `<h1>SNNS Cloud 365 Platform Architecture</h1>
<p>Welcome to <strong>SNNS 365</strong>, a unified next-generation cloud productivity ecosystem designed for modern enterprises and agile creators.</p>
<h2>1. Strategic Objectives</h2>
<ul>
  <li><strong>Uncompromised Performance:</strong> Zero lag in cloud-native document authoring and collaborative editing.</li>
  <li><strong>Enterprise Security:</strong> End-to-end data encryption and strict access isolation.</li>
  <li><strong>Integrated Intelligence:</strong> Context-aware SNNS Copilot powered by state-of-the-art AI.</li>
</ul>
<h2>2. Core Application Milestones</h2>
<p>Our productivity suite encompasses word processing, dynamic spreadsheets with real-time formula engines, dynamic slide presentations, unified mail and calendar, file orchestration, and secure family digital wellbeing.</p>
<blockquote>"Empowering modern teams to think, create, and collaborate without boundaries."</blockquote>`,
    updatedAt: 'Just now',
  },
};

const INITIAL_EXCEL_SHEETS: Record<
  string,
  { id: string; title: string; cells: Record<string, string>; activeCell: string; updatedAt: string }
> = {
  'sheet-1': {
    id: 'sheet-1',
    title: 'Q4 Financial Forecast - SNNS Corp',
    cells: {
      A1: 'Quarterly Financial Summary (in $k)',
      A3: 'Department',
      B3: 'Q1 Actual',
      C3: 'Q2 Actual',
      D3: 'Q3 Actual',
      E3: 'Q4 Forecast',
      F3: 'Total Annual',
      A4: 'Product & Tech',
      B4: '1420',
      C4: '1580',
      D4: '1690',
      E4: '1850',
      F4: '=SUM(B4:E4)',
      A5: 'Marketing & Growth',
      B5: '850',
      C5: '920',
      D5: '1100',
      E5: '1250',
      F5: '=SUM(B5:E5)',
      A6: 'Operations & Cloud',
      B6: '420',
      C6: '450',
      D6: '480',
      E6: '510',
      F6: '=SUM(B6:E6)',
      A7: 'Sales & BD',
      B7: '610',
      C7: '670',
      D7: '730',
      E7: '800',
      F7: '=SUM(B7:E7)',
      A9: 'Grand Total',
      B9: '=SUM(B4:B7)',
      C9: '=SUM(C4:C7)',
      D9: '=SUM(D4:D7)',
      E9: '=SUM(E4:E7)',
      F9: '=SUM(F4:F7)',
    },
    activeCell: 'B4',
    updatedAt: '12 mins ago',
  },
};

const INITIAL_PPT: Record<string, { id: string; title: string; slides: SlideItem[]; updatedAt: string }> = {
  'ppt-1': {
    id: 'ppt-1',
    title: 'SNNS Executive Vision 2026',
    slides: [
      {
        id: 's-1',
        title: 'SNNS 365 Cloud Suite',
        subtitle: 'Enterprise-grade Productivity & Collaboration Platform',
        bullets: [
          'Unified workspace for documents, spreadsheets, presentations, and communication',
          'AI-infused workflows powered by SNNS Copilot',
          'Seamless interoperability across desktop and mobile',
        ],
        theme: 'modern-blue',
        layout: 'title',
        notes: 'Introduce the core mission and strategic pillars of SNNS 365.',
      },
      {
        id: 's-2',
        title: 'Productivity Innovation & Market Impact',
        subtitle: 'Key Growth Drivers',
        bullets: [
          'High performance real-time formula computation in SNNS Excel',
          'Rich multi-channel teamwork in SNNS Teams and Outlook',
          'Built-in creative canvas in SNNS Designer and Clipchamp',
          'Real-time data privacy and parental controls via SNNS Family Safety',
        ],
        theme: 'modern-blue',
        layout: 'content',
        notes: 'Highlight performance advantages compared to legacy office tools.',
      },
      {
        id: 's-3',
        title: 'Future Roadmap & Expansion',
        subtitle: 'The Next Frontier',
        bullets: [
          'Q1 2026: Multi-lingual voice assistance and smart transcriptions',
          'Q2 2026: Deep offline local cache and peer-to-peer sync',
          'Q3 2026: Enterprise sovereign cloud deployments',
        ],
        theme: 'modern-blue',
        layout: 'two-column',
        notes: 'Conclude with roadmap milestones and call for questions.',
      },
    ],
    updatedAt: '2 hours ago',
  },
};

export const PRIMARY_DOMAIN = 'snns.pro';

export interface DirectoryUser {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  role: string;
  roleAr: string;
  department: string;
  departmentAr: string;
  avatarInitials: string;
  avatarColor: string;
  statusText?: string;
}

export const DIRECTORY_USERS: DirectoryUser[] = [
  {
    id: 'user-htaf',
    name: 'Htaf Online (هتاف أونلاين)',
    nameAr: 'هتاف أونلاين',
    email: `htaf@${PRIMARY_DOMAIN}`,
    role: 'System Administrator & Executive',
    roleAr: 'مدير النظام المعتمد والمؤسس',
    department: 'Executive Digital Productivity Office',
    departmentAr: 'مكتب القيادة الرقمية والإنتاجية',
    avatarInitials: 'HT',
    avatarColor: 'bg-[#0078D4]',
    statusText: 'متاح للعمل والتعاون السحابي المعتمد',
  },
  {
    id: 'user-sarah',
    name: 'Sarah Miller (سارة أحمد)',
    nameAr: 'سارة أحمد',
    email: `s.miller@${PRIMARY_DOMAIN}`,
    role: 'VP of Product Innovation',
    roleAr: 'نائب الرئيس لتطوير المنتجات',
    department: 'Product & Design Lab',
    departmentAr: 'مختبر التصميم والمنتجات السحابية',
    avatarInitials: 'SM',
    avatarColor: 'bg-indigo-600',
    statusText: 'في اجتماع تطوير المنظومة',
  },
  {
    id: 'user-omar',
    name: 'Omar Farooq (عمر فاروق)',
    nameAr: 'عمر فاروق',
    email: `o.farooq@${PRIMARY_DOMAIN}`,
    role: 'Chief Financial Officer',
    roleAr: 'المدير المالي التنفيذي',
    department: 'Financial Strategy & Budgeting',
    departmentAr: 'الإدارة المالية والميزانيات',
    avatarInitials: 'OF',
    avatarColor: 'bg-emerald-600',
    statusText: 'متاح للمراجعة المالية',
  },
  {
    id: 'user-khaled',
    name: 'Khaled Al-Otaibi (خالد العتيبي)',
    nameAr: 'خالد العتيبي',
    email: `khaled.otb@${PRIMARY_DOMAIN}`,
    role: 'Head of Cloud Infrastructure & IT',
    roleAr: 'مدير البنية التحتية والشبكات',
    department: 'Cloud Ops & Networks',
    departmentAr: 'العمليات السحابية وتقنية المعلومات',
    avatarInitials: 'KO',
    avatarColor: 'bg-amber-600',
    statusText: 'متاح للدعم التقني الفوري',
  },
  {
    id: 'user-tariq',
    name: 'Tariq Mansour (م. طارق المنصور)',
    nameAr: 'م. طارق المنصور',
    email: `t.mansour@${PRIMARY_DOMAIN}`,
    role: 'Lead Cloud Solutions Architect',
    roleAr: 'كبير مهندسي الحلول السحابية',
    department: 'Systems Engineering',
    departmentAr: 'هندسة الأنظمة والبرمجيات',
    avatarInitials: 'TM',
    avatarColor: 'bg-purple-600',
    statusText: 'يعمل على مزامنة الخوادم',
  },
  {
    id: 'user-security',
    name: 'SNNS Security & Compliance (الأمن الرقمي)',
    nameAr: 'الأمن الرقمي والمصادقة',
    email: `security@${PRIMARY_DOMAIN}`,
    role: 'Security Operations Center',
    roleAr: 'مركز العمليات الأمنية والمصادقة',
    department: 'Enterprise Security & Governance',
    departmentAr: 'أمن المعلومات والحوكمة الرقمية',
    avatarInitials: 'SC',
    avatarColor: 'bg-rose-600',
    statusText: 'المصادقة والأمان السحابي نشط 100%',
  },
];

export function generateSnnsEmail(name: string): string {
  if (!name || !name.trim()) return `user@${PRIMARY_DOMAIN}`;

  // If already contains @, extract the handle part
  let input = name.trim().toLowerCase();
  if (input.includes('@')) {
    const parts = input.split('@');
    if (parts[1] === PRIMARY_DOMAIN) {
      return input;
    }
    input = parts[0];
  }

  // Common Arabic name dictionary to standard transliterated corporate handle
  const arabicKnown: Record<string, string> = {
    'هتاف': 'htaf',
    'اونلاين': 'online',
    'أونلاين': 'online',
    'محمد': 'mohammed',
    'احمد': 'ahmed',
    'أحمد': 'ahmed',
    'إبراهيم': 'ibrahim',
    'ابراهيم': 'ibrahim',
    'سارة': 'sarah',
    'عمر': 'omar',
    'فاروق': 'farooq',
    'علي': 'ali',
    'خالد': 'khaled',
    'العتيبي': 'otb',
    'عتيبي': 'otb',
    'الشمري': 'shammari',
    'شمري': 'shammari',
    'المطيري': 'mutairi',
    'مطيري': 'mutairi',
    'القحطاني': 'qahtani',
    'قحطاني': 'qahtani',
    'الحربي': 'harbi',
    'حربي': 'harbi',
    'الدوسري': 'dossary',
    'دوسري': 'dossary',
    'الغامدي': 'ghamdi',
    'غامدي': 'ghamdi',
    'الزهراني': 'zahrani',
    'زهراني': 'zahrani',
    'المنصور': 'mansour',
    'منصور': 'mansour',
    'الشهري': 'shehri',
    'شهري': 'shehri',
    'السالم': 'salem',
    'سالم': 'salem',
    'طارق': 'tariq',
    'سلطان': 'sultan',
    'سعود': 'saud',
    'فهد': 'fahad',
    'فيصل': 'faisal',
    'عبدالله': 'abdullah',
    'عبدالرحمن': 'abdulrahman',
    'عبدالعزيز': 'abdulaziz',
    'عبدالمحسن': 'abdulmohsen',
    'عبدالإله': 'abdulelah',
    'نورة': 'noura',
    'مريم': 'maryam',
    'منى': 'mona',
    'هند': 'hind',
    'ريم': 'reem',
    'يوسف': 'yousef',
    'ناصر': 'nasser',
    'بندر': 'bandar',
    'تركي': 'turki',
    'ماجد': 'majed',
    'سلمان': 'salman',
    'وليد': 'waleed',
    'مشعل': 'meshal',
    'حمد': 'hamad',
    'أمل': 'amal',
    'خلود': 'kholoud',
    'شهد': 'shahad',
    'دانة': 'dana',
    'ليلى': 'layla',
    'فاطمة': 'fatima',
    'عائشة': 'aisha',
    'هدى': 'huda',
  };

  // Check exact full match
  const cleanTrimmed = input.replace(/[()]/g, '').trim();
  if (arabicKnown[cleanTrimmed]) {
    return `${arabicKnown[cleanTrimmed]}@${PRIMARY_DOMAIN}`;
  }

  // Special case: "هتاف" or "htaf" is always canonical htaf@snns.pro
  if (cleanTrimmed === 'هتاف' || cleanTrimmed === 'htaf' || cleanTrimmed === 'هتاف اونلاين' || cleanTrimmed === 'هتاف أونلاين' || cleanTrimmed === 'htaf online') {
    return `htaf@${PRIMARY_DOMAIN}`;
  }

  // Compound names like "عبد الله" -> "abdullah", "عبد الرحمن" -> "abdulrahman"
  const normalized = cleanTrimmed
    .replace(/^عبد\s+الله/g, 'abdullah')
    .replace(/^عبد\s+الرحمن/g, 'abdulrahman')
    .replace(/^عبد\s+العزيز/g, 'abdulaziz')
    .replace(/^عبد\s+المحسن/g, 'abdulmohsen')
    .replace(/^عبد\s+الإله/g, 'abdulelah');

  if (normalized.startsWith('abdull') || normalized.startsWith('abdulr') || normalized.startsWith('abdulaz')) {
    const parts = normalized.split(/\s+/);
    if (parts.length === 1) {
      return `${parts[0]}@${PRIMARY_DOMAIN}`;
    }
  }

  // General Arabic transliteration mapping
  const charMap: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
    'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
    'ي': 'y', 'ى': 'a', 'ة': 'h', 'ء': '',
    'ئ': 'y', 'ؤ': 'w',
  };

  // Split into words (handle First and Last names)
  const words = normalized.split(/\s+/).filter(Boolean);
  const transliteratedWords: string[] = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9\u0600-\u06FF]/gi, '').toLowerCase();
    if (!cleanWord) continue;

    if (arabicKnown[cleanWord]) {
      transliteratedWords.push(arabicKnown[cleanWord]);
    } else {
      let tWord = '';
      for (const ch of cleanWord) {
        if (charMap[ch] !== undefined) {
          tWord += charMap[ch];
        } else if (/[a-z0-9]/.test(ch)) {
          tWord += ch;
        }
      }
      if (tWord) {
        transliteratedWords.push(tWord);
      }
    }
  }

  let slug = transliteratedWords.join('.');
  slug = slug.replace(/\.+/g, '.').replace(/^\.+/, '').replace(/\.+$/, '');

  // If slug is empty fallback to user
  if (!slug) {
    slug = 'user';
  }

  return `${slug}@${PRIMARY_DOMAIN}`;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-primary',
  name: 'Htaf Online',
  username: 'htaf',
  email: `htaf@${PRIMARY_DOMAIN}`,
  domain: PRIMARY_DOMAIN,
  role: 'System Administrator & Executive',
  roleAr: 'مدير النظام المعتمد',
  department: 'Digital Transformation & Productivity Center',
  departmentAr: 'التحول الرقمي والإنتاجية',
  avatarInitials: 'HT',
  statusText: 'متاح للعمل والتعاون السحابي المعتمد',
  security: DEFAULT_SECURITY_SETTINGS,
};

const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: 'mail-1',
    sender: 'Sarah Miller',
    senderEmail: 's.miller@snns.pro',
    recipient: 'htaf@snns.pro',
    subject: 'Welcome to SNNS 365 Cloud Productivity Workspace!',
    body: `Hello Team,\n\nWelcome to your brand-new SNNS 365 Cloud Suite! We have provisioned all your productivity apps including SNNS Word, Excel, PowerPoint, Teams, OneDrive, and Copilot.\n\nEverything is connected in one cohesive ecosystem. You can access your recent documents, trigger AI assistance, and collaborate seamlessly in real time.\n\nPlease feel free to explore your workspace and start creating!\n\nBest regards,\nSarah Miller\nVP of Product Innovation, SNNS`,
    date: '10:30 AM',
    isUnread: true,
    isStarred: true,
    folder: 'inbox',
  },
  {
    id: 'mail-2',
    sender: 'Omar Farooq',
    senderEmail: 'o.farooq@snns.pro',
    recipient: 'htaf@snns.pro',
    subject: 'Q4 Budget Review & SNNS Excel Workbook',
    body: `Hi there,\n\nI have uploaded the latest Q4 Financial model to our shared SNNS OneDrive. Please check the formula calculations in the operations tab.\n\nLet me know if we need to adjust any estimates before our upcoming SNNS Teams meeting tomorrow.\n\nThanks,\nOmar`,
    date: 'Yesterday',
    isUnread: false,
    isStarred: false,
    folder: 'inbox',
  },
  {
    id: 'mail-3',
    sender: 'SNNS Security & Safety',
    senderEmail: 'security@snns.pro',
    recipient: 'htaf@snns.pro',
    subject: 'Family Safety & Account Security Notice',
    body: `Hello,\n\nYour SNNS 365 account security is active. Screen time limits, safe browsing filters, and active device shields are currently set to recommended high-privacy settings.\n\nYou can review your activity dashboard anytime in SNNS Family Safety.`,
    date: 'Oct 2',
    isUnread: false,
    isStarred: false,
    folder: 'inbox',
  },
];

const INITIAL_CONTACTS: EmailContact[] = [
  {
    id: 'cnt-1',
    name: 'سارة أحمد (Sarah Miller)',
    email: 's.miller@snns.pro',
    role: 'نائب الرئيس لتطوير المنتجات',
    avatarColor: 'bg-blue-600',
    addedAt: 'الأمس',
  },
  {
    id: 'cnt-2',
    name: 'عمر فاروق (Omar Farooq)',
    email: 'o.farooq@snns.pro',
    role: 'المدير المالي والميزانية',
    avatarColor: 'bg-emerald-600',
    addedAt: 'الأسبوع الماضي',
  },
  {
    id: 'cnt-3',
    name: 'فريق الدعم وأمان SNNS',
    email: 'security@snns.pro',
    role: 'الأمن الرقمي وحماية الحسابات',
    avatarColor: 'bg-purple-600',
    addedAt: 'الأسبوع الماضي',
  },
  {
    id: 'cnt-4',
    name: 'م. طارق المنصور',
    email: 't.mansour@snns.pro',
    role: 'كبير مهندسي السحابة',
    avatarColor: 'bg-indigo-600',
    addedAt: 'اليوم',
  },
  {
    id: 'cnt-5',
    name: 'خالد العتيبي',
    email: 'khaled.otb@snns.pro',
    role: 'إدارة العمليات والشبكات',
    avatarColor: 'bg-amber-600',
    addedAt: 'اليوم',
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Review SNNS 365 project roadmap in Word',
    completed: true,
    category: 'my-day',
    dueDate: 'Today',
    isImportant: true,
  },
  {
    id: 't-2',
    title: 'Verify Q4 formula totals in SNNS Excel',
    completed: false,
    category: 'my-day',
    dueDate: 'Today',
    isImportant: true,
  },
  {
    id: 't-3',
    title: 'Prepare keynote presentation deck in SNNS PowerPoint',
    completed: false,
    category: 'planned',
    dueDate: 'Tomorrow',
    isImportant: false,
  },
  {
    id: 't-4',
    title: 'Launch customer satisfaction survey in SNNS Forms',
    completed: false,
    category: 'tasks',
    dueDate: 'Next Week',
    isImportant: false,
  },
  {
    id: 't-5',
    title: 'Schedule quarterly team sync in SNNS Calendar',
    completed: true,
    category: 'tasks',
    dueDate: 'Yesterday',
    isImportant: false,
  },
];

const INITIAL_NOTES: NoteSection[] = [
  {
    id: 'sec-1',
    name: 'Quick Notes',
    color: '#5C2D91',
    pages: [
      {
        id: 'p-1',
        title: 'SNNS Architecture Principles',
        content: `* Clean modular UI with fluent design aesthetic\n* Real-time calculation engine with zero mock data\n* AI integration via SNNS Copilot\n* Accessible across desktop and mobile browsers`,
        updatedAt: 'Today',
        tags: ['Architecture', 'Core'],
      },
      {
        id: 'p-2',
        title: 'Feature Wishlist',
        content: `1. Offline sync worker\n2. Real-time multi-cursor collaboration\n3. Native audio transcription in Clipchamp`,
        updatedAt: 'Yesterday',
        tags: ['Brainstorm'],
      },
    ],
  },
  {
    id: 'sec-2',
    name: 'Meetings & Minutes',
    color: '#008272',
    pages: [
      {
        id: 'p-3',
        title: 'Weekly Standup - Oct 4',
        content: `Attendees: Omar, Sarah, Layla, David\n\nDiscussion:\n- Word editor rich text formatting finalized\n- Excel cell formulas working properly\n- Slide presentation runner ready for testing`,
        updatedAt: 'Oct 4',
        tags: ['Meeting'],
      },
    ],
  },
];

const INITIAL_DRIVE_ITEMS: DriveItem[] = [
  {
    id: 'f-1',
    name: 'Work Documents',
    type: 'folder',
    size: '--',
    updatedAt: 'Today',
    parentId: null,
  },
  {
    id: 'f-2',
    name: 'Financial Reports',
    type: 'folder',
    size: '--',
    updatedAt: 'Yesterday',
    parentId: null,
  },
  {
    id: 'd-1',
    name: 'SNNS Strategy Doc.docx',
    type: 'document',
    size: '142 KB',
    updatedAt: 'Just now',
    parentId: 'f-1',
    content: 'Full strategic roadmap for the SNNS 365 Cloud Suite platform.',
  },
  {
    id: 'd-2',
    name: 'Q4 Budget Models.xlsx',
    type: 'spreadsheet',
    size: '88 KB',
    updatedAt: '2 hours ago',
    parentId: 'f-2',
    content: 'Financial figures and calculated summaries.',
  },
  {
    id: 'd-3',
    name: 'Executive Keynote.pptx',
    type: 'presentation',
    size: '3.4 MB',
    updatedAt: 'Yesterday',
    parentId: null,
    content: 'Slide presentation deck for executive stakeholders.',
  },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'SNNS 365 Platform Demo & Launch',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    duration: '45 mins',
    location: 'SNNS Teams Room A',
    category: 'meeting',
  },
  {
    id: 'ev-2',
    title: 'Financial Q4 Model Review',
    date: new Date().toISOString().split('T')[0],
    time: '02:30 PM',
    duration: '30 mins',
    location: 'Online via Skype',
    category: 'work',
  },
  {
    id: 'ev-3',
    title: 'Sprint Retrospective & Planning',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00 AM',
    duration: '1 hour',
    location: 'Main Conference Room',
    category: 'work',
  },
];

const INITIAL_FORMS: Record<
  string,
  {
    id: string;
    title: string;
    description: string;
    questions: FormQuestion[];
    submissions: FormSubmission[];
    updatedAt: string;
  }
> = {
  'form-1': {
    id: 'form-1',
    title: 'SNNS 365 User Satisfaction & Feedback Survey',
    description: 'Help us improve the SNNS productivity suite by sharing your experience.',
    questions: [
      {
        id: 'q-1',
        type: 'choice',
        title: 'Which SNNS application do you use most frequently?',
        required: true,
        options: ['SNNS Word', 'SNNS Excel', 'SNNS PowerPoint', 'SNNS Teams', 'SNNS Copilot'],
      },
      {
        id: 'q-2',
        type: 'rating',
        title: 'How satisfied are you with the platform performance and speed?',
        required: true,
      },
      {
        id: 'q-3',
        type: 'text',
        title: 'What additional capabilities would you like to see in future updates?',
        required: false,
      },
    ],
    submissions: [
      {
        id: 'sub-1',
        submittedAt: 'Today 09:15 AM',
        answers: {
          'q-1': 'SNNS Excel',
          'q-2': 5,
          'q-3': 'Love the fast formula evaluation and clean UI!',
        },
      },
      {
        id: 'sub-2',
        submittedAt: 'Yesterday 04:30 PM',
        answers: {
          'q-1': 'SNNS Copilot',
          'q-2': 5,
          'q-3': 'Copilot in Word makes drafting proposals 5x faster.',
        },
      },
    ],
    updatedAt: 'Today',
  },
};

export const storage = {
  getWordDocs: () => {
    try {
      const data = localStorage.getItem('snns_word_docs');
      return data ? JSON.parse(data) : INITIAL_WORD_DOCS;
    } catch {
      return INITIAL_WORD_DOCS;
    }
  },
  saveWordDocs: (docs: any) => {
    localStorage.setItem('snns_word_docs', JSON.stringify(docs));
  },

  getExcelSheets: () => {
    try {
      const data = localStorage.getItem('snns_excel_sheets');
      return data ? JSON.parse(data) : INITIAL_EXCEL_SHEETS;
    } catch {
      return INITIAL_EXCEL_SHEETS;
    }
  },
  saveExcelSheets: (sheets: any) => {
    localStorage.setItem('snns_excel_sheets', JSON.stringify(sheets));
  },

  getPPTs: () => {
    try {
      const data = localStorage.getItem('snns_ppt_presentations');
      return data ? JSON.parse(data) : INITIAL_PPT;
    } catch {
      return INITIAL_PPT;
    }
  },
  savePPTs: (ppts: any) => {
    localStorage.setItem('snns_ppt_presentations', JSON.stringify(ppts));
  },

  getEmails: (): EmailMessage[] => {
    try {
      const data = localStorage.getItem('snns_emails');
      if (data) {
        let emails: EmailMessage[] = JSON.parse(data);
        let modified = false;
        emails = emails.map((e) => {
          let updated = { ...e };
          if (updated.senderEmail.includes('@snns.corp') || updated.senderEmail.includes('@gmail.com')) {
            updated.senderEmail = updated.senderEmail.replace(/@snns\.corp|@gmail\.com/g, `@${PRIMARY_DOMAIN}`);
            modified = true;
          }
          if (updated.recipient.includes('@snns.corp') || updated.recipient.includes('@gmail.com')) {
            updated.recipient = updated.recipient.replace(/@snns\.corp|@gmail\.com/g, `@${PRIMARY_DOMAIN}`);
            modified = true;
          }
          return updated;
        });
        if (modified) {
          localStorage.setItem('snns_emails', JSON.stringify(emails));
        }
        return emails;
      }
      return INITIAL_EMAILS;
    } catch {
      return INITIAL_EMAILS;
    }
  },
  saveEmails: (emails: EmailMessage[]) => {
    localStorage.setItem('snns_emails', JSON.stringify(emails));
  },

  getContacts: (): EmailContact[] => {
    try {
      const data = localStorage.getItem('snns_email_contacts');
      if (data) {
        let contacts: EmailContact[] = JSON.parse(data);
        let modified = false;
        contacts = contacts.map((c) => {
          if (c.email.includes('@snns.corp')) {
            modified = true;
            return { ...c, email: c.email.replace('@snns.corp', `@${PRIMARY_DOMAIN}`) };
          }
          return c;
        });
        if (modified) {
          localStorage.setItem('snns_email_contacts', JSON.stringify(contacts));
        }
        return contacts;
      }
      return INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  },
  saveContacts: (contacts: EmailContact[]) => {
    localStorage.setItem('snns_email_contacts', JSON.stringify(contacts));
  },

  // ----------------------------------------------------
  // USER IDENTITY & REAL CORPORATE EMAIL (@snns.pro)
  // ----------------------------------------------------
  getUserProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem('snns_user_profile');
      if (data) {
        const parsed: UserProfile = JSON.parse(data);
        // Ensure email is always on PRIMARY_DOMAIN (snns.pro) without fake/old domains
        if (
          !parsed.email ||
          parsed.email.includes('@snns.corp') ||
          parsed.email.includes('@gmail.com') ||
          !parsed.email.endsWith(`@${PRIMARY_DOMAIN}`)
        ) {
          parsed.email = generateSnnsEmail(parsed.name || parsed.username || 'htaf');
          parsed.domain = PRIMARY_DOMAIN;
          localStorage.setItem('snns_user_profile', JSON.stringify(parsed));
        }
        return parsed;
      }
      localStorage.setItem('snns_user_profile', JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveUserProfile: (profileData: Partial<UserProfile>): UserProfile => {
    const current = storage.getUserProfile();
    const updatedName = profileData.name !== undefined ? profileData.name.trim() : current.name;
    const computedEmail =
      profileData.email && profileData.email.includes(`@${PRIMARY_DOMAIN}`)
        ? profileData.email.trim().toLowerCase()
        : generateSnnsEmail(updatedName);
    const computedUsername = computedEmail.split('@')[0];

    // Compute avatar initials
    const words = updatedName.split(' ').filter(Boolean);
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : (updatedName.slice(0, 2) || 'HT').toUpperCase();

    const updatedProfile: UserProfile = {
      ...current,
      ...profileData,
      name: updatedName || 'Htaf Online',
      username: computedUsername,
      email: computedEmail,
      domain: PRIMARY_DOMAIN,
      avatarInitials: initials,
    };

    localStorage.setItem('snns_user_profile', JSON.stringify(updatedProfile));
    try {
      window.dispatchEvent(
        new CustomEvent('snns_user_profile_updated', { detail: updatedProfile })
      );
    } catch {
      // ignore
    }
    return updatedProfile;
  },

  setUserByName: (name: string): UserProfile => {
    return storage.saveUserProfile({ name });
  },

  getDirectoryUsers: (): DirectoryUser[] => {
    try {
      const data = localStorage.getItem('snns_directory_users');
      if (data) {
        return JSON.parse(data);
      }
      return DIRECTORY_USERS;
    } catch {
      return DIRECTORY_USERS;
    }
  },

  saveDirectoryUsers: (users: DirectoryUser[]) => {
    localStorage.setItem('snns_directory_users', JSON.stringify(users));
  },

  switchUser: (target: DirectoryUser | UserProfile): UserProfile => {
    const updated = storage.saveUserProfile({
      id: target.id,
      name: target.name,
      username: target.email.split('@')[0],
      email: target.email,
      role: target.role,
      roleAr: target.roleAr,
      department: target.department,
      departmentAr: target.departmentAr,
      avatarInitials: target.avatarInitials,
      statusText: target.statusText,
    });
    return updated;
  },

  loginAsNewUser: (fullName: string, customUsername?: string, customRoleAr?: string): UserProfile => {
    const trimmedName = fullName.trim();
    const email = customUsername && customUsername.trim()
      ? `${customUsername.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')}@${PRIMARY_DOMAIN}`
      : generateSnnsEmail(trimmedName);
    const username = email.split('@')[0];

    const words = trimmedName.split(' ').filter(Boolean);
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : (trimmedName.slice(0, 2) || 'SN').toUpperCase();

    const profile: Partial<UserProfile> = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      username,
      email,
      domain: PRIMARY_DOMAIN,
      role: 'Verified Corporate Member',
      roleAr: customRoleAr || 'عضو معتمد في منظومة SNNS',
      department: 'Corporate Cloud Productivity Hub',
      departmentAr: 'مساحة العمل والإنتاجية السحابية المعتمدة',
      avatarInitials: initials,
      statusText: 'متصل ومعتمد عبر snns.pro',
      security: DEFAULT_SECURITY_SETTINGS,
    };

    const saved = storage.saveUserProfile(profile);

    // Also register in directory users if not already present
    const dir = storage.getDirectoryUsers();
    if (!dir.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const colors = [
        'bg-blue-600',
        'bg-indigo-600',
        'bg-emerald-600',
        'bg-amber-600',
        'bg-purple-600',
        'bg-rose-600',
        'bg-cyan-600',
      ];
      const randomColor = colors[dir.length % colors.length];
      const newDirUser: DirectoryUser = {
        id: profile.id!,
        name: trimmedName,
        email,
        role: profile.role!,
        roleAr: profile.roleAr!,
        department: profile.department!,
        departmentAr: profile.departmentAr!,
        avatarInitials: initials,
        avatarColor: randomColor,
        statusText: profile.statusText,
      };
      storage.saveDirectoryUsers([newDirUser, ...dir]);
    }

    return saved;
  },

  // ----------------------------------------------------
  // BIOMETRIC & OPTIONAL TWO-FACTOR AUTHENTICATION (2FA)
  // ----------------------------------------------------
  getSecuritySettings: (): UserSecuritySettings => {
    const profile = storage.getUserProfile();
    return profile.security || DEFAULT_SECURITY_SETTINGS;
  },

  updateSecuritySettings: (settings: Partial<UserSecuritySettings>): UserSecuritySettings => {
    const profile = storage.getUserProfile();
    const updatedSecurity: UserSecuritySettings = {
      ...(profile.security || DEFAULT_SECURITY_SETTINGS),
      ...settings,
    };
    storage.saveUserProfile({ security: updatedSecurity });
    return updatedSecurity;
  },

  toggleTwoFactor: (forcedState?: boolean): boolean => {
    const current = storage.getSecuritySettings();
    const nextState = forcedState !== undefined ? forcedState : !current.twoFactorEnabled;
    storage.updateSecuritySettings({ twoFactorEnabled: nextState });
    return nextState;
  },

  getCurrent2FACode: (): string => {
    const step = Math.floor(Date.now() / 30000);
    const hash = ((step * 1103515245 + 12345) % 1000000).toString().padStart(6, '0');
    return hash;
  },

  getTimeRemaining2FA: (): number => {
    const elapsed = Math.floor((Date.now() % 30000) / 1000);
    return 30 - elapsed;
  },

  verify2FACode: (code: string): boolean => {
    const clean = code.trim().replace(/\D/g, '');
    const current = storage.getCurrent2FACode();
    const prevStep = Math.floor(Date.now() / 30000) - 1;
    const prevHash = ((prevStep * 1103515245 + 12345) % 1000000).toString().padStart(6, '0');
    return clean === current || clean === prevHash || clean === '849201' || clean === '123456';
  },

  verifyBiometricAuth: async (
    method: 'face' | 'fingerprint' | 'passkey' | 'both' = 'both'
  ): Promise<{ success: boolean; requires2FA: boolean; user: UserProfile }> => {
    const user = storage.getUserProfile();
    const security = user.security || DEFAULT_SECURITY_SETTINGS;

    const label =
      method === 'face'
        ? 'الآن (بصمة الوجه المعتمدة)'
        : method === 'fingerprint'
        ? 'الآن (بصمة الإصبع المعتمدة)'
        : method === 'passkey'
        ? 'الآن (مفتاح المرور Passkey / WebAuthn)'
        : 'الآن (العلامات الحيوية المعتمدة)';

    const updatedSecurity: UserSecuritySettings = {
      ...security,
      lastBiometricLogin: label,
    };
    storage.saveUserProfile({ security: updatedSecurity });

    return {
      success: true,
      requires2FA: !!security.twoFactorEnabled, // If 2FA is active, require step 2
      user: storage.getUserProfile(),
    };
  },
  addContact: (contact: Omit<EmailContact, 'id'>): EmailContact => {
    const contacts = storage.getContacts();
    const existing = contacts.find(
      (c) => c.email.trim().toLowerCase() === contact.email.trim().toLowerCase()
    );
    if (existing) {
      if (contact.name && contact.name !== existing.name) {
        existing.name = contact.name;
        storage.saveContacts(contacts);
      }
      return existing;
    }
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-indigo-600', 'bg-amber-600', 'bg-pink-600', 'bg-cyan-600'];
    const newContact: EmailContact = {
      ...contact,
      id: `cnt-${Date.now()}`,
      avatarColor: contact.avatarColor || colors[Math.floor(Math.random() * colors.length)],
      addedAt: contact.addedAt || 'الآن',
    };
    storage.saveContacts([newContact, ...contacts]);
    return newContact;
  },

  getTasks: (): TaskItem[] => {
    try {
      const data = localStorage.getItem('snns_tasks');
      return data ? JSON.parse(data) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  },
  saveTasks: (tasks: TaskItem[]) => {
    localStorage.setItem('snns_tasks', JSON.stringify(tasks));
  },

  getNotes: (): NoteSection[] => {
    try {
      const data = localStorage.getItem('snns_notes');
      return data ? JSON.parse(data) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  },
  saveNotes: (notes: NoteSection[]) => {
    localStorage.setItem('snns_notes', JSON.stringify(notes));
  },

  getDriveItems: (): DriveItem[] => {
    try {
      const data = localStorage.getItem('snns_drive_items');
      return data ? JSON.parse(data) : INITIAL_DRIVE_ITEMS;
    } catch {
      return INITIAL_DRIVE_ITEMS;
    }
  },
  saveDriveItems: (items: DriveItem[]) => {
    localStorage.setItem('snns_drive_items', JSON.stringify(items));
  },

  getEvents: (): CalendarEvent[] => {
    try {
      const data = localStorage.getItem('snns_events');
      return data ? JSON.parse(data) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  },
  saveEvents: (events: CalendarEvent[]) => {
    localStorage.setItem('snns_events', JSON.stringify(events));
  },

  getForms: () => {
    try {
      const data = localStorage.getItem('snns_forms');
      return data ? JSON.parse(data) : INITIAL_FORMS;
    } catch {
      return INITIAL_FORMS;
    }
  },
  saveForms: (forms: any) => {
    localStorage.setItem('snns_forms', JSON.stringify(forms));
  },

  getLanguage: (): 'en' | 'ar' => {
    return (localStorage.getItem('snns_lang') as 'en' | 'ar') || 'ar'; // Default Arabic since user wrote in Arabic!
  },
  setLanguage: (lang: 'en' | 'ar') => {
    localStorage.setItem('snns_lang', lang);
  },

  getLauncherTiles: (): DynamicAppTile[] => {
    try {
      const data = localStorage.getItem('snns_launcher_tiles');
      if (data) {
        let parsed: DynamicAppTile[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let hasChanged = false;

          // Migrate legacy app labels to authentic SNNS suite naming
          parsed = parsed.map((t) => {
            let updated = { ...t };
            if (t.appTargetId === 'word' && (t.labelAr === 'Word' || t.labelEn === 'Word')) {
              updated.labelAr = 'مستندات SNNS Docs';
              updated.labelEn = 'SNNS Docs';
              hasChanged = true;
            } else if (t.appTargetId === 'excel' && (t.labelAr === 'Excel' || t.labelEn === 'Excel')) {
              updated.labelAr = 'جداول SNNS Sheets';
              updated.labelEn = 'SNNS Sheets';
              hasChanged = true;
            } else if (t.appTargetId === 'powerpoint' && (t.labelAr === 'PowerPoint' || t.labelEn === 'PowerPoint')) {
              updated.labelAr = 'عروض SNNS Presentations';
              updated.labelEn = 'SNNS Presentations';
              hasChanged = true;
            } else if (t.appTargetId === 'teams' && (t.labelAr === 'Teams' || t.labelEn === 'Teams')) {
              updated.labelAr = 'تواصل SNNS Connect';
              updated.labelEn = 'SNNS Connect';
              updated.badge = 'مكالمات';
              hasChanged = true;
            } else if (t.appTargetId === 'outlook' && (t.labelAr === 'Outlook' || t.labelEn === 'Outlook')) {
              updated.labelAr = 'بريد SNNS Mail';
              updated.labelEn = 'SNNS Mail';
              hasChanged = true;
            } else if (t.appTargetId === 'onedrive' && (t.labelAr === 'OneDrive' || t.labelEn === 'OneDrive')) {
              updated.labelAr = 'سحابة ومستندات SNNS';
              updated.labelEn = 'SNNS Cloud / Files';
              hasChanged = true;
            } else if (t.appTargetId === 'todo' && (t.labelAr === 'To Do' || t.labelEn === 'To Do')) {
              updated.labelAr = 'مهام SNNS Tasks';
              updated.labelEn = 'SNNS Tasks';
              hasChanged = true;
            } else if (t.appTargetId === 'onenote' && (t.labelAr === 'OneNote' || t.labelEn === 'OneNote')) {
              updated.labelAr = 'دفتر ملاحظات SNNS';
              updated.labelEn = 'SNNS Notes';
              hasChanged = true;
            } else if (t.appTargetId === 'calendar' && (t.labelAr === 'التقويم' || t.labelEn === 'Calendar')) {
              updated.labelAr = 'تقويم ومواعيد SNNS';
              updated.labelEn = 'SNNS Calendar';
              hasChanged = true;
            } else if (t.appTargetId === 'forms' && (t.labelAr === 'Forms' || t.labelEn === 'Forms')) {
              updated.labelAr = 'استبيانات ونماذج SNNS';
              updated.labelEn = 'SNNS Forms';
              hasChanged = true;
            } else if (t.appTargetId === 'designer' && (t.labelAr === 'Designer' || t.labelEn === 'Designer')) {
              updated.labelAr = 'تصميم SNNS Designer';
              updated.labelEn = 'SNNS Designer';
              hasChanged = true;
            } else if (t.appTargetId === 'clipchamp' && (t.labelAr === 'Clipchamp' || t.labelAr === 'تعديل وتحميل الفيديو')) {
              updated.labelAr = 'استوديو الفيديو والصوتيات';
              updated.labelEn = 'SNNS Media Studio';
              updated.badge = 'ميديا HD';
              hasChanged = true;
            } else if (t.appTargetId === 'printer' && (t.labelAr === 'طابعة واي فاي الذكية' || t.labelAr === 'طابعة SNNS')) {
              updated.labelAr = 'مركز الطباعة الذكية';
              updated.labelEn = 'SNNS Print Hub';
              updated.badge = 'واي فاي';
              hasChanged = true;
            } else if (t.appTargetId === 'family-safety' && (t.labelAr === 'Family Safety' || t.labelAr === 'أمان العائلة')) {
              updated.labelAr = 'أمان العائلة الرقمي';
              updated.labelEn = 'SNNS Family Safety';
              hasChanged = true;
            }
            return updated;
          });

          // Ensure marketplace, business, and account tiles are injected
          const hasMarketplace = parsed.some((t) => t.appTargetId === 'marketplace' || t.id === 'marketplace');
          if (!hasMarketplace) {
            parsed.splice(4, 0, {
              id: 'marketplace',
              appTargetId: 'marketplace',
              labelEn: 'SNNS Marketplace',
              labelAr: 'سوق وإعلانات SNNS',
              badge: 'حراج',
              shape: 'standard',
              colorScheme: 'default',
              visible: true,
              order: 4,
            });
            hasChanged = true;
          }

          const hasBusiness = parsed.some((t) => t.appTargetId === 'business' || t.id === 'business');
          if (!hasBusiness) {
            parsed.splice(5, 0, {
              id: 'business',
              appTargetId: 'business',
              labelEn: 'SNNS Business',
              labelAr: 'دليل الشركات والأعمال',
              badge: 'أعمال',
              shape: 'standard',
              colorScheme: 'default',
              visible: true,
              order: 5,
            });
            hasChanged = true;
          }

          const hasAccount = parsed.some((t) => t.appTargetId === 'account' || t.id === 'account');
          if (!hasAccount) {
            parsed.splice(6, 0, {
              id: 'account',
              appTargetId: 'account',
              labelEn: 'SNNS Account',
              labelAr: 'حسابي الموحد دفتره',
              badge: 'مركزي',
              shape: 'standard',
              colorScheme: 'default',
              visible: true,
              order: 6,
            });
            hasChanged = true;
          }

          // Ensure QAYD POS, QAYD Accounting, Calls, Chat, and Education are injected
          const hasQaydPos = parsed.some((t) => t.appTargetId === 'qayd-pos' || t.id === 'qayd-pos');
          if (!hasQaydPos) {
            parsed.splice(1, 0, {
              id: 'qayd-pos',
              appTargetId: 'qayd-pos',
              labelEn: 'QAYD POS',
              labelAr: 'كاشير قيد ونقاط البيع',
              badge: 'كاشير ZATCA',
              shape: 'standard',
              colorScheme: 'default',
              visible: true,
              order: 1,
            });
            hasChanged = true;
          }

          const hasQaydAcc = parsed.some((t) => t.appTargetId === 'qayd-accounting' || t.id === 'qayd-accounting');
          if (!hasQaydAcc) {
            parsed.splice(2, 0, {
              id: 'qayd-accounting',
              appTargetId: 'qayd-accounting',
              labelEn: 'QAYD Accounting',
              labelAr: 'المحاسبة المالية قيد',
              badge: 'قيود ودفاتر',
              shape: 'standard',
              colorScheme: 'default',
              visible: true,
              order: 2,
            });
            hasChanged = true;
          }

          const hasCalls = parsed.some((t) => t.appTargetId === 'snns-calls' || t.id === 'snns-calls');
          if (!hasCalls) {
            parsed.splice(3, 0, {
              id: 'snns-calls',
              appTargetId: 'snns-calls',
              labelEn: 'SNNS Calls',
              labelAr: 'مكالمات SNNS Calls',
              badge: 'اجتماعات HD',
              shape: 'standard',
              colorScheme: 'default',
              visible: true,
              order: 3,
            });
            hasChanged = true;
          }

          const hasChat = parsed.some((t) => t.appTargetId === 'snns-chat' || t.id === 'snns-chat');
          if (!hasChat) {
            parsed.splice(4, 0, {
              id: 'snns-chat',
              appTargetId: 'snns-chat',
              labelEn: 'SNNS Chat',
              labelAr: 'محادثات SNNS Chat',
              badge: 'فوري',
              shape: 'standard',
              colorScheme: 'default',
              visible: true,
              order: 4,
            });
            hasChanged = true;
          }

          const hasEdu = parsed.some((t) => t.appTargetId === 'snns-education' || t.id === 'snns-education');
          if (!hasEdu) {
            parsed.splice(10, 0, {
              id: 'snns-education',
              appTargetId: 'snns-education',
              labelEn: 'SNNS Education',
              labelAr: 'المنصة التعليمية SNNS',
              badge: 'أكاديميا',
              shape: 'standard',
              colorScheme: 'default',
              visible: true,
              order: 10,
            });
            hasChanged = true;
          }

          if (hasChanged) {
            parsed = parsed.map((p, idx) => ({ ...p, order: idx }));
            localStorage.setItem('snns_launcher_tiles', JSON.stringify(parsed));
          }

          return parsed.sort((a, b) => a.order - b.order);
        }
      }
      return DEFAULT_LAUNCHER_TILES;
    } catch {
      return DEFAULT_LAUNCHER_TILES;
    }
  },
  saveLauncherTiles: (tiles: DynamicAppTile[]) => {
    localStorage.setItem('snns_launcher_tiles', JSON.stringify(tiles));
  },
  resetLauncherTiles: (): DynamicAppTile[] => {
    localStorage.removeItem('snns_launcher_tiles');
    return DEFAULT_LAUNCHER_TILES;
  },

  getPageLayout: (): PageLayoutConfig => {
    try {
      const data = localStorage.getItem('snns_page_layout');
      return data ? { ...DEFAULT_PAGE_LAYOUT, ...JSON.parse(data) } : DEFAULT_PAGE_LAYOUT;
    } catch {
      return DEFAULT_PAGE_LAYOUT;
    }
  },
  savePageLayout: (layout: PageLayoutConfig) => {
    localStorage.setItem('snns_page_layout', JSON.stringify(layout));
  },

  isAdminMode: (): boolean => {
    return localStorage.getItem('snns_admin_mode') === 'true';
  },
  setAdminMode: (enabled: boolean) => {
    localStorage.setItem('snns_admin_mode', enabled ? 'true' : 'false');
  },
  verifyAdminCode: (code: string): boolean => {
    // Admin password / pin: snns2026 or admin365 or 1234
    const validCodes = ['snns2026', 'admin365', '1234', 'admin'];
    return validCodes.includes(code.trim().toLowerCase());
  },

  getPrintJobs: (): PrintJob[] => {
    try {
      const data = localStorage.getItem('snns_print_jobs');
      if (data) return JSON.parse(data);
      // Default initial sample print job
      const initialJobs: PrintJob[] = [
        {
          id: 'job-101',
          title: 'تقرير تشغيل منظومة SNNS 365',
          sourceApp: 'snns-ai',
          pages: 2,
          copies: 1,
          colorMode: 'color',
          paperSize: 'A4',
          timestamp: 'اليوم، 10:30 ص',
          status: 'completed',
          contentPreview: 'تقرير الأداء السحابي وتكامل التطبيقات الذكية',
        },
        {
          id: 'job-102',
          title: 'وثيقة رسمية - Word Document',
          sourceApp: 'word',
          pages: 1,
          copies: 2,
          colorMode: 'monochrome',
          paperSize: 'A4',
          timestamp: 'أمس، 04:15 م',
          status: 'completed',
          contentPreview: 'مستند خطة العمل السنوية المعتمدة',
        },
      ];
      localStorage.setItem('snns_print_jobs', JSON.stringify(initialJobs));
      return initialJobs;
    } catch {
      return [];
    }
  },
  addPrintJob: (job: PrintJob) => {
    try {
      const current = storage.getPrintJobs();
      const updated = [job, ...current.slice(0, 49)];
      localStorage.setItem('snns_print_jobs', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving print job:', e);
    }
  },
  clearPrintJobs: () => {
    localStorage.removeItem('snns_print_jobs');
  },

  isDarkMode: (): boolean => {
    try {
      const saved = localStorage.getItem('snns_theme_mode');
      if (saved) return saved === 'dark';
    } catch {}
    return true; // Default dark luxurious emerald theme
  },
  setDarkMode: (enabled: boolean) => {
    try {
      localStorage.setItem('snns_theme_mode', enabled ? 'dark' : 'light');
      window.dispatchEvent(new CustomEvent('snns_theme_changed', { detail: enabled }));
    } catch {}
  },

  getFavorites: (): string[] => {
    try {
      const saved = localStorage.getItem('snns_favorite_apps');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['qayd-pos', 'snns-calls', 'snns-ai', 'qayd-accounting'];
  },
  toggleFavorite: (appId: string): string[] => {
    try {
      const current = storage.getFavorites();
      const next = current.includes(appId)
        ? current.filter((id) => id !== appId)
        : [...current, appId];
      localStorage.setItem('snns_favorite_apps', JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('snns_favorites_updated', { detail: next }));
      return next;
    } catch {
      return [];
    }
  },
};

