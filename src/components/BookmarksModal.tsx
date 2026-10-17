import React from 'react';
import { X, Bookmark, Trash2, ExternalLink, Globe } from 'lucide-react';
import { Bookmark as BookmarkType } from '../types';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkType[];
  onRemoveBookmark: (url: string) => void;
  isArabic: boolean;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  isArabic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="px-6 py-4 border-b border-emerald-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/40 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {isArabic ? 'المواقع المفضلة والمحفوظة' : 'Saved Bookmarks'}
              </h2>
              <span className="text-xs text-zinc-500">
                {bookmarks.length} {isArabic ? 'موقع محفوظ' : 'items saved'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
          {bookmarks.map((bm) => (
            <div
              key={bm.url}
              className="py-3 px-2 flex items-center justify-between gap-3 group hover:bg-emerald-50/40 dark:hover:bg-zinc-800/40 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 truncate">
                {bm.favicon ? (
                  <img src={bm.favicon} alt="" className="w-4 h-4 rounded-sm shrink-0" />
                ) : (
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <div className="truncate">
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 truncate block"
                  >
                    {bm.title}
                  </a>
                  <span className="text-[11px] text-zinc-400 truncate block" dir="ltr">
                    {bm.domain}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => onRemoveBookmark(bm.url)}
                  className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors"
                  title={isArabic ? 'إزالة' : 'Remove'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {bookmarks.length === 0 && (
            <div className="py-12 text-center text-zinc-400 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              <span>
                {isArabic
                  ? 'لا توجد مواقع محفوظة بعد. انقر على أيقونة الإشارة المرجعية بجانب أي نتيجة لحفظها هنا.'
                  : 'No bookmarks saved yet. Click the bookmark icon next to any search result to save it.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
