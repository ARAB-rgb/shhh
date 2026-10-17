export type SupervisorRole = 'super_admin' | 'supervisor' | 'auditor';

export interface SupervisorPermissions {
  canManageApps: boolean; // إضافة، تعديل، إخفاء، نشر، أرشفة التطبيقات والمواقع
  canManageGovDirectory: boolean; // إضافة وتعديل واعتماد الدليل الحكومي
  canReviewQueue: boolean; // اعتماد ومراجعة قائمة الانتظار للمواقع والخدمات الجديدة
  canManageSupervisors: boolean; // منح وسحب الصلاحيات وإضافة المشرفين
  canCustomizeAppearance: boolean; // تخصيص المظهر والألوان والهوية
}

export interface SupervisorAccount {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  role: SupervisorRole;
  roleAr: string;
  departmentAr: string;
  status: 'active' | 'suspended';
  permissions: SupervisorPermissions;
  lastLogin: string;
  createdAt: string;
  avatarInitials: string;
}

export type GovCategoryType =
  | 'finance_tax'
  | 'interior_security'
  | 'justice'
  | 'commerce'
  | 'municipal'
  | 'labor_social'
  | 'digital_tech'
  | 'health_education';

export type GovApprovalStatus = 'approved' | 'pending_review' | 'rejected';

export interface GovEntity {
  id: string;
  code: string; // رمز داخلي فريد مثل KSA-ZATCA-01
  nameAr: string;
  nameEn: string;
  officialUrl: string; // رابط الموقع الرسمي المعتمد
  category: GovCategoryType;
  categoryAr: string;
  categoryEn: string;
  approvalStatus: GovApprovalStatus;
  descriptionAr: string;
  descriptionEn: string;
  servicesList: string[]; // تصنيف وقائمة الخدمات الحكومية المتاحة
  verifiedBadge: boolean;
  lastAuditBy: string;
  updatedAt: string;
}

export type ManagedAppStatus = 'published' | 'hidden' | 'archived' | 'pending_review';

export interface ManagedSiteApp {
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
  status: ManagedAppStatus;
  submittedBy: string;
  approvedBy?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewQueueItem {
  id: string;
  entityType: 'site_app' | 'gov_entity' | 'feature';
  entityId: string;
  title: string;
  actionType: 'create' | 'update' | 'archive' | 'status_change';
  details: string;
  payload: any;
  submittedBy: string;
  status: ReviewStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  actorEmail: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AdminAuthVerification {
  isAuthenticated: boolean;
  isVerifiedAdmin: boolean;
  supervisor: SupervisorAccount | null;
  permissions: SupervisorPermissions;
  message?: string;
}
