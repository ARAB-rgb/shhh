import React, { useState } from 'react';
import {
  Printer,
  X,
  Check,
  FileText,
  Sliders,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Download,
  Settings,
  HardDrive,
  Cloud,
  Wifi,
} from 'lucide-react';
import { printService, PrintOptions, WifiPrinterDevice } from '../../services/printService';

interface PrintDialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  contentHtml: string;
  lang: 'en' | 'ar';
}

export const PrintDialogModal: React.FC<PrintDialogModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  contentHtml,
  lang,
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const [destination, setDestination] = useState<'system' | 'pdf' | 'cloud'>('system');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState<'A4' | 'Letter' | 'Legal' | 'A3'>('A4');
  const [colorMode, setColorMode] = useState<'color' | 'monochrome'>('color');
  const [margins, setMargins] = useState<'normal' | 'narrow' | 'wide' | 'none'>('normal');
  const [copies, setCopies] = useState<number>(1);
  const [includeHeaderFooter, setIncludeHeaderFooter] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [wifiPrinters] = useState<WifiPrinterDevice[]>(() => printService.getWifiPrinters());
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(() => {
    const active = printService.getActiveWifiPrinter();
    return active ? active.id : 'prn-snns-1';
  });

  const handleExecutePrint = () => {
    setIsPrinting(true);

    const options: PrintOptions = {
      title,
      docSubtitle: subtitle,
      orientation,
      paperSize,
      colorMode,
      margins,
      headerFooter: includeHeaderFooter,
    };

    if (destination === 'pdf') {
      printService.exportHtmlFile(title, contentHtml);
      setTimeout(() => {
        setIsPrinting(false);
        onClose();
      }, 500);
      return;
    }

    printService.printContent(contentHtml, options);
    setTimeout(() => {
      setIsPrinting(false);
      onClose();
    }, 600);
  };

  const currentDate = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden text-gray-800 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-5 sm:px-7 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base tracking-tight">
                  {isAr ? 'طابعة SNNS 365 الذكية' : 'SNNS 365 Smart Cloud Print'}
                </h2>
                <span className="bg-blue-400/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                {isAr
                  ? 'معاينة حية وإعدادات طباعة متقدمة للورق أو الحفظ كـ PDF'
                  : 'Real-time print preview with paper and layout configuration'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecutePrint}
              disabled={isPrinting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? (isAr ? 'جاري الإرسال...' : 'Printing...') : isAr ? 'طباعة الآن' : 'Print Now'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body: Left Settings & Right Live Paper Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Settings Sidebar */}
          <aside className="w-full md:w-80 bg-gray-50/90 p-5 overflow-y-auto border-b md:border-b-0 md:border-e border-gray-200 text-xs space-y-4 shrink-0">
            {/* Destination */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'الوجهة وطابعة الإخراج:' : 'Destination:'}</span>
              </label>

              <div className="space-y-1.5">
                {[
                  {
                    id: 'system' as const,
                    nameAr: 'طابعة النظام / الورقية المباشرة',
                    nameEn: 'System Printer',
                    icon: HardDrive,
                  },
                  {
                    id: 'pdf' as const,
                    nameAr: 'حفظ كملف PDF رقمي سحابي',
                    nameEn: 'Save as PDF Document',
                    icon: Download,
                  },
                  {
                    id: 'cloud' as const,
                    nameAr: 'طابعة SNNS Cloud الآمنة',
                    nameEn: 'SNNS Cloud Print',
                    icon: Cloud,
                  },
                ].map((dest) => {
                  const IconComp = dest.icon;
                  const isSelected = destination === dest.id;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => setDestination(dest.id)}
                      className={`w-full p-2 rounded-xl border text-start flex items-center gap-2.5 transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-900 shadow-xs ring-1 ring-blue-300'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="truncate">{isAr ? dest.nameAr : dest.nameEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Wi-Fi Printer Quick Target (when printing to system/cloud) */}
              {(destination === 'system' || destination === 'cloud') && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'طابعة Wi-Fi المتصلة:' : 'Connected Wi-Fi Printer:'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Wi-Fi 5GHz
                    </span>
                  </div>

                  <select
                    value={selectedPrinterId}
                    onChange={(e) => {
                      setSelectedPrinterId(e.target.value);
                      printService.connectWifiPrinter(e.target.value);
                    }}
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-gray-300 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {wifiPrinters.map((prn) => (
                      <option key={prn.id} value={prn.id}>
                        {prn.name} ({prn.brand} - {prn.ipAddress})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Orientation */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
              <label className="font-bold text-gray-800 block">
                {isAr ? 'اتجاه الصفحة (Orientation):' : 'Orientation:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    orientation === 'portrait'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-3.5 h-4.5 border-2 border-current rounded-xs inline-block" />
                  <span>{isAr ? 'عمودي' : 'Portrait'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    orientation === 'landscape'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-4.5 h-3.5 border-2 border-current rounded-xs inline-block" />
                  <span>{isAr ? 'أفقي' : 'Landscape'}</span>
                </button>
              </div>
            </div>

            {/* Paper Size & Copies */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-3">
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  {isAr ? 'حجم الورق (Paper Size):' : 'Paper Size:'}
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                  <option value="A3">A3 (297 × 420 mm)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  {isAr ? 'عدد النسخ (Copies):' : 'Copies:'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Color Mode & Margins */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-3">
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  {isAr ? 'نمط الألوان (Color):' : 'Color Mode:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorMode('color')}
                    className={`py-1.5 px-2 rounded-xl border text-center font-bold ${
                      colorMode === 'color'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {isAr ? 'ألوان كاملة' : 'Color'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('monochrome')}
                    className={`py-1.5 px-2 rounded-xl border text-center font-bold ${
                      colorMode === 'monochrome'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {isAr ? 'أبيض وأسود' : 'Monochrome'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  {isAr ? 'الهوامش (Margins):' : 'Margins:'}
                </label>
                <select
                  value={margins}
                  onChange={(e) => setMargins(e.target.value as any)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">{isAr ? 'عادي (20 مم)' : 'Normal (20mm)'}</option>
                  <option value="narrow">{isAr ? 'ضيق (10 مم)' : 'Narrow (10mm)'}</option>
                  <option value="wide">{isAr ? 'عريض (30 مم)' : 'Wide (30mm)'}</option>
                  <option value="none">{isAr ? 'بلا هوامش' : 'None'}</option>
                </select>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeaderFooter}
                  onChange={(e) => setIncludeHeaderFooter(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span className="font-semibold text-gray-700">
                  {isAr ? 'طباعة الرأس والتذييل (التاريخ والعنوان)' : 'Include headers & footers'}
                </span>
              </label>
            </div>
          </aside>

          {/* Right Live Paper Preview Area */}
          <main className="flex-1 bg-slate-100/90 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-start">
            {/* Preview Toolbar */}
            <div className="w-full max-w-2xl mb-3 flex items-center justify-between bg-white px-4 py-2 rounded-2xl shadow-xs border border-gray-200 text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'معاينة الورقة المطبوعة' : 'Live Print Preview'}</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  ({paperSize} • {orientation === 'portrait' ? (isAr ? 'عمودي' : 'Portrait') : isAr ? 'أفقي' : 'Landscape'})
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold text-gray-600 px-1">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 15))}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 ms-1"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Paper Sheet Preview */}
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease',
              }}
              className={`bg-white shadow-xl border border-gray-300 rounded-sm text-gray-900 transition-all ${
                orientation === 'portrait'
                  ? 'w-[520px] min-h-[735px] p-8'
                  : 'w-[735px] min-h-[520px] p-8'
              } ${colorMode === 'monochrome' ? 'grayscale' : ''}`}
            >
              {/* Sheet Header */}
              {includeHeaderFooter && (
                <div className="flex items-center justify-between border-b-2 border-[#0078D4] pb-2 mb-6 text-xs text-gray-500">
                  <div className="font-black text-[#0078D4] text-sm tracking-wide">SNNS 365</div>
                  <div className="text-end text-[10px]">
                    <div>{currentDate}</div>
                    <div>SNNS Cloud Print</div>
                  </div>
                </div>
              )}

              {/* Document Title */}
              {title && (
                <div className="mb-4">
                  <h1 className="text-xl font-black text-gray-950 tracking-tight mb-1">{title}</h1>
                  {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
                </div>
              )}

              {/* Document Content */}
              <div
                className="text-xs leading-relaxed text-gray-800 break-words"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              {/* Sheet Footer */}
              {includeHeaderFooter && (
                <div className="mt-8 pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
                  <div>{isAr ? 'تمت الطباعة بواسطة منظومة SNNS 365' : 'Printed via SNNS 365 Cloud Suite'}</div>
                  <div>{isAr ? 'صفحة 1 من 1' : 'Page 1 of 1'}</div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
