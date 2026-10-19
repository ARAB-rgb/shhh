import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  LayoutGrid,
  Send,
  X,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Lock,
} from 'lucide-react';
import { directoryService } from '../../services/directoryService';
import { VerifiedLink } from '../../types/directory';
import { AppId } from '../../types/suite';
import { SaudiFlagIcon } from '../icons/AppIcons';

interface DiriyahPanoramicHeroProps {
  onSelectApp: (appId: AppId) => void;
  lang: 'en' | 'ar';
  onOpenAppsDrawer?: () => void;
}

export const DiriyahPanoramicHero: React.FC<DiriyahPanoramicHeroProps> = ({
  onSelectApp,
  lang,
  onOpenAppsDrawer,
}) => {
  const isAr = lang === 'ar';

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VerifiedLink[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);

  // Request add service modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqUrl, setReqUrl] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [reqSuccessMsg, setReqSuccessMsg] = useState<string | null>(null);
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Search execution
  const executeSearch = async (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) {
      setSearchResults([]);
      setHasSearched(false);
      setNotFoundMsg(null);
      return;
    }

    setIsSearching(true);
    const res = await directoryService.searchDirectory(clean);
    setIsSearching(false);
    setHasSearched(true);

    if (res.found && res.results.length > 0) {
      setSearchResults(res.results);
      setNotFoundMsg(null);
    } else {
      setSearchResults([]);
      setNotFoundMsg(
        res.message ||
          (isAr
            ? 'عذراً، هذه الخدمة غير مفهرسة في الدليل المعتمد. يمكنك رفع طلب إضافتها للإدارة.'
            : 'Service not found in the verified directory. You can submit an indexing request.')
      );
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  // Submit request for unindexed link
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;

    setReqSubmitting(true);
    const res = await directoryService.requestIndexService(
      reqTitle.trim(),
      reqUrl.trim(),
      reqNotes.trim()
    );
    setReqSubmitting(false);

    if (res.success) {
      setReqSuccessMsg(
        isAr
          ? 'تم رفع طلب الفهرسة بنجاح للإدارة العليا للمراجعة والاعتماد.'
          : 'Service indexing request submitted for administrative review.'
      );
      setTimeout(() => {
        setReqSuccessMsg(null);
        setShowRequestModal(false);
        setReqTitle('');
        setReqUrl('');
        setReqNotes('');
      }, 2500);
    }
  };

  return (
    <div
      className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden select-none font-sans"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. PHOTOREALISTIC DIRIYAH AT-TURAIF PANORAMA BACKDROP */}
      <div className="absolute inset-0 z-0">
        {/* Sky gradient: Twilight to Deep Cobalt */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a4563] via-[#3a5878] to-[#1a2d42]" />

        {/* Ambient atmospheric lighting */}
        <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Historic Diriyah Mudbrick Architecture Silhouette Layer */}
        <div className="absolute bottom-0 inset-x-0 h-[65%] pointer-events-none">
          {/* Distant Watchtowers & Battlements */}
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1440 600"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="mudWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cda56b" />
                <stop offset="30%" stopColor="#b9894e" />
                <stop offset="70%" stopColor="#8d6031" />
                <stop offset="100%" stopColor="#543719" />
              </linearGradient>
              <linearGradient id="warmLightGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ffb347" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#ffcc00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffcc00" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="plazaMarble" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a38260" stopOpacity="0.6" />
                <stop offset="40%" stopColor="#6e5138" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e1814" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* At-Turaif Diriyah Palace & Fort Complex */}
            <path
              d="M0,320 L60,310 L60,250 L110,250 L110,300 L180,290 L220,230 L280,230 L290,290 L340,290 L340,320 L420,310 L440,260 L480,260 L500,310 L580,300 L620,240 L710,240 L730,280 L800,280 L820,220 L920,220 L940,270 L1020,270 L1040,300 L1150,290 L1180,240 L1260,240 L1280,290 L1360,290 L1380,310 L1440,310 L1440,600 L0,600 Z"
              fill="url(#mudWallGrad)"
            />

            {/* Battlements & Triangular Merlons (شرافات الدرعية النجدية التقليدية) */}
            <path
              d="M220,230 L230,215 L240,230 L250,215 L260,230 L270,215 L280,230 M620,240 L635,225 L650,240 L665,225 L680,240 L695,225 L710,240 M820,220 L835,205 L850,220 L865,205 L880,220 L895,205 L910,220 M1180,240 L1195,225 L1210,240 L1225,225 L1240,240 L1255,225 L1270,240"
              stroke="#543719"
              strokeWidth="4"
              fill="#b9894e"
            />

            {/* Warm Architectural Illumination from Below */}
            <rect x="0" y="240" width="1440" height="360" fill="url(#warmLightGrad)" />

            {/* White Classical Colonated Gallery in Diriyah Plaza (الرواق النجدي المضاء) */}
            <g opacity="0.9">
              <rect x="1050" y="360" width="380" height="15" fill="#fdfaf3" />
              <rect x="1060" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1100" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1140" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1180" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1220" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1260" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1300" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1340" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1380" y="375" width="12" height="75" fill="#eae4d3" />
              <rect x="1420" y="375" width="12" height="75" fill="#eae4d3" />
            </g>

            {/* Polished Plaza Floor with Wet Stone Reflection */}
            <rect x="0" y="440" width="1440" height="160" fill="url(#plazaMarble)" />
            {/* Tile grid lines */}
            <path
              d="M0,490 L1440,490 M0,540 L1440,540 M200,440 L100,600 M500,440 L450,600 M800,440 L800,600 M1100,440 L1150,600 M1300,440 L1400,600"
              stroke="#543719"
              strokeWidth="0.8"
              opacity="0.35"
            />
          </svg>
        </div>
      </div>

      {/* 2. TOP CORNER: LUXURY MINIMALIST "PRO.SNNS" & APPS GRID MENU (WAFFLE) */}
      <div className="relative z-30 w-full px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Subtle branding or clean breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 border border-slate-700/60 backdrop-blur-md text-[11px] font-bold text-slate-300 shadow-md">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'الدرعية التاريخية — حي الطريف' : 'Diriyah At-Turaif'}</span>
          </div>
        </div>

        {/* The Exact PRO.SNNS Glass Badge with Grid Menu Icon */}
        <button
          onClick={onOpenAppsDrawer}
          className="group px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-white shadow-2xl backdrop-blur-xl flex items-center gap-2.5 transition-all duration-300 cursor-pointer hover:shadow-emerald-950/50"
          title={isAr ? 'فتح شبكة التطبيقات والخدمات السحابية' : 'Open Apps & Services Grid'}
        >
          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutGrid className="w-3.5 h-3.5" />
          </div>
          <span className="font-black text-xs sm:text-sm tracking-wider flex items-center gap-0.5">
            <span className="text-emerald-400">PRO</span>
            <span className="text-amber-400 font-black">.</span>
            <span className="text-white">SNNS</span>
          </span>
        </button>
      </div>

      {/* 3. CENTER: FUTURISTIC CURVED TRANSPARENT SCREEN (Matching Screenshot Composition) */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-3 sm:px-6 my-auto flex flex-col items-center">
        {/* Outer Curved Bezel / Glass Container with 3D Depth */}
        <div className="relative w-full rounded-[40px] sm:rounded-[48px] border-2 border-slate-700/70 bg-gradient-to-b from-slate-950/50 via-slate-900/35 to-slate-950/60 backdrop-blur-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden p-6 sm:p-10 flex flex-col items-center">
          
          {/* Subtle curved edge glass highlight */}
          <div className="absolute inset-0 bg-radial from-emerald-500/5 via-transparent to-black/30 pointer-events-none" />
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          <div className="absolute bottom-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          {/* Tri-Composition: Left Flags | Center Search | Right Leadership */}
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Two Saudi Flags on Silver Flagpole */}
            <div className="hidden md:flex md:col-span-3 flex-col items-center justify-center">
              <div className="relative flex flex-col items-center group">
                {/* Silver Flagpole */}
                <div className="w-1.5 h-64 bg-gradient-to-r from-slate-300 via-white to-slate-400 rounded-full shadow-lg relative">
                  <div className="absolute -top-2 start-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border border-amber-200 shadow-md" />
                </div>

                {/* Flying Flags */}
                <div className="absolute top-4 start-1/2 -translate-x-1 w-28 h-20 rounded-lg overflow-hidden shadow-2xl border border-emerald-400/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="/assets/images/saudi_flag.jpg"
                    alt="علم المملكة العربية السعودية"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="absolute top-24 start-1/2 -translate-x-2 w-28 h-20 rounded-lg overflow-hidden shadow-2xl border border-emerald-400/40 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="/assets/images/saudi_flag.jpg"
                    alt="علم المملكة العربية السعودية"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Center: Glowing SNNS.PRO Title & Search Bar */}
            <div className="col-span-1 md:col-span-6 flex flex-col items-center text-center space-y-5">
              {/* Glowing Signature Brand Title */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight flex items-center justify-center gap-2 drop-shadow-[0_4px_24px_rgba(16,185,129,0.4)]">
                  <span className="text-emerald-400 font-extrabold">SNNS</span>
                  <span className="text-amber-400 text-3xl sm:text-5xl font-black drop-shadow-[0_0_12px_rgba(245,158,11,0.7)] animate-pulse">
                    .
                  </span>
                  <span className="text-emerald-400 font-extrabold">PRO</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300/90 font-semibold flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'الدليل السحابي الموثوق ومحرك البحث الداخلي المغلق' : 'Curated Private Directory & Closed Search'}</span>
                </p>
              </div>

              {/* Exact Pill-Shaped Emerald Search Bar */}
              <form onSubmit={handleSearchSubmit} className="w-full max-w-lg relative group">
                <div className="relative flex items-center bg-[#073622]/90 hover:bg-[#064228] border-2 border-emerald-500/70 hover:border-emerald-400 focus-within:border-emerald-400 rounded-full shadow-[0_8px_30px_rgba(0,108,53,0.35)] transition-all duration-300 backdrop-blur-md">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (e.target.value.trim().length > 1) {
                        executeSearch(e.target.value);
                      } else if (!e.target.value.trim()) {
                        setSearchResults([]);
                        setHasSearched(false);
                        setNotFoundMsg(null);
                      }
                    }}
                    placeholder={
                      isAr
                        ? 'ابحث في الخدمات الحكومية والوطنية المعتمدة (ناجز، أبشر، بلدي...)'
                        : 'Search verified national services (Najiz, Absher, Balady...)'
                    }
                    className="w-full bg-transparent text-white placeholder-emerald-200/60 text-xs sm:text-sm py-3.5 ps-6 pe-14 focus:outline-none font-medium"
                  />

                  {/* Circular Emerald Search Button */}
                  <button
                    type="submit"
                    className="absolute end-1.5 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 cursor-pointer"
                    title={isAr ? 'بحث في الفهرس المعتمد' : 'Search Verified Directory'}
                  >
                    <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  </button>
                </div>
              </form>

              {/* Quick Tags of Verified Pillars */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
                {['ناجز', 'أبشر', 'توكلنا', 'بلدي', 'قوى', 'سابر', 'الزكاة والضريبة'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      executeSearch(tag);
                    }}
                    className="px-3 py-1 rounded-full bg-slate-950/70 hover:bg-emerald-950/80 border border-slate-700/80 hover:border-emerald-400 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Leadership Portrait with Diriyah Background */}
            <div className="hidden md:flex md:col-span-3 flex-col items-center justify-center">
              <div className="relative w-48 h-56 rounded-3xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-slate-950 group/portrait">
                {/* Image of King Salman and Crown Prince Mohammed bin Salman */}
                <img
                  src="/assets/images/saudi_leadership.jpg"
                  alt="القيادة الرشيدة"
                  className="w-full h-full object-cover object-center group-hover/portrait:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-2 inset-x-2 text-center">
                  <span className="text-[10px] font-black text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-amber-400/40 inline-block shadow">
                    {isAr ? 'القيادة الرشيدة' : 'Wise Leadership'}
                  </span>
                  <p className="text-[9px] text-slate-300 font-bold mt-0.5">
                    {isAr ? 'الملك سلمان وولي العهد' : 'King Salman & Crown Prince'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* 4. SEARCH RESULTS OVERLAY (When Search is Active) */}
          {(hasSearched || searchResults.length > 0 || notFoundMsg) && (
            <div className="w-full mt-6 pt-5 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* If Results Found */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? `نتائج موثقة ومطابقة (${searchResults.length}):` : `Verified Matches (${searchResults.length}):`}</span>
                    </span>
                    <button
                      onClick={() => {
                        setSearchResults([]);
                        setHasSearched(false);
                        setQuery('');
                      }}
                      className="text-slate-400 hover:text-white text-[11px]"
                    >
                      {isAr ? 'إغلاق النتائج' : 'Clear Results'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/50 hover:border-emerald-400 transition-all shadow-xl flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-black text-sm text-white group-hover:text-emerald-300 transition-colors">
                              {item.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold shrink-0 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>{isAr ? 'معتمد' : 'Verified'}</span>
                            </span>
                          </div>

                          <span className="text-[10px] text-amber-400 font-medium block mb-1.5">
                            {item.category} {item.subCategory ? `• ${item.subCategory}` : ''}
                          </span>

                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                            {item.url.replace(/^https?:\/\//, '')}
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                          >
                            <span>{isAr ? 'فتح الرابط الرسمي' : 'Open Portal'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If Not Found Message (Exact text as requested) */}
              {notFoundMsg && searchResults.length === 0 && (
                <div className="p-5 rounded-2xl bg-slate-950/95 border border-amber-500/50 text-center max-w-xl mx-auto space-y-3 shadow-2xl">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed">
                    {notFoundMsg}
                  </p>
                  <button
                    onClick={() => {
                      setReqTitle(query);
                      setShowRequestModal(true);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isAr ? 'رفع طلب إضافة الخدمة للإدارة' : 'Submit Indexing Request'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 5. BOTTOM FOREGROUND: PROMINENT 3D ILLUMINATED VISION 2030 EMBLEM */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center pb-5 pt-3">
        {/* Exact 3D Pedestal and Vision 2030 Emblem */}
        <div className="relative group cursor-pointer flex flex-col items-center">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/30 transition-all" />

          {/* 3D Vision 2030 Plate */}
          <div className="relative px-6 py-2 rounded-2xl bg-gradient-to-b from-[#0a2f1d]/90 to-[#041a10]/95 border-2 border-emerald-400/80 shadow-[0_10px_35px_rgba(0,108,53,0.5)] flex flex-col items-center">
            
            {/* Top Vision Script */}
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm tracking-widest drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]">
              <span>VISION</span>
              <span>رؤيـــــة</span>
            </div>

            {/* Central 2030 with Saudi Palm & Crossed Swords */}
            <div className="flex items-center justify-center gap-1 my-0.5">
              <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tighter drop-shadow-md">
                2
              </span>
              <div className="w-8 h-8 rounded-full border border-amber-400/70 p-0.5 flex items-center justify-center bg-emerald-950/60 shadow-inner">
                <SaudiFlagIcon className="w-5 h-4" />
              </div>
              <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tighter drop-shadow-md">
                30
              </span>
            </div>

            {/* Kingdom Name Label on Base */}
            <div className="border-t border-emerald-500/30 pt-1 w-full text-center">
              <span className="text-[10px] font-bold text-amber-300 tracking-wide uppercase">
                {isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. MODAL: SUBMIT UNINDEXED SERVICE REQUEST */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-white">
                  {isAr ? 'طلب فهرسة خدمة جديدة في الدليل المعتمد' : 'Request Service Indexing'}
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reqSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold">
                {reqSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'اسم الخدمة أو المنصة:' : 'Service/Platform Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    placeholder={isAr ? 'مثال: منصة بلدي، تجديد جوازات...' : 'e.g. Balady, Absher...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'الرابط الرسمي (اختياري):' : 'Official URL (Optional):'}
                  </label>
                  <input
                    type="url"
                    value={reqUrl}
                    onChange={(e) => setReqUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'ملاحظات إضافية للمشرفين:' : 'Additional Notes:'}
                  </label>
                  <textarea
                    rows={2}
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                    placeholder={isAr ? 'الجهة التابعة لها، نوع المعاملة...' : 'Notes...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reqSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{reqSubmitting ? (isAr ? 'جارِ الإرسال...' : 'Submitting...') : (isAr ? 'إرسال الطلب للإدارة' : 'Submit Request')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiriyahPanoramicHero;
