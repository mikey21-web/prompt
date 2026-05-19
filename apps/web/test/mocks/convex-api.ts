// Stub of the Convex generated API used by `@/convex/_generated/api`.
// The real path doesn't exist in this repo (api lives in @promptforge/convex).
// We map the @ alias to this file via vitest.config.ts.
export const api = {
  users: {
    getMe: 'users.getMe',
    updatePlan: 'users.updatePlan',
    updatePreferences: 'users.updatePreferences',
  },
  prompts: { getHistory: 'prompts.getHistory' },
  templates: { listMine: 'templates.listMine' },
  optimize: { optimizePrompt: 'optimize.optimizePrompt' },
};
