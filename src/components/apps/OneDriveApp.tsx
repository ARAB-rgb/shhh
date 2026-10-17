import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  FolderPlus,
  Folder,
  FileText,
  FileSpreadsheet,
  FileCheck,
  FileCode,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  Grid,
  List,
  Search,
  HardDrive,
  Check,
  X,
  Share2,
  Clock,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { OneDriveIcon, WordIcon, ExcelIcon, PowerPointIcon } from '../icons/AppIcons';
import { DriveItem } from '../../types/suite';
import { storage } from '../../services/storage';

interface OneDriveAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

export const OneDriveApp: React.FC<OneDriveAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [items, setItems] = useState<DriveItem[]>(storage.getDriveItems());
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'my-files' | 'shared' | 'trash' | 'docs' | 'sheets' | 'media'>('my-files');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<DriveItem | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const currentFolder = items.find((i) => i.id === currentFolderId);

  // Filter items based on active tab and search
  const displayedItems = items
    .filter((i) => {
      if (sidebarTab === 'my-files') return i.parentId === currentFolderId;
      if (sidebarTab === 'docs') return i.type === 'document';
      if (sidebarTab === 'sheets') return i.type === 'spreadsheet';
      if (sidebarTab === 'media') return i.type === 'image' || i.type === 'presentation';
      if (sidebarTab === 'shared') return i.name.toLowerCase().includes('shared') || i.name.includes('مشارك');
      if (sidebarTab === 'trash') return false; // Clean trash view
      return i.parentId === currentFolderId;
    })
    .filter((i) => (searchQuery ? i.name.toLowerCase().includes(searchQuery.toLowerCase()) : true));

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: DriveItem = {
      id: `f-${Date.now()}`,
      name: newFolderName,
      type: 'folder',
      size: '--',
      updatedAt: isAr ? 'الآن' : 'Just now',
      parentId: currentFolderId,
    };

    const updated = [...items, newFolder];
    setItems(updated);
    storage.saveDriveItems(updated);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: DriveItem['type'] = 'generic';
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) type = 'document';
    else if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) type = 'spreadsheet';
    else if (file.name.endsWith('.pptx')) type = 'presentation';
    else if (file.type.startsWith('image/')) type = 'image';

    const newItem: DriveItem = {
      id: `d-${Date.now()}`,
      name: file.name,
      type,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      updatedAt: isAr ? 'الآن' : 'Just now',
      parentId: currentFolderId,
      content: isAr ? 'تم استيراد الملف إلى سحابة SNNS Cloud بنجاح.' : 'File uploaded to SNNS Cloud.',
    };

    const updated = [newItem, ...items];
    setItems(updated);
    storage.saveDriveItems(updated);
    setStatusNotice(isAr ? 'تم حفظ الملف محلياً في مساحة العمل. بانتظار مزامنة التخزين السحابي في SNNS.PRO.' : 'File saved locally. Awaiting central sync with SNNS.PRO.');
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    storage.saveDriveItems(updated);
  };

  const renderIcon = (type: DriveItem['type'], className = 'w-8 h-8') => {
    switch (type) {
      case 'folder':
        return <Folder className={`${className} text-sky-500 fill-sky-100`} />;
      case 'document':
        return <WordIcon className={className} />;
      case 'spreadsheet':
        return <ExcelIcon className={className} />;
      case 'presentation':
        return <PowerPointIcon className={className} />;
      case 'image':
        return <ImageIcon className={`${className} text-rose-500`} />;
      default:
        return <FileText className={`${className} text-slate-500`} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6 shadow-xs sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
              title={isAr ? 'الرجوع للمركز' : 'Back to Launcher'}
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-2.5">
              <OneDriveIcon className="w-9 h-9" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    {isAr ? 'سحابة ومستندات SNNS Cloud' : 'SNNS Cloud & Files'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                    {isAr ? 'تخزين سحابي موحد' : 'Unified Drive'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {currentFolder ? currentFolder.name : (isAr ? 'الملفات والمجلدات الخاصة بي' : 'My Files & Directories')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 text-xs">
              <Upload className="w-4 h-4" />
              <span>{isAr ? 'رفع ملف جديد' : 'Upload File'}</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setShowNewFolderModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-xs flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-sky-600" />
              <span>{isAr ? 'مجلد جديد' : 'New Folder'}</span>
            </button>
          </div>
        </div>

        {/* Status Line */}
        <div className="mt-2 pt-2 border-t border-slate-100 max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">
              {isAr ? 'حالة التخزين السحابي:' : 'Storage Gateway Status:'}
            </span>
            <span>
              {isAr
                ? 'الواجهة جاهزة ومحدثة محلياً — بانتظار ربط خوادم التخزين المركزي storage.snns.pro'
                : 'Interface ready locally — awaiting official storage backend sync with storage.snns.pro'}
            </span>
          </div>
          <span className="font-mono text-slate-400 hidden md:inline">drive.snns.pro/v1/storage</span>
        </div>
      </header>

      {/* Notice Alert */}
      {statusNotice && (
        <div className="bg-sky-50 border-b border-sky-200 px-4 py-2 text-xs text-sky-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice(null)} className="text-sky-700 hover:text-sky-900 font-bold p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Storage & Categories Sidebar */}
        <aside className="w-60 sm:w-64 bg-white border-e border-slate-200 p-4 hidden md:flex flex-col justify-between text-xs select-none shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSidebarTab('my-files');
                  setCurrentFolderId(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition text-start cursor-pointer ${
                  sidebarTab === 'my-files' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Folder className="w-4 h-4 text-sky-600" />
                <span>{isAr ? 'ملفاتي ومجلداتي' : 'My Files'}</span>
              </button>

              <button
                onClick={() => setSidebarTab('shared')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition text-start cursor-pointer ${
                  sidebarTab === 'shared' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'المشاركة معي' : 'Shared with me'}</span>
              </button>

              <button
                onClick={() => setSidebarTab('trash')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition text-start cursor-pointer ${
                  sidebarTab === 'trash' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>{isAr ? 'سلة المحذوفات' : 'Recycle Bin'}</span>
              </button>
            </div>

            {/* Filter by Type */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
                {isAr ? 'استعراض حسب النوع' : 'Browse by Type'}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => setSidebarTab('docs')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-medium transition text-start cursor-pointer ${
                    sidebarTab === 'docs' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isAr ? 'المستندات (Docs)' : 'Documents'}</span>
                </button>
                <button
                  onClick={() => setSidebarTab('sheets')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-medium transition text-start cursor-pointer ${
                    sidebarTab === 'sheets' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'الجداول (Sheets)' : 'Spreadsheets'}</span>
                </button>
                <button
                  onClick={() => setSidebarTab('media')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-medium transition text-start cursor-pointer ${
                    sidebarTab === 'media' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isAr ? 'الوسائط والعروض' : 'Media & Slides'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Storage Meter Card with Upgrade button */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-slate-800 font-bold">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-sky-600" />
                <span>{isAr ? 'سعة التخزين' : 'Storage Quota'}</span>
              </div>
              <span className="text-[10px] text-sky-700">2.45%</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
              <div className="bg-sky-600 h-full w-[2.45%]" />
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between font-mono">
              <span>24.5 GB</span>
              <span>1,000 GB</span>
            </div>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              <span>{isAr ? 'ترقية باقات التخزين' : 'Upgrade Plan'}</span>
            </button>
          </div>
        </aside>

        {/* Center Files Stage */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden">
          {/* Breadcrumb & Filter Bar */}
          <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <button
                onClick={() => {
                  setSidebarTab('my-files');
                  setCurrentFolderId(null);
                }}
                className="hover:text-sky-600 transition cursor-pointer"
              >
                {isAr ? 'سحابة SNNS' : 'SNNS Cloud'}
              </button>
              {currentFolder && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
                  <span className="text-slate-900 font-bold">{currentFolder.name}</span>
                </>
              )}
            </div>

            {/* Search & View Mode Switcher */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث في ملفاتي...' : 'Search files...'}
                  className="w-full ps-8 pe-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Files Grid / List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {displayedItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Folder className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">{isAr ? 'المجلد فارغ' : 'This folder is empty'}</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'folder') setCurrentFolderId(item.id);
                      else setPreviewItem(item);
                    }}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      {renderIcon(item.type)}
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate mb-1" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{item.size}</span>
                        <span>{item.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                {displayedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'folder') setCurrentFolderId(item.id);
                      else setPreviewItem(item);
                    }}
                    className="p-3 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {renderIcon(item.type, 'w-5 h-5')}
                      <span className="font-bold text-slate-800 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] text-slate-500">
                      <span>{item.size}</span>
                      <span>{item.updatedAt}</span>
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="p-1 hover:text-rose-600 text-slate-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              {isAr ? 'إنشاء مجلد جديد' : 'Create New Folder'}
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <input
                type="text"
                autoFocus
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={isAr ? 'اسم المجلد...' : 'Folder name...'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3.5 py-1.5 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  {isAr ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                {renderIcon(previewItem.type, 'w-5 h-5')}
                <span className="font-bold text-xs truncate">{previewItem.name}</span>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed font-mono">
                {previewItem.content || (isAr ? 'معاينة محتوى المستند السحابي المشفر.' : 'Encrypted cloud file preview.')}
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>{isAr ? 'الحجم:' : 'Size:'} {previewItem.size}</span>
                <span>{isAr ? 'تاريخ التحديث:' : 'Updated:'} {previewItem.updatedAt}</span>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Storage Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">
                {isAr ? 'ترقية سعة التخزين السحابية' : 'Upgrade Cloud Storage'}
              </h3>
              <button onClick={() => setShowUpgradeModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'اختر باقة التخزين المعتمدة لمنظومة أعمالك مع دعم التشفير والنسخ الاحتياطي التلقائي.'
                : 'Select certified storage tier with automatic encryption and backup.'}
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold">100 GB</span>
                <span className="font-bold text-sky-700">9 SAR / mo</span>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border-2 border-sky-500 flex justify-between items-center">
                <span className="font-bold">1 TB (Current)</span>
                <span className="font-bold text-sky-700">29 SAR / mo</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold">5 TB</span>
                <span className="font-bold text-sky-700">89 SAR / mo</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isAr ? 'بانتظار ربط بوابة الدفع المركزية في SNNS.PRO.' : 'Awaiting payment gateway sync on SNNS.PRO.'}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
