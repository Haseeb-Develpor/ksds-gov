import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import IdCapture from '../../components/auth/IdCapture';
import { userNav } from '../../data/dashboardNav';
import { ID_TYPES } from '../../data/idTypes';
import { authApi } from '../../services/api';
import { hydrate, setCredentials } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((s: RootState) => s.auth);
  const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

  const [idDocumentType, setIdDocumentType] = useState(user?.idDocumentType || 'sa_national_id');
  const [idImage, setIdImage] = useState('');
  const [idSource, setIdSource] = useState<'upload' | 'camera' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);

  useEffect(() => {
    if (user?.idDocumentType) setIdDocumentType(user.idDocumentType);
  }, [user?.idDocumentType]);

  const uploadId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idImage) {
      setError('Please upload or capture ID photo.');
      return;
    }
    setLoading(true);
    setError('');
    setOk('');
    try {
      const r = await authApi.uploadKyc({
        idDocumentType,
        idImageBase64: idImage,
        idDocumentSource: idSource || 'upload',
      });
      if (r.data.user && token) {
        dispatch(setCredentials({ user: r.data.user, token }));
      } else {
        dispatch(hydrate());
      }
      setOk('ID document saved. Admin can also see it with your name.');
      setIdImage('');
      setIdSource('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save ID photo');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout items={userNav} title="My Dashboard">
      <Seo title="My Profile" />
      <Reveal>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">My Profile & ID</h1>
        <p className="mt-1 text-slate-500">Sirf aapka apna account — {user?.email || 'loading…'}</p>
      </Reveal>

      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {ok && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</div>}

      <Reveal delay={0.05}>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-white">Account</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Name</dt><dd className="font-medium text-right">{name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="font-medium text-right break-all">{user?.email || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">WhatsApp</dt><dd className="font-medium text-right">{user?.phone || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">KYC status</dt><dd className="font-medium capitalize">{user?.kycStatus || 'pending'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">ID type</dt><dd className="font-medium text-right max-w-[60%]">{user?.idDocumentLabel || '—'}</dd></div>
            </dl>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-white">ID document photo</h2>
            {user?.idDocumentUrl ? (
              <>
                <p className="text-xs text-slate-500">
                  Country: {user.idDocumentCountry || '—'} · Source: {user.idDocumentSource || '—'}
                </p>
                <img
                  src={user.idDocumentUrl}
                  alt={`${name} ID`}
                  className="mt-2 max-h-72 w-full rounded-xl object-contain bg-slate-50 dark:bg-white/5"
                />
              </>
            ) : (
              <p className="text-sm text-slate-500">Abhi ID photo nahi hai — neeche upload / camera se add karo.</p>
            )}

            <form onSubmit={uploadId} className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {user?.idDocumentUrl ? 'Replace ID photo' : 'Add ID photo'}
              </p>
              <select className="input" value={idDocumentType} onChange={(e) => setIdDocumentType(e.target.value)}>
                {ID_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <IdCapture
                value={idImage}
                source={idSource}
                onChange={(data, src) => { setIdImage(data); setIdSource(src); }}
                onClear={() => { setIdImage(''); setIdSource(''); }}
              />
              <button disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save ID to my account'}
              </button>
            </form>
          </div>
        </div>
      </Reveal>
    </DashboardLayout>
  );
}
