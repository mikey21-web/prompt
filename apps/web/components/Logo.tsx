import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const s = {
    sm: { mark: 'h-5 w-5', text: 'text-sm', gap: 'gap-1.5' },
    md: { mark: 'h-6 w-6', text: 'text-base', gap: 'gap-2' },
    lg: { mark: 'h-8 w-8', text: 'text-xl', gap: 'gap-2.5' },
  }[size];

  const inner = (
    <span className={`inline-flex items-center ${s.gap} font-bold tracking-tight text-[oklch(12%_0.008_270)] ${className}`}>
      {/* Bolt mark — solid, no gradient (Impeccable: no gradient text/decorative) */}
      <span className={`relative inline-flex ${s.mark} items-center justify-center rounded-md bg-[oklch(12%_0.008_270)]`}>
        <svg viewBox="0 0 24 24" fill="none" className="h-[58%] w-[58%]" aria-hidden>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="white" />
        </svg>
      </span>
      <span className={s.text}>PromptForge</span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="hover:opacity-80 transition-opacity duration-150">
      {inner}
    </Link>
  );
}
