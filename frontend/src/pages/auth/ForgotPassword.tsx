import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Mail } from 'lucide-react';
import Seo from '../../components/common/Seo';
import AuthShell from '../../components/auth/AuthShell';
import { authApi } from '../../services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
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
      const r = await authApi.sendOtp(email.trim(), 'reset');
      setEmailMasked(r.data?.emailMasked || email);
      setMsg(r.data?.message || 'OTP sent to your email.');
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
      await authApi.verifyOtp({ email, code, purpose: 'reset', newPassword });
      setStep('done');
      setMsg('Password updated. You can login now.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not reset password.');
    }
    setLoading(false);
  };

  return (
    <AuthShell title="Reset Password" subtitle="OTP is sent to your registered email">
      <Seo title="Forgot Password" />
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}
      {msg && (
        <div className="mb-4 flex gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          <Mail size={18} className="mt-0.5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={sendOtp} className="space-y-4">
          <input
            required
            type="email"
            name="reset-email"
            autoComplete="off"
            placeholder="Registered email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send email OTP'}
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={resetPassword} className="space-y-4">
          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            OTP for <span className="font-semibold">{emailMasked || 'your email'}</span>
          </p>
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
          <button type="button" className="btn-ghost w-full" onClick={() => setStep('email')}>
            Change email
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
