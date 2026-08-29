import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, Moon, Sun, Globe, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { LogoMark } from '../common/Logo';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const modules = [
  { to: '/services', key: 'services' },
  { to: '/training', key: 'training' },
  { to: '/visa', key: 'visa' },
  { to: '/khadmen-haram', key: 'khadmenHaram' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  const links = [
    { to: '/', key: 'home' },
    { to: '/about', key: 'about' },
    { to: '/jobs', key: 'jobs' },
    ...modules,
    { to: '/media-center', key: 'media' },
    { to: '/careers', key: 'careers' },
    { to: '/contact', key: 'contact' },
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-glass py-2' : 'bg-transparent py-4'}`}>
      <div className="container-wide flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="KSA Skill Development home">
          <LogoMark className="h-11 w-11 shrink-0" />
          <div className="leading-tight">
            <div className={`font-display text-base font-extrabold ${scrolled ? 'text-primary-700 dark:text-white' : 'text-white'}`}>{t('brandShort')}</div>
            <div className={`text-[10px] uppercase tracking-widest ${scrolled ? 'text-slate-500 dark:text-slate-300' : 'text-white/70'}`}>Development</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-gold-500' : scrolled ? 'text-slate-700 hover:text-primary-600 dark:text-slate-200' : 'text-white/90 hover:text-gold-300'
                }`
              }
            >
              {t(`nav.${l.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className={`hidden rounded-lg p-2 sm:inline-flex ${scrolled ? 'text-slate-600 dark:text-slate-200' : 'text-white'}`} aria-label="language">
            <Globe size={18} /> <span className="ml-1 text-xs font-semibold">{i18n.language === 'ar' ? 'EN' : 'ع'}</span>
          </button>
          <button onClick={toggle} className={`rounded-lg p-2 ${scrolled ? 'text-slate-600 dark:text-slate-200' : 'text-white'}`} aria-label="theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 lg:flex">
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-outline px-3 py-2">
                <LayoutDashboard size={16} /> {t('nav.dashboard')}
              </Link>
              <button onClick={() => { dispatch(logout()); navigate('/'); }} className="btn-ghost px-3 py-2"><LogOut size={16} /></button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/login" className="btn-ghost px-3 py-2">{t('nav.login')}</Link>
              <Link to="/register" className="btn-primary px-4 py-2">{t('nav.register')}</Link>
            </div>
          )}

          <button onClick={() => setOpen(!open)} className={`rounded-lg p-2 lg:hidden ${scrolled ? 'text-slate-700 dark:text-white' : 'text-white'}`}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="container-wide mt-3 lg:hidden">
          <div className="glass rounded-2xl p-4">
            <div className="grid gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50 dark:text-slate-200 dark:hover:bg-white/5">
                  {t(`nav.${l.key}`)}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-200/60 pt-3 dark:border-white/10">
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="btn-primary flex-1">{t('nav.dashboard')}</Link>
                  <button onClick={() => { dispatch(logout()); setOpen(false); navigate('/'); }} className="btn-outline">{t('nav.logout')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline flex-1">{t('nav.login')}</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">{t('nav.register')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
