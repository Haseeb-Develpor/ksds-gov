import { useEffect, useState } from 'react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { adminNav } from '../../data/dashboardNav';
import { adminApi } from '../../services/api';

type AdminUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  kycStatus?: string;
  idDocumentLabel?: string;
  idDocumentCountry?: string;
  idDocumentUrl?: string;
  idDocumentSource?: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await adminApi.users();
        setUsers(Array.isArray(r.data) ? r.data : []);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Could not load users');
      }
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardLayout items={adminNav} title="Admin Panel">
      <Seo title="Users & ID Documents" />
      <Reveal>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Users & ID documents</h1>
        <p className="mt-1 text-slate-500">Each client ID photo with their registered name and email</p>
      </Reveal>

      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <Reveal delay={0.05}>
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="card overflow-hidden lg:col-span-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">KYC</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={5} className="px-4 py-6 text-slate-500">Loading…</td></tr>
                  )}
                  {!loading && users.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-6 text-slate-500">No client accounts yet.</td></tr>
                  )}
                  {users.map((u) => {
                    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—';
                    return (
                      <tr
                        key={u._id}
                        className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
                        onClick={() => setSelected(u)}
                      >
                        <td className="px-4 py-3 font-medium">{name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.phone || '—'}</td>
                        <td className="px-4 py-3">{u.idDocumentUrl ? 'Yes' : '—'}</td>
                        <td className="px-4 py-3 capitalize">{u.kycStatus || 'pending'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5 lg:col-span-2">
            <h2 className="font-semibold text-slate-800 dark:text-white">ID preview</h2>
            {!selected && <p className="mt-3 text-sm text-slate-500">Select a user to view their ID photo.</p>}
            {selected && (
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="text-slate-500">Name:</span> <strong>{`${selected.firstName || ''} ${selected.lastName || ''}`.trim()}</strong></p>
                <p><span className="text-slate-500">Email:</span> {selected.email}</p>
                <p><span className="text-slate-500">Phone:</span> {selected.phone || '—'}</p>
                <p><span className="text-slate-500">Document:</span> {selected.idDocumentLabel || '—'}</p>
                <p><span className="text-slate-500">Country:</span> {selected.idDocumentCountry || '—'}</p>
                {selected.idDocumentUrl ? (
                  <img
                    src={selected.idDocumentUrl}
                    alt={`${selected.firstName} ID`}
                    className="mt-2 max-h-96 w-full rounded-xl object-contain bg-slate-50 dark:bg-white/5"
                  />
                ) : (
                  <p className="text-slate-500">No ID photo uploaded.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </DashboardLayout>
  );
}
