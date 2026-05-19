'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/monitoring';

/**
 * Next.js global error boundary. Renders the html shell because the root
 * layout has already failed by the time this is reached.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, {
      tags: { boundary: 'global', digest: error.digest ?? 'none' },
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm text-gray-600">
            {error.message ?? 'The application hit an unexpected error.'}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
