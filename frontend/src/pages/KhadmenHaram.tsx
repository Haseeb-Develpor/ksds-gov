import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';

const im = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=140&h=140&q=68`;

const roles = [
  { title: 'Haram Cleaning Staff', desc: 'Dedicated cleaning teams maintaining the pristine standard of the Two Holy Mosques.', img: im('1581578731548-c64695cc6952') },
  { title: 'Maintenance Staff', desc: 'Skill technicians ensuring facilities operate flawlessly around the clock.', img: im('1581092918056-0c4c3acd3789') },
  { title: 'Hospitality Staff', desc: 'Warm, professional service teams caring for the guests of the Haram.', img: im('1566073771259-6a8506099945') },
  { title: 'Support Staff', desc: 'Coordination and assistance roles keeping operations running smoothly.', img: im('1497366754035-f200968a6e72') },
  { title: 'General Workers', desc: 'Reliable general-duty workforce supporting daily Haram operations.', img: im('1503328427499-d92d1ac3d174') },
  { title: 'Supervisors', desc: 'Experienced supervisors leading teams with discipline and excellence.', img: im('1560250097-0b93528c311a') },
  { title: 'Wheelchair Attendant', desc: 'Compassionate attendants assisting elderly and special-needs pilgrims with mobility.', img: im('1576091160399-112ba8d25d1d') },
  { title: 'Storekeeper', desc: 'Organised storekeepers managing inventory, supplies, and stock for smooth operations.', img: im('1586528116311-ad8dd3c8310d') },
  { title: 'First Aid Attendant', desc: 'Trained first-aid attendants providing prompt medical assistance to guests of the Haram.', img: im('1584515933487-779824d29309') },
  { title: 'Packing Worker', desc: 'Efficient packing workers handling packaging and distribution of essential items.', img: im('1607344645866-009c320c5ab8') },
];

export default function KhadmenHaram() {
  return (
    <>
      <Seo
        title="Khadmen Haram Jobs"
        description="Serve the guests of the Two Holy Mosques. Cleaning, maintenance, hospitality, and support jobs with KSA Skill Development."
        image="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1400&q=70"
      />
      <PageHeader
        title="Khadmen Haram"
        subtitle="An honour to serve — dedicated workforce for the service of the Two Holy Mosques."
        image="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1400&q=70"
        crumbs={[{ label: 'Khadmen Haram' }]}
      />
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Service of the Haram</p>
            <h2 className="heading-2 mt-2">Available Positions</h2>
            <div className="mx-auto mt-4 gold-line" />
            <p className="mt-4 text-slate-500 dark:text-slate-400">Carefully selected, trained, and supported staff for the most respected service in the Kingdom.</p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((r, i) => (
              <Reveal key={r.title} delay={(i % 3) * 0.06}>
                <div className="card card-hover flex h-full flex-col p-7">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                    <img src={r.img} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{r.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{r.desc}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-primary-600 dark:text-gold-400" /> Makkah &amp; Madinah</li>
                    <li className="flex items-center gap-2"><Briefcase size={15} className="text-primary-600 dark:text-gold-400" /> Full accommodation &amp; transport</li>
                  </ul>
                  <Link to="/contact" className="btn-gold mt-5 w-full">Apply Now <ArrowRight size={16} /></Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
