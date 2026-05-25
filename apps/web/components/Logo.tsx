import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

/**
 * PromptForge wordmark. Lightning bolt in a soft gradient violet pill,
 * followed by the wordmark in a tight tracking. Sized presets cover
 * nav (md), hero (lg), and footer/popup (sm).
 */
export function Logo({ size = "md", href = "/", className = "" }: LogoProps) {
  const sizes = {
    sm: { mark: "h-6 w-6", text: "text-base", gap: "gap-1.5" },
    md: { mark: "h-7 w-7", text: "text-lg", gap: "gap-2" },
    lg: { mark: "h-9 w-9", text: "text-2xl", gap: "gap-2.5" },
  } as const;

  const s = sizes[size];

  const inner = (
    <span
      className={`inline-flex items-center ${s.gap} font-bold tracking-tight text-gray-900 ${className}`}
    >
      <span
        className={`relative inline-flex ${s.mark} items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-sm shadow-violet-600/30`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[60%] w-[60%]"
          aria-hidden="true"
        >
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="white" />
        </svg>
      </span>
      <span className={s.text}>PromptForge</span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="hover:opacity-90 transition-opacity">
      {inner}
    </Link>
  );
}
