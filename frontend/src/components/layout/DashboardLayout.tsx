import { ReactNode, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'lucide-react';
import { Menu, X, LogOut, Home } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { useTheme } from '../../lib/theme';
import { LogoMark } from '../common/Logo';

export interface NavItem { to: string; label: string; icon: string; }

export default function DashboardLayout({ items, title, children }: { items: NavItem[]; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#04150e]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-primary-950 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="h-9 w-9 shrink-0" />
            <span className="font-display font-bold">{title}</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X size={20} /></button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {items.map((it) => {
            const Icon = (Icons as any)[it.icon] || Icons.Circle;
            return (
              <NavLink key={it.to} to={it.to} end onClick={() => setOpen(false)} className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/10 text-gold-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}`
              }>
                <Icon size={18} /> {it.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full space-y-1 p-3">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5"><Home size={18} /> Back to Site</Link>
          <button onClick={() => { dispatch(logout()); navigate('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-[#0a2018]">
          <button onClick={() => setOpen(true)} className="lg:hidden"><Menu /></button>
          <div className="hidden lg:block font-display font-bold text-slate-800 dark:text-white">{title}</div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="rounded-lg p-2 text-slate-500 dark:text-slate-300">{theme === 'dark' ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}</button>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-600 text-sm font-bold text-white">{user?.firstName?.[0] || 'U'}</div>
              <div className="hidden text-sm sm:block">
                <p className="font-semibold text-slate-800 dark:text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
