export type AppId =
  | 'snns-ai'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'printer'
  | 'teams'
  | 'onedrive'
  | 'outlook'
  | 'copilot'
  | 'family-safety'
  | 'todo'
  | 'onenote'
  | 'more-apps'
  | 'skype'
  | 'designer'
  | 'clipchamp'
  | 'calendar'
  | 'forms'
  | 'marketplace'
  | 'business'
  | 'account'
  | 'qayd-pos'
  | 'qayd-accounting'
  | 'snns-education'
  | 'snns-calls'
  | 'snns-chat';

export interface MarketplaceListing {
  id: string;
  title: string;
  titleEn?: string;
  category: 'cars' | 'real-estate' | 'electronics' | 'services' | 'furniture' | 'jobs' | 'other';
  categoryAr: string;
  categoryEn: string;
  price: number;
  currency: string;
  location: string;
  locationEn: string;
  image: string;
  description: string;
  sellerName: string;
  sellerPhone: string;
  sellerVerified: boolean;
  postedAt: string;
  views: number;
  isSaved?: boolean;
  isMine?: boolean;
}

export interface BusinessCompany {
  id: string;
  name: string;
  nameEn: string;
  industry: 'tech' | 'construction' | 'consulting' | 'trade' | 'finance' | 'logistics';
  industryAr: string;
  industryEn: string;
  logo: string;
  city: string;
  cityEn: string;
  commercialId: string;
  verifiedBadge: 'gold' | 'blue' | 'standard';
  description: string;
  services: string[];
  employeesCount: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  establishedYear: number;
}

export type IconShapeType = 'standard' | 'rounded' | 'circle' | 'squircle' | 'hexagon' | 'glass';

export type IconStyleType =
  | 'default'
  | 'gradient-blue'
  | 'gradient-purple'
  | 'gradient-emerald'
  | 'gradient-crimson'
  | 'gradient-amber'
  | 'gradient-dark'
  | 'gradient-cyberpunk';

export interface PageLayoutConfig {
  gridColumns: 4 | 5 | 6;
  cardWidth: 'standard' | 'wide' | 'compact';
  centerIncompleteRows: boolean;
  showHeroBanner: boolean;
  showRecentFiles: boolean;
  showCreateMore: boolean;
}

export interface DynamicAppTile {
  id: string;
  appTargetId: AppId | 'custom-link';
  labelEn: string;
  labelAr: string;
  badge?: string;
  shape: IconShapeType;
  colorScheme: IconStyleType;
  customIcon?: string;
  customLogoUrl?: string;
  externalUrl?: string;
  visible: boolean;
  order: number;
}

export interface VerifiedLink {
  id: string;
  title: string;          // اسم الخدمة (مثال: منصة ناجز)
  url: string;            // الرابط الرسمي الفعلي (https://najiz.sa)
  description: string;    // وصف مختصر للخدمة
  category: string;       // التصنيف الرئيسي (مثال: دوائر حكومية / وزارات وهيئات)
  subCategory?: string;   // تصنيف فرعي (مثل: وزارة العدل - خدمات قضائية)
  keywords: string[];     // الكلمات المفتاحية للبحث (ناجز, عدل, صكوك, وكالات)
  addedBy: string;        // اسم/بريد المشرف الذي أضاف الرابط (Super Admin)
  isVerified: boolean;    // حالة الاعتماد (True)
  createdDate: string;
}

export interface AppMetadata {
  id: AppId;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  color: string;
  category: 'productivity' | 'communication' | 'creativity' | 'utility';
  isCreateMore?: boolean;
}

export interface RecentDocument {
  id: string;
  title: string;
  appId: AppId;
  updatedAt: string;
  size?: string;
  previewSnippet?: string;
}

export interface EmailMessage {
  id: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  subject: string;
  body: string;
  date: string;
  isUnread: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash';
}

export interface EmailContact {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarColor?: string;
  notes?: string;
  addedAt?: string;
}

export interface UserSecuritySettings {
  biometricsEnabled: boolean;
  biometricType: 'fingerprint' | 'face' | 'both';
  biometricRegistered: boolean;
  registeredBiometricsCount: number;
  twoFactorEnabled: boolean; // optional 2FA
  twoFactorMethod: 'totp' | 'email';
  lastBiometricLogin?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string; // e.g. 'htaf'
  email: string; // e.g. 'htaf@snns.pro'
  domain: string; // 'snns.pro'
  role: string;
  roleAr: string;
  department: string;
  departmentAr: string;
  avatarInitials: string;
  avatarColor?: string;
  statusText?: string;
  security?: UserSecuritySettings;
  isAuthenticated?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'my-day' | 'important' | 'planned' | 'tasks';
  dueDate?: string;
  isImportant?: boolean;
  notes?: string;
}

export interface NotePage {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags?: string[];
}

export interface NoteSection {
  id: string;
  name: string;
  color: string;
  pages: NotePage[];
}

export interface SlideItem {
  id: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  theme: string;
  notes?: string;
  layout: 'title' | 'content' | 'two-column' | 'quote';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  duration: string;
  location?: string;
  category: 'work' | 'personal' | 'meeting' | 'urgent';
}

export interface FormQuestion {
  id: string;
  type: 'choice' | 'text' | 'rating' | 'date';
  title: string;
  required: boolean;
  options?: string[];
}

export interface FormSubmission {
  id: string;
  submittedAt: string;
  answers: Record<string, any>;
}

export interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'generic';
  size: string;
  updatedAt: string;
  parentId: string | null;
  content?: string;
}

export interface PrintJob {
  id: string;
  title: string;
  sourceApp?: AppId | string;
  pages: number;
  copies: number;
  colorMode: 'color' | 'monochrome';
  paperSize: string;
  timestamp: string;
  status: 'completed' | 'printing' | 'queued';
  contentPreview?: string;
}

// ----------------------------------------------------
// QAYD POS Interfaces
// ----------------------------------------------------
export interface QaydProduct {
  id: string;
  barcode: string;
  nameAr: string;
  nameEn: string;
  category: 'beverages' | 'food' | 'retail' | 'electronics' | 'services';
  categoryAr: string;
  price: number; // Base price
  taxRate: number; // 0.15 (15% VAT)
  cost: number;
  stock: number;
  sku: string;
  image?: string;
}

export interface QaydCartItem {
  product: QaydProduct;
  quantity: number;
  discount: number;
}

export interface QaydInvoice {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  items: {
    productId: string;
    name: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
    vat: number;
    total: number;
  }[];
  subtotal: number;
  vatAmount: number;
  discount: number;
  total: number;
  paymentMethod: 'mada' | 'cash' | 'visa' | 'split';
  cashierName: string;
  branchName: string;
  timestamp: string;
  zatcaQrReady: boolean;
}

// ----------------------------------------------------
// QAYD Accounting Interfaces
// ----------------------------------------------------
export interface QaydAccountNode {
  code: string;
  nameAr: string;
  nameEn: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency?: string;
  level: number;
  children?: QaydAccountNode[];
}

export interface QaydJournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  descriptionAr: string;
  descriptionEn: string;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
  amount: number;
  reference?: string;
  status: 'posted' | 'draft';
}

// ----------------------------------------------------
// SNNS Education Interfaces
// ----------------------------------------------------
export interface EducationCourse {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  instructorAr: string;
  departmentAr: string;
  credits: number;
  enrolledStudents: number;
  progressPercentage: number;
  coverImage: string;
  nextLectureTime?: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface EducationAssignment {
  id: string;
  courseId: string;
  courseTitle: string;
  titleAr: string;
  titleEn: string;
  dueDate: string;
  maxScore: number;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

// ----------------------------------------------------
// Multi-Tenant & RBAC & App Registry
// ----------------------------------------------------
export interface TenantCompany {
  id: string;
  nameAr: string;
  nameEn: string;
  commercialRegistration: string;
  vatNumber: string;
  industryAr: string;
  logoInitials: string;
  logoColor: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  branchesCount: number;
  activeBranch: string;
}

export type UserRoleType =
  | 'owner' // Full access
  | 'finance_manager' // Accounting + Reports + Business
  | 'cashier' // QAYD POS only, no Accounting ledger
  | 'employee' // Office suite + Chat + Mail
  | 'student' // Education + Docs + Cloud
  | 'admin';

export interface AppRegistryItem {
  id: AppId;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  category: 'pos_finance' | 'communications' | 'productivity' | 'business' | 'ai_education' | 'utility';
  badge?: string;
  badgeColor?: string;
  iconName: string;
  pwaPath: string;
  manifestUrl: string;
  standaloneInstallable: boolean;
  requiredRole?: UserRoleType[];
  status: 'active' | 'ready_for_connection' | 'in_development';
  order: number;
}

