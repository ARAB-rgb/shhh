import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Inbox,
  Send,
  Star,
  Archive,
  Trash2,
  FileEdit,
  Search,
  Plus,
  Reply,
  Forward,
  Sparkles,
  Paperclip,
  Check,
  X,
  Users,
  UserPlus,
  UserCheck,
  Contact,
  BookOpen,
  Phone,
  Building,
  AtSign,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { OutlookIcon } from '../icons/AppIcons';
import { EmailMessage, EmailContact, UserProfile } from '../../types/suite';
import { storage, PRIMARY_DOMAIN } from '../../services/storage';
import { UserLoginModal } from '../common/UserLoginModal';
import { InternalMailBox } from '../common/InternalMailBox';

interface OutlookAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

export const OutlookApp: React.FC<OutlookAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getUserProfile());
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [emails, setEmails] = useState<EmailMessage[]>(storage.getEmails());
  const [contacts, setContacts] = useState<EmailContact[]>(storage.getContacts());

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUser(storage.getUserProfile());
    };
    window.addEventListener('snns_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('snns_user_profile_updated', handleProfileUpdate);
  }, []);
  const [activeFolder, setActiveFolder] = useState<
    'inbox' | 'sent' | 'drafts' | 'archive' | 'trash' | 'contacts'
  >('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCompose, setShowCompose] = useState<boolean>(false);
  const [showInternalMailModal, setShowInternalMailModal] = useState<boolean>(false);

  // Sync with real backend internal mail service
  useEffect(() => {
    const fetchInternalMail = async () => {
      try {
        const safeEmail = (currentUser.email || 'user@snns.pro').toLowerCase();
        const res = await fetch(`/api/internal-mail/inbox/${encodeURIComponent(safeEmail)}`);
        if (res.ok) {
          const internalMsgs: Array<{
            id: string;
            sender: string;
            senderName?: string;
            recipient: string;
            subject: string;
            body: string;
            timestamp: string;
            read: boolean;
          }> = await res.json();
          if (Array.isArray(internalMsgs) && internalMsgs.length > 0) {
            setEmails((prev) => {
              const existingIds = new Set(prev.map((e) => e.id));
              const newIncoming: EmailMessage[] = internalMsgs
                .filter((im) => !existingIds.has(im.id))
                .map((im) => ({
                  id: im.id,
                  sender: im.senderName || im.sender,
                  senderEmail: im.sender,
                  recipient: im.recipient,
                  subject: im.subject,
                  body: im.body,
                  date: new Date(im.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isUnread: !im.read,
                  isStarred: false,
                  folder: 'inbox' as const,
                }));
              if (newIncoming.length > 0) {
                const combined = [...newIncoming, ...prev];
                storage.saveEmails(combined);
                return combined;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn('Failed to sync internal mail:', err);
      }
    };

    fetchInternalMail();
    const interval = setInterval(fetchInternalMail, 8000);
    return () => clearInterval(interval);
  }, [currentUser.email]);

  // Compose State
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [showContactPicker, setShowContactPicker] = useState<boolean>(false);

  // New Contact Modal State
  const [showAddContactModal, setShowAddContactModal] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactEmail, setNewContactEmail] = useState<string>('');
  const [newContactRole, setNewContactRole] = useState<string>('');

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const selectedEmail = emails.find((e) => e.id === selectedEmailId);

  const filteredEmails = emails
    .filter((e) => e.folder === activeFolder)
    .filter((e) =>
      searchQuery
        ? e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.body.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const filteredContacts = contacts.filter((c) =>
    searchQuery
      ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.role && c.role.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const unreadCount = emails.filter((e) => e.folder === 'inbox' && e.isUnread).length;

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = emails.map((item) =>
      item.id === id ? { ...item, isStarred: !item.isStarred } : item
    );
    setEmails(updated);
    storage.saveEmails(updated);
  };

  const deleteEmail = (id: string) => {
    const updated = emails.map((item) =>
      item.id === id ? { ...item, folder: 'trash' as const } : item
    );
    setEmails(updated);
    storage.saveEmails(updated);
    showToast(isAr ? 'تم نقل الرسالة إلى سلة المحذوفات' : 'Moved to trash');
  };

  const markAsRead = (id: string) => {
    setSelectedEmailId(id);
    const updated = emails.map((item) =>
      item.id === id ? { ...item, isUnread: false } : item
    );
    setEmails(updated);
    storage.saveEmails(updated);
  };

  // 1. ADD NAME & CONTACT DIRECTLY FROM EMAIL
  const isSenderSavedAsContact = (senderEmail: string) => {
    return contacts.some(
      (c) => c.email.trim().toLowerCase() === senderEmail.trim().toLowerCase()
    );
  };

  const handleAddContactFromEmail = (name: string, email: string) => {
    storage.addContact({
      name: name,
      email: email,
      role: isAr ? 'مضاف من البريد الوارد' : 'Added from inbox',
    });
    setContacts(storage.getContacts());
    showToast(
      isAr
        ? `تمت إضافة "${name}" إلى قائمة الأسماء وجهات الاتصال بنجاح! 👤`
        : `"${name}" added to contacts successfully!`
    );
  };

  // 2. CREATE NEW CONTACT MANUALLY
  const handleSaveNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactEmail.trim()) return;

    storage.addContact({
      name: newContactName.trim(),
      email: newContactEmail.trim(),
      role: newContactRole.trim() || (isAr ? 'جهة اتصال عامة' : 'Contact'),
    });

    setContacts(storage.getContacts());
    setShowAddContactModal(false);
    showToast(
      isAr
        ? `تم حفظ "${newContactName}" في قائمة الأسماء!`
        : `Saved "${newContactName}" to contacts!`
    );
    setNewContactName('');
    setNewContactEmail('');
    setNewContactRole('');
  };

  // 3. DELETE CONTACT
  const handleDeleteContact = (id: string, name: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    storage.saveContacts(updated);
    showToast(isAr ? `تم حذف "${name}" من جهات الاتصال` : `Deleted "${name}"`);
  };

  // 4. SEND EMAIL TO CONTACT
  const handleComposeToContact = (contactEmail: string, contactName: string) => {
    setComposeTo(contactEmail);
    setComposeSubject(isAr ? `مرحباً ${contactName}` : `Hello ${contactName}`);
    setShowCompose(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject) return;

    let formattedRecipient = composeTo.trim().toLowerCase();
    if (!formattedRecipient.includes('@')) {
      formattedRecipient = `${formattedRecipient}@${PRIMARY_DOMAIN}`;
    }

    const safeSenderEmail = currentUser.email.toLowerCase().endsWith(`@${PRIMARY_DOMAIN}`)
      ? currentUser.email.toLowerCase()
      : `${currentUser.email.split('@')[0]}@${PRIMARY_DOMAIN}`;

    const newEmail: EmailMessage = {
      id: `mail-${Date.now()}`,
      sender: `${currentUser.name} (${isAr ? 'أنت' : 'You'})`,
      senderEmail: safeSenderEmail,
      recipient: formattedRecipient,
      subject: composeSubject,
      body: composeBody,
      date: isAr ? 'الآن' : 'Just now',
      isUnread: false,
      isStarred: false,
      folder: 'sent',
    };

    const updated = [newEmail, ...emails];
    setEmails(updated);
    storage.saveEmails(updated);
    setShowCompose(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setActiveFolder('sent');
    setSelectedEmailId(newEmail.id);

    // Call real internal mail server
    try {
      await fetch('/api/internal-mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: safeSenderEmail,
          senderName: currentUser.name,
          recipient: formattedRecipient,
          subject: composeSubject,
          body: composeBody,
        }),
      });
    } catch (err) {
      console.warn('Internal mail server sync warning:', err);
    }

    showToast(isAr ? 'تم إرسال البريد الإلكتروني بنجاح عبر خوادم @snns.pro! 🚀' : 'Email sent successfully via @snns.pro!');
  };

  const handleCopilotDraftEmail = async () => {
    if (!composeSubject) return;
    setCopilotLoading(true);

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Draft a professional email regarding: "${composeSubject}". Recipient: ${composeTo || 'Team'}. Keep it concise, friendly, and structured.`,
          appType: 'outlook',
        }),
      });
      const data = await response.json();
      setComposeBody(data.text || '');
      showToast(isAr ? 'تمت صياغة الرسالة عبر Copilot الذكي!' : 'Draft generated by Copilot!');
    } catch {
      // fallback
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col font-sans select-none relative" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Floating In-App Toast */}
      {toastMessage && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-blue-400/40 text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-0.5 hover:text-blue-300 ms-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
            title={isAr ? 'العودة' : 'Back'}
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <OutlookIcon className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-gray-900">
                {isAr ? 'بريد ومراسلات SNNS Mail' : 'SNNS Mail Suite'}
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>@{PRIMARY_DOMAIN}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={() => setShowLoginModal(true)}
                className="group flex items-center gap-1.5 text-start hover:opacity-90 transition cursor-pointer"
                title={isAr ? 'تبديل المستخدم أو تعديل الاسم' : 'Switch user or edit name'}
              >
                <span className="text-xs font-bold text-gray-900 group-hover:text-[#0078D4]">
                  {currentUser.name}
                </span>
                <span className="text-[11px] font-mono text-[#0078D4] font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {currentUser.email}
                </span>
                <span className="text-[10px] text-gray-400 group-hover:text-[#0078D4] underline">
                  {isAr ? 'تبديل الحساب' : 'Switch'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Mail Server Status & Internal Mail Box Shortcut */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">{isAr ? 'خادم البريد الداخلي @snns.pro متصل' : 'mail.snns.pro server online'}</span>
          </div>

          <button
            onClick={() => setShowInternalMailModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title={isAr ? 'فتح نافذة البريد الداخلي الفوري' : 'Open Internal Mailbox'}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'بريد SNNS المباشر' : 'Internal Mailbox'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch User Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title={isAr ? 'تسجيل الدخول أو تبديل المستخدم' : 'Sign in / Switch User'}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{isAr ? 'تبديل المستخدم' : 'Switch User'}</span>
          </button>

          {/* Add Contact Button */}
          <button
            onClick={() => setShowAddContactModal(true)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0078D4] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title={isAr ? 'إضافة اسم وجهة اتصال جديدة' : 'Add New Contact'}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'إضافة اسم جديد' : 'Add Contact'}</span>
          </button>

          {/* New Mail Button */}
          <button
            onClick={() => setShowCompose(true)}
            className="px-3.5 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'رسالة جديدة' : 'New Mail'}</span>
          </button>
        </div>
      </header>

      {/* Main Mail & Contacts Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Folders & Contacts */}
        <aside className="w-48 sm:w-56 bg-white border-r border-gray-200 flex flex-col p-3 select-none shrink-0">
          <button
            onClick={() => setShowCompose(true)}
            className="w-full py-2 bg-blue-50 text-[#0078D4] hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center justify-center gap-2 mb-4 transition cursor-pointer"
          >
            <FileEdit className="w-4 h-4" />
            <span>{isAr ? 'إنشاء رسالة' : 'Compose'}</span>
          </button>

          <nav className="space-y-1 text-xs">
            {/* Inbox */}
            <button
              onClick={() => setActiveFolder('inbox')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                activeFolder === 'inbox' ? 'bg-blue-50 text-[#0078D4] font-bold' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'علبة الوارد' : 'Inbox'}</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-[#0078D4] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Sent */}
            <button
              onClick={() => setActiveFolder('sent')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                activeFolder === 'sent' ? 'bg-blue-50 text-[#0078D4] font-bold' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Send className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'البريد المرسل' : 'Sent Items'}</span>
            </button>

            {/* Drafts */}
            <button
              onClick={() => setActiveFolder('drafts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                activeFolder === 'drafts' ? 'bg-blue-50 text-[#0078D4] font-bold' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Archive className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'المسودات' : 'Drafts'}</span>
            </button>

            {/* Contacts & People (دفتر الأسماء وجهات الاتصال) */}
            <div className="pt-2 mt-2 border-t border-gray-100">
              <button
                onClick={() => setActiveFolder('contacts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                  activeFolder === 'contacts'
                    ? 'bg-blue-50 text-[#0078D4] font-bold shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>{isAr ? 'الأسماء وجهات الاتصال' : 'Contacts & People'}</span>
                </div>
                <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {contacts.length}
                </span>
              </button>
            </div>

            {/* Trash */}
            <button
              onClick={() => setActiveFolder('trash')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                activeFolder === 'trash' ? 'bg-blue-50 text-[#0078D4] font-bold' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
              <span>{isAr ? 'المحذوفات' : 'Deleted Items'}</span>
            </button>
          </nav>
        </aside>

        {/* ========================================================= */}
        {/* VIEW A: CONTACTS & PEOPLE VIEW (دفتر الأسماء وجهات الاتصال) */}
        {/* ========================================================= */}
        {activeFolder === 'contacts' ? (
          <div className="flex-1 bg-white flex flex-col overflow-hidden">
            {/* Contacts Header & Search Bar */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Contact className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-sm text-gray-900">
                    {isAr ? 'دفتر الأسماء وجهات الاتصال المسجلة' : 'Registered Contacts & People'}
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    {isAr
                      ? 'يمكنك إضافة الأسماء مباشرة من رسائل البريد، أو إنشاء أسماء جديدة ومراسلتهم بضغطة زر.'
                      : 'Add contacts directly from emails or create new ones to email in 1 click.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? 'بحث بالاسم أو الإيميل...' : 'Search contacts...'}
                    className="w-full bg-white border border-gray-200 rounded-xl py-1.5 ps-8 pe-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="px-3.5 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إضافة اسم جديد' : 'New Contact'}</span>
                </button>
              </div>
            </div>

            {/* Contacts Cards Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Users className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">
                    {isAr ? 'لا توجد جهات اتصال مطابقة للبحث' : 'No contacts found'}
                  </p>
                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="px-4 py-2 bg-blue-50 text-[#0078D4] rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                  >
                    {isAr ? '+ إضافة جهة اتصال الآن' : 'Add Contact Now'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-white border border-gray-200 hover:border-blue-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl ${
                            contact.avatarColor || 'bg-blue-600'
                          } text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          {contact.name.trim()[0] || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-gray-900 truncate">
                            {contact.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1 font-mono">
                            <AtSign className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{contact.email}</span>
                          </p>
                          {contact.role && (
                            <span className="inline-block mt-1.5 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                              {contact.role}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                        <span className="text-[10px] text-gray-400">
                          {contact.addedAt || (isAr ? 'مسجل' : 'Saved')}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleComposeToContact(contact.email, contact.name)}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title={isAr ? 'إرسال بريد إلكتروني' : 'Send Email'}
                          >
                            <Send className="w-3 h-3" />
                            <span>{isAr ? 'مراسلة' : 'Mail'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteContact(contact.id, contact.name)}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                            title={isAr ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW B: EMAIL LIST + READING PANE (قائمة البريد وعرض الرسالة) */
          /* ========================================================= */
          <>
            {/* Middle Column: Email List */}
            <div className="w-72 sm:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
              {/* Search Bar */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? 'بحث في البريد...' : 'Search emails...'}
                    className="w-full bg-gray-100 rounded-xl py-1.5 ps-8 pe-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Emails List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredEmails.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    {isAr ? 'لا توجد رسائل في هذا المجلد' : 'No emails in this folder'}
                  </div>
                ) : (
                  filteredEmails.map((mail) => {
                    const isSelected = mail.id === selectedEmailId;
                    return (
                      <div
                        key={mail.id}
                        onClick={() => markAsRead(mail.id)}
                        className={`p-3 cursor-pointer transition flex items-start gap-2.5 ${
                          isSelected ? 'bg-blue-50/70 border-s-4 border-[#0078D4]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={(e) => toggleStar(mail.id, e)}
                          className="mt-0.5 text-gray-400 hover:text-amber-400"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              mail.isStarred ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className={`truncate ${mail.isUnread ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                              {mail.sender}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0 ms-1">{mail.date}</span>
                          </div>
                          <h4 className={`text-xs truncate ${mail.isUnread ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                            {mail.subject}
                          </h4>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{mail.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Pane: Reading Pane */}
            <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
              {selectedEmail ? (
                <div>
                  {/* Email Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-2">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="w-9 h-9 rounded-2xl bg-[#0078D4] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          {selectedEmail.sender[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{selectedEmail.sender}</span>

                            {/* ⭐ KEY FEATURE: ADD CONTACT FROM EMAIL BUTTON ⭐ */}
                            {!isSenderSavedAsContact(selectedEmail.senderEmail) ? (
                              <button
                                onClick={() =>
                                  handleAddContactFromEmail(
                                    selectedEmail.sender,
                                    selectedEmail.senderEmail
                                  )
                                }
                                className="px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#0078D4] border border-blue-200 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                                title={isAr ? 'إضافة هذا الاسم والإيميل إلى دفتر جهات الاتصال' : 'Save as Contact'}
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>{isAr ? '+ إضافة الاسم لجهات الاتصال' : '+ Add Contact'}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                <span>{isAr ? 'مضاف في جهات الاتصال' : 'In Contacts'}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 font-mono">
                            {selectedEmail.senderEmail} • To: {selectedEmail.recipient}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setComposeTo(selectedEmail.senderEmail);
                          setComposeSubject(`Re: ${selectedEmail.subject}`);
                          setShowCompose(true);
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
                        title="Reply"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>{isAr ? 'رد' : 'Reply'}</span>
                      </button>

                      <button
                        onClick={() => deleteEmail(selectedEmail.id)}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedEmail.body}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs">
                  <Mail className="w-12 h-12 stroke-[1.2] mb-2 text-gray-300" />
                  <span>{isAr ? 'حدد رسالة لعرضها' : 'Select an email to view'}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* COMPOSE EMAIL MODAL (WITH CONTACT PICKER & AUTOCOMPLETE)   */}
      {/* ========================================================= */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden text-xs border border-gray-200">
            <div className="bg-[#0078D4] text-white px-5 py-3 flex items-center justify-between font-bold">
              <span>{isAr ? 'رسالة بريد جديدة' : 'New Message'}</span>
              <button onClick={() => setShowCompose(false)} className="hover:opacity-80 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-4 space-y-3 flex-1 flex flex-col">
              {/* Sender Info (From) */}
              <div className="flex items-center border-b pb-2 text-gray-600">
                <span className="w-12 text-gray-500 font-bold">{isAr ? 'من:' : 'From:'}</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="font-bold text-gray-800 truncate">{currentUser.name}</span>
                  <span className="font-mono text-[#0078D4] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px] font-bold">
                    {currentUser.email}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ✓ @{PRIMARY_DOMAIN}
                  </span>
                </div>
              </div>

              {/* Recipient Input with Contact Picker */}
              <div className="relative border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-12 text-gray-500 font-bold">{isAr ? 'إلى:' : 'To:'}</span>
                  <input
                    type="email"
                    required
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="name@company.com"
                    className="flex-1 focus:outline-none text-gray-800 font-medium"
                  />

                  {/* Contact Picker Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowContactPicker(!showContactPicker)}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    title={isAr ? 'اختيار من قائمة الأسماء وجهات الاتصال' : 'Select from Contacts'}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{isAr ? 'دفتر الأسماء' : 'Contacts'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Dropdown Contacts Picker */}
                {showContactPicker && (
                  <div className="absolute top-full start-12 end-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl z-30 p-2 max-h-56 overflow-y-auto">
                    <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase">
                      {isAr ? 'اختر اسماً من جهات الاتصال المسجلة:' : 'Select Contact:'}
                    </div>
                    {contacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setComposeTo(c.email);
                          setShowContactPicker(false);
                          showToast(isAr ? `تم تحديد "${c.name}"` : `Selected ${c.name}`);
                        }}
                        className="w-full p-2 text-start hover:bg-blue-50 rounded-xl transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${c.avatarColor || 'bg-blue-600'} text-white font-bold flex items-center justify-center text-[10px]`}>
                            {c.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-xs">{c.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{c.email}</div>
                          </div>
                        </div>
                        <Check className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="flex items-center border-b pb-2">
                <span className="w-12 text-gray-500 font-bold">{isAr ? 'الموضوع:' : 'Subject:'}</span>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder={isAr ? 'موضوع الرسالة...' : 'Email Subject...'}
                  className="flex-1 focus:outline-none text-gray-800 font-medium"
                />
              </div>

              {/* Copilot Smart Help Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400 font-semibold">{isAr ? 'نص الرسالة:' : 'Message Body:'}</span>
                <button
                  type="button"
                  onClick={handleCopilotDraftEmail}
                  disabled={copilotLoading || !composeSubject}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{copilotLoading ? (isAr ? 'جاري الصياغة...' : 'Drafting...') : (isAr ? 'صياغة ذكية بالذكاء الاصطناعي' : 'Draft with Copilot')}</span>
                </button>
              </div>

              {/* Body */}
              <textarea
                required
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder={isAr ? 'اكتب نص البريد الإلكتروني هنا...' : 'Write your email message...'}
                className="w-full flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 min-h-[160px]"
              />

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-gray-400">
                  <Paperclip className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إرسال' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW CONTACT MANUALLY (إضافة اسم جديد)            */}
      {/* ========================================================= */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-900">
                    {isAr ? 'إضافة اسم وجهة اتصال جديدة' : 'Add New Contact'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isAr ? 'احفظ الاسم والإيميل لتسهيل المراسلة السريعة' : 'Save contact for quick emailing'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewContact} className="space-y-3.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isAr ? 'الاسم الكامل أو اسم الجهة:' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder={isAr ? 'مثال: سارة أحمد / شركة التقنية' : 'e.g. Sarah Miller'}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isAr ? 'البريد الإلكتروني:' : 'Email Address:'}
                </label>
                <input
                  type="email"
                  required
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isAr ? 'الصفة / المنصب أو الملاحظة (اختياري):' : 'Role / Notes (Optional):'}
                </label>
                <input
                  type="text"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  placeholder={isAr ? 'مثال: مدير المشاريع / المبيعات' : 'e.g. Project Manager'}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'حفظ جهة الاتصال' : 'Save Contact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Corporate User Login / Switcher Modal */}
      <UserLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        lang={lang}
        onLoginSuccess={(profile) => {
          setCurrentUser(profile);
          showToast(
            isAr
              ? `تم تسجيل الدخول بنجاح! بريدك المعتمد: ${profile.email}`
              : `Signed in successfully! Active corporate email: ${profile.email}`
          );
        }}
      />

      {/* Internal Mailbox Modal */}
      {showInternalMailModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in">
          <div className="max-w-4xl w-full">
            <InternalMailBox
              isModal
              currentUserEmail={currentUser.email}
              currentUserName={currentUser.name}
              lang={lang}
              onClose={() => setShowInternalMailModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
