import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Clock, CheckCircle2 } from 'lucide-react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { adminNav } from '../../data/dashboardNav';
import { adminApi } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    applications: 0,
    pendingApprovals: 0,
    approved: 0,
    recent: [] as { user: string; action: string; time: string; status?: string }[],
  });

  useEffect(() => {
    (async () => {
      try {
        const r = await adminApi.stats();
        setStats({
          users: r.data?.users || 0,
          applications: r.data?.applications || 0,
          pendingApprovals: r.data?.pendingApprovals || 0,
          approved: r.data?.approved || 0,
          recent: Array.isArray(r.data?.recent) ? r.data.recent : [],
        });
      } catch {
        /* keep zeros — never fake numbers */
      }
    })();
  }, []);

  const cards = [
    { label: 'Real clients', value: stats.users, icon: Users, color: 'from-primary-500 to-primary-700' },
    { label: 'Applications', value: stats.applications, icon: FileText, color: 'from-blue-500 to-blue-700' },
    { label: 'Waiting approval', value: stats.pendingApprovals, icon: Clock, color: 'from-gold-400 to-gold-600' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-700' },
  ];

  return (
    <DashboardLayout items={adminNav} title="Admin Panel">
      <Seo title="Admin Dashboard" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Admin Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Real data only — approve new account registrations from Applications.</p>
        </div>
        <Link to="/admin/applications" className="btn-primary">Open Applications</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05}>
            <div className="card p-5">
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-white`}>
                <s.icon size={20} />
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.08}>
        <div className="card mt-6 p-6">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent registrations / applications</h2>
          {stats.recent.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Abhi koi real application nahi. Jab client account banayega, yahan dikhega.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {stats.recent.map((r, i) => (
                <li key={i} className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-white/10 dark:text-primary-300">
                    {(r.user || '?')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{r.user}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.action}</p>
                    <p className="text-[11px] text-slate-400">{r.time ? String(r.time).slice(0, 19).replace('T', ' ') : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </DashboardLayout>
  );
}
