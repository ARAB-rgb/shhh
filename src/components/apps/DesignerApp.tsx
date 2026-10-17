import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Download,
  Plus,
  Type,
  Square,
  Circle as CircleIcon,
  Palette,
  Sparkles,
  Move,
  Trash2,
  Copy,
  Layers,
  Sliders,
  Maximize2,
  Minimize2,
  RotateCw,
  Image as ImageIcon,
  Star,
  Heart,
  Shield,
  Zap,
  Check,
  LayoutTemplate,
} from 'lucide-react';
import { DesignerIcon } from '../icons/AppIcons';

interface DesignerAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

interface CanvasElement {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'star' | 'heart' | 'badge';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  opacity?: number;
  rotation?: number;
}

const TEMPLATES = [
  { id: 't-1', name: 'Social Media Post (1:1)', width: 600, height: 600, bg: 'from-blue-600 via-indigo-600 to-purple-800' },
  { id: 't-2', name: 'YouTube / Presentation (16:9)', width: 720, height: 405, bg: 'from-slate-900 via-purple-950 to-indigo-950' },
  { id: 't-3', name: 'Story / Reel (9:16)', width: 400, height: 680, bg: 'from-fuchsia-600 via-rose-600 to-amber-500' },
  { id: 't-4', name: 'Corporate Certificate', width: 700, height: 490, bg: 'from-emerald-900 via-teal-900 to-slate-900' },
];

export const DesignerApp: React.FC<DesignerAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';

  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0]);
  const [bgGradient, setBgGradient] = useState<string>(TEMPLATES[0].bg);

  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: 'el-1',
      type: 'text',
      x: 60,
      y: 80,
      content: 'SNNS 365 Cloud Suite',
      color: '#ffffff',
      fontSize: 32,
      fontFamily: 'sans-serif',
      isBold: true,
      opacity: 1,
    },
    {
      id: 'el-2',
      type: 'text',
      x: 60,
      y: 140,
      content: 'Next-Generation Sovereign Productivity Platform',
      color: '#93C5FD',
      fontSize: 18,
      fontFamily: 'sans-serif',
      isBold: false,
      opacity: 0.9,
    },
    {
      id: 'el-3',
      type: 'badge',
      x: 60,
      y: 220,
      width: 180,
      height: 50,
      content: 'Verified snns.pro',
      color: '#10B981',
      fontSize: 15,
      isBold: true,
      opacity: 1,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('el-1');
  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  // Add Element
  const addText = () => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type: 'text',
      x: 80,
      y: 200,
      content: isAr ? 'أدخل العنوان الإبداعي هنا' : 'New Design Heading',
      color: '#ffffff',
      fontSize: 24,
      fontFamily: 'sans-serif',
      isBold: true,
      opacity: 1,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const addShape = (type: CanvasElement['type']) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type,
      x: 120,
      y: 180,
      width: 100,
      height: 100,
      color: '#F59E0B',
      opacity: 0.9,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateElement = (id: string) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;
    const clone: CanvasElement = {
      ...target,
      id: `el-${Date.now()}`,
      x: target.x + 20,
      y: target.y + 20,
    };
    setElements((prev) => [...prev, clone]);
    setSelectedId(clone.id);
  };

  const bringToFront = (id: string) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;
    setElements((prev) => [...prev.filter((e) => e.id !== id), target]);
  };

  const sendToBack = (id: string) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;
    setElements((prev) => [target, ...prev.filter((e) => e.id !== id)]);
  };

  const updateSelected = (updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((e) => (e.id === selectedId ? { ...e, ...updates } : e))
    );
  };

  // High-Resolution PNG Export using HTML5 Canvas
  const exportCanvasAsPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = activeTemplate.width;
    canvas.height = activeTemplate.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background Gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (bgGradient.includes('purple')) {
      grad.addColorStop(0, '#1E1B4B');
      grad.addColorStop(0.5, '#4C1D95');
      grad.addColorStop(1, '#6D28D9');
    } else if (bgGradient.includes('fuchsia')) {
      grad.addColorStop(0, '#C026D3');
      grad.addColorStop(0.5, '#E11D48');
      grad.addColorStop(1, '#F59E0B');
    } else if (bgGradient.includes('emerald')) {
      grad.addColorStop(0, '#064E3B');
      grad.addColorStop(0.5, '#0F766E');
      grad.addColorStop(1, '#0F172A');
    } else {
      grad.addColorStop(0, '#2563EB');
      grad.addColorStop(0.5, '#4F46E5');
      grad.addColorStop(1, '#7C3AED');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Elements
    elements.forEach((el) => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;

      if (el.type === 'text') {
        ctx.fillStyle = el.color;
        ctx.font = `${el.isBold ? 'bold ' : ''}${el.fontSize || 20}px ${el.fontFamily || 'sans-serif'}`;
        ctx.fillText(el.content || '', el.x, el.y);
      } else if (el.type === 'rect') {
        ctx.fillStyle = el.color;
        ctx.fillRect(el.x, el.y, el.width || 80, el.height || 80);
      } else if (el.type === 'circle') {
        ctx.fillStyle = el.color;
        ctx.beginPath();
        const r = (el.width || 80) / 2;
        ctx.arc(el.x + r, el.y + r, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (el.type === 'badge') {
        ctx.fillStyle = el.color;
        const w = el.width || 160;
        const h = el.height || 44;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, w, h, 12);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 14px sans-serif`;
        ctx.fillText(el.content || 'Badge', el.x + 16, el.y + h / 2 + 5);
      }
      ctx.restore();
    });

    const link = document.createElement('a');
    link.download = `SNNS-Design-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <DesignerIcon className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-gray-900">{isAr ? 'استوديو التصميم SNNS Designer' : 'SNNS Designer Studio'}</h1>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                Canvas Pro Engine
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {isAr ? 'تصميم جرافيكي متكامل، قوالب، تحكم بالطبقات، وتصدير عالي الدقة' : 'Interactive graphic design, templates, layer management & PNG export'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCanvasAsPNG}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير كصورة PNG' : 'Export PNG'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar / Element Inserter */}
        <aside className="w-64 bg-white border-e border-gray-200 p-4 flex flex-col space-y-5 text-xs overflow-y-auto select-none">
          {/* Templates Selector */}
          <div>
            <span className="font-bold text-gray-700 block mb-2">{isAr ? 'مقاس التصميم والقالب:' : 'Template & Format:'}</span>
            <div className="space-y-1.5">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    setActiveTemplate(tmpl);
                    setBgGradient(tmpl.bg);
                  }}
                  className={`w-full p-2.5 rounded-xl text-start font-medium border transition cursor-pointer flex items-center justify-between ${
                    activeTemplate.id === tmpl.id
                      ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{tmpl.name}</span>
                  <span className="text-[9px] text-gray-400 font-mono shrink-0 ms-1">{tmpl.width}x{tmpl.height}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Elements Actions */}
          <div className="space-y-2">
            <span className="font-bold text-gray-700 block">{isAr ? 'إضافة عناصر جديدة:' : 'Add Elements:'}</span>
            <button
              onClick={addText}
              className="w-full py-2 px-3 bg-gray-50 hover:bg-purple-50 hover:border-purple-300 border border-gray-200 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer text-gray-800"
            >
              <Type className="w-4 h-4 text-purple-600" />
              <span>{isAr ? 'إضافة نص جديد' : 'Add Text Box'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addShape('rect')}
                className="py-2 px-3 bg-gray-50 hover:bg-purple-50 border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer text-gray-700"
              >
                <Square className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'مستطيل' : 'Rectangle'}</span>
              </button>

              <button
                onClick={() => addShape('circle')}
                className="py-2 px-3 bg-gray-50 hover:bg-purple-50 border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer text-gray-700"
              >
                <CircleIcon className="w-4 h-4 text-sky-500" />
                <span>{isAr ? 'دائرة' : 'Circle'}</span>
              </button>

              <button
                onClick={() => addShape('badge')}
                className="py-2 px-3 bg-gray-50 hover:bg-purple-50 border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer text-gray-700"
              >
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'شارة معتمدة' : 'Badge'}</span>
              </button>

              <button
                onClick={() => addShape('star')}
                className="py-2 px-3 bg-gray-50 hover:bg-purple-50 border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer text-gray-700"
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{isAr ? 'نجمة' : 'Star'}</span>
              </button>
            </div>
          </div>

          {/* Background Gradient Palette */}
          <div>
            <span className="font-bold text-gray-700 block mb-2">{isAr ? 'تدرج خلفية اللوحة:' : 'Canvas Background:'}</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                'from-blue-600 via-indigo-600 to-purple-800',
                'from-slate-900 via-purple-950 to-indigo-950',
                'from-fuchsia-600 via-rose-600 to-amber-500',
                'from-emerald-900 via-teal-900 to-slate-900',
              ].map((grad, i) => (
                <button
                  key={i}
                  onClick={() => setBgGradient(grad)}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${grad} border-2 transition cursor-pointer ${
                    bgGradient === grad ? 'border-purple-600 ring-2 ring-purple-400' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Center Interactive Canvas Viewport */}
        <main className="flex-1 bg-gray-100 flex items-center justify-center p-6 overflow-auto">
          <div
            style={{ width: activeTemplate.width, height: activeTemplate.height }}
            className={`bg-gradient-to-tr ${bgGradient} rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 border border-white/20 select-none`}
            onClick={() => setSelectedId(null)}
          >
            {elements.map((el) => {
              const isSelected = selectedId === el.id;

              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    opacity: el.opacity ?? 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                  className={`cursor-pointer transition-shadow rounded-lg ${
                    isSelected ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-black/20 shadow-xl' : ''
                  }`}
                >
                  {el.type === 'text' && (
                    <div
                      style={{
                        color: el.color,
                        fontSize: el.fontSize,
                        fontFamily: el.fontFamily,
                        fontWeight: el.isBold ? 'bold' : 'normal',
                      }}
                      className="px-2 py-1"
                    >
                      {el.content}
                    </div>
                  )}

                  {el.type === 'rect' && (
                    <div
                      style={{
                        backgroundColor: el.color,
                        width: el.width || 80,
                        height: el.height || 80,
                      }}
                      className="rounded-xl shadow-md"
                    />
                  )}

                  {el.type === 'circle' && (
                    <div
                      style={{
                        backgroundColor: el.color,
                        width: el.width || 80,
                        height: el.height || 80,
                      }}
                      className="rounded-full shadow-md"
                    />
                  )}

                  {el.type === 'badge' && (
                    <div
                      style={{
                        backgroundColor: el.color,
                        width: el.width || 180,
                        height: el.height || 50,
                      }}
                      className="rounded-2xl px-4 py-2 flex items-center gap-2 text-white font-bold text-sm shadow-md"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{el.content}</span>
                    </div>
                  )}

                  {el.type === 'star' && (
                    <div
                      style={{
                        color: el.color,
                        width: el.width || 70,
                        height: el.height || 70,
                      }}
                      className="flex items-center justify-center"
                    >
                      <Star className="w-12 h-12 fill-current" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* Right Inspector & Formatting Panel */}
        <aside className="w-64 bg-white border-s border-gray-200 p-4 flex flex-col space-y-4 text-xs select-none">
          <span className="font-bold text-gray-800 text-sm border-b pb-2">
            {isAr ? 'لوحة الخصائص والتعديل' : 'Properties Inspector'}
          </span>

          {selectedElement ? (
            <div className="space-y-4">
              {/* Content text if applicable */}
              {(selectedElement.type === 'text' || selectedElement.type === 'badge') && (
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'النص:' : 'Text Content:'}</label>
                  <input
                    type="text"
                    value={selectedElement.content || ''}
                    onChange={(e) => updateSelected({ content: e.target.value })}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              )}

              {/* Color Picker */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'اللون:' : 'Element Color:'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedElement.color.startsWith('#') ? selectedElement.color : '#ffffff'}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    value={selectedElement.color}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    className="flex-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Font Size for text */}
              {selectedElement.type === 'text' && (
                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>{isAr ? 'حجم الخط:' : 'Font Size:'}</span>
                    <span className="font-mono text-purple-600">{selectedElement.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="64"
                    value={selectedElement.fontSize || 24}
                    onChange={(e) => updateSelected({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Position Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">X Position</label>
                  <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => updateSelected({ x: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">Y Position</label>
                  <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => updateSelected({ y: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Layer Actions */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <span className="font-bold text-gray-700 block text-[11px] mb-1">{isAr ? 'إدارة الطبقة:' : 'Layer Ordering:'}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => bringToFront(selectedElement.id)}
                    className="flex-1 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 rounded-lg border text-[11px] font-semibold text-gray-700 transition"
                  >
                    {isAr ? 'للأمام' : 'Bring Front'}
                  </button>
                  <button
                    onClick={() => sendToBack(selectedElement.id)}
                    className="flex-1 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 rounded-lg border text-[11px] font-semibold text-gray-700 transition"
                  >
                    {isAr ? 'للخلف' : 'Send Back'}
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => duplicateElement(selectedElement.id)}
                    className="flex-1 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 rounded-lg border text-[11px] font-semibold text-gray-700 transition flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? 'تكرار' : 'Clone'}</span>
                  </button>
                  <button
                    onClick={() => deleteElement(selectedElement.id)}
                    className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-[11px] font-semibold transition flex items-center justify-center"
                    title={isAr ? 'حذف العنصر' : 'Delete'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-10">
              <Move className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{isAr ? 'حدد أي عنصر في اللوحة لتعديل خصائصه وألوانه.' : 'Select any canvas element to inspect and edit.'}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
