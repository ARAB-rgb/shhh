import { IndexedSite, RankedIndexedSite, NlpIntentAnalysis } from '../types';

/**
 * Normalizes text for robust Arabic and English natural language matching
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    // Remove Arabic diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Arabic alefs
    .replace(/[إأآا]/g, 'ا')
    // Normalize taa marbuta
    .replace(/ة/g, 'ه')
    // Normalize yaa / alif maqsura
    .replace(/[يى]/g, 'ي')
    // Normalize punctuation & extra whitespaces
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common dialectal and filler stop words in Arabic and English
 */
const STOP_WORDS = new Set([
  'ابي', 'ابغى', 'اريد', 'عايز', 'بدي', 'كيف', 'شلون', 'ازاي', 'طريقة', 'عمل',
  'وش', 'شو', 'ماهو', 'ماهي', 'ما', 'هو', 'هي', 'في', 'من', 'على', 'عن', 'الى',
  'ان', 'انها', 'انه', 'مع', 'هل', 'لو', 'سمحت', 'احسن', 'افضل', 'اقوى', 'سريع',
  'بدون', 'عبر', 'منصة', 'موقع', 'how', 'to', 'can', 'i', 'the', 'a', 'an', 'is',
  'in', 'on', 'at', 'best', 'for', 'with', 'without', 'what', 'where', 'why'
]);

/**
 * Extracts meaningful keyword tokens from conversational query
 */
export function extractContentTokens(rawQuery: string): string[] {
  const normalized = normalizeText(rawQuery);
  const words = normalized.split(/\s+/).filter(Boolean);
  const tokens = words.filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return tokens.length > 0 ? tokens : words;
}

/**
 * NLP Semantic Ranker for Cloud Database
 * Ranks indexed sites based on semantic relevance, intent match, and quality score.
 */
export function rankSitesWithNlp(
  sites: IndexedSite[],
  rawQuery: string,
  nlpAnalysis?: NlpIntentAnalysis
): RankedIndexedSite[] {
  if (!rawQuery.trim()) {
    // If no query, return sorted by clicks
    return sites
      .map((s) => ({ ...s, relevanceScore: 100 }))
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  }

  const normalizedQuery = normalizeText(rawQuery);
  const queryTokens = extractContentTokens(rawQuery);

  // Entities & expanded keywords from NLP
  const nlpEntities = (nlpAnalysis?.primaryEntities || []).map(normalizeText).filter(Boolean);
  const nlpKeywords = (nlpAnalysis?.expandedKeywords || []).map(normalizeText).filter(Boolean);
  const activeIntent = nlpAnalysis?.intent;

  const scored: RankedIndexedSite[] = [];

  for (const site of sites) {
    const siteTitleNorm = normalizeText(site.title);
    const siteDescNorm = normalizeText(site.description);
    const siteTagsNorm = normalizeText(site.tags || '');
    const siteUrlNorm = normalizeText(site.url);
    const siteCategory = site.category.toLowerCase();

    let score = 0;
    const matchedConcepts: Set<string> = new Set();

    // 1. Exact Full Query Match Bonus
    if (siteTitleNorm.includes(normalizedQuery)) {
      score += 45;
      matchedConcepts.add(rawQuery);
    } else if (siteTagsNorm.includes(normalizedQuery)) {
      score += 35;
      matchedConcepts.add(rawQuery);
    } else if (siteDescNorm.includes(normalizedQuery)) {
      score += 20;
    }

    // 2. Token / Keyword Matching
    for (const token of queryTokens) {
      let tokenMatched = false;
      if (siteTitleNorm.includes(token)) {
        score += 18;
        tokenMatched = true;
      }
      if (siteTagsNorm.includes(token)) {
        score += 14;
        tokenMatched = true;
      }
      if (siteDescNorm.includes(token)) {
        score += 8;
        tokenMatched = true;
      }
      if (siteUrlNorm.includes(token)) {
        score += 10;
        tokenMatched = true;
      }
      if (tokenMatched) {
        matchedConcepts.add(token);
      }
    }

    // 3. NLP Semantic Entities Match
    for (const entity of nlpEntities) {
      if (siteTitleNorm.includes(entity) || siteTagsNorm.includes(entity)) {
        score += 20;
        matchedConcepts.add(entity);
      } else if (siteDescNorm.includes(entity)) {
        score += 10;
        matchedConcepts.add(entity);
      }
    }

    // 4. NLP Expanded Synonyms & Context Match
    for (const kw of nlpKeywords) {
      if (kw !== normalizedQuery && (siteTitleNorm.includes(kw) || siteTagsNorm.includes(kw) || siteDescNorm.includes(kw))) {
        score += 8;
        matchedConcepts.add(kw);
      }
    }

    // 5. Intent Alignment Multiplier
    let intentMatched = false;
    if (activeIntent) {
      if (activeIntent === 'tutorial_code' && (siteCategory === 'tech' || siteTagsNorm.includes('برمجة') || siteTagsNorm.includes('كود'))) {
        score *= 1.45;
        intentMatched = true;
      } else if (activeIntent === 'news_current' && (siteCategory === 'news' || siteTagsNorm.includes('أخبار'))) {
        score *= 1.45;
        intentMatched = true;
      } else if (activeIntent === 'tools_utility' && (siteCategory === 'tools' || siteTagsNorm.includes('أداة'))) {
        score *= 1.45;
        intentMatched = true;
      } else if (activeIntent === 'academic_research' && (siteCategory === 'education' || siteTagsNorm.includes('بحث'))) {
        score *= 1.45;
        intentMatched = true;
      }
    }

    // 6. Quality & Popularity Boost (Damped)
    const clicks = site.clicks || 0;
    const popularityBonus = Math.min(Math.log10(clicks + 1) * 3, 15);
    score += popularityBonus;

    // Verified site bonus
    if (site.isVerified) {
      score += 5;
    }

    // Only include if score has meaningful relevance
    if (score > 6 || matchedConcepts.size > 0) {
      // Normalize final score to percentage scale (max 100)
      const finalPercentage = Math.min(Math.round((score / 80) * 100), 100);
      scored.push({
        ...site,
        relevanceScore: Math.max(finalPercentage, 10),
        matchedConcepts: Array.from(matchedConcepts).slice(0, 4),
        intentMatched,
      });
    }
  }

  // Sort descending by calculated relevance score
  return scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}
