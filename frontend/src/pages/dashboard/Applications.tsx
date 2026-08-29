import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Inbox } from 'lucide-react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { userNav } from '../../data/dashboardNav';
import { clientApi } from '../../services/api';
import { hydrate } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';

type AppRow = {
  _id: string;
  service?: string;
  status?: string;
  createdAt?: string;
  date?: string;
};

export default function Applications() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [items, setItems] = useState<AppRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(hydrate());
    (async () => {
      try {
        const r = await clientApi.applications();
        setItems(Array.isArray(r.data?.items) ? r.data.items : []);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Could not load applications');
      }
    })();
  }, [dispatch]);

  return (
    <DashboardLayout items={userNav} title="My Dashboard">
      <Seo title="My Applications" />
      <Reveal>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">My Applications</h1>
        <p className="mt-1 text-slate-500">
          Sirf aapki applications — {user?.firstName} {user?.lastName} ({user?.email})
        </p>
      </Reveal>

      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <Reveal delay={0.05}>
        <div className="mt-6 card overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Inbox className="text-slate-400" size={28} />
              <p className="mt-3 text-sm text-slate-500">Abhi koi application nahi. Fake sample records hata diye gaye hain.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 dark:bg-white/5">
                <tr>
                  {['ID', 'Service', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a._id} className="border-t border-slate-100 dark:border-white/5">
                    <td className="px-5 py-3 font-medium">{a._id}</td>
                    <td className="px-5 py-3">{a.service}</td>
                    <td className="px-5 py-3 capitalize">{a.status}</td>
                    <td className="px-5 py-3 text-slate-400">{(a.createdAt || a.date || '').slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Reveal>
    </DashboardLayout>
  );
}
