"use client";

import { useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { useState } from "react";

export default function AdminPage() {
  const seedLibrary = useMutation(api.seedLibrary.seedLibrary);
  const [result, setResult] = useState<{ inserted: number; skipped: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await seedLibrary();
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="rounded-lg border p-6 space-y-4" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-semibold">Library Seed</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Seed the database with 50 hand-curated prompt templates.
        </p>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 disabled:bg-gray-400 transition"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {loading ? "Seeding..." : "Seed Library"}
        </button>
        {result && (
          <div className="text-sm space-y-1">
            <p style={{ color: 'var(--green)' }}>✓ Inserted: {result.inserted}</p>
            <p className="text-yellow-600">⟳ Skipped: {result.skipped}</p>
            <p className="text-blue-600">Total: {result.total}</p>
          </div>
        )}
        {error && <p className="text-sm text-red-600">✗ {error}</p>}
      </div>
    </div>
  );
}
