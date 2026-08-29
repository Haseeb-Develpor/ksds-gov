import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { getContentPage } from '../data/content';
import NotFound from './NotFound';

// Organisations that partner with / hire through KSA Skill Development.
const clients = [
  { logo: '/clients/moh.jpeg', name: 'Ministry of Health', detail: 'The government authority overseeing Saudi Arabia’s public healthcare system, hospitals and primary-care centres across the Kingdom.' },
  { logo: '/clients/moe.jpeg', name: 'Ministry of Education', detail: 'The national body responsible for education policy, schools and universities throughout Saudi Arabia.' },
  { logo: '/clients/almarai.jpeg', name: 'Almarai', detail: 'The Gulf’s largest integrated dairy and food company, headquartered in Riyadh, producing dairy, juice, bakery and poultry products.' },
  { logo: '/clients/almajal.jpeg', name: 'Almajal Alarabi Group (MAG)', detail: 'A leading Saudi facilities-management and support-services group providing cleaning, catering and manpower solutions.' },
  { logo: '/clients/alayuni.jpeg', name: 'Al-Ayuni Investment & Contracting', detail: 'A major Saudi contracting company delivering large-scale infrastructure, roads and water projects across the Kingdom.' },
  { logo: '/clients/lulu.jpeg', name: 'LuLu Hypermarket', detail: 'One of the largest retail hypermarket chains in the Gulf, part of the LuLu Group, with stores throughout Saudi Arabia.' },
];

export default function ContentPage({ slug: fixedSlug }: { slug?: string }) {
  const params = useParams();
  const { i18n } = useTranslation();
  const slug = fixedSlug || params.slug || '';
  const page = getContentPage(slug);

  if (!page) return <NotFound />;
  const title = i18n.language === 'ar' ? page.titleAr : page.title;

  return (
    <>
      <Seo title={page.title} description={page.intro} image={page.image} />
      <PageHeader title={title} subtitle={page.intro} image={page.image} crumbs={[{ label: page.title }]} />
      <section className="section">
        <div className="container-wide grid gap-10 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="prose-content space-y-5 text-slate-600 dark:text-slate-300">
              {page.body.map((p, i) => (
                <p key={i} className="text-base leading-relaxed">{p}</p>
              ))}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {['Transparency & Integrity', 'World-Class Standards', 'Vision 2030 Alignment', 'Continuous Excellence'].map((f) => (
                  <div key={f} className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-800 dark:bg-white/5 dark:text-primary-200">
                    <CheckCircle2 size={18} className="text-primary-600 dark:text-gold-400" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card overflow-hidden">
              <img src={page.image} alt={page.title} className="h-56 w-full object-cover" />
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Need assistance?</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Our team is available 24/7 to support you through every step.</p>
                <a href="/contact" className="btn-primary mt-4 w-full">Contact Us</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {slug === 'about' && (
        <section className="section bg-white dark:bg-white/[0.02]">
          <div className="container-wide">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Our Clients</p>
              <h2 className="heading-2 mt-2">Companies Working With Us</h2>
              <div className="mx-auto mt-4 gold-line" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">Leading Saudi ministries and enterprises that trust KSA Skill Development for their workforce needs.</p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clients.map((c, i) => (
                <Reveal key={c.name} delay={(i % 3) * 0.06}>
                  <div className="card card-hover flex h-full flex-col items-center p-7 text-center">
                    <div className="grid h-24 w-full place-items-center rounded-xl bg-white p-4 ring-1 ring-black/5">
                      <img src={c.logo} alt={`${c.name} logo`} className="max-h-16 max-w-[80%] object-contain" loading="lazy" />
                    </div>
                    <h3 className="mt-5 font-display text-base font-bold text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{c.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
