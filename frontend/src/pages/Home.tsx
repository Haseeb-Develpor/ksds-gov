import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import Reveal from '../components/common/Reveal';

export default function Home() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Browsers block autoplay-with-sound, so the hero starts muted. Unmute on the
  // first *genuine* user gesture (click / tap / key) — not scroll, which the
  // browser can fire programmatically before any real interaction. Keep the
  // listeners attached until the audio actually starts playing unmuted.
  useEffect(() => {
    const enableSound = () => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = false;
      v.volume = 1;
      v.play()
        .then(() => {
          if (!v.muted) remove();
        })
        .catch(() => {});
    };
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'click', 'keydown', 'touchstart'];
    const remove = () => events.forEach((e) => window.removeEventListener(e, enableSound));
    events.forEach((e) => window.addEventListener(e, enableSound, { passive: true }));
    return remove;
  }, []);

  return (
    <>
      <Seo
        title="Skill Workforce & Jobs in Saudi Arabia"
        description="KSA Skill Development connects certified skill professionals with leading Saudi employers across construction, IT, healthcare, engineering, hospitality and more."
      />

      {/* Hero — Riyadh skyline / Kingdom Centre */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/hero-v2.mp4"
            poster="https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1920&q=70"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="KSA Skill Development promotional video"
          />
          {/* Cinematic dark overlay — darker on the left for text, soft fade top & bottom */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />

        </div>
        <div className="container-wide relative pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300 backdrop-blur">
              <Icons.Sparkles size={14} /> {t('hero.badge')}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">{t('hero.subtitle')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#categories" className="btn-gold px-7 py-3.5">{t('hero.ctaPrimary')} <ArrowRight size={18} /></a>
              <Link to="/register" className="btn px-7 py-3.5 border border-white/30 text-white hover:bg-white/10">{t('hero.ctaSecondary')}</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6">
              {['Vision 2030 Aligned', 'Government Grade', 'Certified Workforce'].map((b) => (
                <span key={b} className="flex items-center gap-2 text-sm text-white/70"><CheckCircle2 size={16} className="text-gold-400" /> {b}</span>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent dark:from-[#04150e]" />
      </section>

    </>
  );
}
