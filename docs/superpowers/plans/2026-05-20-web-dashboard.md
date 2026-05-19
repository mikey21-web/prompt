# Web Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build functional Next.js 14 dashboard with user auth, prompt optimization, history, templates, and subscription management.

**Architecture:** Auth middleware → protected layouts → feature pages (dashboard, optimize, history, templates, settings). Real-time sync via Convex subscriptions. Clerk for authentication, Stripe for payments.

**Tech Stack:** Next.js 14 (App Router), React 18, Convex, Clerk, Stripe, Tailwind CSS, TypeScript, @promptforge/core, @promptforge/ui

---

## Task 1: Clerk Authentication Setup

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/middleware.ts` (create if missing)
- Create: `apps/web/lib/clerk-config.ts`
- Modify: `apps/web/.env.local`

- [ ] **Step 1: Install Clerk packages**

```bash
cd apps/web
npm install @clerk/nextjs
```

- [ ] **Step 2: Create Clerk config file**

```typescript
// apps/web/lib/clerk-config.ts
export const clerkConfig = {
  appearance: {
    elements: {
      rootBox: 'mx-auto',
      card: 'bg-white shadow-sm',
      headerTitle: 'text-lg font-semibold',
    },
  },
};
```

- [ ] **Step 3: Create middleware for protected routes**

```typescript
// apps/web/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/optimize(.*)',
  '/history(.*)',
  '/templates(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/'],
};
```

- [ ] **Step 4: Wrap app with ClerkProvider in root layout**

```typescript
// apps/web/app/layout.tsx (partial)
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 5: Add Clerk environment variables to .env.local**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

- [ ] **Step 6: Create sign-in and sign-up pages**

```typescript
// apps/web/app/(auth)/sign-in/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
```

```typescript
// apps/web/app/(auth)/sign-up/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
```

- [ ] **Step 7: Test sign-in flow locally**

```bash
npm run dev
# Visit http://localhost:3000/sign-in
# Click sign-up, create test account
# Verify redirect to /dashboard
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/app apps/web/lib apps/web/middleware.ts apps/web/.env.local
git commit -m "feat: add Clerk authentication with sign-in/sign-up pages"
```

---

## Task 2: Protected Layout & Navigation

**Files:**
- Create: `apps/web/app/(dashboard)/layout.tsx`
- Create: `apps/web/components/Navbar.tsx`
- Create: `apps/web/components/Sidebar.tsx`
- Create: `apps/web/lib/nav-links.ts`

- [ ] **Step 1: Create navigation links config**

```typescript
// apps/web/lib/nav-links.ts
export const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: 'BarChart3' },
  { href: '/optimize', label: 'Optimize', icon: 'Zap' },
  { href: '/history', label: 'History', icon: 'History' },
  { href: '/templates', label: 'Templates', icon: 'Copy' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
];
```

- [ ] **Step 2: Create Navbar component**

```typescript
// apps/web/components/Navbar.tsx
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          PromptForge
        </Link>
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create Sidebar component**

```typescript
// apps/web/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/lib/nav-links';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-gray-50">
      <nav className="space-y-1 px-4 py-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded px-3 py-2 text-sm font-medium ${
              pathname.startsWith(link.href)
                ? 'bg-indigo-100 text-indigo-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: Create dashboard layout**

```typescript
// apps/web/app/(dashboard)/layout.tsx
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create stub pages for navigation testing**

```typescript
// apps/web/app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return <h1 className="text-3xl font-bold">Dashboard</h1>;
}

// apps/web/app/(dashboard)/optimize/page.tsx
export default function OptimizePage() {
  return <h1 className="text-3xl font-bold">Optimize</h1>;
}

// (repeat for history, templates, settings)
```

- [ ] **Step 6: Test navigation locally**

```bash
npm run dev
# Sign in, verify sidebar shows all links
# Click each link, verify active state highlight
# Click username in navbar, verify sign-out option
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/\(dashboard\) apps/web/components apps/web/lib/nav-links.ts
git commit -m "feat: add protected dashboard layout with navbar and sidebar navigation"
```

---

## Task 3: Dashboard Page with Usage Stats

**Files:**
- Create: `apps/web/app/(dashboard)/dashboard/page.tsx`
- Create: `apps/web/components/UsageCard.tsx`
- Create: `apps/web/components/StatsGrid.tsx`
- Create: `apps/web/lib/hooks/useUsage.ts`

- [ ] **Step 1: Create useUsage hook for Convex subscription**

```typescript
// apps/web/lib/hooks/useUsage.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

export function useUsage() {
  const { user } = useUser();
  const usage = useQuery(api.users.getUsage, user ? { userId: user.id } : 'skip');
  return usage;
}
```

- [ ] **Step 2: Create UsageCard component**

```typescript
// apps/web/components/UsageCard.tsx
import { UsageBar, PlanBadge } from '@promptforge/ui';

interface UsageCardProps {
  used: number;
  limit: number;
  plan: string;
  resetDate: string;
}

export function UsageCard({ used, limit, plan, resetDate }: UsageCardProps) {
  const percentage = (used / limit) * 100;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Usage</h3>
        <PlanBadge plan={plan} />
      </div>
      <UsageBar used={used} limit={limit} />
      <p className="mt-3 text-sm text-gray-600">
        {used} of {limit} tokens used
      </p>
      <p className="text-xs text-gray-500">Resets on {new Date(resetDate).toLocaleDateString()}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create StatsGrid component**

```typescript
// apps/web/components/StatsGrid.tsx
interface StatItem {
  label: string;
  value: string | number;
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create dashboard page**

```typescript
// apps/web/app/(dashboard)/dashboard/page.tsx
'use client';

import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { UsageCard } from '@/components/UsageCard';
import { StatsGrid } from '@/components/StatsGrid';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useUser();
  const usage = useQuery(api.users.getUsage, user ? { userId: user.id } : 'skip');
  const prompts = useQuery(api.prompts.listByUser, user ? { userId: user.id } : 'skip');

  if (!usage || !prompts) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Prompts', value: prompts.length },
    { label: 'Tokens Used', value: usage.used },
    { label: 'This Month', value: usage.used },
    { label: 'Avg. Savings', value: '~15%' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatsGrid stats={stats} />
        </div>
        <UsageCard
          used={usage.used}
          limit={usage.limit}
          plan={usage.plan}
          resetDate={usage.resetDate}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Test dashboard with Convex connection**

```bash
npm run dev
# Sign in, navigate to dashboard
# Verify usage stats load from Convex
# Verify PlanBadge and UsageBar display correctly
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/\(dashboard\)/dashboard apps/web/components/Usage* apps/web/components/Stats* apps/web/lib/hooks/useUsage.ts
git commit -m "feat: add dashboard page with usage stats and real-time Convex sync"
```

---

## Task 4: Optimize Form Page

**Files:**
- Create: `apps/web/app/(dashboard)/optimize/page.tsx`
- Create: `apps/web/components/OptimizeForm.tsx`
- Create: `apps/web/components/OptimizeResult.tsx`
- Create: `apps/web/lib/hooks/useOptimize.ts`

- [ ] **Step 1: Create useOptimize hook**

```typescript
// apps/web/lib/hooks/useOptimize.ts
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

export function useOptimize() {
  const optimize = useMutation(api.prompts.optimize);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async (prompt: string, mode: 'compress' | 'enhance' | 'rewrite', model?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await optimize({ prompt, mode, model });
      setResult(res);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, result, error };
}
```

- [ ] **Step 2: Create OptimizeForm component**

```typescript
// apps/web/components/OptimizeForm.tsx
'use client';

import { useState } from 'react';
import { ModeButton } from '@promptforge/ui';

type Mode = 'compress' | 'enhance' | 'rewrite';

interface OptimizeFormProps {
  onSubmit: (prompt: string, mode: Mode, model: string) => Promise<void>;
  loading: boolean;
}

export function OptimizeForm({ onSubmit, loading }: OptimizeFormProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('compress');
  const [model, setModel] = useState('gpt-4o-mini');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onSubmit(prompt, mode, model);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Your Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the prompt you want to optimize..."
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={6}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ModeButton mode="compress" active={mode === 'compress'} onClick={() => setMode('compress')} />
        <ModeButton mode="enhance" active={mode === 'enhance'} onClick={() => setMode('enhance')} />
        <ModeButton mode="rewrite" active={mode === 'rewrite'} onClick={() => setMode('rewrite')} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          disabled={loading}
        >
          <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
          <option value="gpt-4o">GPT-4o (More Capable)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {loading ? 'Optimizing...' : 'Optimize'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create OptimizeResult component**

```typescript
// apps/web/components/OptimizeResult.tsx
import { PromptDiff, TokenSavings } from '@promptforge/ui';

interface OptimizeResultProps {
  original: string;
  optimized: string;
  tokens: { input: number; output: number };
  originalTokens?: number;
}

export function OptimizeResult({
  original,
  optimized,
  tokens,
  originalTokens = 0,
}: OptimizeResultProps) {
  const saved = originalTokens - tokens.output;
  const savingPercent = originalTokens > 0 ? ((saved / originalTokens) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Result</h3>
      <PromptDiff original={original} optimized={optimized} />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Input Tokens</p>
          <p className="text-2xl font-bold">{tokens.input}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Output Tokens</p>
          <p className="text-2xl font-bold">{tokens.output}</p>
        </div>
      </div>
      {saved > 0 && <TokenSavings saved={saved} percent={parseFloat(savingPercent as string)} />}
      <button className="mt-4 w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
        Copy to Clipboard
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create optimize page**

```typescript
// apps/web/app/(dashboard)/optimize/page.tsx
'use client';

import { useState } from 'react';
import { OptimizeForm } from '@/components/OptimizeForm';
import { OptimizeResult } from '@/components/OptimizeResult';
import { useOptimize } from '@/lib/hooks/useOptimize';

export default function OptimizePage() {
  const { run, loading, result, error } = useOptimize();
  const [originalPrompt, setOriginalPrompt] = useState('');

  const handleSubmit = async (prompt: string, mode: string, model: string) => {
    setOriginalPrompt(prompt);
    await run(prompt, mode, model);
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Optimize Your Prompts</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <OptimizeForm onSubmit={handleSubmit} loading={loading} />
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
            {error}
          </div>
        )}
        {result && (
          <OptimizeResult
            original={originalPrompt}
            optimized={result.optimized}
            tokens={result.tokens}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Test optimize form locally**

```bash
npm run dev
# Navigate to /optimize
# Enter test prompt
# Click mode buttons, verify selection
# Select model
# Click Optimize, verify loading state and result display
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/\(dashboard\)/optimize apps/web/components/Optimize* apps/web/lib/hooks/useOptimize.ts
git commit -m "feat: add optimize form with prompt comparison and token counting"
```

---

## Task 5: History & Templates Pages (Stub)

**Files:**
- Create: `apps/web/app/(dashboard)/history/page.tsx`
- Create: `apps/web/app/(dashboard)/templates/page.tsx`
- Create: `apps/web/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Create history page stub**

```typescript
// apps/web/app/(dashboard)/history/page.tsx
'use client';

import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';

export default function HistoryPage() {
  const { user } = useUser();
  const prompts = useQuery(api.prompts.listByUser, user ? { userId: user.id } : 'skip');

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">History</h1>
      {prompts?.length === 0 ? (
        <p className="text-gray-600">No prompts yet. Start by optimizing one!</p>
      ) : (
        <div className="space-y-4">
          {prompts?.map((prompt) => (
            <div key={prompt._id} className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">{new Date(prompt._creationTime).toLocaleDateString()}</p>
              <p className="mt-2 line-clamp-2">{prompt.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create templates page stub**

```typescript
// apps/web/app/(dashboard)/templates/page.tsx
'use client';

import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { TemplateCard } from '@promptforge/ui';

export default function TemplatesPage() {
  const { user } = useUser();
  const templates = useQuery(api.templates.listByUser, user ? { userId: user.id } : 'skip');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Templates</h1>
        <button className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          + New Template
        </button>
      </div>
      {templates?.length === 0 ? (
        <p className="text-gray-600">No templates yet. Save a prompt to create one!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <TemplateCard key={template._id} name={template.name} prompt={template.prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create settings page stub**

```typescript
// apps/web/app/(dashboard)/settings/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Account</h3>
        <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
        <h3 className="mb-4 mt-6 text-lg font-semibold">Preferences</h3>
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300" defaultChecked />
          <span className="ml-2 text-gray-700">Email notifications</span>
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Test navigation to all pages**

```bash
npm run dev
# Click each nav link
# Verify pages load without errors
# Verify data displays (history, templates)
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\(dashboard\)/{history,templates,settings}/page.tsx
git commit -m "feat: add history, templates, and settings pages with Convex data display"
```

---

## Task 6: Subscription & Payment UI (Stripe Integration)

**Files:**
- Create: `apps/web/app/(dashboard)/billing/page.tsx`
- Create: `apps/web/components/PricingCard.tsx`
- Create: `apps/web/lib/stripe.ts`

- [ ] **Step 1: Install Stripe packages**

```bash
cd apps/web
npm install @stripe/react-js @stripe/js stripe
```

- [ ] **Step 2: Create Stripe client**

```typescript
// apps/web/lib/stripe.ts
import { loadStripe } from '@stripe/js';

export const getStripeClient = async () => {
  return await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};
```

- [ ] **Step 3: Create PricingCard component**

```typescript
// apps/web/components/PricingCard.tsx
interface PricingCardProps {
  name: string;
  price: number;
  period: string;
  features: string[];
  current?: boolean;
  onUpgrade?: () => void;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  current,
  onUpgrade,
}: PricingCardProps) {
  return (
    <div className={`rounded-lg border p-6 ${current ? 'border-indigo-600 bg-indigo-50' : 'bg-white'}`}>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-2 text-3xl font-bold">${price}</p>
      <p className="text-sm text-gray-600">per {period}</p>
      <ul className="mt-6 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center text-sm">
            <span className="mr-2 text-indigo-600">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onUpgrade}
        disabled={current}
        className={`mt-6 w-full rounded px-4 py-2 ${
          current
            ? 'bg-gray-300 text-gray-700'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {current ? 'Current Plan' : 'Upgrade'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create billing page**

```typescript
// apps/web/app/(dashboard)/billing/page.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PricingCard } from '@/components/PricingCard';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'month',
    features: ['100 tokens per day', 'Compress mode only', 'Basic support'],
    current: true,
  },
  {
    name: 'Pro',
    price: 9,
    period: 'month',
    features: ['10,000 tokens per month', 'All modes', 'Email support', 'History & templates'],
  },
  {
    name: 'Enterprise',
    price: 99,
    period: 'month',
    features: ['Unlimited tokens', 'All modes', 'Priority support', 'Team collaboration', 'API access'],
  },
];

export default function BillingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planName: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName }),
      });
      const { sessionId } = await res.json();
      // Redirect to Stripe checkout
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Billing & Subscription</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            {...plan}
            onUpgrade={() => handleUpgrade(plan.name)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create checkout session API route**

```typescript
// apps/web/app/api/create-checkout-session/route.ts
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { planName } = await req.json();

  const priceIds: Record<string, string> = {
    Pro: process.env.STRIPE_PRICE_ID_PRO!,
    Enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE!,
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceIds[planName], quantity: 1 }],
    mode: 'subscription',
    success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get('origin')}/billing`,
  });

  return new Response(JSON.stringify({ sessionId: session.id }), { status: 200 });
}
```

- [ ] **Step 6: Add Stripe env vars to .env.local**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

- [ ] **Step 7: Test billing page**

```bash
npm run dev
# Navigate to /billing
# Verify pricing cards display
# Verify Upgrade button disabled on Free plan
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/app/\(dashboard\)/billing apps/web/app/api/create-checkout-session apps/web/components/PricingCard.tsx apps/web/lib/stripe.ts
git commit -m "feat: add billing page with Stripe subscription management"
```
