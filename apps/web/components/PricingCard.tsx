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
      className={`relative rounded-2xl border p-8 transition-all ${disabled ? 'opacity-75' : ''}`}
      style={{
        backgroundColor: 'var(--surface-raised)',
        borderColor: isPopular ? 'var(--accent)' : 'var(--border)',
        boxShadow: isPopular
          ? '0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent), 0 4px 12px rgba(0,0,0,0.08)'
          : undefined,
      }}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
          >
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{name}</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>${price}</span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--green)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onAction}
        disabled={disabled || loading || isCurrentPlan}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        style={
          isCurrentPlan
            ? { backgroundColor: 'var(--surface)', color: 'var(--text-muted)', cursor: 'default' }
            : isPopular
              ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
              : { backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
        }
        onMouseEnter={(e) => {
          if (isCurrentPlan) return;
          if (isPopular) {
            e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
          }
        }}
        onMouseLeave={(e) => {
          if (isCurrentPlan) return;
          if (isPopular) {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
          } else {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
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
