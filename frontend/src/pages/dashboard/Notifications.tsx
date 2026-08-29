import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { userNav } from '../../data/dashboardNav';
import { clientApi } from '../../services/api';
import { RootState } from '../../store';

type Ntf = {
  _id: string;
  title?: string;
  body?: string;
  read?: boolean;
  createdAt?: string;
};

export default function Notifications() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [items, setItems] = useState<Ntf[]>([]);

  const load = async () => {
    try {
      const r = await clientApi.notifications();
      setItems(Array.isArray(r.data?.items) ? r.data.items : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    try {
      await clientApi.readNotification(id);
      await load();
    } catch {
      /* ignore */
    }
  };

  return (
    <DashboardLayout items={userNav} title="My Dashboard">
      <Seo title="Notifications" />
      <Reveal>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
        <p className="mt-1 text-slate-500">Sirf aapke liye — {user?.email}</p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 space-y-3">
          {items.length === 0 && (
            <div className="card flex flex-col items-center py-14 text-center">
              <Bell className="text-slate-400" size={28} />
              <p className="mt-3 text-sm text-slate-500">Abhi koi notification nahi.</p>
            </div>
          )}
          {items.map((n) => (
            <button
              key={n._id}
              type="button"
              onClick={() => !n.read && markRead(n._id)}
              className={`card w-full p-4 text-left transition ${n.read ? 'opacity-80' : 'ring-1 ring-primary-200 dark:ring-gold-500/30'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{n.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.body}</p>
                  <p className="mt-2 text-xs text-slate-400">{n.createdAt ? String(n.createdAt).slice(0, 19).replace('T', ' ') : ''}</p>
                </div>
                {!n.read && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
              </div>
            </button>
          ))}
        </div>
      </Reveal>
    </DashboardLayout>
  );
}
