import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  description?: string;
  image?: string;
}

export default function Seo({ title, description, image }: Props) {
  const fullTitle = `${title} | KSA Skill Development`;
  const desc = description || 'Premium Saudi enterprise portal for skill workforce, training, visa, Hajj & Umrah services.';
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'GovernmentOrganization',
          name: 'KSA Skill Development',
          url: typeof window !== 'undefined' ? window.location.origin : '',
        })}
      </script>
    </Helmet>
  );
}
