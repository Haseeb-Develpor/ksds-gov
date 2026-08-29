import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import { contentApi } from '../services/api';

export default function NewsDetail() {
  const { slug = '' } = useParams();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    contentApi.newsBySlug(slug).then((r) => setItem(r.data)).catch(() => setItem({
      title: { en: 'Article' },
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=70',
      content: { en: 'This article content is served from the backend when the API is connected. KSA Skill Development continually publishes updates on programs, partnerships, and workforce initiatives aligned with Vision 2030.' },
      createdAt: '2026-06-20',
    }));
  }, [slug]);

  if (!item) return <div className="py-40 text-center text-slate-400">Loading…</div>;
  const title = item.title?.en || item.title;

  return (
    <>
      <Seo title={title} image={item.image} />
      <PageHeader title={title} image={item.image} crumbs={[{ label: 'News', to: '/news' }, { label: title }]} />
      <section className="section">
        <article className="container-wide max-w-3xl space-y-5 text-slate-600 dark:text-slate-300">
          <p className="text-sm text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
          <img src={item.image} alt="" className="w-full rounded-2xl object-cover" />
          <p className="text-lg leading-relaxed">{item.content?.en || item.content}</p>
        </article>
      </section>
    </>
  );
}
