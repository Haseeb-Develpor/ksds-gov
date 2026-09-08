import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Phone, Mail, MapPin, Info, GraduationCap, Briefcase, FileText, Newspaper, LayoutGrid, Plane } from 'lucide-react';
import { LogoMark } from '../common/Logo';
import { PHONE_NUMBER, PHONE_TEL, CONTACT_EMAIL } from '../../data/contact';

// Slim icon bar shown ONLY on the home page (like the reference screenshot).
const slimLinks: [string, string, React.ComponentType<{ size?: number }>][] = [
  ['About us', '/about', Info],
  ['Training & Development', '/training', GraduationCap],
  ['Services', '/services', LayoutGrid],
  ['Jobs', '/jobs', Briefcase],
  ['Visa', '/visa', Plane],
  ['E-Services', '/login', FileText],
  ['News', '/news', Newspaper],
];

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const isHome = useLocation().pathname === '/';

  if (isHome) {
    return (
      <footer className="relative mt-auto bg-primary-950 text-white">
        <div className="container-wide flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4 md:justify-between">
          {slimLinks.map(([label, to, Icon]) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-gold-300"
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="container-wide py-2.5 text-center text-[11px] text-white/50">© {year} {t('brand')}. {t('footer.rights')}</div>
        </div>
      </footer>
    );
  }

  const cols = [
    {
      title: t('footer.quickLinks'),
      links: [
        ['About', '/about'], ['Vision', '/vision'], ['Careers', '/careers'],
        ['News', '/news'], ['Events', '/events'], ['Gallery', '/gallery'],
      ],
    },
    {
      title: t('footer.modules'),
      links: [
        ['Services', '/services'], ['Training', '/training'], ['Visa', '/visa'],
        ['Khadmen Haram', '/khadmen-haram'], ['Categories', '/#categories'], ['Tracking', '/tracking'],
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        ['Privacy Policy', '/privacy-policy'], ['Terms', '/terms'], ['FAQ', '/faq'],
        ['Support', '/support'], ['Complaints', '/complaints'], ['Verification', '/verification'],
      ],
    },
  ];

  return (
    <footer className="relative mt-20 bg-primary-950 text-white">
      <div className="absolute inset-0 bg-hero-radial opacity-40" />
      <div className="container-wide relative grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-12 w-12 shrink-0" />
            <span className="font-display text-lg font-extrabold">{t('brand')}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/70">{t('footer.about')}</p>
          <div className="mt-5 space-y-2 text-sm text-white/70">
            <p className="flex items-center gap-2"><MapPin size={16} className="text-gold-400" /> King Abdul Aziz Road, Al Wizarat, Riyadh 12626, Saudi Arabia</p>
            <a href={PHONE_TEL} className="flex items-center gap-2 transition hover:text-gold-300"><Phone size={16} className="text-gold-400" /> {PHONE_NUMBER}</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 transition hover:text-gold-300"><Mail size={16} className="text-gold-400" /> {CONTACT_EMAIL}</a>
          </div>
          <div className="mt-5 flex gap-2">
            {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 transition hover:bg-gold-500"><Icon size={16} /></a>
            ))}
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-gold-400">{col.title}</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              {col.links.map(([label, to]) => (
                <li key={to}><Link to={to} className="transition hover:text-gold-300">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {year} {t('brand')}. {t('footer.rights')}</p>
          <p>Aligned with Saudi Vision 2030</p>
        </div>
      </div>
    </footer>
  );
}
