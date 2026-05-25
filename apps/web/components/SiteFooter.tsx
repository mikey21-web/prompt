import Link from 'next/link';
import { Logo } from './Logo';
import { Twitter, Github } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Forge', href: '/forge' },
      { label: 'Showdown', href: '/showdown' },
      { label: 'Showcase', href: '/showcase' },
      { label: 'Benchmark', href: '/benchmark' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Install',
    links: [
      { label: 'All surfaces', href: '/install' },
      { label: 'Chrome extension', href: '/install#chrome' },
      { label: 'VS Code', href: '/install#vscode' },
      { label: 'Desktop app', href: '/install#desktop' },
      { label: 'Discord bot', href: '/install#discord' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'API docs', href: '/api' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#0a0a0b]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand block */}
          <div className="col-span-2">
            <Logo size="md" />
            <p className="mt-3 text-sm text-white/40 leading-relaxed max-w-xs">
              One prompt in. Every model&apos;s native format out. The translation
              layer for serious AI users.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://x.com/promptforge"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:border-white/20 hover:text-white/70 transition"
                aria-label="X / Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/mikey21-web/prompt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:border-white/20 hover:text-white/70 transition"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © 2026 PromptForge. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Built for makers, by makers. ⚡
          </p>
        </div>
      </div>
    </footer>
  );
}
