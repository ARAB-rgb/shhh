import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Palette,
  FileText,
  Printer,
} from 'lucide-react';
import { PowerPointIcon } from '../icons/AppIcons';
import { SlideItem } from '../../types/suite';
import { storage } from '../../services/storage';
import { PrintDialogModal } from '../common/PrintDialogModal';

interface PowerPointAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

const THEMES: Record<string, { bg: string; text: string; accent: string; cardBg: string }> = {
  'modern-blue': {
    bg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950',
    text: 'text-white',
    accent: 'text-sky-400',
    cardBg: 'bg-white/10 backdrop-blur-md border border-white/20',
  },
  'crimson-dark': {
    bg: 'bg-gradient-to-br from-neutral-900 via-stone-900 to-red-950',
    text: 'text-white',
    accent: 'text-rose-400',
    cardBg: 'bg-white/10 backdrop-blur-md border border-white/20',
  },
  'emerald-clean': {
    bg: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950',
    text: 'text-white',
    accent: 'text-emerald-300',
    cardBg: 'bg-white/10 backdrop-blur-md border border-white/20',
  },
  'minimal-white': {
    bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    text: 'text-gray-900',
    accent: 'text-blue-600',
    cardBg: 'bg-white border border-gray-200 shadow-sm',
  },
};

export const PowerPointApp: React.FC<PowerPointAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const ppts = storage.getPPTs();
  const [deckId, setDeckId] = useState<string>('ppt-1');
  const [deckTitle, setDeckTitle] = useState<string>(ppts['ppt-1']?.title || 'SNNS Presentation');
  const [slides, setSlides] = useState<SlideItem[]>(ppts['ppt-1']?.slides || []);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('modern-blue');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isSlideShow, setIsSlideShow] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showCopilot, setShowCopilot] = useState<boolean>(false);
  const [copilotTopic, setCopilotTopic] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);

  const generatePrintableSlidesHtml = (): string => {
    let html = '';
    slides.forEach((s, idx) => {
      const bulletsList = (s.bullets || []).map((b) => `<li style="margin-bottom:6px;">${b}</li>`).join('');
      html += `
        <div style="border: 2px solid #E5E7EB; border-radius: 8px; padding: 24px; margin-bottom: 24px; page-break-inside: avoid; background: #FAFAFA;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #D1D5DB; padding-bottom:8px; margin-bottom:12px;">
            <span style="font-size:9pt; font-weight:bold; color:#0078D4;">الشريحة ${idx + 1} من ${slides.length}</span>
            <span style="font-size:9pt; color:#6B7280;">SNNS Presentation</span>
          </div>
          <h2 style="margin:0 0 4px 0; font-size:16pt; color:#111827;">${s.title}</h2>
          ${s.subtitle ? `<div style="font-size:11pt; color:#4B5563; margin-bottom:14px;">${s.subtitle}</div>` : ''}
          <ul style="font-size:11pt; line-height:1.6; color:#1F2937; padding-inline-start:20px;">
            ${bulletsList}
          </ul>
          ${s.notes ? `<div style="margin-top:16px; padding:8px 12px; background:#F3F4F6; border-radius:6px; font-size:9pt; color:#4B5563;"><strong style="color:#111827;">ملاحظات المتحدث:</strong> ${s.notes}</div>` : ''}
        </div>
      `;
    });
    return html;
  };

  const currentSlide = slides[activeSlideIndex] || slides[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSlideShow) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsSlideShow(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideShow, slides.length]);

  const saveDeck = () => {
    const updated = {
      ...ppts,
      [deckId]: {
        id: deckId,
        title: deckTitle,
        slides,
        updatedAt: 'Just now',
      },
    };
    storage.savePPTs(updated);
    setIsSaved(true);
  };

  const updateCurrentSlide = (fields: Partial<SlideItem>) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, ...fields } : s))
    );
    setIsSaved(false);
  };

  const addSlide = () => {
    const newSlide: SlideItem = {
      id: `s-${Date.now()}`,
      title: isAr ? 'عنوان الشريحة الجديدة' : 'New Slide Title',
      subtitle: isAr ? 'وصف أو ملخص تنفيذي' : 'Subtitle or overview',
      bullets: [
        isAr ? 'نقطة رئيسية أولى' : 'Key takeaway point one',
        isAr ? 'نقطة رئيسية ثانية تدعم الفكرة' : 'Supporting milestone point two',
      ],
      theme: selectedTheme,
      layout: 'content',
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
    setIsSaved(false);
  };

  const duplicateSlide = () => {
    if (!currentSlide) return;
    const duplicated: SlideItem = {
      ...currentSlide,
      id: `s-${Date.now()}`,
      title: `${currentSlide.title} (Copy)`,
    };
    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, duplicated);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
    setIsSaved(false);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, idx) => idx !== activeSlideIndex);
    setSlides(newSlides);
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    setIsSaved(false);
  };

  const handleCopilotGenerateDeck = async () => {
    if (!copilotTopic.trim()) return;
    setCopilotLoading(true);

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a 3-slide presentation outline for: "${copilotTopic}". For each slide provide Title, Subtitle, and 3 clear bullet points.`,
          appType: 'powerpoint',
        }),
      });
      const data = await response.json();

      // Add a generated slide
      const genSlide: SlideItem = {
        id: `s-${Date.now()}`,
        title: copilotTopic,
        subtitle: isAr ? 'عرض تم إنشاؤه بواسطة SNNS Copilot' : 'Generated by SNNS Copilot AI',
        bullets: [
          isAr ? 'مقدمة ونظرة استراتيجية للموضوع' : 'Strategic overview and core value proposition',
          isAr ? 'خطة التنفيذ ومؤشرات الأداء الرئيسية' : 'Execution milestones and key success metrics',
          isAr ? 'النتائج المتوقعة والخطوات القادمة' : 'Expected outcomes and collaborative roadmap',
        ],
        theme: selectedTheme,
        layout: 'content',
        notes: data.text,
      };

      setSlides((prev) => [...prev, genSlide]);
      setActiveSlideIndex(slides.length);
      setShowCopilot(false);
      setIsSaved(false);
    } catch {
      // fallback
    } finally {
      setCopilotLoading(false);
    }
  };

  const activeTheme = THEMES[selectedTheme] || THEMES['modern-blue'];

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition"
            title={isAr ? 'العودة' : 'Back'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <PowerPointIcon className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={deckTitle}
                onChange={(e) => {
                  setDeckTitle(e.target.value);
                  setIsSaved(false);
                }}
                className="font-bold text-sm text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-red-600 focus:outline-none px-1"
              />
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                {isSaved ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>{isAr ? 'محفوظ' : 'Saved'}</span>
                  </>
                ) : (
                  <span className="text-amber-600">{isAr ? 'غير محفوظ' : 'Unsaved'}</span>
                )}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded text-[10px]">
                {isAr ? 'عروض SNNS Presentations' : 'SNNS Presentations'}
              </span>
              <span>•</span>
              <span>{slides.length} {isAr ? 'شرائح' : 'slides'}</span>
              <span>•</span>
              <span>{isAr ? 'الشريحة' : 'Slide'} {activeSlideIndex + 1}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Start Slideshow */}
          <button
            onClick={() => setIsSlideShow(true)}
            className="px-3 py-1.5 bg-[#C43E1C] hover:bg-[#A33214] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAr ? 'بدء العرض (Slide Show)' : 'Play Slide Show'}</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-xs font-semibold flex items-center gap-1 transition"
            title={isAr ? 'طباعة الشرائح' : 'Print Slides'}
          >
            <Printer className="w-3.5 h-3.5 text-orange-700" />
            <span>{isAr ? 'طباعة' : 'Print'}</span>
          </button>

          <button
            onClick={saveDeck}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-xs font-semibold flex items-center gap-1 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAr ? 'حفظ' : 'Save'}</span>
          </button>

          <button
            onClick={() => setShowCopilot(!showCopilot)}
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 hover:opacity-95 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Copilot</span>
          </button>
        </div>
      </header>

      {/* Slide Controls Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={addSlide}
            className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded flex items-center gap-1 font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'شريحة جديدة' : 'New Slide'}</span>
          </button>
          <button
            onClick={duplicateSlide}
            className="px-2.5 py-1 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isAr ? 'تكرار' : 'Duplicate'}</span>
          </button>
          <button
            onClick={deleteSlide}
            disabled={slides.length <= 1}
            className="px-2.5 py-1 hover:bg-red-50 text-red-600 disabled:opacity-30 rounded flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'حذف' : 'Delete'}</span>
          </button>
        </div>

        {/* Theme Selectors */}
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-500 text-[11px]">{isAr ? 'السمة:' : 'Theme:'}</span>
          <div className="flex gap-1.5">
            {Object.keys(THEMES).map((thKey) => (
              <button
                key={thKey}
                onClick={() => setSelectedTheme(thKey)}
                className={`w-5 h-5 rounded-full border transition ${
                  thKey === 'modern-blue'
                    ? 'bg-blue-900'
                    : thKey === 'crimson-dark'
                    ? 'bg-red-900'
                    : thKey === 'emerald-clean'
                    ? 'bg-emerald-900'
                    : 'bg-white border-gray-300'
                } ${selectedTheme === thKey ? 'ring-2 ring-red-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Slide Thumbnails + Center Slide Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails List */}
        <div className="w-48 sm:w-56 bg-white border-r border-gray-200 overflow-y-auto p-3 space-y-3">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setActiveSlideIndex(idx)}
              className={`p-2 rounded-lg cursor-pointer transition border text-left ${
                idx === activeSlideIndex
                  ? 'border-red-600 bg-red-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold mb-1">
                <span>{idx + 1}</span>
                <span className="truncate max-w-[80px]">{s.title || 'Slide'}</span>
              </div>
              <div
                className={`h-20 rounded p-2 text-[8px] overflow-hidden ${THEMES[selectedTheme]?.bg || ''} ${
                  THEMES[selectedTheme]?.text || ''
                }`}
              >
                <div className="font-bold truncate">{s.title}</div>
                <div className="opacity-70 line-clamp-2 mt-1">{s.bullets?.[0]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Center: Slide Canvas (16:9 Aspect Ratio) */}
        <div className="flex-1 overflow-auto p-6 sm:p-10 flex flex-col items-center justify-center">
          <div
            className={`w-full max-w-4xl aspect-video rounded-2xl shadow-2xl p-8 sm:p-14 flex flex-col justify-between transition-all duration-300 relative ${activeTheme.bg} ${activeTheme.text}`}
          >
            {/* Header */}
            <div>
              <input
                type="text"
                value={currentSlide?.title || ''}
                onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                placeholder={isAr ? 'أدخل عنوان الشريحة...' : 'Slide Title...'}
                className="w-full bg-transparent font-black text-2xl sm:text-4xl focus:outline-none border-b border-transparent focus:border-white/30 placeholder-white/40 pb-2"
              />
              <input
                type="text"
                value={currentSlide?.subtitle || ''}
                onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })}
                placeholder={isAr ? 'أدخل الوصف الفرعي...' : 'Subtitle or key insight...'}
                className={`w-full bg-transparent font-medium text-sm sm:text-lg focus:outline-none border-b border-transparent focus:border-white/20 mt-2 ${activeTheme.accent} placeholder-white/40`}
              />
            </div>

            {/* Bullets & Content */}
            <div className={`my-4 p-6 rounded-xl ${activeTheme.cardBg} flex-1 overflow-y-auto space-y-3`}>
              {(currentSlide?.bullets || []).map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activeTheme.accent} bg-current`} />
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => {
                      const newBullets = [...currentSlide.bullets];
                      newBullets[bIdx] = e.target.value;
                      updateCurrentSlide({ bullets: newBullets });
                    }}
                    className="w-full bg-transparent focus:outline-none text-sm sm:text-base border-b border-transparent focus:border-white/30"
                  />
                  <button
                    onClick={() => {
                      const newBullets = currentSlide.bullets.filter((_, i) => i !== bIdx);
                      updateCurrentSlide({ bullets: newBullets });
                    }}
                    className="text-white/40 hover:text-red-400 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  const newBullets = [...(currentSlide.bullets || []), 'New key point'];
                  updateCurrentSlide({ bullets: newBullets });
                }}
                className="text-xs opacity-75 hover:opacity-100 flex items-center gap-1 font-medium mt-2 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? 'إضافة نقطة' : 'Add bullet point'}</span>
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs opacity-60 pt-2 border-t border-white/10">
              <span>SNNS 365 Presentation</span>
              <span>
                {activeSlideIndex + 1} / {slides.length}
              </span>
            </div>
          </div>

          {/* Speaker Notes */}
          <div className="w-full max-w-4xl mt-4 bg-white rounded-lg p-3 border border-gray-200 shadow-xs flex items-center gap-3 text-xs">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={currentSlide?.notes || ''}
              onChange={(e) => updateCurrentSlide({ notes: e.target.value })}
              placeholder={isAr ? 'ملاحظات المحاضر (Speaker Notes)...' : 'Speaker notes for this slide...'}
              className="w-full text-gray-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Copilot Sidebar */}
        {showCopilot && (
          <aside className="w-80 sm:w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                <span className="font-bold text-sm text-gray-900">
                  {isAr ? 'SNNS Copilot في PowerPoint' : 'SNNS Copilot in PowerPoint'}
                </span>
              </div>
              <button
                onClick={() => setShowCopilot(false)}
                className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <p className="text-gray-600">
                {isAr
                  ? 'قم بصياغة عرض تقديمي متكامل بمجرد إدخال الموضوع أو الفكرة الرئيسية.'
                  : 'Generate presentation slides instantly by entering your topic.'}
              </p>

              <div className="space-y-2">
                <textarea
                  value={copilotTopic}
                  onChange={(e) => setCopilotTopic(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: استراتيجية إطلاق منتج سحابي جديد لعام 2026...'
                      : 'E.g., Launch strategy for a next-gen cloud platform in 2026...'
                  }
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleCopilotGenerateDeck}
                  disabled={copilotLoading || !copilotTopic.trim()}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition flex items-center justify-center gap-1.5"
                >
                  {copilotLoading ? (
                    <span>{isAr ? 'جارٍ توليد الشرائح...' : 'Generating Slides...'}</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>{isAr ? 'إنشاء الشريحة' : 'Create Slide Deck'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* FULLSCREEN SLIDE SHOW RUNNER */}
      {isSlideShow && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 sm:p-12 select-none">
          {/* Top Controls */}
          <div className="flex items-center justify-between text-white/70 text-xs z-10">
            <span className="font-semibold tracking-wider">
              {deckTitle} • {activeSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={() => setIsSlideShow(false)}
              className="p-2 hover:bg-white/20 rounded-full text-white transition flex items-center gap-1"
            >
              <span>{isAr ? 'إنهاء العرض (ESC)' : 'End Show (ESC)'}</span>
              <X className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Slide Visual Area */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div
              className={`w-full max-w-5xl aspect-video rounded-3xl p-10 sm:p-16 flex flex-col justify-between shadow-2xl relative ${activeTheme.bg} ${activeTheme.text}`}
            >
              <div>
                <h1 className="font-black text-3xl sm:text-5xl tracking-tight leading-tight">
                  {currentSlide?.title}
                </h1>
                {currentSlide?.subtitle && (
                  <p className={`text-lg sm:text-2xl mt-3 font-medium ${activeTheme.accent}`}>
                    {currentSlide.subtitle}
                  </p>
                )}
              </div>

              <div className={`my-6 p-8 rounded-2xl ${activeTheme.cardBg} space-y-4`}>
                {(currentSlide?.bullets || []).map((b, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className={`w-3 h-3 rounded-full mt-2 shrink-0 ${activeTheme.accent} bg-current`} />
                    <span className="text-lg sm:text-xl font-normal leading-relaxed">{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs opacity-60">
                <span>SNNS 365 Cloud Suite</span>
                <span>
                  {activeSlideIndex + 1} of {slides.length}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Floating Navigation Controls */}
          <div className="flex justify-center items-center gap-4 text-white z-10">
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-20 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm font-semibold">
              {activeSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === slides.length - 1}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-20 rounded-full transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Smart Print Dialog Modal */}
      <PrintDialogModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title={deckTitle || 'SNNS Presentation Slides'}
        subtitle={`${slides.length} ${isAr ? 'شرائح عرض تقديمي' : 'presentation slides'}`}
        contentHtml={generatePrintableSlidesHtml()}
        lang={lang}
      />
    </div>
  );
};
