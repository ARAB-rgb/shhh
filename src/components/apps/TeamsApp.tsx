import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  UserX,
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
  Calendar,
  Hash,
  Paperclip,
  Share2,
  Copy,
  Plus,
  Lock,
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
  ConnectAttachment,
} from '../../services/connectService';
import { SnnsCallRoom } from './SnnsCallRoom';

interface TeamsAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
  initialTab?: 'chats' | 'calls' | 'contacts' | 'meetings';
}

interface CallHistoryItem {
  id: string;
  targetName: string;
  targetEmail: string;
  type: 'video' | 'audio';
  direction: 'outgoing' | 'incoming' | 'missed';
  time: string;
  roomName: string;
  snnsSiteUrl: string;
}

const CHANNELS = [
  { id: 'general', nameAr: 'العام - المنظومة السحابية', nameEn: 'General Suite' },
  { id: 'dev-team', nameAr: 'فريق التطوير والتقنية', nameEn: 'Engineering Team' },
  { id: 'business-market', nameAr: 'الأعمال والخدمات الحكومية', nameEn: 'Business & Directory' },
];

export const TeamsApp: React.FC<TeamsAppProps> = ({ onBack, lang, initialTab }) => {
  const isAr = lang === 'ar';
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getUserProfile());

  // 4 Main Tabs: 'chats' | 'calls' | 'contacts' | 'meetings'
  const [mainTab, setMainTab] = useState<'chats' | 'calls' | 'contacts' | 'meetings'>(initialTab || 'chats');

  // Contacts Sub-tab: 'my_contacts' | 'active_now' | 'requests'
  const [contactsSubTab, setContactsSubTab] = useState<'my_contacts' | 'active_now' | 'requests'>('my_contacts');

  // Active channel or Direct Contact
  const [activeChannelId, setActiveChannelId] = useState<string | null>('general');
  const [activeContact, setActiveContact] = useState<ConnectContact | ConnectUser | null>(null);
  const [activeConversation, setActiveConversation] = useState<ConnectConversation | null>(null);
  const [messages, setMessages] = useState<ConnectMessage[]>([]);
  const [channelMessages, setChannelMessages] = useState<Record<string, ConnectMessage[]>>({});

  // Real data from Firestore
  const [discoverableUsers, setDiscoverableUsers] = useState<ConnectUser[]>([]);
  const [contacts, setContacts] = useState<ConnectContact[]>([]);

  // Search & Message inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Active Embedded Call Room (Daily.co / SnnsCallRoom)
  const [activeCallRoom, setActiveCallRoom] = useState<string | null>(null);
  const [callLog, setCallLog] = useState<CallHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('snns_connect_call_log');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Outgoing / Dialing Call Modal State
  const [dialingModal, setDialingModal] = useState<{
    targetName: string;
    targetEmail: string;
    type: 'video' | 'audio';
    roomName: string;
    snnsSiteUrl: string;
    state: 'connecting' | 'ringing' | 'ready';
  } | null>(null);

  // Meeting Creation State
  const [instantRoomName, setInstantRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createdRoomInfo, setCreatedRoomInfo] = useState<{
    roomName: string;
    callUrl: string;
    snnsSiteUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Hardware Preview Controls for Meetings
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Attachments State
  const [pendingAttachment, setPendingAttachment] = useState<ConnectAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Incoming Call State
  const [incomingCall, setIncomingCall] = useState<{
    callerName: string;
    callerEmail: string;
    roomName: string;
    type: 'video' | 'audio';
    timestamp: string;
  } | null>(null);

  const playRingChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  const showNotice = (type: 'success' | 'error', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => {
      setActionNotice((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

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

  // 4. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  // 5. Open / Subscribe to Conversation when an active contact is selected
  useEffect(() => {
    if (!activeContact) {
      setActiveConversation(null);
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

            // Check for incoming call invite from other participant
            if (msgs.length > 0) {
              const last = msgs[msgs.length - 1];
              if (last.callRoomUrl && last.senderId !== currentUid) {
                const age = Date.now() - new Date(last.timestamp).getTime();
                if (age >= 0 && age < 45000) {
                  const room = last.callRoomUrl.includes('/call/')
                    ? last.callRoomUrl.split('/call/')[1]
                    : last.callRoomUrl.split('/').pop() || 'snns-call';
                  setIncomingCall({
                    callerName: last.senderName,
                    callerEmail: contactInfo.email,
                    roomName: room,
                    type: last.text && last.text.includes('صوت') ? 'audio' : 'video',
                    timestamp: last.timestamp,
                  });
                  playRingChime();
                }
              }
            }
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

  // Camera preview in meetings tab
  useEffect(() => {
    if (mainTab === 'meetings' && !videoOff && !activeCallRoom) {
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
  }, [mainTab, videoOff, activeCallRoom]);

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

  const getContactStatus = (userId: string): ConnectContact | undefined => {
    return contacts.find((c) => c.targetUserId === userId || c.id === userId);
  };

  // Contact actions
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
      showNotice('success', isAr ? 'تم رفض طلب التواصل' : 'Rejected request');
    } catch (err: any) {
      showNotice('error', err.message || (isAr ? 'فشل رفض الطلب' : 'Failed to reject request'));
    }
  };

  const handleRemoveContact = async (contact: ConnectContact) => {
    if (!confirm(isAr ? `هل تريد حذف ${contact.targetName} من جهات الاتصال؟` : `Remove ${contact.targetName}?`)) {
      return;
    }
    try {
      await connectService.removeContact(currentUid, contact.targetUserId);
      if (activeContact && getContactInfo(activeContact).id === contact.targetUserId) {
        setActiveContact(null);
      }
      showNotice('success', isAr ? 'تم حذف جهة الاتصال' : 'Contact removed');
    } catch (err: any) {
      showNotice('error', err.message || (isAr ? 'فشل الحذف' : 'Failed to remove'));
    }
  };

  // Handle file selection for attachment
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showNotice(
        'error',
        isAr
          ? 'حجم الملف يتجاوز الحد المسموح للمرفقات المباشرة (500 كيلوبايت). يرجى مشاركته عبر SNNS Cloud.'
          : 'File exceeds 500KB limit for direct attachments. Please share via SNNS Cloud.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Send Direct Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !pendingAttachment) return;

    if (activeContact && activeConversation) {
      const textToSend = messageInput.trim();
      setIsSendingMessage(true);

      try {
        await connectService.sendMessage(
          activeConversation.id,
          { id: currentUid, name: currentUser.name },
          textToSend,
          undefined,
          pendingAttachment || undefined
        );
        setMessageInput('');
        setPendingAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        showNotice('error', isAr ? `فشل إرسال الرسالة إلى الخادم: ${err?.message || ''}` : `Failed to send: ${err?.message || ''}`);
      } finally {
        setIsSendingMessage(false);
      }
    } else if (activeChannelId) {
      // Group channel message
      const textToSend = messageInput.trim();
      const newMsg: ConnectMessage = {
        id: `ch-msg-${Date.now()}`,
        conversationId: activeChannelId,
        senderId: currentUid,
        senderName: currentUser.name,
        text: textToSend,
        timestamp: new Date().toISOString(),
        status: 'delivered',
        ...(pendingAttachment ? { attachment: pendingAttachment } : {}),
      };
      setChannelMessages((prev) => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
      }));
      setMessageInput('');
      setPendingAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Call Initiator: Ringing modal -> Daily.co / SNNS.SITE
  const handleInitiateCall = (target: { name: string; email: string }, type: 'video' | 'audio') => {
    const safeTargetName = target.name || 'مستخدم المنظومة';
    const roomName = `connect-${Date.now().toString().slice(-6)}`;
    const snnsSiteUrl = `https://snns.site/call/${roomName}`;

    setDialingModal({
      targetName: safeTargetName,
      targetEmail: target.email,
      type,
      roomName,
      snnsSiteUrl,
      state: 'connecting',
    });

    // Notify target in direct conversation if active
    if (activeContact && activeConversation) {
      connectService
        .sendMessage(
          activeConversation.id,
          { id: currentUid, name: currentUser.name },
          type === 'video' ? '📹 دعوة لمكالمة مرئية مشفرة' : '📞 دعوة لمكالمة صوتية مشفرة',
          snnsSiteUrl
        )
        .catch(() => {});
    }

    // Save to call log
    const logItem: CallHistoryItem = {
      id: `call-${Date.now()}`,
      targetName: safeTargetName,
      targetEmail: target.email,
      type,
      direction: 'outgoing',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roomName,
      snnsSiteUrl,
    };

    setCallLog((prev) => {
      const updated = [logItem, ...prev.slice(0, 25)];
      try {
        localStorage.setItem('snns_connect_call_log', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Simulate ring signaling transition to ready
    setTimeout(() => {
      setDialingModal((prev) => (prev ? { ...prev, state: 'ringing' } : null));
    }, 1200);

    setTimeout(() => {
      setDialingModal((prev) => (prev ? { ...prev, state: 'ready' } : null));
    }, 2800);
  };

  // Instant Meeting Creator via /api/calls/create-room
  const handleCreateInstantMeeting = async () => {
    setIsCreatingRoom(true);
    const roomNameToUse = instantRoomName.trim() || `snns-room-${Date.now().toString().slice(-4)}`;

    try {
      const res = await fetch('/api/calls/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomNameToUse,
          expiryMinutes: 180,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedRoomInfo({
          roomName: data.roomName,
          callUrl: data.callUrl,
          snnsSiteUrl: data.snnsSiteUrl || `https://snns.site/call/${data.roomName}`,
        });
        showNotice('success', isAr ? 'تم إنشاء غرفة الاجتماع بنجاح!' : 'Meeting room created!');
      } else {
        throw new Error(data.error);
      }
    } catch {
      // Fallback
      setCreatedRoomInfo({
        roomName: roomNameToUse,
        callUrl: `https://snns.daily.co/${roomNameToUse}`,
        snnsSiteUrl: `https://snns.site/call/${roomNameToUse}`,
      });
      showNotice('success', isAr ? 'تم تجهيز رابط الغرفة السحابية' : 'Room link ready');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If in an active in-app Call Room, render the SnnsCallRoom component directly
  if (activeCallRoom) {
    return (
      <SnnsCallRoom
        roomName={activeCallRoom}
        userDisplayName={currentUser.name || 'مستخدم SNNS Connect'}
        onLeave={() => setActiveCallRoom(null)}
        lang={lang}
      />
    );
  }

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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-indigo-950/40">
                <TeamsIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {isAr ? 'SNNS Connect' : 'SNNS Connect'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isAr ? 'المحادثات والمكالمات الموحدة' : 'Unified Suite'}</span>
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
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-bold">{onlineUsers.length}</span>
              <span>{isAr ? 'متصلون الآن' : 'Online Now'}</span>
            </div>

            <a
              href="https://snns.site"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              title="SNNS.SITE Calls Engine"
            >
              <span>SNNS.SITE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Global Action Toast */}
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

      {/* Main 4 Unified Tabs Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 sticky top-[65px] z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {/* TAB 1: المحادثات (Chats) */}
            <button
              onClick={() => {
                setMainTab('chats');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                mainTab === 'chats'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isAr ? 'المحادثات' : 'Chats'}</span>
            </button>

            {/* TAB 2: المكالمات (Calls) */}
            <button
              onClick={() => {
                setMainTab('calls');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                mainTab === 'calls'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>{isAr ? 'المكالمات' : 'Calls'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* TAB 3: جهات الاتصال (Contacts) */}
            <button
              onClick={() => {
                setMainTab('contacts');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                mainTab === 'contacts'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isAr ? 'جهات الاتصال' : 'Contacts'}</span>
              {pendingIncomingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black animate-pulse">
                  {pendingIncomingRequests.length}
                </span>
              )}
            </button>

            {/* TAB 4: الاجتماعات (Meetings) */}
            <button
              onClick={() => {
                setMainTab('meetings');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                mainTab === 'meetings'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{isAr ? 'الاجتماعات' : 'Meetings'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden lg:flex items-center gap-2 font-mono">
            <span>Daily.co & WebRTC Engine</span>
            <span>•</span>
            <span className="text-emerald-400">snns.site</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* ======================================================== */}
        {/* TAB 1: المحادثات (CHATS)                                 */}
        {/* ======================================================== */}
        {mainTab === 'chats' && (
          <div className="flex-1 flex overflow-hidden w-full">
            {/* Chats Sidebar */}
            <aside className="w-72 sm:w-80 bg-slate-900 border-e border-slate-800 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-3 border-b border-slate-800 bg-slate-950/40">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  {isAr ? 'قنوات فرق العمل' : 'Channels'}
                </div>
                <div className="space-y-1 text-xs">
                  {CHANNELS.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChannelId(ch.id);
                        setActiveContact(null);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition text-start cursor-pointer ${
                        activeChannelId === ch.id && !activeContact
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{isAr ? ch.nameAr : ch.nameEn}</span>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2 px-1 flex items-center justify-between">
                  <span>{isAr ? 'المحادثات المباشرة (1-on-1)' : 'Direct Chats'}</span>
                  <button
                    onClick={() => setMainTab('contacts')}
                    className="text-[10px] text-indigo-400 hover:underline font-bold"
                  >
                    {isAr ? '+ إضافة' : '+ Add'}
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  {acceptedContacts.length === 0 ? (
                    <p className="text-[11px] text-slate-500 py-3 text-center">
                      {isAr ? 'لا توجد محادثات خاصة بعد. أضف زملاء من جهات الاتصال.' : 'No direct chats yet.'}
                    </p>
                  ) : (
                    acceptedContacts.map((contact) => {
                      const userDoc = discoverableUsers.find((u) => u.id === contact.targetUserId);
                      const isOnline = userDoc ? connectService.isUserOnline(userDoc) : false;
                      const isSelected = activeContact && getContactInfo(activeContact).id === contact.targetUserId;

                      return (
                        <button
                          key={contact.id}
                          onClick={() => {
                            setActiveContact(contact);
                            setActiveChannelId(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition text-start cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="relative shrink-0">
                              <div className={`w-8 h-8 rounded-xl ${contact.targetAvatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center`}>
                                {contact.targetAvatarInitials || contact.targetName.slice(0, 2)}
                              </div>
                              {isOnline && (
                                <span className="absolute -bottom-0.5 -end-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-xs truncate block">{contact.targetName}</span>
                              <span className="text-[10px] text-slate-400 truncate block font-mono">{contact.targetEmail}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>

            {/* Conversation Stage */}
            <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    {activeContact ? (
                      <>
                        <span>{getContactInfo(activeContact).name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {getContactInfo(activeContact).email}
                        </span>
                      </>
                    ) : (
                      <>
                        <Hash className="w-4 h-4 text-indigo-400" />
                        <span>{CHANNELS.find((c) => c.id === activeChannelId)?.nameAr || 'القناة العامة'}</span>
                      </>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeContact
                      ? (isAr ? 'محادثة فردية مشفرة ومحفوظة في Firestore' : 'Encrypted direct conversation')
                      : (isAr ? 'قناة عامة لفريق العمل في منظومة SNNS 365' : 'Corporate team channel')}
                  </p>
                </div>

                {/* Call Initiation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const target = activeContact
                        ? { name: getContactInfo(activeContact).name, email: getContactInfo(activeContact).email }
                        : { name: 'فريق القناة', email: 'channel@snns.pro' };
                      handleInitiateCall(target, 'video');
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                    title={isAr ? 'مكالمة مرئية عبر SNNS.SITE' : 'Video call'}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{isAr ? 'اتصال مرئي' : 'Video'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const target = activeContact
                        ? { name: getContactInfo(activeContact).name, email: getContactInfo(activeContact).email }
                        : { name: 'فريق القناة', email: 'channel@snns.pro' };
                      handleInitiateCall(target, 'audio');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    title={isAr ? 'مكالمة صوتية' : 'Voice call'}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">{isAr ? 'صوتي' : 'Voice'}</span>
                  </button>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {activeContact ? (
                  isLoadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                      <span className="text-xs">{isAr ? 'جارِ تحميل الرسائل...' : 'Loading messages...'}</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-3xl max-w-md mx-auto">
                      <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                      <h4 className="text-sm font-bold text-slate-200">
                        {isAr ? 'بداية المحادثة المشفرة' : 'Secure Conversation Started'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {isAr
                          ? 'أرسل رسالتك الأولى لبدء التواصل الفعلي. الرسائل محفوظة في قاعدة بيانات Firestore.'
                          : 'Send your first message. Messages are stored in Firestore.'}
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

                            {/* Direct Attachment Rendering */}
                            {msg.attachment && (
                              <div className="mt-2.5 p-2.5 bg-black/40 rounded-xl border border-white/10 flex flex-col gap-2">
                                {msg.attachment.type.startsWith('image/') && msg.attachment.dataUrl && (
                                  <img
                                    src={msg.attachment.dataUrl}
                                    alt={msg.attachment.name}
                                    className="max-h-56 max-w-full rounded-lg object-contain bg-black/50"
                                  />
                                )}
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <Paperclip className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                                    <span className="truncate font-mono text-[11px]">{msg.attachment.name}</span>
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                      ({(msg.attachment.size / 1024).toFixed(1)} KB)
                                    </span>
                                  </div>
                                  {msg.attachment.dataUrl && (
                                    <a
                                      href={msg.attachment.dataUrl}
                                      download={msg.attachment.name}
                                      className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/40 text-[10px] font-bold shrink-0 cursor-pointer"
                                    >
                                      {isAr ? 'تنزيل' : 'Download'}
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {msg.callRoomUrl && (
                              <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold flex items-center gap-1 text-emerald-300">
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>{isAr ? 'رابط المكالمة' : 'Call Link'}</span>
                                </span>
                                <a
                                  href={msg.callRoomUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-white text-slate-950 font-bold rounded-lg text-[10px] hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{isAr ? 'انضمام' : 'Join'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  // Channel Messages
                  (channelMessages[activeChannelId || 'general'] || []).length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-3xl max-w-md mx-auto">
                      <Hash className="w-10 h-10 text-indigo-400 mx-auto mb-2 opacity-80" />
                      <h4 className="text-sm font-bold text-slate-200">
                        {isAr ? 'مساحة القناة المشتركة' : 'Channel Workspace'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {isAr ? 'شارك التحديثات مع فريق العمل.' : 'Share updates with the team.'}
                      </p>
                    </div>
                  ) : (
                    (channelMessages[activeChannelId || 'general'] || []).map((msg) => (
                      <div key={msg.id} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs sm:text-sm">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-white">{msg.senderName}</span>
                          <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-200 whitespace-pre-wrap">{msg.text}</p>
                        {msg.attachment && (
                          <div className="mt-2 p-2 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 truncate">
                              <Paperclip className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                              <span className="truncate font-mono">{msg.attachment.name}</span>
                            </div>
                            {msg.attachment.dataUrl && (
                              <a
                                href={msg.attachment.dataUrl}
                                download={msg.attachment.name}
                                className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 text-[10px] font-bold"
                              >
                                {isAr ? 'تنزيل' : 'Download'}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form with Attachment upload and preview */}
              <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 space-y-2">
                {pendingAttachment && (
                  <div className="flex items-center justify-between gap-2 bg-indigo-950/70 border border-indigo-500/40 px-3 py-1.5 rounded-xl text-xs text-indigo-200">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate font-mono">{pendingAttachment.name}</span>
                      <span className="text-[10px] text-slate-400">({(pendingAttachment.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingAttachment(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1 hover:bg-indigo-900/60 rounded text-slate-400 hover:text-white cursor-pointer"
                      title={isAr ? 'إلغاء المرفق' : 'Remove attachment'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition cursor-pointer border border-slate-700 shrink-0"
                    title={isAr ? 'إرفاق ملف (مباشر حتى 500 ك.ب)' : 'Attach file (up to 500KB)'}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Write message...'}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || (!messageInput.trim() && !pendingAttachment)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
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
            </main>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: المكالمات (CALLS)                                   */}
        {/* ======================================================== */}
        {mainTab === 'calls' && (
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            {/* Quick Calling Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {isAr ? 'بوابة المكالمات المباشرة المشفرة (SNNS.SITE & Daily.co)' : 'Direct Encrypted Calling Hub'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isAr ? 'اتصال فوري بصوت وصورة عالية الدقة لجميع أعضاء المنظومة' : 'Direct HD audio & video for all members'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const roomName = `snns-quick-${Date.now().toString().slice(-4)}`;
                      setActiveCallRoom(roomName);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>{isAr ? 'بدء مكالمة سريعة الآن' : 'Start Quick Call'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Call to Verified Contacts Grid */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-400 mb-3">
                  {isAr ? 'الاتصال السريع بجهات الاتصال المعتمدة:' : 'Quick Call Verified Contacts:'}
                </h4>

                {acceptedContacts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 bg-slate-950/60 rounded-2xl text-center border border-slate-800/80">
                    {isAr ? 'لم تتم إضافة جهات اتصال بعد. يمكنك إضافة زملاء من تبويب «جهات الاتصال».' : 'No contacts added yet.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {acceptedContacts.map((c) => {
                      const userDoc = discoverableUsers.find((u) => u.id === c.targetUserId);
                      const isOnline = userDoc ? connectService.isUserOnline(userDoc) : false;

                      return (
                        <div
                          key={c.id}
                          className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="relative">
                              <div className={`w-9 h-9 rounded-xl ${c.targetAvatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center`}>
                                {c.targetAvatarInitials || c.targetName.slice(0, 2)}
                              </div>
                              {isOnline && (
                                <span className="absolute -bottom-0.5 -end-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-xs text-white truncate block">{c.targetName}</span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block">{c.targetEmail}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleInitiateCall({ name: c.targetName, email: c.targetEmail }, 'video')}
                              className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl transition cursor-pointer"
                              title={isAr ? 'مكالمة مرئية' : 'Video call'}
                            >
                              <Video className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleInitiateCall({ name: c.targetName, email: c.targetEmail }, 'audio')}
                              className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition cursor-pointer"
                              title={isAr ? 'مكالمة صوتية' : 'Voice call'}
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Call Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{isAr ? 'سجل المكالمات الأخير' : 'Call Log'}</span>
                </h4>
                {callLog.length > 0 && (
                  <button
                    onClick={() => {
                      setCallLog([]);
                      localStorage.removeItem('snns_connect_call_log');
                    }}
                    className="text-[10px] text-slate-500 hover:text-rose-400"
                  >
                    {isAr ? 'مسح السجل' : 'Clear'}
                  </button>
                )}
              </div>

              {callLog.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  {isAr ? 'لا توجد مكالمات سابقة في السجل.' : 'No calls in log.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {callLog.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                          {item.type === 'video' ? (
                            <Video className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Phone className="w-4 h-4 text-sky-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{item.targetName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.targetEmail}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                        <button
                          onClick={() => setActiveCallRoom(item.roomName)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          {isAr ? 'إعادة الاتصال' : 'Call Back'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: جهات الاتصال (CONTACTS)                             */}
        {/* ======================================================== */}
        {mainTab === 'contacts' && (
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            {/* Sub-tabs Selection & Search */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setContactsSubTab('my_contacts')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      contactsSubTab === 'my_contacts'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{isAr ? 'جهات اتصالي' : 'My Contacts'}</span>
                    <span className="ms-1.5 text-[10px] opacity-80">({acceptedContacts.length})</span>
                  </button>

                  <button
                    onClick={() => setContactsSubTab('active_now')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      contactsSubTab === 'active_now'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isAr ? 'المتواجدون الآن' : 'Active Now'}</span>
                    <span className="text-[10px] opacity-80">({onlineUsers.length})</span>
                  </button>

                  <button
                    onClick={() => setContactsSubTab('requests')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      contactsSubTab === 'requests'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{isAr ? 'طلبات التواصل' : 'Requests'}</span>
                    {pendingIncomingRequests.length > 0 && (
                      <span className="ms-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                        {pendingIncomingRequests.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? 'بحث بالاسم أو بريد @snns.pro...' : 'Search users to add...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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

              {/* Search Results Display */}
              {searchQuery.trim() && (
                <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300">
                    {isAr ? 'نتائج البحث في دليل المستخدمين الفعلي:' : 'Users in Firestore Directory:'}
                  </div>

                  {searchResults.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      {isAr ? 'لم يتم العثور على مستخدمين بهذا الاسم.' : 'No users found.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchResults.map((user) => {
                        const rel = getContactStatus(user.id);
                        return (
                          <div
                            key={user.id}
                            className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-white truncate">{user.name}</h5>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                            </div>
                            {rel?.status === 'accepted' ? (
                              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                                {isAr ? 'جهة اتصال' : 'Contact'}
                              </span>
                            ) : rel?.status === 'pending_sent' ? (
                              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                                {isAr ? 'معلق' : 'Pending'}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAddContact(user)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>{isAr ? 'إضافة' : 'Add'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab Content */}
              <div className="mt-5">
                {contactsSubTab === 'my_contacts' && (
                  acceptedContacts.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl">
                      <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-300">
                        {isAr ? 'لا توجد جهات اتصال مضافة' : 'No contacts yet'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {isAr ? 'ابحث في شريط البحث أعلاه لإضافة زملاء العمل.' : 'Search above to add teammates.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {acceptedContacts.map((contact) => {
                        const userDoc = discoverableUsers.find((u) => u.id === contact.targetUserId);
                        const isOnline = userDoc ? connectService.isUserOnline(userDoc) : false;

                        return (
                          <div
                            key={contact.id}
                            className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="relative">
                                <div className={`w-9 h-9 rounded-xl ${contact.targetAvatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center`}>
                                  {contact.targetAvatarInitials || contact.targetName.slice(0, 2)}
                                </div>
                                {isOnline && (
                                  <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-xs text-white truncate">{contact.targetName}</h5>
                                <p className="text-[10px] text-slate-400 font-mono truncate">{contact.targetEmail}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveContact(contact);
                                  setMainTab('chats');
                                }}
                                className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition cursor-pointer"
                                title={isAr ? 'محادثة' : 'Chat'}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleInitiateCall({ name: contact.targetName, email: contact.targetEmail }, 'video')}
                                className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl transition cursor-pointer"
                                title={isAr ? 'اتصال مرئي' : 'Call'}
                              >
                                <Video className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveContact(contact)}
                                className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition cursor-pointer"
                                title={isAr ? 'حذف' : 'Remove'}
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {contactsSubTab === 'active_now' && (
                  onlineUsers.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl">
                      <Activity className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-300">
                        {isAr ? 'لا يوجد مستخدمون متواجدون الآن' : 'No users currently active'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {isAr
                          ? 'يتم عرض المتواجدين فقط عند وجود نبضات اتصال موثوقة خلال آخر 3 دقائق على الخادم.'
                          : 'Users only appear here with verified server heartbeat within 3 minutes.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {onlineUsers.map((user) => (
                        <div
                          key={user.id}
                          className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3 shadow"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="relative">
                              <div className={`w-9 h-9 rounded-xl ${user.avatarColor || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center`}>
                                {user.avatarInitials}
                              </div>
                              <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-white truncate">{user.name}</h5>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setActiveContact(user);
                                setMainTab('chats');
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{isAr ? 'محادثة' : 'Chat'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {contactsSubTab === 'requests' && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-bold text-xs text-amber-400 mb-2">
                        {isAr ? 'الطلبات الواردة إليك:' : 'Incoming Requests:'}
                      </h5>

                      {pendingIncomingRequests.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 bg-slate-950 rounded-xl text-center border border-slate-800">
                          {isAr ? 'لا توجد طلبات واردة معلقة.' : 'No incoming requests.'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {pendingIncomingRequests.map((req) => (
                            <div
                              key={req.id}
                              className="p-3 bg-slate-950 rounded-2xl border border-amber-500/40 flex items-center justify-between gap-3"
                            >
                              <div>
                                <h6 className="font-bold text-xs text-white">{req.targetName}</h6>
                                <p className="text-[10px] text-slate-400 font-mono">{req.targetEmail}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAcceptRequest(req)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                  {isAr ? 'قبول' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(req)}
                                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                  {isAr ? 'رفض' : 'Reject'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: الاجتماعات (MEETINGS)                               */}
        {/* ======================================================== */}
        {mainTab === 'meetings' && (
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            {/* Instant Meeting Room Creator */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {isAr ? 'غرف الاجتماعات المرئية عبر SNNS.SITE' : 'Video Meeting Rooms via SNNS.SITE'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isAr ? 'أنشئ غرفة فورية وشارك الرابط المشفر مع الحضور' : 'Create an instant room and share link'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={instantRoomName}
                    onChange={(e) => setInstantRoomName(e.target.value)}
                    placeholder={isAr ? 'اسم الغرفة (اختياري)...' : 'Room name (optional)...'}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleCreateInstantMeeting}
                    disabled={isCreatingRoom}
                    className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isCreatingRoom ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{isAr ? 'إنشاء الغرفة' : 'Create'}</span>
                  </button>
                </div>
              </div>

              {/* Created Room Share Box */}
              {createdRoomInfo && (
                <div className="mt-4 p-4 bg-sky-950/30 rounded-2xl border border-sky-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-300">
                      {isAr ? 'تم إنشاء الغرفة بنجاح! شارك الرابط للانضمام:' : 'Meeting Room Ready:'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{createdRoomInfo.roomName}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdRoomInfo.snnsSiteUrl}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 select-all"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => copyToClipboard(createdRoomInfo.snnsSiteUrl)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy')}</span>
                      </button>

                      <button
                        onClick={() => setActiveCallRoom(createdRoomInfo.roomName)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{isAr ? 'دخول الغرفة داخلياً' : 'Join In-App'}</span>
                      </button>

                      <a
                        href={createdRoomInfo.snnsSiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? 'فتح في SNNS.SITE' : 'Open Site'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Hardware Preview Test (Camera & Microphone) */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 mb-3">
                  {isAr ? 'معاينة وفحص الكاميرا والميكروفون قبل الدخول:' : 'Hardware Preview:'}
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full max-w-sm h-48 bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center shadow-inner">
                    {!videoOff ? (
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-500 text-xs">
                        <VideoOff className="w-8 h-8" />
                        <span>{isAr ? 'الكاميرا متوقفة' : 'Camera off'}</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 start-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold">
                      {currentUser.name}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setMicMuted(!micMuted)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                        micMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                      <span>{micMuted ? (isAr ? 'الميكروفون مكتوم' : 'Muted') : (isAr ? 'الميكروفون يعمل' : 'Mic Active')}</span>
                    </button>

                    <button
                      onClick={() => setVideoOff(!videoOff)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                        videoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {videoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-sky-400" />}
                      <span>{videoOff ? (isAr ? 'الكاميرا معطلة' : 'Video Off') : (isAr ? 'الكاميرا تعمل' : 'Video On')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Incoming Call Notification Modal with Real-time Signaling */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center shadow-lg font-black">
                {incomingCall.type === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {isAr ? 'مكالمة واردة الآن' : 'Incoming Call'}
              </span>
              <h4 className="text-base font-black text-white mt-2">{incomingCall.callerName}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{incomingCall.callerEmail}</p>
              <div className="mt-3 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {incomingCall.type === 'video'
                    ? (isAr ? 'دعوة لمكالمة مرئية مشفرة عبر SNNS.SITE' : 'Encrypted Video Call')
                    : (isAr ? 'دعوة لمكالمة صوتية مشفرة' : 'Encrypted Voice Call')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  const room = incomingCall.roomName;
                  setIncomingCall(null);
                  setActiveCallRoom(room);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isAr ? 'رد على المكالمة' : 'Answer'}</span>
              </button>

              <button
                onClick={() => setIncomingCall(null)}
                className="flex-1 py-2.5 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500/30"
              >
                <PhoneOff className="w-4 h-4" />
                <span>{isAr ? 'رفض' : 'Decline'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outgoing Dialing / Ringing Notification Modal */}
      {dialingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center shadow-lg font-black">
                {dialingModal.type === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
              </div>
            </div>

            <div>
              <h4 className="text-base font-black text-white">{dialingModal.targetName}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{dialingModal.targetEmail}</p>
              <div className="mt-3 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {dialingModal.state === 'connecting'
                    ? (isAr ? 'جارِ تهيئة الاتصال...' : 'Connecting...')
                    : dialingModal.state === 'ringing'
                    ? (isAr ? 'رنين عبر شبكة SNNS...' : 'Ringing...')
                    : (isAr ? 'الغرفة المشفرة جاهزة للانضمام' : 'Room Ready')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  const room = dialingModal.roomName;
                  setDialingModal(null);
                  setActiveCallRoom(room);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Video className="w-4 h-4" />
                <span>{isAr ? 'دخول الغرفة (SNNS Daily)' : 'Join Call'}</span>
              </button>

              <a
                href={dialingModal.snnsSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDialingModal(null)}
                className="w-full py-2 bg-sky-600/30 hover:bg-sky-600 text-sky-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-sky-500/30"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isAr ? 'فتح على https://snns.site' : 'Open in SNNS.SITE'}</span>
              </a>

              <button
                onClick={() => setDialingModal(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsApp;
