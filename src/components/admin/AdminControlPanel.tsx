import React, { useState } from 'react';
import {
  DynamicAppTile,
  AppId,
  IconShapeType,
  IconStyleType,
  PageLayoutConfig,
} from '../../types/suite';
import {
  DynamicIconRenderer,
  CUSTOM_ICON_MAP,
  COLOR_SCHEME_CLASSES,
  SHAPE_CLASSES,
} from './DynamicIconRenderer';
import { AppearanceThemeSection } from './AppearanceThemeSection';
import { GovDirectorySection } from './GovDirectorySection';
import { SitesAppsSection } from './SitesAppsSection';
import { SupervisorsSection } from './SupervisorsSection';
import { ReviewQueueSection } from './ReviewQueueSection';
import { adminService } from '../../services/adminService';
import {
  X,
  Save,
  RotateCcw,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Check,
  Palette,
  Shapes,
  Type,
  Sliders,
  Lock,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  LayoutGrid,
  Columns,
  Maximize2,
  Scale,
  ExternalLink,
  Building2,
  Users,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface AdminControlPanelProps {
  tiles: DynamicAppTile[];
  onSaveTiles: (tiles: DynamicAppTile[]) => void;
  onResetTiles: () => void;
  pageLayout: PageLayoutConfig;
  onSavePageLayout: (layout: PageLayoutConfig) => void;
  onClose: () => void;
  onLockAdmin: () => void;
  lang?: 'en' | 'ar';
  initialTileId?: string | null;
  isStandaloneSts?: boolean;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  tiles,
  onSaveTiles,
  onResetTiles,
  pageLayout,
  onSavePageLayout,
  onClose,
  onLockAdmin,
  lang = 'ar',
  initialTileId,
  isStandaloneSts = false,
}) => {
  const isAr = lang === 'ar';
  const [adminSection, setAdminSection] = useState<
    'apps' | 'gov' | 'supervisors' | 'queue' | 'tiles' | 'balance' | 'appearance'
  >('apps');
  const currentSupervisor = adminService.getSupervisor();
  const [localTiles, setLocalTiles] = useState<DynamicAppTile[]>([...tiles]);
  const [localLayout, setLocalLayout] = useState<PageLayoutConfig>({ ...pageLayout });
  const [editingTileId, setEditingTileId] = useState<string | null>(
    (initialTileId && localTiles.some((t) => t.id === initialTileId) ? initialTileId : null) ||
      localTiles[0]?.id ||
      null
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // New Custom Tile State
  const [newTitleAr, setNewTitleAr] = useState<string>('');
  const [newTitleEn, setNewTitleEn] = useState<string>('');
  const [newTargetApp, setNewTargetApp] = useState<AppId | 'custom-link'>('word');
  const [newExternalUrl, setNewExternalUrl] = useState<string>('https://');
  const [newShape, setNewShape] = useState<IconShapeType>('squircle');
  const [newColor, setNewColor] = useState<IconStyleType>('gradient-blue');
  const [newCustomIcon, setNewCustomIcon] = useState<string>('zap');
  const [newLogoUrl, setNewLogoUrl] = useState<string>('');

  const editingTile = localTiles.find((t) => t.id === editingTileId);

  const moveTile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localTiles.length) return;

    const newArr = [...localTiles];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    const updated = newArr.map((item, idx) => ({ ...item, order: idx }));
    setLocalTiles(updated);
  };

  const updateEditingTile = (fields: Partial<DynamicAppTile>) => {
    if (!editingTileId) return;
    setLocalTiles((prev) =>
      prev.map((t) => (t.id === editingTileId ? { ...t, ...fields } : t))
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateEditingTile({ customLogoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalTiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t))
    );
  };

  const deleteTile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا التطبيق من المشغل؟' : 'Are you sure you want to remove this tile?')) {
      const filtered = localTiles
        .filter((t) => t.id !== id)
        .map((item, idx) => ({ ...item, order: idx }));
      setLocalTiles(filtered);
      if (editingTileId === id) setEditingTileId(filtered[0]?.id || null);
    }
  };

  const isSafeWebUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAddNewTile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAr.trim() && !newTitleEn.trim()) return;

    if (newTargetApp === 'custom-link') {
      const cleanUrl = newExternalUrl.trim();
      if (!isSafeWebUrl(cleanUrl)) {
        alert(
          isAr
            ? 'عذرًا، يجب أن يبدأ الرابط بـ https:// أو http:// لحماية أمان المنظومة ومنع الروابط غير الآمنة.'
            : 'Invalid link. Only secure https:// or http:// protocols are allowed for platform safety.'
        );
        return;
      }
    }

    const newTile: DynamicAppTile = {
      id: `custom-${Date.now()}`,
      appTargetId: newTargetApp,
      labelAr: newTitleAr.trim() || newTitleEn.trim(),
      labelEn: newTitleEn.trim() || newTitleAr.trim(),
      shape: newShape,
      colorScheme: newColor,
      customIcon: newLogoUrl ? undefined : newCustomIcon,
      customLogoUrl: newLogoUrl.trim() || undefined,
      externalUrl: newTargetApp === 'custom-link' ? newExternalUrl.trim() : undefined,
      visible: true,
      order: localTiles.length,
      badge: 'NEW',
    };

    setLocalTiles((prev) => [...prev, newTile]);
    setShowAddModal(false);
    setEditingTileId(newTile.id);
    setNewTitleAr('');
    setNewTitleEn('');
    setNewLogoUrl('');
  };

  const handleSave = () => {
    onSaveTiles(localTiles);
    onSavePageLayout(localLayout);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (
      window.confirm(
        isAr
          ? 'هل تريد بالتأكيد إعادة تعيين الترتيب والأسماء والأشكال والتخطيط إلى الوضع الافتراضي الأصلي؟'
          : 'Are you sure you want to reset all tiles, names, shapes, and page layout to default?'
      )
    ) {
      onResetTiles();
      onClose();
    }
  };

  const shapesList: { id: IconShapeType; nameEn: string; nameAr: string }[] = [
    { id: 'standard', nameEn: 'Standard Fluent', nameAr: 'افتراضي قياسي' },
    { id: 'squircle', nameEn: 'iOS Squircle', nameAr: 'مستطيل مقوس (Squircle)' },
    { id: 'rounded', nameEn: 'Soft Rounded', nameAr: 'حواف ناعمة' },
    { id: 'circle', nameEn: 'Full Circle', nameAr: 'دائرة كاملة' },
    { id: 'hexagon', nameEn: 'Cyber Hexagon', nameAr: 'مسدس سايبر' },
    { id: 'glass', nameEn: 'Glassmorphism', nameAr: 'زجاجي شفاف' },
  ];

  const colorsList: { id: IconStyleType; nameEn: string; nameAr: string; preview: string }[] = [
    { id: 'default', nameEn: 'Default Colors', nameAr: 'الألوان الأصلية', preview: 'bg-blue-600' },
    { id: 'gradient-blue', nameEn: 'Azure Blue', nameAr: 'أزرق سماوي ملكي', preview: 'bg-gradient-to-r from-blue-700 to-cyan-500' },
    { id: 'gradient-purple', nameEn: 'Royal Purple', nameAr: 'بنفسجي ملكي', preview: 'bg-gradient-to-r from-purple-800 to-indigo-500' },
    { id: 'gradient-emerald', nameEn: 'Emerald Green', nameAr: 'أخضر زمردي', preview: 'bg-gradient-to-r from-emerald-800 to-teal-400' },
    { id: 'gradient-crimson', nameEn: 'Crimson Red', nameAr: 'أحمر قرمزي', preview: 'bg-gradient-to-r from-red-800 to-rose-500' },
    { id: 'gradient-amber', nameEn: 'Sunset Gold', nameAr: 'ذهبي وغروب', preview: 'bg-gradient-to-r from-amber-600 to-yellow-400' },
    { id: 'gradient-dark', nameEn: 'Midnight Black', nameAr: 'أسود داكن', preview: 'bg-gradient-to-r from-black to-zinc-800' },
    { id: 'gradient-cyberpunk', nameEn: 'Cyberpunk Neon', nameAr: 'نيون مستقبلي', preview: 'bg-gradient-to-r from-fuchsia-600 to-cyan-400' },
  ];

  const appTargetsList: { id: AppId; name: string }[] = [
    { id: 'qayd-pos', name: 'QAYD POS (كاشير ونقاط البيع السريعة)' },
    { id: 'qayd-accounting', name: 'QAYD Accounting (المحاسبة ودفتر الأستاذ والشجرة)' },
    { id: 'snns-calls', name: 'SNNS Calls (المكالمات والاجتماعات الصوتية والمرئية)' },
    { id: 'snns-chat', name: 'SNNS Chat (المحادثات والرسائل والفرق)' },
    { id: 'snns-ai', name: 'SNNS AI (الذكاء الاصطناعي الشامل)' },
    { id: 'snns-education', name: 'SNNS Education (المنظومة والخدمات التعليمية)' },
    { id: 'business', name: 'SNNS Business (إدارة الأعمال والمنشآت)' },
    { id: 'marketplace', name: 'SNNS Marketplace (المتجر والسوق والإعلانات)' },
    { id: 'word', name: 'SNNS Word (المستندات)' },
    { id: 'excel', name: 'SNNS Excel (الجداول الحسابية)' },
    { id: 'powerpoint', name: 'SNNS PowerPoint (العروض)' },
    { id: 'printer', name: 'طابعة واي فاي الذكية والربط اللاسلكي (Wi-Fi Printer)' },
    { id: 'outlook', name: 'SNNS Outlook (البريد)' },
    { id: 'teams', name: 'SNNS Teams (المحادثات والفرق)' },
    { id: 'onedrive', name: 'SNNS OneDrive (الملفات السحابية)' },
    { id: 'copilot', name: 'SNNS Copilot (المساعد الذكي)' },
    { id: 'todo', name: 'SNNS To Do (المهام)' },
    { id: 'onenote', name: 'SNNS OneNote (الملاحظات)' },
    { id: 'calendar', name: 'SNNS Calendar (التقويم)' },
    { id: 'forms', name: 'SNNS Forms (الاستبيانات)' },
    { id: 'designer', name: 'SNNS Designer (التصميم)' },
    { id: 'clipchamp', name: 'أدوات تعديل وتحميل الفيديو (Clipchamp)' },
    { id: 'skype', name: 'SNNS Skype (المكالمات)' },
    { id: 'family-safety', name: 'SNNS Family Safety (أمان العائلة)' },
    { id: 'more-apps', name: 'SNNS More Apps (كتالوج التطبيقات)' },
  ];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden text-gray-800 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Admin Header */}
        <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-5 sm:px-7 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base tracking-tight">
                  {isAr ? 'لوحة إدارة وحوكمة منظومة SNNS 365' : 'SNNS 365 Central Administration Hub'}
                </h2>
                {currentSupervisor && (
                  <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{currentSupervisor.name} ({currentSupervisor.roleAr})</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {isAr
                  ? 'إدارة المواقع والتطبيقات، الدليل الحكومي، نظام المشرفين، وقائمة المراجعة والاعتماد'
                  : 'Manage apps, government registry, RBAC supervisors, review queue and appearance.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title={isAr ? 'إعادة تعيين إلى الوضع الافتراضي' : 'Reset to Default Layout'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'إعادة ضبط' : 'Reset'}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{isAr ? 'تم الحفظ!' : 'Saved!'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isAr ? 'حفظ وتطبيق' : 'Save & Apply'}</span>
                </>
              )}
            </button>

            <button
              onClick={onLockAdmin}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title={isAr ? 'قفل وضع المدير والخروج' : 'Lock Admin Mode'}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isAr ? 'قفل الإدارة' : 'Lock'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Section Tabs: Comprehensive Governance & Management Modules */}
        <div className="px-5 py-2.5 bg-gray-100 border-b border-gray-200 flex items-center justify-between shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAdminSection('apps')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminSection === 'apps'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-gray-950 border border-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'إدارة المواقع والتطبيقات' : 'Apps & Sites'}</span>
            </button>

            <button
              onClick={() => setAdminSection('gov')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminSection === 'gov'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-gray-950 border border-gray-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'دليل الجهات الحكومية' : 'Gov Directory'}</span>
            </button>

            <button
              onClick={() => setAdminSection('supervisors')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminSection === 'supervisors'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-gray-950 border border-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAr ? 'نظام المشرفين (RBAC)' : 'Supervisors (RBAC)'}</span>
            </button>

            <button
              onClick={() => setAdminSection('queue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminSection === 'queue'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-gray-950 border border-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isAr ? 'قائمة الانتظار والتدقيق' : 'Review Queue'}</span>
            </button>

            <button
              onClick={() => setAdminSection('appearance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminSection === 'appearance'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-gray-950 border border-gray-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{isAr ? 'المظهر والألوان' : 'Appearance'}</span>
            </button>

            <button
              onClick={() => setAdminSection('tiles')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminSection === 'tiles'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-gray-950 border border-gray-200'
              }`}
            >
              <Shapes className="w-3.5 h-3.5" />
              <span>{isAr ? 'أيقونات المشغل' : 'Launcher Icons'}</span>
            </button>

            <button
              onClick={() => setAdminSection('balance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminSection === 'balance'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-gray-950 border border-gray-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isAr ? 'موازنة وتخطيط الصفحة' : 'Page Balance'}</span>
            </button>
          </div>

          {adminSection === 'tiles' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs shrink-0 cursor-pointer ms-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إضافة اختصار للمشغل' : 'Add Tile'}</span>
            </button>
          )}
        </div>

        {/* Main Content Area */}
        {adminSection === 'apps' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
            <SitesAppsSection lang={lang} />
          </div>
        ) : adminSection === 'gov' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
            <GovDirectorySection lang={lang} />
          </div>
        ) : adminSection === 'supervisors' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
            <SupervisorsSection lang={lang} />
          </div>
        ) : adminSection === 'queue' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
            <ReviewQueueSection lang={lang} />
          </div>
        ) : adminSection === 'tiles' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left / Main List: Reordering & All Tiles */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 border-r border-gray-100">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900">
                    {isAr ? 'قائمة وتنسيق تطبيقات المشغل' : 'Launcher Apps & Order'}
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    {localTiles.filter((t) => t.visible).length} {isAr ? 'تطبيق ظاهر' : 'visible'} • {localTiles.length} {isAr ? 'إجمالي' : 'total'}
                  </span>
                </div>
              </div>

              {/* Grid of reorderable tiles */}
              <div className="space-y-2">
                {localTiles.map((tile, index) => {
                  const isEditing = editingTileId === tile.id;
                  return (
                    <div
                      key={tile.id}
                      onClick={() => setEditingTileId(tile.id)}
                      className={`p-2.5 sm:p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isEditing
                          ? 'border-[#0078D4] bg-blue-50/70 shadow-xs ring-2 ring-blue-300'
                          : tile.visible
                          ? 'border-gray-200 hover:border-gray-300 bg-white'
                          : 'border-dashed border-gray-300 bg-gray-50 opacity-60'
                      }`}
                    >
                      {/* Icon preview & details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 flex items-center justify-center">
                          <DynamicIconRenderer tile={tile} size={40} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900 truncate">
                              {isAr ? tile.labelAr : tile.labelEn}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                              ({isAr ? tile.labelEn : tile.labelAr})
                            </span>
                            {tile.badge && (
                              <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full">
                                {tile.badge}
                              </span>
                            )}
                            {tile.customLogoUrl && (
                              <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <ImageIcon className="w-2.5 h-2.5" />
                                <span>{isAr ? 'لوقو مخصص' : 'Logo'}</span>
                              </span>
                            )}
                            {tile.externalUrl && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <LinkIcon className="w-2.5 h-2.5" />
                                <span>{isAr ? 'رابط خارجي' : 'Link'}</span>
                              </span>
                            )}
                            {!tile.visible && (
                              <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.2 rounded-full">
                                {isAr ? 'مخفي' : 'Hidden'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{tile.shape}</span>
                            <span>•</span>
                            <span className="capitalize">{tile.colorScheme.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => moveTile(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 hover:bg-gray-200 disabled:opacity-20 rounded-lg text-gray-600 transition"
                          title={isAr ? 'تحريك للأعلى' : 'Move Up'}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => moveTile(index, 'down')}
                          disabled={index === localTiles.length - 1}
                          className="p-1.5 hover:bg-gray-200 disabled:opacity-20 rounded-lg text-gray-600 transition"
                          title={isAr ? 'تحريك للأسفل' : 'Move Down'}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => toggleVisibility(tile.id, e)}
                          className={`p-1.5 rounded-lg transition ${
                            tile.visible ? 'hover:bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-800'
                          }`}
                          title={tile.visible ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                        >
                          {tile.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => setEditingTileId(tile.id)}
                          className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                          title={isAr ? 'تعديل الخصائص' : 'Edit Props'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {tile.id.startsWith('custom-') && (
                          <button
                            onClick={(e) => deleteTile(tile.id, e)}
                            className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Editor Pane: Edit Selected Tile Form */}
            <aside className="w-full md:w-96 bg-gray-50/80 p-5 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-between text-xs space-y-4">
              {editingTile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div>
                      <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                        <span>{isAr ? 'تعديل الأيقونة واللوقو والرابط' : 'Edit Icon, Logo & Link'}</span>
                      </h4>
                      <p className="text-[10px] text-gray-500">ID: {editingTile.id}</p>
                    </div>
                    <div className="shrink-0">
                      <DynamicIconRenderer tile={editingTile} size={44} />
                    </div>
                  </div>

                  {/* Logo / Image Options */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-3">
                    <label className="font-bold text-gray-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>{isAr ? 'شعار / لوقو الأيقونة (Logo & Image):' : 'Custom Logo / Image:'}</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-center cursor-pointer border border-blue-200 transition flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isAr ? 'رفع لوقو من الجهاز' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {editingTile.customLogoUrl && (
                        <button
                          type="button"
                          onClick={() => updateEditingTile({ customLogoUrl: undefined })}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition"
                          title={isAr ? 'حذف اللوقو المخصص' : 'Clear Logo'}
                        >
                          {isAr ? 'حذف' : 'Clear'}
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">
                        {isAr ? 'أو رابط صورة اللوقو عبر الإنترنت:' : 'Or Logo Image URL:'}
                      </label>
                      <input
                        type="url"
                        value={editingTile.customLogoUrl || ''}
                        onChange={(e) => updateEditingTile({ customLogoUrl: e.target.value.trim() || undefined })}
                        placeholder="https://example.com/logo.png"
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* App Linking / Target */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2.5">
                    <label className="font-bold text-gray-800 flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-purple-600" />
                      <span>{isAr ? 'ربط التطبيق ومسار التشغيل:' : 'App Link & Launch Target:'}</span>
                    </label>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">
                        {isAr ? 'تطبيق داخلي من حزمة SNNS:' : 'Internal Suite Workspace:'}
                      </label>
                      <select
                        value={editingTile.appTargetId}
                        onChange={(e) => updateEditingTile({ appTargetId: e.target.value as any })}
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="custom-link">{isAr ? '🔗 رابط ويب خارجي (External URL)' : '🔗 External Web Link'}</option>
                        {appTargetsList.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {editingTile.appTargetId === 'custom-link' && (
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-0.5">
                          {isAr ? 'رابط الموقع أو المنظومة الخارجية:' : 'Destination Web URL:'}
                        </label>
                        <input
                          type="url"
                          value={editingTile.externalUrl || ''}
                          onChange={(e) => updateEditingTile({ externalUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Names */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2.5">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {isAr ? 'الاسم بالعربية:' : 'Arabic Name:'}
                      </label>
                      <input
                        type="text"
                        value={editingTile.labelAr}
                        onChange={(e) => updateEditingTile({ labelAr: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {isAr ? 'الاسم بالإنجليزية:' : 'English Name:'}
                      </label>
                      <input
                        type="text"
                        value={editingTile.labelEn}
                        onChange={(e) => updateEditingTile({ labelEn: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        {isAr ? 'شارة مميزة (Badge):' : 'Badge Tag:'}
                      </label>
                      <input
                        type="text"
                        value={editingTile.badge || ''}
                        onChange={(e) => updateEditingTile({ badge: e.target.value || undefined })}
                        placeholder="e.g. PRO AI, NEW, 365"
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Shape Selector */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200">
                    <label className="font-bold text-gray-700 block mb-2 flex items-center gap-1.5">
                      <Shapes className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isAr ? 'شكل الأيقونة (Shape):' : 'Icon Shape:'}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {shapesList.map((sh) => (
                        <button
                          key={sh.id}
                          onClick={() => updateEditingTile({ shape: sh.id })}
                          className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition ${
                            editingTile.shape === sh.id
                              ? 'border-blue-600 bg-blue-50 font-bold text-blue-900'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 bg-blue-600 ${SHAPE_CLASSES[sh.id] || 'rounded'}`} />
                          <span className="truncate text-[11px]">{isAr ? sh.nameAr : sh.nameEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Schemes */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200">
                    <label className="font-bold text-gray-700 block mb-2 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-pink-600" />
                      <span>{isAr ? 'تدرج الألوان (Color Scheme):' : 'Color Palette:'}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {colorsList.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => updateEditingTile({ colorScheme: col.id })}
                          className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition ${
                            editingTile.colorScheme === col.id
                              ? 'border-blue-600 bg-blue-50 font-bold text-blue-900'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${col.preview}`} />
                          <span className="truncate text-[11px]">{isAr ? col.nameAr : col.nameEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Lucide Icon Symbols */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200">
                    <label className="font-bold text-gray-700 block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? 'رمز الأيقونة البديل:' : 'Symbol Icon:'}</span>
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      <button
                        onClick={() => updateEditingTile({ customIcon: undefined })}
                        className={`p-1.5 rounded-xl border text-center font-bold text-[9px] ${
                          !editingTile.customIcon
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                        }`}
                        title={isAr ? 'الرمز الافتراضي للتطبيق' : 'Default App Graphic'}
                      >
                        Default
                      </button>
                      {Object.keys(CUSTOM_ICON_MAP).slice(0, 11).map((iconKey) => {
                        const IconComp = CUSTOM_ICON_MAP[iconKey];
                        return (
                          <button
                            key={iconKey}
                            onClick={() => updateEditingTile({ customIcon: iconKey })}
                            className={`p-1.5 rounded-xl border flex items-center justify-center transition ${
                              editingTile.customIcon === iconKey
                                ? 'border-blue-600 bg-blue-50 text-blue-900'
                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
                  <Edit2 className="w-10 h-10 stroke-[1.2] mb-2 text-gray-300" />
                  <p>{isAr ? 'حدد أي تطبيق من القائمة لتعديل اسمه أو شكله أو ألوانه أو ربطه.' : 'Select an app tile to edit.'}</p>
                </div>
              )}

              {/* Bottom Admin Lock button */}
              <div className="pt-3 border-t">
                <button
                  onClick={onLockAdmin}
                  className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'قفل وضع المدير (Lock Admin Mode)' : 'Lock Admin Mode'}</span>
                </button>
              </div>
            </aside>
          </div>
        ) : adminSection === 'balance' ? (
          /* SECTION 2: Page Balance & Layout Customizer ("وازن الصفحة") */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-950">
                    {isAr ? 'موازنة وتنسيق الصفحة بدقة هندسية' : 'Page Balance & Grid Symmetrical Alignment'}
                  </h3>
                  <p className="text-xs text-blue-800">
                    {isAr
                      ? 'تحكم بتوزيع الأعمدة، أبعاد البطاقات، توسيط الصفوف غير المكتملة، وتوحيد المسافات لجعل المشغل متزناً بصرياً.'
                      : 'Customize grid columns, card widths, centering, and symmetrical visual balance.'}
                  </p>
                </div>
              </div>

              {/* Auto Balance Preset Button */}
              <button
                onClick={() => {
                  setLocalLayout({
                    gridColumns: 5,
                    cardWidth: 'standard',
                    centerIncompleteRows: true,
                    showHeroBanner: true,
                    showRecentFiles: true,
                    showCreateMore: true,
                  });
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAr ? 'تطبيق التوازن المثالي التلقائي (Auto-Balance)' : 'Apply Perfect Auto-Balance'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Grid Columns */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <label className="font-bold text-gray-800 flex items-center gap-2">
                  <Columns className="w-4 h-4 text-blue-600" />
                  <span>{isAr ? 'عدد أعمدة شبكة المشغل (Grid Columns):' : 'Launcher Grid Columns:'}</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  {isAr ? 'حدد عدد الأيقونات في كل صف لتحقيق التوازن الهندسي المطلوب:' : 'Choose icon count per row:'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { cols: 4 as const, labelAr: '4 أعمدة (كبير)', labelEn: '4 Columns' },
                    { cols: 5 as const, labelAr: '5 أعمدة (المعيار 365)', labelEn: '5 Columns (365 Classic)' },
                    { cols: 6 as const, labelAr: '6 أعمدة (عريض)', labelEn: '6 Columns' },
                  ].map((item) => (
                    <button
                      key={item.cols}
                      onClick={() => setLocalLayout((prev) => ({ ...prev, gridColumns: item.cols }))}
                      className={`p-3 rounded-xl border text-center transition font-bold text-xs ${
                        localLayout.gridColumns === item.cols
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-300'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isAr ? item.labelAr : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Width */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <label className="font-bold text-gray-800 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-indigo-600" />
                  <span>{isAr ? 'عرض الحاوية والبطاقات (Container Width):' : 'Container Card Width:'}</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  {isAr ? 'توسيع أو تضييق المشغل لتحقيق تناسق مع حجم الشاشة:' : 'Adjust width for responsive harmony:'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact' as const, labelAr: 'مدمج (680px)', labelEn: 'Compact (680px)' },
                    { id: 'standard' as const, labelAr: 'متوازن (760px)', labelEn: 'Standard (760px)' },
                    { id: 'wide' as const, labelAr: 'عريض (960px)', labelEn: 'Wide (960px)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLocalLayout((prev) => ({ ...prev, cardWidth: item.id }))}
                      className={`p-3 rounded-xl border text-center transition font-bold text-xs ${
                        localLayout.cardWidth === item.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-300'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isAr ? item.labelAr : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Centering Incomplete Rows */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <label className="font-bold text-gray-800 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'توسيط الصف الأخير غير المكتمل:' : 'Center Incomplete Last Row:'}</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  {isAr
                    ? 'في حال كان عدد الأيقونات لا يملأ الصف الأخير، يتم توسيطها هندسياً لمنع الفراغات الجانبية.'
                    : 'Centers remaining icons horizontally when row is not fully filled.'}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLocalLayout((prev) => ({ ...prev, centerIncompleteRows: true }))}
                    className={`flex-1 py-2 px-3 rounded-xl border text-center font-bold text-xs transition ${
                      localLayout.centerIncompleteRows
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isAr ? 'مفعل (توسيط متوازن)' : 'Enabled (Balanced)'}
                  </button>
                  <button
                    onClick={() => setLocalLayout((prev) => ({ ...prev, centerIncompleteRows: false }))}
                    className={`flex-1 py-2 px-3 rounded-xl border text-center font-bold text-xs transition ${
                      !localLayout.centerIncompleteRows
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isAr ? 'محاذاة عادية (يسار/يمين)' : 'Left/Right Aligned'}
                  </button>
                </div>
              </div>

              {/* Sections Display Controls */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <label className="font-bold text-gray-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'إظهار / إخفاء أقسام الصفحة:' : 'Page Sections Visibility:'}</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <span className="text-xs font-semibold text-gray-700">
                      {isAr ? 'بانر الترحيب العلوي' : 'Top Welcome Banner'}
                    </span>
                    <input
                      type="checkbox"
                      checked={localLayout.showHeroBanner}
                      onChange={(e) => setLocalLayout((prev) => ({ ...prev, showHeroBanner: e.target.checked }))}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <span className="text-xs font-semibold text-gray-700">
                      {isAr ? 'قسم إنشاء المزيد (Create more)' : 'Create More Section'}
                    </span>
                    <input
                      type="checkbox"
                      checked={localLayout.showCreateMore}
                      onChange={(e) => setLocalLayout((prev) => ({ ...prev, showCreateMore: e.target.checked }))}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <span className="text-xs font-semibold text-gray-700">
                      {isAr ? 'قسم الملفات الأخيرة (Recent Files)' : 'Recent Files Section'}
                    </span>
                    <input
                      type="checkbox"
                      checked={localLayout.showRecentFiles}
                      onChange={(e) => setLocalLayout((prev) => ({ ...prev, showRecentFiles: e.target.checked }))}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 3: Appearance & Themes (المظهر والألوان) */
          <AppearanceThemeSection lang={lang} />
        )}
      </div>

      {/* Add Custom App Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 text-gray-800 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>{isAr ? 'إضافة تطبيق أو اختصار جديد' : 'Add New App or Shortcut'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewTile} className="space-y-3.5">
              <div>
                <label className="font-bold text-xs text-gray-700 block mb-1">
                  {isAr ? 'الاسم بالعربية:' : 'Arabic Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder={isAr ? 'مثال: منصة التقارير' : 'e.g. Analytics Platform'}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-gray-700 block mb-1">
                  {isAr ? 'الاسم بالإنجليزية:' : 'English Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. Analytics"
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-gray-700 block mb-1">
                  {isAr ? 'ربط التطبيق أو الوجهة:' : 'Link Destination:'}
                </label>
                <select
                  value={newTargetApp}
                  onChange={(e) => setNewTargetApp(e.target.value as any)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                >
                  <option value="custom-link">{isAr ? '🔗 رابط ويب خارجي (External URL)' : '🔗 External Web Link'}</option>
                  {appTargetsList.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>

              {newTargetApp === 'custom-link' && (
                <div>
                  <label className="font-bold text-xs text-gray-700 block mb-1">
                    {isAr ? 'رابط الموقع:' : 'Web URL:'}
                  </label>
                  <input
                    type="url"
                    value={newExternalUrl}
                    onChange={(e) => setNewExternalUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-xs text-gray-700 block mb-1">
                  {isAr ? 'رابط الشعار أو اللوقو (اختياري):' : 'Custom Logo Image URL (Optional):'}
                </label>
                <input
                  type="url"
                  value={newLogoUrl}
                  onChange={(e) => setNewLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {isAr ? 'إضافة التطبيق' : 'Add Tile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
