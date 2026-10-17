import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Users,
  Check,
  Globe,
  Lock,
  Fingerprint,
  ScanFace,
  KeyRound,
  Shield,
  Smartphone,
  Camera,
  RefreshCw,
  AlertCircle,
  Copy,
  Sliders,
  Eye,
  Settings2,
} from 'lucide-react';
import {
  storage,
  PRIMARY_DOMAIN,
  generateSnnsEmail,
  DirectoryUser,
  DEFAULT_SECURITY_SETTINGS,
} from '../../services/storage';
import { UserProfile, UserSecuritySettings } from '../../types/suite';
import { biometricFeedback } from '../../services/biometricFeedback';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  initialTab?: 'biometrics' | 'signin' | 'directory' | 'security';
  onLoginSuccess?: (profile: UserProfile) => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialTab = 'biometrics',
  onLoginSuccess,
}) => {
  const isAr = lang === 'ar';
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getUserProfile());
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>(() =>
    storage.getDirectoryUsers()
  );
  const [securitySettings, setSecuritySettings] = useState<UserSecuritySettings>(() =>
    storage.getSecuritySettings()
  );

  // Tabs: 'biometrics' | 'signin' | 'directory' | 'security'
  const [activeTab, setActiveTab] = useState<'biometrics' | 'signin' | 'directory' | 'security'>(
    initialTab
  );

  // Biometric scanner state
  const [biometricMethod, setBiometricMethod] = useState<'fingerprint' | 'face' | 'passkey'>('face');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanSuccess, setScanSuccess] = useState(false);
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Two-Factor Authentication (2FA) State
  const [step2FA, setStep2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [timeLeft2FA, setTimeLeft2FA] = useState<number>(30);
  const [active2FACode, setActive2FACode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Custom user input state
  const [nameInput, setNameInput] = useState('');
  const [customHandle, setCustomHandle] = useState('');
  const [isCustomizingHandle, setIsCustomizingHandle] = useState(false);
  const [selectedRole, setSelectedRole] = useState('مدير النظام المعتمد');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References for 2FA inputs
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      const freshUser = storage.getUserProfile();
      setCurrentUser(freshUser);
      setDirectoryUsers(storage.getDirectoryUsers());
      setSecuritySettings(freshUser.security || DEFAULT_SECURITY_SETTINGS);
      setActiveTab(initialTab);
      resetScanner();
      setStep2FA(false);
      setTwoFactorCode(['', '', '', '', '', '']);
      setTwoFactorError(null);
      setNameInput('');
      setCustomHandle('');
      setIsCustomizingHandle(false);
      setActive2FACode(storage.getCurrent2FACode());
      setTimeLeft2FA(storage.getTimeRemaining2FA());
    } else {
      stopCamera();
    }
  }, [isOpen, initialTab]);

  // Timer for 2FA code rotation countdown
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const remaining = storage.getTimeRemaining2FA();
      setTimeLeft2FA(remaining);
      setActive2FACode(storage.getCurrent2FACode());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Clean camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setUseLiveCamera(true);
      }
    } catch {
      setUseLiveCamera(false);
    }
  };

  const toggleCamera = () => {
    if (useLiveCamera) {
      stopCamera();
      setUseLiveCamera(false);
    } else {
      startCamera();
    }
  };

  const resetScanner = () => {
    setIsScanning(false);
    setScanProgress(0);
    setScanStatus('');
    setScanSuccess(false);
  };

  // Toggle Two-Factor Authentication (Optional 2FA)
  const handleToggle2FA = () => {
    const newState = storage.toggleTwoFactor();
    setSecuritySettings((prev) => ({ ...prev, twoFactorEnabled: newState }));
    setToastMessage(
      isAr
        ? newState
          ? 'تم تفعيل المصادقة الثنائية (2FA) بنجاح 🛡️'
          : 'تم تعطيل المصادقة الثنائية (2FA) — الدخول الآن بالبصمة فقط ⚡'
        : newState
        ? 'Two-Factor Authentication (2FA) Enabled 🛡️'
        : 'Two-Factor Authentication (2FA) Disabled ⚡'
    );
  };

  // Trigger Biometric Scan (Face ID / Fingerprint / Passkey)
  const handleStartBiometricScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanSuccess(false);

    // Initial message
    if (biometricMethod === 'face') {
      setScanStatus(isAr ? 'جاري توجيه مستشعر الوجه والتحقق من النقاط الحيوية...' : 'Aligning face sensors and mapping features...');
    } else if (biometricMethod === 'fingerprint') {
      setScanStatus(isAr ? 'ضع إصبعك على المستشعر لمسح البصمة...' : 'Place finger on biometric scanner...');
    } else {
      setScanStatus(isAr ? 'جاري الاتصال بمفتاح الأمان Passkey / WebAuthn...' : 'Connecting to WebAuthn / Passkey authenticator...');
    }

    biometricFeedback.playScanPulse();
    biometricFeedback.triggerHaptic([30, 40]);

    // Animate progress smoothly
    let currentProg = 0;
    const progressTimer = setInterval(() => {
      currentProg += 20;
      setScanProgress(Math.min(currentProg, 100));

      if (currentProg === 40) {
        biometricFeedback.playScanPulse();
        setScanStatus(
          biometricMethod === 'face'
            ? isAr
              ? 'التحقق من حيوية الوجه والعمق الثلاثي الأبعاد...'
              : 'Verifying 3D depth and liveness...'
            : isAr
            ? 'تشفير ومطابقة بصمة الإصبع مع مفتاح snns.pro...'
            : 'Matching fingerprint token with snns.pro security key...'
        );
      } else if (currentProg === 80) {
        biometricFeedback.playScanPulse();
        setScanStatus(isAr ? 'تأكيد المصادقة الحيوية المعتمدة...' : 'Confirming cryptographic signature...');
      } else if (currentProg >= 100) {
        clearInterval(progressTimer);
        completeBiometricScan();
      }
    }, 280);
  };

  const completeBiometricScan = async () => {
    setIsScanning(false);
    setScanSuccess(true);
    biometricFeedback.playSuccessChime();
    biometricFeedback.triggerHaptic([60, 40, 80]);

    // Check if 2FA is enabled (optional)
    const security = storage.getSecuritySettings();
    if (security.twoFactorEnabled) {
      setScanStatus(
        isAr
          ? 'تم تأكيد البصمة بنجاح! يرجى إكمال الخطوة 2 (المصادقة الثنائية).'
          : 'Biometrics verified! Please complete step 2 (Two-Factor Auth).'
      );
      setTimeout(() => {
        setStep2FA(true);
      }, 700);
    } else {
      // Direct login without 2FA!
      setScanStatus(
        isAr
          ? `تم الدخول بنجاح عبر العلامات الحيوية (${currentUser.name})! 🎉`
          : `Signed in successfully via Biometrics (${currentUser.name})! 🎉`
      );
      await storage.verifyBiometricAuth(biometricMethod);
      setToastMessage(
        isAr
          ? `أهلاً بك ${currentUser.name}! تم التحقق الحيوي بنجاح عبر snns.pro`
          : `Welcome ${currentUser.name}! Biometrics verified on snns.pro`
      );
      setTimeout(() => {
        stopCamera();
        if (onLoginSuccess) onLoginSuccess(currentUser);
        onClose();
      }, 900);
    }
  };

  // 2FA Code handling
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // pasted full code
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCodes = [...twoFactorCode];
      digits.forEach((d, i) => {
        if (i < 6) newCodes[i] = d;
      });
      setTwoFactorCode(newCodes);
      if (digits.length >= 6) {
        verify2FACodeSubmission(newCodes.join(''));
      }
      return;
    }

    const cleanDigit = value.replace(/\D/g, '');
    const newCodes = [...twoFactorCode];
    newCodes[index] = cleanDigit;
    setTwoFactorCode(newCodes);
    setTwoFactorError(null);

    // auto-focus next
    if (cleanDigit && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }

    if (newCodes.every((d) => d !== '')) {
      verify2FACodeSubmission(newCodes.join(''));
    }
  };

  const handleKeyDown2FA = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const verify2FACodeSubmission = async (codeToVerify?: string) => {
    const code = codeToVerify || twoFactorCode.join('');
    if (code.length < 6) {
      setTwoFactorError(isAr ? 'يرجى كتابة رمز التحقق المكون من 6 أرقام' : 'Please enter 6-digit code');
      return;
    }

    const isValid = storage.verify2FACode(code);
    if (isValid) {
      biometricFeedback.playSuccessChime();
      biometricFeedback.triggerHaptic([60, 40, 80]);
      await storage.verifyBiometricAuth(biometricMethod);
      setToastMessage(
        isAr
          ? `تم تأكيد المصادقة الثنائية بنجاح! أهلاً بك ${currentUser.name}`
          : `2FA Verified! Welcome ${currentUser.name}`
      );
      setTimeout(() => {
        stopCamera();
        if (onLoginSuccess) onLoginSuccess(currentUser);
        onClose();
      }, 700);
    } else {
      biometricFeedback.playErrorChime();
      biometricFeedback.triggerHaptic([100, 50, 100]);
      setTwoFactorError(
        isAr
          ? 'رمز التحقق غير صحيح، يرجى المحاولة أو استخدام الرمز الظاهر للمعاينة.'
          : 'Invalid 2FA code. Please retry or use demo code.'
      );
    }
  };

  const handleFillDemo2FACode = () => {
    const code = active2FACode || '849201';
    const digits = code.split('');
    setTwoFactorCode(digits);
    setTwoFactorError(null);
    verify2FACodeSubmission(code);
  };

  // Real-time generated email for custom sign-in
  const liveEmail = isCustomizingHandle && customHandle.trim()
    ? `${customHandle.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')}@${PRIMARY_DOMAIN}`
    : generateSnnsEmail(nameInput || currentUser.name);

  const previewUsername = liveEmail.split('@')[0];

  const handleDirectorySelect = (user: DirectoryUser) => {
    const updated = storage.switchUser(user);
    setCurrentUser(updated);
    setSecuritySettings(updated.security || DEFAULT_SECURITY_SETTINGS);
    setToastMessage(
      isAr
        ? `تم تسجيل الدخول بنجاح! بريدك المعتمد: ${updated.email}`
        : `Signed in successfully! Active email: ${updated.email}`
    );
    setTimeout(() => {
      stopCamera();
      if (onLoginSuccess) onLoginSuccess(updated);
      onClose();
    }, 700);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const updated = storage.loginAsNewUser(
      nameInput.trim(),
      isCustomizingHandle ? customHandle.trim() : undefined,
      selectedRole
    );

    setCurrentUser(updated);
    setDirectoryUsers(storage.getDirectoryUsers());
    setSecuritySettings(updated.security || DEFAULT_SECURITY_SETTINGS);

    // If 2FA enabled, ask for code, otherwise login directly
    if (securitySettings.twoFactorEnabled) {
      setStep2FA(true);
    } else {
      setToastMessage(
        isAr
          ? `أهلاً بك ${updated.name}! بريدك الشخصي المعتمد هو: ${updated.email}`
          : `Welcome ${updated.name}! Your verified personal email is: ${updated.email}`
      );
      setTimeout(() => {
        stopCamera();
        if (onLoginSuccess) onLoginSuccess(updated);
        onClose();
      }, 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0078D4] via-[#106EBE] to-[#005A9E] p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-1.5 rounded-full hover:bg-white/20 transition text-white/90 hover:text-white cursor-pointer"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-inner">
              <ScanFace className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  SNNS Biometric Vault
                </span>
                <span className="text-[11px] font-black text-emerald-300 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <Globe className="w-3 h-3" />
                  @{PRIMARY_DOMAIN}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1">
                {isAr
                  ? 'الدخول بالعلامات الحيوية والمصادقة المعتمدة'
                  : 'Biometric Login & Corporate Authentication'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-sky-100/90 leading-relaxed mt-1">
            {isAr
              ? 'تسجيل الدخول الفوري ببصمة الوجه أو الإصبع (WebAuthn/Face ID) مع خيار المصادقة الثنائية (2FA) الاختياري لدومين snns.pro.'
              : 'Instant Face ID & Fingerprint biometric sign-in with optional Two-Factor Authentication (2FA) for snns.pro.'}
          </p>

          {/* Current Active User Banner & 2FA Status */}
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-[#0078D4] font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                {currentUser.avatarInitials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    {isAr ? 'الحساب المستهدف' : 'Target User'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyan-200 truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Quick 2FA Toggle Badge (اختياري) */}
            <button
              type="button"
              onClick={handleToggle2FA}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                securitySettings.twoFactorEnabled
                  ? 'bg-emerald-500/30 border-emerald-300 text-emerald-100 hover:bg-emerald-500/40'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
              }`}
              title={isAr ? 'اضغط لتفعيل أو إلغاء المصادقة الثنائية (اختياري)' : 'Click to toggle 2FA (Optional)'}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                {securitySettings.twoFactorEnabled
                  ? (isAr ? 'المصادقة الثنائية: مفعلة' : '2FA: Enabled')
                  : (isAr ? '2FA: معطلة (اختياري)' : '2FA: Disabled (Optional)')}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 p-1.5 gap-1 overflow-x-auto scrollbar-none snns-scroll-touch">
          <button
            onClick={() => {
              setStep2FA(false);
              setActiveTab('biometrics');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 ${
              activeTab === 'biometrics'
                ? 'bg-white text-[#0078D4] shadow-xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5 text-[#0078D4]" />
            <span>{isAr ? 'العلامات الحيوية (Biometrics)' : 'Biometrics'}</span>
          </button>
          <button
            onClick={() => {
              setStep2FA(false);
              setActiveTab('signin');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 ${
              activeTab === 'signin'
                ? 'bg-white text-[#0078D4] shadow-xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isAr ? 'إدخال الاسم (@snns.pro)' : 'Enter Name'}</span>
          </button>
          <button
            onClick={() => {
              setStep2FA(false);
              setActiveTab('directory');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 ${
              activeTab === 'directory'
                ? 'bg-white text-[#0078D4] shadow-xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isAr ? 'دليل المؤسسة' : 'Directory'}</span>
          </button>
          <button
            onClick={() => {
              setStep2FA(false);
              setActiveTab('security');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 ${
              activeTab === 'security'
                ? 'bg-white text-[#0078D4] shadow-xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
            }`}
            title={isAr ? 'إعدادات الأمان والمصادقة' : 'Security Settings'}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'إدارة الأمان' : 'Security'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs text-gray-700 space-y-4">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 font-bold animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="flex-1">{toastMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: TWO-FACTOR AUTHENTICATION MODAL STEP (IF 2FA ON)  */}
          {/* ========================================================= */}
          {step2FA ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-150">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-3xl p-5 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-bold text-[10px] uppercase mb-1">
                    <Shield className="w-3 h-3 text-indigo-600" />
                    <span>{isAr ? 'المصادقة الثنائية (2FA) — الخطوة 2' : 'Two-Factor Authentication — Step 2'}</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900">
                    {isAr ? 'أدخل رمز التحقق المكون من 6 أرقام' : 'Enter 6-Digit Verification Code'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isAr
                      ? `تم تأكيد البصمة الحيوية! يرجى إدخال رمز تطبيق المصادقة أو الرمز السري لحساب ${currentUser.email}.`
                      : `Biometrics verified! Enter the code from your authenticator app for ${currentUser.email}.`}
                  </p>
                </div>

                {/* 6-box Pin Input */}
                <div className="flex justify-center gap-2 sm:gap-2.5 pt-2" dir="ltr">
                  {twoFactorCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        codeInputsRef.current[idx] = el;
                      }}
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      autoFocus={idx === 0}
                      value={digit}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown2FA(idx, e)}
                      className="w-10 sm:w-12 h-12 sm:h-14 bg-white border-2 border-indigo-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-400 rounded-2xl text-center text-lg sm:text-xl font-mono font-black text-gray-900 focus:outline-none shadow-xs transition"
                    />
                  ))}
                </div>

                {twoFactorError && (
                  <p className="text-red-500 text-xs font-bold flex items-center justify-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{twoFactorError}</span>
                  </p>
                )}

                {/* Demo Helper & Code Countdown */}
                <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-indigo-100 flex items-center justify-between gap-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 flex items-center justify-center">
                      <span className="font-mono font-bold text-indigo-700 text-xs">
                        {timeLeft2FA}s
                      </span>
                    </div>
                    <div className="text-start">
                      <span className="block font-bold text-gray-800">
                        {isAr ? 'الرمز النشط الحالي:' : 'Live Code:'}
                      </span>
                      <span className="font-mono font-black text-indigo-600 text-xs">
                        {active2FACode}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFillDemo2FACode}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? 'تعبئة وتأكيد فوري' : 'Autofill & Verify'}</span>
                  </button>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep2FA(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition cursor-pointer"
                  >
                    {isAr ? 'العودة للمسح الحيوي' : 'Back to Biometrics'}
                  </button>
                  <button
                    type="button"
                    onClick={() => verify2FACodeSubmission()}
                    className="flex-2 py-2.5 bg-[#0078D4] hover:bg-[#106EBE] text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isAr ? 'تأكيد الرمز والدخول' : 'Confirm & Sign In'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'biometrics' ? (
            /* ========================================================= */
            /* TAB 1: BIOMETRIC LOGIN VIEW (FACE ID / TOUCH ID / PASSKEY) */
            /* ========================================================= */
            <div className="space-y-4 animate-in fade-in">
              {/* Method Selector: Face ID vs Fingerprint vs Passkey */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'face' as const, labelAr: 'بصمة الوجه (Face ID)', labelEn: 'Face ID', icon: ScanFace },
                  { id: 'fingerprint' as const, labelAr: 'بصمة الإصبع (Touch ID)', labelEn: 'Fingerprint', icon: Fingerprint },
                  { id: 'passkey' as const, labelAr: 'مفتاح المرور (Passkey)', labelEn: 'Passkey / Hello', icon: KeyRound },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = biometricMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setBiometricMethod(m.id);
                        resetScanner();
                      }}
                      className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-[#0078D4] bg-blue-50/80 text-[#0078D4] font-bold shadow-xs ring-2 ring-blue-100'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-[#0078D4]" />
                      <span className="text-[11px] font-semibold leading-tight">{isAr ? m.labelAr : m.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Interactive Scanner Visual */}
              <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 text-white text-center overflow-hidden border border-slate-800 shadow-xl min-h-[260px] flex flex-col items-center justify-center">
                {/* Background scanning grid */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 50%, #0078D4 1px, transparent 1px), linear-gradient(to right, #0078D4 1px, transparent 1px), linear-gradient(to bottom, #0078D4 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Laser scan line when active */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 shadow-[0_0_15px_#38bdf8] animate-pulse z-20 top-1/2 -translate-y-1/2 transition-all duration-300" />
                )}

                {/* Live Camera View if Face ID & enabled */}
                {biometricMethod === 'face' && useLiveCamera ? (
                  <div className="relative w-44 h-44 rounded-3xl overflow-hidden border-2 border-cyan-400 shadow-2xl mb-3">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {/* Radar Target Corners */}
                    <div className="absolute inset-2 border-2 border-dashed border-cyan-300/70 rounded-2xl pointer-events-none" />
                    <div className="absolute top-2 start-2 w-3 h-3 border-t-2 border-s-2 border-cyan-400" />
                    <div className="absolute top-2 end-2 w-3 h-3 border-t-2 border-e-2 border-cyan-400" />
                    <div className="absolute bottom-2 start-2 w-3 h-3 border-b-2 border-s-2 border-cyan-400" />
                    <div className="absolute bottom-2 end-2 w-3 h-3 border-b-2 border-e-2 border-cyan-400" />
                  </div>
                ) : (
                  /* Center Glyphs & Laser Circles */
                  <div
                    onClick={handleStartBiometricScan}
                    className={`relative w-32 h-32 rounded-3xl flex items-center justify-center cursor-pointer transition-transform duration-200 mb-3 group ${
                      scanSuccess
                        ? 'bg-emerald-500/20 border-2 border-emerald-400 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                        : isScanning
                        ? 'bg-sky-500/20 border-2 border-sky-400 scale-102 shadow-[0_0_30px_rgba(56,189,248,0.4)]'
                        : 'bg-white/5 border border-white/15 hover:border-sky-400 hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    {/* Circular progress track */}
                    {isScanning && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-white/10"
                          fill="transparent"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray="326"
                          strokeDashoffset={326 - (326 * scanProgress) / 100}
                          strokeLinecap="round"
                          className="text-cyan-400 transition-all duration-200"
                          fill="transparent"
                        />
                      </svg>
                    )}

                    {/* Biometric Icon */}
                    {scanSuccess ? (
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-in zoom-in" />
                    ) : biometricMethod === 'face' ? (
                      <ScanFace
                        className={`w-16 h-16 transition-colors ${
                          isScanning ? 'text-cyan-300 animate-pulse' : 'text-sky-400 group-hover:text-cyan-300'
                        }`}
                      />
                    ) : biometricMethod === 'fingerprint' ? (
                      <Fingerprint
                        className={`w-16 h-16 transition-colors ${
                          isScanning ? 'text-cyan-300 animate-pulse' : 'text-sky-400 group-hover:text-cyan-300'
                        }`}
                      />
                    ) : (
                      <KeyRound
                        className={`w-16 h-16 transition-colors ${
                          isScanning ? 'text-cyan-300 animate-pulse' : 'text-sky-400 group-hover:text-cyan-300'
                        }`}
                      />
                    )}
                  </div>
                )}

                {/* Scanner State Label */}
                <div className="z-10 max-w-sm">
                  <p className="font-bold text-sm text-white mb-1">
                    {scanSuccess
                      ? isAr
                        ? 'تم التحقق الحيوي بنجاح!'
                        : 'Biometric Verified!'
                      : isScanning
                      ? scanStatus || (isAr ? 'جاري المسح الحيوي...' : 'Scanning biometrics...')
                      : biometricMethod === 'face'
                      ? isAr
                        ? 'اضغط لبدء فحص بصمة الوجه (Face ID)'
                        : 'Click to start Face ID scan'
                      : biometricMethod === 'fingerprint'
                      ? isAr
                        ? 'اضغط أو ضع إصبعك لمسح بصمة الإصبع'
                        : 'Click or touch sensor to scan fingerprint'
                      : isAr
                      ? 'اضغط للمصادقة بمفتاح المرور الذكي (Passkey)'
                      : 'Click to authenticate via Passkey'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {isAr
                      ? 'مشفر بأعلى معايير FIDO2 / WebAuthn المرتبطة بحسابك'
                      : 'FIDO2 / WebAuthn encrypted hardware credentials'}
                  </p>
                </div>

                {/* Face ID Camera Toggle Switch */}
                {biometricMethod === 'face' && (
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="mt-3 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-bold border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Camera className="w-3 h-3 text-cyan-300" />
                    <span>
                      {useLiveCamera
                        ? (isAr ? 'إيقاف الكاميرا الحية' : 'Stop Live Camera')
                        : (isAr ? 'تشغيل كاميرا التحقق الحيوي' : 'Use Live Camera')}
                    </span>
                  </button>
                )}
              </div>

              {/* Action Button: Scan / Authenticate */}
              <button
                type="button"
                disabled={isScanning}
                onClick={handleStartBiometricScan}
                className="w-full py-3 bg-[#0078D4] hover:bg-[#106EBE] disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جاري التحقق الحيوي...' : 'Verifying biometrics...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {isAr
                        ? `بدء تسجيل الدخول بالعلامات الحيوية (${currentUser.name})`
                        : `Authenticate via Biometrics (${currentUser.name})`}
                    </span>
                  </>
                )}
              </button>

              {/* 2FA Option Status Banner */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={`w-4 h-4 ${
                      securitySettings.twoFactorEnabled ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-gray-800 text-[11px] block">
                      {isAr ? 'المصادقة الثنائية (2FA) — خيار اختياري:' : 'Two-Factor Auth (2FA) — Optional:'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {securitySettings.twoFactorEnabled
                        ? (isAr ? 'مفعلة: سيطلب رمز 6 أرقام بعد البصمة لمزيد من الأمان' : 'Enabled: 6-digit code requested after scan')
                        : (isAr ? 'معطلة: تسجيل الدخول يتم فوراً بعد مطابقة البصمة' : 'Disabled: Logs in immediately after biometric match')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
                    securitySettings.twoFactorEnabled
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {securitySettings.twoFactorEnabled
                    ? (isAr ? 'مفعلة ✓' : 'Enabled ✓')
                    : (isAr ? 'تفعيل (اختياري)' : 'Enable (Optional)')}
                </button>
              </div>
            </div>
          ) : activeTab === 'signin' ? (
            /* ========================================================= */
            /* TAB 2: ENTER NAME AND GENERATE REAL @snns.pro EMAIL        */
            /* ========================================================= */
            <form onSubmit={handleCustomLogin} className="space-y-4 animate-in fade-in">
              <div>
                <label className="font-bold text-gray-900 text-xs block mb-1.5">
                  {isAr
                    ? 'الاسم الكامل للمستخدم (عربي أو إنجليزي):'
                    : 'User Full Name (Arabic or English):'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={
                      isAr
                        ? 'مثال: هتاف أونلاين، أحمد الشهري، سارة المنصور، Faisal...'
                        : 'e.g. Htaf Online, Ahmed Al-Shehri, Sarah Miller...'
                    }
                    className="w-full ps-10 pe-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0078D4] text-xs font-semibold text-gray-900 transition"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {isAr
                    ? '💡 بمجرد كتابة اسمك يتحول تلقائياً إلى بريد حقيقي معتمد على دومين snns.pro.'
                    : '💡 As soon as you type, your official snns.pro email is instantly composed.'}
                </p>
              </div>

              {/* Dynamic Live Email Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0078D4]" />
                    {isAr ? 'البريد الإلكتروني المعتمد التلقائي:' : 'Provisioned Real Corporate Email:'}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    {isAr ? 'نطاق موثق snns.pro' : 'Verified snns.pro'}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-blue-200/80 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#0078D4] text-white font-black text-xs flex items-center justify-center shrink-0">
                      @
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#0078D4] truncate">
                      {liveEmail}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                    {PRIMARY_DOMAIN}
                  </span>
                </div>

                {/* Custom Handle Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCustomizingHandle(!isCustomizingHandle)}
                    className="text-[11px] font-semibold text-[#0078D4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {isCustomizingHandle
                        ? (isAr ? 'استخدام التسمية التلقائية' : 'Use auto-generated handle')
                        : (isAr ? '⚙️ تخصيص اسم المعرف (Username) يدوياً' : '⚙️ Customize handle prefix')}
                    </span>
                  </button>
                  <span className="text-[10px] text-gray-500">
                    {isAr ? 'بدون أشياء وهمية' : 'Zero placeholders'}
                  </span>
                </div>

                {isCustomizingHandle && (
                  <div className="pt-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-2.5 py-1.5">
                      <span className="text-gray-400 font-mono text-xs">https://</span>
                      <input
                        type="text"
                        value={customHandle}
                        onChange={(e) => setCustomHandle(e.target.value)}
                        placeholder={previewUsername}
                        className="flex-1 bg-transparent text-xs font-mono font-bold text-gray-900 focus:outline-none"
                      />
                      <span className="font-mono font-bold text-blue-700 text-xs">
                        @{PRIMARY_DOMAIN}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="w-full py-3 bg-[#0078D4] hover:bg-[#106EBE] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isAr
                    ? `تسجيل الدخول واعتماد البريد الرسمي (${liveEmail})`
                    : `Sign In with Official Corporate Email (${liveEmail})`}
                </span>
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </form>
          ) : activeTab === 'directory' ? (
            /* ========================================================= */
            /* TAB 3: CORPORATE DIRECTORY SWITCH                        */
            /* ========================================================= */
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-gray-500 text-[11px] pb-1">
                <span>
                  {isAr
                    ? 'اختر مستخدماً من دليل المؤسسة للتبديل الفوري:'
                    : 'Select a verified user to switch instantly:'}
                </span>
                <span className="font-mono text-[#0078D4] font-bold">
                  {directoryUsers.length} {isAr ? 'مستخدمين معتمدين' : 'verified members'}
                </span>
              </div>

              <div className="space-y-2">
                {directoryUsers.map((user) => {
                  const isActive =
                    currentUser.email.toLowerCase() === user.email.toLowerCase();
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleDirectorySelect(user)}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer group ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${user.avatarColor}`}
                        >
                          {user.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs truncate">
                              {user.name}
                            </span>
                            {isActive && (
                              <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                {isAr ? 'الحالي' : 'Active'}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-[#0078D4] font-semibold truncate">
                            {user.email}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate mt-0.5">
                            {isAr ? user.roleAr || user.role : user.role} • {user.departmentAr || user.department}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectorySelect(user);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white group-hover:bg-[#0078D4] text-[#0078D4] group-hover:text-white border border-gray-200 group-hover:border-transparent'
                        }`}
                      >
                        {isActive
                          ? (isAr ? 'الحساب الحالي' : 'Active')
                          : (isAr ? 'دخول بالحساب' : 'Switch')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* TAB 4: SECURITY & BIOMETRIC ENROLLMENT SETTINGS           */
            /* ========================================================= */
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#0078D4]" />
                    {isAr ? 'العلامات الحيوية المسجلة في النظام' : 'Enrolled Biometrics'}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-[#0078D4] font-bold px-2 py-0.5 rounded-full">
                    {securitySettings.registeredBiometricsCount} {isAr ? 'بصمات مسجلة' : 'Registered'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ScanFace className="w-5 h-5 text-indigo-600" />
                      <div>
                        <span className="font-bold text-gray-900 text-xs block">
                          {isAr ? 'بصمة الوجه المعتمدة (Face ID Sensor)' : 'Face ID Sensor'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          ✓ {isAr ? 'مفعلة ونشطة' : 'Active and calibrated'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">FIDO2 Token</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Fingerprint className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-bold text-gray-900 text-xs block">
                          {isAr ? 'بصمة الإصبع الحيوية (Touch Sensor)' : 'Touch ID Sensor'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          ✓ {isAr ? 'مفعلة ونشطة' : 'Active and calibrated'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">WebAuthn Key</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    storage.updateSecuritySettings({
                      registeredBiometricsCount: securitySettings.registeredBiometricsCount + 1,
                    });
                    setSecuritySettings(storage.getSecuritySettings());
                    setToastMessage(isAr ? 'تم تسجيل بصمة حيوية جديدة بنجاح! ✓' : 'New biometric enrolled successfully!');
                  }}
                  className="w-full py-2 bg-white hover:bg-gray-50 border border-dashed border-gray-300 text-[#0078D4] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل بصمة حيوية جديدة' : 'Enroll New Biometric Sample'}</span>
                </button>
              </div>

              {/* Optional 2FA Configuration Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    {isAr ? 'إعدادات المصادقة الثنائية (اختياري / Optional 2FA)' : '2FA Configuration'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    className={`px-3 py-1 rounded-full font-bold text-[10px] transition cursor-pointer ${
                      securitySettings.twoFactorEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {securitySettings.twoFactorEnabled
                      ? (isAr ? 'مفعلة' : 'Enabled')
                      : (isAr ? 'معطلة (اختياري)' : 'Disabled')}
                  </button>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {isAr
                    ? 'المصادقة الثنائية اختيارية بالكامل. عند تفعيلها، يطلب النظام رمز تحقق مكون من 6 أرقام بعد التحقق الحيوي بالبصمة. عند تعطيلها، يكون الدخول بالبصمة الحيوية مباشرة وبدون خطوات إضافية.'
                    : 'Two-Factor Authentication is completely optional. When enabled, a 6-digit verification code is required after biometric verification. When disabled, you sign in immediately via biometrics alone.'}
                </p>

                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">{isAr ? 'آخر تسجيل دخول بالبصمة:' : 'Last biometric login:'}</span>
                  <span className="font-bold text-gray-800">{securitySettings.lastBiometricLogin || (isAr ? 'اليوم' : 'Today')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isAr
                ? `العلامات الحيوية المعتمدة | نطاق المؤسسة ${PRIMARY_DOMAIN}`
                : `Verified Biometrics | Domain ${PRIMARY_DOMAIN}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 font-medium px-2 py-1 rounded hover:bg-gray-200/60 transition cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
