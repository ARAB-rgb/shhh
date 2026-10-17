import React, { useState } from 'react';
import {
  DynamicAppTile,
  AppId,
  IconShapeType,
  IconStyleType,
} from '../../types/suite';
import {
  DynamicIconRenderer,
  CUSTOM_ICON_MAP,
  COLOR_SCHEME_CLASSES,
  SHAPE_CLASSES,
} from '../admin/DynamicIconRenderer';
import {
  X,
  Plus,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Shapes,
  Check,
  Globe,
  Layers,
} from 'lucide-react';

interface AddAppModalProps {
  onAddTile: (newTile: DynamicAppTile) => void;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export const AddAppModal: React.FC<AddAppModalProps> = ({
  onAddTile,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';

  const [labelAr, setLabelAr] = useState<string>('');
  const [labelEn, setLabelEn] = useState<string>('');
  const [badge, setBadge] = useState<string>('جديد');

  // Link / Target Mode: 'url' (external/web link) or 'internal' (suite workspace)
  const [linkMode, setLinkMode] = useState<'url' | 'internal'>('url');
  const [externalUrl, setExternalUrl] = useState<string>('https://');
  const [targetWorkspace, setTargetWorkspace] = useState<AppId>('word');

  // Logo Mode: 'upload' (file), 'url' (image link), or 'icon' (symbol & shape)
  const [logoMode, setLogoMode] = useState<'upload' | 'url' | 'icon'>('upload');
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [logoInputUrl, setLogoInputUrl] = useState<string>('');

  // Icon / Shape customizer if logoMode === 'icon'
  const [selectedShape, setSelectedShape] = useState<IconShapeType>('squircle');
  const [selectedColor, setSelectedColor] = useState<IconStyleType>('gradient-blue');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('rocket');

  // Handle Logo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Preview Tile
  const previewTile: DynamicAppTile = {
    id: 'preview',
    appTargetId: linkMode === 'internal' ? targetWorkspace : 'custom-link',
    labelAr: labelAr || (isAr ? 'اسم التطبيق' : 'App Name'),
    labelEn: labelEn || 'App Title',
    badge: badge || undefined,
    shape: selectedShape,
    colorScheme: selectedColor,
    customIcon: logoMode === 'icon' ? selectedSymbol : undefined,
    customLogoUrl: logoMode === 'upload' ? logoDataUrl : logoMode === 'url' ? logoInputUrl : undefined,
    externalUrl: linkMode === 'url' ? externalUrl : undefined,
    visible: true,
    order: 99,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelAr.trim() && !labelEn.trim()) return;

    const finalLogo = logoMode === 'upload' ? logoDataUrl : logoMode === 'url' ? logoInputUrl : undefined;

    const newTile: DynamicAppTile = {
      id: `custom-${Date.now()}`,
      appTargetId: linkMode === 'internal' ? targetWorkspace : 'custom-link',
      labelAr: labelAr.trim() || labelEn.trim(),
      labelEn: labelEn.trim() || labelAr.trim(),
      badge: badge.trim() || undefined,
      shape: selectedShape,
      colorScheme: selectedColor,
      customIcon: logoMode === 'icon' ? selectedSymbol : undefined,
      customLogoUrl: finalLogo || undefined,
      externalUrl: linkMode === 'url' ? externalUrl.trim() : undefined,
      visible: true,
      order: 99,
    };

    onAddTile(newTile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden text-gray-800 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isAr ? 'إضافة تطبيق أو اختصار جديد إلى المشغّل' : 'Add App or Shortcut to Launcher'}
              </h3>
              <p className="text-[11px] text-blue-100">
                {isAr ? 'أضف اسم التطبيق، اللوقو والشعار، ورابط التشغيل' : 'Specify name, upload logo, and configure app link'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition text-white">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Live Preview Card */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/40 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                {isAr ? 'معاينة مباشرة لشكل الأيقونة في المشغل:' : 'Live Launcher Preview:'}
              </span>
              <p className="text-gray-500 text-[11px]">
                {linkMode === 'url' ? `🔗 ${externalUrl || 'URL'}` : `⚡ SNNS ${targetWorkspace}`}
              </p>
            </div>

            <div className="flex flex-col items-center w-24">
              <div className="relative">
                <DynamicIconRenderer tile={previewTile} size={48} />
                {previewTile.badge && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.2 rounded-full shadow-xs">
                    {previewTile.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-800 text-center mt-1 truncate max-w-full">
                {isAr ? previewTile.labelAr : previewTile.labelEn}
              </span>
            </div>
          </div>

          {/* 1. App Names */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5 border-b pb-1 text-sm">
              <span>1.</span>
              <span>{isAr ? 'اسم التطبيق (Name)' : 'Application Name'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  {isAr ? 'الاسم بالعربية:' : 'Arabic Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={labelAr}
                  onChange={(e) => setLabelAr(e.target.value)}
                  placeholder={isAr ? 'مثال: بوابة الموظفين' : 'e.g. بوابة الموظفين'}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  {isAr ? 'الاسم بالإنجليزية:' : 'English Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={labelEn}
                  onChange={(e) => setLabelEn(e.target.value)}
                  placeholder="e.g. Staff Portal"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                {isAr ? 'شارة إضافية (Badge اختياري):' : 'Optional Badge:'}
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. جديد, VIP, PRO"
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
          </div>

          {/* 2. Logo & Visuals */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5 border-b pb-1 text-sm">
              <span>2.</span>
              <span>{isAr ? 'لوقو وشعار الأيقونة (Logo)' : 'Application Logo & Icon'}</span>
            </h4>

            {/* Logo Mode Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setLogoMode('upload')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  logoMode === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'رفع لوقو من جهازك' : 'Upload File'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoMode('url')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  logoMode === 'url' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isAr ? 'رابط صورة اللوقو' : 'Image URL'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoMode('icon')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  logoMode === 'icon' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'رمز وتصميم ملون' : 'Custom Icon'}</span>
              </button>
            </div>

            {/* Upload File Mode */}
            {logoMode === 'upload' && (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 transition">
                  <Upload className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="font-semibold text-gray-700">
                    {isAr ? 'انقر لاختيار صورة اللوقو (PNG, JPG, SVG)' : 'Click to select logo file'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {logoDataUrl ? (isAr ? '✓ تم اختيار الصورة وتضمينها بنجاح' : '✓ Logo image loaded') : (isAr ? 'الحد الأقصى الموصى به 2MB' : 'Recommended square ratio')}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                {logoDataUrl && (
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-xl border border-blue-200">
                    <img src={logoDataUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white p-1 border" />
                    <span className="text-[11px] text-blue-900 font-medium">
                      {isAr ? 'سيتم استخدام هذا اللوقو للأيقونة' : 'Logo will be rendered on the launcher icon'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Image URL Mode */}
            {logoMode === 'url' && (
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  {isAr ? 'أدخل رابط صورة اللوقو (URL):' : 'Logo Image URL:'}
                </label>
                <input
                  type="url"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Custom Icon & Shape Mode */}
            {logoMode === 'icon' && (
              <div className="space-y-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'اختر رمز الأيقونة:' : 'Choose Icon Symbol:'}</span>
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.keys(CUSTOM_ICON_MAP).slice(0, 12).map((iconKey) => {
                      const IconComp = CUSTOM_ICON_MAP[iconKey];
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setSelectedSymbol(iconKey)}
                          className={`p-2 rounded-xl border flex items-center justify-center transition ${
                            selectedSymbol === iconKey
                              ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-300'
                              : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'الشكل الهيكلي:' : 'Shape:'}</label>
                    <select
                      value={selectedShape}
                      onChange={(e) => setSelectedShape(e.target.value as IconShapeType)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl"
                    >
                      <option value="squircle">Squircle (مستطيل مقوس)</option>
                      <option value="rounded">Rounded (ناعم)</option>
                      <option value="circle">Circle (دائري)</option>
                      <option value="hexagon">Hexagon (سداسي)</option>
                      <option value="glass">Glassmorphism (زجاجي)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'نظام التدرج:' : 'Color Scheme:'}</label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value as IconStyleType)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl"
                    >
                      <option value="gradient-blue">Azure Blue</option>
                      <option value="gradient-purple">Royal Purple</option>
                      <option value="gradient-emerald">Emerald Green</option>
                      <option value="gradient-crimson">Crimson Red</option>
                      <option value="gradient-cyberpunk">Cyberpunk Neon</option>
                      <option value="gradient-dark">Midnight Black</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. App Link / Target */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5 border-b pb-1 text-sm">
              <span>3.</span>
              <span>{isAr ? 'ربط التطبيق والوجهة (App Link / Target)' : 'App Link & Action'}</span>
            </h4>

            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setLinkMode('url')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  linkMode === 'url' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isAr ? 'رابط موقع أو خدمة ويب (URL)' : 'Web URL'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLinkMode('internal')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  linkMode === 'internal' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? 'تطبيق داخلي في المنظومة' : 'SNNS App'}</span>
              </button>
            </div>

            {linkMode === 'url' ? (
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  {isAr ? 'أدخل رابط تشغيل التطبيق (URL Link):' : 'Enter Target URL:'}
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    required
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://my-company-portal.com"
                    className="w-full ps-9 pe-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {isAr ? 'عند النقر على الأيقونة في المشغل سيتم فتح هذا الرابط مباشرة.' : 'Clicking the tile will open this web application.'}
                </p>
              </div>
            ) : (
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  {isAr ? 'اختر مساحة العمل المستهدفة:' : 'Target Workspace:'}
                </label>
                <select
                  value={targetWorkspace}
                  onChange={(e) => setTargetWorkspace(e.target.value as AppId)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                >
                  <option value="snns-ai">SNNS AI (الذكاء الاصطناعي الشامل)</option>
                  <option value="word">SNNS Word (مستندات)</option>
                  <option value="excel">SNNS Excel (جداول وحسابات)</option>
                  <option value="powerpoint">SNNS PowerPoint (عروض تقديمية)</option>
                  <option value="printer">طابعة واي فاي الذكية والربط اللاسلكي (Wi-Fi)</option>
                  <option value="copilot">SNNS Copilot (مساعد ذكي)</option>
                  <option value="onedrive">SNNS OneDrive (تخزين سحابي)</option>
                  <option value="teams">SNNS Teams (فرق واجتماعات)</option>
                  <option value="outlook">SNNS Outlook (بريد)</option>
                  <option value="forms">SNNS Forms (استبيانات)</option>
                  <option value="todo">SNNS To Do (مهام)</option>
                  <option value="designer">SNNS Designer (تصميم)</option>
                  <option value="clipchamp">أدوات تعديل وتحميل الفيديو (Clipchamp)</option>
                  <option value="calendar">SNNS Calendar (تقويم)</option>
                  <option value="skype">SNNS Skype (اتصال)</option>
                </select>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة التطبيق إلى المشغّل' : 'Add to Launcher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
