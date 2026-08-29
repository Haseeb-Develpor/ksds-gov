import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import Counter from '../components/common/Counter';
import { categories } from '../data/categories';
import { stats, whyChoose } from '../data/content';

export default function JobsIndex() {
  const { t } = useTranslation();
  return (
    <>
      <Seo
        title="Jobs & Workforce Categories"
        description="Explore skill jobs across every sector in Saudi Arabia — construction, IT, healthcare, engineering, hospitality, logistics and more, with KSA Skill Development."
      />
      <PageHeader
        title="Jobs Across the Kingdom"
        subtitle="Browse certified skill professionals and open positions across twelve specialised sectors."
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=70"
        crumbs={[{ label: 'Jobs' }]}
      />

      {/* Stats */}
      <section className="relative -mt-12 z-10">
        <div className="container-wide">
          <div className="glass grid grid-cols-2 gap-6 rounded-3xl p-8 sm:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.key} delay={i * 0.08} className="text-center">
                <div className="font-display text-3xl font-extrabold text-primary-700 dark:text-gold-400 sm:text-4xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">{t(`stats.${s.key}`)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="section scroll-mt-24">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Explore by Sector</p>
            <h2 className="heading-2 mt-2">Workforce Categories</h2>
            <div className="mx-auto mt-4 gold-line" />
            <p className="mt-4 text-slate-500 dark:text-slate-400">Twelve specialised sectors connecting Saudi employers with certified professionals.</p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 4) * 0.05}>
                <div className="card card-hover group flex h-full flex-col p-7">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl shadow-soft ring-1 ring-black/5 transition group-hover:scale-110 group-hover:shadow-gold dark:ring-white/10">
                    <img src={`${c.image}&w=160&h=160&fit=crop`} alt={`${c.name} work in Saudi Arabia`} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{c.description}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-400">{c.jobs.length} roles</p>
                  <Link to={`/jobs/${c.slug}`} className="btn-outline mt-4 w-full group-hover:border-primary-600">
                    View Jobs <ArrowRight size={16} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="section bg-white dark:bg-white/[0.02]">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{t('sections.whyTitle')}</p>
            <h2 className="heading-2 mt-2">{t('sections.whySub')}</h2>
            <div className="mx-auto mt-4 gold-line" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChoose.map((w, i) => {
              const Icon = (Icons as any)[w.icon] || Icons.Star;
              return (
                <Reveal key={w.title} delay={(i % 3) * 0.06}>
                  <div className="card card-hover h-full p-7">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft"><Icon size={22} /></div>
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{w.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{w.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA + Newsletter */}
      <section className="section">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 p-10 text-center text-white sm:p-16">
            <div className="absolute inset-0 bg-hero-radial opacity-50" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{t('sections.ctaTitle')}</h2>
              <p className="mt-3 text-white/80">{t('sections.ctaSub')}</p>
              <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <input type="email" aria-label="Email address" placeholder="you@example.com" className="input flex-1 bg-white/95 text-slate-800" />
                <button className="btn-gold px-6 py-3">{t('sections.subscribe')}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
