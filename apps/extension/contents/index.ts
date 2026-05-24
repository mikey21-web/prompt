/**
 * Plasmo content script entrypoint. The configuration block below tells
 * Plasmo to inject this script only on the AI host sites we support.
 *
 * The actual injector logic lives in `./inject.ts` so this file stays
 * tiny and easy to scan.
 */

import "./inject";

export const config = {
  matches: [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*",
    "https://claude.ai/*",
    "https://*.claude.ai/*",
    "https://gemini.google.com/*",
    "https://*.gemini.google.com/*",
  ],
  run_at: "document_idle" as const,
};
