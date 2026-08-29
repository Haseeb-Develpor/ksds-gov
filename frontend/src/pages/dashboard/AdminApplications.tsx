import { useEffect, useState } from 'react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { adminNav } from '../../data/dashboardNav';
import { adminApi } from '../../services/api';

type AppRow = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  status?: string;
  message?: string;
  idDocumentUrl?: string;
  idDocumentLabel?: string;
  createdAt?: string;
};

export default function AdminApplications() {
  const [items, setItems] = useState<AppRow[]>([]);
  const [selected, setSelected] = useState<AppRow | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    try {
      const r = await adminApi.applications();
      const list = Array.isArray(r.data) ? r.data : [];
      setItems(list);
      if (selected) {
        const next = list.find((x: AppRow) => x._id === selected._id);
        setSelected(next || null);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Could not load applications');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id: string, action: 'approve' | 'reject') => {
    setBusy(id + action);
    setError('');
    setOk('');
    try {
      const r = action === 'approve'
        ? await adminApi.approveApplication(id)
        : await adminApi.rejectApplication(id);
      setOk(r.data?.message || (action === 'approve' ? 'Approved — user notified.' : 'Rejected — user notified.'));
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Action failed');
    }
    setBusy('');
  };

  return (
    <DashboardLayout items={adminNav} title="Admin Panel">
      <Seo title="Applications" />
      <Reveal>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Applications</h1>
        <p className="mt-1 text-slate-500">
          New account registrations wait here. Approve / reject — client gets a notification.
        </p>
      </Reveal>

      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {ok && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</div>}

      <Reveal delay={0.05}>
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="card overflow-hidden lg:col-span-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-slate-500">No real applications yet.</td></tr>
                  )}
                  {items.map((a) => (
                    <tr
                      key={a._id}
                      onClick={() => setSelected(a)}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium">{a.name || '—'}</td>
                      <td className="px-4 py-3">{a.email}</td>
                      <td className="px-4 py-3">{a.service}</td>
                      <td className="px-4 py-3 capitalize">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5 lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-white">Review</h2>
            {!selected && <p className="text-sm text-slate-500">Select an application to approve or reject.</p>}
            {selected && (
              <>
                <p className="text-sm"><span className="text-slate-500">Name:</span> <strong>{selected.name}</strong></p>
                <p className="text-sm"><span className="text-slate-500">Email:</span> {selected.email}</p>
                <p className="text-sm"><span className="text-slate-500">Phone:</span> {selected.phone || '—'}</p>
                <p className="text-sm"><span className="text-slate-500">Status:</span> <span className="capitalize">{selected.status}</span></p>
                <p className="text-xs text-slate-500">{selected.idDocumentLabel}</p>
                {selected.idDocumentUrl && (
                  <img src={selected.idDocumentUrl} alt="ID" className="max-h-64 w-full rounded-xl object-contain bg-slate-50 dark:bg-white/5" />
                )}
                {(selected.status === 'pending' || selected.status === 'in_review') && (
                  <div className="flex gap-2 pt-2">
                    <button
                      disabled={!!busy}
                      onClick={() => decide(selected._id, 'approve')}
                      className="btn-primary flex-1"
                    >
                      {busy === selected._id + 'approve' ? '…' : 'Approve'}
                    </button>
                    <button
                      disabled={!!busy}
                      onClick={() => decide(selected._id, 'reject')}
                      className="btn-outline flex-1"
                    >
                      {busy === selected._id + 'reject' ? '…' : 'Reject'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Reveal>
    </DashboardLayout>
  );
}
