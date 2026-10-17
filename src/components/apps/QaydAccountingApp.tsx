import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Scale,
  Landmark,
  FileSpreadsheet,
  Layers,
  Building2,
  Calendar,
  AlertCircle,
  Check,
  X,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Wallet,
  Coins,
  FileCheck,
} from 'lucide-react';
import { QaydAccountingIcon } from '../icons/AppIcons';
import { QaydAccountNode, QaydJournalEntry } from '../../types/suite';
import { appRegistry } from '../../services/appRegistry';

interface QaydAccountingAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
  onOpenPwaModal?: () => void;
}

const INITIAL_CHART_OF_ACCOUNTS: QaydAccountNode[] = [
  {
    code: '1000',
    nameAr: 'الأصول (Assets)',
    nameEn: 'Assets',
    type: 'asset',
    balance: 1485200,
    currency: 'SAR',
    level: 1,
    children: [
      {
        code: '1100',
        nameAr: 'الأصول المتداولة',
        nameEn: 'Current Assets',
        type: 'asset',
        balance: 620200,
        level: 2,
        children: [
          { code: '1110', nameAr: 'الصندوق والخزينة الرئيسية', nameEn: 'Main Cash Vault', type: 'asset', balance: 142000, level: 3, currency: 'SAR' },
          { code: '1120', nameAr: 'مصرف الراجحي الحساب التجاري', nameEn: 'Al Rajhi Corporate Bank', type: 'asset', balance: 350000, level: 3, currency: 'SAR' },
          { code: '1130', nameAr: 'البنك الأهلي السعودي حساب العمليات', nameEn: 'SNB Operating Bank', type: 'asset', balance: 128200, level: 3, currency: 'SAR' },
        ],
      },
      {
        code: '1200',
        nameAr: 'الأصول الثابتة',
        nameEn: 'Fixed Assets',
        type: 'asset',
        balance: 865000,
        level: 2,
        children: [
          { code: '1210', nameAr: 'أجهزة ونقاط البيع والسيرفرات', nameEn: 'POS Hardware & Servers', type: 'asset', balance: 215000, level: 3, currency: 'SAR' },
          { code: '1220', nameAr: 'الديكورات والمباني والتجهيزات', nameEn: 'Interior & Fixtures', type: 'asset', balance: 650000, level: 3, currency: 'SAR' },
        ],
      },
    ],
  },
  {
    code: '2000',
    nameAr: 'الالتزامات (Liabilities)',
    nameEn: 'Liabilities',
    type: 'liability',
    balance: 210400,
    currency: 'SAR',
    level: 1,
    children: [
      { code: '2110', nameAr: 'ذمم الموردين الدائنة', nameEn: 'Accounts Payable', type: 'liability', balance: 145000, level: 2, currency: 'SAR' },
      { code: '2120', nameAr: 'ضريبة القيمة المضافة المستحقة (ZATCA)', nameEn: 'VAT Payable (ZATCA)', type: 'liability', balance: 65400, level: 2, currency: 'SAR' },
    ],
  },
  {
    code: '3000',
    nameAr: 'حقوق الملكية (Equity)',
    nameEn: 'Equity',
    type: 'equity',
    balance: 1000000,
    currency: 'SAR',
    level: 1,
    children: [
      { code: '3100', nameAr: 'رأس المال المدفوع', nameEn: 'Paid-in Capital', type: 'equity', balance: 1000000, level: 2, currency: 'SAR' },
    ],
  },
  {
    code: '4000',
    nameAr: 'الإيرادات والمبيعات (Revenues)',
    nameEn: 'Revenues',
    type: 'revenue',
    balance: 489200,
    currency: 'SAR',
    level: 1,
    children: [
      { code: '4110', nameAr: 'مبيعات الكاشير ونقاط البيع POS', nameEn: 'POS Cashier Sales', type: 'revenue', balance: 395000, level: 2, currency: 'SAR' },
      { code: '4120', nameAr: 'إيرادات الخدمات السحابية والاشتراكات', nameEn: 'Cloud Subscription Revenue', type: 'revenue', balance: 94200, level: 2, currency: 'SAR' },
    ],
  },
  {
    code: '5000',
    nameAr: 'المصروفات والتكاليف (Expenses)',
    nameEn: 'Expenses',
    type: 'expense',
    balance: 214400,
    currency: 'SAR',
    level: 1,
    children: [
      { code: '5110', nameAr: 'تكلفة البضاعة المباعة (COGS)', nameEn: 'Cost of Goods Sold', type: 'expense', balance: 112000, level: 2, currency: 'SAR' },
      { code: '5120', nameAr: 'الرواتب والأجور الشهرية', nameEn: 'Salaries & Wages', type: 'expense', balance: 75000, level: 2, currency: 'SAR' },
      { code: '5130', nameAr: 'إيجار الفروع ومصاريف الكهرباء', nameEn: 'Rent & Utilities', type: 'expense', balance: 27400, level: 2, currency: 'SAR' },
    ],
  },
];

const INITIAL_JOURNAL_ENTRIES: QaydJournalEntry[] = [
  {
    id: 'je-1',
    entryNumber: 'JE-2026-0042',
    date: '2026-10-08',
    descriptionAr: 'تسجيل مبيعات نقاط البيع اليومية فرع النرجس',
    descriptionEn: 'Daily POS Sales Registry Narjis Branch',
    debitAccountCode: '1120',
    debitAccountName: 'مصرف الراجحي الحساب التجاري',
    creditAccountCode: '4110',
    creditAccountName: 'مبيعات الكاشير ونقاط البيع POS',
    amount: 14850.0,
    reference: 'POS-SHIFT-891',
    status: 'posted',
  },
  {
    id: 'je-2',
    entryNumber: 'JE-2026-0041',
    date: '2026-10-07',
    descriptionAr: 'سداد فاتورة توريد بن محمص لصالح شركة البن العربي',
    descriptionEn: 'Supplier Payment for Roasted Coffee',
    debitAccountCode: '2110',
    debitAccountName: 'ذمم الموردين الدائنة',
    creditAccountCode: '1130',
    creditAccountName: 'البنك الأهلي السعودي حساب العمليات',
    amount: 8500.0,
    reference: 'PO-2026-302',
    status: 'posted',
  },
  {
    id: 'je-3',
    entryNumber: 'JE-2026-0040',
    date: '2026-10-06',
    descriptionAr: 'تحويل إيرادات الاشتراكات الشهرية في SNNS Cloud',
    descriptionEn: 'Monthly Subscription Revenue Transfer',
    debitAccountCode: '1120',
    debitAccountName: 'مصرف الراجحي الحساب التجاري',
    creditAccountCode: '4120',
    creditAccountName: 'إيرادات الخدمات السحابية والاشتراكات',
    amount: 22400.0,
    reference: 'SNNS-BILL-09',
    status: 'posted',
  },
];

export const QaydAccountingApp: React.FC<QaydAccountingAppProps> = ({ onBack, lang, onOpenPwaModal }) => {
  const isAr = lang === 'ar';
  const activeTenant = appRegistry.getActiveTenant();

  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'journal' | 'vaults' | 'reports'>('overview');
  const [chart] = useState<QaydAccountNode[]>(INITIAL_CHART_OF_ACCOUNTS);
  const [entries, setEntries] = useState<QaydJournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    '1000': true,
    '1100': true,
    '4000': true,
  });

  // New Journal Entry Modal
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDebitCode, setNewDebitCode] = useState('1120');
  const [newCreditCode, setNewCreditCode] = useState('4110');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const toggleNode = (code: string) => {
    setExpandedNodes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount) return;

    const parsedAmount = parseFloat(newAmount) || 0;
    const newEntry: QaydJournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: `JE-2026-00${entries.length + 43}`,
      date: new Date().toISOString().split('T')[0],
      descriptionAr: newDesc,
      descriptionEn: newDesc,
      debitAccountCode: newDebitCode,
      debitAccountName: newDebitCode === '1120' ? 'مصرف الراجحي الحساب التجاري' : 'الخزينة الرئيسية',
      creditAccountCode: newCreditCode,
      creditAccountName: newCreditCode === '4110' ? 'مبيعات الكاشير ونقاط البيع POS' : 'إيرادات سحابية',
      amount: parsedAmount,
      reference: 'MANUAL-ENTRY',
      status: 'posted',
    };

    setEntries([newEntry, ...entries]);
    setShowNewEntryModal(false);
    setNewDesc('');
    setNewAmount('');
    showToast(isAr ? 'تم حفظ قيد اليومية محلياً في سجلات المنشأة' : 'Journal entry recorded locally');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 min-h-screen">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-emerald-400 font-bold text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Top Accounting Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title={isAr ? 'العودة لمركز التطبيقات' : 'Back to Launcher'}
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          <div className="flex items-center gap-2.5">
            <QaydAccountingIcon className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>QAYD Accounting</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {isAr ? 'المحاسبة والإدارة المالية' : 'General Ledger & Financials'}
                  </span>
                </h1>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.2 rounded border border-slate-700 font-mono">
                  Multi-Tenant
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className="font-semibold text-slate-200">{activeTenant.nameAr}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">س.ت: {activeTenant.commercialRegistration}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Status & PWA Trigger */}
        <div className="flex items-center gap-2.5">
          {onOpenPwaModal && (
            <button
              onClick={onOpenPwaModal}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer border border-blue-400/20"
              title={isAr ? 'تثبيت تطبيق المحاسبة بشكل مستقل PWA' : 'Install Standalone Accounting App'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'تثبيت PWA مستقل' : 'Install PWA'}</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={() => setShowNewEntryModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'قيد يومية جديد' : 'New Journal Entry'}</span>
          </button>
        </div>
      </header>

      {/* Integration Status Banner */}
      <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-bold text-slate-300">{isAr ? 'حالة الربط المحاسبي:' : 'Accounting Sync Status:'}</span>
          <span>
            {isAr
              ? 'الواجهة جاهزة وتعمل محلياً لحسابات المنشأة — بانتظار ربط خادم القيود المركزي لنظام قيد QAYD Cloud في SNNS.PRO'
              : 'Ledger active locally. Awaiting central sync with QAYD Cloud servers on SNNS.PRO'}
          </span>
        </div>
        <span className="font-mono text-slate-500 hidden md:inline">qayd.snns.pro/v1/ledger</span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none snns-scroll-touch text-xs shrink-0">
        {[
          { id: 'overview', nameAr: 'لوحة المؤشرات المالية', icon: TrendingUp },
          { id: 'ledger', nameAr: 'شجرة الحسابات (الدليل المحاسبي)', icon: Layers },
          { id: 'journal', nameAr: 'دفتر القيود اليومية', icon: FileSpreadsheet },
          { id: 'vaults', nameAr: 'الخزائن والبنوك', icon: Landmark },
          { id: 'reports', nameAr: 'التقارير وميزان المراجعة', icon: Scale },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.nameAr}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>إجمالي الأصول (Assets)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">1,485,200.00 ر.س</div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">متداولة + أصول ثابتة</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>الالتزامات والخصوم (Liabilities)</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">210,400.00 ر.س</div>
                <span className="text-[11px] text-rose-400 font-semibold mt-1 block">موردين + ضريبة ZATCA</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>صافي إيرادات الفترة (Revenues)</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">489,200.00 ر.س</div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">مبيعات الكاشير والسحاب</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>المصروفات والتكاليف (Expenses)</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono">214,400.00 ر.س</div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">صافي الربح: +274,800 ر.س</span>
              </div>
            </div>

            {/* Recent Journal Entries Summary */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="font-bold text-sm text-white">آخر القيود المحاسبية المسجلة</h3>
                <button onClick={() => setActiveTab('journal')} className="text-xs text-blue-400 hover:underline">
                  عرض كامل القيود
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">رقم القيد</th>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">البيان</th>
                      <th className="py-2.5 px-3">الحساب المدين</th>
                      <th className="py-2.5 px-3">الحساب الدائن</th>
                      <th className="py-2.5 px-3 text-end">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {entries.slice(0, 3).map((e) => (
                      <tr key={e.id} className="hover:bg-slate-900/50">
                        <td className="py-3 px-3 font-bold text-blue-400">{e.entryNumber}</td>
                        <td className="py-3 px-3 text-slate-400">{e.date}</td>
                        <td className="py-3 px-3 font-sans text-white">{e.descriptionAr}</td>
                        <td className="py-3 px-3 font-sans text-emerald-400">{e.debitAccountName}</td>
                        <td className="py-3 px-3 font-sans text-rose-400">{e.creditAccountName}</td>
                        <td className="py-3 px-3 text-end font-black text-white">{e.amount.toLocaleString()} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. CHART OF ACCOUNTS (شجرة الحسابات) */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-base text-white">دليل شجرة الحسابات المحاسبية المعتمدة</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  توزيع الأصول والخصوم وحقوق الملكية والإيرادات والمصروفات وفق المعايير السعودية
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الدليل</span>
              </button>
            </div>

            <div className="space-y-3">
              {chart.map((root) => (
                <div key={root.code} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
                  <div
                    onClick={() => toggleNode(root.code)}
                    className="p-3.5 bg-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-850"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400">
                        {root.code}
                      </span>
                      <span className="font-bold text-sm text-white">{root.nameAr}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="font-black text-sm text-emerald-400">
                        {root.balance.toLocaleString()} {root.currency}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${expandedNodes[root.code] ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {expandedNodes[root.code] && root.children && (
                    <div className="p-3 ps-8 space-y-2 border-t border-slate-800/60 bg-slate-950/40 text-xs">
                      {root.children.map((sub) => (
                        <div key={sub.code} className="py-1.5 border-b border-slate-900 last:border-0">
                          <div className="flex justify-between items-center py-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-slate-400">{sub.code}</span>
                              <span className="font-semibold text-slate-200">{sub.nameAr}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-300">
                              {sub.balance.toLocaleString()} ر.س
                            </span>
                          </div>

                          {sub.children && (
                            <div className="ps-6 pt-1 space-y-1 text-[11px] text-slate-400 font-mono">
                              {sub.children.map((leaf) => (
                                <div key={leaf.code} className="flex justify-between py-0.5">
                                  <span>
                                    {leaf.code} - {leaf.nameAr}
                                  </span>
                                  <span className="text-emerald-400">{leaf.balance.toLocaleString()} ر.س</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. JOURNAL ENTRIES TAB */}
        {activeTab === 'journal' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-base text-white">دفتر قيود اليومية العامة (General Journal)</h3>
                <p className="text-xs text-slate-400">سجل القيود المزدوجة المتوازنة مع المراجع وسندات الصرف والقبض</p>
              </div>
              <button
                onClick={() => setShowNewEntryModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قيد</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">رقم القيد</th>
                    <th className="py-3 px-3">التاريخ</th>
                    <th className="py-3 px-3">البيان والتفاصيل</th>
                    <th className="py-3 px-3">الحساب المدين (Debit)</th>
                    <th className="py-3 px-3">الحساب الدائن (Credit)</th>
                    <th className="py-3 px-3 text-end">المبلغ (SAR)</th>
                    <th className="py-3 px-3 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {entries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-900/40">
                      <td className="py-3.5 px-3 font-bold text-blue-400">{e.entryNumber}</td>
                      <td className="py-3.5 px-3 text-slate-400">{e.date}</td>
                      <td className="py-3.5 px-3 font-sans text-white">{e.descriptionAr}</td>
                      <td className="py-3.5 px-3 font-sans text-emerald-400 font-semibold">{e.debitAccountName}</td>
                      <td className="py-3.5 px-3 font-sans text-rose-400 font-semibold">{e.creditAccountName}</td>
                      <td className="py-3.5 px-3 text-end font-black text-white text-sm">
                        {e.amount.toLocaleString()} ر.س
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans">
                          مرحل ومعتمد
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. VAULTS & BANKS */}
        {activeTab === 'vaults' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">مصرف الراجحي التجاري</h4>
                  <span className="text-[11px] text-slate-400 font-mono">IBAN: SA4480000...4910</span>
                </div>
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono my-2">350,000.00 ر.س</div>
              <span className="text-[11px] text-slate-500 block">حساب العمليات والإيرادات الرئيسي</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">البنك الأهلي السعودي (SNB)</h4>
                  <span className="text-[11px] text-slate-400 font-mono">IBAN: SA0310000...2280</span>
                </div>
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono my-2">128,200.00 ر.س</div>
              <span className="text-[11px] text-slate-500 block">حساب سداد الموردين والمصروفات</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">خزينة الكاشير الرئيسية</h4>
                  <span className="text-[11px] text-slate-400">السيولة النقدية اليدوية</span>
                </div>
              </div>
              <div className="text-xl font-black text-amber-300 font-mono my-2">142,000.00 ر.س</div>
              <span className="text-[11px] text-slate-500 block">مطابقة مع إغلاقات ورديات POS</span>
            </div>
          </div>
        )}

        {/* 5. REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center py-12">
            <Scale className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">التقارير المالية وميزان المراجعة وقائمة الدخل</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              التقارير المالية المستخرجة متطابقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) والمعايير المحاسبية المعتمدة (IFRS).
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>جاهز للاستخراج والطباعة بصيغة PDF و Excel</span>
            </div>
          </div>
        )}
      </div>

      {/* New Journal Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm">تسجيل قيد يومية محاسبي جديد</h3>
              <button onClick={() => setShowNewEntryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">بيان ووصف القيد:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سداد مصروفات استضافة أو مشتريات..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">المبلغ (SAR):</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">الحساب المدين (+):</label>
                  <select
                    value={newDebitCode}
                    onChange={(e) => setNewDebitCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white text-[11px]"
                  >
                    <option value="1120">1120 - مصرف الراجحي</option>
                    <option value="1110">1110 - الخزينة الرئيسية</option>
                    <option value="5110">5110 - تكلفة المبيعات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الحساب الدائن (-):</label>
                  <select
                    value={newCreditCode}
                    onChange={(e) => setNewCreditCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white text-[11px]"
                  >
                    <option value="4110">4110 - إيرادات POS</option>
                    <option value="4120">4120 - إيرادات سحابية</option>
                    <option value="1120">1120 - مصرف الراجحي</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEntryModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  حفظ القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
