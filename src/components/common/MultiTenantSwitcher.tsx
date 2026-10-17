import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Check,
  Shield,
  Layers,
  Store,
  UserCheck,
  Plus,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { appRegistry, DEFAULT_TENANT_COMPANIES } from '../../services/appRegistry';
import { TenantCompany, UserRoleType } from '../../types/suite';

interface MultiTenantSwitcherProps {
  lang: 'en' | 'ar';
}

export const MultiTenantSwitcher: React.FC<MultiTenantSwitcherProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [activeTenant, setActiveTenant] = useState<TenantCompany>(() => appRegistry.getActiveTenant());
  const [activeRole, setActiveRole] = useState<UserRoleType>(() => appRegistry.getCurrentRole());
  const [showDropdown, setShowDropdown] = useState(false);
  const companies = appRegistry.getTenantCompanies();

  const handleSelectCompany = (comp: TenantCompany) => {
    appRegistry.setActiveTenant(comp);
    setActiveTenant(comp);
    setShowDropdown(false);
  };

  const handleSelectRole = (role: UserRoleType) => {
    appRegistry.setCurrentRole(role);
    setActiveRole(role);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition cursor-pointer shadow-xs"
        title={isAr ? 'التبديل بين الشركات والمنشآت وتحديد الصلاحية' : 'Switch Corporate Tenant & Role'}
      >
        <div className={`w-5 h-5 rounded-lg bg-gradient-to-r ${activeTenant.logoColor} text-white text-[9px] font-black flex items-center justify-center shrink-0`}>
          {activeTenant.logoInitials}
        </div>
        <div className="text-start hidden md:block max-w-[140px] truncate">
          <span className="truncate block font-bold text-[11px] text-white leading-tight">
            {isAr ? activeTenant.nameAr : activeTenant.nameEn}
          </span>
          <span className="text-[9px] text-emerald-400 block font-mono">
            {activeRole === 'owner' ? 'مالك المنشأة' : activeRole === 'cashier' ? 'كاشير' : 'مدير مالي'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 end-0 w-80 max-w-[95vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 text-xs text-white z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm">{isAr ? 'المنشأة والشركة النشطة' : 'Active Tenant Entity'}</span>
            </div>
            <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Companies List */}
          <div className="space-y-1.5 mb-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              {isAr ? 'منشآتك المسجلة في SNNS:' : 'Registered Enterprises:'}
            </span>
            {companies.map((comp) => {
              const isSelected = comp.id === activeTenant.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => handleSelectCompany(comp)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-r ${comp.logoColor} text-white text-[10px] font-black flex items-center justify-center shrink-0`}>
                      {comp.logoInitials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold truncate text-[11px]">{isAr ? comp.nameAr : comp.nameEn}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">س.ت: {comp.commercialRegistration}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Role Switcher (RBAC) */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAr ? 'صلاحية الدخول الحالية (RBAC):' : 'Current Active Role:'}</span>
            </span>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              {[
                { id: 'owner', labelAr: 'المالك (كامل)' },
                { id: 'finance_manager', labelAr: 'مدير مالي' },
                { id: 'cashier', labelAr: 'كاشير فقط' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRole(r.id as UserRoleType)}
                  className={`py-1.5 px-2 rounded-lg font-bold border transition cursor-pointer ${
                    activeRole === r.id
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.labelAr}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
              {isAr
                ? '* صلاحية "كاشير فقط" تتيح فتح QAYD POS وتمنع تعديل شجرة الحسابات والقيود في QAYD Accounting.'
                : '* Cashier role restricts access to general ledger while enabling POS terminal.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
