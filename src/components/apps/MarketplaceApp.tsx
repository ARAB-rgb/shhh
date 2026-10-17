import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Heart,
  Share2,
  MapPin,
  Tag,
  ShieldCheck,
  Clock,
  Phone,
  MessageCircle,
  Eye,
  SlidersHorizontal,
  X,
  Check,
  Store,
  Layers,
  ChevronDown,
  Sparkles,
  Info,
  Car,
  Home,
  Smartphone,
  Briefcase,
  Tv,
  Armchair,
  ShoppingBag,
} from 'lucide-react';
import { MarketplaceIcon } from '../icons/AppIcons';
import { MarketplaceListing } from '../../types/suite';

interface MarketplaceAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
  onOpenConnectChat?: (sellerName: string) => void;
}

const CATEGORIES = [
  { id: 'all', nameAr: 'جميع الأقسام', nameEn: 'All Categories', icon: Layers },
  { id: 'cars', nameAr: 'حراج السيارات', nameEn: 'Cars & Motors', icon: Car },
  { id: 'real-estate', nameAr: 'عقارات وأراضي', nameEn: 'Real Estate', icon: Home },
  { id: 'electronics', nameAr: 'أجهزة وإلكترونيات', nameEn: 'Electronics', icon: Smartphone },
  { id: 'services', nameAr: 'خدمات وأعمال', nameEn: 'Services & Business', icon: Briefcase },
  { id: 'furniture', nameAr: 'أثاث ومفروشات', nameEn: 'Furniture', icon: Armchair },
  { id: 'jobs', nameAr: 'وظائف ومواهب', nameEn: 'Jobs & Freelance', icon: Tv },
  { id: 'other', nameAr: 'أقسام أخرى', nameEn: 'Other Goods', icon: ShoppingBag },
];

const CITIES = [
  { id: 'all', nameAr: 'كل المدن', nameEn: 'All Cities' },
  { id: 'riyadh', nameAr: 'الرياض', nameEn: 'Riyadh' },
  { id: 'jeddah', nameAr: 'جدة', nameEn: 'Jeddah' },
  { id: 'dammam', nameAr: 'الدمام والشرقية', nameEn: 'Dammam' },
  { id: 'makkah', nameAr: 'مكة المكرمة', nameEn: 'Makkah' },
  { id: 'madinah', nameAr: 'المدينة المنورة', nameEn: 'Madinah' },
  { id: 'dubai', nameAr: 'دبي', nameEn: 'Dubai' },
];

const INITIAL_LISTINGS: MarketplaceListing[] = [
  {
    id: 'm-1',
    title: 'تويوتا لاندكروزر VXR 2024 فل كامل بحالة الوكالة',
    titleEn: 'Toyota Land Cruiser VXR 2024 Full Option Mint',
    category: 'cars',
    categoryAr: 'حراج السيارات',
    categoryEn: 'Cars & Motors',
    price: 365000,
    currency: 'SAR',
    location: 'الرياض - حي النرجس',
    locationEn: 'Riyadh - Al Narjis',
    image: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80',
    description: 'سيارة تويوتا لاندكروزر موديل 2024 VXR ممشى 12,000 كم فقط. تشييكات وكالة، خالية من الصدمات والرش، كامل المواصفات مع حماية نانو سيراميك وتظليل حراري أصلي.',
    sellerName: 'مكتب الصفوة للسيارات',
    sellerPhone: '+966501234567',
    sellerVerified: true,
    postedAt: 'قبل 30 دقيقة',
    views: 342,
    isSaved: false,
    isMine: false,
  },
  {
    id: 'm-2',
    title: 'فيلا مودرن للبيع 450م تصميم معماري فاخر مع مسبح',
    titleEn: 'Modern Luxury Villa 450m with Private Pool',
    category: 'real-estate',
    categoryAr: 'عقارات وأراضي',
    categoryEn: 'Real Estate',
    price: 3850000,
    currency: 'SAR',
    location: 'جدة - أبحر الشمالية',
    locationEn: 'Jeddah - Obhur',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    description: 'فيلا مستقلة راقية تشطيب سوبر ديلوكس، 5 أجنحة نوم ماستر، مصعد إيطالي، مسبح خاص وحديقة خلفية، غرفة خادمة وسائق، تكييف مركزي دكت وضمانات 15 سنة.',
    sellerName: 'شركة إعمار نجد العقارية',
    sellerPhone: '+966559876543',
    sellerVerified: true,
    postedAt: 'قبل ساعتين',
    views: 890,
    isSaved: true,
    isMine: false,
  },
  {
    id: 'm-3',
    title: 'ماك بوك برو M3 Max شاشة 16 بوصة رام 64GB مساحة 1TB',
    titleEn: 'MacBook Pro 16" M3 Max 64GB RAM 1TB SSD',
    category: 'electronics',
    categoryAr: 'أجهزة وإلكترونيات',
    categoryEn: 'Electronics',
    price: 13900,
    currency: 'SAR',
    location: 'الدمام - الشاطئ',
    locationEn: 'Dammam - Al Shati',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    description: 'جهاز Apple MacBook Pro M3 Max الفئة العليا، استخدام مكتبي بسيط جداً أقل من شهر، دورات البطارية 9 دورات، مع الكرتون وكامل الملحقات الأصلية وضمان أبل ساري سنتين.',
    sellerName: 'المهندس طارق',
    sellerPhone: '+966567112233',
    sellerVerified: true,
    postedAt: 'قبل 4 ساعات',
    views: 415,
    isSaved: false,
    isMine: false,
  },
  {
    id: 'm-4',
    title: 'خدمات سحابية وتطوير منظومات ذكاء اصطناعي للشركات',
    titleEn: 'Enterprise Cloud & AI Solutions Architecture',
    category: 'services',
    categoryAr: 'خدمات وأعمال',
    categoryEn: 'Services & Business',
    price: 15000,
    currency: 'SAR',
    location: 'الرياض - واحة التقنية',
    locationEn: 'Riyadh - Tech Oasis',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    description: 'بناء وتجهيز البنى التحتية السحابية لمنظومات SNNS PRO و SNNS SITE، وربط أنظمة الـ ERP مع بوابات الدفع والمصادقة البيومترية المشفرة.',
    sellerName: 'فريق تقنية SNNS الحلول',
    sellerPhone: '+966540001122',
    sellerVerified: true,
    postedAt: 'اليوم',
    views: 620,
    isSaved: false,
    isMine: true,
  },
  {
    id: 'm-5',
    title: 'طقم كنب إيطالي فاخر 8 أشخاص مع طاولة رخام كلكتا',
    titleEn: 'Italian Luxury Sofa Set 8 Seats with Marble Table',
    category: 'furniture',
    categoryAr: 'أثاث ومفروشات',
    categoryEn: 'Furniture',
    price: 8400,
    currency: 'SAR',
    location: 'الرياض - حي حطين',
    locationEn: 'Riyadh - Hittin',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    description: 'طقم كنب إيطالي أصلي تفصيل خاص قماش مقاوم للاتساخ، خشب زان متين، طاولة وسطية رخام كلكتا طبيعي، بحالة ممتازة كالجديد بدون أي خدش.',
    sellerName: 'معرض الأناقة للأثاث',
    sellerPhone: '+966533344455',
    sellerVerified: false,
    postedAt: 'قبل يوم',
    views: 290,
    isSaved: false,
    isMine: false,
  },
  {
    id: 'm-6',
    title: 'مطلوب مطور واجهات أمامية Fullstack لمنظومة برمجية',
    titleEn: 'Senior Frontend & Fullstack Engineer Needed',
    category: 'jobs',
    categoryAr: 'وظائف ومواهب',
    categoryEn: 'Jobs & Freelance',
    price: 18000,
    currency: 'SAR',
    location: 'عن بُعد / الرياض',
    locationEn: 'Remote / Riyadh',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    description: 'فرصة عمل للانضمام إلى فريق تطوير منصات وتطبيقات SNNS. متطلبات: إتقان React, TypeScript, Tailwind, وخبرة بأنظمة الحسابات والمصادقة والتكاملات.',
    sellerName: 'مكتب التوظيف التقني',
    sellerPhone: '+966509988776',
    sellerVerified: true,
    postedAt: 'قبل يومين',
    views: 1120,
    isSaved: true,
    isMine: false,
  },
];

export const MarketplaceApp: React.FC<MarketplaceAppProps> = ({
  onBack,
  lang,
  onOpenConnectChat,
}) => {
  const isAr = lang === 'ar';
  const [listings, setListings] = useState<MarketplaceListing[]>(() => {
    try {
      const saved = localStorage.getItem('snns_marketplace_listings');
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'my-ads'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeListing, setActiveListing] = useState<MarketplaceListing | null>(null);

  // Create Listing Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'cars',
    price: '',
    location: 'الرياض',
    description: '',
    sellerName: 'هتاف أونلاين',
    sellerPhone: '+966500000000',
    imageSample: 'car',
  });
  const [backendSyncNotice, setBackendSyncNotice] = useState<string | null>(null);

  const handleSaveListing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = listings.map((item) =>
      item.id === id ? { ...item, isSaved: !item.isSaved } : item
    );
    setListings(updated);
    localStorage.setItem('snns_marketplace_listings', JSON.stringify(updated));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.price) return;

    let sampleImg = 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80';
    if (createForm.category === 'real-estate') sampleImg = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80';
    if (createForm.category === 'electronics') sampleImg = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
    if (createForm.category === 'furniture') sampleImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
    if (createForm.category === 'jobs' || createForm.category === 'services') sampleImg = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';

    const catObj = CATEGORIES.find((c) => c.id === createForm.category);

    const newAd: MarketplaceListing = {
      id: `m-custom-${Date.now()}`,
      title: createForm.title,
      category: createForm.category as any,
      categoryAr: catObj?.nameAr || 'قسم عام',
      categoryEn: catObj?.nameEn || 'General',
      price: parseFloat(createForm.price) || 0,
      currency: 'SAR',
      location: createForm.location,
      locationEn: createForm.location,
      image: sampleImg,
      description: createForm.description || 'إعلان مسجل حديثاً في منظومة سوق SNNS Marketplace.',
      sellerName: createForm.sellerName,
      sellerPhone: createForm.sellerPhone,
      sellerVerified: true,
      postedAt: isAr ? 'الآن' : 'Just now',
      views: 1,
      isSaved: false,
      isMine: true,
    };

    const updated = [newAd, ...listings];
    setListings(updated);
    localStorage.setItem('snns_marketplace_listings', JSON.stringify(updated));
    setShowCreateModal(false);
    setActiveTab('my-ads');
    setBackendSyncNotice(isAr ? 'تم حفظ الإعلان محلياً في مساحة العمل. بانتظار تفعيل الربط مع خادم سوق SNNS.PRO لنشره على الشبكة العامة.' : 'Ad saved locally in workspace. Awaiting backend integration with SNNS.PRO to publish publicly.');
  };

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (activeTab === 'saved' && !item.isSaved) return false;
    if (activeTab === 'my-ads' && !item.isMine) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && !item.location.includes(selectedCity) && !item.locationEn.toLowerCase().includes(selectedCity)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q) || (item.titleEn && item.titleEn.toLowerCase().includes(q));
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSeller = item.sellerName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSeller) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen text-slate-800">
      {/* Top Bar with SNNS Identity */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 shadow-xs sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
              title={isAr ? 'الرجوع للمركز' : 'Back to Launcher'}
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-2.5">
              <MarketplaceIcon className="w-9 h-9" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    {isAr ? 'سوق وإعلانات SNNS' : 'SNNS Marketplace'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {isAr ? 'حراج المنظومة' : 'Haraj & Trade'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'منصة الإعلانات التجارية والمزادات الحرة الموثقة'
                    : 'Verified commercial marketplace & auction exchange'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'أضف إعلانك الآن' : 'Post Free Ad'}</span>
            </button>
          </div>
        </div>

        {/* Backend State Indicator Banner */}
        <div className="mt-2 pt-2 border-t border-slate-100 max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">
              {isAr ? 'حالة الخدمة:' : 'Service Status:'}
            </span>
            <span>
              {isAr
                ? 'الواجهة جاهزة ومحدثة محلياً — بانتظار ربط قاعدة بيانات إعلانات سوق SNNS.PRO'
                : 'Interface ready locally — awaiting integration with SNNS.PRO marketplace DB'}
            </span>
          </div>
          <span className="font-mono text-slate-400 hidden md:inline">api.snns.pro/marketplace/v1</span>
        </div>
      </header>

      {/* Backend Sync Notification alert if action taken */}
      {backendSyncNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{backendSyncNotice}</span>
          </div>
          <button
            onClick={() => setBackendSyncNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Hero Navigation */}
      <section className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث عن سيارات، عقارات، هواتف، أجهزة، خدمات في حراج SNNS...'
                    : 'Search cars, real estate, phones, gadgets in SNNS Marketplace...'
                }
                className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id === 'all' ? 'all' : (isAr ? c.nameAr : c.nameEn)}>
                    {isAr ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>

              {/* View Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'السوق العام' : 'All Ads'}
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'saved'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>{isAr ? 'المحفوظات' : 'Saved'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-ads')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'my-ads'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'إعلاناتي' : 'My Ads'}
                </button>
              </div>
            </div>
          </div>

          {/* Categories Horizontal Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snns-scroll-touch">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                  <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area: Listings Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-slate-500">
            {isAr
              ? `عرض ${filteredListings.length} إعلان موثق`
              : `Showing ${filteredListings.length} verified listings`}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحديث لحظي' : 'Live updates'}</span>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {isAr ? 'لا توجد إعلانات مطابقة' : 'No matching listings'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isAr
                ? 'جرب البحث بكلمات أخرى أو تغيير الفلتر والقسم'
                : 'Try searching with different terms or changing categories.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCity('all');
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveListing(item)}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group cursor-pointer"
              >
                {/* Image Cover */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Chip */}
                  <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    {isAr ? item.categoryAr : item.categoryEn}
                  </span>

                  {/* Save Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => handleSaveListing(item.id, e)}
                    className="absolute top-3 end-3 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 shadow-sm transition cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.isSaved ? 'text-rose-600 fill-rose-600' : 'text-slate-600'
                      }`}
                    />
                  </button>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 start-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-sm border border-slate-200/60">
                    <span className="text-base font-black text-amber-700">
                      {item.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 ms-1">
                      {item.currency}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition line-clamp-2 mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 truncate max-w-[65%]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{isAr ? item.location : item.locationEn}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.postedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-[11px]">
                          {item.sellerName}
                        </span>
                        {item.sellerVerified && (
                          <span title={isAr ? 'بائع موثق' : 'Verified'}>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Eye className="w-3 h-3" />
                        <span>{item.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Listing Details Modal */}
      {activeListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
            {/* Header / Cover */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-900">
              <img
                src={activeListing.image}
                alt={activeListing.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveListing(null)}
                className="absolute top-4 end-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 start-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-lg border border-slate-200">
                <span className="text-xl font-black text-amber-700">
                  {activeListing.price.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-600 ms-1">
                  {activeListing.currency}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                    {isAr ? activeListing.categoryAr : activeListing.categoryEn}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activeListing.postedAt}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {activeListing.title}
                </h2>
              </div>

              {/* Location & Metadata */}
              <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isAr ? activeListing.location : activeListing.locationEn}</span>
                </div>
                <div>·</div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{activeListing.views} {isAr ? 'مشاهدة' : 'views'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {isAr ? 'تفاصيل الإعلان' : 'Description'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                  {activeListing.description}
                </p>
              </div>

              {/* Seller Box */}
              <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 p-4 rounded-2xl border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white font-black text-base flex items-center justify-center shrink-0">
                    {activeListing.sellerName.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">
                        {activeListing.sellerName}
                      </span>
                      {activeListing.sellerVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {activeListing.sellerPhone}
                    </span>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${activeListing.sellerPhone}`}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isAr ? 'اتصال' : 'Call'}</span>
                  </a>

                  <button
                    onClick={() => {
                      if (onOpenConnectChat) {
                        onOpenConnectChat(activeListing.sellerName);
                      } else {
                        setBackendSyncNotice(isAr ? 'سيتم ربط المراسلة الفورية عبر منظومة SNNS Connect في الإصدار القادم.' : 'Instant messaging via SNNS Connect will be connected in next phase.');
                      }
                      setActiveListing(null);
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مراسلة عبر SNNS Connect' : 'Chat in SNNS Connect'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  {isAr ? 'إضافة إعلان جديد في سوق SNNS' : 'Post New Listing'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'عنوان الإعلان *' : 'Listing Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder={isAr ? 'مثال: سيارة لكزس 2023 ES350 بحالة ممتازة' : 'e.g. Lexus ES350 2023'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'القسم *' : 'Category *'}
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.nameAr : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'السعر (ريال سعودي) *' : 'Price (SAR) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    placeholder="25000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'المدينة والحي *' : 'City & District *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder={isAr ? 'الرياض - حي النخيل' : 'Riyadh'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? 'رقم الاتصال / واتساب *' : 'Contact Phone *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.sellerPhone}
                    onChange={(e) => setCreateForm({ ...createForm, sellerPhone: e.target.value })}
                    placeholder="+966500000000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'تفاصيل ومواصفات الإعلان' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={isAr ? 'اكتب كافة تفاصيل السلعة وحالتها ومميزاتها...' : 'Describe item details...'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'حفظ ونشر الإعلان' : 'Publish Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
