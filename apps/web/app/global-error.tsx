'use client';

import { useEffect } from 'react';

/**
 * Next.js global error boundary. Renders the html shell because the root
 * layout has already failed by the time this is reached.
 *
 * If Sentry is wired up, replace the `console.error` line with
 * `Sentry.captureException(error)`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[global-error]', error);
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
