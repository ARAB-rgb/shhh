import React, { useState, useEffect } from 'react';
import {
  ThemeTokens,
  PlatformThemeConfig,
  THEME_PRESETS,
  BackgroundType,
} from '../../types/theme';
import { themeService } from '../../services/themeService';
import {
  Palette,
  RotateCcw,
  Save,
  Check,
  Eye,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Sliders,
  ChevronDown,
  Monitor,
  Smartphone,
  Info,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { AppId } from '../../types/suite';

interface AppearanceThemeSectionProps {
  lang: 'en' | 'ar';
  onThemeApplied?: () => void;
}

export const AppearanceThemeSection: React.FC<AppearanceThemeSectionProps> = ({
  lang,
  onThemeApplied,
}) => {
  const isAr = lang === 'ar';

  const [themeConfig, setThemeConfig] = useState<PlatformThemeConfig>(themeService.getConfig());
  const [selectedTarget, setSelectedTarget] = useState<string>('platform'); // 'platform' or appId
  const [currentTokens, setCurrentTokens] = useState<ThemeTokens>({ ...themeConfig.platform });
  const [inheritPlatform, setInheritPlatform] = useState<boolean>(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [resetNotice, setResetNotice] = useState<boolean>(false);

  // Available apps for individual styling
  const customizableApps: { id: AppId; nameAr: string; nameEn: string }[] = [
    { id: 'qayd-pos', nameAr: 'قيد كاشير (QAYD POS)', nameEn: 'QAYD POS Cashier' },
    { id: 'qayd-accounting', nameAr: 'قيد محاسبة (QAYD Accounting)', nameEn: 'QAYD Accounting' },
    { id: 'snns-calls', nameAr: 'SNNS Calls (المكالمات)', nameEn: 'SNNS Calls' },
    { id: 'snns-chat', nameAr: 'SNNS Chat (المحادثات)', nameEn: 'SNNS Chat' },
    { id: 'snns-ai', nameAr: 'SNNS AI (الذكاء الاصطناعي)', nameEn: 'SNNS AI' },
    { id: 'snns-education', nameAr: 'SNNS Education (التعليم)', nameEn: 'SNNS Education' },
    { id: 'word', nameAr: 'SNNS Word (المستندات)', nameEn: 'SNNS Word' },
    { id: 'excel', nameAr: 'SNNS Excel (الجداول)', nameEn: 'SNNS Excel' },
    { id: 'powerpoint', nameAr: 'SNNS PowerPoint (العروض)', nameEn: 'SNNS PowerPoint' },
    { id: 'business', nameAr: 'SNNS Business (الأعمال)', nameEn: 'SNNS Business' },
    { id: 'marketplace', nameAr: 'SNNS Marketplace (المتجر)', nameEn: 'SNNS Marketplace' },
    { id: 'printer', nameAr: 'طابعة واي فاي (Printer)', nameEn: 'Wi-Fi Printer' },
  ];

  // Sync state when selected target changes
  useEffect(() => {
    if (selectedTarget === 'platform') {
      setCurrentTokens({ ...themeConfig.platform });
      setInheritPlatform(false);
    } else {
      const appConfig = themeConfig.apps[selectedTarget];
      if (appConfig) {
        setInheritPlatform(appConfig.inheritPlatform);
        if (appConfig.inheritPlatform) {
          setCurrentTokens({ ...themeConfig.platform });
        } else {
          setCurrentTokens({ ...themeConfig.platform, ...appConfig });
        }
      } else {
        setInheritPlatform(true);
        setCurrentTokens({ ...themeConfig.platform });
      }
    }
  }, [selectedTarget, themeConfig]);

  const updateToken = <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => {
    setCurrentTokens((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setCurrentTokens({ ...preset.tokens });
  };

  const handleSaveAndApply = () => {
    let updatedConfig: PlatformThemeConfig;

    if (selectedTarget === 'platform') {
      updatedConfig = {
        ...themeConfig,
        platform: { ...currentTokens },
      };
    } else {
      updatedConfig = {
        ...themeConfig,
        apps: {
          ...themeConfig.apps,
          [selectedTarget]: {
            ...currentTokens,
            inheritPlatform: inheritPlatform,
          },
        },
      };
    }

    themeService.saveConfig(updatedConfig);
    setThemeConfig(updatedConfig);
    themeService.applyToDOM(selectedTarget === 'platform' ? currentTokens : themeService.getEffectiveTheme());

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
    if (onThemeApplied) onThemeApplied();
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        isAr
          ? 'هل تريد استعادة المظهر الافتراضي الرسمي لـ SNNS 365 لجميع الألوان والخلفيات؟'
          : 'Reset to official SNNS 365 default theme and colors?'
      )
    ) {
      const reset = themeService.resetToDefault();
      setThemeConfig(reset);
      setCurrentTokens({ ...reset.platform });
      setInheritPlatform(true);
      themeService.applyToDOM(reset.platform);

      setResetNotice(true);
      setTimeout(() => setResetNotice(false), 2200);
      if (onThemeApplied) onThemeApplied();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      updateToken('bgImage', result);
      updateToken('bgType', 'image');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50 text-slate-800">
      {/* Left: Controls & Color Pickers */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 border-r border-slate-200">
        {/* Header Notice & Target Switcher */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isAr ? 'نطاق التخصيص المستهدف' : 'Customization Scope'}
              </span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">
                {selectedTarget === 'platform'
                  ? isAr
                    ? 'المظهر العام للمنصة (SNNS 365 Platform)'
                    : 'Global Platform Appearance'
                  : isAr
                  ? `تخصيص مستقل: ${customizableApps.find((a) => a.id === selectedTarget)?.nameAr}`
                  : `Independent App: ${customizableApps.find((a) => a.id === selectedTarget)?.nameEn}`}
              </span>
            </div>

            <div className="relative min-w-[220px]">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="platform">{isAr ? '🌐 المظهر العام للمنصة الرئيسية' : '🌐 Global Platform Theme'}</option>
                <optgroup label={isAr ? 'تطبيقات SNNS المستقلة' : 'Independent SNNS Apps'}>
                  {customizableApps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {isAr ? app.nameAr : app.nameEn}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {selectedTarget !== 'platform' && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={inheritPlatform}
                  onChange={(e) => setInheritPlatform(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span>{isAr ? 'وراثة ألوان المنصة الأساسية تلقائيًا' : 'Inherit Global Platform Theme'}</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {inheritPlatform
                  ? isAr
                    ? 'يتبع التغييرات العامة للمنصة'
                    : 'Follows global platform styles'
                  : isAr
                  ? 'ألوان وخلفية مخصصة لهذا التطبيق فقط'
                  : 'Independent custom colors for this app'}
              </span>
            </div>
          )}
        </div>

        {/* Preset Templates Carousel */}
        {(!inheritPlatform || selectedTarget === 'platform') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'القوالب الجاهزة المعتمدة (Presets):' : 'Official Preset Themes:'}</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {isAr ? 'اختر قالبًا للتطبيق الفوري' : 'Click to preview preset'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected =
                  currentTokens.bgColor.toLowerCase() === preset.tokens.bgColor.toLowerCase() &&
                  currentTokens.primaryBtnBg.toLowerCase() === preset.tokens.primaryBtnBg.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 rounded-xl border text-start transition flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: preset.previewBg }}
                        />
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: preset.previewAccent }}
                        />
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block truncate">
                        {isAr ? preset.nameAr : preset.nameEn}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1 block mt-0.5">
                        {preset.descriptionAr}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Background Styling Section */}
        {(!inheritPlatform || selectedTarget === 'platform') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'خلفية الصفحة ومظهر السطح:' : 'Page Background & Surface:'}</span>
              </span>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                <button
                  onClick={() => updateToken('bgType', 'solid')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    currentTokens.bgType === 'solid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {isAr ? 'لون أحادي' : 'Solid'}
                </button>
                <button
                  onClick={() => updateToken('bgType', 'gradient')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    currentTokens.bgType === 'gradient' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {isAr ? 'تدرج لوني' : 'Gradient'}
                </button>
                <button
                  onClick={() => updateToken('bgType', 'image')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    currentTokens.bgType === 'image' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {isAr ? 'صورة مخصصة' : 'Image'}
                </button>
              </div>
            </div>

            {/* Solid Color Input */}
            {currentTokens.bgType === 'solid' && (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    {isAr ? 'لون الخلفية الأساسي:' : 'Base Background Color:'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isAr ? 'استخدم منتقي الألوان أو اكتب رمز HEX مباشرة' : 'Pick color or type HEX code'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentTokens.bgColor}
                    onChange={(e) => updateToken('bgColor', e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={currentTokens.bgColor}
                    onChange={(e) => updateToken('bgColor', e.target.value)}
                    className="w-24 px-2 py-1.5 border border-slate-300 rounded-xl text-xs font-mono uppercase bg-slate-50 focus:bg-white focus:outline-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Gradient Input */}
            {currentTokens.bgType === 'gradient' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-700">
                    {isAr ? 'كود التدرج اللوني (CSS Gradient):' : 'CSS Gradient Rule:'}
                  </span>
                  <div
                    className="w-16 h-7 rounded-lg border border-slate-300"
                    style={{ background: currentTokens.bgGradient }}
                  />
                </div>
                <input
                  type="text"
                  value={currentTokens.bgGradient}
                  onChange={(e) => updateToken('bgGradient', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white"
                  placeholder="linear-gradient(135deg, #0A0D0C 0%, #111A16 100%)"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() =>
                      updateToken('bgGradient', 'linear-gradient(135deg, #0A0D0C 0%, #111A16 100%)')
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-700"
                  >
                    زمرد داكن
                  </button>
                  <button
                    onClick={() =>
                      updateToken('bgGradient', 'linear-gradient(135deg, #0A192F 0%, #112240 100%)')
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-700"
                  >
                    كحلي ملكي
                  </button>
                  <button
                    onClick={() =>
                      updateToken('bgGradient', 'linear-gradient(135deg, #1E1B4B 0%, #311042 100%)')
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-700"
                  >
                    بنفسجي وإنديغو
                  </button>
                  <button
                    onClick={() =>
                      updateToken('bgGradient', 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)')
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-700"
                  >
                    أبيض ثلجي
                  </button>
                </div>
              </div>
            )}

            {/* Custom Image Input */}
            {currentTokens.bgType === 'image' && (
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'رفع صورة خلفية من جهازك:' : 'Upload Background Image:'}
                  </span>
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition text-xs font-semibold text-slate-600">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'اختيار ملف صورة (JPG, PNG, WebP)' : 'Select Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'أو رابط صورة مباشر (URL):' : 'Or Direct Image URL:'}
                  </span>
                  <input
                    type="url"
                    value={currentTokens.bgImage || ''}
                    onChange={(e) => updateToken('bgImage', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* UI Elements Detailed Color Pickers */}
        {(!inheritPlatform || selectedTarget === 'platform') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'تخصيص مكونات الواجهة (Design Tokens):' : 'Component Colors & Tokens:'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Top Navigation Background */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isAr ? 'الشريط العلوي (Header):' : 'Top Nav Bar:'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{currentTokens.topNavBg}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentTokens.topNavBg}
                    onChange={(e) => updateToken('topNavBg', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={currentTokens.topNavBg}
                    onChange={(e) => updateToken('topNavBg', e.target.value)}
                    className="w-20 px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] font-mono uppercase bg-white"
                  />
                </div>
              </div>

              {/* Sidebar Background */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isAr ? 'القائمة الجانبية (Sidebar):' : 'Sidebar Background:'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{currentTokens.sidebarBg}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentTokens.sidebarBg}
                    onChange={(e) => updateToken('sidebarBg', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={currentTokens.sidebarBg}
                    onChange={(e) => updateToken('sidebarBg', e.target.value)}
                    className="w-20 px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] font-mono uppercase bg-white"
                  />
                </div>
              </div>

              {/* Card Surface */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isAr ? 'البطاقات والحاويات (Cards):' : 'Cards Surface:'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{currentTokens.cardBg}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentTokens.cardBg}
                    onChange={(e) => updateToken('cardBg', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={currentTokens.cardBg}
                    onChange={(e) => updateToken('cardBg', e.target.value)}
                    className="w-20 px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] font-mono uppercase bg-white"
                  />
                </div>
              </div>

              {/* Primary Buttons */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isAr ? 'الأزرار الأساسية (Buttons):' : 'Primary Action Buttons:'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{currentTokens.primaryBtnBg}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentTokens.primaryBtnBg}
                    onChange={(e) => {
                      updateToken('primaryBtnBg', e.target.value);
                      updateToken('accentColor', e.target.value);
                    }}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={currentTokens.primaryBtnBg}
                    onChange={(e) => {
                      updateToken('primaryBtnBg', e.target.value);
                      updateToken('accentColor', e.target.value);
                    }}
                    className="w-20 px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] font-mono uppercase bg-white"
                  />
                </div>
              </div>

              {/* Card Borders */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isAr ? 'الحدود والفواصل (Borders):' : 'Borders & Dividers:'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{currentTokens.cardBorder}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentTokens.cardBorder}
                    onChange={(e) => {
                      updateToken('cardBorder', e.target.value);
                      updateToken('borderColor', e.target.value);
                    }}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={currentTokens.cardBorder}
                    onChange={(e) => {
                      updateToken('cardBorder', e.target.value);
                      updateToken('borderColor', e.target.value);
                    }}
                    className="w-20 px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] font-mono uppercase bg-white"
                  />
                </div>
              </div>

              {/* Main Typography */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isAr ? 'لون النصوص الرئيسية (Text):' : 'Primary Text:'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{currentTokens.textMain}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentTokens.textMain}
                    onChange={(e) => updateToken('textMain', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={currentTokens.textMain}
                    onChange={(e) => updateToken('textMain', e.target.value)}
                    className="w-20 px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] font-mono uppercase bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cloud Sync Future Architecture Notice */}
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5">
              {isAr ? 'جاهزية الربط السحابي المركزي (SNNS.PRO Cloud):' : 'Cloud Architecture Ready:'}
            </span>
            <span>
              {isAr
                ? 'يتم حفظ المظهر محلياً في هذا المتصفح كطبقة أولى. البنية البرمجية مجهزة بالكامل لمزامنة إعدادات المدير مركزياً فور تفعيل الربط مع خادم SNNS.PRO.'
                : 'Custom tokens are preserved locally, structured with Design Tokens for central SNNS.PRO server synchronization.'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Live Real-Time Preview Area */}
      <div className="w-full md:w-[380px] bg-slate-100 p-4 sm:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'المعاينة المباشرة (Live Preview):' : 'Live Preview:'}</span>
            </span>

            <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-bold">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md ${previewDevice === 'desktop' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md ${previewDevice === 'mobile' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Mock Preview Box */}
          <div
            className={`mx-auto rounded-3xl overflow-hidden shadow-xl border border-slate-300 transition-all ${
              previewDevice === 'mobile' ? 'max-w-[240px]' : 'w-full'
            }`}
            style={{
              backgroundColor: currentTokens.bgColor,
              backgroundImage:
                currentTokens.bgType === 'gradient'
                  ? currentTokens.bgGradient
                  : currentTokens.bgType === 'image' && currentTokens.bgImage
                  ? `url(${currentTokens.bgImage})`
                  : undefined,
              backgroundSize: 'cover',
            }}
          >
            {/* Miniature Top Nav */}
            <div
              className="p-2.5 flex items-center justify-between border-b"
              style={{
                backgroundColor: currentTokens.topNavBg,
                color: currentTokens.topNavText,
                borderColor: currentTokens.topNavBorder,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="font-black text-[11px] tracking-tight">SNNS 365</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-white/20" />
                <span className="w-3 h-3 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Miniature Body Content */}
            <div className="p-3.5 space-y-2.5">
              {/* App Card Mock */}
              <div
                className="p-3 rounded-2xl border transition shadow-sm"
                style={{
                  backgroundColor: currentTokens.cardBg,
                  borderColor: currentTokens.cardBorder,
                  color: currentTokens.cardText,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[10px] text-white shadow-sm"
                    style={{ backgroundColor: currentTokens.primaryBtnBg }}
                  >
                    Q
                  </div>
                  <div>
                    <span className="font-black text-xs block leading-none" style={{ color: currentTokens.textMain }}>
                      {isAr ? 'قيد كاشير QAYD' : 'QAYD Cashier'}
                    </span>
                    <span className="text-[9px] block mt-0.5" style={{ color: currentTokens.textMuted }}>
                      {isAr ? 'نقاط بيع متطابقة' : 'Point of Sale'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] mb-2 leading-relaxed" style={{ color: currentTokens.textMuted }}>
                  {isAr ? 'نموذج معاينة لبطاقات وتطبيقات المشغل بالألوان المختارة.' : 'Live preview of application cards with selected colors.'}
                </p>

                <button
                  className="w-full py-1.5 px-3 rounded-xl font-bold text-[10px] shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: currentTokens.primaryBtnBg,
                    color: currentTokens.primaryBtnText,
                  }}
                >
                  <span>{isAr ? 'فتح التطبيق' : 'Launch App'}</span>
                </button>
              </div>

              {/* Second Card Mock */}
              <div
                className="p-2.5 rounded-xl border flex items-center justify-between"
                style={{
                  backgroundColor: currentTokens.cardBg,
                  borderColor: currentTokens.cardBorder,
                  color: currentTokens.cardText,
                }}
              >
                <span className="text-[10px] font-bold" style={{ color: currentTokens.textMain }}>
                  {isAr ? 'مستندات سحابية' : 'Cloud Docs'}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: `${currentTokens.primaryBtnBg}22`,
                    color: currentTokens.primaryBtnBg,
                  }}
                >
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {savedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'تم حفظ وتطبيق المظهر بنجاح!' : 'Theme saved & applied!'}</span>
            </div>
          )}

          {resetNotice && (
            <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'تمت استعادة المظهر الافتراضي الرسمي' : 'Reset to official default!'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-2">
          <button
            onClick={handleSaveAndApply}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ وتطبيق المظهر' : 'Save & Apply Theme'}</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset to Default'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
