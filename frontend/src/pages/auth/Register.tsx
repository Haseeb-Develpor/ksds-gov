import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import Seo from '../../components/common/Seo';
import AuthShell from '../../components/auth/AuthShell';
import IdCapture from '../../components/auth/IdCapture';
import { authApi } from '../../services/api';
import { setCredentials } from '../../store/slices/authSlice';
import { ID_TYPES } from '../../data/idTypes';

export default function Register() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    idDocumentType: 'sa_national_id',
  });
  const [idImage, setIdImage] = useState('');
  const [idSource, setIdSource] = useState<'upload' | 'camera' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const f = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idImage) {
      setError('Please upload or capture your ID card photo.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await authApi.register({
        ...form,
        idImageBase64: idImage,
        idDocumentSource: idSource || 'upload',
      });
      if (r.data.user?.role === 'admin') {
        setError('Invalid registration.');
        setLoading(false);
        return;
      }
      dispatch(setCredentials({ user: r.data.user, token: r.data.token }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <AuthShell title={t('auth.registerTitle')} subtitle="Create client account — no OTP at signup">
      <Seo title="Register" />
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}

      <form onSubmit={submitForm} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder={t('auth.firstName')} className="input" {...f('firstName')} />
          <input required placeholder={t('auth.lastName')} className="input" {...f('lastName')} />
        </div>
        <input required type="email" placeholder={t('auth.email')} className="input" {...f('email')} />
        <input required placeholder="WhatsApp number (saved for OTP login later)" className="input" {...f('phone')} />
        <p className="text-xs text-slate-500">
          Number is saved with your account. OTP is only used later for login or forgot password — not at signup.
        </p>
        <input required type="password" minLength={6} placeholder={t('auth.password')} className="input" {...f('password')} />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">ID document type</label>
          <select required className="input" {...f('idDocumentType')}>
            {ID_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <IdCapture
          value={idImage}
          source={idSource}
          onChange={(data, src) => { setIdImage(data); setIdSource(src); }}
          onClear={() => { setIdImage(''); setIdSource(''); }}
        />

        <button disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="animate-spin" size={18} /> : t('auth.signUp')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary-600 dark:text-gold-400">{t('auth.signIn')}</Link>
        {' · '}
        <Link to="/otp-login" className="font-semibold text-primary-600 dark:text-gold-400">{t('auth.otpLogin')}</Link>
      </p>
    </AuthShell>
  );
}
