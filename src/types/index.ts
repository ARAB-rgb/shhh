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

export interface GroundedResult {
  title: string;
  url: string;
  snippet?: string;
  domain: string;
  favicon: string;
}

export interface NlpIntentAnalysis {
  intent: 'informational' | 'tutorial_code' | 'navigational' | 'tools_utility' | 'news_current' | 'academic_research' | 'comparison' | 'general';
  intentLabelAr: string;
  intentLabelEn: string;
  confidence: number;
  primaryEntities: string[];
  expandedKeywords: string[];
  suggestedQueryCorrection?: string;
  explanationAr: string;
  explanationEn: string;
}

export interface RankedIndexedSite extends IndexedSite {
  relevanceScore?: number;
  matchedConcepts?: string[];
  intentMatched?: boolean;
}

export interface SearchApiResponse {
  query: string;
  overview: string;
  results: GroundedResult[];
  webSearchQueries?: string[];
  searchTimeSeconds: number;
  nlpAnalysis?: NlpIntentAnalysis;
}

export type SearchCategory = 'all' | 'cloud' | 'news' | 'images' | 'academic';

export interface Bookmark {
  url: string;
  title: string;
  domain: string;
  savedAt: string;
  favicon?: string;
}
