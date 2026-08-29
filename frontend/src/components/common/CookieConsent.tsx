import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

// Cookie consent bar in the site's brand style — appears after the intro splash,
// remembers the choice in localStorage so it never nags a returning visitor.
const KEY = 'ksa_cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(KEY)) return;
    const t = window.setTimeout(() => setShow(true), 2600); // let the intro finish first
    return () => window.clearTimeout(t);
  }, []);

  const decide = (value: 'accepted' | 'declined') => {
    localStorage.setItem(KEY, value);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-4 sm:px-6 sm:pb-6"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 rounded-2xl border border-gold-500/25 bg-[#04251a]/95 p-5 text-white shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:p-6">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-gold-300">
              <Cookie size={22} />
            </div>
            <p className="flex-1 text-sm text-white/80">
              We use cookies to enhance your browsing experience, serve personalised content, and analyse our
              traffic. By clicking “Accept”, you consent to our use of cookies.{' '}
              <Link to="/privacy-policy" className="font-semibold text-gold-300 underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex w-full shrink-0 gap-3 sm:w-auto">
              <button
                onClick={() => decide('declined')}
                className="flex-1 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 sm:flex-none"
              >
                Decline
              </button>
              <button
                onClick={() => decide('accepted')}
                className="flex-1 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-2.5 text-sm font-bold text-[#04251a] shadow-gold transition hover:brightness-105 sm:flex-none"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
