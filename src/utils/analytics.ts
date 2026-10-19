/**
 * SNNS.PRO - ملف الخدمات المساعدة وتحليلات النقرات والبحث
 */

import { doc, updateDoc, increment } from "firebase/firestore";
// تأكد من مسار استيراد قاعدة بيانات فايربيس حسب هيكل مشروعك الفعلي
// import { db } from "@/lib/firebase"; 

/**
 * دالة لتسجيل النقرات وزيادة العداد في قاعدة بيانات Firestore بشكل آمن
 */
export async function trackSiteClick(dbInstance: any, siteId: string) {
    try {
        if (!siteId) return;
        
        const siteRef = doc(dbInstance, "sites", siteId);
        await updateDoc(siteRef, {
            clicks: increment(1),
            updatedAt: new Date().toISOString()
        });
        
        console.log(`تم تحديث عداد النقرات بنجاح للجهة: ${siteId}`);
    } catch (error) {
        console.error("خطأ أثناء تحديث عداد النقرات:", error);
    }
}

/**
 * دالة البحث الفوري (Debounce) لتقليل عمليات إعادة التصيير والبحث المتكررة
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}