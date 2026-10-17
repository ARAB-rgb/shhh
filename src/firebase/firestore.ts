import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider: any) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface IndexedSite {
  id: string;
  url: string;
  title: string;
  description: string;
  category: 'tech' | 'news' | 'tools' | 'education' | 'media' | 'general' | string;
  tags?: string;
  favicon?: string;
  clicks?: number;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchQueryItem {
  id: string;
  query: string;
  count: number;
  lastSearchedAt?: string;
}

// Initial starter seed sites for instant cloud database richness
const SEED_SITES: IndexedSite[] = [
  {
    id: 'site-wikipedia-ar',
    url: 'https://ar.wikipedia.org',
    title: 'ويكيبيديا: الموسوعة الحرة',
    description: 'مشروع موسوعة عالمية مجانية متعددة اللغات يشارك فيها الملايين بمعلومات موثوقة في جميع مجالات المعرفة الإنسانية.',
    category: 'education',
    tags: 'موسوعة, معلومات, ثقافة, أبحاث, معرفة, تاريخ',
    favicon: 'https://www.google.com/s2/favicons?domain=ar.wikipedia.org&sz=128',
    clicks: 1420,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-github',
    url: 'https://github.com',
    title: 'GitHub: Let’s build from here',
    description: 'أكبر منصة عالمية لاستضافة الشيفرات المصدرية، البرمجيات مفتوحة المصدر، وتطوير المشاريع البرمجية بالتعاون.',
    category: 'tech',
    tags: 'برمجة, كود, مفتوح المصدر, مطورين, git, مشاريع',
    favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
    clicks: 2980,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-aljazeera',
    url: 'https://www.aljazeera.net',
    title: 'الجزيرة نت: آخر الأخبار والتحليلات',
    description: 'تغطية إخبارية شاملة للأحداث في العالم والشرق الأوسط، مقالات رأي، تحليلات سياسية واقتصادية متعمقة.',
    category: 'news',
    tags: 'أخبار, عاجل, الشرق الأوسط, سياسة, اقتصاد, بث مباشر',
    favicon: 'https://www.google.com/s2/favicons?domain=aljazeera.net&sz=128',
    clicks: 1850,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-stackoverflow',
    url: 'https://stackoverflow.com',
    title: 'Stack Overflow: Where Developers Learn & Share',
    description: 'المجتمع الأكبر عالمياً للمبرمجين لحل المشاكل التقنية والأسئلة البرمجية في شتى لغات البرمجة.',
    category: 'tech',
    tags: 'برمجة, حلول, كود, أخطاء برمجية, أسئلة, javascript, python',
    favicon: 'https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=128',
    clicks: 3410,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-nature',
    url: 'https://www.nature.com',
    title: 'Nature: International journal of science',
    description: 'المجلة العلمية المرموقة عالمياً لنشر أحدث الأبحاث والاكتشافات العلمية الرائدة في الطب والفيزياء والأحياء.',
    category: 'education',
    tags: 'علوم, أبحاث, طب, فيزياء, دراسات, مجلات علمية',
    favicon: 'https://www.google.com/s2/favicons?domain=nature.com&sz=128',
    clicks: 890,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-huggingface',
    url: 'https://huggingface.co',
    title: 'Hugging Face: The AI community building the future',
    description: 'المنصة الرائدة في نشر وتجربة نماذج الذكاء الاصطناعي، التعلم العميق، ومعالجة اللغات الطبيعية (LLMs).',
    category: 'tech',
    tags: 'ذكاء اصطناعي, AI, نماذج, machine learning, deep learning',
    favicon: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
    clicks: 2130,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-arxiv',
    url: 'https://arxiv.org',
    title: 'arXiv.org e-Print archive',
    description: 'أرشيف عالمي للأوراق البحثية مفتوحة الوصول في الرياضيات، علوم الحاسوب، الفيزياء، والذكاء الاصطناعي.',
    category: 'education',
    tags: 'أوراق بحثية, علمية, جامعة, دراسات, arxiv, أكاديمي',
    favicon: 'https://www.google.com/s2/favicons?domain=arxiv.org&sz=128',
    clicks: 760,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-techwd',
    url: 'https://www.tech-wd.com',
    title: 'عالم التقنية: أخبار التكنولوجيا والأجهزة',
    description: 'موقع عربي متخصص في تغطية أخبار التقنية، الهواتف الذكية، تطبيقات الويب، وريادة الأعمال الرقمية.',
    category: 'news',
    tags: 'تقنية, هواتف, أجهزة, أخبار تقنية, تطبيقات',
    favicon: 'https://www.google.com/s2/favicons?domain=tech-wd.com&sz=128',
    clicks: 1120,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Seeds initial verified websites if the database collection is empty
 */
export async function seedSitesIfEmpty(): Promise<void> {
  const path = 'sites';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      console.log('Seeding initial sites into SNNS.PRO cloud database...');
      for (const site of SEED_SITES) {
        await setDoc(doc(db, path, site.id), site);
      }
    }
  } catch (err) {
    console.warn('Could not seed initial sites, will use client fallback if needed:', err);
  }
}

/**
 * Subscribe to all indexed sites in Firestore
 */
export function subscribeToIndexedSites(
  onData: (sites: IndexedSite[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'sites';
  const q = query(collection(db, path), orderBy('clicks', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot: any) => {
      const sites: IndexedSite[] = [];
      snapshot.forEach((docSnap: any) => {
        sites.push(docSnap.data() as IndexedSite);
      });
      // If collection is empty, fall back to seed list immediately so the UI is never empty
      if (sites.length === 0) {
        onData(SEED_SITES);
      } else {
        onData(sites);
      }
    },
    (error: any) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

/**
 * Add a new site to the SNNS.PRO Cloud Index
 */
export async function addSiteToIndex(site: Omit<IndexedSite, 'id' | 'createdAt' | 'updatedAt' | 'clicks' | 'isVerified'>): Promise<IndexedSite> {
  const path = 'sites';
  // Generate safe ID
  const cleanDomain = site.url.replace(/^https?:\/\//i, '').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 40);
  const siteId = `site-${cleanDomain}-${Date.now().toString(36)}`;

  const now = new Date().toISOString();
  const newSite: IndexedSite = {
    id: siteId,
    url: site.url,
    title: site.title.slice(0, 200),
    description: (site.description || '').slice(0, 1000),
    category: site.category || 'general',
    tags: (site.tags || '').slice(0, 300),
    favicon: site.favicon || `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=128`,
    clicks: 1,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, path, siteId), newSite);
    return newSite;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${siteId}`);
    throw error;
  }
}

/**
 * Update an existing site in the Cloud Index (CMS)
 */
export async function updateSiteInIndex(
  siteId: string,
  updates: Partial<Omit<IndexedSite, 'id' | 'createdAt'>>
): Promise<void> {
  const path = `sites/${siteId}`;
  const cleanedUpdates: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.url !== undefined) cleanedUpdates.url = updates.url;
  if (updates.title !== undefined) cleanedUpdates.title = updates.title.slice(0, 200);
  if (updates.description !== undefined) cleanedUpdates.description = updates.description.slice(0, 1000);
  if (updates.category !== undefined) cleanedUpdates.category = updates.category.slice(0, 50);
  if (updates.tags !== undefined) cleanedUpdates.tags = updates.tags.slice(0, 300);
  if (updates.favicon !== undefined) cleanedUpdates.favicon = updates.favicon.slice(0, 500);
  if (updates.clicks !== undefined) cleanedUpdates.clicks = updates.clicks;
  if (updates.isVerified !== undefined) cleanedUpdates.isVerified = updates.isVerified;

  try {
    await updateDoc(doc(db, 'sites', siteId), cleanedUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Delete a site from the Cloud Index (CMS)
 */
export async function deleteSiteFromIndex(siteId: string): Promise<void> {
  const path = `sites/${siteId}`;
  try {
    await deleteDoc(doc(db, 'sites', siteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Increment click count on a site to boost quality ranking
 */
export async function incrementSiteClick(siteId: string): Promise<void> {
  const path = `sites/${siteId}`;
  try {
    await updateDoc(doc(db, 'sites', siteId), {
      clicks: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Could not increment click count:', error);
  }
}

/**
 * Log or update search query count for trending suggestions
 */
export async function logSearchQuery(queryText: string): Promise<void> {
  const trimmed = queryText.trim().toLowerCase();
  if (!trimmed || trimmed.length > 100) return;

  const queryId = `q-${encodeURIComponent(trimmed).slice(0, 60)}`;
  const path = `queries/${queryId}`;
  const now = new Date().toISOString();

  try {
    await setDoc(
      doc(db, 'queries', queryId),
      {
        id: queryId,
        query: queryText.trim(),
        count: increment(1),
        lastSearchedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    // Non-critical background query logger
    console.warn('Query log skipped:', error);
  }
}

/**
 * Subscribe to trending search queries
 */
export function subscribeToTrendingQueries(onData: (queries: string[]) => void): Unsubscribe {
  const path = 'queries';
  const q = query(collection(db, path), orderBy('count', 'desc'), limit(10));

  return onSnapshot(
    q,
    (snapshot: any) => {
      const terms: string[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data() as SearchQueryItem;
        if (data.query) terms.push(data.query);
      });
      onData(terms);
    },
    (error: any) => {
      console.warn('Trending queries listener error:', error);
    }
  );
}
