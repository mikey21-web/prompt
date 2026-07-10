'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/lib/nav-links';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 border-r min-h-[calc(100vh-53px)] hidden md:block"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <nav className="flex flex-col gap-0.5 px-3 py-4">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            pathname.startsWith(link.href + '/');
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-dim)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
