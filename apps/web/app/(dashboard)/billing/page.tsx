'use client';

import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import { PricingCard } from '@/components/PricingCard';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      '25 optimizations/day',
      'All 6 optimization modes',
      'Chrome, Firefox, Edge extension',
      'Desktop app (Win/Mac/Linux)',
      '5 private templates',
      '7-day history',
    ],
  },
  {
    name: 'Pro',
    price: 9,
    period: 'per month',
    features: [
      '500 optimizations/day',
      'All 6 optimization modes',
      'Chrome, Firefox, Edge extension',
      'Desktop app (Win/Mac/Linux)',
      '100 private templates',
      'Developer API access',
      '90-day history',
      'Priority routing',
    ],
    isPopular: true,
  },
  {
    name: 'Team',
    price: 25,
    period: 'per seat/month',
    features: [
      '500 optimizations/seat/day',
      'Everything in Pro',
      'Team workspace',
      'Shared template library',
      'Usage analytics by member',
      'Unlimited private templates',
      '1-year history',
      'Admin controls',
    ],
  },
];

export default function BillingPage() {
  const user = useQuery(api.users.getMe);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle query params from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccess('Payment successful! Your plan has been upgraded.');
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
    if (searchParams.get('canceled') === 'true') {
      setError('Payment canceled. Please try again.');
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleUpgrade = async (planName: string) => {
    if (planName === 'Free') return;
    if (!user) {
      setError('User not found. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planName.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('No checkout URL returned');
      }

      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const currentPlan = user?.plan || 'free';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription and upgrade your plan
        </p>
      </div>

      {/* Current Plan Display */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Current Plan</h3>
            <p className="text-sm text-blue-700 mt-1">
              You are currently on the{' '}
              <strong className="capitalize">{currentPlan}</strong> plan.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            isPopular={plan.isPopular}
            isCurrentPlan={currentPlan === plan.name.toLowerCase()}
            onAction={() => handleUpgrade(plan.name)}
            disabled={currentPlan === plan.name.toLowerCase()}
            loading={loading && plan.name.toLowerCase() === currentPlan}
          />
        ))}
      </div>

      {/* FAQ Section */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I change my plan anytime?
            </h3>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect
              immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-sm text-gray-600">
              Pro and Team plans include a 7-day free trial. No credit card required to start.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-sm text-gray-600">
              We accept all major credit cards via Stripe. All payments are secure and
              encrypted.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I get a refund?
            </h3>
            <p className="text-sm text-gray-600">
              Pro plans include a 7-day money-back guarantee. Contact support for refund
              requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
