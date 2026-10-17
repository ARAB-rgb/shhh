import React, { useState } from 'react';
import {
  Database,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Tag,
  Sparkles,
  Layers,
  ArrowUpDown,
  X,
  Save,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { IndexedSite } from '../types';
import { updateSiteInIndex, deleteSiteFromIndex, addSiteToIndex } from '../firebase/firestore';

interface CmsDashboardProps {
  sites: IndexedSite[];
  isArabic: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const CmsDashboard: React.FC<CmsDashboardProps> = ({
  sites,
  isArabic,
  onClose,
  onRefreshData,
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'clicks' | 'newest' | 'title'>('clicks');

  // Modal states
  const [editingSite, setEditingSite] = useState<IndexedSite | null>(null);
  const [deletingSite, setDeletingSite] = useState<IndexedSite | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State for Add / Edit
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<string>('tech');
  const [formTags, setFormTags] = useState('');
  const [formFavicon, setFormFavicon] = useState('');
  const [formIsVerified, setFormIsVerified] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-dismiss alert
  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Open Edit Modal
  const handleOpenEdit = (site: IndexedSite) => {
    setEditingSite(site);
    setFormUrl(site.url);
    setFormTitle(site.title);
    setFormDescription(site.description);
    setFormCategory(site.category);
    setFormTags(site.tags || '');
    setFormFavicon(site.favicon || '');
    setFormIsVerified(site.isVerified ?? true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSite(null);
    setFormUrl('');
    setFormTitle('');
    setFormDescription('');
    setFormCategory('tech');
    setFormTags('');
    setFormFavicon('');
    setFormIsVerified(true);
    setIsAddOpen(true);
  };

  // Auto Crawl website info
  const handleAutoCrawl = async () => {
    let cleanUrl = formUrl.trim();
    if (!cleanUrl) {
      showFeedback('error', isArabic ? 'يرجى إدخال الرابط أولاً' : 'Please enter URL first');
      return;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
      setFormUrl(cleanUrl);
    }

    setIsCrawling(true);
    try {
      const res = await fetch('/api/crawl-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      if (data) {
        if (data.title) setFormTitle(data.title);
        if (data.description) setFormDescription(data.description);
        if (data.category) setFormCategory(data.category);
        if (data.favicon) setFormFavicon(data.favicon);
        if (data.domain) {
          setFormTags((prev) => prev || `${data.domain}, ${data.category || 'web'}`);
        }
        showFeedback('success', isArabic ? 'تم جلب بيانات الموقع بنجاح' : 'Metadata fetched successfully');
      }
    } catch {
      showFeedback('error', isArabic ? 'تعذر جلب البيانات تلقائياً، يمكنك إدخالها يدوياً' : 'Could not auto-fetch metadata');
    } finally {
      setIsCrawling(false);
    }
  };

  // Submit Save (Add or Update)
  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = formUrl.trim();
    if (!cleanUrl) {
      showFeedback('error', isArabic ? 'الرابط مطلوب' : 'URL is required');
      return;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    if (!formTitle.trim()) {
      showFeedback('error', isArabic ? 'عنوان الموقع مطلوب' : 'Title is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSite) {
        // UPDATE existing
        await updateSiteInIndex(editingSite.id, {
          url: cleanUrl,
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          tags: formTags.trim(),
          favicon: formFavicon || `https://www.google.com/s2/favicons?domain=${new URL(cleanUrl).hostname}&sz=128`,
          isVerified: formIsVerified,
        });
        showFeedback('success', isArabic ? `تم تحديث "${formTitle}" بنجاح!` : `Updated "${formTitle}" successfully!`);
        setEditingSite(null);
      } else {
        // CREATE new
        await addSiteToIndex({
          url: cleanUrl,
          title: formTitle.trim(),
          description: formDescription.trim() || (isArabic ? 'موقع مضاف عبر CMS' : 'Site added via CMS'),
          category: formCategory,
          tags: formTags.trim(),
          favicon: formFavicon || `https://www.google.com/s2/favicons?domain=${new URL(cleanUrl).hostname}&sz=128`,
        });
        showFeedback('success', isArabic ? 'تم إضافة وفهرسة الرابط الجديد بنجاح!' : 'New link indexed successfully!');
        setIsAddOpen(false);
      }
    } catch (err) {
      console.error('CMS save error:', err);
      showFeedback('error', isArabic ? 'فشل حفظ التعديلات في قاعدة البيانات السحابية' : 'Failed to save to cloud database');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingSite) return;
    setIsSaving(true);
    try {
      await deleteSiteFromIndex(deletingSite.id);
      showFeedback('success', isArabic ? `تم حذف "${deletingSite.title}" من الفهرس السحابي!` : `Deleted "${deletingSite.title}"!`);
      setDeletingSite(null);
    } catch (err) {
      console.error('Delete error:', err);
      showFeedback('error', isArabic ? 'فشل حذف الموقع من قاعدة البيانات السحابية' : 'Failed to delete site from database');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick toggle verification
  const handleToggleVerify = async (site: IndexedSite) => {
    try {
      await updateSiteInIndex(site.id, {
        isVerified: !site.isVerified,
      });
      showFeedback(
        'success',
        isArabic
          ? `تم تحديث حالة التوثيق لـ "${site.title}"`
          : `Updated verification for "${site.title}"`
      );
    } catch (err) {
      console.error(err);
      showFeedback('error', isArabic ? 'تعذر تحديث الحالة' : 'Failed to update verification');
    }
  };

  // Filtered and sorted sites
  const filteredSites = sites
    .filter((site) => {
      const matchCat = selectedCategory === 'all' || site.category === selectedCategory;
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        site.title.toLowerCase().includes(lowerSearch) ||
        site.description.toLowerCase().includes(lowerSearch) ||
        (site.tags && site.tags.toLowerCase().includes(lowerSearch)) ||
        site.url.toLowerCase().includes(lowerSearch);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return a.title.localeCompare(b.title);
    });

  // Stats calculation
  const totalClicks = sites.reduce((acc, s) => acc + (s.clicks || 0), 0);
  const totalVerified = sites.filter((s) => s.isVerified).length;
  const categoriesCount = new Set(sites.map((s) => s.category)).size;

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Toast Alert */}
      {feedbackMsg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl border flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-4 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
              : 'bg-red-600 text-white border-red-700 shadow-red-500/20'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-zinc-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/80 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <Database className="w-3.5 h-3.5" />
              <span>{isArabic ? 'نظام إدارة المحتوى السحابي (CMS)' : 'Cloud Content Management System'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              {isArabic ? 'لوحة إدارة وفهرسة روابط SNNS.PRO' : 'SNNS.PRO Content & Index Manager'}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isArabic
                ? 'تحكم كامل في قاعدة البيانات السحابية: إضافة مواقع جديدة، تعديل العناوين والأوصاف، تغيير التصنيفات، وتحديث أو حذف الروابط في الوقت الفعلي.'
                : 'Complete control over cloud index: Add new sites, update titles/descriptions, re-categorize, and delete links in real-time.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'إضافة رابط جديد' : 'Add New Link'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title={isArabic ? 'العودة لمحرك البحث' : 'Back to Search Engine'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 block mb-1">
              {isArabic ? 'إجمالي الروابط' : 'Total Sites'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{sites.length}</span>
          </div>

          <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 block mb-1">
              {isArabic ? 'الزيارات والتفاعل' : 'Total Clicks'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {totalClicks.toLocaleString()}
            </span>
          </div>

          <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 block mb-1">
              {isArabic ? 'الروابط الموثقة' : 'Verified Links'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              {totalVerified}
            </span>
          </div>

          <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 block mb-1">
              {isArabic ? 'التصنيفات المفعلة' : 'Active Categories'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">{categoriesCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 right-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isArabic ? 'بحث في روابط CMS بالاسم، الرابط، أو الوصف...' : 'Search CMS by title, URL or tags...'}
            className="w-full pr-10 pl-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">{isArabic ? 'كل التصنيفات' : 'All Categories'}</option>
            <option value="tech">{isArabic ? '💻 تقنية وبرمجة' : '💻 Tech'}</option>
            <option value="news">{isArabic ? '📰 أخبار وإعلام' : '📰 News'}</option>
            <option value="tools">{isArabic ? '🛠️ أدوات وخدمات' : '🛠️ Tools'}</option>
            <option value="education">{isArabic ? '🎓 تعليم وأبحاث' : '🎓 Education'}</option>
            <option value="media">{isArabic ? '🎬 وسائط وتصميم' : '🎬 Media'}</option>
            <option value="general">{isArabic ? '🌐 عام ومنوع' : '🌐 General'}</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="clicks">{isArabic ? 'الأعلى نقراً' : 'Most Clicks'}</option>
            <option value="newest">{isArabic ? 'الأحدث إضافة' : 'Newest'}</option>
            <option value="title">{isArabic ? 'الاسم أبجدياً' : 'Title (A-Z)'}</option>
          </select>
        </div>
      </div>

      {/* Links Table / Card List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-right">{isArabic ? 'الموقع والمعلومات' : 'Site Info'}</th>
                <th className="py-3.5 px-3 text-center">{isArabic ? 'التصنيف' : 'Category'}</th>
                <th className="py-3.5 px-3 text-center">{isArabic ? 'الزيارات' : 'Clicks'}</th>
                <th className="py-3.5 px-3 text-center">{isArabic ? 'التوثيق' : 'Status'}</th>
                <th className="py-3.5 px-4 text-left">{isArabic ? 'إجراءات التحكم' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredSites.map((site) => {
                let domain = '';
                try {
                  domain = new URL(site.url).hostname.replace(/^www\./, '');
                } catch {
                  domain = site.url;
                }

                return (
                  <tr
                    key={site.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Site Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        {site.favicon ? (
                          <img
                            src={site.favicon}
                            alt=""
                            className="w-8 h-8 rounded-lg p-1 bg-zinc-100 dark:bg-zinc-800 object-contain shrink-0 mt-0.5"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                            <Globe className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-white text-sm truncate">
                              {site.title}
                            </span>
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-blue-500 transition-colors"
                              title={isArabic ? 'فتح الرابط في نافذة جديدة' : 'Open in new tab'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <span className="text-[11px] text-zinc-400 block truncate" dir="ltr">
                            {site.url}
                          </span>
                          <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-1 mt-0.5">
                            {site.description}
                          </p>
                          {site.tags && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400">
                              <Tag className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="truncate">{site.tags}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {site.category}
                      </span>
                    </td>

                    {/* Clicks */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {(site.clicks || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Verification Toggle */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVerify(site)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          site.isVerified
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                        title={isArabic ? 'انقر لتغيير حالة التوثيق' : 'Click to toggle status'}
                      >
                        {site.isVerified ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isArabic ? 'موثق' : 'Verified'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{isArabic ? 'عادي' : 'Standard'}</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-left whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(site)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title={isArabic ? 'تعديل بيانات الرابط' : 'Edit link'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'تعديل' : 'Edit'}</span>
                        </button>

                        <button
                          onClick={() => setDeletingSite(site)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                          title={isArabic ? 'حذف من الفهرس السحابي' : 'Delete site'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSites.length === 0 && (
          <div className="p-12 text-center text-zinc-400">
            <Database className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              {isArabic ? 'لا توجد مواقع مطابقة للبحث' : 'No matching sites found'}
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              {isArabic ? 'جرب البحث بكلمة مختلفة أو قم بإضافة موقع جديد الآن.' : 'Try different keywords or index a new website.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إضافة موقع جديد' : 'Add New Site'}</span>
            </button>
          </div>
        )}
      </div>

      {/* EDIT / ADD MODAL */}
      {(editingSite || isAddOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden transition-all"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  {editingSite ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {editingSite
                      ? isArabic
                        ? 'تعديل بيانات الرابط في CMS'
                        : 'Edit Indexed Site'
                      : isArabic
                      ? 'إضافة وفهرسة رابط جديد'
                      : 'Index New Site'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {isArabic
                      ? 'التعديلات تُحفظ فوراً في قاعدة بيانات Firestore السحابية'
                      : 'Changes save instantly to Cloud Firestore'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingSite(null);
                  setIsAddOpen(false);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveSite} className="p-6 space-y-4">
              {/* URL with Crawl */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {isArabic ? 'رابط الموقع (URL)' : 'Site URL'} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://example.com"
                    dir="ltr"
                    className="flex-1 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAutoCrawl}
                    disabled={isCrawling || !formUrl.trim()}
                    className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isCrawling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>{isArabic ? 'جلب ذكي' : 'Auto-Fetch'}</span>
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
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={isArabic ? 'مثال: منصة حسوب للتقنية' : 'e.g. GitHub: Let’s build from here'}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {isArabic ? 'وصف الموقع ومحتواه' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'نبذة شاملة عن محتوى الموقع واستخداماته وفوائده للباحثين...'
                      : 'Detailed summary of the website content...'
                  }
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Category & Tags Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {isArabic ? 'التصنيف في CMS' : 'Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="tech">{isArabic ? '💻 تقنية وبرمجة' : '💻 Tech & Software'}</option>
                    <option value="news">{isArabic ? '📰 أخبار وإعلام' : '📰 News & Media'}</option>
                    <option value="tools">{isArabic ? '🛠️ أدوات وخدمات' : '🛠️ Tools & Utilities'}</option>
                    <option value="education">{isArabic ? '🎓 تعليم وأبحاث' : '🎓 Education & Research'}</option>
                    <option value="media">{isArabic ? '🎬 وسائط وتصميم' : '🎬 Media & Design'}</option>
                    <option value="general">{isArabic ? '🌐 عام ومنوع' : '🌐 General'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {isArabic ? 'الوسوم والكلمات المفتاحية' : 'Tags & Keywords'}
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder={isArabic ? 'برمجة, ذكاء اصطناعي, كود' : 'coding, ai, python'}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Verified & Favicon Row */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formIsVerified}
                    onChange={(e) => setFormIsVerified(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{isArabic ? 'اعتماد الموقع كموثق في نتائج البحث' : 'Mark as Verified in Results'}</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSite(null);
                    setIsAddOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formUrl.trim() || !formTitle.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isArabic ? 'جاري الحفظ سحابياً...' : 'Saving to Cloud...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingSite ? (isArabic ? 'حفظ التعديلات' : 'Save Changes') : (isArabic ? 'إضافة وفهرسة' : 'Add to Index')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-right transition-all"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-white text-center mb-1">
              {isArabic ? 'تأكيد حذف الموقع من قاعدة البيانات' : 'Confirm Site Deletion'}
            </h3>
            <p className="text-xs text-zinc-500 text-center mb-4 leading-relaxed">
              {isArabic
                ? `هل أنت متأكد من رغبتك في حذف "${deletingSite.title}" نهائياً من الفهرس السحابي لمحرك SNNS.PRO؟ لن يظهر في نتائج البحث بعد الحذف.`
                : `Are you sure you want to permanently delete "${deletingSite.title}" from the SNNS.PRO cloud index?`}
            </p>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 mb-5 text-xs text-zinc-700 dark:text-zinc-300 truncate" dir="ltr">
              {deletingSite.url}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingSite(null)}
                className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl text-xs transition-colors"
              >
                {isArabic ? 'تراجع' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isArabic ? 'نعم، احذف الموقع' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
