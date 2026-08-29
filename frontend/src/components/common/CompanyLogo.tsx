import { useState } from 'react';

// Renders the bundled company logo; falls back to a clean initials badge if missing or it fails to load.
export default function CompanyLogo({ name, logo }: { name: string; logo?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(' ').filter((w) => !['Al', 'Group', 'Holding', 'of', 'Ministry'].includes(w)).slice(0, 2).map((w) => w[0]).join('') || name[0];

  if (!logo || failed) {
    return (
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 font-display text-lg font-extrabold text-white">
        {initials.toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={logo}
      alt={`${name} logo`}
      onError={() => setFailed(true)}
      loading="lazy"
      className="h-16 w-16 rounded-2xl bg-white object-contain p-2 shadow-soft"
    />
  );
}
