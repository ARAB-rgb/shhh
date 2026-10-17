export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface ThemeTokens {
  // Background
  bgType: BackgroundType;
  bgColor: string;
  bgGradient: string;
  bgImage?: string;

  // Header / Top Navigation
  topNavBg: string;
  topNavText: string;
  topNavBorder: string;

  // Sidebar / Drawers
  sidebarBg: string;
  sidebarText: string;
  sidebarBorder: string;

  // Cards & Surfaces
  cardBg: string;
  cardBorder: string;
  cardText: string;

  // Primary Buttons & Interactive
  primaryBtnBg: string;
  primaryBtnHover: string;
  primaryBtnText: string;

  // Typography & Borders
  textMain: string;
  textMuted: string;
  borderColor: string;
  accentColor: string;
}

export interface AppThemeOverride extends Partial<ThemeTokens> {
  inheritPlatform: boolean;
}

export interface PlatformThemeConfig {
  version: number;
  activePresetId?: string;
  platform: ThemeTokens;
  apps: Record<string, AppThemeOverride>;
  updatedAt: string;
}

export interface ThemePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  previewBg: string;
  previewAccent: string;
  tokens: ThemeTokens;
}

// ----------------------------------------------------
// Official Default Tokens (SNNS 365 Official Theme)
// ----------------------------------------------------
export const OFFICIAL_DEFAULT_THEME: ThemeTokens = {
  bgType: 'solid',
  bgColor: '#0A0D0C',
  bgGradient: 'linear-gradient(135deg, #0A0D0C 0%, #111A16 100%)',
  bgImage: '',

  topNavBg: '#090D0C',
  topNavText: '#ffffff',
  topNavBorder: '#1F2926',

  sidebarBg: '#0E1513',
  sidebarText: '#e2e8f0',
  sidebarBorder: '#1e2925',

  cardBg: '#111816',
  cardBorder: '#23332D',
  cardText: '#f1f5f9',

  primaryBtnBg: '#059669',
  primaryBtnHover: '#10b981',
  primaryBtnText: '#ffffff',

  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  borderColor: '#23332D',
  accentColor: '#10b981',
};

// ----------------------------------------------------
// Five Requested Theme Presets + Official Default
// ----------------------------------------------------
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'official-dark',
    nameAr: 'الافتراضي الرسمي (أخضر زمردي فاخر)',
    nameEn: 'Official Emerald Dark',
    descriptionAr: 'الهوية السعودية الرسمية لمنظومة SNNS 365 بدرجات الأخضر والزمرد',
    previewBg: '#0A0D0C',
    previewAccent: '#10b981',
    tokens: { ...OFFICIAL_DEFAULT_THEME },
  },
  {
    id: 'elegant-white',
    nameAr: 'أبيض أنيق (Modern Crisp White)',
    nameEn: 'Elegant White',
    descriptionAr: 'تصميم أبيض ناصع ومريح مع تباين عالي للعمل المكتبي الطويل',
    previewBg: '#F8FAFC',
    previewAccent: '#0284C7',
    tokens: {
      bgType: 'solid',
      bgColor: '#F8FAFC',
      bgGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)',
      bgImage: '',
      topNavBg: '#FFFFFF',
      topNavText: '#0F172A',
      topNavBorder: '#E2E8F0',
      sidebarBg: '#F1F5F9',
      sidebarText: '#1E293B',
      sidebarBorder: '#CBD5E1',
      cardBg: '#FFFFFF',
      cardBorder: '#E2E8F0',
      cardText: '#0F172A',
      primaryBtnBg: '#0284C7',
      primaryBtnHover: '#0369A1',
      primaryBtnText: '#FFFFFF',
      textMain: '#0F172A',
      textMuted: '#64748B',
      borderColor: '#E2E8F0',
      accentColor: '#0284C7',
    },
  },
  {
    id: 'luxury-dark',
    nameAr: 'داكن فاخر (Obsidian & Emerald)',
    nameEn: 'Luxury Dark',
    descriptionAr: 'خلفية سوداء عميقة مع لمسات ذهبية ملكية وتفاصيل بارزة',
    previewBg: '#05070A',
    previewAccent: '#D97706',
    tokens: {
      bgType: 'solid',
      bgColor: '#05070A',
      bgGradient: 'linear-gradient(135deg, #05070A 0%, #0F172A 100%)',
      bgImage: '',
      topNavBg: '#090D14',
      topNavText: '#F8FAFC',
      topNavBorder: '#1E293B',
      sidebarBg: '#090D14',
      sidebarText: '#E2E8F0',
      sidebarBorder: '#1E293B',
      cardBg: '#0F172A',
      cardBorder: '#334155',
      cardText: '#F8FAFC',
      primaryBtnBg: '#D97706',
      primaryBtnHover: '#B45309',
      primaryBtnText: '#FFFFFF',
      textMain: '#F8FAFC',
      textMuted: '#94A3B8',
      borderColor: '#334155',
      accentColor: '#D97706',
    },
  },
  {
    id: 'navy-gold',
    nameAr: 'كحلي وذهبي (Royal Navy & Gold)',
    nameEn: 'Royal Navy & Gold',
    descriptionAr: 'أزرق كحلي ملكي عريق مطعم بالذهب الخالص للفخامة والأعمال الكبرى',
    previewBg: '#0A192F',
    previewAccent: '#F59E0B',
    tokens: {
      bgType: 'gradient',
      bgColor: '#0A192F',
      bgGradient: 'linear-gradient(135deg, #0A192F 0%, #112240 100%)',
      bgImage: '',
      topNavBg: '#071224',
      topNavText: '#FDE68A',
      topNavBorder: '#1E3A8A',
      sidebarBg: '#091830',
      sidebarText: '#F1F5F9',
      sidebarBorder: '#1E3A8A',
      cardBg: '#112240',
      cardBorder: '#233F73',
      cardText: '#F8FAFC',
      primaryBtnBg: '#D97706',
      primaryBtnHover: '#F59E0B',
      primaryBtnText: '#0A192F',
      textMain: '#F8FAFC',
      textMuted: '#94A3B8',
      borderColor: '#233F73',
      accentColor: '#F59E0B',
    },
  },
  {
    id: 'blue-purple',
    nameAr: 'أزرق وبنفسجي (Electric Violet & Indigo)',
    nameEn: 'Indigo & Purple',
    descriptionAr: 'تدرجات حديثة نابضة بالحياة للمبدعين ومنصات الذكاء الاصطناعي',
    previewBg: '#0F172A',
    previewAccent: '#8B5CF6',
    tokens: {
      bgType: 'gradient',
      bgColor: '#0F172A',
      bgGradient: 'linear-gradient(135deg, #1E1B4B 0%, #311042 100%)',
      bgImage: '',
      topNavBg: '#131133',
      topNavText: '#FFFFFF',
      topNavBorder: '#3730A3',
      sidebarBg: '#171442',
      sidebarText: '#E0E7FF',
      sidebarBorder: '#3730A3',
      cardBg: '#1E1B4B',
      cardBorder: '#4338CA',
      cardText: '#FFFFFF',
      primaryBtnBg: '#7C3AED',
      primaryBtnHover: '#6D28D9',
      primaryBtnText: '#FFFFFF',
      textMain: '#FFFFFF',
      textMuted: '#C7D2FE',
      borderColor: '#4338CA',
      accentColor: '#A78BFA',
    },
  },
  {
    id: 'calm-muted',
    nameAr: 'ألوان هادئة (Warm Desert Sage)',
    nameEn: 'Calm Sage & Sand',
    descriptionAr: 'ألوان طبيعية ترابية وهادئة توفر راحة تامة للعين',
    previewBg: '#1A1E1B',
    previewAccent: '#14B8A6',
    tokens: {
      bgType: 'solid',
      bgColor: '#171B18',
      bgGradient: 'linear-gradient(135deg, #171B18 0%, #202621 100%)',
      bgImage: '',
      topNavBg: '#131614',
      topNavText: '#F2F5F3',
      topNavBorder: '#2E3830',
      sidebarBg: '#1A1E1B',
      sidebarText: '#E4EAE5',
      sidebarBorder: '#2E3830',
      cardBg: '#202621',
      cardBorder: '#38453B',
      cardText: '#F2F5F3',
      primaryBtnBg: '#0D9488',
      primaryBtnHover: '#14B8A6',
      primaryBtnText: '#FFFFFF',
      textMain: '#F2F5F3',
      textMuted: '#A0ADA3',
      borderColor: '#38453B',
      accentColor: '#2DD4BF',
    },
  },
];
