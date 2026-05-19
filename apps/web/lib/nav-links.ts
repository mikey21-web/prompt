import {
  BarChart3,
  Zap,
  History,
  Copy,
  Settings,
} from 'lucide-react';

export const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
  },
  {
    href: '/dashboard/library',
    label: 'Library',
    icon: Copy,
  },
  {
    href: '/dashboard/history',
    label: 'History',
    icon: History,
  },
  {
    href: '/dashboard/team',
    label: 'Team',
    icon: Zap,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
];
