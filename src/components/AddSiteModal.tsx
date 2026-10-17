import React, { useState } from 'react';
import { X, Globe, Sparkles, CheckCircle2, AlertCircle, Loader2, Plus, ExternalLink } from 'lucide-react';
import { addSiteToIndex, IndexedSite } from '../firebase/firestore';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteAdded: (newSite: IndexedSite) => void;
  isArabic: boolean;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  isOpen,
  onClose,
  onSiteAdded,
  isArabic,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'tech' | 'news' | 'tools' | 'education' | 'media' | 'general'>('tech');
  const [tags, setTags] = useState('');
  const [favicon, setFavicon] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFetchMeta = async () => {
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError(isArabic ? 'يرجى كتابة رابط صحيح' : 'Please enter a valid URL');
      return;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
      setUrl(cleanUrl);
    }

    setIsCrawling(true);
    setError(null);

    try {
      const res = await fetch('/api/crawl-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      if (data) {
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.favicon) setFavicon(data.favicon);
        if (!tags && data.domain) {
          setTags(`${data.domain}, ${data.category || 'web'}`);
        }
      }
    } catch (err) {
      console.warn('Crawl error:', err);
      // Fallback
      try {
        const domain = new URL(cleanUrl).hostname;
        setTitle(domain);
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      } catch {
        // ignore
      }
    } finally {
      setIsCrawling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError(isArabic ? 'الرابط مطلوب' : 'URL is required');
      return;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (!title.trim()) {
      setError(isArabic ? 'عنوان الموقع مطلوب' : 'Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newSite = await addSiteToIndex({
        url: cleanUrl,
        title: title.trim(),
        description: description.trim() || (isArabic ? 'موقع مفهرس حديثاً' : 'Newly indexed website'),
        category,
        tags: tags.trim(),
        favicon: favicon || `https://www.google.com/s2/favicons?domain=${new URL(cleanUrl).hostname}&sz=128`,
      });

      setSuccess(true);
      onSiteAdded(newSite);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setUrl('');
        setTitle('');
        setDescription('');
        setTags('');
      }, 1500);
    } catch (err) {
      console.error('Add site error:', err);
      setError(isArabic ? 'فشل حفظ الموقع في قاعدة البيانات السحابية' : 'Failed to save to cloud database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden transition-all ${
          isArabic ? 'text-right' : 'text-left'
        }`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-100 dark:border-emerald-950 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {isArabic ? 'إضافة وفهرسة موقع جديد' : 'Index a New Website'}
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-400">
                {isArabic
                  ? 'إضافة الرابط فوراً إلى قاعدة البيانات السحابية لمحرك SNNS.PRO'
                  : 'Instantly add website to SNNS.PRO cloud database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-emerald-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isArabic
                  ? 'تمت إضافة الموقع وفهرسته سحابياً بنجاح!'
                  : 'Site successfully indexed to cloud database!'}
              </span>
            </div>
          )}

          {/* URL Input with Auto-Crawl */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {isArabic ? 'رابط الموقع (URL)' : 'Website URL'} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleFetchMeta}
                disabled={isCrawling || !url.trim()}
                className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isCrawling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                )}
                <span>{isArabic ? 'جلب تلقائي' : 'Auto-Fetch'}</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {isArabic ? 'عنوان الموقع' : 'Site Title'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isArabic ? 'مثال: منصة حسوب للتقنية' : 'e.g. GitHub: Where the world builds software'}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {isArabic ? 'وصف موجز للموقع' : 'Site Description'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isArabic
                  ? 'اكتب نبذة مختصرة عن محتوى الموقع وفائدته لمستخدمي البحث...'
                  : 'Brief description about what this site provides...'
              }
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Category & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {isArabic ? 'التصنيف' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="tech">{isArabic ? '💻 تقنية وبرمجة' : '💻 Technology'}</option>
                <option value="news">{isArabic ? '📰 أخبار وإعلام' : '📰 News & Media'}</option>
                <option value="tools">{isArabic ? '🛠️ أدوات وخدمات' : '🛠️ Tools & Utilities'}</option>
                <option value="education">{isArabic ? '🎓 تعليم وأبحاث' : '🎓 Education & Research'}</option>
                <option value="media">{isArabic ? '🎬 وسائط وتصميم' : '🎬 Media & Design'}</option>
                <option value="general">{isArabic ? '🌐 عام ومنوع' : '🌐 General'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {isArabic ? 'كلمات مفتاحية (مفصولة بفاصلة)' : 'Tags (comma-separated)'}
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={isArabic ? 'برمجة, ذكاء اصطناعي, كود' : 'coding, ai, tools'}
                className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Search Result Preview Card */}
          {title && (
            <div className="mt-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl">
              <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
                {isArabic ? 'معاينة النتيجة في محرك SNNS.PRO:' : 'Preview in SNNS.PRO results:'}
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 truncate">
                  {favicon ? (
                    <img src={favicon} alt="icon" className="w-4 h-4 rounded-sm" />
                  ) : (
                    <Globe className="w-4 h-4 text-zinc-400" />
                  )}
                  <span className="truncate" dir="ltr">{url || 'https://example.com'}</span>
                </div>
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
                  {title}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                  {description || (isArabic ? 'وصف الموقع المفهرس في محرك SNNS.PRO...' : 'Indexed description...')}
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !url.trim() || !title.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isArabic ? 'جاري الفهرسة...' : 'Indexing...'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{isArabic ? 'حفظ وفهرسة الرابط' : 'Index & Save'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
