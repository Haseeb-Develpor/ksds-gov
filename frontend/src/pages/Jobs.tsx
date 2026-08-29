import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { getCategory } from '../data/categories';
import NotFound from './NotFound';

const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'NEOM'];

export default function Jobs() {
  const { slug = '' } = useParams();
  const category = getCategory(slug);
  if (!category) return <NotFound />;

  return (
    <>
      <Seo title={`${category.name} Jobs`} description={`Explore ${category.name.toLowerCase()} jobs across Saudi Arabia with KSA Skill Development.`} image={category.image} />
      <PageHeader
        title={`${category.name} Jobs`}
        subtitle={category.description}
        image={category.image}
        crumbs={[{ label: 'Categories', to: '/#categories' }, { label: category.name }]}
      />
      <section className="section">
        <div className="container-wide">
          <Reveal>
            <h2 className="heading-2">Available Positions</h2>
            <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">Certified, fully vetted professionals ready for deployment across the Kingdom.</p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.jobs.map((job, i) => (
              <Reveal key={job} delay={(i % 3) * 0.06}>
                <div className="card card-hover flex h-full flex-col p-6">
                  <div className="h-14 w-14 overflow-hidden rounded-xl shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                    <img src={`${category.image}&w=140&h=140&fit=crop`} alt={`${job} — ${category.name}`} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{job}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400"><MapPin size={14} /> {cities[i % cities.length]}, KSA</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-primary-600 dark:text-gold-400" /> Full-time · Contract</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-primary-600 dark:text-gold-400" /> Visa & onboarding support</li>
                  </ul>
                  <Link to="/contact" className="btn-primary mt-5 w-full">Apply Now <ArrowRight size={16} /></Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
