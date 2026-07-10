import {
  BarChart3,
  Wand2,
  Swords,
  Microscope,
  Library,
  Scale,
  GitBranch,
  History,
  Copy,
  Settings,
  CreditCard,
  Activity,
  BookOpen,
  Shield,
} from 'lucide-react';

export const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
  },
  // ----- PromptForge engine -----
  {
    href: '/forge',
    label: 'Forge',
    icon: Wand2,
  },
  {
    href: '/showdown',
    label: 'Showdown',
    icon: Swords,
  },
  {
    href: '/eval',
    label: 'Eval',
    icon: Scale,
  },
  {
    href: '/reverse',
    label: 'Reverse',
    icon: Microscope,
  },
  {
    href: '/library',
    label: 'Library',
    icon: Library,
  },
  {
    href: '/threads',
    label: 'Threads',
    icon: GitBranch,
  },
  // ----- Analytics & customization -----
  {
    href: '/observability',
    label: 'Observability',
    icon: Activity,
  },
  {
    href: '/style-guides',
    label: 'Style Guides',
    icon: BookOpen,
  },
  // ----- Account -----
  {
    href: '/history',
    label: 'History',
    icon: History,
  },
  {
    href: '/templates',
    label: 'My templates',
    icon: Copy,
  },
  {
    href: '/billing',
    label: 'Billing',
    icon: CreditCard,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
  // ----- Admin (dev only) -----
  ...(process.env.NODE_ENV === 'development'
    ? [
        {
          href: '/admin',
          label: 'Admin',
          icon: Shield,
        },
      ]
    : []),
];
