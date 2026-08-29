import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  image?: string;
  crumbs?: { label: string; to?: string }[];
}

export default function PageHeader({ title, subtitle, image, crumbs = [] }: Props) {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0">
        {image && <img src={image} alt="" className="h-full w-full object-cover" loading="eager" />}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-900/80 to-primary-800/60" />
      </div>
      <div className="container-wide relative py-20 sm:py-28">
        <nav className="mb-4 flex items-center gap-1 text-sm text-white/70">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-gold-300"><Home size={14} /> Home</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight size={14} />
              {c.to ? <Link to={c.to} className="hover:text-gold-300">{c.label}</Link> : <span className="text-gold-300">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl animate-fade-up">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p>}
        <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-gold-400 to-gold-600" />
      </div>
    </header>
  );
}
