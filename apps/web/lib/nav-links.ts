import {
  BarChart3,
  Zap,
  Wand2,
  Swords,
  Microscope,
  Library,
  Scale,
  History,
  Copy,
  Settings,
  CreditCard,
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
  // ----- Original tools -----
  {
    href: '/optimize',
    label: 'Optimize (legacy)',
    icon: Zap,
  },
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
];
