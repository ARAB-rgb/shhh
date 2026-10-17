import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  BrainCircuit,
  Compass,
} from 'lucide-react';
import { GroundedResult, NlpIntentAnalysis } from '../types';

interface AiOverviewProps {
  overviewText: string;
  sources: GroundedResult[];
  isArabic: boolean;
  searchTimeSeconds?: number;
  nlpAnalysis?: NlpIntentAnalysis;
  onApplyCorrection?: (correction: string) => void;
}

export const AiOverview: React.FC<AiOverviewProps> = ({
  overviewText,
  sources,
  isArabic,
  searchTimeSeconds,
  nlpAnalysis,
  onApplyCorrection,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(overviewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format paragraphs nicely
  const paragraphs = overviewText
    .split('\n\n')
    .filter((p) => p.trim().length > 0);

  return (
    <div
      className="mb-6 rounded-2xl bg-gradient-to-b from-emerald-50/80 via-green-50/40 to-white dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm p-4 sm:p-5 transition-all"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 dark:border-emerald-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
            <Sparkles className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>{isArabic ? 'نظرة عامة ذكية مدعومة بمحرك SNNS.PRO' : 'SNNS.PRO AI Overview'}</span>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                {isArabic ? 'مباشر وتفاعلي' : 'Live Grounded'}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors"
            title={isArabic ? 'نسخ النص' : 'Copy Overview'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* NLP Intent Bar if present */}
      {nlpAnalysis && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {isArabic ? 'تحليل النية الطبيعية (NLP):' : 'NLP Intent:'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-white dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
              {isArabic ? nlpAnalysis.intentLabelAr : nlpAnalysis.intentLabelEn}
            </span>
          </div>

          {/* Expanded Keywords / Entities */}
          {nlpAnalysis.primaryEntities && nlpAnalysis.primaryEntities.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">{isArabic ? 'المفاهيم المستخرجة:' : 'Entities:'}</span>
              <div className="flex items-center gap-1">
                {nlpAnalysis.primaryEntities.slice(0, 3).map((ent, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-white/90 dark:bg-zinc-800 rounded text-emerald-900 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-900/60"
                  >
                    #{ent}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query Typo / Dialect Correction Suggestion */}
      {nlpAnalysis?.suggestedQueryCorrection && onApplyCorrection && (
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <span className="font-bold">{isArabic ? 'هل تقصد:' : 'Did you mean:'}</span>
            <button
              onClick={() => onApplyCorrection(nlpAnalysis.suggestedQueryCorrection!)}
              className="font-bold underline text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 cursor-pointer"
            >
              {nlpAnalysis.suggestedQueryCorrection}
            </button>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 opacity-80">
            {isArabic ? 'تصحيح تلقائي بالذكاء الاصطناعي' : 'NLP auto-correction'}
          </span>
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="pt-3 space-y-3">
          {/* Text Summary */}
          <div className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 space-y-2">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>

          {/* Sources carousel / chips */}
          {sources.length > 0 && (
            <div className="pt-3 border-t border-emerald-100 dark:border-zinc-800/60">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-2">
                {isArabic ? 'المصادر الموثقة المستند إليها:' : 'Grounded Web Sources:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {sources.slice(0, 5).map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all text-xs text-zinc-800 dark:text-zinc-200 group"
                  >
                    <img
                      src={src.favicon}
                      alt=""
                      className="w-3.5 h-3.5 rounded-sm shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="font-medium truncate max-w-[150px]">{src.title}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-emerald-600 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer of Overview: feedback & latency */}
          <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>
              {searchTimeSeconds
                ? isArabic
                  ? `استجابة فائقة السرعة (${searchTimeSeconds} ثانية)`
                  : `Ultra-fast inference (${searchTimeSeconds}s)`
                : ''}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px]">{isArabic ? 'هل كانت النتيجة مفيدة؟' : 'Helpful?'}</span>
              <button
                onClick={() => setFeedback('up')}
                className={`p-1 rounded hover:bg-white dark:hover:bg-zinc-800 transition-colors ${
                  feedback === 'up' ? 'text-emerald-600 font-bold' : ''
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFeedback('down')}
                className={`p-1 rounded hover:bg-white dark:hover:bg-zinc-800 transition-colors ${
                  feedback === 'down' ? 'text-red-500 font-bold' : ''
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
