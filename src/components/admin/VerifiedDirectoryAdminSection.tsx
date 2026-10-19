import React, { useState, useEffect } from 'react';
import { VerifiedLink } from '../../types/suite';
import { storage } from '../../services/storage';
import {
  Globe,
  Plus,
  ShieldCheck,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle,
  X,
  AlertCircle,
  Tag,
  Building,
} from 'lucide-react';

interface VerifiedDirectoryAdminSectionProps {
  lang: 'en' | 'ar';
}

export const VerifiedDirectoryAdminSection: React.FC<VerifiedDirectoryAdminSectionProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [links, setLinks] = useState<VerifiedLink[]>(() => storage.getVerifiedLinks());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<VerifiedLink | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('https://');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('دوائر حكومية');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setLinks(e.detail);
      else setLinks(storage.getVerifiedLinks());
    };
    window.addEventListener('snns_verified_links_updated', handleUpdate);
    return () => window.removeEventListener('snns_verified_links_updated', handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingLink(null);
    setFormTitle('');
    setFormUrl('https://');
    setFormDesc('');
    setFormCategory('دوائر حكومية');
    setFormSubCategory('');
    setFormKeywords('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (link: VerifiedLink) => {
    setEditingLink(link);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormDesc(link.description);
    setFormCategory(link.category);
    setFormSubCategory(link.subCategory || '');
    setFormKeywords(link.keywords.join(', '));
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formTitle.trim() || !formUrl.trim() || !formCategory.trim()) {
      setErrorMsg(isAr ? 'الرجاء ملء اسم الخدمة، الرابط، والتصنيف الرئيسي' : 'Please fill required fields');
      return;
    }

    try {
      const u = new URL(formUrl.trim());
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        setErrorMsg(isAr ? 'الرابط يجب أن يبدأ بـ https://' : 'URL must start with https://');
        return;
      }
    } catch {
      setErrorMsg(isAr ? 'صيغة الرابط غير صحيحة' : 'Invalid URL format');
      return;
    }

    const keywordsArray = formKeywords
      .split(/[,،]/)
      .map((k) => k.trim())
      .filter(Boolean);

    const newLink: VerifiedLink = {
      id: editingLink ? editingLink.id : `link-${Date.now()}`,
      title: formTitle.trim(),
      url: formUrl.trim(),
      description: formDesc.trim(),
      category: formCategory.trim(),
      subCategory: formSubCategory.trim() || undefined,
      keywords: keywordsArray.length > 0 ? keywordsArray : [formTitle.trim()],
      addedBy: 'a@snns.pro (Super Admin)',
      isVerified: true,
      createdDate: editingLink ? editingLink.createdDate : new Date().toISOString().split('T')[0],
    };

    storage.saveVerifiedLink(newLink);
    setLinks(storage.getVerifiedLinks());
    setSuccessMsg(isAr ? 'تم حفظ وتوثيق الرابط بنجاح في الدليل المركزي!' : 'Link saved and verified successfully!');
    setTimeout(() => {
      setShowModal(false);
    }, 1000);
  };

  const handleDelete = (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا الرابط المعتمد؟' : 'Are you sure you want to delete this verified link?')) {
      storage.deleteVerifiedLink(id);
      setLinks(storage.getVerifiedLinks());
    }
  };

  const categoriesList = ['all', 'دوائر حكومية', 'وزارات وهيئات', 'تعليم ومدارس', 'خدمات مالية', 'خدمات عامة'];

  const filteredLinks = links.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase())) ||
      (item.subCategory && item.subCategory.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-blue-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'دليل الروابط والخدمات المعتمَدة الداخلي (/sts/directory)' : 'Internal Verified Links Directory'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            {isAr ? 'فهرس البحث المغلق المعتمد من الخادم' : 'Backend Controlled Search Directory'}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? 'ضمان بحث داخلي حصري في الروابط الموثوقة والخدمات الرسمية للجهات والوزارات، مع منع أي نتائج عشوائية من الإنترنت الخارجي.'
              : 'Exclusive internal search across pre-indexed verified official links and government services.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة رابط معتمد جديد' : 'Add Verified Link'}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث في العنوان، الوصف أو الكلمات المفتاحية...' : 'Search links, keywords...'}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-2 ps-9 pe-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? (isAr ? 'جميع التصنيفات' : 'All Categories') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Verified Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLinks.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  {item.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  <span>{isAr ? 'رابط رسمي معتمد' : 'Official Verified'}</span>
                </span>
              </div>

              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                {item.title}
              </h3>
              {item.subCategory && (
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  <Building className="w-3 h-3 text-cyan-600" />
                  <span>{item.subCategory}</span>
                </p>
              )}

              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                {item.description}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-slate-800/60 p-2 rounded-xl mb-3 truncate border border-gray-100 dark:border-slate-800">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                  {item.url}
                </a>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {item.keywords.map((kw, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-gray-400">
                {item.addedBy}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-300 transition"
                  title={isAr ? 'تعديل' : 'Edit'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-rose-600 transition"
                  title={isAr ? 'حذف' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLinks.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-gray-500">
          <AlertCircle className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="font-bold text-sm">{isAr ? 'لا توجد روابط مطابقة في الفهرس' : 'No matching links found'}</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-lg w-full text-gray-800 dark:text-white border border-gray-200 dark:border-slate-800 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>{editingLink ? (isAr ? 'تعديل الرابط المعتمد' : 'Edit Verified Link') : (isAr ? 'إضافة رابط معتمد جديد' : 'Add New Verified Link')}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">{isAr ? 'اسم الخدمة أو الجهة (Title):' : 'Service Title:'}</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: منصة ناجز الرقمية"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? 'الرابط الرسمي الفعلي (URL):' : 'Official URL:'}</label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://najiz.sa"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">{isAr ? 'التصنيف الرئيسي (Category):' : 'Main Category:'}</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white"
                  >
                    <option value="دوائر حكومية">دوائر حكومية</option>
                    <option value="وزارات وهيئات">وزارات وهيئات</option>
                    <option value="تعليم ومدارس">تعليم ومدارس</option>
                    <option value="خدمات مالية">خدمات مالية</option>
                    <option value="خدمات عامة">خدمات عامة</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">{isAr ? 'التصنيف الفرعي / الجهة:' : 'Sub Category / Entity:'}</label>
                  <input
                    type="text"
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    placeholder="وزارة العدل - خدمات قضائية"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? 'الكلمات المفتاحية للبحث (مفصولة بفواصل):' : 'Keywords (comma separated):'}</label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="ناجز, عدل, صكوك, وكالات"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? 'وصف مختصر للخدمة:' : 'Description:'}</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="وصف تفصيلي للخدمات المقدمة في المنصة..."
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white h-20 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md transition"
                >
                  {isAr ? 'حفظ وتوثيق' : 'Save & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
