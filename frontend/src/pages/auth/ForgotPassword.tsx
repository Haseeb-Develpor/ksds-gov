import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, MessageCircle } from 'lucide-react';
import Seo from '../../components/common/Seo';
import AuthShell from '../../components/auth/AuthShell';
import { authApi } from '../../services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'phone' | 'reset' | 'done'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const r = await authApi.sendOtp(phone, 'reset');
      setPhoneMasked(r.data?.phoneMasked || '');
      setOtpCode(r.data?.otpCode || '');
      setMsg(r.data?.message || 'OTP generated. Enter it below with your new password.');
      setStep('reset');
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send OTP.');
    }
    setLoading(false);
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.verifyOtp({ phone, code, purpose: 'reset', newPassword });
      setStep('done');
      setMsg('Password updated. You can login now.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not reset password.');
    }
    setLoading(false);
  };

  return (
    <AuthShell title="Reset Password" subtitle="OTP only when you forget password — use registered WhatsApp number">
      <Seo title="Forgot Password" />
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}
      {msg && (
        <div className="mb-4 flex gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          <MessageCircle size={18} className="mt-0.5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {step === 'phone' && (
        <form onSubmit={sendOtp} className="space-y-4">
          <input
            required
            placeholder="Registered WhatsApp number"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={resetPassword} className="space-y-4">
          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            OTP for <span className="font-semibold">{phoneMasked || 'your number'}</span>
          </p>
          {otpCode && (
            <div className="rounded-xl border border-dashed border-primary-300 bg-primary-50 px-4 py-3 text-center dark:border-gold-500/40 dark:bg-white/5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Your OTP code</p>
              <p className="font-display text-3xl font-bold tracking-[0.35em] text-primary-800 dark:text-gold-300">{otpCode}</p>
            </div>
          )}
          <input
            required
            placeholder="6-digit OTP"
            maxLength={6}
            inputMode="numeric"
            className="input text-center text-2xl tracking-[0.5em]"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="New password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button disabled={loading || code.length < 6} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Update password'}
          </button>
          <button type="button" className="btn-ghost w-full" onClick={() => setStep('phone')}>
            Change number
          </button>
        </form>
      )}

      {step === 'done' && (
        <Link to="/login" className="btn-primary w-full">{t('auth.signIn')}</Link>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-primary-600 dark:text-gold-400">{t('auth.signIn')}</Link>
        {' · '}
        <Link to="/otp-login" className="font-semibold text-primary-600 dark:text-gold-400">{t('auth.otpLogin')}</Link>
      </p>
    </AuthShell>
  );
}
