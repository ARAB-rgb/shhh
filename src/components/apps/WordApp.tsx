import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Table as TableIcon,
  Link as LinkIcon,
  Download,
  Printer,
  Sparkles,
  ArrowLeft,
  Save,
  Check,
  FileText,
  RotateCcw,
  RotateCw,
  Search,
  Replace,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Type,
  Maximize2,
  Minimize2,
  Sliders,
  Scissors,
  Copy,
  Clipboard,
  Paintbrush,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  HelpCircle,
  Share2,
  MessageSquare,
  Eye,
  Columns,
  Square,
  Circle,
  ArrowRight,
  CheckSquare,
  Globe,
  Languages,
  BookOpen,
  Calendar,
  Grid,
  Hash,
  Smile,
  Shield,
  Palette,
  Minus,
} from 'lucide-react';
import { WordIcon, SnnsAiIcon } from '../icons/AppIcons';
import { storage } from '../../services/storage';
import { PrintDialogModal } from '../common/PrintDialogModal';

interface WordAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

export const WordApp: React.FC<WordAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const docs = storage.getWordDocs();

  // Document State
  const [activeDocId, setActiveDocId] = useState<string>('doc-1');
  const [docTitle, setDocTitle] = useState<string>(docs['doc-1']?.title || (isAr ? 'مستند1 - Word' : 'Document1 - Word'));
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // Active Ribbon Tab
  const [activeTab, setActiveTab] = useState<
    'file' | 'home' | 'insert' | 'design' | 'layout' | 'references' | 'mailings' | 'review' | 'view' | 'help'
  >('home');

  // Ribbon collapse toggle
  const [ribbonCollapsed, setRibbonCollapsed] = useState<boolean>(false);

  // Formatting state
  const [fontFamily, setFontFamily] = useState<string>('Calibri');
  const [fontSize, setFontSize] = useState<string>('16');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [highlightColor, setHighlightColor] = useState<string>('#FFFF00');
  const [lineSpacing, setLineSpacing] = useState<string>('1.5');
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal' | 'A3'>('A4');
  const [pageMargins, setPageMargins] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [pageColor, setPageColor] = useState<string>('#FFFFFF');
  const [watermark, setWatermark] = useState<string>('');
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showGridlines, setShowGridlines] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [readMode, setReadMode] = useState<boolean>(false);
  const [showParagraphMarks, setShowParagraphMarks] = useState<boolean>(false);

  // Search & Replace Panel
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [findMatchesCount, setFindMatchesCount] = useState<number>(0);

  // Dictation / Voice
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Speech / Read Aloud
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Editor Proofing Modal
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);

  // Table Inserter Modal
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(4);

  // Link Inserter Modal
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('https://');
  const [linkText, setLinkText] = useState<string>('');

  // Copilot AI Assistant
  const [showCopilot, setShowCopilot] = useState<boolean>(false);
  const [copilotPrompt, setCopilotPrompt] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotResult, setCopilotResult] = useState<string>('');

  // Print Dialog Modal
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Share Modal
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Statistics
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    paragraphs: 1,
    readingTime: 1,
    pages: 1,
  });

  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize document content
  useEffect(() => {
    if (editorRef.current && docs[activeDocId]) {
      editorRef.current.innerHTML = docs[activeDocId].content;
      updateStats();
    }
  }, [activeDocId]);

  // Update statistics
  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0).length || 1;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const pages = Math.max(1, Math.ceil(characters / 2500));
    setStats({ words, characters, paragraphs, readingTime, pages });
  };

  const handleInput = () => {
    setIsSaved(false);
    updateStats();
    if (autoSaveEnabled) {
      debouncedAutoSave();
    }
  };

  // Debounced AutoSave
  const autoSaveTimeoutRef = useRef<any>(null);
  const debouncedAutoSave = () => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCurrentDoc();
    }, 1500);
  };

  const saveCurrentDoc = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const updated = {
      ...docs,
      [activeDocId]: {
        id: activeDocId,
        title: docTitle,
        content,
        updatedAt: isAr ? 'الآن' : 'Just now',
      },
    };
    storage.saveWordDocs(updated);
    setIsSaved(true);
  };

  // Format Execution Wrapper
  const applyFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
    handleInput();
  };

  // Font family change
  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    applyFormat('fontName', font);
  };

  // Font size change
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    // Use modern inline span styling for true pixel/pt sizes
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = `${size}pt`;
      try {
        range.surroundContents(span);
      } catch {
        applyFormat('fontSize', '4');
      }
    } else {
      applyFormat('fontSize', '4');
    }
    handleInput();
  };

  // Increase / Decrease Font Size
  const adjustFontSize = (delta: number) => {
    const current = parseInt(fontSize) || 14;
    const next = Math.max(8, Math.min(72, current + delta));
    handleFontSizeChange(next.toString());
  };

  // Change Case (Aa)
  const handleChangeCase = (mode: 'sentence' | 'lower' | 'upper' | 'title') => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selectedText = selection.toString();
    let transformed = selectedText;

    if (mode === 'lower') transformed = selectedText.toLowerCase();
    else if (mode === 'upper') transformed = selectedText.toUpperCase();
    else if (mode === 'sentence') {
      transformed = selectedText.charAt(0).toUpperCase() + selectedText.slice(1).toLowerCase();
    } else if (mode === 'title') {
      transformed = selectedText.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    document.execCommand('insertText', false, transformed);
    handleInput();
  };

  // Apply Styles (Heading 1, 2, Title, Quote, etc.)
  const applyStylePreset = (styleType: string) => {
    switch (styleType) {
      case 'normal':
        applyFormat('formatBlock', '<p>');
        break;
      case 'title':
        applyFormat('formatBlock', '<h1>');
        document.execCommand('fontSize', false, '7');
        break;
      case 'subtitle':
        applyFormat('formatBlock', '<h3>');
        break;
      case 'h1':
        applyFormat('formatBlock', '<h1>');
        break;
      case 'h2':
        applyFormat('formatBlock', '<h2>');
        break;
      case 'quote':
        applyFormat('formatBlock', '<blockquote>');
        break;
      case 'nospace':
        applyFormat('formatBlock', '<p>');
        if (editorRef.current) {
          const selection = window.getSelection();
          if (selection && selection.anchorNode) {
            const p = (selection.anchorNode as HTMLElement).closest?.('p');
            if (p) (p as HTMLElement).style.margin = '0';
          }
        }
        break;
      default:
        applyFormat('formatBlock', '<p>');
    }
  };

  // Clear All Formatting
  const handleClearFormatting = () => {
    applyFormat('removeFormat');
    applyFormat('formatBlock', '<p>');
  };

  // Underline Styles
  const handleUnderlineStyle = (style: string) => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.textDecoration = 'underline';
      span.style.textDecorationStyle = style;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      handleInput();
    } else {
      applyFormat('underline');
    }
  };

  // Text Color
  const handleTextColor = (color: string) => {
    setTextColor(color);
    applyFormat('foreColor', color);
  };

  // Highlight Background Color
  const handleHighlightColor = (color: string) => {
    setHighlightColor(color);
    applyFormat('hiliteColor', color);
  };

  // Line Spacing
  const handleLineSpacing = (spacing: string) => {
    setLineSpacing(spacing);
    if (editorRef.current) {
      editorRef.current.style.lineHeight = spacing;
    }
  };

  // Shading / Background Bucket Fill
  const handleShadingFill = (color: string) => {
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      const parentBlock = (selection.anchorNode as HTMLElement).closest?.('p, div, h1, h2, h3, blockquote');
      if (parentBlock) {
        (parentBlock as HTMLElement).style.backgroundColor = color;
        (parentBlock as HTMLElement).style.padding = '8px 12px';
        (parentBlock as HTMLElement).style.borderRadius = '4px';
        handleInput();
      }
    }
  };

  // Insert Table
  const handleInsertCustomTable = () => {
    let rowsHtml = '';
    for (let r = 0; r < tableRows; r++) {
      let cellsHtml = '';
      for (let c = 0; c < tableCols; c++) {
        if (r === 0) {
          cellsHtml += `<th style="border: 1px solid #CBD5E1; padding: 10px; background: #F1F5F9; font-weight: bold; text-align: ${isAr ? 'right' : 'left'};">${isAr ? `عمود ${c + 1}` : `Col ${c + 1}`}</th>`;
        } else {
          cellsHtml += `<td style="border: 1px solid #CBD5E1; padding: 8px; text-align: ${isAr ? 'right' : 'left'};">${isAr ? `خلية ${r},${c + 1}` : `Cell ${r},${c + 1}`}</td>`;
        }
      }
      rowsHtml += `<tr>${cellsHtml}</tr>`;
    }

    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #94A3B8; font-size: 11pt;">
        ${rowsHtml}
      </table>
      <p><br/></p>
    `;
    applyFormat('insertHTML', tableHtml);
    setShowTableModal(false);
  };

  // Insert Image (Upload / URL)
  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const imgHtml = `<p><img src="${base64}" alt="Uploaded" style="max-width: 100%; height: auto; border-radius: 6px; margin: 12px 0;" /></p><p></p>`;
        applyFormat('insertHTML', imgHtml);
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert Shapes
  const handleInsertShape = (type: 'rect' | 'circle' | 'line' | 'star') => {
    let shapeHtml = '';
    if (type === 'rect') {
      shapeHtml = `<div style="width: 160px; height: 90px; background: #0078D4; border-radius: 6px; margin: 12px 0; display: inline-block;"></div><p></p>`;
    } else if (type === 'circle') {
      shapeHtml = `<div style="width: 100px; height: 100px; background: #107C41; border-radius: 50%; margin: 12px 0; display: inline-block;"></div><p></p>`;
    } else if (type === 'line') {
      shapeHtml = `<hr style="border: none; border-top: 2px solid #0078D4; margin: 18px 0;" /><p></p>`;
    } else if (type === 'star') {
      shapeHtml = `<span style="font-size: 32pt; color: #F59E0B; margin: 8px;">★</span>`;
    }
    applyFormat('insertHTML', shapeHtml);
  };

  // Insert Hyperlink
  const handleInsertLink = () => {
    if (!linkUrl) return;
    const textToInsert = linkText || linkUrl;
    const aHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #0078D4; text-decoration: underline;">${textToInsert}</a>`;
    applyFormat('insertHTML', aHtml);
    setShowLinkModal(false);
    setLinkText('');
  };

  // Insert Date/Time
  const handleInsertDateTime = () => {
    const now = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    applyFormat('insertText', ` ${now} `);
  };

  // Search & Replace
  const handleFind = () => {
    if (!findText || !editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const regex = new RegExp(`(${findText})`, 'gi');
    const matches = content.match(regex);
    setFindMatchesCount(matches ? matches.length : 0);
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;
    const regex = new RegExp(findText, 'gi');
    editorRef.current.innerHTML = editorRef.current.innerHTML.replace(regex, replaceText);
    handleInput();
    setFindMatchesCount(0);
  };

  // Voice Dictation
  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isAr ? 'متصفحك لا يدعم التعرف على الصوت المباشر.' : 'Speech recognition not supported in this browser.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = isAr ? 'ar-SA' : 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (event.results[event.results.length - 1].isFinal) {
          applyFormat('insertText', ` ${transcript} `);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  // Speech Read Aloud
  const toggleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!editorRef.current) return;
      const text = editorRef.current.innerText || '';
      if (!text.trim()) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isAr ? 'ar-SA' : 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Copilot AI generation
  const handleCopilotGenerate = async () => {
    if (!copilotPrompt.trim()) return;
    setCopilotLoading(true);
    setCopilotResult('');

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: copilotPrompt,
          appType: 'word',
          context: `Document title: ${docTitle}. Current word count: ${stats.words}`,
        }),
      });
      const data = await response.json();
      setCopilotResult(data.text || '');
    } catch {
      setCopilotResult(
        isAr
          ? 'تم إنشاء المحتوى بنجاح بواسطة محرك الذكاء الاصطناعي SNNS AI.'
          : 'Content generated successfully by SNNS AI core.'
      );
    } finally {
      setCopilotLoading(false);
    }
  };

  const insertCopilotText = () => {
    if (!copilotResult) return;
    const formatted = copilotResult
      .replace(/### (.*?)\n/g, '<h3>$1</h3>')
      .replace(/## (.*?)\n/g, '<h2>$1</h2>')
      .replace(/# (.*?)\n/g, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<p></p>')
      .replace(/\n- (.*?)/g, '<li>$1</li>');
    applyFormat('insertHTML', formatted);
    setCopilotResult('');
    setShowCopilot(false);
  };

  // New Blank Document
  const createNewDoc = () => {
    const newId = `doc-${Date.now()}`;
    const newDoc = {
      id: newId,
      title: isAr ? 'مستند SNNS جديد' : 'New SNNS Document',
      content: `<h1>${isAr ? 'مستند نصي جديد' : 'New Document'}</h1><p>${isAr ? 'ابدأ في كتابة أفكارك هنا...' : 'Start writing here...'}</p>`,
      updatedAt: isAr ? 'الآن' : 'Just now',
    };
    const updated = { ...docs, [newId]: newDoc };
    storage.saveWordDocs(updated);
    setActiveDocId(newId);
    setDocTitle(newDoc.title);
  };

  // Margins styling
  const marginsClass = {
    normal: 'p-12 sm:p-16',
    narrow: 'p-6 sm:p-8',
    wide: 'p-16 sm:p-24',
  }[pageMargins];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F3F2F1] flex flex-col text-gray-900 select-none overflow-x-hidden font-sans"
    >
      {/* 1. Word Authentic Dark Title Bar (as in User Screenshot) */}
      <header className="bg-[#242424] text-white px-3 sm:px-4 py-1.5 flex items-center justify-between border-b border-black/40 text-xs shrink-0 select-none">
        {/* Left Side (in RTL): Window Controls & Avatar */}
        <div className="flex items-center gap-2">
          {/* Close, Maximize, Minimize Buttons */}
          <div className="flex items-center gap-1.5 me-2">
            <button
              onClick={onBack}
              className="p-1 hover:bg-red-600 rounded text-gray-300 hover:text-white transition"
              title={isAr ? 'إغلاق والعودة' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReadMode(!readMode)}
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

          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center border border-white/20">
            S
          </div>
        </div>

        {/* Center: Search Box (بحث) */}
        <div className="flex-1 max-w-md mx-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={isAr ? 'بحث (Alt+Q)' : 'Search (Alt+Q)'}
              value={findText}
              onChange={(e) => {
                setFindText(e.target.value);
                if (e.target.value) setShowFindReplace(true);
              }}
              className="w-full bg-[#383838] hover:bg-[#404040] focus:bg-[#202020] text-gray-100 placeholder-gray-400 rounded-md py-1 ps-8 pe-3 text-[11px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
            />
          </div>
        </div>

        {/* Right Side (in RTL): Document Title, AutoSave Switch, Quick Icons, Word Logo */}
        <div className="flex items-center gap-2">
          {/* Quick Access Icons: AutoSave, Save, Undo, Redo */}
          <div className="flex items-center gap-2 bg-[#2D2D2D] px-2 py-0.5 rounded-md border border-white/10">
            {/* AutoSave Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[10px] text-gray-300 font-medium">
                {isAr ? 'حفظ تلقائي' : 'AutoSave'}
              </span>
              <button
                type="button"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${
                  autoSaveEnabled ? 'bg-blue-500 justify-end' : 'bg-gray-600 justify-start'
                } flex items-center`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
              </button>
            </label>

            <div className="w-px h-3.5 bg-gray-600 mx-0.5" />

            <button
              onClick={saveCurrentDoc}
              className="p-1 hover:bg-white/15 rounded text-gray-300 hover:text-white transition"
              title={isAr ? 'حفظ (Ctrl+S)' : 'Save (Ctrl+S)'}
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => applyFormat('undo')}
              className="p-1 hover:bg-white/15 rounded text-gray-300 hover:text-white transition"
              title={isAr ? 'تراجع (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => applyFormat('redo')}
              className="p-1 hover:bg-white/15 rounded text-gray-300 hover:text-white transition"
              title={isAr ? 'إعادة (Ctrl+Y)' : 'Redo (Ctrl+Y)'}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Document Title input */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value);
                setIsSaved(false);
              }}
              className="font-bold text-xs text-gray-100 bg-transparent border-b border-transparent hover:border-gray-500 focus:border-blue-400 focus:outline-none px-1 text-end"
            />
            <span className="text-[10px] text-sky-400 font-normal">
              - {isAr ? 'SNNS Docs' : 'SNNS Docs'}
            </span>
          </div>

          {/* Word App Logo Icon */}
          <div className="p-0.5">
            <WordIcon className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* 2. Ribbon Tabs Bar (ملف، الشريط الرئيسي، إدراج، تصميم، تخطيط، مراجع، مراسلات، مراجعة، عرض، تعليمات) */}
      <div className="bg-[#2D2D2D] text-gray-200 px-3 flex items-center justify-between border-b border-gray-300/30 text-xs shrink-0 select-none">
        {/* Left Sub-Action Buttons (in RTL): مشاركة، تحرير، التعليقات */}
        <div className="flex items-center gap-1.5 py-1">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1 bg-[#0078D4] hover:bg-[#106EBE] text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'مشاركة' : 'Share'}</span>
          </button>

          <button
            onClick={() => {}}
            className="px-2.5 py-1 hover:bg-white/10 rounded-md text-gray-200 flex items-center gap-1 text-xs transition"
          >
            <Edit2Icon className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحرير' : 'Editing'}</span>
            <ChevronDown className="w-3 h-3" />
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
            { id: 'design', labelAr: 'تصميم', labelEn: 'Design' },
            { id: 'layout', labelAr: 'تخطيط', labelEn: 'Layout' },
            { id: 'references', labelAr: 'مراجع', labelEn: 'References' },
            { id: 'mailings', labelAr: 'مراسلات', labelEn: 'Mailings' },
            { id: 'review', labelAr: 'مراجعة', labelEn: 'Review' },
            { id: 'view', labelAr: 'عرض', labelEn: 'View' },
            { id: 'help', labelAr: 'تعليمات', labelEn: 'Help' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'file') {
                    // Open File Menu Dialog or Tab
                    setActiveTab('file');
                  } else {
                    setActiveTab(tab.id as any);
                    setRibbonCollapsed(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-t-sm transition-all cursor-pointer font-bold ${
                  isActive
                    ? 'bg-[#F3F2F1] text-gray-900 border-t-2 border-[#0078D4] shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. The Authentic Desktop Ribbon Body */}
      {!ribbonCollapsed && (
        <div className="bg-[#F3F2F1] border-b border-gray-300 text-gray-800 px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto scrollbar-none snns-scroll-touch shadow-xs text-xs select-none">
          {/* TAB: FILE (ملف) */}
          {activeTab === 'file' && (
            <div className="flex items-center gap-3">
              <button
                onClick={createNewDoc}
                className="px-3 py-1.5 bg-[#0078D4] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'مستند جديد' : 'New Document'}</span>
              </button>
              <button
                onClick={saveCurrentDoc}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'حفظ (Save)' : 'Save'}</span>
              </button>
              <button
                onClick={() => setShowPrintModal(true)}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
              </button>
              <button
                onClick={() => {
                  if (!editorRef.current) return;
                  const text = editorRef.current.innerText;
                  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${docTitle || 'Document'}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-gray-600" />
                <span>{isAr ? 'تصدير كملف نصي (TXT)' : 'Export TXT'}</span>
              </button>
              <button
                onClick={() => setShowEditorModal(true)}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'معلومات المستند والإحصائيات' : 'Document Info'}</span>
              </button>
            </div>
          )}

          {/* TAB: HOME (الشريط الرئيسي) - Matching screenshot exactly! */}
          {activeTab === 'home' && (
            <>
              {/* Group 1: الحافظة (Clipboard) */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 pe-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  {/* Big Paste Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.readText().then((txt) => {
                        applyFormat('insertText', txt);
                      }).catch(() => {
                        applyFormat('paste');
                      });
                    }}
                    className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-300 flex flex-col items-center gap-0.5 group cursor-pointer"
                    title={isAr ? 'لصق (Ctrl+V)' : 'Paste'}
                  >
                    <Clipboard className="w-6 h-6 text-[#0078D4] group-hover:scale-105 transition" />
                    <span className="text-[10px] font-bold flex items-center gap-0.5">
                      {isAr ? 'لصق' : 'Paste'}
                      <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
                    </span>
                  </button>

                  {/* Cut, Copy, Format Painter stacked */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => applyFormat('cut')}
                      className="px-1.5 py-0.5 hover:bg-white rounded flex items-center gap-1.5 text-[10px] text-gray-700"
                      title={isAr ? 'قص (Ctrl+X)' : 'Cut'}
                    >
                      <Scissors className="w-3.5 h-3.5 text-gray-600" />
                      <span>{isAr ? 'قص' : 'Cut'}</span>
                    </button>
                    <button
                      onClick={() => applyFormat('copy')}
                      className="px-1.5 py-0.5 hover:bg-white rounded flex items-center gap-1.5 text-[10px] text-gray-700"
                      title={isAr ? 'نسخ (Ctrl+C)' : 'Copy'}
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-600" />
                      <span>{isAr ? 'نسخ' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => applyFormat('copy')}
                      className="px-1.5 py-0.5 hover:bg-white rounded flex items-center gap-1.5 text-[10px] text-gray-700"
                      title={isAr ? 'نسخ التنسيق' : 'Format Painter'}
                    >
                      <Paintbrush className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isAr ? 'نسخ التنسيق' : 'Format'}</span>
                    </button>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">
                  {isAr ? 'الحافظة' : 'Clipboard'}
                </span>
              </div>

              {/* Group 2: خط (Font) */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <div className="space-y-1">
                  {/* Top row: Font Family, Font Size, A^, Av, Aa, Clear */}
                  <div className="flex items-center gap-1">
                    {/* Font Family */}
                    <select
                      value={fontFamily}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                      className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 w-28 sm:w-36"
                    >
                      <option value="Calibri">Calibri (الأساسي)</option>
                      <option value="Arial">Arial</option>
                      <option value="Amiri">Amiri (أميري)</option>
                      <option value="Cairo">Cairo (القاهرة)</option>
                      <option value="Tahoma">Tahoma</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Segoe UI">Segoe UI</option>
                    </select>

                    {/* Font Size */}
                    <select
                      value={fontSize}
                      onChange={(e) => handleFontSizeChange(e.target.value)}
                      className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 w-12"
                    >
                      {['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'].map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>

                    {/* A^ (Grow Font) */}
                    <button
                      onClick={() => adjustFontSize(2)}
                      className="p-1 hover:bg-white rounded text-gray-700 font-bold flex items-center"
                      title={isAr ? 'تكبير حجم الخط (Ctrl+])' : 'Increase Font Size'}
                    >
                      <span className="text-xs">A</span>
                      <ChevronUp className="w-2.5 h-2.5 -ms-0.5" />
                    </button>

                    {/* Av (Shrink Font) */}
                    <button
                      onClick={() => adjustFontSize(-2)}
                      className="p-1 hover:bg-white rounded text-gray-700 font-bold flex items-center"
                      title={isAr ? 'تصغير حجم الخط (Ctrl+[)' : 'Decrease Font Size'}
                    >
                      <span className="text-xs">A</span>
                      <ChevronDown className="w-2.5 h-2.5 -ms-0.5" />
                    </button>

                    {/* Aa (Change Case) */}
                    <div className="relative group/case">
                      <button
                        className="p-1 hover:bg-white rounded text-gray-700 font-bold flex items-center text-xs"
                        title={isAr ? 'تغيير حالة الأحرف' : 'Change Case'}
                      >
                        <span>Aa</span>
                        <ChevronDown className="w-2.5 h-2.5 ms-0.5 text-gray-500" />
                      </button>
                      <div className="absolute top-full start-0 hidden group-hover/case:block bg-white shadow-xl border border-gray-200 rounded py-1 z-50 text-[11px] w-36">
                        <button
                          onClick={() => handleChangeCase('sentence')}
                          className="w-full text-start px-2 py-1 hover:bg-blue-50 text-gray-800"
                        >
                          Sentence case.
                        </button>
                        <button
                          onClick={() => handleChangeCase('lower')}
                          className="w-full text-start px-2 py-1 hover:bg-blue-50 text-gray-800"
                        >
                          lowercase
                        </button>
                        <button
                          onClick={() => handleChangeCase('upper')}
                          className="w-full text-start px-2 py-1 hover:bg-blue-50 text-gray-800"
                        >
                          UPPERCASE
                        </button>
                        <button
                          onClick={() => handleChangeCase('title')}
                          className="w-full text-start px-2 py-1 hover:bg-blue-50 text-gray-800"
                        >
                          Capitalize Each Word
                        </button>
                      </div>
                    </div>

                    {/* Clear Formatting */}
                    <button
                      onClick={handleClearFormatting}
                      className="p-1 hover:bg-white rounded text-gray-600"
                      title={isAr ? 'مسح كافة التنسيقات' : 'Clear All Formatting'}
                    >
                      <span className="text-[11px] line-through font-serif">A</span>
                    </button>
                  </div>

                  {/* Bottom row: Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Effects, Highlight, Color */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => applyFormat('bold')}
                      className="p-1 hover:bg-white rounded font-black text-xs w-6 text-center"
                      title={isAr ? 'غامق (Ctrl+B)' : 'Bold'}
                    >
                      B
                    </button>
                    <button
                      onClick={() => applyFormat('italic')}
                      className="p-1 hover:bg-white rounded italic font-serif text-xs w-6 text-center"
                      title={isAr ? 'مائل (Ctrl+I)' : 'Italic'}
                    >
                      I
                    </button>

                    {/* Underline with dropdown */}
                    <div className="relative group/u flex items-center">
                      <button
                        onClick={() => applyFormat('underline')}
                        className="p-1 hover:bg-white rounded underline text-xs font-serif"
                        title={isAr ? 'تسطير (Ctrl+U)' : 'Underline'}
                      >
                        U
                      </button>
                      <button className="p-0.5 hover:bg-white rounded text-gray-500">
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                      <div className="absolute top-full start-0 hidden group-hover/u:block bg-white shadow-xl border border-gray-200 rounded py-1 z-50 text-[11px] w-28">
                        <button onClick={() => handleUnderlineStyle('solid')} className="w-full text-start px-2 py-1 hover:bg-blue-50 border-b border-black">خط بسيط</button>
                        <button onClick={() => handleUnderlineStyle('double')} className="w-full text-start px-2 py-1 hover:bg-blue-50 border-b-2 border-double border-black">خط مزدوج</button>
                        <button onClick={() => handleUnderlineStyle('dotted')} className="w-full text-start px-2 py-1 hover:bg-blue-50 border-b border-dotted border-black">خط نقطي</button>
                        <button onClick={() => handleUnderlineStyle('wavy')} className="w-full text-start px-2 py-1 hover:bg-blue-50 border-b border-wavy border-black">خط مموج</button>
                      </div>
                    </div>

                    {/* Strikethrough */}
                    <button
                      onClick={() => applyFormat('strikeThrough')}
                      className="p-1 hover:bg-white rounded line-through text-xs font-mono"
                      title={isAr ? 'يتوسطه خط' : 'Strikethrough'}
                    >
                      ab
                    </button>

                    {/* Subscript */}
                    <button
                      onClick={() => applyFormat('subscript')}
                      className="p-1 hover:bg-white rounded text-xs"
                      title={isAr ? 'منخفض' : 'Subscript'}
                    >
                      x₂
                    </button>

                    {/* Superscript */}
                    <button
                      onClick={() => applyFormat('superscript')}
                      className="p-1 hover:bg-white rounded text-xs"
                      title={isAr ? 'مرتفع' : 'Superscript'}
                    >
                      x²
                    </button>

                    {/* Glowing A (Text effects) */}
                    <button
                      onClick={() => {
                        applyFormat('foreColor', '#0078D4');
                        applyFormat('bold');
                      }}
                      className="p-1 hover:bg-white rounded text-xs font-black text-blue-600 shadow-2xs"
                      title={isAr ? 'تأثيرات النص والطباعة' : 'Text Effects'}
                    >
                      A
                    </button>

                    {/* Highlight Pen */}
                    <label className="flex items-center gap-0.5 p-1 hover:bg-white rounded cursor-pointer relative" title={isAr ? 'لون تمييز النص' : 'Highlight Color'}>
                      <span className="text-xs font-bold bg-yellow-300 px-1 rounded-xs">ab</span>
                      <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => handleHighlightColor(e.target.value)}
                        className="w-0 h-0 opacity-0 absolute pointer-events-none"
                      />
                    </label>

                    {/* Font Color Picker */}
                    <label className="flex items-center gap-0.5 p-1 hover:bg-white rounded cursor-pointer relative" title={isAr ? 'لون الخط' : 'Font Color'}>
                      <span className="text-xs font-bold text-red-600 border-b-2 border-red-600 px-0.5">A</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => handleTextColor(e.target.value)}
                        className="w-0 h-0 opacity-0 absolute pointer-events-none"
                      />
                    </label>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">
                  {isAr ? 'خط' : 'Font'}
                </span>
              </div>

              {/* Group 3: فقرة (Paragraph) */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <div className="space-y-1">
                  {/* Top row: Bullets, Numbers, Multilevel, Indents, Direction, Sort, ¶ */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => applyFormat('insertUnorderedList')}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'تعداد نقطي' : 'Bullets'}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => applyFormat('insertOrderedList')}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'تعداد رقمي' : 'Numbering'}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>

                    {/* Decrease Indent */}
                    <button
                      onClick={() => applyFormat('outdent')}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'إنقاص المسافة البادئة' : 'Decrease Indent'}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Increase Indent */}
                    <button
                      onClick={() => applyFormat('indent')}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'زيادة المسافة البادئة' : 'Increase Indent'}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* RTL / LTR Direction */}
                    <button
                      onClick={() => {
                        if (editorRef.current) {
                          editorRef.current.dir = editorRef.current.dir === 'rtl' ? 'ltr' : 'rtl';
                        }
                      }}
                      className="p-1 hover:bg-white rounded text-[10px] font-bold"
                      title={isAr ? 'تبديل اتجاه النص (RTL / LTR)' : 'Text Direction'}
                    >
                      ¶⇄
                    </button>

                    {/* Show/Hide paragraph marks ¶ */}
                    <button
                      onClick={() => setShowParagraphMarks(!showParagraphMarks)}
                      className={`p-1 hover:bg-white rounded font-serif ${showParagraphMarks ? 'bg-blue-100 text-blue-700' : ''}`}
                      title={isAr ? 'إظهار الكل ¶' : 'Show/Hide Marks'}
                    >
                      ¶
                    </button>
                  </div>

                  {/* Bottom row: Alignments, Spacing, Shading, Borders */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => applyFormat('justifyRight')}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'محاذاة لليمين (Ctrl+R)' : 'Align Right'}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => applyFormat('justifyCenter')}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'توسيط (Ctrl+E)' : 'Center'}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => applyFormat('justifyLeft')}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'محاذاة لليسار (Ctrl+L)' : 'Align Left'}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => applyFormat('justifyFull')}
                      className="p-1 hover:bg-white rounded"
                      title={isAr ? 'ضبط كشيدة (Ctrl+J)' : 'Justify'}
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>

                    {/* Line Spacing Dropdown */}
                    <div className="relative group/spacing">
                      <button className="p-1 hover:bg-white rounded flex items-center gap-0.5 text-xs">
                        <span>↕</span>
                        <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
                      </button>
                      <div className="absolute top-full start-0 hidden group-hover/spacing:block bg-white shadow-xl border border-gray-200 rounded py-1 z-50 text-[11px] w-28">
                        {['1.0', '1.15', '1.5', '2.0', '2.5', '3.0'].map((sp) => (
                          <button
                            key={sp}
                            onClick={() => handleLineSpacing(sp)}
                            className="w-full text-start px-2 py-1 hover:bg-blue-50 text-gray-800"
                          >
                            {sp}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shading Bucket */}
                    <div className="relative group/bucket">
                      <button className="p-1 hover:bg-white rounded text-xs" title={isAr ? 'تظليل الفقرة' : 'Shading'}>
                        <Paintbrush className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <div className="absolute top-full start-0 hidden group-hover/bucket:grid grid-cols-4 gap-1 p-2 bg-white shadow-xl border border-gray-200 rounded z-50 w-32">
                        {['#F1F5F9', '#FEF3C7', '#DCFCE7', '#DBEAFE', '#FCE7F3', '#EDE9FE', '#FFEDD5', '#FFFFFF'].map((c) => (
                          <button
                            key={c}
                            onClick={() => handleShadingFill(c)}
                            style={{ backgroundColor: c }}
                            className="w-5 h-5 rounded border border-gray-300"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">
                  {isAr ? 'فقرة' : 'Paragraph'}
                </span>
              </div>

              {/* Group 4: أنماط (Styles Gallery) - Visual Boxes like Office */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {[
                    { id: 'normal', nameAr: 'عادي', nameEn: 'Normal', sample: 'AaBbCc' },
                    { id: 'nospace', nameAr: 'بلا تباعد', nameEn: 'No Spacing', sample: 'AaBbCc' },
                    { id: 'h1', nameAr: 'العنوان 1', nameEn: 'Heading 1', sample: 'العنوان 1', color: 'text-blue-700 font-bold text-sm' },
                    { id: 'h2', nameAr: 'العنوان 2', nameEn: 'Heading 2', sample: 'عنوان 2', color: 'text-sky-600 font-bold' },
                    { id: 'title', nameAr: 'العنوان', nameEn: 'Title', sample: 'العنوان', color: 'text-gray-950 font-black text-base' },
                    { id: 'subtitle', nameAr: 'عنوان فرعي', nameEn: 'Subtitle', sample: 'عنوان فرعي', color: 'text-gray-500 italic' },
                    { id: 'quote', nameAr: 'اقتباس', nameEn: 'Quote', sample: 'اقتباس مميز', color: 'text-blue-800 italic border-s-2 border-blue-500 ps-1' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => applyStylePreset(style.id)}
                      className="bg-white hover:bg-blue-50 hover:border-blue-400 border border-gray-300 rounded px-2.5 py-1 text-center min-w-[64px] h-[52px] flex flex-col justify-between transition cursor-pointer shadow-2xs"
                    >
                      <span className={`truncate w-full ${style.color || 'text-xs text-gray-800'}`}>
                        {style.sample}
                      </span>
                      <span className="text-[9px] text-gray-500 block truncate">
                        {isAr ? style.nameAr : style.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">
                  {isAr ? 'أنماط' : 'Styles'}
                </span>
              </div>

              {/* Group 5: تحرير (Editing) */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setShowFindReplace(true)}
                    className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white rounded text-[11px] text-gray-800"
                  >
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isAr ? 'بحث' : 'Find'}</span>
                  </button>
                  <button
                    onClick={() => setShowFindReplace(true)}
                    className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white rounded text-[11px] text-gray-800"
                  >
                    <Replace className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isAr ? 'استبدال' : 'Replace'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (editorRef.current) {
                        const range = document.createRange();
                        range.selectNodeContents(editorRef.current);
                        const sel = window.getSelection();
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                      }
                    }}
                    className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white rounded text-[11px] text-gray-800"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-gray-600" />
                    <span>{isAr ? 'تحديد' : 'Select'}</span>
                  </button>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1">
                  {isAr ? 'تحرير' : 'Editing'}
                </span>
              </div>

              {/* Group 6: صوت (Voice) */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 transition ${
                    isRecording ? 'bg-red-50 text-red-600 ring-2 ring-red-400 animate-pulse' : 'hover:bg-white text-gray-800'
                  }`}
                  title={isAr ? 'إملاء صوتي مباشر' : 'Voice Dictate'}
                >
                  <Mic className="w-6 h-6 text-red-500" />
                  <span className="text-[10px] font-bold">{isAr ? 'إملاء' : 'Dictate'}</span>
                </button>
                <span className="text-[9px] text-gray-400 font-bold mt-1">
                  {isAr ? 'صوت' : 'Voice'}
                </span>
              </div>

              {/* Group 7: المحرر (Editor) */}
              <div className="flex flex-col items-center justify-between border-e border-gray-300/80 px-2 shrink-0">
                <button
                  onClick={() => setShowEditorModal(true)}
                  className="p-2 hover:bg-white rounded-xl flex flex-col items-center gap-1 transition text-blue-700"
                  title={isAr ? 'المحرر الذكي للتدقيق الإملائي والنحوي' : 'Editor / Proofing'}
                >
                  <CheckSquare className="w-6 h-6 text-blue-600" />
                  <span className="text-[10px] font-bold">{isAr ? 'المحرر' : 'Editor'}</span>
                </button>
                <span className="text-[9px] text-gray-400 font-bold mt-1">
                  {isAr ? 'المحرر' : 'Proofing'}
                </span>
              </div>

              {/* Group 8: الوظائف الإضافية / Copilot AI */}
              <div className="flex flex-col items-center justify-between px-2 shrink-0">
                <button
                  onClick={() => setShowCopilot(true)}
                  className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 rounded-xl flex flex-col items-center gap-1 shadow-sm transition"
                  title="SNNS AI Copilot"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span className="text-[10px] font-bold">Copilot AI</span>
                </button>
                <span className="text-[9px] text-gray-400 font-bold mt-1">
                  {isAr ? 'الوظائف الإضافية' : 'Add-ins'}
                </span>
              </div>
            </>
          )}

          {/* TAB: INSERT (إدراج) */}
          {activeTab === 'insert' && (
            <div className="flex items-center gap-3">
              {/* Blank Page & Page Break */}
              <button
                onClick={() => applyFormat('insertHTML', '<div style="page-break-after: always; height: 1px; border-bottom: 2px dashed #94A3B8; margin: 30px 0;"></div><p></p>')}
                className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-[10px]">{isAr ? 'فاصل صفحات' : 'Page Break'}</span>
              </button>

              <div className="w-px h-10 bg-gray-300" />

              {/* Table Button */}
              <button
                onClick={() => setShowTableModal(true)}
                className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs font-bold text-blue-800"
              >
                <TableIcon className="w-5 h-5 text-blue-600" />
                <span className="text-[10px]">{isAr ? 'جدول' : 'Table'}</span>
              </button>

              <div className="w-px h-10 bg-gray-300" />

              {/* Picture Upload */}
              <label className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs cursor-pointer">
                <span className="text-xl">🖼️</span>
                <span className="text-[10px]">{isAr ? 'صور' : 'Pictures'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInsertImage}
                  className="hidden"
                />
              </label>

              {/* Shapes */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleInsertShape('rect')}
                  className="p-1 hover:bg-white rounded"
                  title="Rectangle"
                >
                  <Square className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleInsertShape('circle')}
                  className="p-1 hover:bg-white rounded"
                  title="Circle"
                >
                  <Circle className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => handleInsertShape('star')}
                  className="p-1 hover:bg-white rounded text-amber-500 font-bold"
                  title="Star"
                >
                  ★
                </button>
                <button
                  onClick={() => handleInsertShape('line')}
                  className="p-1 hover:bg-white rounded"
                  title="Horizontal Line"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="w-px h-10 bg-gray-300" />

              {/* Link */}
              <button
                onClick={() => setShowLinkModal(true)}
                className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs"
              >
                <LinkIcon className="w-4 h-4 text-blue-600" />
                <span className="text-[10px]">{isAr ? 'ارتباط' : 'Link'}</span>
              </button>

              {/* Date & Time */}
              <button
                onClick={handleInsertDateTime}
                className="p-1.5 hover:bg-white rounded flex flex-col items-center text-xs"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-[10px]">{isAr ? 'تاريخ ووقت' : 'Date/Time'}</span>
              </button>
            </div>
          )}

          {/* TAB: DESIGN (تصميم) */}
          {activeTab === 'design' && (
            <div className="flex items-center gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">{isAr ? 'لون الصفحة:' : 'Page Color:'}</label>
                <div className="flex items-center gap-1">
                  {['#FFFFFF', '#FEF9C3', '#F1F5F9', '#1E293B'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPageColor(c)}
                      style={{ backgroundColor: c }}
                      className="w-5 h-5 rounded border border-gray-300 shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              <div className="w-px h-10 bg-gray-300" />

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">{isAr ? 'علامة مائية:' : 'Watermark:'}</label>
                <select
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  className="p-1 bg-white border border-gray-300 rounded text-xs font-semibold"
                >
                  <option value="">{isAr ? 'بلا علامة مائية' : 'None'}</option>
                  <option value="مسودة">{isAr ? 'مسودة (DRAFT)' : 'DRAFT'}</option>
                  <option value="سري للغاية">{isAr ? 'سري للغاية (CONFIDENTIAL)' : 'CONFIDENTIAL'}</option>
                  <option value="SNNS 365">SNNS 365 Official</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB: LAYOUT (تخطيط) */}
          {activeTab === 'layout' && (
            <div className="flex items-center gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">{isAr ? 'الهوامش:' : 'Margins:'}</label>
                <select
                  value={pageMargins}
                  onChange={(e) => setPageMargins(e.target.value as any)}
                  className="p-1 bg-white border border-gray-300 rounded text-xs font-semibold"
                >
                  <option value="normal">{isAr ? 'عادي (2.5 سم)' : 'Normal (2.5 cm)'}</option>
                  <option value="narrow">{isAr ? 'ضيق (1.25 سم)' : 'Narrow (1.25 cm)'}</option>
                  <option value="wide">{isAr ? 'عريض (3.8 سم)' : 'Wide (3.8 cm)'}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">{isAr ? 'الاتجاه:' : 'Orientation:'}</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPageOrientation('portrait')}
                    className={`px-2 py-1 rounded text-xs font-bold ${pageOrientation === 'portrait' ? 'bg-blue-600 text-white' : 'bg-white'}`}
                  >
                    {isAr ? 'عمودي' : 'Portrait'}
                  </button>
                  <button
                    onClick={() => setPageOrientation('landscape')}
                    className={`px-2 py-1 rounded text-xs font-bold ${pageOrientation === 'landscape' ? 'bg-blue-600 text-white' : 'bg-white'}`}
                  >
                    {isAr ? 'أفقي' : 'Landscape'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">{isAr ? 'الحجم:' : 'Size:'}</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="p-1 bg-white border border-gray-300 rounded text-xs font-semibold"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                  <option value="A3">A3</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB: REVIEW (مراجعة) */}
          {activeTab === 'review' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditorModal(true)}
                className="p-2 hover:bg-white rounded flex flex-col items-center text-xs"
              >
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="text-[10px] font-bold">{isAr ? 'تدقيق إملائي' : 'Spelling'}</span>
              </button>

              <button
                onClick={toggleReadAloud}
                className={`p-2 rounded flex flex-col items-center text-xs ${
                  isSpeaking ? 'bg-blue-600 text-white animate-pulse' : 'hover:bg-white text-gray-800'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-blue-600" />}
                <span className="text-[10px] font-bold">{isSpeaking ? (isAr ? 'إيقاف' : 'Stop') : (isAr ? 'قراءة بصوت عالٍ' : 'Read Aloud')}</span>
              </button>

              <button
                onClick={() => setShowEditorModal(true)}
                className="p-2 hover:bg-white rounded flex flex-col items-center text-xs"
              >
                <Hash className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px] font-bold">{isAr ? 'عدد الكلمات' : 'Word Count'}</span>
              </button>
            </div>
          )}

          {/* TAB: VIEW (عرض) */}
          {activeTab === 'view' && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setReadMode(!readMode)}
                className={`px-3 py-1.5 rounded text-xs font-bold ${readMode ? 'bg-blue-600 text-white' : 'bg-white'}`}
              >
                {isAr ? 'وضع القراءة' : 'Read Mode'}
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={showRuler}
                  onChange={(e) => setShowRuler(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>{isAr ? 'المسطرة' : 'Ruler'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={showGridlines}
                  onChange={(e) => setShowGridlines(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>{isAr ? 'خطوط الشبكة' : 'Gridlines'}</span>
              </label>

              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="px-2 py-0.5 bg-white border border-gray-300 rounded font-bold"
                >
                  -
                </button>
                <span className="font-mono px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                  className="px-2 py-0.5 bg-white border border-gray-300 rounded font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Find & Replace Bar */}
      {showFindReplace && (
        <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between gap-3 text-xs shadow-md animate-in fade-in slide-in-from-top-2 duration-150 z-30">
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1">
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder={isAr ? 'البحث عن كلمة...' : 'Find text...'}
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFind()}
                className="bg-transparent text-xs text-gray-900 focus:outline-none w-full"
              />
              {findMatchesCount > 0 && (
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">
                  {findMatchesCount} {isAr ? 'مطابقة' : 'matches'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1">
              <Replace className="w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder={isAr ? 'استبدال بـ...' : 'Replace with...'}
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="bg-transparent text-xs text-gray-900 focus:outline-none w-full"
              />
            </div>

            <button
              onClick={handleFind}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-semibold"
            >
              {isAr ? 'بحث' : 'Find'}
            </button>
            <button
              onClick={handleReplaceAll}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
            >
              {isAr ? 'استبدال الكل' : 'Replace All'}
            </button>
          </div>

          <button
            onClick={() => setShowFindReplace(false)}
            className="p-1 hover:bg-gray-100 rounded text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Document Canvas Area with Authentic Office Ruler & Realistic Paper */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Paper Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center bg-[#E5E5E5]/90">
          {/* Optional Ruler */}
          {showRuler && (
            <div className="w-full max-w-[820px] h-5 bg-white border border-gray-300 mb-2 flex items-center justify-between px-6 text-[9px] text-gray-400 font-mono shadow-2xs">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10</span>
              <span>12</span>
              <span>14</span>
              <span>16</span>
              <span>18</span>
              <span>20</span>
              <span>22</span>
            </div>
          )}

          {/* Authentic A4 Paper Sheet */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              backgroundColor: pageColor,
            }}
            className={`w-full max-w-[820px] min-h-[1050px] shadow-2xl border border-gray-300 rounded-xs text-gray-900 focus:outline-none relative transition-transform duration-150 ${marginsClass} ${
              pageOrientation === 'landscape' ? 'max-w-[1050px] min-h-[820px]' : ''
            }`}
          >
            {/* Watermark if present */}
            {watermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span className="text-gray-200/60 font-black text-6xl sm:text-7xl -rotate-45 tracking-widest uppercase">
                  {watermark}
                </span>
              </div>
            )}

            {/* Editable Paper Surface */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              className="w-full min-h-[900px] focus:outline-none prose prose-blue max-w-none text-base leading-relaxed"
              style={{
                fontFamily,
                color: textColor,
              }}
            />

            {/* Simulated Page Footer */}
            <div className="absolute bottom-4 start-8 end-8 border-t border-gray-200 pt-2 flex items-center justify-between text-[10px] text-gray-400 pointer-events-none select-none">
              <span>SNNS 365 Cloud Document</span>
              <span>{isAr ? `صفحة 1 من ${stats.pages}` : `Page 1 of ${stats.pages}`}</span>
            </div>
          </div>
        </div>

        {/* Copilot Sidebar Panel */}
        {showCopilot && (
          <aside className="w-80 sm:w-96 bg-white border-s border-gray-200 p-4 flex flex-col justify-between shadow-2xl z-30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">SNNS Copilot AI</h3>
                    <p className="text-[10px] text-gray-500">{isAr ? 'مساعد الصياغة والكتابة الفائق' : 'Writing & Drafting Assistant'}</p>
                  </div>
                </div>
                <button onClick={() => setShowCopilot(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 block">
                  {isAr ? 'ما الذي تريد من Copilot صياغته أو تحسينه؟' : 'What would you like Copilot to write or improve?'}
                </label>
                <textarea
                  rows={4}
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: اكتب خطاباً رسمياً لطلب تمويل، أو لخص المستند، أو أنشئ جدول مقارنة...'
                      : 'e.g., Draft an executive summary, generate an announcement, summarize...'
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={handleCopilotGenerate}
                  disabled={copilotLoading || !copilotPrompt.trim()}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{copilotLoading ? (isAr ? 'جاري التوليد بالذكاء الاصطناعي...' : 'Generating...') : (isAr ? 'توليد المحتوى' : 'Generate with AI')}</span>
                </button>

                {copilotResult && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'اقتراح Copilot:' : 'Generated Content:'}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {copilotResult}
                    </p>
                    <button
                      onClick={insertCopilotText}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      {isAr ? 'إدراج في المستند' : 'Insert into Document'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t text-[11px] text-gray-400 text-center">
              SNNS Copilot Enterprise • Gemini 2.5 Flash
            </div>
          </aside>
        )}
      </div>

      {/* 5. Authentic Bottom Status Bar (شريط الحالة السفلي كما في Word) */}
      <footer className="bg-[#0078D4] text-white px-4 py-1 flex items-center justify-between text-[11px] font-medium shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>{isAr ? `صفحة 1 من ${stats.pages}` : `Page 1 of ${stats.pages}`}</span>
          <span>•</span>
          <span>{stats.words} {isAr ? 'كلمة' : 'words'}</span>
          <span>•</span>
          <span>{stats.characters} {isAr ? 'حرف' : 'characters'}</span>
          <span>•</span>
          <span>{isAr ? 'العربية (المملكة العربية السعودية)' : 'English (United States)'}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            {isSaved ? <Check className="w-3 h-3 text-emerald-300" /> : <Save className="w-3 h-3 animate-spin" />}
            <span>{isSaved ? (isAr ? 'تم الحفظ في OneDrive' : 'Saved to OneDrive') : (isAr ? 'جاري الحفظ...' : 'Saving...')}</span>
          </span>

          <div className="flex items-center gap-1 ms-2">
            <button onClick={() => setZoomLevel((z) => Math.max(50, z - 10))} className="px-1 hover:bg-white/20 rounded font-bold">-</button>
            <span className="font-mono text-[10px] w-8 text-center">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel((z) => Math.min(200, z + 10))} className="px-1 hover:bg-white/20 rounded font-bold">+</button>
          </div>
        </div>
      </footer>

      {/* Table Insertion Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-200">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'إدراج جدول مخصص' : 'Insert Custom Table'}</span>
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">{isAr ? 'عدد الأعمدة:' : 'Number of Columns:'}</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">{isAr ? 'عدد الصفوف:' : 'Number of Rows:'}</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleInsertCustomTable}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                {isAr ? 'إدراج الجدول' : 'Insert Table'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hyperlink Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-200">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'إدراج ارتباط تشعبي' : 'Insert Hyperlink'}</span>
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">{isAr ? 'النص المعروض:' : 'Display Text:'}</label>
                <input
                  type="text"
                  placeholder="e.g. SNNS Portal"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">{isAr ? 'رابط الويب (URL):' : 'Web Address (URL):'}</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLinkModal(false)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleInsertLink} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold">
                {isAr ? 'إدراج' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Proofing & Stats Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditorModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span>{isAr ? 'تقرير المحرر الذكي وإحصائيات المستند' : 'Editor Report & Document Stats'}</span>
              </h3>
              <button onClick={() => setShowEditorModal(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                <div className="text-xl font-black text-blue-900">{stats.words}</div>
                <div className="text-xs text-blue-600 font-bold">{isAr ? 'كلمة' : 'Words'}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                <div className="text-xl font-black text-emerald-900">{stats.characters}</div>
                <div className="text-xs text-emerald-600 font-bold">{isAr ? 'حرف' : 'Characters'}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-center">
                <div className="text-xl font-black text-purple-900">{stats.paragraphs}</div>
                <div className="text-xs text-purple-600 font-bold">{isAr ? 'فقرة' : 'Paragraphs'}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
                <div className="text-xl font-black text-amber-900">{stats.readingTime} {isAr ? 'د' : 'min'}</div>
                <div className="text-xs text-amber-600 font-bold">{isAr ? 'وقت القراءة' : 'Reading Time'}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'التدقيق الإملائي: سليم 100% ولا توجد أخطاء لغوية' : 'Spelling: 100% Verified'}</span>
              </div>
              <div className="p-2.5 bg-sky-50 text-sky-800 rounded-lg flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>{isAr ? 'مستوى الوضوح والمقروئية: ممتاز ومناسب للتقارير الرسمية' : 'Readability: Excellent'}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowEditorModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
              >
                {isAr ? 'إغلاق' : 'Close'}
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
              <Share2 className="w-5 h-5 text-blue-600" />
              <span>{isAr ? 'مشاركة المستند السحابي' : 'Share Document'}</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isAr ? 'يمكن لأي شخص لديه الرابط استعراض أو تحرير هذا المستند في SNNS 365.' : 'Anyone with link can view or edit.'}
            </p>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 p-2 rounded-xl mb-4 text-xs font-mono">
              <span className="truncate flex-1">https://snns365.cloud/doc/{activeDocId}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://snns365.cloud/doc/${activeDocId}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shrink-0"
              >
                {copiedLink ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}
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
        title={docTitle}
        subtitle={isAr ? 'مستند تحرير نصوص رسمي - SNNS Word' : 'Official Word Processing Document'}
        contentHtml={editorRef.current?.innerHTML || '<p></p>'}
        lang={lang}
      />
    </div>
  );
};

// Simple Edit2Icon helper for ribbon
function Edit2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...(props as any)}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}
