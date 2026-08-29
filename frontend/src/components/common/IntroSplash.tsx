import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Government-portal style intro: the brand logo fades + glides into place with a
// drawing gold ring, holds for a beat, then the panel lifts to reveal the page.
// Shows once per browser session (like mt.gov.sa) so navigation stays instant.
const SEEN_KEY = 'ksa_intro_seen';

export default function IntroSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    setShow(true);
    document.body.style.overflow = 'hidden';
    const done = window.setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, '1');
      setShow(false);
    }, 2200);
    return () => window.clearTimeout(done);
  }, []);

  useEffect(() => {
    if (!show) document.body.style.overflow = '';
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#04251a] via-[#06412c] to-[#031c14]"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* soft radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.14),transparent_60%)]" />

          <div className="relative flex flex-col items-center">
            <motion.div
              className="relative grid place-items-center"
              initial={{ scale: 0.4, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.15 }}
            >
              {/* drawing gold ring */}
              <svg className="absolute h-28 w-28 -rotate-90" viewBox="0 0 100 100" aria-hidden>
                <motion.circle
                  cx="50" cy="50" r="46" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.3 }}
                />
              </svg>
              <img
                src="/logo.jpeg"
                alt="KSA Skill Development"
                className="h-20 w-20 rounded-full object-cover shadow-2xl ring-2 ring-gold-500/40"
              />
            </motion.div>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              <div className="font-display text-2xl font-extrabold tracking-tight text-white">KSA Skill Development</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.35em] text-gold-300/80">Vision 2030</div>
            </motion.div>

            {/* loading bar */}
            <motion.div className="mt-7 h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-400 to-gold-200"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.2 }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
