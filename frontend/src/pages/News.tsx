import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { contentApi } from '../services/api';

const fallback = [
  { _id: '1', slug: 'new-training-program', title: { en: 'KSA Skill Development Launches New Training Program' }, excerpt: { en: 'A comprehensive initiative to empower the Saudi workforce with world-class skills aligned with Vision 2030.' }, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=70', category: 'Training', createdAt: '2026-06-20' },
  { _id: '2', slug: 'partnership-announcement', title: { en: 'Strategic Partnership Strengthens Workforce Pipeline' }, excerpt: { en: 'New agreements expand our reach across construction, healthcare, and logistics sectors.' }, image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=70', category: 'Corporate', createdAt: '2026-06-12' },
  { _id: '3', slug: 'hajj-season-success', title: { en: 'Record Hajj Season Operations Completed' }, excerpt: { en: 'Our Hajj division served thousands of pilgrims with premium, fully managed services.' }, image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=70', category: 'Hajj', createdAt: '2026-06-01' },
];

export default function News() {
  const [items, setItems] = useState<any[]>(fallback);

  useEffect(() => {
    contentApi.news().then((r) => { if (Array.isArray(r.data) && r.data.length) setItems(r.data); }).catch(() => {});
  }, []);

  return (
    <>
      <Seo title="News" description="Latest news and announcements." />
      <PageHeader title="Latest News" subtitle="Announcements, programs, and updates from KSA Skill Development." image="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=70" crumbs={[{ label: 'News' }]} />
      <section className="section">
        <div className="container-wide grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((n, i) => (
            <Reveal key={n._id} delay={(i % 3) * 0.06}>
              <Link to={`/news/${n.slug}`} className="card card-hover group block overflow-hidden">
                <div className="h-48 overflow-hidden"><img src={n.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" /></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 font-semibold text-primary-700 dark:bg-white/5 dark:text-primary-300">{n.category}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">{n.title?.en || n.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{n.excerpt?.en || n.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-gold-400">Read More <ArrowRight size={15} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
