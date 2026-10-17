import React, { useState, useEffect } from 'react';
import { ManagedSiteApp, ManagedAppStatus } from '../../types/admin';
import { adminService } from '../../services/adminService';
import {
  Grid,
  Search,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Archive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Save,
  X,
  RefreshCw,
  Lock,
} from 'lucide-react';
import {
  DynamicIconRenderer,
  CUSTOM_ICON_MAP,
} from './DynamicIconRenderer';

interface SitesAppsSectionProps {
  lang: 'en' | 'ar';
}

export const SitesAppsSection: React.FC<SitesAppsSectionProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [apps, setApps] = useState<ManagedSiteApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<ManagedSiteApp | null>(null);

  // Form
  const [formLabelAr, setFormLabelAr] = useState('');
  const [formLabelEn, setFormLabelEn] = useState('');
  const [formAppTargetId, setFormAppTargetId] = useState('snns-ai');
  const [formIsExternal, setFormIsExternal] = useState(false);
  const [formExternalUrl, setFormExternalUrl] = useState('https://');
  const [formCategory, setFormCategory] = useState('الإنتاجية والأعمال');
  const [formBadge, setFormBadge] = useState('');
  const [formIcon, setFormIcon] = useState('sparkles');
  const [formStatus, setFormStatus] = useState<ManagedAppStatus>('published');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canManage = adminService.hasPermission('canManageApps');

  const loadData = async () => {
    setLoading(true);
    const data = await adminService.getManagedApps();
    setApps(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormLabelAr('');
    setFormLabelEn('');
    setFormAppTargetId('snns-ai');
    setFormIsExternal(false);
    setFormExternalUrl('https://');
    setFormCategory('الإنتاجية والأعمال');
    setFormBadge('');
    setFormIcon('sparkles');
    setFormStatus('published');
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingApp(null);
  };

  const handleOpenEdit = (app: ManagedSiteApp) => {
    setEditingApp(app);
    setFormLabelAr(app.labelAr);
    setFormLabelEn(app.labelEn);
    setFormAppTargetId(app.appTargetId);
    setFormIsExternal(app.isExternal);
    setFormExternalUrl(app.externalUrl || 'https://');
    setFormCategory(app.category);
    setFormBadge(app.badge || '');
    setFormIcon(app.icon);
    setFormStatus(app.status);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formLabelAr.trim() && !formLabelEn.trim()) {
      setErrorMsg(isAr ? 'الرجاء إدخال اسم التطبيق بالعربية أو الإنجليزية' : 'Name is required');
      return;
    }

    if (formIsExternal) {
      try {
        const parsed = new URL(formExternalUrl.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setErrorMsg(isAr ? 'الرابط غير آمن. يجب أن يبدأ بـ https://' : 'Unsafe URL protocol');
          return;
        }
      } catch {
        setErrorMsg(isAr ? 'صيغة الرابط غير صحيحة' : 'Invalid URL');
        return;
      }
    }

    setSubmitting(true);
    const res = await adminService.upsertManagedApp({
      id: editingApp?.id,
      labelAr: formLabelAr.trim(),
      labelEn: formLabelEn.trim() || formLabelAr.trim(),
      appTargetId: formIsExternal ? 'custom-link' : formAppTargetId,
      isExternal: formIsExternal,
      externalUrl: formIsExternal ? formExternalUrl.trim() : undefined,
      category: formCategory,
      badge: formBadge.trim() || undefined,
      icon: formIcon,
      status: formStatus,
    });
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg(isAr ? 'تم حفظ التطبيق وتحديث المنظومة بنجاح!' : 'App saved successfully!');
      if (res.apps) setApps(res.apps);
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1200);
    } else {
      setErrorMsg(res.error || (isAr ? 'فشل حفظ التطبيق' : 'Failed to save app'));
    }
  };

  const handleUpdateStatus = async (app: ManagedSiteApp, newStatus: ManagedAppStatus) => {
    if (!canManage) {
      alert(isAr ? 'ليس لديك صلاحية إدارة التطبيقات' : 'Permission denied');
      return;
    }

    const res = await adminService.updateAppStatus(app.id, newStatus);
    if (res.success && res.apps) {
      setApps(res.apps);
    } else if (res.error) {
      alert(res.error);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.labelAr.toLowerCase().includes(search.toLowerCase()) ||
      app.labelEn.toLowerCase().includes(search.toLowerCase()) ||
      app.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold mb-2">
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'إدارة المواقع والتطبيقات السحابية' : 'Apps & Sites Lifecycle Hub'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            {isAr ? 'التحكم في نشر وأرشفة وإخفاء التطبيقات' : 'Applications & Sites Governance'}
          </h2>
          <p className="text-xs md:text-sm text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? 'إدارة شاملة لجميع التطبيقات والروابط الخارجية؛ تدعم الإضافة، التعديل، الإخفاء المؤقت، النشر المعتمد، والأرشفة التامة.'
              : 'Add, edit, hide, publish, or archive internal suite apps and verified external services.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canManage ? (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة تطبيق أو موقع' : 'Add App / Site'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl text-xs text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? 'عرض فقط' : 'Read-only'}</span>
            </div>
          )}

          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث عن تطبيق أو موقع...' : 'Search apps...'}
            className="w-full ps-9 pe-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['all', 'published', 'hidden', 'archived', 'pending_review'].map((st) => {
            const labels: Record<string, { ar: string; en: string }> = {
              all: { ar: 'الكل', en: 'All' },
              published: { ar: 'منشور', en: 'Published' },
              hidden: { ar: 'مخفي', en: 'Hidden' },
              archived: { ar: 'مؤرشف', en: 'Archived' },
              pending_review: { ar: 'قيد المراجعة', en: 'Pending' },
            };
            const count = st === 'all' ? apps.length : apps.filter((a) => a.status === st).length;
            const active = statusFilter === st;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {isAr ? labels[st].ar : labels[st].en} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs">{isAr ? 'جاري تحميل قائمة التطبيقات...' : 'Loading apps...'}</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-gray-500">
          <Grid className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="font-bold text-sm">{isAr ? 'لا توجد تطبيقات مطابقة' : 'No apps found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const isPublished = app.status === 'published';
            const isHidden = app.status === 'hidden';
            const isArchived = app.status === 'archived';
            const isPending = app.status === 'pending_review';

            return (
              <div
                key={app.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition flex flex-col justify-between ${
                  isArchived
                    ? 'opacity-60 bg-gray-50 border-gray-200'
                    : isHidden
                    ? 'border-dashed border-amber-300'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <DynamicIconRenderer
                        tile={{
                          id: app.id,
                          appTargetId: 'custom-link',
                          labelAr: app.labelAr,
                          labelEn: app.labelEn,
                          customIcon: app.icon,
                          shape: 'squircle',
                          colorScheme: 'default',
                          visible: !isHidden,
                          order: 0,
                        }}
                        size={28}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isPublished && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{isAr ? 'منشور' : 'Published'}</span>
                        </span>
                      )}
                      {isHidden && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>{isAr ? 'مخفي' : 'Hidden'}</span>
                        </span>
                      )}
                      {isArchived && (
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-300 flex items-center gap-1">
                          <Archive className="w-3 h-3" />
                          <span>{isAr ? 'مؤرشف' : 'Archived'}</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span>{isAr ? 'قيد المراجعة' : 'Pending'}</span>
                        </span>
                      )}

                      {app.badge && (
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {app.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-black text-gray-950 text-sm">{isAr ? app.labelAr : app.labelEn}</h3>
                  <div className="text-[11px] text-gray-400 font-mono">{app.labelEn}</div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {app.category}
                    </span>
                    {app.isExternal && (
                      <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>{isAr ? 'رابط خارجي' : 'External'}</span>
                      </span>
                    )}
                  </div>

                  {app.externalUrl && (
                    <div className="text-[10px] font-mono text-gray-500 mt-2 truncate bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                      {app.externalUrl}
                    </div>
                  )}
                </div>

                {/* Status Toggles & Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {isAr ? 'بواسطة:' : 'By:'} {app.submittedBy}
                  </span>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(app)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition cursor-pointer"
                        title={isAr ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isPublished ? (
                        <button
                          onClick={() => handleUpdateStatus(app, 'hidden')}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold border border-amber-200 transition cursor-pointer"
                        >
                          {isAr ? 'إخفاء' : 'Hide'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(app, 'published')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200 transition cursor-pointer"
                        >
                          {isAr ? 'نشر' : 'Publish'}
                        </button>
                      )}

                      {!isArchived ? (
                        <button
                          onClick={() => handleUpdateStatus(app, 'archived')}
                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-lg transition cursor-pointer"
                          title={isAr ? 'أرشفة' : 'Archive'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(app, 'published')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold border border-blue-200 transition cursor-pointer"
                        >
                          {isAr ? 'استعادة' : 'Restore'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit App Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-black text-gray-900 text-base">
                {editingApp
                  ? isAr
                    ? 'تعديل تطبيق أو موقع'
                    : 'Edit App / Site'
                  : isAr
                  ? 'إضافة تطبيق أو موقع جديد'
                  : 'Add New App / Site'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'الاسم باللغة العربية *' : 'Arabic Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formLabelAr}
                  onChange={(e) => setFormLabelAr(e.target.value)}
                  placeholder="نظام إدارة المستودعات"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'الاسم باللغة الإنجليزية' : 'English Name'}
                </label>
                <input
                  type="text"
                  value={formLabelEn}
                  onChange={(e) => setFormLabelEn(e.target.value)}
                  placeholder="Warehouse Management"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsExternal}
                    onChange={(e) => setFormIsExternal(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    {isAr ? 'رابط خارجي لخدمة أو موقع' : 'External Web Service / URL'}
                  </span>
                </label>

                {formIsExternal ? (
                  <div>
                    <input
                      type="url"
                      required
                      value={formExternalUrl}
                      onChange={(e) => setFormExternalUrl(e.target.value)}
                      placeholder="https://service.example.com"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {isAr ? 'يتم فحص الرابط ومنع المسارات غير الآمنة' : 'Strictly validated URL'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      {isAr ? 'التطبيق الداخلي المستهدف:' : 'Target Suite App:'}
                    </label>
                    <select
                      value={formAppTargetId}
                      onChange={(e) => setFormAppTargetId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="snns-ai">SNNS AI (الذكاء الاصطناعي)</option>
                      <option value="qayd-pos">QAYD POS (كاشير ونقاط بيع)</option>
                      <option value="qayd-accounting">QAYD Accounting (محاسبة)</option>
                      <option value="snns-calls">SNNS Calls (مكالمات)</option>
                      <option value="snns-chat">SNNS Chat (محادثات)</option>
                      <option value="word">SNNS Docs (مستندات)</option>
                      <option value="excel">SNNS Sheets (جداول)</option>
                      <option value="powerpoint">SNNS Presentations (عروض)</option>
                      <option value="snns-education">SNNS Education (منصة تعليمية)</option>
                      <option value="printer">SNNS Printer (طابعة واي فاي)</option>
                      <option value="clipchamp">Video Studio (فيديو وتحميل)</option>
                      <option value="marketplace">Marketplace (سوق وإعلانات)</option>
                      <option value="business">Business (دليل الشركات)</option>
                      <option value="onedrive">SNNS Cloud (سحابة)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'التصنيف' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="الإنتاجية، المالية، التقنية"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'الشارة (Badge)' : 'Badge'}
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="PRO, جديد, تجريبي"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'رمز الأيقونة' : 'Icon'}
                  </label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(CUSTOM_ICON_MAP).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'حالة النشر' : 'Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ManagedAppStatus)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="published">{isAr ? 'منشور (متاح للمستخدمين)' : 'Published'}</option>
                    <option value="hidden">{isAr ? 'مخفي مؤقتًا' : 'Hidden'}</option>
                    <option value="archived">{isAr ? 'مؤرشف' : 'Archived'}</option>
                    <option value="pending_review">{isAr ? 'قيد المراجعة والتدقيق' : 'Pending Review'}</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{submitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ وتطبيق' : 'Save App'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
