'use client';

import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: number;
  period: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onAction: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  isPopular,
  isCurrentPlan,
  onAction,
  disabled = false,
  loading = false,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl border p-8 transition-all ${
        isPopular
          ? 'border-violet-300 ring-2 ring-violet-200 bg-white shadow-lg'
          : 'border-gray-200 bg-white'
      } ${disabled ? 'opacity-75' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">${price}</span>
          <span className="text-sm text-gray-600">{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onAction}
        disabled={disabled || loading || isCurrentPlan}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-600 cursor-default'
            : isPopular
              ? 'bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-400'
              : 'border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:border-gray-100'
        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading
          ? 'Processing...'
          : isCurrentPlan
            ? 'Current Plan'
            : 'Upgrade'}
      </button>
    </div>
  );
}
