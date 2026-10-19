import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { UserProfile } from '../types/suite';
import { storage } from './storage';

export interface ConnectUser {
  id: string; // Firebase UID or unique user identifier
  name: string;
  email: string;
  snnsHandle: string;
  roleAr: string;
  departmentAr?: string;
  avatarInitials: string;
  avatarColor: string;
  isOnline: boolean;
  lastActive: string; // ISO string
  allowDiscovery: boolean;
}

export type ContactStatus = 'pending_sent' | 'pending_received' | 'accepted' | 'blocked';

export interface ConnectContact {
  id: string; // Target user's ID
  targetUserId: string;
  targetName: string;
  targetEmail: string;
  targetHandle: string;
  targetAvatarColor?: string;
  targetAvatarInitials?: string;
  status: ContactStatus;
  updatedAt: string;
}

export interface ConnectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  callRoomUrl?: string; // Optional call link (SNNS.SITE)
}

export interface ConnectConversation {
  id: string;
  participantIds: string[];
  participantDetails: Record<string, {
    name: string;
    email: string;
    avatarColor?: string;
    avatarInitials?: string;
  }>;
  lastMessage?: string;
  lastMessageAt?: string;
  updatedAt: string;
}

class ConnectService {
  private heartbeatInterval: any = null;
  private currentUid: string | null = null;

  /**
   * Ensure user is authenticated in Firebase Auth
   */
  async ensureFirebaseAuth(): Promise<string> {
    if (auth.currentUser) {
      this.currentUid = auth.currentUser.uid;
      return auth.currentUser.uid;
    }

    try {
      const cred = await signInAnonymously(auth);
      this.currentUid = cred.user.uid;
      return cred.user.uid;
    } catch (err) {
      console.warn('Firebase Auth anonymous sign-in error:', err);
      // Fallback to storage profile user id
      const profile = storage.getUserProfile();
      this.currentUid = profile.id || 'user-default';
      return this.currentUid;
    }
  }

  getCurrentUid(): string {
    return this.currentUid || auth.currentUser?.uid || storage.getUserProfile().id || 'user-default';
  }

  /**
   * Determine if a user is actively online based on verified recent activity
   * Rule: isOnline === true AND lastActive within the last 3 minutes
   */
  isUserOnline(user: ConnectUser): boolean {
    if (!user.isOnline || !user.lastActive) return false;
    const diffMs = Date.now() - new Date(user.lastActive).getTime();
    return diffMs >= 0 && diffMs <= 3 * 60 * 1000; // 3 minutes window
  }

  /**
   * Register or update user presence and profile in Firestore
   */
  async syncUserPresence(profile: UserProfile): Promise<void> {
    const uid = await this.ensureFirebaseAuth();
    const email = profile.email || 'user@snns.pro';
    const snnsHandle = profile.username || email.split('@')[0];

    const userDocRef = doc(db, 'users', uid);
    const userData: ConnectUser = {
      id: uid,
      name: profile.name || 'مستخدم المنظومة',
      email,
      snnsHandle,
      roleAr: profile.roleAr || 'عضو معتمد',
      departmentAr: profile.departmentAr || 'مساحة العمل السحابية',
      avatarInitials: profile.avatarInitials || (profile.name.slice(0, 2).toUpperCase()),
      avatarColor: profile.avatarColor || 'bg-blue-600',
      isOnline: true,
      lastActive: new Date().toISOString(),
      allowDiscovery: true,
    };

    try {
      await setDoc(userDocRef, userData, { merge: true });
    } catch (err) {
      console.warn('Could not sync user presence to Firestore:', err);
    }

    // Start periodic heartbeat every 45s
    this.startHeartbeat(uid);
  }

  /**
   * Periodic activity heartbeat
   */
  private startHeartbeat(uid: string) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      try {
        if (!auth.currentUser) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
          isOnline: true,
          lastActive: new Date().toISOString(),
        });
      } catch {}
    }, 45000);

    // Set offline on tab unload
    if (typeof window !== 'undefined') {
      const handleUnload = () => {
        try {
          if (auth.currentUser) {
            const userDocRef = doc(db, 'users', uid);
            updateDoc(userDocRef, { isOnline: false });
          }
        } catch {}
      };
      window.addEventListener('beforeunload', handleUnload);
    }
  }

  /**
   * Manually set user as offline (e.g. on sign out)
   */
  async setOffline(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    const uid = this.getCurrentUid();
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        isOnline: false,
        lastActive: new Date().toISOString(),
      });
    } catch {}
  }

  /**
   * Subscribe to all discoverable users in Firestore
   */
  subscribeDiscoverableUsers(callback: (users: ConnectUser[]) => void): Unsubscribe {
    const usersCol = collection(db, 'users');
    return onSnapshot(
      usersCol,
      (snapshot) => {
        const users: ConnectUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ConnectUser;
          if (data && data.allowDiscovery !== false) {
            users.push({
              ...data,
              id: docSnap.id,
            });
          }
        });
        callback(users);
      },
      (error) => {
        console.warn('Error fetching discoverable users:', error);
        callback([]);
      }
    );
  }

  /**
   * Subscribe to current user's contacts
   */
  subscribeContacts(userId: string, callback: (contacts: ConnectContact[]) => void): Unsubscribe {
    const contactsCol = collection(db, 'users', userId, 'contacts');
    return onSnapshot(
      contactsCol,
      (snapshot) => {
        const contacts: ConnectContact[] = [];
        snapshot.forEach((docSnap) => {
          contacts.push(docSnap.data() as ConnectContact);
        });
        callback(contacts);
      },
      (error) => {
        console.warn('Error fetching user contacts:', error);
        callback([]);
      }
    );
  }

  /**
   * Send a contact request
   * Prevents adding self and duplicate requests
   */
  async sendContactRequest(
    currentUser: { id: string; name: string; email: string; handle?: string; avatarColor?: string; avatarInitials?: string },
    targetUser: ConnectUser
  ): Promise<{ success: boolean; message: string }> {
    if (currentUser.id === targetUser.id || currentUser.email.toLowerCase() === targetUser.email.toLowerCase()) {
      throw new Error('لا يمكن إضافة حسابك الشخصي كجهة اتصال.');
    }

    // Check existing relation
    const myContactRef = doc(db, 'users', currentUser.id, 'contacts', targetUser.id);
    const existingSnap = await getDoc(myContactRef);

    if (existingSnap.exists()) {
      const existing = existingSnap.data() as ConnectContact;
      if (existing.status === 'accepted') {
        throw new Error('هذا المستخدم مسجل بالفعل في قائمة جهات اتصالك.');
      }
      if (existing.status === 'pending_sent') {
        throw new Error('تم إرسال طلب تواصل مسبقاً، بانتظار موافقة الطرف الآخر.');
      }
      if (existing.status === 'blocked') {
        throw new Error('هذا الحساب محظور حالياً. يرجى إلغاء الحظر أولاً.');
      }
    }

    const now = new Date().toISOString();

    // 1. In current user's contacts: status = pending_sent
    await setDoc(myContactRef, {
      id: targetUser.id,
      targetUserId: targetUser.id,
      targetName: targetUser.name,
      targetEmail: targetUser.email,
      targetHandle: targetUser.snnsHandle,
      targetAvatarColor: targetUser.avatarColor,
      targetAvatarInitials: targetUser.avatarInitials,
      status: 'pending_sent',
      updatedAt: now,
    });

    // 2. In target user's contacts: status = pending_received
    const theirContactRef = doc(db, 'users', targetUser.id, 'contacts', currentUser.id);
    await setDoc(theirContactRef, {
      id: currentUser.id,
      targetUserId: currentUser.id,
      targetName: currentUser.name,
      targetEmail: currentUser.email,
      targetHandle: currentUser.handle || currentUser.email.split('@')[0],
      targetAvatarColor: currentUser.avatarColor || 'bg-blue-600',
      targetAvatarInitials: currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase(),
      status: 'pending_received',
      updatedAt: now,
    });

    return { success: true, message: `تم إرسال طلب التواصل إلى ${targetUser.name} بنجاح.` };
  }

  /**
   * Accept an incoming contact request
   */
  async acceptContactRequest(currentUserId: string, targetUserId: string): Promise<void> {
    const now = new Date().toISOString();
    const myRef = doc(db, 'users', currentUserId, 'contacts', targetUserId);
    const theirRef = doc(db, 'users', targetUserId, 'contacts', currentUserId);

    await updateDoc(myRef, { status: 'accepted', updatedAt: now });
    try {
      await updateDoc(theirRef, { status: 'accepted', updatedAt: now });
    } catch {}
  }

  /**
   * Reject an incoming contact request
   */
  async rejectContactRequest(currentUserId: string, targetUserId: string): Promise<void> {
    const myRef = doc(db, 'users', currentUserId, 'contacts', targetUserId);
    const theirRef = doc(db, 'users', targetUserId, 'contacts', currentUserId);

    await deleteDoc(myRef);
    try {
      await deleteDoc(theirRef);
    } catch {}
  }

  /**
   * Remove a contact
   */
  async removeContact(currentUserId: string, targetUserId: string): Promise<void> {
    const myRef = doc(db, 'users', currentUserId, 'contacts', targetUserId);
    await deleteDoc(myRef);
  }

  /**
   * Block a user
   */
  async blockContact(currentUserId: string, targetUserId: string): Promise<void> {
    const now = new Date().toISOString();
    const myRef = doc(db, 'users', currentUserId, 'contacts', targetUserId);
    await setDoc(myRef, { status: 'blocked', updatedAt: now }, { merge: true });
  }

  /**
   * Unblock a user
   */
  async unblockContact(currentUserId: string, targetUserId: string): Promise<void> {
    const myRef = doc(db, 'users', currentUserId, 'contacts', targetUserId);
    await deleteDoc(myRef);
  }

  /**
   * Deterministic 1-on-1 conversation ID
   */
  getConversationId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  /**
   * Get or create a 1-on-1 conversation doc
   */
  async getOrCreateConversation(
    currentUser: { id: string; name: string; email: string; avatarColor?: string; avatarInitials?: string },
    targetUser: { id: string; name: string; email: string; avatarColor?: string; avatarInitials?: string }
  ): Promise<ConnectConversation> {
    const convId = this.getConversationId(currentUser.id, targetUser.id);
    const convRef = doc(db, 'conversations', convId);

    const snap = await getDoc(convRef);
    if (snap.exists()) {
      return snap.data() as ConnectConversation;
    }

    const newConv: ConnectConversation = {
      id: convId,
      participantIds: [currentUser.id, targetUser.id],
      participantDetails: {
        [currentUser.id]: {
          name: currentUser.name,
          email: currentUser.email,
          avatarColor: currentUser.avatarColor,
          avatarInitials: currentUser.avatarInitials,
        },
        [targetUser.id]: {
          name: targetUser.name,
          email: targetUser.email,
          avatarColor: targetUser.avatarColor,
          avatarInitials: targetUser.avatarInitials,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    await setDoc(convRef, newConv);
    return newConv;
  }

  /**
   * Subscribe to messages in a conversation
   */
  subscribeMessages(conversationId: string, callback: (messages: ConnectMessage[]) => void): Unsubscribe {
    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'asc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: ConnectMessage[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as ConnectMessage);
        });
        callback(msgs);
      },
      (err) => {
        console.warn('Error subscribing to conversation messages:', err);
        callback([]);
      }
    );
  }

  /**
   * Send a direct message
   */
  async sendMessage(
    conversationId: string,
    sender: { id: string; name: string },
    text: string,
    callRoomUrl?: string
  ): Promise<ConnectMessage> {
    if (!text.trim() && !callRoomUrl) {
      throw new Error('لا يمكن إرسال رسالة فارغة.');
    }

    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const msgRef = doc(messagesCol, msgId);

    const now = new Date().toISOString();
    const newMsg: ConnectMessage = {
      id: msgId,
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      text: text.trim(),
      timestamp: now,
      status: 'sent',
      callRoomUrl,
    };

    // 1. Write message to Firestore subcollection
    await setDoc(msgRef, newMsg);

    // 2. Update conversation summary
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      lastMessage: text.trim() || 'دعوة مكالمة SNNS',
      lastMessageAt: now,
      updatedAt: now,
    });

    return newMsg;
  }
}

export const connectService = new ConnectService();
