import { AppRegistryItem, TenantCompany, UserRoleType, AppId } from '../types/suite';

export const APP_CATEGORIES = [
  { id: 'all', nameAr: 'جميع التطبيقات', nameEn: 'All Apps' },
  { id: 'pos_finance', nameAr: 'المحاسبة ونقاط البيع (قيد)', nameEn: 'Finance & POS' },
  { id: 'communications', nameAr: 'الاتصالات والاجتماعات', nameEn: 'Calls & Chat' },
  { id: 'business', nameAr: 'الأعمال والتجارة وحراج', nameEn: 'Business & Commerce' },
  { id: 'productivity', nameAr: 'المستندات والإنتاجية', nameEn: 'Productivity & Office' },
  { id: 'ai_education', nameAr: 'الذكاء الاصطناعي والتعليم', nameEn: 'AI & Education' },
] as const;

export const DEFAULT_TENANT_COMPANIES: TenantCompany[] = [
  {
    id: 'tenant-1',
    nameAr: 'مجموعة قيد القابضة للتقنية والتجارة',
    nameEn: 'Qayd Holding Tech & Trade Group',
    commercialRegistration: '1010892011',
    vatNumber: '310988472900003',
    industryAr: 'التقنية وحلول التجزئة السحابية',
    logoInitials: 'قيد',
    logoColor: 'from-emerald-700 to-teal-800',
    plan: 'enterprise',
    branchesCount: 4,
    activeBranch: 'فرع الرياض الرئيسي - النرجس',
  },
  {
    id: 'tenant-2',
    nameAr: 'متجر ومؤسسة قيد للتجزئة ونقاط البيع',
    nameEn: 'Qayd Retail & POS Establishment',
    commercialRegistration: '4030771890',
    vatNumber: '311455209800003',
    industryAr: 'تجارة التجزئة والأغذية',
    logoInitials: 'POS',
    logoColor: 'from-amber-600 to-orange-700',
    plan: 'pro',
    branchesCount: 2,
    activeBranch: 'فرع جدة - الكورنيش',
  },
  {
    id: 'tenant-3',
    nameAr: 'شركة السحاب السريعة للاستشارات والتعليم',
    nameEn: 'Al Sahab Fast Consulting & Education',
    commercialRegistration: '2050883344',
    vatNumber: '302911874200003',
    industryAr: 'الاستشارات والتدريب الأكاديمي',
    logoInitials: 'SN',
    logoColor: 'from-blue-700 to-indigo-900',
    plan: 'starter',
    branchesCount: 1,
    activeBranch: 'المركز الرقمي - الخبر',
  },
];

export const APP_REGISTRY: AppRegistryItem[] = [
  // 1. SNNS Calls
  {
    id: 'snns-calls',
    nameAr: 'SNNS Calls',
    nameEn: 'SNNS Calls',
    taglineAr: 'المكالمات والاجتماعات الصوتية والمرئية المشفرة',
    taglineEn: 'Encrypted HD voice & video meetings',
    category: 'communications',
    badge: 'مكالمات HD',
    badgeColor: 'bg-sky-500 text-white',
    iconName: 'calls',
    pwaPath: '/?app=snns-calls',
    manifestUrl: '/manifest-calls.json',
    standaloneInstallable: true,
    status: 'active',
    order: 1,
  },
  // 2. SNNS Chat
  {
    id: 'snns-chat',
    nameAr: 'SNNS Chat',
    nameEn: 'SNNS Chat',
    taglineAr: 'المحادثات الفورية والقنوات المؤسسية',
    taglineEn: 'Instant team channels & direct messaging',
    category: 'communications',
    badge: 'تواصل فوري',
    badgeColor: 'bg-indigo-500 text-white',
    iconName: 'chat',
    pwaPath: '/?app=snns-chat',
    manifestUrl: '/manifest-chat.json',
    standaloneInstallable: true,
    status: 'active',
    order: 2,
  },
  // 3. SNNS Mail
  {
    id: 'outlook',
    nameAr: 'SNNS Mail',
    nameEn: 'SNNS Mail',
    taglineAr: 'البريد الإلكتروني والمراسلات الموثقة',
    taglineEn: 'Verified corporate inbox & mailing suite',
    category: 'communications',
    badge: 'بريد موثق',
    badgeColor: 'bg-blue-600 text-white',
    iconName: 'outlook',
    pwaPath: '/?app=outlook',
    manifestUrl: '/manifest-mail.json',
    standaloneInstallable: true,
    status: 'active',
    order: 3,
  },
  // 4. SNNS Cloud
  {
    id: 'onedrive',
    nameAr: 'SNNS Cloud',
    nameEn: 'SNNS Cloud',
    taglineAr: 'الملفات والتخزين السحابي الآمن',
    taglineEn: 'Secure enterprise cloud storage & sync',
    category: 'productivity',
    badge: '1000 GB',
    badgeColor: 'bg-cyan-600 text-white',
    iconName: 'onedrive',
    pwaPath: '/?app=onedrive',
    manifestUrl: '/manifest-cloud.json',
    standaloneInstallable: true,
    status: 'active',
    order: 4,
  },
  // 5. SNNS Docs
  {
    id: 'word',
    nameAr: 'SNNS Docs',
    nameEn: 'SNNS Docs',
    taglineAr: 'محرر المستندات والتقارير التنفيذية',
    taglineEn: 'Word processing and rich document reports',
    category: 'productivity',
    badge: 'Word Pro',
    badgeColor: 'bg-blue-700 text-white',
    iconName: 'word',
    pwaPath: '/?app=word',
    manifestUrl: '/manifest-docs.json',
    standaloneInstallable: true,
    status: 'active',
    order: 5,
  },
  // 6. SNNS Sheets
  {
    id: 'excel',
    nameAr: 'SNNS Sheets',
    nameEn: 'SNNS Sheets',
    taglineAr: 'الجداول الإلكترونية والتحليل الحسابي',
    taglineEn: 'Spreadsheets, formulas and financial charts',
    category: 'productivity',
    badge: 'Excel Data',
    badgeColor: 'bg-emerald-600 text-white',
    iconName: 'excel',
    pwaPath: '/?app=excel',
    manifestUrl: '/manifest-sheets.json',
    standaloneInstallable: true,
    status: 'active',
    order: 6,
  },
  // 7. SNNS Presentations
  {
    id: 'powerpoint',
    nameAr: 'SNNS Presentations',
    nameEn: 'SNNS Presentations',
    taglineAr: 'العروض التقديمية والشرائح التفاعلية',
    taglineEn: 'Slide decks, animations & presentations',
    category: 'productivity',
    badge: 'شرائح 4K',
    badgeColor: 'bg-rose-600 text-white',
    iconName: 'powerpoint',
    pwaPath: '/?app=powerpoint',
    manifestUrl: '/manifest-presentations.json',
    standaloneInstallable: true,
    status: 'active',
    order: 7,
  },
  // 8. SNNS Business
  {
    id: 'business',
    nameAr: 'SNNS Business',
    nameEn: 'SNNS Business',
    taglineAr: 'دليل الشركات والتوثيق التجاري B2B',
    taglineEn: 'Verified enterprise directory & commercial records',
    category: 'business',
    badge: 'توثيق رسمي',
    badgeColor: 'bg-indigo-700 text-white',
    iconName: 'business',
    pwaPath: '/?app=business',
    manifestUrl: '/manifest-business.json',
    standaloneInstallable: true,
    status: 'active',
    order: 8,
  },
  // 9. QAYD POS (الكاشير ونقاط البيع)
  {
    id: 'qayd-pos',
    nameAr: 'QAYD POS',
    nameEn: 'QAYD POS',
    taglineAr: 'الكاشير السحابي، الباركود، والفواتير الضريبية',
    taglineEn: 'Cloud Cashier POS, Barcodes & Tax Invoices',
    category: 'pos_finance',
    badge: 'كاشير مبيعات',
    badgeColor: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
    iconName: 'qayd-pos',
    pwaPath: '/?app=qayd-pos',
    manifestUrl: '/manifest-qayd-pos.json',
    standaloneInstallable: true,
    requiredRole: ['owner', 'finance_manager', 'cashier'],
    status: 'active',
    order: 9,
  },
  // 10. QAYD Accounting (المحاسبة والإدارة المالية)
  {
    id: 'qayd-accounting',
    nameAr: 'QAYD Accounting',
    nameEn: 'QAYD Accounting',
    taglineAr: 'شجرة الحسابات، قيود اليومية، والتقارير المالية',
    taglineEn: 'General Ledger, Financial Journal & Reports',
    category: 'pos_finance',
    badge: 'محاسبة وقيود',
    badgeColor: 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white',
    iconName: 'qayd-accounting',
    pwaPath: '/?app=qayd-accounting',
    manifestUrl: '/manifest-qayd-accounting.json',
    standaloneInstallable: true,
    requiredRole: ['owner', 'finance_manager'],
    status: 'active',
    order: 10,
  },
  // 11. SNNS Marketplace
  {
    id: 'marketplace',
    nameAr: 'SNNS Marketplace',
    nameEn: 'SNNS Marketplace',
    taglineAr: 'سوق وإعلانات وحراج المنظومة التجاري',
    taglineEn: 'Commercial classifieds, verified ads & trade',
    category: 'business',
    badge: 'حراج وسوق',
    badgeColor: 'bg-amber-600 text-white',
    iconName: 'marketplace',
    pwaPath: '/?app=marketplace',
    manifestUrl: '/manifest-marketplace.json',
    standaloneInstallable: true,
    status: 'active',
    order: 11,
  },
  // 12. SNNS Education
  {
    id: 'snns-education',
    nameAr: 'SNNS Education',
    nameEn: 'SNNS Education',
    taglineAr: 'المنصة التعليمية للجامعات، المقررات، والمحاضرات',
    taglineEn: 'Digital Academy, Courses & Academic Degrees',
    category: 'ai_education',
    badge: 'أكاديميا',
    badgeColor: 'bg-emerald-700 text-white',
    iconName: 'education',
    pwaPath: '/?app=snns-education',
    manifestUrl: '/manifest-education.json',
    standaloneInstallable: true,
    status: 'active',
    order: 12,
  },
  // 13. SNNS Calendar
  {
    id: 'calendar',
    nameAr: 'SNNS Calendar',
    nameEn: 'SNNS Calendar',
    taglineAr: 'التقويم السحابي، المواعيد، وتزامن المجدول',
    taglineEn: 'Synced schedule, appointments & events',
    category: 'productivity',
    badge: 'جدولة',
    badgeColor: 'bg-sky-600 text-white',
    iconName: 'calendar',
    pwaPath: '/?app=calendar',
    manifestUrl: '/manifest-calendar.json',
    standaloneInstallable: true,
    status: 'active',
    order: 13,
  },
  // 14. SNNS AI
  {
    id: 'snns-ai',
    nameAr: 'SNNS AI',
    nameEn: 'SNNS AI',
    taglineAr: 'محرك ونماذج الذكاء الاصطناعي ومعالجة اللغات',
    taglineEn: 'Saudi Advanced AI engine, NLP & Models',
    category: 'ai_education',
    badge: 'PRO NLP',
    badgeColor: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black',
    iconName: 'snns-ai',
    pwaPath: '/?app=snns-ai',
    manifestUrl: '/manifest-ai.json',
    standaloneInstallable: true,
    status: 'active',
    order: 14,
  },
  // 15. SNNS Central Account
  {
    id: 'account',
    nameAr: 'SNNS Account',
    nameEn: 'SNNS Account',
    taglineAr: 'الحساب الموحد، الأمان الحيوي، والاشتراكات',
    taglineEn: 'Unified ID, Biometrics & Tenant Billing',
    category: 'business',
    badge: 'حساب موحد',
    badgeColor: 'bg-slate-800 text-sky-300',
    iconName: 'account',
    pwaPath: '/?app=account',
    manifestUrl: '/manifest-account.json',
    standaloneInstallable: true,
    status: 'active',
    order: 15,
  },
];

class AppRegistryService {
  private activeTenant: TenantCompany;
  private currentRole: UserRoleType = 'owner';
  private deferredInstallPrompt: any = null;

  constructor() {
    this.activeTenant = this.loadActiveTenant();
    this.setupInstallPromptListener();
  }

  private loadActiveTenant(): TenantCompany {
    try {
      const saved = localStorage.getItem('snns_active_tenant');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TENANT_COMPANIES[0];
  }

  getActiveTenant(): TenantCompany {
    return this.activeTenant;
  }

  setActiveTenant(tenant: TenantCompany) {
    this.activeTenant = tenant;
    try {
      localStorage.setItem('snns_active_tenant', JSON.stringify(tenant));
      window.dispatchEvent(new CustomEvent('snns_tenant_updated', { detail: tenant }));
    } catch {}
  }

  getTenantCompanies(): TenantCompany[] {
    try {
      const saved = localStorage.getItem('snns_tenant_companies');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TENANT_COMPANIES;
  }

  getCurrentRole(): UserRoleType {
    const saved = localStorage.getItem('snns_active_role') as UserRoleType;
    return saved || this.currentRole;
  }

  setCurrentRole(role: UserRoleType) {
    this.currentRole = role;
    localStorage.setItem('snns_active_role', role);
    window.dispatchEvent(new CustomEvent('snns_role_updated', { detail: role }));
  }

  canUserAccessApp(appId: AppId, userRole?: UserRoleType): { allowed: boolean; reason?: string } {
    const role = userRole || this.getCurrentRole();
    const app = APP_REGISTRY.find((a) => a.id === appId);

    if (!app) return { allowed: true };
    if (!app.requiredRole || app.requiredRole.length === 0) return { allowed: true };

    const allowed = app.requiredRole.includes(role);
    if (!allowed) {
      if (appId === 'qayd-accounting' && role === 'cashier') {
        return {
          allowed: false,
          reason: 'حسابك يحمل صلاحية "كاشير". لإدارة شجرة الحسابات والقيود المالية، يلزم صلاحية مدير مالي أو مالك المنشأة.',
        };
      }
      return {
        allowed: false,
        reason: 'هذا التطبيق يتطلب صلاحية إدارية خاصة.',
      };
    }
    return { allowed: true };
  }

  getAppsByCategory(category: string): AppRegistryItem[] {
    if (category === 'all') return APP_REGISTRY;
    return APP_REGISTRY.filter((app) => app.category === category);
  }

  getAppById(id: AppId): AppRegistryItem | undefined {
    return APP_REGISTRY.find((app) => app.id === id);
  }

  // PWA Standalone Manifest & Installation Handling
  private setupInstallPromptListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredInstallPrompt = e;
        window.dispatchEvent(new CustomEvent('snns_pwa_installable', { detail: true }));
      });
    }
  }

  getDeferredPrompt() {
    return this.deferredInstallPrompt;
  }

  async triggerPwaInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
    if (!this.deferredInstallPrompt) return 'unsupported';
    try {
      this.deferredInstallPrompt.prompt();
      const choiceResult = await this.deferredInstallPrompt.userChoice;
      this.deferredInstallPrompt = null;
      return choiceResult.outcome;
    } catch {
      return 'unsupported';
    }
  }

  generateStandaloneManifestBlobUrl(app: AppRegistryItem): string {
    const manifestContent = {
      id: app.pwaPath,
      start_url: app.pwaPath,
      scope: '/',
      name: `${app.nameAr} — SNNS.PRO`,
      short_name: app.nameEn,
      description: app.taglineAr,
      display: 'standalone',
      theme_color: '#064E3B',
      background_color: '#0A0D0C',
      icons: [
        {
          src: '/favicon.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: '/favicon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(manifestContent, null, 2)], {
      type: 'application/manifest+json',
    });
    return URL.createObjectURL(blob);
  }
}

export const appRegistry = new AppRegistryService();
