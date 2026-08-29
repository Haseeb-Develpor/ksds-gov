import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Search } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { services, serviceCategories } from '../data/services';

export default function Services() {
  const { t } = useTranslation();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  const filtered = services.filter(
    (s) => (cat === 'All' || s.category === cat) && s.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <Seo title="Services" description="Over 50 specialized skill-worker services." />
      <PageHeader title={t('sections.servicesTitle')} subtitle={t('sections.servicesSub')} image="https://images.unsplash.com/photo-1503387762-9b6c5e7b46b6?auto=format&fit=crop&w=1400&q=70" crumbs={[{ label: 'Services' }]} />
      <section className="section">
        <div className="container-wide">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {['All', ...serviceCategories].map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${cat === c ? 'bg-primary-600 text-white shadow-soft' : 'bg-slate-100 text-slate-600 hover:bg-primary-50 dark:bg-white/5 dark:text-slate-300'}`}>{c}</button>
              ))}
            </div>
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="input pl-10" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 0.05}>
                <Link to={`/services/${s.slug}`} className="card card-hover group block overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img src={s.image} alt={s.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                    <span className="absolute left-3 top-3 rounded-full bg-primary-700/90 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">{s.category}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{s.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{s.summary}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-gold-400">{t('common.learnMore')} <ArrowRight size={15} /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && <p className="py-16 text-center text-slate-400">No services found.</p>}
        </div>
      </section>
    </>
  );
}
