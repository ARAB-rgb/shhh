import {
  PlatformThemeConfig,
  ThemeTokens,
  OFFICIAL_DEFAULT_THEME,
  THEME_PRESETS,
  AppThemeOverride,
} from '../types/theme';

const STORAGE_KEY = 'snns_theme_config_v1';

class ThemeService {
  private config: PlatformThemeConfig;
  private listeners: Set<(tokens: ThemeTokens, appId?: string | null) => void> = new Set();

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): PlatformThemeConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.platform) {
          return {
            version: 1,
            activePresetId: parsed.activePresetId,
            platform: { ...OFFICIAL_DEFAULT_THEME, ...parsed.platform },
            apps: parsed.apps || {},
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved theme config:', e);
    }

    return {
      version: 1,
      activePresetId: 'official-dark',
      platform: { ...OFFICIAL_DEFAULT_THEME },
      apps: {},
      updatedAt: new Date().toISOString(),
    };
  }

  public getConfig(): PlatformThemeConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: PlatformThemeConfig): void {
    this.config = {
      ...newConfig,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
    this.notifyListeners();
  }

  public resetToDefault(): PlatformThemeConfig {
    const defaultConfig: PlatformThemeConfig = {
      version: 1,
      activePresetId: 'official-dark',
      platform: { ...OFFICIAL_DEFAULT_THEME },
      apps: {},
      updatedAt: new Date().toISOString(),
    };
    this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  public applyPreset(presetId: string): ThemeTokens {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return this.config.platform;

    this.config = {
      ...this.config,
      activePresetId: presetId,
      platform: { ...preset.tokens },
      updatedAt: new Date().toISOString(),
    };
    this.saveConfig(this.config);
    return this.config.platform;
  }

  public getEffectiveTheme(appId: string | null = null): ThemeTokens {
    if (!appId || !this.config.apps[appId]) {
      return this.config.platform;
    }

    const appOverride = this.config.apps[appId];
    if (appOverride.inheritPlatform) {
      return this.config.platform;
    }

    return {
      ...this.config.platform,
      ...appOverride,
    };
  }

  public setAppTheme(appId: string, override: AppThemeOverride): void {
    const updatedApps = {
      ...this.config.apps,
      [appId]: override,
    };
    this.saveConfig({
      ...this.config,
      apps: updatedApps,
    });
  }

  public applyToDOM(tokens: ThemeTokens): void {
    const root = document.documentElement;

    root.style.setProperty('--snns-bg', tokens.bgColor);
    root.style.setProperty('--snns-bg-type', tokens.bgType);
    root.style.setProperty('--snns-bg-gradient', tokens.bgGradient);
    root.style.setProperty('--snns-bg-image', tokens.bgImage ? `url(${tokens.bgImage})` : 'none');

    root.style.setProperty('--snns-top-nav-bg', tokens.topNavBg);
    root.style.setProperty('--snns-top-nav-text', tokens.topNavText);
    root.style.setProperty('--snns-top-nav-border', tokens.topNavBorder);

    root.style.setProperty('--snns-sidebar-bg', tokens.sidebarBg);
    root.style.setProperty('--snns-sidebar-text', tokens.sidebarText);
    root.style.setProperty('--snns-sidebar-border', tokens.sidebarBorder);

    root.style.setProperty('--snns-card-bg', tokens.cardBg);
    root.style.setProperty('--snns-card-border', tokens.cardBorder);
    root.style.setProperty('--snns-card-text', tokens.cardText);

    root.style.setProperty('--snns-primary-btn-bg', tokens.primaryBtnBg);
    root.style.setProperty('--snns-primary-btn-hover', tokens.primaryBtnHover);
    root.style.setProperty('--snns-primary-btn-text', tokens.primaryBtnText);

    root.style.setProperty('--snns-text-main', tokens.textMain);
    root.style.setProperty('--snns-text-muted', tokens.textMuted);
    root.style.setProperty('--snns-border', tokens.borderColor);
    root.style.setProperty('--snns-accent', tokens.accentColor);
  }

  public subscribe(listener: (tokens: ThemeTokens, appId?: string | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const tokens = this.getEffectiveTheme();
    this.applyToDOM(tokens);
    this.listeners.forEach((fn) => fn(tokens));
  }

  /**
   * Future Server Sync API stub for SNNS.PRO central settings sync
   */
  public async syncWithCentralServer(): Promise<{
    status: 'ready' | 'offline';
    messageAr: string;
    messageEn: string;
  }> {
    return {
      status: 'ready',
      messageAr:
        'طبقة الإعدادات مجهزة معمارياً للربط بخادم SNNS.PRO المركزي بصلاحيات المدير الفنية. الحفظ مفعل حالياً محلياً للمتصفح.',
      messageEn:
        'Theme configuration schema is structured for central SNNS.PRO cloud sync. Currently active in browser local storage.',
    };
  }
}

export const themeService = new ThemeService();
