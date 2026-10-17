import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Copy,
  Check,
  FileText,
  Table,
  Presentation,
  CheckSquare,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { CopilotIcon } from '../icons/AppIcons';

interface CopilotAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export const CopilotApp: React.FC<CopilotAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: isAr
        ? `مرحباً بك! أنا **SNNS Copilot**، رفيقك الذكي للإنتاجية في منظومة **SNNS 365**.\n\nيمكنني مساعدتك في:\n- 📝 صياغة وتلخيص المستندات في **SNNS Word**\n- 📊 إعداد واقتراح المعادلات والتحليلات في **SNNS Excel**\n- 🎨 تخطيط وتوليد عروض الشرائح في **SNNS PowerPoint**\n- ✉️ كتابة مسودات البريد الإلكتروني والردود في **SNNS Outlook**\n- 📋 تنظيم المهام والمشاريع في **SNNS To Do**\n\nكيف يمكنني مساعدتك في إنجاز أعمالك اليوم؟`
        : `Hello! I am **SNNS Copilot**, your enterprise AI productivity companion across the **SNNS 365 Cloud Suite**.\n\nI can help you:\n- 📝 Draft and summarize documents in **SNNS Word**\n- 📊 Generate formulas and data models in **SNNS Excel**\n- 🎨 Outline presentation decks in **SNNS PowerPoint**\n- ✉️ Compose professional emails in **SNNS Outlook**\n- 📋 Structure milestones and checklists in **SNNS To Do**\n\nWhat would you like to achieve today?`,
      time: 'Just now',
    },
  ]);
  const [promptInput, setPromptInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || promptInput;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          appType: 'SNNS Copilot Hub',
          context: 'Full suite assistance mode',
        }),
      });
      const data = await response.json();

      const assistantMsg: CopilotMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'Unable to generate response at this time.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: isAr
            ? 'حدث خطأ أثناء معالجة الطلب، يُرجى المحاولة مرة أخرى.'
            : 'Error communicating with AI assistant. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
          <CopilotIcon className="w-8 h-8 shrink-0" />
          <div>
            <h1 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <span>SNNS Copilot</span>
              <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.2 rounded-full font-bold">
                Enterprise AI
              </span>
            </h1>
            <p className="text-[11px] text-gray-500">
              {isAr ? 'مدعوم بنموذج الذكاء الاصطناعي السحابي Gemini' : 'Powered by Gemini AI Cloud Engine'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Conversation Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col justify-between overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-[#0078D4] text-white font-bold text-xs'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {msg.role === 'user' ? 'HT' : <Sparkles className="w-4 h-4 text-amber-300" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0078D4] text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <div
                  className={`flex items-center justify-between mt-2 pt-2 border-t ${
                    msg.role === 'user' ? 'border-white/20 text-blue-100' : 'border-gray-100 text-gray-400'
                  } text-[10px]`}
                >
                  <span>{msg.time}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="hover:text-gray-700 flex items-center gap-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">{isAr ? 'تم النسخ' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{isAr ? 'نسخ' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-gray-600 shadow-xs flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>{isAr ? 'Copilot يقوم بالصياغة والتحليل...' : 'Copilot is generating response...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Suggestions Grid (Shown if short message history) */}
        {messages.length <= 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
            <button
              onClick={() =>
                handleSend(
                  isAr
                    ? 'اكتب مسودة بريد إلكتروني للإعلان عن إطلاق منظومة SNNS 365 الجديدة للعملاء'
                    : 'Draft an email announcing the official rollout of SNNS 365 to customers'
                )
              }
              className="p-2.5 bg-white hover:bg-blue-50 border border-gray-200 rounded-xl text-left text-xs text-gray-700 flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">
                {isAr ? 'صياغة بريد إعلان إطلاق المنظومة' : 'Draft rollout announcement email'}
              </span>
            </button>

            <button
              onClick={() =>
                handleSend(
                  isAr
                    ? 'ما هي أفضل صيغة في Excel لحساب معدل النمو السنوي المركب (CAGR)؟'
                    : 'What is the best Excel formula to calculate Compound Annual Growth Rate (CAGR)?'
                )
              }
              className="p-2.5 bg-white hover:bg-emerald-50 border border-gray-200 rounded-xl text-left text-xs text-gray-700 flex items-center gap-2 transition"
            >
              <Table className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                {isAr ? 'معادلة حساب معدل النمو في Excel' : 'CAGR formula in SNNS Excel'}
              </span>
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-3 bg-white rounded-2xl border border-gray-300 p-2 shadow-md flex items-center gap-2"
        >
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder={
              isAr
                ? 'اسأل SNNS Copilot عن أي مستند، معادلة، أو فكرة...'
                : 'Ask SNNS Copilot anything about your documents, data, or projects...'
            }
            className="flex-1 p-2 text-xs text-gray-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!promptInput.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-30 text-white rounded-xl transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
