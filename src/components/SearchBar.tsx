import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, ArrowUpRight, TrendingUp, Sparkles, Clock, Globe, Trash2 } from 'lucide-react';
import { IndexedSite } from '../types';

interface SearchBarProps {
  query: string;
  setQuery: (val: string) => void;
  onSearch: (searchTerm: string) => void;
  onClearSearch?: () => void;
  onRemoveRecentSearch?: (term: string) => void;
  onClearAllRecents?: () => void;
  isCompact?: boolean;
  isArabic: boolean;
  indexedSites?: IndexedSite[];
  trendingQueries?: string[];
  recentSearches?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onSearch,
  onClearSearch,
  onRemoveRecentSearch,
  onClearAllRecents,
  isCompact = false,
  isArabic,
  indexedSites = [],
  trendingQueries = [],
  recentSearches = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(isArabic ? 'متصفحك لا يدعم البحث الصوتي' : 'Voice search is not supported in this browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isArabic ? 'ar-SA' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          onSearch(transcript);
          setIsOpen(false);
        }
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Voice recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Voice search start error:', err);
      setIsListening(false);
    }
  };

  // Filter autocomplete suggestions
  const suggestions = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Show recent searches and trending if query is empty
      return {
        recents: recentSearches.slice(0, 3),
        sites: [],
        trending: trendingQueries.slice(0, 4),
      };
    }

    // Match sites by title, tags, or domain
    const matchedSites = indexedSites
      .filter((s) => {
        return (
          s.title.toLowerCase().includes(trimmed) ||
          (s.tags && s.tags.toLowerCase().includes(trimmed)) ||
          s.url.toLowerCase().includes(trimmed)
        );
      })
      .slice(0, 4);

    // Match trending queries
    const matchedTrending = trendingQueries
      .filter((q) => q.toLowerCase().includes(trimmed) && q.toLowerCase() !== trimmed)
      .slice(0, 3);

    return {
      recents: [],
      sites: matchedSites,
      trending: matchedTrending,
    };
  }, [query, indexedSites, trendingQueries, recentSearches]);

  const totalSuggestionsCount =
    suggestions.recents.length + suggestions.sites.length + suggestions.trending.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(query);
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalSuggestionsCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalSuggestionsCount - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full transition-all ${
        isCompact ? 'max-w-3xl' : 'max-w-2xl mx-auto'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Search Input Container */}
      <div
        className={`group flex items-center bg-white dark:bg-zinc-900 border transition-all ${
          isOpen && totalSuggestionsCount > 0
            ? 'rounded-t-2xl rounded-b-none border-emerald-600 shadow-xl'
            : 'rounded-full border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-sm hover:shadow-md focus-within:shadow-xl focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20'
        } ${isCompact ? 'py-1.5 px-3' : 'py-3.5 px-4 sm:px-5'}`}
      >
        <Search
          className={`shrink-0 text-emerald-600 group-focus-within:text-emerald-700 transition-colors ${
            isCompact ? 'w-4 h-4' : 'w-5 h-5'
          } ${isArabic ? 'ml-3' : 'mr-3'}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            isArabic
              ? 'ابحث في الويب وفهرس المواقع السحابية SNNS.PRO...'
              : 'Search web and cloud index in SNNS.PRO...'
          }
          className="flex-1 bg-transparent border-none text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none text-sm sm:text-base font-medium"
        />

        {/* Clear Search Button (مسح البحث) */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              if (onClearSearch) {
                onClearSearch();
              }
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center cursor-pointer"
            title={isArabic ? 'مسح البحث' : 'Clear search'}
            aria-label={isArabic ? 'مسح البحث' : 'Clear search'}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          className={`p-1.5 rounded-full transition-all ${
            isListening
              ? 'text-red-600 bg-red-100 dark:bg-red-950 animate-pulse'
              : 'text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
          } ${isArabic ? 'mr-1 sm:mr-2' : 'ml-1 sm:ml-2'}`}
          title={isArabic ? 'بحث بالصوت' : 'Search by voice'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Direct Search Action Button in Compact Mode */}
        {isCompact && (
          <button
            type="button"
            onClick={() => {
              onSearch(query);
              setIsOpen(false);
            }}
            className="p-1.5 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-x border-b border-emerald-200 dark:border-emerald-900 rounded-b-2xl shadow-2xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* Matched Cloud Sites */}
          {suggestions.sites.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 px-3 py-1 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-emerald-600" />
                <span>{isArabic ? 'مواقع مفهرسة سحابياً' : 'Cloud Indexed Sites'}</span>
              </div>
              {suggestions.sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => {
                    setQuery(site.title);
                    onSearch(site.title);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-right rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/50 transition-colors text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    {site.favicon ? (
                      <img src={site.favicon} alt="" className="w-4 h-4 rounded-sm shrink-0" />
                    ) : (
                      <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="font-semibold text-zinc-900 dark:text-white truncate">
                      {site.title}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate max-w-[140px]" dir="ltr">
                      {site.url.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold">
                    {isArabic ? 'سحابي' : 'Cloud'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {suggestions.trending.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-semibold text-zinc-400 px-3 py-1 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>{isArabic ? 'عمليات البحث الرائجة' : 'Trending Searches'}</span>
              </div>
              {suggestions.trending.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(term);
                    onSearch(term);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-right rounded-xl hover:bg-emerald-50/60 dark:hover:bg-zinc-800/70 transition-colors text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{term}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches with Clear Option */}
          {suggestions.recents.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-1">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>{isArabic ? 'عمليات البحث السابقة' : 'Recent Searches'}</span>
                </div>
                {onClearAllRecents && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClearAllRecents();
                    }}
                    className="text-[11px] text-red-500 hover:text-red-700 dark:text-red-400 flex items-center gap-1 font-semibold hover:underline cursor-pointer transition-colors"
                    title={isArabic ? 'مسح سجل البحث بالكامل' : 'Clear search history'}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isArabic ? 'مسح السجل' : 'Clear all'}</span>
                  </button>
                )}
              </div>
              {suggestions.recents.map((item, idx) => (
                <div
                  key={idx}
                  className="w-full flex items-center justify-between px-3 py-2 text-right rounded-xl hover:bg-emerald-50/60 dark:hover:bg-zinc-800/70 transition-colors text-xs text-zinc-700 dark:text-zinc-300 group"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      onSearch(item);
                      setIsOpen(false);
                    }}
                    className="flex-1 flex items-center gap-2 text-right cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-400">
                      {isArabic ? 'سجل' : 'History'}
                    </span>
                    {onRemoveRecentSearch && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveRecentSearch(item);
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title={isArabic ? 'حذف من السجل' : 'Remove from history'}
                        aria-label={isArabic ? 'حذف من السجل' : 'Remove'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
