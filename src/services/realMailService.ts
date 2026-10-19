import { auth } from '../firebase/config';
import { storage } from './storage';

export interface VpsMailStatus {
  connected: boolean;
  statusCode: number;
  statusText: string;
  error?: string;
  details?: string;
  domain: string;
  userEmail: string;
  isAuthenticated: boolean;
  serverType?: string;
  mailboxStats?: {
    totalMessages?: number;
    unreadCount?: number;
    quotaUsed?: string;
  };
}

export interface VpsMailMessage {
  id: string;
  sender: string;
  senderName?: string;
  recipient: string;
  subject: string;
  body: string;
  date: string;
  folder?: string;
  isUnread?: boolean;
  attachments?: Array<{ name: string; size: number; url?: string }>;
}

class RealMailService {
  /**
   * Get current authenticated user's @snns.pro email
   * Identity is locked to @snns.pro without requesting Gmail
   */
  getUserSnnsEmail(): string {
    const profile = storage.getUserProfile();
    const raw = (profile.email || profile.username || 'user').toLowerCase().trim();
    if (raw.endsWith('@snns.pro')) {
      return raw;
    }
    const username = raw.split('@')[0].replace(/[^a-z0-9._-]/g, '') || 'user';
    return `${username}@snns.pro`;
  }

  /**
   * Safely retrieve the current Firebase ID Token without storing it in localStorage
   */
  async getFirebaseIdToken(): Promise<string | null> {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
    } catch (err) {
      console.warn('Could not retrieve Firebase ID token:', err);
    }
    return null;
  }

  /**
   * Check real status of Postfix/Dovecot VPS Mail API (/api/mail/status)
   */
  async checkMailStatus(): Promise<VpsMailStatus> {
    const userEmail = this.getUserSnnsEmail();
    const token = await this.getFirebaseIdToken();

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/mail/status', {
        method: 'GET',
        headers,
      });

      const statusCode = res.status;

      if (statusCode === 401) {
        return {
          connected: true, // Server is alive and correctly enforcing 401 authentication
          statusCode: 401,
          statusText: 'UNAUTHENTICATED',
          error: 'يلزم تسجيل الدخول المعتمد للوصول إلى صندوق البريد (@snns.pro)',
          details: 'الخادم الحي https://api.snns.pro يتطلب ترويسة Authorization صالحة مع رمز Firebase ID Token.',
          domain: 'snns.pro',
          userEmail,
          isAuthenticated: false,
          serverType: 'Postfix + Dovecot (VPS)',
        };
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          connected: false,
          statusCode,
          statusText: res.statusText || 'SERVER_ERROR',
          error: errorData.error || errorData.message || `خطأ استجابة من خادم البريد (${statusCode})`,
          details: errorData.details || 'فشل الاتصال مع خادم البريد الفعلي.',
          domain: 'snns.pro',
          userEmail,
          isAuthenticated: Boolean(token),
          serverType: 'Postfix + Dovecot (VPS)',
        };
      }

      const data = await res.json().catch(() => ({}));

      return {
        connected: true,
        statusCode: 200,
        statusText: 'ONLINE_ACTIVE',
        domain: 'snns.pro',
        userEmail: data.email || userEmail,
        isAuthenticated: true,
        serverType: data.serverType || 'Postfix + Dovecot (VPS)',
        mailboxStats: data.stats || {
          totalMessages: data.total || 0,
          unreadCount: data.unread || 0,
          quotaUsed: data.quota || '0 MB',
        },
      };
    } catch (err: any) {
      return {
        connected: false,
        statusCode: 0,
        statusText: 'NETWORK_ERROR',
        error: 'تعذر الوصول إلى مسار /api/mail/status عبر خادم الويب',
        details: err?.message || String(err),
        domain: 'snns.pro',
        userEmail,
        isAuthenticated: Boolean(token),
        serverType: 'Postfix + Dovecot (VPS)',
      };
    }
  }

  /**
   * Fetch authenticated real messages for current user from VPS Mail API
   */
  async fetchMessages(): Promise<{ success: boolean; messages: VpsMailMessage[]; error?: string; statusCode?: number }> {
    const token = await this.getFirebaseIdToken();

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/mail/messages', {
        method: 'GET',
        headers,
      });

      if (res.status === 401) {
        return {
          success: false,
          statusCode: 401,
          messages: [],
          error: 'رمز التحقق مفقود أو منتهي الصلاحية (401 UNAUTHENTICATED). يرجى تسجيل الدخول بحساب موثق.',
        };
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          statusCode: res.status,
          messages: [],
          error: err.error || err.message || `فشل جلب الرسائل من الخادم (${res.status})`,
        };
      }

      const data = await res.json();
      return {
        success: true,
        statusCode: 200,
        messages: Array.isArray(data) ? data : data.messages || [],
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: 0,
        messages: [],
        error: `خطأ اتصال: ${err?.message || 'تعذر الاتصال بخادم البريد'}`,
      };
    }
  }

  /**
   * Send mail via Postfix VPS API with authenticated Token
   */
  async sendMail(payload: {
    recipient: string;
    subject: string;
    body: string;
  }): Promise<{ success: boolean; message?: string; error?: string; data?: any }> {
    const token = await this.getFirebaseIdToken();
    const userEmail = this.getUserSnnsEmail();

    if (!payload.recipient || !payload.subject) {
      return { success: false, error: 'المستقبل وعنوان الرسالة حقول مطلوبة.' };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/mail/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipient: payload.recipient.trim().toLowerCase(),
          subject: payload.subject.trim(),
          body: payload.body,
          senderEmail: userEmail,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        return {
          success: false,
          error: 'فشل الإرسال: غير مصرح (401). يجب توثيق الجلسة برمز دخول صالح من المنظومة.',
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.error || data.message || `فشل إرسال البريد عبر الخادم (${res.status})`,
        };
      }

      return {
        success: true,
        message: data.message || 'تم إرسال الرسالة بنجاح عبر خادم البريد المعتمد.',
        data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `خطأ اتصال أثناء الإرسال: ${err?.message || 'الخادم غير مستجيب'}`,
      };
    }
  }
}

export const realMailService = new RealMailService();
