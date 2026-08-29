// Brand mark for KSDS — Saudi Skills Development (تطوير المهارات السعودية), Vision 2030.
// Uses the official logo artwork from /public/logo.jpeg.

export function LogoMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <img
      src="/logo.jpeg"
      alt="KSDS — Saudi Skills Development logo"
      className={`${className} rounded-full object-cover shadow-soft ring-1 ring-gold-500/30`}
      loading="eager"
      decoding="async"
    />
  );
}

export default function Logo({ variant = 'auto', className = '' }: { variant?: 'auto' | 'light' | 'dark'; className?: string }) {
  const textColor =
    variant === 'light' ? 'text-white' : variant === 'dark' ? 'text-primary-800' : 'text-primary-700 dark:text-white';
  const subColor =
    variant === 'light' ? 'text-white/60' : 'text-slate-500 dark:text-slate-300';
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-11 w-11 shrink-0" />
      <span className="leading-tight">
        <span className={`block font-display text-base font-extrabold ${textColor}`}>KSA Skill</span>
        <span className={`block text-[10px] uppercase tracking-[0.18em] ${subColor}`}>Development</span>
      </span>
    </span>
  );
}
