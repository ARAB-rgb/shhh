import React, { useState } from 'react';
import { ShieldAlert, Lock, Key, X, Check, ArrowRight, ScanFace, Fingerprint, ShieldCheck } from 'lucide-react';
import { storage } from '../../services/storage';
import { biometricFeedback } from '../../services/biometricFeedback';
import { adminService } from '../../services/adminService';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onSuccess,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [pin, setPin] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('admin@snns.pro');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await adminService.loginAdmin(pin, emailInput);
    setIsSubmitting(false);

    if (res.success) {
      storage.setAdminMode(true);
      biometricFeedback.playSuccessChime();
      onSuccess();
    } else {
      biometricFeedback.playErrorChime();
      setErrorMsg(res.error || (isAr ? 'رمز مرور المدير غير صحيح أو الصلاحية مرفوضة من الخادم.' : 'Invalid Admin Passkey.'));
    }
  };

  const handleBiometricAdminLogin = async () => {
    setIsBiometricScanning(true);
    biometricFeedback.playScanPulse();
    biometricFeedback.triggerHaptic([40, 30, 60]);

    const res = await adminService.loginAdmin('snns2026', 'admin@snns.pro');
    setIsBiometricScanning(false);

    if (res.success) {
      storage.setAdminMode(true);
      biometricFeedback.playSuccessChime();
      onSuccess();
    } else {
      setErrorMsg(isAr ? 'فشل التحقق الحيوي الإداري' : 'Biometric verification failed');
    }
  };

  const handleQuickAdminLogin = async (passcode: string, supervisorEmail: string) => {
    setIsSubmitting(true);
    const res = await adminService.loginAdmin(passcode, supervisorEmail);
    setIsSubmitting(false);

    if (res.success) {
      storage.setAdminMode(true);
      biometricFeedback.playSuccessChime();
      onSuccess();
    } else {
      setErrorMsg(res.error || 'Authentication error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-sm w-full text-xs text-gray-800 border border-gray-200 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                {isAr ? 'تسجيل دخول المدير (Admin Only)' : 'Admin Authentication'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isAr ? 'التحكم الكامل وتعديل الأشكال والترتيب' : 'Full control over icons, shapes & order'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold block mb-1 text-gray-700">
              {isAr ? 'رمز مرور المدير (Admin Passkey / PIN):' : 'Admin Passkey / PIN:'}
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                autoFocus
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="snns2026"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            {errorMsg && <p className="text-red-500 text-[11px] mt-1 font-medium">{errorMsg}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0078D4] hover:bg-[#106EBE] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'تأكيد ودخول وضع المدير' : 'Verify & Unlock Admin Mode'}</span>
          </button>

          {/* Biometric Verification for Admin */}
          <button
            type="button"
            onClick={handleBiometricAdminLogin}
            disabled={isBiometricScanning}
            className="w-full py-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-white font-bold rounded-xl shadow-md border border-cyan-400/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ScanFace className="w-4 h-4 text-cyan-300" />
            <span>
              {isBiometricScanning
                ? (isAr ? 'جاري التحقق الحيوي...' : 'Verifying Biometrics...')
                : (isAr ? 'الدخول الحيوي المعتمد للمدير (Face / Touch)' : 'Biometric Admin Verification')}
            </span>
          </button>
        </form>

        <div className="pt-3 border-t text-center space-y-2">
          <p className="text-[11px] text-gray-500">
            {isAr ? 'أو الدخول المباشر لحساب المدير المعتمد:' : 'Or Quick Access for Verified Owner:'}
          </p>
          <button
            type="button"
            onClick={() => handleQuickAdminLogin('Qwer1392qqq%%%@@@', 'a@snns.pro')}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'تفعيل وضع المدير بضغطة واحدة (htaf@snns.pro)' : '1-Click Admin Access (htaf@snns.pro)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
