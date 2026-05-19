import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (require('react') as any).createElement('a', { href, ...rest }, children);
  },
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'user_test',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({ userId: 'user_test', isSignedIn: true }),
  SignIn: () => null,
  SignUp: () => null,
  ClerkProvider: ({ children }: any) => children,
  SignedIn: ({ children }: any) => children,
  SignedOut: () => null,
  UserButton: () => null,
}));

// Mock Convex react
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
  useAction: vi.fn(() => vi.fn()),
  ConvexProvider: ({ children }: any) => children,
  ConvexReactClient: vi.fn(),
}));

// Mock the Convex generated api import (both alias targets)
vi.mock('@promptforge/convex/convex/_generated/api', () => ({
  api: {
    users: {
      getMe: 'users.getMe',
      updatePlan: 'users.updatePlan',
      updatePreferences: 'users.updatePreferences',
    },
    prompts: { getHistory: 'prompts.getHistory' },
    templates: { listMine: 'templates.listMine' },
    optimize: { optimizePrompt: 'optimize.optimizePrompt' },
  },
}));

// Global fetch mock
global.fetch = vi.fn();

// Polyfill clipboard for tests
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    writable: true,
    configurable: true,
  });
}

// window.location stub for billing redirect tests
if (typeof window !== 'undefined') {
  // Allow assignment to window.location.href in tests without navigating
  try {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: '', assign: vi.fn(), replace: vi.fn() },
    });
  } catch {
    // ignore — some envs don't allow redefining
  }
}
