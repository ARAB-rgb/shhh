import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  Save,
  Check,
  Tag,
  Palette,
} from 'lucide-react';
import { OneNoteIcon } from '../icons/AppIcons';
import { NoteSection, NotePage } from '../../types/suite';
import { storage } from '../../services/storage';

interface OneNoteAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

export const OneNoteApp: React.FC<OneNoteAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [sections, setSections] = useState<NoteSection[]>(storage.getNotes());
  const [activeSecId, setActiveSecId] = useState<string>(sections[0]?.id || '');
  const [activePageId, setActivePageId] = useState<string>(sections[0]?.pages[0]?.id || '');
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const activeSection = sections.find((s) => s.id === activeSecId) || sections[0];
  const activePage = activeSection?.pages.find((p) => p.id === activePageId) || activeSection?.pages[0];

  const updateCurrentPage = (fields: Partial<NotePage>) => {
    const updated = sections.map((sec) =>
      sec.id === activeSecId
        ? {
            ...sec,
            pages: sec.pages.map((p) =>
              p.id === activePageId ? { ...p, ...fields, updatedAt: 'Just now' } : p
            ),
          }
        : sec
    );
    setSections(updated);
    storage.saveNotes(updated);
    setIsSaved(false);
  };

  const addPage = () => {
    const newPage: NotePage = {
      id: `p-${Date.now()}`,
      title: isAr ? 'صفحة ملاحظة جديدة' : 'New Note Page',
      content: '',
      updatedAt: 'Just now',
      tags: ['General'],
    };

    const updated = sections.map((sec) =>
      sec.id === activeSecId ? { ...sec, pages: [...sec.pages, newPage] } : sec
    );

    setSections(updated);
    storage.saveNotes(updated);
    setActivePageId(newPage.id);
  };

  const addSection = () => {
    const colors = ['#5C2D91', '#008272', '#D83B01', '#0078D4'];
    const newSec: NoteSection = {
      id: `sec-${Date.now()}`,
      name: isAr ? 'قسم جديد' : 'New Section',
      color: colors[sections.length % colors.length],
      pages: [
        {
          id: `p-${Date.now()}`,
          title: isAr ? 'الصفحة 1' : 'Page 1',
          content: '',
          updatedAt: 'Just now',
        },
      ],
    };

    const updated = [...sections, newSec];
    setSections(updated);
    storage.saveNotes(updated);
    setActiveSecId(newSec.id);
    setActivePageId(newSec.pages[0].id);
  };

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <OneNoteIcon className="w-8 h-8 shrink-0" />
          <div>
            <h1 className="font-bold text-sm text-gray-900">{isAr ? 'دفتر وملاحظات SNNS Notes' : 'SNNS Notes Suite'}</h1>
            <p className="text-[11px] text-gray-500">
              {activeSection?.name} • {activePage?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" />
            <span>{isAr ? 'محفوظ تلقائياً' : 'Auto-saved'}</span>
          </span>
        </div>
      </header>

      {/* Section Tabs Bar */}
      <div className="bg-[#FAF9F8] border-b border-gray-200 px-4 flex items-center gap-1 overflow-x-auto text-xs select-none">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              setActiveSecId(sec.id);
              if (sec.pages.length > 0) setActivePageId(sec.pages[0].id);
            }}
            style={{
              borderTopColor: sec.color,
              borderTopWidth: activeSecId === sec.id ? '3px' : '0px',
            }}
            className={`px-4 py-2.5 font-semibold transition border-r border-gray-200 flex items-center gap-2 ${
              activeSecId === sec.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sec.color }} />
            <span>{sec.name}</span>
          </button>
        ))}

        <button
          onClick={addSection}
          className="p-2 text-gray-500 hover:text-purple-700 hover:bg-gray-100 rounded transition"
          title={isAr ? 'إضافة قسم جديد' : 'Add Section'}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pages Column */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col p-3 text-xs select-none">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-bold text-gray-700">{isAr ? 'الصفحات' : 'Pages'}</span>
            <button
              onClick={addPage}
              className="text-purple-700 hover:bg-purple-50 p-1 rounded font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'صفحة' : 'Page'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {activeSection?.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePageId(p.id)}
                className={`w-full text-left p-2 rounded-lg transition border ${
                  activePageId === p.id
                    ? 'border-purple-300 bg-purple-50/50 text-purple-900 font-bold'
                    : 'border-transparent hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="truncate">{p.title || (isAr ? 'صفحة بلا عنوان' : 'Untitled Page')}</div>
                <div className="text-[10px] text-gray-400 font-normal mt-0.5">{p.updatedAt}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Note Canvas Area */}
        <div className="flex-1 bg-white p-8 overflow-y-auto flex flex-col">
          {activePage ? (
            <div className="max-w-3xl w-full mx-auto space-y-4">
              <input
                type="text"
                value={activePage.title}
                onChange={(e) => updateCurrentPage({ title: e.target.value })}
                placeholder={isAr ? 'عنوان الصفحة...' : 'Page Title...'}
                className="w-full text-2xl sm:text-3xl font-bold text-gray-900 focus:outline-none border-b border-transparent focus:border-purple-300 pb-2"
              />

              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>{activePage.updatedAt}</span>
              </div>

              <textarea
                value={activePage.content}
                onChange={(e) => updateCurrentPage({ content: e.target.value })}
                placeholder={
                  isAr
                    ? 'اكتب ملاحظاتك، قوائم التحقق، أفكارك الإبداعية هنا...'
                    : 'Type your notes, ideas, checklists and meeting details here...'
                }
                rows={18}
                className="w-full text-sm text-gray-800 focus:outline-none leading-relaxed resize-none font-sans"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
              {isAr ? 'حدد صفحة أو أنشئ صفحة جديدة' : 'Select or create a page'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
