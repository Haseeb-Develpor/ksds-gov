import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader2, Mail } from 'lucide-react';
import Seo from '../../components/common/Seo';
import AuthShell from '../../components/auth/AuthShell';
import { authApi } from '../../services/api';
import { setCredentials } from '../../store/slices/authSlice';

export default function OtpLogin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const r = await authApi.sendOtp(email.trim(), 'login');
      setEmailMasked(r.data?.emailMasked || email);
      setMsg(r.data?.message || 'OTP sent to your email. Check inbox / spam.');
      setStep('code');
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send OTP. Use your registered email.');
    }
    setLoading(false);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await authApi.verifyOtp({ email, code, purpose: 'login' });
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
      const r = await authApi.sendOtp(email.trim(), 'login');
      setEmailMasked(r.data?.emailMasked || emailMasked);
      setMsg(r.data?.message || 'OTP resent to your email.');
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not resend OTP');
    }
    setLoading(false);
  };

  return (
    <AuthShell title={t('auth.otpLogin')} subtitle="Client login — OTP goes to your registered email">
      <Seo title="OTP Login" />
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}
      {msg && (
        <div className="mb-4 flex gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          <Mail size={18} className="mt-0.5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <input
            required
            type="email"
            name="otp-email"
            autoComplete="off"
            placeholder="Registered email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            Use the same email you registered with. OTP is sent to that inbox only.
          </p>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send email OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            Enter the 6-digit code sent to
            <br />
            <span className="font-semibold text-primary-700 dark:text-gold-400">{emailMasked || 'your email'}</span>
          </p>
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
            Resend email OTP
          </button>
          <button type="button" onClick={() => setStep('email')} className="btn-ghost w-full">
            Change email
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-primary-600 dark:text-gold-400">{t('auth.signIn')}</Link>
        {' · '}
        <Link to="/register" className="font-semibold text-primary-600 dark:text-gold-400">{t('auth.signUp')}</Link>
      </p>
    </AuthShell>
  );
}
