import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import type { ModulePage } from '../data/content';
import NotFound from './NotFound';

interface Props { title: string; base: string; pages: ModulePage[]; }

export default function ModuleDetail({ title, base, pages }: Props) {
  const { slug = '' } = useParams();
  const page = pages.find((p) => p.slug === slug);
  if (!page) return <NotFound />;

  return (
    <>
      <Seo title={`${page.title} — ${title}`} description={page.intro} image={page.image} />
      <PageHeader title={page.title} subtitle={page.intro} image={page.image} crumbs={[{ label: title, to: base }, { label: page.title }]} />
      <section className="section">
        <div className="container-wide grid gap-10 lg:grid-cols-3">
          <Reveal className="lg:col-span-2 space-y-5 text-slate-600 dark:text-slate-300">
            <p className="text-lg leading-relaxed">{page.intro}</p>
            <p>Our {title} division delivers a fully managed, premium experience. Every detail — from documentation to logistics — is handled by dedicated specialists to ensure a seamless and spiritually focused journey.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Premium service standard', 'Dedicated coordinator', 'Transparent pricing', '24/7 support', 'Verified providers', 'Real-time tracking'].map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-800 dark:bg-white/5 dark:text-primary-200">
                  <CheckCircle2 size={18} className="text-primary-600 dark:text-gold-400" /> {f}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Enquire Now</h3>
              <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-3">
                <input placeholder="Full name" className="input" />
                <input placeholder="Email" className="input" />
                <input placeholder="Phone" className="input" />
                <button className="btn-gold w-full">Book Now</button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
