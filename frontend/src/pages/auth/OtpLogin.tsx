import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader2, MessageCircle } from 'lucide-react';
import Seo from '../../components/common/Seo';
import AuthShell from '../../components/auth/AuthShell';
import { authApi } from '../../services/api';
import { setCredentials } from '../../store/slices/authSlice';

export default function OtpLogin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    setOtpCode('');
    try {
      const r = await authApi.sendOtp(phone, 'login');
      setPhoneMasked(r.data?.phoneMasked || '');
      setOtpCode(r.data?.otpCode || '');
      setMsg(r.data?.message || 'OTP generated. Enter the code below.');
      setStep('code');
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send OTP. Use the same number from registration.');
    }
    setLoading(false);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await authApi.verifyOtp({ phone, code, purpose: 'login' });
      if (r.data.user?.role === 'admin') {
        setError('Admin must login with email and password only.');
        setLoading(false);
        return;
      }
      dispatch(setCredentials({ user: r.data.user, token: r.data.token }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code.');
    }
    setLoading(false);
  };

  const resend = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await authApi.sendOtp(phone, 'login');
      setPhoneMasked(r.data?.phoneMasked || phoneMasked);
      setOtpCode(r.data?.otpCode || '');
      setMsg(r.data?.message || 'OTP resent.');
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not resend OTP');
    }
    setLoading(false);
  };

  return (
    <AuthShell title={t('auth.otpLogin')} subtitle="Client login — use the WhatsApp number saved at registration">
      <Seo title="OTP Login" />
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}
      {msg && (
        <div className="mb-4 flex gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          <MessageCircle size={18} className="mt-0.5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <input
            required
            placeholder="Registered WhatsApp number"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            Must be the same number you used when creating the account. OTP opens only that account.
          </p>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            OTP for
            <br />
            <span className="font-semibold text-primary-700 dark:text-gold-400">{phoneMasked || 'your number'}</span>
          </p>
          {otpCode && (
            <div className="rounded-xl border border-dashed border-primary-300 bg-primary-50 px-4 py-3 text-center dark:border-gold-500/40 dark:bg-white/5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Your OTP code</p>
              <p className="font-display text-3xl font-bold tracking-[0.35em] text-primary-800 dark:text-gold-300">{otpCode}</p>
              <p className="mt-1 text-xs text-slate-500">Enter this code below to open your dashboard</p>
            </div>
          )}
          <input
            required
            placeholder="••••••"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            className="input text-center text-2xl tracking-[0.5em]"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <button disabled={loading || code.length < 6} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Open Dashboard'}
          </button>
          <button type="button" disabled={loading} onClick={resend} className="btn-ghost w-full">
            Generate new OTP
          </button>
          <button type="button" onClick={() => setStep('phone')} className="btn-ghost w-full">
            Change number
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Admin?{' '}
        <Link to="/login" className="font-semibold text-primary-600 dark:text-gold-400">Email & password login</Link>
        {' · '}
        <Link to="/register" className="font-semibold text-primary-600 dark:text-gold-400">{t('auth.register')}</Link>
      </p>
    </AuthShell>
  );
}
