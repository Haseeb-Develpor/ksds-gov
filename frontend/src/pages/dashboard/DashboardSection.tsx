import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Inbox } from 'lucide-react';
import Seo from '../../components/common/Seo';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import Reveal from '../../components/common/Reveal';
import { RootState } from '../../store';

interface Props {
  items: NavItem[];
  panelTitle: string;
  label: string;
  description?: string;
  rows?: string[];
}

/**
 * Client sections: NEVER show fake/admin sample rows.
 * Only empty state for this logged-in user's account until real records exist.
 */
export default function DashboardSection({ items, panelTitle, label, description }: Props) {
  const user = useSelector((s: RootState) => s.auth.user);
  const isAdminPanel = panelTitle.toLowerCase().includes('admin');

  return (
    <DashboardLayout items={items} title={panelTitle}>
      <Seo title={label} />
      <Reveal>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{label}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {description ||
              (isAdminPanel
                ? `Admin tools for ${label.toLowerCase()}.`
                : `Only your own ${label.toLowerCase()} for ${user?.email || 'your account'} — no other client or admin demo data.`)}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5">
            <Inbox size={26} />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-800 dark:text-white">
            No {label.toLowerCase()} yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            {isAdminPanel
              ? 'When clients submit real data, it will appear here for admin review.'
              : 'Jab aap apply / upload karoge, sirf aapka record yahan dikhega. Pehle fake sample data hata diya gaya hai.'}
          </p>
          {!isAdminPanel && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link to="/dashboard/profile" className="btn-primary">My Profile & ID card</Link>
              <Link to="/dashboard/documents" className="btn-outline">My Documents</Link>
            </div>
          )}
        </div>
      </Reveal>
    </DashboardLayout>
  );
}
