import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileImage, Inbox } from 'lucide-react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { userNav } from '../../data/dashboardNav';
import { clientApi } from '../../services/api';
import { hydrate } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';

type Doc = {
  _id: string;
  title?: string;
  type?: string;
  url?: string;
  isIdentityCard?: boolean;
  createdAt?: string;
};

export default function Documents() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [items, setItems] = useState<Doc[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(hydrate());
    (async () => {
      try {
        const r = await clientApi.documents();
        setItems(Array.isArray(r.data?.items) ? r.data.items : []);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Could not load your documents');
      }
    })();
  }, [dispatch]);

  return (
    <DashboardLayout items={userNav} title="My Dashboard">
      <Seo title="My Documents" />
      <Reveal>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">My Documents</h1>
        <p className="mt-1 text-slate-500">
          Sirf aapke documents — {user?.email}. Dusre clients / admin ka data yahan nahi aata.
        </p>
      </Reveal>

      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <Reveal delay={0.05}>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && (
            <div className="card col-span-full flex flex-col items-center py-14 text-center">
              <Inbox className="text-slate-400" size={28} />
              <p className="mt-3 text-sm text-slate-500">Abhi koi document nahi.</p>
              <Link to="/dashboard/profile" className="btn-primary mt-4">Upload ID card in Profile</Link>
            </div>
          )}
          {items.map((d) => (
            <div key={d._id} className="card overflow-hidden p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700 dark:bg-white/10">
                  <FileImage size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{d.title || 'Document'}</p>
                  <p className="text-xs text-slate-500 capitalize">{d.isIdentityCard ? 'Identity card (Iqama / National ID)' : d.type}</p>
                </div>
              </div>
              {d.url && (
                <img src={d.url} alt={d.title || 'document'} className="mt-3 max-h-56 w-full rounded-lg object-contain bg-slate-50 dark:bg-white/5" />
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </DashboardLayout>
  );
}
