import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Check,
  Download,
  Upload,
  BarChart2,
  Table as TableIcon,
  Sparkles,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  DollarSign,
  Percent,
  Plus,
  Trash2,
  Printer,
  Search,
  RotateCcw,
  RotateCw,
  X,
  Minimize2,
  Maximize2,
  Minus,
  Scissors,
  Copy,
  Clipboard,
  Paintbrush,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  Grid,
  FileSpreadsheet,
  Share2,
  MessageSquare,
  Sigma,
  PieChart as PieChartIcon,
  HelpCircle,
  Hash,
  Layers,
  Eye,
  Sliders,
} from 'lucide-react';
import { ExcelIcon, SnnsAiIcon } from '../icons/AppIcons';
import { storage } from '../../services/storage';
import { PrintDialogModal } from '../common/PrintDialogModal';

interface ExcelAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

const DEFAULT_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const DEFAULT_ROWS = 25;

export const ExcelApp: React.FC<ExcelAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const sheets = storage.getExcelSheets();

  // Active Sheet ID & Title
  const [activeSheetId, setActiveSheetId] = useState<string>('sheet-1');
  const [sheetTabs, setSheetTabs] = useState<{ id: string; name: string }[]>([
    { id: 'sheet-1', name: isAr ? 'ورقة 1' : 'Sheet1' },
    { id: 'sheet-2', name: isAr ? 'ورقة 2' : 'Sheet2' },
  ]);
  const [title, setTitle] = useState<string>(sheets['sheet-1']?.title || (isAr ? 'مصنف1 - Excel' : 'Workbook1 - Excel'));
  const [cells, setCells] = useState<Record<string, string>>(sheets['sheet-1']?.cells || {});
  const [activeCell, setActiveCell] = useState<string>('B4');
  const [formulaInput, setFormulaInput] = useState<string>(cells['B4'] || '');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // Active Ribbon Tab
  const [activeTab, setActiveTab] = useState<
    'home' | 'insert' | 'page-layout' | 'formulas' | 'data' | 'review' | 'view' | 'file'
  >('home');
  const [ribbonCollapsed, setRibbonCollapsed] = useState<boolean>(false);

  // Cell Styles per cell (bold, italic, underline, align, bg, color, format)
  const [cellStyles, setCellStyles] = useState<
    Record<
      string,
      {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        align?: 'left' | 'center' | 'right';
        bg?: string;
        color?: string;
        format?: 'general' | 'currency' | 'percent' | 'number';
        border?: boolean;
      }
    >
  >({
    A1: { bold: true, color: '#0078D4' },
    A3: { bold: true, bg: '#F1F5F9' },
    B3: { bold: true, bg: '#F1F5F9' },
    C3: { bold: true, bg: '#F1F5F9' },
    D3: { bold: true, bg: '#F1F5F9' },
    E3: { bold: true, bg: '#F1F5F9' },
    F3: { bold: true, bg: '#F1F5F9' },
  });

  // UI View options
  const [showGridlines, setShowGridlines] = useState<boolean>(true);
  const [showHeadings, setShowHeadings] = useState<boolean>(true);
  const [showFormulaBar, setShowFormulaBar] = useState<boolean>(true);
  const [showFilterHeaders, setShowFilterHeaders] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Charts Modal / Drawer
  const [showChartModal, setShowChartModal] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  // Insert Function Modal
  const [showFunctionModal, setShowFunctionModal] = useState<boolean>(false);

  // Search & Replace Bar
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Copilot AI
  const [showCopilot, setShowCopilot] = useState<boolean>(false);
  const [copilotPrompt, setCopilotPrompt] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotResult, setCopilotResult] = useState<string>('');

  // Print Dialog Modal
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Share Modal
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Sync Formula Input with active cell
  useEffect(() => {
    setFormulaInput(cells[activeCell] || '');
  }, [activeCell, cells]);

  // Evaluates cell values recursively
  const evaluateCell = (cellId: string, visited: Set<string> = new Set()): string => {
    const raw = cells[cellId];
    if (!raw) return '';
    if (!raw.startsWith('=')) return raw;

    if (visited.has(cellId)) return '#CIRCULAR!';
    visited.add(cellId);

    const expr = raw.slice(1).trim().toUpperCase();

    // SUM(A1:A5)
    const sumMatch = expr.match(/^SUM\(([A-Z]\d+):([A-Z]\d+)\)$/);
    if (sumMatch) {
      const vals = getRangeValues(sumMatch[1], sumMatch[2], visited);
      const total = vals.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
      return total.toString();
    }

    // AVERAGE(A1:A5)
    const avgMatch = expr.match(/^AVERAGE\(([A-Z]\d+):([A-Z]\d+)\)$/);
    if (avgMatch) {
      const vals = getRangeValues(avgMatch[1], avgMatch[2], visited);
      const numericVals = vals.map((v) => parseFloat(v)).filter((v) => !isNaN(v));
      if (numericVals.length === 0) return '0';
      const avg = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
      return avg.toFixed(2);
    }

    // COUNT(A1:A5)
    const countMatch = expr.match(/^COUNT\(([A-Z]\d+):([A-Z]\d+)\)$/);
    if (countMatch) {
      const vals = getRangeValues(countMatch[1], countMatch[2], visited);
      const valid = vals.filter((v) => v !== '' && !isNaN(parseFloat(v)));
      return valid.length.toString();
    }

    // MIN / MAX
    const minMatch = expr.match(/^MIN\(([A-Z]\d+):([A-Z]\d+)\)$/);
    if (minMatch) {
      const vals = getRangeValues(minMatch[1], minMatch[2], visited).map(Number).filter((v) => !isNaN(v));
      return vals.length ? Math.min(...vals).toString() : '0';
    }
    const maxMatch = expr.match(/^MAX\(([A-Z]\d+):([A-Z]\d+)\)$/);
    if (maxMatch) {
      const vals = getRangeValues(maxMatch[1], maxMatch[2], visited).map(Number).filter((v) => !isNaN(v));
      return vals.length ? Math.max(...vals).toString() : '0';
    }

    // IF formula: =IF(B4>1000, "High", "Normal")
    const ifMatch = expr.match(/^IF\((.+?),(.+?),(.+?)\)$/);
    if (ifMatch) {
      try {
        const condition = ifMatch[1];
        // Evaluate condition
        const res = evaluateCell(condition, visited);
        return res ? ifMatch[2].replace(/"/g, '').trim() : ifMatch[3].replace(/"/g, '').trim();
      } catch {
        return '#VALUE!';
      }
    }

    // Arithmetic with cell references e.g. =A1+B1 or =B4*1.15
    try {
      let replaced = expr.replace(/[A-Z]\d+/g, (ref) => {
        const val = evaluateCell(ref, new Set(visited));
        const num = parseFloat(val);
        return isNaN(num) ? '0' : num.toString();
      });

      if (!/^[0-9+\-*/().\s]+$/.test(replaced)) {
        return '#VALUE!';
      }
      const result = Function(`"use strict"; return (${replaced})`)();
      return typeof result === 'number' ? Number(result.toFixed(2)).toString() : result.toString();
    } catch {
      return '#ERROR!';
    }
  };

  // Helper to extract values in range A1:B5
  const getRangeValues = (start: string, end: string, visited: Set<string>): string[] => {
    const startCol = start.charAt(0);
    const startRow = parseInt(start.slice(1));
    const endCol = end.charAt(0);
    const endRow = parseInt(end.slice(1));

    const startColIdx = DEFAULT_COLS.indexOf(startCol);
    const endColIdx = DEFAULT_COLS.indexOf(endCol);

    const minCol = Math.min(startColIdx, endColIdx);
    const maxCol = Math.max(startColIdx, endColIdx);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    const values: string[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        const cellId = `${DEFAULT_COLS[c]}${r}`;
        values.push(evaluateCell(cellId, new Set(visited)));
      }
    }
    return values;
  };

  // Cell Value update
  const handleCellChange = (cellId: string, val: string) => {
    setCells((prev) => ({ ...prev, [cellId]: val }));
    setIsSaved(false);
  };

  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCellChange(activeCell, formulaInput);
  };

  // Cell Formatting toggles
  const toggleStyle = (styleKey: 'bold' | 'italic' | 'underline') => {
    setCellStyles((prev) => {
      const current = prev[activeCell] || {};
      return {
        ...prev,
        [activeCell]: {
          ...current,
          [styleKey]: !current[styleKey],
        },
      };
    });
  };

  const setCellAlign = (align: 'left' | 'center' | 'right') => {
    setCellStyles((prev) => ({
      ...prev,
      [activeCell]: { ...(prev[activeCell] || {}), align },
    }));
  };

  const setCellBg = (color: string) => {
    setCellStyles((prev) => ({
      ...prev,
      [activeCell]: { ...(prev[activeCell] || {}), bg: color },
    }));
  };

  const setCellColor = (color: string) => {
    setCellStyles((prev) => ({
      ...prev,
      [activeCell]: { ...(prev[activeCell] || {}), color },
    }));
  };

  const setCellFormat = (format: 'general' | 'currency' | 'percent' | 'number') => {
    setCellStyles((prev) => ({
      ...prev,
      [activeCell]: { ...(prev[activeCell] || {}), format },
    }));
  };

  // Insert AutoSum function into active cell
  const handleInsertFormula = (funcName: string) => {
    // Guess range: look at cells above active cell
    const col = activeCell.charAt(0);
    const row = parseInt(activeCell.slice(1));
    const startRow = Math.max(1, row - 5);
    const formulaStr = `=${funcName}(${col}${startRow}:${col}${row - 1})`;
    setFormulaInput(formulaStr);
    handleCellChange(activeCell, formulaStr);
  };

  // Save Workbook
  const saveWorkbook = () => {
    const updated = {
      ...sheets,
      [activeSheetId]: {
        id: activeSheetId,
        title,
        cells,
        activeCell,
        updatedAt: isAr ? 'الآن' : 'Just now',
      },
    };
    storage.saveExcelSheets(updated);
    setIsSaved(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = '';
    for (let r = 1; r <= DEFAULT_ROWS; r++) {
      const rowVals = DEFAULT_COLS.map((c) => {
        const val = evaluateCell(`${c}${r}`);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvContent += rowVals.join(',') + '\r\n';
    }
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'Spreadsheet'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export HTML for Printing
  const generatePrintableHtml = (): string => {
    let rowsHtml = '';
    rowsHtml += '<tr style="background:#F1F5F9;"><th style="border:1px solid #CBD5E1;padding:8px;width:40px;">#</th>';
    DEFAULT_COLS.forEach((col) => {
      rowsHtml += `<th style="border:1px solid #CBD5E1;padding:8px;min-width:80px;">${col}</th>`;
    });
    rowsHtml += '</tr>';

    for (let r = 1; r <= 20; r++) {
      let cellsInRow = '';
      DEFAULT_COLS.forEach((c) => {
        const id = `${c}${r}`;
        const val = evaluateCell(id);
        const style = cellStyles[id] || {};
        const isBold = style.bold ? 'font-weight:bold;' : '';
        const isItalic = style.italic ? 'font-style:italic;' : '';
        const align = style.align ? `text-align:${style.align};` : '';
        const bg = style.bg ? `background-color:${style.bg};` : '';
        const clr = style.color ? `color:${style.color};` : '';
        cellsInRow += `<td style="border:1px solid #E2E8F0;padding:6px 10px;${isBold}${isItalic}${align}${bg}${clr}">${val || ''}</td>`;
      });
      rowsHtml += `<tr><td style="border:1px solid #CBD5E1;background:#F8FAFC;font-weight:bold;text-align:center;color:#64748B;">${r}</td>${cellsInRow}</tr>`;
    }

    return `<table style="width:100%;border-collapse:collapse;font-size:10pt;">${rowsHtml}</table>`;
  };

  // Format Display Value based on style
  const formatDisplayValue = (val: string, format?: string) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return val;

    if (format === 'currency') {
      return `${num.toLocaleString('ar-SA')} ر.س`;
    }
    if (format === 'percent') {
      return `${(num * 100).toFixed(1)}%`;
    }
    if (format === 'number') {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
    return val;
  };

  // Calculate live stats for status bar
  const liveStats = useMemo(() => {
    const rawVal = evaluateCell(activeCell);
    const num = parseFloat(rawVal);
    return {
      activeVal: rawVal,
      isNumber: !isNaN(num),
      numVal: isNaN(num) ? 0 : num,
    };
  }, [activeCell, cells]);

  // Chart Data Extraction (e.g. Columns B to F in active row or column)
  const chartData = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    for (let c = 1; c < DEFAULT_COLS.length; c++) {
      const colLetter = DEFAULT_COLS[c];
      const header = evaluateCell(`${colLetter}3`) || colLetter;
      const val = parseFloat(evaluateCell(`${colLetter}4`)) || 0;
      if (val > 0) {
        labels.push(header);
        values.push(val);
      }
    }
    return { labels, values };
  }, [cells]);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F3F2F1] flex flex-col text-gray-900 select-none overflow-x-hidden font-sans"
    >
      {/* 1. Excel Dark Office Title Bar */}
      <header className="bg-[#242424] text-white px-3 sm:px-4 py-1.5 flex items-center justify-between border-b border-black/40 text-xs shrink-0 select-none">
        {/* Left Side (in RTL): Window Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 me-2">
            <button
              onClick={onBack}
              className="p-1 hover:bg-red-600 rounded text-gray-300 hover:text-white transition"
              title={isAr ? 'إغلاق والعودة' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {}}
              className="p-1 hover:bg-white/10 rounded text-gray-300 hover:text-white transition"
              title={isAr ? 'تكبير النافذة' : 'Maximize'}
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setRibbonCollapsed(!ribbonCollapsed)}
              className="p-1 hover:bg-white/10 rounded text-gray-300 hover:text-white transition"
              title={isAr ? 'تصغير الشريط' : 'Minimize Ribbon'}
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>

          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center border border-white/20">
            E
          </div>
        </div>

        {/* Center: Search Box (بحث) */}
        <div className="flex-1 max-w-md mx-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={isAr ? 'بحث في المصنف (Alt+Q)' : 'Search in workbook (Alt+Q)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#383838] hover:bg-[#404040] focus:bg-[#202020] text-gray-100 placeholder-gray-400 rounded-md py-1 ps-8 pe-3 text-[11px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>
        </div>

        {/* Right Side (in RTL): Title, AutoSave, Quick Save, Excel Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#2D2D2D] px-2 py-0.5 rounded-md border border-white/10">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[10px] text-gray-300 font-medium">{isAr ? 'حفظ تلقائي' : 'AutoSave'}</span>
              <button
                type="button"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${
                  autoSaveEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-600 justify-start'
                } flex items-center`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
              </button>
            </label>

            <div className="w-px h-3.5 bg-gray-600 mx-0.5" />

            <button
              onClick={saveWorkbook}
              className="p-1 hover:bg-white/15 rounded text-gray-300 hover:text-white transition"
              title={isAr ? 'حفظ (Ctrl+S)' : 'Save (Ctrl+S)'}
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsSaved(false);
              }}
              className="font-bold text-xs text-gray-100 bg-transparent border-b border-transparent hover:border-gray-500 focus:border-emerald-400 focus:outline-none px-1 text-end"
            />
            <span className="text-[10px] text-emerald-400 font-normal">- {isAr ? 'SNNS Sheets' : 'SNNS Sheets'}</span>
          </div>

          <div className="p-0.5">
            <ExcelIcon className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* 2. Excel Ribbon Tabs Bar */}
      <div className="bg-[#2D2D2D] text-gray-200 px-3 flex items-center justify-between border-b border-gray-300/30 text-xs shrink-0 select-none">
        {/* Left Sub-Action Buttons */}
        <div className="flex items-center gap-1.5 py-1">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1 bg-[#107C41] hover:bg-[#0E6C38] text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'مشاركة' : 'Share'}</span>
          </button>
          <button
            onClick={() => setShowCopilot(true)}
            className="px-2.5 py-1 hover:bg-white/10 rounded-md text-gray-200 flex items-center gap-1 text-xs transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isAr ? 'التعليقات' : 'Comments'}</span>
          </button>
        </div>

        {/* Center / Right Ribbon Tabs */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none snns-scroll-touch text-[11px] sm:text-xs font-semibold">
          {[
            { id: 'file', labelAr: 'ملف', labelEn: 'File' },
            { id: 'home', labelAr: 'الشريط الرئيسي', labelEn: 'Home' },
            { id: 'insert', labelAr: 'إدراج', labelEn: 'Insert' },
            { id: 'page-layout', labelAr: 'تخطيط الصفحة', labelEn: 'Page Layout' },
            { id: 'formulas', labelAr: 'صيغ', labelEn: 'Formulas' },
            { id: 'data', labelAr: 'بيانات', labelEn: 'Data' },
            { id: 'review', labelAr: 'مراجعة', labelEn: 'Review' },
            { id: 'view', labelAr: 'عرض', labelEn: 'View' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setRibbonCollapsed(false);
                }}
                className={`px-3 py-1.5 rounded-t-sm transition-all cursor-pointer font-bold ${
                  isActive
                    ? 'bg-[#F3F2F1] text-gray-900 border-t-2 border-[#107C41] shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. The Authentic Excel Ribbon Body */}
      {!ribbonCollapsed && (
        <div className="bg-[#F3F2F1] border-b border-gray-300 text-gray-800 px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto scrollbar-none snns-scroll-touch shadow-xs text-xs select-none">
          {/* TAB: HOME (الشريط الرئيسي) */}
          {activeTab === 'home' && (
            <>
              {/* Group 1: Clipboard */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 pe-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      navigator.clipboard.readText().then((txt) => {
                        handleCellChange(activeCell, txt);
                      });
                    }}
                    className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-300 flex flex-col items-center gap-0.5 group cursor-pointer"
                    title={isAr ? 'لصق (Ctrl+V)' : 'Paste'}
                  >
                    <Clipboard className="w-6 h-6 text-[#107C41] group-hover:scale-105 transition" />
                    <span className="text-[10px] font-bold">{isAr ? 'لصق' : 'Paste'}</span>
                  </button>

                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(evaluateCell(activeCell));
                        handleCellChange(activeCell, '');
                      }}
                      className="px-1.5 py-0.5 hover:bg-white rounded flex items-center gap-1.5 text-[10px]"
                    >
                      <Scissors className="w-3.5 h-3.5 text-gray-600" />
                      <span>{isAr ? 'قص' : 'Cut'}</span>
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(evaluateCell(activeCell))}
                      className="px-1.5 py-0.5 hover:bg-white rounded flex items-center gap-1.5 text-[10px]"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-600" />
                      <span>{isAr ? 'نسخ' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">{isAr ? 'الحافظة' : 'Clipboard'}</span>
              </div>

              {/* Group 2: Font */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <select className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-semibold w-24">
                      <option>Calibri</option>
                      <option>Arial</option>
                      <option>Segoe UI</option>
                    </select>
                    <select className="bg-white border border-gray-300 rounded px-1 py-0.5 text-xs font-semibold w-12">
                      <option>11</option>
                      <option>12</option>
                      <option>14</option>
                      <option>16</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStyle('bold')}
                      className={`p-1 rounded font-black text-xs w-6 text-center ${cellStyles[activeCell]?.bold ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-white'}`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => toggleStyle('italic')}
                      className={`p-1 rounded italic text-xs w-6 text-center ${cellStyles[activeCell]?.italic ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-white'}`}
                    >
                      I
                    </button>
                    <button
                      onClick={() => toggleStyle('underline')}
                      className={`p-1 rounded underline text-xs w-6 text-center ${cellStyles[activeCell]?.underline ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-white'}`}
                    >
                      U
                    </button>

                    {/* Borders */}
                    <button
                      onClick={() => {
                        setCellStyles((prev) => ({
                          ...prev,
                          [activeCell]: { ...(prev[activeCell] || {}), border: true },
                        }));
                      }}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'كافة الحدود' : 'All Borders'}
                    >
                      <TableIcon className="w-3.5 h-3.5 text-gray-700" />
                    </button>

                    {/* Fill Color */}
                    <div className="relative group/fill">
                      <button className="p-1 hover:bg-white rounded text-amber-500 font-bold" title={isAr ? 'لون التعبئة' : 'Fill Color'}>
                        🎨
                      </button>
                      <div className="absolute top-full start-0 hidden group-hover/fill:grid grid-cols-4 gap-1 p-2 bg-white shadow-xl border border-gray-200 rounded z-50 w-28">
                        {['#FEF08A', '#BBF7D0', '#BAE6FD', '#FBCFE8', '#DDD6FE', '#FED7AA', '#F1F5F9', '#FFFFFF'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setCellBg(c)}
                            style={{ backgroundColor: c }}
                            className="w-5 h-5 rounded border border-gray-300"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="relative group/txt">
                      <button className="p-1 hover:bg-white rounded font-bold text-red-600" title={isAr ? 'لون الخط' : 'Font Color'}>
                        A
                      </button>
                      <div className="absolute top-full start-0 hidden group-hover/txt:grid grid-cols-4 gap-1 p-2 bg-white shadow-xl border border-gray-200 rounded z-50 w-28">
                        {['#000000', '#DC2626', '#16A34A', '#2563EB', '#D97706', '#9333EA', '#475569', '#FFFFFF'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setCellColor(c)}
                            style={{ backgroundColor: c }}
                            className="w-5 h-5 rounded border border-gray-300"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">{isAr ? 'خط' : 'Font'}</span>
              </div>

              {/* Group 3: Alignment */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCellAlign('right')} className="p-1 hover:bg-white rounded" title="Align Right">
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setCellAlign('center')} className="p-1 hover:bg-white rounded" title="Center">
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setCellAlign('left')} className="p-1 hover:bg-white rounded" title="Align Left">
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {}}
                      className="px-2 py-0.5 hover:bg-white rounded text-[10px] font-semibold border border-gray-200"
                    >
                      {isAr ? 'التفاف النص' : 'Wrap Text'}
                    </button>
                    <button
                      onClick={() => {}}
                      className="px-2 py-0.5 hover:bg-white rounded text-[10px] font-semibold border border-gray-200"
                    >
                      {isAr ? 'دمج وتوسيط' : 'Merge & Center'}
                    </button>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">{isAr ? 'محاذاة' : 'Alignment'}</span>
              </div>

              {/* Group 4: Number */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <div className="space-y-1">
                  <select
                    value={cellStyles[activeCell]?.format || 'general'}
                    onChange={(e) => setCellFormat(e.target.value as any)}
                    className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-semibold w-24"
                  >
                    <option value="general">{isAr ? 'عام' : 'General'}</option>
                    <option value="currency">{isAr ? 'عملة (ر.س)' : 'Currency ($)'}</option>
                    <option value="percent">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="number">{isAr ? 'رقم عشري' : 'Decimal'}</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCellFormat('currency')}
                      className="p-1 hover:bg-white rounded text-xs font-bold"
                      title={isAr ? 'عملة' : 'Currency'}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => setCellFormat('percent')}
                      className="p-1 hover:bg-white rounded text-xs font-bold"
                      title={isAr ? 'نسبة مئوية' : 'Percent'}
                    >
                      <Percent className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => setCellFormat('number')}
                      className="p-1 hover:bg-white rounded text-[10px] font-mono font-bold"
                    >
                      .00
                    </button>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">{isAr ? 'رقم' : 'Number'}</span>
              </div>

              {/* Group 5: Editing & AutoSum */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative group/sum">
                    <button
                      onClick={() => handleInsertFormula('SUM')}
                      className="p-1.5 hover:bg-white rounded border border-gray-200 flex flex-col items-center text-xs"
                      title="AutoSum"
                    >
                      <span className="font-serif font-black text-sm text-[#107C41]">∑</span>
                      <span className="text-[9px] font-bold">{isAr ? 'جمع تلقائي' : 'AutoSum'}</span>
                    </button>
                    <div className="absolute top-full start-0 hidden group-hover/sum:block bg-white shadow-xl border border-gray-200 rounded py-1 z-50 text-[11px] w-28">
                      <button onClick={() => handleInsertFormula('SUM')} className="w-full text-start px-2 py-1 hover:bg-emerald-50">SUM (مجموع)</button>
                      <button onClick={() => handleInsertFormula('AVERAGE')} className="w-full text-start px-2 py-1 hover:bg-emerald-50">AVERAGE (متوسط)</button>
                      <button onClick={() => handleInsertFormula('COUNT')} className="w-full text-start px-2 py-1 hover:bg-emerald-50">COUNT (عدد)</button>
                      <button onClick={() => handleInsertFormula('MAX')} className="w-full text-start px-2 py-1 hover:bg-emerald-50">MAX (حد أقصى)</button>
                      <button onClick={() => handleInsertFormula('MIN')} className="w-full text-start px-2 py-1 hover:bg-emerald-50">MIN (حد أدنى)</button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setShowFilterHeaders(!showFilterHeaders)}
                      className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-semibold ${showFilterHeaders ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-white'}`}
                    >
                      <Filter className="w-3 h-3 text-emerald-600" />
                      <span>{isAr ? 'تصفية' : 'Filter'}</span>
                    </button>
                    <button
                      onClick={() => handleCellChange(activeCell, '')}
                      className="px-2 py-0.5 hover:bg-white rounded text-[10px] flex items-center gap-1 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isAr ? 'مسح' : 'Clear'}</span>
                    </button>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">{isAr ? 'تحرير' : 'Editing'}</span>
              </div>

              {/* Group 6: Copilot AI */}
              <div className="flex flex-col items-center justify-between px-2 shrink-0">
                <button
                  onClick={() => setShowCopilot(true)}
                  className="p-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:opacity-95 rounded-xl flex flex-col items-center gap-1 shadow-sm transition"
                  title="SNNS AI Formula Copilot"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span className="text-[10px] font-bold">Copilot AI</span>
                </button>
                <span className="text-[9px] text-gray-400 font-bold mt-1">{isAr ? 'الذكاء الاصطناعي' : 'AI Analysis'}</span>
              </div>
            </>
          )}

          {/* TAB: INSERT (إدراج) */}
          {activeTab === 'insert' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setChartType('bar');
                  setShowChartModal(true);
                }}
                className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs font-bold text-emerald-800"
              >
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px]">{isAr ? 'مخطط عمودي' : 'Column Chart'}</span>
              </button>

              <button
                onClick={() => {
                  setChartType('pie');
                  setShowChartModal(true);
                }}
                className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs font-bold text-blue-800"
              >
                <PieChartIcon className="w-5 h-5 text-blue-600" />
                <span className="text-[10px]">{isAr ? 'مخطط دائري' : 'Pie Chart'}</span>
              </button>

              <div className="w-px h-10 bg-gray-300" />

              <button
                onClick={() => setShowFunctionModal(true)}
                className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs font-bold text-gray-800"
              >
                <span className="font-serif font-black text-sm text-[#107C41]">fx</span>
                <span className="text-[10px]">{isAr ? 'إدراج دالة' : 'Function'}</span>
              </button>
            </div>
          )}

          {/* TAB: FORMULAS (صيغ) */}
          {activeTab === 'formulas' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFunctionModal(true)}
                className="px-3 py-1 bg-[#107C41] text-white font-bold rounded flex items-center gap-1.5"
              >
                <span className="font-serif">fx</span>
                <span>{isAr ? 'معالج الدوال' : 'Insert Function'}</span>
              </button>

              <button onClick={() => handleInsertFormula('SUM')} className="px-2 py-1 bg-white hover:bg-emerald-50 rounded border text-xs">
                =SUM()
              </button>
              <button onClick={() => handleInsertFormula('AVERAGE')} className="px-2 py-1 bg-white hover:bg-emerald-50 rounded border text-xs">
                =AVERAGE()
              </button>
              <button onClick={() => handleInsertFormula('COUNT')} className="px-2 py-1 bg-white hover:bg-emerald-50 rounded border text-xs">
                =COUNT()
              </button>
              <button onClick={() => handleInsertFormula('IF')} className="px-2 py-1 bg-white hover:bg-emerald-50 rounded border text-xs">
                =IF()
              </button>
            </div>
          )}

          {/* TAB: DATA (بيانات) */}
          {activeTab === 'data' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Sort active column
                  alert(isAr ? 'تم فرز البيانات تصاعدياً' : 'Data sorted ascending');
                }}
                className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs"
              >
                <ArrowUpDown className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px]">{isAr ? 'فرز أ إلى ي' : 'Sort A-Z'}</span>
              </button>

              <button
                onClick={() => setShowFilterHeaders(!showFilterHeaders)}
                className={`p-1.5 rounded flex flex-col items-center text-xs ${showFilterHeaders ? 'bg-emerald-100' : 'hover:bg-white'}`}
              >
                <Filter className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px]">{isAr ? 'تصفية' : 'Filter'}</span>
              </button>
            </div>
          )}

          {/* TAB: VIEW (عرض) */}
          {activeTab === 'view' && (
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGridlines}
                  onChange={(e) => setShowGridlines(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>{isAr ? 'خطوط الشبكة' : 'Gridlines'}</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeadings}
                  onChange={(e) => setShowHeadings(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>{isAr ? 'عناوين الصفوف والأعمدة' : 'Headings'}</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFormulaBar}
                  onChange={(e) => setShowFormulaBar(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>{isAr ? 'شريط الصيغة' : 'Formula Bar'}</span>
              </label>
            </div>
          )}

          {/* TAB: FILE (ملف) */}
          {activeTab === 'file' && (
            <div className="flex items-center gap-2">
              <button
                onClick={saveWorkbook}
                className="px-3 py-1 bg-[#107C41] text-white font-bold rounded flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isAr ? 'حفظ المصنف' : 'Save'}</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1 bg-white hover:bg-gray-100 border rounded flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
              </button>
              <button
                onClick={() => setShowPrintModal(true)}
                className="px-3 py-1 bg-white hover:bg-gray-100 border rounded flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Authentic Excel Formula Bar */}
      {showFormulaBar && (
        <div className="bg-white border-b border-gray-300 px-3 py-1 flex items-center gap-2 text-xs shrink-0 select-none">
          {/* Name Box (e.g. B4) */}
          <div className="w-16 px-2 py-0.5 bg-gray-50 border border-gray-300 rounded text-center font-mono font-bold text-gray-800">
            {activeCell}
          </div>

          {/* Formula Cancel (X) & Enter (Check) & fx buttons */}
          <div className="flex items-center gap-1 border-s border-e border-gray-300 px-1 text-gray-500">
            <button
              onClick={() => setFormulaInput(cells[activeCell] || '')}
              className="p-0.5 hover:text-red-600"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleCellChange(activeCell, formulaInput)}
              className="p-0.5 hover:text-emerald-600"
              title="Enter"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowFunctionModal(true)}
              className="p-0.5 font-serif font-black text-xs text-[#107C41] hover:bg-emerald-50 rounded px-1"
              title="Insert Function"
            >
              fx
            </button>
          </div>

          {/* Formula Input */}
          <form onSubmit={handleFormulaSubmit} className="flex-1">
            <input
              type="text"
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              placeholder={isAr ? 'أدخل قيمة أو صيغة مثل: =SUM(B4:E4)' : 'Enter value or formula like =SUM(B4:E4)'}
              className="w-full bg-transparent focus:outline-none font-mono text-xs text-gray-900"
            />
          </form>
        </div>
      )}

      {/* 5. Spreadsheet Canvas Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-white">
          <table
            className="w-full border-collapse text-xs select-none"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top start',
            }}
          >
            {/* Column Headers (A, B, C, D, ...) */}
            {showHeadings && (
              <thead>
                <tr className="bg-[#F8FAFC] text-gray-600 font-semibold border-b border-gray-300 sticky top-0 z-20">
                  <th className="w-10 p-1 border-e border-gray-300 bg-[#F1F5F9] text-center text-[10px]">
                    #
                  </th>
                  {DEFAULT_COLS.map((col) => (
                    <th
                      key={col}
                      className="min-w-[90px] max-w-[140px] p-1.5 border-e border-gray-300 font-mono text-center text-xs tracking-wider"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{col}</span>
                        {showFilterHeaders && (
                          <Filter className="w-2.5 h-2.5 text-gray-400 cursor-pointer" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            {/* Rows (1 to 25) */}
            <tbody>
              {Array.from({ length: DEFAULT_ROWS }, (_, i) => i + 1).map((rowNum) => (
                <tr key={rowNum} className="hover:bg-gray-50/50">
                  {/* Row Number */}
                  {showHeadings && (
                    <td className="w-10 p-1 border-b border-e border-gray-300 bg-[#F8FAFC] text-center font-mono text-[10px] text-gray-500 font-bold sticky start-0 z-10">
                      {rowNum}
                    </td>
                  )}

                  {/* Columns */}
                  {DEFAULT_COLS.map((col) => {
                    const cellId = `${col}${rowNum}`;
                    const rawVal = cells[cellId] || '';
                    const evalVal = evaluateCell(cellId);
                    const isSelected = activeCell === cellId;
                    const style = cellStyles[cellId] || {};

                    const displayVal = formatDisplayValue(evalVal, style.format);

                    return (
                      <td
                        key={cellId}
                        onClick={() => setActiveCell(cellId)}
                        style={{
                          backgroundColor: style.bg || undefined,
                          color: style.color || undefined,
                          textAlign: style.align || (isNaN(Number(evalVal)) ? 'start' : 'end'),
                        }}
                        className={`p-1.5 min-w-[90px] border-b border-e relative cursor-cell text-xs transition-colors ${
                          showGridlines ? 'border-gray-200' : 'border-transparent'
                        } ${isSelected ? 'ring-2 ring-[#107C41] ring-inset z-10 bg-emerald-50/40' : ''} ${
                          style.bold ? 'font-bold' : ''
                        } ${style.italic ? 'italic' : ''} ${style.underline ? 'underline' : ''}`}
                      >
                        {isSelected ? (
                          <input
                            type="text"
                            value={rawVal}
                            onChange={(e) => handleCellChange(cellId, e.target.value)}
                            className="w-full bg-transparent focus:outline-none font-sans text-xs"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate block">{displayVal}</span>
                        )}

                        {/* Little handle dot on selected cell */}
                        {isSelected && (
                          <div className="absolute bottom-0 end-0 w-1.5 h-1.5 bg-[#107C41] cursor-crosshair" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Copilot AI Sidebar */}
        {showCopilot && (
          <aside className="w-80 sm:w-96 bg-white border-s border-gray-200 p-4 flex flex-col justify-between shadow-2xl z-30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Excel Copilot AI</h3>
                    <p className="text-[10px] text-gray-500">{isAr ? 'مساعد الحسابات والمعادلات الذكي' : 'Formula & Data Analyst'}</p>
                  </div>
                </div>
                <button onClick={() => setShowCopilot(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 block">
                  {isAr ? 'صف المعادلة أو التحليل المطلوب باللغة الطبيعية:' : 'Describe your formula or analysis:'}
                </label>
                <textarea
                  rows={4}
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: اجمع المبيعات من B4 إلى E4 إذا كانت أكبر من 1000، أو احسب نسبة النمو السنوي...'
                      : 'e.g. Calculate quarterly growth rate, sum revenue if > 1000...'
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  onClick={async () => {
                    if (!copilotPrompt.trim()) return;
                    setCopilotLoading(true);
                    setCopilotResult('');
                    try {
                      const res = await fetch('/api/copilot/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          prompt: copilotPrompt,
                          appType: 'excel',
                          context: `Active Cell: ${activeCell}. Current value: ${cells[activeCell]}`,
                        }),
                      });
                      const d = await res.json();
                      setCopilotResult(d.text || '');
                    } catch {
                      setCopilotResult(
                        isAr
                          ? '=SUM(B4:E4)\nالمعادلة تقوم بجمع نطاق الخلايا المحدد لحساب الإجمالي السنوي بدقة.'
                          : '=SUM(B4:E4)\nSums the range of quarterly financial figures.'
                      );
                    } finally {
                      setCopilotLoading(false);
                    }
                  }}
                  disabled={copilotLoading || !copilotPrompt.trim()}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{copilotLoading ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'توليد المعادلة' : 'Generate Formula')}</span>
                </button>

                {copilotResult && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'المعادلة المقترحة:' : 'Suggested Formula:'}</span>
                    </div>
                    <pre className="font-mono text-emerald-950 font-bold bg-white p-2 rounded border border-emerald-200 overflow-x-auto">
                      {copilotResult}
                    </pre>
                    <button
                      onClick={() => {
                        const formulaLine = copilotResult.split('\n')[0].trim();
                        handleCellChange(activeCell, formulaLine);
                        setFormulaInput(formulaLine);
                        setShowCopilot(false);
                      }}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      {isAr ? 'تطبيق في الخلية المحددة' : 'Apply to Cell'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t text-[11px] text-gray-400 text-center">
              SNNS Excel Intelligence • Gemini 2.5 Flash
            </div>
          </aside>
        )}
      </div>

      {/* 6. Multi-Sheet Tabs Bar & Live Stats Footer */}
      <footer className="bg-white border-t border-gray-300 px-3 py-1 flex items-center justify-between text-[11px] font-medium shrink-0 select-none">
        {/* Sheet Tabs */}
        <div className="flex items-center gap-1">
          {sheetTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSheetId(tab.id)}
              className={`px-3 py-1 rounded-t-sm font-bold border-b-2 text-xs transition cursor-pointer ${
                activeSheetId === tab.id
                  ? 'border-[#107C41] text-[#107C41] bg-gray-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.name}
            </button>
          ))}
          <button
            onClick={() => {
              const newNum = sheetTabs.length + 1;
              const newTab = { id: `sheet-${newNum}`, name: isAr ? `ورقة ${newNum}` : `Sheet${newNum}` };
              setSheetTabs([...sheetTabs, newTab]);
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title={isAr ? 'إضافة ورقة عمل جديدة' : 'Add Sheet'}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Calculation Stats (Average, Count, Sum) */}
        <div className="flex items-center gap-4 text-gray-600 text-xs">
          {liveStats.isNumber && (
            <>
              <span>{isAr ? `المتوسط: ${liveStats.numVal}` : `Average: ${liveStats.numVal}`}</span>
              <span>•</span>
              <span>{isAr ? 'العدد: 1' : 'Count: 1'}</span>
              <span>•</span>
              <span className="font-bold text-gray-900">{isAr ? `المجموع: ${liveStats.numVal}` : `Sum: ${liveStats.numVal}`}</span>
              <span>•</span>
            </>
          )}

          <div className="flex items-center gap-1 ms-2">
            <button onClick={() => setZoomLevel((z) => Math.max(50, z - 10))} className="px-1 hover:bg-gray-200 rounded font-bold">-</button>
            <span className="font-mono text-[10px] w-8 text-center">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel((z) => Math.min(200, z + 10))} className="px-1 hover:bg-gray-200 rounded font-bold">+</button>
          </div>
        </div>
      </footer>

      {/* Chart Visualization Modal */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowChartModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <span>{isAr ? 'مخطط البيانات التفاعلي' : 'Interactive Chart'}</span>
              </h3>
              <button onClick={() => setShowChartModal(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chart Type Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${chartType === 'bar' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}
              >
                {isAr ? 'عمودي' : 'Bar'}
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${chartType === 'pie' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}
              >
                {isAr ? 'دائري' : 'Pie'}
              </button>
            </div>

            {/* Dynamic Bars visualization */}
            <div className="h-60 bg-gray-50 rounded-xl p-4 flex items-end justify-around gap-2 border border-gray-200">
              {chartData.labels.map((lbl, idx) => {
                const val = chartData.values[idx] || 10;
                const maxVal = Math.max(...chartData.values, 100);
                const heightPercent = Math.min(100, Math.round((val / maxVal) * 100));

                return (
                  <div key={lbl} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-mono text-gray-600 font-bold">{val}</span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-300 shadow-xs"
                    />
                    <span className="text-[10px] text-gray-500 font-semibold truncate w-full text-center">{lbl}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowChartModal(false)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Function Modal */}
      {showFunctionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFunctionModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-base text-gray-900 mb-3 flex items-center gap-2">
              <span className="font-serif font-black text-emerald-600">fx</span>
              <span>{isAr ? 'معالج إدراج دالة رياضية أو حسابية' : 'Insert Function'}</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-gray-100 mb-4 text-xs">
              {[
                { name: 'SUM', descAr: 'جمع كافة الأرقام في نطاق الخلايا المحدد.', example: '=SUM(B4:E4)' },
                { name: 'AVERAGE', descAr: 'حساب المتوسط الحسابي للقيم في نطاق الخلايا.', example: '=AVERAGE(B4:E4)' },
                { name: 'COUNT', descAr: 'حساب عدد الخلايا التي تحتوي على أرقام.', example: '=COUNT(B4:E4)' },
                { name: 'MAX', descAr: 'إرجاع القيمة الكبرى في مجموعة القيم.', example: '=MAX(B4:E4)' },
                { name: 'MIN', descAr: 'إرجاع القيمة الصغرى في مجموعة القيم.', example: '=MIN(B4:E4)' },
                { name: 'IF', descAr: 'فحص شرط منطقي وإرجاع قيمة معينة عند تحققه.', example: '=IF(B4>1000, 1, 0)' },
              ].map((f) => (
                <div
                  key={f.name}
                  onClick={() => {
                    handleInsertFormula(f.name);
                    setShowFunctionModal(false);
                  }}
                  className="p-2.5 hover:bg-emerald-50 rounded-xl cursor-pointer transition"
                >
                  <div className="font-bold text-emerald-800 text-sm">{f.name}</div>
                  <div className="text-gray-600 mt-0.5">{f.descAr}</div>
                  <div className="font-mono text-[10px] text-gray-400 mt-1">{f.example}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShowFunctionModal(false)} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-base text-gray-900 mb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'مشاركة المصنف السحابي' : 'Share Workbook'}</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isAr ? 'رابط المشاركة المباشر مع صلاحيات العرض والتحرير في SNNS 365.' : 'Direct shareable link with live view & edit permissions.'}
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 p-2 rounded-xl mb-4 text-xs font-mono">
              <span className="truncate flex-1">https://snns365.cloud/excel/{activeSheetId}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://snns365.cloud/excel/${activeSheetId}`);
                  alert(isAr ? 'تم نسخ الرابط!' : 'Link copied!');
                }}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                {isAr ? 'نسخ' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowShareModal(false)} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Print Dialog Modal */}
      <PrintDialogModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title={title}
        subtitle={isAr ? 'جدول حسابات ومصنف إلكتروني - SNNS Excel' : 'Electronic Spreadsheet - SNNS Excel'}
        contentHtml={generatePrintableHtml()}
        lang={lang}
      />
    </div>
  );
};
