export interface VerifiedLink {
  id: string;
  title: string;          // اسم الخدمة (مثال: منصة ناجز)
  url: string;            // الرابط الرسمي الفعلي (https://najiz.sa)
  description: string;    // وصف مختصر للخدمة
  category: string;       // التصنيف (مثال: دوائر حكومية / وزارة العدل)
  subCategory?: string;   // تصنيف فرعي (مثل: خدمات قضائية)
  keywords: string[];     // الكلمات المفتاحية للبحث (ناجز, عدل, صكوك, وكالات)
  addedBy: string;        // اسم/بريد المشرف الذي أضاف الرابط (Super Admin)
  isVerified: boolean;    // حالة الاعتماد (True)
  createdDate: string;
}

export interface DirectorySearchResult {
  success: boolean;
  found?: boolean;
  query: string;
  results: VerifiedLink[];
  totalCount?: number;
  message?: string;
}
