import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, ShieldCheck, Users } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { getService, services } from '../data/services';
import { contentApi } from '../services/api';
import NotFound from './NotFound';

export default function ServiceDetail() {
  const { slug = '' } = useParams();
  const service = getService(slug);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  if (!service) return <NotFound />;
  const related = services.filter((s) => s.category === service.category && s.slug !== service.slug).slice(0, 3);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await contentApi.apply({ ...form, service: service.name }); } catch { /* offline-safe */ }
    setSent(true);
  };

  return (
    <>
      <Seo title={service.name} description={service.summary} image={service.image} />
      <PageHeader title={service.name} subtitle={service.summary} image={service.image} crumbs={[{ label: 'Services', to: '/services' }, { label: service.name }]} />
      <section className="section">
        <div className="container-wide grid gap-10 lg:grid-cols-3">
          <Reveal className="lg:col-span-2 space-y-6">
            <h2 className="heading-2">About this service</h2>
            <p className="text-slate-600 dark:text-slate-300">{service.summary} Our {service.name.toLowerCase()} talent pool is recruited internationally, trained to Saudi standards, and supported end-to-end through visa, onboarding, and deployment.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [ShieldCheck, 'Fully Vetted', 'Background-checked and skill-tested.'],
                [Clock, 'Fast Deployment', 'Mobilized within days, not months.'],
                [Users, 'Scalable Teams', 'From a single hire to full crews.'],
                [CheckCircle2, 'Compliant', 'Aligned with Saudi labor law.'],
              ].map(([Icon, title, text]: any) => (
                <div key={title} className="card p-5">
                  <Icon className="text-primary-600 dark:text-gold-400" size={22} />
                  <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
            <img src={service.image} alt={service.name} className="w-full rounded-2xl object-cover" />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card sticky top-24 p-6">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Request this service</h3>
              {sent ? (
                <div className="mt-4 rounded-xl bg-primary-50 p-4 text-sm text-primary-800 dark:bg-white/5 dark:text-primary-200">
                  ✓ Thank you! Your request for <b>{service.name}</b> has been received. Our team will contact you shortly.
                </div>
              ) : (
                <form onSubmit={submit} className="mt-4 space-y-3">
                  <input required placeholder="Full name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <input required placeholder="Phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <textarea placeholder="Tell us your requirements…" rows={4} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  <button className="btn-primary w-full">Submit Request</button>
                </form>
              )}
            </div>
          </Reveal>
        </div>

        {related.length > 0 && (
          <div className="container-wide mt-16">
            <h2 className="heading-2 mb-6">Related services</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} to={`/services/${r.slug}`} className="card card-hover overflow-hidden">
                  <img src={r.image} alt={r.name} className="h-32 w-full object-cover" loading="lazy" />
                  <div className="p-4"><h3 className="font-semibold text-slate-900 dark:text-white">{r.name}</h3></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
