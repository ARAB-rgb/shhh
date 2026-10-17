import React from 'react';
import { Database, Shield, Zap, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  isArabic: boolean;
  indexedCount: number;
}

export const Footer: React.FC<FooterProps> = ({ isArabic, indexedCount }) => {
  return (
    <footer
      className="w-full bg-emerald-950 text-white border-t border-emerald-900 text-xs mt-auto transition-colors"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Top green strip with Saudi Emblem & Flag */}
      <div className="px-6 py-3 border-b border-emerald-900/80 flex flex-wrap items-center justify-between gap-3 bg-emerald-900/40">
        <div className="flex items-center gap-2.5">
          <img
            src="/src/assets/images/saudi_flag_1790155732774.jpg"
            alt="علم المملكة العربية السعودية"
            referrerPolicy="no-referrer"
            className="w-6 h-4 object-cover rounded shadow-xs"
          />
          <span className="font-bold text-emerald-200">
            {isArabic ? 'المملكة العربية السعودية • رؤية 2030' : 'Kingdom of Saudi Arabia • Vision 2030'}
          </span>
          <span className="text-emerald-700">•</span>
          <span className="text-emerald-300/90">
            {isArabic ? 'محرك البحث السحابي الوطني SNNS.PRO' : 'SNNS.PRO National Cloud Search Engine'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-700/60">
            <Database className="w-3.5 h-3.5 text-emerald-300" />
            <span>
              {isArabic
                ? `${indexedCount} موقع في الفهرس السحابي`
                : `${indexedCount} sites indexed in Cloud DB`}
            </span>
          </span>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-100/80">
        <div className="flex items-center gap-3">
          <span className="font-black text-white text-sm font-mono tracking-tight">SNNS.PRO</span>
          <span className="text-emerald-300">{isArabic ? 'محرك بحث متطور ومعالجة لغة طبيعية' : 'Advanced NLP Search Engine'}</span>
          <span className="hidden sm:inline text-emerald-700">•</span>
          <span className="hidden sm:inline text-emerald-300/80">{isArabic ? 'صُنع بكل فخر' : 'Crafted with Pride'}</span>
        </div>

        <div className="flex items-center gap-4 text-emerald-200">
          <span className="hover:text-white cursor-pointer transition-colors">{isArabic ? 'الخصوصية والأمان' : 'Privacy'}</span>
          <span className="hover:text-white cursor-pointer transition-colors">{isArabic ? 'الشروط' : 'Terms'}</span>
          <span className="hover:text-white cursor-pointer transition-colors">{isArabic ? 'لوحة CMS' : 'CMS'}</span>
          <span className="hover:text-white cursor-pointer transition-colors">{isArabic ? 'عن المحرك' : 'About'}</span>
        </div>
      </div>
    </footer>
  );
};
