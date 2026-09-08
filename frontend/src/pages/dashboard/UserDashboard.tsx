import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Phone, Mail, ShieldCheck, IdCard, ArrowRight } from 'lucide-react';
import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { userNav } from '../../data/dashboardNav';
import { clientApi } from '../../services/api';
import { hydrate } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';

export default function UserDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const [counts, setCounts] = useState({ applications: 0, documents: 0, pending: 0 });

  useEffect(() => {
    dispatch(hydrate());
    (async () => {
      try {
        const r = await clientApi.overview();
        setCounts({
          applications: r.data?.applications || 0,
          documents: r.data?.documents || 0,
          pending: r.data?.pending || 0,
        });
      } catch {
        /* keep zeros — never show fake admin stats */
      }
    })();
  }, [dispatch]);

  const kyc = user?.kycStatus || 'pending';
  const kycLabel =
    kyc === 'submitted' ? 'Submitted' :
    kyc === 'approved' ? 'Approved' :
    kyc === 'rejected' ? 'Rejected' : 'Pending';

  return (
    <DashboardLayout items={userNav} title="My Dashboard">
      <Seo title="Dashboard" />
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome back, {name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Aapka account: <span className="font-medium text-slate-700 dark:text-slate-200">{user?.email}</span>
          {' · '}sirf aapka apna data
        </p>
      </div>

      {(user?.kycStatus === 'submitted' || user?.kycStatus === 'pending') && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="font-semibold">Waiting for approval</p>
          <p className="mt-1">
            Aapka data Saudi government / authority review ke liye bhej diya gaya hai. Approval ya rejection ke baad
            aapko notification mil jayegi. Abhi status: <strong className="capitalize">{user?.kycStatus}</strong>.
          </p>
          <Link to="/dashboard/notifications" className="mt-3 inline-flex text-sm font-semibold text-primary-700 dark:text-gold-300">
            Open notifications →
          </Link>
        </div>
      )}
      {user?.kycStatus === 'approved' && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          Your account has been approved. You can continue using client services.
        </div>
      )}
      {user?.kycStatus === 'rejected' && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          Your registration was not approved. Please update your ID documents in My Profile, or contact support.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <div className="card p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
              <ShieldCheck size={20} />
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-slate-900 dark:text-white">{kycLabel}</p>
            <p className="text-sm text-slate-500">Identity card / KYC status</p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <Link to="/dashboard/documents" className="card block p-5 hover:ring-2 hover:ring-primary-200">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              <IdCard size={20} />
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-slate-900 dark:text-white">{counts.documents}</p>
            <p className="text-sm text-slate-500">My documents (incl. ID card)</p>
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <Link to="/dashboard/applications" className="card block p-5 hover:ring-2 hover:ring-primary-200">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white">
              <FileText size={20} />
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-slate-900 dark:text-white">{counts.applications}</p>
            <p className="text-sm text-slate-500">My applications only</p>
          </Link>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="card p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white">
              <Phone size={20} />
            </div>
            <p className="mt-3 font-display text-lg font-extrabold text-slate-900 dark:text-white truncate">{user?.phone || '—'}</p>
            <p className="text-sm text-slate-500">Your mobile number</p>
          </div>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.05}>
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Account (your email)</h2>
              <Link to="/dashboard/profile" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-gold-400">
                Profile <ArrowRight size={15} />
              </Link>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Full name</dt><dd className="font-medium text-right">{name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="font-medium text-right break-all">{user?.email}</dd></div>
              <div className="flex justify-between gap-3 items-center"><dt className="text-slate-500 flex items-center gap-1"><Mail size={14} /> Login email</dt><dd className="font-medium text-right break-all">{user?.email}</dd></div>
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Identity card photo
              </h2>
              <Link to="/dashboard/documents" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-gold-400">
                Documents <ArrowRight size={15} />
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              “ID” = aapka National ID / Iqama / passport photo — yeh document hai, email ID nahi.
            </p>
            {user?.idDocumentUrl ? (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300">{user.idDocumentLabel}</p>
                <img
                  src={user.idDocumentUrl}
                  alt={`${name} identity card`}
                  className="mt-1 max-h-72 w-full rounded-xl object-contain bg-slate-50 dark:bg-white/5"
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-white/10">
                <p className="text-sm text-slate-500">Identity card photo abhi nahi hai.</p>
                <Link to="/dashboard/profile" className="btn-primary mt-4 inline-flex">Upload in My Profile</Link>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
