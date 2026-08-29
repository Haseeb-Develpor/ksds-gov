import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '../common/Logo';

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=70" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/95 to-primary-800/70" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark className="h-11 w-11 shrink-0" />
            <span className="font-display text-lg font-extrabold">KSA Skill Development</span>
          </Link>
          <div>
            <h2 className="font-display text-3xl font-extrabold leading-tight">Empowering the Kingdom's workforce, one skill at a time.</h2>
            <p className="mt-3 max-w-md text-white/70">Join thousands of professionals and enterprises building the future of Saudi Arabia.</p>
          </div>
          <p className="text-sm text-white/50">© {new Date().getFullYear()} KSA Skill Development</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <LogoMark className="h-11 w-11 shrink-0" />
            <span className="font-display text-lg font-extrabold text-primary-700 dark:text-white">KSA Skill</span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
