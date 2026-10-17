import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Send,
  Inbox,
  SendHorizontal,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  User,
  AtSign,
  AlertCircle,
  X,
  Reply,
  Check,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { storage } from '../../services/storage';

export interface InternalMessage {
  id: string;
  sender: string;
  senderName?: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

interface InternalMailBoxProps {
  currentUserEmail?: string;
  currentUserName?: string;
  lang?: 'en' | 'ar';
  onClose?: () => void;
  isModal?: boolean;
}

const COMMON_SNNS_ACCOUNTS = [
  { name: 'الإدارة العامة (Admin)', email: 'admin@snns.pro' },
  { name: 'المشرف الرئيسي (Super Admin)', email: 'a@snns.pro' },
  { name: 'هتاف أونلاين (Htaf)', email: 'htaf@snns.pro' },
  { name: 'المدير المالي (Finance)', email: 'finance@snns.pro' },
  { name: 'الدعم التقني (Support)', email: 'support@snns.pro' },
  { name: 'إدارة التعليم (Education)', email: 'edu@snns.pro' },
];

export const InternalMailBox: React.FC<InternalMailBoxProps> = ({
  currentUserEmail,
  currentUserName,
  lang = 'ar',
  onClose,
  isModal = false,
}) => {
  const isAr = lang === 'ar';

  // Determine active user email & name
  const userProfile = storage.getUserProfile();
  const effectiveEmail = (
    currentUserEmail ||
    userProfile.email ||
    'user@snns.pro'
  ).toLowerCase().trim();
  const safeSenderEmail = effectiveEmail.endsWith('@snns.pro')
    ? effectiveEmail
    : `${effectiveEmail.split('@')[0]}@snns.pro`;
  const safeSenderName = currentUserName || userProfile.name || 'مستخدم المنظومة';

  const [inbox, setInbox] = useState<InternalMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<InternalMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<InternalMessage | null>(null);

  // Compose State
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Fetch inbox
  const fetchInbox = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/internal-mail/inbox/${encodeURIComponent(safeSenderEmail)}`);
      if (res.ok) {
        const data: InternalMessage[] = await res.json();
        setInbox(data);
      }
    } catch (err) {
      console.warn('Could not fetch internal inbox:', err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [safeSenderEmail]);

  // Fetch sent messages
  const fetchSent = useCallback(async () => {
    try {
      const res = await fetch(`/api/internal-mail/sent/${encodeURIComponent(safeSenderEmail)}`);
      if (res.ok) {
        const data: InternalMessage[] = await res.json();
        setSentMessages(data);
      }
    } catch (err) {
      console.warn('Could not fetch sent internal messages:', err);
    }
  }, [safeSenderEmail]);

  // Refresh both
  const refreshAll = useCallback(() => {
    fetchInbox();
    fetchSent();
  }, [fetchInbox, fetchSent]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchInbox(true);
      fetchSent();
    }, 5000); // Live poll every 5s
    return () => clearInterval(interval);
  }, [refreshAll, fetchInbox, fetchSent]);

  // Mark message as read
  const handleMarkAsRead = async (msg: InternalMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await fetch(`/api/internal-mail/read/${msg.id}`, { method: 'PATCH' });
        setInbox((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
        );
      } catch (err) {
        console.warn('Failed to mark read', err);
      }
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/internal-mail/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInbox((prev) => prev.filter((m) => m.id !== id));
        setSentMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        showNotification('success', isAr ? 'تم حذف الرسالة بنجاح' : 'Message deleted');
      }
    } catch {
      showNotification('error', isAr ? 'فشل حذف الرسالة' : 'Failed to delete message');
    }
  };

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim()) {
      showNotification(
        'error',
        isAr ? 'يرجى إدخال المستقبل وعنوان الرسالة' : 'Recipient and subject are required'
      );
      return;
    }

    // Auto-complete @snns.pro if omitted
    let formattedRecipient = recipient.trim().toLowerCase();
    if (!formattedRecipient.includes('@')) {
      formattedRecipient = `${formattedRecipient}@snns.pro`;
    }

    if (!formattedRecipient.endsWith('@snns.pro')) {
      showNotification(
        'error',
        isAr
          ? 'البريد الداخلي مخصص فقط لنطاق @snns.pro'
          : 'Internal mail is restricted to @snns.pro domain'
      );
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/internal-mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: safeSenderEmail,
          senderName: safeSenderName,
          recipient: formattedRecipient,
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(
          'success',
          isAr
            ? `تم إرسال الرسالة بنجاح إلى ${formattedRecipient}! ✉️`
            : `Message sent to ${formattedRecipient} successfully!`
        );
        setRecipient('');
        setSubject('');
        setBody('');
        setActiveTab('inbox');
        refreshAll();
      } else {
        showNotification('error', data.error || (isAr ? 'فشل إرسال الرسالة' : 'Failed to send message'));
      }
    } catch {
      showNotification('error', isAr ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error');
    } finally {
      setIsSending(false);
    }
  };

  // AI Copilot Smart Draft
  const handleAiDraft = async () => {
    if (!subject.trim()) {
      showNotification(
        'error',
        isAr ? 'يرجى كتابة عنوان أو فكرة الرسالة أولاً' : 'Please provide a subject first'
      );
      return;
    }

    setIsAiDrafting(true);
    try {
      const prompt = `اكتب رسالة بريد إلكتروني داخلية رسمية وموجزة ومحترفة لمنظومة SNNS 365. 
الموضوع: "${subject}".
المستقبل: "${recipient || 'فريق العمل'}".
المرسل: "${safeSenderName} (${safeSenderEmail})".
اجعل النص مهنياً ومباشراً وواضحاً.`;

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, appType: 'outlook' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setBody(data.text);
          showNotification(
            'success',
            isAr ? 'تمت صياغة البريد بواسطة مساعد SNNS الذكي!' : 'Draft generated by AI Copilot!'
          );
        }
      }
    } catch {
      setBody(
        `السلام عليكم ورحمة الله وبركاته،\n\nبخصوص الموضوع أعلاه: (${subject})، نود إحاطتكم علماً بالمستجدات والتنسيق معكم حيال الخطوات القادمة.\n\nشاكرين ومقدرين حسن تعاونكم.\n\nتحياتي،\n${safeSenderName}`
      );
    } finally {
      setIsAiDrafting(false);
    }
  };

  // Reply to sender
  const handleReply = (msg: InternalMessage) => {
    setRecipient(msg.sender);
    setSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
    setBody(`\n\n--- الرسالة السابقة من ${msg.sender} بتاريخ ${new Date(msg.timestamp).toLocaleString()} ---\n${msg.body}`);
    setSelectedMessage(null);
    setActiveTab('compose');
  };

  const unreadInboxCount = inbox.filter((m) => !m.read).length;

  const currentList = activeTab === 'inbox' ? inbox : sentMessages;
  const filteredList = currentList.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.recipient.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.body.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      className={`bg-slate-900 border border-slate-700/80 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans ${
        isModal ? 'max-w-4xl w-full mx-auto max-h-[90vh]' : 'w-full h-full'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                {isAr ? 'بريد SNNS الداخلي الموحد' : 'SNNS Internal Mail'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                @snns.pro
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{safeSenderName}</span>
              <span className="font-mono text-emerald-400">({safeSenderEmail})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAll()}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title={isAr ? 'تحديث البريد' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-b border-rose-500/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="bg-slate-950/70 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('inbox');
              setSelectedMessage(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>{isAr ? 'الوارد' : 'Inbox'}</span>
            {unreadInboxCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
                {unreadInboxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('sent');
              setSelectedMessage(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span>{isAr ? 'المرسل' : 'Sent'}</span>
            <span className="text-[10px] text-slate-400">({sentMessages.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('compose');
              setSelectedMessage(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? 'رسالة جديدة' : 'Compose'}</span>
          </button>
        </div>

        {activeTab !== 'compose' && (
          <div className="relative min-w-[140px] sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={isAr ? 'بحث بالرسائل...' : 'Search mail...'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl ps-8 pe-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {/* VIEW 1: Compose Tab */}
        {activeTab === 'compose' && (
          <form onSubmit={handleSend} className="space-y-4 max-w-2xl mx-auto">
            {/* Quick Recipients Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {isAr ? 'جهات الاتصال السريعة لنطاق @snns.pro:' : 'Quick SNNS.PRO Contacts:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SNNS_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setRecipient(acc.email)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                      recipient === acc.email
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <AtSign className="w-3 h-3 text-emerald-400" />
                    <span>{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'إلى (بريد المستخدم الداخلي):' : 'To (Internal @snns.pro email):'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="name@snns.pro"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'عنوان الرسالة:' : 'Subject:'}
                </label>
                <button
                  type="button"
                  onClick={handleAiDraft}
                  disabled={isAiDrafting || !subject.trim()}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 disabled:opacity-50 transition cursor-pointer"
                  title={isAr ? 'صياغة المحتوى عبر الذكاء الاصطناعي' : 'Draft with Copilot AI'}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiDrafting ? 'animate-spin' : ''}`} />
                  <span>{isAiDrafting ? (isAr ? 'جارِ الصياغة...' : 'Drafting...') : (isAr ? 'صياغة ذكية بالـ AI' : 'Copilot AI Draft')}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder={isAr ? 'مثال: تقرير الاجتماع الفصلي لفرع الرياض' : 'e.g. Q3 Architecture Status'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Body Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'محتوى الرسالة:' : 'Message Content:'}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب رسالتك الداخلية هنا...'
                    : 'Write your internal message here...'
                }
                rows={6}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                {isAr
                  ? '⚡ يتم تسليم البريد الداخلي فورياً وبشكل مشفر داخل خوادم SNNS'
                  : '⚡ Delivered instantly across SNNS internal network'}
              </span>

              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? (isAr ? 'جارِ الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة' : 'Send Message')}</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2 & 3: Inbox and Sent Lists */}
        {activeTab !== 'compose' && !selectedMessage && (
          <div className="space-y-2.5">
            {filteredList.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
                  {activeTab === 'inbox' ? <Inbox className="w-6 h-6" /> : <SendHorizontal className="w-6 h-6" />}
                </div>
                <h3 className="text-sm font-bold text-slate-300">
                  {activeTab === 'inbox'
                    ? isAr
                      ? 'صندوق الوارد فارغ حالياً'
                      : 'Inbox is currently empty'
                    : isAr
                    ? 'لا توجد رسائل مرسلة بعد'
                    : 'No sent messages yet'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'يمكنك البدء بإرسال رسالة جديدة لأي زميل على نطاق @snns.pro'
                    : 'Start composing an internal email to any @snns.pro teammate'}
                </p>
                <button
                  onClick={() => setActiveTab('compose')}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إنشاء رسالة جديدة' : 'Compose Message'}</span>
                </button>
              </div>
            ) : (
              filteredList.map((msg) => {
                const isUnread = activeTab === 'inbox' && !msg.read;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleMarkAsRead(msg)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isUnread
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                        : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          isUnread
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {msg.senderName?.slice(0, 2).toUpperCase() || msg.sender.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs ${
                              isUnread ? 'font-black text-emerald-400' : 'font-semibold text-slate-300'
                            }`}
                          >
                            {activeTab === 'inbox' ? msg.senderName || msg.sender : `إلى: ${msg.recipient}`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {activeTab === 'inbox' ? msg.sender : ''}
                          </span>
                        </div>
                        <h4
                          className={`text-xs truncate mt-0.5 ${
                            isUnread ? 'font-bold text-white' : 'font-normal text-slate-300'
                          }`}
                        >
                          {msg.subject}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {msg.body || (isAr ? '(بدون نص)' : '(No content)')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0 self-end sm:self-center">
                      <span className="text-[10px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {new Date(msg.timestamp).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <button
                        onClick={(e) => handleDeleteMessage(msg.id, e)}
                        className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title={isAr ? 'حذف الرسالة' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* DETAIL VIEW: Single Message Detail Modal/Card */}
        {selectedMessage && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
                <span>{isAr ? 'العودة للقائمة' : 'Back to list'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReply(selectedMessage)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>{isAr ? 'رد' : 'Reply'}</span>
                </button>

                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer"
                  title={isAr ? 'حذف' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Metadata */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{selectedMessage.subject}</h3>
              <div className="mt-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'المرسل:' : 'From:'}</span>
                  <span className="font-mono text-emerald-400 font-semibold">{selectedMessage.sender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'المستلم:' : 'To:'}</span>
                  <span className="font-mono text-slate-300">{selectedMessage.recipient}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'التوقيت:' : 'Time:'}</span>
                  <span className="text-slate-400">{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 min-h-[140px] whitespace-pre-wrap text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {selectedMessage.body || (isAr ? 'لا يوجد محتوى لهذه الرسالة.' : 'No message body.')}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>{isAr ? 'نظام الرسائل الداخلي المشفر لشبكة SNNS' : 'Encrypted SNNS Internal Mail Service'}</span>
        <span className="font-mono text-emerald-400">@snns.pro</span>
      </div>
    </div>
  );
};

export default InternalMailBox;
