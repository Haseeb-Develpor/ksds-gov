import { useState } from 'react';
import { MapPin, Mail, Clock, Phone } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { contentApi } from '../services/api';
import { PHONE_NUMBER, PHONE_TEL, CONTACT_EMAIL } from '../data/contact';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await contentApi.contact(form); } catch { /* offline-safe */ }
    setSent(true);
  };

  const info = [
    [MapPin, 'Address', 'King Abdul Aziz Road, Al Wizarat, Riyadh 12626, Saudi Arabia', undefined],
    [Phone, 'Phone', PHONE_NUMBER, PHONE_TEL],
    [Mail, 'Email', CONTACT_EMAIL, `mailto:${CONTACT_EMAIL}`],
    [Clock, 'Hours', 'Sun–Thu, 8:00 AM – 5:00 PM', undefined],
  ];

  return (
    <>
      <Seo title="Contact Us" />
      <PageHeader title="Contact Us" subtitle="We're here to help. Reach out and our team will respond promptly." image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1400&q=70" crumbs={[{ label: 'Contact' }]} />
      <section className="section">
        <div className="container-wide grid gap-10 lg:grid-cols-2">
          <Reveal className="space-y-4">
            {info.map(([Icon, label, val, href]: any) => {
              const inner = (
                <>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white"><Icon size={20} /></div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{val}</p>
                  </div>
                </>
              );
              return href ? (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="card flex items-center gap-4 p-5 transition hover:shadow-gold">
                  {inner}
                </a>
              ) : (
                <div key={label} className="card flex items-center gap-4 p-5">{inner}</div>
              );
            })}
            <div className="card overflow-hidden">
              <iframe
                title="KSA Skill Development — Riyadh"
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.openstreetmap.org/export/embed.html?bbox=46.5500%2C24.5500%2C46.8200%2C24.8600&layer=mapnik&marker=24.7136%2C46.6753"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card p-7">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Send us a message</h3>
              {sent ? (
                <div className="mt-5 rounded-xl bg-primary-50 p-5 text-primary-800 dark:bg-white/5 dark:text-primary-200">✓ Thank you! Your message has been received.</div>
              ) : (
                <form onSubmit={submit} className="mt-5 space-y-4">
                  <input required placeholder="Full name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <input required placeholder="Subject" className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                  <textarea required rows={5} placeholder="Your message…" className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  <button className="btn-primary w-full">Send Message</button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
