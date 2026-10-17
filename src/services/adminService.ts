import {
  SupervisorAccount,
  SupervisorPermissions,
  GovEntity,
  ManagedSiteApp,
  ReviewQueueItem,
  AuditLogEntry,
  AdminAuthVerification,
} from '../types/admin';

const ADMIN_STORAGE_TOKEN = 'snns_admin_session_token';
const ADMIN_STORAGE_EMAIL = 'snns_admin_session_email';

class AdminService {
  private currentSupervisor: SupervisorAccount | null = null;
  private isVerified: boolean = false;
  private permissions: SupervisorPermissions = {
    canManageApps: false,
    canManageGovDirectory: false,
    canReviewQueue: false,
    canManageSupervisors: false,
    canCustomizeAppearance: false,
  };

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(ADMIN_STORAGE_TOKEN) || '';
    const email = localStorage.getItem(ADMIN_STORAGE_EMAIL) || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['x-admin-passcode'] = token;
    if (email) headers['x-admin-email'] = email;
    return headers;
  }

  public async verifyAdminStatus(): Promise<AdminAuthVerification> {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.isVerified = Boolean(data.isVerifiedAdmin);
        this.currentSupervisor = data.supervisor || null;
        this.permissions = data.permissions || {
          canManageApps: false,
          canManageGovDirectory: false,
          canReviewQueue: false,
          canManageSupervisors: false,
          canCustomizeAppearance: false,
        };
        this.notifyAuthChange();
        return data;
      }
    } catch (err) {
      console.warn('Admin verification check:', err);
    }

    // Default unverified
    this.isVerified = false;
    this.currentSupervisor = null;
    return {
      isAuthenticated: false,
      isVerifiedAdmin: false,
      supervisor: null,
      permissions: this.permissions,
    };
  }

  public async loginAdmin(passcode: string, email?: string): Promise<{ success: boolean; error?: string; supervisor?: SupervisorAccount }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل التحقق من الصلاحيات الإدارية على الخادم' };
      }

      localStorage.setItem(ADMIN_STORAGE_TOKEN, passcode);
      if (email || data.supervisor?.email) {
        localStorage.setItem(ADMIN_STORAGE_EMAIL, email || data.supervisor.email);
      }

      this.isVerified = true;
      this.currentSupervisor = data.supervisor;
      this.permissions = data.permissions;
      this.notifyAuthChange();

      return { success: true, supervisor: data.supervisor };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال بالخادم للتحقق من الصلاحية' };
    }
  }

  public logoutAdmin() {
    localStorage.removeItem(ADMIN_STORAGE_TOKEN);
    localStorage.removeItem(ADMIN_STORAGE_EMAIL);
    this.isVerified = false;
    this.currentSupervisor = null;
    this.permissions = {
      canManageApps: false,
      canManageGovDirectory: false,
      canReviewQueue: false,
      canManageSupervisors: false,
      canCustomizeAppearance: false,
    };
    this.notifyAuthChange();
  }

  public isVerifiedAdmin(): boolean {
    return this.isVerified;
  }

  public getSupervisor(): SupervisorAccount | null {
    return this.currentSupervisor;
  }

  public getPermissions(): SupervisorPermissions {
    return this.permissions;
  }

  public hasPermission(perm: keyof SupervisorPermissions): boolean {
    if (!this.isVerified) return false;
    if (this.currentSupervisor?.role === 'super_admin') return true;
    return Boolean(this.permissions[perm]);
  }

  private notifyAuthChange() {
    try {
      window.dispatchEvent(
        new CustomEvent('snns_admin_auth_changed', {
          detail: {
            isVerifiedAdmin: this.isVerified,
            supervisor: this.currentSupervisor,
            permissions: this.permissions,
          },
        })
      );
    } catch {
      // ignore
    }
  }

  // --- GOV DIRECTORY API ---
  public async getGovDirectory(): Promise<GovEntity[]> {
    try {
      const res = await fetch('/api/admin/gov-directory');
      if (res.ok) {
        const data = await res.json();
        return data.entities || [];
      }
    } catch (err) {
      console.warn('Error fetching gov directory:', err);
    }
    return [];
  }

  public async upsertGovEntity(entity: Partial<GovEntity>): Promise<{ success: boolean; error?: string; entities?: GovEntity[] }> {
    try {
      const res = await fetch('/api/admin/gov-directory/upsert', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(entity),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, entities: data.entities };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async updateGovEntityStatus(id: string, status: 'approved' | 'pending_review' | 'rejected'): Promise<{ success: boolean; error?: string; entities?: GovEntity[] }> {
    try {
      const res = await fetch('/api/admin/gov-directory/status', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, entities: data.entities };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // --- APPS & SITES MANAGEMENT API ---
  public async getManagedApps(): Promise<ManagedSiteApp[]> {
    try {
      const res = await fetch('/api/admin/apps');
      if (res.ok) {
        const data = await res.json();
        return data.apps || [];
      }
    } catch (err) {
      console.warn('Error fetching managed apps:', err);
    }
    return [];
  }

  public async upsertManagedApp(app: Partial<ManagedSiteApp>): Promise<{ success: boolean; error?: string; apps?: ManagedSiteApp[] }> {
    try {
      const res = await fetch('/api/admin/apps/upsert', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(app),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, apps: data.apps };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async updateAppStatus(id: string, status: 'published' | 'hidden' | 'archived' | 'pending_review'): Promise<{ success: boolean; error?: string; apps?: ManagedSiteApp[] }> {
    try {
      const res = await fetch('/api/admin/apps/status', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, apps: data.apps };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // --- REVIEW QUEUE & AUDIT LOG API ---
  public async getReviewQueue(): Promise<{ queue: ReviewQueueItem[]; auditLogs: AuditLogEntry[] }> {
    try {
      const res = await fetch('/api/admin/review-queue', {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return { queue: data.queue || [], auditLogs: data.auditLogs || [] };
      }
    } catch (err) {
      console.warn('Error fetching review queue:', err);
    }
    return { queue: [], auditLogs: [] };
  }

  public async resolveReviewItem(id: string, status: 'approved' | 'rejected', reviewNotes?: string): Promise<{ success: boolean; error?: string; queue?: ReviewQueueItem[]; auditLogs?: AuditLogEntry[] }> {
    try {
      const res = await fetch('/api/admin/review-queue/resolve', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id, status, reviewNotes }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, queue: data.queue, auditLogs: data.auditLogs };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        return data.logs || [];
      }
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    }
    return [];
  }

  // --- SUPERVISORS & RBAC API ---
  public async getSupervisors(): Promise<SupervisorAccount[]> {
    try {
      const res = await fetch('/api/admin/supervisors', {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.supervisors || [];
      }
    } catch (err) {
      console.warn('Error fetching supervisors:', err);
    }
    return [];
  }

  public async updateSupervisorPermissions(
    supervisorId: string,
    permissions: Partial<SupervisorPermissions>,
    status?: 'active' | 'suspended'
  ): Promise<{ success: boolean; error?: string; supervisors?: SupervisorAccount[] }> {
    try {
      const res = await fetch('/api/admin/supervisors/update-permissions', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ supervisorId, permissions, status }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, supervisors: data.supervisors };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async addSupervisor(payload: {
    name: string;
    email: string;
    roleAr?: string;
    departmentAr?: string;
    permissions: Partial<SupervisorPermissions>;
  }): Promise<{ success: boolean; error?: string; supervisors?: SupervisorAccount[] }> {
    try {
      const res = await fetch('/api/admin/supervisors/add', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, supervisors: data.supervisors };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const adminService = new AdminService();
