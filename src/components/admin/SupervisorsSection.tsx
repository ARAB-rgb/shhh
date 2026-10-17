import React, { useState, useEffect } from 'react';
import { SupervisorAccount, SupervisorPermissions } from '../../types/admin';
import { adminService } from '../../services/adminService';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  Save,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface SupervisorsSectionProps {
  lang: 'en' | 'ar';
}

const PERMISSION_CONFIG: {
  key: keyof SupervisorPermissions;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
}[] = [
  {
    key: 'canManageApps',
    labelAr: 'إدارة التطبيقات والمواقع',
    labelEn: 'Apps & Sites Management',
    descAr: 'إضافة، تعديل، إخفاء، نشر، وأرشفة التطبيقات والروابط بالمنظومة',
    descEn: 'Add, edit, hide, publish, and archive apps',
  },
  {
    key: 'canManageGovDirectory',
    labelAr: 'دليل الجهات الحكومية والرموز',
    labelEn: 'Government Directory',
    descAr: 'إضافة وتوثيق الجهات الحكومية واعتماد الروابط والرموز الفريدة',
    descEn: 'Manage official government registry & unique codes',
  },
  {
    key: 'canReviewQueue',
    labelAr: 'اعتماد ومراجعة قائمة الانتظار',
    labelEn: 'Review Queue & Approvals',
    descAr: 'تدقيق واعتماد أو رفض المواقع والخدمات الجديدة قبل نشرها للعامة',
    descEn: 'Review and approve new services before publication',
  },
  {
    key: 'canManageSupervisors',
    labelAr: 'إدارة المشرفين والصلاحيات (RBAC)',
    labelEn: 'Supervisors & Permissions',
    descAr: 'إضافة مشرفين جدد ومنح وسحب الصلاحيات الإدارية بشكل مستقل',
    descEn: 'Grant/revoke individual administrative permissions',
  },
  {
    key: 'canCustomizeAppearance',
    labelAr: 'تخصيص المظهر والألوان والهوية',
    labelEn: 'Appearance & Themes',
    descAr: 'تعديل ألوان المنصة، الخلفيات، التدرجات، وهوية التطبيقات',
    descEn: 'Modify platform design tokens, backgrounds and themes',
  },
];

export const SupervisorsSection: React.FC<SupervisorsSectionProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [supervisors, setSupervisors] = useState<SupervisorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // New Supervisor Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoleAr, setNewRoleAr] = useState('');
  const [newDeptAr, setNewDeptAr] = useState('');
  const [newPerms, setNewPerms] = useState<SupervisorPermissions>({
    canManageApps: true,
    canManageGovDirectory: false,
    canReviewQueue: true,
    canManageSupervisors: false,
    canCustomizeAppearance: false,
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentSupervisor = adminService.getSupervisor();
  const canManageSupervisors = adminService.hasPermission('canManageSupervisors');

  const loadData = async () => {
    setLoading(true);
    const data = await adminService.getSupervisors();
    setSupervisors(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePermission = async (supervisor: SupervisorAccount, permKey: keyof SupervisorPermissions) => {
    if (!canManageSupervisors) {
      alert(isAr ? 'يتطلب تعديل الصلاحيات صلاحية إدارة المشرفين' : 'Permission denied');
      return;
    }

    if (supervisor.role === 'super_admin' && permKey === 'canManageSupervisors') {
      alert(isAr ? 'لا يمكن سحب صلاحية إدارة المشرفين من المدير العام الرئيسي' : 'Cannot revoke from Super Admin');
      return;
    }

    const updatedPerms: SupervisorPermissions = {
      ...supervisor.permissions,
      [permKey]: !supervisor.permissions[permKey],
    };

    setSavingId(supervisor.id);
    const res = await adminService.updateSupervisorPermissions(supervisor.id, updatedPerms);
    setSavingId(null);

    if (res.success && res.supervisors) {
      setSupervisors(res.supervisors);
      setSuccessNotice(isAr ? `تم تحديث صلاحية [${permKey}] للمشرف ${supervisor.name} بنجاح` : 'Permissions updated');
      setTimeout(() => setSuccessNotice(null), 3000);
    } else if (res.error) {
      alert(res.error);
    }
  };

  const handleToggleStatus = async (supervisor: SupervisorAccount) => {
    if (!canManageSupervisors) return;
    if (supervisor.role === 'super_admin') {
      alert(isAr ? 'لا يمكن تجميد حساب المدير العام' : 'Cannot suspend Super Admin');
      return;
    }

    const nextStatus = supervisor.status === 'active' ? 'suspended' : 'active';
    setSavingId(supervisor.id);
    const res = await adminService.updateSupervisorPermissions(supervisor.id, supervisor.permissions, nextStatus);
    setSavingId(null);

    if (res.success && res.supervisors) {
      setSupervisors(res.supervisors);
    }
  };

  const handleAddSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newName.trim() || !newEmail.trim()) {
      setAddError(isAr ? 'الاسم والبريد حقول إلزامية' : 'Name and email are required');
      return;
    }

    setSubmitting(true);
    const res = await adminService.addSupervisor({
      name: newName.trim(),
      email: newEmail.trim(),
      roleAr: newRoleAr.trim() || (isAr ? 'مشرف معتمد' : 'Verified Supervisor'),
      departmentAr: newDeptAr.trim() || (isAr ? 'إدارة المنظومة' : 'Operations'),
      permissions: newPerms,
    });
    setSubmitting(false);

    if (res.success) {
      if (res.supervisors) setSupervisors(res.supervisors);
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewRoleAr('');
      setNewDeptAr('');
      setSuccessNotice(isAr ? 'تمت إضافة المشرف ومنحه الصلاحيات المحددة بنجاح!' : 'Supervisor added');
      setTimeout(() => setSuccessNotice(null), 3000);
    } else {
      setAddError(res.error || (isAr ? 'فشل إضافة المشرف' : 'Failed to add supervisor'));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-2">
            <Users className="w-4 h-4" />
            <span>{isAr ? 'نظام المشرفين والصلاحيات الدقيقة (RBAC)' : 'Granular Role-Based Access Control'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            {isAr ? 'حوكمة المشرفين ومنح وسحب الصلاحيات' : 'Supervisors & Permissions Governance'}
          </h2>
          <p className="text-xs md:text-sm text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? 'إدارة صلاحيات كل مشرف بشكل مستقل وموثق من الخادم؛ مع منع المستخدمين العاديين من استدعاء أي عمليات إدارية، وتسجيل كل عملية في سجل التدقيق.'
              : 'Grant or revoke permissions independently per supervisor with server-verified enforcement.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canManageSupervisors ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة مشرف جديد' : 'Add Supervisor'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl text-xs text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? 'صلاحية المدير العام مطلوبة للتعديل' : 'Super Admin Required'}</span>
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

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{successNotice}</span>
        </div>
      )}

      {/* Supervisors List */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
          <p className="text-xs">{isAr ? 'جاري تحميل سجل المشرفين...' : 'Loading supervisors...'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {supervisors.map((sup) => {
            const isSuper = sup.role === 'super_admin';
            const isActive = sup.status === 'active';
            const isCurrent = sup.email === currentSupervisor?.email;

            return (
              <div
                key={sup.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition ${
                  !isActive
                    ? 'opacity-60 bg-gray-50 border-gray-200'
                    : isSuper
                    ? 'border-purple-200 ring-1 ring-purple-100'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0 ${
                        isSuper ? 'bg-gradient-to-br from-purple-600 to-indigo-800' : 'bg-slate-800'
                      }`}
                    >
                      {sup.avatarInitials}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-gray-950 text-sm">{sup.name}</h3>
                        {isSuper && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded-full border border-purple-200">
                            {isAr ? 'مدير عام المنظومة' : 'Super Admin'}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            {isAr ? 'حسابك الحالي' : 'You'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{sup.email}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {sup.roleAr} • {sup.departmentAr}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end lg:self-center">
                    <div className="text-end text-[11px] text-gray-400 hidden sm:block">
                      <div>{isAr ? 'آخر تسجيل دخول:' : 'Last Login:'}</div>
                      <div className="font-medium text-gray-600">{sup.lastLogin}</div>
                    </div>

                    {canManageSupervisors && !isSuper && (
                      <button
                        onClick={() => handleToggleStatus(sup)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>{isActive ? (isAr ? 'تجميد الحساب' : 'Suspend') : isAr ? 'تنشيط الحساب' : 'Activate'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Granular Permissions Checkboxes */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-gray-800 uppercase tracking-wide">
                      {isAr ? 'صلاحيات المشرف (منح وسحب مستقل):' : 'Granular Permissions:'}
                    </span>
                    {savingId === sup.id && (
                      <span className="text-[11px] text-purple-600 flex items-center gap-1 font-bold animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>{isAr ? 'جاري تحديث الخادم...' : 'Syncing...'}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {PERMISSION_CONFIG.map((cfg) => {
                      const hasPerm = isSuper ? true : Boolean(sup.permissions[cfg.key]);

                      return (
                        <div
                          key={cfg.key}
                          onClick={() => {
                            if (!isSuper && canManageSupervisors) {
                              handleTogglePermission(sup, cfg.key);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs transition select-none flex items-start gap-2.5 ${
                            hasPerm
                              ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          } ${
                            !isSuper && canManageSupervisors
                              ? 'cursor-pointer hover:border-purple-300'
                              : 'cursor-default'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition ${
                              hasPerm
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'bg-white border-gray-300 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-bold leading-tight">{isAr ? cfg.labelAr : cfg.labelEn}</div>
                            <div className="text-[10px] text-gray-500 mt-1 line-clamp-1 leading-normal">
                              {isAr ? cfg.descAr : cfg.descEn}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Supervisor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-gray-900 text-base">
                  {isAr ? 'إضافة مشرف جديد وتحديد صلاحياته' : 'Add New Supervisor & Assign RBAC'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupervisor} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'اسم المشرف بالكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="سلطان القحطاني"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'البريد المؤسسي الرسمي (@snns.pro) *' : 'Corporate Email (@snns.pro) *'}
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="sultan@snns.pro"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'المسمى الوظيفي' : 'Job Title'}
                  </label>
                  <input
                    type="text"
                    value={newRoleAr}
                    onChange={(e) => setNewRoleAr(e.target.value)}
                    placeholder="مشرف الامتثال والربط"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'الإدارة / القسم' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={newDeptAr}
                    onChange={(e) => setNewDeptAr(e.target.value)}
                    placeholder="إدارة الحوكمة والتقنية"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Select Permissions */}
              <div className="pt-2">
                <label className="block text-xs font-black text-gray-800 mb-2">
                  {isAr ? 'الصلاحيات الممنوحة للمشرف الجديد:' : 'Assigned Permissions:'}
                </label>
                <div className="space-y-2">
                  {PERMISSION_CONFIG.filter((c) => c.key !== 'canManageSupervisors').map((cfg) => {
                    const checked = Boolean(newPerms[cfg.key]);

                    return (
                      <label
                        key={cfg.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          checked ? 'bg-purple-50 border-purple-200 text-purple-950' : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setNewPerms({
                              ...newPerms,
                              [cfg.key]: e.target.checked,
                            })
                          }
                          className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <div>
                          <div className="font-bold">{isAr ? cfg.labelAr : cfg.labelEn}</div>
                          <div className="text-[10px] text-gray-500">{isAr ? cfg.descAr : cfg.descEn}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{submitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'إضافة المشرف' : 'Add Supervisor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
