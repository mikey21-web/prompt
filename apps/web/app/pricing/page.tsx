import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-700",
    features: [
      "25 optimizations/day",
      "All 6 optimization modes",
      "Chrome, Firefox, Edge extension",
      "Desktop app (Win/Mac/Linux)",
      "5 private templates",
      "7-day history",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    color: "border-violet-300 ring-2 ring-violet-200",
    badgeColor: "bg-violet-100 text-violet-700",
    features: [
      "500 optimizations/day",
      "All 6 optimization modes",
      "Chrome, Firefox, Edge extension",
      "Desktop app (Win/Mac/Linux)",
      "100 private templates",
      "Developer API access",
      "90-day history",
      "Priority routing",
    ],
    cta: "Start Pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$25",
    period: "per seat/month",
    color: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    features: [
      "500 optimizations/seat/day",
      "Everything in Pro",
      "Team workspace",
      "Shared template library",
      "Usage analytics by member",
      "Unlimited private templates",
      "1-year history",
      "Admin controls",
    ],
    cta: "Start Team Trial",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b">
        <Link href="/" className="font-bold text-xl">
          ⚡ PromptForge
        </Link>
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Home
        </Link>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-center text-gray-500 mb-12">
          No tricks. 7-day money-back guarantee on Pro.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-2xl p-6 relative ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-4 ${plan.badgeColor}`}
              >
                {plan.name}
              </span>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <SignInButton mode="modal">
                <button
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.popular
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </button>
              </SignInButton>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-12">
          India? Razorpay checkout auto-enabled. Global? Stripe checkout.
        </p>
      </section>
    </main>
  );
}
