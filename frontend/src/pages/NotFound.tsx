import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import Seo from '../components/common/Seo';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <Seo title={t('common.notFound')} />
      <section className="grid min-h-screen place-items-center bg-primary-950 text-center text-white">
        <div className="px-6">
          <p className="font-display text-8xl font-extrabold text-gold-400">404</p>
          <h1 className="mt-4 font-display text-3xl font-bold">{t('common.notFound')}</h1>
          <p className="mt-2 text-white/70">{t('common.notFoundSub')}</p>
          <Link to="/" className="btn-gold mt-8"><Home size={18} /> {t('common.backHome')}</Link>
        </div>
      </section>
    </>
  );
}
