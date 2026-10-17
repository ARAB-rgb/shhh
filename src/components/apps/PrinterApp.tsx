import React, { useState, useEffect } from 'react';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  RefreshCw,
  HardDrive,
  Cloud,
  Check,
  AlertCircle,
  Copy,
  Table as TableIcon,
  Presentation,
  CheckSquare,
  BookOpen,
  Calendar,
  Layers,
  Settings,
  Trash2,
  Play,
  FileCheck,
  Wifi,
  WifiOff,
  Search,
  Radio,
  Signal,
  Plus,
  Activity,
  ShieldCheck,
  ExternalLink,
  Laptop,
  Smartphone,
  Info,
  X,
  Zap,
} from 'lucide-react';
import { printService, PrinterHardwareStatus, WifiPrinterDevice } from '../../services/printService';
import { storage } from '../../services/storage';
import { AppId, PrintJob, RecentDocument } from '../../types/suite';
import {
  WordIcon,
  ExcelIcon,
  PowerPointIcon,
  SnnsAiIcon,
  PrinterAppIcon,
  FormsSurveyIcon,
} from '../icons/AppIcons';
import { PrintDialogModal } from '../common/PrintDialogModal';

interface PrinterAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
  onOpenApp?: (appId: AppId) => void;
}

export const PrinterApp: React.FC<PrinterAppProps> = ({ onBack, lang, onOpenApp }) => {
  const isAr = lang === 'ar';

  // Active Tab: default to 'wifi' for direct accessibility
  const [activeTab, setActiveTab] = useState<'wifi' | 'cloud-docs' | 'composer' | 'queue'>('wifi');

  // Printer Hardware Status
  const [printerStatus, setPrinterStatus] = useState<PrinterHardwareStatus>(printService.getPrinterStatus());
  const [printJobs, setPrintJobs] = useState<PrintJob[]>(storage.getPrintJobs());

  // Wi-Fi Printers State
  const [wifiPrinters, setWifiPrinters] = useState<WifiPrinterDevice[]>(() => printService.getWifiPrinters());
  const [isScanningWifi, setIsScanningWifi] = useState<boolean>(false);
  const [isPairingPrinterId, setIsPairingPrinterId] = useState<string | null>(null);
  const [wifiSearchQuery, setWifiSearchQuery] = useState<string>('');
  const [wifiBrandFilter, setWifiBrandFilter] = useState<string>('all');
  const [pingResults, setPingResults] = useState<Record<string, { latencyMs: number; statusText: string }>>({});

  // Manual Add Modal State
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualForm, setManualForm] = useState<{
    name: string;
    model: string;
    brand: 'HP' | 'Canon' | 'Epson' | 'Brother' | 'SNNS' | 'Generic';
    ipAddress: string;
    wifiSsid: string;
    port: number;
    protocol: string;
    colorSupported: boolean;
    duplexSupported: boolean;
    resolutionDpi: number;
  }>({
    name: '',
    model: '',
    brand: 'HP',
    ipAddress: '192.168.1.',
    wifiSsid: 'SNNS-Office-5G',
    port: 9100,
    protocol: 'AirPrint / IPP RAW',
    colorSupported: true,
    duplexSupported: true,
    resolutionDpi: 1200,
  });

  // WPS Quick Connect Modal State
  const [showWpsModal, setShowWpsModal] = useState<boolean>(false);
  const [wpsCountdown, setWpsCountdown] = useState<number>(120);
  const [wpsStatus, setWpsStatus] = useState<'searching' | 'connecting' | 'success'>('searching');

  // Cloud Docs from storage
  const [wordDocs, setWordDocs] = useState<any[]>([]);
  const [excelSheets, setExcelSheets] = useState<any[]>([]);
  const [pptDecks, setPptDecks] = useState<any[]>([]);
  const [selectedDocFilter, setSelectedDocFilter] = useState<'all' | 'word' | 'excel' | 'powerpoint'>('all');

  // Composer Form
  const [composerTitle, setComposerTitle] = useState(
    isAr ? 'تقرير رسمي معتمد - منظومة SNNS 365' : 'Official Enterprise Report - SNNS 365'
  );
  const [composerSubtitle, setComposerSubtitle] = useState(
    isAr ? 'صادر من الإدارة العامة للتحول الرقمي والإنتاجية' : 'Digital Transformation & Productivity Center'
  );
  const [composerContent, setComposerContent] = useState(
    isAr
      ? `<p>يسر إدارة منظومة <strong>SNNS 365</strong> السحابية تقديم هذا التقرير المطبوع المعتمد لتوثيق سير الأعمال الرقمية والمشاريع المنفذة.</p>
<table style="width:100%; border-collapse:collapse; margin:16px 0;">
  <thead>
    <tr style="background:#F1F5F9;">
      <th style="border:1px solid #CBD5E1; padding:8px;">المشروع / المهمة</th>
      <th style="border:1px solid #CBD5E1; padding:8px;">التطبيق المرتبط</th>
      <th style="border:1px solid #CBD5E1; padding:8px;">حالة الإنجاز</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #CBD5E1; padding:8px;">تفعيل وتشغيل الطابعة الذكية</td>
      <td style="border:1px solid #CBD5E1; padding:8px;">SNNS Cloud Print</td>
      <td style="border:1px solid #CBD5E1; padding:8px; color:#16A34A; font-weight:bold;">100% مكتمل ومفعل</td>
    </tr>
    <tr>
      <td style="border:1px solid #CBD5E1; padding:8px;">الربط اللاسلكي عبر Wi-Fi</td>
      <td style="border:1px solid #CBD5E1; padding:8px;">Wi-Fi 5GHz & AirPrint</td>
      <td style="border:1px solid #CBD5E1; padding:8px; color:#16A34A; font-weight:bold;">متصل بنجاح</td>
    </tr>
    <tr>
      <td style="border:1px solid #CBD5E1; padding:8px;">المستندات والحسابات السحابية</td>
      <td style="border:1px solid #CBD5E1; padding:8px;">Word & Excel</td>
      <td style="border:1px solid #CBD5E1; padding:8px; color:#16A34A; font-weight:bold;">حفظ تلقائي مباشر</td>
    </tr>
  </tbody>
</table>
<p>تم تدقيق واعتماد التقرير وجاهز للطباعة والأرشفة الرسمية.</p>`
      : `<p>SNNS 365 Productivity Cloud is pleased to present this verified print document.</p>
<table style="width:100%; border-collapse:collapse; margin:16px 0;">
  <thead>
    <tr style="background:#F1F5F9;">
      <th style="border:1px solid #CBD5E1; padding:8px;">Project / Task</th>
      <th style="border:1px solid #CBD5E1; padding:8px;">Connected App</th>
      <th style="border:1px solid #CBD5E1; padding:8px;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #CBD5E1; padding:8px;">Smart Printer Activation</td>
      <td style="border:1px solid #CBD5E1; padding:8px;">SNNS Cloud Print</td>
      <td style="border:1px solid #CBD5E1; padding:8px; color:#16A34A; font-weight:bold;">100% Active</td>
    </tr>
    <tr>
      <td style="border:1px solid #CBD5E1; padding:8px;">Wireless Wi-Fi Pairing</td>
      <td style="border:1px solid #CBD5E1; padding:8px;">Wi-Fi 5GHz & AirPrint</td>
      <td style="border:1px solid #CBD5E1; padding:8px; color:#16A34A; font-weight:bold;">Connected</td>
    </tr>
  </tbody>
</table>`
  );

  const [composerPaperSize, setComposerPaperSize] = useState<'A4' | 'Letter' | 'Legal' | 'A3'>('A4');
  const [composerOrientation, setComposerOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [composerColorMode, setComposerColorMode] = useState<'color' | 'monochrome'>('color');
  const [composerMargins, setComposerMargins] = useState<'normal' | 'narrow' | 'wide' | 'none'>('normal');
  const [composerCopies, setComposerCopies] = useState<number>(1);
  const [composerHeaderFooter, setComposerHeaderFooter] = useState<boolean>(true);

  // Modal Print Preview
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState({
    title: '',
    subtitle: '',
    contentHtml: '',
  });

  // Action status toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Active connected Wi-Fi printer
  const activeWifiPrinter =
    wifiPrinters.find((p) => p.isDefault && p.status === 'connected') ||
    wifiPrinters.find((p) => p.isDefault) ||
    wifiPrinters[0] || {
      id: 'prn-snns-1',
      name: 'SNNS UltraPrint 365 Pro MFP',
      model: 'Enterprise Cloud LaserJet MFP-8900',
      brand: 'SNNS' as const,
      ipAddress: '192.168.1.180',
      macAddress: '00:1E:8C:4F:92:A1',
      connectionType: 'wifi' as const,
      wifiSsid: 'SNNS-Office-5G',
      signalStrength: 100,
      status: 'connected' as const,
      isDefault: true,
      port: 9100,
      protocol: 'IPP / AirPrint',
      colorSupported: true,
      duplexSupported: true,
      resolutionDpi: 1200,
    };

  // Load real files from storage
  useEffect(() => {
    try {
      const words = Object.values(storage.getWordDocs() || {});
      setWordDocs(words);
      const excels = Object.values(storage.getExcelSheets() || {});
      setExcelSheets(excels);
      const ppts = Object.values(storage.getPPTs() || {});
      setPptDecks(ppts);
      setPrintJobs(storage.getPrintJobs());
    } catch (e) {
      console.error('Error loading documents for printer:', e);
    }
  }, []);

  // WPS Timer Countdown
  useEffect(() => {
    let interval: any;
    if (showWpsModal && wpsCountdown > 0 && wpsStatus === 'searching') {
      interval = setInterval(() => {
        setWpsCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          if (prev === 116) {
            setWpsStatus('connecting');
            setTimeout(() => {
              setWpsStatus('success');
              const currentPrn = printService.getActiveWifiPrinter();
              handleConnectWifi(currentPrn);
            }, 1800);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showWpsModal, wpsCountdown, wpsStatus]);

  // Wi-Fi Scanner Handler
  const handleScanWifi = async () => {
    setIsScanningWifi(true);
    showToast(isAr ? 'جاري فحص الشبكة المحلية ومجال Wi-Fi للبحث عن طابعات...' : 'Scanning local Wi-Fi network for wireless printers...');
    try {
      const refreshed = await printService.scanWifiPrinters();
      setWifiPrinters(refreshed);
      setPrinterStatus(printService.getPrinterStatus());
      showToast(isAr ? `اكتمل الفحص: تم العثور على ${refreshed.length} طابعات لاسلكية نشطة!` : `Scan complete: Found ${refreshed.length} active Wi-Fi printers!`);
    } catch {
      showToast(isAr ? 'تم تحديث قائمة الطابعات اللاسلكية.' : 'Wi-Fi printers refreshed.');
    } finally {
      setIsScanningWifi(false);
    }
  };

  // Wi-Fi Connect / Pair Handler
  const handleConnectWifi = async (printer: WifiPrinterDevice) => {
    setIsPairingPrinterId(printer.id);
    showToast(isAr ? `جاري التفاوض والاقتران اللاسلكي مع ${printer.name}...` : `Pairing wirelessly with ${printer.name}...`);
    try {
      await new Promise((r) => setTimeout(r, 700));
      const connected = await printService.connectWifiPrinter(printer.id);
      setWifiPrinters(printService.getWifiPrinters());
      setPrinterStatus(printService.getPrinterStatus());
      showToast(isAr ? `تم الربط بنجاح مع طابعة "${connected.name}" عبر Wi-Fi!` : `Successfully paired with "${connected.name}" over Wi-Fi!`);
    } catch {
      showToast(isAr ? 'حدث خطأ أثناء محاولة الربط اللاسلكي' : 'Error pairing with printer');
    } finally {
      setIsPairingPrinterId(null);
    }
  };

  // Ping Latency Test Handler
  const handlePingPrinter = async (printerId: string) => {
    showToast(isAr ? 'جاري فحص سرعة الاستجابة اللاسلكية Ping...' : 'Testing Wi-Fi ping latency...');
    const res = await printService.pingWifiPrinter(printerId);
    setPingResults((prev) => ({
      ...prev,
      [printerId]: { latencyMs: res.latencyMs, statusText: res.statusText },
    }));
    showToast(isAr ? `نتيجة الفحص اللاسلكي: ${res.statusText}` : `Ping result: ${res.statusText}`);
  };

  // Print Wi-Fi Configuration Report
  const handlePrintWifiConfig = (printer: WifiPrinterDevice) => {
    printService.printWifiConfigPage(printer);
    setPrintJobs(storage.getPrintJobs());
    showToast(isAr ? `جاري طباعة تقرير الاتصال اللاسلكي لطابعة ${printer.name}...` : `Printing Wi-Fi config sheet for ${printer.name}...`);
  };

  // Manual Add Printer
  const handleSaveManualPrinter = () => {
    if (!manualForm.name.trim() || !manualForm.ipAddress.trim()) {
      showToast(isAr ? 'يرجى إدخال اسم الطابعة وعنوان الـ IP' : 'Please provide printer name and IP address');
      return;
    }
    const added = printService.addCustomWifiPrinter({
      name: manualForm.name,
      model: manualForm.model || 'Network Wi-Fi Printer',
      brand: manualForm.brand,
      ipAddress: manualForm.ipAddress,
      wifiSsid: manualForm.wifiSsid,
      port: Number(manualForm.port) || 9100,
      protocol: manualForm.protocol,
      colorSupported: manualForm.colorSupported,
      duplexSupported: manualForm.duplexSupported,
      resolutionDpi: manualForm.resolutionDpi,
    });
    setWifiPrinters(printService.getWifiPrinters());
    setPrinterStatus(printService.getPrinterStatus());
    setShowManualModal(false);
    showToast(isAr ? `تم إضافة وربط الطابعة اللاسلكية "${added.name}" بنجاح!` : `Wi-Fi Printer "${added.name}" added & connected!`);
    setManualForm({
      name: '',
      model: '',
      brand: 'HP',
      ipAddress: '192.168.1.',
      wifiSsid: 'SNNS-Office-5G',
      port: 9100,
      protocol: 'AirPrint / IPP RAW',
      colorSupported: true,
      duplexSupported: true,
      resolutionDpi: 1200,
    });
  };

  // Remove Printer
  const handleRemovePrinter = (id: string, name: string) => {
    printService.removeWifiPrinter(id);
    setWifiPrinters(printService.getWifiPrinters());
    setPrinterStatus(printService.getPrinterStatus());
    showToast(isAr ? `تمت إزالة الطابعة "${name}" من القائمة` : `Printer "${name}" removed`);
  };

  // Quick Print Word Doc
  const handlePrintWordDoc = (doc: any) => {
    const title = doc.title || (isAr ? 'مستند Word' : 'Word Document');
    const content = doc.content || `<p>${isAr ? 'مستند نصي فارغ' : 'Empty document'}</p>`;
    printService.printContent(content, {
      title,
      docSubtitle: isAr ? 'مستند نصي محرر' : 'Word Document',
      orientation: 'portrait',
      paperSize: 'A4',
      colorMode: 'color',
      margins: 'normal',
      sourceApp: 'word',
    });
    setPrintJobs(storage.getPrintJobs());
    showToast(isAr ? `تم إرسال مستند "${title}" إلى الطابعة بنجاح!` : `Document "${title}" sent to printer!`);
  };

  // Quick Print Excel Sheet
  const handlePrintExcelSheet = (sheet: any) => {
    const title = sheet.title || (isAr ? 'مصنف Excel' : 'Excel Sheet');
    const cells = sheet.cells || {};
    let rowsHtml = '';
    for (let r = 1; r <= 18; r++) {
      let cellsInRow = '';
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((c) => {
        cellsInRow += `<td style="border:1px solid #CBD5E1; padding:6px 10px;">${cells[`${c}${r}`] || ''}</td>`;
      });
      rowsHtml += `<tr><td style="border:1px solid #CBD5E1; background:#F1F5F9; font-weight:bold; text-align:center;">${r}</td>${cellsInRow}</tr>`;
    }
    const content = `<table style="width:100%; border-collapse:collapse; font-size:10pt;">${rowsHtml}</table>`;

    printService.printContent(content, {
      title,
      docSubtitle: isAr ? 'جدول حسابات ومصنف إلكتروني' : 'Spreadsheet Calculations',
      orientation: 'landscape',
      paperSize: 'A4',
      colorMode: 'color',
      margins: 'normal',
      sourceApp: 'excel',
    });
    setPrintJobs(storage.getPrintJobs());
    showToast(isAr ? `تم إرسال مصنف "${title}" إلى الطابعة بنجاح!` : `Sheet "${title}" sent to printer!`);
  };

  // Quick Print PowerPoint Deck
  const handlePrintPptDeck = (deck: any) => {
    const title = deck.title || (isAr ? 'عرض PowerPoint' : 'PowerPoint Presentation');
    let slidesHtml = '';
    (deck.slides || []).forEach((s: any, idx: number) => {
      const bulletsList = (s.bullets || []).map((b: string) => `<li style="margin-bottom:4px;">${b}</li>`).join('');
      slidesHtml += `
        <div style="border:1px solid #CBD5E1; padding:16px; margin-bottom:16px; border-radius:8px; background:#FAFAFA;">
          <div style="font-size:9pt; color:#D83B01; font-weight:bold;">${isAr ? `الشريحة ${idx + 1}` : `Slide ${idx + 1}`}</div>
          <h3 style="margin:4px 0 8px 0; color:#111827;">${s.title}</h3>
          ${s.subtitle ? `<p style="color:#64748B; margin-bottom:8px;">${s.subtitle}</p>` : ''}
          <ul style="line-height:1.6;">${bulletsList}</ul>
        </div>
      `;
    });

    printService.printContent(slidesHtml, {
      title,
      docSubtitle: isAr ? 'شرائح عرض تقديمي' : 'Presentation Slides',
      orientation: 'portrait',
      paperSize: 'A4',
      colorMode: 'color',
      margins: 'normal',
      sourceApp: 'powerpoint',
    });
    setPrintJobs(storage.getPrintJobs());
    showToast(isAr ? `تم إرسال عرض "${title}" إلى الطابعة بنجاح!` : `Presentation "${title}" sent to printer!`);
  };

  // Print Test Page
  const handlePrintTestPage = () => {
    printService.printTestPage();
    setPrintJobs(storage.getPrintJobs());
    showToast(isAr ? 'جاري طباعة صفحة فحص ومعايرة الطابعة...' : 'Printing test & calibration page...');
  };

  // Print from composer
  const handlePrintComposer = () => {
    printService.printContent(composerContent, {
      title: composerTitle,
      docSubtitle: composerSubtitle,
      paperSize: composerPaperSize,
      orientation: composerOrientation,
      colorMode: composerColorMode,
      margins: composerMargins,
      headerFooter: composerHeaderFooter,
      copies: composerCopies,
      sourceApp: 'printer',
    });
    setPrintJobs(storage.getPrintJobs());
    showToast(isAr ? 'تم إرسال المستند بنجاح إلى أمر الطباعة!' : 'Document sent to printer successfully!');
  };

  // Open Preview Modal
  const handleOpenPreviewModal = (title: string, subtitle: string, contentHtml: string) => {
    setModalPayload({ title, subtitle, contentHtml });
    setModalOpen(true);
  };

  // Load Template in Composer
  const handleApplyTemplate = (type: string) => {
    if (type === 'letter') {
      setComposerTitle(isAr ? 'خطاب إداري رسمي' : 'Official Formal Letter');
      setComposerSubtitle(isAr ? 'سعادة المدير العام المحترم' : 'To the Respected General Manager');
      setComposerContent(
        isAr
          ? `<p>السلام عليكم ورحمة الله وبركاته،</p>
<p>إشارة إلى خطة تطوير البنية التحتية والتحول السحابي لمنظومة <strong>SNNS 365</strong>، يسرنا إحاطتكم باكتمال وتفعيل خدمة الطباعة الذكية والربط اللاسلكي المباشر عبر <strong>Wi-Fi</strong> مع كافة الطابعات بنجاح فائق.</p>
<p>نأمل التكرم بالاطلاع واعتماد التقرير المرفق.</p>
<p style="margin-top:28px;">وتفضلوا بقبول فائق التقدير والاحترام،،،</p>
<div style="margin-top:20px; font-weight:bold;">إدارة العمليات والأنظمة السحابية</div>`
          : `<p>Dear Executive Director,</p>
<p>We are pleased to inform you that the SNNS 365 Cloud Printing & Wi-Fi engine has been fully activated and tested with 100% operational success.</p>
<p>Sincerely,</p>
<div style="margin-top:20px; font-weight:bold;">Cloud Operations Division</div>`
      );
    } else if (type === 'invoice') {
      setComposerTitle(isAr ? 'فاتورة خدمات سحابية رسمية' : 'Official Cloud Service Invoice');
      setComposerSubtitle(isAr ? 'رقم الفاتورة: #INV-2026-8940' : 'Invoice #: INV-2026-8940');
      setComposerContent(
        isAr
          ? `<table style="width:100%; border-collapse:collapse; margin:16px 0;">
  <thead>
    <tr style="background:#0F172A; color:#FFF;">
      <th style="padding:10px; text-align:start;">الخدمة</th>
      <th style="padding:10px; text-align:center;">الكمية</th>
      <th style="padding:10px; text-align:center;">السعر</th>
      <th style="padding:10px; text-align:center;">المجموع</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #CBD5E1; padding:8px;">حزمة SNNS 365 Enterprise السنوية</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">1</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">3,500 ر.س</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">3,500 ر.س</td></tr>
    <tr><td style="border:1px solid #CBD5E1; padding:8px;">طابعة سحابية لاسلكية Wi-Fi CloudPrint</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">1</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">0.00 ر.س (مفعلة مجاناً)</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">0.00 ر.س</td></tr>
    <tr style="background:#F8FAFC; font-weight:bold;"><td colspan="3" style="border:1px solid #CBD5E1; padding:10px; text-align:start;">الإجمالي الكلي النهائي:</td><td style="border:1px solid #CBD5E1; padding:10px; text-align:center; color:#0284C7; font-size:12pt;">3,500 ر.س</td></tr>
  </tbody>
</table>`
          : `<table style="width:100%; border-collapse:collapse; margin:16px 0;">
  <thead>
    <tr style="background:#0F172A; color:#FFF;">
      <th style="padding:10px; text-align:start;">Service</th>
      <th style="padding:10px; text-align:center;">Qty</th>
      <th style="padding:10px; text-align:center;">Price</th>
      <th style="padding:10px; text-align:center;">Total</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #CBD5E1; padding:8px;">SNNS Enterprise License</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">1</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">$899.00</td><td style="border:1px solid #CBD5E1; padding:8px; text-align:center;">$899.00</td></tr>
  </tbody>
</table>`
      );
    }
    showToast(isAr ? 'تم تحميل قالب المستند بنجاح' : 'Template loaded');
  };

  // Clear Print Queue
  const handleClearQueue = () => {
    storage.clearPrintJobs();
    setPrintJobs([]);
    showToast(isAr ? 'تم مسح سجل الطباعة بنجاح' : 'Print queue cleared');
  };

  // Reprint Job
  const handleReprint = (job: PrintJob) => {
    printService.printContent(job.contentPreview || `<p>${job.title}</p>`, {
      title: job.title,
      paperSize: job.paperSize as any,
      colorMode: job.colorMode as any,
      copies: job.copies,
      sourceApp: job.sourceApp,
    });
    setPrintJobs(storage.getPrintJobs());
    showToast(isAr ? `جاري إعادة طباعة: "${job.title}"` : `Reprinting: "${job.title}"`);
  };

  // Filtered Wi-Fi printers
  const filteredWifiPrinters = wifiPrinters.filter((p) => {
    const matchesBrand = wifiBrandFilter === 'all' || p.brand.toLowerCase() === wifiBrandFilter.toLowerCase();
    const matchesQuery =
      wifiSearchQuery === '' ||
      p.name.toLowerCase().includes(wifiSearchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(wifiSearchQuery.toLowerCase()) ||
      p.ipAddress.includes(wifiSearchQuery) ||
      p.brand.toLowerCase().includes(wifiSearchQuery.toLowerCase());
    return matchesBrand && matchesQuery;
  });

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex-1 bg-slate-100/90 text-gray-900 flex flex-col overflow-y-auto selection:bg-blue-100 selection:text-blue-900 pb-16"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-gray-950 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title={isAr ? 'العودة لمشغل التطبيقات' : 'Back to Launcher'}
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            <span className="hidden sm:inline">{isAr ? 'الرئيسية' : 'Hub'}</span>
          </button>

          <div className="w-px h-6 bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-sky-50 border border-sky-200 shadow-xs">
              <PrinterAppIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-gray-950 tracking-tight flex items-center gap-1.5">
                  <span>{isAr ? 'طابعة SNNS الذكية والربط اللاسلكي' : 'SNNS Smart Cloud & Wi-Fi Printer'}</span>
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{isAr ? 'متصلة بالواي فاي' : 'Wi-Fi Online'}</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                {isAr
                  ? 'مركز الطباعة الموحد: البحث عن طابعات Wi-Fi والربط اللاسلكي، وطباعة Word وExcel والعروض السحابية'
                  : 'Unified Print Center: Wi-Fi printer discovery & pairing, Word, Excel, and presentations cloud printing'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Wi-Fi Quick Search Button */}
          <button
            onClick={() => {
              setActiveTab('wifi');
              handleScanWifi();
            }}
            disabled={isScanningWifi}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title={isAr ? 'البحث عن طابعات واي فاي والربط' : 'Scan for Wi-Fi Printers'}
          >
            <Wifi className={`w-4 h-4 text-emerald-600 ${isScanningWifi ? 'animate-bounce' : ''}`} />
            <span>{isScanningWifi ? (isAr ? 'جاري البحث...' : 'Scanning...') : isAr ? 'البحث عن طابعة Wi-Fi' : 'Scan Wi-Fi'}</span>
          </button>

          <button
            onClick={handlePrintTestPage}
            className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title={isAr ? 'طباعة صفحة معايرة واختبار الطابعة' : 'Print Test Page'}
          >
            <FileCheck className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">{isAr ? 'صفحة اختبار' : 'Test Page'}</span>
          </button>

          <button
            onClick={() => setActiveTab('composer')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'طباعة مستند الآن' : 'Print Document'}</span>
          </button>
        </div>
      </header>

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-sky-400/40 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Printer Hardware & Wireless Status Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-200 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Printer Details */}
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl shadow-md border border-white/10 shrink-0">
                <Printer className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-gray-900">{activeWifiPrinter.name}</h2>
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                    {activeWifiPrinter.model}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-gray-700 font-bold flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{activeWifiPrinter.ipAddress}</span>
                    <span className="text-gray-400 font-normal">({activeWifiPrinter.wifiSsid})</span>
                  </span>
                  <span>•</span>
                  <span>{isAr ? 'الدقة: 1200 DPI ليزر فائق الوضوح' : '1200 DPI Ultra LaserJet'}</span>
                  <span>•</span>
                  <span>{isAr ? `إجمالي المطبوعات: ${printerStatus.totalPagesPrinted} صفحة` : `${printerStatus.totalPagesPrinted} pages total`}</span>
                </p>

                {/* Wireless Connection Quick Bar */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <Signal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAr ? `متصلة لاسلكياً (${activeWifiPrinter.signalStrength}%)` : `Wi-Fi Connected (${activeWifiPrinter.signalStrength}%)`}</span>
                  </span>

                  <button
                    onClick={() => {
                      setActiveTab('wifi');
                      handleScanWifi();
                    }}
                    className="text-xs text-sky-700 hover:text-sky-900 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
                  >
                    <Search className="w-3 h-3 text-sky-600" />
                    <span>{isAr ? 'البحث عن طابعة أخرى / ربط واي فاي' : 'Search / Switch Wi-Fi Printer'}</span>
                  </button>

                  <button
                    onClick={() => handlePrintWifiConfig(activeWifiPrinter)}
                    className="text-xs text-slate-700 hover:text-slate-900 font-medium hover:underline flex items-center gap-1 cursor-pointer bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200"
                  >
                    <FileText className="w-3 h-3 text-sky-600" />
                    <span>{isAr ? 'طباعة تقرير Wi-Fi' : 'Print Wi-Fi Report'}</span>
                  </button>

                  <button
                    onClick={() => handlePingPrinter(activeWifiPrinter.id)}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-medium hover:underline flex items-center gap-1 cursor-pointer bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Zap className="w-3 h-3 text-emerald-600" />
                    <span>{isAr ? 'فحص استجابة Ping' : 'Ping Test'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ink Levels & Paper Tray Gauges */}
            <div className="w-full lg:w-auto flex flex-wrap items-center gap-4 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
              {/* Cyan */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-gray-600 mb-1">C</div>
                <div className="w-4 h-12 bg-gray-200 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                  <div
                    style={{ height: `${printerStatus.inkLevels.cyan}%` }}
                    className="w-full bg-cyan-400 rounded-full transition-all"
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-gray-600 mt-1">{printerStatus.inkLevels.cyan}%</span>
              </div>

              {/* Magenta */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-gray-600 mb-1">M</div>
                <div className="w-4 h-12 bg-gray-200 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                  <div
                    style={{ height: `${printerStatus.inkLevels.magenta}%` }}
                    className="w-full bg-fuchsia-500 rounded-full transition-all"
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-gray-600 mt-1">{printerStatus.inkLevels.magenta}%</span>
              </div>

              {/* Yellow */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-gray-600 mb-1">Y</div>
                <div className="w-4 h-12 bg-gray-200 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                  <div
                    style={{ height: `${printerStatus.inkLevels.yellow}%` }}
                    className="w-full bg-amber-400 rounded-full transition-all"
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-gray-600 mt-1">{printerStatus.inkLevels.yellow}%</span>
              </div>

              {/* Black */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-gray-600 mb-1">K</div>
                <div className="w-4 h-12 bg-gray-200 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                  <div
                    style={{ height: `${printerStatus.inkLevels.black}%` }}
                    className="w-full bg-slate-900 rounded-full transition-all"
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-gray-600 mt-1">{printerStatus.inkLevels.black}%</span>
              </div>

              <div className="w-px h-10 bg-gray-200 mx-1 hidden sm:block" />

              {/* Paper Tray */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-2xs">
                  <FileText className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-800">{isAr ? 'درج الورق A4' : 'Paper Tray (A4)'}</div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {printerStatus.paperTray.current} / {printerStatus.paperTray.max} ({printerStatus.paperTray.percentage}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {/* TAB: WI-FI PRINTERS DISCOVERY & PAIRING */}
          <button
            onClick={() => setActiveTab('wifi')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'wifi'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Wifi className="w-4 h-4 text-emerald-300" />
            <span>{isAr ? 'البحث عن طابعة والربط واي فاي' : 'Wi-Fi Search & Pairing'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'wifi' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800 font-bold'
              }`}
            >
              {wifiPrinters.length}
            </span>
          </button>

          {/* TAB: CLOUD DOCS */}
          <button
            onClick={() => setActiveTab('cloud-docs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'cloud-docs'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>{isAr ? 'مستندات المنظومة الجاهزة للطباعة' : 'Cloud Documents'}</span>
          </button>

          {/* TAB: COMPOSER */}
          <button
            onClick={() => setActiveTab('composer')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'composer'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isAr ? 'محرر الطباعة السريع والقوالب' : 'Quick Print Composer'}</span>
          </button>

          {/* TAB: QUEUE */}
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'طابور وسجل الطباعة' : 'Print Queue & History'}</span>
            {printJobs.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'queue' ? 'bg-white text-sky-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {printJobs.length}
              </span>
            )}
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: WI-FI SEARCH & PAIRING CENTER (FEATURE REQUEST) */}
        {/* ======================================================== */}
        {activeTab === 'wifi' && (
          <div className="space-y-6">
            {/* Top Wi-Fi Discovery Controls & Network Radar Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 end-0 -mt-10 -me-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 start-0 -mb-10 -ms-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </span>
                    <h3 className="text-lg sm:text-xl font-black tracking-tight">
                      {isAr ? 'البحث عن طابعات واي فاي والاقتران اللاسلكي' : 'Wi-Fi Printer Discovery & Wireless Pairing'}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {isAr
                      ? 'اكتشاف ومسح تلقائي لكافة طابعات الشبكة المحلية (HP, Canon, Epson, Brother, SNNS) عبر بروتوكولات AirPrint, Wi-Fi Direct, IPP و Mopria دون الحاجة لأي كابلات.'
                      : 'Automatic detection of all local Wi-Fi printers (HP, Canon, Epson, Brother, SNNS) via AirPrint, Wi-Fi Direct, IPP, and Mopria.'}
                  </p>

                  {/* Network Adapter Pill */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'الشبكة المتصل بها:' : 'Connected SSID:'}</span>
                      <strong className="text-white font-mono">{activeWifiPrinter.wifiSsid}</strong>
                    </span>

                    <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>WPA2/WPA3 Personal</span>
                    </span>

                    <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[11px]">
                      IP: 192.168.1.104
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                  {/* Scan Button */}
                  <button
                    onClick={handleScanWifi}
                    disabled={isScanningWifi}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isScanningWifi ? 'animate-spin' : ''}`} />
                    <span>{isScanningWifi ? (isAr ? 'جاري المسح والبحث...' : 'Scanning...') : isAr ? 'فحص والبحث عن طابعات' : 'Scan Wi-Fi Printers'}</span>
                  </button>

                  {/* Add by IP */}
                  <button
                    onClick={() => setShowManualModal(true)}
                    className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة بالـ IP' : 'Add by IP'}</span>
                  </button>

                  {/* WPS Push Button */}
                  <button
                    onClick={() => {
                      setWpsCountdown(120);
                      setWpsStatus('searching');
                      setShowWpsModal(true);
                    }}
                    className="px-3.5 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 font-bold text-xs rounded-xl border border-sky-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title={isAr ? 'الاقتران السريع بزر WPS' : 'WPS Push Button Pairing'}
                  >
                    <Zap className="w-4 h-4 text-sky-400" />
                    <span>WPS</span>
                  </button>
                </div>
              </div>

              {/* Scanning Active Radar Animation Banner */}
              {isScanningWifi && (
                <div className="mt-5 p-4 rounded-2xl bg-white/10 border border-emerald-400/30 flex items-center gap-3 animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <div className="text-xs text-emerald-200">
                    <strong>{isAr ? 'جاري إرسال بث استكشاف mDNS / Bonjour / SSDP عبر شبكة الواي فاي...' : 'Broadcasting mDNS / Bonjour / SSDP discovery on local Wi-Fi...'}</strong>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {isAr ? 'يتم فحص منافذ IPP 631 و RAW 9100 والتعرف على بصمات الأجهزة...' : 'Probing IPP 631 and RAW 9100 ports...'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search by IP or Name */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={wifiSearchQuery}
                  onChange={(e) => setWifiSearchQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث باسم الطابعة، الموديل، أو عنوان IP...' : 'Search printer name, model, IP...'}
                  className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-gray-50/50"
                />
              </div>

              {/* Brand Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-500 me-1">{isAr ? 'الشركة المصنعة:' : 'Brand:'}</span>
                {['all', 'HP', 'Canon', 'Epson', 'Brother', 'SNNS'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setWifiBrandFilter(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      wifiBrandFilter.toLowerCase() === b.toLowerCase()
                        ? 'bg-slate-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {b === 'all' ? (isAr ? 'الكل' : 'All') : b}
                  </button>
                ))}
              </div>
            </div>

            {/* Discovered Wireless Printers Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                  <Signal className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'طابعات Wi-Fi المكتشفة في النطاق:' : 'Discovered Wi-Fi Printers:'}</span>
                  <span className="text-xs text-gray-500 font-normal">({filteredWifiPrinters.length})</span>
                </h4>
                <span className="text-[11px] text-gray-500">
                  {isAr ? 'اضغط «ربط واي فاي» لتعيين الطابعة كطابعة افتراضية نشطة' : 'Click "Connect Wi-Fi" to make it your active default printer'}
                </span>
              </div>

              {filteredWifiPrinters.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-gray-200">
                  <WifiOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-gray-700">
                    {isAr ? 'لم يتم العثور على طابعات مطابقة للبحث' : 'No matching Wi-Fi printers found'}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    {isAr
                      ? 'تأكد من تشغيل الطابعة واتصالها بنفس شبكة الواي فاي، أو اضغط «إضافة بالـ IP» لإدخالها مباشرة.'
                      : 'Make sure your printer is turned on and on the same Wi-Fi network, or click "Add by IP" to specify manually.'}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={handleScanWifi}
                      className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-500"
                    >
                      {isAr ? 'إعادة الفحص' : 'Rescan Network'}
                    </button>
                    <button
                      onClick={() => setShowManualModal(true)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                    >
                      {isAr ? 'إدخال عنوان IP يدوياً' : 'Add by IP'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWifiPrinters.map((printer) => {
                    const isConnected = printer.status === 'connected' && printer.isDefault;
                    const isPairing = isPairingPrinterId === printer.id;
                    const pingInfo = pingResults[printer.id];

                    // Brand colors
                    const brandBadgeColor = {
                      HP: 'bg-blue-50 text-blue-700 border-blue-200',
                      Canon: 'bg-red-50 text-red-700 border-red-200',
                      Epson: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                      Brother: 'bg-orange-50 text-orange-800 border-orange-200',
                      SNNS: 'bg-cyan-50 text-cyan-800 border-cyan-200',
                      Generic: 'bg-gray-50 text-gray-700 border-gray-200',
                    }[printer.brand];

                    return (
                      <div
                        key={printer.id}
                        className={`bg-white rounded-2xl p-5 border transition shadow-xs flex flex-col justify-between ${
                          isConnected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Card Top: Brand, Model, Signal */}
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border font-mono ${brandBadgeColor}`}
                              >
                                {printer.brand}
                              </span>
                              <div>
                                <h4 className="font-bold text-sm text-gray-950 flex items-center gap-1.5">
                                  <span>{printer.name}</span>
                                </h4>
                                <p className="text-[11px] text-gray-500">{printer.model}</p>
                              </div>
                            </div>

                            {/* Signal Strength Meter */}
                            <div className="flex flex-col items-end">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isConnected
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}
                              >
                                <Signal className="w-3 h-3 text-emerald-600" />
                                <span>{printer.signalStrength}%</span>
                              </span>
                              <span className="text-[9px] text-gray-400 mt-0.5 font-mono">
                                {printer.connectionType === 'wifi-direct' ? 'Wi-Fi Direct' : 'Wi-Fi 5GHz'}
                              </span>
                            </div>
                          </div>

                          {/* Technical Specifications Specs */}
                          <div className="mt-3.5 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                            <div>
                              <span className="text-gray-400 text-[10px] block">{isAr ? 'عنوان IP اللاسلكي:' : 'IP Address:'}</span>
                              <strong className="font-mono text-gray-800 text-xs">{printer.ipAddress}</strong>
                            </div>

                            <div>
                              <span className="text-gray-400 text-[10px] block">{isAr ? 'شبكة Wi-Fi:' : 'SSID:'}</span>
                              <span className="font-mono text-gray-700">{printer.wifiSsid}</span>
                            </div>

                            <div>
                              <span className="text-gray-400 text-[10px] block">{isAr ? 'المنفذ والبروتوكول:' : 'Port & Protocol:'}</span>
                              <span className="text-gray-700 font-mono">
                                Port {printer.port} • {printer.protocol.split('/')[0]}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-400 text-[10px] block">{isAr ? 'الدقة والميزات:' : 'Specs:'}</span>
                              <span className="text-gray-700">
                                {printer.colorSupported ? (isAr ? 'ألوان' : 'Color') : isAr ? 'أبيض/أسود' : 'Mono'} • {printer.resolutionDpi} DPI
                              </span>
                            </div>
                          </div>

                          {/* Ping latency indicator if tested */}
                          {pingInfo && (
                            <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                              <span className="flex items-center gap-1 font-bold">
                                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isAr ? 'زمن الاستجابة:' : 'Ping:'}</span>
                              </span>
                              <span className="font-mono font-bold">{pingInfo.statusText}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {/* Ping Button */}
                            <button
                              onClick={() => handlePingPrinter(printer.id)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title={isAr ? 'فحص زمن استجابة الواي فاي Ping' : 'Test Wi-Fi Latency'}
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span className="hidden sm:inline">Ping</span>
                            </button>

                            {/* Print Wi-Fi Config Button */}
                            <button
                              onClick={() => handlePrintWifiConfig(printer)}
                              className="p-1.5 hover:bg-sky-50 rounded-lg text-sky-700 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title={isAr ? 'طباعة تقرير تكوين Wi-Fi' : 'Print Wi-Fi Config Sheet'}
                            >
                              <FileText className="w-3.5 h-3.5 text-sky-600" />
                              <span className="hidden sm:inline">{isAr ? 'تقرير Wi-Fi' : 'Report'}</span>
                            </button>

                            {/* Remove button if custom */}
                            {printer.id.startsWith('prn-custom-') && (
                              <button
                                onClick={() => handleRemovePrinter(printer.id, printer.name)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                                title={isAr ? 'حذف هذه الطابعة' : 'Remove Printer'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Primary Connection State Button */}
                          {isConnected ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>{isAr ? 'متصلة وهي الافتراضية' : 'Connected & Default'}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConnectWifi(printer)}
                              disabled={isPairing}
                              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Wifi className="w-3.5 h-3.5" />
                              <span>{isPairing ? (isAr ? 'جاري الاقتران...' : 'Connecting...') : isAr ? 'ربط واي فاي الآن' : 'Connect via Wi-Fi'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Wireless Protocols & Device Ecosystem Guide */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-4">
              <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-sky-600" />
                <span>{isAr ? 'بروتوكولات التوافق والطباعة اللاسلكية المعتمدة:' : 'Supported Wireless Print Protocols:'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <span>Apple AirPrint</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {isAr
                      ? 'طباعة فورية من أجهزة Mac, iPad, iPhone دون الحاجة لتثبيت أي برامج تشغيل خارجية.'
                      : 'Zero-driver wireless printing from macOS, iPadOS, and iOS devices natively.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Mopria & Android Wi-Fi</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {isAr
                      ? 'معيار الطباعة الموحد لكافة هواتف وأجهزة أندرويد اللوحية وأنظمة ويندوز عبر الشبكة.'
                      : 'Universal wireless print alliance standard for Android devices and Windows PCs.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Radio className="w-4 h-4 text-purple-600" />
                    <span>Wi-Fi Direct & WPS</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {isAr
                      ? 'إنشاء شبكة لاسلكية مباشرة مع الطابعة للطباعة الفورية حتى في حال انقطاع الراوتر أو الإنترنت.'
                      : 'Direct peer-to-peer wireless connection with the printer without requiring a router.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CLOUD DOCUMENTS */}
        {/* ======================================================== */}
        {activeTab === 'cloud-docs' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-500 ms-1 me-2">{isAr ? 'تصفية المستندات:' : 'Filter:'}</span>
                <button
                  onClick={() => setSelectedDocFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedDocFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isAr ? 'جميع الملفات' : 'All Docs'}
                </button>
                <button
                  onClick={() => setSelectedDocFilter('word')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedDocFilter === 'word' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <WordIcon className="w-3.5 h-3.5" />
                  <span>Word</span>
                </button>
                <button
                  onClick={() => setSelectedDocFilter('excel')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedDocFilter === 'excel' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ExcelIcon className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => setSelectedDocFilter('powerpoint')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedDocFilter === 'powerpoint' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <PowerPointIcon className="w-3.5 h-3.5" />
                  <span>PowerPoint</span>
                </button>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                {isAr ? 'اختر مستنداً لإرساله للطباعة مباشرة عبر الواي فاي' : 'Select a document to print directly via Wi-Fi'}
              </div>
            </div>

            {/* Documents List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Word Documents */}
              {(selectedDocFilter === 'all' || selectedDocFilter === 'word') &&
                wordDocs.map((doc: any, i: number) => (
                  <div
                    key={doc.id || `word-${i}`}
                    className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-blue-300 transition shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <WordIcon className="w-5 h-5 shrink-0" />
                        <h4 className="font-bold text-xs text-gray-900 truncate">
                          {doc.title || (isAr ? `مستند Word رقم ${i + 1}` : `Word Doc ${i + 1}`)}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2">
                        {doc.content ? doc.content.replace(/<[^>]*>?/gm, '').slice(0, 100) : (isAr ? 'مستند نصي رسمي معتمد' : 'Official Word document')}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">Word .docx</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPreviewModal(doc.title || 'مستند Word', 'Word Document', doc.content || '<p>فارغ</p>')}
                          className="px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50 rounded-lg font-bold transition"
                        >
                          {isAr ? 'معاينة' : 'Preview'}
                        </button>
                        <button
                          onClick={() => handlePrintWordDoc(doc)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{isAr ? 'طباعة' : 'Print'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Excel Sheets */}
              {(selectedDocFilter === 'all' || selectedDocFilter === 'excel') &&
                excelSheets.map((sheet: any, i: number) => (
                  <div
                    key={sheet.id || `excel-${i}`}
                    className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 transition shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ExcelIcon className="w-5 h-5 shrink-0" />
                        <h4 className="font-bold text-xs text-gray-900 truncate">
                          {sheet.title || (isAr ? `مصنف Excel رقم ${i + 1}` : `Excel Sheet ${i + 1}`)}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        {isAr ? 'جدول حسابات وجداول إلكترونية مجهزة بتنسيق أفقي (Landscape)' : 'Spreadsheet with calculations and landscape layout'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">Excel .xlsx</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePrintExcelSheet(sheet)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{isAr ? 'طباعة' : 'Print'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {/* PowerPoint Presentations */}
              {(selectedDocFilter === 'all' || selectedDocFilter === 'powerpoint') &&
                pptDecks.map((deck: any, i: number) => (
                  <div
                    key={deck.id || `ppt-${i}`}
                    className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-amber-300 transition shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <PowerPointIcon className="w-5 h-5 shrink-0" />
                        <h4 className="font-bold text-xs text-gray-900 truncate">
                          {deck.title || (isAr ? `عرض PowerPoint رقم ${i + 1}` : `PowerPoint Deck ${i + 1}`)}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        {isAr ? `عرض شرائح تقديمي يحتوي ${(deck.slides || []).length || 1} شرائح` : `Presentation with ${(deck.slides || []).length || 1} slides`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">PPT .pptx</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePrintPptDeck(deck)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{isAr ? 'طباعة' : 'Print'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: QUICK PRINT COMPOSER */}
        {/* ======================================================== */}
        {activeTab === 'composer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor Sidebar */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                <span>{isAr ? 'إعدادات وخيارات الطباعة:' : 'Print Layout Settings:'}</span>
              </h3>

              {/* Templates */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1.5">
                  {isAr ? 'قوالب جاهزة سريعة:' : 'Quick Templates:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApplyTemplate('letter')}
                    className="p-2 rounded-xl bg-gray-50 hover:bg-sky-50 border border-gray-200 text-xs font-bold text-gray-700 hover:text-sky-800 transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>{isAr ? 'خطاب إداري' : 'Official Letter'}</span>
                  </button>
                  <button
                    onClick={() => handleApplyTemplate('invoice')}
                    className="p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 text-xs font-bold text-gray-700 hover:text-emerald-800 transition flex items-center gap-1.5"
                  >
                    <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAr ? 'فاتورة رسمية' : 'Invoice'}</span>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  {isAr ? 'عنوان المستند المطبوع:' : 'Document Title:'}
                </label>
                <input
                  type="text"
                  value={composerTitle}
                  onChange={(e) => setComposerTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  {isAr ? 'العنوان الفرعي أو جهة الإصدار:' : 'Subtitle / Division:'}
                </label>
                <input
                  type="text"
                  value={composerSubtitle}
                  onChange={(e) => setComposerSubtitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Paper & Orientation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">{isAr ? 'مقاس الورق:' : 'Paper Size:'}</label>
                  <select
                    value={composerPaperSize}
                    onChange={(e) => setComposerPaperSize(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 font-bold bg-white"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="Letter">Letter (8.5 × 11 in)</option>
                    <option value="Legal">Legal</option>
                    <option value="A3">A3</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">{isAr ? 'الاتجاه:' : 'Orientation:'}</label>
                  <select
                    value={composerOrientation}
                    onChange={(e) => setComposerOrientation(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 font-bold bg-white"
                  >
                    <option value="portrait">{isAr ? 'عمودي (Portrait)' : 'Portrait'}</option>
                    <option value="landscape">{isAr ? 'أفقي (Landscape)' : 'Landscape'}</option>
                  </select>
                </div>
              </div>

              {/* Color Mode & Copies */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">{isAr ? 'نمط الألوان:' : 'Color Mode:'}</label>
                  <select
                    value={composerColorMode}
                    onChange={(e) => setComposerColorMode(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 font-bold bg-white"
                  >
                    <option value="color">{isAr ? 'ألوان كاملة (Color)' : 'Full Color'}</option>
                    <option value="monochrome">{isAr ? 'أبيض وأسود (Monochrome)' : 'Monochrome'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">{isAr ? 'عدد النسخ:' : 'Copies:'}</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={composerCopies}
                    onChange={(e) => setComposerCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 font-bold text-center"
                  />
                </div>
              </div>

              {/* Print Action Buttons */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button
                  onClick={handlePrintComposer}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isAr ? 'إرسال أمر الطباعة عبر Wi-Fi' : 'Send Print via Wi-Fi'}</span>
                </button>

                <button
                  onClick={() => handleOpenPreviewModal(composerTitle, composerSubtitle, composerContent)}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'معاينة ورقية متقدمة' : 'Advanced Paper Preview'}</span>
                </button>
              </div>
            </div>

            {/* Document Live Content & Canvas */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-gray-700">{isAr ? 'محتوى الورقة المطبوعة (HTML / Rich Text):' : 'Print Page Content:'}</h4>
                <span className="text-[10px] text-gray-400 font-mono">Real-time Paper Rendering</span>
              </div>

              <textarea
                value={composerContent}
                onChange={(e) => setComposerContent(e.target.value)}
                rows={14}
                className="w-full p-4 rounded-2xl border border-gray-200 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 leading-relaxed"
                placeholder={isAr ? 'اكتب أو الصق محتوى التقرير هنا...' : 'Write or paste print content here...'}
              />

              {/* Live Rendered Paper Box */}
              <div className="mt-4 p-6 bg-white border border-gray-300 rounded-2xl shadow-inner text-xs">
                <div className="border-b-2 border-sky-600 pb-2 mb-4 flex items-center justify-between">
                  <div className="font-black text-sky-700 text-sm">{activeWifiPrinter.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{activeWifiPrinter.wifiSsid}</div>
                </div>
                <h2 className="text-base font-bold text-gray-900">{composerTitle}</h2>
                <h3 className="text-xs text-gray-500 mb-4">{composerSubtitle}</h3>
                <div
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: composerContent }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: QUEUE & HISTORY */}
        {/* ======================================================== */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-gray-900">
                  {isAr ? 'سجل مهام ووظائف الطباعة المنفذة' : 'Executed Print Jobs Log'}
                </h3>
              </div>

              {printJobs.length > 0 && (
                <button
                  onClick={handleClearQueue}
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مسح السجل' : 'Clear Log'}</span>
                </button>
              )}
            </div>

            {printJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <Printer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-gray-700">{isAr ? 'لا توجد مهام سابقة' : 'No past print jobs'}</h4>
                <p className="text-xs text-gray-400 mt-1">
                  {isAr ? 'أي مستند تطبعه سيظهر تلقائياً هنا مع إمكانية إعادة طباعته' : 'Printed docs will show up here'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-2xs">
                {printJobs.map((job) => (
                  <div key={job.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                        <Printer className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-gray-900 truncate">{job.title}</h4>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded-md border border-emerald-200">
                            {isAr ? 'مكتملة بنجاح' : 'Success'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                          <span>{job.timestamp}</span>
                          <span>•</span>
                          <span>{job.paperSize}</span>
                          <span>•</span>
                          <span>{job.colorMode === 'color' ? (isAr ? 'ملون' : 'Color') : isAr ? 'أبيض وأسود' : 'Monochrome'}</span>
                          <span>•</span>
                          <span>{job.copies} {isAr ? 'نسخة' : 'copies'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReprint(job)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-sky-50 hover:text-sky-700 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        title={isAr ? 'إعادة الطباعة' : 'Reprint'}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إعادة طباعة' : 'Reprint'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MANUAL ADD WI-FI PRINTER MODAL */}
      {/* ======================================================== */}
      {showManualModal && (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
          onClick={() => setShowManualModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-900">
                    {isAr ? 'إضافة طابعة واي فاي بالـ IP يدوياً' : 'Add Wi-Fi Printer by IP'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isAr ? 'الربط المباشر مع طابعة موجودة على شبكتك المحلية' : 'Direct wireless connection to a local printer IP'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isAr ? 'عنوان الـ IP اللاسلكي للطابعة (مطلوب):' : 'Printer IP Address (Required):'}
                </label>
                <input
                  type="text"
                  value={manualForm.ipAddress}
                  onChange={(e) => setManualForm({ ...manualForm, ipAddress: e.target.value })}
                  placeholder="192.168.1.xxx"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isAr ? 'اسم الطابعة المعرف (مطلوب):' : 'Printer Display Name:'}
                </label>
                <input
                  type="text"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder={isAr ? 'مثال: HP OfficeJet Pro Wireless' : 'e.g. HP OfficeJet Pro Wireless'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">{isAr ? 'الشركة المصنعة:' : 'Brand:'}</label>
                  <select
                    value={manualForm.brand}
                    onChange={(e) => setManualForm({ ...manualForm, brand: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-bold"
                  >
                    <option value="HP">HP</option>
                    <option value="Canon">Canon</option>
                    <option value="Epson">Epson</option>
                    <option value="Brother">Brother</option>
                    <option value="SNNS">SNNS</option>
                    <option value="Generic">Generic / أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">{isAr ? 'المنفذ (Port):' : 'Port:'}</label>
                  <input
                    type="number"
                    value={manualForm.port}
                    onChange={(e) => setManualForm({ ...manualForm, port: parseInt(e.target.value) || 9100 })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">{isAr ? 'بروتوكول الطباعة:' : 'Protocol:'}</label>
                  <select
                    value={manualForm.protocol}
                    onChange={(e) => setManualForm({ ...manualForm, protocol: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs"
                  >
                    <option value="AirPrint / IPP RAW">AirPrint / RAW 9100</option>
                    <option value="IPP 2.0 (Port 631)">IPP 2.0 (Port 631)</option>
                    <option value="LPR / LPD (Port 515)">LPR / LPD (Port 515)</option>
                    <option value="WSD / Mopria">WSD / Mopria</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">{isAr ? 'اسم شبكة الواي فاي:' : 'Wi-Fi SSID:'}</label>
                  <input
                    type="text"
                    value={manualForm.wifiSsid}
                    onChange={(e) => setManualForm({ ...manualForm, wifiSsid: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualForm.colorSupported}
                    onChange={(e) => setManualForm({ ...manualForm, colorSupported: e.target.checked })}
                    className="rounded text-sky-600"
                  />
                  <span>{isAr ? 'تدعم الطباعة الملونة' : 'Color Supported'}</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualForm.duplexSupported}
                    onChange={(e) => setManualForm({ ...manualForm, duplexSupported: e.target.checked })}
                    className="rounded text-sky-600"
                  />
                  <span>{isAr ? 'طباعة وجهين (Duplex)' : 'Duplex Supported'}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                onClick={handleSaveManualPrinter}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'فحص وربط الطابعة' : 'Test & Connect'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WPS PUSH-BUTTON QUICK CONNECT MODAL */}
      {/* ======================================================== */}
      {showWpsModal && (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
          onClick={() => setShowWpsModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center border-2 border-sky-200 relative">
              <Zap className={`w-8 h-8 ${wpsStatus === 'searching' ? 'animate-pulse' : ''}`} />
              {wpsStatus === 'searching' && (
                <div className="absolute inset-0 rounded-full border-2 border-sky-400 animate-ping" />
              )}
            </div>

            <div>
              <h3 className="font-black text-base text-gray-900">
                {isAr ? 'الاقتران اللاسلكي السريع WPS' : 'WPS Quick Wireless Pairing'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {isAr
                  ? 'اضغط الآن على زر WPS الموجود في الطابعة الخاصة بك خلال دقيقتين وسيتم الاقتران تلقائياً.'
                  : 'Press the WPS button on your printer within 2 minutes to complete automatic pairing.'}
              </p>
            </div>

            {/* Live Status and Countdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-2">
              <div className="text-3xl font-black font-mono text-sky-600 tracking-wider">
                {Math.floor(wpsCountdown / 60)}:{(wpsCountdown % 60).toString().padStart(2, '0')}
              </div>

              <div className="text-xs font-bold text-gray-700">
                {wpsStatus === 'searching' && (isAr ? 'جاري الاستماع لإشارة زر WPS من الطابعة...' : 'Listening for WPS signal...')}
                {wpsStatus === 'connecting' && (isAr ? 'تم استلام الإشارة! جاري التفاوض وتبادل المفاتيح...' : 'Signal received! Exchanging keys...')}
                {wpsStatus === 'success' && (isAr ? '🟢 تم الاقتران والربط بنجاح!' : '🟢 Paired successfully!')}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowWpsModal(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                {wpsStatus === 'success' ? (isAr ? 'إغلاق ومتابعة' : 'Done') : isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Preview Modal */}
      <PrintDialogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalPayload.title}
        subtitle={modalPayload.subtitle}
        contentHtml={modalPayload.contentHtml}
        lang={lang}
      />
    </div>
  );
};
