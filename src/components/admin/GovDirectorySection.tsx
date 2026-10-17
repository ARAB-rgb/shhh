import React, { useState, useEffect } from 'react';
import { GovEntity, GovCategoryType, GovApprovalStatus } from '../../types/admin';
import { adminService } from '../../services/adminService';
import {
  Building2,
  Search,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  RefreshCw,
  Edit2,
  Save,
  X,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface GovDirectorySectionProps {
  lang: 'en' | 'ar';
}

const CATEGORY_MAP: Record<GovCategoryType, { ar: string; en: string; color: string }> = {
  finance_tax: { ar: 'المالية والضرائب والجمارك', en: 'Finance & Tax', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  interior_security: { ar: 'الداخلية والهوية الرقمية', en: 'Interior & Security', color: 'bg-green-50 text-green-800 border-green-200' },
  justice: { ar: 'العدل والقضاء والتوثيق', en: 'Justice & Courts', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  commerce: { ar: 'التجارة والشركات والمواصفات', en: 'Commerce & Standards', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  municipal: { ar: 'البلديات والتراخيص المكانية', en: 'Municipal & Housing', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  labor_social: { ar: 'العمل والتأمينات الاجتماعية', en: 'Labor & Insurance', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  digital_tech: { ar: 'البيانات والذكاء الاصطناعي', en: 'Data & AI (SDAIA)', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  health_education: { ar: 'الصحة والتعليم والتدريب', en: 'Health & Education', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
};

export const GovDirectorySection: React.FC<GovDirectorySectionProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [entities, setEntities] = useState<GovEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<GovEntity | null>(null);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formUrl, setFormUrl] = useState('https://');
  const [formCategory, setFormCategory] = useState<GovCategoryType>('finance_tax');
  const [formDescAr, setFormDescAr] = useState('');
  const [formServices, setFormServices] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canManage = adminService.hasPermission('canManageGovDirectory');

  const loadData = async () => {
    setLoading(true);
    const data = await adminService.getGovDirectory();
    setEntities(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormCode('');
    setFormNameAr('');
    setFormNameEn('');
    setFormUrl('https://');
    setFormCategory('finance_tax');
    setFormDescAr('');
    setFormServices('');
    setActionError(null);
    setActionSuccess(null);
    setEditingEntity(null);
  };

  const handleOpenEdit = (entity: GovEntity) => {
    setEditingEntity(entity);
    setFormCode(entity.code);
    setFormNameAr(entity.nameAr);
    setFormNameEn(entity.nameEn);
    setFormUrl(entity.officialUrl);
    setFormCategory(entity.category);
    setFormDescAr(entity.descriptionAr);
    setFormServices(entity.servicesList.join('، '));
    setActionError(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!formCode.trim() || !formNameAr.trim() || !formUrl.trim()) {
      setActionError(isAr ? 'الرجاء إكمال الحقول الإلزامية: الرمز الفريد، الاسم بالعربية، والرابط الرسمي' : 'Required fields missing');
      return;
    }

    try {
      const parsedUrl = new URL(formUrl.trim());
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        setActionError(isAr ? 'الرابط غير آمن. يجب أن يبدأ بـ https://' : 'Unsafe URL protocol');
        return;
      }
    } catch {
      setActionError(isAr ? 'صيغة الرابط غير صحيحة. مثال: https://zatca.gov.sa' : 'Invalid URL syntax');
      return;
    }

    setSubmitting(true);
    const servicesArray = formServices
      .split(/[,،\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await adminService.upsertGovEntity({
      id: editingEntity?.id,
      code: formCode.trim().toUpperCase(),
      nameAr: formNameAr.trim(),
      nameEn: formNameEn.trim() || formNameAr.trim(),
      officialUrl: formUrl.trim(),
      category: formCategory,
      descriptionAr: formDescAr.trim(),
      servicesList: servicesArray,
    });

    setSubmitting(false);

    if (res.success) {
      setActionSuccess(isAr ? 'تم حفظ بيانات الجهة وتوثيقها بنجاح في الخادم!' : 'Entity saved successfully!');
      if (res.entities) setEntities(res.entities);
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } else {
      setActionError(res.error || (isAr ? 'فشل حفظ الجهة على الخادم' : 'Server error saving entity'));
    }
  };

  const handleToggleStatus = async (entity: GovEntity, newStatus: GovApprovalStatus) => {
    if (!canManage) {
      alert(isAr ? 'ليس لديك صلاحية اعتماد الدليل الحكومي' : 'Permission denied');
      return;
    }
    const res = await adminService.updateGovEntityStatus(entity.id, newStatus);
    if (res.success && res.entities) {
      setEntities(res.entities);
    } else if (res.error) {
      alert(res.error);
    }
  };

  const filteredEntities = entities.filter((item) => {
    const matchesSearch =
      item.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.servicesList.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.approvalStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Governance Assurance */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'الدليل الوطني للجهات والمنصات الحكومية المعتمدة' : 'Official Saudi Government Directory'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {isAr ? 'دليل الربط المؤسسي والجهات الحكومية' : 'Government Entities & Compliance Registry'}
            </h2>
            <p className="text-xs md:text-sm text-emerald-200/80 mt-1 max-w-2xl leading-relaxed">
              {isAr
                ? 'فهرس رسمي موحد للجهات والوزارات السعودية مع الرموز الداخلية الفريدة والروابط الآمنة المعتمدة، لضمان عدم نشر أي رابط قبل تدقيقه واعتماده من الخادم.'
                : 'Centralized registry of verified Saudi government entities with unique internal codes and verified URLs.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canManage ? (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة جهة حكومية جديدة' : 'Add Gov Entity'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl text-xs text-amber-300 border border-amber-500/30">
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض فقط (صلاحية المشرف مطلوبة للإضافة)' : 'Read-only access'}</span>
              </div>
            )}
            <button
              onClick={loadData}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-2xl text-slate-300 hover:text-white transition cursor-pointer"
              title={isAr ? 'تحديث البيانات' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث بالاسم أو الرمز الفريد أو الخدمة...' : 'Search by name, code or service...'}
            className="w-full ps-9 pe-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl text-xs px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
              {Object.entries(CATEGORY_MAP).map(([key, info]) => (
                <option key={key} value={key}>
                  {isAr ? info.ar : info.en}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl text-xs px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shrink-0"
          >
            <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="approved">{isAr ? 'معتمد وموثق' : 'Approved'}</option>
            <option value="pending_review">{isAr ? 'قيد المراجعة' : 'Pending Review'}</option>
            <option value="rejected">{isAr ? 'مرفوض' : 'Rejected'}</option>
          </select>

          <span className="text-xs text-gray-400 ps-2 shrink-0">
            {isAr ? `${filteredEntities.length} جهة مسجلة` : `${filteredEntities.length} entities`}
          </span>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          <p className="text-xs">{isAr ? 'جاري تحميل الدليل الحكومي من الخادم...' : 'Loading directory...'}</p>
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="p-12 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-gray-500">
          <Building2 className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="font-bold text-sm">{isAr ? 'لم يتم العثور على جهات مطابقة للبحث' : 'No matching entities found'}</p>
          <p className="text-xs text-gray-400 mt-1">{isAr ? 'جرّب تعديل معايير البحث أو إضافة جهة جديدة' : 'Try adjusting filters'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => {
            const catInfo = CATEGORY_MAP[entity.category] || {
              ar: entity.categoryAr || 'عام',
              en: entity.categoryEn || 'General',
              color: 'bg-gray-100 text-gray-800 border-gray-200',
            };

            const isApproved = entity.approvalStatus === 'approved';
            const isPending = entity.approvalStatus === 'pending_review';

            return (
              <div
                key={entity.id}
                className="bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Internal Code & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-black bg-slate-900 text-emerald-400 px-2.5 py-0.5 rounded-lg border border-slate-700 tracking-wider">
                      {entity.code}
                    </span>

                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'معتمد وموثق' : 'Verified'}</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isAr ? 'قيد المراجعة' : 'Pending'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? 'مرفوض' : 'Rejected'}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-black text-gray-950 text-sm leading-snug group-hover:text-emerald-700 transition">
                    {isAr ? entity.nameAr : entity.nameEn}
                  </h3>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                    {isAr ? entity.nameEn : entity.nameAr}
                  </div>

                  <div className="mt-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catInfo.color}`}>
                      {isAr ? catInfo.ar : catInfo.en}
                    </span>
                  </div>

                  {/* Description */}
                  {entity.descriptionAr && (
                    <p className="text-xs text-gray-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {isAr ? entity.descriptionAr : entity.descriptionEn || entity.descriptionAr}
                    </p>
                  )}

                  {/* Services Tags */}
                  {entity.servicesList && entity.servicesList.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase">
                        {isAr ? 'الخدمات المتاحة:' : 'Available Services:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {entity.servicesList.slice(0, 3).map((svc, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {svc}
                          </span>
                        ))}
                        {entity.servicesList.length > 3 && (
                          <span className="text-[10px] text-gray-400 font-bold px-1 self-center">
                            +{entity.servicesList.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Audit Trail & Official Link */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-gray-400">
                    <span>{isAr ? 'آخر تدقيق:' : 'Audited by:'} </span>
                    <strong className="text-gray-600">{entity.lastAuditBy}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canManage && (
                      <button
                        onClick={() => handleOpenEdit(entity)}
                        className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-blue-600 rounded-lg transition cursor-pointer"
                        title={isAr ? 'تعديل البيانات' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <a
                      href={entity.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] border border-emerald-200 transition"
                      title={entity.officialUrl}
                    >
                      <span>{isAr ? 'الموقع الرسمي' : 'Portal'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Entity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-gray-900 text-base">
                  {editingEntity
                    ? isAr
                      ? 'تعديل بيانات الجهة الحكومية'
                      : 'Edit Government Entity'
                    : isAr
                    ? 'إضافة جهة حكومية جديدة إلى الدليل'
                    : 'Add New Government Entity'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'الرمز الداخلي الفريد *' : 'Unique Internal Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="KSA-ZATCA-01"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {isAr ? 'رمز فريد يحدد الجهة في النظام' : 'Unique code identifier'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'تصنيف الخدمات *' : 'Service Category *'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GovCategoryType)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, info]) => (
                      <option key={key} value={key}>
                        {isAr ? info.ar : info.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'اسم الجهة باللغة العربية *' : 'Entity Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formNameAr}
                  onChange={(e) => setFormNameAr(e.target.value)}
                  placeholder="هيئة الزكاة والضريبة والجمارك"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'اسم الجهة باللغة الإنجليزية' : 'Entity Name (English)'}
                </label>
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="Zakat, Tax and Customs Authority"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'رابط الموقع الرسمي المعتمد *' : 'Verified Official URL *'}
                </label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://zatca.gov.sa"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  {isAr ? 'يخضع الرابط للفحص الأمني ضد الثغرات والبروتوكولات غير الآمنة' : 'Strictly validated HTTPS URL'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'قائمة وتصنيف الخدمات المتاحة (مفصولة بفواصل)' : 'Available Services (comma separated)'}
                </label>
                <input
                  type="text"
                  value={formServices}
                  onChange={(e) => setFormServices(e.target.value)}
                  placeholder="الفاتورة الإلكترونية، الإقرارات والزكاة، بوابة الجمارك"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'نبذة وملاحظات الاعتماد' : 'Description / Compliance Notes'}
                </label>
                <textarea
                  rows={3}
                  value={formDescAr}
                  onChange={(e) => setFormDescAr(e.target.value)}
                  placeholder={isAr ? 'شرح الخدمات الرسمية وأوجه التكامل...' : 'Official description...'}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{submitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ وتوثيق الجهة' : 'Save Entity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
