import { VerifiedLink, DirectorySearchResult } from '../types/directory';

class DirectoryService {
  public async searchDirectory(query: string): Promise<DirectorySearchResult> {
    try {
      const res = await fetch(`/api/directory/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Directory search error:', err);
    }
    return {
      success: false,
      found: false,
      query,
      results: [],
      message: 'تعذر الاتصال بخادم الفهرس الداخلي.',
    };
  }

  public async getAllVerifiedLinks(): Promise<VerifiedLink[]> {
    try {
      const res = await fetch('/api/directory/links');
      if (res.ok) {
        const data = await res.json();
        return data.links || [];
      }
    } catch (err) {
      console.warn('Error fetching verified links:', err);
    }
    return [];
  }

  public async addVerifiedLink(
    payload: Partial<VerifiedLink>
  ): Promise<{ success: boolean; link?: VerifiedLink; error?: string }> {
    try {
      const res = await fetch('/api/directory/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, link: data.link };
      }
      return { success: false, error: data.error || 'فشل إضافة الرابط للفهرس' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال بالخادم' };
    }
  }

  public async updateVerifiedLink(
    id: string,
    payload: Partial<VerifiedLink>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/directory/links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: data.error || 'فشل تعديل الرابط' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال بالخادم' };
    }
  }

  public async deleteVerifiedLink(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/directory/links/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: data.error || 'فشل حذف الرابط' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال بالخادم' };
    }
  }

  public async requestIndexService(
    title: string,
    requestedUrl?: string,
    notes?: string,
    userEmail?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/directory/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, requestedUrl, notes, userEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          message: data.message || 'تم إرسال طلب الفهرسة للإدارة العليا بنجاح.',
        };
      }
      return { success: false, message: data.error || 'فشل إرسال الطلب' };
    } catch (err: any) {
      return { success: false, message: err.message || 'تعذر الاتصال بالخادم' };
    }
  }
}

export const directoryService = new DirectoryService();
