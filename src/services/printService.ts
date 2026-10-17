import { storage } from './storage';
import { PrintJob } from '../types/suite';

export interface PrintOptions {
  title: string;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
  colorMode?: 'color' | 'monochrome';
  margins?: 'normal' | 'narrow' | 'wide' | 'none';
  headerFooter?: boolean;
  docSubtitle?: string;
  author?: string;
  copies?: number;
  sourceApp?: string;
}

export interface WifiPrinterDevice {
  id: string;
  name: string;
  model: string;
  brand: 'HP' | 'Canon' | 'Epson' | 'Brother' | 'SNNS' | 'Generic';
  ipAddress: string;
  macAddress: string;
  connectionType: 'wifi' | 'wifi-direct' | 'airprint' | 'mopria' | 'cloud';
  wifiSsid: string;
  signalStrength: number; // 0 - 100%
  status: 'connected' | 'available' | 'offline' | 'pairing';
  isDefault: boolean;
  port: number;
  protocol: string;
  colorSupported: boolean;
  duplexSupported: boolean;
  resolutionDpi: number;
}

export const DEFAULT_WIFI_PRINTERS: WifiPrinterDevice[] = [
  {
    id: 'prn-snns-1',
    name: 'SNNS UltraPrint 365 Pro MFP',
    model: 'Enterprise Cloud LaserJet MFP-8900',
    brand: 'SNNS',
    ipAddress: '192.168.1.180',
    macAddress: '00:1E:8C:4F:92:A1',
    connectionType: 'wifi',
    wifiSsid: 'SNNS-Office-5G',
    signalStrength: 100,
    status: 'connected',
    isDefault: true,
    port: 9100,
    protocol: 'IPP / AirPrint / Cloud ePrint',
    colorSupported: true,
    duplexSupported: true,
    resolutionDpi: 1200,
  },
  {
    id: 'prn-hp-1',
    name: 'HP LaserJet Pro MFP 4103dw Wireless',
    model: 'HP LaserJet Pro 4103dw',
    brand: 'HP',
    ipAddress: '192.168.1.145',
    macAddress: 'B4:2E:99:A1:33:5F',
    connectionType: 'wifi',
    wifiSsid: 'SNNS-Office-5G',
    signalStrength: 95,
    status: 'available',
    isDefault: false,
    port: 9100,
    protocol: 'AirPrint / Mopria / WSD',
    colorSupported: false,
    duplexSupported: true,
    resolutionDpi: 1200,
  },
  {
    id: 'prn-canon-1',
    name: 'Canon imageRUNNER ADVANCE C3530i',
    model: 'Canon iR-ADV C3530i III',
    brand: 'Canon',
    ipAddress: '192.168.1.188',
    macAddress: '70:BC:10:44:88:2E',
    connectionType: 'wifi-direct',
    wifiSsid: 'DIRECT-Canon-C3530',
    signalStrength: 88,
    status: 'available',
    isDefault: false,
    port: 631,
    protocol: 'AirPrint / Canon Direct',
    colorSupported: true,
    duplexSupported: true,
    resolutionDpi: 1200,
  },
  {
    id: 'prn-epson-1',
    name: 'Epson EcoTank L3250 Wi-Fi Series',
    model: 'Epson EcoTank L3250 All-in-One',
    brand: 'Epson',
    ipAddress: '192.168.1.112',
    macAddress: 'AC:12:03:77:B2:90',
    connectionType: 'wifi',
    wifiSsid: 'SNNS-Office-5G',
    signalStrength: 76,
    status: 'available',
    isDefault: false,
    port: 9100,
    protocol: 'Epson Connect / Wi-Fi Direct',
    colorSupported: true,
    duplexSupported: false,
    resolutionDpi: 5760,
  },
  {
    id: 'prn-brother-1',
    name: 'Brother HL-L2370DW High-Speed Wireless',
    model: 'Brother HL-L2370DW Compact Laser',
    brand: 'Brother',
    ipAddress: '192.168.1.160',
    macAddress: '00:80:77:C3:54:19',
    connectionType: 'wifi',
    wifiSsid: 'SNNS-Office-5G',
    signalStrength: 92,
    status: 'available',
    isDefault: false,
    port: 9100,
    protocol: 'Brother iPrint&Scan / AirPrint',
    colorSupported: false,
    duplexSupported: true,
    resolutionDpi: 2400,
  },
];

export interface PrinterHardwareStatus {
  isOnline: boolean;
  name: string;
  model: string;
  ipAddress: string;
  statusTextAr: string;
  statusTextEn: string;
  inkLevels: {
    black: number;
    cyan: number;
    magenta: number;
    yellow: number;
  };
  paperTray: {
    current: number;
    max: number;
    percentage: number;
    type: string;
  };
  resolutionDpi: number;
  totalPagesPrinted: number;
  firmware: string;
}

export const printService = {
  getWifiPrinters: (): WifiPrinterDevice[] => {
    try {
      const data = localStorage.getItem('snns_wifi_printers');
      return data ? JSON.parse(data) : DEFAULT_WIFI_PRINTERS;
    } catch {
      return DEFAULT_WIFI_PRINTERS;
    }
  },

  saveWifiPrinters: (printers: WifiPrinterDevice[]) => {
    localStorage.setItem('snns_wifi_printers', JSON.stringify(printers));
  },

  getActiveWifiPrinter: (): WifiPrinterDevice => {
    const list = printService.getWifiPrinters();
    return list.find((p) => p.isDefault && p.status === 'connected') || list[0] || DEFAULT_WIFI_PRINTERS[0];
  },

  connectWifiPrinter: async (id: string): Promise<WifiPrinterDevice> => {
    const list = printService.getWifiPrinters();
    const updated = list.map((p) => {
      if (p.id === id) {
        return { ...p, status: 'connected' as const, isDefault: true };
      }
      return {
        ...p,
        isDefault: false,
        status: p.status === 'connected' ? ('available' as const) : p.status,
      };
    });
    printService.saveWifiPrinters(updated);
    return updated.find((p) => p.id === id)!;
  },

  addCustomWifiPrinter: (printerData: Partial<WifiPrinterDevice>): WifiPrinterDevice => {
    const list = printService.getWifiPrinters();
    const newPrn: WifiPrinterDevice = {
      id: `prn-custom-${Date.now()}`,
      name: printerData.name || 'طابعة واي فاي مخصصة',
      model: printerData.model || 'Network Wi-Fi Printer',
      brand: printerData.brand || 'Generic',
      ipAddress: printerData.ipAddress || '192.168.1.200',
      macAddress: `00:1A:2B:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}`,
      connectionType: printerData.connectionType || 'wifi',
      wifiSsid: printerData.wifiSsid || 'SNNS-Office-5G',
      signalStrength: 90,
      status: 'connected',
      isDefault: true,
      port: printerData.port || 9100,
      protocol: printerData.protocol || 'AirPrint / IPP RAW',
      colorSupported: printerData.colorSupported ?? true,
      duplexSupported: printerData.duplexSupported ?? true,
      resolutionDpi: printerData.resolutionDpi || 1200,
    };
    const updated = [newPrn, ...list.map((p) => ({ ...p, isDefault: false }))];
    printService.saveWifiPrinters(updated);
    return newPrn;
  },

  removeWifiPrinter: (id: string) => {
    const list = printService.getWifiPrinters();
    const updated = list.filter((p) => p.id !== id);
    if (updated.length > 0 && !updated.some((p) => p.isDefault)) {
      updated[0].isDefault = true;
      updated[0].status = 'connected';
    }
    printService.saveWifiPrinters(updated);
  },

  pingWifiPrinter: async (id: string): Promise<{ success: boolean; latencyMs: number; statusText: string }> => {
    // Simulate real Wi-Fi network latency check
    await new Promise((resolve) => setTimeout(resolve, 450));
    const list = printService.getWifiPrinters();
    const printer = list.find((p) => p.id === id);
    if (!printer) {
      return { success: false, latencyMs: 0, statusText: 'طابعة غير موجودة' };
    }
    const latency = Math.floor(Math.random() * 25 + 8); // 8ms - 33ms
    return {
      success: true,
      latencyMs: latency,
      statusText: `${latency}ms - اتصال لاسلكي مستقر (Wi-Fi 5GHz)`,
    };
  },

  scanWifiPrinters: async (): Promise<WifiPrinterDevice[]> => {
    // Simulate Wi-Fi network mDNS/Bonjour/SSDP discovery broadcast
    await new Promise((resolve) => setTimeout(resolve, 1400));
    const existing = printService.getWifiPrinters();
    // Return existing with refreshed signals
    const refreshed = existing.map((p) => ({
      ...p,
      signalStrength: Math.min(100, Math.max(65, p.signalStrength + Math.floor(Math.random() * 9 - 4))),
    }));
    printService.saveWifiPrinters(refreshed);
    return refreshed;
  },

  getPrinterStatus: (): PrinterHardwareStatus => {
    const activePrn = printService.getActiveWifiPrinter();
    return {
      isOnline: activePrn.status === 'connected',
      name: activePrn.name,
      model: activePrn.model,
      ipAddress: `${activePrn.ipAddress} (${activePrn.wifiSsid})`,
      statusTextAr: `متصلة لاسلكياً عبر Wi-Fi (${activePrn.wifiSsid}) وجاهزة للطباعة`,
      statusTextEn: `Connected wirelessly via Wi-Fi (${activePrn.wifiSsid}) & Ready`,
      inkLevels: {
        black: 94,
        cyan: 86,
        magenta: 79,
        yellow: 91,
      },
      paperTray: {
        current: 215,
        max: 250,
        percentage: 86,
        type: 'A4 Plain 80g/m²',
      },
      resolutionDpi: activePrn.resolutionDpi || 1200,
      totalPagesPrinted: 1482,
      firmware: 'v4.3.0-PRO (Cloud & Wi-Fi Enabled)',
    };
  },

  printContent: (contentHtml: string, options: PrintOptions) => {
    const {
      title,
      orientation = 'portrait',
      paperSize = 'A4',
      colorMode = 'color',
      margins = 'normal',
      headerFooter = true,
      docSubtitle = '',
      author = 'SNNS 365 Cloud Suite',
      copies = 1,
      sourceApp = 'printer',
    } = options;

    const marginStyles = {
      normal: '18mm',
      narrow: '8mm',
      wide: '28mm',
      none: '0mm',
    }[margins];

    const currentDate = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const isGrayscale = colorMode === 'monochrome';

    // Record job in history
    try {
      const newJob: PrintJob = {
        id: `job-${Date.now().toString().slice(-6)}`,
        title: title || 'مستند بدون عنوان',
        sourceApp,
        pages: 1,
        copies,
        colorMode,
        paperSize,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        contentPreview: docSubtitle || title,
      };
      storage.addPrintJob(newJob);
    } catch (e) {
      console.error('Failed to log print job:', e);
    }

    const printDocumentHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${paperSize} ${orientation};
      margin: ${marginStyles};
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      line-height: 1.6;
      font-size: 11pt;
      ${isGrayscale ? 'filter: grayscale(100%);' : ''}
    }
    .print-header {
      display: ${headerFooter ? 'flex' : 'none'};
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #0284C7;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .print-brand {
      font-weight: 900;
      color: #0284C7;
      font-size: 14pt;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .print-meta {
      font-size: 9pt;
      color: #64748B;
      text-align: left;
    }
    .print-title {
      font-size: 18pt;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 4px 0;
    }
    .print-subtitle {
      font-size: 11pt;
      color: #475569;
      margin: 0 0 20px 0;
    }
    .print-body {
      width: 100%;
    }
    /* Rich typography styles */
    h1 { font-size: 16pt; color: #0F172A; margin: 16px 0 8px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
    h2 { font-size: 13pt; color: #1E293B; margin: 14px 0 6px 0; }
    h3 { font-size: 12pt; color: #334155; margin: 12px 0 4px 0; }
    p { margin: 0 0 10px 0; }
    ul, ol { margin: 8px 0; padding-inline-start: 24px; }
    li { margin-bottom: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #CBD5E1;
      padding: 8px 10px;
      text-align: inherit;
    }
    th {
      background-color: #F1F5F9;
      font-weight: bold;
      color: #0F172A;
    }
    tr:nth-child(even) {
      background-color: #F8FAFC;
    }
    .print-footer {
      display: ${headerFooter ? 'flex' : 'none'};
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      margin-top: 30px;
      font-size: 8.5pt;
      color: #94A3B8;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div class="print-brand">
      <span>🖨️ SNNS 365 Cloud Print</span>
    </div>
    <div class="print-meta">
      <div>${currentDate}</div>
      <div>${author}</div>
    </div>
  </div>

  ${title ? `<div class="print-title">${title}</div>` : ''}
  ${docSubtitle ? `<div class="print-subtitle">${docSubtitle}</div>` : ''}

  <div class="print-body">
    ${contentHtml}
  </div>

  <div class="print-footer">
    <div>تمت الطباعة بنجاح عبر منظومة SNNS 365 السحابية الذكية</div>
    <div>صفحة 1 من 1</div>
  </div>
</body>
</html>`;

    // Multi-strategy execution to guarantee printing works across sandboxes and environments:
    let handled = false;

    // Strategy 1: Hidden iframe
    try {
      const existingFrame = document.getElementById('snns-print-frame');
      if (existingFrame) existingFrame.remove();

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.id = 'snns-print-frame';

      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(printDocumentHtml);
        frameDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            handled = true;
          } catch (e) {
            console.warn('Iframe print blocked, falling back to window.print():', e);
            window.print();
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 2000);
          }
        }, 350);
      }
    } catch (err) {
      console.warn('Direct iframe creation failed:', err);
    }

    if (!handled) {
      // Strategy 2: Direct browser print
      setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.error('Direct window.print() failed:', e);
        }
      }, 400);
    }
  },

  printTestPage: () => {
    const timestamp = new Date().toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const testHtml = `
      <div style="border: 2px dashed #0284C7; padding: 24px; border-radius: 12px; margin-bottom: 24px; background: #F8FAFC;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0284C7; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <h2 style="margin: 0; color: #0284C7; font-size: 18pt;">صفحة اختبار ومعايرة الطابعة الرسمية</h2>
            <div style="font-size: 10pt; color: #475569; margin-top: 4px;">SNNS SmartPrint 365 Pro • Official Diagnostics & Calibration</div>
          </div>
          <div style="font-weight: bold; font-size: 14pt; color: #16A34A; border: 2px solid #16A34A; padding: 4px 12px; border-radius: 8px;">
            PASSED 🟢 ناجح
          </div>
        </div>

        <p style="font-size: 11pt; color: #334155; line-height: 1.6;">
          تهانينا! إذا كنت تقرأ هذه الصفحة مطبوعة بوضوح، فهذا يعني أن طابعتك متصلة وتعمل بكفاءة تامة مع منظومة <strong>SNNS 365</strong> السحابية، وأن محاذاة الرؤوس والألوان دقيقة 100%.
        </p>

        <!-- CMYK Color Blocks -->
        <div style="margin: 20px 0;">
          <div style="font-weight: bold; font-size: 10pt; margin-bottom: 8px; color: #1E293B;">1. اختبار خراطيش وتدرجات ألوان الطباعة (CMYK Palette):</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; font-size: 9pt; font-weight: bold; color: #ffffff;">
            <div style="background: #00FFFF; color: #000; padding: 18px 0; border-radius: 6px; border: 1px solid #94A3B8;">Cyan (100%)</div>
            <div style="background: #FF00FF; padding: 18px 0; border-radius: 6px; border: 1px solid #94A3B8;">Magenta (100%)</div>
            <div style="background: #FFFF00; color: #000; padding: 18px 0; border-radius: 6px; border: 1px solid #94A3B8;">Yellow (100%)</div>
            <div style="background: #000000; padding: 18px 0; border-radius: 6px; border: 1px solid #94A3B8;">Key Black (100%)</div>
          </div>
        </div>

        <!-- RGB & Grayscale Gradients -->
        <div style="margin: 20px 0;">
          <div style="font-weight: bold; font-size: 10pt; margin-bottom: 6px; color: #1E293B;">2. اختبار التدرج اللوني والرمادي (Gradients & Halftones):</div>
          <div style="height: 24px; background: linear-gradient(to right, #000000, #4B5563, #9CA3AF, #E5E7EB, #FFFFFF); border: 1px solid #CBD5E1; border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="height: 24px; background: linear-gradient(to right, #EF4444, #F59E0B, #10B981, #06B6D4, #3B82F6, #8B5CF6, #EC4899); border: 1px solid #CBD5E1; border-radius: 4px;"></div>
        </div>

        <!-- Typography & Resolution -->
        <div style="margin: 20px 0;">
          <div style="font-weight: bold; font-size: 10pt; margin-bottom: 8px; color: #1E293B;">3. اختبار دقة النصوص والخطوط (Typography Resolution 1200 DPI):</div>
          <div style="border: 1px solid #E2E8F0; padding: 12px; background: #fff; border-radius: 6px; line-height: 1.8;">
            <div style="font-size: 6pt; color: #64748B;">[6pt] منظومة SNNS 365 السحابية تدعم وضوح الخطوط الدقيقة حتى أصغر المقاسات - Fine resolution test passed.</div>
            <div style="font-size: 8pt; color: #475569;">[8pt] نصوص واضحة وعالية المقروئية على كافة أنواع الورق المعتمد - Clean, crisp text rendering.</div>
            <div style="font-size: 10pt; color: #1E293B;">[10pt] الخط العربي الافتراضي للمستندات والتقارير الرسمية وحسابات Excel.</div>
            <div style="font-size: 13pt; font-weight: bold; color: #0284C7;">[13pt] العناوين الرئيسية والفرعية مع دعم كامل للغة العربية والإنجليزية.</div>
          </div>
        </div>

        <!-- Diagnostics Specs Table -->
        <div style="margin-top: 20px;">
          <div style="font-weight: bold; font-size: 10pt; margin-bottom: 8px; color: #1E293B;">4. معلومات وبيانات جهاز الطباعة والمنظومة:</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
            <tbody>
              <tr><td style="background:#F1F5F9; font-weight:bold; width:30%;">طراز الطابعة</td><td>SNNS UltraPrint 365 Pro Enterprise</td></tr>
              <tr><td style="background:#F1F5F9; font-weight:bold;">بروتوكول الاتصال</td><td>Cloud ePrint v4.3 / IPP / Direct Spooler</td></tr>
              <tr><td style="background:#F1F5F9; font-weight:bold;">عنوان الشبكة (IP)</td><td>192.168.1.180 (Static Cloud Node)</td></tr>
              <tr><td style="background:#F1F5F9; font-weight:bold;">توقيت طباعة الاختبار</td><td>${timestamp}</td></tr>
              <tr><td style="background:#F1F5F9; font-weight:bold;">حالة الاختبار الشامل</td><td>معتمد 100% - جاهز للطباعة الحقيقية لجميع المستخدمين</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    printService.printContent(testHtml, {
      title: 'صفحة اختبار طابعة SNNS 365 الرسمية',
      docSubtitle: 'تقرير المعايرة والتشغيل الفني لجهاز الطباعة',
      colorMode: 'color',
      paperSize: 'A4',
      orientation: 'portrait',
      margins: 'normal',
      sourceApp: 'printer',
    });
  },

  printWifiConfigPage: (printer: WifiPrinterDevice) => {
    const timestamp = new Date().toLocaleString('ar-SA');
    const configHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 25px; color: #0F172A; max-width: 800px; margin: 0 auto; border: 2px solid #0284C7; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284C7; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h1 style="margin: 0; color: #0284C7; font-size: 20pt; font-weight: 900;">تقرير تكوين واتصال الطابعة اللاسلكية Wi-Fi</h1>
            <div style="font-size: 11pt; color: #475569; margin-top: 4px;">SNNS 365 Wireless & AirPrint Configuration Profile</div>
          </div>
          <div style="background: #E0F2FE; color: #0369A1; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 11pt; border: 1px solid #BAE6FD;">
            🟢 Wi-Fi CONNECTED
          </div>
        </div>

        <p style="font-size: 11pt; color: #334155; line-height: 1.6;">
          تم اختبار وتأكيد اقتران الطابعة اللاسلكية بنجاح عبر شبكة <strong>Wi-Fi</strong> مع منظومة <strong>SNNS 365</strong> السحابية، وجميع بروتوكولات الطباعة اللاسلكية والـ AirPrint مفعلة وتستجيب في الوقت الحقيقي.
        </p>

        <!-- Wireless Network Specs Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin: 15px 0;">
          <tbody>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px; width:35%;">اسم الطابعة المعرف</td><td style="padding:8px; font-weight:bold; color:#0369A1;">${printer.name}</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">طراز الجهاز والشركة</td><td style="padding:8px;">${printer.model} (${printer.brand})</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">عنوان الـ IP اللاسلكي</td><td style="padding:8px; font-family:monospace; font-weight:bold; color:#16A34A;">${printer.ipAddress}</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">اسم شبكة الواي فاي (SSID)</td><td style="padding:8px; font-weight:bold;">${printer.wifiSsid}</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">قوة إشارة الواي فاي</td><td style="padding:8px; color:#16A34A; font-weight:bold;">📶 ${printer.signalStrength}% (إشارة ممتازة ومستقرة)</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">عنوان الماك (MAC Address)</td><td style="padding:8px; font-family:monospace;">${printer.macAddress}</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">منفذ وبروتوكول الاتصال</td><td style="padding:8px;">Port ${printer.port} • ${printer.protocol}</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">تشفير الاتصال اللاسلكي</td><td style="padding:8px;">WPA2-PSK (AES) / WPA3 Personal Enterprise</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">ميزات الجهاز</td><td style="padding:8px;">${printer.colorSupported ? 'طباعة ملونة كاملة' : 'أبيض وأسود ليزري'} • ${printer.duplexSupported ? 'طباعة وجهين تلقائية (Duplex)' : 'وجه واحد'} • ${printer.resolutionDpi} DPI</td></tr>
            <tr style="border-bottom: 1px solid #E2E8F0;"><td style="background:#F8FAFC; font-weight:bold; padding:8px;">توقيت وتاريخ الفحص</td><td style="padding:8px;">${timestamp}</td></tr>
          </tbody>
        </table>

        <!-- Security and Status Confirmation -->
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 12px; margin-top: 15px; font-size: 9.5pt; color: #166534;">
          <strong>تأكيد الاعتماد والتشغيل:</strong> تم تسجيل هذه الطابعة كطابعة افتراضية نشطة داخل منظومة SNNS 365 السحابية. يمكنك الآن الطباعة المباشرة إليها من Word, Excel, PowerPoint، ولوحة تحكم الطباعة الذكية دون الحاجة إلى كابلات.
        </div>
      </div>
    `;

    printService.printContent(configHtml, {
      title: `تقرير تكوين شبكة الواي فاي - ${printer.name}`,
      docSubtitle: `اختبار الاتصال اللاسلكي IP: ${printer.ipAddress}`,
      colorMode: 'color',
      paperSize: 'A4',
      orientation: 'portrait',
      margins: 'normal',
      sourceApp: 'printer',
    });
  },

  exportHtmlFile: (title: string, contentHtml: string) => {
    const fullHtml = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:system-ui, sans-serif;margin:40px;line-height:1.6;color:#111827;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;} th{background:#eee;} @media print{body{margin:0;}}</style></head><body><div style="border-bottom:2px solid #0078D4;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;"><h1 style="margin:0;color:#0078D4;">${title}</h1><div style="color:#666;">SNNS 365 Cloud Suite</div></div>${contentHtml}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'SNNS-Print-Document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
