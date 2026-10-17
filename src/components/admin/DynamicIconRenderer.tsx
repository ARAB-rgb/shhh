import React from 'react';
import { DynamicAppTile, IconShapeType, IconStyleType } from '../../types/suite';
import {
  WordIcon,
  TeamsIcon,
  OneDriveIcon,
  OutlookIcon,
  CopilotIcon,
  FamilySafetyIcon,
  ToDoIcon,
  OneNoteIcon,
  PowerPointIcon,
  ExcelIcon,
  MoreAppsIcon,
  SkypeIcon,
  DesignerIcon,
  ClipchampIcon,
  CalendarIcon,
  FormsSurveyIcon,
  SnnsAiIcon,
  PrinterAppIcon,
  MarketplaceIcon,
  BusinessIcon,
  AccountIcon,
  QaydPosIcon,
  QaydAccountingIcon,
  EducationIcon,
  CallsIcon,
  ChatIcon,
} from '../icons/AppIcons';
import {
  Star,
  Shield,
  Zap,
  Sparkles,
  Database,
  FileText,
  Table,
  Video,
  Compass,
  Heart,
  Layers,
  Cloud,
  Rocket,
  Award,
  Activity,
  Bell,
  Lock,
  Cpu,
  Globe,
  Settings,
  Folder,
} from 'lucide-react';

interface DynamicIconRendererProps {
  tile: DynamicAppTile;
  size?: number;
  className?: string;
}

export const CUSTOM_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  shield: Shield,
  zap: Zap,
  sparkles: Sparkles,
  database: Database,
  fileText: FileText,
  table: Table,
  video: Video,
  compass: Compass,
  heart: Heart,
  layers: Layers,
  cloud: Cloud,
  rocket: Rocket,
  award: Award,
  activity: Activity,
  bell: Bell,
  lock: Lock,
  cpu: Cpu,
  globe: Globe,
  settings: Settings,
  folder: Folder,
};

export const COLOR_SCHEME_CLASSES: Record<IconStyleType, { bg: string; text: string; ring: string }> = {
  default: {
    bg: 'bg-transparent',
    text: 'text-white',
    ring: 'ring-gray-200',
  },
  'gradient-blue': {
    bg: 'bg-gradient-to-tr from-blue-700 via-sky-600 to-cyan-500 shadow-blue-500/25',
    text: 'text-white',
    ring: 'ring-blue-400',
  },
  'gradient-purple': {
    bg: 'bg-gradient-to-tr from-purple-800 via-indigo-600 to-violet-500 shadow-purple-500/25',
    text: 'text-white',
    ring: 'ring-purple-400',
  },
  'gradient-emerald': {
    bg: 'bg-gradient-to-tr from-emerald-800 via-green-600 to-teal-400 shadow-emerald-500/25',
    text: 'text-white',
    ring: 'ring-emerald-400',
  },
  'gradient-crimson': {
    bg: 'bg-gradient-to-tr from-red-800 via-rose-600 to-orange-500 shadow-rose-500/25',
    text: 'text-white',
    ring: 'ring-rose-400',
  },
  'gradient-amber': {
    bg: 'bg-gradient-to-tr from-amber-700 via-amber-500 to-yellow-300 shadow-amber-500/25',
    text: 'text-amber-950',
    ring: 'ring-amber-400',
  },
  'gradient-dark': {
    bg: 'bg-gradient-to-tr from-black via-zinc-900 to-zinc-700 shadow-black/40',
    text: 'text-white',
    ring: 'ring-zinc-600',
  },
  'gradient-cyberpunk': {
    bg: 'bg-gradient-to-tr from-fuchsia-600 via-pink-500 to-cyan-400 shadow-fuchsia-500/30',
    text: 'text-white',
    ring: 'ring-cyan-300',
  },
};

export const SHAPE_CLASSES: Record<IconShapeType, string> = {
  standard: '',
  rounded: 'rounded-2xl',
  circle: 'rounded-full',
  squircle: 'rounded-[1.4rem]',
  hexagon: 'rounded-xl rotate-45 transform origin-center',
  glass: 'rounded-2xl backdrop-blur-md bg-white/20 border border-white/40 shadow-glass',
};

export const DynamicIconRenderer: React.FC<DynamicIconRendererProps> = ({
  tile,
  size = 48,
  className = '',
}) => {
  // If tile has an uploaded custom logo image or URL
  if (tile.customLogoUrl) {
    const shapeClass = SHAPE_CLASSES[tile.shape] || SHAPE_CLASSES.squircle;
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex items-center justify-center shadow-md overflow-hidden bg-white p-1.5 transition-all duration-200 border border-gray-200/80 ${shapeClass} ${className}`}
      >
        <img
          src={tile.customLogoUrl}
          alt={tile.labelEn || tile.labelAr}
          className="w-full h-full object-contain rounded"
        />
      </div>
    );
  }

  const isDefaultVisual = tile.shape === 'standard' && tile.colorScheme === 'default' && !tile.customIcon;

  // If user kept standard default icon representation
  if (isDefaultVisual) {
    switch (tile.appTargetId) {
      case 'snns-ai':
        return <SnnsAiIcon className={className || 'w-12 h-12'} size={size} />;
      case 'printer':
        return <PrinterAppIcon className={className || 'w-12 h-12'} size={size} />;
      case 'word':
        return <WordIcon className={className || 'w-12 h-12'} size={size} />;
      case 'teams':
        return <TeamsIcon className={className || 'w-12 h-12'} size={size} />;
      case 'onedrive':
        return <OneDriveIcon className={className || 'w-12 h-12'} size={size} />;
      case 'outlook':
        return <OutlookIcon className={className || 'w-12 h-12'} size={size} />;
      case 'copilot':
        return <CopilotIcon className={className || 'w-12 h-12'} size={size} />;
      case 'family-safety':
        return <FamilySafetyIcon className={className || 'w-12 h-12'} size={size} />;
      case 'todo':
        return <ToDoIcon className={className || 'w-12 h-12'} size={size} />;
      case 'onenote':
        return <OneNoteIcon className={className || 'w-12 h-12'} size={size} />;
      case 'powerpoint':
        return <PowerPointIcon className={className || 'w-12 h-12'} size={size} />;
      case 'excel':
        return <ExcelIcon className={className || 'w-12 h-12'} size={size} />;
      case 'more-apps':
        return <MoreAppsIcon className={className || 'w-12 h-12'} size={size} />;
      case 'skype':
        return <SkypeIcon className={className || 'w-12 h-12'} size={size} />;
      case 'designer':
        return <DesignerIcon className={className || 'w-12 h-12'} size={size} />;
      case 'clipchamp':
        return <ClipchampIcon className={className || 'w-12 h-12'} size={size} />;
      case 'calendar':
        return <CalendarIcon className={className || 'w-12 h-12'} size={size} />;
      case 'forms':
        return <FormsSurveyIcon className={className || 'w-12 h-12'} size={size} />;
      case 'marketplace':
        return <MarketplaceIcon className={className || 'w-12 h-12'} size={size} />;
      case 'business':
        return <BusinessIcon className={className || 'w-12 h-12'} size={size} />;
      case 'account':
        return <AccountIcon className={className || 'w-12 h-12'} size={size} />;
      case 'qayd-pos':
        return <QaydPosIcon className={className || 'w-12 h-12'} size={size} />;
      case 'qayd-accounting':
        return <QaydAccountingIcon className={className || 'w-12 h-12'} size={size} />;
      case 'snns-education':
        return <EducationIcon className={className || 'w-12 h-12'} size={size} />;
      case 'snns-calls':
        return <CallsIcon className={className || 'w-12 h-12'} size={size} />;
      case 'snns-chat':
        return <ChatIcon className={className || 'w-12 h-12'} size={size} />;
      default:
        return <WordIcon className={className || 'w-12 h-12'} size={size} />;
    }
  }

  // Custom Shape / Style / Icon rendering
  const styleConfig = COLOR_SCHEME_CLASSES[tile.colorScheme] || COLOR_SCHEME_CLASSES['gradient-blue'];
  const shapeClass = SHAPE_CLASSES[tile.shape] || SHAPE_CLASSES.rounded;

  // Custom Icon symbol if specified
  const CustomIconComponent = tile.customIcon ? CUSTOM_ICON_MAP[tile.customIcon] : null;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shadow-md transition-all duration-200 ${shapeClass} ${styleConfig.bg} ${styleConfig.text} ${className}`}
    >
      <div className={tile.shape === 'hexagon' ? '-rotate-45' : ''}>
        {CustomIconComponent ? (
          <CustomIconComponent className="w-6 h-6 stroke-[2.2]" />
        ) : (
          /* Render scaled default inner graphic */
          <div className="scale-75">
            {tile.appTargetId === 'snns-ai' && <SnnsAiIcon className="w-10 h-10" />}
            {tile.appTargetId === 'printer' && <PrinterAppIcon className="w-10 h-10" />}
            {tile.appTargetId === 'word' && <WordIcon className="w-10 h-10" />}
            {tile.appTargetId === 'excel' && <ExcelIcon className="w-10 h-10" />}
            {tile.appTargetId === 'powerpoint' && <PowerPointIcon className="w-10 h-10" />}
            {tile.appTargetId === 'teams' && <TeamsIcon className="w-10 h-10" />}
            {tile.appTargetId === 'outlook' && <OutlookIcon className="w-10 h-10" />}
            {tile.appTargetId === 'copilot' && <CopilotIcon className="w-10 h-10" />}
            {tile.appTargetId === 'onedrive' && <OneDriveIcon className="w-10 h-10" />}
            {tile.appTargetId === 'todo' && <ToDoIcon className="w-10 h-10" />}
            {tile.appTargetId === 'onenote' && <OneNoteIcon className="w-10 h-10" />}
            {tile.appTargetId === 'designer' && <DesignerIcon className="w-10 h-10" />}
            {tile.appTargetId === 'clipchamp' && <ClipchampIcon className="w-10 h-10" />}
            {tile.appTargetId === 'skype' && <SkypeIcon className="w-10 h-10" />}
            {tile.appTargetId === 'calendar' && <CalendarIcon className="w-10 h-10" />}
            {tile.appTargetId === 'forms' && <FormsSurveyIcon className="w-10 h-10" />}
            {tile.appTargetId === 'marketplace' && <MarketplaceIcon className="w-10 h-10" />}
            {tile.appTargetId === 'business' && <BusinessIcon className="w-10 h-10" />}
            {tile.appTargetId === 'account' && <AccountIcon className="w-10 h-10" />}
            {tile.appTargetId === 'qayd-pos' && <QaydPosIcon className="w-10 h-10" />}
            {tile.appTargetId === 'qayd-accounting' && <QaydAccountingIcon className="w-10 h-10" />}
            {tile.appTargetId === 'snns-education' && <EducationIcon className="w-10 h-10" />}
            {tile.appTargetId === 'snns-calls' && <CallsIcon className="w-10 h-10" />}
            {tile.appTargetId === 'snns-chat' && <ChatIcon className="w-10 h-10" />}
            {tile.appTargetId === 'family-safety' && <FamilySafetyIcon className="w-10 h-10" />}
            {tile.appTargetId === 'more-apps' && <MoreAppsIcon className="w-10 h-10" />}
          </div>
        )}
      </div>
    </div>
  );
};
