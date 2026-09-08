import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Seo from '../../components/common/Seo';
import AuthShell from '../../components/auth/AuthShell';
import { login } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((s: RootState) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(login({
      email: form.email.trim(),
      password: form.password,
    }));
    if (login.fulfilled.match(res)) {
      navigate(res.payload.user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  return (
    <AuthShell title={t('auth.loginTitle')} subtitle={t('auth.loginSub')}>
      <Seo title="Login" />
      <form onSubmit={submit} className="space-y-4" autoComplete="off">
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            required
            type="email"
            name="client-email"
            autoComplete="off"
            placeholder={t('auth.email')}
            className="input pl-10"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            required
            type="password"
            name="client-password"
            autoComplete="new-password"
            placeholder={t('auth.password')}
            className="input pl-10"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" className="rounded" /> {t('auth.remember')}</label>
          <Link to="/forgot-password" className="font-medium text-primary-600 dark:text-gold-400">{t('auth.forgot')}</Link>
        </div>
        <button disabled={status === 'loading'} className="btn-primary w-full">
          {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : t('auth.signIn')}
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />{t('auth.or')}<div className="h-px flex-1 bg-slate-200 dark:bg-white/10" /></div>
      <Link to="/otp-login" className="btn-outline w-full">{t('auth.otpLogin')}</Link>
      <p className="mt-6 text-center text-sm text-slate-500">{t('auth.noAccount')} <Link to="/register" className="font-semibold text-primary-600 dark:text-gold-400">{t('auth.signUp')}</Link></p>
    </AuthShell>
  );
}
