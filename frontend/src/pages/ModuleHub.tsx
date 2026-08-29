import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import type { ModulePage } from '../data/content';

interface Props {
  title: string;
  base: string;
  image: string;
  intro: string;
  pages: ModulePage[];
}

export default function ModuleHub({ title, base, image, intro, pages }: Props) {
  return (
    <>
      <Seo title={title} description={intro} image={image} />
      <PageHeader title={title} subtitle={intro} image={image} crumbs={[{ label: title }]} />
      <section className="section">
        <div className="container-wide grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.06}>
              <Link to={`${base}/${p.slug}`} className="card card-hover group block overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 to-transparent" />
                  <h3 className="absolute bottom-3 left-4 font-display text-xl font-bold text-white">{p.title}</h3>
                </div>
                <div className="p-5">
                  <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{p.intro}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-gold-400">Explore <ArrowRight size={15} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
