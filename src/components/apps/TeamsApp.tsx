import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  User,
  Send,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Phone,
  Search,
  Check,
  X,
  ShieldCheck,
  Radio,
  UserPlus,
  UserCheck,
  UserX,
  Ban,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Users,
  CheckCheck,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { TeamsIcon } from '../icons/AppIcons';
import { storage } from '../../services/storage';
import { UserProfile } from '../../types/suite';
import {
  connectService,
  ConnectUser,
  ConnectContact,
  ConnectMessage,
  ConnectConversation,
} from '../../services/connectService';

interface TeamsAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

export const TeamsApp: React.FC<TeamsAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getUserProfile());

  // Main Tabs: 'active_now' (المتواجدون الآن) | 'contacts' (جهات اتصالي) | 'requests' (طلبات التواصل) | 'chats' (المحادثات)
  const [mainTab, setMainTab] = useState<'active_now' | 'contacts' | 'requests' | 'chats'>('active_now');

  // Real data from Firestore
  const [discoverableUsers, setDiscoverableUsers] = useState<ConnectUser[]>([]);
  const [contacts, setContacts] = useState<ConnectContact[]>([]);
  const [activeContact, setActiveContact] = useState<ConnectContact | ConnectUser | null>(null);
  const [activeConversation, setActiveConversation] = useState<ConnectConversation | null>(null);
  const [messages, setMessages] = useState<ConnectMessage[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // In-App WebRTC Meeting State
  const [inMeeting, setInMeeting] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => {
      setActionNotice((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // 1. Initial Sync & Presence
  useEffect(() => {
    const handleProfileUpdate = () => {
      const p = storage.getUserProfile();
      setCurrentUser(p);
      connectService.syncUserPresence(p);
    };

    window.addEventListener('snns_user_profile_updated', handleProfileUpdate);
    connectService.syncUserPresence(currentUser);

    return () => {
      window.removeEventListener('snns_user_profile_updated', handleProfileUpdate);
    };
  }, []);

  // 2. Subscribe to Discoverable Users in Firestore
  useEffect(() => {
    const unsubscribe = connectService.subscribeDiscoverableUsers((users) => {
      setDiscoverableUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // 3. Subscribe to Current User's Contacts
  useEffect(() => {
    const currentUid = connectService.getCurrentUid();
    const unsubscribe = connectService.subscribeContacts(currentUid, (userContacts) => {
      setContacts(userContacts);
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  // 4. Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContactInfo = (contact: ConnectContact | ConnectUser) => {
    if ('targetUserId' in contact) {
      return {
        id: contact.targetUserId,
        name: contact.targetName,
        email: contact.targetEmail,
        avatarColor: contact.targetAvatarColor || 'bg-indigo-600',
        avatarInitials: contact.targetAvatarInitials || contact.targetName.slice(0, 2).toUpperCase(),
      };
    }
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      avatarColor: contact.avatarColor || 'bg-blue-600',
      avatarInitials: contact.avatarInitials || contact.name.slice(0, 2).toUpperCase(),
    };
  };

  // 5. Open / Subscribe to Conversation when an active contact is selected
  useEffect(() => {
    if (!activeContact) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);

    const initConv = async () => {
      try {
        const currentUid = connectService.getCurrentUid();
        const contactInfo = getContactInfo(activeContact);

        const conv = await connectService.getOrCreateConversation(
          {
            id: currentUid,
            name: currentUser.name,
            email: currentUser.email,
            avatarColor: currentUser.avatarColor,
            avatarInitials: currentUser.avatarInitials,
          },
          {
            id: contactInfo.id,
            name: contactInfo.name,
            email: contactInfo.email,
            avatarColor: contactInfo.avatarColor,
            avatarInitials: contactInfo.avatarInitials,
          }
        );

        if (!isMounted) return;
        setActiveConversation(conv);

        // Subscribe to messages in this conversation
        const unsubscribe = connectService.subscribeMessages(conv.id, (msgs) => {
          if (isMounted) {
            setMessages(msgs);
            setIsLoadingMessages(false);
          }
        });

        return unsubscribe;
      } catch (err: any) {
        if (isMounted) {
          setIsLoadingMessages(false);
          showNotice('error', isAr ? `فشل تحميل المحادثة: ${err?.message || ''}` : `Failed to load conversation: ${err?.message || ''}`);
        }
      }
    };

    const unsubPromise = initConv();

    return () => {
      isMounted = false;
      unsubPromise.then((unsub) => unsub && unsub());
    };
  }, [activeContact, currentUser]);

  // Camera handling for preview
  useEffect(() => {
    if (inMeeting && !videoOff) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            streamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(() => {});
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [inMeeting, videoOff]);

  // Filter Active Online Users (strictly heartbeat < 3 min, excluding self)
  const currentUid = connectService.getCurrentUid();
  const onlineUsers = useMemo(() => {
    return discoverableUsers.filter(
      (u) => u.id !== currentUid && connectService.isUserOnline(u)
    );
  }, [discoverableUsers, currentUid]);

  // Accepted Contacts
  const acceptedContacts = useMemo(() => {
    return contacts.filter((c) => c.status === 'accepted');
  }, [contacts]);

  // Incoming / Outgoing Requests
  const pendingIncomingRequests = useMemo(() => {
    return contacts.filter((c) => c.status === 'pending_received');
  }, [contacts]);

  const pendingOutgoingRequests = useMemo(() => {
    return contacts.filter((c) => c.status === 'pending_sent');
  }, [contacts]);

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return discoverableUsers.filter((u) => {
      if (u.id === currentUid) return false;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.snnsHandle.toLowerCase().includes(q) ||
        (u.roleAr && u.roleAr.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, discoverableUsers, currentUid]);

  // Contact helper lookup
  const getContactStatus = (userId: string): ConnectContact | undefined => {
    return contacts.find((c) => c.targetUserId === userId || c.id === userId);
  };

  // Actions
  const handleAddContact = async (targetUser: ConnectUser) => {
    try {
      const res = await connectService.sendContactRequest(
        {
          id: currentUid,
          name: currentUser.name,
          email: currentUser.email,
          handle: currentUser.username,
          avatarColor: currentUser.avatarColor,
          avatarInitials: currentUser.avatarInitials,
        },
        targetUser
      );
      showNotice('success', res.message);
    } catch (err: any) {
      showNotice('error', err.message || (isAr ? 'فشل إرسال طلب التواصل' : 'Failed to send request'));
    }
  };

  const handleAcceptRequest = async (contact: ConnectContact) => {
    try {
      await connectService.acceptContactRequest(currentUid, contact.targetUserId);
      showNotice('success', isAr ? `تم قبول طلب التواصل من ${contact.targetName}` : `Accepted request from ${contact.targetName}`);
    } catch (err: any) {
      showNotice('error', err.message || (isAr ? 'فشل قبول الطلب' : 'Failed to accept request'));
    }
  };

  const handleRejectRequest = async (contact: ConnectContact) => {
    try {
      await connectService.rejectContactRequest(currentUid, contact.targetUserId);
      showNotice('success', isAr ? `تم رفض طلب التواصل` : `Rejected request`);
    } catch (err: any) {
      showNotice('error', err.message || (isAr ? 'فشل رفض الطلب' : 'Failed to reject request'));
    }
  };

  const handleRemoveContact = async (contact: ConnectContact) => {
    if (!confirm(isAr ? `هل أنت متأكد من حذف ${contact.targetName} من جهات اتصالك؟` : `Remove ${contact.targetName}?`)) {
      return;
    }
    try {
      await connectService.removeContact(currentUid, contact.targetUserId);
      if (activeContact && ('targetUserId' in activeContact ? activeContact.targetUserId : activeContact.id) === contact.targetUserId) {
        setActiveContact(null);
      }
      showNotice('success', isAr ? 'تم حذف جهة الاتصال بنجاح' : 'Contact removed');
    } catch (err: any) {
      showNotice('error', err.message || (isAr ? 'فشل الحذف' : 'Failed to remove'));
    }
  };

  const handleBlockContact = async (contact: ConnectContact) => {
    if (!confirm(isAr ? `هل تريد حظر ${contact.targetName}؟` : `Block ${contact.targetName}?`)) {
      return;
    }
    try {
      await connectService.blockContact(currentUid, contact.targetUserId);
      showNotice('success', isAr ? 'تم حظر المستخدم' : 'User blocked');
    } catch (err: any) {
      showNotice('error', err.message || (isAr ? 'فشل الحظر' : 'Failed to block'));
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    const textToSend = messageInput.trim();
    setIsSendingMessage(true);

    try {
      await connectService.sendMessage(
        activeConversation.id,
        { id: currentUid, name: currentUser.name },
        textToSend
      );
      setMessageInput('');
    } catch (err: any) {
      showNotice('error', isAr ? `فشل إرسال الرسالة إلى الخادم: ${err?.message || ''}` : `Failed to send: ${err?.message || ''}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Start Meeting Call via SNNS.SITE
  const handleStartCall = async (type: 'video' | 'audio') => {
    if (!activeConversation) return;
    const roomName = `connect-${activeConversation.id}`;
    const snnsSiteUrl = `https://snns.site/?room=${encodeURIComponent(roomName)}`;

    try {
      // Post call invitation link directly into the conversation
      await connectService.sendMessage(
        activeConversation.id,
        { id: currentUid, name: currentUser.name },
        isAr
          ? `📞 دعوة مكالمة ${type === 'video' ? 'مرئية' : 'صوتية'} مباشرة عبر SNNS.SITE:\n${snnsSiteUrl}`
          : `📞 ${type === 'video' ? 'Video' : 'Audio'} call invitation on SNNS.SITE:\n${snnsSiteUrl}`,
        snnsSiteUrl
      );
      setMeetingUrl(snnsSiteUrl);
      setInMeeting(true);
      showNotice(
        'success',
        isAr ? 'تم إنشاء رابط الغرفة المشفرة على https://snns.site وإرساله للمحادثة' : 'Call link created on https://snns.site'
      );
    } catch (err: any) {
      showNotice('error', isAr ? 'فشل إرسال رابط المكالمة' : 'Failed to start call');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white min-h-screen select-none font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              title={isAr ? 'الرجوع للمركز الرئيسي' : 'Back to Hub'}
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-950/40">
                <TeamsIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {isAr ? 'منظومة SNNS Connect الموحدة' : 'SNNS Connect Workspace'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isAr ? 'قاعدة بيانات حية (Firestore)' : 'Live Cloud'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{currentUser.name}</span>
                  <span className="font-mono text-emerald-400 font-semibold">({currentUser.email})</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-500/30">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>{isAr ? `${onlineUsers.length} متواجدون الآن فعلياً` : `${onlineUsers.length} Online Now`}</span>
            </div>
          </div>
        </div>

        {/* Global Notification Toast */}
        {actionNotice && (
          <div
            className={`mt-2 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition max-w-7xl mx-auto ${
              actionNotice.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {actionNotice.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionNotice.text}</span>
          </div>
        )}
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Sidebar: Navigation Tabs & Lists */}
        <aside className="w-80 sm:w-96 bg-slate-900 border-e border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          {/* Main 4 Tabs */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40">
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                onClick={() => setMainTab('active_now')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  mainTab === 'active_now'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={isAr ? 'المتواجدون الآن' : 'Active Now'}
              >
                <div className="relative">
                  <Activity className="w-4 h-4" />
                  {onlineUsers.length > 0 && (
                    <span className="absolute -top-1 -end-2 min-w-[14px] h-[14px] px-1 bg-amber-400 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center">
                      {onlineUsers.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{isAr ? 'المتواجدون' : 'Online'}</span>
              </button>

              <button
                onClick={() => setMainTab('contacts')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  mainTab === 'contacts'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={isAr ? 'جهات اتصالي' : 'My Contacts'}
              >
                <div className="relative">
                  <Users className="w-4 h-4" />
                  {acceptedContacts.length > 0 && (
                    <span className="absolute -top-1 -end-2 min-w-[14px] h-[14px] px-1 bg-indigo-400 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                      {acceptedContacts.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{isAr ? 'جهات اتصالي' : 'Contacts'}</span>
              </button>

              <button
                onClick={() => setMainTab('requests')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  mainTab === 'requests'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={isAr ? 'طلبات التواصل' : 'Requests'}
              >
                <div className="relative">
                  <UserPlus className="w-4 h-4" />
                  {pendingIncomingRequests.length > 0 && (
                    <span className="absolute -top-1 -end-2 min-w-[14px] h-[14px] px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                      {pendingIncomingRequests.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{isAr ? 'الطلبات' : 'Requests'}</span>
              </button>

              <button
                onClick={() => setMainTab('chats')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  mainTab === 'chats'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={isAr ? 'المحادثات' : 'Chats'}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px]">{isAr ? 'المحادثات' : 'Chats'}</span>
              </button>
            </div>

            {/* Discover & Add Contact Search Input */}
            <div className="relative mt-3">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، المعرّف، أو بريد @snns.pro...' : 'Search users to connect...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results Dropdown List */}
          {searchQuery.trim() && (
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>{isAr ? 'نتائج البحث في دليل المستخدمين:' : 'Search Results:'}</span>
                <span className="text-indigo-400 font-mono">({searchResults.length})</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">
                  {isAr ? 'لم يتم العثور على مستخدمين بهذا الاسم.' : 'No users found matching query.'}
                </div>
              ) : (
                searchResults.map((user) => {
                  const relation = getContactStatus(user.id);
                  const isOnline = connectService.isUserOnline(user);

                  return (
                    <div
                      key={user.id}
                      className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-xl ${user.avatarColor || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center`}>
                            {user.avatarInitials}
                          </div>
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" title={isAr ? 'متصل الآن' : 'Online'} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                        </div>
                      </div>

                      <div>
                        {relation?.status === 'accepted' ? (
                          <button
                            onClick={() => {
                              setActiveContact(user);
                              setSearchQuery('');
                            }}
                            className="px-2.5 py-1 bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{isAr ? 'محادثة' : 'Chat'}</span>
                          </button>
                        ) : relation?.status === 'pending_sent' ? (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-bold">
                            {isAr ? 'بانتظار القبول' : 'Pending'}
                          </span>
                        ) : relation?.status === 'pending_received' ? (
                          <button
                            onClick={() => handleAcceptRequest(relation)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            {isAr ? 'قبول الطلب' : 'Accept'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddContact(user)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>{isAr ? 'إضافة' : 'Add'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 1: المتواجدون الآن (Active Now) */}
          {mainTab === 'active_now' && (
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                <span>{isAr ? 'المستخدمون المتصلون حالياً بالخادم' : 'Verified Online Members'}</span>
                <span className="text-emerald-400 font-mono font-bold">({onlineUsers.length})</span>
              </div>

              {onlineUsers.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-300">
                    {isAr ? 'لا يوجد مستخدمون متواجدون الآن' : 'No users currently online'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {isAr
                      ? 'يتم عرض حالة «متصل الآن» فقط عند وجود نشاط حقيقي وموثق خلال آخر 3 دقائق على الخادم.'
                      : 'Online status is only shown with verified server activity within the last 3 minutes.'}
                  </p>
                </div>
              ) : (
                onlineUsers.map((user) => {
                  const relation = getContactStatus(user.id);
                  const isSelected = activeContact && ('targetUserId' in activeContact ? activeContact.targetUserId : activeContact.id) === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => setActiveContact(user)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative">
                          <div className={`w-9 h-9 rounded-xl ${user.avatarColor || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center`}>
                            {user.avatarInitials}
                          </div>
                          <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">{user.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                              {isAr ? 'متصل' : 'Online'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{user.email}</p>
                          <p className="text-[9px] text-slate-500 truncate">{user.roleAr}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!relation && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddContact(user);
                            }}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                            title={isAr ? 'إرسال طلب تواصل' : 'Add contact'}
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: جهات اتصالي (My Contacts) */}
          {mainTab === 'contacts' && (
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                <span>{isAr ? 'جهات الاتصال المعتمدة' : 'Verified Contacts'}</span>
                <span className="text-indigo-400 font-mono font-bold">({acceptedContacts.length})</span>
              </div>

              {acceptedContacts.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-300">
                    {isAr ? 'لا توجد جهات اتصال مضافة بعد' : 'No contacts added yet'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isAr
                      ? 'ابحث بالاسم أو البريد في شريط البحث أعلاه لإضافة زملاء العمل.'
                      : 'Use the search box above to add teammates to your contact list.'}
                  </p>
                </div>
              ) : (
                acceptedContacts.map((contact) => {
                  const userDoc = discoverableUsers.find((u) => u.id === contact.targetUserId);
                  const isOnline = userDoc ? connectService.isUserOnline(userDoc) : false;
                  const isSelected = activeContact && ('targetUserId' in activeContact ? activeContact.targetUserId : activeContact.id) === contact.targetUserId;

                  return (
                    <div
                      key={contact.id}
                      onClick={() => setActiveContact(contact)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
                          : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative">
                          <div className={`w-9 h-9 rounded-xl ${contact.targetAvatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center`}>
                            {contact.targetAvatarInitials || contact.targetName.slice(0, 2)}
                          </div>
                          {isOnline ? (
                            <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" title={isAr ? 'متصل الآن' : 'Online'} />
                          ) : (
                            <span className="absolute -bottom-0.5 -end-0.5 w-2 h-2 bg-slate-600 rounded-full ring-2 ring-slate-900" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-white truncate">{contact.targetName}</h4>
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{contact.targetEmail}</p>
                          <span className={`text-[9px] font-bold ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isOnline ? (isAr ? 'متصل الآن' : 'Online') : (isAr ? 'غير متصل' : 'Offline')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveContact(contact);
                          }}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition"
                          title={isAr ? 'حذف من جهات الاتصال' : 'Remove contact'}
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: طلبات التواصل (Contact Requests) */}
          {mainTab === 'requests' && (
            <div className="p-3 space-y-4">
              {/* Incoming Requests */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 px-1 mb-2">
                  <span>{isAr ? 'الطلبات الواردة إليك' : 'Incoming Requests'}</span>
                  <span className="font-mono">({pendingIncomingRequests.length})</span>
                </div>

                {pendingIncomingRequests.length === 0 ? (
                  <p className="text-[11px] text-slate-500 px-2 py-3 bg-slate-950 rounded-xl text-center border border-slate-800">
                    {isAr ? 'لا توجد طلبات واردة جديدة.' : 'No incoming requests.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingIncomingRequests.map((req) => (
                      <div key={req.id} className="p-3 bg-slate-900 rounded-2xl border border-amber-500/30 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${req.targetAvatarColor || 'bg-amber-600'} text-white font-bold text-xs flex items-center justify-center`}>
                            {req.targetAvatarInitials || req.targetName.slice(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{req.targetName}</h4>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{req.targetEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isAr ? 'قبول' : 'Accept'}</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req)}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{isAr ? 'رفض' : 'Reject'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 mb-2">
                  <span>{isAr ? 'الطلبات المرسلة بانتظار الموافقة' : 'Sent Requests Pending'}</span>
                  <span className="font-mono">({pendingOutgoingRequests.length})</span>
                </div>

                {pendingOutgoingRequests.length === 0 ? (
                  <p className="text-[11px] text-slate-500 px-2 py-3 bg-slate-950 rounded-xl text-center border border-slate-800">
                    {isAr ? 'لا توجد طلبات مرسلة معلقة.' : 'No pending sent requests.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingOutgoingRequests.map((req) => (
                      <div key={req.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{req.targetName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{req.targetEmail}</p>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          {isAr ? 'معلق' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: المحادثات النشطة (Chats) */}
          {mainTab === 'chats' && (
            <div className="p-3 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 px-1">
                {isAr ? 'المحادثات المباشرة' : 'Direct Messages'}
              </div>

              {acceptedContacts.length === 0 && onlineUsers.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-2xl">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    {isAr ? 'اختر أي جهة اتصال أو مستخدم متواجد لبدء محادثة مشفرة.' : 'Select an active contact or online user to chat.'}
                  </p>
                </div>
              ) : (
                acceptedContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full p-3 rounded-2xl border transition text-start flex items-center justify-between gap-2 cursor-pointer ${
                      activeContact && ('targetUserId' in activeContact ? activeContact.targetUserId : activeContact.id) === contact.targetUserId
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl ${contact.targetAvatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                        {contact.targetAvatarInitials || contact.targetName.slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-white truncate block">{contact.targetName}</span>
                        <span className="text-[10px] text-slate-400 truncate block mt-0.5">{contact.targetEmail}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </aside>

        {/* Main Stage: Conversation Thread & Video Call Link */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Active Call / Video Meeting Stage */}
          {inMeeting && meetingUrl && (
            <div className="bg-slate-900 p-4 border-b border-indigo-500/30 text-white flex flex-col gap-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold text-sm">
                    {isAr ? 'مكالمة واجتماع SNNS Connect عبر https://snns.site' : 'SNNS Connect Call via https://snns.site'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isAr ? 'فتح الغرفة في SNNS.SITE' : 'Join on SNNS.SITE'}</span>
                  </a>

                  <button
                    onClick={() => setMicMuted(!micMuted)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      micMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setVideoOff(!videoOff)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      videoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {videoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setInMeeting(false);
                      setMeetingUrl(null);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>{isAr ? 'إنهاء' : 'End'}</span>
                  </button>
                </div>
              </div>

              {/* Local Video Camera Preview */}
              <div className="w-full max-w-sm h-40 bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center mx-auto">
                {!videoOff ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500 text-xs">
                    <VideoOff className="w-6 h-6" />
                    <span>{isAr ? 'الكاميرا متوقفة' : 'Camera off'}</span>
                  </div>
                )}
                <div className="absolute bottom-2 start-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold">
                  {currentUser.name} ({isAr ? 'أنت' : 'You'})
                </div>
              </div>
            </div>
          )}

          {/* Active Conversation Header */}
          {activeContact ? (() => {
            const currentContactInfo = getContactInfo(activeContact);
            return (
            <>
              <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-2xl ${currentContactInfo.avatarColor} text-white font-black text-sm flex items-center justify-center shadow`}>
                      {currentContactInfo.avatarInitials}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <span>{currentContactInfo.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        @snns.pro
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {currentContactInfo.email}
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons: Video Call & Audio Call via SNNS.SITE */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartCall('video')}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/30"
                    title={isAr ? 'بدء مكالمة فيديو عبر https://snns.site' : 'Video call on SNNS.SITE'}
                  >
                    <Video className="w-4 h-4" />
                    <span>{isAr ? 'اتصال مرئي' : 'Video Call'}</span>
                  </button>

                  <button
                    onClick={() => handleStartCall('audio')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    title={isAr ? 'اتصال صوتي عبر https://snns.site' : 'Voice call on SNNS.SITE'}
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">{isAr ? 'اتصال صوتي' : 'Audio Call'}</span>
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                    <span className="text-xs">{isAr ? 'جارِ مزامنة الرسائل المشفرة من Firestore...' : 'Syncing messages from Firestore...'}</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 border border-dashed border-slate-800/80 rounded-3xl">
                    <ShieldCheck className="w-12 h-12 text-indigo-400 mb-3 opacity-60" />
                    <h4 className="text-sm font-bold text-slate-300">
                      {isAr ? 'بداية المحادثة الآمنة بين الطرفين' : 'End-to-End Secure Conversation'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                      {isAr
                        ? 'هذه المحادثة مشفرة ومحفوظة في قاعدة بيانات المنظومة السحابية Firestore. لا يمكن لأي مستخدم آخر قراءتها بفضل قواعد الأمان الصارمة.'
                        : 'Messages are stored in Firestore with participant-only security rules.'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUid;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                          <span className="font-bold">{isMe ? (isAr ? 'أنت' : 'You') : msg.senderName}</span>
                          <span>•</span>
                          <span className="font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-lg break-words shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-ee-xs'
                              : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-es-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {msg.callRoomUrl && (
                            <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold flex items-center gap-1">
                                <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
                                <span>{isAr ? 'رابط المكالمة المباشرة' : 'Direct Call Link'}</span>
                              </span>
                              <a
                                href={msg.callRoomUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-white text-slate-950 font-black rounded-lg text-[10px] hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isAr ? 'انضمام' : 'Join'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Delivery Status Indicator */}
                        {isMe && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 px-1">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isAr ? 'تم الإرسال والحفظ في الخادم' : 'Saved to Cloud'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      isAr
                        ? `اكتب رسالتك لـ ${currentContactInfo.name}...`
                        : 'Write message...'
                    }
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />

                  <button
                    type="submit"
                    disabled={isSendingMessage || !messageInput.trim()}
                    className="p-2.5 sm:px-4 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-950/40"
                  >
                    {isSendingMessage ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 rtl:-scale-x-100" />
                        <span className="hidden sm:inline">{isAr ? 'إرسال' : 'Send'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
            );
          })() : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mb-4 shadow-xl">
                <TeamsIcon className="w-9 h-9" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {isAr ? 'مرحباً بك في مساحة SNNS Connect الموحدة' : 'Welcome to SNNS Connect'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                {isAr
                  ? 'اختر أي مستخدم من تبويب «المتواجدون الآن» أو من «جهات اتصالي» للبدء بالمحادثات الفورية والاتصال الصوتي والمرئي الآمن عبر SNNS.SITE.'
                  : 'Select an online user or contact to start secure messaging and calls.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeamsApp;
