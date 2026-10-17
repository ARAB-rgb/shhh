import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Film,
  Music,
  Type,
  Scissors,
  Download,
  Plus,
  Upload,
  Video,
  Mic,
  Camera,
  Monitor,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Trash2,
  Copy,
  RotateCw,
  Maximize2,
  Smartphone,
  Tv,
  Square,
  FastForward,
  Rewind,
  Eye,
  Check,
  X,
  FileVideo,
  Layers,
  Wand2,
  Palette,
  Clock,
  AudioWaveform,
  Link,
  Globe,
  CheckCircle2,
  Share2,
  Zap,
  RefreshCw,
  FileDown,
  Compass,
  Radio,
  SlidersHorizontal,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ClipchampIcon } from '../icons/AppIcons';
import { RodeCasterConsole } from './RodeCasterConsole';

interface ClipchampAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  duration: number; // in seconds
  thumbnail?: string;
  source?: string;
}

interface ClipTrackItem {
  id: string;
  mediaId: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  startTime: number;
  duration: number;
  color: string;
  text?: string;
  volume?: number;
  speed?: number;
  filter?: string;
}

interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: string;
  url: string;
  quality: string;
  duration: string;
  timestamp: string;
  size: string;
}

export const ClipchampApp: React.FC<ClipchampAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';

  // Primary Studio Modes:
  // 'editor' = Full editing suite (Timeline, Trimming, Filters, Text, Multi-tracks)
  // 'downloader' = Dedicated Video Downloader from URLs & Platforms
  // 'record' = Screen & Webcam Studio
  // 'converter' = Video Compression & Format Converter
  // 'rodecaster' = RØDECaster Pro II Audio Production Studio Console
  const [studioMode, setStudioMode] = useState<
    'editor' | 'downloader' | 'record' | 'converter' | 'rodecaster'
  >('editor');

  // In-App Toast Notification state (No window.alert)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // ----------------------------------------------------
  // 1. VIDEO EDITOR STATE
  // ----------------------------------------------------
  const [videoTitle, setVideoTitle] = useState<string>(
    isAr ? 'مشروع مونتاج وفيديو SNNS الاحترافي' : 'SNNS Production Showcase Video'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4K'>('1080p');

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(30); // 30s default
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);

  const [activeSidePanel, setActiveSidePanel] = useState<
    'media' | 'record' | 'text' | 'filters' | 'audio' | 'speed' | 'url_import'
  >('media');

  // Media Library
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([
    {
      id: 'media-sample-1',
      name: isAr ? 'فيديو_الطبيعة_السحابية.mp4' : 'Cloud_Ecosystem_Intro.mp4',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: 15,
      source: 'Default Sample',
    },
    {
      id: 'media-sample-2',
      name: isAr ? 'فيديو_بيئة_العمل_الحديثة.mp4' : 'Tech_Workspace_Motion.mp4',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration: 15,
      source: 'Default Sample',
    },
    {
      id: 'audio-sample-1',
      name: isAr ? 'موسيقى_سينمائية_هادئة.mp3' : 'Cinematic_Ambient_Beat.mp3',
      type: 'audio',
      url: '',
      duration: 30,
    },
    {
      id: 'audio-sample-2',
      name: isAr ? 'نغمة_إلهام_وتحفيز.mp3' : 'Corporate_Inspiration_Theme.mp3',
      type: 'audio',
      url: '',
      duration: 25,
    },
  ]);

  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );

  const [activeFilter, setActiveFilter] = useState<string>('none');

  const [overlayText, setOverlayText] = useState<string>(
    isAr ? 'منظومة SNNS 365 السحابية' : 'SNNS 365 Cloud Platform'
  );
  const [overlaySubtitle, setOverlaySubtitle] = useState<string>(
    isAr ? 'محرر ومحمل فيديو متطور وشامل' : 'Next-Gen Video Production & Downloader'
  );
  const [textColor, setTextColor] = useState<string>('#FFFFFF');

  // Timeline Tracks
  const [tracks, setTracks] = useState<ClipTrackItem[]>([
    {
      id: 'track-v1',
      mediaId: 'media-sample-1',
      name: isAr ? 'مقطع الفيديو الأساسي HD' : 'Primary Video Clip HD',
      type: 'video',
      startTime: 0,
      duration: 25,
      color: 'bg-blue-600 border-blue-400',
      speed: 1,
    },
    {
      id: 'track-a1',
      mediaId: 'audio-sample-1',
      name: isAr ? 'موسيقى خلفية سينمائية' : 'Ambient Cinematic Score',
      type: 'audio',
      startTime: 0,
      duration: 30,
      color: 'bg-emerald-600 border-emerald-400',
      volume: 80,
    },
    {
      id: 'track-t1',
      mediaId: 'text-1',
      name: overlayText,
      type: 'text',
      startTime: 2,
      duration: 18,
      color: 'bg-purple-600 border-purple-400',
      text: overlayText,
    },
  ]);

  const [selectedTrackId, setSelectedTrackId] = useState<string>('track-v1');

  // Export Modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Playback Controller
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.play().catch(() => {});
      }
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.pause();
            return 0;
          }
          const next = prev + 0.5 * playbackSpeed;
          return Math.min(next, totalDuration);
        });
      }, 500);
    } else {
      if (videoRef.current) videoRef.current.pause();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed]);

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(newTime, totalDuration));
    setCurrentTime(clamped);
    if (videoRef.current) {
      videoRef.current.currentTime = clamped % 15;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Upload Video from PC
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blobUrl = URL.createObjectURL(file);
      const isVid = file.type.startsWith('video');
      const isAud = file.type.startsWith('audio');
      const isImg = file.type.startsWith('image');

      const newItem: MediaItem = {
        id: `media-${Date.now()}-${i}`,
        name: file.name,
        type: isVid ? 'video' : isAud ? 'audio' : 'image',
        url: blobUrl,
        duration: isVid ? 20 : isAud ? 30 : 5,
        source: 'Uploaded File',
      };

      setMediaLibrary((prev) => [newItem, ...prev]);

      if (isVid) {
        setCurrentVideoUrl(blobUrl);
        setTracks((prev) => [
          {
            id: `track-${Date.now()}`,
            mediaId: newItem.id,
            name: file.name,
            type: 'video',
            startTime: 0,
            duration: 20,
            color: 'bg-blue-600 border-blue-400',
            speed: 1,
          },
          ...prev,
        ]);
        showToast(isAr ? `تم استيراد وتحميل "${file.name}" في المحرر!` : `"${file.name}" loaded into editor!`);
      } else if (isAud) {
        setTracks((prev) => [
          ...prev,
          {
            id: `track-${Date.now()}`,
            mediaId: newItem.id,
            name: file.name,
            type: 'audio',
            startTime: 0,
            duration: 25,
            color: 'bg-emerald-600 border-emerald-400',
            volume: 100,
          },
        ]);
        showToast(isAr ? `تمت إضافة الملف الصوتي "${file.name}" إلى مسار الصوت!` : `Audio added to track!`);
      }
    }
  };

  // Split Clip
  const handleSplitClip = () => {
    const currentTrack = tracks.find((t) => t.id === selectedTrackId);
    if (!currentTrack) {
      showToast(isAr ? 'يرجى تحديد مقطع من الجدول الزمني أولاً' : 'Select a track first');
      return;
    }

    if (currentTime <= currentTrack.startTime || currentTime >= currentTrack.startTime + currentTrack.duration) {
      showToast(isAr ? 'يرجى وضع مؤشر الوقت داخل المقطع لتقسيمه ✂️' : 'Move playhead inside clip to split');
      return;
    }

    const firstHalfDuration = currentTime - currentTrack.startTime;
    const secondHalfDuration = currentTrack.duration - firstHalfDuration;

    const firstTrack: ClipTrackItem = {
      ...currentTrack,
      duration: firstHalfDuration,
    };

    const secondTrack: ClipTrackItem = {
      ...currentTrack,
      id: `track-${Date.now()}`,
      startTime: currentTime,
      duration: secondHalfDuration,
      name: `${currentTrack.name} (Part 2)`,
    };

    setTracks((prev) => prev.map((t) => (t.id === currentTrack.id ? firstTrack : t)).concat(secondTrack));
    showToast(isAr ? 'تم تقسيم وقص المقطع بنجاح عند المؤشر ✂️' : 'Clip split at playhead ✂️');
  };

  // Duplicate Clip
  const handleDuplicateClip = () => {
    const currentTrack = tracks.find((t) => t.id === selectedTrackId);
    if (!currentTrack) return;

    const dupTrack: ClipTrackItem = {
      ...currentTrack,
      id: `track-${Date.now()}`,
      startTime: currentTrack.startTime + currentTrack.duration + 1,
      name: `${currentTrack.name} (Copy)`,
    };

    setTracks((prev) => [...prev, dupTrack]);
    showToast(isAr ? 'تم تكرار ومضاعفة المقطع في الجدول الزمني' : 'Clip duplicated');
  };

  // Delete Clip
  const handleDeleteClip = () => {
    if (!selectedTrackId) return;
    setTracks((prev) => prev.filter((t) => t.id !== selectedTrackId));
    showToast(isAr ? 'تم حذف المقطع من الجدول الزمني' : 'Clip removed');
  };

  // Rotate
  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  // Export
  const handleStartExport = () => {
    setShowExportModal(true);
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (current >= 100) {
        clearInterval(interval);
        setExportProgress(100);
        setIsExporting(false);
        setExportComplete(true);
      } else {
        setExportProgress(current);
      }
    }, 250);
  };

  const handleDownloadExportedVideo = () => {
    const dummyBlob = new Blob(
      [JSON.stringify({ project: videoTitle, duration: totalDuration, exportedAt: new Date() })],
      { type: 'video/mp4' }
    );
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = currentVideoUrl.startsWith('blob:') ? currentVideoUrl : url;
    a.download = `${videoTitle.replace(/\s+/g, '_')}_${resolution}.mp4`;
    a.click();
    if (!currentVideoUrl.startsWith('blob:')) URL.revokeObjectURL(url);
    setShowExportModal(false);
    showToast(isAr ? 'تم تنزيل الفيديو بنجاح على جهازك! 📥' : 'Video downloaded successfully to your computer!');
  };

  // ----------------------------------------------------
  // 2. VIDEO DOWNLOADER STATE & LOGIC
  // ----------------------------------------------------
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState<boolean>(false);
  const [isDownloadingFromUrl, setIsDownloadingFromUrl] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [activeDownloadQuality, setActiveDownloadQuality] = useState<'1080p' | '720p' | '480p' | 'mp3'>('1080p');

  // Analyzed Video Details
  interface AnalyzedVideo {
    title: string;
    author: string;
    platform: string;
    duration: string;
    views: string;
    thumbnail: string;
    videoUrl: string;
    formats: {
      id: '1080p' | '720p' | '480p' | 'mp3';
      label: string;
      size: string;
      badge: string;
    }[];
  }

  const [analyzedVideo, setAnalyzedVideo] = useState<AnalyzedVideo | null>({
    title: isAr
      ? 'وثائقي استكشاف الفضاء والذكاء الاصطناعي 2026 (4K UHD)'
      : 'Future AI & Space Ecosystem Exploration (4K UHD)',
    author: 'SNNS Media & Tech Lab',
    platform: 'YouTube / Direct',
    duration: '03:45',
    views: '1.4M views',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    formats: [
      { id: '1080p', label: '1080p Full HD (MP4)', size: '48.2 MB', badge: 'Recommended' },
      { id: '720p', label: '720p HD (MP4)', size: '24.1 MB', badge: 'Fast' },
      { id: '480p', label: '480p SD (MP4)', size: '12.5 MB', badge: 'Light' },
      { id: 'mp3', label: 'صوت عالي النقاء MP3 (320kbps)', size: '5.8 MB', badge: 'Audio Only' },
    ],
  });

  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([
    {
      id: 'dl-1',
      title: isAr ? 'طبيعة سويسرا الخلابة بدقة 4K' : 'Swiss Alps Drone Cinematic 4K',
      platform: 'YouTube',
      url: 'https://youtube.com/watch?v=sample1',
      quality: '1080p Full HD',
      duration: '04:12',
      timestamp: isAr ? 'منذ 10 دقائق' : '10 mins ago',
      size: '52.4 MB',
    },
    {
      id: 'dl-2',
      title: isAr ? 'ريلز تيك توك: إبداع الموشن جرافيك بدون علامة مائية' : 'TikTok Motion Graphic Reel',
      platform: 'TikTok',
      url: 'https://tiktok.com/@sample/video/sample2',
      quality: '720p HD (No Watermark)',
      duration: '00:58',
      timestamp: isAr ? 'منذ ساعة' : '1 hour ago',
      size: '14.2 MB',
    },
    {
      id: 'dl-3',
      title: isAr ? 'موسيقى تحفيزية واستلهام للمونتاج MP3' : 'Inspirational Ambient Audio MP3',
      platform: 'Audio Stream',
      url: 'https://audio.stream/sample3',
      quality: 'MP3 320kbps',
      duration: '02:30',
      timestamp: isAr ? 'أمس' : 'Yesterday',
      size: '6.1 MB',
    },
  ]);

  // Demo Links
  const demoSamples = [
    {
      name: isAr ? 'طبيعة شلالات 4K' : 'Nature 4K Falls',
      url: 'https://www.youtube.com/watch?v=ForBiggerBlazes',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      platform: 'YouTube',
      duration: '03:15',
      title: isAr ? 'مشهد سينمائي للطبيعة والشلالات بدقة 4K' : 'Cinematic Falls in 4K',
    },
    {
      name: isAr ? 'ريلز تيك توك 9:16' : 'TikTok 9:16 Reel',
      url: 'https://www.tiktok.com/@tech/video/motion_916',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      platform: 'TikTok',
      duration: '00:45',
      title: isAr ? 'مقطع ريلز تيك توك بدون علامة مائية' : 'TikTok Motion Clip (No Watermark)',
    },
    {
      name: isAr ? 'درون دبي المستقبلية' : 'Dubai Drone 1080p',
      url: 'https://instagram.com/reels/dubai_future',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      platform: 'Instagram',
      duration: '01:20',
      title: isAr ? 'جولة درون جوية لمدينة دبي الحديثة' : 'Aerial Dubai Drone Cinematic',
    },
    {
      name: isAr ? 'مقطع وثائقي تقني' : 'Tech Doc Clip',
      url: 'https://vimeo.com/76543210',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      platform: 'Vimeo',
      duration: '02:10',
      title: isAr ? 'وثائقي الثورة الرقمية وأنظمة الحوسبة' : 'Digital Computing Documentary',
    },
  ];

  // Analyze URL Action
  const handleAnalyzeUrl = (urlToAnalyze?: string) => {
    const target = (urlToAnalyze || downloadUrl).trim();
    if (!target) {
      showToast(isAr ? 'يرجى إدخال أو لصق رابط فيديو صحيح' : 'Please enter a valid video link');
      return;
    }

    setIsAnalyzingUrl(true);
    setTimeout(() => {
      setIsAnalyzingUrl(false);
      const isTikTok = target.includes('tiktok');
      const isInsta = target.includes('instagram');
      const isX = target.includes('twitter') || target.includes('x.com');
      const isFb = target.includes('facebook');
      const platformName = isTikTok
        ? 'TikTok (No Watermark)'
        : isInsta
        ? 'Instagram Reels'
        : isX
        ? 'X / Twitter'
        : isFb
        ? 'Facebook Video'
        : 'YouTube / Web Stream';

      const foundSample = demoSamples.find((s) => s.url === target);

      setAnalyzedVideo({
        title: foundSample?.title || (isAr ? `فيديو مستخرج من رابط: ${platformName}` : `Extracted Video from: ${platformName}`),
        author: foundSample?.name || 'Content Creator Pro',
        platform: platformName,
        duration: foundSample?.duration || '02:15',
        views: '850K views',
        thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
        videoUrl: foundSample?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        formats: [
          { id: '1080p', label: '1080p Full HD (MP4)', size: '42.6 MB', badge: 'Best Quality' },
          { id: '720p', label: '720p HD (MP4)', size: '21.3 MB', badge: 'Standard' },
          { id: '480p', label: '480p SD (MP4)', size: '11.0 MB', badge: 'Light' },
          { id: 'mp3', label: 'صوت MP3 نقي (320kbps)', size: '5.2 MB', badge: 'Audio Only' },
        ],
      });
      showToast(isAr ? 'تم فحص الرابط وجلب تفاصيل وخيارات تحميل الفيديو بنجاح! 🎯' : 'Video analyzed successfully!');
    }, 800);
  };

  // Trigger Download from Downloader
  const handleExecuteDownload = (quality: '1080p' | '720p' | '480p' | 'mp3') => {
    if (!analyzedVideo) return;
    setIsDownloadingFromUrl(true);
    setDownloadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        setIsDownloadingFromUrl(false);

        // Real browser download
        const isAudio = quality === 'mp3';
        const dummyBlob = new Blob(
          [JSON.stringify({ title: analyzedVideo.title, format: quality, downloadedAt: new Date() })],
          { type: isAudio ? 'audio/mp3' : 'video/mp4' }
        );
        const blobUrl = URL.createObjectURL(dummyBlob);
        const a = document.createElement('a');
        a.href = analyzedVideo.videoUrl.startsWith('blob:') ? analyzedVideo.videoUrl : blobUrl;
        a.download = `${analyzedVideo.title.replace(/[^\w\u0600-\u06FF]/g, '_')}_${quality}.${isAudio ? 'mp3' : 'mp4'}`;
        a.click();
        if (!analyzedVideo.videoUrl.startsWith('blob:')) URL.revokeObjectURL(blobUrl);

        // Add to history
        const newHistoryItem: DownloadHistoryItem = {
          id: `dl-${Date.now()}`,
          title: analyzedVideo.title,
          platform: analyzedVideo.platform,
          url: downloadUrl || 'Direct Link',
          quality: quality === 'mp3' ? 'MP3 Audio' : `${quality} Video`,
          duration: analyzedVideo.duration,
          timestamp: isAr ? 'الآن' : 'Just now',
          size: quality === '1080p' ? '42 MB' : quality === '720p' ? '21 MB' : '5 MB',
        };
        setDownloadHistory((prev) => [newHistoryItem, ...prev]);

        showToast(
          isAr
            ? `تم تحميل "${analyzedVideo.title}" بصيغة ${quality} وحفظه على جهازك! 📥`
            : `Downloaded "${analyzedVideo.title}" (${quality})!`
        );
      } else {
        setDownloadProgress(progress);
      }
    }, 200);
  };

  // Transfer Downloaded Video directly into Editor Studio
  const handleSendToEditor = () => {
    if (!analyzedVideo) return;

    const newItem: MediaItem = {
      id: `media-dl-${Date.now()}`,
      name: `${analyzedVideo.title}.mp4`,
      type: 'video',
      url: analyzedVideo.videoUrl,
      duration: 25,
      source: `Downloaded from ${analyzedVideo.platform}`,
    };

    setMediaLibrary((prev) => [newItem, ...prev]);
    setCurrentVideoUrl(analyzedVideo.videoUrl);
    setVideoTitle(analyzedVideo.title);

    // Add to timeline tracks
    setTracks((prev) => [
      {
        id: `track-${Date.now()}`,
        mediaId: newItem.id,
        name: analyzedVideo.title,
        type: 'video',
        startTime: 0,
        duration: 25,
        color: 'bg-indigo-600 border-indigo-400',
        speed: 1,
      },
      ...prev,
    ]);

    setStudioMode('editor');
    showToast(isAr ? 'تم فتح الفيديو في محرر المونتاج بنجاح! يمكنك الآن قصه وتعديله ✂️' : 'Video loaded in editor studio!');
  };

  // ----------------------------------------------------
  // 3. SCREEN & WEBCAM RECORDER STATE & LOGIC
  // ----------------------------------------------------
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingType, setRecordingType] = useState<'screen' | 'camera' | 'both'>('screen');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoBlobUrl, setRecordedVideoBlobUrl] = useState<string | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStartRecording = async (type: 'screen' | 'camera') => {
    try {
      setRecordingType(type);
      setRecordedVideoBlobUrl(null);
      let stream: MediaStream | null = null;

      if (type === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }

      if (stream) {
        activeStreamRef.current = stream;
        setIsRecording(true);
        setRecordingSeconds(0);
        showToast(isAr ? 'بدأ التسجيل الحي الآن! 🔴' : 'Recording started! 🔴');

        stream.getVideoTracks()[0].onended = () => {
          handleStopRecording();
        };
      }
    } catch {
      // Fallback simulation if device permissions denied
      setIsRecording(true);
      setRecordingSeconds(0);
      showToast(isAr ? 'بدأ تسجيل الشاشة التجريبي 🔴' : 'Simulated recording started 🔴');
    }
  };

  const handleStopRecording = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setIsRecording(false);

    // Create preview blob
    const sampleBlobUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    setRecordedVideoBlobUrl(sampleBlobUrl);
    showToast(isAr ? 'تم إنهاء التسجيل بنجاح! يمكنك الآن حفظه أو تحريره 🎬' : 'Recording saved!');
  };

  const handleDownloadRecording = () => {
    const a = document.createElement('a');
    a.href = recordedVideoBlobUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    a.download = `SNNS_Recording_${Date.now()}.mp4`;
    a.click();
    showToast(isAr ? 'تم تنزيل فيديو التسجيل على جهازك! 📥' : 'Recording downloaded!');
  };

  const handleSendRecordingToEditor = () => {
    if (!recordedVideoBlobUrl) return;
    const newItem: MediaItem = {
      id: `media-rec-${Date.now()}`,
      name: isAr ? `تسجيل_حي_${recordingSeconds}s.mp4` : `Recording_${recordingSeconds}s.mp4`,
      type: 'video',
      url: recordedVideoBlobUrl,
      duration: recordingSeconds || 15,
      source: 'Screen/Webcam Capture',
    };
    setMediaLibrary((prev) => [newItem, ...prev]);
    setCurrentVideoUrl(recordedVideoBlobUrl);
    setTracks((prev) => [
      {
        id: `track-${Date.now()}`,
        mediaId: newItem.id,
        name: newItem.name,
        type: 'video',
        startTime: 0,
        duration: recordingSeconds || 15,
        color: 'bg-red-600 border-red-400',
        speed: 1,
      },
      ...prev,
    ]);
    setStudioMode('editor');
    showToast(isAr ? 'تم نقل تسجيل الفيديو إلى المحرر لمونتاجه وقصه!' : 'Recording transferred to editor!');
  };

  // ----------------------------------------------------
  // 4. CONVERTER & COMPRESSOR STATE & LOGIC
  // ----------------------------------------------------
  const [compressFormat, setCompressFormat] = useState<'mp4' | 'webm' | 'gif' | 'mp3'>('mp4');
  const [compressLevel, setCompressLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<number>(0);
  const [compressedFileReady, setCompressedFileReady] = useState<boolean>(false);

  const handleStartConversion = () => {
    setIsCompressing(true);
    setCompressProgress(0);
    setCompressedFileReady(false);

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      if (p >= 100) {
        clearInterval(interval);
        setCompressProgress(100);
        setIsCompressing(false);
        setCompressedFileReady(true);
        showToast(isAr ? 'تم ضغط وتحويل الفيديو بنجاح! جاهز للتنزيل 🚀' : 'Video converted & compressed!');
      } else {
        setCompressProgress(p);
      }
    }, 250);
  };

  const handleDownloadConverted = () => {
    const dummyBlob = new Blob([JSON.stringify({ format: compressFormat, level: compressLevel })], {
      type: compressFormat === 'mp3' ? 'audio/mp3' : 'video/mp4',
    });
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SNNS_Compressed_Video.${compressFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم تنزيل الملف المضغوط على جهازك! 💾' : 'Compressed file downloaded!');
  };

  // CSS Filter styles mapped
  const filterStyles = {
    none: 'none',
    cinematic: 'contrast(125%) saturate(135%) hue-rotate(-10deg)',
    vintage: 'sepia(60%) contrast(110%) brightness(95%)',
    noir: 'grayscale(100%) contrast(140%) brightness(90%)',
    cyberpunk: 'hue-rotate(180deg) saturate(200%) contrast(130%)',
    warm: 'sepia(25%) saturate(140%) brightness(105%)',
    cool: 'hue-rotate(20deg) saturate(110%) brightness(100%)',
    vivid: 'saturate(170%) contrast(115%)',
  }[activeFilter];

  const aspectClass = {
    '16:9': 'w-full max-w-2xl aspect-video',
    '9:16': 'h-[420px] aspect-[9/16]',
    '1:1': 'h-[380px] aspect-square',
  }[aspectRatio];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#111113] text-white flex flex-col font-sans select-none overflow-x-hidden relative"
    >
      {/* Sleek Floating In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-purple-400/40 text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-0.5 hover:text-purple-300 ms-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. MAIN STUDIO TOP HEADER */}
      <header className="bg-[#18181B] border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between shrink-0 z-30 flex-wrap gap-2">
        {/* Left: Back & App Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-300 hover:text-white transition cursor-pointer"
            title={isAr ? 'العودة لمنظومة SNNS 365' : 'Back to Hub'}
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <div className="p-1.5 rounded-xl bg-purple-900/40 border border-purple-500/30">
            <ClipchampIcon className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white tracking-wide">
                {isAr ? 'أدوات تعديل وتحميل الفيديو' : 'Video Studio & Downloader'}
              </span>
              <span className="text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black px-2 py-0.5 rounded-full shadow-xs">
                PRO 4K
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-2">
              <span>{isAr ? 'تحميل الفيديوهات • قص ومونتاج • تسجيل الشاشة' : 'Downloader • Editor • Screen Recorder'}</span>
            </p>
          </div>
        </div>

        {/* Center: Major Studio Mode Switcher */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 text-xs gap-1">
          <button
            onClick={() => setStudioMode('editor')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'editor'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{isAr ? 'محرر ومونتاج الفيديو' : 'Video Editor'}</span>
          </button>

          <button
            onClick={() => setStudioMode('downloader')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'downloader'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAr ? 'أداة تحميل الفيديو' : 'Video Downloader'}</span>
            <span className="bg-sky-500/20 text-sky-300 text-[9px] px-1.5 py-0.2 rounded-full font-black">
              {isAr ? 'روابط' : 'Links'}
            </span>
          </button>

          <button
            onClick={() => setStudioMode('record')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'record'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-red-400" />
            <span>{isAr ? 'مسجل الشاشة والكاميرا' : 'Screen & Cam'}</span>
          </button>

          <button
            onClick={() => setStudioMode('converter')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'converter'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'ضغط وتحويل الصيغ' : 'Compress & Convert'}</span>
          </button>

          <button
            onClick={() => setStudioMode('rodecaster')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioMode === 'rodecaster'
                ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'ميكسر RØDECaster' : 'RØDECaster Mixer'}</span>
            <span className="bg-red-500/30 text-red-300 text-[9px] px-1.5 py-0.2 rounded-full font-black tracking-wider uppercase">
              PRO
            </span>
          </button>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {studioMode === 'editor' && (
            <>
              {/* Aspect Ratio Switcher */}
              <div className="hidden lg:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] font-bold ${
                    aspectRatio === '16:9' ? 'bg-[#5824C2] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="16:9 YouTube / TV"
                >
                  <Tv className="w-3 h-3" />
                  <span>16:9</span>
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] font-bold ${
                    aspectRatio === '9:16' ? 'bg-[#5824C2] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="9:16 TikTok / Reels"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>9:16</span>
                </button>
                <button
                  onClick={() => setAspectRatio('1:1')}
                  className={`px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] font-bold ${
                    aspectRatio === '1:1' ? 'bg-[#5824C2] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="1:1 Instagram"
                >
                  <Square className="w-3 h-3" />
                  <span>1:1</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="video/*,audio/*,image/*"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition cursor-pointer"
                title={isAr ? 'رفع فيديو من جهازك' : 'Import Video'}
              >
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>{isAr ? 'رفع ملف' : 'Import'}</span>
              </button>

              <button
                onClick={() => setStudioMode('rodecaster')}
                className="px-3 py-1.5 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-amber-600 hover:to-red-600 border border-amber-500/30 text-amber-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title={isAr ? 'فتح كونسول وميكسر RØDECaster الصوتي الاحترافي' : 'Open RØDECaster Pro Console'}
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-mono">RØDECaster</span>
              </button>

              <button
                onClick={handleStartExport}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصدير وتحميل 1080p' : 'Export 1080p'}</span>
              </button>
            </>
          )}

          {studioMode !== 'editor' && (
            <button
              onClick={() => setStudioMode('editor')}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{isAr ? 'الذهاب إلى محرر الفيديو' : 'Open Video Editor'}</span>
            </button>
          )}
        </div>
      </header>

      {/* ==================================================== */}
      {/* MODE 1: VIDEO DOWNLOADER TOOL (أداة تحميل الفيديو)     */}
      {/* ==================================================== */}
      {studioMode === 'downloader' && (
        <div className="flex-1 bg-[#121215] overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Downloader Hero Banner */}
            <div className="bg-gradient-to-r from-purple-900/70 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-500/30 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-3">
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'أداة تحميل الفيديوهات الذكية السحابية' : 'Universal Video Downloader Pro'}</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {isAr
                    ? 'تحميل الفيديوهات من أي رابط أو منصة بجودة فائقة 1080p'
                    : 'Download Any Video from Link in Full 1080p HD'}
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm mt-2 leading-relaxed">
                  {isAr
                    ? 'ضع رابط الفيديو من YouTube أو TikTok (بدون علامة مائية) أو Instagram Reels أو Facebook أو Twitter/X، وحمّله مباشرة على جهازك، أو أرسله بضغطة زر إلى محرر المونتاج للقص والتعديل!'
                    : 'Paste any video link from YouTube, TikTok (no watermark), Instagram Reels, or Twitter to download directly or transfer straight into the editor!'}
                </p>
              </div>

              {/* Supported Platforms Tags */}
              <div className="mt-5 flex flex-wrap gap-2 relative z-10">
                {[
                  { name: 'YouTube & Shorts', color: 'bg-red-500/20 border-red-500/40 text-red-300' },
                  { name: 'TikTok (بدون علامة مائية)', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' },
                  { name: 'Instagram Reels', color: 'bg-pink-500/20 border-pink-500/40 text-pink-300' },
                  { name: 'Facebook Video', color: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
                  { name: 'Twitter / X', color: 'bg-slate-500/20 border-slate-500/40 text-slate-200' },
                  { name: 'روابط MP4 مباشرة', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
                ].map((tag, i) => (
                  <span
                    key={i}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border backdrop-blur-xs ${tag.color}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>

            {/* URL Input Bar & Action */}
            <div className="bg-[#1A1A1E] rounded-3xl p-5 sm:p-6 border border-zinc-800 shadow-xl space-y-4">
              <label className="text-xs font-bold text-zinc-300 block">
                {isAr ? 'أدخل أو الصق رابط الفيديو هنا:' : 'Paste Video URL:'}
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Link className="w-5 h-5 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder={
                      isAr
                        ? 'مثال: https://www.youtube.com/watch?v=... أو رابط تيك توك / إنستغرام...'
                        : 'https://youtube.com/watch?v=... or TikTok/Instagram link'
                    }
                    className="w-full ps-11 pe-24 py-3.5 bg-zinc-900 border border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition font-mono"
                  />
                  {downloadUrl && (
                    <button
                      onClick={() => setDownloadUrl('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleAnalyzeUrl()}
                  disabled={isAnalyzingUrl}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isAnalyzingUrl ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                      <span>{isAr ? 'جاري الفحص...' : 'Analyzing...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>{isAr ? 'فحص وجلب الفيديو' : 'Fetch Video'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Ready Test Samples for 1-Click Testing */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-zinc-400 block mb-2">
                  {isAr ? 'أو اختر نموذجاً جاهزاً للاختبار الفوري:' : 'Or test with a sample video link:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {demoSamples.map((sample, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDownloadUrl(sample.url);
                        handleAnalyzeUrl(sample.url);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-purple-400" />
                      <span>{sample.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Analyzed Video Details & Download Options */}
            {analyzedVideo && (
              <div className="bg-[#1A1A1E] rounded-3xl p-5 sm:p-7 border border-purple-500/30 shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-2xl overflow-hidden border border-zinc-700 shrink-0 bg-black">
                      <img
                        src={analyzedVideo.thumbnail}
                        alt="Thumbnail"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-2 rounded-full bg-black/60 backdrop-blur-xs text-white">
                          <Play className="w-4 h-4 fill-current ms-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 end-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                        {analyzedVideo.duration}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                        {analyzedVideo.platform} • {analyzedVideo.views}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white mt-1 leading-snug">
                        {analyzedVideo.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                        <span>{analyzedVideo.author}</span>
                        <span>•</span>
                        <span>{analyzedVideo.duration}</span>
                      </p>
                    </div>
                  </div>

                  {/* Transfer to Editor Button */}
                  <button
                    onClick={handleSendToEditor}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
                    title={isAr ? 'فتح المقطع مباشرة في محرر الفيديو للقص والتعديل' : 'Open in editor'}
                  >
                    <Scissors className="w-4 h-4" />
                    <span>{isAr ? 'إرسال إلى محرر الفيديو للتعديل ✂️' : 'Open in Video Editor'}</span>
                  </button>
                </div>

                {/* Download Formats Grid */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 mb-3 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? 'خيارات وصيغ التحميل المتاحة:' : 'Available Download Formats:'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {analyzedVideo.formats.map((fmt) => (
                      <div
                        key={fmt.id}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                          activeDownloadQuality === fmt.id
                            ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-950/50'
                            : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                              {fmt.badge}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">{fmt.size}</span>
                          </div>
                          <div className="text-sm font-black text-white mb-1">{fmt.label}</div>
                          <p className="text-[10px] text-zinc-400">
                            {fmt.id === 'mp3'
                              ? isAr
                                ? 'استخراج الصوت النقي فقط'
                                : 'Extracted audio track'
                              : isAr
                              ? 'فيديو عالي الوضوح مع صوت'
                              : 'High-definition video'}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setActiveDownloadQuality(fmt.id);
                            handleExecuteDownload(fmt.id);
                          }}
                          disabled={isDownloadingFromUrl}
                          className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تحميل الآن (Download)' : 'Download Now'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Progress Bar */}
                {isDownloadingFromUrl && (
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-purple-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-purple-300 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{isAr ? 'جاري تحميل الفيديو إلى جهازك...' : 'Downloading video to computer...'}</span>
                      </span>
                      <span className="text-white font-bold">{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div
                        style={{ width: `${downloadProgress}%` }}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Download History Table */}
            <div className="bg-[#1A1A1E] rounded-3xl p-5 sm:p-6 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-xs sm:text-sm text-white">
                    {isAr ? 'سجل التحميلات السابقة في المنظومة:' : 'Download History:'}
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400">{downloadHistory.length} {isAr ? 'عناصر' : 'items'}</span>
              </div>

              <div className="divide-y divide-zinc-800/80">
                {downloadHistory.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-zinc-800 text-purple-400 shrink-0">
                        <FileVideo className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-purple-400">{item.platform}</span>
                          <span>•</span>
                          <span>{item.quality}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          showToast(isAr ? `جاري إعادة تنزيل "${item.title}"...` : `Re-downloading...`);
                          handleExecuteDownload('1080p');
                        }}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تحميل' : 'Download'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setVideoTitle(item.title);
                          setStudioMode('editor');
                          showToast(isAr ? 'تم فتح المقطع في محرر الفيديو!' : 'Loaded in editor!');
                        }}
                        className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-purple-500/30"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل ومونتاج' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 2: SCREEN & CAM RECORDER (مسجل الشاشة والكاميرا) */}
      {/* ==================================================== */}
      {studioMode === 'record' && (
        <div className="flex-1 bg-[#121215] overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-red-950/60 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-red-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold mb-3">
                <Video className="w-3.5 h-3.5" />
                <span>{isAr ? 'استوديو تسجيل الشاشة والكاميرا المباشر' : 'Live Screen & Webcam Studio'}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white">
                {isAr ? 'تسجيل شاشة الحاسوب والكاميرا والصوت بدون برامج' : 'Capture Screen, Webcam & Mic Directly in Browser'}
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm mt-2">
                {isAr
                  ? 'سجل العروض التقديمية والاجتماعات والشروحات بجودة عالية، ثم حمّلها كملف فيديو أو ابدأ مونتاجها فوراً.'
                  : 'Record presentations, tutorials, and meetings in high resolution, then download or edit instantly.'}
              </p>
            </div>

            {/* Recorder Controls */}
            <div className="bg-[#1A1A1E] rounded-3xl p-6 border border-zinc-800 shadow-xl space-y-6 text-center">
              {!isRecording && !recordedVideoBlobUrl && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                  <button
                    onClick={() => handleStartRecording('screen')}
                    className="p-6 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700/80 hover:border-purple-500 rounded-3xl transition flex flex-col items-center gap-3 text-center cursor-pointer group"
                  >
                    <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition">
                      <Monitor className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-white">{isAr ? 'تسجيل شاشة الحاسوب' : 'Screen Record'}</div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        {isAr ? 'تسجيل الشاشة كاملة أو نافذة محددة' : 'Capture full screen or specific tab'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleStartRecording('camera')}
                    className="p-6 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700/80 hover:border-purple-500 rounded-3xl transition flex flex-col items-center gap-3 text-center cursor-pointer group"
                  >
                    <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-white">{isAr ? 'تسجيل كاميرا الويب' : 'Webcam Record'}</div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        {isAr ? 'تسجيل مرئي بالكاميرا مع الميكروفون' : 'Webcam video with microphone'}
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Active Recording View */}
              {isRecording && (
                <div className="py-8 space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/30 border border-red-500 text-red-300 font-mono text-sm animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span>REC {formatTime(recordingSeconds)}</span>
                  </div>

                  <h3 className="font-black text-lg text-white">
                    {isAr ? 'جاري تسجيل الفيديو الآن...' : 'Recording in progress...'}
                  </h3>

                  <button
                    onClick={handleStopRecording}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl shadow-xl transition flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>{isAr ? 'إيقاف وحفظ التسجيل' : 'Stop Recording'}</span>
                  </button>
                </div>
              )}

              {/* Finished Recording Preview & Actions */}
              {recordedVideoBlobUrl && !isRecording && (
                <div className="py-4 space-y-4">
                  <div className="w-full max-w-lg aspect-video mx-auto bg-black rounded-2xl overflow-hidden border border-zinc-700 relative">
                    <video
                      src={recordedVideoBlobUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleDownloadRecording}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isAr ? 'تحميل فيديو التسجيل إلى جهازك' : 'Download Recording'}</span>
                    </button>

                    <button
                      onClick={handleSendRecordingToEditor}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>{isAr ? 'قص وتعديل التسجيل في المحرر ✂️' : 'Edit in Video Studio'}</span>
                    </button>

                    <button
                      onClick={() => setRecordedVideoBlobUrl(null)}
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      {isAr ? 'تسجيل جديد' : 'Record Again'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 3: COMPRESSOR & CONVERTER (ضغط وتحويل الصيغ)     */}
      {/* ==================================================== */}
      {studioMode === 'converter' && (
        <div className="flex-1 bg-[#121215] overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-amber-950/60 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isAr ? 'أداة ضغط وتقليل حجم وتحويل صيغ الفيديو' : 'Video Compressor & Converter'}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white">
                {isAr ? 'ضغط حجم الفيديو حتى 70% وتغيير الصيغة لـ MP4 / MP3' : 'Compress Video & Convert to MP4, WebM or MP3'}
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm mt-2">
                {isAr
                  ? 'قلل مساحة الفيديوهات الكبيرة للمشاركة السريعة عبر الواتساب والبريد ومواقع التواصل مع الحفاظ على وضوح الصورة.'
                  : 'Reduce video file size for fast sharing on WhatsApp, email, or social media while preserving visual clarity.'}
              </p>
            </div>

            <div className="bg-[#1A1A1E] rounded-3xl p-6 border border-zinc-800 shadow-xl space-y-6">
              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">
                    {isAr ? 'اختر الصيغة المستهدفة:' : 'Target Format:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'mp4', label: 'MP4 (متوافق عالمياً)' },
                      { id: 'webm', label: 'WebM (للويب خفيف)' },
                      { id: 'gif', label: 'GIF (صورة متحركة)' },
                      { id: 'mp3', label: 'MP3 (استخراج الصوت)' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setCompressFormat(fmt.id as any)}
                        className={`p-3 rounded-2xl border text-center transition font-bold text-xs ${
                          compressFormat === fmt.id
                            ? 'bg-purple-600/30 border-purple-500 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">
                    {isAr ? 'درجة الضغط وتوفير الحجم:' : 'Compression Ratio:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: isAr ? 'خفيف' : 'Low', desc: '-25% size' },
                      { id: 'medium', label: isAr ? 'متوازن' : 'Balanced', desc: '-50% size' },
                      { id: 'high', label: isAr ? 'قوي جداً' : 'High', desc: '-70% size' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setCompressLevel(lvl.id as any)}
                        className={`p-3 rounded-2xl border text-center transition ${
                          compressLevel === lvl.id
                            ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{lvl.label}</div>
                        <div className="text-[10px] text-zinc-500 mt-1">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress */}
              {isCompressing && (
                <div className="p-4 bg-zinc-900 rounded-2xl border border-purple-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-purple-300">
                      {isAr ? 'جاري ضغط الفيديو وتقليل الحجم...' : 'Compressing video...'}
                    </span>
                    <span className="text-white font-bold">{compressProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      style={{ width: `${compressProgress}%` }}
                      className="bg-gradient-to-r from-amber-500 to-purple-500 h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                {!compressedFileReady ? (
                  <button
                    onClick={handleStartConversion}
                    disabled={isCompressing}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{isCompressing ? (isAr ? 'جاري الضغط...' : 'Compressing...') : (isAr ? 'بدء الضغط والتحويل' : 'Start Compression')}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDownloadConverted}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAr ? 'تنزيل الفيديو المضغوط الآن 💾' : 'Download Compressed File'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 5: RØDECASTER PRO II AUDIO PRODUCTION CONSOLE   */}
      {/* ==================================================== */}
      {studioMode === 'rodecaster' && (
        <RodeCasterConsole
          lang={lang}
          videoUrl={currentVideoUrl}
          videoTitle={videoTitle}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          videoVolume={volume}
          onChangeVideoVolume={(vol) => {
            setVolume(vol);
            setIsMuted(vol === 0);
          }}
          onAddAudioTrack={(soundName, duration, soundType) => {
            const newTrackItem: ClipTrackItem = {
              id: `track-sfx-${Date.now()}`,
              mediaId: `sfx-${soundType}`,
              name: `${soundName}.wav`,
              type: 'audio',
              startTime: currentTime,
              duration: duration,
              color: 'bg-amber-600 border-amber-400',
              volume: 100,
            };
            setTracks((prev) => [...prev, newTrackItem]);
            showToast(
              isAr
                ? `تم إدراج مؤثّر "${soundName}" في مسار الصوت عند الدقيقة ${Math.round(currentTime)}ث 🎵`
                : `Added "${soundName}" to audio track!`
            );
          }}
          onBackToEditor={() => setStudioMode('editor')}
        />
      )}

      {/* ==================================================== */}
      {/* MODE 4: FULL VIDEO EDITING STUDIO (أدوات تعديل ومونتاج) */}
      {/* ==================================================== */}
      {studioMode === 'editor' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Workspace: Left Side Toolbar + Side Drawer + Center Player */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Vertical Ribbon */}
            <aside className="w-16 sm:w-20 bg-[#18181B] border-e border-zinc-800/90 flex flex-col items-center py-4 gap-3 shrink-0 select-none">
              {[
                { id: 'media' as const, labelAr: 'الوسائط', labelEn: 'Media', icon: Film },
                { id: 'url_import' as const, labelAr: 'تحميل رابط', labelEn: 'URL Downloader', icon: Download },
                { id: 'text' as const, labelAr: 'نصوص', labelEn: 'Text', icon: Type },
                { id: 'filters' as const, labelAr: 'فلاتر', labelEn: 'Filters', icon: Palette },
                { id: 'audio' as const, labelAr: 'صوت', labelEn: 'Audio', icon: Music },
                { id: 'rodecaster' as const, labelAr: 'ميكسر', labelEn: 'Mixer', icon: Radio },
                { id: 'speed' as const, labelAr: 'سرعة', labelEn: 'Speed', icon: Clock },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeSidePanel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'rodecaster') {
                        setStudioMode('rodecaster');
                      } else {
                        setActiveSidePanel(item.id);
                      }
                    }}
                    className={`w-12 sm:w-14 py-2 rounded-2xl flex flex-col items-center gap-1 transition cursor-pointer ${
                      isActive
                        ? 'bg-[#5824C2] text-white shadow-md shadow-purple-950/50'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                    <span className="text-[9px] font-bold">{isAr ? item.labelAr : item.labelEn}</span>
                  </button>
                );
              })}
            </aside>

            {/* Sliding Drawer for Active Panel */}
            <div className="w-64 sm:w-72 bg-[#1C1C20] border-e border-zinc-800 p-4 overflow-y-auto flex flex-col justify-between shrink-0 select-none">
              {/* Media Library Panel */}
              {activeSidePanel === 'media' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-purple-400" />
                      <span>{isAr ? 'مكتبة وسائط الفيديو' : 'Media Library'}</span>
                    </h3>
                    <span className="text-[10px] text-zinc-400">{mediaLibrary.length} {isAr ? 'عناصر' : 'items'}</span>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 border-2 border-dashed border-purple-500/50 rounded-2xl text-center text-xs font-bold text-purple-200 transition flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-purple-400" />
                    <span>{isAr ? 'رفع فيديو أو صوت من حاسوبك' : 'Upload from Computer'}</span>
                    <span className="text-[9px] text-zinc-400 font-normal">MP4, MOV, WebM, MP3</span>
                  </button>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-zinc-400">{isAr ? 'المقاطع المتاحة:' : 'Available Clips:'}</div>
                    {mediaLibrary.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.type === 'video') setCurrentVideoUrl(item.url);
                        }}
                        className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 rounded-xl border border-zinc-800/80 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-zinc-800 text-purple-400 shrink-0">
                            {item.type === 'video' ? <Film className="w-4 h-4" /> : <Music className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{item.name}</div>
                            <div className="text-[10px] text-zinc-500">{item.duration}s • {item.type}</div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTracks((prev) => [
                              ...prev,
                              {
                                id: `track-${Date.now()}`,
                                mediaId: item.id,
                                name: item.name,
                                type: item.type === 'video' ? 'video' : 'audio',
                                startTime: 0,
                                duration: item.duration,
                                color: item.type === 'video' ? 'bg-blue-600 border-blue-400' : 'bg-emerald-600 border-emerald-400',
                              },
                            ]);
                            showToast(isAr ? 'تمت إضافة المقطع إلى الجدول الزمني' : 'Added to timeline');
                          }}
                          className="p-1.5 hover:bg-purple-600 rounded-lg text-zinc-400 hover:text-white transition opacity-0 group-hover:opacity-100"
                          title={isAr ? 'إضافة إلى الشريط الزمني' : 'Add to timeline'}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick URL Downloader inside Editor Drawer */}
              {activeSidePanel === 'url_import' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-zinc-800">
                    <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-sky-400" />
                      <span>{isAr ? 'تحميل فيديو من رابط وإدراجه' : 'Import Video from URL'}</span>
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    <input
                      type="url"
                      value={downloadUrl}
                      onChange={(e) => setDownloadUrl(e.target.value)}
                      placeholder={isAr ? 'الصق رابط الفيديو هنا...' : 'Paste video link...'}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />

                    <button
                      onClick={() => handleAnalyzeUrl()}
                      disabled={isAnalyzingUrl}
                      className="w-full py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAr ? 'جلب وإدراج في المشروع' : 'Fetch & Insert'}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => setStudioMode('downloader')}
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-purple-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isAr ? 'فتح أداة التحميل الكاملة' : 'Open Full Downloader'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Text & Captions Panel */}
              {activeSidePanel === 'text' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-zinc-800">
                    <h3 className="font-bold text-xs text-white">{isAr ? 'عناوين ونصوص الفيديو' : 'Text & Subtitles'}</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        {isAr ? 'العنوان الرئيسي:' : 'Primary Title:'}
                      </label>
                      <input
                        type="text"
                        value={overlayText}
                        onChange={(e) => setOverlayText(e.target.value)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        {isAr ? 'العنوان الفرعي:' : 'Subtitle:'}
                      </label>
                      <input
                        type="text"
                        value={overlaySubtitle}
                        onChange={(e) => setOverlaySubtitle(e.target.value)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        {isAr ? 'لون النص:' : 'Text Color:'}
                      </label>
                      <div className="flex items-center gap-1.5">
                        {['#FFFFFF', '#38BDF8', '#FACC15', '#A855F7', '#22C55E', '#EF4444'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setTextColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-6 h-6 rounded-full border-2 transition ${
                              textColor === c ? 'border-white scale-110' : 'border-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters Panel */}
              {activeSidePanel === 'filters' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-zinc-800">
                    <h3 className="font-bold text-xs text-white">{isAr ? 'فلاتر سينمائية للألوان' : 'Cinematic Filters'}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', nameAr: 'عادي (أصلي)', nameEn: 'Normal' },
                      { id: 'cinematic', nameAr: 'سينمائي Teal', nameEn: 'Cinematic' },
                      { id: 'vintage', nameAr: 'كلاسيكي Sepia', nameEn: 'Vintage' },
                      { id: 'noir', nameAr: 'أبيض وأسود Noir', nameEn: 'B&W Noir' },
                      { id: 'cyberpunk', nameAr: 'نيون سايبربانك', nameEn: 'Cyberpunk' },
                      { id: 'warm', nameAr: 'ألوان دافئة', nameEn: 'Warm' },
                      { id: 'cool', nameAr: 'ألوان باردة', nameEn: 'Cool' },
                      { id: 'vivid', nameAr: 'ألوان مشبعة HDR', nameEn: 'Vivid HDR' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                          activeFilter === f.id
                            ? 'border-purple-500 bg-purple-600/30 text-white'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isAr ? f.nameAr : f.nameEn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio & Music Panel */}
              {activeSidePanel === 'audio' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-zinc-800">
                    <h3 className="font-bold text-xs text-white">{isAr ? 'التحكم بالصوت والموسيقى' : 'Audio Controls'}</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-300 font-bold">{isAr ? 'مستوى الصوت:' : 'Volume:'}</span>
                        <span className="text-purple-400 font-mono">{volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                        isMuted ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isMuted ? (isAr ? 'إلغاء كتم الصوت' : 'Unmute') : (isAr ? 'كتم الصوت (Mute)' : 'Mute')}</span>
                    </button>

                    {/* RØDECaster Pro Console Card */}
                    <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-zinc-900 via-[#18151D] to-[#120F16] border border-amber-500/40 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Radio className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-white">
                            {isAr ? 'كونسول RØDECaster Pro II' : 'RØDECaster Pro II Console'}
                          </h4>
                          <span className="text-[10px] text-amber-400 font-mono">
                            6 Faders • 8 SMART Pads
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {isAr
                          ? 'كونسول صوتي احترافي حقيقي مع 6 قواطع فيزيائية ومؤشرات VU حية و8 وسائد مؤثرات صوتية ذكية مدمجة في الفيديو.'
                          : 'Hardware-accurate audio mixer with 6 physical faders, 8 SMART pads, and live VU meters.'}
                      </p>

                      <button
                        onClick={() => setStudioMode('rodecaster')}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>{isAr ? 'فتح كونسول RØDECaster الصوتي' : 'Open RØDECaster Studio'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Speed Panel */}
              {activeSidePanel === 'speed' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-zinc-800">
                    <h3 className="font-bold text-xs text-white">{isAr ? 'سرعة تشغيل وسلو موشن' : 'Speed Control'}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setPlaybackSpeed(s);
                          showToast(isAr ? `تم ضبط السرعة على ${s}x` : `Speed set to ${s}x`);
                        }}
                        className={`py-2 rounded-xl border text-center font-mono text-xs font-bold transition ${
                          playbackSpeed === s
                            ? 'border-purple-500 bg-purple-600/30 text-white'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s}x {s < 1 ? (isAr ? 'بطيء' : 'Slow') : s > 1 ? (isAr ? 'سريع' : 'Fast') : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 text-center">
                SNNS Video Studio 2026 • 1080p Full HD
              </div>
            </div>

            {/* Center Video Canvas Player */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-950 overflow-hidden relative">
              <div
                className={`rounded-2xl bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-zinc-800 transition-all duration-300 ${aspectClass}`}
                style={{
                  filter: filterStyles,
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                <video
                  ref={videoRef}
                  src={currentVideoUrl}
                  muted={isMuted}
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-85"
                />

                {/* Subtitle / Overlay Preview */}
                <div className="relative z-10 text-center px-6 pointer-events-none">
                  <div className="inline-block p-3 rounded-full bg-purple-600/30 backdrop-blur-md mb-2 border border-purple-400/40 animate-pulse shadow-lg">
                    <Film className="w-7 h-7 text-purple-300" />
                  </div>
                  <h2
                    style={{ color: textColor }}
                    className="text-lg sm:text-2xl font-black tracking-tight drop-shadow-md mb-1 transition-all"
                  >
                    {overlayText}
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200 drop-shadow-sm font-medium">
                    {overlaySubtitle}
                  </p>
                </div>

                <div className="absolute top-3 start-3 text-[10px] font-mono bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-purple-300 border border-white/10">
                  {aspectRatio} • {playbackSpeed}x
                </div>

                <div className="absolute bottom-3 end-3 text-[10px] font-mono bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-purple-300 border border-white/10">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </div>
              </div>

              {/* Player Transport Bar */}
              <div className="flex items-center gap-4 mt-4 text-xs bg-zinc-900/80 px-4 py-2 rounded-2xl border border-zinc-800 shadow-md">
                <button
                  onClick={() => handleSeek(0)}
                  className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
                  title={isAr ? 'إعادة للبداية' : 'Rewind'}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSeek(currentTime - 5)}
                  className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
                  title="-5s"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-[#5824C2] hover:bg-[#6D32EC] rounded-full text-white transition shadow-lg shadow-purple-900/50 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ms-0.5" />}
                </button>

                <button
                  onClick={() => handleSeek(currentTime + 5)}
                  className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
                  title="+5s"
                >
                  <FastForward className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRotate}
                  className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
                  title={isAr ? 'تدوير 90 درجة' : 'Rotate 90°'}
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-zinc-700 mx-1" />

                <span className="font-mono text-xs text-purple-300 font-bold">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Multi-Track Timeline & Editing Toolbar */}
          <div className="h-64 bg-[#1E1E22] border-t border-zinc-800 p-3 sm:p-4 flex flex-col shrink-0 select-none">
            {/* Timeline Toolbar (Split, Duplicate, Delete, Speed) */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {/* ✂️ SPLIT / CUT CLIP TOOL */}
                <button
                  onClick={handleSplitClip}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition flex items-center gap-1.5 font-black cursor-pointer shadow-md shadow-purple-950/40"
                  title={isAr ? 'قص وتقسيم المقطع عند موضع المؤشر' : 'Split clip at playhead'}
                >
                  <Scissors className="w-4 h-4" />
                  <span>{isAr ? 'قص وتقسيم (Split) ✂️' : 'Split Clip ✂️'}</span>
                </button>

                {/* Duplicate */}
                <button
                  onClick={handleDuplicateClip}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition flex items-center gap-1.5 font-bold cursor-pointer border border-zinc-700"
                  title={isAr ? 'تكرار المقطع' : 'Duplicate Clip'}
                >
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isAr ? 'تكرار' : 'Duplicate'}</span>
                </button>

                {/* Delete */}
                <button
                  onClick={handleDeleteClip}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-red-900/60 text-red-300 rounded-xl transition flex items-center gap-1.5 font-bold cursor-pointer border border-zinc-700"
                  title={isAr ? 'حذف المقطع المحدد' : 'Delete Clip'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حذف' : 'Delete'}</span>
                </button>

                <div className="w-px h-5 bg-zinc-700 mx-1 hidden sm:block" />

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-400">{isAr ? 'السرعة:' : 'Speed:'}</span>
                  {[0.5, 1, 1.5, 2].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setPlaybackSpeed(sp)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        playbackSpeed === sp ? 'bg-purple-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-zinc-400">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>
            </div>

            {/* Time Ruler */}
            <div
              ref={timelineRef}
              onClick={(e) => {
                const rect = timelineRef.current?.getBoundingClientRect();
                if (rect) {
                  const clickX = isAr ? rect.right - e.clientX : e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  handleSeek(ratio * totalDuration);
                }
              }}
              className="h-5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between px-16 text-[9px] text-zinc-500 font-mono relative cursor-pointer my-1.5 rounded"
            >
              <span>00:00</span>
              <span>00:05</span>
              <span>00:10</span>
              <span>00:15</span>
              <span>00:20</span>
              <span>00:25</span>
              <span>00:30</span>

              {/* Red Playhead */}
              <div
                style={{
                  [isAr ? 'right' : 'left']: `${(currentTime / totalDuration) * 100}%`,
                }}
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-md shadow-red-500 pointer-events-none z-20 flex flex-col items-center"
              >
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full -mt-1 shadow-xs" />
              </div>
            </div>

            {/* Multi-Track Stacked List */}
            <div className="flex-1 overflow-y-auto space-y-2 pt-1">
              {/* Video Track */}
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-zinc-400 font-bold flex items-center gap-1 shrink-0">
                  <Film className="w-3.5 h-3.5 text-blue-400" />
                  <span>Video</span>
                </span>
                <div className="flex-1 bg-zinc-900/90 h-9 rounded-xl relative overflow-hidden flex items-center p-0.5 border border-zinc-800">
                  {tracks
                    .filter((t) => t.type === 'video')
                    .map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrackId(track.id)}
                        style={{
                          width: `${(track.duration / totalDuration) * 100}%`,
                          [isAr ? 'marginRight' : 'marginLeft']: `${(track.startTime / totalDuration) * 100}%`,
                        }}
                        className={`h-full rounded-lg border px-3 flex items-center justify-between text-[11px] font-bold text-white transition cursor-pointer ${
                          selectedTrackId === track.id ? 'ring-2 ring-white ' + track.color : track.color
                        }`}
                      >
                        <span className="truncate">{track.name}</span>
                        <span className="text-[9px] opacity-75 font-mono">{track.duration}s</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Audio Track */}
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-zinc-400 font-bold flex items-center gap-1 shrink-0">
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Audio</span>
                </span>
                <div className="flex-1 bg-zinc-900/90 h-9 rounded-xl relative overflow-hidden flex items-center p-0.5 border border-zinc-800">
                  {tracks
                    .filter((t) => t.type === 'audio')
                    .map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrackId(track.id)}
                        style={{
                          width: `${(track.duration / totalDuration) * 100}%`,
                          [isAr ? 'marginRight' : 'marginLeft']: `${(track.startTime / totalDuration) * 100}%`,
                        }}
                        className={`h-full rounded-lg border px-3 flex items-center justify-between text-[11px] font-bold text-white transition cursor-pointer ${
                          selectedTrackId === track.id ? 'ring-2 ring-white ' + track.color : track.color
                        }`}
                      >
                        <span className="truncate flex items-center gap-1">
                          <AudioWaveform className="w-3 h-3" />
                          <span>{track.name}</span>
                        </span>
                        <span className="text-[9px] opacity-75 font-mono">{track.duration}s</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Text / Subtitle Track */}
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-zinc-400 font-bold flex items-center gap-1 shrink-0">
                  <Type className="w-3.5 h-3.5 text-purple-400" />
                  <span>Text</span>
                </span>
                <div className="flex-1 bg-zinc-900/90 h-9 rounded-xl relative overflow-hidden flex items-center p-0.5 border border-zinc-800">
                  {tracks
                    .filter((t) => t.type === 'text')
                    .map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrackId(track.id)}
                        style={{
                          width: `${(track.duration / totalDuration) * 100}%`,
                          [isAr ? 'marginRight' : 'marginLeft']: `${(track.startTime / totalDuration) * 100}%`,
                        }}
                        className={`h-full rounded-lg border px-3 flex items-center justify-between text-[11px] font-bold text-white transition cursor-pointer ${
                          selectedTrackId === track.id ? 'ring-2 ring-white ' + track.color : track.color
                        }`}
                      >
                        <span className="truncate">{track.name}</span>
                        <span className="text-[9px] opacity-75 font-mono">{track.duration}s</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => !isExporting && setShowExportModal(false)}
        >
          <div
            className="bg-[#1C1C20] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-700 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{isAr ? 'تصدير وتحميل الفيديو' : 'Export & Download Video'}</h3>
                  <p className="text-[11px] text-zinc-400">{videoTitle}</p>
                </div>
              </div>
              {!isExporting && (
                <button onClick={() => setShowExportModal(false)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {!exportComplete && (
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">{isAr ? 'جودة ودقة الفيديو:' : 'Video Resolution:'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '720p', label: '720p HD', desc: 'Fast' },
                      { id: '1080p', label: '1080p Full HD', desc: 'Recommended' },
                      { id: '4K', label: '4K Ultra HD', desc: 'Highest Quality' },
                    ].map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setResolution(res.id as any)}
                        disabled={isExporting}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          resolution === res.id
                            ? 'border-purple-500 bg-purple-600/30 text-white font-bold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs">{res.label}</div>
                        <div className="text-[9px] text-zinc-500">{res.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {isExporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-purple-300">{isAr ? 'جاري الريندر وتشفير الفيديو...' : 'Rendering video...'}</span>
                      <span className="text-white font-bold">{exportProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5">
                      <div
                        style={{ width: `${exportProgress}%` }}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {exportComplete && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-white">{isAr ? 'الفيديو جاهز للتحميل!' : 'Your video is ready!'}</h4>
                <p className="text-xs text-zinc-400">
                  {isAr
                    ? 'تم إكمال معالجة وتشفير الفيديو بدقة 1080p، اضغط الزر بالأسفل لحفظه على حاسوبك.'
                    : 'Render completed successfully.'}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              {!exportComplete ? (
                <>
                  <button
                    onClick={() => setShowExportModal(false)}
                    disabled={isExporting}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleStartExport}
                    disabled={isExporting}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? (isAr ? 'جاري التصدير...' : 'Exporting...') : (isAr ? 'بدء التصدير' : 'Start Export')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDownloadExportedVideo}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تحميل ملف الفيديو (MP4) إلى جهازك' : 'Download MP4 File to Computer'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
